import { Camera, Video, ImageIcon, Palette, Package, Film, Globe2, TrendingUp } from "lucide-react";

export function MobileExplore() {
  const services = [
    { 
      name: "Photographers", 
      icon: Camera, 
      count: "2.5k+", 
      color: "bg-blue-100 text-blue-600",
      gradient: "from-blue-500 to-blue-600"
    },
    { 
      name: "Video Editors", 
      icon: Video, 
      count: "1.8k+", 
      color: "bg-purple-100 text-purple-600",
      gradient: "from-purple-500 to-purple-600"
    },
    { 
      name: "Album Designers", 
      icon: ImageIcon, 
      count: "950+", 
      color: "bg-pink-100 text-pink-600",
      gradient: "from-pink-500 to-pink-600"
    },
    { 
      name: "Graphic Designers", 
      icon: Palette, 
      count: "3.2k+", 
      color: "bg-green-100 text-green-600",
      gradient: "from-green-500 to-green-600"
    },
    { 
      name: "Product Photos", 
      icon: Package, 
      count: "1.2k+", 
      color: "bg-orange-100 text-orange-600",
      gradient: "from-orange-500 to-orange-600"
    },
    { 
      name: "Reel Makers", 
      icon: Film, 
      count: "890+", 
      color: "bg-red-100 text-red-600",
      gradient: "from-red-500 to-red-600"
    },
  ];

  const locations = [
    { city: "Mumbai", country: "India", image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=250&fit=crop" },
    { city: "New York", country: "USA", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=250&fit=crop" },
    { city: "London", country: "UK", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=250&fit=crop" },
    { city: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=250&fit=crop" },
    { city: "Tokyo", country: "Japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=250&fit=crop" },
    { city: "Dubai", country: "UAE", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=250&fit=crop" },
  ];

  return (
    <div className="min-h-full">
      {/* Large title */}
      <div className="bg-white px-4 pt-4 pb-3">
        <h1 className="text-[34px] font-bold tracking-tight text-gray-900 leading-tight">
          Explore
        </h1>
        <p className="text-[17px] text-gray-600 mt-1">Browse by service & location</p>
      </div>

      {/* Services */}
      <div className="px-4 py-4 bg-white mb-2">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-[22px] font-semibold text-gray-900">Services</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.name}
                className={`${service.color} rounded-2xl p-5 text-left active:scale-95 transition-transform`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-[17px] font-semibold">{service.name}</h3>
                <p className="text-[15px] opacity-70 mt-1">{service.count} professionals</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular locations */}
      <div className="px-4 py-4 bg-white mb-20">
        <div className="flex items-center gap-2 mb-3">
          <Globe2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-[22px] font-semibold text-gray-900">Popular Locations</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {locations.map((location) => (
            <button
              key={location.city}
              className="relative rounded-2xl overflow-hidden h-32 active:scale-95 transition-transform"
            >
              <img
                src={location.image}
                alt={location.city}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-3 left-3 text-white text-left">
                <h3 className="text-[17px] font-semibold">{location.city}</h3>
                <p className="text-[13px] opacity-90">{location.country}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
