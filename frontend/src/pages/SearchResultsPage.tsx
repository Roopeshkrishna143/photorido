import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, ArrowUpRight, Calendar, CheckCircle2, Crosshair, Filter, Loader2, MapPin, Search, Star, X } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useMarketplacePublicSummary } from "../hooks/useMarketplacePublicSummary";
import { usePhotographerSearch } from "../hooks/usePhotographers";
import { useSearchAdvertisements } from "../hooks/useSearchAdvertisements";
import { formatDistanceKm, requestBrowserLocation } from "../lib/location";

const RADIUS_OPTIONS = [10, 25, 50, 100] as const;
const DEFAULT_NEARBY_RADIUS_KM = 50;
const SORT_OPTIONS = [
  { label: "Best match", value: "latest" },
  { label: "Nearest first", value: "distance-asc" },
  { label: "Top rated", value: "rating-desc" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
  { label: "Most reviewed", value: "reviews-desc" },
] as const;

function parseNumber(value: string | null, fallback = 0) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function humanizeService(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function calculateMarkerPosition(
  lat: number,
  lng: number,
  index: number,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
) {
  const latRange = bounds.maxLat - bounds.minLat || 1;
  const lngRange = bounds.maxLng - bounds.minLng || 1;
  const hasCoordinates = lat !== 0 || lng !== 0;

  if (!hasCoordinates) {
    return { left: 16 + (index % 4) * 18, top: 16 + Math.floor(index / 4) * 18 };
  }

  return {
    left: 10 + ((lng - bounds.minLng) / lngRange) * 74,
    top: 12 + ((bounds.maxLat - lat) / latRange) * 72,
  };
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      {label ? <p className="mb-2 text-sm font-medium text-slate-700">{label}</p> : null}
      {children}
    </div>
  );
}

export function SearchResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const stateServiceType = (location.state as { serviceType?: string } | null)?.serviceType;
  const { summary } = useMarketplacePublicSummary();
  const { advertisements, isLoading: isAdsLoading, error: adsError } = useSearchAdvertisements(6);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLocatingNearMe, setIsLocatingNearMe] = useState(false);
  const [nearMeError, setNearMeError] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!stateServiceType || searchParams.get("service")) return;

    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("service", humanizeService(stateServiceType));
      next.set("page", "1");
      return next;
    }, { replace: true });
  }, [searchParams, setSearchParams, stateServiceType]);

  const filters = useMemo(() => ({
    q: searchParams.get("q") ?? "",
    service: searchParams.get("service") ?? "",
    specialties: (searchParams.get("specialties") ?? "").split(",").map((entry) => entry.trim()).filter(Boolean),
    location: searchParams.get("location") ?? "",
    date: searchParams.get("date") ?? "",
    minRating: parseNumber(searchParams.get("minRating"), 0),
    minPrice: parseNumber(searchParams.get("minPrice"), 0),
    maxPrice: parseNumber(searchParams.get("maxPrice"), 0),
    lat: searchParams.get("lat") ? parseNumber(searchParams.get("lat")) : undefined,
    lng: searchParams.get("lng") ? parseNumber(searchParams.get("lng")) : undefined,
    radiusKm: searchParams.get("radiusKm") ? Math.max(0, parseNumber(searchParams.get("radiusKm"), 50)) : undefined,
    sort: searchParams.get("sort") ?? (searchParams.get("lat") && searchParams.get("lng") ? "distance-asc" : "latest"),
    page: Math.max(1, parseNumber(searchParams.get("page"), 1)),
    limit: 9,
  }), [searchParams]);

  const { photographers, total, totalPages, page, isLoading, error } = usePhotographerSearch(filters);

  const visiblePhotographers = useMemo(
    () => photographers.filter((photographer) => !verifiedOnly || photographer.verified),
    [photographers, verifiedOnly],
  );

  const specialtyOptions = useMemo(() => {
    const values = new Set<string>();
    summary.serviceCategories.forEach((category) => values.add(category.name));
    photographers.forEach((photographer) => {
      if (photographer.specialty) values.add(photographer.specialty);
    });
    return Array.from(values).sort((left, right) => left.localeCompare(right));
  }, [photographers, summary.serviceCategories]);

  const mapBounds = useMemo(() => {
    const coordinates = visiblePhotographers
      .map((photographer) => photographer.coordinates)
      .filter((entry) => entry.lat !== 0 || entry.lng !== 0);

    if (coordinates.length === 0) {
      return { minLat: 0, maxLat: 1, minLng: 0, maxLng: 1 };
    }

    return {
      minLat: Math.min(...coordinates.map((entry) => entry.lat)),
      maxLat: Math.max(...coordinates.map((entry) => entry.lat)),
      minLng: Math.min(...coordinates.map((entry) => entry.lng)),
      maxLng: Math.max(...coordinates.map((entry) => entry.lng)),
    };
  }, [visiblePhotographers]);

  useEffect(() => {
    if (visiblePhotographers.length === 0) {
      setSelectedId(null);
      return;
    }

    const nextSelectedId = visiblePhotographers.some((photographer) => photographer.id === selectedId)
      ? selectedId
      : visiblePhotographers[0]?.id ?? null;

    setSelectedId(nextSelectedId);
  }, [visiblePhotographers, selectedId]);

  useEffect(() => {
    if (typeof filters.lat === "number" && typeof filters.lng === "number") {
      setNearMeError(null);
    }
  }, [filters.lat, filters.lng]);

  const updateParam = (key: string, value: string) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (!value.trim()) next.delete(key);
      else next.set(key, value);
      if (key === "location") {
        next.delete("lat");
        next.delete("lng");
        next.delete("radiusKm");
      }
      next.set("page", "1");
      return next;
    });
  };

  const updateArrayParam = (key: string, values: string[]) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (values.length === 0) next.delete(key);
      else next.set(key, values.join(","));
      next.set("page", "1");
      return next;
    });
  };

  const updatePage = (nextPage: number) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("page", String(nextPage));
      return next;
    });
  };

  const clearFilters = () => {
    setVerifiedOnly(false);
    setNearMeError(null);
    setSearchParams(new URLSearchParams());
  };

  const clearNearMe = () => {
    setNearMeError(null);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("lat");
      next.delete("lng");
      next.delete("radiusKm");
      if ((next.get("sort") ?? "") === "distance-asc") {
        next.set("sort", "latest");
      }
      const locationLabel = (next.get("location") ?? "").trim().toLowerCase();
      if (locationLabel === "current location" || locationLabel === "near me" || locationLabel === "my location") {
        next.delete("location");
      }
      next.set("page", "1");
      return next;
    });
  };

  const useNearMe = async () => {
    setIsLocatingNearMe(true);
    setNearMeError(null);

    try {
      const coordinates = await requestBrowserLocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      });

      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set("lat", String(coordinates.lat));
        next.set("lng", String(coordinates.lng));
        next.set("radiusKm", String(filters.radiusKm ?? DEFAULT_NEARBY_RADIUS_KM));
        next.set("sort", "distance-asc");
        const locationLabel = (next.get("location") ?? "").trim().toLowerCase();
        if (locationLabel === "current location" || locationLabel === "near me" || locationLabel === "my location") {
          next.delete("location");
        }
        next.set("page", "1");
        return next;
      });
    } catch (nextError) {
      setNearMeError(nextError instanceof Error ? nextError.message : "Unable to use your location right now.");
    } finally {
      setIsLocatingNearMe(false);
    }
  };

  const updateCombinedSearch = (value: string) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (!value.trim()) {
        next.delete("service");
        next.delete("q");
      } else {
        next.set("service", value);
        next.set("q", value);
      }
      next.set("page", "1");
      return next;
    });
  };

  const toggleSpecialty = (specialty: string) => {
    const nextValues = filters.specialties.includes(specialty)
      ? filters.specialties.filter((entry) => entry !== specialty)
      : [...filters.specialties, specialty];
    updateArrayParam("specialties", nextValues);
  };

  const handleMarkerClick = (photographerId: string) => {
    setSelectedId(photographerId);
    cardRefs.current[photographerId]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const sortLabel = SORT_OPTIONS.find((option) => option.value === filters.sort)?.label ?? "Best match";

  const activeFilters = [
    filters.service ? `Service: ${filters.service}` : null,
    filters.location ? `Location: ${filters.location}` : null,
    filters.date ? `Date: ${filters.date}` : null,
    typeof filters.lat === "number" && typeof filters.lng === "number" ? `Near me (${filters.radiusKm ?? DEFAULT_NEARBY_RADIUS_KM} km)` : null,
    filters.sort && filters.sort !== "latest" ? `Sort: ${sortLabel}` : null,
    filters.specialties.length > 0 ? `Specialties: ${filters.specialties.join(", ")}` : null,
    filters.minRating > 0 ? `${filters.minRating}+ stars` : null,
    filters.minPrice > 0 ? `Min Rs. ${filters.minPrice.toLocaleString("en-IN")}` : null,
    filters.maxPrice > 0 ? `Max Rs. ${filters.maxPrice.toLocaleString("en-IN")}` : null,
    verifiedOnly ? "Verified only" : null,
  ].filter(Boolean) as string[];

  const selectedPhotographer = visiblePhotographers.find((photographer) => photographer.id === selectedId) ?? null;
  const mapEmbedUrl = useMemo(() => {
    const mapTarget = selectedPhotographer ?? visiblePhotographers[0] ?? null;

    if (!mapTarget) {
      return "https://maps.google.com/maps?q=India&z=4&output=embed";
    }

    const { lat, lng } = mapTarget.coordinates;
    if (Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)) {
      return `https://maps.google.com/maps?q=${lat},${lng}&z=12&output=embed`;
    }

    const query = encodeURIComponent(mapTarget.location || mapTarget.name || "India");
    return `https://maps.google.com/maps?q=${query}&z=12&output=embed`;
  }, [selectedPhotographer, visiblePhotographers]);

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <section className="sticky top-20 z-30 border-y border-slate-200 bg-gradient-to-b from-[#edf3ff] via-[#f7faff] to-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <div className="mx-auto max-w-[1560px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-[2rem]">
                  Results: {visiblePhotographers.length} Professional{visiblePhotographers.length === 1 ? "" : "s"} Found
                </h1>
                <p className="text-sm text-slate-500">
                  {typeof filters.lat === "number" && typeof filters.lng === "number"
                    ? "Showing results near your location"
                    : "Showing results across your selected area"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowFilters((current) => !current)}
                className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-blue-200 hover:text-blue-700"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? "Hide Filters" : "Filters"}
              </button>
            </div>

            <div className="rounded-[24px] border border-white/70 bg-white/85 p-4 shadow-[0_18px_40px_rgba(37,99,235,0.08)] backdrop-blur">
              <div className="grid gap-3 xl:grid-cols-[1.15fr_1.15fr_0.8fr_190px_170px]">
                <Field label="">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" />
                    <Input value={filters.service || filters.q} onChange={(event) => updateCombinedSearch(event.target.value)} placeholder="What service do you need?" className="h-12 rounded-2xl border-slate-200 bg-[#f5f8ff] pl-11 shadow-none" />
                  </div>
                </Field>
                <Field label="">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" />
                    <Input value={filters.location} onChange={(event) => updateParam("location", event.target.value)} placeholder="Ex: Colony, Area, City, State" className="h-12 rounded-2xl border-slate-200 bg-[#f5f8ff] pl-11 shadow-none" />
                  </div>
                </Field>
                <Field label="">
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-500" />
                    <Input type="date" value={filters.date} onChange={(event) => updateParam("date", event.target.value)} className="h-12 rounded-2xl border-slate-200 bg-[#f5f8ff] pl-11 shadow-none" />
                  </div>
                </Field>
                <Button type="button" variant="outline" onClick={() => void useNearMe()} disabled={isLocatingNearMe} className="h-12 rounded-2xl border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700">
                  {isLocatingNearMe ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Locating...
                    </>
                  ) : (
                    <>
                      <Crosshair className="mr-2 h-4 w-4" />
                      Near me
                    </>
                  )}
                </Button>
                <Button type="button" onClick={() => updatePage(1)} className="h-12 rounded-2xl bg-blue-600 text-base font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.28)] hover:bg-blue-700">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </div>

              {nearMeError && (
                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {nearMeError}
                </p>
              )}

              {showFilters && (
                <div className="mt-4 space-y-4">
                  <div className="grid gap-3 lg:grid-cols-5">
                    <Field label="Price Range">
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                        <div className="mb-3 h-1 rounded-full bg-slate-200">
                          <div className="h-1 rounded-full bg-slate-900" style={{ width: `${((filters.maxPrice > 0 ? Math.min(filters.maxPrice, 85000) : 85000) / 85000) * 100}%` }} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="number" min="0" value={filters.minPrice || ""} onChange={(event) => updateParam("minPrice", event.target.value)} placeholder="Rs. 0" className="h-10 rounded-xl border-slate-200 bg-[#f8fafc]" />
                          <Input type="number" min="0" value={filters.maxPrice || ""} onChange={(event) => updateParam("maxPrice", event.target.value)} placeholder="Rs. 85000+" className="h-10 rounded-xl border-slate-200 bg-[#f8fafc]" />
                        </div>
                      </div>
                    </Field>
                    <Field label="Minimum Rating">
                      <select value={String(filters.minRating)} onChange={(event) => updateParam("minRating", event.target.value === "0" ? "" : event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                        <option value="0">Any Rating</option>
                        <option value="4">4.0+ stars</option>
                        <option value="4.5">4.5+ stars</option>
                        <option value="4.8">4.8+ stars</option>
                      </select>
                    </Field>
                    <Field label="Sort by">
                      <select value={filters.sort} onChange={(event) => updateParam("sort", event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                        {SORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Verification">
                      <button type="button" onClick={() => setVerifiedOnly((current) => !current)} className={`flex h-12 w-full items-center rounded-2xl border px-4 text-left text-sm transition-colors ${verifiedOnly ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"}`}>
                        Verified Only
                      </button>
                    </Field>
                    <Field label=" ">
                      <Button type="button" variant="outline" onClick={clearFilters} className="h-12 w-full rounded-2xl border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
                        Clear all Filters
                      </Button>
                    </Field>
                  </div>

                  {filters.minPrice > 0 && filters.maxPrice > 0 && filters.minPrice > filters.maxPrice && (
                    <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                      Minimum and maximum prices are auto-adjusted when you search.
                    </p>
                  )}

                  {typeof filters.lat === "number" && typeof filters.lng === "number" && (
                    <div className="grid gap-3 md:grid-cols-[220px_auto]">
                      <Field label="Nearby Radius">
                        <select value={String(filters.radiusKm ?? DEFAULT_NEARBY_RADIUS_KM)} onChange={(event) => updateParam("radiusKm", event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                          {RADIUS_OPTIONS.map((radiusKm) => (
                            <option key={radiusKm} value={radiusKm}>{radiusKm} km</option>
                          ))}
                        </select>
                      </Field>
                      <div className="flex items-end">
                        <Button type="button" variant="outline" className="h-12 rounded-2xl border-slate-200 bg-white" onClick={clearNearMe}>
                          <Crosshair className="mr-2 h-4 w-4" />
                          Clear near me
                        </Button>
                      </div>
                    </div>
                  )}

                  {specialtyOptions.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-slate-700">Specialities</p>
                      <div className="flex flex-wrap gap-2">
                        {specialtyOptions.map((specialty) => {
                          const active = filters.specialties.includes(specialty);
                          return (
                            <button key={specialty} type="button" onClick={() => toggleSpecialty(specialty)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"}`}>
                              {specialty}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1560px] px-4 py-8 sm:px-6 lg:px-8">
        {activeFilters.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <span key={filter} className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                {filter}
              </span>
            ))}
            <button type="button" onClick={clearFilters} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-red-200 hover:text-red-600">
              <X className="h-3.5 w-3.5" />
              Clear all
            </button>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.92fr)_minmax(560px,1.45fr)_minmax(280px,0.85fr)]">
          <div className="space-y-4 xl:pr-2">
            {error ? (
              <Card className="border border-red-200 bg-red-50 shadow-sm">
                <CardContent className="p-6 text-sm text-red-700">{error}</CardContent>
              </Card>
            ) : isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="h-40 animate-pulse rounded-[24px] border border-slate-200 bg-white" />
                ))}
              </div>
            ) : visiblePhotographers.length === 0 ? (
              <Card className="border border-dashed border-slate-200 shadow-sm">
                <CardContent className="flex flex-col items-start gap-3 p-8 text-left">
                  <p className="text-base font-medium text-slate-900">No professionals found.</p>
                  <p className="text-sm text-slate-500">Try widening your location, removing the date, or adjusting the price and rating filters.</p>
                  <Button variant="outline" onClick={clearFilters} className="rounded-xl">Reset search</Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <p className="text-sm text-slate-500">
                  Showing <span className="font-semibold text-slate-900">{visiblePhotographers.length}</span> result{visiblePhotographers.length === 1 ? "" : "s"} on this page out of <span className="font-semibold text-slate-900">{total}</span> matches.
                </p>

                {visiblePhotographers.map((photographer) => {
                  const isSelected = selectedId === photographer.id;
                  const distanceLabel = typeof photographer.distanceKm === "number" ? formatDistanceKm(photographer.distanceKm) : "";

                  return (
                    <Card
                      key={photographer.id}
                      ref={(element) => {
                        cardRefs.current[photographer.id] = element;
                      }}
                      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all ${isSelected ? "border-blue-300 bg-blue-50/20 shadow-blue-100" : "border-slate-200 hover:border-blue-200"}`}
                    >
                      <CardContent className="p-0">
                        <div
                          role="button"
                          tabIndex={0}
                          className="grid gap-3 p-4 text-left md:grid-cols-[116px_minmax(0,1fr)]"
                          onClick={() => {
                            setSelectedId(photographer.id);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setSelectedId(photographer.id);
                            }
                          }}
                          onMouseEnter={() => setHoveredId(photographer.id)}
                          onMouseLeave={() => setHoveredId(null)}
                        >
                          <div className="relative h-24 overflow-hidden rounded-xl bg-slate-100 md:h-[108px]">
                            <ImageWithFallback src={photographer.image} alt={photographer.name} className="h-full w-full object-cover" />
                            {photographer.verified && (
                              <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold text-blue-700 shadow-sm">
                                <CheckCircle2 className="h-3 w-3" />
                                Verified
                              </div>
                            )}
                          </div>
                          <div className="flex min-w-0 flex-col justify-between gap-3">
                            <div className="space-y-2">
                              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                <div className="min-w-0">
                                  <h2 className="truncate text-base font-semibold text-slate-900 md:text-lg">{photographer.name}</h2>
                                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 md:text-sm">
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                      {photographer.location}
                                    </span>
                                    {distanceLabel && (
                                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                        <Crosshair className="h-3 w-3" />
                                        {distanceLabel}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-left md:text-right">
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600">Starting at</p>
                                  <p className="mt-0.5 text-sm font-bold text-slate-900 md:text-base">{photographer.price}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className="border-0 bg-blue-100 text-[11px] text-blue-700">{photographer.specialty}</Badge>
                                <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                  <span className="font-semibold text-slate-900">{photographer.rating.toFixed(1)}</span>
                                  <span>({photographer.reviews} reviews)</span>
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <span className="text-[11px] text-slate-500">Click card to highlight the map marker.</span>
                              <Button type="button" size="sm" className="rounded-lg bg-blue-600 text-white hover:bg-blue-700" onClick={() => navigate(`/photographer/${photographer.id}`)}>
                                View Profile
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {totalPages > 1 && (
                  <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => updatePage(Math.max(1, page - 1))} disabled={page === 1}>Previous</Button>
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => updatePage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>Next</Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="min-h-[520px] xl:sticky xl:top-32 xl:h-[calc(100vh-9rem)]">
            <Card className="relative h-full overflow-hidden rounded-[28px] border border-slate-200 shadow-sm">
              <div className="relative h-full p-4">
                <div className="relative h-full min-h-[420px] overflow-hidden rounded-[24px] border border-slate-200 bg-white">
                  <iframe
                    title="Search results map"
                    src={mapEmbedUrl}
                    className="absolute inset-0 h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.08)_1px,transparent_1px)] opacity-30" style={{ backgroundSize: "40px 40px" }} />
                  <div className="absolute left-4 top-4 rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-sm">
                    Google Map View
                  </div>
                  {visiblePhotographers.map((photographer, index) => {
                    const isSelected = selectedId === photographer.id;
                    const isHovered = hoveredId === photographer.id;
                    const position = calculateMarkerPosition(photographer.coordinates.lat, photographer.coordinates.lng, index, mapBounds);

                    return (
                      <div key={photographer.id} className="absolute" style={{ left: `${position.left}%`, top: `${position.top}%` }}>
                        <button
                          type="button"
                          onClick={() => handleMarkerClick(photographer.id)}
                          onMouseEnter={() => setHoveredId(photographer.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          className="relative -translate-x-1/2 -translate-y-1/2"
                        >
                          {(isSelected || isHovered) && <span className="absolute inset-0 rounded-full bg-blue-500/30 blur-md" />}
                          <div className={`relative rounded-full border px-3 py-1 text-xs font-semibold shadow-lg transition-all ${isSelected ? "border-blue-700 bg-blue-700 text-white" : isHovered ? "border-blue-500 bg-blue-500 text-white" : "border-white bg-white text-blue-700"}`}>
                            <MapPin className="mr-1 inline h-3.5 w-3.5" />
                            {photographer.price}
                          </div>
                        </button>
                      </div>
                    );
                  })}

                  {!isLoading && visiblePhotographers.length === 0 && (
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-600">
                      Matching results will appear here as map markers.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
          <div className="space-y-4 xl:max-h-[calc(100vh-9rem)] xl:overflow-y-auto xl:pr-1">
            {isAdsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={`ad-skeleton-${index}`} className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white" />
                ))}
              </div>
            ) : advertisements.length > 0 ? (
              advertisements.map((advertisement) => (
                <Card key={advertisement.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {advertisement.imageUrl ? (
                    <div className="h-36 w-full overflow-hidden bg-slate-100">
                      <ImageWithFallback src={advertisement.imageUrl} alt={advertisement.title} className="h-full w-full object-cover" />
                    </div>
                  ) : null}
                  <CardContent className="space-y-3 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600">Advertisement</p>
                    <p className="text-base font-semibold text-slate-900">{advertisement.title}</p>
                    <p className="text-sm leading-6 text-slate-600">{advertisement.description}</p>
                    {advertisement.locationLabel ? (
                      <p className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-blue-500" />
                        {advertisement.locationLabel}
                      </p>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-xl border-slate-200 text-slate-700 hover:border-blue-200 hover:text-blue-700"
                      disabled={!advertisement.ctaUrl}
                      onClick={() => {
                        if (!advertisement.ctaUrl) {
                          return;
                        }
                        window.open(advertisement.ctaUrl, "_blank", "noopener,noreferrer");
                      }}
                    >
                      {advertisement.ctaLabel || "Learn more"}
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                {Array.from({ length: 3 }, (_, index) => (
                  <Card key={`ad-empty-${index}`} className="overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white shadow-sm">
                    <CardContent className="p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Advertisement</p>
                      <p className="mt-3 text-base font-semibold text-slate-900">Promotional Slot {index + 1}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">This panel is now dynamic. Super admins can create and manage ads from Dashboard → Advertisements.</p>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
            {adsError ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">{adsError}</p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
