import { Schema, model, type HydratedDocument } from "mongoose";

export const REGISTRATION_OTP_IDENTIFIER_TYPES = ["email", "mobile"] as const;
export type RegistrationOtpIdentifierType = (typeof REGISTRATION_OTP_IDENTIFIER_TYPES)[number];

export const REGISTRATION_OTP_ROLES = ["vendor", "user"] as const;
export type RegistrationOtpRole = (typeof REGISTRATION_OTP_ROLES)[number];

export interface RegistrationOtpRecord {
  name: string;
  identifier: string;
  identifierType: RegistrationOtpIdentifierType;
  role: RegistrationOtpRole;
  passwordHash: string;
  otpHash: string;
  attempts: number;
  expiresAt: Date;
  lastSentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type RegistrationOtpDocument = HydratedDocument<RegistrationOtpRecord>;

const registrationOtpSchema = new Schema<RegistrationOtpRecord>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    identifier: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    identifierType: {
      type: String,
      enum: REGISTRATION_OTP_IDENTIFIER_TYPES,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: REGISTRATION_OTP_ROLES,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    lastSentAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

registrationOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RegistrationOtpModel = model<RegistrationOtpRecord>(
  "RegistrationOtp",
  registrationOtpSchema,
);
