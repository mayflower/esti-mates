// frontend/src/pages/SessionPage.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { EstimationCards } from "../components/EstimationCards";
import { ModeratorControls } from "../components/ModeratorControls";
import { ParticipantList } from "../components/ParticipantList";
import { ResultsView } from "../components/ResultsView";
import { useBranding } from "../contexts/BrandingContext";
import { useNotification } from "../contexts/NotificationContext";
import { useSession } from "../contexts/SessionContext";
import type { EstimateValue } from "../types/types";

const Container = styled.div`
  display: flex;
  height: 100vh;
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const Header = styled.header`
  background: ${(props) => props.theme.colors.surface};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.img`
  height: 40px;
  cursor: pointer;
`;

const SessionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.lg};
`;

const SessionId = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.primary};
  font-family: monospace;
  cursor: pointer;
  user-select: all;

  &:hover {
    opacity: 0.8;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: ${(props) => props.theme.spacing.lg};
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const JoinPrompt = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.md};
  max-width: 400px;
  margin: 0 auto;
`;

const Input = styled.input`
  width: 100%;
  padding: ${(props) => props.theme.spacing.md};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const Button = styled.button`
  background: ${(props) => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.md};
  padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.lg};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;

  &:hover {
    background: ${(props) => props.theme.colors.primaryHover};
  }
`;

const ObserverToggleButton = styled.button<{ $isObserver: boolean }>`
  background: ${(props) => (props.$isObserver ? props.theme.colors.warning : props.theme.colors.surface)};
  color: ${(props) => (props.$isObserver ? "white" : props.theme.colors.text)};
  border: 1px solid ${(props) => (props.$isObserver ? props.theme.colors.warning : props.theme.colors.border)};
  border-radius: ${(props) => props.theme.borderRadius.md};
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};

  &:hover {
    opacity: 0.8;
  }
`;

export function SessionPage() {
  const { sessionId: urlSessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { name: nameFromState } = (location.state as { name?: string }) || {};
  const branding = useBranding();
  const { toast, dialog } = useNotification();
  const {
    sessionId,
    participants,
    isModerator,
    currentEstimate,
    roundRevealed,
    revealedEstimates,
    average,
    currentSocketId,
    joinSession,
    submitEstimate,
    revealCards,
    newRound,
    toggleObserver,
    transferModerator,
  } = useSession();

  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (sessionId) {
      setJoined(true);
    }
  }, [sessionId]);

  useEffect(() => {
    // Auto-join if name was passed from Landing Page (Create flow)
    if (nameFromState && urlSessionId && !joined) {
      joinSession(urlSessionId, nameFromState);
    }
  }, [nameFromState, urlSessionId, joined, joinSession]);

  const handleJoin = () => {
    if (!name.trim()) {
      dialog.error("Please enter your name");
      return;
    }
    if (!urlSessionId) {
      dialog.error("Invalid session ID", {
        onClose: () => navigate('/'),
      });
      return;
    }
    joinSession(urlSessionId, name.trim());
  };

  const handleEstimate = (value: EstimateValue) => {
    submitEstimate(value);
  };

  const handleCopySessionId = async () => {
    if (!sessionId) return;

    try {
      await navigator.clipboard.writeText(sessionId);
      toast.success("Session ID copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      dialog.error(`Failed to copy. Session ID: ${sessionId}`);
    }
  };

  const handleToggleObserver = () => {
    toggleObserver(); // No targetSocketId = toggle self
  };

  const currentParticipant = participants.find((p) => p.socketId === currentSocketId);
  const isObserver = currentParticipant?.isObserver || false;
  const hasEstimates = participants.some((p) => p.currentEstimate !== null);

  if (!joined && !nameFromState) {
    return (
      <Container>
        <JoinPrompt>
          <h2>Join Session</h2>
          <Input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleJoin()}
            maxLength={50}
          />
          <Button onClick={handleJoin}>Join</Button>
        </JoinPrompt>
      </Container>
    );
  }

  return (
    <Container>
      <ParticipantList
        participants={participants}
        revealed={roundRevealed}
        revealedEstimates={revealedEstimates as Record<string, EstimateValue> | null}
        currentSocketId={currentSocketId}
        isModerator={isModerator}
        onToggleObserver={toggleObserver}
        onTransferModerator={transferModerator}
      />

      <MainArea>
        <Header>
          {branding.brandLogoUrl && <Logo src={branding.brandLogoUrl} alt={branding.brandName} />}
          <SessionInfo>
            <SessionId onClick={handleCopySessionId} title="Click to copy">
              {sessionId}
            </SessionId>
            <ObserverToggleButton
              $isObserver={isObserver}
              onClick={handleToggleObserver}
              title={isObserver ? "Switch to Participant mode" : "Switch to Observer mode"}
            >
              👁️ {isObserver ? "Observer Mode" : "Participant Mode"}
            </ObserverToggleButton>
          </SessionInfo>
        </Header>

        <Content>
          {!roundRevealed && (
            <EstimationCards
              selectedEstimate={currentEstimate}
              onSelectEstimate={handleEstimate}
              disabled={roundRevealed}
              isObserver={isObserver}
            />
          )}

          {roundRevealed && revealedEstimates && average !== null && (
            <ResultsView
              estimates={revealedEstimates as Record<string, EstimateValue>}
              average={average}
            />
          )}
        </Content>

        {isModerator && (
          <ModeratorControls
            revealed={roundRevealed}
            hasEstimates={hasEstimates}
            onReveal={revealCards}
            onNewRound={newRound}
          />
        )}
      </MainArea>
    </Container>
  );
}
