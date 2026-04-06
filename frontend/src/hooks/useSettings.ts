import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api, getErrorMessage, unwrapPayload } from "../lib/api";

export interface UserSettings {
  theme: "light" | "system";
  language: string;
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  bookingAlerts: boolean;
  messageAlerts: boolean;
  reviewAlerts: boolean;
  profileVisible: boolean;
  showEmail: boolean;
  showPhoneNumber: boolean;
  allowDirectMessages: boolean;
  instantBooking: boolean;
  moderationAlerts: boolean;
  systemAlerts: boolean;
  favoriteAlerts: boolean;
  digestFrequency: "instant" | "daily" | "weekly";
}

const defaultSettings: UserSettings = {
  theme: "light",
  language: "en-IN",
  timezone: "Asia/Kolkata",
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  marketingEmails: false,
  bookingAlerts: true,
  messageAlerts: true,
  reviewAlerts: true,
  profileVisible: true,
  showEmail: false,
  showPhoneNumber: false,
  allowDirectMessages: true,
  instantBooking: false,
  moderationAlerts: true,
  systemAlerts: true,
  favoriteAlerts: true,
  digestFrequency: "instant",
};

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setSettings(defaultSettings);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = await api.get("/settings/me");
      const data = unwrapPayload<{ settings?: Partial<UserSettings> }>(payload);
      setSettings({
        ...defaultSettings,
        ...(data.settings ?? {}),
      });
    } catch (nextError) {
      setSettings(defaultSettings);
      setError(getErrorMessage(nextError, "Unable to load your settings."));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!user) {
      throw new Error("Please login to update settings.");
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = await api.patch("/settings/me", updates);
      const data = unwrapPayload<{ settings?: Partial<UserSettings> }>(payload);
      setSettings((current) => ({
        ...current,
        ...(data.settings ?? updates),
      }));
      return true;
    } catch (nextError) {
      setError(getErrorMessage(nextError, "We could not update your settings."));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user]);

  return {
    settings,
    isLoading,
    isSaving,
    error,
    refresh,
    saveSettings,
  };
}
