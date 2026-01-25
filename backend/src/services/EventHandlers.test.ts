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

  describe("handleToggleObserver", () => {
    it("should toggle observer mode for self", () => {
      // Create session
      handlers.handleCreateSession(mockSocket, { name: "Alice" });
      const sessionId = mockSocket.emit.mock.calls[0][1].sessionId;

      // Toggle self to observer
      handlers.handleToggleObserver(mockSocket, sessionId, {});

      expect(mockIo.to).toHaveBeenCalledWith(sessionId);
      expect(mockIo.emit).toHaveBeenCalledWith(
        "observer_toggled",
        expect.objectContaining({
          socketId: mockSocket.id,
          isObserver: true,
        })
      );
    });

    it("should toggle observer mode for other participant (moderator)", () => {
      // Create session with Alice as moderator
      handlers.handleCreateSession(mockSocket, { name: "Alice" });
      const sessionId = mockSocket.emit.mock.calls[0][1].sessionId;

      // Bob joins
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

      // Clear previous calls
      mockIo.to.mockClear();
      mockIo.emit.mockClear();

      // Alice (moderator) toggles Bob to observer
      handlers.handleToggleObserver(mockSocket, sessionId, {
        targetSocketId: mockSocket2.id,
      });

      expect(mockIo.to).toHaveBeenCalledWith(sessionId);
      expect(mockIo.emit).toHaveBeenCalledWith(
        "observer_toggled",
        expect.objectContaining({
          socketId: mockSocket2.id,
          isObserver: true,
        })
      );
    });

    it("should emit error if non-moderator tries to toggle other participant", () => {
      // Create session with Alice as moderator
      handlers.handleCreateSession(mockSocket, { name: "Alice" });
      const sessionId = mockSocket.emit.mock.calls[0][1].sessionId;

      // Bob joins
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

      // Bob tries to toggle Alice (should fail)
      handlers.handleToggleObserver(mockSocket2 as Socket, sessionId, {
        targetSocketId: mockSocket.id,
      });

      expect(mockSocket2.emit).toHaveBeenCalledWith("error", {
        message: "Unauthorized",
      });
    });
  });

  describe("handleTransferModerator", () => {
    it("should transfer moderator role to another participant", () => {
      // Create session with Alice as moderator
      handlers.handleCreateSession(mockSocket, { name: "Alice" });
      const sessionId = mockSocket.emit.mock.calls[0][1].sessionId;

      // Bob joins
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

      // Clear previous calls
      mockIo.to.mockClear();
      mockIo.emit.mockClear();

      // Alice transfers moderator to Bob
      handlers.handleTransferModerator(mockSocket, sessionId, {
        targetSocketId: mockSocket2.id,
      });

      expect(mockIo.to).toHaveBeenCalledWith(sessionId);
      expect(mockIo.emit).toHaveBeenCalledWith("moderator_transferred", {
        newModeratorSocketId: mockSocket2.id,
      });
    });

    it("should emit error if non-moderator tries to transfer", () => {
      // Create session with Alice as moderator
      handlers.handleCreateSession(mockSocket, { name: "Alice" });
      const sessionId = mockSocket.emit.mock.calls[0][1].sessionId;

      // Bob joins
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

      // Bob tries to transfer moderator (should fail)
      handlers.handleTransferModerator(mockSocket2 as Socket, sessionId, {
        targetSocketId: "socket789",
      });

      expect(mockSocket2.emit).toHaveBeenCalledWith("error", {
        message: "Only moderator can transfer role",
      });
    });

    it("should emit error if target participant not found", () => {
      // Create session with Alice as moderator
      handlers.handleCreateSession(mockSocket, { name: "Alice" });
      const sessionId = mockSocket.emit.mock.calls[0][1].sessionId;

      // Alice tries to transfer to non-existent participant
      handlers.handleTransferModerator(mockSocket, sessionId, {
        targetSocketId: "INVALID",
      });

      expect(mockSocket.emit).toHaveBeenCalledWith("error", {
        message: "Target participant not found",
      });
    });
  });
});
