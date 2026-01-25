// frontend/src/hooks/useSocket.ts
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
    });

    const handleConnect = () => {
      console.log("Connected to server");
      setConnected(true);
    };

    const handleDisconnect = () => {
      console.log("Disconnected from server");
      setConnected(false);
    };

    newSocket.on("connect", handleConnect);
    newSocket.on("disconnect", handleDisconnect);

    setSocket(newSocket);

    return () => {
      newSocket.off("connect", handleConnect);
      newSocket.off("disconnect", handleDisconnect);
      newSocket.close();
    };
  }, []);

  return { socket, connected };
}
