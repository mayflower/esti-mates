# Card Deck Selection Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Der Ersteller einer Session kann beim Anlegen zwischen Fibonacci-Karten (1, 2, 3, 5, 8, 13, 21, ?) und T-Shirt-Größen (XS, S, M, L, XL, ?) wählen; alle Teilnehmer sehen automatisch das richtige Deck.

**Architecture:** `EstimateValue` wird von einem numerischen Union-Typ zu `string` geändert; ein neuer `CardDeck`-Typ (`"fibonacci" | "tshirt"`) steuert, welche Werte gültig sind. Das Backend speichert `cardDeck` in der Session und validiert Schätzungen dagegen; Frontend und Backend teilen die gültige Wertemengen-Konfiguration. Die LandingPage bekommt einen Segmented-Control zum Wählen des Decks, das Deck-Info wird beim `session_created`- und `joined_session`-Event übertragen.

**Tech Stack:** TypeScript (strict), Node.js/Express, Socket.io, React 18, Vitest

---

## Überblick der Änderungen

### Backend
- `backend/src/types/types.ts` – `EstimateValue = string`, neuer `CardDeck`-Typ, `VALID_ESTIMATES`, `cardDeck` in `Session`
- `backend/src/services/SessionService.ts` – `createSession` nimmt `cardDeck`, `submitEstimate` validiert gegen Deck
- `backend/src/server.ts` – `create_session`-Handler übergibt `cardDeck`, `session_created`/`joined_session` enthalten `cardDeck`

### Frontend
- `frontend/src/types/types.ts` – `EstimateValue = string`, `CardDeck`, `DECK_VALUES`, `getEstimateLabel` als Identity
- `frontend/src/contexts/SessionContext.tsx` – `cardDeck` im State, `createSession(name, cardDeck)`, String-Typen
- `frontend/src/components/LandingPage.tsx` – Deck-Selector, Prop `onCreateSession(name, cardDeck)`
- `frontend/src/App.tsx` – `handleCreateSession` übergibt `cardDeck`
- `frontend/src/components/EstimationCards.tsx` – Karten aus `DECK_VALUES[cardDeck]`
- `frontend/src/components/ResultsView.tsx` – Sortierung für T-Shirt-Größen
- `frontend/src/i18n/messages/de.json` + `en.json` – Neue Strings

---

## Task 1: Backend-Typen erweitern

**Files:**
- Modify: `backend/src/types/types.ts`
- Modify: `backend/src/services/SessionService.test.ts`

### Step 1: Failing test schreiben

In `backend/src/services/SessionService.test.ts` am Anfang des `describe("createSession")` Blocks ergänzen:

```ts
it("should default to fibonacci deck", () => {
  const result = service.createSession("socket1", "Alice");
  const session = service.getSession(result.sessionId);
  expect(session?.cardDeck).toBe("fibonacci");
});

it("should store tshirt deck when specified", () => {
  const result = service.createSession("socket1", "Alice", "tshirt");
  const session = service.getSession(result.sessionId);
  expect(session?.cardDeck).toBe("tshirt");
});
```

### Step 2: Test schlägt fehl

```bash
cd /Users/tmogdans/Code/mf-estimates
npm run test:backend 2>&1 | grep -E "FAIL|PASS|Error" | head -20
```

Erwartet: FAIL – `cardDeck` existiert nicht auf `Session`.

### Step 3: Typen implementieren

`backend/src/types/types.ts` vollständig ersetzen:

```ts
export type EstimateValue = string;

export type CardDeck = "fibonacci" | "tshirt";

export const VALID_ESTIMATES: Record<CardDeck, string[]> = {
  fibonacci: ["1", "2", "3", "5", "8", "13", "21", "?"],
  tshirt: ["XS", "S", "M", "L", "XL", "?"],
};

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
  cardDeck: CardDeck;
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
```

### Step 4: Tests laufen lassen

```bash
npm run test:backend 2>&1 | grep -E "FAIL|PASS|✓|✗" | head -30
```

Erwartet: Die neuen Tests schlagen noch fehl (SessionService kennt `cardDeck` noch nicht), aber Typen kompilieren.

### Step 5: Commit

```bash
git add backend/src/types/types.ts backend/src/services/SessionService.test.ts
git commit -m "feat: add CardDeck type and VALID_ESTIMATES to backend types"
```

---

## Task 2: SessionService – cardDeck speichern und Schätzungen validieren

**Files:**
- Modify: `backend/src/services/SessionService.ts`
- Modify: `backend/src/services/SessionService.test.ts`

### Step 1: Failing tests für submitEstimate-Validierung ergänzen

Im `describe("submitEstimate")` Block in `SessionService.test.ts`:

```ts
it("should reject estimate not in fibonacci deck", () => {
  const { sessionId } = service.createSession("socket1", "Alice", "fibonacci");
  service.joinSession(sessionId, "socket2", "Bob");
  const result = service.submitEstimate(sessionId, "socket2", "XL");
  expect(result.success).toBe(false);
  expect(result.error).toBe("Invalid estimate value");
});

it("should reject estimate not in tshirt deck", () => {
  const { sessionId } = service.createSession("socket1", "Alice", "tshirt");
  service.joinSession(sessionId, "socket2", "Bob");
  const result = service.submitEstimate(sessionId, "socket2", "8");
  expect(result.success).toBe(false);
  expect(result.error).toBe("Invalid estimate value");
});

it("should accept valid tshirt estimate", () => {
  const { sessionId } = service.createSession("socket1", "Alice", "tshirt");
  service.joinSession(sessionId, "socket2", "Bob");
  const result = service.submitEstimate(sessionId, "socket2", "XL");
  expect(result.success).toBe(true);
});

it("should accept ? in tshirt deck", () => {
  const { sessionId } = service.createSession("socket1", "Alice", "tshirt");
  service.joinSession(sessionId, "socket2", "Bob");
  const result = service.submitEstimate(sessionId, "socket2", "?");
  expect(result.success).toBe(true);
});
```

### Step 2: Test schlägt fehl

```bash
npm run test:backend 2>&1 | grep -E "FAIL|PASS" | head -10
```

### Step 3: SessionService anpassen

In `backend/src/services/SessionService.ts`:

**Import ergänzen** (oben):
```ts
import type { CardDeck, EstimateValue, Participant, Session } from "../types/types.js";
import { VALID_ESTIMATES, deduplicateName, generateSessionId } from "../types/types.js";
```

**`createSession`-Signatur ändern:**
```ts
createSession(
  moderatorSocketId: string,
  moderatorName: string,
  cardDeck: CardDeck = "fibonacci"
): { sessionId: string; moderator: Participant } {
```

**Session-Objekt: `cardDeck` hinzufügen** (nach `id: sessionId,`):
```ts
const session: Session = {
  id: sessionId,
  moderatorSocketId,
  cardDeck,
  participants: new Map([[moderatorSocketId, moderator]]),
  currentRound: {
    estimates: new Map(),
    revealed: false,
  },
  createdAt: new Date(),
  lastActivity: new Date(),
};
```

**`submitEstimate` – Validierung ergänzen** (vor der Moderator/Participant-Logik, nach dem Session-null-Check):
```ts
if (!VALID_ESTIMATES[session.cardDeck].includes(estimate)) {
  return { success: false, error: "Invalid estimate value" };
}
```

Bestehende `submitEstimate`-Methode zur Referenz – die Validierungs-Zeile kommt direkt nach:
```ts
const session = this.sessions.get(sessionId);
if (!session) {
  return { success: false, error: "Session not found" };
}
// NEU: Deck-Validierung hier einfügen
if (!VALID_ESTIMATES[session.cardDeck].includes(estimate)) {
  return { success: false, error: "Invalid estimate value" };
}
```

### Step 4: Tests laufen lassen

```bash
npm run test:backend 2>&1 | grep -E "FAIL|PASS|✓|✗" | head -30
```

Erwartet: Alle SessionService-Tests grün.

### Step 5: Commit

```bash
git add backend/src/services/SessionService.ts backend/src/services/SessionService.test.ts
git commit -m "feat: store cardDeck in session and validate estimates against deck"
```

---

## Task 3: Backend server.ts – cardDeck in Events übertragen

**Files:**
- Modify: `backend/src/server.ts`

### Step 1: `create_session`-Handler anpassen

In `backend/src/server.ts`, den `create_session`-Handler ersetzen:

```ts
socket.on("create_session", (payload) => {
  logger.info({ name: payload.name, cardDeck: payload.cardDeck }, `create_session from ${socket.id}`);

  if (!payload.name || payload.name.trim() === "") {
    socket.emit("error", { message: "Name is required" });
    return;
  }

  const cardDeck: import("./types/types.js").CardDeck =
    payload.cardDeck === "tshirt" ? "tshirt" : "fibonacci";

  const result = sessionService.createSession(socket.id, payload.name.trim(), cardDeck);
  currentSessionId = result.sessionId;

  socket.join(result.sessionId);
  socket.emit("session_created", {
    sessionId: result.sessionId,
    moderator: result.moderator,
    cardDeck,
  });
});
```

### Step 2: `join_session`-Handler anpassen

Den `join_session`-Handler so ergänzen, dass `cardDeck` aus der Session ans Frontend weitergegeben wird:

```ts
socket.on("join_session", (payload) => {
  logger.info(
    { sessionId: payload.sessionId, name: payload.name },
    `join_session from ${socket.id}`
  );

  if (!payload.name || payload.name.trim() === "") {
    socket.emit("error", { message: "Name is required" });
    return;
  }

  const result = sessionService.joinSession(payload.sessionId, socket.id, payload.name.trim());

  if (!result.success) {
    socket.emit("error", { message: result.error });
    return;
  }

  const session = sessionService.getSession(payload.sessionId);

  currentSessionId = payload.sessionId;
  socket.join(payload.sessionId);

  socket.emit("joined_session", {
    participants: result.participants,
    isModerator: result.participant?.isModerator,
    cardDeck: session?.cardDeck ?? "fibonacci",
  });

  socket.to(payload.sessionId).emit("participant_joined", {
    participant: result.participant,
  });
});
```

### Step 3: TypeScript kompiliert ohne Fehler

```bash
cd /Users/tmogdans/Code/mf-estimates/backend
npx tsc --noEmit 2>&1
```

Erwartet: Keine Fehler.

### Step 4: Commit

```bash
git add backend/src/server.ts
git commit -m "feat: include cardDeck in session_created and joined_session events"
```

---

## Task 4: Frontend-Typen anpassen

**Files:**
- Modify: `frontend/src/types/types.ts`

### Step 1: `types.ts` vollständig ersetzen

```ts
export type EstimateValue = string;

export type CardDeck = "fibonacci" | "tshirt";

export const DECK_VALUES: Record<CardDeck, string[]> = {
  fibonacci: ["1", "2", "3", "5", "8", "13", "21", "?"],
  tshirt: ["XS", "S", "M", "L", "XL", "?"],
};

// Reihenfolge für T-Shirt-Sortierung in ResultsView
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
```

### Step 2: TypeScript kompiliert ohne Fehler

```bash
cd /Users/tmogdans/Code/mf-estimates/frontend
npx tsc --noEmit 2>&1
```

Es werden Fehler erwartet – `ESTIMATE_VALUES` wird nicht mehr exportiert und `currentEstimate: number` passt nicht mehr. Diese werden in den folgenden Tasks behoben.

### Step 3: Commit (auch mit Fehlern – WIP)

```bash
git add frontend/src/types/types.ts
git commit -m "feat: change EstimateValue to string, add CardDeck and DECK_VALUES"
```

---

## Task 5: SessionContext – cardDeck im State

**Files:**
- Modify: `frontend/src/contexts/SessionContext.tsx`

### Step 1: State erweitern

`SessionState` Interface anpassen:

```ts
interface SessionState {
  sessionId: string | null;
  participants: Participant[];
  isModerator: boolean;
  cardDeck: CardDeck;
  currentEstimate: string | null;
  roundRevealed: boolean;
  revealedEstimates: Record<string, string> | null;
  currentSocketId: string | null;
}
```

### Step 2: Context-Typ anpassen

`SessionContextType`:

```ts
interface SessionContextType extends SessionState {
  createSession: (name: string, cardDeck: CardDeck) => void;
  joinSession: (sessionId: string, name: string) => void;
  submitEstimate: (estimate: string) => void;
  revealCards: () => void;
  newRound: () => void;
  transferModerator: (targetSocketId: string) => void;
  toggleObserver: (targetSocketId?: string) => void;
}
```

### Step 3: Import ergänzen

```ts
import type { CardDeck, Participant } from "../types/types";
```

### Step 4: Initialzustand anpassen

```ts
const [state, setState] = useState<SessionState>({
  sessionId: null,
  participants: [],
  isModerator: false,
  cardDeck: "fibonacci",
  currentEstimate: null,
  roundRevealed: false,
  revealedEstimates: null,
  currentSocketId: socket?.id || null,
});
```

### Step 5: Event-Handler anpassen

`session_created` Handler:
```ts
socket.on("session_created", (data) => {
  setState((prev) => ({
    ...prev,
    sessionId: data.sessionId,
    participants: [data.moderator],
    isModerator: true,
    cardDeck: data.cardDeck ?? "fibonacci",
  }));
});
```

`joined_session` Handler:
```ts
socket.on("joined_session", (data) => {
  setState((prev) => ({
    ...prev,
    participants: data.participants,
    isModerator: data.isModerator,
    cardDeck: data.cardDeck ?? "fibonacci",
  }));
});
```

`estimate_submitted` Handler – Sentinel von `-999` auf `"__voted__"` ändern:
```ts
socket.on("estimate_submitted", (data) => {
  setState((prev) => ({
    ...prev,
    participants: prev.participants.map((p) =>
      p.socketId === data.socketId ? { ...p, currentEstimate: "__voted__" } : p
    ),
  }));
});
```

### Step 6: Actions anpassen

`createSession`:
```ts
const createSession = useCallback(
  (name: string, cardDeck: CardDeck) => {
    if (!socket) return;
    socket.emit("create_session", { name, cardDeck });
  },
  [socket]
);
```

`submitEstimate`:
```ts
const submitEstimate = useCallback(
  (estimate: string) => {
    if (!socket) return;
    socket.emit("submit_estimate", { estimate });
    setState((prev) => ({ ...prev, currentEstimate: estimate }));
  },
  [socket]
);
```

### Step 7: TypeScript kompiliert

```bash
cd /Users/tmogdans/Code/mf-estimates/frontend
npx tsc --noEmit 2>&1
```

Jetzt sollten nur noch Fehler in `LandingPage`, `App.tsx`, `EstimationCards` und `ResultsView` erscheinen.

### Step 8: Commit

```bash
git add frontend/src/contexts/SessionContext.tsx
git commit -m "feat: add cardDeck to session state and update createSession signature"
```

---

## Task 6: i18n – Deck-Strings hinzufügen

**Files:**
- Modify: `frontend/src/i18n/messages/de.json`
- Modify: `frontend/src/i18n/messages/en.json`

### Step 1: Deutschen Strings ergänzen

In `de.json` unter `landing.nameRequired` einfügen:

```json
"landing.deckLabel": "Schätzsystem",
"landing.deckFibonacci": "Fibonacci",
"landing.deckTshirt": "T-Shirt Sizes",
```

### Step 2: Englische Strings ergänzen

In `en.json` unter `landing.nameRequired` einfügen:

```json
"landing.deckLabel": "Estimation system",
"landing.deckFibonacci": "Fibonacci",
"landing.deckTshirt": "T-Shirt Sizes",
```

### Step 3: Commit

```bash
git add frontend/src/i18n/messages/de.json frontend/src/i18n/messages/en.json
git commit -m "feat: add i18n strings for card deck selection"
```

---

## Task 7: LandingPage – Deck-Selector UI

**Files:**
- Modify: `frontend/src/components/LandingPage.tsx`

### Step 1: Props-Typ anpassen

```ts
import type { CardDeck } from "../types/types";

export interface LandingPageProps {
  onCreateSession: (name: string, cardDeck: CardDeck) => void;
}
```

### Step 2: State ergänzen

```ts
const [cardDeck, setCardDeck] = useState<CardDeck>("fibonacci");
```

### Step 3: Styled Components für Deck-Selector ergänzen

Nach dem `Button`-styled-component:

```ts
const DeckSelector = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.sm};
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const DeckButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.md};
  border: 2px solid
    ${(props) => (props.$active ? props.theme.colors.primary : props.theme.colors.border)};
  border-radius: ${(props) => props.theme.borderRadius.md};
  background: ${(props) => (props.$active ? props.theme.colors.primary : "transparent")};
  color: ${(props) => (props.$active ? "white" : props.theme.colors.text)};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const DeckLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${(props) => props.theme.colors.textSecondary};
  margin-bottom: ${(props) => props.theme.spacing.xs};
`;
```

### Step 4: handleCreate anpassen

```ts
const handleCreate = () => {
  if (!createName.trim()) {
    dialog.error(intl.formatMessage({ id: "landing.nameRequired" }));
    return;
  }
  onCreateSession(createName.trim(), cardDeck);
};
```

### Step 5: Deck-Selector in der "Neue Session"-Karte einbauen

Unterhalb des `<Input>` für den Namen, vor dem `<Button>`:

```tsx
<DeckLabel>
  <FormattedMessage id="landing.deckLabel" />
</DeckLabel>
<DeckSelector>
  <DeckButton
    type="button"
    $active={cardDeck === "fibonacci"}
    onClick={() => setCardDeck("fibonacci")}
  >
    <FormattedMessage id="landing.deckFibonacci" />
  </DeckButton>
  <DeckButton
    type="button"
    $active={cardDeck === "tshirt"}
    onClick={() => setCardDeck("tshirt")}
  >
    <FormattedMessage id="landing.deckTshirt" />
  </DeckButton>
</DeckSelector>
```

### Step 6: TypeScript kompiliert

```bash
cd /Users/tmogdans/Code/mf-estimates/frontend
npx tsc --noEmit 2>&1 | grep "LandingPage\|App.tsx"
```

### Step 7: Commit

```bash
git add frontend/src/components/LandingPage.tsx
git commit -m "feat: add card deck selector to landing page"
```

---

## Task 8: App.tsx – cardDeck weiterreichen

**Files:**
- Modify: `frontend/src/App.tsx`

### Step 1: `LandingPageWrapper` anpassen

```ts
import type { CardDeck } from "./types/types";

function LandingPageWrapper() {
  const navigate = useNavigate();
  const { createSession, sessionId } = useSession();
  const [creatorName, setCreatorName] = React.useState<string | null>(null);

  const handleCreateSession = (name: string, cardDeck: CardDeck) => {
    setCreatorName(name);
    createSession(name, cardDeck);
  };

  React.useEffect(() => {
    if (sessionId && creatorName) {
      navigate(`/session/${sessionId}`, {
        state: { name: creatorName, isModerator: true },
      });
    }
  }, [sessionId, creatorName, navigate]);

  return <LandingPage onCreateSession={handleCreateSession} />;
}
```

### Step 2: TypeScript kompiliert

```bash
cd /Users/tmogdans/Code/mf-estimates/frontend
npx tsc --noEmit 2>&1
```

Jetzt sollten nur noch Fehler in `EstimationCards` und `ResultsView` erscheinen.

### Step 3: Commit

```bash
git add frontend/src/App.tsx
git commit -m "feat: pass cardDeck from LandingPage through to createSession"
```

---

## Task 9: EstimationCards – Karten aus Deck laden

**Files:**
- Modify: `frontend/src/components/EstimationCards.tsx`

### Step 1: Implementierung anpassen

`EstimationCards.tsx` vollständig ersetzen:

```tsx
// frontend/src/components/EstimationCards.tsx
import { FormattedMessage } from "react-intl";
import styled from "styled-components";
import { DECK_VALUES } from "../types/types";
import { useSession } from "../contexts/SessionContext";
import { EstimationCard } from "./EstimationCard";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.lg};
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
    gap: ${(props) => props.theme.spacing.sm};
    padding: ${(props) => props.theme.spacing.sm};
  }
`;

const Message = styled.div`
  text-align: center;
  color: ${(props) => props.theme.colors.textSecondary};
  padding: ${(props) => props.theme.spacing.xl};
  font-size: 1.1rem;
`;

interface Props {
  selectedEstimate: string | null;
  onSelectEstimate: (value: string) => void;
  disabled: boolean;
  isObserver: boolean;
}

export function EstimationCards({
  selectedEstimate,
  onSelectEstimate,
  disabled,
  isObserver,
}: Props) {
  const { cardDeck } = useSession();

  if (isObserver) {
    return <Message><FormattedMessage id="estimation.observerMessage" /></Message>;
  }

  return (
    <Grid>
      {DECK_VALUES[cardDeck].map((value) => (
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
```

### Step 2: EstimationCard.tsx anpassen

`EstimationCard.tsx` – `getEstimateLabel` ist jetzt Identity, `value` ist `string`:

```tsx
// frontend/src/components/EstimationCard.tsx
import styled from "styled-components";

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

  @media (max-width: ${(props) => props.theme.breakpoints.mobile}) {
    padding: ${(props) => props.theme.spacing.md};
    font-size: 1.5rem;
    min-width: 70px;
    min-height: 80px;
  }
`;

interface Props {
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
  disabled: boolean;
}

export function EstimationCard({ value, selected, onSelect, disabled }: Props) {
  return (
    <Card
      $selected={selected}
      onClick={() => onSelect(value)}
      disabled={disabled}
      aria-label={`Estimate ${value}`}
      aria-pressed={selected}
    >
      {value}
    </Card>
  );
}
```

### Step 3: TypeScript kompiliert

```bash
cd /Users/tmogdans/Code/mf-estimates/frontend
npx tsc --noEmit 2>&1
```

Jetzt sollte nur noch `ResultsView`/`SessionPage`/`ParticipantList` Fehler haben (falls `EstimateValue` noch als Zahl referenziert wird).

### Step 4: Commit

```bash
git add frontend/src/components/EstimationCards.tsx frontend/src/components/EstimationCard.tsx
git commit -m "feat: load estimation cards from active deck"
```

---

## Task 10: ResultsView und SessionPage – Restliche Typ-Fehler beheben

**Files:**
- Modify: `frontend/src/components/ResultsView.tsx`
- Modify: `frontend/src/pages/SessionPage.tsx`

### Step 1: ResultsView – Sortierung deck-aware machen

In `ResultsView.tsx`:

**Import anpassen:**
```ts
import { sortEstimateValues } from "../types/types";
import type { CardDeck } from "../types/types";
```

**Props erweitern:**
```ts
interface Props {
  estimates: Record<string, string>;
  cardDeck: CardDeck;
}

export function ResultsView({ estimates, cardDeck }: Props) {
```

**Sortierung ersetzen:**

Altes `sortedGroups`:
```ts
const sortedGroups = Object.entries(groupedEstimates).sort(([a], [b]) => {
  if (a === "?") return 1;
  if (b === "?") return -1;
  return Number(a) - Number(b);
});
```

Neues `sortedGroups`:
```ts
const sortedKeys = sortEstimateValues(Object.keys(groupedEstimates), cardDeck);
const sortedGroups = sortedKeys.map((key) => [key, groupedEstimates[key]] as [string, number]);
```

**`groupedEstimates` – Typ-Fix:**
```ts
const groupedEstimates = Object.values(estimates).reduce(
  (acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);
```

**`EstimateValueDisplay`** zeigt `value` direkt (kein `getEstimateLabel` nötig, da schon String).

### Step 2: SessionPage – cardDeck an ResultsView übergeben

In `SessionPage.tsx` den `useSession`-Destructuring um `cardDeck` erweitern:

```ts
const {
  participants,
  isModerator,
  cardDeck,
  currentEstimate,
  roundRevealed,
  revealedEstimates,
  currentSocketId,
  submitEstimate,
  revealCards,
  newRound,
  transferModerator,
  toggleObserver,
} = useSession();
```

`ResultsView`-Aufruf in der JSX um `cardDeck` ergänzen:

```tsx
{roundRevealed && revealedEstimates && (
  <ResultsView estimates={revealedEstimates} cardDeck={cardDeck} />
)}
```

Außerdem `submitEstimate` in der `handleSelectEstimate`-Funktion prüfen – sie erwartet jetzt `string`:

```ts
const handleSelectEstimate = (value: string) => {
  if (!roundRevealed) {
    submitEstimate(value);
  }
};
```

Und `selectedEstimate` in EstimationCards ist jetzt `string | null`:
```tsx
<EstimationCards
  selectedEstimate={currentEstimate}
  onSelectEstimate={handleSelectEstimate}
  disabled={roundRevealed}
  isObserver={currentParticipant?.isObserver ?? false}
/>
```

### Step 3: ParticipantList – Typ-Fix

`ParticipantList.tsx` verwendet `Record<string, EstimateValue>` – da `EstimateValue = string`, ist das kompatibel. Jedoch muss der Import stimmen. Falls `getEstimateLabel` noch importiert wird, kann es bleiben (gibt jetzt einfach den String zurück).

Prüfen:
```bash
npx tsc --noEmit 2>&1 | grep "ParticipantList"
```

Falls Fehler: `getEstimateLabel(estimate)` → `estimate` direkt.

### Step 4: TypeScript vollständig fehlerfrei

```bash
cd /Users/tmogdans/Code/mf-estimates/frontend
npx tsc --noEmit 2>&1
```

Erwartet: Keine Fehler.

### Step 5: Alle Tests laufen

```bash
cd /Users/tmogdans/Code/mf-estimates
npm run test 2>&1 | tail -20
```

Erwartet: Alle Tests grün (oder bekannte Failures durch geänderte Signaturen – diese dann fixen).

### Step 6: Commit

```bash
git add frontend/src/components/ResultsView.tsx frontend/src/pages/SessionPage.tsx frontend/src/components/ParticipantList.tsx
git commit -m "feat: fix remaining type errors after EstimateValue string migration"
```

---

## Task 11: Manuelle End-to-End-Überprüfung

### Step 1: Dev-Server starten

```bash
cd /Users/tmogdans/Code/mf-estimates
npm run dev
```

### Step 2: Fibonacci-Flow testen

1. Browser öffnen: `http://localhost:3000`
2. Namen eingeben, "Fibonacci" ist vorausgewählt → "Neue Session erstellen"
3. Karten 1, 2, 3, 5, 8, 13, 21, ? erscheinen
4. Karte wählen, aufdecken → Ergebnis zeigt numerische Werte sortiert

### Step 3: T-Shirt-Flow testen

1. Neue Session erstellen, diesmal "T-Shirt Sizes" wählen
2. Karten XS, S, M, L, XL, ? erscheinen
3. Zwei Tabs öffnen, beide der Session beitreten
4. Beide Tabs sehen T-Shirt-Karten (auch Beitreter ohne Deck-Wahl)
5. Aufdecken → Ergebnis zeigt T-Shirt-Größen in richtiger Reihenfolge (XS → XL → ?)

### Step 4: Finaler Commit

```bash
git add -A
git commit -m "feat: card deck selection (Fibonacci vs T-Shirt Sizes) complete"
```
