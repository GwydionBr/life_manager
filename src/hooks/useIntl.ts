import { useSettingsStore } from "@/stores/settingsStore";
import { Currency } from "@/types/settings.types";
import * as intl from "@/utils/intl";

/**
 * Main hook for internationalization and formatting.
 * Combines user preferences from the store with Intl utilities.
 *
 * @example
 * const { formatMoney, formatDate, locale } = useIntl();
 * formatMoney(1234.56); // Uses user's default currency and locale
 * formatDate(new Date()); // Uses user's locale
 */
export function useIntl() {
  const { locale, format_24h } = useSettingsStore();

  return {
    // User preferences
    locale,
    format_24h,

    // Date & Time formatting with user preferences applied
    formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) =>
      intl.formatDate(date, locale, options),

    formatMonth: (month: number) => intl.formatMonth(month, locale),

    formatDateTime: (date: Date) =>
      intl.formatDateTime(date, locale, format_24h),

    formatTimeSpan: (start: Date, end: Date) =>
      intl.formatTimeSpan(start, end, locale, format_24h),

    formatDateRange: (start: Date, end: Date) =>
      intl.formatDateRange(start, end, locale),

    formatRelativeTime: (date: Date) => intl.formatRelativeTime(date, locale),

    getWeekdayName: (dayIndex: number, format?: "long" | "short" | "narrow") =>
      intl.getWeekdayName(dayIndex, locale, format),

    // Duration (locale-independent)
    formatDuration: intl.formatDuration,

    // Number & Money formatting with user preferences applied
    formatMoney: (amount: number, currency: Currency) =>
      intl.formatMoney(amount, currency, locale),

    formatFinanceMoney: (amount: number, currency: Currency) =>
      intl.formatMoney(amount, currency, locale),

    formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
      intl.formatNumber(value, locale, options),

    formatPercent: (value: number, decimals?: number) =>
      intl.formatPercent(value, locale, decimals),

    getCurrencySymbol: (currency: Currency) =>
      intl.getCurrencySymbol(currency, locale),

    getLocalizedText: (de: string, en: string) => {
      if (locale === "de-DE") return de;
      else return en;
    },

    // Access to raw Intl utilities if needed
    intl,
  };
}

/**
 * Standalone functions that accept locale explicitly.
 * Useful for server-side rendering or when you need to format
 * for a specific locale different from the user's preference.
 */
export const intlUtils = intl;
