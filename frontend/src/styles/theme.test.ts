import { describe, expect, it } from "vitest";
import { createTheme } from "./theme";

const defaultConfig = {
  brandName: "Mayflower GmbH",
  brandLogoUrl: "/assets/logo.svg",
  brandPrimaryColor: "#1a73e8",
  brandFooterText: "Part of Mayflower Agile Tools",
};

const WCAG_AA_NORMAL = 4.5;

function relativeLuminance(hex: string): number {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  const rgb = [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (light + 0.05) / (dark + 0.05);
}

describe("theme contrast", () => {
  const theme = createTheme(defaultConfig);

  it("text on background meets WCAG AA", () => {
    expect(contrastRatio(theme.colors.text, theme.colors.background)).toBeGreaterThanOrEqual(
      WCAG_AA_NORMAL
    );
  });

  it("text on surface meets WCAG AA", () => {
    expect(contrastRatio(theme.colors.text, theme.colors.surface)).toBeGreaterThanOrEqual(
      WCAG_AA_NORMAL
    );
  });

  it("textSecondary on background meets WCAG AA", () => {
    expect(
      contrastRatio(theme.colors.textSecondary, theme.colors.background)
    ).toBeGreaterThanOrEqual(WCAG_AA_NORMAL);
  });

  it("textSecondary on surface meets WCAG AA", () => {
    expect(contrastRatio(theme.colors.textSecondary, theme.colors.surface)).toBeGreaterThanOrEqual(
      WCAG_AA_NORMAL
    );
  });
});
