import type { Server, Socket } from "socket.io";
import type { EstimateValue } from "../types/types.js";
import type { SessionService } from "./SessionService.js";

export class EventHandlers {
  constructor(
    private sessionService: SessionService,
    private io: Server
  ) {}

  handleCreateSession(socket: Socket, payload: { name: string }): void {
    const name = payload.name.trim();

    if (!name) {
      socket.emit("error", { message: "Name is required" });
      return;
    }

    const result = this.sessionService.createSession(socket.id, name);

    socket.join(result.sessionId);
    socket.emit("session_created", {
      sessionId: result.sessionId,
      moderator: result.moderator,
    });
  }

  handleJoinSession(socket: Socket, payload: { sessionId: string; name: string }): void {
    const name = payload.name.trim();

    if (!name) {
      socket.emit("error", { message: "Name is required" });
      return;
    }

    const result = this.sessionService.joinSession(payload.sessionId, socket.id, name);

    if (!result.success) {
      socket.emit("error", { message: result.error });
      return;
    }

    socket.join(payload.sessionId);
    socket.emit("joined_session", {
      participants: result.participants,
      isModerator: result.participant.isModerator,
    });

    socket.to(payload.sessionId).emit("participant_joined", {
      participant: result.participant,
    });
  }

  handleSubmitEstimate(
    socket: Socket,
    sessionId: string,
    payload: { estimate: EstimateValue }
  ): void {
    const result = this.sessionService.submitEstimate(sessionId, socket.id, payload.estimate);

    if (!result.success) {
      socket.emit("error", { message: result.error });
      return;
    }

    // Notify all participants (don't reveal the value)
    this.io.to(sessionId).emit("estimate_submitted", {
      socketId: socket.id,
    });
  }

  handleRevealCards(socket: Socket, sessionId: string): void {
    const result = this.sessionService.revealCards(sessionId, socket.id);

    if (!result.success) {
      socket.emit("error", { message: result.error });
      return;
    }

    // Convert Map to object for JSON serialization
    const estimatesObj: Record<string, number> = {};
    result.estimates?.forEach((value, key) => {
      estimatesObj[key] = value;
    });

    this.io.to(sessionId).emit("cards_revealed", {
      estimates: estimatesObj,
      average: result.average,
    });
  }

  handleNewRound(socket: Socket, sessionId: string): void {
    const result = this.sessionService.newRound(sessionId, socket.id);

    if (!result.success) {
      socket.emit("error", { message: result.error });
      return;
    }

    this.io.to(sessionId).emit("round_reset");
  }

  handleTransferModerator(
    socket: Socket,
    sessionId: string,
    payload: { targetSocketId: string }
  ): void {
    const result = this.sessionService.transferModerator(
      sessionId,
      socket.id,
      payload.targetSocketId
    );

    if (!result.success) {
      socket.emit("error", { message: result.error });
      return;
    }

    this.io.to(sessionId).emit("moderator_transferred", {
      newModeratorSocketId: payload.targetSocketId,
    });
  }

  handleToggleObserver(
    socket: Socket,
    sessionId: string,
    payload: { targetSocketId?: string }
  ): void {
    const targetSocketId = payload.targetSocketId || socket.id;

    const result = this.sessionService.toggleObserver(sessionId, socket.id, targetSocketId);

    if (!result.success) {
      socket.emit("error", { message: result.error });
      return;
    }

    const session = this.sessionService.getSession(sessionId);
    const participant = session?.participants.get(targetSocketId);

    this.io.to(sessionId).emit("observer_toggled", {
      socketId: targetSocketId,
      isObserver: participant?.isObserver || false,
    });
  }

  handleDisconnect(socket: Socket, sessionId: string | null): void {
    if (!sessionId) return;

    const result = this.sessionService.removeParticipant(sessionId, socket.id);

    if (!result.success) return;

    if (result.sessionDeleted) {
      // Session is gone, no need to notify
      return;
    }

    socket.to(sessionId).emit("participant_left", {
      socketId: socket.id,
    });

    if (result.newModeratorSocketId) {
      this.io.to(sessionId).emit("moderator_transferred", {
        newModeratorSocketId: result.newModeratorSocketId,
      });
    }
  }
}
