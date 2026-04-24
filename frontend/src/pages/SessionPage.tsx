// frontend/src/pages/SessionPage.tsx
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { EstimationCards } from "../components/EstimationCards";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { ModeratorControls } from "../components/ModeratorControls";
import { ParticipantList } from "../components/ParticipantList";
import { ResultsView } from "../components/ResultsView";
import { useBranding } from "../contexts/BrandingContext";
import { useNotification } from "../contexts/NotificationContext";
import { useSession } from "../contexts/SessionContext";
import type { EstimateValue } from "../types/types";

const Container = styled.main`
  display: flex;
  height: 100vh;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const VisuallyHiddenH1 = styled.h1`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const Header = styled.header`
  background: ${(props) => props.theme.colors.surface};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  }
`;

const Logo = styled.img`
  height: 40px;
  cursor: pointer;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    height: 28px;
  }
`;

const SessionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.lg};

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    gap: ${(props) => props.theme.spacing.sm};
  }
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

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    font-size: 1.1rem;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: ${(props) => props.theme.spacing.lg};
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: ${(props) => props.theme.spacing.sm};
  }
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

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    font-size: 0.8rem;
    padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  }
`;

const ParticipantToggle = styled.button`
  display: none;
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  padding: ${(props) => props.theme.spacing.xs} ${(props) => props.theme.spacing.sm};
  font-size: 0.9rem;
  cursor: pointer;
  color: ${(props) => props.theme.colors.text};

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    display: flex;
    align-items: center;
    gap: ${(props) => props.theme.spacing.xs};
  }
`;

const ParticipantOverlay = styled.div<{ $visible: boolean }>`
  display: none;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    display: ${(props) => (props.$visible ? "block" : "none")};
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(0, 0, 0, 0.5);
  }
`;

const ParticipantDrawer = styled.div<{ $open: boolean }>`
  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 80vw;
    max-width: 300px;
    z-index: 201;
    transform: translateX(${(props) => (props.$open ? "0" : "-100%")});
    transition: transform 0.3s ease;
  }
`;

export function SessionPage() {
  const { sessionId: urlSessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { name: nameFromState } = (location.state as { name?: string }) || {};
  const branding = useBranding();
  const { toast, dialog } = useNotification();
  const intl = useIntl();
  const {
    sessionId,
    participants,
    isModerator,
    currentEstimate,
    roundRevealed,
    revealedEstimates,
    currentSocketId,
    cardDeck,
    joinSession,
    submitEstimate,
    revealCards,
    newRound,
    toggleObserver,
    transferModerator,
  } = useSession();

  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

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
      dialog.error(intl.formatMessage({ id: "session.nameRequired" }));
      return;
    }
    if (!urlSessionId) {
      dialog.error(intl.formatMessage({ id: "session.invalidSessionId" }), {
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
      await navigator.clipboard.writeText(`${window.location.origin}/session/${sessionId}`);
      toast.success(intl.formatMessage({ id: "session.sessionIdCopied" }));
    } catch (error) {
      console.error("Failed to copy:", error);
      dialog.error(intl.formatMessage({ id: "session.copyFailed" }, { sessionId }));
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
        <VisuallyHiddenH1>
          <FormattedMessage id="session.pageTitle" />
        </VisuallyHiddenH1>
        <JoinPrompt>
          <h2><FormattedMessage id="session.joinTitle" /></h2>
          <Input
            type="text"
            placeholder={intl.formatMessage({ id: "session.enterName" })}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleJoin()}
            maxLength={50}
          />
          <Button onClick={handleJoin}><FormattedMessage id="session.joinButton" /></Button>
        </JoinPrompt>
      </Container>
    );
  }

  return (
    <Container>
      <VisuallyHiddenH1>
        <FormattedMessage id="session.pageTitle" />
      </VisuallyHiddenH1>
      <ParticipantOverlay $visible={showParticipants} onClick={() => setShowParticipants(false)} />
      <ParticipantDrawer $open={showParticipants}>
        <ParticipantList
          participants={participants}
          revealed={roundRevealed}
          revealedEstimates={revealedEstimates}
          currentSocketId={currentSocketId}
          isModerator={isModerator}
          onToggleObserver={toggleObserver}
          onTransferModerator={transferModerator}
          onClose={() => setShowParticipants(false)}
        />
      </ParticipantDrawer>

      <MainArea>
        <Header>
          {branding.brandLogoUrl && <Logo src={branding.brandLogoUrl} alt={branding.brandName} />}
          <SessionInfo>
            <ParticipantToggle onClick={() => setShowParticipants(true)}>
              👥 {participants.length}
            </ParticipantToggle>
            <LanguageSwitcher />
            <SessionId onClick={handleCopySessionId} title={intl.formatMessage({ id: "session.clickToCopy" })}>
              {sessionId}
            </SessionId>
            <ObserverToggleButton
              $isObserver={isObserver}
              onClick={handleToggleObserver}
              title={isObserver
                ? intl.formatMessage({ id: "session.switchToParticipant" })
                : intl.formatMessage({ id: "session.switchToObserver" })}
            >
              {isObserver
                ? <><span>👁️ </span><FormattedMessage id="session.observerMode" /></>
                : <><span>👁️ </span><FormattedMessage id="session.participantMode" /></>}
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

          {roundRevealed && revealedEstimates && (
            <ResultsView
              estimates={revealedEstimates}
              cardDeck={cardDeck}
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
