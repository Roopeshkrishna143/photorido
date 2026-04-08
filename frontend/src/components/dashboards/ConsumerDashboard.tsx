import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { DashboardSidebar } from "./DashboardSidebar";
import {
  MarketplaceConsumerBookings,
  MarketplaceConsumerMessages,
  MarketplaceConsumerOverview,
} from "./MarketplaceDashboardViews";
import { SettingsPage } from "./SettingsPage";

interface ConsumerDashboardProps {
  onBack?: () => void;
  photographers?: unknown[];
  onPhotographerClick?: (id: string) => void;
}

export function ConsumerDashboard({
  onBack: _onBack,
  photographers: _photographers,
  onPhotographerClick: _onPhotographerClick,
}: ConsumerDashboardProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeKey, setActiveKey] = useState("dashboard");

  useEffect(() => {
    setActiveKey(searchParams.get("tab") ?? "dashboard");
  }, [searchParams]);

  const handleNavigate = (key: string) => {
    setActiveKey(key);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);

      if (key === "dashboard") {
        next.delete("tab");
      } else {
        next.set("tab", key);
      }

      if (key !== "messages") {
        next.delete("conversationId");
      }

      return next;
    }, { replace: true });
  };

  const renderContent = () => {
    switch (activeKey) {
      case "dashboard":
        return <MarketplaceConsumerOverview />;
      case "messages":
        return <MarketplaceConsumerMessages />;
      case "bookings":
        return <MarketplaceConsumerBookings />;
      case "settings":
        return <SettingsPage />;
      default:
        return <MarketplaceConsumerOverview />;
    }
  };

  return (
    <div className="flex h-screen min-w-0 overflow-x-clip overflow-y-hidden bg-gray-50">
      <DashboardSidebar activeKey={activeKey} onNavigate={handleNavigate} />
      <main className="min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">{renderContent()}</main>
    </div>
  );
}
