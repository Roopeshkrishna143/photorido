import { Schema, model, type HydratedDocument } from "mongoose";

export interface FavoriteRecord {
  userId: string;
  photographerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type FavoriteDocument = HydratedDocument<FavoriteRecord>;

const favoriteSchema = new Schema<FavoriteRecord>(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    photographerId: {
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

favoriteSchema.index({ userId: 1, photographerId: 1 }, { unique: true });
favoriteSchema.index({ userId: 1, createdAt: -1 });

export const FavoriteModel = model<FavoriteRecord>("Favorite", favoriteSchema);
