import { useMemo, useState } from "react";
import { ArrowLeft, Filter, MapPin, Search, Star, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { PhotographerSummary } from "../hooks/usePhotographers";

interface SearchResultsProps {
  photographers: PhotographerSummary[];
  isLoading?: boolean;
  error?: string | null;
  onPhotographerClick: (id: string) => void;
  onBack: () => void;
}

function parsePrice(price: string) {
  return Number(price.replace(/[^\d]/g, ""));
}

function calculateMarkerPosition(
  photographer: PhotographerSummary,
  index: number,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
) {
  const latRange = bounds.maxLat - bounds.minLat || 1;
  const lngRange = bounds.maxLng - bounds.minLng || 1;
  const hasCoordinates = photographer.coordinates.lat !== 0 || photographer.coordinates.lng !== 0;

  if (!hasCoordinates) {
    return {
      left: 18 + (index % 4) * 18,
      top: 18 + Math.floor(index / 4) * 18,
    };
  }

  return {
    left: 12 + ((photographer.coordinates.lng - bounds.minLng) / lngRange) * 76,
    top: 14 + ((bounds.maxLat - photographer.coordinates.lat) / latRange) * 68,
  };
}

export function SearchResults({
  photographers,
  isLoading = false,
  error = null,
  onPhotographerClick,
  onBack,
}: SearchResultsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<number[]>([0, 85000]);
  const [minRating, setMinRating] = useState<string>("0");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const specialties = useMemo(
    () => Array.from(new Set(photographers.map((photographer) => photographer.specialty))).sort(),
    [photographers],
  );

  const filteredPhotographers = useMemo(
    () =>
      photographers.filter((photographer) => {
        const price = parsePrice(photographer.price);
        const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
        const matchesRating = photographer.rating >= parseFloat(minRating);
        const matchesSpecialty =
          selectedSpecialties.length === 0 || selectedSpecialties.includes(photographer.specialty);
        const matchesVerified = !verifiedOnly || photographer.verified;

        return matchesPrice && matchesRating && matchesSpecialty && matchesVerified;
      }),
    [photographers, priceRange, minRating, selectedSpecialties, verifiedOnly],
  );

  const bounds = useMemo(() => {
    const coordinates = filteredPhotographers
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
  }, [filteredPhotographers]);

  const handleSpecialtyToggle = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty)
        ? prev.filter((entry) => entry !== specialty)
        : [...prev, specialty],
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 85000]);
    setMinRating("0");
    setSelectedSpecialties([]);
    setVerifiedOnly(false);
  };

  const handleCardClick = (id: string) => {
    setSelectedId(id);
  };

  const handleMarkerClick = (id: string) => {
    setSelectedId(id);
    const element = document.getElementById(`photographer-${id}`);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const hasActiveFilters = selectedSpecialties.length > 0 || verifiedOnly || minRating !== "0";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--blue-50)] to-white">
      <div className="sticky top-20 z-40 border-b glass-strong">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" onClick={onBack} className="gap-2 hover:bg-[var(--blue-50)]">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </motion.div>
              <div>
                <h1 className="text-xl">Search Results</h1>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {isLoading ? "Loading professionals..." : `${filteredPhotographers.length} professionals found`}
                </p>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge className="ml-1 bg-[var(--blue-600)]">
                    {selectedSpecialties.length + (verifiedOnly ? 1 : 0) + (minRating !== "0" ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </motion.div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pb-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm">Price Range</label>
                      <Slider
                        min={0}
                        max={85000}
                        step={5000}
                        value={priceRange}
                        onValueChange={setPriceRange}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-[var(--muted-foreground)]">
                        <span>Rs. {priceRange[0].toLocaleString("en-IN")}</span>
                        <span>Rs. {priceRange[1].toLocaleString("en-IN")}+</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm">Minimum Rating</label>
                      <Select value={minRating} onValueChange={setMinRating}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Any Rating</SelectItem>
                          <SelectItem value="4.0">4.0+ Stars</SelectItem>
                          <SelectItem value="4.5">4.5+ Stars</SelectItem>
                          <SelectItem value="4.8">4.8+ Stars</SelectItem>
                          <SelectItem value="5.0">5.0 Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm">Verification</label>
                      <label className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer hover:bg-[var(--blue-50)] transition-colors">
                        <Checkbox
                          checked={verifiedOnly}
                          onCheckedChange={(checked) => setVerifiedOnly(Boolean(checked))}
                        />
                        <span className="text-sm">Verified Only</span>
                      </label>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm opacity-0">Actions</label>
                      <Button variant="outline" onClick={clearFilters} className="w-full">
                        Clear All Filters
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm">Specialties</label>
                    <div className="flex flex-wrap gap-2">
                      {specialties.map((specialty) => (
                        <Badge
                          key={specialty}
                          variant={selectedSpecialties.includes(specialty) ? "default" : "outline"}
                          className={`cursor-pointer transition-all ${
                            selectedSpecialties.includes(specialty)
                              ? "bg-[var(--blue-600)] hover:bg-[var(--blue-700)]"
                              : "hover:bg-[var(--blue-50)]"
                          }`}
                          onClick={() => handleSpecialtyToggle(specialty)}
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:h-[calc(100vh-250px)]">
          <div className="space-y-4 lg:max-h-[calc(100vh-250px)] lg:overflow-y-auto lg:pr-2">
            {error ? (
              <Card className="p-12 text-center">
                <p className="text-red-600">{error}</p>
              </Card>
            ) : isLoading ? (
              <Card className="p-12 text-center">
                <div className="flex items-center justify-center gap-3 text-[var(--muted-foreground)]">
                  <Search className="h-4 w-4" />
                  <span>Loading professionals...</span>
                </div>
              </Card>
            ) : filteredPhotographers.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-[var(--muted-foreground)]">No photographers found matching your criteria.</p>
                <Button onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              </Card>
            ) : (
              filteredPhotographers.map((photographer, index) => (
                <motion.div
                  key={photographer.id}
                  id={`photographer-${photographer.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredId(photographer.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <Card
                    className={`p-4 cursor-pointer transition-all hover:shadow-xl ${
                      selectedId === photographer.id
                        ? "ring-2 ring-[var(--blue-500)] shadow-xl"
                        : hoveredId === photographer.id
                          ? "shadow-lg"
                          : ""
                    }`}
                    onClick={() => handleCardClick(photographer.id)}
                  >
                    <div className="flex gap-4">
                      <div className="relative flex-shrink-0">
                        <ImageWithFallback
                          src={photographer.image}
                          alt={photographer.name}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                        {photographer.verified && (
                          <div className="absolute -top-1 -right-1 bg-[var(--blue-600)] rounded-full p-1">
                            <Star className="h-3 w-3 text-white fill-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="text-lg truncate">{photographer.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{photographer.location}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg text-[var(--primary)]">{photographer.price}</div>
                            <div className="text-xs text-[var(--muted-foreground)]">per session</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-sm">{photographer.rating}</span>
                          </div>
                          <span className="text-sm text-[var(--muted-foreground)]">
                            ({photographer.reviews} reviews)
                          </span>
                        </div>

                        <Badge className="bg-[var(--blue-600)]">{photographer.specialty}</Badge>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          <div className="min-h-[420px] lg:sticky lg:top-40 lg:h-full">
            <Card className="h-full overflow-hidden">
              <InteractiveMap
                photographers={filteredPhotographers}
                bounds={bounds}
                selectedId={selectedId}
                hoveredId={hoveredId}
                onMarkerClick={handleMarkerClick}
                onPhotographerClick={onPhotographerClick}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface InteractiveMapProps {
  photographers: PhotographerSummary[];
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  selectedId: string | null;
  hoveredId: string | null;
  onMarkerClick: (id: string) => void;
  onPhotographerClick: (id: string) => void;
}

function InteractiveMap({
  photographers,
  bounds,
  selectedId,
  hoveredId,
  onMarkerClick,
  onPhotographerClick,
}: InteractiveMapProps) {
  const [showPopup, setShowPopup] = useState<string | null>(null);
  const selectedPhotographer = photographers.find((photographer) => photographer.id === showPopup);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[var(--blue-100)] to-[var(--blue-200)]">
      <div className="absolute inset-0 p-4 sm:p-8">
        <div className="relative w-full h-full rounded-xl overflow-hidden bg-white/50 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          {photographers.map((photographer, index) => {
            const isSelected = selectedId === photographer.id;
            const isHovered = hoveredId === photographer.id;
            const position = calculateMarkerPosition(photographer, index, bounds);

            return (
              <motion.div
                key={photographer.id}
                className="absolute"
                style={{ left: `${position.left}%`, top: `${position.top}%` }}
                initial={{ scale: 0 }}
                animate={{
                  scale: isSelected || isHovered ? 1.3 : 1,
                  zIndex: isSelected || isHovered ? 50 : 10,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative cursor-pointer"
                  onClick={() => {
                    onMarkerClick(photographer.id);
                    setShowPopup(photographer.id);
                  }}
                >
                  <div
                    className={`relative transition-all ${
                      isSelected
                        ? "text-[var(--blue-700)]"
                        : isHovered
                          ? "text-[var(--blue-600)]"
                          : "text-[var(--blue-500)]"
                    }`}
                  >
                    <MapPin
                      className={`h-8 w-8 fill-current ${
                        isSelected || isHovered ? "drop-shadow-lg" : ""
                      }`}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow-lg text-xs whitespace-nowrap">
                      {photographer.price}
                    </div>
                  </div>

                  {(isSelected || isHovered) && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[var(--blue-500)]"
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              </motion.div>
            );
          })}

          <AnimatePresence>
            {showPopup && selectedPhotographer && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="absolute bottom-4 left-4 right-4 z-50 sm:bottom-6 sm:left-6 sm:right-6"
              >
                <Card className="p-4 shadow-2xl border-2 border-[var(--blue-200)]">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowPopup(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="flex flex-col gap-4 sm:flex-row">
                    <ImageWithFallback
                      src={selectedPhotographer.image}
                      alt={selectedPhotographer.name}
                      className="h-20 w-full rounded-lg object-cover sm:w-20"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg mb-1">{selectedPhotographer.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-sm">{selectedPhotographer.rating}</span>
                        </div>
                        <span className="text-sm text-[var(--muted-foreground)]">
                          ({selectedPhotographer.reviews})
                        </span>
                      </div>
                      <Badge className="mb-3 bg-[var(--blue-600)]">
                        {selectedPhotographer.specialty}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-700)]"
                          onClick={(event) => {
                            event.stopPropagation();
                            onPhotographerClick(selectedPhotographer.id);
                          }}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs text-[var(--muted-foreground)]">
        Interactive Map View
      </div>
    </div>
  );
}
