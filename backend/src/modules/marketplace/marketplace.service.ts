import { env } from "../../config/env.js";
import {
  MarketplaceBookingModel,
  type BookingStatus,
  type MarketplaceBookingDocument,
} from "../../models/booking.model.js";
import { type BrowseServiceCardDocument } from "../../models/browse-service-card.model.js";
import { CategoryModel, type CategoryDocument } from "../../models/category.model.js";
import {
  MarketplaceNotificationModel,
  type MarketplaceNotificationDocument,
} from "../../models/notification.model.js";
import {
  MarketplacePermissionModel,
  type MarketplacePermissionDocument,
} from "../../models/permission.model.js";
import {
  MarketplaceReviewModel,
  type MarketplaceReviewDocument,
} from "../../models/review.model.js";
import {
  MarketplaceRoleDefinitionModel,
  type MarketplaceRoleDefinitionDocument,
} from "../../models/role-definition.model.js";
import {
  type SearchAdvertisementDocument,
} from "../../models/search-advertisement.model.js";
import { SubCategoryModel, type SubCategoryDocument } from "../../models/sub-category.model.js";
import { USER_ROLES, UserModel, type UserDocument, type UserRole } from "../../models/user.model.js";
import { VendorProfileModel, type VendorProfileDocument } from "../../models/vendor-profile.model.js";
import { VendorScheduleModel, type VendorScheduleDocument } from "../../models/vendor-schedule.model.js";
import { HttpError } from "../../utils/http-error.js";

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function pickAddressComponent(
  components: Array<{ long_name?: string; types?: string[] }>,
  type: string,
) {
  return components.find((component) => component.types?.includes(type))?.long_name ?? "";
}

function roundRating(value: number) {
  return Number(value.toFixed(1));
}

function getReviewStats(stats?: ReviewStats) {
  return stats ?? { averageRating: 0, totalReviews: 0 };
}

export function parsePagination(value: unknown, fallback: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.min(Math.floor(parsed), max);
}

export function buildPaginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export function serializeCategory(category: CategoryDocument) {
  return {
    id: category.id,
    name: category.name,
    status: category.status,
    createdAt: toIsoString(category.createdAt),
  };
}

export function serializeBrowseServiceCard(card: BrowseServiceCardDocument) {
  return {
    id: card.id,
    name: card.name,
    description: card.description,
    badgeText: card.badgeText,
    sortOrder: card.sortOrder,
    status: card.status,
    createdAt: toIsoString(card.createdAt),
  };
}

export function serializeSearchAdvertisement(advertisement: SearchAdvertisementDocument) {
  return {
    id: advertisement.id,
    title: advertisement.title,
    subtitle: advertisement.subtitle,
    description: advertisement.description,
    badgeText: advertisement.badgeText,
    imageUrl: advertisement.imageUrl,
    ctaText: advertisement.ctaText,
    ctaUrl: advertisement.ctaUrl,
    serviceTags: advertisement.serviceTags,
    locationTags: advertisement.locationTags,
    sortOrder: advertisement.sortOrder,
    status: advertisement.status,
    startDate: advertisement.startDate ? toIsoString(advertisement.startDate) : null,
    endDate: advertisement.endDate ? toIsoString(advertisement.endDate) : null,
    createdAt: toIsoString(advertisement.createdAt),
    updatedAt: toIsoString(advertisement.updatedAt),
  };
}

export function serializeSubCategory(subCategory: SubCategoryDocument) {
  return {
    id: subCategory.id,
    categoryId: subCategory.categoryId,
    name: subCategory.name,
    status: subCategory.status,
    createdAt: toIsoString(subCategory.createdAt),
  };
}

export function serializeNotification(notification: MarketplaceNotificationDocument) {
  return {
    id: notification.id,
    role: notification.role,
    message: notification.message,
    targetPath: notification.targetPath ?? null,
    createdAt: toIsoString(notification.createdAt),
    read: notification.read,
  };
}

export function serializePlatformUser(user: UserDocument) {
  const rawRole = String(user.role);
  const normalizedRole = USER_ROLES.includes(rawRole as UserRole)
    ? rawRole as UserRole
    : rawRole === "super_admin"
      ? "super-admin"
      : rawRole === "consumer" || rawRole === "customer"
        ? "user"
        : rawRole === "professional"
          ? "vendor"
          : "user";
  const normalizedStatus = user.status === "active" || user.status === "invited" || user.status === "disabled"
    ? user.status
    : "active";

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizedRole,
    status: normalizedStatus,
    location: user.location || "",
    createdAt: toIsoString(user.createdAt),
  };
}

export function serializeMarketplaceListing(profile: VendorProfileDocument) {
  return {
    id: profile.id,
    vendorId: profile.vendorId,
    vendorName: profile.vendorName,
    vendorEmail: profile.vendorEmail,
    title: profile.title,
    categoryId: profile.categoryId,
    category: profile.category,
    subCategoryId: profile.subCategoryId,
    subCategory: profile.subCategory,
    city: profile.city,
    state: profile.state,
    district: profile.district,
    area: profile.area,
    address: profile.address,
    colony: profile.colony,
    pincode: profile.pincode,
    price: profile.price,
    image: profile.featuredImage,
    featuredImageCrop: profile.featuredImageCrop ?? null,
    description: profile.description,
    experience: profile.experience,
    locationInput: profile.locationInput,
    placeId: profile.placeId ?? "",
    coordinates: profile.coordinates,
    portfolio: profile.portfolioImages,
    albums: profile.albums,
    youtubeLinks: profile.youtubeLinks,
    status: profile.status,
    createdAt: toIsoString(profile.createdAt),
    updatedAt: toIsoString(profile.updatedAt),
  };
}

export function serializeBooking(booking: MarketplaceBookingDocument) {
  return {
    id: booking.id,
    userId: booking.userId,
    userName: booking.userName,
    userEmail: booking.userEmail,
    vendorId: booking.vendorId,
    vendorName: booking.vendorName,
    vendorEmail: booking.vendorEmail,
    photographerId: booking.photographerId,
    listingName: booking.listingName,
    eventType: booking.eventType,
    location: booking.location,
    date: booking.date,
    time: booking.time,
    amount: booking.amount,
    phoneNumber: booking.phoneNumber,
    status: booking.status,
    paymentRequested: booking.paymentRequested,
    withdrawalRequested: booking.withdrawalRequested,
    reviewSubmitted: booking.reviewSubmitted,
    createdAt: toIsoString(booking.createdAt),
    updatedAt: toIsoString(booking.updatedAt),
  };
}

export function serializeReview(review: MarketplaceReviewDocument) {
  return {
    id: review.id,
    bookingId: review.bookingId,
    userId: review.userId,
    userName: review.userName,
    userEmail: review.userEmail,
    vendorId: review.vendorId,
    vendorName: review.vendorName,
    photographerId: review.photographerId,
    listingName: review.listingName,
    rating: review.rating,
    comment: review.comment,
    vendorResponse: review.vendorResponse ?? null,
    respondedAt: review.respondedAt ? toIsoString(review.respondedAt) : null,
    createdAt: toIsoString(review.createdAt),
  };
}

export function serializePermission(permission: MarketplacePermissionDocument) {
  return {
    id: permission.id,
    name: permission.name,
    module: permission.module,
    audience: permission.audience,
    description: permission.description,
    status: permission.status,
    isProtected: permission.isProtected,
    createdAt: toIsoString(permission.createdAt),
  };
}

export function serializeRoleDefinition(role: MarketplaceRoleDefinitionDocument) {
  return {
    id: role.id,
    name: role.name,
    scope: role.scope,
    status: role.status,
    permissionIds: role.permissionIds,
    isProtected: role.isProtected,
    systemRole: role.systemRole ?? null,
    createdAt: toIsoString(role.createdAt),
  };
}

export function serializePhotographerReviewItem(review: MarketplaceReviewDocument) {
  return {
    id: review.id,
    reviewerName: review.userName,
    rating: review.rating,
    comment: review.comment,
    vendorResponse: review.vendorResponse ?? null,
    respondedAt: review.respondedAt ? toIsoString(review.respondedAt) : null,
    createdAt: toIsoString(review.createdAt),
  };
}

export function serializePhotographerSummary(profile: VendorProfileDocument, stats?: ReviewStats) {
  const reviewStats = getReviewStats(stats);

  return {
    id: profile.id,
    name: profile.vendorName,
    location: [profile.city, profile.state].filter(Boolean).join(", "),
    specialty: profile.subCategory || profile.category,
    rating: reviewStats.averageRating,
    reviews: reviewStats.totalReviews,
    price: profile.price,
    image: profile.featuredImage,
    verified: profile.status === "approved",
    coordinates: profile.coordinates,
    vendorEmail: profile.vendorEmail,
  };
}

export function serializePhotographerDetail(
  profile: VendorProfileDocument,
  reviewItems: ReturnType<typeof serializePhotographerReviewItem>[] = [],
  stats?: ReviewStats,
) {
  const services = [profile.category, profile.subCategory].filter(Boolean);
  const portfolio = [profile.featuredImage, ...profile.portfolioImages].filter(Boolean);
  const reviewStats = getReviewStats(stats ?? {
    averageRating: reviewItems.length === 0
      ? 0
      : roundRating(reviewItems.reduce((sum, item) => sum + item.rating, 0) / reviewItems.length),
    totalReviews: reviewItems.length,
  });

  return {
    ...serializePhotographerSummary(profile, reviewStats),
    bio: profile.description,
    experience: profile.experience,
    languages: [],
    services,
    portfolio,
    reviewItems,
    bookedDates: [],
    pendingRequests: [],
  };
}

export function serializeVendorSchedule(slot: VendorScheduleDocument) {
  return {
    id: slot.id,
    date: slot.date,
    type: slot.type,
    label: slot.label,
    timeRange: slot.timeRange,
  };
}

export const NOTIFICATION_TARGET_PATHS = {
  dashboard: "/dashboard",
  bookings: "/dashboard?tab=bookings",
  reviews: "/dashboard?tab=reviews",
  listings: "/dashboard?tab=listings",
  messages: "/dashboard?tab=messages",
} as const;

export async function createUserNotification(
  recipientUserId: string,
  role: UserRole,
  message: string,
  options?: { targetPath?: string },
) {
  return MarketplaceNotificationModel.create({
    recipientUserId,
    role,
    message,
    targetPath: options?.targetPath ?? null,
    read: false,
  });
}

export async function notifyAllSuperAdmins(message: string, options?: { targetPath?: string }) {
  const admins = await UserModel.find({ role: "super-admin" }).select("_id role");
  if (admins.length === 0) {
    return [];
  }

  return MarketplaceNotificationModel.insertMany(
    admins.map((admin) => ({
      recipientUserId: admin.id,
      role: "super-admin" as const,
      message,
      targetPath: options?.targetPath ?? null,
      read: false,
    })),
  );
}

export async function validateCategoryAndSubCategory(categoryId: string, subCategoryId: string) {
  const [category, subCategory] = await Promise.all([
    CategoryModel.findById(categoryId),
    SubCategoryModel.findById(subCategoryId),
  ]);

  if (!category) {
    throw new HttpError(400, "Selected category does not exist.");
  }

  if (!subCategory || subCategory.categoryId !== category.id) {
    throw new HttpError(400, "Selected sub-category does not belong to the chosen category.");
  }

  return { category, subCategory };
}

export async function ensurePermissionIdsExist(permissionIds: string[]) {
  if (permissionIds.length === 0) {
    return;
  }

  const existingCount = await MarketplacePermissionModel.countDocuments({
    _id: { $in: permissionIds },
  });

  if (existingCount !== permissionIds.length) {
    throw new HttpError(400, "One or more permissions do not exist.");
  }
}

export async function buildReviewStatsByPhotographerIds(photographerIds: string[]) {
  if (photographerIds.length === 0) {
    return new Map<string, ReviewStats>();
  }

  const stats = await MarketplaceReviewModel.aggregate<{
    _id: string;
    averageRating: number;
    totalReviews: number;
  }>([
    {
      $match: {
        photographerId: { $in: photographerIds },
      },
    },
    {
      $group: {
        _id: "$photographerId",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  return new Map(
    stats.map((entry) => [
      String(entry._id),
      {
        averageRating: roundRating(entry.averageRating ?? 0),
        totalReviews: entry.totalReviews ?? 0,
      },
    ]),
  );
}

export async function buildPhotographerReviewItems(photographerId: string, limit = 20) {
  const reviews = await MarketplaceReviewModel.find({ photographerId })
    .sort({ createdAt: -1 })
    .limit(limit);

  return reviews.map((review) => serializePhotographerReviewItem(review));
}

export interface ResolvedLocation {
  input: string;
  placeId: string;
  lat: number;
  lng: number;
  address: string;
  colony: string;
  area: string;
  pincode: string;
  state: string;
  city: string;
  district: string;
  mapPreviewUrl: string;
  message?: string;
}

export function parseLocationInput(input: string) {
  const value = input.trim();
  if (!value) {
    throw new HttpError(400, "Location input is required.");
  }

  const coordinateMatch = value.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (coordinateMatch) {
    return {
      input: value,
      lat: Number(coordinateMatch[1]),
      lng: Number(coordinateMatch[2]),
      placeId: "",
    };
  }

  const mapMatch =
    value.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/) ??
    value.match(/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/) ??
    value.match(/[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);

  if (mapMatch) {
    return {
      input: value,
      lat: Number(mapMatch[1]),
      lng: Number(mapMatch[2]),
      placeId: "",
    };
  }

  const placeIdMatch = value.match(/[?&]place_id=([^&]+)/i) ?? value.match(/\b(ChI[A-Za-z0-9_-]{8,})\b/);
  if (placeIdMatch) {
    return {
      input: value,
      lat: Number.NaN,
      lng: Number.NaN,
      placeId: placeIdMatch[1] ?? "",
    };
  }

  throw new HttpError(400, "Enter latitude/longitude, a Google Maps URL, or a Place ID.");
}

async function fetchGoogleGeocode(url: URL) {
  const response = await fetch(url, { method: "GET" });
  if (!response.ok) {
    throw new HttpError(502, "Google Maps lookup failed.");
  }

  const payload = (await response.json()) as {
    status?: string;
    results?: Array<{
      formatted_address?: string;
      geometry?: { location?: { lat?: number; lng?: number } };
      place_id?: string;
      address_components?: Array<{ long_name?: string; types?: string[] }>;
    }>;
    error_message?: string;
  };

  if (payload.status !== "OK" || !payload.results || payload.results.length === 0) {
    throw new HttpError(400, payload.error_message || "Unable to resolve this location.");
  }

  const result = payload.results[0];
  if (!result) {
    throw new HttpError(400, payload.error_message || "Unable to resolve this location.");
  }

  return result;
}

export async function resolveLocationInput(input: string): Promise<ResolvedLocation> {
  const parsed = parseLocationInput(input);
  const mapPreviewUrl = Number.isFinite(parsed.lat) && Number.isFinite(parsed.lng)
    ? `https://maps.google.com/maps?q=${parsed.lat},${parsed.lng}&z=14&output=embed`
    : "";

  if (!env.GOOGLE_MAPS_API_KEY) {
    if (!Number.isFinite(parsed.lat) || !Number.isFinite(parsed.lng)) {
      throw new HttpError(
        400,
        "Place ID resolution requires GOOGLE_MAPS_API_KEY in the backend environment.",
      );
    }

    return {
      input: parsed.input,
      placeId: parsed.placeId || "",
      lat: parsed.lat,
      lng: parsed.lng,
      address: "",
      colony: "",
      area: "",
      pincode: "",
      state: "",
      city: "",
      district: "",
      mapPreviewUrl,
      message: "Coordinates were parsed, but address auto-fill requires GOOGLE_MAPS_API_KEY.",
    };
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  if (parsed.placeId) {
    url.searchParams.set("place_id", parsed.placeId);
  } else {
    url.searchParams.set("latlng", `${parsed.lat},${parsed.lng}`);
  }
  url.searchParams.set("key", env.GOOGLE_MAPS_API_KEY);

  const result = await fetchGoogleGeocode(url);
  const components = result.address_components ?? [];
  const lat = result.geometry?.location?.lat ?? parsed.lat;
  const lng = result.geometry?.location?.lng ?? parsed.lng;

  return {
    input: parsed.input,
    placeId: result.place_id ?? parsed.placeId ?? "",
    lat,
    lng,
    address: result.formatted_address ?? "",
    colony: pickAddressComponent(components, "route") || pickAddressComponent(components, "neighborhood"),
    area:
      pickAddressComponent(components, "sublocality_level_1") ||
      pickAddressComponent(components, "sublocality") ||
      pickAddressComponent(components, "locality"),
    pincode: pickAddressComponent(components, "postal_code"),
    state: pickAddressComponent(components, "administrative_area_level_1"),
    city: pickAddressComponent(components, "locality") || pickAddressComponent(components, "postal_town"),
    district: pickAddressComponent(components, "administrative_area_level_2") || pickAddressComponent(components, "locality"),
    mapPreviewUrl: `https://maps.google.com/maps?q=${lat},${lng}&z=14&output=embed`,
  };
}

function buildSeriesPoints(range: string) {
  const now = new Date();

  if (range === "7d" || range === "30d") {
    const totalDays = range === "7d" ? 7 : 30;
    return Array.from({ length: totalDays }, (_, index) => {
      const pointDate = new Date(now);
      pointDate.setUTCDate(now.getUTCDate() - (totalDays - index - 1));
      return {
        key: pointDate.toISOString().slice(0, 10),
        label: new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(pointDate),
      };
    });
  }

  if (range === "90d") {
    return Array.from({ length: 13 }, (_, index) => {
      const pointDate = new Date(now);
      pointDate.setUTCDate(now.getUTCDate() - ((12 - index) * 7));
      return {
        key: pointDate.toISOString().slice(0, 10),
        label: `Week ${index + 1}`,
      };
    });
  }

  return Array.from({ length: 12 }, (_, index) => {
    const pointDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (11 - index), 1));
    return {
      key: pointDate.toISOString().slice(0, 7),
      label: new Intl.DateTimeFormat("en-IN", { month: "short", year: "2-digit" }).format(pointDate),
    };
  });
}

export async function buildVendorAnalytics(vendorId: string, listingId: string, range: string) {
  const profileFilter = listingId === "all" ? { vendorId } : { vendorId, _id: listingId };
  const profiles = await VendorProfileModel.find(profileFilter).sort({ createdAt: -1 });
  const profileIds = profiles.map((profile) => profile.id);
  const [bookings, reviews] = await Promise.all([
    profileIds.length === 0
      ? Promise.resolve([])
      : MarketplaceBookingModel.find({ photographerId: { $in: profileIds } }),
    profileIds.length === 0
      ? Promise.resolve([])
      : MarketplaceReviewModel.find({ photographerId: { $in: profileIds } }),
  ]);

  const approvedCount = profiles.filter((profile) => profile.status === "approved").length;
  const completedBookings = bookings.filter((booking) => booking.status === "completed").length;
  const confirmedBookings = bookings.filter((booking) => booking.status === "confirmed").length;
  const pendingBookings = bookings.filter((booking) => booking.status === "pending").length;

  return {
    listings: profiles.map((profile) => ({
      id: profile.id,
      label: profile.title,
    })),
    summary: {
      activeListings: approvedCount,
      totalViews: 0,
      totalReviews: reviews.length,
      totalLeads: bookings.length,
      timesBooked: confirmedBookings + completedBookings,
      views: 0,
      reviews: reviews.length,
      bookmarks: 0,
      leads: pendingBookings,
      bookings: bookings.length,
    },
    series: buildSeriesPoints(range).map((point) => ({
      label: point.label,
      views: 0,
      reviews: reviews.filter((review) => toIsoString(review.createdAt).startsWith(point.key)).length,
      bookmarks: 0,
      leads: bookings.filter((booking) => booking.status === "pending" && booking.date.startsWith(point.key)).length,
      bookings: bookings.filter((booking) => booking.date.startsWith(point.key)).length,
    })),
    breakdown: profiles.map((profile) => ({
      id: profile.id,
      label: profile.title,
      views: 0,
      reviews: reviews.filter((review) => review.photographerId === profile.id).length,
      bookmarks: 0,
      leads: bookings.filter((booking) => booking.photographerId === profile.id && booking.status === "pending").length,
      bookings: bookings.filter((booking) => booking.photographerId === profile.id).length,
    })),
  };
}

export async function buildPhotographerAvailability(profileId: string) {
  const profile = await VendorProfileModel.findOne({ _id: profileId, status: "approved" });
  if (!profile) {
    throw new HttpError(404, "Profile not found.");
  }

  const [slots, confirmedBookings, pendingBookings] = await Promise.all([
    VendorScheduleModel.find({ vendorId: profile.vendorId }).sort({ date: 1, createdAt: 1 }),
    MarketplaceBookingModel.find({
      photographerId: profile.id,
      status: { $in: ["approved_by_vendor", "confirmed", "completed"] },
    }).sort({ date: 1, createdAt: 1 }),
    MarketplaceBookingModel.find({
      photographerId: profile.id,
      status: "pending",
    }).sort({ createdAt: -1 }),
  ]);

  return {
    availableSlots: slots.map((slot) => serializeVendorSchedule(slot)),
    bookedDates: [...new Set(confirmedBookings.map((booking) => booking.date))],
    pendingRequests: pendingBookings.map((booking) => ({
      id: booking.id,
      userName: booking.userName,
      date: booking.date,
      eventType: booking.eventType,
    })),
  };
}

export async function canDeleteCategory(categoryId: string) {
  const [subCategoryCount, profileCount] = await Promise.all([
    SubCategoryModel.countDocuments({ categoryId }),
    VendorProfileModel.countDocuments({ categoryId }),
  ]);

  if (subCategoryCount > 0 || profileCount > 0) {
    throw new HttpError(409, "This category is in use and cannot be deleted yet.");
  }
}

export async function canDeleteSubCategory(subCategoryId: string) {
  const profileCount = await VendorProfileModel.countDocuments({ subCategoryId });
  if (profileCount > 0) {
    throw new HttpError(409, "This sub-category is in use and cannot be deleted yet.");
  }
}

export function buildProfileCreatedNotifications(vendorName: string) {
  return {
    vendor: "Hey! Profile Created Successfully",
    admin: `Hey! ${vendorName} created profile.`,
  };
}

export function buildProfileModerationMessage(status: "approved" | "rejected") {
  return status === "approved"
    ? "Hey! Your profile was approved by Super Admin."
    : "Hey! Your profile was rejected by Super Admin.";
}

export function buildBookingCreatedNotifications(userName: string, listingName: string) {
  return {
    user: "Hey! Your booking request was created successfully.",
    vendor: `Hey! ${userName} requested a booking for ${listingName}.`,
    admin: `Hey! ${userName} created a booking for ${listingName}.`,
  };
}

export function buildBookingStatusMessage(status: BookingStatus) {
  if (status === "approved_by_vendor") {
    return "Hey! Your booking was approved by the vendor.";
  }

  if (status === "confirmed") {
    return "Hey! Your booking is now confirmed.";
  }

  if (status === "rejected_by_vendor") {
    return "Hey! Your booking was rejected by the vendor.";
  }

  if (status === "completed") {
    return "Hey! Your booking is now marked as completed.";
  }

  if (status === "cancelled") {
    return "Hey! Your booking is now cancelled.";
  }

  return "Hey! Your booking is pending vendor action.";
}

export function buildReviewCreatedNotifications(userName: string) {
  return {
    user: "Thanks! Your review was submitted successfully.",
    vendor: `Hey! ${userName} left a new review on your completed booking.`,
    admin: `Hey! ${userName} submitted a new review.`,
  };
}








