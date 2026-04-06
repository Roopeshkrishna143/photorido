import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { resolvedEnv as env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { uploadRoot } from "./modules/uploads/upload.route.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-File-Name"],
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: env.JSON_BODY_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: env.JSON_BODY_LIMIT }));
  app.use("/uploads", express.static(path.resolve(uploadRoot)));

  app.get("/", (_request, response) => {
    response.status(200).json({
      success: true,
      message: "Photorido backend server is running.",
    });
  });

  app.use(env.API_PREFIX, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
