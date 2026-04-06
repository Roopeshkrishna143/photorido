import { useMemo, useState } from "react";
import { Search, MapPin, Star, X } from "lucide-react";
import type { PhotographerSummary } from "../../hooks/usePhotographers";

interface MobileSearchProps {
  photographers: PhotographerSummary[];
  onPhotographerClick: (id: string) => void;
}

export function MobileSearch({ photographers, onPhotographerClick }: MobileSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredPhotographers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return photographers;
    }

    return photographers.filter((photographer) =>
      [photographer.name, photographer.specialty, photographer.location]
        .some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [photographers, searchQuery]);

  return (
    <div className="min-h-full">
      <div className="bg-white px-4 pt-4 pb-3">
        <h1 className="text-[34px] font-bold tracking-tight text-gray-900 leading-tight">
          Search
        </h1>
      </div>

      <div className="bg-white px-4 pb-4">
        <div className="flex gap-2">
          <div className="flex-1 bg-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search professionals..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-[17px] text-gray-900 placeholder:text-gray-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-2">
        <p className="text-[15px] text-gray-600 mb-3">
          {filteredPhotographers.length} results found
        </p>
      </div>

      <div className="px-4 pb-20 space-y-3">
        {filteredPhotographers.map((photographer) => (
          <button
            key={photographer.id}
            onClick={() => onPhotographerClick(photographer.id)}
            className="w-full bg-white rounded-2xl border border-gray-200 overflow-hidden active:scale-[0.98] transition-transform"
          >
            <div className="flex gap-3 p-3">
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={photographer.image}
                  alt={photographer.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-[17px] font-semibold text-gray-900">{photographer.name}</h3>
                  {photographer.verified && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center ml-2">
                      <span className="text-white text-[10px]">OK</span>
                    </div>
                  )}
                </div>
                <p className="text-[15px] text-gray-600 mb-2">{photographer.specialty}</p>
                <div className="flex items-center gap-1 text-gray-500 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-[13px]">{photographer.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-[15px] font-medium text-gray-900">{photographer.rating}</span>
                    <span className="text-[13px] text-gray-500">({photographer.reviews})</span>
                  </div>
                  <span className="text-[17px] font-semibold text-blue-600">{photographer.price}</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
