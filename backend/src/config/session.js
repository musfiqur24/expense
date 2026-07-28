import session from "express-session";
import MongoStore from "connect-mongo";
import { env } from "./env.js";

export function createSessionMiddleware() {
  const store = MongoStore.create({
    mongoUrl: env.mongoUri,
    collectionName: "sessions",
    ttl: Math.floor(env.sessionMaxAgeMs / 1000),
    autoRemove: "native"
  });

  store.on("error", (error) => {
    console.error("Mongo session store error", error);
  });

  return session({
    name: "expense.sid",
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      httpOnly: true,
      secure: env.sessionCookieSecure,
      sameSite: "lax",
      maxAge: env.sessionMaxAgeMs
    }
  });
}
