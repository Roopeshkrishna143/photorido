import { Camera, Video, BookOpen, Film, Frame, Palette } from "lucide-react";
import { motion } from "motion/react";
import type { MobilePage } from "../MobileApp";
import { MobileNavBar } from "../MobileNavBar";

interface MobileServicesProps {
  onNavigate: (page: MobilePage, data?: any) => void;
  onBack: () => void;
}

const services = [
  {
    id: "photographers",
    name: "Photographers",
    icon: Camera,
    description: "Professional photography for weddings, events, and portraits",
    priceRange: "₹20,000 - ₹50,000",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "video-editors",
    name: "Video Editors",
    icon: Video,
    description: "Expert video editing for cinematic wedding films",
    priceRange: "₹15,000 - ₹40,000",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    id: "album-designers",
    name: "Album Designers",
    icon: BookOpen,
    description: "Beautiful custom photo album design services",
    priceRange: "₹10,000 - ₹30,000",
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50",
  },
  {
    id: "reel-makers",
    name: "Reel Makers",
    icon: Film,
    description: "Creative short-form video content for social media",
    priceRange: "₹8,000 - ₹25,000",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    id: "photo-frame-makers",
    name: "Photo Frame Makers",
    icon: Frame,
    description: "Custom framing with premium materials",
    priceRange: "₹5,000 - ₹20,000",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
  },
  {
    id: "graphic-designers",
    name: "Graphic Designers",
    icon: Palette,
    description: "Professional design for invitations and branding",
    priceRange: "₹12,000 - ₹35,000",
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
  },
];

export function MobileServices({ onNavigate, onBack }: MobileServicesProps) {
  const handleServiceClick = (serviceId: string) => {
    onNavigate("search", { serviceType: serviceId });
  };

  return (
    <div className="h-full overflow-y-auto pb-24 bg-gradient-to-b from-blue-50 to-white">
      <MobileNavBar title="Our Services" onBack={onBack} />

      <div className="px-4 py-6">
        <motion.p
          className="text-gray-600 text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Find talented professionals for all your creative needs
        </motion.p>

        <div className="space-y-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.button
                key={service.id}
                onClick={() => handleServiceClick(service.id)}
                className="w-full bg-white rounded-2xl p-5 shadow-md active:scale-95 transition-transform"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-base mb-1">{service.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Starting from</span>
                      <span className="text-sm font-semibold text-blue-600">{service.priceRange}</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-bold text-lg mb-2">Can't Find What You Need?</h3>
          <p className="text-sm text-blue-100 mb-4">
            We're constantly expanding our services
          </p>
          <button
            onClick={() => onNavigate("help")}
            className="w-full bg-white text-blue-600 font-semibold py-3 rounded-xl active:scale-95 transition-transform"
          >
            Contact Support
          </button>
        </motion.div>
      </div>
    </div>
  );
}
