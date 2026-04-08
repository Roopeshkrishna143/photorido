import { useMemo } from "react";
import { CalendarDays, CheckCircle2, Clock3, MapPin, Phone, UserRound } from "lucide-react";
import { useMarketplace, type BookingStatus, type MarketplaceBooking } from "../../context/MarketplaceContext";
import { formatDisplayDate } from "../../lib/date";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

function isActiveBooking(status: BookingStatus) {
  return status === "pending" || status === "approved_by_vendor" || status === "confirmed";
}

function bookingStatusLabel(status: BookingStatus) {
  if (status === "approved_by_vendor") return "Approved";
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
  return "bg-amber-100 text-amber-700 border-amber-200";
}

function SummaryStrip({ bookings }: { bookings: MarketplaceBooking[] }) {
  const items = [
    {
      label: "Total Bookings",
      value: bookings.length,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      label: "Pending Requests",
      value: bookings.filter((booking) => booking.status === "pending").length,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      label: "Confirmed Jobs",
      value: bookings.filter((booking) => booking.status === "approved_by_vendor" || booking.status === "confirmed").length,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "Completed Shoots",
      value: bookings.filter((booking) => booking.status === "completed").length,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
    },
    {
      label: "Booked Dates",
      value: new Set(bookings.filter((booking) => isActiveBooking(booking.status)).map((booking) => booking.date)).size,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className={`${item.bg} ${item.border} rounded-2xl border px-4 py-3 text-center`}>
          <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          <p className="mt-0.5 text-xs text-gray-500">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

function AvailabilityCard({ bookings }: { bookings: MarketplaceBooking[] }) {
  const blockedDates = Array.from(
    new Set(bookings.filter((booking) => isActiveBooking(booking.status)).map((booking) => booking.date)),
  )
    .sort((left, right) => left.localeCompare(right))
    .slice(0, 6);

  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">Availability Logic</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm text-blue-900">
          Vendors are treated as available every day by default. Availability is reduced only when user bookings are created and move into active states like pending, approved, or confirmed.
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Default State</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">Available Every Day</p>
            <p className="mt-1 text-sm text-gray-500">No manual slot creation is required from the vendor side.</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Driven By</p>
            <p className="mt-2 text-sm font-semibold text-gray-900">User Booking Activity</p>
            <p className="mt-1 text-sm text-gray-500">Booked dates below are calculated from real user bookings and confirmations.</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-900">Recently Blocked / Reserved Dates</p>
          {blockedDates.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">No dates are blocked yet. Your calendar is currently fully open.</p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {blockedDates.map((date) => (
                <span key={date} className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  {formatDisplayDate(date)}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function SchedulersPage() {
  const { bookings, isLoading, error } = useMarketplace();

  const sortedBookings = useMemo(
    () => [...bookings].sort((left, right) => left.date.localeCompare(right.date) || left.time.localeCompare(right.time)),
    [bookings],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Booking Scheduler</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track all user bookings here. Your availability is automatically determined from booking activity, not manual slot creation.
        </p>
      </div>

      {error && (
        <Card className="border border-red-200 bg-red-50">
          <CardContent className="py-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      <SummaryStrip bookings={sortedBookings} />

      <AvailabilityCard bookings={sortedBookings} />

      <Card className="overflow-hidden border border-gray-100 shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">All User Bookings</CardTitle>
            <p className="mt-0.5 text-xs text-gray-400">
              Every booking created by users for your profiles appears here, along with its current confirmation state.
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-gray-500">Loading your booking schedule...</div>
          ) : sortedBookings.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <CalendarDays className="h-8 w-8 text-blue-300" />
              </div>
              <div>
                <p className="font-semibold text-gray-600">No bookings yet</p>
                <p className="mt-1 text-sm text-gray-400">User bookings will appear here automatically once customers start booking your services.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["User", "Listing", "Event", "Date", "Time", "Location", "Amount", "Status"].map((heading) => (
                      <th key={heading} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-50 transition-colors hover:bg-blue-50/30">
                      <td className="px-4 py-4 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-semibold text-gray-900">
                            <UserRound className="h-4 w-4 text-blue-500" />
                            <span>{booking.userName}</span>
                          </div>
                          <p className="text-xs text-gray-500">{booking.userEmail}</p>
                          <p className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <Phone className="h-3.5 w-3.5" />
                            {booking.phoneNumber}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top font-semibold text-gray-800">{booking.listingName}</td>
                      <td className="px-4 py-4 align-top text-gray-600">{booking.eventType}</td>
                      <td className="px-4 py-4 align-top whitespace-nowrap text-gray-700">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-blue-500" />
                          {formatDisplayDate(booking.date)}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top whitespace-nowrap text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock3 className="h-4 w-4 text-amber-500" />
                          {booking.time}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-gray-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 text-rose-500" />
                          <span>{booking.location}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top whitespace-nowrap font-semibold text-gray-900">{booking.amount}</td>
                      <td className="px-4 py-4 align-top">
                        <Badge variant="secondary" className={`border ${bookingStatusClass(booking.status)}`}>
                          {booking.status === "confirmed" || booking.status === "approved_by_vendor" ? (
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          ) : null}
                          {bookingStatusLabel(booking.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
