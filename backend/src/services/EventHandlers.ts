import type { Server, Socket } from "socket.io";
import type { CardDeck, EstimateValue } from "../types/types.js";
import type { SessionService } from "./SessionService.js";

export class EventHandlers {
  constructor(
    private sessionService: SessionService,
    private io: Server
  ) {}

  handleCreateSession(socket: Socket, payload: { name: string; cardDeck?: string }): string | null {
    if (!payload.name || payload.name.trim() === "") {
      socket.emit("error", { message: "Name is required" });
      return null;
    }

    const cardDeck: CardDeck = payload.cardDeck === "tshirt" ? "tshirt" : "fibonacci";

    const result = this.sessionService.createSession(socket.id, payload.name.trim(), cardDeck);

    socket.join(result.sessionId);
    socket.emit("session_created", {
      sessionId: result.sessionId,
      moderator: result.moderator,
      cardDeck,
    });

    return result.sessionId;
  }

  handleJoinSession(socket: Socket, payload: { sessionId: string; name: string }): string | null {
    if (!payload.name || payload.name.trim() === "") {
      socket.emit("error", { message: "Name is required" });
      return null;
    }

    const result = this.sessionService.joinSession(
      payload.sessionId,
      socket.id,
      payload.name.trim()
    );

    if (!result.success) {
      socket.emit("error", { message: result.error });
      return null;
    }

    const session = this.sessionService.getSession(payload.sessionId);

    socket.join(payload.sessionId);

    socket.emit("joined_session", {
      participants: result.participants,
      isModerator: result.participant?.isModerator,
      cardDeck: session?.cardDeck ?? "fibonacci",
    });

    socket.to(payload.sessionId).emit("participant_joined", {
      participant: result.participant,
    });

    return payload.sessionId;
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
    const estimatesObj: Record<string, string> = {};
    result.estimates?.forEach((value, key) => {
      estimatesObj[key] = value;
    });

    this.io.to(sessionId).emit("cards_revealed", {
      estimates: estimatesObj,
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
