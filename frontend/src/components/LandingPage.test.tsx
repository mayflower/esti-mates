import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
// frontend/src/components/LandingPage.test.tsx
import { describe, expect, it, vi } from "vitest";
import { BrandingProvider } from "../contexts/BrandingContext";
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
        <BrandingProvider>
          <LandingPage {...defaultProps} />
        </BrandingProvider>
      </BrowserRouter>
    ),
    props: defaultProps,
  };
}

describe("LandingPage", () => {
  it("should render create session button", () => {
    renderLandingPage();
    const element = screen.getByRole("button", { name: /Create New Session/i });
    expect(element).toBeDefined();
  });

  it("should call onCreateSession when button clicked", () => {
    const { props } = renderLandingPage();

    const nameInput = screen.getByPlaceholderText("Your name");
    fireEvent.change(nameInput, { target: { value: "John Doe" } });

    const createButton = screen.getByRole("button", { name: /Create New Session/i });
    fireEvent.click(createButton);

    expect(props.onCreateSession).toHaveBeenCalledWith("John Doe");
  });
});
