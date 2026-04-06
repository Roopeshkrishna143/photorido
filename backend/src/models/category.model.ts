import { Schema, model, type HydratedDocument } from "mongoose";

export const CATEGORY_STATUSES = ["active", "inactive"] as const;
export type CategoryStatus = (typeof CATEGORY_STATUSES)[number];

export interface Category {
  name: string;
  status: CategoryStatus;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryDocument = HydratedDocument<Category>;

const categorySchema = new Schema<Category>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    status: {
      type: String,
      enum: CATEGORY_STATUSES,
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

categorySchema.index({ name: 1 }, { unique: true });

export const CategoryModel = model<Category>("Category", categorySchema);
