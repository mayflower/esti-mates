import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IntlProvider } from "react-intl";
import { ThemeProvider } from "styled-components";
import { ParticipantList } from "./ParticipantList";
import type { EstimateValue, Participant } from "../types/types";
import messages from "../i18n/messages/en.json";

const theme = {
  brandName: "Test Brand",
  brandLogoUrl: "/test-logo.svg",
  brandPrimaryColor: "#1a73e8",
  brandFooterText: "Test Footer",
  colors: {
    background: "#f5f5f5",
    surface: "#ffffff",
    text: "#212121",
    textSecondary: "#757575",
    primary: "#1a73e8",
    primaryHover: "#1557b0",
    border: "#e0e0e0",
    success: "#4caf50",
    error: "#f44336",
    waiting: "#9e9e9e",
    warning: "#ff9800",
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

function renderParticipantList(props: Partial<Parameters<typeof ParticipantList>[0]> = {}) {
  const defaultProps = {
    participants: [],
    revealed: false,
    revealedEstimates: null,
    currentSocketId: "socket1",
    isModerator: false,
    onToggleObserver: vi.fn(),
    onTransferModerator: vi.fn(),
    ...props,
  };

  return {
    ...render(
      <IntlProvider messages={messages} locale="en" defaultLocale="en">
        <ThemeProvider theme={theme}>
          <ParticipantList {...defaultProps} />
        </ThemeProvider>
      </IntlProvider>
    ),
    props: defaultProps,
  };
}

describe("ParticipantList", () => {
  const mockParticipants: Participant[] = [
    {
      socketId: "socket1",
      name: "Alice",
      isModerator: true,
      isObserver: false,
      currentEstimate: null,
    },
    {
      socketId: "socket2",
      name: "Bob",
      isModerator: false,
      isObserver: false,
      currentEstimate: "5",
    },
    {
      socketId: "socket3",
      name: "Charlie",
      isModerator: false,
      isObserver: true,
      currentEstimate: null,
    },
  ];

  it("should render all participants", () => {
    renderParticipantList({ participants: mockParticipants });

    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
    expect(screen.getByText("Charlie")).toBeDefined();
  });

  it("should display moderator badge for moderator", () => {
    renderParticipantList({ participants: mockParticipants });

    const moderatorBadge = screen.getByLabelText("Session moderator");
    expect(moderatorBadge).toBeDefined();
  });

  it("should display observer badge for observer", () => {
    renderParticipantList({ participants: mockParticipants });

    const observerBadge = screen.getByLabelText("Observer (not voting)");
    expect(observerBadge).toBeDefined();
    expect(observerBadge.textContent).toBe("Observer");
  });

  it("should show observer status indicator (👁️) for observers", () => {
    renderParticipantList({ participants: mockParticipants });

    // Charlie is observer - check via aria-label
    const observerStatus = screen.getByLabelText("Observer");
    expect(observerStatus).toBeDefined();
  });

  it("should show waiting indicator (⏳) for participants without estimate", () => {
    renderParticipantList({ participants: mockParticipants });

    // Alice has no estimate (not observer) - check via aria-label
    const waitingStatus = screen.getByLabelText("Waiting for vote");
    expect(waitingStatus).toBeDefined();
  });

  it("should show estimated indicator (✓) for participants with estimate", () => {
    renderParticipantList({ participants: mockParticipants });

    // Bob has estimate - check via aria-label
    const votedStatus = screen.getByLabelText("Voted");
    expect(votedStatus).toBeDefined();
  });

  describe("Moderator Actions", () => {
    it("should show observer toggle button for moderator on other participants", () => {
      renderParticipantList({
        participants: mockParticipants,
        currentSocketId: "socket1", // Alice is moderator
        isModerator: true,
      });

      // Should have toggle buttons for Bob and Charlie (not for Alice herself)
      const toggleButtons = screen.getAllByTitle(/Make Observer|Make Participant/i);
      expect(toggleButtons.length).toBe(2); // Bob and Charlie
    });

    it("should call onToggleObserver when toggle button clicked", () => {
      const { props } = renderParticipantList({
        participants: mockParticipants,
        currentSocketId: "socket1", // Alice is moderator
        isModerator: true,
      });

      // Click toggle for Bob (make observer)
      const bobToggleButton = screen.getByTitle("Make Observer");
      fireEvent.click(bobToggleButton);

      expect(props.onToggleObserver).toHaveBeenCalledWith("socket2");
    });

    it("should show transfer moderator button for non-moderator participants", () => {
      renderParticipantList({
        participants: mockParticipants,
        currentSocketId: "socket1", // Alice is moderator
        isModerator: true,
      });

      // Should have transfer button for Bob and Charlie
      const transferButtons = screen.getAllByTitle("Transfer Moderator Role");
      expect(transferButtons.length).toBe(2);
    });

    it("should call onTransferModerator when transfer button clicked", () => {
      const { props } = renderParticipantList({
        participants: mockParticipants,
        currentSocketId: "socket1", // Alice is moderator
        isModerator: true,
      });

      // Click transfer button for Bob
      const transferButtons = screen.getAllByTitle("Transfer Moderator Role");
      fireEvent.click(transferButtons[0]);

      expect(props.onTransferModerator).toHaveBeenCalledWith("socket2");
    });

    it("should not show moderator actions for non-moderator users", () => {
      renderParticipantList({
        participants: mockParticipants,
        currentSocketId: "socket2", // Bob is not moderator
        isModerator: false,
      });

      // Should not have toggle or transfer buttons
      const toggleButtons = screen.queryAllByTitle(/Make Observer|Make Participant/i);
      const transferButtons = screen.queryAllByTitle("Transfer Moderator Role");

      expect(toggleButtons.length).toBe(0);
      expect(transferButtons.length).toBe(0);
    });

    it("should not show moderator actions on current user's row", () => {
      renderParticipantList({
        participants: mockParticipants,
        currentSocketId: "socket1", // Alice is moderator
        isModerator: true,
      });

      // Alice shouldn't have toggle/transfer buttons on her own row
      // Only Bob and Charlie should have them
      const toggleButtons = screen.getAllByTitle(/Make Observer|Make Participant/i);
      expect(toggleButtons.length).toBe(2); // Only for Bob and Charlie
    });
  });

  describe("Revealed Estimates", () => {
    it("should show estimate values when revealed", () => {
      const revealedEstimates: Record<string, EstimateValue> = {
        socket2: "5", // Bob's estimate
      };

      renderParticipantList({
        participants: mockParticipants,
        revealed: true,
        revealedEstimates,
      });

      // Bob's estimate should be shown via aria-label
      const bobEstimate = screen.getByLabelText("Voted: 5");
      expect(bobEstimate).toBeDefined();
    });

    it("should show observer indicator even when revealed", () => {
      const revealedEstimates: Record<string, EstimateValue> = {
        socket2: "5",
      };

      renderParticipantList({
        participants: mockParticipants,
        revealed: true,
        revealedEstimates,
      });

      // Charlie is observer, should still show Observer aria-label
      const observerStatus = screen.getByLabelText("Observer");
      expect(observerStatus).toBeDefined();
    });
  });
});
