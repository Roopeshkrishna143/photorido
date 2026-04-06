import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { buildHomeSummary } from "./site.service.js";

const siteRouter = Router();

siteRouter.get(
  "/home-summary",
  asyncHandler(async (_request, response) => {
    const summary = await buildHomeSummary();

    response.status(200).json({
      success: true,
      data: summary,
    });
  }),
);

export { siteRouter };
