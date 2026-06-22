import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { StatusCodes } from "http-status-codes";
import {
  errorMiddleware,
  notFoundMiddleware,
  asyncHandler,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
} from "./index.js";
import "./config/database.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _res, next) => {
  (req as typeof req & { id: string }).id =
    (req.headers["x-request-id"] as string) ?? crypto.randomUUID();
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// Routes demonstrating every error scenario
// ─────────────────────────────────────────────────────────────────────────────

// ① Operational: throw a typed error directly
// app.get(
//   "/users/:id",
//   asyncHandler(async (req, res) => {
//     const user = await fakeDb.findUser(req.params.id);
//     if (!user) throw new NotFoundError("User");
//     res.json({ success: true, data: user });
//   }),
// );

// ② Validation error with per-field breakdown
app.post(
  "/users",
  asyncHandler(async (req, res) => {
    const errors: Record<string, string[]> = {};
    if (!req.body.email) errors.email = ["Email is required"];
    if (!req.body.password || req.body.password.length < 8)
      errors.password = ["Password must be at least 8 characters"];
    if (Object.keys(errors).length)
      throw new ValidationError("Validation failed", errors);

    res.status(201).json({ success: true, data: { id: "123" } });
  }),
);

// ③ Auth error
app.get(
  "/admin",
  asyncHandler(async (req, res) => {
    const token = req.headers.authorization;
    if (!token) throw new UnauthorizedError();
    if (token !== "Bearer admin")
      throw new ForbiddenError("Admin role required");
    res.json({ secret: true });
  }),
);

// ④ Async error (Zod, Prisma, etc.) — just throw, normalizeError handles it
app.post(
  "/items",
  asyncHandler(async (_req, res) => {
    // e.g. await ZodSchema.parseAsync(req.body) — ZodError auto-converted
    // e.g. await prisma.item.create({...}) — PrismaClientKnownRequestError auto-converted
    res.json({ ok: true });
  }),
);

// ⑤ Sync error — still caught if you use asyncHandler
app.get(
  "/broken",
  asyncHandler(async () => {
    throw new Error("Database connection lost"); // → 500
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// Middleware registration order matters:
// 1. Routes
// 2. 404 handler (catches unmatched routes)
// 3. Error handler (catches all errors)
// ─────────────────────────────────────────────────────────────────────────────
app.use(notFoundMiddleware());
app.use(
  errorMiddleware({
    // Optional: plug in pino/winston
    // logger: pinoLogger,
    // Optional: report to Sentry
    // onError: (err, req) => Sentry.captureException(err, { extra: { url: req.url } }),
    // Optional: custom request ID extraction
    // getRequestId: (req) => req.headers['x-trace-id'] as string,
    // Optional: always hide internal error messages from clients
    // internalErrorMessage: 'Something went wrong. Please try again.',
  }),
);

app.get("/", (req, res) => {
  return res
    .status(StatusCodes.OK)
    .send("Hello, Typescript server is running.");
});

export default app;
