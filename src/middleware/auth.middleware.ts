import { NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { message } from "../messages/index.js";
import { env } from "../config/env.config.js";

const verifyAuthToken = (req: any, res: any, next: NextFunction) => {
  const token = req?.headers?.authorization;
  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: message.noToken,
      message: message.noToken,
      code: StatusCodes.UNAUTHORIZED,
    });
  }
  try {
    const verified: any = jwt.verify(token, env.JWT_SECRET_TOKEN);
    if (verified.role) {
      req.user = verified;
      next();
    }
  } catch (error: any) {
    if (error.message == "jwt expired") {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: message.sessionExpired,
        message: message.sessionExpired,
        code: StatusCodes.UNAUTHORIZED,
      });
    }
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: message.invalidToken,
      message: message.invalidToken,
      code: StatusCodes.UNAUTHORIZED,
    });
  }
};

const CheckRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    const isVerified = roles.includes(req.user.role);
    if (isVerified) {
      next();
    } else {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: message.unAuthRole,
        message: message.unAuthRole,
        code: StatusCodes.FORBIDDEN, //403
      });
    }
  };
};

export { verifyAuthToken, CheckRole };
