import { MapPin, Star, ChevronRight, Sparkles, TrendingUp } from "lucide-react";

interface MobileHomeProps {
  photographers: any[];
  onPhotographerClick: (id: string) => void;
}

export function MobileHome({ photographers, onPhotographerClick }: MobileHomeProps) {
  const categories = [
    { name: "Wedding", emoji: "💍", color: "bg-pink-100 text-pink-600" },
    { name: "Portrait", emoji: "📸", color: "bg-purple-100 text-purple-600" },
    { name: "Event", emoji: "🎉", color: "bg-blue-100 text-blue-600" },
    { name: "Fashion", emoji: "👗", color: "bg-rose-100 text-rose-600" },
    { name: "Product", emoji: "📦", color: "bg-green-100 text-green-600" },
    { name: "Food", emoji: "🍽️", color: "bg-orange-100 text-orange-600" },
  ];

  const featured = photographers.slice(0, 3);
  const recommended = photographers.slice(3, 6);

  return (
    <div className="min-h-full">
      {/* Large title - iOS style */}
      <div className="bg-white px-4 pt-4 pb-3">
        <h1 className="text-[34px] font-bold tracking-tight text-gray-900 leading-tight">
          Discover
        </h1>
        <p className="text-[17px] text-gray-600 mt-1">Find creative professionals</p>
      </div>

      {/* Search bar */}
      <div className="px-4 pb-3 bg-white">
        <div className="bg-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-blue-600" />
          <input
            type="text"
            placeholder="Location, city or service"
            className="flex-1 bg-transparent border-none outline-none text-[17px] text-gray-900 placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-4 bg-white mb-2">
        <h2 className="text-[22px] font-semibold text-gray-900 mb-3">Categories</h2>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((category) => (
            <button
              key={category.name}
              className={`${category.color} rounded-2xl p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform`}
            >
              <span className="text-3xl">{category.emoji}</span>
              <span className="text-[15px] font-semibold">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured section */}
      <div className="px-4 py-4 bg-white mb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h2 className="text-[22px] font-semibold text-gray-900">Featured</h2>
          </div>
          <button className="text-blue-600 text-[15px] font-semibold">See All</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {featured.map((photographer) => (
            <button
              key={photographer.id}
              onClick={() => onPhotographerClick(photographer.id)}
              className="flex-shrink-0 w-[280px] bg-gradient-to-br from-blue-50 to-white rounded-3xl overflow-hidden shadow-sm active:scale-95 transition-transform"
            >
              <div className="relative h-[200px]">
                <img
                  src={photographer.image}
                  alt={photographer.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold text-gray-900">{photographer.rating}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-[17px] font-semibold text-gray-900">{photographer.name}</h3>
                <p className="text-[15px] text-gray-600 mt-1">{photographer.specialty}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[15px] text-gray-500">{photographer.location}</span>
                  <span className="text-[17px] font-semibold text-blue-600">{photographer.price}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recommended */}
      <div className="px-4 py-4 bg-white mb-20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-[22px] font-semibold text-gray-900">Recommended</h2>
          </div>
        </div>
        <div className="space-y-3">
          {recommended.map((photographer) => (
            <button
              key={photographer.id}
              onClick={() => onPhotographerClick(photographer.id)}
              className="w-full bg-white rounded-2xl border border-gray-200 p-3 flex gap-3 active:scale-[0.98] transition-transform"
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={photographer.image}
                  alt={photographer.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[17px] font-semibold text-gray-900">{photographer.name}</h3>
                    <p className="text-[15px] text-gray-600 mt-0.5">{photographer.specialty}</p>
                  </div>
                  {photographer.verified && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-[15px] font-medium text-gray-900">{photographer.rating}</span>
                    <span className="text-[15px] text-gray-500">({photographer.reviews})</span>
                  </div>
                  <span className="text-[15px] font-semibold text-blue-600">{photographer.price}</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 self-center" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
