import pino from "pino";
import { createStream } from "rotating-file-stream";

const stream = createStream(
  (time: any) => {
    const date = (time ?? new Date()).toISOString().split("T")[0];

    return `app-${date}.log`;
  },
  {
    interval: "1d",
    path: "./logs",
    maxFiles: 14,
  },
);

const errorStream = createStream(
  (time: any) => {
    const date = (time ?? new Date()).toISOString().split("T")[0];

    return `error-${date}.log`;
  },
  {
    interval: "1d",
    path: "./logs",
    maxFiles: 14,
  },
);

export const errorLogger = pino(
  {
    timestamp: () => {
      return `,"time":"${new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      })}"`;
    },
  },
  errorStream,
);

export const appLogger = pino(
  {
    timestamp: () => {
      return `,"time":"${new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      })}"`;
    },
  },
  stream,
);
