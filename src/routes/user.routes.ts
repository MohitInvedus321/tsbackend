import { Router } from "express";
import userControllers from "../controllers/user.controllers.js";
import { schemaValidator } from "../middleware/validation.middleware.js";
import { registerSchema } from "../validators/auth.validators.js";
const authRouter = Router();

const path = {
  REGISTER: "/register",
  LOGIN: "/login",
};

authRouter.post(
  path.REGISTER,
  schemaValidator(registerSchema),
  userControllers.registerUser,
);
authRouter.post(path.LOGIN, userControllers.loginUser);

export default authRouter;
