import { Schema, model, type HydratedDocument } from "mongoose";

export interface UserSettingsRecord {
  userId: string;
  theme: "light" | "system";
  language: string;
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  bookingAlerts: boolean;
  messageAlerts: boolean;
  reviewAlerts: boolean;
  profileVisible: boolean;
  showEmail: boolean;
  showPhoneNumber: boolean;
  allowDirectMessages: boolean;
  instantBooking: boolean;
  moderationAlerts: boolean;
  systemAlerts: boolean;
  favoriteAlerts: boolean;
  digestFrequency: "instant" | "daily" | "weekly";
  createdAt: Date;
  updatedAt: Date;
}

export type UserSettingsDocument = HydratedDocument<UserSettingsRecord>;

const userSettingsSchema = new Schema<UserSettingsRecord>(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    theme: {
      type: String,
      enum: ["light", "system"],
      default: "light",
    },
    language: {
      type: String,
      default: "en-IN",
      trim: true,
    },
    timezone: {
      type: String,
      default: "Asia/Kolkata",
      trim: true,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    smsNotifications: {
      type: Boolean,
      default: false,
    },
    pushNotifications: {
      type: Boolean,
      default: true,
    },
    marketingEmails: {
      type: Boolean,
      default: false,
    },
    bookingAlerts: {
      type: Boolean,
      default: true,
    },
    messageAlerts: {
      type: Boolean,
      default: true,
    },
    reviewAlerts: {
      type: Boolean,
      default: true,
    },
    profileVisible: {
      type: Boolean,
      default: true,
    },
    showEmail: {
      type: Boolean,
      default: false,
    },
    showPhoneNumber: {
      type: Boolean,
      default: false,
    },
    allowDirectMessages: {
      type: Boolean,
      default: true,
    },
    instantBooking: {
      type: Boolean,
      default: false,
    },
    moderationAlerts: {
      type: Boolean,
      default: true,
    },
    systemAlerts: {
      type: Boolean,
      default: true,
    },
    favoriteAlerts: {
      type: Boolean,
      default: true,
    },
    digestFrequency: {
      type: String,
      enum: ["instant", "daily", "weekly"],
      default: "instant",
    },
  },
  {
    timestamps: true,
  },
);

export const UserSettingsModel = model<UserSettingsRecord>("UserSettings", userSettingsSchema);
