const express = require("express");
const restaurantController = require("../../controller/api/restaurant.controller");
const { verifyToken, authorizeRoles } = require("../../middleware/auth");
const { validate, validateId } = require("../../middleware/validate");
const {
  createRestaurantSchema,
  updateRestaurantSchema,
  restaurantStatusSchema,
} = require("../../validation/restaurant.validation");

const router = express.Router();

router.use(verifyToken);


router.post("/", authorizeRoles("restaurantOwner"), validate(createRestaurantSchema), restaurantController.createRestaurant);
router.get("/my", authorizeRoles("restaurantOwner"), restaurantController.getMyRestaurant);
router.put("/my", authorizeRoles("restaurantOwner"), validate(updateRestaurantSchema), restaurantController.updateMyRestaurant);
router.patch("/my/status", authorizeRoles("restaurantOwner"), validate(restaurantStatusSchema), restaurantController.updateMyRestaurantStatus);


router.get("/", restaurantController.getRestaurants);
router.get("/:id", validateId("id"), restaurantController.getRestaurantById);

module.exports = router;
