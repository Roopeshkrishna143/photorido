import { Schema, model, type HydratedDocument } from "mongoose";

export const BOOKING_STATUSES = [
  "pending",
  "approved_by_vendor",
  "confirmed",
  "rejected_by_vendor",
  "completed",
  "cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface MarketplaceBookingRecord {
  userId: string;
  userName: string;
  userEmail: string;
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  photographerId: string;
  listingName: string;
  eventType: string;
  location: string;
  date: string;
  time: string;
  amount: string;
  phoneNumber: string;
  status: BookingStatus;
  paymentRequested: boolean;
  withdrawalRequested: boolean;
  reviewSubmitted: boolean;
  reviewId?: string | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type MarketplaceBookingDocument = HydratedDocument<MarketplaceBookingRecord>;

const marketplaceBookingSchema = new Schema<MarketplaceBookingRecord>(
  {
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
    vendorEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
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
    eventType: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: "pending",
      required: true,
      index: true,
    },
    paymentRequested: {
      type: Boolean,
      default: false,
    },
    withdrawalRequested: {
      type: Boolean,
      default: false,
    },
    reviewSubmitted: {
      type: Boolean,
      default: false,
    },
    reviewId: {
      type: String,
      trim: true,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

marketplaceBookingSchema.index({ vendorId: 1, createdAt: -1 });
marketplaceBookingSchema.index({ userId: 1, createdAt: -1 });
marketplaceBookingSchema.index({ photographerId: 1, createdAt: -1 });

export const MarketplaceBookingModel = model<MarketplaceBookingRecord>(
  "MarketplaceBooking",
  marketplaceBookingSchema,
);
