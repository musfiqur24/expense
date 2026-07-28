import { env } from "../config/env.js";

function publicUser(user) {
  return {
    _id: user._id,
    email: user.email,
    displayName: user.displayName,
    givenName: user.givenName,
    familyName: user.familyName,
    avatarUrl: user.avatarUrl,
    currency: user.currency,
    timezone: user.timezone
  };
}

export function getCurrentUser(req, res) {
  if (!req.user) {
    return res.json({ success: true, data: { user: null } });
  }
  return res.json({ success: true, data: { user: publicUser(req.user) } });
}

export function completeGoogleLogin(req, res) {
  res.redirect(env.frontendUrl);
}

export function logout(req, res, next) {
  req.logout((logoutError) => {
    if (logoutError) return next(logoutError);

    req.session?.destroy((sessionError) => {
      if (sessionError) return next(sessionError);
      res.clearCookie("expense.sid");
      return res.json({ success: true, data: { user: null } });
    });
  });
}
