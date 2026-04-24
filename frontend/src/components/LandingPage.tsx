// frontend/src/components/LandingPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FormattedMessage, useIntl } from "react-intl";
import { useBranding } from "../contexts/BrandingContext";
import { useNotification } from "../contexts/NotificationContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { CardDeck } from "../types/types";

const Container = styled.main`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${(props) => props.theme.colors.background};
`;

const LanguageSwitcherWrapper = styled.div`
  position: absolute;
  top: ${(props) => props.theme.spacing.md};
  right: ${(props) => props.theme.spacing.md};
`;

const Logo = styled.img`
  height: 80px;
  margin-bottom: ${(props) => props.theme.spacing.xl};

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    height: 50px;
    margin-bottom: ${(props) => props.theme.spacing.md};
  }
`;

const Title = styled.h1`
  color: ${(props) => props.theme.colors.text};
  margin-bottom: ${(props) => props.theme.spacing.xl};
  font-size: 2.5rem;
  text-align: center;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    font-size: 1.75rem;
    margin-bottom: ${(props) => props.theme.spacing.md};
  }
`;

const Card = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  box-shadow: ${(props) => props.theme.shadows.md};
  padding: ${(props) => props.theme.spacing.xl};
  width: 100%;
  max-width: 500px;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: ${(props) => props.theme.spacing.md};
    max-width: calc(100% - 2rem);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: ${(props) => props.theme.spacing.md};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: 1rem;
  margin-bottom: ${(props) => props.theme.spacing.md};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const Button = styled.button`
  width: 100%;
  padding: ${(props) => props.theme.spacing.md};
  background: ${(props) => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: ${(props) => props.theme.colors.primaryHover};
  }

  &:active {
    transform: translateY(1px);
  }
`;

const DeckSelector = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const DeckButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  border: 2px solid
    ${(props) => (props.$active ? props.theme.colors.primary : props.theme.colors.border)};
  border-radius: ${(props) => props.theme.borderRadius.md};
  background: ${(props) => (props.$active ? props.theme.colors.primary : "transparent")};
  color: ${(props) => (props.$active ? "white" : props.theme.colors.text)};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const DeckLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-bottom: ${(props) => props.theme.spacing.xs};
`;

const SectionTitle = styled.h2`
  color: ${(props) => props.theme.colors.text};
  margin-bottom: ${(props) => props.theme.spacing.md};
  font-size: 1.25rem;
  text-align: center;
  font-weight: 600;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: ${(props) => props.theme.spacing.lg} 0;
  width: 100%;
  max-width: 500px;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    margin: ${(props) => props.theme.spacing.md} 0;
    max-width: calc(100% - 2rem);
  }
  color: ${(props) => props.theme.colors.textSecondary};

  &::before,
  &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
  }

  &::before {
    margin-right: ${(props) => props.theme.spacing.md};
  }

  &::after {
    margin-left: ${(props) => props.theme.spacing.md};
  }
`;

const Footer = styled.footer`
  margin-top: ${(props) => props.theme.spacing.xl};
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 0.875rem;
  text-align: center;
`;

export interface LandingPageProps {
  onCreateSession: (name: string, cardDeck: CardDeck) => void;
}

export function LandingPage({ onCreateSession }: LandingPageProps) {
  const [createName, setCreateName] = useState("");
  const [cardDeck, setCardDeck] = useState<CardDeck>("fibonacci");
  const [joinSessionId, setJoinSessionId] = useState("");
  const navigate = useNavigate();
  const branding = useBranding();
  const { dialog } = useNotification();
  const intl = useIntl();

  const handleCreate = () => {
    if (!createName.trim()) {
      dialog.error(intl.formatMessage({ id: "landing.nameRequired" }));
      return;
    }
    onCreateSession(createName.trim(), cardDeck);
  };

  const handleJoin = () => {
    if (!joinSessionId.trim()) {
      dialog.error(intl.formatMessage({ id: "landing.sessionIdRequired" }));
      return;
    }
    // No name validation here!
    navigate(`/session/${joinSessionId.trim().toUpperCase()}`);
  };

  return (
    <Container>
      <LanguageSwitcherWrapper>
        <LanguageSwitcher />
      </LanguageSwitcherWrapper>
      {branding.brandLogoUrl && <Logo src={branding.brandLogoUrl} alt={branding.brandName} />}
      <Title><FormattedMessage id="landing.title" /></Title>

      {/* Form 1: Create New Session */}
      <Card>
        <SectionTitle><FormattedMessage id="landing.createSession" /></SectionTitle>
        <Input
          type="text"
          placeholder={intl.formatMessage({ id: "landing.yourName" })}
          value={createName}
          onChange={(e) => setCreateName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleCreate()}
          maxLength={50}
        />
        <DeckLabel>
          <FormattedMessage id="landing.deckLabel" />
        </DeckLabel>
        <DeckSelector>
          <DeckButton
            type="button"
            $active={cardDeck === "fibonacci"}
            onClick={() => setCardDeck("fibonacci")}
          >
            <FormattedMessage id="landing.deckFibonacci" />
          </DeckButton>
          <DeckButton
            type="button"
            $active={cardDeck === "tshirt"}
            onClick={() => setCardDeck("tshirt")}
          >
            <FormattedMessage id="landing.deckTshirt" />
          </DeckButton>
        </DeckSelector>
        <Button onClick={handleCreate}><FormattedMessage id="landing.createButton" /></Button>
      </Card>

      <Divider><FormattedMessage id="landing.or" /></Divider>

      {/* Form 2: Join Existing Session */}
      <Card>
        <SectionTitle><FormattedMessage id="landing.joinSession" /></SectionTitle>
        <Input
          type="text"
          placeholder={intl.formatMessage({ id: "landing.sessionIdPlaceholder" })}
          value={joinSessionId}
          onChange={(e) => setJoinSessionId(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleJoin()}
          maxLength={6}
        />
        <Button onClick={handleJoin}><FormattedMessage id="landing.joinButton" /></Button>
      </Card>

      <Footer>{branding.brandFooterText}</Footer>
    </Container>
  );
}
