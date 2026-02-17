import type { AppConfig } from "../hooks/useConfig";

export interface Theme {
  brandName: string;
  brandLogoUrl: string;
  brandPrimaryColor: string;
  brandFooterText: string;
  colors: {
    primary: string;
    primaryHover: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    error: string;
    warning: string;
    waiting: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  breakpoints: {
    mobile: string;
  };
}

export function createTheme(config: AppConfig): Theme {
  return {
    brandName: config.brandName,
    brandLogoUrl: config.brandLogoUrl,
    brandPrimaryColor: config.brandPrimaryColor,
    brandFooterText: config.brandFooterText,
    colors: {
      primary: config.brandPrimaryColor,
      primaryHover: darkenColor(config.brandPrimaryColor, 10),
      background: "#f5f5f5",
      surface: "#ffffff",
      text: "#212121",
      textSecondary: "#757575",
      border: "#e0e0e0",
      success: "#4caf50",
      error: "#f44336",
      warning: "#ff9800",
      waiting: "#9e9e9e",
    },
    spacing: {
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "32px",
    },
    borderRadius: {
      sm: "4px",
      md: "8px",
      lg: "16px",
    },
    shadows: {
      sm: "0 1px 3px rgba(0,0,0,0.12)",
      md: "0 4px 6px rgba(0,0,0,0.16)",
      lg: "0 10px 20px rgba(0,0,0,0.19)",
    },
    breakpoints: {
      mobile: "768px",
    },
  };
}

function darkenColor(hex: string, percent: number): string {
  // Simple color darkening (production should use a proper library)
  const num = Number.parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
}
