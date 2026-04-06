import { 
  User, 
  Heart, 
  Calendar, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  Shield, 
  Bell,
  ChevronRight,
  LogOut
} from "lucide-react";

export function MobileProfile() {
  const menuSections = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Edit Profile", badge: null },
        { icon: Heart, label: "My Favorites", badge: "3" },
        { icon: Calendar, label: "Bookings", badge: "2" },
        { icon: CreditCard, label: "Payment Methods", badge: null },
      ]
    },
    {
      title: "Preferences",
      items: [
        { icon: Bell, label: "Notifications", badge: null },
        { icon: Settings, label: "Settings", badge: null },
        { icon: Shield, label: "Privacy & Security", badge: null },
      ]
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help Center", badge: null },
      ]
    }
  ];

  return (
    <div className="min-h-full pb-20">
      {/* Profile header */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 px-4 pt-4 pb-20">
        <h1 className="text-[34px] font-bold tracking-tight text-white leading-tight mb-8">
          Profile
        </h1>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-semibold border-2 border-white/30">
            JD
          </div>
          <div className="flex-1">
            <h2 className="text-[22px] font-semibold text-white">John Doe</h2>
            <p className="text-[15px] text-blue-100 mt-0.5">john.doe@example.com</p>
            <button className="mt-2 text-[15px] font-medium text-white bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full">
              View Profile
            </button>
          </div>
        </div>
      </div>

      {/* Menu sections */}
      <div className="px-4 -mt-12">
        {menuSections.map((section, sectionIndex) => (
          <div key={section.title} className={sectionIndex > 0 ? "mt-4" : ""}>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">
                  {section.title}
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {section.items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      className="w-full flex items-center gap-4 px-4 py-4 active:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="flex-1 text-left text-[17px] text-gray-900">{item.label}</span>
                      {item.badge && (
                        <span className="bg-blue-600 text-white text-[13px] font-semibold px-2 py-0.5 rounded-full min-w-[24px] text-center">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Logout button */}
        <button className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 px-4 py-4 flex items-center justify-center gap-3 mt-4 active:bg-gray-50 transition-colors">
          <LogOut className="w-5 h-5 text-red-600" />
          <span className="text-[17px] font-medium text-red-600">Log Out</span>
        </button>

        {/* App version */}
        <div className="text-center py-6">
          <p className="text-[13px] text-gray-500">Photorido Mobile v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
