// backend/src/services/SessionService.test.ts
import { describe, it, expect, beforeEach } from "vitest";
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
  });
});
