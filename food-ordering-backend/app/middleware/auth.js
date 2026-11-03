const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const StatusCode = require("../utils/statusCode");

const verifyToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(StatusCode.UNAUTHORIZED).json({ status: false, message: "Access token is required" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(StatusCode.UNAUTHORIZED).json({ status: false, message: "User not found" });
    }
    if (user.isBlocked) {
      return res.status(StatusCode.FORBIDDEN).json({ status: false, message: "Your account is blocked" });
    }

    if (user.role === "admin" && req.headers["x-secret-key"] !== process.env.ADMIN_SECRET_KEY) {
      return res.status(StatusCode.FORBIDDEN).json({ status: false, message: "Invalid or missing admin secret key" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(StatusCode.UNAUTHORIZED).json({ status: false, message: "Invalid or expired token" });
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(StatusCode.FORBIDDEN).json({ status: false, message: "You are not allowed to access this resource" });
  }
  next();
};

module.exports = { verifyToken, authorizeRoles };
