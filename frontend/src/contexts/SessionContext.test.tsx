import { renderHook } from "@testing-library/react";
import type { Socket } from "socket.io-client";
// frontend/src/contexts/SessionContext.test.tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "styled-components";
import { createTheme } from "../styles/theme";
import { NotificationProvider } from "./NotificationContext";
import { SessionProvider, useSession } from "./SessionContext";

const theme = createTheme({ brandName: "Test", brandLogoUrl: "/logo.svg", brandPrimaryColor: "#1a73e8", brandFooterText: "Test" });

describe("SessionContext", () => {
  let mockSocket: Partial<Socket>;

  beforeEach(() => {
    mockSocket = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    };
  });

  it("should provide initial state", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={theme}>
        <NotificationProvider>
          <SessionProvider socket={mockSocket as Socket}>{children}</SessionProvider>
        </NotificationProvider>
      </ThemeProvider>
    );

    const { result } = renderHook(() => useSession(), { wrapper });

    expect(result.current.sessionId).toBeNull();
    expect(result.current.participants).toEqual([]);
    expect(result.current.isModerator).toBe(false);
  });

  it("should have toggleObserver function", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={theme}>
        <NotificationProvider>
          <SessionProvider socket={mockSocket as Socket}>{children}</SessionProvider>
        </NotificationProvider>
      </ThemeProvider>
    );

    const { result } = renderHook(() => useSession(), { wrapper });

    expect(typeof result.current.toggleObserver).toBe("function");
  });

  it("should have transferModerator function", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={theme}>
        <NotificationProvider>
          <SessionProvider socket={mockSocket as Socket}>{children}</SessionProvider>
        </NotificationProvider>
      </ThemeProvider>
    );

    const { result } = renderHook(() => useSession(), { wrapper });

    expect(typeof result.current.transferModerator).toBe("function");
  });

  it("should emit toggle_observer event when toggleObserver is called", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={theme}>
        <NotificationProvider>
          <SessionProvider socket={mockSocket as Socket}>{children}</SessionProvider>
        </NotificationProvider>
      </ThemeProvider>
    );

    const { result } = renderHook(() => useSession(), { wrapper });

    result.current.toggleObserver("socket123");

    expect(mockSocket.emit).toHaveBeenCalledWith("toggle_observer", {
      targetSocketId: "socket123",
    });
  });

  it("should emit transfer_moderator event when transferModerator is called", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ThemeProvider theme={theme}>
        <NotificationProvider>
          <SessionProvider socket={mockSocket as Socket}>{children}</SessionProvider>
        </NotificationProvider>
      </ThemeProvider>
    );

    const { result } = renderHook(() => useSession(), { wrapper });

    result.current.transferModerator("socket123");

    expect(mockSocket.emit).toHaveBeenCalledWith("transfer_moderator", {
      targetSocketId: "socket123",
    });
  });
});
