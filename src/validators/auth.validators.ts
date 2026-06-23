import Joi, { string } from "joi";

const registerSchema = Joi.object({
  name: Joi.string().required().min(3),
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string()
    .required()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#_])[A-Za-z\\d@$!%*?&#_]{8,}$",
      ),
    )
    .messages({
      "string.pattern.base":
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
});

export { registerSchema };
