import { Schema, model, type HydratedDocument } from "mongoose";

export const SEARCH_ADVERTISEMENT_STATUSES = ["active", "inactive"] as const;
export type SearchAdvertisementStatus = (typeof SEARCH_ADVERTISEMENT_STATUSES)[number];

export interface SearchAdvertisement {
  title: string;
  subtitle: string;
  description: string;
  badgeText: string;
  imageUrl: string;
  ctaText: string;
  ctaUrl: string;
  serviceTags: string[];
  locationTags: string[];
  sortOrder: number;
  status: SearchAdvertisementStatus;
  startDate?: Date | null;
  endDate?: Date | null;
  createdByUserId: string;
  updatedByUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SearchAdvertisementDocument = HydratedDocument<SearchAdvertisement>;

const searchAdvertisementSchema = new Schema<SearchAdvertisement>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    badgeText: {
      type: String,
      required: true,
      trim: true,
      default: "",
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    ctaText: {
      type: String,
      required: true,
      trim: true,
      default: "Learn More",
    },
    ctaUrl: {
      type: String,
      required: true,
      trim: true,
      default: "/search",
    },
    serviceTags: {
      type: [String],
      default: [],
    },
    locationTags: {
      type: [String],
      default: [],
    },
    sortOrder: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: SEARCH_ADVERTISEMENT_STATUSES,
      default: "active",
      required: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    createdByUserId: {
      type: String,
      required: true,
      trim: true,
    },
    updatedByUserId: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

searchAdvertisementSchema.index({ status: 1, sortOrder: 1, createdAt: -1 });
searchAdvertisementSchema.index({ serviceTags: 1 });
searchAdvertisementSchema.index({ locationTags: 1 });

export const SearchAdvertisementModel = model<SearchAdvertisement>(
  "SearchAdvertisement",
  searchAdvertisementSchema,
);
