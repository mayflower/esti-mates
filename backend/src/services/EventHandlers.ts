import type { Server, Socket } from "socket.io";
import type { SessionService } from "./SessionService";

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
}
