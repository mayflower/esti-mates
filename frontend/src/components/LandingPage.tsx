// frontend/src/components/LandingPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useBranding } from "../contexts/BrandingContext";
import { useNotification } from "../contexts/NotificationContext";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${(props) => props.theme.colors.background};
`;

const Logo = styled.img`
  height: 80px;
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

const Title = styled.h1`
  color: ${(props) => props.theme.colors.text};
  margin-bottom: ${(props) => props.theme.spacing.xl};
  font-size: 2.5rem;
  text-align: center;
`;

const Card = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  box-shadow: ${(props) => props.theme.shadows.md};
  padding: ${(props) => props.theme.spacing.xl};
  width: 100%;
  max-width: 500px;
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
  onCreateSession: (name: string) => void;
}

export function LandingPage({ onCreateSession }: LandingPageProps) {
  const [createName, setCreateName] = useState("");
  const [joinSessionId, setJoinSessionId] = useState("");
  const navigate = useNavigate();
  const branding = useBranding();
  const { dialog } = useNotification();

  const handleCreate = () => {
    if (!createName.trim()) {
      dialog.error("Please enter your name");
      return;
    }
    onCreateSession(createName.trim());
  };

  const handleJoin = () => {
    if (!joinSessionId.trim()) {
      dialog.error("Please enter a session ID");
      return;
    }
    // No name validation here!
    navigate(`/session/${joinSessionId.trim().toUpperCase()}`);
  };

  return (
    <Container>
      {branding.brandLogoUrl && <Logo src={branding.brandLogoUrl} alt={branding.brandName} />}
      <Title>MF EstiMates</Title>

      {/* Form 1: Create New Session */}
      <Card>
        <SectionTitle>Create New Session</SectionTitle>
        <Input
          type="text"
          placeholder="Your name"
          value={createName}
          onChange={(e) => setCreateName(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleCreate()}
          maxLength={50}
        />
        <Button onClick={handleCreate}>Create New Session</Button>
      </Card>

      <Divider>or</Divider>

      {/* Form 2: Join Existing Session */}
      <Card>
        <SectionTitle>Join Existing Session</SectionTitle>
        <Input
          type="text"
          placeholder="Session ID (6 characters)"
          value={joinSessionId}
          onChange={(e) => setJoinSessionId(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleJoin()}
          maxLength={6}
        />
        <Button onClick={handleJoin}>Join Existing Session</Button>
      </Card>

      <Footer>{branding.brandFooterText}</Footer>
    </Container>
  );
}
