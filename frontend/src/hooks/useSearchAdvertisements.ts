import { useEffect, useState } from "react";
import { api, getErrorMessage, unwrapArray } from "../lib/api";

export interface SearchAdvertisementItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badgeText: string;
  imageUrl: string;
  ctaText: string;
  ctaUrl: string;
}

interface SearchAdvertisementParams {
  service?: string;
  location?: string;
  limit?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeAdvertisement(payload: unknown): SearchAdvertisementItem | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = asString(payload.id) || asString(payload._id);
  const title = asString(payload.title);
  const description = asString(payload.description);
  const imageUrl = asString(payload.imageUrl);
  const ctaText = asString(payload.ctaText);
  const ctaUrl = asString(payload.ctaUrl);

  if (!id || !title || !description || !imageUrl || !ctaText || !ctaUrl) {
    return null;
  }

  return {
    id,
    title,
    subtitle: asString(payload.subtitle),
    description,
    badgeText: asString(payload.badgeText) || "Sponsored",
    imageUrl,
    ctaText,
    ctaUrl,
  };
}

export function useSearchAdvertisements(params: SearchAdvertisementParams) {
  const [advertisements, setAdvertisements] = useState<SearchAdvertisementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setError(null);

    api.get("/site/search-advertisements", {
      query: {
        service: params.service,
        location: params.location,
        limit: params.limit ?? 4,
      },
    })
      .then((payload) => {
        if (!active) {
          return;
        }

        const items = unwrapArray<unknown>(payload)
          .map((entry) => normalizeAdvertisement(entry))
          .filter((entry): entry is SearchAdvertisementItem => entry !== null);

        setAdvertisements(items);
      })
      .catch((nextError) => {
        if (!active) {
          return;
        }

        setAdvertisements([]);
        setError(getErrorMessage(nextError, "Unable to load search advertisements."));
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [params.limit, params.location, params.service]);

  return { advertisements, isLoading, error };
}
