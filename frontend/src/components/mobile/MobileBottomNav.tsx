import { Home, Search, Compass, Heart, User } from "lucide-react";

interface MobileBottomNavProps {
  activeTab: "home" | "search" | "explore" | "favorites" | "profile";
  onTabChange: (tab: "home" | "search" | "explore" | "favorites" | "profile") => void;
}

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const tabs = [
    { id: "home" as const, icon: Home, label: "Home" },
    { id: "search" as const, icon: Search, label: "Search" },
    { id: "explore" as const, icon: Compass, label: "Explore" },
    { id: "favorites" as const, icon: Heart, label: "Saved" },
    { id: "profile" as const, icon: User, label: "Profile" },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200">
      <div className="grid grid-cols-5 h-20 safe-area-bottom">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center gap-1 transition-all"
            >
              <Icon 
                className={`w-6 h-6 transition-all ${
                  isActive 
                    ? "text-blue-600 scale-110" 
                    : "text-gray-500"
                }`}
                fill={isActive ? "currentColor" : "none"}
              />
              <span className={`text-[10px] font-medium transition-all ${
                isActive ? "text-blue-600" : "text-gray-500"
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
