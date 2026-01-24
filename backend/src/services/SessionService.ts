// backend/src/services/SessionService.ts
import type { Participant, Session } from "../types/types";
import { generateSessionId } from "../types/types";

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
}
