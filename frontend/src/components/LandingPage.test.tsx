import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
// frontend/src/components/LandingPage.test.tsx
import { describe, expect, it, vi } from "vitest";
import { BrandingProvider } from "../contexts/BrandingContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import { AppIntlProvider } from "../i18n";
import { LandingPage } from "./LandingPage";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderLandingPage(props = {}) {
  const defaultProps = {
    onCreateSession: vi.fn(),
    ...props,
  };

  return {
    ...render(
      <BrowserRouter>
        <AppIntlProvider>
          <BrandingProvider>
            <NotificationProvider>
              <LandingPage {...defaultProps} />
            </NotificationProvider>
          </BrandingProvider>
        </AppIntlProvider>
      </BrowserRouter>
    ),
    props: defaultProps,
  };
}

describe("LandingPage", () => {
  it("should render create session button", async () => {
    renderLandingPage();
    // BrandingProvider fetches /api/config on first mount and renders null
    // until it resolves, so use findAllByRole to wait for the real tree.
    // The Create-Session button and the SectionTitle above it share the same
    // i18n key `landing.createSession`, so filter by text content instead of
    // accessible name to find the button specifically.
    const buttons = await screen.findAllByRole("button");
    const createButton = buttons.find((b) =>
      /Neue Session erstellen|Create New Session/i.test(b.textContent ?? "")
    );
    expect(createButton).toBeDefined();
  });

  it("should render a main landmark", async () => {
    renderLandingPage();
    expect(await screen.findByRole("main")).toBeDefined();
  });

  it("should render a level-1 heading", async () => {
    renderLandingPage();
    expect(await screen.findByRole("heading", { level: 1 })).toBeDefined();
  });

  it("should call onCreateSession when button clicked", async () => {
    const { props } = renderLandingPage();

    // German: "Dein Name" or English: "Your name"
    const nameInput = await screen.findByPlaceholderText(/Dein Name|Your name/i);
    fireEvent.change(nameInput, { target: { value: "John Doe" } });

    const createButton = screen
      .getAllByRole("button")
      .find((b) => /Neue Session erstellen|Create New Session/i.test(b.textContent ?? ""));
    if (!createButton) throw new Error("create button not found");
    fireEvent.click(createButton);

    // Default deck is "fibonacci" — LandingPage passes (name, cardDeck).
    expect(props.onCreateSession).toHaveBeenCalledWith("John Doe", "fibonacci");
  });
});
