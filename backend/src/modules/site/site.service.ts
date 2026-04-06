import { CategoryModel } from "../../models/category.model.js";
import { MarketplaceBookingModel } from "../../models/booking.model.js";
import { MarketplaceReviewModel } from "../../models/review.model.js";
import { UserModel } from "../../models/user.model.js";
import { VendorProfileModel } from "../../models/vendor-profile.model.js";

interface HomeServiceCategory {
  id: string;
  name: string;
  listingCount: number;
}

interface HomeSummaryStats {
  professionals: number;
  activeVendors: number;
  completedBookings: number;
  totalReviews: number;
  averageRating: number;
  activeCategories: number;
}

export interface HomeSummaryPayload {
  stats: HomeSummaryStats;
  serviceCategories: HomeServiceCategory[];
  trendingSearches: string[];
}

function uniqueNonEmpty(values: string[]) {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function roundRating(value: number) {
  return Number(value.toFixed(1));
}

export async function buildHomeSummary() {
  const [
    activeCategories,
    approvedProfilesCount,
    activeVendorsCount,
    completedBookingsCount,
    totalReviewsCount,
    ratingStats,
    categoryCounts,
    fallbackCategoryCounts,
    trendingSubCategories,
  ] = await Promise.all([
    CategoryModel.find({ status: "active" }).sort({ name: 1 }).select("_id name").lean(),
    VendorProfileModel.countDocuments({ status: "approved" }),
    UserModel.countDocuments({ role: "vendor", status: "active" }),
    MarketplaceBookingModel.countDocuments({ status: "completed" }),
    MarketplaceReviewModel.countDocuments(),
    MarketplaceReviewModel.aggregate<{ _id: null; averageRating: number }>([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]),
    VendorProfileModel.aggregate<{ _id: { categoryId: string; category: string }; listingCount: number }>([
      {
        $match: {
          status: "approved",
        },
      },
      {
        $group: {
          _id: {
            categoryId: "$categoryId",
            category: "$category",
          },
          listingCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          listingCount: -1,
          "_id.category": 1,
        },
      },
    ]),
    VendorProfileModel.aggregate<{ _id: string; listingCount: number }>([
      {
        $match: {
          status: "approved",
          category: { $type: "string", $ne: "" },
        },
      },
      {
        $group: {
          _id: "$category",
          listingCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          listingCount: -1,
          _id: 1,
        },
      },
    ]),
    VendorProfileModel.aggregate<{ _id: string; listingCount: number }>([
      {
        $match: {
          status: "approved",
          subCategory: { $type: "string", $ne: "" },
        },
      },
      {
        $group: {
          _id: "$subCategory",
          listingCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          listingCount: -1,
          _id: 1,
        },
      },
      {
        $limit: 6,
      },
    ]),
  ]);

  const listingCountByCategoryId = new Map(
    categoryCounts.map((entry) => [String(entry._id.categoryId), entry.listingCount]),
  );
  const serviceCategories: HomeServiceCategory[] = activeCategories.map((category) => ({
    id: String(category._id),
    name: category.name,
    listingCount: listingCountByCategoryId.get(String(category._id)) ?? 0,
  }));

  if (serviceCategories.length === 0) {
    serviceCategories.push(
      ...fallbackCategoryCounts.map((entry) => ({
        id: entry._id.toLowerCase().replace(/\s+/g, "-"),
        name: entry._id,
        listingCount: entry.listingCount,
      })),
    );
  }

  serviceCategories.sort((left, right) => right.listingCount - left.listingCount || left.name.localeCompare(right.name));

  const trendingSearches = uniqueNonEmpty([
    ...trendingSubCategories.map((entry) => entry._id),
    ...serviceCategories.map((category) => category.name),
  ]).slice(0, 6);

  return {
    stats: {
      professionals: approvedProfilesCount,
      activeVendors: activeVendorsCount,
      completedBookings: completedBookingsCount,
      totalReviews: totalReviewsCount,
      averageRating: roundRating(ratingStats[0]?.averageRating ?? 0),
      activeCategories: activeCategories.length || serviceCategories.length,
    },
    serviceCategories: serviceCategories.slice(0, 12),
    trendingSearches,
  } satisfies HomeSummaryPayload;
}
