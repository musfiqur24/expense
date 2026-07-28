import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const configuredSessionSecret = process.env.SESSION_SECRET;
const insecureSessionSecret = !configuredSessionSecret
  || configuredSessionSecret.length < 32
  || /change[-_ ]?me|example|development|placeholder|replace[-_ ]?with|long[-_ ]?random/i.test(configuredSessionSecret);

if (nodeEnv === "production" && insecureSessionSecret) {
  throw new Error("SESSION_SECRET must be a non-placeholder value of at least 32 characters when NODE_ENV=production");
}

function readBoolean(value, fallback) {
  if (value === undefined) return fallback;
  return ["true", "1", "yes"].includes(String(value).toLowerCase());
}

function trimTrailingSlash(value) {
  return value ? value.replace(/\/$/, "") : value;
}

function hasConfiguredValue(value) {
  return Boolean(value) && !/change[-_ ]?me|example|placeholder|replace[-_ ]?with/i.test(value);
}

export const env = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === "production",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/expense_tracker",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  frontendUrl: trimTrailingSlash(process.env.FRONTEND_URL || (nodeEnv === "production" ? "http://localhost" : "http://localhost:5173")),
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
  sessionSecret: configuredSessionSecret || "local-development-session-secret-change-me",
  sessionCookieSecure: readBoolean(process.env.SESSION_COOKIE_SECURE, nodeEnv === "production"),
  sessionMaxAgeMs: Number(process.env.SESSION_MAX_AGE_MS || 1000 * 60 * 60 * 24 * 14)
});

export const hasGoogleOAuthCredentials = hasConfiguredValue(env.googleClientId) && hasConfiguredValue(env.googleClientSecret);
export const allowedCorsOrigins = Object.freeze(
  [...new Set([env.frontendUrl, ...env.corsOrigin.split(",").map((origin) => trimTrailingSlash(origin.trim()))])]
    .filter((origin) => origin && origin !== "*")
);
