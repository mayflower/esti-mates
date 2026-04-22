// frontend/src/App.tsx
import React from "react";
import { FormattedMessage } from 'react-intl';
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { LandingPage } from "./components/LandingPage";
import { BrandingProvider } from "./contexts/BrandingContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { SessionProvider } from "./contexts/SessionContext";
import { useSession } from "./contexts/SessionContext";
import { useSocket } from "./hooks/useSocket";
import { AppIntlProvider } from './i18n';
import type { CardDeck } from "./types/types";
import { SessionPage } from "./pages/SessionPage";

function LandingPageWrapper() {
  const navigate = useNavigate();
  const { createSession, sessionId } = useSession();
  const [creatorName, setCreatorName] = React.useState<string | null>(null);

  const handleCreateSession = (name: string, cardDeck: CardDeck) => {
    setCreatorName(name);
    createSession(name, cardDeck);
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
      <AppIntlProvider>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <FormattedMessage id="app.connecting" />
        </div>
      </AppIntlProvider>
    );
  }

  return (
    <AppIntlProvider>
      <BrandingProvider>
        <NotificationProvider>
          <SessionProvider socket={socket}>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </SessionProvider>
        </NotificationProvider>
      </BrandingProvider>
    </AppIntlProvider>
  );
}
