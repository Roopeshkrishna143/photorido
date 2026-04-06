import { useEffect, useState } from "react";
import { api, getErrorMessage, unwrapArray, unwrapPayload } from "../lib/api";

export type BookingSlotType = "full" | "morning" | "afternoon";

export interface PhotographerCoordinates {
  lat: number;
  lng: number;
}

export interface PhotographerBookedDate {
  date: string;
  type: BookingSlotType;
}

export interface PhotographerPendingRequest {
  date: string;
  count: number;
}

export interface PhotographerReviewItem {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface PhotographerSummary {
  id: string;
  name: string;
  location: string;
  specialty: string;
  rating: number;
  reviews: number;
  price: string;
  image: string;
  verified: boolean;
  coordinates: PhotographerCoordinates;
  vendorEmail?: string;
  distanceKm?: number;
}

export interface PhotographerDetail extends PhotographerSummary {
  bio: string;
  experience: string;
  languages: string[];
  services: string[];
  portfolio: string[];
  reviewItems: PhotographerReviewItem[];
  bookedDates: PhotographerBookedDate[];
  pendingRequests: PhotographerPendingRequest[];
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

function asNumber(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value.replace(/[^\d.]/g, ""));
      if (Number.isFinite(parsed) && value.trim() !== "") {
        return parsed;
      }
    }
  }

  return 0;
}

function normalizeCurrency(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") {
      return value.replace("â‚¹", "Rs. ");
    }
  }

  const amount = asNumber(...values);
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (typeof entry === "string") {
        return entry.trim();
      }

      if (isRecord(entry)) {
        return asString(entry.name, entry.label, entry.title, entry.value, entry.url);
      }

      return "";
    })
    .filter(Boolean);
}

function normalizeCoordinates(value: unknown): PhotographerCoordinates {
  if (isRecord(value)) {
    return {
      lat: asNumber(value.lat, value.latitude),
      lng: asNumber(value.lng, value.lon, value.longitude),
    };
  }

  return { lat: 0, lng: 0 };
}

function normalizePortfolio(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (typeof entry === "string") {
        return entry;
      }

      if (isRecord(entry)) {
        return asString(entry.url, entry.image, entry.src, entry.path);
      }

      return "";
    })
    .filter(Boolean);
}

function normalizeReviewItems(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry, index) => {
      if (!isRecord(entry)) {
        return null;
      }

      return {
        id: asString(entry.id, entry._id) || `review-${index + 1}`,
        reviewerName: asString(entry.reviewerName, entry.userName, entry.clientName, entry.name) || "Client",
        rating: asNumber(entry.rating),
        comment: asString(entry.comment, entry.review, entry.text),
        createdAt: asString(entry.createdAt, entry.date) || undefined,
      } satisfies PhotographerReviewItem;
    })
    .filter((entry): entry is PhotographerReviewItem => entry !== null);
}

function normalizeBookedDates(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (typeof entry === "string" && entry.trim() !== "") {
        return { date: entry.trim(), type: "full" as const };
      }

      if (!isRecord(entry)) {
        return null;
      }

      const type = asString(entry.type) as BookingSlotType;
      if (type !== "full" && type !== "morning" && type !== "afternoon") {
        return null;
      }

      const date = asString(entry.date);
      if (!date) {
        return null;
      }

      return { date, type } satisfies PhotographerBookedDate;
    })
    .filter((entry): entry is PhotographerBookedDate => entry !== null);
}

function normalizePendingRequests(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!isRecord(entry)) {
        return null;
      }

      const date = asString(entry.date);
      if (!date) {
        return null;
      }

      return {
        date,
        count: Math.max(1, asNumber(entry.count, entry.pendingCount, 1)),
      } satisfies PhotographerPendingRequest;
    })
    .filter((entry): entry is PhotographerPendingRequest => entry !== null);
}

function normalizeLocation(raw: Record<string, unknown>) {
  const explicitLocation = asString(raw.location, raw.cityState, raw.fullLocation);
  if (explicitLocation) {
    return explicitLocation;
  }

  const locationParts = [asString(raw.city), asString(raw.state), asString(raw.country)].filter(Boolean);
  return locationParts.join(", ");
}

function normalizeSummary(payload: unknown): PhotographerSummary {
  const raw = isRecord(payload) ? payload : {};
  const reviewItems =
    Array.isArray(raw.reviews) && raw.reviews.some((entry) => isRecord(entry))
      ? normalizeReviewItems(raw.reviews)
      : normalizeReviewItems(raw.reviewItems);

  return {
    id: asString(raw.id, raw._id),
    name: asString(raw.name, raw.fullName, raw.vendorName),
    location: normalizeLocation(raw),
    specialty: asString(raw.specialty, raw.primaryService, raw.category, raw.subCategory) || "Photography",
    rating: asNumber(raw.rating, raw.averageRating),
    reviews: asNumber(
      raw.reviewsCount,
      raw.reviewCount,
      raw.totalReviews,
      Array.isArray(raw.reviews) ? raw.reviews.length : undefined,
      reviewItems.length,
    ),
    price: normalizeCurrency(raw.price, raw.startingPrice, raw.priceStartingAt),
    image: asString(raw.image, raw.profileImage, raw.avatar, raw.coverImage),
    verified: Boolean(raw.verified ?? raw.isVerified),
    coordinates: normalizeCoordinates(raw.coordinates),
    vendorEmail: asString(raw.vendorEmail, raw.email) || undefined,
    distanceKm: asNumber(raw.distanceKm) || undefined,
  };
}

function mergeAvailability(detail: PhotographerDetail, availabilityPayload: unknown) {
  const availability = unwrapPayload<unknown>(availabilityPayload);
  const raw = isRecord(availability) ? availability : {};

  return {
    ...detail,
    bookedDates:
      detail.bookedDates.length > 0
        ? detail.bookedDates
        : normalizeBookedDates(raw.bookedDates),
    pendingRequests:
      detail.pendingRequests.length > 0
        ? detail.pendingRequests
        : normalizePendingRequests(raw.pendingRequests),
  };
}

function normalizeDetail(payload: unknown): PhotographerDetail {
  const raw = isRecord(payload) ? payload : {};
  const summary = normalizeSummary(raw);
  const rawReviews =
    Array.isArray(raw.reviewItems) ? raw.reviewItems :
    Array.isArray(raw.testimonials) ? raw.testimonials :
    Array.isArray(raw.reviews) && raw.reviews.some((entry) => isRecord(entry)) ? raw.reviews :
    [];

  return {
    ...summary,
    bio: asString(raw.bio, raw.about, raw.description),
    experience:
      asString(raw.experience, raw.experienceLabel) ||
      (asNumber(raw.yearsOfExperience) > 0 ? `${asNumber(raw.yearsOfExperience)}+ Years` : ""),
    languages: asStringArray(raw.languages),
    services: asStringArray(raw.services ?? raw.serviceTags),
    portfolio: normalizePortfolio(raw.portfolio ?? raw.gallery ?? raw.images),
    reviewItems: normalizeReviewItems(rawReviews),
    bookedDates: normalizeBookedDates(raw.bookedDates),
    pendingRequests: normalizePendingRequests(raw.pendingRequests),
  };
}

export async function loadPhotographers() {
  const payload = await api.get("/photographers");
  return unwrapArray<unknown>(payload).map(normalizeSummary);
}

export async function loadPhotographerDetail(id: string) {
  const detailPayload = await api.get(`/photographers/${id}`);
  let detail = normalizeDetail(unwrapPayload(detailPayload));

  if (detail.bookedDates.length > 0 || detail.pendingRequests.length > 0) {
    return detail;
  }

  try {
    const availabilityPayload = await api.get(`/photographers/${id}/availability`);
    detail = mergeAvailability(detail, availabilityPayload);
  } catch {
    // Availability is optional for read-only views.
  }

  return detail;
}

export function usePhotographers() {
  const [photographers, setPhotographers] = useState<PhotographerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setError(null);

    loadPhotographers()
      .then((items) => {
        if (!active) {
          return;
        }

        setPhotographers(items);
      })
      .catch((nextError) => {
        if (!active) {
          return;
        }

        setPhotographers([]);
        setError(getErrorMessage(nextError, "Unable to load professionals right now."));
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

  return { photographers, isLoading, error };
}

export function usePhotographerDetail(id?: string) {
  const [photographer, setPhotographer] = useState<PhotographerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setPhotographer(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let active = true;

    setIsLoading(true);
    setError(null);

    loadPhotographerDetail(id)
      .then((item) => {
        if (!active) {
          return;
        }

        setPhotographer(item);
      })
      .catch((nextError) => {
        if (!active) {
          return;
        }

        setPhotographer(null);
        setError(getErrorMessage(nextError, "Unable to load this professional."));
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  return { photographer, isLoading, error };
}

export interface PhotographerSearchParams {
  q?: string;
  location?: string;
  service?: string;
  specialties?: string[];
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  date?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  page?: number;
  limit?: number;
}

export interface PhotographerSearchResult {
  photographers: PhotographerSummary[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export async function searchPhotographers(params: PhotographerSearchParams) {
  const payload = await api.get("/photographers", {
    query: {
      q: params.q,
      location: params.location,
      service: params.service,
      specialties: params.specialties?.join(","),
      minRating: params.minRating,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      sort: params.sort,
      date: params.date,
      lat: params.lat,
      lng: params.lng,
      radiusKm: params.radiusKm,
      page: params.page,
      limit: params.limit,
    },
  });

  const photographers = unwrapArray<unknown>(payload).map(normalizeSummary);
  const raw = isRecord(payload) ? payload : {};
  const meta = isRecord(raw.meta) ? raw.meta : {};

  return {
    photographers,
    page: asNumber(meta.page) || params.page || 1,
    limit: asNumber(meta.limit) || params.limit || photographers.length || 1,
    total: asNumber(meta.total) || photographers.length,
    totalPages: asNumber(meta.totalPages) || 1,
  } satisfies PhotographerSearchResult;
}

export function usePhotographerSearch(params: PhotographerSearchParams) {
  const [result, setResult] = useState<PhotographerSearchResult>({
    photographers: [],
    page: params.page || 1,
    limit: params.limit || 12,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setError(null);

    searchPhotographers(params)
      .then((nextResult) => {
        if (!active) {
          return;
        }

        setResult(nextResult);
      })
      .catch((nextError) => {
        if (!active) {
          return;
        }

        setResult({
          photographers: [],
          page: params.page || 1,
          limit: params.limit || 12,
          total: 0,
          totalPages: 1,
        });
        setError(getErrorMessage(nextError, "Unable to load professionals right now."));
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [params.q, params.location, params.service, params.date, params.minRating, params.minPrice, params.maxPrice, params.sort, params.lat, params.lng, params.radiusKm, params.page, params.limit, JSON.stringify(params.specialties ?? [])]);

  return { ...result, isLoading, error };
}
