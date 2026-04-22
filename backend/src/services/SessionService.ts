// backend/src/services/SessionService.ts
import type { CardDeck, EstimateValue, Participant, Session } from "../types/types.js";
import { VALID_ESTIMATES, deduplicateName, generateSessionId } from "../types/types.js";

export class SessionService {
  private sessions: Map<string, Session> = new Map();

  createSession(
    moderatorSocketId: string,
    moderatorName: string,
    cardDeck: CardDeck = "fibonacci"
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
      cardDeck,
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
    | { success: true; participant: Participant; participants: Participant[]; replacedStaleParticipant?: boolean }
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

    // If socket ID already exists, remove stale participant (e.g., from hot-reload, reconnect, or page refresh)
    let replacedStaleParticipant = false;
    if (session.participants.has(socketId)) {
      session.participants.delete(socketId);
      session.currentRound.estimates.delete(socketId);
      replacedStaleParticipant = true;
    }

    const existingNames = Array.from(session.participants.values()).map((p) => p.name);
    const uniqueName = deduplicateName(name, existingNames);

    // Preserve moderator status if this socket is the session moderator
    const isModerator = session.moderatorSocketId === socketId;

    const participant: Participant = {
      socketId,
      name: uniqueName,
      isModerator,
      isObserver: false,
      currentEstimate: null,
    };

    session.participants.set(socketId, participant);
    session.lastActivity = new Date();

    const participants = Array.from(session.participants.values());

    return { success: true, participant, participants, replacedStaleParticipant };
  }

  submitEstimate(
    sessionId: string,
    socketId: string,
    estimate: EstimateValue
  ): { success: boolean; error?: string } {
    if (!sessionId?.trim()) {
      return { success: false, error: "Invalid session ID" };
    }
    if (!socketId?.trim()) {
      return { success: false, error: "Invalid socket ID" };
    }

    const session = this.sessions.get(sessionId);

    if (!session) {
      return { success: false, error: "Session not found" };
    }

    if (!VALID_ESTIMATES[session.cardDeck].includes(estimate)) {
      return { success: false, error: "Invalid estimate value" };
    }

    const participant = session.participants.get(socketId);

    if (!participant) {
      return { success: false, error: "Participant not found" };
    }

    if (participant.isObserver) {
      return { success: false, error: "Observers cannot estimate" };
    }

    if (session.currentRound.revealed) {
      return { success: false, error: "Round already revealed" };
    }

    session.currentRound.estimates.set(socketId, estimate);
    participant.currentEstimate = estimate;
    session.lastActivity = new Date();

    return { success: true };
  }

  revealCards(
    sessionId: string,
    moderatorSocketId: string
  ): {
    success: boolean;
    error?: string;
    estimates?: Map<string, EstimateValue>;
  } {
    if (!sessionId?.trim()) {
      return { success: false, error: "Invalid session ID" };
    }
    if (!moderatorSocketId?.trim()) {
      return { success: false, error: "Invalid moderator socket ID" };
    }

    const session = this.sessions.get(sessionId);

    if (!session) {
      return { success: false, error: "Session not found" };
    }

    if (session.moderatorSocketId !== moderatorSocketId) {
      return { success: false, error: "Only moderator can reveal" };
    }

    session.currentRound.revealed = true;
    session.lastActivity = new Date();

    return {
      success: true,
      estimates: session.currentRound.estimates,
    };
  }

  newRound(sessionId: string, moderatorSocketId: string): { success: boolean; error?: string } {
    if (!sessionId?.trim()) {
      return { success: false, error: "Invalid session ID" };
    }
    if (!moderatorSocketId?.trim()) {
      return { success: false, error: "Invalid moderator socket ID" };
    }

    const session = this.sessions.get(sessionId);

    if (!session) {
      return { success: false, error: "Session not found" };
    }

    if (session.moderatorSocketId !== moderatorSocketId) {
      return { success: false, error: "Only moderator can start new round" };
    }

    // Reset round
    session.currentRound = {
      estimates: new Map(),
      revealed: false,
    };

    // Reset participant estimates
    for (const participant of session.participants.values()) {
      participant.currentEstimate = null;
    }

    session.lastActivity = new Date();

    return { success: true };
  }

  toggleObserver(
    sessionId: string,
    requesterSocketId: string,
    targetSocketId: string
  ): { success: boolean; error?: string } {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return { success: false, error: "Session not found" };
    }

    const participant = session.participants.get(targetSocketId);

    if (!participant) {
      return { success: false, error: "Participant not found" };
    }

    // Only moderator or self can toggle
    if (requesterSocketId !== session.moderatorSocketId && requesterSocketId !== targetSocketId) {
      return { success: false, error: "Unauthorized" };
    }

    participant.isObserver = !participant.isObserver;
    session.lastActivity = new Date();

    return { success: true };
  }

  removeParticipant(
    sessionId: string,
    socketId: string
  ): { success: boolean; newModeratorSocketId?: string; sessionDeleted?: boolean; error?: string } {
    if (!sessionId?.trim()) {
      return { success: false, error: "Invalid session ID" };
    }
    if (!socketId?.trim()) {
      return { success: false, error: "Invalid socket ID" };
    }

    const session = this.sessions.get(sessionId);

    if (!session) {
      return { success: false, error: "Session not found" };
    }

    // Remove participant
    session.participants.delete(socketId);

    // Remove their estimate
    session.currentRound.estimates.delete(socketId);

    // If no participants left, delete the session
    if (session.participants.size === 0) {
      this.sessions.delete(sessionId);
      return { success: true, sessionDeleted: true };
    }

    // If moderator left, transfer to oldest remaining participant
    if (session.moderatorSocketId === socketId) {
      const newModeratorSocketId = session.participants.keys().next().value as string;
      session.moderatorSocketId = newModeratorSocketId;

      const newModerator = session.participants.get(newModeratorSocketId);
      if (newModerator) {
        newModerator.isModerator = true;
      }

      session.lastActivity = new Date();
      return { success: true, newModeratorSocketId };
    }

    session.lastActivity = new Date();
    return { success: true };
  }

  transferModerator(
    sessionId: string,
    currentModeratorSocketId: string,
    targetSocketId: string
  ): { success: boolean; error?: string } {
    if (!sessionId?.trim()) {
      return { success: false, error: "Invalid session ID" };
    }
    if (!currentModeratorSocketId?.trim()) {
      return { success: false, error: "Invalid moderator socket ID" };
    }
    if (!targetSocketId?.trim()) {
      return { success: false, error: "Invalid target socket ID" };
    }

    const session = this.sessions.get(sessionId);

    if (!session) {
      return { success: false, error: "Session not found" };
    }

    // Verify current requester is moderator
    if (session.moderatorSocketId !== currentModeratorSocketId) {
      return { success: false, error: "Only moderator can transfer role" };
    }

    // Verify target participant exists
    const targetParticipant = session.participants.get(targetSocketId);
    if (!targetParticipant) {
      return { success: false, error: "Target participant not found" };
    }

    // Remove isModerator from current moderator
    const currentModerator = session.participants.get(currentModeratorSocketId);
    if (currentModerator) {
      currentModerator.isModerator = false;
    }

    // Set isModerator on target
    targetParticipant.isModerator = true;

    // Update session moderator
    session.moderatorSocketId = targetSocketId;

    // Update lastActivity
    session.lastActivity = new Date();

    return { success: true };
  }

  getStats(): { sessionCount: number; totalParticipants: number } {
    let totalUsers = 0;
    for (const session of this.sessions.values()) {
      totalUsers += session.participants.size;
    }

    return {
      sessionCount: this.sessions.size,
      totalParticipants: totalUsers,
    };
  }

  cleanupExpiredSessions(): number {
    const now = new Date();
    const TTL_MS = 4 * 60 * 60 * 1000; // 4 hours
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      const age = now.getTime() - session.lastActivity.getTime();
      if (age > TTL_MS) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }

    return cleaned;
  }
}
