const Joi = require("joi");

const addToCartSchema = Joi.object({
  foodId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).max(20).default(1),
});

const updateCartSchema = Joi.object({
  action: Joi.string().valid("increase", "decrease").required(),
});

module.exports = { addToCartSchema, updateCartSchema };
