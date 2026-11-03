const express = require("express");
const foodController = require("../../controller/api/food.controller");
const { verifyToken, authorizeRoles } = require("../../middleware/auth");
const { validate, validateId } = require("../../middleware/validate");
const { createFoodSchema, updateFoodSchema, availabilitySchema } = require("../../validation/food.validation");

const router = express.Router();

router.use(verifyToken);


router.get("/", foodController.getFoods);


router.get("/my", authorizeRoles("restaurantOwner"), foodController.getMyFoods);
router.post("/", authorizeRoles("restaurantOwner"), validate(createFoodSchema), foodController.createFood);
router.put("/:id", authorizeRoles("restaurantOwner"), validateId("id"), validate(updateFoodSchema), foodController.updateFood);
router.patch("/:id/availability", authorizeRoles("restaurantOwner"), validateId("id"), validate(availabilitySchema), foodController.updateAvailability);
router.delete("/:id", authorizeRoles("restaurantOwner"), validateId("id"), foodController.deleteFood);

router.get("/:id", validateId("id"), foodController.getFoodById);

module.exports = router;
