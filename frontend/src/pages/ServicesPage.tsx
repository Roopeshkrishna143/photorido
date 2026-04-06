import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Breadcrumb } from "../components/Breadcrumb";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { useMarketplacePublicSummary } from "../hooks/useMarketplacePublicSummary";
import { getServiceCategoryVisual } from "../lib/public-marketplace";

const compactNumberFormatter = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function ServicesPage() {
  const navigate = useNavigate();
  const { summary, isLoading, error } = useMarketplacePublicSummary();

  const handleServiceClick = (serviceName: string) => {
    const nextSearch = new URLSearchParams();
    nextSearch.set("service", serviceName);
    nextSearch.set("page", "1");
    navigate(`/search?${nextSearch.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Breadcrumb items={[{ label: "Services" }]} />

        <div className="mb-12 text-center">
          <motion.h1
            className="mb-4 text-4xl font-bold md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Our Creative Services
          </motion.h1>
          <motion.p
            className="mx-auto max-w-2xl text-lg text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Browse categories pulled from the live marketplace database
          </motion.p>
        </div>

        {error ? (
          <div className="mb-12 rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-red-700">
            {error}
          </div>
        ) : isLoading ? (
          <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        ) : summary.serviceCategories.length === 0 ? (
          <div className="mb-12 rounded-2xl border border-dashed border-blue-200 bg-white px-6 py-10 text-center text-gray-500">
            No active service categories are available yet. Add listings in the admin or vendor flows and they will show up here automatically.
          </div>
        ) : (
          <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {summary.serviceCategories.map((service, index) => {
              const visual = getServiceCategoryVisual(service.name);
              const Icon = visual.icon;

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <CardContent className="p-6">
                      <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${visual.softBackground} transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className={`h-8 w-8 ${visual.iconColor}`} />
                      </div>

                      <h3 className="mb-2 text-xl font-bold">{service.name}</h3>
                      <p className="mb-4 min-h-[60px] text-sm text-gray-600">
                        {visual.description}
                      </p>

                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <p className="mb-1 text-xs text-gray-500">Active listings</p>
                          <p className="font-semibold text-blue-600">
                            {compactNumberFormatter.format(service.listingCount)}
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleServiceClick(service.name)}
                        className={`w-full bg-gradient-to-r ${visual.gradient} transition-all hover:shadow-lg`}
                      >
                        Browse {service.name}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <motion.div
          className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center text-white md:p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="mb-4 text-3xl font-bold">Can&apos;t Find What You&apos;re Looking For?</h2>
          <p className="mb-6 text-lg opacity-90">
            We&apos;re constantly expanding our services. Contact us for custom requests.
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate("/help")}
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            Contact Support
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
