import { Request, Response, NextFunction } from "express";
import { userServices } from "../services/user.services.js";
import { StatusCodes } from "http-status-codes";

async function registerUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userServices.register(req?.body);
    if (user) {
      return res.status(StatusCodes.CREATED).json({
        code: StatusCodes.CREATED,
        data: user,
      });
    }
  } catch (error) {
    next(error);
  }
}

async function loginUser(req: Request, res: Response, next: NextFunction) {
  try {
    // const user = await userServices.register(req?.body);
    // return res.status(StatusCodes.CREATED).json({
    //   code: StatusCodes.CREATED,
    //   data: user,
    // });
  } catch (error) {
    next(error);
  }
}

export default { registerUser, loginUser } as const;
