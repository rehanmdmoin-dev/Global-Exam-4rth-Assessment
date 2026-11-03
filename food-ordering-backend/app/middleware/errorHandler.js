const StatusCode = require("../utils/statusCode");

const notFound = (req, res) => {
  return res.status(StatusCode.NOT_FOUND).json({ status: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || StatusCode.SERVER_ERROR;
  let message = err.message || "Something went wrong";

  if (err.name === "ValidationError") {
    statusCode = StatusCode.BAD_REQUEST;
    message = Object.values(err.errors).map((item) => item.message).join(", ");
  } else if (err.name === "CastError") {
    statusCode = StatusCode.BAD_REQUEST;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    statusCode = StatusCode.CONFLICT;
    message = `${Object.keys(err.keyValue)[0]} already exists`;
  } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = StatusCode.UNAUTHORIZED;
    message = "Invalid or expired token";
  } else if (err.type === "entity.parse.failed") {
    statusCode = StatusCode.BAD_REQUEST;
    message = "Invalid JSON body";
  }

  if (statusCode === StatusCode.SERVER_ERROR) message = "Something went wrong";

  return res.status(statusCode).json({ status: false, message });
};

module.exports = { notFound, errorHandler };
