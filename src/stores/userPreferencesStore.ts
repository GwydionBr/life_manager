import { create } from "zustand";
import { Locale, Settings } from "@/types/settings.types";


interface UserPreferences {
  // Locale & Formatting
  locale: Locale;
  format24h: boolean;

  // Timestamps
  updatedAt: string;
}

interface UserPreferencesActions {
  // Sync from DB
  setPreferences: (settings: Settings) => void;

  // Individual setters (for optimistic updates)
  setLocale: (locale: Locale) => void;
  setFormat24h: (format24h: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState: UserPreferences = {
  locale: "en-US",
  format24h: true,
  updatedAt: new Date().toISOString(),
};

export const useUserPreferences = create<
  UserPreferences & UserPreferencesActions
>((set) => ({
  ...initialState,

  setPreferences: (settings: Settings) =>
    set({
      locale: settings.locale,
      format24h: settings.format_24h,
      updatedAt: settings.updated_at,
    }),

  setLocale: (locale) => set({ locale }),
  setFormat24h: (format24h) => set({ format24h }),

  reset: () => set(initialState),
}));
