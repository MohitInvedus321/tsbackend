import { User } from "../models/user.model.js";
import argon2 from "argon2";
import { createToken } from "../utils/index.js";
import { env } from "../config/env.config.js";

export class userServices {
  static async register(body: any) {
    const { name, email, password } = body;
    const hashPass = await argon2.hash(password);
    body.password = hashPass;
    const payload = { email, role: "user" };
    const token = await createToken(payload, env.JWT_SECRET_TOKEN, "7d");
    body.access_token = token;
    const result = await User.create(body);
    return result;
  }
}
