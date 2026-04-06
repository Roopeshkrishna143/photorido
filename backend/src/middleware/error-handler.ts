import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    return response.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: error.flatten(),
    });
  }

  if (error instanceof HttpError) {
    return response.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  if (error instanceof Error) {
    return response.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
      ...(env.NODE_ENV === "development" ? { stack: error.stack } : {}),
    });
  }

  return response.status(500).json({
    success: false,
    message: "Internal server error.",
  });
}
