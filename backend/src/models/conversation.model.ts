import { Schema, model, type HydratedDocument } from "mongoose";

export interface MarketplaceConversationRecord {
  userId: string;
  vendorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MarketplaceConversationDocument = HydratedDocument<MarketplaceConversationRecord>;

const marketplaceConversationSchema = new Schema<MarketplaceConversationRecord>(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    vendorId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

marketplaceConversationSchema.index({ userId: 1, vendorId: 1 }, { unique: true });
marketplaceConversationSchema.index({ updatedAt: -1 });

export const MarketplaceConversationModel = model<MarketplaceConversationRecord>(
  "MarketplaceConversation",
  marketplaceConversationSchema,
);
