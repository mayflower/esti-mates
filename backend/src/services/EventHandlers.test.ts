import type { Socket } from "socket.io";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventHandlers } from "./EventHandlers";
import { SessionService } from "./SessionService";

type MockSocket = {
  id: string;
  join: ReturnType<typeof vi.fn>;
  emit: ReturnType<typeof vi.fn>;
  to?: ReturnType<typeof vi.fn>;
};

type MockIo = {
  to: ReturnType<typeof vi.fn>;
  emit: ReturnType<typeof vi.fn>;
};

describe("EventHandlers", () => {
  let sessionService: SessionService;
  let handlers: EventHandlers;
  let mockSocket: MockSocket;
  let mockIo: MockIo;

  beforeEach(() => {
    sessionService = new SessionService();
    mockSocket = {
      id: "socket123",
      join: vi.fn(),
      emit: vi.fn(),
    };
    mockIo = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };
    handlers = new EventHandlers(sessionService, mockIo);
  });

  describe("handleCreateSession", () => {
    it("should create session and emit session_created event", () => {
      handlers.handleCreateSession(mockSocket, { name: "Alice" });

      expect(mockSocket.join).toHaveBeenCalledWith(expect.any(String));
      expect(mockSocket.emit).toHaveBeenCalledWith(
        "session_created",
        expect.objectContaining({
          sessionId: expect.any(String),
          moderator: expect.objectContaining({
            name: "Alice",
            isModerator: true,
          }),
        })
      );
    });

    it("should emit error if name is empty", () => {
      handlers.handleCreateSession(mockSocket, { name: "" });

      expect(mockSocket.emit).toHaveBeenCalledWith("error", {
        message: "Name is required",
      });
    });
  });

  describe("handleJoinSession", () => {
    it("should join existing session and emit events", () => {
      // Create session first
      handlers.handleCreateSession(mockSocket, { name: "Alice" });
      const sessionId = mockSocket.emit.mock.calls[0][1].sessionId;

      // Join with new socket
      const mockSocket2 = {
        id: "socket456",
        join: vi.fn(),
        emit: vi.fn(),
        to: vi.fn().mockReturnThis(),
      };

      handlers.handleJoinSession(mockSocket2 as Socket, {
        sessionId,
        name: "Bob",
      });

      expect(mockSocket2.join).toHaveBeenCalledWith(sessionId);
      expect(mockSocket2.emit).toHaveBeenCalledWith(
        "joined_session",
        expect.objectContaining({
          participants: expect.any(Array),
          isModerator: false,
        })
      );
      expect(mockSocket2.to).toHaveBeenCalledWith(sessionId);
      expect(mockSocket2.to(sessionId).emit).toHaveBeenCalledWith(
        "participant_joined",
        expect.objectContaining({
          participant: expect.objectContaining({ name: "Bob" }),
        })
      );
    });

    it("should emit error if session not found", () => {
      handlers.handleJoinSession(mockSocket, {
        sessionId: "INVALID",
        name: "Bob",
      });

      expect(mockSocket.emit).toHaveBeenCalledWith("error", {
        message: "Session not found",
      });
    });
  });
});
