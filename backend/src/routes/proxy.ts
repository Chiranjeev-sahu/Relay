import { z } from "zod";
import { Router } from "express";
import axios from "axios";
import { AppError } from "@/utils/AppError.js";
const requestSchema = z.object({
  url: z.url("invalid URL"),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]).default("GET"),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.json().optional(),
  timeout: z.number().optional().default(10000),
});
const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const parsedReq = requestSchema.safeParse(req.body);
    if (!parsedReq.success) {
      return res.status(400).json({ error: "validation failed", details: parsedReq.error });
    }
    const { url, method, headers, body, timeout } = parsedReq.data;
    const config = {
      method: method.toLowerCase(),
      url,
      headers: {
        "User-Agent": "Relay/1.0",
        ...headers,
      },
      timeout,
      validateStatus: () => true,
      ...(method !== "GET" && body !== undefined && { data: body }),
    };

    const response = await axios(config);

    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
    });
  } catch (error: any) {
    if (error.code === "ECONNREFUSED") {
      return next(new AppError(502, "Connection refused — is the target server running?"));
    }

    if (error.code === "ENOTFOUND") {
      return next(new AppError(502, "Hostname not found — check the URL"));
    }

    if (error.code === "ECONNABORTED") {
      return next(new AppError(504, "Request timed out"));
    }

    next(error);
  }
});
