import { Router } from "express";
import { authorizeRoles, requireAuth, type AuthenticatedRequest } from "../../middleware/auth.js";
import { FavoriteModel } from "../../models/favorite.model.js";
import { VendorProfileModel } from "../../models/vendor-profile.model.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";
import { buildReviewStatsByPhotographerIds, serializePhotographerSummary } from "./marketplace.service.js";

const favoriteRouter = Router();

function ensureAuthUser(request: AuthenticatedRequest) {
  if (!request.authUser) {
    throw new HttpError(401, "Authentication is required.");
  }

  return request.authUser;
}

favoriteRouter.get(
  "/favorites",
  requireAuth,
  authorizeRoles("user"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const favorites = await FavoriteModel.find({ userId: authUser.id }).sort({ createdAt: -1 });
    const photographerIds = favorites.map((favorite) => favorite.photographerId);
    const profiles = photographerIds.length === 0
      ? []
      : await VendorProfileModel.find({ _id: { $in: photographerIds }, status: "approved" });
    const statsByProfileId = await buildReviewStatsByPhotographerIds(profiles.map((profile) => profile.id));
    const profileById = new Map(profiles.map((profile) => [profile.id, profile]));

    response.status(200).json({
      success: true,
      data: favorites
        .map((favorite) => {
          const profile = profileById.get(favorite.photographerId);
          if (!profile) {
            return null;
          }

          return {
            favoriteId: favorite.id,
            photographerId: profile.id,
            savedAt: favorite.createdAt.toISOString(),
            ...serializePhotographerSummary(profile, statsByProfileId.get(profile.id)),
          };
        })
        .filter(Boolean),
    });
  }),
);

favoriteRouter.post(
  "/favorites/:photographerId",
  requireAuth,
  authorizeRoles("user"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const photographerId = String(request.params.photographerId || "").trim();
    if (!photographerId) {
      throw new HttpError(400, "Profile id is required.");
    }

    const profile = await VendorProfileModel.findOne({ _id: photographerId, status: "approved" });
    if (!profile) {
      throw new HttpError(404, "Photographer profile not found.");
    }

    const favorite = await FavoriteModel.findOneAndUpdate(
      { userId: authUser.id, photographerId },
      { $setOnInsert: { userId: authUser.id, photographerId } },
      { upsert: true, new: true },
    );

    response.status(201).json({
      success: true,
      message: "Professional saved successfully.",
      data: {
        id: favorite.id,
        photographerId,
      },
    });
  }),
);

favoriteRouter.delete(
  "/favorites/:photographerId",
  requireAuth,
  authorizeRoles("user"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const photographerId = String(request.params.photographerId || "").trim();
    if (!photographerId) {
      throw new HttpError(400, "Profile id is required.");
    }

    await FavoriteModel.deleteOne({ userId: authUser.id, photographerId });

    response.status(200).json({
      success: true,
      message: "Professional removed from saved list.",
    });
  }),
);

export { favoriteRouter };

