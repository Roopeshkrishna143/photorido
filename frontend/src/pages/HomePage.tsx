import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { CheckCircle2, Loader2, MapPin, Smartphone, Star } from "lucide-react";
import { HeroSearch } from "../components/HeroSearch";
import { ServiceCategories } from "../components/ServiceCategories";
import { HowItWorks } from "../components/HowItWorks";
import { Button } from "../components/ui/button";
import { useMarketplacePublicSummary } from "../hooks/useMarketplacePublicSummary";
import { usePhotographers } from "../hooks/usePhotographers";
import type { Coordinates } from "../lib/location";
import { requestBrowserLocation } from "../lib/location";
import { showConfirmAlert, showErrorAlert, showInfoAlert } from "../lib/alerts";

const INITIAL_LOAD = 6;
const LOAD_MORE_COUNT = 6;
const HOME_LOCATION_PROMPT_KEY = "photorido:home-location-prompt";
const CURRENT_LOCATION_RADIUS_KM = 50;

type CurrentLocationState = Coordinates & {
  label: string;
};

export function HomePage() {
  const navigate = useNavigate();
  const { photographers, isLoading, error } = usePhotographers();
  const {
    summary,
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useMarketplacePublicSummary();
  const [displayCount, setDisplayCount] = useState(INITIAL_LOAD);
  const [currentLocation, setCurrentLocation] = useState<CurrentLocationState | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const displayedPhotographers = photographers.slice(0, displayCount);
  const hasMore = displayCount < photographers.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => Math.min(prev + LOAD_MORE_COUNT, photographers.length));
  };

  const handlePhotographerClick = (id: string) => {
    navigate(`/photographer/${id}`);
  };

  const requestHomeLocation = useCallback(async (forcePrompt = false) => {
    if (typeof window === "undefined") {
      return false;
    }

    if (!("geolocation" in navigator)) {
      if (forcePrompt) {
        await showInfoAlert("Location is not supported", {
          text: "This browser does not support geolocation for nearby search.",
        });
      }
      return false;
    }

    if (!forcePrompt && window.sessionStorage.getItem(HOME_LOCATION_PROMPT_KEY)) {
      return false;
    }

    if (!forcePrompt) {
      window.sessionStorage.setItem(HOME_LOCATION_PROMPT_KEY, "seen");
      const confirmed = await showConfirmAlert({
        title: "Use your current location?",
        text: "Allow location access to auto-fill nearby professionals from the homepage.",
        icon: "info",
        confirmButtonText: "Use My Location",
        cancelButtonText: "Not Now",
        confirmButtonColor: "#2563eb",
      });

      if (!confirmed) {
        return false;
      }
    }

    setIsLocating(true);

    try {
      const coordinates = await requestBrowserLocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      });

      setCurrentLocation({
        ...coordinates,
        label: "Current location",
      });

      return true;
    } catch (error) {
      if (forcePrompt) {
        await showErrorAlert("Location access failed", {
          text: error instanceof Error ? error.message : "We could not access your current location.",
        });
      } else {
        await showInfoAlert("Location skipped", {
          text: error instanceof Error ? error.message : "You can still search by entering a location manually.",
          toast: true,
          position: "top-end",
        });
      }

      return false;
    } finally {
      setIsLocating(false);
    }
  }, []);

  useEffect(() => {
    void requestHomeLocation(false);
  }, [requestHomeLocation]);

  const handleSearch = (params: {
    service: string;
    location: string;
    date: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
    useCurrentLocation?: boolean;
  }) => {
    const nextSearch = new URLSearchParams();

    if (params.service) nextSearch.set("service", params.service);
    if (params.location) nextSearch.set("location", params.location);
    if (params.date) nextSearch.set("date", params.date);
    if (params.useCurrentLocation && typeof params.lat === "number" && typeof params.lng === "number") {
      nextSearch.set("lat", String(params.lat));
      nextSearch.set("lng", String(params.lng));
      nextSearch.set("radiusKm", String(params.radiusKm ?? CURRENT_LOCATION_RADIUS_KM));
      nextSearch.set("sort", "distance-asc");
      if (!params.location) {
        nextSearch.set("location", "Current location");
      }
    }

    navigate(nextSearch.toString() ? `/search?${nextSearch.toString()}` : "/search");
  };

  return (
    <div className="min-h-screen">
      <div id="hero-search">
        <HeroSearch
          onSearch={handleSearch}
          summary={summary}
          isLoading={isSummaryLoading}
          currentLocation={currentLocation}
          isDetectingLocation={isLocating}
          onUseCurrentLocation={() => void requestHomeLocation(true)}
        />
      </div>

      <div id="services-section">
        <ServiceCategories
          categories={summary.serviceCategories}
          isLoading={isSummaryLoading}
          error={summaryError}
          onCategorySelect={(service) => handleSearch({ service, location: "", date: "" })}
        />
      </div>

      <HowItWorks compact={true} />

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Featured Professionals
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Discover talented photographers in your area
            </motion.p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-center text-red-700">
              {error}
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : displayedPhotographers.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-10 text-center text-gray-500">
              No professionals are available right now.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedPhotographers.map((photographer, index) => (
                <motion.div
                  key={photographer.id}
                  className="group cursor-pointer"
                  onClick={() => handlePhotographerClick(photographer.id)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={photographer.image}
                        alt={photographer.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {photographer.verified && (
                        <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-xl mb-1">{photographer.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{photographer.specialty}</p>
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{photographer.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold">{photographer.rating}</span>
                          <span className="text-gray-500 text-sm">({photographer.reviews})</span>
                        </div>
                        <span className="font-bold text-blue-600">{photographer.price}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {hasMore && !isLoading && !error && (
            <div className="text-center mt-12">
              <Button onClick={handleLoadMore} size="lg" variant="outline" className="min-w-[200px]">
                Load More Professionals
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Showing {displayedPhotographers.length} of {photographers.length} professionals
              </p>
            </div>
          )}

          {!hasMore && !isLoading && !error && displayCount > INITIAL_LOAD && (
            <div className="text-center mt-12">
              <p className="text-gray-600">You've reached the end of the list</p>
              <Button onClick={() => navigate("/search")} variant="outline" className="mt-4">
                Browse All Professionals
              </Button>
            </div>
          )}
        </div>
      </section>

      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={() => navigate("/mobile")}
          className="relative bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full p-4 shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 group"
          aria-label="Open Mobile App"
        >
          <Smartphone className="w-7 h-7 relative z-10" />
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            View Mobile App
          </div>
        </button>
        <span className="absolute inset-0 rounded-full bg-blue-600 opacity-75 animate-ping pointer-events-none"></span>
      </div>
    </div>
  );
}
