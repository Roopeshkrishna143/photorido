import { MarketplacePermissionModel } from "../models/permission.model.js";
import { MarketplaceRoleDefinitionModel } from "../models/role-definition.model.js";
import type { UserRole } from "../models/user.model.js";

type SeedPermission = {
  name: string;
  module: string;
  audience: UserRole;
  description: string;
  status: "active";
  isProtected: true;
};

const protectedPermission = (
  name: string,
  module: string,
  audience: UserRole,
  description: string,
): SeedPermission => ({
  name,
  module,
  audience,
  description,
  status: "active",
  isProtected: true,
});

const DEFAULT_PERMISSIONS = [
  protectedPermission("view_dashboard", "dashboard", "super-admin", "View the super admin dashboard and activity insights."),
  protectedPermission("manage_bookings", "bookings", "super-admin", "Create, update, view, and delete vendor-user bookings."),
  protectedPermission("manage_users", "users", "super-admin", "Create, update, disable, and remove platform users."),
  protectedPermission("manage_reviews", "reviews", "super-admin", "View and moderate reviews and ratings."),
  protectedPermission("manage_permissions", "permissions", "super-admin", "Create and manage platform permissions."),
  protectedPermission("manage_roles", "roles", "super-admin", "Create and manage platform roles."),
  protectedPermission("manage_categories", "categories", "super-admin", "Manage service categories."),
  protectedPermission("manage_sub_categories", "sub-categories", "super-admin", "Manage service sub-categories."),
  protectedPermission("manage_browse_services", "browse-services", "super-admin", "Manage the Browse by Service cards shown on the home page."),
  protectedPermission("moderate_profiles", "profiles", "super-admin", "Approve or reject vendor profiles."),

  protectedPermission("manage_vendor_bookings", "bookings", "vendor", "Approve, reject, and complete booking flows as a vendor."),
  protectedPermission("manage_vendor_schedules", "schedules", "vendor", "Manage vendor availability schedules."),
  protectedPermission("manage_vendor_profiles", "profiles", "vendor", "Create and maintain vendor marketplace profiles."),

  protectedPermission("create_booking", "bookings", "user", "Create and follow booking requests."),
  protectedPermission("create_review", "reviews", "user", "Submit reviews after a completed booking."),
  protectedPermission("message_vendors", "messages", "user", "Start and participate in direct vendor conversations."),

  protectedPermission("view_operations_dashboard", "dashboard", "staff", "View shared operational dashboard placeholders and queues."),

  protectedPermission("verify_vendor", "vendor-verification", "vendor_verification_officer", "Approve vendor verification after document review."),
  protectedPermission("reject_vendor", "vendor-verification", "vendor_verification_officer", "Reject vendor verification during onboarding."),
  protectedPermission("request_vendor_documents", "vendor-verification", "vendor_verification_officer", "Request missing vendor onboarding documents."),
  protectedPermission("suspend_onboarding", "vendor-verification", "vendor_verification_officer", "Pause vendor onboarding while checks are pending."),
  protectedPermission("change_verification_status", "vendor-verification", "vendor_verification_officer", "Change vendor verification workflow status."),

  protectedPermission("view_active_bookings", "bookings", "booking_coordinator", "View active booking queues across customers and vendors."),
  protectedPermission("reassign_booking_status", "bookings", "booking_coordinator", "Move bookings between operational statuses."),
  protectedPermission("reschedule_booking", "bookings", "booking_coordinator", "Coordinate booking date or time changes."),
  protectedPermission("escalate_booking_issue", "bookings", "booking_coordinator", "Escalate booking issues to senior operations."),
  protectedPermission("contact_customer_vendor", "bookings", "booking_coordinator", "Contact customers and vendors about booking changes."),

  protectedPermission("view_users_limited", "support", "support_executive", "View limited customer account details for support."),
  protectedPermission("view_vendors_limited", "support", "support_executive", "View limited vendor account details for support."),
  protectedPermission("view_support_tickets", "support", "support_executive", "View support ticket queues."),
  protectedPermission("update_support_status", "support", "support_executive", "Update support ticket status."),
  protectedPermission("trigger_password_reset", "support", "support_executive", "Trigger account password reset workflows."),
  protectedPermission("escalate_support_issue", "support", "support_executive", "Escalate unresolved support issues."),

  protectedPermission("moderate_reviews", "content-moderation", "content_moderator", "Moderate marketplace reviews."),
  protectedPermission("moderate_uploaded_media", "content-moderation", "content_moderator", "Moderate uploaded portfolio and profile media."),
  protectedPermission("hide_content", "content-moderation", "content_moderator", "Hide content pending review."),
  protectedPermission("remove_content", "content-moderation", "content_moderator", "Remove content that violates platform rules."),
  protectedPermission("warn_accounts", "content-moderation", "content_moderator", "Warn accounts about content policy violations."),
  protectedPermission("escalate_ban_requests", "content-moderation", "content_moderator", "Escalate ban requests to administrators."),

  protectedPermission("view_transactions", "finance", "finance_manager", "View marketplace transaction records."),
  protectedPermission("approve_refunds", "finance", "finance_manager", "Approve customer refund requests."),
  protectedPermission("release_vendor_payouts", "finance", "finance_manager", "Release vendor payout batches."),
  protectedPermission("generate_finance_reports", "finance", "finance_manager", "Generate finance and reconciliation reports."),
  protectedPermission("freeze_transactions", "finance", "finance_manager", "Freeze suspicious transactions for review."),

  protectedPermission("manage_search_advertisements", "marketing", "marketing_manager", "Manage sponsored search placements."),
  protectedPermission("manage_homepage_banners", "marketing", "marketing_manager", "Manage homepage banner campaigns."),
  protectedPermission("manage_featured_listings", "marketing", "marketing_manager", "Manage featured vendor listings."),
  protectedPermission("manage_campaigns", "marketing", "marketing_manager", "Manage marketing campaigns."),
  protectedPermission("manage_newsletters", "marketing", "marketing_manager", "Manage newsletter campaigns and lists."),
] as const satisfies readonly SeedPermission[];

const permissionNamesForAudience = (...audiences: UserRole[]) =>
  DEFAULT_PERMISSIONS
    .filter((permission) => audiences.includes(permission.audience))
    .map((permission) => permission.name);

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
    permissionNames: DEFAULT_PERMISSIONS.map((permission) => permission.name),
  },
  {
    name: "Admin",
    scope: "platform",
    status: "active",
    systemRole: "admin",
    permissionNames: [
      "view_dashboard",
      "manage_bookings",
      "manage_users",
      "manage_reviews",
      "manage_categories",
      "manage_sub_categories",
      "manage_browse_services",
      "moderate_profiles",
      "manage_search_advertisements",
      "manage_homepage_banners",
      "manage_featured_listings",
      "manage_campaigns",
      "manage_newsletters",
    ],
  },
  {
    name: "Vendor",
    scope: "marketplace",
    status: "active",
    systemRole: "vendor",
    permissionNames: permissionNamesForAudience("vendor"),
  },
  {
    name: "User",
    scope: "marketplace",
    status: "active",
    systemRole: "user",
    permissionNames: permissionNamesForAudience("user"),
  },
  {
    name: "Staff",
    scope: "operations",
    status: "active",
    systemRole: "staff",
    permissionNames: [
      "view_operations_dashboard",
      "view_users_limited",
      "view_vendors_limited",
      "view_support_tickets",
      "update_support_status",
      "escalate_support_issue",
    ],
  },
  {
    name: "Vendor Verification Officer",
    scope: "operations",
    status: "active",
    systemRole: "vendor_verification_officer",
    permissionNames: permissionNamesForAudience("vendor_verification_officer"),
  },
  {
    name: "Booking Coordinator",
    scope: "operations",
    status: "active",
    systemRole: "booking_coordinator",
    permissionNames: permissionNamesForAudience("booking_coordinator"),
  },
  {
    name: "Support Executive",
    scope: "operations",
    status: "active",
    systemRole: "support_executive",
    permissionNames: permissionNamesForAudience("support_executive"),
  },
  {
    name: "Content Moderator",
    scope: "operations",
    status: "active",
    systemRole: "content_moderator",
    permissionNames: permissionNamesForAudience("content_moderator"),
  },
  {
    name: "Finance Manager",
    scope: "operations",
    status: "active",
    systemRole: "finance_manager",
    permissionNames: permissionNamesForAudience("finance_manager"),
  },
  {
    name: "Marketing Manager",
    scope: "operations",
    status: "active",
    systemRole: "marketing_manager",
    permissionNames: permissionNamesForAudience("marketing_manager"),
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
