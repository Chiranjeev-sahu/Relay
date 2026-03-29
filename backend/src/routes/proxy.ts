import { z } from "zod";
import { Router } from "express";
import axios from "axios";
import { AppError } from "@/utils/AppError.js";
import { verifyToken } from "@/lib/token.js";
import { prisma } from "@/lib/prisma.js";
import { interpolate, interpolateValue } from "@/lib/interpolate.js";

const requestSchema = z.object({
  url: z.url("Invalid URL provided"),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]).default("GET"),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.any().optional(),
  timeout: z.number().optional().default(10000),

  environmentId: z.uuid().optional(),
});

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const parsedReq = requestSchema.safeParse(req.body);
    if (!parsedReq.success) {
      return res
        .status(400)
        .json({ success: false, error: "Validation failed", details: parsedReq.error });
    }

    const { url, method, headers, body, timeout, environmentId } = parsedReq.data;

    let finalUrl = url;

    let finalHeaders = headers || {};
    let finalBody = body;

    let loggedUrl = url;
    let loggedHeaders = headers || {};
    let loggedBody = body;

    let user: any = null;
    let environment: any = null;

    if (environmentId) {
      const authHeader = req.headers.authorization;
      if (!authHeader)
        throw new AppError(401, "Authentication required for workspace environments");

      user = verifyToken(authHeader);

      environment = await prisma.environment.findFirst({
        where: {
          id: environmentId,
          workspace: { workspaceMembers: { some: { userId: user.id } } },
        },
        include: { environmentVariables: true },
      });

      if (!environment) throw new AppError(403, "Access denied to this environment");

      const variables = environment.environmentVariables;

      finalUrl = interpolate(url, variables);
      finalHeaders = interpolateValue(headers || {}, variables);
      finalBody = interpolateValue(body, variables);

      const maskedVars = variables.map((v: any) => ({
        ...v,
        value: v.secret ? "****" : v.value,
      }));
      loggedUrl = interpolate(url, maskedVars);
      loggedHeaders = interpolateValue(headers || {}, maskedVars);
      loggedBody = interpolateValue(body, maskedVars);
    }

    const config = {
      method: method.toLowerCase(),
      url: finalUrl,
      headers: { "User-Agent": "Relay/1.0", ...finalHeaders },
      timeout,
      validateStatus: () => true,
      ...(method !== "GET" && finalBody !== undefined && { data: finalBody }),
    };

    const response = await axios(config);

    await prisma.request.create({
      data: {
        method,
        url: loggedUrl,
        headers: loggedHeaders as any,
        body: loggedBody as any,
        responseStatus: response.status,
        responseBody: response.data ?? null,
        userId: user?.id ?? null,
        workspaceId: environment?.workspaceId ?? null,
      },
    });

    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
    });
  } catch (error: any) {
    if (error.code === "ECONNREFUSED")
      return next(new AppError(502, "Target server refused context"));
    if (error.code === "ENOTFOUND") return next(new AppError(502, "Hostname not found"));
    if (error.code === "ECONNABORTED") return next(new AppError(504, "Request timed out"));
    next(error);
  }
});

export { router as proxyRouter };
