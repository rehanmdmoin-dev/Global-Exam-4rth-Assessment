const Joi = require("joi");

const createRestaurantSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  description: Joi.string().trim().max(300).allow("").optional(),
  address: Joi.string().trim().min(5).max(200).required(),
  phone: Joi.string().trim().pattern(/^[0-9+\-\s]{10,15}$/).allow("").optional(),
  image: Joi.string().trim().uri().allow("").optional(),
});

const updateRestaurantSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80),
  description: Joi.string().trim().max(300).allow(""),
  address: Joi.string().trim().min(5).max(200),
  phone: Joi.string().trim().pattern(/^[0-9+\-\s]{10,15}$/).allow(""),
  image: Joi.string().trim().uri().allow(""),
}).min(1);

const restaurantStatusSchema = Joi.object({
  status: Joi.string().valid("open", "closed").required(),
});

module.exports = { createRestaurantSchema, updateRestaurantSchema, restaurantStatusSchema };
