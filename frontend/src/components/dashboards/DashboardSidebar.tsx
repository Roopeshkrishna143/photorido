import { useEffect, useRef, useState, type ElementType } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  BarChart2,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Layers,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Tags,
  Users,
} from "lucide-react";
import logoImage from "figma:asset/1a7396ce0df98b8e9d99c9694dadb671a2b68d89.png";
import { useAuth, UserRole } from "../../context/AuthContext";
import { useMarketplace } from "../../context/MarketplaceContext";
import { MarketplaceNotificationCenter } from "./MarketplaceDashboardViews";

type NavItem = {
  label: string;
  icon: ElementType;
  key: string;
};

type NavCategory = {
  title: string;
  items: NavItem[];
};

const SUPER_ADMIN_NAV: NavCategory[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
      { label: "Vendor-User Bookings", icon: BookOpen, key: "bookings" },
      { label: "Reviews & Ratings", icon: Star, key: "reviews" },
      { label: "Permissions", icon: ShieldCheck, key: "permissions" },
      { label: "Roles", icon: ShieldCheck, key: "roles" },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Categories", icon: Tags, key: "categories" },
      { label: "Browse Services", icon: Sparkles, key: "browse-services" },
      { label: "Sub-Categories", icon: Layers, key: "sub-categories" },
      { label: "User Management", icon: Users, key: "user-management" },
      { label: "User Profiles List", icon: ClipboardCheck, key: "listings" },
    ],
  },
];

const VENDOR_NAV: NavCategory[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
      { label: "Messages", icon: MessageSquare, key: "messages" },
      { label: "Leads", icon: BookOpen, key: "bookings" },
    ],
  },
  {
    title: "Profile",
    items: [
      { label: "Profile", icon: ListChecks, key: "listings" },
      { label: "Reviews & Remarks", icon: Star, key: "reviews" },
      { label: "Schedulers", icon: CalendarDays, key: "schedulers" },
      { label: "Statistics", icon: BarChart2, key: "statistics" },
    ],
  },
];

const USER_NAV: NavCategory[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
      { label: "Messages", icon: MessageSquare, key: "messages" },
      { label: "Bookings", icon: BookOpen, key: "bookings" },
    ],
  },
];

function getNavForRole(role: UserRole): NavCategory[] {
  if (role === "super-admin") return SUPER_ADMIN_NAV;
  if (role === "vendor") return VENDOR_NAV;
  return USER_NAV;
}

function getRoleLabel(role: UserRole) {
  if (role === "super-admin") return "Super Admin";
  if (role === "vendor") return "Professional";
  return "User";
}

function getRoleBadgeColor(role: UserRole) {
  if (role === "super-admin") return "bg-purple-100 text-purple-700 border-purple-200";
  if (role === "vendor") return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-green-100 text-green-700 border-green-200";
}

interface DashboardSidebarProps {
  activeKey: string;
  onNavigate: (key: string) => void;
}

export function DashboardSidebar({ activeKey, onNavigate }: DashboardSidebarProps) {
  const { user, logout } = useAuth();
  const { conversations, notifications } = useMarketplace();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationPanelRef = useRef<HTMLDivElement | null>(null);

  const navCategories = getNavForRole(user?.role ?? null);
  const roleKey = user?.role === "vendor" || user?.role === "super-admin" ? user.role : "user";
  const unreadNotifications = notifications.filter((notification) => notification.role === roleKey && !notification.read).length;
  const unreadMessages =
    user?.role === "user"
      ? conversations.reduce((sum, conversation) => sum + conversation.userUnread, 0)
      : user?.role === "vendor"
        ? conversations.reduce((sum, conversation) => sum + conversation.vendorUnread, 0)
        : 0;

  useEffect(() => {
    if (!showNotifications) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (!notificationPanelRef.current?.contains(target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [showNotifications]);

  const handleNavigate = (key: string) => {
    setShowNotifications(false);
    onNavigate(key);
  };

  const handleLogout = () => {
    setShowNotifications(false);
    logout();
    navigate("/");
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative z-20 flex h-screen flex-shrink-0 flex-col overflow-visible border-r border-gray-200 bg-white shadow-sm"
    >
      <div className="flex min-h-[68px] items-center justify-between border-b border-gray-100 px-4 py-4">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <img
                src={logoImage}
                alt="Photorido"
                className="h-7 w-auto cursor-pointer object-contain"
                onClick={() => navigate("/")}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setCollapsed((current) => !current)}
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 ${collapsed ? "mx-auto" : ""}`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {!collapsed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-semibold text-white">
              {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-semibold text-gray-900">{user?.name}</p>
              <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-medium ${getRoleBadgeColor(user?.role ?? null)}`}>
                {getRoleLabel(user?.role ?? null)}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {collapsed && (
        <div className="flex justify-center border-b border-gray-100 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-semibold text-white">
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        {navCategories.map((category) => (
          <div key={category.title} className="mb-2">
            {!collapsed && (
              <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {category.title}
              </p>
            )}
            {collapsed && <div className="mx-3 my-2 h-px bg-gray-100" />}

            {category.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeKey === item.key;
              const showMessageBadge = item.key === "messages" && unreadMessages > 0;

              return (
                <button
                  key={item.key}
                  onClick={() => handleNavigate(item.key)}
                  title={collapsed ? item.label : undefined}
                  className={`group relative flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "border-r-2 border-blue-600 bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } ${collapsed ? "justify-center px-0" : ""}`}
                >
                  {isActive && !collapsed && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-blue-600" />
                  )}

                  <Icon className={`h-[18px] w-[18px] flex-shrink-0 transition-colors ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`} />

                  {!collapsed && (
                    <>
                      <span className="truncate">{item.label}</span>
                      {showMessageBadge && (
                        <span className="ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-white bg-red-500 px-1 text-[10px] text-white shadow-sm">
                          {Math.min(unreadMessages, 99)}
                        </span>
                      )}
                    </>
                  )}

                  {collapsed && showMessageBadge && (
                    <span className="absolute right-3 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 shadow-sm" />
                  )}

                  {collapsed && (
                    <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 py-2">
        <div ref={notificationPanelRef} className="relative">
          <button
            onClick={() => setShowNotifications((current) => !current)}
            title={collapsed ? "Notifications" : undefined}
            className={`group relative flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 ${collapsed ? "justify-center px-0" : ""}`}
          >
            <div className="relative flex-shrink-0">
              <Bell className="h-[18px] w-[18px] text-gray-400 group-hover:text-gray-600" />
              {unreadNotifications > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full border border-white bg-blue-600 px-1 text-[10px] text-white">
                  {Math.min(unreadNotifications, 9)}
                </span>
              )}
            </div>
            {!collapsed && <span>Notifications</span>}
            {collapsed && (
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                Notifications
              </span>
            )}
          </button>

          {showNotifications && (
            <div className={`fixed inset-x-4 bottom-4 z-50 sm:absolute sm:inset-x-auto ${collapsed ? "sm:left-[84px]" : "sm:left-[268px]"} sm:bottom-24`}>
              <MarketplaceNotificationCenter role={roleKey} onClose={() => setShowNotifications(false)} />
            </div>
          )}
        </div>

        <button
          onClick={() => handleNavigate("settings")}
          title={collapsed ? "Settings" : undefined}
          className={`group relative flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 ${collapsed ? "justify-center px-0" : ""}`}
        >
          <Settings className="h-[18px] w-[18px] flex-shrink-0 text-gray-400 group-hover:text-gray-600" />
          {!collapsed && <span>Settings</span>}
          {collapsed && (
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Settings
            </span>
          )}
        </button>

        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`group relative flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 ${collapsed ? "justify-center px-0" : ""}`}
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
          {collapsed && (
            <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              Logout
            </span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
