import { Map, ChevronRight } from "lucide-react";

export function Sitemap() {
  const sections = [
    {
      title: "Main Pages",
      links: [
        { name: "Home", path: "/" },
        { name: "Services", path: "/services" },
        { name: "How It Works", path: "/how-it-works" },
        { name: "Search Professionals", path: "/search" },
      ],
    },
    {
      title: "About",
      links: [
        { name: "Our Story", path: "/our-story" },
        { name: "Careers", path: "/careers" },
        { name: "Press", path: "/press" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Help Center", path: "/help" },
        { name: "Safety", path: "/safety" },
        { name: "Contact Us", path: "/contact" },
      ],
    },
    {
      title: "For Professionals",
      links: [
        { name: "Become a Pro", path: "/become-a-pro" },
        { name: "Pro Benefits", path: "/pro-benefits" },
        { name: "Resources", path: "/resources" },
        { name: "Community", path: "/community" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Terms of Service", path: "/terms" },
        { name: "Accessibility", path: "/accessibility" },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pt-16 py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-12">
              <Map className="w-10 h-10 text-blue-600" />
              <h1 className="text-4xl font-bold">Sitemap</h1>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sections.map((section, index) => (
                <div key={index}>
                  <h2 className="text-xl font-bold mb-4 text-gray-900">{section.title}</h2>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a
                          href={link.path}
                          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}