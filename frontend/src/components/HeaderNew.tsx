import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  User as UserIcon,
  LayoutDashboard,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";
import logoImage from "figma:asset/1a7396ce0df98b8e9d99c9694dadb671a2b68d89.png";
import { useAuth } from "../context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router";
import { useState } from "react";

interface HeaderNewProps {
  onLogoClick?: () => void;
  onFindProfessionals?: () => void;
  onServices?: () => void;
  onBecomePro?: () => void;
  onHelp?: () => void;
  onLogin?: () => void;
  onDashboard?: () => void;
}

export function HeaderNew({
  onLogoClick,
  onFindProfessionals,
  onServices,
  onBecomePro,
  onHelp,
  onLogin,
  onDashboard,
}: HeaderNewProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const getRoleLabel = () => {
    if (user?.role === "super-admin") return "Super Admin";
    if (user?.role === "admin") return "Admin";
    if (user?.role === "vendor") return "Professional";
    if (user?.role === "staff") return "Staff";
    if (user?.role === "vendor_verification_officer")
      return "Verification Officer";
    if (user?.role === "booking_coordinator") return "Booking Coordinator";
    if (user?.role === "support_executive") return "Support Executive";
    if (user?.role === "content_moderator") return "Content Moderator";
    if (user?.role === "finance_manager") return "Finance Manager";
    if (user?.role === "marketing_manager") return "Marketing Manager";
    if (user?.role === "user") return "User";
    return "Guest";
  };

  const isInternalRole = Boolean(
    user?.role && user.role !== "vendor" && user.role !== "user",
  );

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 w-full glass-strong shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <motion.div
              className="flex items-center cursor-pointer group"
              onClick={onLogoClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <img
                src={logoImage}
                alt="photorido"
                className="h-8 w-auto object-contain transition-all duration-300 group-hover:brightness-75"
              />
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <motion.button
                onClick={onFindProfessionals}
                className="text-[15px] text-[var(--foreground)] hover:text-[var(--blue-600)] transition-colors relative group"
                whileHover={{ y: -2 }}
              >
                Find Professionals
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--blue-600)] group-hover:w-full transition-all duration-300" />
              </motion.button>
              <motion.button
                onClick={onServices}
                className="text-[15px] text-[var(--foreground)] hover:text-[var(--blue-600)] transition-colors relative group"
                whileHover={{ y: -2 }}
              >
                Services
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--blue-600)] group-hover:w-full transition-all duration-300" />
              </motion.button>
              <motion.button
                onClick={onHelp}
                className="text-[15px] text-[var(--foreground)] hover:text-[var(--blue-600)] transition-colors relative group"
                whileHover={{ y: -2 }}
              >
                Help
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--blue-600)] group-hover:w-full transition-all duration-300" />
              </motion.button>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Become a Pro — hidden for vendors, shown on md+ desktop */}
              {user?.role !== "vendor" && !isInternalRole && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={onBecomePro}
                    className="hidden md:flex gap-2 bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-700)] hover:from-[var(--blue-700)] hover:to-[var(--blue-800)] shadow-md hover:shadow-lg transition-all rounded-xl"
                  >
                    Become a Pro
                  </Button>
                </motion.div>
              )}

              {/* Notifications — only when logged in */}
              {user && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-[var(--blue-50)] hover:text-[var(--blue-600)] transition-all relative"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[var(--blue-600)] rounded-full border-2 border-white" />
                  </Button>
                </motion.div>
              )}

              {/* Desktop user dropdown */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="ghost"
                        className="hidden lg:flex items-center gap-2 hover:bg-[var(--blue-50)]"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--blue-500)] to-[var(--blue-700)] flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserIcon className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                        <Badge
                          variant="secondary"
                          className="w-fit text-xs mt-1"
                        >
                          {getRoleLabel()}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDashboard}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/dashboard?tab=settings")}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="hidden lg:block"
                >
                  <Button
                    onClick={onLogin}
                    variant="outline"
                    className="flex items-center gap-2 hover:bg-[var(--blue-50)] hover:border-[var(--blue-600)] hover:text-[var(--blue-600)] rounded-xl"
                  >
                    <UserIcon className="h-4 w-4" />
                    Login
                  </Button>
                </motion.div>
              )}

              {/* Mobile hamburger — shown below lg */}
              <button
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[var(--blue-50)] transition-colors"
                onClick={() => setMobileOpen((prev) => !prev)}
                aria-label="Toggle navigation menu"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile slide-down menu — below lg breakpoint only */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed top-20 left-0 right-0 z-40 glass-strong border-b shadow-xl lg:hidden"
          >
            <div className="container mx-auto px-4 py-3 flex flex-col gap-0.5">
              {/* Nav links */}
              <button
                onClick={() => {
                  onFindProfessionals?.();
                  closeMobile();
                }}
                className="w-full text-left px-4 py-3 rounded-xl text-[15px] text-[var(--foreground)] hover:bg-[var(--blue-50)] hover:text-[var(--blue-600)] transition-colors"
              >
                Find Professionals
              </button>
              <button
                onClick={() => {
                  onServices?.();
                  closeMobile();
                }}
                className="w-full text-left px-4 py-3 rounded-xl text-[15px] text-[var(--foreground)] hover:bg-[var(--blue-50)] hover:text-[var(--blue-600)] transition-colors"
              >
                Services
              </button>
              <button
                onClick={() => {
                  onHelp?.();
                  closeMobile();
                }}
                className="w-full text-left px-4 py-3 rounded-xl text-[15px] text-[var(--foreground)] hover:bg-[var(--blue-50)] hover:text-[var(--blue-600)] transition-colors"
              >
                Help
              </button>

              {user?.role !== "vendor" && !isInternalRole && (
                <button
                  onClick={() => {
                    onBecomePro?.();
                    closeMobile();
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl text-[15px] font-semibold text-[var(--blue-600)] hover:bg-[var(--blue-50)] transition-colors"
                >
                  Become a Pro
                </button>
              )}

              <div className="border-t border-[var(--border)] my-2" />

              {/* Auth section */}
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--blue-500)] to-[var(--blue-700)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] truncate">
                        {user.email}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="ml-auto text-xs flex-shrink-0"
                    >
                      {getRoleLabel()}
                    </Badge>
                  </div>
                  <button
                    onClick={() => {
                      onDashboard?.();
                      closeMobile();
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl text-[15px] text-[var(--foreground)] hover:bg-[var(--blue-50)] hover:text-[var(--blue-600)] transition-colors flex items-center gap-3"
                  >
                    <LayoutDashboard className="h-4 w-4 flex-shrink-0" />{" "}
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      navigate("/dashboard?tab=settings");
                      closeMobile();
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl text-[15px] text-[var(--foreground)] hover:bg-[var(--blue-50)] hover:text-[var(--blue-600)] transition-colors flex items-center gap-3"
                  >
                    <Settings className="h-4 w-4 flex-shrink-0" /> Settings
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      closeMobile();
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl text-[15px] text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                  >
                    <LogOut className="h-4 w-4 flex-shrink-0" /> Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onLogin?.();
                    closeMobile();
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl text-[15px] font-semibold text-[var(--blue-600)] hover:bg-[var(--blue-50)] transition-colors flex items-center gap-3"
                >
                  <UserIcon className="h-4 w-4 flex-shrink-0" /> Login
                </button>
              )}

              {/* Bottom padding for safe area */}
              <div className="h-2" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
