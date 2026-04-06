import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ChevronLeft, ChevronRight, Clock, Loader2, MapPin, Phone, Users } from "lucide-react";
import { showSuccessAlert } from "../lib/alerts";

interface BookingRequest {
  date: string;
  count: number; // 1-3 pending requests
}

interface BookedDate {
  date: string;
  type: "full" | "morning" | "afternoon";
}

interface BookingCalendarProps {
  open: boolean;
  onClose: () => void;
  photographerName: string;
  bookedDates?: BookedDate[]; // Red - already booked
  pendingRequests?: BookingRequest[]; // Amber - has pending requests
  onSubmitBooking: (bookingData: any) => Promise<void> | void;
}

export function BookingCalendar({
  open,
  onClose,
  photographerName,
  bookedDates = [],
  pendingRequests = [],
  onSubmitBooking,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Form state
  const [bookingType, setBookingType] = useState<"full" | "morning" | "afternoon">("full");
  const [eventType, setEventType] = useState("");
  const [location, setLocation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ tone: "error" | "info"; text: string } | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDateStatus = (date: Date) => {
    const dateStr = formatDate(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if date is in the past
    if (date < today) {
      return { status: "past", color: "bg-gray-100 text-gray-400 cursor-not-allowed" };
    }

    // Check if fully booked
    const bookedDate = bookedDates.find(d => d.date === dateStr);
    if (bookedDate?.type === "full") {
      return { 
        status: "booked-full", 
        color: "bg-red-100 text-red-800 cursor-not-allowed",
        label: "Booked"
      };
    }

    // Check if half booked
    if (bookedDate) {
      return {
        status: "booked-half",
        color: "bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer",
        label: bookedDate.type === "morning" ? "AM Booked" : "PM Booked",
        bookedType: bookedDate.type
      };
    }

    // Check for pending requests
    const pendingRequest = pendingRequests.find(r => r.date === dateStr);
    if (pendingRequest) {
      return {
        status: "pending",
        color: "bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer",
        label: `${pendingRequest.count} pending`,
        count: pendingRequest.count
      };
    }

    // Available
    return {
      status: "available",
      color: "bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer",
      label: "Available"
    };
  };

  const handleDateClick = (date: Date) => {
    const status = getDateStatus(date);
    if (status.status === "past" || status.status === "booked-full") {
      return;
    }
    setFormMessage(null);
    setSelectedDate(date);
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleSubmitRequest = async () => {
    if (!selectedDate || !eventType || !location || !phoneNumber) {
      setFormMessage({ tone: "error", text: "Please fill in all required booking details before continuing." });
      return;
    }

    setFormMessage(null);
    setShowConfirmation(true);
  };

  const handleConfirmBooking = async () => {
    const bookingData = {
      date: selectedDate,
      bookingType,
      eventType,
      location,
      phoneNumber,
      guestCount,
      specialRequests,
      photographerName,
    };

    try {
      setIsSubmitting(true);
      await onSubmitBooking(bookingData);
      onClose();
      resetForm();
      await new Promise((resolve) => window.setTimeout(resolve, 150));
      await showSuccessAlert("Booking request sent", {
        text: "The photographer will review and respond soon.",
      });
    } catch (error) {
      setFormMessage({
        tone: "error",
        text: error instanceof Error ? error.message : "We couldn't send your booking request.",
      });
      setShowConfirmation(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedDate(null);
    setShowConfirmation(false);
    setBookingType("full");
    setEventType("");
    setLocation("");
    setPhoneNumber("");
    setGuestCount("");
    setSpecialRequests("");
    setFormMessage(null);
    setIsSubmitting(false);
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  if (showConfirmation && selectedDate) {
    const dateStatus = getDateStatus(selectedDate);
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Booking Request</DialogTitle>
            <DialogDescription>Please review your booking details before submitting</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Photographer:</span>
                <span className="font-semibold">{photographerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Date:</span>
                <span className="font-semibold">{selectedDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Booking Type:</span>
                <span className="font-semibold capitalize">{bookingType === "full" ? "Full Day" : bookingType === "morning" ? "Morning (Half Day)" : "Afternoon (Half Day)"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Event Type:</span>
                <span className="font-semibold">{eventType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Location:</span>
                <span className="font-semibold">{location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Phone:</span>
                <span className="font-semibold">{phoneNumber}</span>
              </div>
              {guestCount && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Guest Count:</span>
                  <span className="font-semibold">{guestCount}</span>
                </div>
              )}
            </div>

            {dateStatus.status === "pending" && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                ⚠️ This date has {dateStatus.count} pending request{dateStatus.count > 1 ? 's' : ''}. The photographer will review all requests and accept one.
              </div>
            )}

            {dateStatus.status === "booked-half" && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                ℹ️ The {dateStatus.bookedType === "morning" ? "afternoon" : "morning"} slot is still available for this date.
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowConfirmation(false)} className="flex-1">
                Edit Details
              </Button>
              <Button onClick={handleConfirmBooking} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Confirm & Send Request"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Booking with {photographerName}</DialogTitle>
          <DialogDescription>Select a date and provide event details</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Calendar */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="font-semibold">{monthName}</h3>
              <Button variant="ghost" size="sm" onClick={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {[...Array(startingDayOfWeek)].map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const status = getDateStatus(date);
                const isSelected = selectedDate && formatDate(selectedDate) === formatDate(date);

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(date)}
                    className={`
                      aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-all
                      ${status.color}
                      ${isSelected ? 'ring-2 ring-blue-600 scale-105' : ''}
                    `}
                  >
                    <span>{day}</span>
                    {status.label && (
                      <span className="text-[8px] mt-0.5">{status.label}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-amber-100 rounded" />
                <span>Pending Requests (you can still request)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 rounded" />
                <span>Fully Booked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-50 rounded" />
                <span>Half Day Available</span>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="space-y-4">
            {selectedDate ? (
              <>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Selected Date</p>
                  <p className="font-semibold">{selectedDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                {formMessage && (
                  <div className={`rounded-lg border px-4 py-3 text-sm ${formMessage.tone === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-blue-200 bg-blue-50 text-blue-700"}`}>
                    {formMessage.text}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="booking-type">Booking Type *</Label>
                  <Select value={bookingType} onValueChange={(v: any) => setBookingType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Day</SelectItem>
                      <SelectItem value="morning">Morning (Half Day)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (Half Day)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-type">Event Type *</Label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="pre-wedding">Pre-Wedding Shoot</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="birthday">Birthday Party</SelectItem>
                      <SelectItem value="corporate">Corporate Event</SelectItem>
                      <SelectItem value="portrait">Portrait Session</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Event Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="location"
                      placeholder="Enter event location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone-number">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone-number"
                      type="tel"
                      placeholder="Enter your contact number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guest-count">Estimated Guest Count</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="guest-count"
                      type="number"
                      placeholder="e.g., 150"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="special-requests">Special Requests</Label>
                  <Textarea
                    id="special-requests"
                    placeholder="Any specific requirements or preferences..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button onClick={handleSubmitRequest} className="w-full">
                  Review & Send Request
                </Button>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a date from the calendar to continue</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
