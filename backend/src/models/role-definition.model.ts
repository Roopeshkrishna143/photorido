import { Schema, model, type HydratedDocument } from "mongoose";
import { USER_ROLES, type UserRole } from "./user.model.js";

export const ROLE_SCOPES = ["platform", "operations", "marketplace"] as const;
export type RoleScope = (typeof ROLE_SCOPES)[number];

export const ROLE_STATUSES = ["active", "draft"] as const;
export type RoleStatus = (typeof ROLE_STATUSES)[number];

export interface MarketplaceRoleDefinitionRecord {
  name: string;
  scope: RoleScope;
  status: RoleStatus;
  permissionIds: string[];
  isProtected: boolean;
  systemRole?: UserRole | null;
  createdAt: Date;
  updatedAt: Date;
}

export type MarketplaceRoleDefinitionDocument = HydratedDocument<MarketplaceRoleDefinitionRecord>;

const marketplaceRoleDefinitionSchema = new Schema<MarketplaceRoleDefinitionRecord>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    scope: {
      type: String,
      enum: ROLE_SCOPES,
      default: "platform",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ROLE_STATUSES,
      default: "active",
      required: true,
      index: true,
    },
    permissionIds: {
      type: [String],
      default: [],
    },
    isProtected: {
      type: Boolean,
      default: false,
    },
    systemRole: {
      type: String,
      enum: [...USER_ROLES, null],
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

marketplaceRoleDefinitionSchema.index(
  { systemRole: 1 },
  { unique: true, partialFilterExpression: { systemRole: { $type: "string" } } },
);

export const MarketplaceRoleDefinitionModel = model<MarketplaceRoleDefinitionRecord>(
  "MarketplaceRoleDefinition",
  marketplaceRoleDefinitionSchema,
);
