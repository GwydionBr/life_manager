import { Locale, RoundingDirection } from "@/types/settings.types";

export const getRoundingLabel = (
  direction: RoundingDirection,
  roundInTimeFragments: boolean,
  locale: Locale
) => {
  if (roundInTimeFragments) {
    return locale === "de-DE" ? "Fragmentweise" : "Fragment-wise";
  }
  switch (direction) {
    case "up":
      return locale === "de-DE" ? "Aufrunden" : "Round Up";
    case "down":
      return locale === "de-DE" ? "Abrunden" : "Round Down";
    case "nearest":
      return locale === "de-DE" ? "Am nächsten" : "Round Nearest";
    default:
      return direction;
  }
};
