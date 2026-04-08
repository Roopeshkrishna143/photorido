import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { buildHomeSummary, buildSearchAdvertisements } from "./site.service.js";

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

siteRouter.get(
  "/search-advertisements",
  asyncHandler(async (request, response) => {
    const limit = typeof request.query.limit === "string"
      ? Number(request.query.limit)
      : Number.NaN;

    const advertisements = await buildSearchAdvertisements(limit);

    response.status(200).json({
      success: true,
      data: advertisements,
    });
  }),
);

export { siteRouter };
