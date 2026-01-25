// frontend/src/types/types.ts
export interface Participant {
  socketId: string;
  name: string;
  isModerator: boolean;
  isObserver: boolean;
  currentEstimate: number | null;
}

export type EstimateValue = 1 | 2 | 3 | 5 | 8 | 13 | 21 | -1;

export const ESTIMATE_VALUES: EstimateValue[] = [1, 2, 3, 5, 8, 13, 21, -1];

export function getEstimateLabel(value: EstimateValue): string {
  return value === -1 ? "?" : value.toString();
}
