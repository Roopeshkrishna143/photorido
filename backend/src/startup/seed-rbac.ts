import { MarketplacePermissionModel } from "../models/permission.model.js";
import { MarketplaceRoleDefinitionModel } from "../models/role-definition.model.js";
import type { UserRole } from "../models/user.model.js";

const DEFAULT_PERMISSIONS = [
  {
    name: "view_dashboard",
    module: "dashboard",
    audience: "super-admin",
    description: "View the super admin dashboard and activity insights.",
    status: "active",
    isProtected: true,
  },
  {
    name: "manage_bookings",
    module: "bookings",
    audience: "super-admin",
    description: "Create, update, view, and delete vendor-user bookings.",
    status: "active",
    isProtected: true,
  },
  {
    name: "manage_users",
    module: "users",
    audience: "super-admin",
    description: "Create, update, disable, and remove platform users.",
    status: "active",
    isProtected: true,
  },
  {
    name: "manage_reviews",
    module: "reviews",
    audience: "super-admin",
    description: "View and moderate reviews and ratings.",
    status: "active",
    isProtected: true,
  },
  {
    name: "manage_permissions",
    module: "permissions",
    audience: "super-admin",
    description: "Create and manage platform permissions.",
    status: "active",
    isProtected: true,
  },
  {
    name: "manage_roles",
    module: "roles",
    audience: "super-admin",
    description: "Create and manage platform roles.",
    status: "active",
    isProtected: true,
  },
  {
    name: "manage_categories",
    module: "categories",
    audience: "super-admin",
    description: "Manage service categories.",
    status: "active",
    isProtected: true,
  },
  {
    name: "manage_sub_categories",
    module: "sub-categories",
    audience: "super-admin",
    description: "Manage service sub-categories.",
    status: "active",
    isProtected: true,
  },
  {
    name: "moderate_profiles",
    module: "profiles",
    audience: "super-admin",
    description: "Approve or reject vendor profiles.",
    status: "active",
    isProtected: true,
  },
  {
    name: "manage_vendor_bookings",
    module: "bookings",
    audience: "vendor",
    description: "Approve, reject, and complete booking flows as a vendor.",
    status: "active",
    isProtected: true,
  },
  {
    name: "manage_vendor_schedules",
    module: "schedules",
    audience: "vendor",
    description: "Manage vendor availability schedules.",
    status: "active",
    isProtected: true,
  },
  {
    name: "manage_vendor_profiles",
    module: "profiles",
    audience: "vendor",
    description: "Create and maintain vendor marketplace profiles.",
    status: "active",
    isProtected: true,
  },
  {
    name: "create_booking",
    module: "bookings",
    audience: "user",
    description: "Create and follow booking requests.",
    status: "active",
    isProtected: true,
  },
  {
    name: "create_review",
    module: "reviews",
    audience: "user",
    description: "Submit reviews after a completed booking.",
    status: "active",
    isProtected: true,
  },
  {
    name: "message_vendors",
    module: "messages",
    audience: "user",
    description: "Start and participate in direct vendor conversations.",
    status: "active",
    isProtected: true,
  },
] as const;

const DEFAULT_ROLES: Array<{
  name: string;
  scope: "platform" | "operations" | "marketplace";
  status: "active" | "draft";
  systemRole: UserRole;
  permissionNames: string[];
}> = [
  {
    name: "Super Admin",
    scope: "platform",
    status: "active",
    systemRole: "super-admin",
    permissionNames: DEFAULT_PERMISSIONS
      .filter((permission) => permission.audience === "super-admin")
      .map((permission) => permission.name),
  },
  {
    name: "Vendor",
    scope: "marketplace",
    status: "active",
    systemRole: "vendor",
    permissionNames: DEFAULT_PERMISSIONS
      .filter((permission) => permission.audience === "vendor")
      .map((permission) => permission.name),
  },
  {
    name: "User",
    scope: "marketplace",
    status: "active",
    systemRole: "user",
    permissionNames: DEFAULT_PERMISSIONS
      .filter((permission) => permission.audience === "user")
      .map((permission) => permission.name),
  },
];

export async function seedRbac() {
  const permissionIdByName = new Map<string, string>();

  for (const permission of DEFAULT_PERMISSIONS) {
    const record = await MarketplacePermissionModel.findOneAndUpdate(
      { name: permission.name },
      {
        $set: {
          module: permission.module,
          audience: permission.audience,
          description: permission.description,
          status: permission.status,
          isProtected: permission.isProtected,
        },
        $setOnInsert: {
          name: permission.name,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    permissionIdByName.set(permission.name, record.id);
  }

  for (const role of DEFAULT_ROLES) {
    const permissionIds = role.permissionNames
      .map((permissionName) => permissionIdByName.get(permissionName))
      .filter((value): value is string => Boolean(value));

    await MarketplaceRoleDefinitionModel.findOneAndUpdate(
      { systemRole: role.systemRole },
      {
        $set: {
          name: role.name,
          scope: role.scope,
          status: role.status,
          permissionIds,
          isProtected: true,
          systemRole: role.systemRole,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );
  }
}
