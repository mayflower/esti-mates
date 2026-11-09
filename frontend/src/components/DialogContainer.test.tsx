import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";
import type { Dialog as DialogType } from "../contexts/NotificationContext";
import { AppIntlProvider } from "../i18n";
import { createTheme } from "../styles/theme";
import { DialogContainer } from "./DialogContainer";

const theme = createTheme({
  brandName: "Test",
  brandLogoUrl: "/logo.svg",
  brandPrimaryColor: "#1a73e8",
  brandFooterText: "Test",
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <AppIntlProvider>{children}</AppIntlProvider>
    </ThemeProvider>
  );
}

describe("DialogContainer", () => {
  it("should render dialog when provided", () => {
    const dialog: DialogType = {
      message: "Test dialog",
      type: "error",
    };

    render(<DialogContainer dialog={dialog} onClose={() => {}} />, { wrapper: Wrapper });

    expect(screen.getByText("Test dialog")).toBeDefined();
  });

  it("should not render when dialog is null", () => {
    const { container } = render(<DialogContainer dialog={null} onClose={() => {}} />, {
      wrapper: Wrapper,
    });

    expect(container.firstChild).toBeNull();
  });
});
