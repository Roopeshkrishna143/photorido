import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api, getErrorMessage, unwrapPayload } from "../lib/api";

export interface VendorSavedProfileSummary {
  photographerId: string;
  listingName: string;
  image: string;
  city: string;
  state: string;
  saveCount: number;
  lastSavedAt?: string;
}

interface VendorSavedProfilesSnapshot {
  profiles: VendorSavedProfileSummary[];
  totals: {
    saveCount: number;
    profileCount: number;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value;
    }
  }

  return "";
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

function normalizeVendorSavedProfiles(payload: unknown): VendorSavedProfilesSnapshot {
  const raw = unwrapPayload<unknown>(payload);
  const record = isRecord(raw) ? raw : {};
  const profilesSource = Array.isArray(record.profiles) ? record.profiles : [];
  const totals = isRecord(record.totals) ? record.totals : {};

  return {
    profiles: profilesSource
      .map((entry) => {
        if (!isRecord(entry)) {
          return null;
        }

        return {
          photographerId: asString(entry.photographerId, entry.id, entry._id),
          listingName: asString(entry.listingName, entry.title, entry.name),
          image: asString(entry.image, entry.featuredImage),
          city: asString(entry.city),
          state: asString(entry.state),
          saveCount: asNumber(entry.saveCount),
          lastSavedAt: asString(entry.lastSavedAt) || undefined,
        } satisfies VendorSavedProfileSummary;
      })
      .filter((entry): entry is VendorSavedProfileSummary => entry !== null && entry.photographerId !== ""),
    totals: {
      saveCount: asNumber(totals.saveCount),
      profileCount: asNumber(totals.profileCount),
    },
  };
}

export function useVendorSavedProfiles() {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState<VendorSavedProfilesSnapshot>({
    profiles: [],
    totals: {
      saveCount: 0,
      profileCount: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (user?.role !== "vendor") {
      setSnapshot({
        profiles: [],
        totals: {
          saveCount: 0,
          profileCount: 0,
        },
      });
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = await api.get("/marketplace/favorites/vendor-summary");
      setSnapshot(normalizeVendorSavedProfiles(payload));
    } catch (nextError) {
      setSnapshot({
        profiles: [],
        totals: {
          saveCount: 0,
          profileCount: 0,
        },
      });
      setError(getErrorMessage(nextError, "Unable to load saved-profile insights."));
    } finally {
      setIsLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    profiles: snapshot.profiles,
    totals: snapshot.totals,
    isLoading,
    error,
    refresh,
  };
}
