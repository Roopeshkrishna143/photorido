import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import type { HomeBrowseServiceCard } from "../hooks/useMarketplacePublicSummary";
import { getServiceCategoryVisual } from "../lib/public-marketplace";

interface ServiceCategoriesProps {
  cards: HomeBrowseServiceCard[];
  isLoading?: boolean;
  error?: string | null;
  onServiceSelect?: (serviceName: string) => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function getCardsPerPage() {
  if (typeof window === "undefined") {
    return 6;
  }

  if (window.innerWidth >= 1280) {
    return 6;
  }

  if (window.innerWidth >= 768) {
    return 3;
  }

  return 2;
}

function ServiceCard({
  card,
  onSelect,
}: {
  card: HomeBrowseServiceCard;
  onSelect?: (serviceName: string) => void;
}) {
  const visual = getServiceCategoryVisual(card.name);
  const Icon = visual.icon;

  return (
    <motion.button
      type="button"
      variants={item}
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect?.(card.name)}
      className="h-full text-left"
    >
      <div className="h-full rounded-[28px] border border-[#e7f0ff] bg-gradient-to-b from-white to-[#f6f9ff] px-6 py-7 text-center shadow-[0_18px_45px_rgba(37,99,235,0.08)] transition-all duration-300 hover:border-[#bfd7ff] hover:shadow-[0_22px_55px_rgba(37,99,235,0.14)]">
        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${visual.gradient} shadow-lg shadow-blue-200/50`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-[1.05rem] font-medium text-slate-900">{card.name}</h3>
        <p className="mx-auto mt-2 max-w-[180px] text-sm leading-6 text-slate-500">{card.description}</p>
        <div className="mt-4 inline-flex items-center rounded-full bg-[#dbeafe] px-3 py-1 text-xs font-medium text-[#1d4ed8]">
          {card.badgeText}
        </div>
      </div>
    </motion.button>
  );
}

export function ServiceCategories({
  cards,
  isLoading = false,
  error = null,
  onServiceSelect,
}: ServiceCategoriesProps) {
  const [cardsPerPage, setCardsPerPage] = useState(getCardsPerPage);
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setCardsPerPage(getCardsPerPage());
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const shouldAutoRotate = cards.length > cardsPerPage;
  const carouselPages = useMemo(() => {
    if (!shouldAutoRotate) {
      return [];
    }

    return Array.from({ length: cards.length }, (_, startIndex) => (
      Array.from({ length: cardsPerPage }, (_, offset) => cards[(startIndex + offset) % cards.length])
    ));
  }, [cards, cardsPerPage, shouldAutoRotate]);

  useEffect(() => {
    setActivePage(0);
  }, [cards.length, cardsPerPage]);

  useEffect(() => {
    if (!shouldAutoRotate || carouselPages.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActivePage((current) => (current + 1) % carouselPages.length);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [carouselPages.length, shouldAutoRotate]);

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
          <h2 className="text-3xl text-slate-900 sm:text-5xl">Browse by Service</h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-slate-500">
            Find the perfect professional for your needs from our diverse range of creative services
          </p>
        </motion.div>

        {error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-center text-red-700">
            {error}
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="h-56 animate-pulse rounded-[28px] bg-[#eef4ff]" />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--blue-200)] bg-[var(--blue-50)] px-6 py-10 text-center text-[var(--muted-foreground)]">
            Browse-by-service cards will appear here once the super admin activates them.
          </div>
        ) : shouldAutoRotate ? (
          <div className="overflow-hidden">
            <motion.div
              className="flex"
              animate={{ x: `${-activePage * 100}%` }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            >
              {carouselPages.map((pageCards, pageIndex) => (
                <div key={pageIndex} className="min-w-full">
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-6">
                    {pageCards.map((card, cardIndex) => (
                      <ServiceCard key={`${card.id}-${pageIndex}-${cardIndex}`} card={card} onSelect={onServiceSelect} />
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-6"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {cards.map((card) => (
              <ServiceCard key={card.id} card={card} onSelect={onServiceSelect} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}