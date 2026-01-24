export type EstimateValue = 1 | 2 | 3 | 5 | 8 | 13 | 21 | -1; // -1 represents "?"

export interface Participant {
  socketId: string;
  name: string;
  isModerator: boolean;
  isObserver: boolean;
  currentEstimate: EstimateValue | null;
}

export interface Round {
  estimates: Map<string, EstimateValue>;
  revealed: boolean;
}

export interface Session {
  id: string;
  moderatorSocketId: string;
  participants: Map<string, Participant>;
  currentRound: Round;
  createdAt: Date;
  lastActivity: Date;
}

export function generateSessionId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function deduplicateName(name: string, existingNames: string[]): string {
  if (!existingNames.includes(name)) {
    return name;
  }

  let counter = 2;
  let newName = `${name} (${counter})`;
  while (existingNames.includes(newName)) {
    counter++;
    newName = `${name} (${counter})`;
  }
  return newName;
}
