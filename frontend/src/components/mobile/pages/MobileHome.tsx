import { useMemo, useState } from "react";
import { Search, MapPin, Star, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import type { MobilePage } from "../MobileApp";
import { MobileNavBar } from "../MobileNavBar";
import type { PhotographerSummary } from "../../../hooks/usePhotographers";

interface MobileHomeProps {
  onNavigate: (page: MobilePage, data?: any) => void;
  photographers: PhotographerSummary[];
  onBack?: () => void;
}

export function MobileHome({ onNavigate, photographers }: MobileHomeProps) {
  const [searchLocation, setSearchLocation] = useState("");
  const marketplaceStats = useMemo(() => {
    const totalReviews = photographers.reduce((sum, photographer) => sum + photographer.reviews, 0);
    const averageRating = photographers.length > 0
      ? (photographers.reduce((sum, photographer) => sum + photographer.rating, 0) / photographers.length).toFixed(1)
      : "0.0";

    return {
      professionals: photographers.length,
      totalReviews,
      averageRating,
    };
  }, [photographers]);

  const handlePhotographerClick = (id: string) => {
    onNavigate("photographer-details", { photographerId: id });
  };

  const handleSearch = () => {
    onNavigate("search");
  };

  const featuredServices = [
    { id: "photographers", name: "Photographers", icon: "Pros", color: "from-blue-500 to-blue-600" },
    { id: "video-editors", name: "Video Editors", icon: "Edit", color: "from-purple-500 to-purple-600" },
    { id: "album-designers", name: "Album Design", icon: "Book", color: "from-pink-500 to-pink-600" },
    { id: "reel-makers", name: "Reel Makers", icon: "Reel", color: "from-orange-500 to-orange-600" },
  ];

  return (
    <div className="h-full overflow-y-auto pb-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 px-4 pt-14 pb-8">
        <MobileNavBar title="Photorido" transparent />

        <div className="mt-4">
          <motion.h1
            className="text-3xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Find Your Perfect
            <br />
            Creative Pro
          </motion.h1>
          <motion.p
            className="text-blue-100 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Book talented professionals from live backend listings
          </motion.p>

          <motion.div
            className="bg-white rounded-2xl p-4 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter location"
                value={searchLocation}
                onChange={(event) => setSearchLocation(event.target.value)}
                className="flex-1 outline-none text-base"
              />
            </div>
            <button
              onClick={handleSearch}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-xl active:scale-95 transition-transform"
            >
              Search Professionals
            </button>
          </motion.div>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Services</h2>
          <button
            onClick={() => onNavigate("services")}
            className="text-blue-600 text-sm font-semibold flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {featuredServices.map((service, index) => (
            <motion.button
              key={service.id}
              onClick={() => onNavigate("search", { serviceType: service.id })}
              className="bg-white rounded-2xl p-4 shadow-md active:scale-95 transition-transform"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center text-sm font-semibold text-white mb-3`}>
                {service.icon}
              </div>
              <h3 className="font-semibold text-sm text-left">{service.name}</h3>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">How It Works</h2>
          <button
            onClick={() => onNavigate("how-it-works")}
            className="text-blue-600 text-sm font-semibold flex items-center gap-1"
          >
            Learn More
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {[
            { icon: Search, title: "Search & Browse", color: "bg-blue-500" },
            { icon: CheckCircle2, title: "Request Booking", color: "bg-purple-500" },
            { icon: Star, title: "Leave Review", color: "bg-pink-500" },
          ].map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-3">
                <div className={`w-10 h-10 rounded-lg ${step.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{step.title}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Featured Pros</h2>
          <button
            onClick={handleSearch}
            className="text-blue-600 text-sm font-semibold flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {photographers.slice(0, 3).map((photographer, index) => (
            <motion.button
              key={photographer.id}
              onClick={() => handlePhotographerClick(photographer.id)}
              className="w-full bg-white rounded-2xl overflow-hidden shadow-md active:scale-95 transition-transform"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex gap-4 p-4">
                <img
                  src={photographer.image}
                  alt={photographer.name}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-base">{photographer.name}</h3>
                    {photographer.verified && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{photographer.specialty}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{photographer.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{photographer.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <span className="font-bold text-blue-600 text-sm">{photographer.price}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold text-lg">Why Choose Photorido?</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold mb-1">{marketplaceStats.professionals}</div>
              <div className="text-xs text-blue-100">Professionals</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">{marketplaceStats.totalReviews}</div>
              <div className="text-xs text-blue-100">Reviews</div>
            </div>
            <div>
              <div className="text-2xl font-bold mb-1">{marketplaceStats.averageRating}</div>
              <div className="text-xs text-blue-100">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
