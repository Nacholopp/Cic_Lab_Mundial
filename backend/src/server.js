import app from "./app.js";
import { env } from "./config/env.js";
import { initDatabase } from "./config/db.js";

async function startServer() {
  try {
    await initDatabase();
    console.log("Database ready");
  } catch (error) {
    console.error("Database init failed:", error.message);
  }

  const server = app.listen(env.port, () => {
    console.log(`Backend running at http://localhost:${env.port}`);
  });

  server.on("error", (error) => {
    if (error?.code === "EADDRINUSE") {
      console.error(`Port ${env.port} is already in use. Stop previous backend process and retry.`);
      process.exit(1);
    }
    throw error;
  });
}

startServer();
