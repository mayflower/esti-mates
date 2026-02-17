// frontend/src/components/ResultsView.tsx
import styled from "styled-components";
import { FormattedMessage, useIntl } from 'react-intl';
import { getEstimateLabel } from "../types/types";
import type { EstimateValue } from "../types/types";

const Container = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  box-shadow: ${(props) => props.theme.shadows.md};
  padding: ${(props) => props.theme.spacing.xl};
  max-width: 800px;
  margin: ${(props) => props.theme.spacing.lg} auto 0;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: ${(props) => props.theme.spacing.md};
    margin-top: ${(props) => props.theme.spacing.sm};
  }
`;

const Title = styled.h2`
  font-size: 1.8rem;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  text-align: center;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    font-size: 1.3rem;
    margin-bottom: ${(props) => props.theme.spacing.sm};
  }
`;

const Average = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.primary};
  text-align: center;
  margin-bottom: ${(props) => props.theme.spacing.lg};

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    font-size: 2rem;
    margin-bottom: ${(props) => props.theme.spacing.sm};
  }
`;

const EstimatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: ${(props) => props.theme.spacing.md};
  margin-top: ${(props) => props.theme.spacing.lg};

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
    gap: ${(props) => props.theme.spacing.sm};
    margin-top: ${(props) => props.theme.spacing.sm};
  }
`;

const EstimateCard = styled.div`
  background: ${(props) => props.theme.colors.background};
  border-radius: ${(props) => props.theme.borderRadius.md};
  padding: ${(props) => props.theme.spacing.md};
  text-align: center;
`;

const EstimateValueDisplay = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: ${(props) => props.theme.spacing.xs};

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    font-size: 1.5rem;
  }
`;

const EstimateCount = styled.div`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textSecondary};
`;

interface Props {
  estimates: Record<string, EstimateValue>;
  average: number;
}

export function ResultsView({ estimates, average }: Props) {
  const intl = useIntl();
  // Validate average
  const displayAverage = Number.isFinite(average) ? average.toFixed(1) : "N/A";

  // Handle empty estimates
  if (Object.keys(estimates).length === 0) {
    return (
      <Container role="region" aria-label={intl.formatMessage({ id: 'results.regionLabel' })}>
        <Title><FormattedMessage id="results.title" /></Title>
        <Average role="status" aria-label={intl.formatMessage({ id: 'results.noVotes' })}>
          <FormattedMessage id="results.noVotes" />
        </Average>
      </Container>
    );
  }

  // Group estimates by value
  const groupedEstimates = Object.values(estimates).reduce(
    (acc, value) => {
      const label = getEstimateLabel(value);
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Sort by estimate value
  const sortedGroups = Object.entries(groupedEstimates).sort(([a], [b]) => {
    if (a === "?") return 1;
    if (b === "?") return -1;
    return Number(a) - Number(b);
  });

  return (
    <Container role="region" aria-label={intl.formatMessage({ id: 'results.regionLabel' })}>
      <Title><FormattedMessage id="results.title" /></Title>
      <Average role="status" aria-label={intl.formatMessage({ id: 'results.averageLabel' }, { value: displayAverage })}>
        {displayAverage}
      </Average>

      <EstimatesGrid>
        {sortedGroups.map(([value, count]) => (
          <EstimateCard key={value}>
            <EstimateValueDisplay>{value}</EstimateValueDisplay>
            <EstimateCount>
              <FormattedMessage id="results.voteCount" values={{ count }} />
            </EstimateCount>
          </EstimateCard>
        ))}
      </EstimatesGrid>
    </Container>
  );
}
