import { MantineColor, MantineGradient } from "@mantine/core";

/**
 * Generates a suitable gradient based on a MantineColor
 * @param color The base color for the gradient
 * @param deg The direction of the gradient in degrees (default: 135)
 * @returns A MantineGradient object with from, to, and deg
 */
export const getGradientForColor = (
  color: MantineColor,
  deg: number = 135
): MantineGradient => {
  // Mapping of colors to matching gradient combinations
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

  // Fallback for unknown colors
  const gradient = gradientMap[color] || { from: color, to: color };

  return {
    from: gradient.from,
    to: gradient.to,
    deg,
  };
};
