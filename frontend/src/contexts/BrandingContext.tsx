// frontend/src/contexts/BrandingContext.tsx
import React, { createContext, useContext, useMemo } from "react";
import { ThemeProvider } from "styled-components";
import { createTheme, type Theme } from "../styles/theme";

const BrandingContext = createContext<Theme | null>(null);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const primaryColor = import.meta.env.VITE_BRAND_PRIMARY_COLOR || "#1a73e8";
  const theme = useMemo(() => createTheme(primaryColor), [primaryColor]);

  return (
    <BrandingContext.Provider value={theme}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </BrandingContext.Provider>
  );
}

export function useBranding(): Theme {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within BrandingProvider");
  }
  return context;
}
