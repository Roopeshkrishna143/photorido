import { useEffect, useState } from "react";
import { api, getErrorMessage, unwrapArray } from "../lib/api";

export interface SearchAdvertisement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  locationLabel: string;
  placement: "search-results";
  sortOrder: number;
}

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

function normalizeAdvertisements(payload: unknown) {
  return unwrapArray<unknown>(payload)
    .map((entry) => {
      if (!isRecord(entry)) {
        return null;
      }

      const id = asString(entry.id) || asString(entry._id);
      const title = asString(entry.title);
      const description = asString(entry.description);
      if (!id || !title || !description) {
        return null;
      }

      return {
        id,
        title,
        description,
        imageUrl: asString(entry.imageUrl),
        ctaLabel: asString(entry.ctaLabel) || "Learn more",
        ctaUrl: asString(entry.ctaUrl),
        locationLabel: asString(entry.locationLabel),
        placement: "search-results" as const,
        sortOrder: asNumber(entry.sortOrder),
      } satisfies SearchAdvertisement;
    })
    .filter((entry): entry is SearchAdvertisement => entry !== null)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title));
}

export function useSearchAdvertisements(limit = 3) {
  const [advertisements, setAdvertisements] = useState<SearchAdvertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setError(null);

    api.get("/site/search-advertisements", {
      query: {
        limit,
      },
    })
      .then((payload) => {
        if (!active) {
          return;
        }

        setAdvertisements(normalizeAdvertisements(payload));
      })
      .catch((nextError) => {
        if (!active) {
          return;
        }

        setAdvertisements([]);
        setError(getErrorMessage(nextError, "Unable to load advertisements right now."));
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [limit]);

  return { advertisements, isLoading, error };
}
