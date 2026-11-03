const express = require("express");
const orderController = require("../../controller/api/order.controller");
const { verifyToken, authorizeRoles } = require("../../middleware/auth");
const { validate, validateId } = require("../../middleware/validate");
const { createOrderSchema, orderStatusSchema } = require("../../validation/order.validation");

const router = express.Router();

router.use(verifyToken);


router.post("/", authorizeRoles("user"), validate(createOrderSchema), orderController.createOrder);
router.get("/", orderController.getOrders);
router.get("/:id", validateId("id"), orderController.getOrderById);
router.patch("/:id/status", validateId("id"), validate(orderStatusSchema), orderController.updateOrderStatus);

module.exports = router;
