import { Schema, model, type HydratedDocument } from "mongoose";

export interface MarketplaceReviewRecord {
  bookingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  vendorId: string;
  vendorName: string;
  photographerId: string;
  listingName: string;
  rating: number;
  comment: string;
  vendorResponse?: string | null;
  respondedAt?: Date | null;
  moderationStatus: "active" | "hidden" | "removed";
  moderationNote?: string;
  warnedAt?: Date | null;
  banEscalatedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type MarketplaceReviewDocument = HydratedDocument<MarketplaceReviewRecord>;

const marketplaceReviewSchema = new Schema<MarketplaceReviewRecord>(
  {
    bookingId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    vendorId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    vendorName: {
      type: String,
      required: true,
      trim: true,
    },
    photographerId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    listingName: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    vendorResponse: {
      type: String,
      trim: true,
      default: null,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    moderationStatus: {
      type: String,
      enum: ["active", "hidden", "removed"],
      default: "active",
      required: true,
      index: true,
    },
    moderationNote: {
      type: String,
      trim: true,
      default: "",
    },
    warnedAt: {
      type: Date,
      default: null,
    },
    banEscalatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

marketplaceReviewSchema.index({ vendorId: 1, createdAt: -1 });
marketplaceReviewSchema.index({ photographerId: 1, createdAt: -1 });
marketplaceReviewSchema.index({ userId: 1, createdAt: -1 });

export const MarketplaceReviewModel = model<MarketplaceReviewRecord>(
  "MarketplaceReview",
  marketplaceReviewSchema,
);
