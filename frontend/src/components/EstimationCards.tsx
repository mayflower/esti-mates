// frontend/src/components/EstimationCards.tsx
import { FormattedMessage } from "react-intl";
import styled from "styled-components";
import { ESTIMATE_VALUES, type EstimateValue } from "../types/types";
import { EstimationCard } from "./EstimationCard";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.lg};
  max-width: 800px;
  margin: 0 auto;
`;

const Message = styled.div`
  text-align: center;
  color: ${(props) => props.theme.colors.textSecondary};
  padding: ${(props) => props.theme.spacing.xl};
  font-size: 1.1rem;
`;

interface Props {
  selectedEstimate: number | null;
  onSelectEstimate: (value: EstimateValue) => void;
  disabled: boolean;
  isObserver: boolean;
}

export function EstimationCards({
  selectedEstimate,
  onSelectEstimate,
  disabled,
  isObserver,
}: Props) {
  if (isObserver) {
    return <Message><FormattedMessage id="estimation.observerMessage" /></Message>;
  }

  return (
    <Grid>
      {ESTIMATE_VALUES.map((value) => (
        <EstimationCard
          key={value}
          value={value}
          selected={selectedEstimate === value}
          onSelect={onSelectEstimate}
          disabled={disabled}
        />
      ))}
    </Grid>
  );
}
