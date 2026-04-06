import { useCallback, useEffect, useState } from "react";
import { api, getErrorMessage, unwrapArray, unwrapPayload } from "../lib/api";
import type { BookingSlotType } from "./usePhotographers";

export interface VendorAnalyticsListingOption {
  id: string;
  label: string;
}

export interface VendorAnalyticsSnapshot {
  listings: VendorAnalyticsListingOption[];
  summary: Record<string, number>;
  series: Array<Record<string, string | number>>;
  breakdown: Array<Record<string, string | number>>;
}

export interface VendorScheduleSlot {
  id: string;
  date: string;
  type: BookingSlotType;
  label: string;
  timeRange: string;
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

function normalizeAnalytics(payload: unknown): VendorAnalyticsSnapshot {
  const raw = unwrapPayload<unknown>(payload);
  const record = isRecord(raw) ? raw : {};
  const listingsSource = Array.isArray(record.listings) ? record.listings : [];
  const seriesSource = Array.isArray(record.series) ? record.series : [];
  const breakdownSource = Array.isArray(record.breakdown) ? record.breakdown : [];
  const normalizeDataPoint = (entry: unknown) => {
    if (!isRecord(entry)) {
      return null;
    }

    return Object.fromEntries(
      Object.entries(entry).map(([key, value]) => {
        if (key === "label") {
          return [key, asString(value)];
        }

        if (key === "id" || key === "listingId") {
          return [key, asString(value)];
        }

        if (key === "week" || key === "date" || key === "month" || key === "name" || key === "title") {
          return ["label", asString(value)];
        }

        return [key, typeof value === "number" ? value : asNumber(value)];
      }),
    ) as Record<string, string | number>;
  };

  return {
    listings: listingsSource
      .map((entry) => {
        if (!isRecord(entry)) {
          return null;
        }

        return {
          id: asString(entry.id, entry._id),
          label: asString(entry.label, entry.title, entry.name),
        } satisfies VendorAnalyticsListingOption;
      })
      .filter((entry): entry is VendorAnalyticsListingOption => entry !== null),
    summary: isRecord(record.summary)
      ? Object.fromEntries(
          Object.entries(record.summary).map(([key, value]) => [key, asNumber(value)]),
        )
      : {},
    series: seriesSource
      .map((entry) => normalizeDataPoint(entry))
      .filter((entry): entry is Record<string, string | number> => entry !== null),
    breakdown: breakdownSource
      .map((entry) => normalizeDataPoint(entry))
      .filter((entry): entry is Record<string, string | number> => entry !== null),
  };
}

function normalizeScheduleSlot(payload: unknown): VendorScheduleSlot | null {
  const raw = isRecord(payload) ? payload : {};
  const type = asString(raw.type) as BookingSlotType;

  if (type !== "full" && type !== "morning" && type !== "afternoon") {
    return null;
  }

  return {
    id: asString(raw.id, raw._id),
    date: asString(raw.date),
    type,
    label: asString(raw.label) || (type === "full" ? "Full Day" : type === "morning" ? "Morning (Half Day)" : "Afternoon (Half Day)"),
    timeRange:
      asString(raw.timeRange, raw.time) ||
      (type === "full" ? "9:00 AM - 6:00 PM" : type === "morning" ? "9:00 AM - 1:00 PM" : "2:00 PM - 6:00 PM"),
  };
}

export function useVendorAnalytics(listingId: string, range: string) {
  const [analytics, setAnalytics] = useState<VendorAnalyticsSnapshot>({
    listings: [],
    summary: {},
    series: [],
    breakdown: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setError(null);

    api
      .get("/vendors/me/analytics", { query: { listingId, range } })
      .then((payload) => {
        if (!active) {
          return;
        }

        setAnalytics(normalizeAnalytics(payload));
      })
      .catch((nextError) => {
        if (!active) {
          return;
        }

        setAnalytics({ listings: [], summary: {}, series: [], breakdown: [] });
        setError(getErrorMessage(nextError, "Unable to load vendor analytics."));
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [listingId, range]);

  return { analytics, isLoading, error };
}

export function useVendorSchedules() {
  const [slots, setSlots] = useState<VendorScheduleSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = await api.get("/vendors/me/schedules");
      const items = unwrapArray<unknown>(payload)
        .map((entry) => normalizeScheduleSlot(entry))
        .filter((entry): entry is VendorScheduleSlot => entry !== null);
      setSlots(items);
    } catch (nextError) {
      setSlots([]);
      setError(getErrorMessage(nextError, "Unable to load your schedule."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runScheduleMutation = useCallback(
    async (mutation: () => Promise<unknown>) => {
      setIsSaving(true);
      setError(null);

      try {
        await mutation();
        await refresh();
        return true;
      } catch (nextError) {
        setError(getErrorMessage(nextError, "We could not update your schedule."));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refresh],
  );

  return {
    slots,
    isLoading,
    isSaving,
    error,
    refresh,
    createSlot: (slot: Omit<VendorScheduleSlot, "id">) =>
      runScheduleMutation(() => api.post("/vendors/me/schedules", slot)),
    updateSlot: (slotId: string, slot: Omit<VendorScheduleSlot, "id">) =>
      runScheduleMutation(() => api.patch(`/vendors/me/schedules/${slotId}`, slot)),
    deleteSlot: (slotId: string) =>
      runScheduleMutation(() => api.delete(`/vendors/me/schedules/${slotId}`)),
  };
}
