import jwt from "jsonwebtoken";

export const createToken = (
  payload: object,
  secret: string | any,
  expiresIn: string | any,
) => {
  return jwt.sign(payload, secret, {
    expiresIn,
  });
};
