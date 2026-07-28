import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

async function start() {
  try {
    await connectDatabase();
    console.log("Connected to MongoDB");

    const app = createApp();
    app.listen(env.port, () => console.log(`API running on port ${env.port}`));
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

start();
