import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(8000),

  // NODE_ENV: z.enum(["development", "production", "test"]),

  MONGODB_URL: z.string().min(1),
  JWT_SECRET_TOKEN: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Environment validation failed:");

  console.error(parsed.error.format());

  process.exit(1);
}

export const env = parsed.data;
