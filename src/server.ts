import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/database.js";
import { env } from "./config/env.config.js";

const startServer = async () => {
  try {
    await connectDB();

    app.listen(env.PORT || 8000, () => {
      console.log(`Server is running at PORT ${env.PORT}`);
    });
  } catch (error) {
    console.error("Application startup failed:", error);
    process.exit(1);
  }
};

startServer();
