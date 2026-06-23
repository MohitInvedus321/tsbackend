import { Router } from "express";
import authRouter from "./user.routes.js";
const baseRouter = Router();

baseRouter.use("/auth", authRouter);

export default baseRouter;
