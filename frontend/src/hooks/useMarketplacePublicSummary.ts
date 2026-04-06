import { useEffect, useState } from "react";
import { api, getErrorMessage, unwrapPayload } from "../lib/api";

export interface MarketplacePublicStats {
  professionals: number;
  activeVendors: number;
  completedBookings: number;
  totalReviews: number;
  averageRating: number;
  activeCategories: number;
}

export interface MarketplacePublicServiceCategory {
  id: string;
  name: string;
  listingCount: number;
}

export interface MarketplacePublicSummary {
  stats: MarketplacePublicStats;
  serviceCategories: MarketplacePublicServiceCategory[];
  trendingSearches: string[];
}

const EMPTY_SUMMARY: MarketplacePublicSummary = {
  stats: {
    professionals: 0,
    activeVendors: 0,
    completedBookings: 0,
    totalReviews: 0,
    averageRating: 0,
    activeCategories: 0,
  },
  serviceCategories: [],
  trendingSearches: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function normalizeSummary(payload: unknown): MarketplacePublicSummary {
  const raw = unwrapPayload<unknown>(payload);
  const record = isRecord(raw) ? raw : {};
  const statsRecord = isRecord(record.stats) ? record.stats : {};
  const categoriesSource = Array.isArray(record.serviceCategories) ? record.serviceCategories : [];
  const trendingSource = Array.isArray(record.trendingSearches) ? record.trendingSearches : [];

  return {
    stats: {
      professionals: asNumber(statsRecord.professionals),
      activeVendors: asNumber(statsRecord.activeVendors),
      completedBookings: asNumber(statsRecord.completedBookings),
      totalReviews: asNumber(statsRecord.totalReviews),
      averageRating: asNumber(statsRecord.averageRating),
      activeCategories: asNumber(statsRecord.activeCategories),
    },
    serviceCategories: categoriesSource
      .map((entry) => {
        if (!isRecord(entry)) {
          return null;
        }

        const id = asString(entry.id) || asString(entry._id);
        const name = asString(entry.name);
        if (!id || !name) {
          return null;
        }

        return {
          id,
          name,
          listingCount: asNumber(entry.listingCount),
        } satisfies MarketplacePublicServiceCategory;
      })
      .filter((entry): entry is MarketplacePublicServiceCategory => entry !== null),
    trendingSearches: trendingSource
      .map((entry) => asString(entry))
      .filter(Boolean),
  };
}

export function useMarketplacePublicSummary() {
  const [summary, setSummary] = useState<MarketplacePublicSummary>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setError(null);

    api.get("/site/home-summary")
      .then((payload) => {
        if (!active) {
          return;
        }

        setSummary(normalizeSummary(payload));
      })
      .catch((nextError) => {
        if (!active) {
          return;
        }

        setSummary(EMPTY_SUMMARY);
        setError(getErrorMessage(nextError, "Unable to load marketplace highlights."));
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return { summary, isLoading, error };
}
