import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

import { defaultLogger, logError } from "../utils/logger.js";
import { ErrorMiddlewareOptions, ErrorResponse } from "../types/index.js";
import { normalizeError } from "../errors/normalizeError.js";
import { ValidationError } from "../errors/AppError.js";

const isProd = process.env.NODE_ENV === "production";

function defaultGetRequestId(req: Request): string | undefined {
  return (
    (req.headers["x-request-id"] as string | undefined) ??
    (req as Request & { id?: string }).id
  );
}

/**
 * Factory that returns a production-ready Express error handler.
 *
 * @example
 * // Basic usage
 * app.use(errorMiddleware());
 *
 * @example
 * // With options
 * app.use(errorMiddleware({
 *   logger: pinoLogger,
 *   onError: (err, req) => Sentry.captureException(err),
 *   getRequestId: (req) => req.headers['x-trace-id'] as string,
 * }));
 */
export function errorMiddleware(
  options: ErrorMiddlewareOptions = {},
): ErrorRequestHandler {
  const {
    logger = defaultLogger,
    getRequestId = defaultGetRequestId,
    exposeStack = !isProd,
    internalErrorMessage = isProd ? "An unexpected error occurred" : undefined,
    onError,
  } = options;

  // 4-argument signature is required for Express to treat this as an error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async function handleError(
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction,
  ) {
    const appError = normalizeError(err);
    const requestId = getRequestId(req);

    // ── Logging ──────────────────────────────────────────────────────────────
    logError(appError, requestId, logger);

    // ── External reporting hook (Sentry, etc.) ────────────────────────────────
    if (onError) {
      try {
        await onError(appError, req);
      } catch (reportingErr) {
        logger.error("Error reporting hook threw", {
          error: String(reportingErr),
        });
      }
    }

    // ── Build response ────────────────────────────────────────────────────────
    const isInternal = appError.statusCode >= 500;

    const message =
      isInternal && internalErrorMessage
        ? internalErrorMessage
        : appError.message;

    const body: ErrorResponse = {
      success: false,
      error: {
        code: appError.code,
        message,
        requestId,
        timestamp: appError.timestamp,
        ...(appError instanceof ValidationError && appError.fields
          ? { fields: appError.fields }
          : {}),
        ...(exposeStack && appError.stack ? { stack: appError.stack } : {}),
      },
    };

    // Don't send body if headers already sent (e.g. streaming)
    if (res.headersSent) {
      return;
    }

    res.status(appError.statusCode).json(body);
  };
}
