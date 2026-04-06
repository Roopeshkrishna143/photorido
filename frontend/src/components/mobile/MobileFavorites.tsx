import { Heart, Star, MapPin } from "lucide-react";

interface MobileFavoritesProps {
  photographers: any[];
  onPhotographerClick: (id: string) => void;
}

export function MobileFavorites({ photographers, onPhotographerClick }: MobileFavoritesProps) {
  return (
    <div className="min-h-full">
      {/* Large title */}
      <div className="bg-white px-4 pt-4 pb-3">
        <h1 className="text-[34px] font-bold tracking-tight text-gray-900 leading-tight">
          Saved
        </h1>
        <p className="text-[17px] text-gray-600 mt-1">Your favorite professionals</p>
      </div>

      {/* Empty state or list */}
      {photographers.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Heart className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-[22px] font-semibold text-gray-900 mb-2">No saved items yet</h3>
          <p className="text-[17px] text-gray-600">
            Start exploring and save your favorite photographers
          </p>
        </div>
      ) : (
        <div className="px-4 py-4 pb-20 space-y-3">
          {photographers.map((photographer) => (
            <button
              key={photographer.id}
              onClick={() => onPhotographerClick(photographer.id)}
              className="w-full bg-white rounded-2xl border border-gray-200 overflow-hidden active:scale-[0.98] transition-transform"
            >
              <div className="relative h-40">
                <img
                  src={photographer.image}
                  alt={photographer.name}
                  className="w-full h-full object-cover"
                />
                <button className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-left flex-1">
                    <h3 className="text-[17px] font-semibold text-gray-900">{photographer.name}</h3>
                    <p className="text-[15px] text-gray-600 mt-0.5">{photographer.specialty}</p>
                  </div>
                  {photographer.verified && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center ml-2">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-gray-500 mb-3">
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
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
