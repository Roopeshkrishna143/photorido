import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CheckCircle2, Clock, Heart, Loader2, MapPin, MessageCircle, Share2, Star } from "lucide-react";
import { Breadcrumb } from "../components/Breadcrumb";
import { BookingCalendar } from "../components/BookingCalendar";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { useMarketplace } from "../context/MarketplaceContext";
import { useFavorites } from "../hooks/useFavorites";
import { usePhotographerDetail } from "../hooks/usePhotographers";
import { showErrorAlert, showSuccessAlert } from "../lib/alerts";
import { formatDateInputValue, formatDisplayDate } from "../lib/date";
import { shareProfessional } from "../lib/share";

export function PhotographerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { reviews: marketplaceReviews, createBooking, openConversation } = useMarketplace();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { photographer, isLoading, error } = usePhotographerDetail(id);
  const [showBookingCalendar, setShowBookingCalendar] = useState(false);
  const [blockedDates, setBlockedDates] = useState<Array<{ date: string; type: "full" | "morning" | "afternoon" }>>([]);

  useEffect(() => {
    setBlockedDates(photographer?.bookedDates ?? []);
  }, [photographer]);

  const reviewItems = useMemo(() => {
    if (!photographer) {
      return [];
    }

    if (photographer.reviewItems.length > 0) {
      return photographer.reviewItems;
    }

    return marketplaceReviews
      .filter((review) => review.vendorName === photographer.name)
      .map((review) => ({
        id: review.id,
        reviewerName: review.userName,
        rating: review.rating,
        comment: review.comment,
        vendorResponse: review.vendorResponse ?? null,
        respondedAt: review.respondedAt ?? null,
        createdAt: review.createdAt,
      }));
  }, [marketplaceReviews, photographer]);

  const handleBookingRequest = async () => {
    if (!user) {
      await showErrorAlert("Login required", { text: "Please login to request a booking." });
      return;
    }

    if (!photographer) {
      await showErrorAlert("Booking unavailable", { text: "This professional is not available right now." });
      return;
    }

    setShowBookingCalendar(true);
  };

  const handleSubmitBooking = async (bookingData: any) => {
    if (!user || !photographer) {
      throw new Error("Please login to request a booking.");
    }

    const normalizedEventType = String(bookingData.eventType || "Other")
      .split("-")
      .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    const bookingTypeMap: Record<string, string> = {
      full: "Full Day",
      morning: "Morning Half Day",
      afternoon: "Afternoon Half Day",
    };

    const didCreate = await createBooking({
      userName: user.name,
      userEmail: user.email || undefined,
      userPhoneNumber: user.phoneNumber || undefined,
      vendorName: photographer.name,
      photographerId: photographer.id,
      listingName: photographer.services[0] ?? `${photographer.specialty} Package`,
      eventType: normalizedEventType,
      location: bookingData.location,
      date: formatDateInputValue(bookingData.date),
      time: bookingTypeMap[bookingData.bookingType] ?? "Full Day",
      amount: photographer.price,
      phoneNumber: bookingData.phoneNumber || user.phoneNumber || user.email || undefined,
    });

    if (!didCreate) {
      throw new Error("We couldn't create your booking. Please try again.");
    }

    const nextDate = formatDateInputValue(bookingData.date);
    setBlockedDates((current) => (
      current.some((entry) => entry.date === nextDate)
        ? current
        : [
            ...current,
            {
              date: nextDate,
              type: bookingData.bookingType === "morning" || bookingData.bookingType === "afternoon"
                ? bookingData.bookingType
                : "full",
            },
          ]
    ));
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      await showErrorAlert("Login required", { text: "Please login to save favorites." });
      return;
    }

    if (!photographer) {
      await showErrorAlert("Save failed", { text: "This professional is not available right now." });
      return;
    }

    const currentlyFavorite = isFavorite(photographer.id);
    const didToggle = await toggleFavorite(photographer.id, currentlyFavorite);
    if (didToggle) {
      await showSuccessAlert(currentlyFavorite ? "Removed from favorites" : "Added to favorites", {
        toast: true,
      });
    }
  };

  const handleShareVendor = async () => {
    if (!photographer) {
      return;
    }

    await shareProfessional({
      title: photographer.name,
      text: `Explore ${photographer.name} on Photorido`,
      path: `/photographer/${photographer.id}`,
    });
  };

  const handleMessageVendor = async () => {
    if (!user) {
      await showErrorAlert("Login required", { text: "Please login to send a message." });
      return;
    }

    if (!photographer) {
      await showErrorAlert("Messaging unavailable", { text: "This professional is not available right now." });
      return;
    }

    const conversationId = await openConversation({ photographerId: photographer.id });
    if (conversationId) {
      navigate(`/dashboard?tab=messages&conversationId=${conversationId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !photographer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700">
            {error ?? "We couldn't find this professional."}
          </div>
        </div>
      </div>
    );
  }

  const saved = isFavorite(photographer.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Breadcrumb
          items={[
            { label: "Photographers", href: "/search" },
            { label: photographer.name },
          ]}
        />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex flex-col sm:flex-row gap-6">
                <img src={photographer.image} alt={photographer.name} className="w-32 h-32 rounded-lg object-cover" />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-3xl font-bold">{photographer.name}</h1>
                        {photographer.verified && <CheckCircle2 className="w-6 h-6 text-blue-600" />}
                      </div>
                      <p className="text-lg text-gray-600">{photographer.specialty}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {photographer.location}
                    </div>
                    {photographer.experience && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {photographer.experience}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-lg">{photographer.rating}</span>
                      <span className="text-gray-500">({photographer.reviews || reviewItems.length} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold mb-3">About</h2>
              <p className="text-gray-600 leading-relaxed">
                {photographer.bio || "Profile details will appear here once the backend returns the full bio."}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4">Services Offered</h2>
              {photographer.services.length === 0 ? (
                <p className="text-gray-500 text-sm">Services will appear here once the profile is fully configured.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {photographer.services.map((service) => (
                    <span key={service} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {service}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4">Portfolio</h2>
              {photographer.portfolio.length === 0 ? (
                <p className="text-gray-500 text-sm">Portfolio images will appear here once the gallery syncs from the backend.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {photographer.portfolio.map((image, index) => (
                    <img
                      key={`${image}-${index}`}
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4">Reviews</h2>
              {reviewItems.length === 0 ? (
                <p className="text-gray-500 text-sm">Client reviews will appear here once the backend publishes them.</p>
              ) : (
                <div className="space-y-4">
                  {reviewItems.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
                          {review.reviewerName.slice(0, 1)}
                        </div>
                        <div>
                          <p className="font-semibold">{review.reviewerName}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }, (_, index) => (
                              <Star
                                key={`${review.id}-${index}`}
                                className={`w-3 h-3 ${index < Math.round(review.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-200"}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                      {review.vendorResponse && (
                        <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Vendor Reply</p>
                          <p className="mt-2 text-sm text-blue-900">{review.vendorResponse}</p>
                          {review.respondedAt && (
                            <p className="mt-2 text-xs text-blue-700">
                              Replied on {formatDisplayDate(review.respondedAt)}
                            </p>
                          )}
                        </div>
                      )}
                      {review.createdAt && (
                        <p className="mt-3 text-xs text-gray-400">
                          Posted on {formatDisplayDate(review.createdAt)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-md sticky top-24 space-y-4">
              <div className="text-center pb-4 border-b">
                <p className="text-sm text-gray-600 mb-1">Starting from</p>
                <p className="text-3xl font-bold text-blue-600">{photographer.price}</p>
                <p className="text-sm text-gray-500">per day</p>
              </div>

              <Button onClick={handleBookingRequest} className="w-full" size="lg">
                Request Booking
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => void handleToggleFavorite()} className="w-full">
                  <Heart className={`w-4 h-4 mr-2 ${saved ? "fill-red-500 text-red-500" : ""}`} />
                  Save
                </Button>
                <Button variant="outline" className="w-full" onClick={() => void handleShareVendor()}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              <Button variant="outline" className="w-full" onClick={() => void handleMessageVendor()}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </Button>

              {photographer.languages.length > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {photographer.languages.map((language) => (
                      <span key={language} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <BookingCalendar
        open={showBookingCalendar}
        onClose={() => setShowBookingCalendar(false)}
        photographerName={photographer.name}
        bookedDates={blockedDates}
        pendingRequests={photographer.pendingRequests}
        onSubmitBooking={handleSubmitBooking}
      />
    </div>
  );
}
