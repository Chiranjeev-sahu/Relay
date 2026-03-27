// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/AppError.js";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client.js";

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  let statusCode = 500;
  let message = "Internal server error occurred";
  let errors: unknown[] = [];

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation error";
    errors = err.issues;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 409;
      message = "A record with this value already exists";
    }
  } else if (err instanceof Error) {
    if (err.name === "TokenExpiredError") {
      statusCode = 401;
      message = "Token expired";
    } else if (err.name === "JsonWebTokenError") {
      statusCode = 401;
      message = "Invalid token";
    }
  }

  if (process.env.NODE_ENV === "development") {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      stack: err instanceof Error ? err.stack : undefined,
    });
  }

  const isOperational =
    err instanceof AppError ||
    err instanceof ZodError ||
    (err instanceof Error &&
      (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError"));

  if (isOperational) {
    return res.status(statusCode).json({ success: false, message, errors });
  }

  console.error("PROGRAMMER ERROR:", err);
  return res.status(500).json({ success: false, message: "Something went wrong" });
};
