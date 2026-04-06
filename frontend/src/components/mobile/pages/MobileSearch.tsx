import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, MapPin, Search, SlidersHorizontal, Star } from "lucide-react";
import { motion } from "motion/react";
import type { MobilePage } from "../MobileApp";
import { MobileNavBar } from "../MobileNavBar";
import { usePhotographerSearch } from "../../../hooks/usePhotographers";

interface MobileSearchProps {
  onNavigate: (page: MobilePage, data?: any) => void;
  photographers: unknown[];
  onBack: () => void;
  serviceType?: string | null;
}

function humanizeServiceType(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.replaceAll("-", " ");
}

export function MobileSearch({ onNavigate, photographers: _photographers, onBack, serviceType }: MobileSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const normalizedServiceType = useMemo(() => humanizeServiceType(serviceType), [serviceType]);
  const { photographers, total, isLoading, error } = usePhotographerSearch({
    q: searchQuery,
    service: normalizedServiceType,
    sort,
    page: 1,
    limit: 24,
  });

  const handlePhotographerClick = (id: string) => {
    onNavigate("photographer-details", { photographerId: id });
  };

  return (
    <div className="h-full overflow-y-auto pb-24 bg-gray-50">
      <MobileNavBar title="Search" onBack={onBack} />

      <div className="px-4 py-4 space-y-4">
        <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-4 shadow-sm">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
            <Search className="w-5 h-5 text-blue-500" />
            <input
              type="text"
              placeholder="Search by name, specialty, or location..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="flex-1 bg-transparent outline-none text-base"
            />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Live search
            </div>
            {normalizedServiceType && (
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                {normalizedServiceType}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Results</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="latest">Latest</option>
              <option value="rating-desc">Top Rated</option>
              <option value="reviews-desc">Most Reviewed</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center rounded-2xl bg-white p-10 shadow-sm">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : photographers.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-500 shadow-md">
            No professionals matched your current search.
          </div>
        ) : (
          <div className="space-y-3">
            {photographers.map((photographer, index) => (
              <motion.button
                key={photographer.id}
                onClick={() => handlePhotographerClick(photographer.id)}
                className="w-full bg-white rounded-2xl overflow-hidden shadow-md active:scale-95 transition-transform"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <div className="flex gap-4 p-4">
                  <img
                    src={photographer.image}
                    alt={photographer.name}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-base">{photographer.name}</h3>
                      {photographer.verified && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{photographer.specialty}</p>
                    <div className="flex items-center gap-1 mb-2 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{photographer.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-sm">{photographer.rating}</span>
                        <span className="text-xs text-gray-500">({photographer.reviews})</span>
                      </div>
                      <span className="font-bold text-blue-600 text-sm">{photographer.price}</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
