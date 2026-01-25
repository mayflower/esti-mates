// frontend/src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useSocket } from "./hooks/useSocket";
import { SessionProvider } from "./contexts/SessionContext";
import { BrandingProvider } from "./contexts/BrandingContext";
import { LandingPage } from "./components/LandingPage";
import { SessionPage } from "./pages/SessionPage";
import { useSession } from "./contexts/SessionContext";

function LandingPageWrapper() {
  const navigate = useNavigate();
  const { createSession } = useSession();

  const handleCreateSession = (name: string) => {
    createSession(name);
  };

  // Listen for session creation to navigate
  React.useEffect(() => {
    const { sessionId } = useSession();
    if (sessionId) {
      navigate(`/session/${sessionId}`);
    }
  }, [navigate]);

  return <LandingPage onCreateSession={handleCreateSession} />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPageWrapper />} />
      <Route path="/session/:sessionId" element={<SessionPage />} />
    </Routes>
  );
}

export function App() {
  const { socket, connected } = useSocket();

  if (!connected || !socket) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        Connecting to server...
      </div>
    );
  }

  return (
    <BrandingProvider>
      <SessionProvider socket={socket}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </SessionProvider>
    </BrandingProvider>
  );
}
