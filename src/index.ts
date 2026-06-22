// Middleware
export { errorMiddleware } from "./middleware/errorMiddleware.js";
export { notFoundMiddleware } from "./middleware/notFoundMiddleware.js";

// Error classes
export {
  AppError,
  ValidationError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableError,
  RateLimitError,
  InternalError,
  ServiceUnavailableError,
} from "./errors/AppError.js";

// Utilities
export { asyncHandler } from "./utils/asyncHandler.js";
export { normalizeError } from "./errors/normalizeError.js";

// Types
export type { ErrorMiddlewareOptions, ErrorResponse } from "./types/index.js";
export type { Logger } from "./utils/logger.js";
