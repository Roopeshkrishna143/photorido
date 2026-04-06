import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Calendar, Crosshair, Loader2, MapPin, Search, Sparkles, TrendingUp } from "lucide-react";
import type { MarketplacePublicSummary } from "../hooks/useMarketplacePublicSummary";
import type { Coordinates } from "../lib/location";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface HeroSearchParams {
  service: string;
  location: string;
  date: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  useCurrentLocation?: boolean;
}

interface HeroSearchProps {
  onSearch?: (params: HeroSearchParams) => void;
  summary?: MarketplacePublicSummary;
  isLoading?: boolean;
  currentLocation?: (Coordinates & { label: string }) | null;
  isDetectingLocation?: boolean;
  onUseCurrentLocation?: () => void;
}

const compactNumberFormatter = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatCompactNumber(value: number) {
  return compactNumberFormatter.format(value);
}

const DEFAULT_CURRENT_LOCATION_RADIUS_KM = 50;

export function HeroSearch({
  onSearch,
  summary,
  isLoading = false,
  currentLocation = null,
  isDetectingLocation = false,
  onUseCurrentLocation,
}: HeroSearchProps) {
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const trendingSearches = summary?.trendingSearches ?? [];
  const stats = summary?.stats;
  const hasStats = Boolean(
    stats && (
      stats.professionals > 0 ||
      stats.activeVendors > 0 ||
      stats.activeCategories > 0 ||
      stats.averageRating > 0
    ),
  );

  useEffect(() => {
    if (!currentLocation || location.trim()) {
      return;
    }

    setLocation(currentLocation.label);
    setUseCurrentLocation(true);
  }, [currentLocation, location]);

  const handleSearch = () => {
    onSearch?.({
      service,
      location,
      date,
      lat: useCurrentLocation && currentLocation ? currentLocation.lat : undefined,
      lng: useCurrentLocation && currentLocation ? currentLocation.lng : undefined,
      radiusKm: useCurrentLocation && currentLocation ? DEFAULT_CURRENT_LOCATION_RADIUS_KM : undefined,
      useCurrentLocation: useCurrentLocation && Boolean(currentLocation),
    });
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[var(--blue-50)] via-white to-[var(--blue-100)]">
      <div className="absolute inset-0 gradient-mesh opacity-50" />
      <div className="absolute top-20 right-20 h-72 w-72 rounded-full bg-[var(--blue-200)] blur-3xl opacity-20" />
      <div className="absolute bottom-20 left-20 h-72 w-72 rounded-full bg-[var(--blue-300)] blur-3xl opacity-20" />

      <div className="relative container mx-auto px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--blue-200)] bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-[var(--blue-600)]" />
              <span className="text-sm text-[var(--blue-700)]">
                {hasStats
                  ? `Live marketplace with ${formatCompactNumber(stats?.professionals ?? 0)} active professional listings`
                  : "Search live marketplace listings backed by the backend API"}
              </span>
            </div>
          </motion.div>

          <motion.h1
            className="mb-6 text-4xl tracking-tight text-[var(--primary)] sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="text-gradient">Find Local Professionals</span>
          </motion.h1>

          <motion.p
            className="mx-auto mb-12 max-w-2xl text-lg text-[var(--muted-foreground)] sm:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Connect with talented photographers, video editors, album designers, and more wherever you are.
          </motion.p>

          <motion.div
            className="mx-auto max-w-4xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex flex-col gap-4 rounded-3xl border border-[var(--blue-100)] bg-white p-3 shadow-2xl">
              <div className="flex flex-col gap-3 sm:flex-row">
                <motion.div
                  className="flex h-[44px] flex-1 items-center gap-3 rounded-2xl border-2 border-transparent bg-[var(--blue-50)] px-4 py-2.5 transition-all hover:bg-white focus-within:border-[var(--blue-500)] focus-within:bg-white focus-within:shadow-lg"
                  whileHover={{ scale: 1.01 }}
                >
                  <Search className="h-5 w-5 shrink-0 text-[var(--blue-600)]" />
                  <Input
                    type="text"
                    placeholder="What service do you need?"
                    value={service}
                    onChange={(event) => setService(event.target.value)}
                    className="border-0 bg-transparent p-0 placeholder:text-[var(--muted-foreground)] focus-visible:ring-0"
                  />
                </motion.div>

                <motion.div
                  className="flex h-[44px] flex-1 items-center gap-3 rounded-2xl border-2 border-transparent bg-[var(--blue-50)] px-4 py-2.5 transition-all hover:bg-white focus-within:border-[var(--blue-500)] focus-within:bg-white focus-within:shadow-lg"
                  whileHover={{ scale: 1.01 }}
                >
                  <MapPin className="h-5 w-5 shrink-0 text-[var(--blue-600)]" />
                  <Input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(event) => {
                      setLocation(event.target.value);
                      setUseCurrentLocation(false);
                    }}
                    className="border-0 bg-transparent p-0 placeholder:text-[var(--muted-foreground)] focus-visible:ring-0"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 shrink-0 rounded-full px-3 text-[var(--blue-700)] hover:bg-[var(--blue-100)]"
                    onClick={() => {
                      if (currentLocation) {
                        setLocation(currentLocation.label);
                        setUseCurrentLocation(true);
                        return;
                      }

                      onUseCurrentLocation?.();
                    }}
                    disabled={isDetectingLocation}
                  >
                    {isDetectingLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Crosshair className="h-4 w-4" />
                    )}
                    <span className="ml-1.5 hidden sm:inline">Near me</span>
                  </Button>
                </motion.div>

                <motion.div
                  className="hidden h-[44px] flex-1 items-center gap-3 rounded-2xl border-2 border-transparent bg-[var(--blue-50)] px-4 py-2.5 transition-all hover:bg-white focus-within:border-[var(--blue-500)] focus-within:bg-white focus-within:shadow-lg sm:flex"
                  whileHover={{ scale: 1.01 }}
                >
                  <Calendar className="h-5 w-5 shrink-0 text-[var(--blue-600)]" />
                  <Input
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="border-0 bg-transparent p-0 placeholder:text-[var(--muted-foreground)] focus-visible:ring-0"
                  />
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="h-[44px] rounded-2xl bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-700)] px-8 text-white shadow-lg transition-all hover:from-[var(--blue-700)] hover:to-[var(--blue-800)] hover:shadow-xl"
                    onClick={handleSearch}
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Search
                  </Button>
                </motion.div>
              </div>

              {(isLoading || trendingSearches.length > 0) && (
                <div className="flex flex-wrap items-center gap-2 px-2">
                  <div className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
                    <TrendingUp className="h-4 w-4" />
                    <span>Trending:</span>
                  </div>
                  {isLoading ? (
                    Array.from({ length: 4 }, (_, index) => (
                      <div key={index} className="h-7 w-28 animate-pulse rounded-full bg-[var(--blue-100)]" />
                    ))
                  ) : (
                    trendingSearches.map((search, index) => (
                      <motion.div
                        key={search}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <Badge
                          variant="secondary"
                          className="cursor-pointer transition-all hover:bg-[var(--blue-100)] hover:text-[var(--blue-700)]"
                          onClick={() => setService(search)}
                        >
                          {search}
                        </Badge>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {(currentLocation || isDetectingLocation) && (
                <div className="flex flex-wrap items-center gap-2 px-2 text-sm text-[var(--muted-foreground)]">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--blue-100)] bg-[var(--blue-50)] px-3 py-1.5">
                    {isDetectingLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[var(--blue-600)]" />
                    ) : (
                      <Crosshair className="h-4 w-4 text-[var(--blue-600)]" />
                    )}
                    <span>
                      {isDetectingLocation
                        ? "Detecting your current location..."
                        : useCurrentLocation && currentLocation
                          ? `Searching near ${currentLocation.label}`
                          : currentLocation?.label}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {(isLoading || hasStats) && (
            <motion.div
              className="mt-16 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {isLoading ? (
                Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-2xl bg-white/60" />
                ))
              ) : (
                <>
                  <div>
                    <div className="mb-1 text-3xl text-[var(--blue-600)] sm:text-4xl">
                      {formatCompactNumber(stats?.professionals ?? 0)}
                    </div>
                    <div className="text-sm text-[var(--muted-foreground)]">Professionals</div>
                  </div>
                  <div>
                    <div className="mb-1 text-3xl text-[var(--blue-600)] sm:text-4xl">
                      {formatCompactNumber(stats?.activeVendors ?? 0)}
                    </div>
                    <div className="text-sm text-[var(--muted-foreground)]">Active Vendors</div>
                  </div>
                  <div>
                    <div className="mb-1 text-3xl text-[var(--blue-600)] sm:text-4xl">
                      {formatCompactNumber(stats?.activeCategories ?? 0)}
                    </div>
                    <div className="text-sm text-[var(--muted-foreground)]">Categories</div>
                  </div>
                  <div>
                    <div className="mb-1 text-3xl text-[var(--blue-600)] sm:text-4xl">
                      {(stats?.averageRating ?? 0).toFixed(1)}★
                    </div>
                    <div className="text-sm text-[var(--muted-foreground)]">Avg Rating</div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
