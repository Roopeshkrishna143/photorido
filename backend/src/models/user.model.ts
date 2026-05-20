import { Schema, model, type HydratedDocument } from "mongoose";

export const USER_ROLES = [
  "super-admin",
  "admin",
  "vendor",
  "user",
  "staff",
  "vendor_verification_officer",
  "booking_coordinator",
  "support_executive",
  "content_moderator",
  "finance_manager",
  "marketing_manager",
] as const;
export type UserRole = (typeof USER_ROLES)[number];
export const USER_ACCOUNT_STATUSES = ["active", "invited", "disabled"] as const;
export type UserAccountStatus = (typeof USER_ACCOUNT_STATUSES)[number];

export interface User {
  name: string;
  email: string;
  passwordHash: string;
  googleId?: string;
  role: UserRole;
  status: UserAccountStatus;
  location?: string;
  avatar?: string;
  phoneNumber?: string;
  profileComplete: boolean;
  isSeeded: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<User>;

const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    googleId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
    },
    status: {
      type: String,
      enum: USER_ACCOUNT_STATUSES,
      required: true,
      default: "active",
      index: true,
    },
    location: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    profileComplete: {
      type: Boolean,
      default: false,
    },
    isSeeded: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel = model<User>("User", userSchema);
