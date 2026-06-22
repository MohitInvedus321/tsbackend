import {
  AppError,
  ValidationError,
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
  InternalError,
} from "./AppError.js";

/**
 * Converts any thrown value into a normalized AppError.
 * Handles: AppError subclasses, Zod errors, express-validator,
 * Mongoose/Sequelize/Prisma DB errors, JWT errors, Multer errors,
 * and plain JS Errors.
 */
export function normalizeError(err: unknown): AppError {
  // Already our error — pass through
  if (err instanceof AppError) return err;

  if (err instanceof Error) {
    const name = err.name;
    const msg = err.message;
    const anyErr = err as any;

    // ── Zod ──────────────────────────────────────────────────────────────────
    if (name === "ZodError" && Array.isArray(anyErr["issues"])) {
      const fields: Record<string, string[]> = {};
      for (const issue of anyErr["issues"] as Array<{
        path: unknown[];
        message: string;
      }>) {
        const key = issue.path.join(".") || "_root";
        fields[key] ??= [];
        fields[key].push(issue.message);
      }
      return new ValidationError("Validation failed", fields);
    }

    // ── Joi / express-validator ───────────────────────────────────────────────
    if (name === "ValidationError" && anyErr["details"]) {
      const details = anyErr["details"] as Array<{
        message: string;
        context?: { key?: string };
      }>;
      const fields: Record<string, string[]> = {};
      for (const d of details) {
        const key = d.context?.key ?? "_root";
        fields[key] ??= [];
        fields[key].push(d.message.replace(/['"]/g, ""));
      }
      return new ValidationError("Validation failed", fields);
    }

    // ── Mongoose ─────────────────────────────────────────────────────────────
    if (name === "MongoServerError" || name === "MongoError") {
      if ((anyErr["code"] as number) === 11000) {
        const keyValue = anyErr["keyValue"] as
          | Record<string, unknown>
          | undefined;
        const field = keyValue ? Object.keys(keyValue)[0] : "field";
        return new AppError({
          message: `Duplicate value for ${field}`,
          statusCode: 409,
          code: "CONFLICT",
          meta: { keyValue },
        });
      }
    }

    if (name === "ValidationError" && anyErr["errors"]) {
      // Mongoose validation
      const errors = anyErr["errors"] as Record<string, { message: string }>;
      const fields: Record<string, string[]> = {};
      for (const [key, val] of Object.entries(errors)) {
        fields[key] = [val.message];
      }
      return new ValidationError("Validation failed", fields);
    }

    if (name === "CastError") {
      return new BadRequestError(`Invalid value for field: ${anyErr["path"]}`);
    }

    // ── Sequelize ────────────────────────────────────────────────────────────
    if (
      name === "SequelizeValidationError" ||
      name === "SequelizeUniqueConstraintError"
    ) {
      const errors = anyErr["errors"] as
        | Array<{ path: string; message: string }>
        | undefined;
      const fields: Record<string, string[]> = {};
      for (const e of errors ?? []) {
        fields[e.path] ??= [];
        fields[e.path].push(e.message);
      }
      return new ValidationError(
        name === "SequelizeUniqueConstraintError"
          ? "Unique constraint violated"
          : "Validation failed",
        fields,
      );
    }

    // ── Prisma ───────────────────────────────────────────────────────────────
    if (name === "PrismaClientKnownRequestError") {
      const code = anyErr["code"] as string;
      if (code === "P2002") {
        return new AppError({
          message: "Unique constraint violation",
          statusCode: 409,
          code: "CONFLICT",
        });
      }
      if (code === "P2025") {
        return new NotFoundError("Record");
      }
      return new BadRequestError(`Database error: ${code}`);
    }

    // ── JWT ──────────────────────────────────────────────────────────────────
    if (name === "JsonWebTokenError") {
      return new UnauthorizedError("Invalid token");
    }
    if (name === "TokenExpiredError") {
      return new UnauthorizedError("Token expired");
    }
    if (name === "NotBeforeError") {
      return new UnauthorizedError("Token not yet valid");
    }

    // ── Multer ───────────────────────────────────────────────────────────────
    if (name === "MulterError") {
      const code = anyErr["code"] as string;
      const fileMsg: Record<string, string> = {
        LIMIT_FILE_SIZE: "File too large",
        LIMIT_FILE_COUNT: "Too many files",
        LIMIT_UNEXPECTED_FILE: "Unexpected file field",
      };
      return new BadRequestError(fileMsg[code] ?? `File upload error: ${code}`);
    }

    // ── HTTP status codes on the error itself (http-errors, etc.) ────────────
    const statusCode = (anyErr["statusCode"] ?? anyErr["status"]) as
      | number
      | undefined;
    if (statusCode && statusCode >= 400 && statusCode < 600) {
      return new AppError({
        message: msg || "HTTP error",
        statusCode,
        code: (anyErr["code"] as string) ?? "HTTP_ERROR",
        isOperational: statusCode < 500,
      });
    }

    // ── SyntaxError from body-parser ─────────────────────────────────────────
    if (err instanceof SyntaxError && (anyErr["status"] as number) === 400) {
      return new BadRequestError("Malformed JSON body");
    }
  }

  // ── Unknown / non-Error throws ────────────────────────────────────────────
  return new InternalError(undefined, { original: String(err) });
}
