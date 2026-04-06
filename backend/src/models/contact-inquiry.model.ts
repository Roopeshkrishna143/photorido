import { Schema, model, type HydratedDocument } from "mongoose";

export const CONTACT_INQUIRY_STATUSES = ["new", "in-progress", "resolved", "archived"] as const;
export type ContactInquiryStatus = (typeof CONTACT_INQUIRY_STATUSES)[number];

export interface ContactInquiryRecord {
  name: string;
  email: string;
  subject: string;
  message: string;
  source: string;
  status: ContactInquiryStatus;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ContactInquiryDocument = HydratedDocument<ContactInquiryRecord>;

const contactInquirySchema = new Schema<ContactInquiryRecord>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      default: "contact-page",
      trim: true,
    },
    status: {
      type: String,
      enum: CONTACT_INQUIRY_STATUSES,
      default: "new",
      index: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

contactInquirySchema.index({ createdAt: -1, status: 1 });

export const ContactInquiryModel = model<ContactInquiryRecord>(
  "ContactInquiry",
  contactInquirySchema,
);
