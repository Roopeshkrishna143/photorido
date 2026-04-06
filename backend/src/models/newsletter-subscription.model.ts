import { Schema, model, type HydratedDocument } from "mongoose";

export const NEWSLETTER_SUBSCRIPTION_STATUSES = ["active", "unsubscribed"] as const;
export type NewsletterSubscriptionStatus = (typeof NEWSLETTER_SUBSCRIPTION_STATUSES)[number];

export interface NewsletterSubscriptionRecord {
  email: string;
  source: string;
  status: NewsletterSubscriptionStatus;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type NewsletterSubscriptionDocument = HydratedDocument<NewsletterSubscriptionRecord>;

const newsletterSubscriptionSchema = new Schema<NewsletterSubscriptionRecord>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    source: {
      type: String,
      default: "footer-newsletter",
      trim: true,
    },
    status: {
      type: String,
      enum: NEWSLETTER_SUBSCRIPTION_STATUSES,
      default: "active",
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

newsletterSubscriptionSchema.index({ createdAt: -1, status: 1 });

export const NewsletterSubscriptionModel = model<NewsletterSubscriptionRecord>(
  "NewsletterSubscription",
  newsletterSubscriptionSchema,
);
