import { Request } from "express";
import { Logger } from "../utils/logger.js";

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    requestId?: string;
    timestamp: string;
    /** Only present on validation errors */
    fields?: Record<string, string[]>;
    /** Only present in non-production environments */
    stack?: string;
  };
}

export interface ErrorMiddlewareOptions {
  /**
   * Custom logger — defaults to console-based JSON logger.
   * Pass your winston/pino instance here.
   */
  logger?: Logger;

  /**
   * Extract a request ID from the request for correlation.
   * Defaults to checking `req.headers['x-request-id']` and `req.id`.
   */
  getRequestId?: (req: Request) => string | undefined;

  /**
   * Include the stack trace in the response body.
   * Defaults to true only in development.
   */
  exposeStack?: boolean;

  /**
   * Override the error message for 500s sent to clients.
   * Useful if you want to hide all internal messages.
   * Defaults to the error message in dev, generic message in prod.
   */
  internalErrorMessage?: string;

  /**
   * Hook called after error is normalized but before response is sent.
   * Use it to report to Sentry, Bugsnag, Datadog, etc.
   */
  onError?: (
    err: import("../errors/AppError.js").AppError,
    req: Request,
  ) => void | Promise<void>;
}
