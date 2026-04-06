import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/http-error.js";

export function notFoundHandler(request: Request, _response: Response, next: NextFunction) {
  next(new HttpError(404, `Route not found: ${request.method} ${request.originalUrl}`));
}
