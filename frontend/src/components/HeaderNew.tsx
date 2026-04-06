import { Bell, ChevronDown, LogOut, Settings, User as UserIcon, LayoutDashboard } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "motion/react";
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

  const getRoleLabel = () => {
    if (user?.role === "super-admin") return "Super Admin";
    if (user?.role === "vendor") return "Professional";
    if (user?.role === "user") return "User";
    return "Guest";
  };

  return (
    <motion.header
      className="sticky top-0 z-50 w-full glass-strong shadow-sm"
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

          {/* Navigation */}
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
            {/* Become a Pro Button - Hidden for vendors */}
            {user?.role !== "vendor" && user?.role !== "super-admin" && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={onBecomePro}
                  className="hidden md:flex gap-2 bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-700)] hover:from-[var(--blue-700)] hover:to-[var(--blue-800)] shadow-md hover:shadow-lg transition-all rounded-xl"
                >
                  Become a Pro
                </Button>
              </motion.div>
            )}

            {/* Notifications - Only shown when logged in */}
            {user && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 hover:bg-[var(--blue-50)]"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--blue-500)] to-[var(--blue-700)] flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-white" />
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <Badge variant="secondary" className="w-fit text-xs mt-1">
                        {getRoleLabel()}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDashboard}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard?tab=settings")}>
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
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={onLogin}
                  variant="outline"
                  className="flex items-center gap-2 hover:bg-[var(--blue-50)] hover:border-[var(--blue-600)] hover:text-[var(--blue-600)]"
                >
                  <UserIcon className="h-4 w-4" />
                  Login
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
