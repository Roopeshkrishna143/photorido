import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Calendar, CheckCircle2, Heart, LogOut, MapPin, Star, User } from "lucide-react";
import type { MobilePage } from "../MobileApp";
import { LoginModal } from "../../auth/LoginModal";
import { MobileNavBar } from "../MobileNavBar";
import { useAuth } from "../../../context/AuthContext";
import { useMarketplace } from "../../../context/MarketplaceContext";
import { useFavorites } from "../../../hooks/useFavorites";

interface MobileDashboardProps {
  onNavigate: (page: MobilePage, data?: any) => void;
  onBack?: () => void;
  photographers: any[];
}

export function MobileDashboard({ onNavigate, onBack, photographers }: MobileDashboardProps) {
  const { user, logout } = useAuth();
  const { bookings } = useMarketplace();
  const { favorites } = useFavorites();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"bookings" | "favorites">("bookings");

  const userBookings = useMemo(
    () =>
      bookings
        .filter((booking) => booking.userEmail === user?.email)
        .map((booking) => ({
          id: booking.id,
          photographer: photographers.find((photographer) => photographer.id === booking.photographerId),
          date: new Date(booking.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
          status: booking.status,
          type: booking.eventType,
        })),
    [bookings, photographers, user?.email],
  );

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <User className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Welcome to Photorido</h2>
        <p className="text-gray-600 text-center mb-6">Sign in to manage your bookings and saved professionals.</p>
        <button onClick={() => setShowLoginModal(true)} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl active:scale-95 transition-transform">
          Sign In
        </button>

        <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} defaultRole="user" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-24 bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-4 pt-14 pb-8 text-white">
        <MobileNavBar title="" transparent onBack={onBack} />

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-blue-100 text-sm capitalize">{user.role} Account</p>
          </div>
          <button onClick={logout} className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold mb-1">{userBookings.length}</div>
            <div className="text-xs text-blue-100">Bookings</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold mb-1">{favorites.length}</div>
            <div className="text-xs text-blue-100">Saved</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="text-2xl font-bold mb-1">{userBookings.filter((booking) => booking.status === "completed").length}</div>
            <div className="text-xs text-blue-100">Completed</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="flex bg-white p-1 rounded-2xl mb-6 shadow-md">
          <button onClick={() => setActiveTab("bookings")} className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === "bookings" ? "bg-blue-600 text-white shadow-lg" : "text-gray-600"}`}>
            <Calendar className="w-4 h-4" />
            Bookings
          </button>
          <button onClick={() => setActiveTab("favorites")} className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === "favorites" ? "bg-blue-600 text-white shadow-lg" : "text-gray-600"}`}>
            <Heart className="w-4 h-4" />
            Saved
          </button>
        </div>

        {activeTab === "bookings" && (
          <div className="space-y-4">
            {userBookings.map((booking, index) => (
              <motion.div key={booking.id} className="bg-white rounded-2xl p-4 shadow-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <div className="flex gap-4 mb-4">
                  {booking.photographer && <img src={booking.photographer.image} alt={booking.photographer.name} className="w-16 h-16 rounded-xl object-cover" />}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-base">{booking.photographer?.name ?? "Professional"}</h3>
                      {booking.photographer?.verified && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-sm text-gray-600">{booking.type}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold h-fit ${booking.status === "confirmed" || booking.status === "completed" ? "bg-green-100 text-green-700" : booking.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}`}>
                    {booking.status.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{booking.date}</span>
                  </div>
                  <button className="text-blue-600 text-sm font-semibold">View Details</button>
                </div>
              </motion.div>
            ))}

            {userBookings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No bookings yet</p>
                <button onClick={() => onNavigate("home")} className="mt-4 text-blue-600 font-semibold">Find Professionals</button>
              </div>
            )}
          </div>
        )}

        {activeTab === "favorites" && (
          <div className="space-y-4">
            {favorites.map((photographer, index) => (
              <motion.button key={photographer.photographerId} onClick={() => onNavigate("photographer-details", { photographerId: photographer.photographerId })} className="w-full bg-white rounded-2xl p-4 shadow-md active:scale-95 transition-transform" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <div className="flex gap-4">
                  <img src={photographer.image} alt={photographer.name} className="w-20 h-20 rounded-xl object-cover" />
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-base">{photographer.name}</h3>
                      {photographer.verified && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
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
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    <span className="font-bold text-blue-600 text-sm">{photographer.price}</span>
                  </div>
                </div>
              </motion.button>
            ))}

            {favorites.length === 0 && (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No saved professionals yet</p>
                <button onClick={() => onNavigate("home")} className="mt-4 text-blue-600 font-semibold">Discover Professionals</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
