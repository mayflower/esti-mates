import { createServer } from "node:http";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import { logger } from "./logger";
import { EventHandlers } from "./services/EventHandlers";
import { SessionService } from "./services/SessionService";

const app = express();
const httpServer = createServer(app);

// CORS for development
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
});

const sessionService = new SessionService();
const eventHandlers = new EventHandlers(sessionService, io);

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Metrics
app.get("/metrics", (_req, res) => {
  const stats = sessionService.getStats();
  res.status(200).json(stats);
});

// Socket.io connection handling
io.on("connection", (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  let currentSessionId: string | null = null;

  socket.on("create_session", (payload) => {
    logger.info(`create_session from ${socket.id}`, { name: payload.name });

    if (!payload.name || payload.name.trim() === "") {
      socket.emit("error", { message: "Name is required" });
      return;
    }

    const result = sessionService.createSession(socket.id, payload.name.trim());
    currentSessionId = result.sessionId;

    socket.join(result.sessionId);
    socket.emit("session_created", {
      sessionId: result.sessionId,
      moderator: result.moderator,
    });
  });

  socket.on("join_session", (payload) => {
    logger.info(`join_session from ${socket.id}`, {
      sessionId: payload.sessionId,
      name: payload.name,
    });

    if (!payload.name || payload.name.trim() === "") {
      socket.emit("error", { message: "Name is required" });
      return;
    }

    const result = sessionService.joinSession(payload.sessionId, socket.id, payload.name.trim());

    if (!result.success) {
      socket.emit("error", { message: result.error });
      return;
    }

    currentSessionId = payload.sessionId;
    socket.join(payload.sessionId);

    socket.emit("joined_session", {
      participants: result.participants,
      isModerator: result.participant?.isModerator,
    });

    socket.to(payload.sessionId).emit("participant_joined", {
      participant: result.participant,
    });
  });

  socket.on("submit_estimate", (payload) => {
    if (!currentSessionId) return;
    logger.info(`submit_estimate from ${socket.id}`, { estimate: payload.estimate });
    eventHandlers.handleSubmitEstimate(socket, currentSessionId, payload);
  });

  socket.on("reveal_cards", () => {
    if (!currentSessionId) return;
    logger.info(`reveal_cards from ${socket.id}`);
    eventHandlers.handleRevealCards(socket, currentSessionId);
  });

  socket.on("new_round", () => {
    if (!currentSessionId) return;
    logger.info(`new_round from ${socket.id}`);
    eventHandlers.handleNewRound(socket, currentSessionId);
  });

  socket.on("transfer_moderator", (payload) => {
    if (!currentSessionId) return;
    logger.info(`transfer_moderator from ${socket.id}`, {
      targetSocketId: payload.targetSocketId,
    });
    eventHandlers.handleTransferModerator(socket, currentSessionId, payload);
  });

  socket.on("toggle_observer", (payload) => {
    if (!currentSessionId) return;
    logger.info(`toggle_observer from ${socket.id}`, {
      targetSocketId: payload.targetSocketId,
    });
    eventHandlers.handleToggleObserver(socket, currentSessionId, payload);
  });

  socket.on("disconnect", () => {
    logger.info(`Client disconnected: ${socket.id}`);
    eventHandlers.handleDisconnect(socket, currentSessionId);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Cleanup expired sessions every 15 minutes
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000;

setInterval(() => {
  const cleaned = sessionService.cleanupExpiredSessions();
  if (cleaned > 0) {
    logger.info(`Cleaned up ${cleaned} expired sessions`);
  }
}, CLEANUP_INTERVAL_MS);
