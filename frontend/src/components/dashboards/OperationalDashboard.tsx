import { useEffect, useMemo, useState, type ElementType, type ReactNode } from "react";
import { useSearchParams } from "react-router";
import {
  BookOpen,
  ClipboardCheck,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { useAuth, type UserRole } from "../../context/AuthContext";
import { useMarketplace } from "../../context/MarketplaceContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { DashboardSidebar } from "./DashboardSidebar";
import { SettingsPage } from "./SettingsPage";

type OperationalTab = "dashboard" | "verification" | "operations" | "support" | "moderation" | "finance" | "marketing";

const ROLE_DEFAULT_TAB: Record<Exclude<UserRole, null>, OperationalTab> = {
  "super-admin": "dashboard",
  admin: "dashboard",
  vendor: "dashboard",
  user: "dashboard",
  staff: "dashboard",
  vendor_verification_officer: "verification",
  booking_coordinator: "operations",
  support_executive: "support",
  content_moderator: "moderation",
  finance_manager: "finance",
  marketing_manager: "marketing",
};

const ROLE_LABELS: Record<Exclude<UserRole, null>, string> = {
  "super-admin": "Super Admin",
  admin: "Admin",
  vendor: "Professional",
  user: "User",
  staff: "Staff",
  vendor_verification_officer: "Vendor Verification Officer",
  booking_coordinator: "Booking Coordinator",
  support_executive: "Support Executive",
  content_moderator: "Content Moderator",
  finance_manager: "Finance Manager",
  marketing_manager: "Marketing Manager",
};

const TAB_META: Record<OperationalTab, { title: string; description: string; icon: ElementType; badge: string }> = {
  dashboard: {
    title: "Operations Dashboard",
    description: "A shared workspace for internal staff roles, queues, escalations, and cross-team handoffs.",
    icon: LayoutDashboard,
    badge: "Operations",
  },
  verification: {
    title: "Verification Dashboard",
    description: "Review vendor onboarding, document requests, verification decisions, and suspended onboarding cases.",
    icon: ShieldCheck,
    badge: "Verification",
  },
  operations: {
    title: "Booking Operations",
    description: "Coordinate active bookings, reschedules, status changes, booking escalations, and customer-vendor contact.",
    icon: BookOpen,
    badge: "Bookings",
  },
  support: {
    title: "Support Dashboard",
    description: "Track limited user/vendor support context, ticket status changes, resets, and escalation workflows.",
    icon: MessageSquare,
    badge: "Support",
  },
  moderation: {
    title: "Moderation Dashboard",
    description: "Moderate reviews, uploaded media, hidden content, removals, warnings, and ban escalation requests.",
    icon: ClipboardCheck,
    badge: "Moderation",
  },
  finance: {
    title: "Finance Dashboard",
    description: "Monitor transaction review, refunds, vendor payouts, finance reports, and frozen transaction queues.",
    icon: Scale,
    badge: "Finance",
  },
  marketing: {
    title: "Marketing Dashboard",
    description: "Manage search ads, homepage banners, featured listings, campaigns, and newsletter operations.",
    icon: Megaphone,
    badge: "Marketing",
  },
};

function MetricCard({ label, value, helper }: { label: string; value: number; helper: string }) {
  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className="pt-5">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        <p className="mt-1 text-xs text-gray-400">{helper}</p>
      </CardContent>
    </Card>
  );
}

function PlaceholderQueue({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="border border-dashed border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-6 text-gray-500">{children}</CardContent>
    </Card>
  );
}

function OperationalContent({ activeKey }: { activeKey: string }) {
  const { user } = useAuth();
  const { bookings, listings, platformUsers, reviews, searchAdvertisements } = useMarketplace();
  const tab = activeKey in TAB_META ? activeKey as OperationalTab : ROLE_DEFAULT_TAB[user?.role ?? "staff"];
  const meta = TAB_META[tab];
  const Icon = meta.icon;
  const pendingListings = listings.filter((listing) => listing.status === "pending").length;
  const activeBookings = bookings.filter((booking) => booking.status !== "completed" && booking.status !== "cancelled").length;
  const supportAccounts = platformUsers.filter((account) => account.status !== "disabled").length;

  const focusItems = useMemo(() => {
    if (tab === "verification") {
      return ["Verify vendor", "Reject vendor", "Request documents", "Suspend onboarding", "Change verification status"];
    }
    if (tab === "operations") {
      return ["View active bookings", "Reassign booking status", "Reschedule booking", "Escalate booking issue", "Contact customer/vendor"];
    }
    if (tab === "support") {
      return ["View limited users", "View limited vendors", "View support tickets", "Update support status", "Trigger password reset"];
    }
    if (tab === "moderation") {
      return ["Moderate reviews", "Moderate uploaded media", "Hide content", "Remove content", "Warn accounts"];
    }
    if (tab === "finance") {
      return ["View transactions", "Approve refunds", "Release vendor payouts", "Generate reports", "Freeze transactions"];
    }
    if (tab === "marketing") {
      return ["Manage search ads", "Manage homepage banners", "Manage featured listings", "Manage campaigns", "Manage newsletters"];
    }
    return ["Operational overview", "Team queue visibility", "Escalation tracking", "Role-based access", "Settings"];
  }, [tab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{meta.title}</h1>
              <p className="mt-1 text-sm text-gray-500">{meta.description}</p>
            </div>
          </div>
        </div>
        <Badge variant="secondary" className="w-fit border-0 bg-blue-100 text-blue-700">
          {ROLE_LABELS[user?.role ?? "staff"]} / {meta.badge}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Active Bookings" value={activeBookings} helper="Visible booking records for this role" />
        <MetricCard label="Pending Profiles" value={pendingListings} helper="Vendor profiles awaiting decisions" />
        <MetricCard label="Accounts" value={supportAccounts} helper="Visible active and invited users" />
        <MetricCard label="Reviews" value={reviews.length} helper="Review records available to moderate" />
        <MetricCard label="Campaigns" value={searchAdvertisements.length} helper="Search ad placements available" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_0.85fr]">
        <PlaceholderQueue title={`${meta.badge} Queue`}>
          This placeholder is ready for the real workflow screens. It is already role-aware, uses the centralized login
          session, and can receive live data from the existing marketplace context as each operational module is built.
        </PlaceholderQueue>
        <PlaceholderQueue title="Permission Scope">
          <div className="flex flex-wrap gap-2">
            {focusItems.map((item) => (
              <span key={item} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
                {item}
              </span>
            ))}
          </div>
        </PlaceholderQueue>
      </div>
    </div>
  );
}

export function OperationalDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeKey, setActiveKey] = useState("dashboard");

  useEffect(() => {
    const defaultTab = ROLE_DEFAULT_TAB[user?.role ?? "staff"];
    setActiveKey(searchParams.get("tab") ?? defaultTab);
  }, [searchParams, user?.role]);

  const handleNavigate = (key: string) => {
    setActiveKey(key);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);

      if (key === ROLE_DEFAULT_TAB[user?.role ?? "staff"]) {
        next.delete("tab");
      } else {
        next.set("tab", key);
      }

      return next;
    }, { replace: true });
  };

  const content = activeKey === "settings" ? <SettingsPage /> : <OperationalContent activeKey={activeKey} />;

  return (
    <div className="flex h-screen min-w-0 overflow-x-clip overflow-y-hidden bg-gray-50">
      <DashboardSidebar activeKey={activeKey} onNavigate={handleNavigate} />
      <main className="min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
        {content}
      </main>
    </div>
  );
}
