import type React from "react";
import { createContext, useContext, useMemo } from "react";
import { ThemeProvider } from "styled-components";
import { useConfig } from "../hooks/useConfig";
import { type Theme, createTheme } from "../styles/theme";

const BrandingContext = createContext<Theme | null>(null);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const { config, loading } = useConfig();

  const theme = useMemo(
    () => (config ? createTheme(config) : null),
    [config]
  );

  if (loading || !theme) return null;

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
