import { AuthRequest } from "@/middleware/verify.js";
import axios, { AxiosRequestConfig, Method } from "axios";
import { prisma } from "@/lib/prisma.js";
import z from "zod";
import { Response } from "express";

const requestSchema = z.object({
  method: z.string().min(1),
  url: z.string().url("Invalid URL format"),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.any().optional(),
  environmentId: z.string().optional(),
  workspaceId: z.string().optional(),
  collectionRequestId: z.number().optional(),
});

export const proxyRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { method, url, headers, body, environmentId, workspaceId, collectionRequestId } =
      requestSchema.parse(req.body);

    let finalUrl = url;
    let finalHeaders = { ...headers };
    let finalBody = body;

    if (environmentId && req.userId) {
      const environment = await prisma.environment.findUnique({
        where: { id: environmentId },
        include: { environmentVariables: true, workspace: true },
      });

      if (!environment) {
        return res.status(404).json({ success: false, message: "Environment not found" });
      }

      const envDict = environment.environmentVariables.reduce(
        (acc, v) => ({ ...acc, [v.key]: v.value }),
        {} as Record<string, string>
      );

      const substitute = (str: string) => {
        let finalString = str;

        for (const [key, value] of Object.entries(envDict)) {
          finalString = finalString.replaceAll(`{{${key}}}`, value);
        }

        return finalString;
      };

      finalUrl = substitute(finalUrl);

      finalHeaders = Object.fromEntries(
        Object.entries(finalHeaders).map(([k, v]) => [substitute(k), substitute(v)])
      );

      if (typeof finalBody === "string") {
        finalBody = substitute(finalBody);
      } else if (finalBody && typeof finalBody === "object") {
        const bodyStr = substitute(JSON.stringify(finalBody));
        try {
          finalBody = JSON.parse(bodyStr);
        } catch {
          finalBody = bodyStr;
        }
      }
    }

    const axiosConfig: AxiosRequestConfig = {
      method: method as Method,
      url: finalUrl,
      headers: finalHeaders,
      data: Object.keys(finalBody || {}).length ? finalBody : undefined,
      validateStatus: () => true,
    };

    const startTime = Date.now();
    let response;
    let responseHeaders = {};
    let responseData = null;
    let responseStatus = 0;

    try {
      response = await axios(axiosConfig);
      responseHeaders = response.headers;
      responseData = response.data;
      responseStatus = response.status;
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message,
        code: error.code,
        details: "Relay Proxy failed to execute the request.",
      });
    }

    const duration = Date.now() - startTime;

    if (req.userId) {
      await prisma.request.create({
        data: {
          method,
          url,
          headers: headers || {},
          body: body || null,
          responseStatus,
          responseBody: responseData || null,
          userId: req.userId,
          workspaceId: workspaceId || null,
          collectionRequestId: collectionRequestId || null,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        status: responseStatus,
        statusText: response?.statusText || "",
        headers: responseHeaders,
        data: responseData,
        duration,
        size: Buffer.byteLength(JSON.stringify(responseData || {}), "utf8"),
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};
