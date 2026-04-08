import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarCheck,
  Eye,
  ListChecks,
  MessageCircle,
  Plus,
  Star,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useMarketplace } from "../../context/MarketplaceContext";
import { useVendorAnalytics } from "../../hooks/useVendorData";
import { useVendorSavedProfiles } from "../../hooks/useVendorSavedProfiles";
import { formatDisplayDate } from "../../lib/date";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { DashboardSidebar } from "./DashboardSidebar";
import { CreateListingPage } from "./CreateListingPage";
import { MarketplaceVendorBookings, MarketplaceVendorMessages } from "./MarketplaceDashboardViews";
import { SchedulersPage } from "./SchedulersPage";
import { StatisticsPage } from "./StatisticsPage";
import { SettingsPage } from "./SettingsPage";
import { VendorReviewsPage } from "./VendorReviewsPage";

function VendorMetricCard({
  label,
  value,
  helper,
  icon: Icon,
  gradient,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: React.ElementType;
  gradient: string;
}) {
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5 text-[10px] font-semibold">
          <TrendingUp className="w-3 h-3" />
          Live
        </div>
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      <p className="text-sm text-white/80 mt-1">{label}</p>
      <p className="text-[10px] text-white/60 mt-0.5">{helper}</p>
    </div>
  );
}

function VendorOverview() {
  const navigate = useNavigate();
  const { bookings, conversations, listings, notifications, isLoading: isMarketplaceLoading } = useMarketplace();
  const { analytics, isLoading: isAnalyticsLoading, error: analyticsError } = useVendorAnalytics("all", "30d");
  const {
    profiles: savedProfiles,
    totals: savedProfileTotals,
    isLoading: isSavedProfilesLoading,
    error: savedProfilesError,
  } = useVendorSavedProfiles();
  const vendorBookings = useMemo(() => bookings, [bookings]);
  const vendorConversations = useMemo(() => conversations, [conversations]);
  const vendorListings = useMemo(() => listings, [listings]);
  const vendorNotifications = useMemo(
    () => notifications.filter((notification) => notification.role === "vendor"),
    [notifications],
  );

  const summary = {
    activeListings: analytics.summary.activeListings ?? vendorListings.length,
    totalViews: analytics.summary.totalViews ?? analytics.summary.views ?? 0,
    totalReviews: analytics.summary.totalReviews ?? analytics.summary.reviews ?? 0,
    totalLeads: analytics.summary.totalLeads ?? analytics.summary.leads ?? vendorBookings.length,
    timesBooked:
      analytics.summary.timesBooked ??
      analytics.summary.bookings ??
      vendorBookings.filter((booking) => booking.status === "approved_by_vendor" || booking.status === "confirmed" || booking.status === "completed").length,
  };

  const upcomingBookings = vendorBookings
    .filter((booking) => booking.status !== "cancelled")
    .sort((left, right) => left.date.localeCompare(right.date))
    .slice(0, 5);

  const recentActivity = [
    ...vendorNotifications.map((notification) => ({
      id: notification.id,
      title: notification.message,
      helper: new Date(notification.createdAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    })),
    ...vendorBookings.slice(0, 3).map((booking) => ({
      id: `booking-${booking.id}`,
      title: `${booking.userName} requested ${booking.listingName}`,
      helper: `${booking.eventType} • ${booking.amount}`,
    })),
  ].slice(0, 6);

  const chartSeries = analytics.series.length > 0 ? analytics.series : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Here's an overview of your professional activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <VendorMetricCard label="Active Profiles" value={summary.activeListings} helper="Currently visible profile cards" icon={ListChecks} gradient="from-blue-500 to-blue-600" />
        <VendorMetricCard label="Total Views" value={summary.totalViews.toLocaleString("en-IN")} helper="Directory traffic from backend analytics" icon={Eye} gradient="from-violet-500 to-violet-600" />
        <VendorMetricCard label="Total Reviews" value={summary.totalReviews.toLocaleString("en-IN")} helper="Published client feedback" icon={Star} gradient="from-amber-400 to-orange-500" />
        <VendorMetricCard label="Total Leads" value={summary.totalLeads.toLocaleString("en-IN")} helper="Booking enquiries received" icon={MessageCircle} gradient="from-emerald-500 to-green-600" />
        <VendorMetricCard label="Times Booked" value={summary.timesBooked.toLocaleString("en-IN")} helper="Approved, confirmed, or completed bookings" icon={CalendarCheck} gradient="from-pink-500 to-rose-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-6">
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">Audience Trend</CardTitle>
            <p className="text-xs text-gray-400">Views, leads, and bookings from the backend analytics feed.</p>
          </CardHeader>
          <CardContent className="pt-2 pb-4">
            {isAnalyticsLoading ? (
              <p className="text-sm text-gray-500 py-16 text-center">Loading analytics...</p>
            ) : analyticsError ? (
              <p className="text-sm text-red-600 py-8 text-center">{analyticsError}</p>
            ) : chartSeries.length === 0 ? (
              <p className="text-sm text-gray-500 py-16 text-center">No analytics data is available yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartSeries} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="views" stroke="#3b82f6" fill="url(#viewsGradient)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="leads" stroke="#10b981" fill="url(#leadsGradient)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="bookings" stroke="#f43f5e" fill="url(#bookingsGradient)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900">Recent Activity</CardTitle>
            <p className="text-xs text-gray-400">Notifications and booking updates from live marketplace data.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {isMarketplaceLoading ? (
              <p className="text-sm text-gray-500">Loading recent activity...</p>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500">New activity will appear here once users start interacting.</p>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="rounded-2xl border border-gray-100 bg-white px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.helper}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-900">Upcoming Bookings</CardTitle>
          <p className="text-xs text-gray-400">The next confirmed and pending jobs from your live booking queue.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingBookings.length === 0 ? (
            <p className="text-sm text-gray-500">Upcoming bookings will appear here once the backend returns them.</p>
          ) : (
            upcomingBookings.map((booking) => (
              <div key={booking.id} className="rounded-2xl border border-gray-100 bg-white px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{booking.userName}</p>
                  <p className="text-sm text-gray-500">{booking.listingName}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDisplayDate(booking.date)} • {booking.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{booking.amount}</p>
                  <p className="text-xs text-gray-500 mt-1">{booking.status.replaceAll("_", " ")}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">Saved Profiles</CardTitle>
              <p className="text-xs text-gray-400">
                See which of your profiles users are saving so you can spot the strongest demand.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {savedProfileTotals.saveCount} total saves
              </span>
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => navigate("/dashboard?tab=listings")}>
                Manage Profiles
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isSavedProfilesLoading ? (
            <p className="text-sm text-gray-500">Loading saved-profile activity...</p>
          ) : savedProfilesError ? (
            <p className="text-sm text-red-600">{savedProfilesError}</p>
          ) : savedProfiles.length === 0 ? (
            <p className="text-sm text-gray-500">
              Your saved-profile activity will appear here once users start bookmarking your approved listings.
            </p>
          ) : (
            savedProfiles.slice(0, 5).map((profile) => (
              <div key={profile.photographerId} className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <img src={profile.image} alt={profile.listingName} className="h-12 w-12 rounded-xl object-cover" />
                  <div>
                    <p className="font-semibold text-gray-900">{profile.listingName}</p>
                    <p className="text-xs text-gray-500">
                      {[profile.city, profile.state].filter(Boolean).join(", ") || "Location unavailable"}
                    </p>
                    {profile.lastSavedAt && (
                      <p className="mt-1 text-xs text-gray-400">
                        Last saved on {formatDisplayDate(profile.lastSavedAt)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{profile.saveCount}</p>
                  <p className="text-xs text-gray-500">
                    save{profile.saveCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ListingsPage({
  onAddListing,
  onEditListing,
}: {
  onAddListing: () => void;
  onEditListing: (listingId: string) => void;
}) {
  const { listings, reviews, isLoading } = useMarketplace();
  const vendorListings = listings;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profiles</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {vendorListings.length} profile{vendorListings.length !== 1 ? "s" : ""} synced from the backend.
          </p>
        </div>
        <Button
          onClick={onAddListing}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Profile
        </Button>
      </div>

      {isLoading ? (
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="py-16 text-center text-sm text-gray-500">Loading profiles...</CardContent>
        </Card>
      ) : vendorListings.length === 0 ? (
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="py-16 text-center text-sm text-gray-500">
            Your profiles will appear here once the backend returns them.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {vendorListings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="relative h-44 overflow-hidden bg-gray-100">
                <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3">
                  {listing.status === "approved" ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-500/90 text-white shadow">
                      <CalendarCheck className="w-3 h-3" /> Approved
                    </span>
                  ) : listing.status === "rejected" ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-500/90 text-white shadow">
                      <XCircle className="w-3 h-3" /> Rejected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-yellow-500/90 text-white shadow">
                      <MessageCircle className="w-3 h-3" /> Pending
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4">
                {(() => {
                  const listingReviews = reviews.filter((review) => review.photographerId === listing.id);
                  const averageRating = listingReviews.length === 0
                    ? 0
                    : listingReviews.reduce((sum, review) => sum + review.rating, 0) / listingReviews.length;

                  return (
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {listingReviews.length === 0 ? "No ratings yet" : `${averageRating.toFixed(1)} avg`}
                      </div>
                      <span className="text-xs text-gray-500">
                        {listingReviews.length} review{listingReviews.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  );
                })()}
                <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{listing.title}</h3>
                <p className="mt-2 text-xs text-gray-500">{listing.subCategory} • {listing.city}, {listing.state}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                  <span className="text-sm font-semibold text-gray-900">{listing.price}</span>
                  <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={() => onEditListing(listing.id)}>
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface VendorDashboardProps {
  onBack?: () => void;
}

export function VendorDashboard({ onBack: _onBack }: VendorDashboardProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeKey, setActiveKey] = useState("dashboard");
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const { listings } = useMarketplace();

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
    const editingListing = editingListingId
      ? listings.find((listing) => listing.id === editingListingId) ?? null
      : null;

    if (showCreateListing || editingListing) {
      return (
        <CreateListingPage
          onBack={() => {
            setShowCreateListing(false);
            setEditingListingId(null);
          }}
          existingListing={editingListing}
        />
      );
    }

    switch (activeKey) {
      case "dashboard":
        return <VendorOverview />;
      case "messages":
        return <MarketplaceVendorMessages />;
      case "bookings":
        return <MarketplaceVendorBookings />;
      case "listings":
        return (
          <ListingsPage
            onAddListing={() => {
              setEditingListingId(null);
              setShowCreateListing(true);
            }}
            onEditListing={(listingId) => {
              setShowCreateListing(false);
              setEditingListingId(listingId);
            }}
          />
        );
      case "reviews":
        return <VendorReviewsPage />;
      case "schedulers":
        return <SchedulersPage />;
      case "statistics":
        return <StatisticsPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <VendorOverview />;
    }
  };

  return (
    <div className="flex h-screen min-w-0 overflow-x-clip overflow-y-hidden bg-gray-50">
      <DashboardSidebar activeKey={activeKey} onNavigate={handleNavigate} />
      <main className="min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
}
