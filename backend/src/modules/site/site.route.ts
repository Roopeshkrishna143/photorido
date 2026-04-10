import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireAuth, authorizeRoles } from "../../middleware/auth.js";
import { SearchAdvertisementModel } from "../../models/search-advertisement.model.js";
import { buildHomeSummary } from "./site.service.js";

const siteRouter = Router();

function normalizeQuery(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function parseLimit(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 4;
  }

  return Math.min(Math.floor(parsed), 12);
}

function matchesTagFilter(tags: string[], searchValue: string) {
  if (!searchValue || tags.length === 0) {
    return true;
  }

  return tags.some((tag) => searchValue.includes(tag) || tag.includes(searchValue));
}

function withinActiveWindow(startDate: Date | null | undefined, endDate: Date | null | undefined, now: Date) {
  if (startDate && startDate > now) {
    return false;
  }

  if (endDate && endDate < now) {
    return false;
  }

  return true;
}

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
    const service = normalizeQuery(request.query.service);
    const location = normalizeQuery(request.query.location);
    const limit = parseLimit(request.query.limit);
    const now = new Date();

    const advertisements = await SearchAdvertisementModel.find({ status: "active" })
      .sort({ sortOrder: 1, createdAt: -1 });

    const visibleAdvertisements = advertisements
      .filter((advertisement) => withinActiveWindow(advertisement.startDate, advertisement.endDate, now))
      .filter((advertisement) => matchesTagFilter(advertisement.serviceTags, service))
      .filter((advertisement) => matchesTagFilter(advertisement.locationTags, location))
      .slice(0, limit)
      .map((advertisement) => ({
        id: advertisement.id,
        title: advertisement.title,
        subtitle: advertisement.subtitle,
        description: advertisement.description,
        badgeText: advertisement.badgeText,
        imageUrl: advertisement.imageUrl,
        ctaText: advertisement.ctaText,
        ctaUrl: advertisement.ctaUrl,
      }));

    response.status(200).json({
      success: true,
      data: visibleAdvertisements,
    });
  }),
);

siteRouter.post(
  "/search-advertisements",
  requireAuth,
  authorizeRoles("super-admin"),
  asyncHandler(async (request, response) => {
    const {
      title,
      subtitle,
      description,
      badgeText,
      imageUrl,
      ctaText,
      ctaUrl,
      serviceTags,
      locationTags,
      sortOrder,
      status,
      startDate,
      endDate,
    } = request.body;

    const advertisement = await SearchAdvertisementModel.create({
      title,
      subtitle,
      description,
      badgeText,
      imageUrl,
      ctaText,
      ctaUrl,
      serviceTags: serviceTags || [],
      locationTags: locationTags || [],
      sortOrder: sortOrder || 0,
      status: status || "active",
      startDate,
      endDate,
      createdByUserId: request.authUser!.id,
      updatedByUserId: request.authUser!.id,
    });

    response.status(201).json({
      success: true,
      data: advertisement,
    });
  }),
);

export { siteRouter };
