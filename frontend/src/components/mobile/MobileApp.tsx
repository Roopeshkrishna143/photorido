import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { MobileTabBar } from "./MobileTabBar";
import { MobileBooking } from "./pages/MobileBooking";
import { MobileDashboard } from "./pages/MobileDashboard";
import { MobileHelp } from "./pages/MobileHelp";
import { MobileHome } from "./pages/MobileHome";
import { MobileHowItWorks } from "./pages/MobileHowItWorks";
import { MobilePhotographerDetails } from "./pages/MobilePhotographerDetails";
import { MobileSearch } from "./pages/MobileSearch";
import { MobileServices } from "./pages/MobileServices";
import type { PhotographerSummary } from "../../hooks/usePhotographers";

export type MobilePage =
  | "home"
  | "services"
  | "how-it-works"
  | "search"
  | "photographer-details"
  | "dashboard"
  | "help"
  | "booking";

interface MobileAppProps {
  photographers: PhotographerSummary[];
  onNavigateToHome?: () => void;
}

export function MobileApp({ photographers, onNavigateToHome }: MobileAppProps) {
  const [currentPage, setCurrentPage] = useState<MobilePage>("home");
  const [navigationStack, setNavigationStack] = useState<MobilePage[]>(["home"]);
  const [selectedPhotographerId, setSelectedPhotographerId] = useState<string | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);

  const handleNavigate = (page: MobilePage, data?: any) => {
    if (data?.photographerId) {
      setSelectedPhotographerId(data.photographerId);
    }

    if (data?.serviceType) {
      setSelectedServiceType(data.serviceType);
    }

    setNavigationStack((previousValue) => [...previousValue, page]);
    setCurrentPage(page);
  };

  const handleBack = () => {
    if (navigationStack.length <= 1) {
      return;
    }

    const nextStack = [...navigationStack];
    nextStack.pop();
    setNavigationStack(nextStack);
    setCurrentPage(nextStack[nextStack.length - 1]);
  };

  const handleTabChange = (page: MobilePage) => {
    setNavigationStack([page]);
    setCurrentPage(page);
  };

  const pageTransition = {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-50%", opacity: 0 },
    transition: { type: "spring", stiffness: 300, damping: 30 },
  };

  const canGoBack = navigationStack.length > 1;
  const showTabBar = !["photographer-details", "booking"].includes(currentPage);
  const activePhotographerId = selectedPhotographerId || photographers[0]?.id || "";

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 p-4 md:p-8">
        <div className="relative w-full max-w-[400px] h-full max-h-[844px] bg-black rounded-[60px] shadow-2xl overflow-hidden border-[14px] border-gray-900">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-50" />

          <div className="absolute top-0 left-0 right-0 h-11 bg-transparent z-40 pt-2 px-8">
            <div className="flex items-center justify-between text-white text-xs font-semibold">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-3 border border-white rounded-sm">
                  <div className="w-2 h-full bg-white" />
                </div>
                <div className="w-4 h-3 border border-white rounded-sm">
                  <div className="w-3 h-full bg-white" />
                </div>
                <div className="w-6 h-3 border border-white rounded-sm relative">
                  <div className="w-4 h-full bg-white" />
                  <div className="absolute -right-0.5 top-0.5 w-0.5 h-2 bg-white" />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToHome?.()}
            className="absolute top-3 right-3 z-50 w-8 h-8 bg-gray-800/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="relative h-full bg-white overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div key={currentPage} {...pageTransition} className="h-full overflow-hidden">
                {currentPage === "home" && (
                  <MobileHome
                    onNavigate={handleNavigate}
                    photographers={photographers}
                    onBack={canGoBack ? handleBack : undefined}
                  />
                )}
                {currentPage === "services" && (
                  <MobileServices onNavigate={handleNavigate} onBack={handleBack} />
                )}
                {currentPage === "how-it-works" && <MobileHowItWorks onBack={handleBack} />}
                {currentPage === "search" && (
                  <MobileSearch
                    onNavigate={handleNavigate}
                    photographers={photographers}
                    onBack={handleBack}
                    serviceType={selectedServiceType}
                  />
                )}
                {currentPage === "photographer-details" && (
                  <MobilePhotographerDetails
                    photographerId={activePhotographerId}
                    onNavigate={handleNavigate}
                    onBack={handleBack}
                  />
                )}
                {currentPage === "dashboard" && (
                  <MobileDashboard
                    onNavigate={handleNavigate}
                    onBack={canGoBack ? handleBack : undefined}
                    photographers={photographers}
                  />
                )}
                {currentPage === "help" && <MobileHelp onBack={handleBack} />}
                {currentPage === "booking" && (
                  <MobileBooking
                    photographerId={activePhotographerId}
                    onBack={handleBack}
                    onComplete={() => handleBack()}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {showTabBar && <MobileTabBar currentPage={currentPage} onTabChange={handleTabChange} />}
          </div>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full z-50" />
        </div>
      </div>
    </div>
  );
}
