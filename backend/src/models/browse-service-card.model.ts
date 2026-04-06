import { Schema, model, type HydratedDocument } from "mongoose";

export const BROWSE_SERVICE_CARD_STATUSES = ["active", "inactive"] as const;
export type BrowseServiceCardStatus = (typeof BROWSE_SERVICE_CARD_STATUSES)[number];

export interface BrowseServiceCard {
  name: string;
  description: string;
  badgeText: string;
  sortOrder: number;
  status: BrowseServiceCardStatus;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BrowseServiceCardDocument = HydratedDocument<BrowseServiceCard>;

const browseServiceCardSchema = new Schema<BrowseServiceCard>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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
    },
    sortOrder: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: BROWSE_SERVICE_CARD_STATUSES,
      default: "active",
      required: true,
    },
    createdByUserId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

browseServiceCardSchema.index({ status: 1, sortOrder: 1, name: 1 });

export const BrowseServiceCardModel = model<BrowseServiceCard>("BrowseServiceCard", browseServiceCardSchema);
