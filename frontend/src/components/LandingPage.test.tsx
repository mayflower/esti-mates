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
  it("should render create session button", () => {
    renderLandingPage();
    // German: "Neue Session erstellen" or English: "Create New Session"
    const element = screen.getByRole("button", { name: /Neue Session erstellen|Create New Session/i });
    expect(element).toBeDefined();
  });

  it("should call onCreateSession when button clicked", () => {
    const { props } = renderLandingPage();

    // German: "Dein Name" or English: "Your name"
    const nameInput = screen.getByPlaceholderText(/Dein Name|Your name/i);
    fireEvent.change(nameInput, { target: { value: "John Doe" } });

    const createButton = screen.getByRole("button", { name: /Neue Session erstellen|Create New Session/i });
    fireEvent.click(createButton);

    expect(props.onCreateSession).toHaveBeenCalledWith("John Doe");
  });
});
