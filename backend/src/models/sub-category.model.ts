import { Schema, model, type HydratedDocument } from "mongoose";

export const SUB_CATEGORY_STATUSES = ["active", "inactive"] as const;
export type SubCategoryStatus = (typeof SUB_CATEGORY_STATUSES)[number];

export interface SubCategory {
  categoryId: string;
  name: string;
  status: SubCategoryStatus;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SubCategoryDocument = HydratedDocument<SubCategory>;

const subCategorySchema = new Schema<SubCategory>(
  {
    categoryId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: SUB_CATEGORY_STATUSES,
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

subCategorySchema.index({ categoryId: 1, name: 1 }, { unique: true });

export const SubCategoryModel = model<SubCategory>("SubCategory", subCategorySchema);
