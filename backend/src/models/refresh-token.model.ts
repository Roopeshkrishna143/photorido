import { Schema, model, type HydratedDocument } from "mongoose";

export interface RefreshTokenRecord {
  userId: string;
  tokenId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  replacedByTokenId?: string | null;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RefreshTokenDocument = HydratedDocument<RefreshTokenRecord>;

const refreshTokenSchema = new Schema<RefreshTokenRecord>(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    tokenId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
      index: true,
    },
    replacedByTokenId: {
      type: String,
      trim: true,
      default: null,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ userId: 1, createdAt: -1 });

export const RefreshTokenModel = model<RefreshTokenRecord>(
  "RefreshToken",
  refreshTokenSchema,
);
