import cors from "cors";
import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import passport, { configurePassport } from "./config/passport.js";
import { allowedCorsOrigins, env, hasGoogleOAuthCredentials } from "./config/env.js";
import { createSessionMiddleware } from "./config/session.js";
import authRoutes from "./routes/authRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  // Required for secure session cookies behind the NGINX reverse proxy.
  app.set("trust proxy", 1);
  app.use(
    cors({
      credentials: true,
      origin(origin, callback) {
        // Server-to-server requests have no Origin header. Browser requests must be explicitly allowed.
        if (!origin || allowedCorsOrigins.includes(origin)) return callback(null, true);
        return callback(null, false);
      }
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.isProduction ? "combined" : "dev"));
  app.use(createSessionMiddleware());

  configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "expense-tracker-api",
      mongoState: mongoose.connection.readyState,
      googleOAuthConfigured: hasGoogleOAuthCredentials,
      timestamp: new Date().toISOString()
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/transactions", transactionRoutes);
  app.use("/api/budgets", budgetRoutes);
  app.use("/api/dashboard", dashboardRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
