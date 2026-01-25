// frontend/src/components/EstimationCard.tsx
import styled from "styled-components";
import type { EstimateValue } from "../types/types";
import { getEstimateLabel } from "../types/types";

const Card = styled.button<{ $selected: boolean }>`
  background: ${(props) =>
    props.$selected ? props.theme.colors.primary : props.theme.colors.surface};
  color: ${(props) => (props.$selected ? "white" : props.theme.colors.text)};
  border: 2px solid
    ${(props) => (props.$selected ? props.theme.colors.primary : props.theme.colors.border)};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  padding: ${(props) => props.theme.spacing.xl};
  font-size: 2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-4px);
    box-shadow: ${(props) => props.theme.shadows.md};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface Props {
  value: EstimateValue;
  selected: boolean;
  onSelect: (value: EstimateValue) => void;
  disabled: boolean;
}

export function EstimationCard({ value, selected, onSelect, disabled }: Props) {
  return (
    <Card $selected={selected} onClick={() => onSelect(value)} disabled={disabled}>
      {getEstimateLabel(value)}
    </Card>
  );
}
