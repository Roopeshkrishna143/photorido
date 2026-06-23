import { Router } from "express";
import { MarketplaceBookingModel } from "../../models/booking.model.js";
import { VendorProfileModel } from "../../models/vendor-profile.model.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";
import {
  buildPhotographerAvailability,
  buildPhotographerReviewItems,
  buildReviewStatsByPhotographerIds,
  parsePagination,
  serializePhotographerDetail,
  serializePhotographerSummary,
} from "../marketplace/marketplace.service.js";

const photographerRouter = Router();

function normalizeSearchValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parsePriceValue(value: unknown) {
  const numericChunks = String(value).match(/[\d,.]+/g);
  if (!numericChunks || numericChunks.length === 0) {
    return 0;
  }

  const parsed = Number(numericChunks[0]?.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseCoordinateValue(value: unknown) {
  const normalized = normalizeSearchValue(value);
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function calculateDistanceKm(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(end.lat - start.lat);
  const deltaLng = toRadians(end.lng - start.lng);
  const startLat = toRadians(start.lat);
  const endLat = toRadians(end.lat);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLng / 2) ** 2;
  const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return Number((earthRadiusKm * centralAngle).toFixed(1));
}

function hasValidCoordinates(coordinates?: { lat: number; lng: number } | null): coordinates is { lat: number; lng: number } {
  if (!coordinates) {
    return false;
  }

  return Number.isFinite(coordinates.lat)
    && Number.isFinite(coordinates.lng)
    && (coordinates.lat !== 0 || coordinates.lng !== 0);
}

photographerRouter.get(
  "/",
  asyncHandler(async (request, response) => {
    const page = parsePagination(request.query.page, 1, 500);
    const limit = parsePagination(request.query.limit, 12, 100);
    const q = normalizeSearchValue(request.query.q);
    const location = normalizeSearchValue(request.query.location);
    const service = normalizeSearchValue(request.query.service);
    const specialties = normalizeSearchValue(request.query.specialties)
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);
    const minRating = Number(normalizeSearchValue(request.query.minRating) || 0);
    const minPrice = parsePriceValue(request.query.minPrice);
    const maxPrice = parsePriceValue(request.query.maxPrice);
    const sort = normalizeSearchValue(request.query.sort) || "latest";
    const date = normalizeSearchValue(request.query.date);
    const lat = parseCoordinateValue(request.query.lat);
    const lng = parseCoordinateValue(request.query.lng);
    const radiusKm = Math.max(0, Number(normalizeSearchValue(request.query.radiusKm) || 0));
    const hasSearchCoordinates = lat !== null && lng !== null;
    const searchCoordinates = hasSearchCoordinates ? { lat, lng } : null;

    const profiles = await VendorProfileModel.find({ status: "approved" }).sort({ updatedAt: -1, createdAt: -1 });
    const statsByProfileId = await buildReviewStatsByPhotographerIds(profiles.map((profile) => profile.id));
    const blockedPhotographerIds = date
      ? new Set(
          await MarketplaceBookingModel.distinct("photographerId", {
            date,
            status: { $in: ["approved_by_vendor", "confirmed", "completed"] },
          }),
        )
      : new Set<string>();

    let items = profiles
      .filter((profile) => !date || !blockedPhotographerIds.has(profile.id))
      .filter((profile) => {
        const haystack = [
          profile.vendorName,
          profile.title,
          profile.category,
          profile.subCategory,
          profile.city,
          profile.state,
          profile.area,
          profile.colony,
          profile.district,
          profile.pincode,
          profile.description,
        ].filter(Boolean).join(" ");

        const matchesQuery = !q || haystack.toLowerCase().includes(q.toLowerCase());
        const matchesLocation = !location || [profile.city, profile.state, profile.area, profile.colony, profile.district, profile.address, profile.pincode]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(location.toLowerCase());
        const matchesService = !service || [profile.title, profile.category, profile.subCategory, profile.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(service.toLowerCase());
        const matchesSpecialties = specialties.length === 0 || specialties.some((entry) => [profile.category, profile.subCategory, profile.title]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(entry));

        return matchesQuery && matchesLocation && matchesService && matchesSpecialties;
      })
      .map((profile) => {
        const summary = serializePhotographerSummary(profile, statsByProfileId.get(profile.id));
        const distanceKm = searchCoordinates && hasValidCoordinates(summary.coordinates)
          ? calculateDistanceKm(searchCoordinates, summary.coordinates)
          : undefined;

        return {
          ...summary,
          distanceKm,
        };
      })
      .filter((profile) => profile.rating >= minRating)
      .filter((profile) => {
        const price = parsePriceValue(profile.price);
        if (minPrice > 0 && price < minPrice) {
          return false;
        }
        if (maxPrice > 0 && price > maxPrice) {
          return false;
        }
        return true;
      })
      .filter((profile) => {
        if (!hasSearchCoordinates || radiusKm <= 0 || typeof profile.distanceKm !== "number") {
          return true;
        }

        return profile.distanceKm <= radiusKm;
      });

    items = items.sort((left, right) => {
      if (sort === "distance-asc" && hasSearchCoordinates) {
        return (left.distanceKm ?? Number.MAX_SAFE_INTEGER) - (right.distanceKm ?? Number.MAX_SAFE_INTEGER)
          || right.rating - left.rating
          || right.reviews - left.reviews;
      }

      if (sort === "rating-desc") {
        return right.rating - left.rating || right.reviews - left.reviews;
      }

      if (sort === "price-asc") {
        return parsePriceValue(left.price) - parsePriceValue(right.price);
      }

      if (sort === "price-desc") {
        return parsePriceValue(right.price) - parsePriceValue(left.price);
      }

      if (sort === "reviews-desc") {
        return right.reviews - left.reviews;
      }

      return 0;
    });

    const total = items.length;
    const skip = (page - 1) * limit;
    const pagedItems = items.slice(skip, skip + limit);

    response.status(200).json({
      success: true,
      data: pagedItems,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  }),
);

photographerRouter.get(
  "/:photographerId",
  asyncHandler(async (request, response) => {
    const photographerId = typeof request.params.photographerId === "string"
      ? request.params.photographerId
      : request.params.photographerId?.[0];

    if (!photographerId) {
      throw new HttpError(400, "Profile id is required.");
    }

    const profile = await VendorProfileModel.findOne({
      _id: photographerId,
      status: "approved",
    });

    if (!profile) {
      throw new HttpError(404, "Profile not found.");
    }

    const [reviewItems, statsByProfileId] = await Promise.all([
      buildPhotographerReviewItems(profile.id),
      buildReviewStatsByPhotographerIds([profile.id]),
    ]);

    response.status(200).json({
      success: true,
      data: serializePhotographerDetail(profile, reviewItems, statsByProfileId.get(profile.id)),
    });
  }),
);

photographerRouter.get(
  "/:photographerId/availability",
  asyncHandler(async (request, response) => {
    const photographerId = typeof request.params.photographerId === "string"
      ? request.params.photographerId
      : request.params.photographerId?.[0];

    if (!photographerId) {
      throw new HttpError(400, "Profile id is required.");
    }

    const availability = await buildPhotographerAvailability(photographerId);
    response.status(200).json({
      success: true,
      data: availability,
    });
  }),
);

export { photographerRouter };
