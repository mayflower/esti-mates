import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { BrandingProvider } from "../contexts/BrandingContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import { SessionProvider } from "../contexts/SessionContext";
import { AppIntlProvider } from "../i18n";
import { SessionPage } from "./SessionPage";

function renderSessionPage() {
  return render(
    <MemoryRouter initialEntries={["/session/ABCDEF"]}>
      <AppIntlProvider>
        <BrandingProvider>
          <NotificationProvider>
            <SessionProvider socket={null}>
              <Routes>
                <Route path="/session/:sessionId" element={<SessionPage />} />
              </Routes>
            </SessionProvider>
          </NotificationProvider>
        </BrandingProvider>
      </AppIntlProvider>
    </MemoryRouter>
  );
}

describe("SessionPage", () => {
  it("should render a main landmark", async () => {
    renderSessionPage();
    expect(await screen.findByRole("main")).toBeDefined();
  });

  it("should render a level-1 heading", async () => {
    renderSessionPage();
    expect(await screen.findByRole("heading", { level: 1 })).toBeDefined();
  });
});

// Silence unused-import warning for vi in case future tests need it
void vi;
