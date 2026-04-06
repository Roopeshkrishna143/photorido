import { Outlet, useLocation } from "react-router";
import { HeaderNew } from "../components/HeaderNew";
import { Footer } from "../components/Footer";
import { LoginModal } from "../components/auth/LoginModal";
import { useAuth, type UserRole } from "../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";

function resolveDashboardPath(_role: Exclude<UserRole, null>) {
  return "/dashboard";
}

export function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalRole, setLoginModalRole] = useState<Exclude<UserRole, null>>("user");

  const handleFindProfessionals = () => {
    if (location.pathname === "/") {
      // Scroll to search on home page
      document.getElementById("hero-search")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => {
        document.getElementById("hero-search")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleServices = () => {
    if (location.pathname === "/") {
      // Scroll to services on home page
      document.getElementById("services-section")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/services");
    }
  };

  const handleBecomePro = () => {
    if (user?.role === "vendor" || user?.role === "super-admin") {
      navigate(resolveDashboardPath(user.role));
    } else {
      setLoginModalRole("vendor");
      setShowLoginModal(true);
    }
  };

  const handleHelp = () => {
    navigate("/help");
  };

  const handleLogin = () => {
    setLoginModalRole("user");
    setShowLoginModal(true);
  };

  const handleDashboard = () => {
    if (!user) {
      setLoginModalRole("user");
      setShowLoginModal(true);
      return;
    }
    navigate(resolveDashboardPath(user.role ?? "user"));
  };

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <HeaderNew
        onLogoClick={() => navigate("/")}
        onFindProfessionals={handleFindProfessionals}
        onServices={handleServices}
        onBecomePro={handleBecomePro}
        onHelp={handleHelp}
        onLogin={handleLogin}
        onDashboard={handleDashboard}
      />

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 min-w-0"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <Footer
        onNavigateToDesignSystem={() => {}}
        onNavigateToCookiePolicy={() => {}}
      />

      <LoginModal
        open={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
        }}
        defaultRole={loginModalRole}
        onSuccess={(role) => {
          navigate(resolveDashboardPath(role));
        }}
      />
    </div>
  );
}
