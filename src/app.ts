import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { StatusCodes } from "http-status-codes";
import { errorMiddleware, notFoundMiddleware } from "./index.js";
import baseRouter from "./routes/index.js";
import { requestLogger } from "./middleware/requestMiddleware.js";
import { appLogger, errorLogger } from "./config/logger.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use((req, _res, next) => {
  (req as typeof req & { id: string }).id =
    (req.headers["x-request-id"] as string) ?? crypto.randomUUID();
  next();
});
app.get("/", (req, res) => {
  appLogger.info("User logged in");
  errorLogger.error("User is unauthenticated");

  return res
    .status(StatusCodes.OK)
    .send("Hello, Typescript server is running.");
});

app.use("/v1", baseRouter);

app.use(notFoundMiddleware());
app.use(
  errorMiddleware({
    exposeStack: false,
  }),
);

export default app;
