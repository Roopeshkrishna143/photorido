import { Schema, model, type HydratedDocument } from "mongoose";

export const SEARCH_ADVERTISEMENT_STATUSES = ["active", "inactive"] as const;
export type SearchAdvertisementStatus = (typeof SEARCH_ADVERTISEMENT_STATUSES)[number];

export const SEARCH_ADVERTISEMENT_PLACEMENTS = ["search-results"] as const;
export type SearchAdvertisementPlacement = (typeof SEARCH_ADVERTISEMENT_PLACEMENTS)[number];

export interface SearchAdvertisement {
  title: string;
  description: string;
  imageUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  locationLabel: string;
  placement: SearchAdvertisementPlacement;
  sortOrder: number;
  status: SearchAdvertisementStatus;
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
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    ctaLabel: {
      type: String,
      trim: true,
      default: "Learn more",
    },
    ctaUrl: {
      type: String,
      trim: true,
      default: "",
    },
    locationLabel: {
      type: String,
      trim: true,
      default: "",
    },
    placement: {
      type: String,
      enum: SEARCH_ADVERTISEMENT_PLACEMENTS,
      default: "search-results",
      required: true,
      index: true,
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
      index: true,
    },
    createdByUserId: {
      type: String,
      required: true,
      trim: true,
    },
    updatedByUserId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

searchAdvertisementSchema.index({ placement: 1, status: 1, sortOrder: 1, title: 1 });

export const SearchAdvertisementModel = model<SearchAdvertisement>("SearchAdvertisement", searchAdvertisementSchema);
