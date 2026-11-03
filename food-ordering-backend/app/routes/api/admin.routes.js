const express = require("express");
const adminController = require("../../controller/api/admin.controller");
const { verifyToken, authorizeRoles } = require("../../middleware/auth");
const { validateId } = require("../../middleware/validate");

const router = express.Router();


router.use(verifyToken, authorizeRoles("admin"));

router.get("/stats", adminController.getStats);
router.get("/users", adminController.getUsers);
router.patch("/users/:id/block", validateId("id"), adminController.blockUser);
router.patch("/users/:id/unblock", validateId("id"), adminController.unblockUser);
router.get("/restaurants", adminController.getRestaurants);

module.exports = router;
