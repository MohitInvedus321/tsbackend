import { AppError } from "../errors/AppError.js";

export interface Logger {
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
}

const isProd = process.env.NODE_ENV === "production";

/**
 * Default console-based logger.
 * Replace with your own (winston, pino, datadog, etc.) via ErrorMiddlewareOptions.logger
 */
export const defaultLogger: Logger = {
  warn(msg, meta) {
    console.warn(JSON.stringify({ level: "warn", msg, ...meta }));
  },
  error(msg, meta) {
    if (isProd) {
      // In prod: structured JSON, no raw stack traces in output
      const { stack: _, ...safeMeta } = meta ?? {};
      console.error(JSON.stringify({ level: "error", msg, ...safeMeta }));
    } else {
      console.error(`\n[ERROR] ${msg}\n`, meta);
    }
  },
};

export function logError(
  err: AppError,
  requestId: string | undefined,
  logger: Logger,
) {
  const base: Record<string, unknown> = {
    requestId,
    code: err.code,
    statusCode: err.statusCode,
    isOperational: err.isOperational,
    timestamp: err.timestamp,
    meta: err.meta,
  };

  if (err.isOperational) {
    // Expected errors (4xx) → warn level
    logger.warn(err.message, base);
  } else {
    // Programmer errors / 5xx → error level with full stack
    logger.error(err.message, { ...base, stack: err.stack });
  }
}
