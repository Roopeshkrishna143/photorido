import { createServer } from "node:http";
import { createApp } from "./app.js";
import { connectToDatabase, disconnectFromDatabase } from "./config/db.js";
import { resolvedEnv as env } from "./config/env.js";
import { attachRealtimeServer } from "./realtime/socket.js";
import { seedDefaultUsers } from "./startup/seed-default-users.js";
import { syncMongoDbExportsOnBoot } from "./startup/sync-mongodb-exports.js";
import { seedRbac } from "./startup/seed-rbac.js";
import { seedBrowseServices } from "./startup/seed-browse-services.js";

async function startServer() {
  await connectToDatabase();
  // await syncMongoDbExportsOnBoot();
  await seedDefaultUsers();
  await seedRbac();
  await seedBrowseServices();

  const app = createApp();
  const httpServer = createServer(app);
  attachRealtimeServer(httpServer);

  const server = httpServer.listen(env.PORT, () => {
    console.log(`Backend listening on http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}. Shutting down backend...`);

    server.close(async () => {
      await disconnectFromDatabase();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

startServer().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
