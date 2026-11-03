const express = require("express");
const categoryController = require("../../controller/api/category.controller");
const { verifyToken, authorizeRoles } = require("../../middleware/auth");
const { validate, validateId } = require("../../middleware/validate");
const { createCategorySchema, updateCategorySchema } = require("../../validation/category.validation");

const router = express.Router();

router.use(verifyToken);


router.get("/", categoryController.getCategories);


router.post("/", authorizeRoles("admin"), validate(createCategorySchema), categoryController.createCategory);
router.put("/:id", authorizeRoles("admin"), validateId("id"), validate(updateCategorySchema), categoryController.updateCategory);
router.delete("/:id", authorizeRoles("admin"), validateId("id"), categoryController.deleteCategory);

module.exports = router;
