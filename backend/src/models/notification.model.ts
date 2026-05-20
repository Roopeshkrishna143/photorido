import { Schema, model, type HydratedDocument } from "mongoose";
import { USER_ROLES, type UserRole } from "./user.model.js";

export interface MarketplaceNotification {
  recipientUserId: string;
  role: UserRole;
  message: string;
  targetPath?: string | null;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type MarketplaceNotificationDocument = HydratedDocument<MarketplaceNotification>;

const marketplaceNotificationSchema = new Schema<MarketplaceNotification>(
  {
    recipientUserId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    targetPath: {
      type: String,
      trim: true,
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const MarketplaceNotificationModel = model<MarketplaceNotification>(
  "MarketplaceNotification",
  marketplaceNotificationSchema,
);
