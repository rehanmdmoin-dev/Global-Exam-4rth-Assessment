const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).max(30).required(),
  role: Joi.string().valid("user", "restaurantOwner").default("user"),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema, refreshTokenSchema };
