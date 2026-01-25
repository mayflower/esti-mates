// frontend/src/hooks/useSocket.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSocket } from "./useSocket";

// Mock socket.io-client
vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    close: vi.fn(),
  })),
}));

describe("useSocket", () => {
  it("should create socket connection on mount", () => {
    const { result } = renderHook(() => useSocket());

    expect(result.current.socket).toBeDefined();
  });

  it("should initially be disconnected", () => {
    const { result } = renderHook(() => useSocket());

    expect(result.current.connected).toBe(false);
  });

  // Note: More thorough testing would require proper socket.io mocking
  // For now, we validate that the hook structure is correct
});
