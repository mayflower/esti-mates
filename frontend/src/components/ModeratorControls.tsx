// frontend/src/components/ModeratorControls.tsx
import { FormattedMessage, useIntl } from "react-intl";
import styled from "styled-components";

const Container = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: ${(props) => props.theme.colors.surface};
  border-top: 1px solid ${(props) => props.theme.colors.border};
  padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.lg};
  display: flex;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.md};
  box-shadow: ${(props) => props.theme.shadows.lg};

  @media (max-width: 768px) {
    padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
    gap: ${(props) => props.theme.spacing.sm};
  }
`;

const Button = styled.button<{ $variant?: "primary" | "secondary" }>`
  background: ${(props) =>
    props.$variant === "secondary" ? props.theme.colors.surface : props.theme.colors.primary};
  color: ${(props) => (props.$variant === "secondary" ? props.theme.colors.text : "white")};
  border: ${(props) =>
    props.$variant === "secondary" ? `1px solid ${props.theme.colors.border}` : "none"};
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

  @media (max-width: 768px) {
    min-width: 120px;
    font-size: 0.9rem;
    padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  }
`;

interface Props {
  revealed: boolean;
  hasEstimates: boolean;
  onReveal: () => void;
  onNewRound: () => void;
}

export function ModeratorControls({ revealed, hasEstimates, onReveal, onNewRound }: Props) {
  const intl = useIntl();

  return (
    <Container>
      {!revealed && (
        <Button
          onClick={onReveal}
          disabled={!hasEstimates}
          aria-label={
            hasEstimates
              ? intl.formatMessage({ id: "moderator.revealAriaLabel" })
              : intl.formatMessage({ id: "moderator.revealWaiting" })
          }
        >
          <FormattedMessage id="moderator.revealCards" />
        </Button>
      )}

      {revealed && (
        <Button
          onClick={onNewRound}
          $variant="secondary"
          aria-label={intl.formatMessage({ id: "moderator.newRoundAriaLabel" })}
        >
          <FormattedMessage id="moderator.newRound" />
        </Button>
      )}
    </Container>
  );
}
