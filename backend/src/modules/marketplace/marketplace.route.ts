import { Router } from "express";
import { z } from "zod";
import { requireAuth, authorizePermissions, authorizeRoles, type AuthenticatedRequest } from "../../middleware/auth.js";
import { UserModel } from "../../models/user.model.js";
import { BrowseServiceCardModel } from "../../models/browse-service-card.model.js";
import { CategoryModel } from "../../models/category.model.js";
import { SubCategoryModel } from "../../models/sub-category.model.js";
import { SearchAdvertisementModel } from "../../models/search-advertisement.model.js";
import { MarketplaceNotificationModel } from "../../models/notification.model.js";
import { VendorProfileModel } from "../../models/vendor-profile.model.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { HttpError } from "../../utils/http-error.js";
import {
  buildProfileCreatedNotifications,
  buildProfileModerationMessage,
  canDeleteCategory,
  canDeleteSubCategory,
  createUserNotification,
  NOTIFICATION_TARGET_PATHS,
  notifyAllSuperAdmins,
  resolveLocationInput,
  serializeBrowseServiceCard,
  serializeCategory,
  serializeMarketplaceListing,
  serializeNotification,
  serializePlatformUser,
  serializeSearchAdvertisement,
  serializeSubCategory,
  validateCategoryAndSubCategory,
} from "./marketplace.service.js";

const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required."),
  status: z.enum(["active", "inactive"]).default("active"),
});

const browseServiceCardSchema = z.object({
  name: z.string().trim().min(1, "Service name is required."),
  description: z.string().trim().min(1, "Description is required."),
  badgeText: z.string().trim().min(1, "Badge text is required."),
  sortOrder: z.coerce.number().int().min(0).default(0),
  status: z.enum(["active", "inactive"]).default("active"),
});

const searchAdvertisementSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  subtitle: z.string().trim().default(""),
  description: z.string().trim().min(1, "Description is required."),
  badgeText: z.string().trim().default(""),
  imageUrl: z.string().trim().min(1, "Image URL is required."),
  ctaText: z.string().trim().min(1, "CTA text is required."),
  ctaUrl: z.string().trim().min(1, "CTA URL is required."),
  serviceTags: z.array(z.string().trim().min(1)).default([]),
  locationTags: z.array(z.string().trim().min(1)).default([]),
  sortOrder: z.coerce.number().int().min(0).default(0),
  status: z.enum(["active", "inactive"]).default("active"),
  startDate: z.string().trim().nullable().optional(),
  endDate: z.string().trim().nullable().optional(),
});

const subCategorySchema = z.object({
  categoryId: z.string().trim().min(1, "Category is required."),
  name: z.string().trim().min(1, "Sub-category name is required."),
  status: z.enum(["active", "inactive"]).default("active"),
});

const imageCropSchema = z.object({
  zoom: z.number().min(1).max(4),
  x: z.number().min(-100).max(100),
  y: z.number().min(-100).max(100),
});

const listingSchema = z.object({
  title: z.string().trim().min(1, "Profile title is required."),
  categoryId: z.string().trim().min(1, "Category is required."),
  subCategoryId: z.string().trim().min(1, "Sub-category is required."),
  experience: z.string().trim().min(1, "Experience is required."),
  price: z.string().trim().min(1, "Price is required."),
  description: z.string().trim().min(1, "Description is required."),
  featuredImage: z.string().trim().min(1, "Featured image is required."),
  featuredImageCrop: imageCropSchema.nullable().optional(),
  locationInput: z.string().trim().min(1, "Location input is required."),
  placeId: z.string().trim().optional().default(""),
  coordinates: z.object({
    lat: z.coerce.number().finite(),
    lng: z.coerce.number().finite(),
  }),
  address: z.string().trim().min(1, "Address is required."),
  colony: z.string().trim().min(1, "Colony or street is required."),
  area: z.string().trim().min(1, "Area is required."),
  pincode: z.string().trim().min(1, "Pincode is required."),
  state: z.string().trim().min(1, "State is required."),
  city: z.string().trim().min(1, "City is required."),
  district: z.string().trim().min(1, "District is required."),
  portfolioImages: z.array(z.string().trim().min(1)).min(1, "At least one portfolio image is required."),
  albums: z.array(
    z.object({
      name: z.string().trim().min(1, "Album name is required."),
      images: z.array(z.string().trim().min(1)).min(1, "Album must include at least one image."),
    }),
  ).default([]),
  youtubeLinks: z.array(
    z.object({
      url: z.string().trim().min(1, "YouTube link is required."),
      thumb: z.string().trim().nullable().optional(),
      videoId: z.string().trim().nullable().optional(),
    }),
  ).default([]),
});

const locationResolveSchema = z.object({
  input: z.string().trim().min(1, "Location input is required."),
});

function normalizeTagList(tags: string[]) {
  return Array.from(
    new Set(
      tags
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

function parseNullableDate(raw: string | null | undefined, fieldName: string) {
  if (!raw) {
    return null;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    throw new HttpError(400, `${fieldName} must be a valid date.`);
  }

  return parsed;
}

const marketplaceRouter = Router();

marketplaceRouter.use(requireAuth);

marketplaceRouter.get(
  "/users",
  authorizePermissions("manage_users", "view_users_limited", "view_vendors_limited"),
  asyncHandler(async (_request, response) => {
    const users = await UserModel.find().sort({ createdAt: -1 });
    response.status(200).json({
      success: true,
      data: users.map((user) => serializePlatformUser(user)),
    });
  }),
);

marketplaceRouter.get(
  "/notifications",
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    if (!request.authUser) {
      throw new HttpError(401, "Authentication is required.");
    }

    const notifications = await MarketplaceNotificationModel.find({
      recipientUserId: request.authUser.id,
    }).sort({ createdAt: -1 });

    response.status(200).json({
      success: true,
      data: notifications.map((notification) => serializeNotification(notification)),
    });
  }),
);

marketplaceRouter.post(
  "/notifications/read-all",
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    if (!request.authUser) {
      throw new HttpError(401, "Authentication is required.");
    }

    await MarketplaceNotificationModel.updateMany(
      { recipientUserId: request.authUser.id, read: false },
      { $set: { read: true } },
    );

    response.status(200).json({
      success: true,
      message: "Notifications marked as read.",
    });
  }),
);

marketplaceRouter.delete(
  "/notifications/:notificationId",
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    if (!request.authUser) {
      throw new HttpError(401, "Authentication is required.");
    }

    const notification = await MarketplaceNotificationModel.findOne({
      _id: request.params.notificationId,
      recipientUserId: request.authUser.id,
    });

    if (!notification) {
      throw new HttpError(404, "Notification not found.");
    }

    notification.read = true;
    await notification.save();
    await notification.deleteOne();

    response.status(200).json({
      success: true,
      message: "Notification removed successfully.",
    });
  }),
);

marketplaceRouter.get(
  "/categories",
  asyncHandler(async (_request, response) => {
    const categories = await CategoryModel.find().sort({ name: 1, createdAt: -1 });
    response.status(200).json({
      success: true,
      data: categories.map((category) => serializeCategory(category)),
    });
  }),
);

marketplaceRouter.post(
  "/categories",
  authorizePermissions("manage_categories"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    if (!request.authUser) {
      throw new HttpError(401, "Authentication is required.");
    }

    const input = categorySchema.parse(request.body);
    const existing = await CategoryModel.findOne({ name: input.name });
    if (existing) {
      throw new HttpError(409, "A category with this name already exists.");
    }

    const category = await CategoryModel.create({
      ...input,
      createdByUserId: request.authUser.id,
    });

    response.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: serializeCategory(category),
    });
  }),
);

marketplaceRouter.patch(
  "/categories/:categoryId",
  authorizePermissions("manage_categories"),
  asyncHandler(async (request, response) => {
    const input = categorySchema.parse(request.body);
    const category = await CategoryModel.findById(request.params.categoryId);
    if (!category) {
      throw new HttpError(404, "Category not found.");
    }

    const duplicate = await CategoryModel.findOne({ name: input.name, _id: { $ne: category.id } });
    if (duplicate) {
      throw new HttpError(409, "A category with this name already exists.");
    }

    category.name = input.name;
    category.status = input.status;
    await category.save();

    await Promise.all([
      SubCategoryModel.updateMany(
        { categoryId: category.id },
        { $set: {} },
      ),
      VendorProfileModel.updateMany(
        { categoryId: category.id },
        { $set: { category: category.name } },
      ),
    ]);

    response.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: serializeCategory(category),
    });
  }),
);

marketplaceRouter.delete(
  "/categories/:categoryId",
  authorizePermissions("manage_categories"),
  asyncHandler(async (request, response) => {
    const category = await CategoryModel.findById(request.params.categoryId);
    if (!category) {
      throw new HttpError(404, "Category not found.");
    }

    await canDeleteCategory(category.id);
    await category.deleteOne();

    response.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  }),
);

marketplaceRouter.get(
  "/browse-services",
  asyncHandler(async (_request, response) => {
    const browseServiceCards = await BrowseServiceCardModel.find().sort({ sortOrder: 1, name: 1, createdAt: -1 });

    response.status(200).json({
      success: true,
      data: browseServiceCards.map((card) => serializeBrowseServiceCard(card)),
    });
  }),
);

marketplaceRouter.post(
  "/browse-services",
  authorizePermissions("manage_browse_services", "manage_homepage_banners"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    if (!request.authUser) {
      throw new HttpError(401, "Authentication is required.");
    }

    const input = browseServiceCardSchema.parse(request.body);
    const existing = await BrowseServiceCardModel.findOne({ name: input.name });
    if (existing) {
      throw new HttpError(409, "A browse-by-service card with this name already exists.");
    }

    const browseServiceCard = await BrowseServiceCardModel.create({
      ...input,
      createdByUserId: request.authUser.id,
    });

    response.status(201).json({
      success: true,
      message: "Browse by service card created successfully.",
      data: serializeBrowseServiceCard(browseServiceCard),
    });
  }),
);

marketplaceRouter.patch(
  "/browse-services/:browseServiceCardId",
  authorizePermissions("manage_browse_services", "manage_homepage_banners"),
  asyncHandler(async (request, response) => {
    const input = browseServiceCardSchema.parse(request.body);
    const browseServiceCard = await BrowseServiceCardModel.findById(request.params.browseServiceCardId);
    if (!browseServiceCard) {
      throw new HttpError(404, "Browse by service card not found.");
    }

    const duplicate = await BrowseServiceCardModel.findOne({
      name: input.name,
      _id: { $ne: browseServiceCard.id },
    });
    if (duplicate) {
      throw new HttpError(409, "A browse-by-service card with this name already exists.");
    }

    browseServiceCard.name = input.name;
    browseServiceCard.description = input.description;
    browseServiceCard.badgeText = input.badgeText;
    browseServiceCard.sortOrder = input.sortOrder;
    browseServiceCard.status = input.status;
    await browseServiceCard.save();

    response.status(200).json({
      success: true,
      message: "Browse by service card updated successfully.",
      data: serializeBrowseServiceCard(browseServiceCard),
    });
  }),
);

marketplaceRouter.delete(
  "/browse-services/:browseServiceCardId",
  authorizePermissions("manage_browse_services", "manage_homepage_banners"),
  asyncHandler(async (request, response) => {
    const browseServiceCard = await BrowseServiceCardModel.findById(request.params.browseServiceCardId);
    if (!browseServiceCard) {
      throw new HttpError(404, "Browse by service card not found.");
    }

    await browseServiceCard.deleteOne();

    response.status(200).json({
      success: true,
      message: "Browse by service card deleted successfully.",
    });
  }),
);

marketplaceRouter.get(
  "/search-advertisements",
  authorizePermissions("manage_search_advertisements"),
  asyncHandler(async (_request, response) => {
    const advertisements = await SearchAdvertisementModel.find().sort({
      sortOrder: 1,
      createdAt: -1,
    });

    response.status(200).json({
      success: true,
      data: advertisements.map((advertisement) => serializeSearchAdvertisement(advertisement)),
    });
  }),
);

marketplaceRouter.post(
  "/search-advertisements",
  authorizePermissions("manage_search_advertisements"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    if (!request.authUser) {
      throw new HttpError(401, "Authentication is required.");
    }

    const input = searchAdvertisementSchema.parse(request.body);
    const startDate = parseNullableDate(input.startDate, "Start date");
    const endDate = parseNullableDate(input.endDate, "End date");

    if (startDate && endDate && startDate > endDate) {
      throw new HttpError(400, "End date must be after start date.");
    }

    const advertisement = await SearchAdvertisementModel.create({
      title: input.title,
      subtitle: input.subtitle,
      description: input.description,
      badgeText: input.badgeText,
      imageUrl: input.imageUrl,
      ctaText: input.ctaText,
      ctaUrl: input.ctaUrl,
      serviceTags: normalizeTagList(input.serviceTags),
      locationTags: normalizeTagList(input.locationTags),
      sortOrder: input.sortOrder,
      status: input.status,
      startDate,
      endDate,
      createdByUserId: request.authUser.id,
      updatedByUserId: request.authUser.id,
    });

    response.status(201).json({
      success: true,
      message: "Search advertisement created successfully.",
      data: serializeSearchAdvertisement(advertisement),
    });
  }),
);

marketplaceRouter.patch(
  "/search-advertisements/:advertisementId",
  authorizePermissions("manage_search_advertisements"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    if (!request.authUser) {
      throw new HttpError(401, "Authentication is required.");
    }

    const input = searchAdvertisementSchema.parse(request.body);
    const advertisement = await SearchAdvertisementModel.findById(request.params.advertisementId);
    if (!advertisement) {
      throw new HttpError(404, "Search advertisement not found.");
    }

    const startDate = parseNullableDate(input.startDate, "Start date");
    const endDate = parseNullableDate(input.endDate, "End date");
    if (startDate && endDate && startDate > endDate) {
      throw new HttpError(400, "End date must be after start date.");
    }

    advertisement.title = input.title;
    advertisement.subtitle = input.subtitle;
    advertisement.description = input.description;
    advertisement.badgeText = input.badgeText;
    advertisement.imageUrl = input.imageUrl;
    advertisement.ctaText = input.ctaText;
    advertisement.ctaUrl = input.ctaUrl;
    advertisement.serviceTags = normalizeTagList(input.serviceTags);
    advertisement.locationTags = normalizeTagList(input.locationTags);
    advertisement.sortOrder = input.sortOrder;
    advertisement.status = input.status;
    advertisement.startDate = startDate;
    advertisement.endDate = endDate;
    advertisement.updatedByUserId = request.authUser.id;
    await advertisement.save();

    response.status(200).json({
      success: true,
      message: "Search advertisement updated successfully.",
      data: serializeSearchAdvertisement(advertisement),
    });
  }),
);

marketplaceRouter.delete(
  "/search-advertisements/:advertisementId",
  authorizePermissions("manage_search_advertisements"),
  asyncHandler(async (request, response) => {
    const advertisement = await SearchAdvertisementModel.findById(request.params.advertisementId);
    if (!advertisement) {
      throw new HttpError(404, "Search advertisement not found.");
    }

    await advertisement.deleteOne();

    response.status(200).json({
      success: true,
      message: "Search advertisement deleted successfully.",
    });
  }),
);

marketplaceRouter.get(
  "/sub-categories",
  asyncHandler(async (request, response) => {
    const categoryId = typeof request.query.categoryId === "string" ? request.query.categoryId : "";
    const query = categoryId ? { categoryId } : {};
    const subCategories = await SubCategoryModel.find(query).sort({ name: 1, createdAt: -1 });

    response.status(200).json({
      success: true,
      data: subCategories.map((subCategory) => serializeSubCategory(subCategory)),
    });
  }),
);

marketplaceRouter.post(
  "/sub-categories",
  authorizePermissions("manage_sub_categories"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    if (!request.authUser) {
      throw new HttpError(401, "Authentication is required.");
    }

    const input = subCategorySchema.parse(request.body);
    const category = await CategoryModel.findById(input.categoryId);
    if (!category) {
      throw new HttpError(400, "Selected category does not exist.");
    }

    const existing = await SubCategoryModel.findOne({
      categoryId: input.categoryId,
      name: input.name,
    });
    if (existing) {
      throw new HttpError(409, "A sub-category with this name already exists in the selected category.");
    }

    const subCategory = await SubCategoryModel.create({
      ...input,
      createdByUserId: request.authUser.id,
    });

    response.status(201).json({
      success: true,
      message: "Sub-category created successfully.",
      data: serializeSubCategory(subCategory),
    });
  }),
);

marketplaceRouter.patch(
  "/sub-categories/:subCategoryId",
  authorizePermissions("manage_sub_categories"),
  asyncHandler(async (request, response) => {
    const input = subCategorySchema.parse(request.body);
    const subCategory = await SubCategoryModel.findById(request.params.subCategoryId);
    if (!subCategory) {
      throw new HttpError(404, "Sub-category not found.");
    }

    const category = await CategoryModel.findById(input.categoryId);
    if (!category) {
      throw new HttpError(400, "Selected category does not exist.");
    }

    const duplicate = await SubCategoryModel.findOne({
      categoryId: input.categoryId,
      name: input.name,
      _id: { $ne: subCategory.id },
    });
    if (duplicate) {
      throw new HttpError(409, "A sub-category with this name already exists in the selected category.");
    }

    const previousCategoryId = subCategory.categoryId;
    subCategory.categoryId = input.categoryId;
    subCategory.name = input.name;
    subCategory.status = input.status;
    await subCategory.save();

    await VendorProfileModel.updateMany(
      { subCategoryId: subCategory.id },
      {
        $set: {
          subCategory: subCategory.name,
          ...(previousCategoryId !== input.categoryId ? { categoryId: input.categoryId, category: category.name } : {}),
        },
      },
    );

    response.status(200).json({
      success: true,
      message: "Sub-category updated successfully.",
      data: serializeSubCategory(subCategory),
    });
  }),
);

marketplaceRouter.delete(
  "/sub-categories/:subCategoryId",
  authorizePermissions("manage_sub_categories"),
  asyncHandler(async (request, response) => {
    const subCategory = await SubCategoryModel.findById(request.params.subCategoryId);
    if (!subCategory) {
      throw new HttpError(404, "Sub-category not found.");
    }

    await canDeleteSubCategory(subCategory.id);
    await subCategory.deleteOne();

    response.status(200).json({
      success: true,
      message: "Sub-category deleted successfully.",
    });
  }),
);

marketplaceRouter.post(
  "/location/resolve",
  asyncHandler(async (request, response) => {
    const input = locationResolveSchema.parse(request.body);
    const location = await resolveLocationInput(input.input);

    response.status(200).json({
      success: true,
      message: location.message || "Location resolved successfully.",
      data: location,
    });
  }),
);

marketplaceRouter.get(
  "/listings",
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    if (!request.authUser) {
      throw new HttpError(401, "Authentication is required.");
    }

    const isOperationalRole = request.authUser.role !== "vendor" && request.authUser.role !== "user";
    const query = isOperationalRole
      ? {}
      : request.authUser.role === "vendor"
        ? { vendorId: request.authUser.id }
        : { status: "approved" };

    const listings = await VendorProfileModel.find(query).sort({ createdAt: -1, updatedAt: -1 });

    response.status(200).json({
      success: true,
      data: listings.map((listing) => serializeMarketplaceListing(listing)),
    });
  }),
);

marketplaceRouter.post(
  "/listings",
  authorizeRoles("vendor"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    if (!request.authUser) {
      throw new HttpError(401, "Authentication is required.");
    }

    const input = listingSchema.parse(request.body);
    const { category, subCategory } = await validateCategoryAndSubCategory(input.categoryId, input.subCategoryId);

    const profile = await VendorProfileModel.create({
      vendorId: request.authUser.id,
      vendorName: request.authUser.name,
      vendorEmail: request.authUser.email,
      title: input.title,
      categoryId: category.id,
      category: category.name,
      subCategoryId: subCategory.id,
      subCategory: subCategory.name,
      experience: input.experience,
      price: input.price,
      description: input.description,
      featuredImage: input.featuredImage,
      featuredImageCrop: input.featuredImageCrop ?? null,
      locationInput: input.locationInput,
      placeId: input.placeId,
      coordinates: input.coordinates,
      address: input.address,
      colony: input.colony,
      area: input.area,
      pincode: input.pincode,
      state: input.state,
      city: input.city,
      district: input.district,
      portfolioImages: input.portfolioImages,
      albums: input.albums,
      youtubeLinks: input.youtubeLinks,
      status: "pending",
    });

    await UserModel.findByIdAndUpdate(request.authUser.id, {
      $set: { profileComplete: true },
    });

    const notifications = buildProfileCreatedNotifications(request.authUser.name);
    await Promise.all([
      createUserNotification(request.authUser.id, "vendor", notifications.vendor, {
        targetPath: NOTIFICATION_TARGET_PATHS.listings,
      }),
      notifyAllSuperAdmins(notifications.admin, {
        targetPath: NOTIFICATION_TARGET_PATHS.listings,
      }),
    ]);

    response.status(201).json({
      success: true,
      message: "Profile created successfully.",
      data: serializeMarketplaceListing(profile),
    });
  }),
);

marketplaceRouter.patch(
  "/listings/:listingId",
  authorizeRoles("vendor", "super-admin"),
  asyncHandler(async (request: AuthenticatedRequest, response) => {
    const authUser = request.authUser;
    if (!authUser) {
      throw new HttpError(401, "Authentication is required.");
    }

    const input = listingSchema.parse(request.body);
    const listing = await VendorProfileModel.findById(request.params.listingId);
    if (!listing) {
      throw new HttpError(404, "Profile not found.");
    }

    if (authUser.role === "vendor" && listing.vendorId !== authUser.id) {
      throw new HttpError(403, "You can only edit your own profiles.");
    }

    const { category, subCategory } = await validateCategoryAndSubCategory(input.categoryId, input.subCategoryId);

    listing.title = input.title;
    listing.categoryId = category.id;
    listing.category = category.name;
    listing.subCategoryId = subCategory.id;
    listing.subCategory = subCategory.name;
    listing.experience = input.experience;
    listing.price = input.price;
    listing.description = input.description;
    listing.featuredImage = input.featuredImage;
    listing.featuredImageCrop = input.featuredImageCrop ?? null;
    listing.locationInput = input.locationInput;
    listing.placeId = input.placeId;
    listing.coordinates = input.coordinates;
    listing.address = input.address;
    listing.colony = input.colony;
    listing.area = input.area;
    listing.pincode = input.pincode;
    listing.state = input.state;
    listing.city = input.city;
    listing.district = input.district;
    listing.portfolioImages = input.portfolioImages;
    listing.albums = input.albums;
    listing.youtubeLinks = input.youtubeLinks;
    await listing.save();

    response.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: serializeMarketplaceListing(listing),
    });
  }),
);

marketplaceRouter.post(
  "/listings/:listingId/approve",
  authorizePermissions("moderate_profiles", "verify_vendor", "change_verification_status"),
  asyncHandler(async (request, response) => {
    const listing = await VendorProfileModel.findById(request.params.listingId);
    if (!listing) {
      throw new HttpError(404, "Profile not found.");
    }

    listing.status = "approved";
    await listing.save();

    await createUserNotification(listing.vendorId, "vendor", buildProfileModerationMessage("approved"), {
      targetPath: NOTIFICATION_TARGET_PATHS.listings,
    });

    response.status(200).json({
      success: true,
      message: "Profile approved successfully.",
      data: serializeMarketplaceListing(listing),
    });
  }),
);

marketplaceRouter.post(
  "/listings/:listingId/reject",
  authorizePermissions("moderate_profiles", "reject_vendor", "change_verification_status"),
  asyncHandler(async (request, response) => {
    const listing = await VendorProfileModel.findById(request.params.listingId);
    if (!listing) {
      throw new HttpError(404, "Profile not found.");
    }

    listing.status = "rejected";
    await listing.save();

    await createUserNotification(listing.vendorId, "vendor", buildProfileModerationMessage("rejected"), {
      targetPath: NOTIFICATION_TARGET_PATHS.listings,
    });

    response.status(200).json({
      success: true,
      message: "Profile rejected successfully.",
      data: serializeMarketplaceListing(listing),
    });
  }),
);

export { marketplaceRouter };


