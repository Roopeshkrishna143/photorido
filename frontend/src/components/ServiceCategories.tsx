import { motion } from "motion/react";
import type { MarketplacePublicServiceCategory } from "../hooks/useMarketplacePublicSummary";
import { getServiceCategoryVisual } from "../lib/public-marketplace";

interface ServiceCategoriesProps {
  categories: MarketplacePublicServiceCategory[];
  isLoading?: boolean;
  error?: string | null;
  onCategorySelect?: (categoryName: string) => void;
}

const compactNumberFormatter = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function ServiceCategories({
  categories,
  isLoading = false,
  error = null,
  onCategorySelect,
}: ServiceCategoriesProps) {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-4 text-3xl text-[var(--primary)] sm:text-4xl">
            Browse by Service
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-[var(--muted-foreground)]">
            Browse live service categories coming directly from the marketplace database
          </p>
        </motion.div>

        {error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-center text-red-700">
            {error}
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="h-48 animate-pulse rounded-3xl bg-[var(--blue-50)]" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--blue-200)] bg-[var(--blue-50)] px-6 py-10 text-center text-[var(--muted-foreground)]">
            Service categories will appear here once active listings are available in the database.
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-6"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {categories.map((category) => {
              const visual = getServiceCategoryVisual(category.name);
              const Icon = visual.icon;

              return (
                <motion.button
                  key={category.id}
                  type="button"
                  variants={item}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onCategorySelect?.(category.name)}
                  className="text-left"
                >
                  <div className="group relative h-full overflow-hidden rounded-3xl border-2 border-transparent bg-gradient-to-br from-white to-[var(--blue-50)] p-6 text-center transition-all hover:border-[var(--blue-300)] hover:shadow-xl hover:shadow-blue-100/50">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[var(--blue-100)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="relative">
                      <motion.div
                        className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${visual.gradient} shadow-lg`}
                        whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </motion.div>
                      <h3 className="mb-1.5 text-sm text-[var(--primary)] transition-colors">
                        {category.name}
                      </h3>
                      <p className="mb-2 text-xs text-[var(--muted-foreground)]">
                        {visual.description}
                      </p>
                      <div className="inline-flex items-center gap-1 rounded-full bg-[var(--blue-100)] px-2.5 py-1 text-xs text-[var(--blue-700)]">
                        {compactNumberFormatter.format(category.listingCount)} listings
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
