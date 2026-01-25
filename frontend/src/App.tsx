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
  const { createSession, sessionId } = useSession();
  const [creatorName, setCreatorName] = React.useState<string | null>(null);

  const handleCreateSession = (name: string) => {
    setCreatorName(name);
    createSession(name);
  };

  // Navigate when session is created, passing name via state
  React.useEffect(() => {
    if (sessionId && creatorName) {
      navigate(`/session/${sessionId}`, {
        state: { name: creatorName, isModerator: true },
      });
    }
  }, [sessionId, creatorName, navigate]);

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
