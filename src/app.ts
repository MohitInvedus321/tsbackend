import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { StatusCodes } from "http-status-codes";
import { errorMiddleware, notFoundMiddleware } from "./index.js";
import baseRouter from "./routes/index.js";

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

app.use("/v1", baseRouter);

app.use(notFoundMiddleware());
app.use(
  errorMiddleware({
    exposeStack: false,
  }),
);

app.get("/", (req, res) => {
  return res
    .status(StatusCodes.OK)
    .send("Hello, Typescript server is running.");
});

export default app;
