import { Currency, Locale } from "@/types/settings.types";

/**
 * Pure internationalization utilities using native Intl API.
 * These functions are framework-agnostic and SSR-safe.
 */

/**
 * Format a date with locale-specific formatting
 * @example formatDate(new Date(), 'en-US') // "Mon, Dec 11"
 */
export function formatDate(
  date: Date,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...options,
  }).format(date);
}

/**
 * Format a month name
 * @example formatMonth(12, 'en-US') // "December"
 */
export function formatMonth(month: number, locale: Locale): string {
  // month is 1-based (1-12)
  return new Intl.DateTimeFormat(locale, {
    month: "long",
  }).format(new Date(2024, month - 1, 1));
}

/**
 * Format time (hours and minutes) with 12h or 24h format
 * @example formatDateTime(new Date(), 'en-US', false) // "3:45 PM"
 */
export function formatDateTime(
  date: Date,
  locale: Locale,
  format24h: boolean
): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: !format24h,
  }).format(date);
}

/**
 * Format a time span (start - end)
 * @example formatTimeSpan(start, end, 'en-US', true) // "14:30 - 16:45"
 */
export function formatTimeSpan(
  start: Date,
  end: Date,
  locale: Locale,
  format24h: boolean
): string {
  const startStr = formatDateTime(start, locale, format24h);
  const endStr = formatDateTime(end, locale, format24h);
  return `${startStr} - ${endStr}`;
}

/**
 * Format a duration in seconds to human-readable format
 * @example formatDuration(3665) // "1h 1min"
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.ceil((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} h`;
  }

  return `${hours}h ${minutes}min`;
}

/**
 * Format money with currency symbol and locale-specific formatting
 * @example formatMoney(1234.56, 'EUR', 'de-DE') // "1.234,56 €"
 */
export function formatMoney(
  amount: number,
  currency: Currency,
  locale: Locale
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number with locale-specific formatting
 * @example formatNumber(1234.56, 'de-DE') // "1.234,56"
 */
export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format a percentage
 * @example formatPercent(0.1234, 'en-US') // "12.34%"
 */
export function formatPercent(
  value: number,
  locale: Locale,
  decimals: number = 2
): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Get currency symbol for a currency code
 * @example getCurrencySymbol('EUR', 'de-DE') // "€"
 */
export function getCurrencySymbol(currency: Currency, locale: Locale): string {
  return (
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value ?? currency
  );
}

/**
 * Format a relative time (e.g., "2 days ago", "in 3 hours")
 * @example formatRelativeTime(new Date(Date.now() - 86400000), 'en-US') // "1 day ago"
 */
export function formatRelativeTime(date: Date, locale: Locale): string {
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const intervals = [
    { seconds: 31536000, unit: "year" as const },
    { seconds: 2592000, unit: "month" as const },
    { seconds: 86400, unit: "day" as const },
    { seconds: 3600, unit: "hour" as const },
    { seconds: 60, unit: "minute" as const },
  ];

  for (const { seconds, unit } of intervals) {
    const interval = Math.floor(Math.abs(diffInSeconds) / seconds);
    if (interval >= 1) {
      return rtf.format(diffInSeconds < 0 ? -interval : interval, unit);
    }
  }

  return rtf.format(0, "second");
}

/**
 * Format a date range
 * @example formatDateRange(start, end, 'en-US') // "Dec 11 - Dec 15, 2024"
 */
export function formatDateRange(
  startDate: Date,
  endDate: Date,
  locale: Locale
): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).formatRange(startDate, endDate);
}

/**
 * Get the localized name of a weekday
 * @example getWeekdayName(1, 'en-US', 'long') // "Monday"
 */
export function getWeekdayName(
  dayIndex: number,
  locale: Locale,
  format: "long" | "short" | "narrow" = "long"
): string {
  // dayIndex: 0 = Sunday, 1 = Monday, etc.
  const date = new Date(2024, 0, dayIndex); // Jan 2024 starts on Monday
  return new Intl.DateTimeFormat(locale, { weekday: format }).format(date);
}

/**
 * Get the localized text for a given string
 * @example getLocalizedText("Hallo", "Hello", "de-DE") // "Hallo"
 */
export function getLocalizedText(de: string, en: string, locale: Locale): string {
  if (locale === "de-DE") return de;
  else return en;
}