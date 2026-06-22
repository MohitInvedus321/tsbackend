import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../errors/AppError.js";

/**
 * Place this AFTER all your routes to catch unmatched paths.
 *
 * @example
 * app.use(notFoundMiddleware());
 * app.use(errorMiddleware());
 */
export function notFoundMiddleware() {
  return function handleNotFound(
    req: Request,
    _res: Response,
    next: NextFunction,
  ) {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl}`));
  };
}
