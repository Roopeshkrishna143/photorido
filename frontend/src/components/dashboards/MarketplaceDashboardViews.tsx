import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useFavorites } from "../../hooks/useFavorites";
import { usePhotographers } from "../../hooks/usePhotographers";
import {
  BookingStatus,
  MarketplaceConversation,
  NotificationRole,
  useMarketplace,
} from "../../context/MarketplaceContext";
import {
  ArrowLeft,
  Bell,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  MailPlus,
  MapPin,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Star,
  TrendingUp,
  Video,
  X,
  XCircle,
} from "lucide-react";
import { formatDisplayDate, formatDisplayDateTime } from "../../lib/date";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const MSG_PAGE = 6;
const BOOKING_PAGE = 6;
const SEARCH_RESULT_FILTER_KEYS = [
  "q",
  "service",
  "specialties",
  "location",
  "date",
  "minRating",
  "minPrice",
  "maxPrice",
  "sort",
  "lat",
  "lng",
  "radiusKm",
] as const;

function getPhotographer(photographers: Array<{ id: string }>, photographerId: string) {
  return photographers.find((entry) => entry.id === photographerId);
}

function getUnreadCount(conversation: MarketplaceConversation, role: "user" | "vendor") {
  return role === "user" ? conversation.userUnread : conversation.vendorUnread;
}

function getConversationLabel(conversation: MarketplaceConversation, role: "user" | "vendor") {
  return role === "user" ? conversation.vendorName : conversation.userName;
}

function getConversationAvatar(conversation: MarketplaceConversation, role: "user" | "vendor") {
  if (role === "user") {
    return conversation.avatar;
  }

  return conversation.userName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const statusStyles: Record<BookingStatus, string> = {
    pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    approved_by_vendor: "bg-green-100 text-green-700 border border-green-200",
    confirmed: "bg-cyan-100 text-cyan-700 border border-cyan-200",
    rejected_by_vendor: "bg-red-100 text-red-700 border border-red-200",
    completed: "bg-blue-100 text-blue-700 border border-blue-200",
    cancelled: "bg-gray-100 text-gray-700 border border-gray-200",
  };

  const labelMap: Record<BookingStatus, string> = {
    pending: "Pending",
    approved_by_vendor: "Approved",
    confirmed: "Confirmed",
    rejected_by_vendor: "Rejected",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusStyles[status]}`}>
      {labelMap[status]}
    </span>
  );
}

function BookingCoordinatorActivity({
  booking,
}: {
  booking: {
    operationsNote?: string;
    rescheduledAt?: string | null;
    rescheduleResolvedAt?: string | null;
    activityHistory?: Array<{ type: string; note: string; createdAt: string }>;
  };
}) {
  const latestActivity = booking.activityHistory?.slice(-2) ?? [];

  if (!booking.operationsNote && !booking.rescheduledAt && latestActivity.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
      {booking.rescheduledAt && !booking.rescheduleResolvedAt && (
        <p className="font-semibold">
          Reschedule pending since {formatDisplayDateTime(booking.rescheduledAt)}
        </p>
      )}
      {booking.operationsNote && (
        <p className="mt-1">Booking Coordinator Update: {booking.operationsNote}</p>
      )}
      {latestActivity.map((entry) => (
        <p key={`${entry.createdAt}-${entry.type}`} className="mt-1 text-blue-700">
          {formatDisplayDateTime(entry.createdAt)} - {entry.note}
        </p>
      ))}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Card className="border border-dashed border-gray-200">
      <CardContent className="py-16 flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-400" />
        </div>
        <p className="text-gray-500 font-medium">{title}</p>
        <p className="text-gray-400 text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}

function InsightCard({
  label,
  value,
  helper,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardContent className="pt-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{helper}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function ChatView({
  conversation,
  role,
  onBack,
}: {
  conversation: MarketplaceConversation;
  role: "user" | "vendor";
  onBack: () => void;
}) {
  const { sendConversationMessage, markConversationRead } = useMarketplace();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const displayName = getConversationLabel(conversation, role);
  const avatar = getConversationAvatar(conversation, role);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages]);

  useEffect(() => {
    if (getUnreadCount(conversation, role) > 0) {
      markConversationRead(role, conversation.id);
    }
  }, [conversation, role, markConversationRead]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    sendConversationMessage(conversation.id, role, text);
    setInput("");
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white flex-shrink-0">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {avatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 text-sm">{displayName}</p>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${conversation.tagColor}`}>
              {conversation.tag}
            </span>
          </div>
          <p className="text-xs text-green-500 font-medium">Online</p>
        </div>

        <div className="flex items-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <Video className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-gray-50/30">
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">{conversation.date}</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {conversation.messages.map((message, index) => {
          const isSelf = message.from === role;
          const previous = conversation.messages[index - 1];
          const showAvatar = !isSelf && (!previous || previous.from === role);
          const senderLabel = isSelf ? "You" : displayName;
          const showSenderLabel = !previous || previous.from !== message.from;

          return (
            <div key={message.id} className={`flex items-end gap-2.5 ${isSelf ? "justify-end" : "justify-start"}`}>
              {!isSelf && (
                <div
                  className={`w-7 h-7 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mb-1 ${
                    showAvatar ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {avatar}
                </div>
              )}

              <div className={`max-w-[70%] ${isSelf ? "items-end" : "items-start"} flex flex-col gap-1`}>
                {showSenderLabel && (
                  <span className="px-1 text-[11px] font-medium text-gray-400">{senderLabel}</span>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isSelf
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm"
                      : "bg-white border border-gray-100 text-gray-800 shadow-sm rounded-bl-sm"
                  }`}
                >
                  {message.text}
                </div>
                <span className="text-[10px] text-gray-400 px-1">{message.time}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-end gap-2 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <button className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mb-1">
            <Paperclip className="w-4 h-4" />
          </button>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${displayName}...`}
            rows={1}
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none min-h-[24px] max-h-[120px] py-1"
            style={{ scrollbarWidth: "none" }}
          />
          <button className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mb-1">
            <Smile className="w-4 h-4" />
          </button>
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0 mb-0.5"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-1.5">Press Enter to send - Shift+Enter for new line</p>
      </div>
    </div>
  );
}

function MessagesPanel({ role }: { role: "user" | "vendor" }) {
  const { conversations, markConversationRead } = useMarketplace();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [search, setSearch] = useState("");
  const [openConversationId, setOpenConversationId] = useState<string | null>(searchParams.get("conversationId"));
  const sourceConversations = conversations;

  const filtered = useMemo(
    () =>
      sourceConversations
        .filter((conversation) => filter === "all" || getUnreadCount(conversation, role) > 0)
        .filter((conversation) => {
          const label = getConversationLabel(conversation, role).toLowerCase();
          return search === "" || label.includes(search.toLowerCase()) || conversation.tag.toLowerCase().includes(search.toLowerCase());
        }),
    [filter, role, search, sourceConversations],
  );

  const totalPages = Math.ceil(filtered.length / MSG_PAGE);
  const start = (page - 1) * MSG_PAGE;
  const visible = filtered.slice(start, start + MSG_PAGE);
  const totalUnread = sourceConversations.reduce((sum, conversation) => sum + getUnreadCount(conversation, role), 0);
  const openConversation = sourceConversations.find((conversation) => conversation.id === openConversationId) ?? null;

  useEffect(() => {
    const requestedConversationId = searchParams.get("conversationId");

    if (requestedConversationId && sourceConversations.some((conversation) => conversation.id === requestedConversationId)) {
      setOpenConversationId(requestedConversationId);
      return;
    }

    if (!requestedConversationId && !openConversationId && sourceConversations.length > 0) {
      setOpenConversationId(sourceConversations[0]?.id ?? null);
    }
  }, [openConversationId, searchParams, sourceConversations]);

  const updateConversationSelection = (conversationId: string | null) => {
    setOpenConversationId(conversationId);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("tab", "messages");

      if (conversationId) {
        next.set("conversationId", conversationId);
      } else {
        next.delete("conversationId");
      }

      return next;
    });
  };

  const markAllRead = () => {
    sourceConversations.forEach((conversation) => markConversationRead(role, conversation.id));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {totalUnread > 0 ? (
              <span>
                <span className="font-semibold text-blue-600">{totalUnread} unread</span> message{totalUnread !== 1 ? "s" : ""}
              </span>
            ) : (
              "All messages read"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {totalUnread > 0 && (
            <Button size="sm" variant="outline" onClick={markAllRead} className="text-xs h-8 border-blue-200 text-blue-600 hover:bg-blue-50">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Mark all as read
            </Button>
          )}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(["all", "unread"] as const).map((value) => (
              <button
                key={value}
                onClick={() => {
                  setFilter(value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  filter === value ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {value === "unread" ? `Unread (${totalUnread})` : "All"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="border border-gray-100 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder={role === "user" ? "Search by vendor name..." : "Search by user name..."}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {visible.length === 0 ? (
            <CardContent className="py-16 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-gray-500 font-medium">No conversations found</p>
              <p className="text-gray-400 text-sm">Start a new conversation from a vendor profile or clear your search.</p>
            </CardContent>
          ) : (
            <div className="divide-y divide-gray-50">
              {visible.map((conversation) => {
                const unread = getUnreadCount(conversation, role);
                const label = getConversationLabel(conversation, role);
                const avatar = getConversationAvatar(conversation, role);
                const isActive = openConversationId === conversation.id;

                return (
                  <div
                    key={conversation.id}
                    onClick={() => updateConversationSelection(conversation.id)}
                    className={`flex items-start gap-4 px-5 py-4 hover:bg-blue-50/40 transition-colors cursor-pointer group ${
                      isActive ? "bg-blue-50 border-l-2 border-l-blue-600" : unread > 0 ? "bg-blue-50/20" : ""
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-blue-500 to-blue-700">
                        {avatar}
                      </div>
                      {unread > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                          {unread}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className={`text-sm font-semibold ${unread > 0 || isActive ? "text-gray-900" : "text-gray-700"}`}>{label}</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${conversation.tagColor}`}>{conversation.tag}</span>
                      </div>
                      <p className={`text-sm truncate ${unread > 0 ? "text-gray-700" : "text-gray-400"}`}>{conversation.preview}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-500">{conversation.date}</p>
                        <p className="text-xs text-gray-400">{conversation.time}</p>
                      </div>
                      {unread > 0 ? (
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            markConversationRead(role, conversation.id);
                          }}
                          className="text-[11px] font-medium text-blue-600 hover:text-blue-700 bg-white border border-blue-200 hover:border-blue-400 px-2.5 py-1 rounded-lg transition-all opacity-0 group-hover:opacity-100 whitespace-nowrap shadow-sm"
                        >
                          Mark as read
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <CheckCircle2 className="w-3 h-3" /> Read
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filtered.length > MSG_PAGE && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400">
                Showing {start + 1}-{Math.min(start + MSG_PAGE, filtered.length)} of {filtered.length} conversations
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`w-7 h-7 text-xs font-medium rounded-lg transition-colors ${
                      pageNumber === page ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-white border border-gray-200"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          )}
        </Card>

        <div className="min-h-[640px]">
          {openConversation ? (
            <ChatView conversation={openConversation} role={role} onBack={() => updateConversationSelection(null)} />
          ) : (
            <EmptyState icon={MessageSquare} title="Open a conversation" description="Select a conversation from the left panel to read and reply in real time." />
          )}
        </div>
      </div>
    </div>
  );
}

export function MarketplaceConsumerOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardSearchParams] = useSearchParams();
  const { bookings, conversations, openConversation } = useMarketplace();
  const { photographers } = usePhotographers();
  const { favorites, isLoading: isFavoritesLoading, error: favoritesError } = useFavorites();

  const userBookings = useMemo(() => bookings, [bookings]);
  const userConversations = useMemo(() => conversations, [conversations]);

  const activeBookings = userBookings.filter((booking) => booking.status === "approved_by_vendor" || booking.status === "confirmed" || booking.status === "completed").length;
  const pendingBookings = userBookings.filter((booking) => booking.status === "pending").length;
  const unreadMessages = userConversations.reduce((total, conversation) => total + conversation.userUnread, 0);
  const recentBookings = userBookings.slice(0, 3);
  const recentMessages = userConversations.slice(0, 3);
  const searchListingParams = new URLSearchParams();

  SEARCH_RESULT_FILTER_KEYS.forEach((key) => {
    const value = dashboardSearchParams.get(key);
    if (value) {
      searchListingParams.set(key, value);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(" ")[0]}!</h1>
          <p className="text-gray-500 text-sm mt-1">Track your booking progress, payments, and vendor replies from one place.</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700 self-start">
          <TrendingUp className="w-4 h-4" />
          {pendingBookings} booking request{pendingBookings !== 1 ? "s" : ""} waiting for vendor action
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <InsightCard label="Active Bookings" value={activeBookings} helper="Approved, confirmed, or completed" icon={CalendarCheck} color="text-green-600" bg="bg-green-50" />
        <InsightCard label="Pending Approvals" value={pendingBookings} helper="Waiting for vendor review" icon={Clock} color="text-yellow-600" bg="bg-yellow-50" />
        <InsightCard label="Unread Messages" value={unreadMessages} helper="Vendor replies in your inbox" icon={MessageSquare} color="text-blue-600" bg="bg-blue-50" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-6">
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Booking Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentBookings.length === 0 ? (
              <p className="text-sm text-gray-500">Your recent bookings will appear here.</p>
            ) : (
              recentBookings.map((booking) => {
                const photographer = getPhotographer(photographers, booking.photographerId);
                return (
                  <div key={booking.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <img src={photographer?.image} alt={photographer?.name} className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <p className="font-medium text-gray-900">{photographer?.name ?? booking.vendorName}</p>
                        <p className="text-xs text-gray-500">{booking.eventType} - {booking.listingName}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDisplayDate(booking.date)} - {booking.time}
                        </p>
                        <BookingCoordinatorActivity booking={booking} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">{booking.amount}</span>
                      <BookingStatusBadge status={booking.status} />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentMessages.length === 0 ? (
              <p className="text-sm text-gray-500">Vendor conversations will appear here.</p>
            ) : (
              recentMessages.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`rounded-2xl border px-4 py-3 ${
                    conversation.userUnread > 0 ? "border-blue-200 bg-blue-50/50" : "border-gray-100 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {conversation.avatar}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{conversation.vendorName}</p>
                        <p className="text-xs text-gray-500 truncate">{conversation.preview}</p>
                      </div>
                    </div>
                    {conversation.userUnread > 0 && (
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                        {conversation.userUnread} new
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Recommended Professionals</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => navigate({
                pathname: "/search",
                search: searchListingParams.toString() ? `?${searchListingParams.toString()}` : "",
              })}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {photographers.slice(0, 3).map((photographer) => (
            <div key={photographer.id} className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
              <img src={photographer.image} alt={photographer.name} className="w-full h-40 object-cover" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{photographer.name}</p>
                    <p className="text-sm text-gray-500">{photographer.specialty}</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-sm">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{photographer.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {photographer.location}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">{photographer.price}</span>
                    <Button size="sm" variant="outline" onClick={() => navigate(`/photographer/${photographer.id}`)}>
                      View Profile
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                    onClick={async () => {
                      const conversationId = await openConversation({ photographerId: photographer.id });
                      if (conversationId) {
                        navigate(`/dashboard?tab=messages&conversationId=${conversationId}`);
                      }
                    }}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {photographers.length === 0 && (
            <p className="text-sm text-gray-500 md:col-span-3">
              Recommended professionals will appear here once the directory sync finishes.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Saved Profiles</CardTitle>
              <p className="text-xs text-gray-400">
                Your bookmarked professionals stay synced here so you can jump back into their profiles quickly.
              </p>
            </div>
            <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {favorites.length} saved
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isFavoritesLoading ? (
            <p className="text-sm text-gray-500">Loading saved profiles...</p>
          ) : favoritesError ? (
            <p className="text-sm text-red-600">{favoritesError}</p>
          ) : favorites.length === 0 ? (
            <p className="text-sm text-gray-500">
              Profiles you save from the marketplace will appear here automatically.
            </p>
          ) : (
            favorites.slice(0, 4).map((favorite) => (
              <div key={favorite.favoriteId} className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <img src={favorite.image} alt={favorite.name} className="h-12 w-12 rounded-xl object-cover" />
                  <div>
                    <p className="font-semibold text-gray-900">{favorite.name}</p>
                    <p className="text-xs text-gray-500">{favorite.specialty}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      Saved on {formatDisplayDate(favorite.savedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{favorite.price}</span>
                  <Button size="sm" variant="outline" className="rounded-xl" onClick={() => navigate(`/photographer/${favorite.photographerId}`)}>
                    View Profile
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function MarketplaceConsumerMessages() {
  return <MessagesPanel role="user" />;
}

export function MarketplaceVendorMessages() {
  return <MessagesPanel role="vendor" />;
}

export function MarketplaceConsumerBookings() {
  const { bookings, reviews, requestAgain, requestPayment, requestWithdrawal, createReview } = useMarketplace();
  const { photographers } = usePhotographers();
  const [page, setPage] = useState(1);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const userBookings = bookings;
  const totalPages = Math.ceil(userBookings.length / BOOKING_PAGE);
  const start = (page - 1) * BOOKING_PAGE;
  const visible = userBookings.slice(start, start + BOOKING_PAGE);
  const reviewedBookingIds = new Set(reviews.map((review) => review.bookingId).filter(Boolean));
  const userReviews = useMemo(
    () => [...reviews].sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    [reviews],
  );

  const pendingCount = userBookings.filter((booking) => booking.status === "pending").length;
  const vendorApprovedCount = userBookings.filter((booking) => booking.status === "approved_by_vendor").length;
  const confirmedCount = userBookings.filter((booking) => booking.status === "confirmed").length;
  const completedCount = userBookings.filter((booking) => booking.status === "completed").length;

  const submitReview = async () => {
    if (!reviewBookingId || reviewComment.trim().length < 3) {
      return;
    }

    const didCreate = await createReview({
      bookingId: reviewBookingId,
      rating: reviewRating,
      comment: reviewComment.trim(),
    });

    if (didCreate) {
      setReviewBookingId(null);
      setReviewRating(5);
      setReviewComment("");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Follow the full booking lifecycle from approval to payment and withdrawal.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap text-xs font-medium">
          <span className="px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-700">{pendingCount} Pending</span>
          <span className="px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700">{vendorApprovedCount} Vendor Approved</span>
          <span className="px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700">{confirmedCount} Confirmed</span>
          <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700">{completedCount} Completed</span>
        </div>
      </div>

      {userBookings.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No bookings yet" description="Your booking requests will appear here after you contact a professional." />
      ) : (
        <Card className="border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[980px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["S.No", "Photographer", "Listing", "Event", "Date", "Status", "Amount", "Actions"].map((heading) => (
                    <th key={heading} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((booking, index) => {
                  const photographer = getPhotographer(photographers, booking.photographerId);

                  return (
                    <tr key={booking.id} className="border-b border-gray-50 hover:bg-blue-50/20 transition-colors align-top">
                      <td className="py-4 px-4 text-gray-400 font-medium text-xs">{start + index + 1}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img src={photographer?.image} alt={photographer?.name} className="w-11 h-11 rounded-xl object-cover" />
                          <div>
                            <p className="font-semibold text-gray-900">{photographer?.name ?? booking.vendorName}</p>
                            <p className="text-xs text-gray-500">{photographer?.specialty ?? booking.eventType}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" /> {booking.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-800">{booking.listingName}</p>
                        <p className="text-xs text-gray-500 mt-1">{booking.time}</p>
                        <BookingCoordinatorActivity booking={booking} />
                      </td>
                      <td className="py-4 px-4 text-gray-700 whitespace-nowrap">{booking.eventType}</td>
                      <td className="py-4 px-4 text-gray-600 whitespace-nowrap">
                        {formatDisplayDate(booking.date)}
                      </td>
                      <td className="py-4 px-4">
                        <BookingStatusBadge status={booking.status} />
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-900 whitespace-nowrap">{booking.amount}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {booking.status === "pending" && (
                            <span className="text-xs text-yellow-700 font-medium bg-yellow-50 border border-yellow-200 rounded-lg px-2.5 py-1.5">
                              Waiting for vendor approval
                            </span>
                          )}

                          {booking.status === "approved_by_vendor" && !booking.paymentRequested && (
                            <button
                              onClick={() => requestPayment(booking.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Make Payment
                            </button>
                          )}

                          {booking.status === "approved_by_vendor" && booking.paymentRequested && (
                            <span className="text-xs text-blue-700 font-medium bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5">
                              Payment request sent
                            </span>
                          )}

                          {booking.status === "confirmed" && !booking.withdrawalRequested && (
                            <>
                              <span className="text-xs text-cyan-700 font-medium bg-cyan-50 border border-cyan-200 rounded-lg px-2.5 py-1.5">
                                Booking confirmed
                              </span>
                              <button
                                onClick={() => requestWithdrawal(booking.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Withdraw Booking
                              </button>
                            </>
                          )}

                          {booking.status === "confirmed" && booking.withdrawalRequested && (
                            <span className="text-xs text-red-700 font-medium bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5">
                              Withdrawal requested
                            </span>
                          )}

                          {booking.status === "rejected_by_vendor" && (
                            <button
                              onClick={() => requestAgain(booking.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                            >
                              <MailPlus className="w-3.5 h-3.5" /> Request Again
                            </button>
                          )}

                          {booking.status === "completed" && (
                            <>
                              {!reviewedBookingIds.has(booking.id) ? (
                                <button
                                  onClick={() => setReviewBookingId(booking.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors shadow-sm"
                                >
                                  <Star className="w-3.5 h-3.5" /> Leave Review
                                </button>
                              ) : (
                                <span className="text-xs text-amber-700 font-medium bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5">
                                  Review submitted
                                </span>
                              )}
                              <span className="text-xs text-green-700 font-medium bg-green-50 border border-green-200 rounded-lg px-2.5 py-1.5">
                                Booking completed
                              </span>
                            </>
                          )}

                          {booking.status === "cancelled" && (
                            <span className="text-xs text-gray-700 font-medium bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1.5">
                              Booking cancelled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {userBookings.length > BOOKING_PAGE && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400">
                Showing {start + 1}-{Math.min(start + BOOKING_PAGE, userBookings.length)} of {userBookings.length} bookings
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`w-7 h-7 text-xs font-medium rounded-lg transition-colors ${
                      pageNumber === page ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-white border border-gray-200"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Your Reviews & Replies</CardTitle>
          <p className="text-xs text-gray-400">
            Reviews from completed bookings appear here together with vendor replies whenever they respond.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {userReviews.length === 0 ? (
            <p className="text-sm text-gray-500">
              Submit a review after a completed booking and it will show up here.
            </p>
          ) : (
            userReviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-gray-100 bg-white px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{review.vendorName}</p>
                    <p className="mt-1 text-sm text-gray-500">{review.listingName}</p>
                    <p className="mt-1 text-xs text-gray-400">Reviewed on {formatDisplayDate(review.createdAt)}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600">
                    <Star className="h-4 w-4 fill-current" />
                    {review.rating.toFixed(1)}
                  </span>
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-700">
                  {review.comment}
                </div>

                {review.vendorResponse ? (
                  <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Vendor Reply</p>
                    <p className="mt-2 text-sm text-blue-900">{review.vendorResponse}</p>
                    {review.respondedAt && (
                      <p className="mt-2 text-xs text-blue-700">
                        Replied on {formatDisplayDate(review.respondedAt)}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-xs font-medium text-gray-400">
                    No vendor reply yet.
                  </p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {reviewBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Leave Review</h3>
                <p className="mt-1 text-sm text-gray-500">Reviews are enabled only after the booking is completed.</p>
              </div>
              <button
                onClick={() => setReviewBookingId(null)}
                className="rounded-full border border-gray-200 p-2 text-gray-500 hover:text-gray-900"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 flex items-center gap-2">
              {Array.from({ length: 5 }, (_, index) => index + 1).map((rating) => (
                <button
                  key={rating}
                  onClick={() => setReviewRating(rating)}
                  className={`rounded-full p-2 transition-colors ${rating <= reviewRating ? "text-amber-500" : "text-gray-300"}`}
                >
                  <Star className={`h-6 w-6 ${rating <= reviewRating ? "fill-current" : ""}`} />
                </button>
              ))}
            </div>

            <textarea
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              placeholder="Share your experience with this vendor"
              rows={5}
              className="mt-4 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setReviewBookingId(null)}>Cancel</Button>
              <Button onClick={() => void submitReview()} className="bg-blue-600 text-white hover:bg-blue-700">
                Submit Review
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function MarketplaceVendorBookings() {
  const { bookings, approveBooking, rejectBooking, confirmPayment, completeBooking, confirmWithdrawal } = useMarketplace();
  const [page, setPage] = useState(1);

  const vendorBookings = bookings;
  const totalPages = Math.ceil(vendorBookings.length / BOOKING_PAGE);
  const start = (page - 1) * BOOKING_PAGE;
  const visible = vendorBookings.slice(start, start + BOOKING_PAGE);

  const pendingCount = vendorBookings.filter((booking) => booking.status === "pending").length;
  const paymentCount = vendorBookings.filter((booking) => booking.status === "approved_by_vendor" && booking.paymentRequested).length;
  const confirmedCount = vendorBookings.filter((booking) => booking.status === "confirmed").length;
  const withdrawalCount = vendorBookings.filter((booking) => booking.status === "confirmed" && booking.withdrawalRequested).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 text-sm mt-0.5">Review booking requests, confirm payments, and complete withdrawals.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap text-xs font-medium">
          <span className="px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-yellow-700">{pendingCount} Pending</span>
          <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700">{paymentCount} Payment Requests</span>
          <span className="px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700">{confirmedCount} Confirmed</span>
          <span className="px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700">{withdrawalCount} Withdrawals</span>
        </div>
      </div>

      {vendorBookings.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No leads yet" description="New booking enquiries from users will appear here." />
      ) : (
        <Card className="border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[980px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["S.No", "Listing Name", "User Name", "Date", "Time", "Status", "Amount", "Actions"].map((heading) => (
                    <th key={heading} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((booking, index) => (
                  <tr key={booking.id} className="border-b border-gray-50 hover:bg-blue-50/20 transition-colors align-top">
                    <td className="py-4 px-4 text-gray-400 font-medium text-xs">{start + index + 1}</td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold text-gray-900">{booking.listingName}</p>
                        <p className="text-xs text-gray-500 mt-1">{booking.eventType} - {booking.location}</p>
                        <BookingCoordinatorActivity booking={booking} />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{booking.userName}</td>
                    <td className="py-4 px-4 text-gray-600 whitespace-nowrap">
                      {formatDisplayDate(booking.date)}
                    </td>
                    <td className="py-4 px-4 text-gray-600 whitespace-nowrap">{booking.time}</td>
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <BookingStatusBadge status={booking.status} />
                        {booking.rescheduledAt && !booking.rescheduleResolvedAt && booking.status === "pending" && (
                          <p className="text-xs font-semibold text-amber-700">
                            Booking Rescheduled - Approval Required
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-900 whitespace-nowrap">{booking.amount}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {booking.status === "pending" && (
                          <>
                            <button
                              onClick={() => approveBooking(booking.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => rejectBooking(booking.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}

                        {booking.status === "approved_by_vendor" && !booking.paymentRequested && (
                          <span className="text-xs text-blue-700 font-medium bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5">
                            Awaiting user payment
                          </span>
                        )}

                        {booking.status === "approved_by_vendor" && booking.paymentRequested && (
                          <button
                            onClick={() => confirmPayment(booking.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Payment Received
                          </button>
                        )}

                        {booking.status === "confirmed" && !booking.withdrawalRequested && (
                          <button
                            onClick={() => completeBooking(booking.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                          </button>
                        )}

                        {booking.status === "confirmed" && booking.withdrawalRequested && (
                          <button
                            onClick={() => confirmWithdrawal(booking.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Confirm Withdrawal
                          </button>
                        )}

                        {booking.status === "completed" && (
                          <span className="text-xs text-green-700 font-medium bg-green-50 border border-green-200 rounded-lg px-2.5 py-1.5">
                            Booking completed
                          </span>
                        )}

                        {booking.status === "rejected_by_vendor" && (
                          <span className="text-xs text-red-700 font-medium bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5">
                            Rejected by vendor
                          </span>
                        )}

                        {booking.status === "cancelled" && (
                          <span className="text-xs text-gray-700 font-medium bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1.5">
                            Booking cancelled
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {vendorBookings.length > BOOKING_PAGE && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-400">
                Showing {start + 1}-{Math.min(start + BOOKING_PAGE, vendorBookings.length)} of {vendorBookings.length} leads
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`w-7 h-7 text-xs font-medium rounded-lg transition-colors ${
                      pageNumber === page ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-white border border-gray-200"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function resolveNotificationTargetPath(role: NotificationRole, notification: { message: string; targetPath?: string | null }) {
  if (notification.targetPath) {
    return notification.targetPath;
  }

  const message = notification.message.toLowerCase();

  if (message.includes("review")) {
    return role === "user" ? "/dashboard?tab=bookings" : "/dashboard?tab=reviews";
  }

  if (message.includes("profile")) {
    return "/dashboard?tab=listings";
  }

  if (message.includes("message") || message.includes("conversation") || message.includes("chat")) {
    return "/dashboard?tab=messages";
  }

  if (message.includes("booking") || message.includes("payment") || message.includes("withdraw")) {
    return "/dashboard?tab=bookings";
  }

  return "/dashboard";
}

export function MarketplaceNotificationCenter({
  role,
  onClose,
}: {
  role: NotificationRole;
  onClose?: () => void;
}) {
  const navigate = useNavigate();
  const { notifications, markAllNotificationsRead, dismissNotification } = useMarketplace();
  const roleNotifications = notifications.filter((notification) => notification.role === role);
  const unreadCount = roleNotifications.filter((notification) => !notification.read).length;

  const handleDismiss = async (notificationId: string) => {
    await dismissNotification(notificationId);
  };

  const handleOpenNotification = async (notification: (typeof roleNotifications)[number]) => {
    const didDismiss = await dismissNotification(notification.id);
    if (!didDismiss) {
      return;
    }

    onClose?.();
    navigate(resolveNotificationTargetPath(role, notification));
  };

  return (
    <div className="w-full max-w-[360px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_32px_80px_-36px_rgba(15,23,42,0.55)]">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-blue-600" />
          <p className="text-sm font-semibold text-slate-900">Notifications</p>
          {roleNotifications.length > 0 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              {roleNotifications.length}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={() => markAllNotificationsRead(role)} className="text-xs font-medium text-blue-600 hover:text-blue-700">
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[360px] overflow-y-auto bg-slate-50/70 p-3">
        {roleNotifications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
            <Bell className="mx-auto mb-3 h-10 w-10 text-blue-200" />
            <p className="text-sm font-medium text-slate-500">No notifications yet</p>
            <p className="mt-1 text-xs text-slate-400">Booking and payment updates will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {roleNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`group rounded-2xl border px-3 py-3 shadow-sm transition-colors ${
                  notification.read
                    ? "border-slate-200 bg-white"
                    : "border-blue-100 bg-blue-50/80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => void handleOpenNotification(notification)}
                    className="flex min-w-0 flex-1 items-start gap-3 text-left"
                  >
                    <div className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${notification.read ? "bg-slate-300" : "bg-blue-600"}`} />
                    <div className="min-w-0">
                      <p className="text-sm leading-relaxed text-slate-800">{notification.message}</p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {new Date(notification.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDismiss(notification.id)}
                    className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-slate-700"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


