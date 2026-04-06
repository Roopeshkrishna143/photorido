import { useMemo, useState } from "react";
import { Calendar, CheckCircle2, ChevronRight, Heart, Loader2, MapPin, Share2, Star } from "lucide-react";
import { motion } from "motion/react";
import type { MobilePage } from "../MobileApp";
import { useAuth } from "../../../context/AuthContext";
import { useMarketplace } from "../../../context/MarketplaceContext";
import { useFavorites } from "../../../hooks/useFavorites";
import { usePhotographerDetail } from "../../../hooks/usePhotographers";
import { showErrorAlert, showSuccessAlert } from "../../../lib/alerts";
import { shareProfessional } from "../../../lib/share";

interface MobilePhotographerDetailsProps {
  photographerId: string;
  onNavigate: (page: MobilePage, data?: any) => void;
  onBack: () => void;
}

export function MobilePhotographerDetails({ photographerId, onNavigate, onBack }: MobilePhotographerDetailsProps) {
  const { user } = useAuth();
  const { reviews: marketplaceReviews } = useMarketplace();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { photographer, isLoading, error } = usePhotographerDetail(photographerId);
  const [activeTab, setActiveTab] = useState<"portfolio" | "reviews">("portfolio");

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
        createdAt: review.createdAt,
      }));
  }, [marketplaceReviews, photographer]);

  const handleBooking = async () => {
    if (!user) {
      await showErrorAlert("Login required", { text: "Please login to request a booking." });
      return;
    }

    if (!photographer) {
      await showErrorAlert("Booking unavailable", { text: "This professional is not available right now." });
      return;
    }

    onNavigate("booking", { photographerId: photographer.id });
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

  const handleShare = async () => {
    if (!photographer) {
      return;
    }

    await shareProfessional({
      title: photographer.name,
      text: `Explore ${photographer.name} on Photorido`,
      path: `/photographer/${photographer.id}`,
    });
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !photographer) {
    return (
      <div className="h-full bg-white px-4 py-16">
        <button onClick={onBack} className="mb-6 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <ChevronRight className="w-6 h-6 rotate-180" />
        </button>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error ?? "We couldn't load this professional right now."}
        </div>
      </div>
    );
  }

  const saved = isFavorite(photographer.id);

  return (
    <div className="h-full overflow-y-auto pb-32 bg-white">
      <div className="relative h-80 bg-gray-100">
        <img src={photographer.image} alt={photographer.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <button onClick={onBack} className="absolute top-14 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
          <ChevronRight className="w-6 h-6 rotate-180" />
        </button>

        <div className="absolute top-14 right-4 flex gap-2">
          <button onClick={() => void handleToggleFavorite()} className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <Heart className={`w-5 h-5 ${saved ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
          </button>
          <button onClick={() => void handleShare()} className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <Share2 className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-white">{photographer.name}</h1>
            {photographer.verified && <CheckCircle2 className="w-6 h-6 text-blue-400" />}
          </div>
          <p className="text-white/90 text-sm mb-2">{photographer.specialty}</p>
          <div className="flex items-center gap-4 text-white/90 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold">{photographer.rating}</span>
              <span className="text-white/70">({photographer.reviews || reviewItems.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{photographer.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="mb-6">
          <h2 className="font-bold text-lg mb-2">About</h2>
          <p className="text-gray-600 leading-relaxed">
            {photographer.bio || "Profile details will appear here once the backend returns the full bio."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-600 mb-1">{photographer.experience || "New"}</div>
            <div className="text-xs text-gray-600">Experience</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <div className="text-2xl font-bold text-green-600 mb-1">{photographer.reviews || reviewItems.length}</div>
            <div className="text-xs text-gray-600">Reviews</div>
          </div>
        </div>

        {photographer.services.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-3">Services Offered</h2>
            <div className="flex flex-wrap gap-2">
              {photographer.services.map((service) => (
                <span key={service} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {photographer.languages.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-3">Languages</h2>
            <div className="flex flex-wrap gap-2">
              {photographer.languages.map((language) => (
                <span key={language} className="px-4 py-2 bg-gray-100 rounded-full text-sm">{language}</span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <div className="flex gap-2 mb-4 border-b border-gray-200">
            <button onClick={() => setActiveTab("portfolio")} className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${activeTab === "portfolio" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"}`}>
              Portfolio
            </button>
            <button onClick={() => setActiveTab("reviews")} className={`px-4 py-2 font-semibold text-sm border-b-2 transition-colors ${activeTab === "reviews" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"}`}>
              Reviews
            </button>
          </div>

          {activeTab === "portfolio" && (
            photographer.portfolio.length === 0 ? (
              <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">Portfolio images will appear here once the backend syncs them.</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {photographer.portfolio.map((image, index) => (
                  <motion.img key={`${image}-${index}`} src={image} alt={`Portfolio ${index + 1}`} className="h-36 w-full rounded-2xl object-cover" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} />
                ))}
              </div>
            )
          )}

          {activeTab === "reviews" && (
            reviewItems.length === 0 ? (
              <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">Reviews will appear here once the backend returns them.</div>
            ) : (
              <div className="space-y-3">
                {reviewItems.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="font-semibold text-sm">{review.reviewerName}</p>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-semibold">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      <div className="fixed bottom-20 left-4 right-4">
        <button onClick={handleBooking} className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-xl">
          <Calendar className="inline-block mr-2 h-4 w-4" />
          Request Booking
        </button>
      </div>
    </div>
  );
}
