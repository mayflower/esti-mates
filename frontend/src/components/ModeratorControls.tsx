// frontend/src/components/ModeratorControls.tsx
import React from "react";
import styled from "styled-components";

const Container = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${(props) => props.theme.colors.surface};
  border-top: 1px solid ${(props) => props.theme.colors.border};
  padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.lg};
  display: flex;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.md};
  box-shadow: ${(props) => props.theme.shadows.lg};
`;

const Button = styled.button<{ $variant?: "primary" | "secondary" }>`
  background: ${(props) =>
    props.$variant === "secondary" ? props.theme.colors.surface : props.theme.colors.primary};
  color: ${(props) =>
    props.$variant === "secondary" ? props.theme.colors.text : "white"};
  border: ${(props) =>
    props.$variant === "secondary"
      ? `1px solid ${props.theme.colors.border}`
      : "none"};
  border-radius: ${(props) => props.theme.borderRadius.md};
  padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.lg};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 150px;

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.$variant === "secondary"
        ? props.theme.colors.background
        : props.theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface Props {
  revealed: boolean;
  hasEstimates: boolean;
  onReveal: () => void;
  onNewRound: () => void;
}

export function ModeratorControls({ revealed, hasEstimates, onReveal, onNewRound }: Props) {
  return (
    <Container>
      {!revealed && (
        <Button onClick={onReveal} disabled={!hasEstimates}>
          Reveal Cards
        </Button>
      )}

      {revealed && (
        <Button onClick={onNewRound} $variant="secondary">
          New Round
        </Button>
      )}
    </Container>
  );
}
