// frontend/src/components/ParticipantList.tsx
import React from "react";
import styled from "styled-components";
import type { Participant, EstimateValue } from "../types/types";
import { getEstimateLabel } from "../types/types";

const Container = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-right: 1px solid ${(props) => props.theme.colors.border};
  padding: ${(props) => props.theme.spacing.md};
  min-width: 250px;
  max-width: 300px;
  height: 100vh;
  overflow-y: auto;
`;

const Title = styled.h2`
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const ParticipantItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.sm};
  margin-bottom: ${(props) => props.theme.spacing.sm};
  background: ${(props) => props.theme.colors.background};
`;

const Name = styled.div`
  font-weight: 500;
  color: ${(props) => props.theme.colors.text};
  display: flex;
  gap: ${(props) => props.theme.spacing.xs};
`;

const Badge = styled.span<{ $type: "moderator" | "observer" }>`
  background: ${(props) =>
    props.$type === "moderator" ? props.theme.colors.primary : props.theme.colors.warning};
  color: white;
  padding: 2px 6px;
  border-radius: ${(props) => props.theme.borderRadius.sm};
  font-size: 0.75rem;
  font-weight: 600;
`;

const StatusIndicator = styled.div<{ $status: "waiting" | "estimated" | "revealed" }>`
  font-size: 0.9rem;
  color: ${(props) =>
    props.$status === "waiting"
      ? props.theme.colors.waiting
      : props.$status === "estimated"
        ? props.theme.colors.success
        : props.theme.colors.text};
  ${(props) => props.$status === "revealed" && "font-weight: 700;"}
`;

interface Props {
  participants: Participant[];
  revealed: boolean;
  revealedEstimates: Record<string, EstimateValue> | null;
}

function getStatusAriaLabel(
  participant: Participant,
  revealed: boolean,
  revealedEstimates: Record<string, EstimateValue> | null
): string {
  if (participant.isObserver) {
    return "Observer";
  }
  if (revealed && revealedEstimates) {
    const estimate = revealedEstimates[participant.socketId];
    if (estimate !== undefined) {
      return `Voted: ${getEstimateLabel(estimate)}`;
    }
  }
  if (participant.currentEstimate !== null) {
    return "Voted";
  }
  return "Waiting for vote";
}

export function ParticipantList({ participants, revealed, revealedEstimates }: Props) {
  const getStatus = (participant: Participant): React.ReactNode => {
    if (participant.isObserver) {
      return <StatusIndicator $status="waiting">👁️</StatusIndicator>;
    }

    if (revealed && revealedEstimates) {
      const estimate = revealedEstimates[participant.socketId];
      return (
        <StatusIndicator $status="revealed">
          {estimate !== undefined ? getEstimateLabel(estimate) : "-"}
        </StatusIndicator>
      );
    }

    if (participant.currentEstimate !== null) {
      return <StatusIndicator $status="estimated">✓</StatusIndicator>;
    }

    return <StatusIndicator $status="waiting">⏳</StatusIndicator>;
  };

  return (
    <Container role="region" aria-label="Session participants">
      <Title>Participants ({participants.length})</Title>

      {participants.map((participant) => (
        <ParticipantItem key={participant.socketId}>
          <Name>
            {participant.name}
            {participant.isModerator && (
              <Badge $type="moderator" aria-label="Session moderator">
                👑
              </Badge>
            )}
            {participant.isObserver && (
              <Badge $type="observer" aria-label="Observer (not voting)">
                Observer
              </Badge>
            )}
          </Name>
          <span aria-label={getStatusAriaLabel(participant, revealed, revealedEstimates)}>
            {getStatus(participant)}
          </span>
        </ParticipantItem>
      ))}
    </Container>
  );
}
