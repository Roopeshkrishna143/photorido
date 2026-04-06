import { Schema, model, type HydratedDocument } from "mongoose";
import { USER_ROLES, type UserRole } from "./user.model.js";

export const PERMISSION_STATUSES = ["active", "draft"] as const;
export type PermissionStatus = (typeof PERMISSION_STATUSES)[number];

export interface MarketplacePermissionRecord {
  name: string;
  module: string;
  audience: UserRole;
  description: string;
  status: PermissionStatus;
  isProtected: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type MarketplacePermissionDocument = HydratedDocument<MarketplacePermissionRecord>;

const marketplacePermissionSchema = new Schema<MarketplacePermissionRecord>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    module: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    audience: {
      type: String,
      enum: USER_ROLES,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: PERMISSION_STATUSES,
      default: "active",
      required: true,
      index: true,
    },
    isProtected: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const MarketplacePermissionModel = model<MarketplacePermissionRecord>(
  "MarketplacePermission",
  marketplacePermissionSchema,
);
