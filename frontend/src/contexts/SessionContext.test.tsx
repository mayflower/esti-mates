import { renderHook } from "@testing-library/react";
import type { Socket } from "socket.io-client";
// frontend/src/contexts/SessionContext.test.tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessionProvider, useSession } from "./SessionContext";

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
      <SessionProvider socket={mockSocket as Socket}>{children}</SessionProvider>
    );

    const { result } = renderHook(() => useSession(), { wrapper });

    expect(result.current.sessionId).toBeNull();
    expect(result.current.participants).toEqual([]);
    expect(result.current.isModerator).toBe(false);
  });

  // More tests would require proper socket mocking
});
