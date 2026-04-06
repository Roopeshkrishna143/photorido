import { Schema, model, type HydratedDocument } from "mongoose";

export interface MarketplaceMessageRecord {
  conversationId: string;
  senderId: string;
  receiverId: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type MarketplaceMessageDocument = HydratedDocument<MarketplaceMessageRecord>;

const marketplaceMessageSchema = new Schema<MarketplaceMessageRecord>(
  {
    conversationId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    receiverId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

marketplaceMessageSchema.index({ conversationId: 1, createdAt: 1 });
marketplaceMessageSchema.index({ receiverId: 1, isRead: 1, createdAt: -1 });

export const MarketplaceMessageModel = model<MarketplaceMessageRecord>(
  "MarketplaceMessage",
  marketplaceMessageSchema,
);
