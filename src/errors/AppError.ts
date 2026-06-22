export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "RATE_LIMIT_EXCEEDED"
  | "BAD_REQUEST"
  | "INTERNAL_SERVER_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "UNPROCESSABLE_ENTITY"
  | string;

export interface AppErrorOptions {
  message: string;
  statusCode: number;
  code: ErrorCode;
  /** Extra structured context (never sent to client in production) */
  meta?: Record<string, unknown>;
  /** Whether this error is expected (operational) vs a bug (programmer error) */
  isOperational?: boolean;
}

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly isOperational: boolean;
  readonly meta?: Record<string, unknown>;
  readonly timestamp: string;

  constructor({
    message,
    statusCode,
    code,
    meta,
    isOperational = true,
  }: AppErrorOptions) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.meta = meta;
    this.timestamp = new Date().toISOString();

    // Maintains proper prototype chain in ES5 transpiled code
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Typed subclasses ────────────────────────────────────────────────────────

export class ValidationError extends AppError {
  readonly fields?: Record<string, string[]>;

  constructor(
    message: string,
    fields?: Record<string, string[]>,
    meta?: Record<string, unknown>,
  ) {
    super({ message, statusCode: 400, code: "VALIDATION_ERROR", meta });
    this.fields = fields;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", meta?: Record<string, unknown>) {
    super({ message, statusCode: 400, code: "BAD_REQUEST", meta });
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message = "Authentication required",
    meta?: Record<string, unknown>,
  ) {
    super({ message, statusCode: 401, code: "UNAUTHORIZED", meta });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied", meta?: Record<string, unknown>) {
    super({ message, statusCode: 403, code: "FORBIDDEN", meta });
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource", meta?: Record<string, unknown>) {
    super({
      message: `${resource} not found`,
      statusCode: 404,
      code: "NOT_FOUND",
      meta,
    });
  }
}

export class ConflictError extends AppError {
  constructor(
    message = "Resource already exists",
    meta?: Record<string, unknown>,
  ) {
    super({ message, statusCode: 409, code: "CONFLICT", meta });
  }
}

export class UnprocessableError extends AppError {
  constructor(
    message = "Unprocessable entity",
    meta?: Record<string, unknown>,
  ) {
    super({ message, statusCode: 422, code: "UNPROCESSABLE_ENTITY", meta });
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests", meta?: Record<string, unknown>) {
    super({ message, statusCode: 429, code: "RATE_LIMIT_EXCEEDED", meta });
  }
}

export class InternalError extends AppError {
  constructor(
    message = "An unexpected error occurred",
    meta?: Record<string, unknown>,
  ) {
    super({
      message,
      statusCode: 500,
      code: "INTERNAL_SERVER_ERROR",
      meta,
      isOperational: false,
    });
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(
    message = "Service temporarily unavailable",
    meta?: Record<string, unknown>,
  ) {
    super({ message, statusCode: 503, code: "SERVICE_UNAVAILABLE", meta });
  }
}
