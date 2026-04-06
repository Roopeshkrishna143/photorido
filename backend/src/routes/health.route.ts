import { Router } from "express";
import mongoose from "mongoose";

const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "Photorido backend is running.",
    data: {
      timestamp: new Date().toISOString(),
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    },
  });
});

export { healthRouter };
