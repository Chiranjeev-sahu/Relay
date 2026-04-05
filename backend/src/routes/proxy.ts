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

    const token = req.cookies?.accessToken;
    const decoded = token ? verifyToken(token) : null;
    const user = decoded ? (decoded as any) : null;

    let finalUrl = url;
    let finalHeaders = headers || {};
    let finalBody = body;

    let loggedUrl = url;
    let loggedHeaders = headers || {};
    let loggedBody = body;

    let environment: any = null;

    if (environmentId) {
      if (!user) {
        throw new AppError(401, "Authentication required to use workspace environments");
      }

      environment = await prisma.environment.findFirst({
        where: {
          id: environmentId,
          workspace: { workspaceMembers: { some: { userId: user.sub } } },
        },
        include: { environmentVariables: true },
      });

      if (!environment) {
        throw new AppError(403, "Access denied to this environment or it does not exist");
      }

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

    if (user) {
      let responseToLog = response.data;
      const responseSize = JSON.stringify(response.data || "").length;
      if (responseSize > 20000) {
        responseToLog = {
          _relay_truncated: true,
          _original_size: responseSize,
          data:
            typeof response.data === "string"
              ? response.data.slice(0, 5000)
              : "Response too large for history log",
        };
      }

      await prisma.request.create({
        data: {
          method,
          url: loggedUrl,
          headers: loggedHeaders as any,
          body: loggedBody as any,
          responseStatus: response.status,
          responseBody: responseToLog as any,
          userId: user.sub, // Using sub from JWT payload
          workspaceId: environment?.workspaceId ?? null,
        },
      });
    }

    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
    });
  } catch (error: any) {
    if (error.code === "ECONNREFUSED")
      return next(new AppError(502, "Target server refused contact"));
    if (error.code === "ENOTFOUND") return next(new AppError(502, "Hostname not found"));
    if (error.code === "ECONNABORTED") return next(new AppError(504, "Request timed out"));
    next(error);
  }
});

export { router as proxyRouter };
