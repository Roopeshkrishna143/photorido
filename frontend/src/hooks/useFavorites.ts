import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api, getErrorMessage, unwrapArray } from "../lib/api";
import type { PhotographerSummary } from "./usePhotographers";

export interface FavoritePhotographer extends PhotographerSummary {
  favoriteId: string;
  photographerId: string;
  savedAt: string;
}

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoritePhotographer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (user?.role !== "user") {
      setFavorites([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = await api.get("/marketplace/favorites");
      setFavorites(unwrapArray<FavoritePhotographer>(payload));
    } catch (nextError) {
      setFavorites([]);
      setError(getErrorMessage(nextError, "Unable to load saved professionals."));
    } finally {
      setIsLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((favorite) => favorite.photographerId || favorite.id)),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (photographerId: string, isFavorite: boolean) => {
      if (user?.role !== "user") {
        throw new Error("Please login to save favorites");
      }

      setIsSaving(true);
      setError(null);

      try {
        if (isFavorite) {
          await api.delete(`/marketplace/favorites/${photographerId}`);
        } else {
          await api.post(`/marketplace/favorites/${photographerId}`);
        }

        await refresh();
        return true;
      } catch (nextError) {
        setError(getErrorMessage(nextError, "We could not update your saved professionals."));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [refresh, user?.role],
  );

  return {
    favorites,
    favoriteIds,
    isLoading,
    isSaving,
    error,
    refresh,
    isFavorite: (photographerId: string) => favoriteIds.has(photographerId),
    toggleFavorite,
  };
}
