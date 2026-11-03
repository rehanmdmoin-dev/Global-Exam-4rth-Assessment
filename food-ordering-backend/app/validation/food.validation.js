const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const createFoodSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  description: Joi.string().trim().max(300).allow("").optional(),
  price: Joi.number().min(1).required(),
  category: objectId.required(),
  isVeg: Joi.boolean().required(),
  isAvailable: Joi.boolean().optional(),
  image: Joi.string().trim().uri().allow("").optional(),
});

const updateFoodSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80),
  description: Joi.string().trim().max(300).allow(""),
  price: Joi.number().min(1),
  category: objectId,
  isVeg: Joi.boolean(),
  isAvailable: Joi.boolean(),
  image: Joi.string().trim().uri().allow(""),
}).min(1);

const availabilitySchema = Joi.object({
  isAvailable: Joi.boolean().required(),
});

module.exports = { createFoodSchema, updateFoodSchema, availabilitySchema };
