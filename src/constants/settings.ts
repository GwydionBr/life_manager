import {
  Currency,
  RoundingDirection,
  FinanceInterval,
  Locale,
  Language,
} from "@/types/settings.types";

export const locales: Language[] = [
  {
    value: "en-US",
    label: "English",
    flag: "US",
  },
  {
    value: "de-DE",
    label: "Deutsch",
    flag: "DE",
  },
];

export const currencies: {
  value: Currency;
  label: string;
}[] = [
  { value: "USD", label: "$ (US Dollar)" },
  { value: "EUR", label: "€ (Euro)" },
  { value: "GBP", label: "£ (British Pound)" },
  { value: "CAD", label: "$ (Canadian Dollar)" },
  { value: "AUD", label: "$ (Australian Dollar)" },
  { value: "JPY", label: "¥ (Japanese Yen)" },
  { value: "CHF", label: "CHF (Swiss Franc)" },
  { value: "CNY", label: "¥ (Chinese Yuan)" },
  { value: "INR", label: "₹ (Indian Rupee)" },
  { value: "BRL", label: "R$ (Brazilian Real)" },
  { value: "VEF", label: "Bs (Venezuelan Bolívar)" },
];

export const shortCurrencies: { value: Currency; label: string }[] = [
  { value: "USD", label: "$" },
  { value: "EUR", label: "€" },
  { value: "GBP", label: "£" },
  { value: "CAD", label: "$" },
  { value: "AUD", label: "$" },
  { value: "JPY", label: "¥" },
  { value: "CHF", label: "CHF" },
  { value: "CNY", label: "¥" },
  { value: "INR", label: "₹" },
  { value: "BRL", label: "R$" },
  { value: "VEF", label: "Bs" },
];

export const getRoundingModes = (locale: Locale) => {
  const roundingModes: { value: RoundingDirection; label: string }[] = [
    { value: "up", label: locale === "de-DE" ? "Auf" : "Up" },
    { value: "down", label: locale === "de-DE" ? "Ab" : "Down" },
    {
      value: "nearest",
      label: locale === "de-DE" ? "Zum nächsten" : "Nearest",
    },
  ];
  return roundingModes;
};

export const getRoundingInTimeFragments = (locale: Locale) => {
  const roundingInTimeFragments: { value: string; label: string }[] = [
    { value: "5", label: locale === "de-DE" ? "5 Minuten" : "5 minutes" },
    { value: "10", label: locale === "de-DE" ? "10 Minuten" : "10 minutes" },
    { value: "15", label: locale === "de-DE" ? "15 Minuten" : "15 minutes" },
    { value: "30", label: locale === "de-DE" ? "30 Minuten" : "30 minutes" },
    { value: "60", label: locale === "de-DE" ? "1 Stunde" : "1 hour" },
  ];
  return roundingInTimeFragments;
};

export const financeIntervals: { value: FinanceInterval; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "1/4 year", label: "Quarter Year" },
  { value: "1/2 year", label: "Half Year" },
  { value: "year", label: "Year" },
];
