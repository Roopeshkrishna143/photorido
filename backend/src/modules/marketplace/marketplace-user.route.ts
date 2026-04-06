import { Router } from "express";
import { z } from "zod";
import { authorizeRoles, requireAuth, type AuthenticatedRequest } from "../../middleware/auth.js";
import { FavoriteModel } from "../../models/favorite.model.js";
import { MarketplaceBookingModel } from "../../models/booking.model.js";
import { MarketplaceConversationModel } from "../../models/conversation.model.js";
import { MarketplaceMessageModel } from "../../models/message.model.js";
import { MarketplaceReviewModel } from "../../models/review.model.js";
import { UserSettingsModel } from "../../models/user-setting.model.js";
import { USER_ACCOUNT_STATUSES, USER_ROLES, UserModel } from "../../models/user.model.js";
import { hashPassword } from "../auth/auth.service.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";
import { buildPaginationMeta, parsePagination, serializePlatformUser } from "./marketplace.service.js";

const marketplaceUserRouter = Router();

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(100).optional(),
  role: z.enum(USER_ROLES),
  status: z.enum(USER_ACCOUNT_STATUSES).default("active"),
  location: z.string().trim().max(120).optional().default(""),
  phoneNumber: z.string().trim().max(20).optional().default(""),
});

const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().optional(),
  password: z.string().min(8).max(100).optional(),
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(USER_ACCOUNT_STATUSES).optional(),
  location: z.string().trim().max(120).optional(),
  phoneNumber: z.string().trim().max(20).optional(),
}).refine((value) => Object.values(value).some((entry) => entry !== undefined), {
  message: "At least one user field is required.",
});

function ensureAuthUser(request: AuthenticatedRequest) {
  if (!request.authUser) {
    throw new HttpError(401, "Authentication is required.");
  }

  return request.authUser;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeSearchValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function assertUserCanBeDeleted(userId: string, authUserId: string) {
  if (userId === authUserId) {
    throw new HttpError(400, "You cannot delete your own account.");
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new HttpError(404, "User not found.");
  }

  if (user.role === "super-admin") {
    const activeSuperAdmins = await UserModel.countDocuments({ role: "super-admin", status: { $ne: "disabled" } });
    if (activeSuperAdmins <= 1) {
      throw new HttpError(400, "At least one active super-admin must remain.");
    }
  }

  const relationChecks = await Promise.all([
    MarketplaceBookingModel.countDocuments({ $or: [{ userId }, { vendorId: userId }] }),
    MarketplaceReviewModel.countDocuments({ $or: [{ userId }, { vendorId: userId }] }),
    MarketplaceConversationModel.countDocuments({ $or: [{ userId }, { vendorId: userId }] }),
    MarketplaceMessageModel.countDocuments({ $or: [{ senderId: userId }, { receiverId: userId }] }),
  ]);

  if (relationChecks.some((count) => count > 0)) {
    throw new HttpError(409, "This user has activity in the platform. Disable the account instead of deleting it.");
  }

  return user;
}

marketplaceUserRouter.get(
  "/users",
  requireAuth,
  authorizeRoles("super-admin"),
  asyncHandler(async (request, response) => {
    const page = parsePagination(request.query.page, 1, 500);
    const limit = parsePagination(request.query.limit, 100, 1000);
    const skip = (page - 1) * limit;
    const role = normalizeSearchValue(request.query.role);
    const status = normalizeSearchValue(request.query.status);
    const search = normalizeSearchValue(request.query.search);
    const query: Record<string, unknown> = {};

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      const pattern = new RegExp(escapeRegex(search), "i");
      query.$or = [
        { name: pattern },
        { email: pattern },
        { location: pattern },
        { phoneNumber: pattern },
      ];
    }

    const [users, total] = await Promise.all([
      UserModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      UserModel.countDocuments(query),
    ]);

    response.status(200).json({
      success: true,
      data: users.map((user) => serializePlatformUser(user)),
      meta: buildPaginationMeta(page, limit, total),
    });
  }),
);

marketplaceUserRouter.post(
  "/users",
  requireAuth,
  authorizeRoles("super-admin"),
  asyncHandler(async (request, response) => {
    const input = createUserSchema.parse(request.body);
    const existingUser = await UserModel.findOne({ email: input.email.toLowerCase() });
    if (existingUser) {
      throw new HttpError(409, "A user with this email already exists.");
    }

    const user = await UserModel.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: await hashPassword(input.password ?? "password123"),
      role: input.role,
      status: input.status,
      location: input.location || "",
      phoneNumber: input.phoneNumber || "",
      profileComplete: true,
      isSeeded: false,
    });

    response.status(201).json({
      success: true,
      message: "User created successfully.",
      data: serializePlatformUser(user),
    });
  }),
);

marketplaceUserRouter.patch(
  "/users/:userId",
  requireAuth,
  authorizeRoles("super-admin"),
  asyncHandler(async (request, response) => {
    const input = updateUserSchema.parse(request.body);
    const user = await UserModel.findById(request.params.userId);
    if (!user) {
      throw new HttpError(404, "User not found.");
    }

    if (input.email && input.email.toLowerCase() !== user.email) {
      const duplicate = await UserModel.findOne({ email: input.email.toLowerCase(), _id: { $ne: user.id } });
      if (duplicate) {
        throw new HttpError(409, "Another user already uses this email address.");
      }
      user.email = input.email.toLowerCase();
    }

    if (input.name !== undefined) user.name = input.name;
    if (input.role !== undefined) user.role = input.role;
    if (input.status !== undefined) user.status = input.status;
    if (input.location !== undefined) user.location = input.location;
    if (input.phoneNumber !== undefined) user.phoneNumber = input.phoneNumber;
    if (input.password) {
      user.passwordHash = await hashPassword(input.password);
    }

    await user.save();

    response.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: serializePlatformUser(user),
    });
  }),
);

marketplaceUserRouter.delete(
  "/users/:userId",
  requireAuth,
  authorizeRoles("super-admin"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = ensureAuthUser(request);
    const userId = String(request.params.userId || "").trim();
    const user = await assertUserCanBeDeleted(userId, authUser.id);

    await Promise.all([
      FavoriteModel.deleteMany({ userId: user.id }),
      UserSettingsModel.deleteOne({ userId: user.id }),
      user.deleteOne(),
    ]);

    response.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  }),
);

export { marketplaceUserRouter };




