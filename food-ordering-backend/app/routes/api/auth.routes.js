const express = require("express");
const authController = require("../../controller/api/auth.controller");
const { verifyToken } = require("../../middleware/auth");
const { validate } = require("../../middleware/validate");
const { registerSchema, loginSchema, refreshTokenSchema } = require("../../validation/auth.validation");

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh-token", validate(refreshTokenSchema), authController.refreshToken);
router.post("/logout", verifyToken, authController.logout);
router.get("/me", verifyToken, authController.getProfile);

module.exports = router;
