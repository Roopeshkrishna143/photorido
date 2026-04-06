import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { ConsumerDashboard } from "../components/dashboards/ConsumerDashboard";
import { VendorDashboard } from "../components/dashboards/VendorDashboard";
import { SuperAdminDashboard } from "../components/dashboards/SuperAdminDashboard";
import { useEffect } from "react";

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (!user) return null;

  if (user.role === "super-admin") {
    return <SuperAdminDashboard />;
  }

  if (user.role === "vendor") {
    return <VendorDashboard />;
  }

  // "user" role
  return <ConsumerDashboard />;
}
