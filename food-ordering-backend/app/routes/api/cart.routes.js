const express = require("express");
const cartController = require("../../controller/api/cart.controller");
const { verifyToken, authorizeRoles } = require("../../middleware/auth");
const { validate, validateId } = require("../../middleware/validate");
const { addToCartSchema, updateCartSchema } = require("../../validation/cart.validation");

const router = express.Router();


router.use(verifyToken, authorizeRoles("user"));

router.get("/", cartController.getCart);
router.post("/items", validate(addToCartSchema), cartController.addToCart);
router.patch("/items/:foodId", validateId("foodId"), validate(updateCartSchema), cartController.updateQuantity);
router.delete("/items/:foodId", validateId("foodId"), cartController.removeItem);
router.delete("/", cartController.clearCart);

module.exports = router;
