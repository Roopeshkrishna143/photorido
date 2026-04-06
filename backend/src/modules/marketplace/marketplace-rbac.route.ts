import { Router } from "express";
import { z } from "zod";
import { authorizePermissions, requireAuth } from "../../middleware/auth.js";
import { MarketplaceBookingModel } from "../../models/booking.model.js";
import { MarketplacePermissionModel } from "../../models/permission.model.js";
import { MarketplaceReviewModel } from "../../models/review.model.js";
import { MarketplaceRoleDefinitionModel } from "../../models/role-definition.model.js";
import { UserModel } from "../../models/user.model.js";
import { VendorProfileModel } from "../../models/vendor-profile.model.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";
import {
  buildPaginationMeta,
  ensurePermissionIdsExist,
  parsePagination,
  serializePermission,
  serializeReview,
  serializeRoleDefinition,
} from "./marketplace.service.js";

const permissionSchema = z.object({
  name: z.string().trim().min(1, "Permission name is required."),
  module: z.string().trim().min(1, "Module is required."),
  audience: z.enum(["super-admin", "vendor", "user"]),
  description: z.string().trim().min(1, "Description is required."),
  status: z.enum(["active", "draft"]),
});

const roleSchema = z.object({
  name: z.string().trim().min(1, "Role name is required."),
  scope: z.enum(["platform", "operations", "marketplace"]),
  status: z.enum(["active", "draft"]),
  permissionIds: z.array(z.string().trim().min(1)).default([]),
});

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeSearchValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export const marketplaceRbacRouter = Router();

marketplaceRbacRouter.use(requireAuth);

marketplaceRbacRouter.get(
  "/permissions",
  authorizePermissions("manage_permissions"),
  asyncHandler(async (request, response) => {
    const page = parsePagination(request.query.page, 1, 500);
    const limit = parsePagination(request.query.limit, 25, 100);
    const skip = (page - 1) * limit;
    const search = normalizeSearchValue(request.query.search);
    const moduleName = normalizeSearchValue(request.query.module);
    const audience = normalizeSearchValue(request.query.audience);
    const status = normalizeSearchValue(request.query.status);
    const query: Record<string, unknown> = {};

    if (moduleName) query.module = moduleName;
    if (audience) query.audience = audience;
    if (status) query.status = status;
    if (search) {
      const pattern = new RegExp(escapeRegex(search), "i");
      query.$or = [
        { name: pattern },
        { module: pattern },
        { description: pattern },
      ];
    }

    const [permissions, total] = await Promise.all([
      MarketplacePermissionModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      MarketplacePermissionModel.countDocuments(query),
    ]);

    response.status(200).json({
      success: true,
      data: permissions.map((permission) => serializePermission(permission)),
      meta: buildPaginationMeta(page, limit, total),
    });
  }),
);

marketplaceRbacRouter.post(
  "/permissions",
  authorizePermissions("manage_permissions"),
  asyncHandler(async (request, response) => {
    const input = permissionSchema.parse(request.body);
    const duplicate = await MarketplacePermissionModel.findOne({
      name: new RegExp(`^${escapeRegex(input.name)}$`, "i"),
    });
    if (duplicate) {
      throw new HttpError(409, "A permission with this name already exists.");
    }

    const permission = await MarketplacePermissionModel.create({
      ...input,
      isProtected: false,
    });

    response.status(201).json({
      success: true,
      message: "Permission created successfully.",
      data: serializePermission(permission),
    });
  }),
);

marketplaceRbacRouter.patch(
  "/permissions/:permissionId",
  authorizePermissions("manage_permissions"),
  asyncHandler(async (request, response) => {
    const input = permissionSchema.parse(request.body);
    const permission = await MarketplacePermissionModel.findById(request.params.permissionId);
    if (!permission) {
      throw new HttpError(404, "Permission not found.");
    }

    const duplicate = await MarketplacePermissionModel.findOne({
      name: new RegExp(`^${escapeRegex(input.name)}$`, "i"),
      _id: { $ne: permission.id },
    });
    if (duplicate) {
      throw new HttpError(409, "A permission with this name already exists.");
    }

    permission.name = permission.isProtected ? permission.name : input.name;
    permission.module = permission.isProtected ? permission.module : input.module;
    permission.audience = permission.isProtected ? permission.audience : input.audience;
    permission.description = input.description;
    permission.status = input.status;
    await permission.save();

    response.status(200).json({
      success: true,
      message: "Permission updated successfully.",
      data: serializePermission(permission),
    });
  }),
);

marketplaceRbacRouter.delete(
  "/permissions/:permissionId",
  authorizePermissions("manage_permissions"),
  asyncHandler(async (request, response) => {
    const permission = await MarketplacePermissionModel.findById(request.params.permissionId);
    if (!permission) {
      throw new HttpError(404, "Permission not found.");
    }

    if (permission.isProtected) {
      throw new HttpError(403, "Protected permissions cannot be deleted.");
    }

    await Promise.all([
      MarketplaceRoleDefinitionModel.updateMany({}, { $pull: { permissionIds: permission.id } }),
      permission.deleteOne(),
    ]);

    response.status(200).json({
      success: true,
      message: "Permission deleted successfully.",
    });
  }),
);

marketplaceRbacRouter.get(
  "/roles",
  authorizePermissions("manage_roles"),
  asyncHandler(async (request, response) => {
    const page = parsePagination(request.query.page, 1, 500);
    const limit = parsePagination(request.query.limit, 25, 100);
    const skip = (page - 1) * limit;
    const search = normalizeSearchValue(request.query.search);
    const scope = normalizeSearchValue(request.query.scope);
    const status = normalizeSearchValue(request.query.status);
    const query: Record<string, unknown> = {};

    if (scope) query.scope = scope;
    if (status) query.status = status;
    if (search) {
      query.name = new RegExp(escapeRegex(search), "i");
    }

    const [roles, total] = await Promise.all([
      MarketplaceRoleDefinitionModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      MarketplaceRoleDefinitionModel.countDocuments(query),
    ]);

    response.status(200).json({
      success: true,
      data: roles.map((role) => serializeRoleDefinition(role)),
      meta: buildPaginationMeta(page, limit, total),
    });
  }),
);

marketplaceRbacRouter.post(
  "/roles",
  authorizePermissions("manage_roles"),
  asyncHandler(async (request, response) => {
    const input = roleSchema.parse(request.body);
    await ensurePermissionIdsExist(input.permissionIds);
    const duplicate = await MarketplaceRoleDefinitionModel.findOne({
      name: new RegExp(`^${escapeRegex(input.name)}$`, "i"),
    });
    if (duplicate) {
      throw new HttpError(409, "A role with this name already exists.");
    }

    const role = await MarketplaceRoleDefinitionModel.create({
      ...input,
      isProtected: false,
      systemRole: null,
    });

    response.status(201).json({
      success: true,
      message: "Role created successfully.",
      data: serializeRoleDefinition(role),
    });
  }),
);

marketplaceRbacRouter.patch(
  "/roles/:roleId",
  authorizePermissions("manage_roles"),
  asyncHandler(async (request, response) => {
    const input = roleSchema.parse(request.body);
    await ensurePermissionIdsExist(input.permissionIds);
    const role = await MarketplaceRoleDefinitionModel.findById(request.params.roleId);
    if (!role) {
      throw new HttpError(404, "Role not found.");
    }

    const duplicate = await MarketplaceRoleDefinitionModel.findOne({
      name: new RegExp(`^${escapeRegex(input.name)}$`, "i"),
      _id: { $ne: role.id },
    });
    if (duplicate) {
      throw new HttpError(409, "A role with this name already exists.");
    }

    role.name = role.isProtected ? role.name : input.name;
    role.scope = role.isProtected ? role.scope : input.scope;
    role.status = role.isProtected ? role.status : input.status;
    role.permissionIds = input.permissionIds;
    await role.save();

    response.status(200).json({
      success: true,
      message: "Role updated successfully.",
      data: serializeRoleDefinition(role),
    });
  }),
);

marketplaceRbacRouter.delete(
  "/roles/:roleId",
  authorizePermissions("manage_roles"),
  asyncHandler(async (request, response) => {
    const role = await MarketplaceRoleDefinitionModel.findById(request.params.roleId);
    if (!role) {
      throw new HttpError(404, "Role not found.");
    }

    if (role.isProtected) {
      throw new HttpError(403, "Protected roles cannot be deleted.");
    }

    await role.deleteOne();

    response.status(200).json({
      success: true,
      message: "Role deleted successfully.",
    });
  }),
);

marketplaceRbacRouter.get(
  "/dashboard/summary",
  authorizePermissions("view_dashboard"),
  asyncHandler(async (_request, response) => {
    const [
      totalUsers,
      totalVendors,
      totalBookings,
      pendingBookings,
      completedBookings,
      pendingProfiles,
      latestBookings,
      latestReviews,
      latestProfiles,
      ratingSummary,
    ] = await Promise.all([
      UserModel.countDocuments({ role: "user" }),
      UserModel.countDocuments({ role: "vendor" }),
      MarketplaceBookingModel.countDocuments(),
      MarketplaceBookingModel.countDocuments({ status: "pending" }),
      MarketplaceBookingModel.countDocuments({ status: "completed" }),
      VendorProfileModel.countDocuments({ status: "pending" }),
      MarketplaceBookingModel.find().sort({ updatedAt: -1 }).limit(5),
      MarketplaceReviewModel.find().sort({ createdAt: -1 }).limit(5),
      VendorProfileModel.find().sort({ updatedAt: -1 }).limit(5),
      MarketplaceReviewModel.aggregate<{ _id: null; averageRating: number; totalReviews: number; }>([
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]),
    ]);

    const recentActivities = [
      ...latestBookings.map((booking) => ({
        id: `booking-${booking.id}`,
        type: "booking" as const,
        title: `${booking.userName} booked ${booking.listingName}`,
        subtitle: `${booking.vendorName} - ${booking.status.replaceAll("_", " ")}`,
        createdAt: toIsoString(booking.updatedAt),
      })),
      ...latestReviews.map((review) => ({
        id: `review-${review.id}`,
        type: "review" as const,
        title: `${review.userName} reviewed ${review.vendorName}`,
        subtitle: `${review.rating}/5 - ${review.listingName}`,
        createdAt: toIsoString(review.createdAt),
      })),
      ...latestProfiles.map((profile) => ({
        id: `profile-${profile.id}`,
        type: "profile" as const,
        title: `${profile.vendorName} updated ${profile.title}`,
        subtitle: `${profile.category} / ${profile.subCategory}`,
        createdAt: toIsoString(profile.updatedAt),
      })),
    ]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 8);

    response.status(200).json({
      success: true,
      data: {
        totals: {
          users: totalUsers,
          vendors: totalVendors,
          bookings: totalBookings,
          pendingBookings,
          completedBookings,
          pendingProfiles,
        },
        reviews: {
          averageRating: ratingSummary[0]?.averageRating ? Number(ratingSummary[0].averageRating.toFixed(1)) : 0,
          totalReviews: ratingSummary[0]?.totalReviews ?? 0,
          latestReviews: latestReviews.map((review) => serializeReview(review)),
        },
        recentActivities,
      },
    });
  }),
);


