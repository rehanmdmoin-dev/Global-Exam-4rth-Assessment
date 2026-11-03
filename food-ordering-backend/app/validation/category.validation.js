const Joi = require("joi");

const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(40).required(),
  description: Joi.string().trim().max(200).allow("").optional(),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(40),
  description: Joi.string().trim().max(200).allow(""),
}).min(1);

module.exports = { createCategorySchema, updateCategorySchema };
