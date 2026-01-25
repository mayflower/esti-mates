// frontend/src/contexts/SessionContext.tsx
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import type { Participant } from "../types/types";
import { useNotification } from "./NotificationContext";

interface SessionState {
  sessionId: string | null;
  participants: Participant[];
  isModerator: boolean;
  currentEstimate: number | null;
  roundRevealed: boolean;
  revealedEstimates: Record<string, number> | null;
  average: number | null;
  currentSocketId: string | null;
}

interface SessionContextType extends SessionState {
  createSession: (name: string) => void;
  joinSession: (sessionId: string, name: string) => void;
  submitEstimate: (estimate: number) => void;
  revealCards: () => void;
  newRound: () => void;
  transferModerator: (targetSocketId: string) => void;
  toggleObserver: (targetSocketId?: string) => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

interface Props {
  children: React.ReactNode;
  socket: Socket | null;
}

export function SessionProvider({ children, socket }: Props) {
  const { dialog } = useNotification();
  const [state, setState] = useState<SessionState>({
    sessionId: null,
    participants: [],
    isModerator: false,
    currentEstimate: null,
    roundRevealed: false,
    revealedEstimates: null,
    average: null,
    currentSocketId: socket?.id || null,
  });

  // Update currentSocketId when socket changes
  useEffect(() => {
    setState((prev) => ({ ...prev, currentSocketId: socket?.id ?? null }));
  }, [socket?.id]);

  // Event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("session_created", (data) => {
      setState((prev) => ({
        ...prev,
        sessionId: data.sessionId,
        participants: [data.moderator],
        isModerator: true,
      }));
    });

    socket.on("joined_session", (data) => {
      setState((prev) => ({
        ...prev,
        participants: data.participants,
        isModerator: data.isModerator,
      }));
    });

    socket.on("participant_joined", (data) => {
      setState((prev) => ({
        ...prev,
        participants: [...prev.participants, data.participant],
      }));
    });

    socket.on("participant_left", (data) => {
      setState((prev) => ({
        ...prev,
        participants: prev.participants.filter((p) => p.socketId !== data.socketId),
      }));
    });

    socket.on("estimate_submitted", (data) => {
      setState((prev) => ({
        ...prev,
        participants: prev.participants.map((p) =>
          p.socketId === data.socketId ? { ...p, currentEstimate: -999 } : p
        ),
      }));
    });

    socket.on("cards_revealed", (data) => {
      setState((prev) => ({
        ...prev,
        roundRevealed: true,
        revealedEstimates: data.estimates,
        average: data.average,
      }));
    });

    socket.on("round_reset", () => {
      setState((prev) => ({
        ...prev,
        currentEstimate: null,
        roundRevealed: false,
        revealedEstimates: null,
        average: null,
        participants: prev.participants.map((p) => ({ ...p, currentEstimate: null })),
      }));
    });

    socket.on("moderator_transferred", (data) => {
      setState((prev) => ({
        ...prev,
        isModerator: socket.id === data.newModeratorSocketId,
        participants: prev.participants.map((p) => ({
          ...p,
          isModerator: p.socketId === data.newModeratorSocketId,
        })),
      }));
    });

    socket.on("observer_toggled", (data) => {
      setState((prev) => ({
        ...prev,
        participants: prev.participants.map((p) =>
          p.socketId === data.socketId ? { ...p, isObserver: data.isObserver } : p
        ),
      }));
    });

    socket.on("error", (data) => {
      console.error("Socket error:", data.message);
      dialog.error(data.message);
    });

    return () => {
      socket.off("session_created");
      socket.off("joined_session");
      socket.off("participant_joined");
      socket.off("participant_left");
      socket.off("estimate_submitted");
      socket.off("cards_revealed");
      socket.off("round_reset");
      socket.off("moderator_transferred");
      socket.off("observer_toggled");
      socket.off("error");
    };
  }, [socket]);

  // Actions
  const createSession = useCallback(
    (name: string) => {
      if (!socket) return;
      socket.emit("create_session", { name });
    },
    [socket]
  );

  const joinSession = useCallback(
    (sessionId: string, name: string) => {
      if (!socket) return;
      socket.emit("join_session", { sessionId, name });
      setState((prev) => ({ ...prev, sessionId }));
    },
    [socket]
  );

  const submitEstimate = useCallback(
    (estimate: number) => {
      if (!socket) return;
      socket.emit("submit_estimate", { estimate });
      setState((prev) => ({ ...prev, currentEstimate: estimate }));
    },
    [socket]
  );

  const revealCards = useCallback(() => {
    if (!socket) return;
    socket.emit("reveal_cards");
  }, [socket]);

  const newRound = useCallback(() => {
    if (!socket) return;
    socket.emit("new_round");
  }, [socket]);

  const transferModerator = useCallback(
    (targetSocketId: string) => {
      if (!socket) return;
      socket.emit("transfer_moderator", { targetSocketId });
    },
    [socket]
  );

  const toggleObserver = useCallback(
    (targetSocketId?: string) => {
      if (!socket) return;
      socket.emit("toggle_observer", { targetSocketId });
    },
    [socket]
  );

  const value: SessionContextType = {
    ...state,
    createSession,
    joinSession,
    submitEstimate,
    revealCards,
    newRound,
    transferModerator,
    toggleObserver,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
