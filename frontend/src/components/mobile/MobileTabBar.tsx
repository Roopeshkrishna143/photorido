import { Home, Briefcase, User, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import type { MobilePage } from "./MobileApp";

interface MobileTabBarProps {
  currentPage: MobilePage;
  onTabChange: (page: MobilePage) => void;
}

export function MobileTabBar({ currentPage, onTabChange }: MobileTabBarProps) {
  const tabs = [
    { id: "home" as MobilePage, icon: Home, label: "Home" },
    { id: "services" as MobilePage, icon: Briefcase, label: "Services" },
    { id: "dashboard" as MobilePage, icon: User, label: "Profile" },
    { id: "help" as MobilePage, icon: HelpCircle, label: "Help" },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200 pb-6 pt-2 z-30">
      <div className="flex items-center justify-around px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPage === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-1 py-2 px-4 min-w-[60px] relative"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-blue-100 rounded-xl"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon
                className={`w-6 h-6 relative z-10 transition-colors ${
                  isActive ? "text-blue-600" : "text-gray-500"
                }`}
              />
              <span
                className={`text-xs font-medium relative z-10 transition-colors ${
                  isActive ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
