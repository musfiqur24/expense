import { env } from "../config/env.js";

export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: "Route not found" });
}

export function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || error.status || 500;
  let message = error.message || "Server error";

  if (error.name === "ValidationError") {
    message = Object.values(error.errors).map((item) => item.message).join(", ");
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${error.path}`;
  }

  if (error.code === 11000) {
    statusCode = 409;
    message = "A record with those values already exists";
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message: env.isProduction && statusCode >= 500 ? "Server error" : message,
    ...(error.details ? { details: error.details } : {})
  });
}
