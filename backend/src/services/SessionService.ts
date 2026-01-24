// backend/src/services/SessionService.ts
import type { Participant, Session } from "../types/types";
import { generateSessionId, deduplicateName } from "../types/types";

export class SessionService {
  private sessions: Map<string, Session> = new Map();

  createSession(
    moderatorSocketId: string,
    moderatorName: string
  ): { sessionId: string; moderator: Participant } {
    if (!moderatorSocketId?.trim()) {
      throw new Error("Invalid moderator socket ID");
    }
    if (!moderatorName?.trim()) {
      throw new Error("Invalid moderator name");
    }

    let sessionId: string;
    do {
      sessionId = generateSessionId();
    } while (this.sessions.has(sessionId));

    const moderator: Participant = {
      socketId: moderatorSocketId,
      name: moderatorName,
      isModerator: true,
      isObserver: false,
      currentEstimate: null,
    };

    const session: Session = {
      id: sessionId,
      moderatorSocketId,
      participants: new Map([[moderatorSocketId, moderator]]),
      currentRound: {
        estimates: new Map(),
        revealed: false,
      },
      createdAt: new Date(),
      lastActivity: new Date(),
    };

    this.sessions.set(sessionId, session);

    return { sessionId, moderator };
  }

  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  joinSession(
    sessionId: string,
    socketId: string,
    name: string
  ):
    | { success: true; participant: Participant; participants: Participant[] }
    | { success: false; error: string } {
    if (!sessionId?.trim()) {
      return { success: false, error: "Invalid session ID" };
    }
    if (!socketId?.trim()) {
      return { success: false, error: "Invalid socket ID" };
    }
    if (!name?.trim()) {
      return { success: false, error: "Invalid participant name" };
    }

    const session = this.sessions.get(sessionId);

    if (!session) {
      return { success: false, error: "Session not found" };
    }

    const existingNames = Array.from(session.participants.values()).map((p) => p.name);
    const uniqueName = deduplicateName(name, existingNames);

    const participant: Participant = {
      socketId,
      name: uniqueName,
      isModerator: false,
      isObserver: false,
      currentEstimate: null,
    };

    session.participants.set(socketId, participant);
    session.lastActivity = new Date();

    const participants = Array.from(session.participants.values());

    return { success: true, participant, participants };
  }
}
