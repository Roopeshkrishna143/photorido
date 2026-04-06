import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, MapPin, Phone, Users } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useMarketplace } from "../../../context/MarketplaceContext";
import { BookingSlotType, usePhotographerDetail } from "../../../hooks/usePhotographers";
import { showErrorAlert, showSuccessAlert } from "../../../lib/alerts";

interface MobileBookingProps {
  photographerId: string;
  onBack: () => void;
  onComplete: () => void;
}

type BookingStep = "calendar" | "details" | "confirm";

type DateStatus =
  | { status: "past"; color: string }
  | { status: "booked-full"; color: string; label: string }
  | { status: "booked-half"; color: string; label: string; bookedType: BookingSlotType }
  | { status: "pending"; color: string; label: string; count: number }
  | { status: "available"; color: string; label: string };

const BOOKING_OPTIONS = [
  { value: "full" as BookingSlotType, label: "Full Day" },
  { value: "morning" as BookingSlotType, label: "Morning" },
  { value: "afternoon" as BookingSlotType, label: "Afternoon" },
];

export function MobileBooking({ photographerId, onBack, onComplete }: MobileBookingProps) {
  const { user } = useAuth();
  const { createBooking } = useMarketplace();
  const { photographer, isLoading, error } = usePhotographerDetail(photographerId);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [step, setStep] = useState<BookingStep>("calendar");
  const [bookingType, setBookingType] = useState<BookingSlotType>("full");
  const [eventType, setEventType] = useState("");
  const [location, setLocation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.phoneNumber) {
      setPhoneNumber(user.phoneNumber);
    }
  }, [user?.phoneNumber]);

  const bookedDates = photographer?.bookedDates ?? [];
  const pendingRequests = photographer?.pendingRequests ?? [];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      daysInMonth: lastDay.getDate(),
      startingDayOfWeek: firstDay.getDay(),
    };
  };

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const getDateStatus = (date: Date): DateStatus => {
    const dateStr = formatDate(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      return { status: "past", color: "bg-gray-100 text-gray-400" };
    }

    const bookedDate = bookedDates.find((item) => item.date === dateStr);
    if (bookedDate?.type === "full") {
      return { status: "booked-full", color: "bg-red-100 text-red-700", label: "Booked" };
    }

    if (bookedDate) {
      return {
        status: "booked-half",
        color: "bg-red-50 text-red-600",
        label: bookedDate.type === "morning" ? "AM" : "PM",
        bookedType: bookedDate.type,
      };
    }

    const pendingRequest = pendingRequests.find((item) => item.date === dateStr);
    if (pendingRequest) {
      return {
        status: "pending",
        color: "bg-amber-100 text-amber-700",
        label: `${pendingRequest.count}`,
        count: pendingRequest.count,
      };
    }

    return { status: "available", color: "bg-green-100 text-green-700", label: "Open" };
  };

  const selectedDateStatus = useMemo(
    () => (selectedDate ? getDateStatus(selectedDate) : null),
    [selectedDate, bookedDates, pendingRequests],
  );

  const availableBookingTypes = useMemo(() => {
    if (selectedDateStatus?.status !== "booked-half") {
      return new Set<BookingSlotType>(["full", "morning", "afternoon"]);
    }

    return new Set<BookingSlotType>([
      selectedDateStatus.bookedType === "morning" ? "afternoon" : "morning",
    ]);
  }, [selectedDateStatus]);

  const resetForm = () => {
    setSelectedDate(null);
    setStep("calendar");
    setBookingType("full");
    setEventType("");
    setLocation("");
    setGuestCount("");
    setSpecialRequests("");
    setIsSubmitting(false);
    setPhoneNumber(user?.phoneNumber ?? "");
  };

  const handleDateClick = (date: Date) => {
    const status = getDateStatus(date);
    if (status.status === "past" || status.status === "booked-full") {
      return;
    }

    setSelectedDate(date);
    setBookingType(
      status.status === "booked-half"
        ? status.bookedType === "morning"
          ? "afternoon"
          : "morning"
        : "full",
    );
    setStep("details");
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleSubmit = async () => {
    if (!selectedDate || !eventType || !location || !phoneNumber) {
      await showErrorAlert("Booking request failed", { text: "Please fill in all required fields." });
      return;
    }

    if (!availableBookingTypes.has(bookingType)) {
      await showErrorAlert("Booking request failed", { text: "That time slot is no longer available." });
      return;
    }

    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!user) {
      await showErrorAlert("Login required", { text: "Please login to request a booking." });
      return;
    }

    if (!photographer || !selectedDate) {
      await showErrorAlert("Booking unavailable", { text: "This professional is not available right now." });
      return;
    }

    const normalizedEventType = eventType
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    const bookingTypeMap: Record<BookingSlotType, string> = {
      full: "Full Day",
      morning: "Morning Half Day",
      afternoon: "Afternoon Half Day",
    };

    try {
      setIsSubmitting(true);
      const didCreate = await createBooking({
        userName: user.name,
        userEmail: user.email,
        vendorName: photographer.name,
        photographerId: photographer.id,
        listingName: photographer.services[0] ?? `${photographer.specialty} Package`,
        eventType: normalizedEventType || "Other",
        location,
        date: formatDate(selectedDate),
        time: bookingTypeMap[bookingType],
        amount: photographer.price,
        phoneNumber,
      });

      if (!didCreate) {
        throw new Error("We couldn't create your booking. Please try again.");
      }

      await showSuccessAlert("Booking request sent", {
        text: "We sent your request to the professional for review.",
      });
      resetForm();
      onComplete();
    } catch (nextError) {
      await showErrorAlert("Booking request failed", {
        text: nextError instanceof Error ? nextError.message : "We couldn't send your booking request.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !photographer) {
    return (
      <div className="h-full bg-gray-50 px-4 py-16">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-blue-600 font-medium">
          <ChevronLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error ?? "We couldn't load this professional right now."}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-8 bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="h-11" />
        <div className="px-4 py-3">
          <button
            onClick={step === "calendar" ? onBack : () => setStep(step === "confirm" ? "details" : "calendar")}
            className="flex items-center gap-2 text-blue-600 font-medium"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-bold mt-2">
            {step === "calendar" && "Select Date"}
            {step === "details" && "Event Details"}
            {step === "confirm" && "Confirm Booking"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{photographer.name}</p>
        </div>
      </div>

      {step === "calendar" && (
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePrevMonth}
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-lg">{monthName}</h2>
            <button
              onClick={handleNextMonth}
              className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center active:scale-95 transition-transform"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-md">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const status = getDateStatus(date);
                const isSelected = selectedDate && formatDate(selectedDate) === formatDate(date);

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(date)}
                    disabled={status.status === "past" || status.status === "booked-full"}
                    className={[
                      "aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-all",
                      status.color,
                      isSelected ? "ring-2 ring-blue-600 scale-105" : "",
                      status.status === "past" || status.status === "booked-full" ? "opacity-50" : "active:scale-95",
                    ].join(" ")}
                  >
                    <span className="text-sm">{day}</span>
                    {status.label && <span className="text-[8px] mt-0.5">{status.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 bg-white rounded-2xl p-4 shadow-md space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 rounded" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-amber-100 rounded" />
              <span>Pending Requests</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-100 rounded" />
              <span>Fully Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-50 rounded" />
              <span>Half Day Available</span>
            </div>
          </div>
        </div>
      )}

      {step === "details" && selectedDate && (
        <div className="px-4 py-6">
          <div className="bg-blue-50 rounded-2xl p-4 mb-6">
            <div className="text-sm text-gray-600 mb-1">Selected Date</div>
            <div className="font-bold text-lg">
              {selectedDate.toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            {selectedDateStatus?.status === "pending" && (
              <p className="text-xs text-amber-700 mt-2">
                This date already has {selectedDateStatus.count} pending request{selectedDateStatus.count > 1 ? "s" : ""}.
              </p>
            )}
            {selectedDateStatus?.status === "booked-half" && (
              <p className="text-xs text-blue-700 mt-2">
                Only the {selectedDateStatus.bookedType === "morning" ? "afternoon" : "morning"} slot is still available.
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Booking Type *</label>
              <div className="grid grid-cols-3 gap-2">
                {BOOKING_OPTIONS.map((option) => {
                  const isDisabled = !availableBookingTypes.has(option.value);
                  return (
                    <button
                      key={option.value}
                      onClick={() => !isDisabled && setBookingType(option.value)}
                      disabled={isDisabled}
                      className={[
                        "py-3 rounded-xl font-semibold text-sm transition-all",
                        bookingType === option.value
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-white text-gray-700 border border-gray-200",
                        isDisabled ? "opacity-40 cursor-not-allowed" : "",
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Event Type *</label>
              <select
                value={eventType}
                onChange={(event) => setEventType(event.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select event type</option>
                <option value="wedding">Wedding</option>
                <option value="pre-wedding">Pre-Wedding Shoot</option>
                <option value="engagement">Engagement</option>
                <option value="birthday">Birthday Party</option>
                <option value="corporate">Corporate Event</option>
                <option value="portrait">Portrait Session</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Event Location *</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter event location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  placeholder="Enter your contact number"
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Estimated Guest Count</label>
              <div className="relative">
                <Users className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  placeholder="e.g., 150"
                  value={guestCount}
                  onChange={(event) => setGuestCount(event.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Special Requests</label>
              <textarea
                placeholder="Any specific requirements..."
                value={specialRequests}
                onChange={(event) => setSpecialRequests(event.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl active:scale-95 transition-transform"
            >
              Review Booking
            </button>
          </div>
        </div>
      )}

      {step === "confirm" && selectedDate && (
        <div className="px-4 py-6">
          <div className="bg-blue-50 rounded-2xl p-6 mb-6 space-y-3">
            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-600">Date:</span>
              <span className="font-semibold text-right">
                {selectedDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-600">Booking Type:</span>
              <span className="font-semibold capitalize">
                {bookingType === "full" ? "Full Day" : bookingType === "morning" ? "Morning" : "Afternoon"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-600">Event Type:</span>
              <span className="font-semibold capitalize">{eventType}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-600">Location:</span>
              <span className="font-semibold text-right">{location}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-sm text-gray-600">Phone:</span>
              <span className="font-semibold text-right">{phoneNumber}</span>
            </div>
            {guestCount && (
              <div className="flex justify-between gap-4">
                <span className="text-sm text-gray-600">Guest Count:</span>
                <span className="font-semibold">{guestCount}</span>
              </div>
            )}
          </div>

          {specialRequests && (
            <div className="bg-white rounded-2xl p-4 mb-6">
              <div className="text-sm font-semibold mb-2">Special Requests</div>
              <p className="text-sm text-gray-600">{specialRequests}</p>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800">
            Your request will be sent to the photographer for review. We will notify you when they respond.
          </div>

          <div className="space-y-3">
            <button
              onClick={() => void handleConfirm()}
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl active:scale-95 transition-transform disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSubmitting ? "Sending Request..." : "Confirm & Send Request"}</span>
            </button>
            <button
              onClick={() => setStep("details")}
              disabled={isSubmitting}
              className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl active:scale-95 transition-transform disabled:opacity-70"
            >
              Edit Details
            </button>
          </div>
        </div>
      )}

      {!user && !isLoading && (
        <div className="px-4 pb-6 text-center text-xs text-amber-700">
          Sign in before submitting a booking request.
        </div>
      )}
    </div>
  );
}
