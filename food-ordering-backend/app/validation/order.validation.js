const Joi = require("joi");

const createOrderSchema = Joi.object({
  deliveryAddress: Joi.string().trim().min(5).max(200).required(),
  note: Joi.string().trim().max(200).allow("").optional(),
});

const orderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("accepted", "rejected", "preparing", "out_for_delivery", "delivered", "cancelled")
    .required(),
});

module.exports = { createOrderSchema, orderStatusSchema };
