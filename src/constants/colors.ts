import { MantineColor, MantineGradient } from "@mantine/core";

/**
 * Generiert einen passenden Gradienten basierend auf einer MantineColor
 * @param color Die Basis-Farbe für den Gradienten
 * @param deg Die Richtung des Gradienten in Grad (Standard: 135)
 * @returns Ein MantineGradient-Objekt mit from, to und deg
 */
export const getGradientForColor = (
  color: MantineColor,
  deg: number = 135
): MantineGradient => {
  // Mapping von Farben zu passenden Gradienten-Kombinationen
  const gradientMap: Record<string, { from: string; to: string }> = {
    // Blues
    blue: { from: "blue", to: "cyan" },
    cyan: { from: "cyan", to: "blue" },
    indigo: { from: "indigo", to: "blue" },

    // Purples & Pinks
    violet: { from: "violet", to: "grape" },
    grape: { from: "grape", to: "violet" },
    pink: { from: "pink", to: "grape" },

    // Reds & Oranges
    red: { from: "red", to: "orange" },
    orange: { from: "orange", to: "yellow" },

    // Yellows & Greens
    yellow: { from: "yellow", to: "orange" },
    lime: { from: "lime", to: "green" },
    green: { from: "green", to: "teal" },
    teal: { from: "teal", to: "cyan" },

    // Neutrals
    gray: { from: "gray", to: "dark" },
    dark: { from: "dark", to: "gray" },
  };

  // Fallback für unbekannte Farben
  const gradient = gradientMap[color] || { from: color, to: color };

  return {
    from: gradient.from,
    to: gradient.to,
    deg,
  };
};
