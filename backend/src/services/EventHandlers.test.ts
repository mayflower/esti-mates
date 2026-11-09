import type { Server, Socket } from "socket.io";
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

  function createMockSocket(id: string) {
    const roomEmit = vi.fn();
    return {
      id,
      join: vi.fn(),
      emit: vi.fn(),
      to: vi.fn().mockReturnValue({ emit: roomEmit }),
      roomEmit,
    };
  }

  function createSessionAs(socket: MockSocket, name: string, cardDeck?: string): string {
    const sessionId = handlers.handleCreateSession(socket as Socket, { name, cardDeck });
    if (!sessionId) throw new Error("session creation failed in test setup");
    return sessionId;
  }

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
    handlers = new EventHandlers(sessionService, mockIo as unknown as Server);
  });

  describe("handleCreateSession", () => {
    it("should create session and emit session_created event", () => {
      handlers.handleCreateSession(mockSocket as Socket, { name: "Alice" });

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

    it("should return the session id and join the socket to that room", () => {
      const sessionId = handlers.handleCreateSession(mockSocket as Socket, { name: "Alice" });

      expect(sessionId).toEqual(expect.any(String));
      expect(mockSocket.join).toHaveBeenCalledWith(sessionId);
      expect(mockSocket.emit.mock.calls[0][1].sessionId).toBe(sessionId);
      expect(sessionService.getSession(sessionId as string)).toBeDefined();
    });

    it("should emit error and return null if name is empty", () => {
      const result = handlers.handleCreateSession(mockSocket as Socket, { name: "" });

      expect(result).toBeNull();
      expect(mockSocket.emit).toHaveBeenCalledWith("error", {
        message: "Name is required",
      });
      expect(mockSocket.join).not.toHaveBeenCalled();
    });

    it("should reject a whitespace-only name without creating a session", () => {
      const result = handlers.handleCreateSession(mockSocket as Socket, { name: "   " });

      expect(result).toBeNull();
      expect(mockSocket.emit).toHaveBeenCalledTimes(1);
      expect(mockSocket.emit).toHaveBeenCalledWith("error", {
        message: "Name is required",
      });
      expect(mockSocket.join).not.toHaveBeenCalled();
    });

    it("should trim the name", () => {
      handlers.handleCreateSession(mockSocket as Socket, { name: "  Alice  " });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        "session_created",
        expect.objectContaining({
          moderator: expect.objectContaining({ name: "Alice" }),
        })
      );
    });

    it("should pass the tshirt card deck through to session and payload", () => {
      const sessionId = handlers.handleCreateSession(mockSocket as Socket, {
        name: "Alice",
        cardDeck: "tshirt",
      });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        "session_created",
        expect.objectContaining({ cardDeck: "tshirt" })
      );
      expect(sessionService.getSession(sessionId as string)?.cardDeck).toBe("tshirt");
    });

    it("should default to fibonacci when cardDeck is missing", () => {
      const sessionId = handlers.handleCreateSession(mockSocket as Socket, { name: "Alice" });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        "session_created",
        expect.objectContaining({ cardDeck: "fibonacci" })
      );
      expect(sessionService.getSession(sessionId as string)?.cardDeck).toBe("fibonacci");
    });

    it("should fall back to fibonacci for an unknown cardDeck value", () => {
      const sessionId = handlers.handleCreateSession(mockSocket as Socket, {
        name: "Alice",
        cardDeck: "bogus",
      });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        "session_created",
        expect.objectContaining({ cardDeck: "fibonacci" })
      );
      expect(sessionService.getSession(sessionId as string)?.cardDeck).toBe("fibonacci");
    });
  });

  describe("handleJoinSession", () => {
    it("should join existing session and emit events", () => {
      const sessionId = createSessionAs(mockSocket, "Alice");
      const mockSocket2 = createMockSocket("socket456");

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
      expect(mockSocket2.roomEmit).toHaveBeenCalledWith(
        "participant_joined",
        expect.objectContaining({
          participant: expect.objectContaining({ name: "Bob" }),
        })
      );
    });

    it("should return the session id on success", () => {
      const sessionId = createSessionAs(mockSocket, "Alice");
      const mockSocket2 = createMockSocket("socket456");

      const result = handlers.handleJoinSession(mockSocket2 as Socket, { sessionId, name: "Bob" });

      expect(result).toBe(sessionId);
    });

    it("should emit error and return null if session not found", () => {
      const result = handlers.handleJoinSession(mockSocket as Socket, {
        sessionId: "INVALID",
        name: "Bob",
      });

      expect(result).toBeNull();
      expect(mockSocket.emit).toHaveBeenCalledWith("error", {
        message: "Session not found",
      });
      expect(mockSocket.join).not.toHaveBeenCalled();
    });

    it("should reject an empty name without joining or broadcasting", () => {
      const sessionId = createSessionAs(mockSocket, "Alice");
      const mockSocket2 = createMockSocket("socket456");

      const result = handlers.handleJoinSession(mockSocket2 as Socket, { sessionId, name: "" });

      expect(result).toBeNull();
      expect(mockSocket2.emit).toHaveBeenCalledWith("error", { message: "Name is required" });
      expect(mockSocket2.join).not.toHaveBeenCalled();
      expect(mockSocket2.roomEmit).not.toHaveBeenCalled();
      expect(sessionService.getSession(sessionId)?.participants.has("socket456")).toBe(false);
    });

    it("should reject a whitespace-only name", () => {
      const sessionId = createSessionAs(mockSocket, "Alice");
      const mockSocket2 = createMockSocket("socket456");

      const result = handlers.handleJoinSession(mockSocket2 as Socket, { sessionId, name: "   " });

      expect(result).toBeNull();
      expect(mockSocket2.emit).toHaveBeenCalledTimes(1);
      expect(mockSocket2.emit).toHaveBeenCalledWith("error", { message: "Name is required" });
      expect(mockSocket2.join).not.toHaveBeenCalled();
    });

    it("should trim the joining name", () => {
      const sessionId = createSessionAs(mockSocket, "Alice");
      const mockSocket2 = createMockSocket("socket456");

      handlers.handleJoinSession(mockSocket2 as Socket, { sessionId, name: "  Bob  " });

      expect(mockSocket2.roomEmit).toHaveBeenCalledWith(
        "participant_joined",
        expect.objectContaining({
          participant: expect.objectContaining({ name: "Bob" }),
        })
      );
    });

    it("should carry the tshirt card deck of the session in joined_session", () => {
      const sessionId = createSessionAs(mockSocket, "Alice", "tshirt");
      const mockSocket2 = createMockSocket("socket456");

      handlers.handleJoinSession(mockSocket2 as Socket, { sessionId, name: "Bob" });

      expect(mockSocket2.emit).toHaveBeenCalledWith(
        "joined_session",
        expect.objectContaining({ cardDeck: "tshirt" })
      );
    });

    it("should carry fibonacci in joined_session for a default session", () => {
      const sessionId = createSessionAs(mockSocket, "Alice");
      const mockSocket2 = createMockSocket("socket456");

      handlers.handleJoinSession(mockSocket2 as Socket, { sessionId, name: "Bob" });

      expect(mockSocket2.emit).toHaveBeenCalledWith(
        "joined_session",
        expect.objectContaining({ cardDeck: "fibonacci" })
      );
    });
  });

  describe("handleToggleObserver", () => {
    it("should toggle observer mode for self", () => {
      // Create session
      const sessionId = createSessionAs(mockSocket, "Alice");

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
      const sessionId = createSessionAs(mockSocket, "Alice");

      // Bob joins
      const mockSocket2 = createMockSocket("socket456");
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
      const sessionId = createSessionAs(mockSocket, "Alice");

      // Bob joins
      const mockSocket2 = createMockSocket("socket456");
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
      const sessionId = createSessionAs(mockSocket, "Alice");

      // Bob joins
      const mockSocket2 = createMockSocket("socket456");
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
      const sessionId = createSessionAs(mockSocket, "Alice");

      // Bob joins
      const mockSocket2 = createMockSocket("socket456");
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
      const sessionId = createSessionAs(mockSocket, "Alice");

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
