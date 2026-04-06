import { Router } from "express";
import { z } from "zod";
import { authorizePermissions, authorizeRoles, requireAuth, type AuthenticatedRequest } from "../../middleware/auth.js";
import { MarketplaceBookingModel } from "../../models/booking.model.js";
import { MarketplaceReviewModel } from "../../models/review.model.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";
import {
  buildPaginationMeta,
  buildPhotographerReviewItems,
  buildReviewCreatedNotifications,
  buildReviewStatsByPhotographerIds,
  createUserNotification,
  NOTIFICATION_TARGET_PATHS,
  notifyAllSuperAdmins,
  parsePagination,
  serializeReview,
} from "./marketplace.service.js";

const reviewCreateSchema = z.object({
  bookingId: z.string().trim().min(1, "Booking is required."),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(3, "Review text is required."),
});

const reviewResponseSchema = z.object({
  vendorResponse: z.string().trim().min(2, "Response is required.").max(1000),
});

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeSearchValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function ensureAuthUser(request: AuthenticatedRequest) {
  if (!request.authUser) {
    throw new HttpError(401, "Authentication is required.");
  }

  return request.authUser;
}

export const marketplaceReviewRouter = Router();

marketplaceReviewRouter.get(
  "/public/reviews/:photographerId",
  asyncHandler(async (request, response) => {
    const photographerId = typeof request.params.photographerId === "string"
      ? request.params.photographerId
      : request.params.photographerId?.[0];

    if (!photographerId) {
      throw new HttpError(400, "Profile id is required.");
    }

    const [reviewItems, statsMap] = await Promise.all([
      buildPhotographerReviewItems(photographerId),
      buildReviewStatsByPhotographerIds([photographerId]),
    ]);

    response.status(200).json({
      success: true,
      data: {
        averageRating: statsMap.get(photographerId)?.averageRating ?? 0,
        totalReviews: statsMap.get(photographerId)?.totalReviews ?? 0,
        reviews: reviewItems,
      },
    });
  }),
);

marketplaceReviewRouter.use(requireAuth);

marketplaceReviewRouter.get(
  "/reviews",
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const page = parsePagination(request.query.page, 1, 500);
    const limit = parsePagination(request.query.limit, 25, 100);
    const skip = (page - 1) * limit;
    const rating = normalizeSearchValue(request.query.rating);
    const search = normalizeSearchValue(request.query.search);
    const vendorId = normalizeSearchValue(request.query.vendorId);
    const userId = normalizeSearchValue(request.query.userId);
    const photographerId = normalizeSearchValue(request.query.photographerId);
    const query: Record<string, unknown> = {};

    if (authUser.role === "vendor") {
      query.vendorId = authUser.id;
    } else if (authUser.role === "user") {
      query.userId = authUser.id;
    } else {
      if (vendorId) query.vendorId = vendorId;
      if (userId) query.userId = userId;
      if (photographerId) query.photographerId = photographerId;
    }

    if (rating) {
      query.rating = Number(rating);
    }

    if (search) {
      const pattern = new RegExp(escapeRegex(search), "i");
      query.$or = [
        { userName: pattern },
        { userEmail: pattern },
        { vendorName: pattern },
        { listingName: pattern },
        { comment: pattern },
      ];
    }

    const [reviews, total] = await Promise.all([
      MarketplaceReviewModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      MarketplaceReviewModel.countDocuments(query),
    ]);

    response.status(200).json({
      success: true,
      data: reviews.map((review) => serializeReview(review)),
      meta: buildPaginationMeta(page, limit, total),
    });
  }),
);

marketplaceReviewRouter.post(
  "/reviews",
  authorizeRoles("user", "super-admin"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const input = reviewCreateSchema.parse(request.body);
    const booking = await MarketplaceBookingModel.findById(input.bookingId);
    if (!booking) {
      throw new HttpError(404, "Booking not found.");
    }

    if (authUser.role === "user" && booking.userId !== authUser.id) {
      throw new HttpError(403, "You can only review your own completed bookings.");
    }

    if (booking.status !== "completed") {
      throw new HttpError(400, "Reviews can only be submitted after the booking is completed.");
    }

    const existingReview = await MarketplaceReviewModel.findOne({ bookingId: booking.id });
    if (existingReview || booking.reviewSubmitted) {
      throw new HttpError(409, "A review has already been submitted for this booking.");
    }

    const review = await MarketplaceReviewModel.create({
      bookingId: booking.id,
      userId: booking.userId,
      userName: booking.userName,
      userEmail: booking.userEmail,
      vendorId: booking.vendorId,
      vendorName: booking.vendorName,
      photographerId: booking.photographerId,
      listingName: booking.listingName,
      rating: input.rating,
      comment: input.comment,
    });

    booking.reviewSubmitted = true;
    booking.reviewId = review.id;
    await booking.save();

    const notifications = buildReviewCreatedNotifications(booking.userName);
    await Promise.all([
      createUserNotification(booking.userId, "user", notifications.user, {
        targetPath: NOTIFICATION_TARGET_PATHS.bookings,
      }),
      createUserNotification(booking.vendorId, "vendor", notifications.vendor, {
        targetPath: NOTIFICATION_TARGET_PATHS.reviews,
      }),
      notifyAllSuperAdmins(notifications.admin, {
        targetPath: NOTIFICATION_TARGET_PATHS.reviews,
      }),
    ]);

    response.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      data: serializeReview(review),
    });
  }),
);

marketplaceReviewRouter.delete(
  "/reviews/:reviewId",
  authorizePermissions("manage_reviews"),
  asyncHandler(async (request, response) => {
    const review = await MarketplaceReviewModel.findById(request.params.reviewId);
    if (!review) {
      throw new HttpError(404, "Review not found.");
    }

    await Promise.all([
      MarketplaceBookingModel.updateOne(
        { _id: review.bookingId },
        { $set: { reviewSubmitted: false, reviewId: null } },
      ),
      review.deleteOne(),
    ]);

    response.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  }),
);

marketplaceReviewRouter.patch(
  "/reviews/:reviewId/respond",
  authorizeRoles("vendor", "super-admin"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const input = reviewResponseSchema.parse(request.body);
    const review = await MarketplaceReviewModel.findById(request.params.reviewId);

    if (!review) {
      throw new HttpError(404, "Review not found.");
    }

    if (authUser.role === "vendor" && review.vendorId !== authUser.id) {
      throw new HttpError(403, "You can only respond to reviews on your own profiles.");
    }

    review.vendorResponse = input.vendorResponse;
    review.respondedAt = new Date();
    await review.save();

    await createUserNotification(review.userId, "user", `${review.vendorName} replied to your review.`, {
      targetPath: NOTIFICATION_TARGET_PATHS.reviews,
    });

    response.status(200).json({
      success: true,
      message: "Review response saved successfully.",
      data: serializeReview(review),
    });
  }),
);
