import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { ServicesPage } from "./pages/ServicesPage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { SearchResultsPage } from "./pages/SearchResultsPage";
import { PhotographerDetailsPage } from "./pages/PhotographerDetailsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HelpPage } from "./pages/HelpPage";
import { MobileAppPage } from "./pages/MobileAppPage";
import { OurStory } from "./pages/OurStory";
import { Careers } from "./pages/Careers";
import { Press } from "./pages/Press";
import { Safety } from "./pages/Safety";
import { ContactUs } from "./pages/ContactUs";
import { Resources } from "./pages/Resources";
import { Community } from "./pages/Community";
import { ProBenefits } from "./pages/ProBenefits";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";
import { Sitemap } from "./pages/Sitemap";
import { Accessibility } from "./pages/Accessibility";
import { RootLayout } from "./layouts/RootLayout";

export const router = createBrowserRouter([
  // ── Dashboard: full-screen layout — NO public header/footer ──────────────
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },

  // ── Mobile app preview: also standalone, no header/footer ────────────────
  {
    path: "/mobile",
    element: <MobileAppPage />,
  },

  // ── All public pages share RootLayout (header + footer) ──────────────────
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true,              element: <HomePage /> },
      { path: "services",         element: <ServicesPage /> },
      { path: "how-it-works",     element: <HowItWorksPage /> },
      { path: "search",           element: <SearchResultsPage /> },
      { path: "photographer/:id", element: <PhotographerDetailsPage /> },
      { path: "help",             element: <HelpPage /> },
      // About
      { path: "our-story",        element: <OurStory /> },
      { path: "careers",          element: <Careers /> },
      { path: "press",            element: <Press /> },
      // Support
      { path: "safety",           element: <Safety /> },
      { path: "contact",          element: <ContactUs /> },
      // Professionals
      { path: "resources",        element: <Resources /> },
      { path: "community",        element: <Community /> },
      { path: "pro-benefits",     element: <ProBenefits /> },
      // Legal
      { path: "privacy",          element: <Privacy /> },
      { path: "terms",            element: <Terms /> },
      { path: "sitemap",          element: <Sitemap /> },
      { path: "accessibility",    element: <Accessibility /> },
    ],
  },
]);
