import StatusCodes from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { Schema, ValidationResult } from "joi"; // Import correct Joi types

const schemaValidator = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validation: ValidationResult = schema.validate(req.body);
    if (!validation.error) {
      next();
    } else {
      const message = validation.error.details
        .map((i) => i.message.replace(/"/g, ""))
        .join(",");

      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        error: message,
        message,
        code: StatusCodes.UNPROCESSABLE_ENTITY,
      });
    }
  };
};

const schemaValidatorForQueryReq = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validation: ValidationResult = schema.validate(req.query);
    if (!validation.error) {
      next();
    } else {
      const message = validation.error.details
        .map((i) => i.message.replace(/"/g, ""))
        .join(",");

      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        error: message,
        message,
        code: StatusCodes.UNPROCESSABLE_ENTITY,
      });
    }
  };
};

export { schemaValidator, schemaValidatorForQueryReq };
