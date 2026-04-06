import { Schema, model, type HydratedDocument } from "mongoose";

export const VENDOR_SCHEDULE_TYPES = ["full", "morning", "afternoon"] as const;
export type VendorScheduleType = (typeof VENDOR_SCHEDULE_TYPES)[number];

export interface VendorSchedule {
  vendorId: string;
  date: string;
  type: VendorScheduleType;
  label: string;
  timeRange: string;
  createdAt: Date;
  updatedAt: Date;
}

export type VendorScheduleDocument = HydratedDocument<VendorSchedule>;

const vendorScheduleSchema = new Schema<VendorSchedule>(
  {
    vendorId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: VENDOR_SCHEDULE_TYPES,
      required: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    timeRange: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

vendorScheduleSchema.index({ vendorId: 1, date: 1, type: 1 }, { unique: true });

export const VendorScheduleModel = model<VendorSchedule>("VendorSchedule", vendorScheduleSchema);
