import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { DashboardSidebar } from "./DashboardSidebar";
import {
  BookingStatus,
  ListingStatus,
  ManagedUserRole,
  MarketplaceBrowseServiceCard,
  MarketplaceCategory,
  MarketplaceReview,
  MarketplacePermission,
  MarketplacePlatformUser,
  MarketplaceRoleDefinition,
  MarketplaceSubCategory,
  useMarketplace,
} from "../../context/MarketplaceContext";
import {
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  LayoutDashboard,
  Pencil,
  Plus,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { SettingsPage } from "./SettingsPage";
import { Input } from "../ui/input";
import { api, unwrapPayload } from "../../lib/api";
import { getServiceCategoryVisual } from "../../lib/public-marketplace";
import { formatDisplayDate, formatDisplayDateTime } from "../../lib/date";
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from "../../lib/alerts";

const FIELD_CLASS =
  "w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all";

function parseAmount(amount: string) {
  return Number(amount.replace(/[^0-9.]/g, ""));
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function bookingStatusLabel(status: BookingStatus) {
  if (status === "approved_by_vendor") return "Vendor Approved";
  if (status === "confirmed") return "Confirmed";
  if (status === "rejected_by_vendor") return "Rejected";
  if (status === "completed") return "Completed";
  if (status === "cancelled") return "Cancelled";
  return "Pending";
}

function bookingStatusClass(status: BookingStatus) {
  if (status === "approved_by_vendor") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (status === "confirmed") return "bg-green-100 text-green-700 border-green-200";
  if (status === "rejected_by_vendor") return "bg-red-100 text-red-700 border-red-200";
  if (status === "completed") return "bg-blue-100 text-blue-700 border-blue-200";
  if (status === "cancelled") return "bg-gray-100 text-gray-700 border-gray-200";
  return "bg-yellow-100 text-yellow-700 border-yellow-200";
}

function listingStatusClass(status: ListingStatus) {
  if (status === "approved") return "bg-green-100 text-green-700 border-green-200";
  if (status === "rejected") return "bg-red-100 text-red-700 border-red-200";
  return "bg-yellow-100 text-yellow-700 border-yellow-200";
}

function roleClass(role: ManagedUserRole) {
  if (role === "super-admin") return "bg-purple-100 text-purple-700 border-purple-200";
  if (role === "vendor") return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-green-100 text-green-700 border-green-200";
}

function roleLabel(role: ManagedUserRole) {
  if (role === "super-admin") return "Super Admin";
  if (role === "vendor") return "Vendor";
  return "User";
}

function statusClass(status: "active" | "inactive" | "draft" | "invited" | "disabled") {
  if (status === "active") return "bg-green-100 text-green-700 border-green-200";
  if (status === "inactive" || status === "disabled") return "bg-red-100 text-red-700 border-red-200";
  if (status === "draft") return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-blue-100 text-blue-700 border-blue-200";
}

function ScopeBadge({ className, children }: { className: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

function FilterChips<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
            value === option.value
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:text-blue-600"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      {actions}
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ElementType;
  tone: string;
}) {
  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className="flex items-start justify-between gap-4 pt-5">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          <p className="mt-1 text-xs text-gray-400">{helper}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border border-dashed border-gray-200">
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
          <LayoutDashboard className="h-7 w-7 text-blue-400" />
        </div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="max-w-md text-sm text-gray-400">{description}</p>
      </CardContent>
    </Card>
  );
}

interface DashboardActivityItem {
  id: string;
  type: "booking" | "review" | "profile";
  title: string;
  subtitle: string;
  createdAt: string;
}

interface SuperAdminDashboardSummary {
  totals: {
    users: number;
    vendors: number;
    bookings: number;
    pendingBookings: number;
    completedBookings: number;
    pendingProfiles: number;
  };
  reviews: {
    averageRating: number;
    totalReviews: number;
    latestReviews: MarketplaceReview[];
  };
  recentActivities: DashboardActivityItem[];
}

function DashboardPage() {
  const { bookings, listings, platformUsers, reviews } = useMarketplace();
  const [summary, setSummary] = useState<SuperAdminDashboardSummary | null>(null);
  const summaryRefreshKey = useMemo(
    () => [
      bookings.map((booking) => booking.updatedAt).join("|"),
      listings.map((listing) => listing.updatedAt).join("|"),
      platformUsers.map((user) => user.createdAt).join("|"),
      reviews.map((review) => review.createdAt).join("|"),
    ].join("::"),
    [bookings, listings, platformUsers, reviews],
  );

  useEffect(() => {
    let isActive = true;

    const loadSummary = async () => {
      try {
        const payload = await api.get("/marketplace/dashboard/summary");
        if (isActive) {
          setSummary(unwrapPayload<SuperAdminDashboardSummary>(payload));
        }
      } catch {
        if (isActive) {
          setSummary(null);
        }
      }
    };

    void loadSummary();
    const intervalId = window.setInterval(() => {
      void loadSummary();
    }, 30000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [summaryRefreshKey]);

  const pendingListings = summary?.totals.pendingProfiles ?? listings.filter((listing) => listing.status === "pending").length;
  const completedBookings = summary?.totals.completedBookings ?? bookings.filter((booking) => booking.status === "completed").length;
  const pendingBookings = summary?.totals.pendingBookings ?? bookings.filter((booking) => booking.status === "pending").length;
  const platformAccountCount = platformUsers.length;
  const superAdminCount = platformUsers.filter((user) => user.role === "super-admin").length;
  const vendorCount = summary?.totals.vendors ?? platformUsers.filter((user) => user.role === "vendor").length;
  const userCount = summary?.totals.users ?? platformUsers.filter((user) => user.role === "user").length;
  const totalBookings = summary?.totals.bookings ?? bookings.length;
  const latestListings = [...listings].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);
  const latestReviews = summary?.reviews.latestReviews?.length
    ? summary.reviews.latestReviews
    : [...reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);
  const averageRating = summary?.reviews.averageRating ?? (
    reviews.length === 0
      ? 0
      : Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1))
  );
  const totalReviews = summary?.reviews.totalReviews ?? reviews.length;
  const recentActivities = summary?.recentActivities?.length
    ? summary.recentActivities
    : [
        ...bookings.slice(0, 3).map((booking) => ({
          id: `booking-${booking.id}`,
          type: "booking" as const,
          title: `${booking.userName} booked ${booking.listingName}`,
          subtitle: `${booking.vendorName} - ${bookingStatusLabel(booking.status)}`,
          createdAt: booking.updatedAt,
        })),
        ...reviews.slice(0, 2).map((review) => ({
          id: `review-${review.id}`,
          type: "review" as const,
          title: `${review.userName} reviewed ${review.vendorName}`,
          subtitle: `${review.rating}/5 - ${review.listingName}`,
          createdAt: review.createdAt,
        })),
        ...listings.slice(0, 2).map((listing) => ({
          id: `listing-${listing.id}`,
          type: "profile" as const,
          title: `${listing.vendorName} updated ${listing.title}`,
          subtitle: `${listing.category} / ${listing.subCategory}`,
          createdAt: listing.updatedAt,
        })),
      ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Overview"
        description="Track live users, vendors, bookings, reviews, and moderation activity from one super-admin dashboard."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Platform Accounts" value={platformAccountCount.toString()} helper="All login-enabled accounts from MongoDB" icon={Users} tone="bg-slate-100 text-slate-700" />
        <MetricCard label="Customers" value={userCount.toString()} helper="Registered customer accounts" icon={Users} tone="bg-blue-50 text-blue-600" />
        <MetricCard label="Vendors" value={vendorCount.toString()} helper="Approved and pending vendor accounts" icon={ClipboardCheck} tone="bg-cyan-50 text-cyan-600" />
        <MetricCard label="Super Admins" value={superAdminCount.toString()} helper="Protected platform administrators" icon={Users} tone="bg-purple-50 text-purple-600" />
        <MetricCard label="Bookings" value={totalBookings.toString()} helper={`${completedBookings} completed, ${pendingBookings} pending`} icon={BookOpen} tone="bg-green-50 text-green-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="border border-gray-100 shadow-sm xl:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-gray-400">Recent activities will appear here as users, vendors, and reviews start flowing through the platform.</p>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex flex-col gap-3 rounded-2xl border border-gray-100 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{activity.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{activity.subtitle}</p>
                    <p className="mt-1 text-xs text-gray-400">{formatDisplayDateTime(activity.createdAt)}</p>
                  </div>
                  <ScopeBadge className={
                    activity.type === "booking"
                      ? "bg-blue-100 text-blue-700 border-blue-200"
                      : activity.type === "review"
                        ? "bg-amber-100 text-amber-700 border-amber-200"
                        : "bg-violet-100 text-violet-700 border-violet-200"
                  }>
                    {activity.type}
                  </ScopeBadge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Reviews Summary</CardTitle>
              <ScopeBadge className="bg-amber-100 text-amber-700 border-amber-200">
                {averageRating.toFixed(1)} / 5
              </ScopeBadge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">Published Reviews</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{totalReviews}</p>
              <p className="mt-1 text-sm text-gray-500">Moderated and visible review records linked to completed bookings.</p>
            </div>
            <div className="space-y-3">
              {latestReviews.length === 0 ? (
                <p className="text-sm text-gray-400">Latest reviews will appear here once users complete bookings and leave ratings.</p>
              ) : (
                latestReviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{review.vendorName}</p>
                        <p className="mt-1 text-xs text-gray-500">By {review.userName}</p>
                      </div>
                      <ScopeBadge className="bg-amber-100 text-amber-700 border-amber-200">
                        {review.rating} / 5
                      </ScopeBadge>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Pending Profile Approvals</CardTitle>
              <Badge variant="secondary" className="border-0 bg-yellow-100 text-yellow-700">
                {pendingListings} pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestListings.length === 0 ? (
              <p className="text-sm text-gray-400">No profile activity yet.</p>
            ) : (
              latestListings.map((listing) => (
                <div key={listing.id} className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
                  <div>
                    <p className="font-semibold text-gray-900">{listing.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{listing.vendorName} - {listing.city}</p>
                    <p className="mt-1 text-xs text-gray-400">{listing.category} / {listing.subCategory}</p>
                  </div>
                  <ScopeBadge className={listingStatusClass(listing.status)}>{listing.status}</ScopeBadge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Role Distribution</CardTitle>
              <Badge variant="secondary" className="border-0 bg-blue-100 text-blue-700">
                Live users
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {([
              { label: "Super Admin", count: platformUsers.filter((user) => user.role === "super-admin").length, className: roleClass("super-admin") },
              { label: "Vendor", count: vendorCount, className: roleClass("vendor") },
              { label: "User", count: userCount, className: roleClass("user") },
            ] as const).map((entry) => (
              <div key={entry.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">{entry.label}</p>
                  <ScopeBadge className={entry.className}>{entry.count}</ScopeBadge>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div
                    className={`h-2 rounded-full ${entry.className.includes("purple") ? "bg-purple-500" : entry.className.includes("blue") ? "bg-blue-500" : "bg-green-500"}`}
                    style={{ width: `${platformUsers.length === 0 ? 0 : (entry.count / platformUsers.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BookingsPage() {
  const { bookings, deleteBooking, updateBooking } = useMarketplace();
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    eventType: "",
    location: "",
    date: "",
    time: "",
    amount: "",
    phoneNumber: "",
    status: "pending" as BookingStatus,
  });

  const filteredBookings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      if (filter !== "all" && booking.status !== filter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        booking.userName,
        booking.userEmail,
        booking.vendorName,
        booking.vendorEmail,
        booking.listingName,
        booking.eventType,
        booking.location,
        booking.date,
        booking.time,
        booking.phoneNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [bookings, filter, search]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize));
  const visibleBookings = filteredBookings.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const startEdit = (booking: ReturnType<typeof useMarketplace>["bookings"][number]) => {
    setEditingId(booking.id);
    setEditForm({
      eventType: booking.eventType,
      location: booking.location,
      date: booking.date,
      time: booking.time,
      amount: booking.amount,
      phoneNumber: booking.phoneNumber,
      status: booking.status,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      eventType: "",
      location: "",
      date: "",
      time: "",
      amount: "",
      phoneNumber: "",
      status: "pending",
    });
  };

  const saveEdit = () => {
    if (!editingId) {
      return;
    }

    void updateBooking(editingId, editForm).then((success) => {
      if (success) {
        cancelEdit();
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendor-User Bookings"
        description="Search, edit, and manage every booking between users and vendors from one super-admin workspace."
      />

      {editingId && (
        <Card className="border border-blue-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Edit Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Input value={editForm.eventType} onChange={(event) => setEditForm((current) => ({ ...current, eventType: event.target.value }))} placeholder="Event type" className="rounded-xl border-gray-200" />
              <Input value={editForm.location} onChange={(event) => setEditForm((current) => ({ ...current, location: event.target.value }))} placeholder="Location" className="rounded-xl border-gray-200" />
              <Input type="date" value={editForm.date} onChange={(event) => setEditForm((current) => ({ ...current, date: event.target.value }))} className="rounded-xl border-gray-200" />
              <Input value={editForm.time} onChange={(event) => setEditForm((current) => ({ ...current, time: event.target.value }))} placeholder="Time slot" className="rounded-xl border-gray-200" />
              <Input value={editForm.amount} onChange={(event) => setEditForm((current) => ({ ...current, amount: event.target.value }))} placeholder="Amount" className="rounded-xl border-gray-200" />
              <Input value={editForm.phoneNumber} onChange={(event) => setEditForm((current) => ({ ...current, phoneNumber: event.target.value }))} placeholder="Phone number" className="rounded-xl border-gray-200" />
              <select value={editForm.status} onChange={(event) => setEditForm((current) => ({ ...current, status: event.target.value as BookingStatus }))} className={FIELD_CLASS}>
                <option value="pending">Pending</option>
                <option value="approved_by_vendor">Confirmed</option>
                <option value="rejected_by_vendor">Rejected</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" className="rounded-xl" onClick={cancelEdit}>Cancel</Button>
              <Button className="rounded-xl bg-blue-600 text-white hover:bg-blue-700" onClick={saveEdit}>Save Booking</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterChips
          value={filter}
          onChange={setFilter}
          options={[
            { label: "All", value: "all" },
            { label: "Pending", value: "pending" },
            { label: "Confirmed", value: "approved_by_vendor" },
            { label: "Rejected", value: "rejected_by_vendor" },
            { label: "Completed", value: "completed" },
            { label: "Cancelled", value: "cancelled" },
          ]}
        />
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by user, vendor, listing, event, location, or phone"
            className="rounded-xl border-gray-200"
          />
          <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600">
            {filteredBookings.length} booking{filteredBookings.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <EmptyState title="No bookings found" description="Booking rows will appear here once users start sending booking requests to vendors." />
      ) : (
        <Card className="border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["User Info", "Vendor Info", "Booking", "Booking Date", "Amount", "Status", "Payment", "Withdrawal", "Last Updated", "Actions"].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-50 align-top hover:bg-blue-50/20">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">{booking.userName}</p>
                      <p className="mt-1 text-xs text-gray-500">{booking.userEmail}</p>
                      <p className="mt-1 text-xs text-gray-400">{booking.phoneNumber}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">{booking.vendorName}</p>
                      <p className="mt-1 text-xs text-gray-500">{booking.vendorEmail || "Vendor email unavailable"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{booking.listingName}</p>
                      <p className="mt-1 text-xs text-gray-500">{booking.eventType}</p>
                      <p className="mt-1 text-xs text-gray-400">{booking.location}</p>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-600">
                      <p>{formatDisplayDate(booking.date)}</p>
                      <p className="mt-1 text-xs text-gray-500">{booking.time}</p>
                    </td>
                    <td className="px-4 py-4 font-semibold text-gray-900">{booking.amount}</td>
                    <td className="px-4 py-4">
                      <ScopeBadge className={bookingStatusClass(booking.status)}>{bookingStatusLabel(booking.status)}</ScopeBadge>
                    </td>
                    <td className="px-4 py-4">
                      <ScopeBadge className={booking.paymentRequested ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-600 border-gray-200"}>
                        {booking.paymentRequested ? "Requested" : "Not requested"}
                      </ScopeBadge>
                    </td>
                    <td className="px-4 py-4">
                      <ScopeBadge className={booking.withdrawalRequested ? "bg-red-100 text-red-700 border-red-200" : "bg-gray-100 text-gray-600 border-gray-200"}>
                        {booking.withdrawalRequested ? "Requested" : "None"}
                      </ScopeBadge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500">{formatDisplayDateTime(booking.updatedAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-1 rounded-xl text-blue-600" onClick={() => startEdit(booking)}>
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1 rounded-xl text-red-600" onClick={() => deleteBooking(booking.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {visibleBookings.length} of {filteredBookings.length} bookings
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>
                Previous
              </Button>
              <span className="min-w-[100px] text-center text-xs font-medium text-gray-500">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}>
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function ReviewsPage() {
  const { reviews, deleteReview } = useMarketplace();
  const [filter, setFilter] = useState<"all" | "5" | "4">("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const vendorOptions = useMemo(
    () => Array.from(new Set(reviews.map((review) => review.vendorName))).filter(Boolean).sort(),
    [reviews],
  );
  const userOptions = useMemo(
    () => Array.from(new Set(reviews.map((review) => review.userName))).filter(Boolean).sort(),
    [reviews],
  );

  const filteredReviews = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return reviews.filter((review) => {
      if (filter === "5" && review.rating !== 5) return false;
      if (filter === "4" && review.rating < 4) return false;
      if (vendorFilter !== "all" && review.vendorName !== vendorFilter) return false;
      if (userFilter !== "all" && review.userName !== userFilter) return false;

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        review.vendorName,
        review.userName,
        review.listingName,
        review.comment,
        review.userEmail,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [filter, reviews, search, userFilter, vendorFilter]);

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize));
  const visibleReviews = filteredReviews.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [filter, vendorFilter, userFilter, search]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews & Ratings"
        description="View, filter, search, and moderate reviews that were submitted only after completed bookings."
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterChips
          value={filter}
          onChange={setFilter}
          options={[
            { label: "All Reviews", value: "all" },
            { label: "5 Star", value: "5" },
            { label: "4+ Star", value: "4" },
          ]}
        />
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by vendor, user, listing, email, or review text"
            className="rounded-xl border-gray-200"
          />
          <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600">
            {filteredReviews.length} review{filteredReviews.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <Card className="border border-gray-100 shadow-sm">
        <CardContent className="grid grid-cols-1 gap-4 pt-6 md:grid-cols-2">
          <select value={vendorFilter} onChange={(event) => setVendorFilter(event.target.value)} className={FIELD_CLASS}>
            <option value="all">All vendors</option>
            {vendorOptions.map((vendor) => (
              <option key={vendor} value={vendor}>{vendor}</option>
            ))}
          </select>
          <select value={userFilter} onChange={(event) => setUserFilter(event.target.value)} className={FIELD_CLASS}>
            <option value="all">All users</option>
            {userOptions.map((user) => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {filteredReviews.length === 0 ? (
        <EmptyState title="No reviews found" description="Completed booking reviews will appear here once users start rating vendors." />
      ) : (
        <Card className="border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-2">
            {visibleReviews.map((review) => (
              <Card key={review.id} className="border border-gray-100 shadow-sm">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{review.vendorName}</p>
                      <p className="mt-1 text-sm text-gray-500">{review.listingName}</p>
                      <p className="mt-1 text-xs text-gray-400">By {review.userName} on {formatDisplayDateTime(review.createdAt)}</p>
                    </div>
                    <ScopeBadge className="bg-amber-100 text-amber-700 border-amber-200">
                      <Star className="mr-1 h-3.5 w-3.5 fill-current" />
                      {review.rating}
                    </ScopeBadge>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-gray-700">{review.comment}</p>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" className="gap-1 rounded-xl text-red-600" onClick={() => deleteReview(review.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {visibleReviews.length} of {filteredReviews.length} reviews
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>
                Previous
              </Button>
              <span className="min-w-[100px] text-center text-xs font-medium text-gray-500">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}>
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

const defaultUserForm = {
  name: "",
  email: "",
  password: "",
  role: "user" as ManagedUserRole,
  status: "active" as MarketplacePlatformUser["status"],
  location: "",
  phoneNumber: "",
};

const USER_MODAL_ROLE_OPTIONS: Array<{ label: string; value: Extract<ManagedUserRole, "vendor" | "user"> }> = [
  { label: "Professional", value: "vendor" },
  { label: "User", value: "user" },
];

function UserManagementPage() {
  const { platformUsers, addPlatformUser, updatePlatformUser, deletePlatformUser, isMutating } = useMarketplace();
  const [filter, setFilter] = useState<"all" | ManagedUserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | MarketplacePlatformUser["status"]>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultUserForm);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return platformUsers.filter((user) => {
      if (filter !== "all" && user.role !== filter) {
        return false;
      }

      if (statusFilter !== "all" && user.status !== statusFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [user.name, user.email, user.location, user.role, user.status]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }, [filter, platformUsers, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / 8));
  const visibleUsers = filteredUsers.slice((page - 1) * 8, page * 8);

  useEffect(() => {
    setPage(1);
  }, [filter, search, statusFilter]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(defaultUserForm);
    setModalMessage(null);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(defaultUserForm);
    setModalMessage(null);
    setIsModalOpen(true);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setModalMessage(null);

    if (!form.name.trim() || !form.email.trim()) {
      setModalMessage("Name and email are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setModalMessage("Enter a valid email address.");
      return;
    }

    if (!editingId && form.password.trim().length < 8) {
      setModalMessage("A password with at least 8 characters is required for new users.");
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      location: form.location.trim(),
      phoneNumber: form.phoneNumber.trim(),
      password: form.password.trim() || undefined,
    };

    const didSave = editingId
      ? await updatePlatformUser(editingId, payload)
      : await addPlatformUser(payload);

    if (!didSave) {
      setModalMessage("We could not save this user right now. Please try again.");
      return;
    }

    closeModal();
    await new Promise((resolve) => window.setTimeout(resolve, 150));
    await showSuccessAlert(editingId ? "User updated" : "User created", {
      text: editingId
        ? "The user details were updated successfully."
        : "The user was created successfully without OTP verification.",
    });
  };

  const startEdit = (user: MarketplacePlatformUser) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      status: user.status,
      location: user.location,
      phoneNumber: "",
    });
    setModalMessage(null);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (user: MarketplacePlatformUser) => {
    const confirmed = await showConfirmAlert({
      title: "Delete user?",
      text: `This will permanently remove ${user.name} from the platform.`,
      confirmButtonText: "Delete User",
      cancelButtonText: "Cancel",
    });

    if (!confirmed) {
      return;
    }

    const didDelete = await deletePlatformUser(user.id);
    if (!didDelete) {
      await showErrorAlert("Delete failed", {
        text: "We could not remove this user right now. Please try again.",
      });
      return;
    }

    await showSuccessAlert("User deleted", {
      text: `${user.name} was removed from the platform.`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage super-admin, vendor, and customer accounts with modal-based create and edit flows."
        actions={
          <Button onClick={openCreateModal} className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        }
      />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <FilterChips
          value={filter}
          onChange={setFilter}
          options={[
            { label: "All", value: "all" },
            { label: "Super-Admin", value: "super-admin" },
            { label: "Vendor", value: "vendor" },
            { label: "User", value: "user" },
          ]}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, email, role, or location" className="w-full rounded-xl border-gray-200 sm:w-80" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className={FIELD_CLASS}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      <Card className="border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Name", "Email", "Role", "Status", "Location", "Created", "Actions"].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-blue-50/20">
                  <td className="px-4 py-4 font-semibold text-gray-900">{user.name}</td>
                  <td className="px-4 py-4 text-gray-600">{user.email}</td>
                  <td className="px-4 py-4"><ScopeBadge className={roleClass(user.role)}>{user.role}</ScopeBadge></td>
                  <td className="px-4 py-4"><ScopeBadge className={statusClass(user.status)}>{user.status}</ScopeBadge></td>
                  <td className="px-4 py-4 text-gray-600">{user.location || "-"}</td>
                  <td className="px-4 py-4 text-xs text-gray-500">{formatDisplayDate(user.createdAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-1 rounded-xl text-blue-600" onClick={() => startEdit(user)}>
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1 rounded-xl text-red-600" onClick={() => void handleDeleteUser(user)}>
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
          <p>Showing {visibleUsers.length} of {filteredUsers.length} users</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>Previous</Button>
            <span className="min-w-[100px] text-center text-xs font-medium text-gray-500">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}>Next</Button>
          </div>
        </div>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={(open) => !open && !isMutating && closeModal()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit User" : "Add User"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the user details below. Password is optional when editing."
                : "Create a platform user directly from the super-admin dashboard without OTP verification."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(event) => void submit(event)} className="space-y-4">
            {modalMessage && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {modalMessage}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Full name" className="rounded-xl border-gray-200" />
              <Input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email address" className="rounded-xl border-gray-200" />
              <Input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder="Location" className="rounded-xl border-gray-200" />
              <Input value={form.phoneNumber} onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))} placeholder="Phone number" className="rounded-xl border-gray-200" />
              <Input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder={editingId ? "New password (optional)" : "Password"} className="rounded-xl border-gray-200" />
              <select
                value={form.role === "super-admin" ? "user" : form.role}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role: event.target.value as Extract<ManagedUserRole, "vendor" | "user">,
                  }))
                }
                className={FIELD_CLASS}
              >
                {USER_MODAL_ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as MarketplacePlatformUser["status"] }))} className={FIELD_CLASS}>
              <option value="active">Active</option>
              <option value="invited">Invited</option>
              <option value="disabled">Disabled</option>
            </select>

            <div className="flex flex-wrap justify-end gap-3">
              <Button type="button" variant="outline" className="rounded-xl" onClick={closeModal} disabled={isMutating}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl bg-blue-600 text-white hover:bg-blue-700" disabled={isMutating}>
                {editingId ? "Update User" : "Add User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const defaultPermissionForm = {
  name: "",
  module: "",
  audience: "super-admin" as ManagedUserRole,
  description: "",
  status: "active" as MarketplacePermission["status"],
};

function PermissionsPage() {
  const { permissions, addPermission, updatePermission, deletePermission } = useMarketplace();
  const [filter, setFilter] = useState<"all" | ManagedUserRole>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultPermissionForm);

  const filteredPermissions = filter === "all" ? permissions : permissions.filter((permission) => permission.audience === filter);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (editingId) {
      updatePermission(editingId, form);
    } else {
      addPermission(form);
    }
    setEditingId(null);
    setForm(defaultPermissionForm);
  };

  const startEdit = (permission: MarketplacePermission) => {
    setEditingId(permission.id);
    setForm({
      name: permission.name,
      module: permission.module,
      audience: permission.audience,
      description: permission.description,
      status: permission.status,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Permissions" description="Define capability-level permissions and assign them to platform roles." />
      <FilterChips
        value={filter}
        onChange={setFilter}
        options={[
          { label: "All", value: "all" },
          { label: "Super-Admin", value: "super-admin" },
          { label: "Vendor", value: "vendor" },
          { label: "User", value: "user" },
        ]}
      />

      <Card className="border border-gray-100 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Permission name" className="rounded-xl border-gray-200" />
            <Input value={form.module} onChange={(event) => setForm((current) => ({ ...current, module: event.target.value }))} placeholder="Module" className="rounded-xl border-gray-200" />
            <select value={form.audience} onChange={(event) => setForm((current) => ({ ...current, audience: event.target.value as ManagedUserRole }))} className={FIELD_CLASS}>
              <option value="super-admin">Super-Admin</option>
              <option value="vendor">Vendor</option>
              <option value="user">User</option>
            </select>
            <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as MarketplacePermission["status"] }))} className={FIELD_CLASS}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">{editingId ? "Update" : "Create"}</Button>
            <div className="md:col-span-5">
              <Input value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Describe what this permission allows" className="rounded-xl border-gray-200" />
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {filteredPermissions.map((permission) => (
          <Card key={permission.id} className="border border-gray-100 shadow-sm">
            <CardContent className="flex flex-col gap-4 pt-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-gray-900">{permission.name}</p>
                  <ScopeBadge className={roleClass(permission.audience)}>{permission.audience}</ScopeBadge>
                  <ScopeBadge className={statusClass(permission.status)}>{permission.status}</ScopeBadge>
                  {permission.isProtected && (
                    <ScopeBadge className="bg-gray-100 text-gray-700 border-gray-200">Protected</ScopeBadge>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">{permission.module}</p>
                <p className="mt-2 text-sm text-gray-700">{permission.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1 rounded-xl text-blue-600" onClick={() => startEdit(permission)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="gap-1 rounded-xl text-red-600" onClick={() => deletePermission(permission.id)} disabled={permission.isProtected}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const defaultRoleForm = {
  name: "",
  scope: "platform" as MarketplaceRoleDefinition["scope"],
  status: "active" as MarketplaceRoleDefinition["status"],
  permissionIds: [] as string[],
};

function RolesPage() {
  const { roles, permissions, addRole, updateRole, deleteRole } = useMarketplace();
  const [filter, setFilter] = useState<"all" | MarketplaceRoleDefinition["scope"]>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultRoleForm);

  const filteredRoles = useMemo(
    () =>
      (filter === "all" ? roles : roles.filter((role) => role.scope === filter))
        .slice()
        .sort((left, right) => {
          const leftPriority = left.systemRole ? 0 : left.isProtected ? 1 : 2;
          const rightPriority = right.systemRole ? 0 : right.isProtected ? 1 : 2;
          return leftPriority - rightPriority || left.name.localeCompare(right.name);
        }),
    [filter, roles],
  );
  const permissionLookup = useMemo(
    () => Object.fromEntries(permissions.map((permission) => [permission.id, permission.name])),
    [permissions],
  );

  const togglePermission = (permissionId: string) => {
    setForm((current) => ({
      ...current,
      permissionIds: current.permissionIds.includes(permissionId)
        ? current.permissionIds.filter((entry) => entry !== permissionId)
        : [...current.permissionIds, permissionId],
    }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (editingId) {
      updateRole(editingId, form);
    } else {
      addRole(form);
    }
    setEditingId(null);
    setForm(defaultRoleForm);
  };

  const startEdit = (role: MarketplaceRoleDefinition) => {
    setEditingId(role.id);
    setForm({
      name: role.name,
      scope: role.scope,
      status: role.status,
      permissionIds: role.permissionIds,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Roles" description="Create and maintain platform roles, attach permissions, and manage protected defaults." />
      <FilterChips
        value={filter}
        onChange={setFilter}
        options={[
          { label: "All", value: "all" },
          { label: "Platform", value: "platform" },
          { label: "Operations", value: "operations" },
          { label: "Marketplace", value: "marketplace" },
        ]}
      />

      <Card className="border border-gray-100 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Role name" className="rounded-xl border-gray-200" />
              <select value={form.scope} onChange={(event) => setForm((current) => ({ ...current, scope: event.target.value as MarketplaceRoleDefinition["scope"] }))} className={FIELD_CLASS}>
                <option value="platform">Platform</option>
                <option value="operations">Operations</option>
                <option value="marketplace">Marketplace</option>
              </select>
              <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as MarketplaceRoleDefinition["status"] }))} className={FIELD_CLASS}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
              <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">{editingId ? "Update" : "Create"}</Button>
            </div>
            <div className="rounded-2xl border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-900">Attach Permissions</p>
              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                {permissions.map((permission) => (
                  <label key={permission.id} className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700">
                    <input type="checkbox" checked={form.permissionIds.includes(permission.id)} onChange={() => togglePermission(permission.id)} />
                    <span>{permission.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {filteredRoles.map((role) => (
          <Card key={role.id} className="border border-gray-100 shadow-sm">
            <CardContent className="pt-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-900">{role.name}</p>
                    <ScopeBadge className="bg-blue-100 text-blue-700 border-blue-200">{role.scope}</ScopeBadge>
                    <ScopeBadge className={statusClass(role.status)}>{role.status}</ScopeBadge>
                    {role.systemRole && (
                      <ScopeBadge className={roleClass(role.systemRole)}>
                        {roleLabel(role.systemRole)}
                      </ScopeBadge>
                    )}
                    {role.isProtected && (
                      <ScopeBadge className="bg-gray-100 text-gray-700 border-gray-200">Protected</ScopeBadge>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-gray-500">
                    {role.systemRole
                      ? `${roleLabel(role.systemRole)} login role`
                      : "Custom role definition"} Ã¢â‚¬Â¢ {role.permissionIds.length} permission{role.permissionIds.length === 1 ? "" : "s"} attached
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {role.permissionIds.map((permissionId) => (
                      <ScopeBadge key={permissionId} className="bg-gray-100 text-gray-700 border-gray-200">
                        {permissionLookup[permissionId] ?? permissionId}
                      </ScopeBadge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1 rounded-xl text-blue-600" onClick={() => startEdit(role)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1 rounded-xl text-red-600" onClick={() => deleteRole(role.id)} disabled={role.isProtected}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const defaultCategoryForm = {
  name: "",
  status: "active" as MarketplaceCategory["status"],
};

function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useMarketplace();
  const [filter, setFilter] = useState<"all" | MarketplaceCategory["status"]>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultCategoryForm);

  const filteredCategories = filter === "all" ? categories : categories.filter((category) => category.status === filter);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (editingId) {
      updateCategory(editingId, form);
    } else {
      addCategory(form);
    }
    setEditingId(null);
    setForm(defaultCategoryForm);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Categories" description="Manage the top-level service categories available across Photorido." />
      <FilterChips value={filter} onChange={setFilter} options={[{ label: "All", value: "all" }, { label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }]} />
      <Card className="border border-gray-100 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Category name" className="rounded-xl border-gray-200" />
            <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as MarketplaceCategory["status"] }))} className={FIELD_CLASS}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">{editingId ? "Update" : "Create"}</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="border border-gray-100 shadow-sm">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{category.name}</p>
                  <p className="mt-1 text-xs text-gray-400">Created {formatDisplayDate(category.createdAt)}</p>
                </div>
                <ScopeBadge className={statusClass(category.status)}>{category.status}</ScopeBadge>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1 rounded-xl text-blue-600" onClick={() => {
                  setEditingId(category.id);
                  setForm({ name: category.name, status: category.status });
                }}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="gap-1 rounded-xl text-red-600" onClick={() => deleteCategory(category.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

const defaultBrowseServiceForm = {
  name: "",
  description: "",
  badgeText: "",
  sortOrder: 0,
  status: "active" as MarketplaceBrowseServiceCard["status"],
};

function BrowseServicesPage() {
  const {
    browseServiceCards,
    addBrowseServiceCard,
    updateBrowseServiceCard,
    deleteBrowseServiceCard,
  } = useMarketplace();
  const [filter, setFilter] = useState<"all" | MarketplaceBrowseServiceCard["status"]>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultBrowseServiceForm);

  const filteredCards = (filter === "all"
    ? browseServiceCards
    : browseServiceCards.filter((card) => card.status === filter)
  ).slice().sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name));

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    const succeeded = editingId
      ? await updateBrowseServiceCard(editingId, form)
      : await addBrowseServiceCard(form);

    if (!succeeded) {
      return;
    }

    setEditingId(null);
    setForm(defaultBrowseServiceForm);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Browse Services"
        description="Manage the home-page Browse by Service cards independently from marketplace categories."
      />
      <FilterChips
        value={filter}
        onChange={setFilter}
        options={[
          { label: "All", value: "all" },
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ]}
      />
      <Card className="border border-gray-100 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
              <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Service title" className="rounded-xl border-gray-200" />
              <Input value={form.badgeText} onChange={(event) => setForm((current) => ({ ...current, badgeText: event.target.value }))} placeholder="Badge text (e.g. 12.5K+ pros)" className="rounded-xl border-gray-200" />
              <Input type="number" min={0} value={form.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: Number(event.target.value) || 0 }))} placeholder="Sort order" className="rounded-xl border-gray-200" />
              <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as MarketplaceBrowseServiceCard["status"] }))} className={FIELD_CLASS}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">{editingId ? "Update" : "Create"}</Button>
            </div>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Short description shown under the service title"
              className={`${FIELD_CLASS} min-h-[96px] py-3`}
            />
          </form>
        </CardContent>
      </Card>

      {filteredCards.length === 0 ? (
        <EmptyState title="No browse services yet" description="Create the first Browse by Service card to control the home page section." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCards.map((card) => {
            const visual = getServiceCategoryVisual(card.name);
            const Icon = visual.icon;

            return (
              <Card key={card.id} className="border border-gray-100 shadow-sm">
                <CardContent className="space-y-4 pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{card.name}</p>
                      <p className="mt-1 text-xs text-gray-400">Created {formatDisplayDate(card.createdAt)} - Order {card.sortOrder}</p>
                    </div>
                    <ScopeBadge className={statusClass(card.status)}>{card.status}</ScopeBadge>
                  </div>

                  <div className="rounded-[28px] border border-[#e7f0ff] bg-gradient-to-b from-white to-[#f6f9ff] px-6 py-7 text-center shadow-[0_18px_45px_rgba(37,99,235,0.08)]">
                    <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${visual.gradient} shadow-lg shadow-blue-200/50`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-[1.05rem] font-medium text-slate-900">{card.name}</h3>
                    <p className="mx-auto mt-2 max-w-[220px] text-sm leading-6 text-slate-500">{card.description}</p>
                    <div className="mt-4 inline-flex items-center rounded-full bg-[#dbeafe] px-3 py-1 text-xs font-medium text-[#1d4ed8]">
                      {card.badgeText}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1 rounded-xl text-blue-600" onClick={() => {
                      setEditingId(card.id);
                      setForm({
                        name: card.name,
                        description: card.description,
                        badgeText: card.badgeText,
                        sortOrder: card.sortOrder,
                        status: card.status,
                      });
                    }}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1 rounded-xl text-red-600" onClick={() => deleteBrowseServiceCard(card.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

const defaultSubCategoryForm = {
  categoryId: "",
  name: "",
  status: "active" as MarketplaceSubCategory["status"],
};

function SubCategoriesPage() {
  const { categories, subCategories, addSubCategory, updateSubCategory, deleteSubCategory } = useMarketplace();
  const [filter, setFilter] = useState<"all" | string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultSubCategoryForm);

  const categoryLookup = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  const filteredSubCategories = filter === "all" ? subCategories : subCategories.filter((entry) => entry.categoryId === filter);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (editingId) {
      updateSubCategory(editingId, form);
    } else {
      addSubCategory(form);
    }
    setEditingId(null);
    setForm(defaultSubCategoryForm);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Sub-Categories" description="Map detailed service types to their parent categories, with full CRUD and filters." />
      <FilterChips
        value={filter}
        onChange={setFilter}
        options={[{ label: "All", value: "all" }, ...categories.map((category) => ({ label: category.name, value: category.id }))]}
      />
      <Card className="border border-gray-100 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <select value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))} className={FIELD_CLASS}>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Sub-category name" className="rounded-xl border-gray-200" />
            <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as MarketplaceSubCategory["status"] }))} className={FIELD_CLASS}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">{editingId ? "Update" : "Create"}</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredSubCategories.map((subCategory) => (
          <Card key={subCategory.id} className="border border-gray-100 shadow-sm">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{subCategory.name}</p>
                  <p className="mt-1 text-sm text-gray-500">{categoryLookup[subCategory.categoryId] ?? "Unknown category"}</p>
                  <p className="mt-1 text-xs text-gray-400">Created {formatDisplayDate(subCategory.createdAt)}</p>
                </div>
                <ScopeBadge className={statusClass(subCategory.status)}>{subCategory.status}</ScopeBadge>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1 rounded-xl text-blue-600" onClick={() => {
                  setEditingId(subCategory.id);
                  setForm({ categoryId: subCategory.categoryId, name: subCategory.name, status: subCategory.status });
                }}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="gap-1 rounded-xl text-red-600" onClick={() => deleteSubCategory(subCategory.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ListingsPage() {
  const { listings, approveListing, rejectListing } = useMarketplace();
  const [filter, setFilter] = useState<"all" | ListingStatus>("all");

  const filteredListings = filter === "all" ? listings : listings.filter((listing) => listing.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Profiles List"
        description="Review every vendor-created profile, act on pending submissions, and keep vendor plus super-admin notifications in sync."
      />
      <FilterChips
        value={filter}
        onChange={setFilter}
        options={[
          { label: "All", value: "all" },
          { label: "Pending", value: "pending" },
          { label: "Approved", value: "approved" },
          { label: "Rejected", value: "rejected" },
        ]}
      />

      {filteredListings.length === 0 ? (
        <EmptyState title="No profiles found" description="Vendor-created profiles will appear here for moderation and review." />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="border border-gray-100 shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-[180px_1fr]">
                <div className="h-full min-h-[180px] bg-gray-100">
                  <img src={listing.image} alt={listing.title} className="h-full w-full object-cover" />
                </div>
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{listing.title}</p>
                      <p className="mt-1 text-sm text-gray-500">{listing.vendorName} - {listing.city}, {listing.state}</p>
                      <p className="mt-1 text-xs text-gray-400">{listing.category} / {listing.subCategory}</p>
                    </div>
                    <ScopeBadge className={listingStatusClass(listing.status)}>{listing.status}</ScopeBadge>
                  </div>
                  <p className="mt-3 text-sm text-gray-700">{listing.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span>{listing.price}</span>
                    <span>Ã¢â‚¬Â¢</span>
                    <span>Submitted {formatDisplayDateTime(listing.createdAt)}</span>
                  </div>
                  <div className="mt-5 flex items-center gap-2">
                    <Button
                      disabled={listing.status === "approved"}
                      className="gap-1 bg-green-600 text-white hover:bg-green-700 disabled:bg-green-200"
                      onClick={() => approveListing(listing.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      disabled={listing.status === "rejected"}
                      className="gap-1 bg-red-500 text-white hover:bg-red-600 disabled:bg-red-200"
                      onClick={() => rejectListing(listing.id)}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return <EmptyState title={title} description={description} />;
}

export function SuperAdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeKey, setActiveKey] = useState("dashboard");

  useEffect(() => {
    setActiveKey(searchParams.get("tab") ?? "dashboard");
  }, [searchParams]);

  const handleNavigate = (key: string) => {
    setActiveKey(key);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);

      if (key === "dashboard") {
        next.delete("tab");
      } else {
        next.set("tab", key);
      }

      if (key !== "messages") {
        next.delete("conversationId");
      }

      return next;
    }, { replace: true });
  };

  const renderContent = () => {
    switch (activeKey) {
      case "dashboard":
        return <DashboardPage />;
      case "bookings":
        return <BookingsPage />;
      case "reviews":
        return <ReviewsPage />;
      case "user-management":
        return <UserManagementPage />;
      case "permissions":
        return <PermissionsPage />;
      case "roles":
        return <RolesPage />;
      case "categories":
        return <CategoriesPage />;
      case "browse-services":
        return <BrowseServicesPage />;
      case "sub-categories":
        return <SubCategoriesPage />;
      case "listings":
        return <ListingsPage />;
      case "settings":
        return <SettingsPage />;
      case "schedules":
        return <PlaceholderPage title="Vendor Schedules" description="Scheduling is preserved as a separate area and can be extended next without changing the current dashboard routing." />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen min-w-0 overflow-hidden bg-gray-50">
      <DashboardSidebar activeKey={activeKey} onNavigate={handleNavigate} />
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
}
