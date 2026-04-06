import { useState } from "react";
import { 
  ChevronLeft, 
  Heart, 
  Share2, 
  Star, 
  MapPin, 
  Briefcase, 
  Languages,
  CheckCircle,
  MessageCircle,
  Calendar
} from "lucide-react";

interface MobilePhotographerDetailsProps {
  photographer: any;
  onBack: () => void;
}

export function MobilePhotographerDetails({ photographer, onBack }: MobilePhotographerDetailsProps) {
  const [activeTab, setActiveTab] = useState<"portfolio" | "reviews">("portfolio");
  const [isFavorite, setIsFavorite] = useState(false);

  const portfolio = photographer.portfolio || [
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop",
  ];

  const reviews = [
    { name: "Sarah Johnson", rating: 5, text: "Amazing work! Very professional and creative.", date: "2 weeks ago" },
    { name: "Michael Chen", rating: 5, text: "Best photographer I've worked with. Highly recommend!", date: "1 month ago" },
    { name: "Emily Davis", rating: 4, text: "Great photos, wonderful experience.", date: "2 months ago" },
  ];

  return (
    <div className="min-h-full bg-white">
      {/* Hero image with navigation */}
      <div className="relative h-80">
        <img
          src={photographer.image}
          alt={photographer.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Top navigation */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
            >
              <Heart 
                className={`w-5 h-5 ${isFavorite ? "text-red-500 fill-red-500" : "text-gray-900"}`} 
              />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Share2 className="w-5 h-5 text-gray-900" />
            </button>
          </div>
        </div>

        {/* Price badge */}
        <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full">
          <span className="text-[17px] font-semibold">{photographer.price}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-5">
        {/* Header info */}
        <div className="mb-5">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-[28px] font-bold text-gray-900">{photographer.name}</h1>
            {photographer.verified && (
              <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="text-[13px] font-medium text-blue-600">Verified</span>
              </div>
            )}
          </div>
          <p className="text-[17px] text-gray-600 mb-3">{photographer.specialty}</p>
          
          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="text-[17px] font-semibold text-gray-900">{photographer.rating}</span>
              <span className="text-[15px] text-gray-500">({photographer.reviews} reviews)</span>
            </div>
          </div>
        </div>

        {/* Quick info cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <Briefcase className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-[13px] text-gray-600">Experience</p>
            <p className="text-[15px] font-semibold text-gray-900">{photographer.experience || "8+ Years"}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <MapPin className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-[13px] text-gray-600">Location</p>
            <p className="text-[15px] font-semibold text-gray-900">{photographer.location.split(',')[0]}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <Languages className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-[13px] text-gray-600">Languages</p>
            <p className="text-[15px] font-semibold text-gray-900">{photographer.languages?.[0] || "English"}</p>
          </div>
        </div>

        {/* About */}
        <div className="mb-5">
          <h2 className="text-[22px] font-semibold text-gray-900 mb-2">About</h2>
          <p className="text-[17px] text-gray-600 leading-relaxed">
            {photographer.bio || "Professional photographer with years of experience capturing special moments."}
          </p>
        </div>

        {/* Services */}
        {photographer.services && (
          <div className="mb-5">
            <h2 className="text-[22px] font-semibold text-gray-900 mb-3">Services</h2>
            <div className="flex flex-wrap gap-2">
              {photographer.services.map((service: string) => (
                <span
                  key={service}
                  className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-[15px] font-medium"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-5">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("portfolio")}
              className={`pb-3 text-[17px] font-semibold relative ${
                activeTab === "portfolio" ? "text-blue-600" : "text-gray-500"
              }`}
            >
              Portfolio
              {activeTab === "portfolio" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-3 text-[17px] font-semibold relative ${
                activeTab === "reviews" ? "text-blue-600" : "text-gray-500"
              }`}
            >
              Reviews
              {activeTab === "reviews" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "portfolio" && (
          <div className="grid grid-cols-2 gap-3 mb-24">
            {portfolio.map((image, index) => (
              <div key={index} className="aspect-square rounded-xl overflow-hidden">
                <img
                  src={image}
                  alt={`Portfolio ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-4 mb-24">
            {reviews.map((review, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[17px] font-semibold text-gray-900">{review.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-[15px] font-medium text-gray-900">{review.rating}</span>
                  </div>
                </div>
                <p className="text-[15px] text-gray-600 mb-2">{review.text}</p>
                <p className="text-[13px] text-gray-500">{review.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
        <div className="flex gap-3">
          <button className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-blue-600" />
          </button>
          <button className="flex-1 bg-blue-600 text-white text-[17px] font-semibold py-3 rounded-full flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5" />
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
