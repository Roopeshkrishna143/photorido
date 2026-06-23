import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { useSearchParams } from "react-router";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  FileWarning,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Scale,
  ShieldCheck,
  UserPlus,
  XCircle,
} from "lucide-react";
import { useAuth, type UserRole } from "../../context/AuthContext";
import {
  BookingStatus,
  MarketplaceBooking,
  MarketplaceListing,
  MarketplaceReview,
  useMarketplace,
} from "../../context/MarketplaceContext";
import { api, getErrorMessage, unwrapArray } from "../../lib/api";
import { formatDisplayDate, formatDisplayDateTime } from "../../lib/date";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { DashboardSidebar } from "./DashboardSidebar";
import { SettingsPage } from "./SettingsPage";

type OperationalTab =
  | "dashboard"
  | "verification"
  | "operations"
  | "support"
  | "moderation"
  | "finance"
  | "marketing";
type SupportTicketStatus = "open" | "in-progress" | "resolved" | "closed";

type VerificationView =
  | "dashboard"
  | "pending-vendors"
  | "submitted-documents"
  | "approved-vendors"
  | "rejected-vendors"
  | "verification-requests";

type BookingView =
  | "dashboard"
  | "active-bookings"
  | "reschedules"
  | "booking-escalations";

type SupportView =
  | "dashboard"
  | "tickets"
  | "assigned-tickets"
  | "support-escalations";

type ModerationView =
  | "dashboard"
  | "moderation-reviews"
  | "media-queue"
  | "warnings"
  | "ban-requests";

interface SupportTicket {
  id: string;
  linkedUserId: string;
  linkedUserName: string;
  linkedUserRole: string;
  assignedToUserId: string;
  assignedToName: string;
  issueTitle: string;
  description: string;
  status: SupportTicketStatus;
  resolutionNote?: string;
  activityHistory?: Array<{
    type: string;
    note: string;
    createdAt: string;
    createdByName?: string;
  }>;
  escalatedAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface VendorMediaGroup {
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  listings: MarketplaceListing[];
}

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

const TAB_META: Record<
  OperationalTab,
  { title: string; description: string; icon: ElementType; badge: string }
> = {
  dashboard: {
    title: "Operations Dashboard",
    description:
      "A shared workspace for internal staff roles, queues, escalations, and cross-team handoffs.",
    icon: LayoutDashboard,
    badge: "Operations",
  },
  verification: {
    title: "Verification Dashboard",
    description:
      "Review vendor onboarding, document requests, verification decisions, and suspended onboarding cases.",
    icon: ShieldCheck,
    badge: "Verification",
  },
  operations: {
    title: "Booking Operations",
    description:
      "Coordinate active bookings, reschedules, status changes, booking escalations, and customer-vendor contact.",
    icon: BookOpen,
    badge: "Bookings",
  },
  support: {
    title: "Support Dashboard",
    description:
      "Track user/vendor support context, ticket status changes, assignments, and escalation workflows.",
    icon: MessageSquare,
    badge: "Support",
  },
  moderation: {
    title: "Moderation Dashboard",
    description:
      "Moderate reviews, uploaded media, hidden content, removals, warnings, and ban escalation requests.",
    icon: ClipboardCheck,
    badge: "Moderation",
  },
  finance: {
    title: "Finance Dashboard",
    description:
      "Monitor transaction review, refunds, vendor payouts, finance reports, and frozen transaction queues.",
    icon: Scale,
    badge: "Finance",
  },
  marketing: {
    title: "Marketing Dashboard",
    description:
      "Manage search ads, homepage banners, featured listings, campaigns, and newsletter operations.",
    icon: Megaphone,
    badge: "Marketing",
  },
};

const FIELD_CLASS =
  "h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

function statusClass(status: string) {
  if (
    status === "approved" ||
    status === "resolved" ||
    status === "closed" ||
    status === "completed" ||
    status === "active"
  )
    return "bg-green-100 text-green-700 border-green-200";
  if (
    status === "rejected" ||
    status === "removed" ||
    status === "cancelled" ||
    status === "rejected_by_vendor"
  )
    return "bg-red-100 text-red-700 border-red-200";
  if (
    status === "hidden" ||
    status === "in-progress" ||
    status === "confirmed" ||
    status === "approved_by_vendor"
  )
    return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-yellow-100 text-yellow-700 border-yellow-200";
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClass(status)}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
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

function PageHeader({ tab }: { tab: OperationalTab }) {
  const { user } = useAuth();
  const meta = TAB_META[tab];
  const Icon = meta.icon;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{meta.title}</h1>
          <p className="mt-1 text-sm text-gray-500">{meta.description}</p>
        </div>
      </div>
      <Badge
        variant="secondary"
        className="w-fit border-0 bg-blue-100 text-blue-700"
      >
        {ROLE_LABELS[user?.role ?? "staff"]} / {meta.badge}
      </Badge>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500">
      {text}
    </p>
  );
}

function VerificationDashboard({
  view = "dashboard",
}: {
  view?: VerificationView;
}) {
  const { listings, refreshMarketplace } = useMarketplace();
  const [noteById, setNoteById] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [requestListing, setRequestListing] = useState<MarketplaceListing | null>(null);
  const [documentRequest, setDocumentRequest] = useState({
    message: "",
  });
  const grouped = {
    pending: listings.filter(
      (listing) => listing.status === "pending" && !listing.documentsRequestedAt,
    ),
    approved: listings.filter((listing) => listing.status === "approved"),
    rejected: listings.filter((listing) => listing.status === "rejected"),
    documentRequests: listings.filter(
      (listing) =>
        listing.documentsRequestedAt &&
        !listing.documentsSubmittedAt &&
        listing.status === "pending",
    ),
    submittedDocuments: listings.filter(
      (listing) =>
        listing.documentsRequestedAt &&
        listing.documentsSubmittedAt &&
        listing.status === "pending",
    ),
  };

  const updateStatus = async (
    listing: MarketplaceListing,
    status: MarketplaceListing["status"],
    requestDocuments = false,
  ) => {
    setBusyId(listing.id);
    try {
      await api.post(`/operations/vendors/${listing.id}/status`, {
        status,
        note:
          noteById[listing.id] ||
          (requestDocuments ? documentRequest.message || "Additional documents requested." : ""),
        requestedDocuments: [],
        documentRequestMessage: requestDocuments ? documentRequest.message : "",
        requestDocuments,
      });
      if (requestDocuments) {
        setRequestListing(null);
        setDocumentRequest({ message: "" });
      }
      await refreshMarketplace();
    } finally {
      setBusyId(null);
    }
  };

  const renderListing = (listing: MarketplaceListing) => {
    const profileNotSubmitted = listing.id.startsWith("vendor-account-");

    return (
    <div
      key={listing.id}
      className="rounded-2xl border border-gray-100 bg-white p-4"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-semibold text-gray-900">{listing.title}</p>
          <p className="mt-1 text-sm text-gray-500">
            {listing.vendorName}
            {[listing.city, listing.state].filter(Boolean).length > 0
              ? ` - ${[listing.city, listing.state].filter(Boolean).join(", ")}`
              : ""}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {profileNotSubmitted
              ? "Status: Profile Not Submitted"
              : `${listing.category} / ${listing.subCategory}`}
          </p>
          {listing.documentsRequestedAt && (
            <p className="mt-2 text-xs font-semibold text-amber-600">
              Documents requested{" "}
              {formatDisplayDateTime(listing.documentsRequestedAt)}
            </p>
          )}
          {listing.requestedDocuments && listing.requestedDocuments.length > 0 && (
            <p className="mt-1 text-xs text-amber-700">
              Requested: {listing.requestedDocuments.join(", ")}
            </p>
          )}
          {listing.documentsSubmittedAt && (
            <p className="mt-1 text-xs font-semibold text-blue-600">
              Documents Submitted{" "}
              {formatDisplayDateTime(listing.documentsSubmittedAt)}
            </p>
          )}
          {listing.verificationNote && (
            <p className="mt-2 text-sm text-gray-600">
              {listing.verificationNote}
            </p>
          )}
        </div>
        <StatusBadge status={profileNotSubmitted ? "Profile Not Submitted" : listing.status} />
      </div>
      {listing.documentUploads && listing.documentUploads.length > 0 && (
        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
          <p className="text-xs font-semibold text-gray-600">Uploaded documents</p>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {listing.documentUploads.map((document) => (
              <a
                key={`${document.url}-${document.uploadedAt}`}
                href={document.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2 text-xs font-medium text-blue-700 hover:border-blue-200"
              >
                <FileText className="h-3.5 w-3.5" />
                <span className="min-w-0 flex-1 truncate">{document.originalName}</span>
                <span className="text-gray-400">{formatDisplayDateTime(document.uploadedAt)}</span>
              </a>
            ))}
          </div>
        </div>
      )}
      {!profileNotSubmitted && (
      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(180px,1fr)_auto_auto_auto]">
        <Input
          value={noteById[listing.id] ?? ""}
          onChange={(event) =>
            setNoteById((current) => ({
              ...current,
              [listing.id]: event.target.value,
            }))
          }
          placeholder="Verification note"
          className="rounded-xl border-gray-200"
        />
        <Button
          disabled={busyId === listing.id || listing.status === "approved"}
          className="gap-1 bg-green-600 text-white hover:bg-green-700"
          onClick={() => void updateStatus(listing, "approved")}
        >
          <CheckCircle2 className="h-4 w-4" /> {listing.status === "approved" ? "Approved" : "Approve"}
        </Button>
        <Button
          disabled={busyId === listing.id || listing.status === "rejected"}
          className="gap-1 bg-red-500 text-white hover:bg-red-600"
          onClick={() => void updateStatus(listing, "rejected")}
        >
          <XCircle className="h-4 w-4" /> {listing.status === "rejected" ? "Rejected" : "Reject"}
        </Button>
        <Button
          disabled={busyId === listing.id}
          variant="outline"
          className="gap-1 rounded-xl text-amber-700"
          onClick={() => {
            setRequestListing(listing);
            setDocumentRequest({
              message: listing.documentRequestMessage || listing.verificationNote || "",
            });
          }}
        >
          <FileWarning className="h-4 w-4" /> Request Docs
        </Button>
      </div>
      )}
    </div>
    );
  };

  // ── Focused views ──────────────────────────────────────────────────────────
  const requestDocumentsDialog = (
    <Dialog open={Boolean(requestListing)} onOpenChange={(open) => !open && setRequestListing(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Documents</DialogTitle>
          <DialogDescription>
            Send a document request to {requestListing?.vendorName || "the vendor"} and keep the profile in the verification queue.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Textarea
            value={documentRequest.message}
            onChange={(event) =>
              setDocumentRequest((current) => ({
                ...current,
                message: event.target.value,
              }))
            }
            placeholder={"Please provide:\n\n* Government ID\n* Portfolio samples\n* Business registration document"}
            rows={7}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRequestListing(null)}>
              Cancel
            </Button>
            <Button
              className="bg-amber-600 text-white hover:bg-amber-700"
              disabled={!requestListing || busyId === requestListing.id || documentRequest.message.trim().length < 2}
              onClick={() => requestListing && void updateStatus(requestListing, "pending", true)}
            >
              Send Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (view === "pending-vendors") {
    return (
      <div className="space-y-6">
        <PageHeader tab="verification" />
        {requestDocumentsDialog}
        <Section title="Pending Vendors">
          {grouped.pending.length ? (
            grouped.pending.map(renderListing)
          ) : (
            <EmptyState text="No pending vendor profiles." />
          )}
        </Section>
      </div>
    );
  }

  if (view === "approved-vendors") {
    return (
      <div className="space-y-6">
        <PageHeader tab="verification" />
        {requestDocumentsDialog}
        <Section title="Approved Vendors">
          {grouped.approved.length ? (
            grouped.approved.map(renderListing)
          ) : (
            <EmptyState text="No approved vendor profiles." />
          )}
        </Section>
      </div>
    );
  }

  if (view === "submitted-documents") {
    return (
      <div className="space-y-6">
        <PageHeader tab="verification" />
        {requestDocumentsDialog}
        <Section title="Documents Submitted">
          {grouped.submittedDocuments.length ? (
            grouped.submittedDocuments.map(renderListing)
          ) : (
            <EmptyState text="No vendors have submitted requested documents." />
          )}
        </Section>
      </div>
    );
  }

  if (view === "rejected-vendors") {
    return (
      <div className="space-y-6">
        <PageHeader tab="verification" />
        {requestDocumentsDialog}
        <Section title="Rejected Vendors">
          {grouped.rejected.length ? (
            grouped.rejected.map(renderListing)
          ) : (
            <EmptyState text="No rejected vendor profiles." />
          )}
        </Section>
      </div>
    );
  }

  if (view === "verification-requests") {
    return (
      <div className="space-y-6">
        <PageHeader tab="verification" />
        {requestDocumentsDialog}
        <Section title="Verification Requests — Document Requested">
          {grouped.documentRequests.length ? (
            grouped.documentRequests.map(renderListing)
          ) : (
            <EmptyState text="No vendors with outstanding document requests." />
          )}
        </Section>
      </div>
    );
  }

  // ── Default: summary dashboard ─────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader tab="verification" />
      {requestDocumentsDialog}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Pending Vendors"
          value={grouped.pending.length}
          helper="Awaiting review"
        />
        <MetricCard
          label="Approved Vendors"
          value={grouped.approved.length}
          helper="Visible in marketplace"
        />
        <MetricCard
          label="Rejected Vendors"
          value={grouped.rejected.length}
          helper="Needs correction"
        />
        <MetricCard
          label="Document Requests"
          value={grouped.documentRequests.length}
          helper="Awaiting vendor updates"
        />
        <MetricCard
          label="Ready for Re-review"
          value={grouped.submittedDocuments.length}
          helper="Documents received"
        />
      </div>
      <Section title="Recent Activity — Pending Vendors">
        {[...grouped.submittedDocuments, ...grouped.pending].slice(0, 5).length ? (
          [...grouped.submittedDocuments, ...grouped.pending].slice(0, 5).map(renderListing)
        ) : (
          <EmptyState text="No pending vendor profiles." />
        )}
      </Section>
    </div>
  );
}

function BookingCoordinatorDashboard({
  view = "dashboard",
}: {
  view?: BookingView;
}) {
  const { bookings, refreshMarketplace } = useMarketplace();
  const [drafts, setDrafts] = useState<
    Record<
      string,
      { status?: BookingStatus; date?: string; time?: string; note?: string }
    >
  >({});
  const [rescheduleBooking, setRescheduleBooking] = useState<MarketplaceBooking | null>(null);
  const [rescheduleDraft, setRescheduleDraft] = useState({
    date: "",
    time: "",
    note: "",
  });
  const activeBookings = bookings.filter(
    (booking) =>
      booking.status !== "completed" && booking.status !== "cancelled",
  );
  const rescheduled = bookings.filter((booking) =>
    Boolean(booking.rescheduledAt) && !booking.rescheduleResolvedAt,
  );
  const escalated = bookings.filter(
    (booking) => Boolean(booking.escalatedAt) && !booking.escalationResolvedAt,
  );

  const patchBooking = async (
    booking: MarketplaceBooking,
    flags: {
      escalate?: boolean;
      resolveEscalation?: boolean;
      deescalate?: boolean;
      reopenEscalation?: boolean;
      cancelReschedule?: boolean;
    } = {},
  ) => {
    const draft = drafts[booking.id] ?? {};
    await api.post(`/operations/bookings/${booking.id}/workflow`, {
      status: draft.status,
      note: draft.note,
      ...flags,
    });
    await refreshMarketplace();
  };

  const submitReschedule = async () => {
    if (!rescheduleBooking) return;

    await api.post(`/operations/bookings/${rescheduleBooking.id}/workflow`, {
      date: rescheduleDraft.date,
      time: rescheduleDraft.time,
      note: rescheduleDraft.note,
    });
    setRescheduleBooking(null);
    setRescheduleDraft({ date: "", time: "", note: "" });
    await refreshMarketplace();
  };

  const renderBooking = (booking: MarketplaceBooking) => (
    <div
      key={booking.id}
      className="rounded-2xl border border-gray-100 bg-white p-4"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-semibold text-gray-900">
            {booking.userName} / {booking.vendorName}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {booking.listingName} - {booking.eventType}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {formatDisplayDate(booking.date)} at {booking.time} -{" "}
            {booking.location}
          </p>
          {booking.operationsNote && (
            <p className="mt-2 text-sm text-gray-600">
              Booking Coordinator Update: {booking.operationsNote}
            </p>
          )}
          {booking.rescheduledAt && !booking.rescheduleResolvedAt && (
            <p className="mt-2 text-xs font-semibold text-blue-600">
              Reschedule workflow opened {formatDisplayDateTime(booking.rescheduledAt)}
            </p>
          )}
          {booking.escalatedAt && (
            <p className="mt-1 text-xs font-semibold text-amber-600">
              Escalated {formatDisplayDateTime(booking.escalatedAt)}
            </p>
          )}
          {booking.activityHistory && booking.activityHistory.length > 0 && (
            <div className="mt-3 space-y-1">
              {booking.activityHistory.slice(-3).map((entry) => (
                <p key={`${entry.createdAt}-${entry.type}`} className="text-xs text-gray-500">
                  {formatDisplayDateTime(entry.createdAt)} - {entry.note}
                </p>
              ))}
            </div>
          )}
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[1fr_1fr_auto_auto_auto]">
        <select
          className={FIELD_CLASS}
          value={drafts[booking.id]?.status ?? ""}
          onChange={(event) =>
            setDrafts((current) => ({
              ...current,
              [booking.id]: {
                ...current[booking.id],
                status: event.target.value as BookingStatus,
              },
            }))
          }
        >
          <option value="">Change status</option>
          {[
            "pending",
            "approved_by_vendor",
            "confirmed",
            "rejected_by_vendor",
            "completed",
            "cancelled",
          ].map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <Input
          value={drafts[booking.id]?.note ?? ""}
          onChange={(event) =>
            setDrafts((current) => ({
              ...current,
              [booking.id]: {
                ...current[booking.id],
                note: event.target.value,
              },
            }))
          }
          placeholder="Coordinator note"
          className="rounded-xl border-gray-200"
        />
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => void patchBooking(booking)}
        >
          Save Update
        </Button>
        <Button
          variant="outline"
          className="rounded-xl text-blue-700"
          onClick={() => {
            setRescheduleBooking(booking);
            setRescheduleDraft({
              date: booking.date,
              time: booking.time,
              note: drafts[booking.id]?.note ?? booking.operationsNote ?? "",
            });
          }}
        >
          Reschedule
        </Button>
        <Button
          variant="outline"
          className="gap-1 rounded-xl text-amber-700"
          onClick={() => void patchBooking(booking, { escalate: true })}
        >
          <AlertTriangle className="h-4 w-4" /> Escalate
        </Button>
      </div>
      {(booking.escalatedAt || booking.rescheduledAt) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {booking.escalatedAt ? (
            <>
              <Button
                size="sm"
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={() => void patchBooking(booking, { resolveEscalation: true })}
              >
                Resolve Escalation
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                onClick={() => void patchBooking(booking, { deescalate: true })}
              >
                De-escalate
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl text-amber-700"
              onClick={() => void patchBooking(booking, { reopenEscalation: true })}
            >
              Reopen Escalation
            </Button>
          )}
          {booking.rescheduledAt && !booking.rescheduleResolvedAt && (
            <Button
              size="sm"
              variant="outline"
              className="w-full rounded-xl xl:w-auto"
              onClick={() => void patchBooking(booking, { cancelReschedule: true })}
            >
              Cancel Reschedule
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const rescheduleDialog = (
    <Dialog open={Boolean(rescheduleBooking)} onOpenChange={(open) => !open && setRescheduleBooking(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule Booking</DialogTitle>
          <DialogDescription>
            Send a Booking Coordinator Update to the user and vendor.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            type="date"
            value={rescheduleDraft.date}
            onChange={(event) =>
              setRescheduleDraft((current) => ({ ...current, date: event.target.value }))
            }
            className="rounded-xl border-gray-200"
          />
          <Input
            value={rescheduleDraft.time}
            onChange={(event) =>
              setRescheduleDraft((current) => ({ ...current, time: event.target.value }))
            }
            placeholder="New time"
            className="rounded-xl border-gray-200"
          />
          <Textarea
            value={rescheduleDraft.note}
            onChange={(event) =>
              setRescheduleDraft((current) => ({ ...current, note: event.target.value }))
            }
            placeholder="Coordinator note"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRescheduleBooking(null)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={!rescheduleDraft.date || !rescheduleDraft.time || rescheduleDraft.note.trim().length < 2}
              onClick={() => void submitReschedule()}
            >
              Submit Reschedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // ── Focused views ──────────────────────────────────────────────────────────
  if (view === "active-bookings") {
    return (
      <div className="space-y-6">
        <PageHeader tab="operations" />
        {rescheduleDialog}
        <Section title="Active Bookings">
          {activeBookings.length ? (
            activeBookings.map(renderBooking)
          ) : (
            <EmptyState text="No active bookings." />
          )}
        </Section>
      </div>
    );
  }

  if (view === "reschedules") {
    return (
      <div className="space-y-6">
        <PageHeader tab="operations" />
        {rescheduleDialog}
        <Section title="Reschedule Requests">
          {rescheduled.length ? (
            rescheduled.map(renderBooking)
          ) : (
            <EmptyState text="No rescheduled bookings yet." />
          )}
        </Section>
      </div>
    );
  }

  if (view === "booking-escalations") {
    return (
      <div className="space-y-6">
        <PageHeader tab="operations" />
        {rescheduleDialog}
        <Section title="Escalated Bookings">
          {escalated.length ? (
            escalated.map(renderBooking)
          ) : (
            <EmptyState text="No escalated booking issues." />
          )}
        </Section>
      </div>
    );
  }

  // ── Default: summary dashboard ─────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader tab="operations" />
      {rescheduleDialog}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Active Bookings"
          value={activeBookings.length}
          helper="Open booking workflows"
        />
        <MetricCard
          label="Reschedule Requests"
          value={rescheduled.length}
          helper="Records with reschedule activity"
        />
        <MetricCard
          label="Escalated Issues"
          value={escalated.length}
          helper="Needs senior attention"
        />
      </div>
      <Section title="Recent Operational Activity">
        {[...escalated, ...rescheduled, ...activeBookings].slice(0, 5).length ? (
          [...escalated, ...rescheduled, ...activeBookings].slice(0, 5).map(renderBooking)
        ) : (
          <EmptyState text="No active operational activity." />
        )}
      </Section>
    </div>
  );
}

export function SupportDashboard({
  view = "dashboard",
  readOnly = false,
}: {
  view?: SupportView;
  readOnly?: boolean;
}) {
  const { platformUsers } = useMarketplace();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    linkedUserId: "",
    issueTitle: "",
    description: "",
  });
  const [supportNoteById, setSupportNoteById] = useState<Record<string, string>>({});

  const loadTickets = useCallback(async () => {
    try {
      const payload = await api.get("/operations/support-tickets");
      setTickets(unwrapArray<SupportTicket>(payload));
      setError(null);
    } catch (nextError) {
      setError(getErrorMessage(nextError, "Unable to load support tickets."));
    }
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  const createTicket = async () => {
    await api.post("/operations/support-tickets", form);
    setForm({ linkedUserId: "", issueTitle: "", description: "" });
    await loadTickets();
  };

  const patchTicket = async (
    ticket: SupportTicket,
    input: Partial<SupportTicket> & {
      note?: string;
      escalate?: boolean;
      deescalate?: boolean;
      reopen?: boolean;
      close?: boolean;
    },
  ) => {
    if (readOnly) return;

    await api.patch(`/operations/support-tickets/${ticket.id}`, input);
    await loadTickets();
  };

  const renderTicket = (
    ticket: SupportTicket,
    actionMode: "full" | "escalationFull" | "none" | "reopenOnly" = "full",
  ) => (
    <div
      key={ticket.id}
      className="rounded-2xl border border-gray-100 bg-white p-4"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900">{ticket.issueTitle}</p>
          <p className="mt-1 break-words text-sm text-gray-600">{ticket.description}</p>
          <p className="mt-1 text-xs text-gray-400">
            Linked: {ticket.linkedUserName || "Unlinked"} / Assigned:{" "}
            {ticket.assignedToName || "Unassigned"}
          </p>
          {ticket.escalatedAt && (
            <p className="mt-2 text-xs font-semibold text-amber-600">
              Escalated {formatDisplayDateTime(ticket.escalatedAt)}
            </p>
          )}
          {ticket.resolutionNote && (
            <p className="mt-2 break-words text-sm text-gray-600">
              Resolution Note: {ticket.resolutionNote}
            </p>
          )}
          {ticket.activityHistory && ticket.activityHistory.length > 0 && (
            <div className="mt-3 space-y-1">
              {ticket.activityHistory.slice(-3).map((entry) => (
                <p key={`${entry.createdAt}-${entry.type}`} className="break-words text-xs text-gray-500">
                  {formatDisplayDateTime(entry.createdAt)} - {entry.note}
                </p>
              ))}
            </div>
          )}
        </div>
        <StatusBadge status={ticket.status} />
      </div>
      {!readOnly && actionMode !== "none" && (
        <div className={actionMode === "full" || actionMode === "escalationFull"
          ? "mt-4 grid grid-cols-1 gap-2 xl:grid-cols-[minmax(180px,1fr)_minmax(220px,1.2fr)_auto_auto_auto_auto_auto]"
          : "mt-4 flex justify-end"
        }>
          {(actionMode === "full" || actionMode === "escalationFull") && (
            <>
              <select
                className={FIELD_CLASS}
                value={ticket.assignedToUserId || ""}
                onChange={(event) => void patchTicket(ticket, { assignedToUserId: event.target.value })}
              >
                <option value="">Assign ticket</option>
                {platformUsers
                  .filter((user) => user.role !== "user" && user.role !== "vendor")
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} / {user.role}
                    </option>
                  ))}
              </select>
              <Input
                value={supportNoteById[ticket.id] ?? ""}
                onChange={(event) =>
                  setSupportNoteById((current) => ({
                    ...current,
                    [ticket.id]: event.target.value,
                  }))
                }
                placeholder="Resolution note"
                className="rounded-xl border-gray-200"
              />
            </>
          )}
          {(ticket.status === "resolved" || ticket.status === "closed") && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl"
              onClick={() => void patchTicket(ticket, { reopen: true })}
            >
              Reopen
            </Button>
          )}
          {(actionMode === "full" || actionMode === "escalationFull") && ticket.status !== "resolved" && ticket.status !== "closed" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="w-full rounded-xl xl:w-auto"
                onClick={() => void patchTicket(ticket, { status: "in-progress" })}
              >
                In Progress
              </Button>
              <Button
                size="sm"
                className="w-full bg-green-600 text-white hover:bg-green-700 xl:w-auto"
                onClick={() => void patchTicket(ticket, { status: "resolved", note: supportNoteById[ticket.id] })}
              >
                {actionMode === "escalationFull" ? "Resolve Escalation" : "Resolve"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full rounded-xl xl:w-auto"
                onClick={() => void patchTicket(ticket, { close: true })}
              >
                Close
              </Button>
            </>
          )}
          {(actionMode === "full" || actionMode === "escalationFull") && !ticket.escalatedAt && ticket.status !== "resolved" && ticket.status !== "closed" && (
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-1 rounded-xl text-amber-700 xl:w-auto"
              onClick={() => void patchTicket(ticket, { escalate: true, note: supportNoteById[ticket.id] })}
            >
              <AlertTriangle className="h-4 w-4" /> Escalate
            </Button>
          )}
          {(actionMode === "full" || actionMode === "escalationFull") && ticket.escalatedAt && ticket.status !== "resolved" && ticket.status !== "closed" && (
            <Button
              size="sm"
              variant="outline"
              className="w-full rounded-xl xl:w-auto"
              onClick={() => void patchTicket(ticket, { deescalate: true, note: supportNoteById[ticket.id] })}
            >
              De-escalate
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const grouped = {
    open: tickets.filter((ticket) => ticket.status === "open"),
    progress: tickets.filter((ticket) => ticket.status === "in-progress"),
    resolved: tickets.filter((ticket) => ticket.status === "resolved"),
    closed: tickets.filter((ticket) => ticket.status === "closed"),
    assigned: tickets.filter((ticket) => Boolean(ticket.assignedToUserId) && ticket.status !== "resolved" && ticket.status !== "closed"),
    escalated: tickets.filter((ticket) => Boolean(ticket.escalatedAt) && ticket.status !== "resolved" && ticket.status !== "closed"),
  };

  const createTicketForm = readOnly ? null : (
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className="grid grid-cols-1 gap-3 pt-6 lg:grid-cols-[1fr_1fr_2fr_auto]">
        <select
          className={FIELD_CLASS}
          value={form.linkedUserId}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              linkedUserId: event.target.value,
            }))
          }
        >
          <option value="">Link user/vendor</option>
          {platformUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} / {user.role}
            </option>
          ))}
        </select>
        <Input
          value={form.issueTitle}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              issueTitle: event.target.value,
            }))
          }
          placeholder="Issue title"
          className="rounded-xl border-gray-200"
        />
        <Input
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          placeholder="Description"
          className="rounded-xl border-gray-200"
        />
        <Button
          className="gap-1 bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => void createTicket()}
        >
          <UserPlus className="h-4 w-4" /> Create Ticket
        </Button>
      </CardContent>
    </Card>
  );

  const errorBanner = error && (
    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {error}
    </p>
  );

  // ── Focused views ──────────────────────────────────────────────────────────
  if (view === "tickets") {
    return (
      <div className="space-y-6">
        <PageHeader tab="support" />
        {errorBanner}
        {createTicketForm}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Section title="Open Tickets">
            {grouped.open.length ? (
              grouped.open.map((ticket) => renderTicket(ticket, "none"))
            ) : (
              <EmptyState text="No open tickets." />
            )}
          </Section>
          <Section title="Escalated Tickets">
            {grouped.escalated.length ? (
              grouped.escalated.map((ticket) => renderTicket(ticket, "none"))
            ) : (
              <EmptyState text="No escalated tickets." />
            )}
          </Section>
          <Section title="Closed / Resolved Tickets">
            {grouped.closed.length || grouped.resolved.length ? (
              [...grouped.resolved, ...grouped.closed].map((ticket) => renderTicket(ticket, "reopenOnly"))
            ) : (
              <EmptyState text="No closed or resolved tickets." />
            )}
          </Section>
        </div>
      </div>
    );
  }

  if (view === "assigned-tickets") {
    return (
      <div className="space-y-6">
        <PageHeader tab="support" />
        {errorBanner}
        <Section title="Assigned Tickets">
          {grouped.assigned.length ? (
            grouped.assigned.map((ticket) => renderTicket(ticket, "full"))
          ) : (
            <EmptyState text="No assigned tickets." />
          )}
        </Section>
      </div>
    );
  }

  if (view === "support-escalations") {
    return (
      <div className="space-y-6">
        <PageHeader tab="support" />
        {errorBanner}
        <Section title="Escalated Tickets">
          {grouped.escalated.length ? (
            grouped.escalated.map((ticket) => renderTicket(ticket, "escalationFull"))
          ) : (
            <EmptyState text="No escalated tickets." />
          )}
        </Section>
      </div>
    );
  }

  // ── Default: summary dashboard ─────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader tab="support" />
      {errorBanner}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Open"
          value={grouped.open.length}
          helper="Awaiting action"
        />
        <MetricCard
          label="Assigned"
          value={grouped.assigned.length}
          helper="Owned active tickets"
        />
        <MetricCard
          label="Escalated"
          value={grouped.escalated.length}
          helper="Needs senior review"
        />
        <MetricCard
          label="Resolved"
          value={grouped.resolved.length + grouped.closed.length}
          helper="Completed support work"
        />
      </div>
      {createTicketForm}
      <Section title="Recent Support Activity">
        {tickets.slice(0, 5).length ? (
          tickets.slice(0, 5).map(renderTicket)
        ) : (
          <EmptyState text="No support activity yet." />
        )}
      </Section>
    </div>
  );
}

function ModerationDashboard({
  view = "dashboard",
}: {
  view?: ModerationView;
}) {
  const { reviews, listings, refreshMarketplace } = useMarketplace();
  const [noteById, setNoteById] = useState<Record<string, string>>({});
  const [selectedMediaVendor, setSelectedMediaVendor] = useState<VendorMediaGroup | null>(null);
  const mediaCandidates = useMemo<VendorMediaGroup[]>(() => {
    const groups = new Map<string, VendorMediaGroup>();

    listings.forEach((listing) => {
      const vendorId = listing.vendorId || listing.vendorEmail || listing.vendorName;
      const existing = groups.get(vendorId);

      if (existing) {
        existing.listings.push(listing);
        return;
      }

      groups.set(vendorId, {
        vendorId,
        vendorName: listing.vendorName,
        vendorEmail: listing.vendorEmail,
        listings: [listing],
      });
    });

    return Array.from(groups.values());
  }, [listings]);
  const flaggedListings = listings.filter(
    (listing) => listing.status === "rejected" || listing.verificationNote,
  );
  const warnedReviews = reviews.filter((review) => Boolean(review.warnedAt));
  const banRequests = reviews.filter((review) => Boolean(review.banEscalatedAt));
  const warnedMediaVendors = mediaCandidates.filter((group) =>
    group.listings.some((listing) => Boolean(listing.mediaWarnedAt)),
  );
  const mediaBanRequests = mediaCandidates.filter((group) =>
    group.listings.some((listing) => Boolean(listing.mediaBanEscalatedAt)),
  );

  const moderateReview = async (
    review: MarketplaceReview,
    action: "hide" | "remove" | "restore" | "warn" | "reverse-warning" | "escalate-ban" | "lift-ban",
  ) => {
    const defaultNote = action === "warn"
      ? "Moderator warning issued."
      : action === "escalate-ban"
        ? "Moderator escalated this account for ban review."
        : "";
    await api.post(`/operations/reviews/${review.id}/moderation`, {
      action,
      note: noteById[review.id] || defaultNote,
    });
    await refreshMarketplace();
  };

  const moderateMedia = async (
    group: VendorMediaGroup,
    action: "warn" | "reverse-warning" | "escalate-ban" | "lift-ban",
  ) => {
    const listing = group.listings.find((entry) => entry.mediaWarnedAt || entry.mediaBanEscalatedAt) ?? group.listings[0];
    const defaultNote = action === "warn"
      ? "Moderator warning issued for uploaded media."
      : action === "escalate-ban"
        ? "Moderator escalated this vendor for media ban review."
        : "";
    await api.post("/operations/media/moderation", {
      listingId: listing.id,
      action,
      note: noteById[group.vendorId] || defaultNote,
    });
    setSelectedMediaVendor(null);
    await refreshMarketplace();
  };

  const renderReview = (review: MarketplaceReview) => (
    <div
      key={review.id}
      className="rounded-2xl border border-gray-100 bg-white p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">{review.vendorName}</p>
          <p className="mt-1 text-sm text-gray-600">{review.comment}</p>
          <p className="mt-1 text-xs text-gray-400">
            By {review.userName} / {review.rating} stars
          </p>
          {review.moderationNote && (
            <p className="mt-2 text-sm text-gray-500">
              {review.moderationNote}
            </p>
          )}
          {review.warnedAt && (
            <p className="mt-2 text-xs font-semibold text-amber-600">
              Warning issued {formatDisplayDateTime(review.warnedAt)}
            </p>
          )}
          {review.banEscalatedAt && (
            <p className="mt-1 text-xs font-semibold text-red-600">
              Ban request escalated {formatDisplayDateTime(review.banEscalatedAt)}
            </p>
          )}
        </div>
        <StatusBadge status={review.moderationStatus ?? "active"} />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-[1fr_auto_auto_auto_auto]">
        <Input
          value={noteById[review.id] ?? ""}
          onChange={(event) =>
            setNoteById((current) => ({
              ...current,
              [review.id]: event.target.value,
            }))
          }
          placeholder="Moderation note"
          className="rounded-xl border-gray-200"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => void moderateReview(review, "hide")}
        >
          Hide
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-red-600"
          onClick={() => void moderateReview(review, "remove")}
        >
          Remove
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => void moderateReview(review, review.warnedAt ? "reverse-warning" : "warn")}
        >
          {review.warnedAt ? "Remove Warning" : "Warn"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-amber-700"
          onClick={() => void moderateReview(review, review.banEscalatedAt ? "lift-ban" : "escalate-ban")}
        >
          {review.banEscalatedAt ? "Lift Ban" : "Escalate Ban"}
        </Button>
      </div>
    </div>
  );

  const renderMediaVendor = (group: VendorMediaGroup) => {
    const portfolioCount = group.listings.length;
    const photoCount = group.listings.reduce(
      (sum, listing) =>
        sum +
        1 +
        (listing.portfolio?.length ?? 0) +
        (listing.albums ?? []).reduce((albumSum, album) => albumSum + album.images.length, 0),
      0,
    );
    const albumCount = group.listings.reduce((sum, listing) => sum + (listing.albums?.length ?? 0), 0);
    const linkCount = group.listings.reduce((sum, listing) => sum + (listing.youtubeLinks?.length ?? 0), 0);
    const flaggedListing = group.listings.find((listing) => listing.mediaWarnedAt || listing.mediaBanEscalatedAt);
    const latestNote = flaggedListing?.mediaModerationNote;

    return (
      <div key={group.vendorId} className="rounded-2xl border border-gray-100 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-semibold text-gray-900">{group.vendorName}</p>
            <p className="mt-1 text-sm text-gray-500">{group.vendorEmail}</p>
            <p className="mt-1 text-xs text-gray-400">
              {portfolioCount} portfolios / {photoCount} photos / {albumCount} albums / {linkCount} links
            </p>
            {latestNote && (
              <p className="mt-2 text-sm text-gray-600">{latestNote}</p>
            )}
            {flaggedListing?.mediaWarnedAt && (
              <p className="mt-2 text-xs font-semibold text-amber-600">
                Warning issued {formatDisplayDateTime(flaggedListing.mediaWarnedAt)}
              </p>
            )}
            {flaggedListing?.mediaBanEscalatedAt && (
              <p className="mt-1 text-xs font-semibold text-red-600">
                Ban request escalated {formatDisplayDateTime(flaggedListing.mediaBanEscalatedAt)}
              </p>
            )}
          </div>
          <StatusBadge status={flaggedListing?.status ?? group.listings[0]?.status ?? "active"} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-xl" onClick={() => setSelectedMediaVendor(group)}>
            Open Vendor Media
          </Button>
          {flaggedListing?.mediaWarnedAt && (
            <Button variant="outline" className="rounded-xl" onClick={() => void moderateMedia(group, "reverse-warning")}>
              Remove Warning
            </Button>
          )}
          {flaggedListing?.mediaBanEscalatedAt && (
            <Button variant="outline" className="rounded-xl" onClick={() => void moderateMedia(group, "lift-ban")}>
              Lift Ban
            </Button>
          )}
        </div>
      </div>
    );
  };

  const mediaVendorDialog = (
    <Dialog open={Boolean(selectedMediaVendor)} onOpenChange={(open) => !open && setSelectedMediaVendor(null)}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{selectedMediaVendor?.vendorName || "Vendor"} Portfolio Review</DialogTitle>
          <DialogDescription>
            Review uploaded profile media, albums, image links, and YouTube links before warning or escalating.
          </DialogDescription>
        </DialogHeader>
        {selectedMediaVendor && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <MetricCard label="Portfolios" value={selectedMediaVendor.listings.length} helper="Vendor profiles" />
              <MetricCard
                label="Photos"
                value={selectedMediaVendor.listings.reduce(
                  (sum, listing) =>
                    sum +
                    1 +
                    (listing.portfolio?.length ?? 0) +
                    (listing.albums ?? []).reduce((albumSum, album) => albumSum + album.images.length, 0),
                  0,
                )}
                helper="Featured, portfolio, and album images"
              />
              <MetricCard
                label="Albums"
                value={selectedMediaVendor.listings.reduce((sum, listing) => sum + (listing.albums?.length ?? 0), 0)}
                helper="Grouped uploads"
              />
            </div>

            <div className="max-h-[420px] space-y-5 overflow-y-auto pr-1">
              {selectedMediaVendor.listings.map((listing) => (
                <div key={listing.id} className="rounded-2xl border border-gray-100 bg-white p-4">
                  <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{listing.title}</p>
                      <p className="text-xs text-gray-500">{listing.category} / {listing.subCategory}</p>
                    </div>
                    <StatusBadge status={listing.status} />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[listing.image, ...(listing.portfolio ?? [])].filter(Boolean).map((url, index) => (
                      <div key={`${listing.id}-image-${url}-${index}`} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                        <img src={url} alt={index === 0 ? "Featured media" : "Portfolio media"} className="h-40 w-full object-cover" />
                        <p className="px-3 py-2 text-xs text-gray-500">{index === 0 ? "Featured image" : `Portfolio image ${index}`}</p>
                      </div>
                    ))}
                    {(listing.albums ?? []).map((album) =>
                      album.images.map((url, index) => (
                        <div key={`${listing.id}-${album.name}-${url}-${index}`} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                          <img src={url} alt={album.name} className="h-40 w-full object-cover" />
                          <p className="px-3 py-2 text-xs text-gray-500">Album: {album.name} / Image {index + 1}</p>
                        </div>
                      )),
                    )}
                    {(listing.youtubeLinks ?? []).map((link, index) => (
                      <div key={`${listing.id}-youtube-${index}`} className="rounded-2xl border border-gray-100 bg-white p-4">
                        <p className="text-xs font-semibold text-gray-500">YouTube link</p>
                        <a className="mt-2 block break-all text-sm text-blue-700" href={link.url} target="_blank" rel="noreferrer">
                          {link.url}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Textarea
              value={noteById[selectedMediaVendor.vendorId] ?? ""}
              onChange={(event) =>
                setNoteById((current) => ({
                  ...current,
                  [selectedMediaVendor.vendorId]: event.target.value,
                }))
              }
              placeholder="Moderation note, optionally referencing a portfolio, album, image, or link"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedMediaVendor(null)}>
                Close
              </Button>
              <Button
                variant="outline"
                className="rounded-xl text-amber-700"
                onClick={() => void moderateMedia(selectedMediaVendor, "warn")}
              >
                Warn Vendor
              </Button>
              <Button
                variant="outline"
                className="rounded-xl text-red-700"
                onClick={() => void moderateMedia(selectedMediaVendor, "escalate-ban")}
              >
                Escalate Ban
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  const mediaGrid = (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {mediaCandidates.map(renderMediaVendor)}
    </div>
  );

  // ── Focused views ──────────────────────────────────────────────────────────
  if (view === "moderation-reviews") {
    return (
      <div className="space-y-6">
        <PageHeader tab="moderation" />
        <Section title="Reviews">
          {reviews.length ? (
            reviews.map(renderReview)
          ) : (
            <EmptyState text="No reviews to moderate." />
          )}
        </Section>
      </div>
    );
  }

  if (view === "media-queue") {
    return (
      <div className="space-y-6">
        <PageHeader tab="moderation" />
        {mediaVendorDialog}
        <Section title="Vendor Portfolio Review">
          {mediaCandidates.length ? (
            mediaGrid
          ) : (
            <EmptyState text="No uploaded media available." />
          )}
        </Section>
      </div>
    );
  }

  if (view === "warnings") {
    return (
      <div className="space-y-6">
        <PageHeader tab="moderation" />
        {mediaVendorDialog}
        <Section title="Accounts with Warnings">
          {warnedReviews.length || warnedMediaVendors.length ? (
            <>
              {warnedReviews.map(renderReview)}
              {warnedMediaVendors.map(renderMediaVendor)}
            </>
          ) : (
            <EmptyState text="No accounts with warnings." />
          )}
        </Section>
      </div>
    );
  }

  if (view === "ban-requests") {
    return (
      <div className="space-y-6">
        <PageHeader tab="moderation" />
        {mediaVendorDialog}
        <Section title="Ban Requests — Escalated Cases">
          {banRequests.length || mediaBanRequests.length ? (
            <>
              {banRequests.map(renderReview)}
              {mediaBanRequests.map(renderMediaVendor)}
            </>
          ) : (
            <EmptyState text="No escalated ban requests." />
          )}
        </Section>
      </div>
    );
  }

  // ── Default: summary dashboard ─────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader tab="moderation" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Reviews"
          value={reviews.length}
          helper="Review queue"
        />
        <MetricCard
          label="Portfolio Queue"
          value={mediaCandidates.length}
          helper="Vendor media candidates"
        />
        <MetricCard
          label="Warnings"
          value={warnedReviews.length + warnedMediaVendors.length}
          helper="Warned accounts"
        />
        <MetricCard
          label="Ban Requests"
          value={banRequests.length + mediaBanRequests.length}
          helper="Escalated account reviews"
        />
        <MetricCard
          label="Flagged Profiles"
          value={flaggedListings.length}
          helper="Rejected or noted profiles"
        />
      </div>
    </div>
  );
}

function PlaceholderDashboard({ tab }: { tab: OperationalTab }) {
  return (
    <div className="space-y-6">
      <PageHeader tab={tab} />
      <Card className="border border-dashed border-gray-200 shadow-sm">
        <CardContent className="py-16 text-center text-sm text-gray-500">
          {TAB_META[tab].title} remains a placeholder for the next
          implementation pass.
        </CardContent>
      </Card>
    </div>
  );
}

function OperationalContent({ activeKey }: { activeKey: string }) {
  const { user } = useAuth();

  // ── Verification Officer routes ────────────────────────────────────────────
  if (activeKey === "pending-vendors")
    return <VerificationDashboard view="pending-vendors" />;
  if (activeKey === "submitted-documents")
    return <VerificationDashboard view="submitted-documents" />;
  if (activeKey === "approved-vendors")
    return <VerificationDashboard view="approved-vendors" />;
  if (activeKey === "rejected-vendors")
    return <VerificationDashboard view="rejected-vendors" />;
  if (activeKey === "verification-requests")
    return <VerificationDashboard view="verification-requests" />;

  // ── Booking Coordinator routes ─────────────────────────────────────────────
  if (activeKey === "active-bookings")
    return <BookingCoordinatorDashboard view="active-bookings" />;
  if (activeKey === "reschedules")
    return <BookingCoordinatorDashboard view="reschedules" />;
  if (activeKey === "booking-escalations")
    return <BookingCoordinatorDashboard view="booking-escalations" />;

  // ── Support Executive routes ───────────────────────────────────────────────
  if (activeKey === "tickets") return <SupportDashboard view="tickets" />;
  if (activeKey === "assigned-tickets")
    return <SupportDashboard view="assigned-tickets" />;
  if (activeKey === "support-escalations")
    return <SupportDashboard view="support-escalations" />;

  // ── Content Moderator routes ───────────────────────────────────────────────
  if (activeKey === "moderation-reviews")
    return <ModerationDashboard view="moderation-reviews" />;
  if (activeKey === "media-queue")
    return <ModerationDashboard view="media-queue" />;
  if (activeKey === "warnings") return <ModerationDashboard view="warnings" />;
  if (activeKey === "ban-requests")
    return <ModerationDashboard view="ban-requests" />;

  // ── Legacy tab-key fallback (tab=verification etc.) ───────────────────────
  const roleDefaultTab = ROLE_DEFAULT_TAB[user?.role ?? "staff"];
  const tab =
    activeKey in TAB_META ? (activeKey as OperationalTab) : roleDefaultTab;

  if (tab === "dashboard" || tab === "verification") {
    if (user?.role === "vendor_verification_officer")
      return <VerificationDashboard view="dashboard" />;
    if (user?.role === "booking_coordinator")
      return <BookingCoordinatorDashboard view="dashboard" />;
    if (user?.role === "support_executive")
      return <SupportDashboard view="dashboard" />;
    if (user?.role === "content_moderator")
      return <ModerationDashboard view="dashboard" />;
    if (user?.role === "finance_manager")
      return <PlaceholderDashboard tab="finance" />;
    if (user?.role === "marketing_manager")
      return <PlaceholderDashboard tab="marketing" />;
    return <VerificationDashboard view="dashboard" />;
  }

  if (tab === "operations")
    return <BookingCoordinatorDashboard view="dashboard" />;
  if (tab === "support") return <SupportDashboard view="dashboard" />;
  if (tab === "moderation") return <ModerationDashboard view="dashboard" />;
  if (tab === "finance") return <PlaceholderDashboard tab="finance" />;
  if (tab === "marketing") return <PlaceholderDashboard tab="marketing" />;

  return <VerificationDashboard view="dashboard" />;
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
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);

        if (key === ROLE_DEFAULT_TAB[user?.role ?? "staff"]) {
          next.delete("tab");
        } else {
          next.set("tab", key);
        }

        return next;
      },
      { replace: true },
    );
  };

  const content =
    activeKey === "settings" ? (
      <SettingsPage />
    ) : (
      <OperationalContent activeKey={activeKey} />
    );

  return (
    <div className="flex h-screen min-w-0 overflow-x-clip overflow-y-hidden bg-gray-50">
      <DashboardSidebar activeKey={activeKey} onNavigate={handleNavigate} />
      <main className="min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
        {content}
      </main>
    </div>
  );
}
