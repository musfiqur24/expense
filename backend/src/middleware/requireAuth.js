import ApiError from "../utils/ApiError.js";

export default function requireAuth(req, res, next) {
  const authenticated = typeof req.isAuthenticated === "function" ? req.isAuthenticated() : Boolean(req.user);
  if (!authenticated || !req.user) {
    return next(new ApiError(401, "Authentication is required"));
  }
  return next();
}
