export type EstimateValue = string;

export type CardDeck = "fibonacci" | "tshirt";

export const DECK_VALUES: Record<CardDeck, string[]> = {
  fibonacci: ["1", "2", "3", "5", "8", "13", "21", "?"],
  tshirt: ["XS", "S", "M", "L", "XL", "?"],
};

const TSHIRT_ORDER: Record<string, number> = {
  XS: 0,
  S: 1,
  M: 2,
  L: 3,
  XL: 4,
  "?": 5,
};

export function sortEstimateValues(values: string[], deck: CardDeck): string[] {
  return [...values].sort((a, b) => {
    if (deck === "tshirt") {
      return (TSHIRT_ORDER[a] ?? 99) - (TSHIRT_ORDER[b] ?? 99);
    }
    if (a === "?") return 1;
    if (b === "?") return -1;
    return Number(a) - Number(b);
  });
}

export interface Participant {
  socketId: string;
  name: string;
  isModerator: boolean;
  isObserver: boolean;
  currentEstimate: EstimateValue | null;
}

export function getEstimateLabel(value: EstimateValue): string {
  return value;
}
