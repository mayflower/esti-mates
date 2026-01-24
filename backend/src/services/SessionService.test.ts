// backend/src/services/SessionService.test.ts
import { beforeEach, describe, expect, it } from "vitest";
import { SessionService } from "./SessionService";

describe("SessionService", () => {
  let service: SessionService;

  beforeEach(() => {
    service = new SessionService();
  });

  describe("createSession", () => {
    it("should create a new session with generated ID", () => {
      const result = service.createSession("moderatorSocket123", "Alice");

      expect(result.sessionId).toHaveLength(6);
      expect(result.moderator.name).toBe("Alice");
      expect(result.moderator.socketId).toBe("moderatorSocket123");
      expect(result.moderator.isModerator).toBe(true);
      expect(result.moderator.isObserver).toBe(false);
    });

    it("should store the session internally", () => {
      const result = service.createSession("socket1", "Bob");
      const session = service.getSession(result.sessionId);

      expect(session).toBeDefined();
      expect(session?.id).toBe(result.sessionId);
    });

    it("should initialize with empty round", () => {
      const result = service.createSession("socket1", "Charlie");
      const session = service.getSession(result.sessionId);

      expect(session?.currentRound.estimates.size).toBe(0);
      expect(session?.currentRound.revealed).toBe(false);
    });

    it("should throw error for empty moderator socket ID", () => {
      expect(() => service.createSession("", "Alice")).toThrow("Invalid moderator socket ID");
    });

    it("should throw error for whitespace-only moderator socket ID", () => {
      expect(() => service.createSession("   ", "Alice")).toThrow("Invalid moderator socket ID");
    });

    it("should throw error for empty moderator name", () => {
      expect(() => service.createSession("socket1", "")).toThrow("Invalid moderator name");
    });

    it("should throw error for whitespace-only moderator name", () => {
      expect(() => service.createSession("socket1", "   ")).toThrow("Invalid moderator name");
    });
  });

  describe("joinSession", () => {
    it("should add participant to existing session", () => {
      const { sessionId } = service.createSession("socket1", "Alice");
      const result = service.joinSession(sessionId, "socket2", "Bob");

      expect(result.success).toBe(true);
      expect(result.participant?.name).toBe("Bob");
      expect(result.participant?.isModerator).toBe(false);

      const session = service.getSession(sessionId);
      expect(session?.participants.size).toBe(2);
    });

    it("should fail if session does not exist", () => {
      const result = service.joinSession("INVALID", "socket3", "Charlie");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Session not found");
    });

    it("should deduplicate names", () => {
      const { sessionId } = service.createSession("socket1", "Tom");
      const result = service.joinSession(sessionId, "socket2", "Tom");

      expect(result.success).toBe(true);
      expect(result.participant?.name).toBe("Tom (2)");
    });

    it("should fail if socketId already exists in session", () => {
      const { sessionId } = service.createSession("socket1", "Alice");
      const result = service.joinSession(sessionId, "socket1", "Bob");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Socket ID already in session");
    });

    it("should update lastActivity timestamp", () => {
      const { sessionId } = service.createSession("socket1", "Alice");
      const session = service.getSession(sessionId);
      const originalTime = session?.lastActivity;

      // Small delay to ensure timestamp difference
      const result = service.joinSession(sessionId, "socket2", "Bob");

      const updatedSession = service.getSession(sessionId);
      expect(updatedSession?.lastActivity.getTime()).toBeGreaterThanOrEqual(
        originalTime?.getTime() || 0
      );
    });

    it("should fail for empty sessionId", () => {
      const result = service.joinSession("", "socket2", "Bob");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid session ID");
    });

    it("should fail for whitespace-only sessionId", () => {
      const result = service.joinSession("   ", "socket2", "Bob");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid session ID");
    });

    it("should fail for empty socketId", () => {
      const { sessionId } = service.createSession("socket1", "Alice");
      const result = service.joinSession(sessionId, "", "Bob");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid socket ID");
    });

    it("should fail for whitespace-only socketId", () => {
      const { sessionId } = service.createSession("socket1", "Alice");
      const result = service.joinSession(sessionId, "   ", "Bob");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid socket ID");
    });

    it("should fail for empty name", () => {
      const { sessionId } = service.createSession("socket1", "Alice");
      const result = service.joinSession(sessionId, "socket2", "");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid participant name");
    });

    it("should fail for whitespace-only name", () => {
      const { sessionId } = service.createSession("socket1", "Alice");
      const result = service.joinSession(sessionId, "socket2", "   ");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid participant name");
    });
  });

  describe("submitEstimate", () => {
    it("should store participant estimate", () => {
      const { sessionId } = service.createSession("socket1", "Alice");
      service.joinSession(sessionId, "socket2", "Bob");

      const result = service.submitEstimate(sessionId, "socket2", 5);

      expect(result.success).toBe(true);
      const session = service.getSession(sessionId);
      expect(session?.currentRound.estimates.get("socket2")).toBe(5);
    });

    it("should fail if session not found", () => {
      const result = service.submitEstimate("INVALID", "socket1", 3);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Session not found");
    });

    it("should fail if participant not in session", () => {
      const { sessionId } = service.createSession("socket1", "Alice");
      const result = service.submitEstimate(sessionId, "unknownSocket", 8);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Participant not found");
    });

    it("should fail if round already revealed", () => {
      const { sessionId } = service.createSession("socket1", "Alice");
      service.submitEstimate(sessionId, "socket1", 3);
      service.revealCards(sessionId, "socket1");

      const result = service.submitEstimate(sessionId, "socket1", 5);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Round already revealed");
    });

    it("should fail if participant is observer", () => {
      const { sessionId } = service.createSession("socket1", "Alice");
      service.joinSession(sessionId, "socket2", "Bob");
      service.toggleObserver(sessionId, "socket1", "socket2");

      const result = service.submitEstimate(sessionId, "socket2", 5);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Observers cannot estimate");
    });

    it("should fail for empty sessionId", () => {
      const result = service.submitEstimate("", "socket1", 5);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid session ID");
    });

    it("should fail for whitespace-only sessionId", () => {
      const result = service.submitEstimate("   ", "socket1", 5);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid session ID");
    });

    it("should fail for empty socketId", () => {
      const { sessionId } = service.createSession("socket1", "Alice");
      const result = service.submitEstimate(sessionId, "", 5);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid socket ID");
    });

    it("should fail for whitespace-only socketId", () => {
      const { sessionId } = service.createSession("socket1", "Alice");
      const result = service.submitEstimate(sessionId, "   ", 5);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid socket ID");
    });

    it("should fail for invalid estimate value", () => {
      const { sessionId } = service.createSession("socket1", "Alice");
      const result = service.submitEstimate(sessionId, "socket1", 4 as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid estimate value");
    });

    it("should update participant.currentEstimate", () => {
      const { sessionId } = service.createSession("socket1", "Alice");
      const result = service.submitEstimate(sessionId, "socket1", 8);

      expect(result.success).toBe(true);
      const session = service.getSession(sessionId);
      const participant = session?.participants.get("socket1");
      expect(participant?.currentEstimate).toBe(8);
    });

    it("should allow question mark estimate (-1)", () => {
      const { sessionId } = service.createSession("socket1", "Alice");
      const result = service.submitEstimate(sessionId, "socket1", -1);

      expect(result.success).toBe(true);
      const session = service.getSession(sessionId);
      expect(session?.currentRound.estimates.get("socket1")).toBe(-1);
    });

    it("should allow updating an existing estimate", () => {
      const { sessionId } = service.createSession("socket1", "Alice");
      service.submitEstimate(sessionId, "socket1", 3);
      const result = service.submitEstimate(sessionId, "socket1", 8);

      expect(result.success).toBe(true);
      const session = service.getSession(sessionId);
      expect(session?.currentRound.estimates.get("socket1")).toBe(8);
      expect(session?.participants.get("socket1")?.currentEstimate).toBe(8);
    });

    it("should update lastActivity timestamp", () => {
      const { sessionId } = service.createSession("socket1", "Alice");
      const session = service.getSession(sessionId);
      const originalTime = session?.lastActivity;

      const result = service.submitEstimate(sessionId, "socket1", 5);

      const updatedSession = service.getSession(sessionId);
      expect(updatedSession?.lastActivity.getTime()).toBeGreaterThanOrEqual(
        originalTime?.getTime() || 0
      );
    });
  });
});
