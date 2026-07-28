import { Router } from "express";
import passport from "../config/passport.js";
import { hasGoogleOAuthCredentials, env } from "../config/env.js";
import { completeGoogleLogin, getCurrentUser, logout } from "../controllers/authController.js";
import requireAuth from "../middleware/requireAuth.js";
import ApiError from "../utils/ApiError.js";

const router = Router();

function requireGoogleConfiguration(req, res, next) {
  if (!hasGoogleOAuthCredentials) {
    return next(new ApiError(503, "Google OAuth is not configured on this server"));
  }
  return next();
}

router.get("/me", getCurrentUser);

router.get(
  "/google",
  requireGoogleConfiguration,
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: true,
    prompt: "select_account"
  })
);

router.get(
  "/google/callback",
  requireGoogleConfiguration,
  passport.authenticate("google", {
    failureRedirect: `${env.frontendUrl}/?authError=google`
  }),
  completeGoogleLogin
);

router.post("/logout", requireAuth, logout);

export default router;
