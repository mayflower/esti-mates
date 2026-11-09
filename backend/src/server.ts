import { createServer } from "node:http";
import path from "node:path";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import { logger } from "./logger.js";
import { EventHandlers } from "./services/EventHandlers.js";
import { SessionService } from "./services/SessionService.js";

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

// Serve static frontend files in production
if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.join(process.cwd(), "frontend/dist");
  app.use(express.static(frontendDistPath));
}

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
});

const sessionService = new SessionService();
const eventHandlers = new EventHandlers(sessionService, io);

// Runtime configuration for frontend
app.get("/api/config", (_req, res) => {
  res.json({
    brandName: process.env.BRAND_NAME || "Mayflower GmbH",
    brandLogoUrl: process.env.BRAND_LOGO_URL || "/assets/logo.svg",
    brandPrimaryColor: process.env.BRAND_PRIMARY_COLOR || "#1a73e8",
    brandFooterText: process.env.BRAND_FOOTER_TEXT || "Part of Mayflower Agile Tools",
  });
});

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Metrics
app.get("/metrics", (_req, res) => {
  const stats = sessionService.getStats();
  res.status(200).json(stats);
});

// SPA fallback - serve index.html for all non-API routes in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/health") && !req.path.startsWith("/metrics")) {
      const frontendDistPath = path.join(process.cwd(), "frontend/dist");
      res.sendFile(path.join(frontendDistPath, "index.html"));
    }
  });
}

// Socket.io connection handling
io.on("connection", (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  let currentSessionId: string | null = null;

  socket.on("create_session", (payload) => {
    logger.info(
      { name: payload.name, cardDeck: payload.cardDeck },
      `create_session from ${socket.id}`
    );

    currentSessionId = eventHandlers.handleCreateSession(socket, payload) ?? currentSessionId;
  });

  socket.on("join_session", (payload) => {
    logger.info(
      { sessionId: payload.sessionId, name: payload.name },
      `join_session from ${socket.id}`
    );

    currentSessionId = eventHandlers.handleJoinSession(socket, payload) ?? currentSessionId;
  });

  socket.on("submit_estimate", (payload) => {
    if (!currentSessionId) return;
    logger.info({ estimate: payload.estimate }, `submit_estimate from ${socket.id}`);
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
    logger.info(
      {
        targetSocketId: payload.targetSocketId,
      },
      `transfer_moderator from ${socket.id}`
    );
    eventHandlers.handleTransferModerator(socket, currentSessionId, payload);
  });

  socket.on("toggle_observer", (payload) => {
    if (!currentSessionId) return;
    logger.info(
      {
        targetSocketId: payload.targetSocketId,
      },
      `toggle_observer from ${socket.id}`
    );
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
