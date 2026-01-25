# MF EstiMates Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a real-time Planning Poker estimation tool with React frontend, Node.js backend, and Socket.io for WebSocket communication.

**Architecture:** Monorepo with separate frontend (React + Vite) and backend (Node.js + Express + Socket.io) directories. In-memory session management, no database. Single Docker container deployment combining both services.

**Tech Stack:** TypeScript, React 18, Vite, Styled Components, Node.js, Express, Socket.io, Vitest, Biome, Docker

---

## Task 1: Project Structure & Configuration Setup

**Files:**
- Create: `package.json` (root)
- Create: `biome.json`
- Create: `.gitignore`
- Create: `Makefile`
- Create: `frontend/package.json`
- Create: `backend/package.json`

**Step 1: Initialize root package.json**

```bash
npm init -y
```

**Step 2: Create root package.json with workspaces**

```json
{
  "name": "mf-estimates",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "dev:frontend": "npm run dev --workspace=frontend",
    "dev:backend": "npm run dev --workspace=backend",
    "build": "npm run build --workspace=frontend && npm run build --workspace=backend",
    "test": "npm run test --workspace=frontend && npm run test --workspace=backend",
    "lint": "biome check .",
    "format": "biome format --write ."
  },
  "devDependencies": {
    "@biomejs/biome": "^1.9.4"
  }
}
```

**Step 3: Create Biome configuration**

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "semicolons": "always",
      "quoteStyle": "double",
      "trailingCommas": "es5"
    }
  }
}
```

**Step 4: Create .gitignore**

```
node_modules/
dist/
build/
.env
.DS_Store
*.log
coverage/
.vite/
```

**Step 5: Create Makefile**

```makefile
.PHONY: install dev build test lint clean

install:
	npm install

dev:
	docker-compose up

build:
	npm run build

test:
	npm run test

lint:
	npm run lint

format:
	npm run format

clean:
	rm -rf node_modules frontend/node_modules backend/node_modules
	rm -rf frontend/dist backend/dist
	docker-compose down -v
```

**Step 6: Install root dependencies**

Run: `npm install`
Expected: Dependencies installed, node_modules created

**Step 7: Commit project setup**

```bash
git add package.json biome.json .gitignore Makefile
git commit -m "chore: initialize project structure with Biome and workspaces"
```

---

## Task 2: Backend TypeScript Configuration & Dependencies

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/vitest.config.ts`
- Create: `backend/src/server.ts`

**Step 1: Create backend package.json**

```json
{
  "name": "@mf-estimates/backend",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "test": "vitest",
    "test:ci": "vitest run"
  },
  "dependencies": {
    "express": "^4.21.2",
    "socket.io": "^4.8.1",
    "winston": "^3.17.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/node": "^22.10.5",
    "@types/cors": "^2.8.17",
    "tsx": "^4.19.2",
    "typescript": "^5.7.3",
    "vitest": "^2.1.8",
    "socket.io-client": "^4.8.1"
  }
}
```

**Step 2: Create backend tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

**Step 3: Create backend vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
```

**Step 4: Create minimal backend server**

```typescript
// backend/src/server.ts
import express from "express";
import { createServer } from "node:http";

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 3001;

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Step 5: Install backend dependencies**

Run: `npm install --workspace=backend`
Expected: Backend dependencies installed

**Step 6: Test server starts**

Run: `npm run dev:backend`
Expected: "Server running on port 3001" printed, Ctrl+C to stop

**Step 7: Commit backend setup**

```bash
git add backend/
git commit -m "chore: setup backend with TypeScript and Express"
```

---

## Task 3: Backend Types & Data Models

**Files:**
- Create: `backend/src/types/types.ts`
- Create: `backend/src/types/types.test.ts`

**Step 1: Write test for Session ID generation**

```typescript
// backend/src/types/types.test.ts
import { describe, it, expect } from "vitest";
import { generateSessionId } from "./types.js";

describe("generateSessionId", () => {
  it("should generate a 6 character alphanumeric string", () => {
    const sessionId = generateSessionId();
    expect(sessionId).toHaveLength(6);
    expect(sessionId).toMatch(/^[A-Z0-9]{6}$/);
  });

  it("should generate unique IDs", () => {
    const id1 = generateSessionId();
    const id2 = generateSessionId();
    expect(id1).not.toBe(id2);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=backend`
Expected: FAIL - module not found

**Step 3: Create types.ts with interfaces and helper**

```typescript
// backend/src/types/types.ts
export interface Participant {
  socketId: string;
  name: string;
  isModerator: boolean;
  isObserver: boolean;
  currentEstimate: number | null;
}

export interface Round {
  estimates: Map<string, number>;
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

export type EstimateValue = 1 | 2 | 3 | 5 | 8 | 13 | 21 | -1; // -1 represents "?"

export function generateSessionId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=backend`
Expected: PASS - all tests green

**Step 5: Add test for name deduplication**

```typescript
// backend/src/types/types.test.ts
import { deduplicateName } from "./types.js";

describe("deduplicateName", () => {
  it("should return original name if not taken", () => {
    const result = deduplicateName("Tom", []);
    expect(result).toBe("Tom");
  });

  it("should add (2) if name exists once", () => {
    const result = deduplicateName("Tom", ["Tom"]);
    expect(result).toBe("Tom (2)");
  });

  it("should add (3) if name exists twice", () => {
    const result = deduplicateName("Tom", ["Tom", "Tom (2)"]);
    expect(result).toBe("Tom (3)");
  });
});
```

**Step 6: Run test to verify it fails**

Run: `npm run test --workspace=backend`
Expected: FAIL - deduplicateName not exported

**Step 7: Implement name deduplication**

```typescript
// backend/src/types/types.ts (add to file)
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

**Step 8: Run test to verify it passes**

Run: `npm run test --workspace=backend`
Expected: PASS - all tests green

**Step 9: Commit types and utilities**

```bash
git add backend/src/types/
git commit -m "feat(backend): add core types and utility functions"
```

---

## Task 4: Backend SessionService - Create Session

**Files:**
- Create: `backend/src/services/SessionService.ts`
- Create: `backend/src/services/SessionService.test.ts`

**Step 1: Write test for creating a session**

```typescript
// backend/src/services/SessionService.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { SessionService } from "./SessionService.js";

describe("SessionService", () => {
  let service: SessionService;

  beforeEach(() => {
    service = new SessionService();
  });

  describe("createSession", () => {
    it("should create a new session with generated ID", () => {
      const result = service.createSession("moderatorSocket123", "Alice");

      expect(result.sessionId).toHaveLength(6);
      expect(result.moderator.name).toBe("Alice");
      expect(result.moderator.socketId).toBe("moderatorSocket123");
      expect(result.moderator.isModerator).toBe(true);
      expect(result.moderator.isObserver).toBe(false);
    });

    it("should store the session internally", () => {
      const result = service.createSession("socket1", "Bob");
      const session = service.getSession(result.sessionId);

      expect(session).toBeDefined();
      expect(session?.id).toBe(result.sessionId);
    });

    it("should initialize with empty round", () => {
      const result = service.createSession("socket1", "Charlie");
      const session = service.getSession(result.sessionId);

      expect(session?.currentRound.estimates.size).toBe(0);
      expect(session?.currentRound.revealed).toBe(false);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=backend`
Expected: FAIL - SessionService not found

**Step 3: Implement SessionService.createSession**

```typescript
// backend/src/services/SessionService.ts
import type { Session, Participant } from "../types/types.js";
import { generateSessionId } from "../types/types.js";

export class SessionService {
  private sessions: Map<string, Session> = new Map();

  createSession(
    moderatorSocketId: string,
    moderatorName: string
  ): { sessionId: string; moderator: Participant } {
    const sessionId = generateSessionId();

    const moderator: Participant = {
      socketId: moderatorSocketId,
      name: moderatorName,
      isModerator: true,
      isObserver: false,
      currentEstimate: null,
    };

    const session: Session = {
      id: sessionId,
      moderatorSocketId,
      participants: new Map([[moderatorSocketId, moderator]]),
      currentRound: {
        estimates: new Map(),
        revealed: false,
      },
      createdAt: new Date(),
      lastActivity: new Date(),
    };

    this.sessions.set(sessionId, session);

    return { sessionId, moderator };
  }

  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=backend`
Expected: PASS - all tests green

**Step 5: Commit SessionService create**

```bash
git add backend/src/services/
git commit -m "feat(backend): implement SessionService.createSession"
```

---

## Task 5: Backend SessionService - Join Session

**Files:**
- Modify: `backend/src/services/SessionService.ts`
- Modify: `backend/src/services/SessionService.test.ts`

**Step 1: Write test for joining a session**

```typescript
// backend/src/services/SessionService.test.ts (add to describe block)
describe("joinSession", () => {
  it("should add participant to existing session", () => {
    const { sessionId } = service.createSession("socket1", "Alice");
    const result = service.joinSession(sessionId, "socket2", "Bob");

    expect(result.success).toBe(true);
    expect(result.participant?.name).toBe("Bob");
    expect(result.participant?.isModerator).toBe(false);

    const session = service.getSession(sessionId);
    expect(session?.participants.size).toBe(2);
  });

  it("should fail if session does not exist", () => {
    const result = service.joinSession("INVALID", "socket3", "Charlie");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Session not found");
  });

  it("should deduplicate names", () => {
    const { sessionId } = service.createSession("socket1", "Tom");
    const result = service.joinSession(sessionId, "socket2", "Tom");

    expect(result.success).toBe(true);
    expect(result.participant?.name).toBe("Tom (2)");
  });

  it("should update lastActivity timestamp", () => {
    const { sessionId } = service.createSession("socket1", "Alice");
    const session1 = service.getSession(sessionId);
    const timestamp1 = session1?.lastActivity.getTime();

    // Wait a tiny bit
    setTimeout(() => {
      service.joinSession(sessionId, "socket2", "Bob");
      const session2 = service.getSession(sessionId);
      const timestamp2 = session2?.lastActivity.getTime();

      expect(timestamp2).toBeGreaterThan(timestamp1!);
    }, 10);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=backend`
Expected: FAIL - joinSession not defined

**Step 3: Implement SessionService.joinSession**

```typescript
// backend/src/services/SessionService.ts (add to class)
import { deduplicateName } from "../types/types.js";

joinSession(
  sessionId: string,
  socketId: string,
  name: string
): { success: boolean; participant?: Participant; error?: string; participants?: Participant[] } {
  const session = this.sessions.get(sessionId);

  if (!session) {
    return { success: false, error: "Session not found" };
  }

  // Deduplicate name
  const existingNames = Array.from(session.participants.values()).map((p) => p.name);
  const uniqueName = deduplicateName(name, existingNames);

  const participant: Participant = {
    socketId,
    name: uniqueName,
    isModerator: false,
    isObserver: false,
    currentEstimate: null,
  };

  session.participants.set(socketId, participant);
  session.lastActivity = new Date();

  const participants = Array.from(session.participants.values());

  return { success: true, participant, participants };
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=backend`
Expected: PASS - all tests green

**Step 5: Commit joinSession**

```bash
git add backend/src/services/SessionService.ts backend/src/services/SessionService.test.ts
git commit -m "feat(backend): implement SessionService.joinSession with name deduplication"
```

---

## Task 6: Backend SessionService - Submit Estimate

**Files:**
- Modify: `backend/src/services/SessionService.ts`
- Modify: `backend/src/services/SessionService.test.ts`

**Step 1: Write test for submitting estimate**

```typescript
// backend/src/services/SessionService.test.ts (add to describe block)
describe("submitEstimate", () => {
  it("should store participant estimate", () => {
    const { sessionId } = service.createSession("socket1", "Alice");
    service.joinSession(sessionId, "socket2", "Bob");

    const result = service.submitEstimate(sessionId, "socket2", 5);

    expect(result.success).toBe(true);
    const session = service.getSession(sessionId);
    expect(session?.currentRound.estimates.get("socket2")).toBe(5);
  });

  it("should fail if session not found", () => {
    const result = service.submitEstimate("INVALID", "socket1", 3);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Session not found");
  });

  it("should fail if participant not in session", () => {
    const { sessionId } = service.createSession("socket1", "Alice");
    const result = service.submitEstimate(sessionId, "unknownSocket", 8);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Participant not found");
  });

  it("should fail if round already revealed", () => {
    const { sessionId } = service.createSession("socket1", "Alice");
    service.submitEstimate(sessionId, "socket1", 3);
    service.revealCards(sessionId, "socket1");

    const result = service.submitEstimate(sessionId, "socket1", 5);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Round already revealed");
  });

  it("should fail if participant is observer", () => {
    const { sessionId } = service.createSession("socket1", "Alice");
    service.joinSession(sessionId, "socket2", "Bob");
    service.toggleObserver(sessionId, "socket1", "socket2");

    const result = service.submitEstimate(sessionId, "socket2", 5);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Observers cannot estimate");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=backend`
Expected: FAIL - submitEstimate not defined

**Step 3: Implement SessionService.submitEstimate**

```typescript
// backend/src/services/SessionService.ts (add to class)
submitEstimate(
  sessionId: string,
  socketId: string,
  estimate: number
): { success: boolean; error?: string } {
  const session = this.sessions.get(sessionId);

  if (!session) {
    return { success: false, error: "Session not found" };
  }

  const participant = session.participants.get(socketId);

  if (!participant) {
    return { success: false, error: "Participant not found" };
  }

  if (participant.isObserver) {
    return { success: false, error: "Observers cannot estimate" };
  }

  if (session.currentRound.revealed) {
    return { success: false, error: "Round already revealed" };
  }

  session.currentRound.estimates.set(socketId, estimate);
  participant.currentEstimate = estimate;
  session.lastActivity = new Date();

  return { success: true };
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=backend`
Expected: FAIL - toggleObserver and revealCards not defined

**Step 5: Add stub methods for missing dependencies**

```typescript
// backend/src/services/SessionService.ts (add to class)
revealCards(sessionId: string, moderatorSocketId: string): { success: boolean; error?: string } {
  const session = this.sessions.get(sessionId);

  if (!session) {
    return { success: false, error: "Session not found" };
  }

  if (session.moderatorSocketId !== moderatorSocketId) {
    return { success: false, error: "Only moderator can reveal" };
  }

  session.currentRound.revealed = true;
  session.lastActivity = new Date();

  return { success: true };
}

toggleObserver(
  sessionId: string,
  requesterSocketId: string,
  targetSocketId: string
): { success: boolean; error?: string } {
  const session = this.sessions.get(sessionId);

  if (!session) {
    return { success: false, error: "Session not found" };
  }

  const participant = session.participants.get(targetSocketId);

  if (!participant) {
    return { success: false, error: "Participant not found" };
  }

  // Only moderator or self can toggle
  if (requesterSocketId !== session.moderatorSocketId && requesterSocketId !== targetSocketId) {
    return { success: false, error: "Unauthorized" };
  }

  participant.isObserver = !participant.isObserver;
  session.lastActivity = new Date();

  return { success: true };
}
```

**Step 6: Run test to verify it passes**

Run: `npm run test --workspace=backend`
Expected: PASS - all tests green

**Step 7: Commit submitEstimate**

```bash
git add backend/src/services/SessionService.ts backend/src/services/SessionService.test.ts
git commit -m "feat(backend): implement SessionService.submitEstimate with validation"
```

---

## Task 7: Backend SessionService - Reveal Cards & New Round

**Files:**
- Modify: `backend/src/services/SessionService.ts`
- Modify: `backend/src/services/SessionService.test.ts`

**Step 1: Write test for revealing cards**

```typescript
// backend/src/services/SessionService.test.ts (add to describe block)
describe("revealCards", () => {
  it("should reveal all estimates and calculate average", () => {
    const { sessionId } = service.createSession("socket1", "Alice");
    service.joinSession(sessionId, "socket2", "Bob");
    service.joinSession(sessionId, "socket3", "Charlie");

    service.submitEstimate(sessionId, "socket1", 5);
    service.submitEstimate(sessionId, "socket2", 8);
    service.submitEstimate(sessionId, "socket3", 13);

    const result = service.revealCards(sessionId, "socket1");

    expect(result.success).toBe(true);
    expect(result.estimates?.size).toBe(3);
    expect(result.average).toBe((5 + 8 + 13) / 3);

    const session = service.getSession(sessionId);
    expect(session?.currentRound.revealed).toBe(true);
  });

  it("should exclude ? (-1) from average calculation", () => {
    const { sessionId } = service.createSession("socket1", "Alice");
    service.joinSession(sessionId, "socket2", "Bob");

    service.submitEstimate(sessionId, "socket1", 5);
    service.submitEstimate(sessionId, "socket2", -1); // ? card

    const result = service.revealCards(sessionId, "socket1");

    expect(result.success).toBe(true);
    expect(result.average).toBe(5); // Only 5 counted
  });

  it("should fail if not moderator", () => {
    const { sessionId } = service.createSession("socket1", "Alice");
    service.joinSession(sessionId, "socket2", "Bob");

    const result = service.revealCards(sessionId, "socket2");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Only moderator can reveal");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=backend`
Expected: FAIL - return type incorrect

**Step 3: Update revealCards implementation**

```typescript
// backend/src/services/SessionService.ts (replace revealCards)
revealCards(
  sessionId: string,
  moderatorSocketId: string
): { success: boolean; error?: string; estimates?: Map<string, number>; average?: number } {
  const session = this.sessions.get(sessionId);

  if (!session) {
    return { success: false, error: "Session not found" };
  }

  if (session.moderatorSocketId !== moderatorSocketId) {
    return { success: false, error: "Only moderator can reveal" };
  }

  session.currentRound.revealed = true;
  session.lastActivity = new Date();

  // Calculate average (exclude -1 which represents "?")
  const validEstimates = Array.from(session.currentRound.estimates.values()).filter(
    (e) => e !== -1
  );

  const average =
    validEstimates.length > 0
      ? validEstimates.reduce((sum, val) => sum + val, 0) / validEstimates.length
      : 0;

  return {
    success: true,
    estimates: session.currentRound.estimates,
    average,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=backend`
Expected: PASS - all tests green

**Step 5: Write test for new round**

```typescript
// backend/src/services/SessionService.test.ts (add to describe block)
describe("newRound", () => {
  it("should reset round and clear estimates", () => {
    const { sessionId } = service.createSession("socket1", "Alice");
    service.joinSession(sessionId, "socket2", "Bob");

    service.submitEstimate(sessionId, "socket1", 5);
    service.submitEstimate(sessionId, "socket2", 8);
    service.revealCards(sessionId, "socket1");

    const result = service.newRound(sessionId, "socket1");

    expect(result.success).toBe(true);

    const session = service.getSession(sessionId);
    expect(session?.currentRound.estimates.size).toBe(0);
    expect(session?.currentRound.revealed).toBe(false);

    // Participant estimates should be reset
    const alice = session?.participants.get("socket1");
    expect(alice?.currentEstimate).toBeNull();
  });

  it("should fail if not moderator", () => {
    const { sessionId } = service.createSession("socket1", "Alice");
    service.joinSession(sessionId, "socket2", "Bob");

    const result = service.newRound(sessionId, "socket2");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Only moderator can start new round");
  });
});
```

**Step 6: Run test to verify it fails**

Run: `npm run test --workspace=backend`
Expected: FAIL - newRound not defined

**Step 7: Implement newRound**

```typescript
// backend/src/services/SessionService.ts (add to class)
newRound(sessionId: string, moderatorSocketId: string): { success: boolean; error?: string } {
  const session = this.sessions.get(sessionId);

  if (!session) {
    return { success: false, error: "Session not found" };
  }

  if (session.moderatorSocketId !== moderatorSocketId) {
    return { success: false, error: "Only moderator can start new round" };
  }

  // Reset round
  session.currentRound = {
    estimates: new Map(),
    revealed: false,
  };

  // Reset participant estimates
  for (const participant of session.participants.values()) {
    participant.currentEstimate = null;
  }

  session.lastActivity = new Date();

  return { success: true };
}
```

**Step 8: Run test to verify it passes**

Run: `npm run test --workspace=backend`
Expected: PASS - all tests green

**Step 9: Commit reveal and new round**

```bash
git add backend/src/services/SessionService.ts backend/src/services/SessionService.test.ts
git commit -m "feat(backend): implement revealCards and newRound with average calculation"
```

---

## Task 8: Backend SessionService - Participant Management

**Files:**
- Modify: `backend/src/services/SessionService.ts`
- Modify: `backend/src/services/SessionService.test.ts`

**Step 1: Write test for removing participant**

```typescript
// backend/src/services/SessionService.test.ts (add to describe block)
describe("removeParticipant", () => {
  it("should remove participant from session", () => {
    const { sessionId } = service.createSession("socket1", "Alice");
    service.joinSession(sessionId, "socket2", "Bob");

    const result = service.removeParticipant(sessionId, "socket2");

    expect(result.success).toBe(true);
    const session = service.getSession(sessionId);
    expect(session?.participants.size).toBe(1);
    expect(session?.participants.has("socket2")).toBe(false);
  });

  it("should transfer moderator if moderator leaves", () => {
    const { sessionId } = service.createSession("socket1", "Alice");
    service.joinSession(sessionId, "socket2", "Bob");

    const result = service.removeParticipant(sessionId, "socket1");

    expect(result.success).toBe(true);
    expect(result.newModeratorSocketId).toBe("socket2");

    const session = service.getSession(sessionId);
    expect(session?.moderatorSocketId).toBe("socket2");

    const bob = session?.participants.get("socket2");
    expect(bob?.isModerator).toBe(true);
  });

  it("should delete session if last participant leaves", () => {
    const { sessionId } = service.createSession("socket1", "Alice");

    const result = service.removeParticipant(sessionId, "socket1");

    expect(result.success).toBe(true);
    expect(result.sessionDeleted).toBe(true);
    expect(service.getSession(sessionId)).toBeUndefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=backend`
Expected: FAIL - removeParticipant not defined

**Step 3: Implement removeParticipant**

```typescript
// backend/src/services/SessionService.ts (add to class)
removeParticipant(
  sessionId: string,
  socketId: string
): { success: boolean; newModeratorSocketId?: string; sessionDeleted?: boolean; error?: string } {
  const session = this.sessions.get(sessionId);

  if (!session) {
    return { success: false, error: "Session not found" };
  }

  session.participants.delete(socketId);
  session.currentRound.estimates.delete(socketId);

  // If last participant, delete session
  if (session.participants.size === 0) {
    this.sessions.delete(sessionId);
    return { success: true, sessionDeleted: true };
  }

  // If moderator left, transfer to oldest participant
  if (session.moderatorSocketId === socketId) {
    const newModerator = Array.from(session.participants.values())[0];
    newModerator.isModerator = true;
    session.moderatorSocketId = newModerator.socketId;

    return { success: true, newModeratorSocketId: newModerator.socketId };
  }

  return { success: true };
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=backend`
Expected: PASS - all tests green

**Step 5: Write test for transferring moderator**

```typescript
// backend/src/services/SessionService.test.ts (add to describe block)
describe("transferModerator", () => {
  it("should transfer moderator role to target participant", () => {
    const { sessionId } = service.createSession("socket1", "Alice");
    service.joinSession(sessionId, "socket2", "Bob");

    const result = service.transferModerator(sessionId, "socket1", "socket2");

    expect(result.success).toBe(true);

    const session = service.getSession(sessionId);
    expect(session?.moderatorSocketId).toBe("socket2");

    const alice = session?.participants.get("socket1");
    const bob = session?.participants.get("socket2");

    expect(alice?.isModerator).toBe(false);
    expect(bob?.isModerator).toBe(true);
  });

  it("should fail if requester is not moderator", () => {
    const { sessionId } = service.createSession("socket1", "Alice");
    service.joinSession(sessionId, "socket2", "Bob");

    const result = service.transferModerator(sessionId, "socket2", "socket1");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Only moderator can transfer role");
  });

  it("should fail if target does not exist", () => {
    const { sessionId } = service.createSession("socket1", "Alice");

    const result = service.transferModerator(sessionId, "socket1", "unknownSocket");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Target participant not found");
  });
});
```

**Step 6: Run test to verify it fails**

Run: `npm run test --workspace=backend`
Expected: FAIL - transferModerator not defined

**Step 7: Implement transferModerator**

```typescript
// backend/src/services/SessionService.ts (add to class)
transferModerator(
  sessionId: string,
  currentModeratorSocketId: string,
  targetSocketId: string
): { success: boolean; error?: string } {
  const session = this.sessions.get(sessionId);

  if (!session) {
    return { success: false, error: "Session not found" };
  }

  if (session.moderatorSocketId !== currentModeratorSocketId) {
    return { success: false, error: "Only moderator can transfer role" };
  }

  const target = session.participants.get(targetSocketId);

  if (!target) {
    return { success: false, error: "Target participant not found" };
  }

  // Remove moderator flag from current
  const current = session.participants.get(currentModeratorSocketId);
  if (current) {
    current.isModerator = false;
  }

  // Set new moderator
  target.isModerator = true;
  session.moderatorSocketId = targetSocketId;
  session.lastActivity = new Date();

  return { success: true };
}
```

**Step 8: Run test to verify it passes**

Run: `npm run test --workspace=backend`
Expected: PASS - all tests green

**Step 9: Commit participant management**

```bash
git add backend/src/services/SessionService.ts backend/src/services/SessionService.test.ts
git commit -m "feat(backend): implement participant removal and moderator transfer"
```

---

## Task 9: Backend Socket.io Event Handlers

**Files:**
- Create: `backend/src/services/EventHandlers.ts`
- Create: `backend/src/services/EventHandlers.test.ts`

**Step 1: Write test for create_session event**

```typescript
// backend/src/services/EventHandlers.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Socket } from "socket.io";
import { EventHandlers } from "./EventHandlers.js";
import { SessionService } from "./SessionService.js";

describe("EventHandlers", () => {
  let sessionService: SessionService;
  let handlers: EventHandlers;
  let mockSocket: any;
  let mockIo: any;

  beforeEach(() => {
    sessionService = new SessionService();
    mockSocket = {
      id: "socket123",
      join: vi.fn(),
      emit: vi.fn(),
    };
    mockIo = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };
    handlers = new EventHandlers(sessionService, mockIo);
  });

  describe("handleCreateSession", () => {
    it("should create session and emit session_created event", () => {
      handlers.handleCreateSession(mockSocket, { name: "Alice" });

      expect(mockSocket.join).toHaveBeenCalledWith(expect.any(String));
      expect(mockSocket.emit).toHaveBeenCalledWith(
        "session_created",
        expect.objectContaining({
          sessionId: expect.any(String),
          moderator: expect.objectContaining({
            name: "Alice",
            isModerator: true,
          }),
        })
      );
    });

    it("should emit error if name is empty", () => {
      handlers.handleCreateSession(mockSocket, { name: "" });

      expect(mockSocket.emit).toHaveBeenCalledWith("error", {
        message: "Name is required",
      });
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=backend`
Expected: FAIL - EventHandlers not found

**Step 3: Implement EventHandlers with create_session**

```typescript
// backend/src/services/EventHandlers.ts
import type { Server, Socket } from "socket.io";
import type { SessionService } from "./SessionService.js";

export class EventHandlers {
  constructor(
    private sessionService: SessionService,
    private io: Server
  ) {}

  handleCreateSession(socket: Socket, payload: { name: string }): void {
    if (!payload.name || payload.name.trim() === "") {
      socket.emit("error", { message: "Name is required" });
      return;
    }

    const result = this.sessionService.createSession(socket.id, payload.name.trim());

    socket.join(result.sessionId);

    socket.emit("session_created", {
      sessionId: result.sessionId,
      moderator: result.moderator,
    });
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=backend`
Expected: PASS - all tests green

**Step 5: Write test for join_session event**

```typescript
// backend/src/services/EventHandlers.test.ts (add to describe block)
describe("handleJoinSession", () => {
  it("should join existing session and emit events", () => {
    // Create session first
    handlers.handleCreateSession(mockSocket, { name: "Alice" });
    const sessionId = mockSocket.emit.mock.calls[0][1].sessionId;

    // Join with new socket
    const mockSocket2 = {
      id: "socket456",
      join: vi.fn(),
      emit: vi.fn(),
    };

    handlers.handleJoinSession(mockSocket2 as any, {
      sessionId,
      name: "Bob",
    });

    expect(mockSocket2.join).toHaveBeenCalledWith(sessionId);
    expect(mockSocket2.emit).toHaveBeenCalledWith(
      "joined_session",
      expect.objectContaining({
        participants: expect.any(Array),
        isModerator: false,
      })
    );
    expect(mockIo.to).toHaveBeenCalledWith(sessionId);
    expect(mockIo.emit).toHaveBeenCalledWith(
      "participant_joined",
      expect.objectContaining({
        participant: expect.objectContaining({ name: "Bob" }),
      })
    );
  });

  it("should emit error if session not found", () => {
    handlers.handleJoinSession(mockSocket, {
      sessionId: "INVALID",
      name: "Bob",
    });

    expect(mockSocket.emit).toHaveBeenCalledWith("error", {
      message: "Session not found",
    });
  });
});
```

**Step 6: Run test to verify it fails**

Run: `npm run test --workspace=backend`
Expected: FAIL - handleJoinSession not defined

**Step 7: Implement handleJoinSession**

```typescript
// backend/src/services/EventHandlers.ts (add to class)
handleJoinSession(socket: Socket, payload: { sessionId: string; name: string }): void {
  if (!payload.name || payload.name.trim() === "") {
    socket.emit("error", { message: "Name is required" });
    return;
  }

  const result = this.sessionService.joinSession(
    payload.sessionId,
    socket.id,
    payload.name.trim()
  );

  if (!result.success) {
    socket.emit("error", { message: result.error });
    return;
  }

  socket.join(payload.sessionId);

  socket.emit("joined_session", {
    participants: result.participants,
    isModerator: result.participant?.isModerator,
  });

  // Notify others
  socket.to(payload.sessionId).emit("participant_joined", {
    participant: result.participant,
  });
}
```

**Step 8: Run test to verify it passes**

Run: `npm run test --workspace=backend`
Expected: PASS - all tests green

**Step 9: Commit event handlers foundation**

```bash
git add backend/src/services/EventHandlers.ts backend/src/services/EventHandlers.test.ts
git commit -m "feat(backend): implement Socket.io event handlers for create and join"
```

---

## Task 10: Complete Backend Event Handlers

**Files:**
- Modify: `backend/src/services/EventHandlers.ts`
- Modify: `backend/src/services/EventHandlers.test.ts`

**Step 1: Add remaining handler methods (no tests yet)**

```typescript
// backend/src/services/EventHandlers.ts (add to class)
handleSubmitEstimate(
  socket: Socket,
  sessionId: string,
  payload: { estimate: number }
): void {
  const result = this.sessionService.submitEstimate(sessionId, socket.id, payload.estimate);

  if (!result.success) {
    socket.emit("error", { message: result.error });
    return;
  }

  // Notify all participants (don't reveal the value)
  this.io.to(sessionId).emit("estimate_submitted", {
    socketId: socket.id,
  });
}

handleRevealCards(socket: Socket, sessionId: string): void {
  const result = this.sessionService.revealCards(sessionId, socket.id);

  if (!result.success) {
    socket.emit("error", { message: result.error });
    return;
  }

  // Convert Map to object for JSON serialization
  const estimatesObj: Record<string, number> = {};
  result.estimates?.forEach((value, key) => {
    estimatesObj[key] = value;
  });

  this.io.to(sessionId).emit("cards_revealed", {
    estimates: estimatesObj,
    average: result.average,
  });
}

handleNewRound(socket: Socket, sessionId: string): void {
  const result = this.sessionService.newRound(sessionId, socket.id);

  if (!result.success) {
    socket.emit("error", { message: result.error });
    return;
  }

  this.io.to(sessionId).emit("round_reset");
}

handleTransferModerator(
  socket: Socket,
  sessionId: string,
  payload: { targetSocketId: string }
): void {
  const result = this.sessionService.transferModerator(
    sessionId,
    socket.id,
    payload.targetSocketId
  );

  if (!result.success) {
    socket.emit("error", { message: result.error });
    return;
  }

  this.io.to(sessionId).emit("moderator_transferred", {
    newModeratorSocketId: payload.targetSocketId,
  });
}

handleToggleObserver(
  socket: Socket,
  sessionId: string,
  payload: { targetSocketId?: string }
): void {
  const targetSocketId = payload.targetSocketId || socket.id;

  const result = this.sessionService.toggleObserver(sessionId, socket.id, targetSocketId);

  if (!result.success) {
    socket.emit("error", { message: result.error });
    return;
  }

  const session = this.sessionService.getSession(sessionId);
  const participant = session?.participants.get(targetSocketId);

  this.io.to(sessionId).emit("observer_toggled", {
    socketId: targetSocketId,
    isObserver: participant?.isObserver || false,
  });
}

handleDisconnect(socket: Socket, sessionId: string | null): void {
  if (!sessionId) return;

  const result = this.sessionService.removeParticipant(sessionId, socket.id);

  if (!result.success) return;

  if (result.sessionDeleted) {
    // Session is gone, no need to notify
    return;
  }

  socket.to(sessionId).emit("participant_left", {
    socketId: socket.id,
  });

  if (result.newModeratorSocketId) {
    this.io.to(sessionId).emit("moderator_transferred", {
      newModeratorSocketId: result.newModeratorSocketId,
    });
  }
}
```

**Step 2: Commit complete event handlers**

```bash
git add backend/src/services/EventHandlers.ts
git commit -m "feat(backend): implement all Socket.io event handlers"
```

---

## Task 11: Backend Server Integration

**Files:**
- Modify: `backend/src/server.ts`
- Create: `backend/src/logger.ts`

**Step 1: Create logger utility**

```typescript
// backend/src/logger.ts
import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});
```

**Step 2: Integrate Socket.io with Express server**

```typescript
// backend/src/server.ts
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import { SessionService } from "./services/SessionService.js";
import { EventHandlers } from "./services/EventHandlers.js";
import { logger } from "./logger.js";

const app = express();
const httpServer = createServer(app);

// CORS for development
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
});

const sessionService = new SessionService();
const eventHandlers = new EventHandlers(sessionService, io);

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Metrics
app.get("/metrics", (_req, res) => {
  const stats = sessionService.getStats();
  res.status(200).json(stats);
});

// Socket.io connection handling
io.on("connection", (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  let currentSessionId: string | null = null;

  socket.on("create_session", (payload) => {
    logger.info(`create_session from ${socket.id}`, { name: payload.name });
    eventHandlers.handleCreateSession(socket, payload);
  });

  socket.on("join_session", (payload) => {
    logger.info(`join_session from ${socket.id}`, {
      sessionId: payload.sessionId,
      name: payload.name,
    });
    currentSessionId = payload.sessionId;
    eventHandlers.handleJoinSession(socket, payload);
  });

  socket.on("submit_estimate", (payload) => {
    if (!currentSessionId) return;
    logger.info(`submit_estimate from ${socket.id}`, { estimate: payload.estimate });
    eventHandlers.handleSubmitEstimate(socket, currentSessionId, payload);
  });

  socket.on("reveal_cards", () => {
    if (!currentSessionId) return;
    logger.info(`reveal_cards from ${socket.id}`);
    eventHandlers.handleRevealCards(socket, currentSessionId);
  });

  socket.on("new_round", () => {
    if (!currentSessionId) return;
    logger.info(`new_round from ${socket.id}`);
    eventHandlers.handleNewRound(socket, currentSessionId);
  });

  socket.on("transfer_moderator", (payload) => {
    if (!currentSessionId) return;
    logger.info(`transfer_moderator from ${socket.id}`, {
      targetSocketId: payload.targetSocketId,
    });
    eventHandlers.handleTransferModerator(socket, currentSessionId, payload);
  });

  socket.on("toggle_observer", (payload) => {
    if (!currentSessionId) return;
    logger.info(`toggle_observer from ${socket.id}`, {
      targetSocketId: payload.targetSocketId,
    });
    eventHandlers.handleToggleObserver(socket, currentSessionId, payload);
  });

  socket.on("disconnect", () => {
    logger.info(`Client disconnected: ${socket.id}`);
    eventHandlers.handleDisconnect(socket, currentSessionId);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
```

**Step 3: Add getStats method to SessionService**

```typescript
// backend/src/services/SessionService.ts (add to class)
getStats(): { activeSessions: number; connectedUsers: number } {
  let totalUsers = 0;
  for (const session of this.sessions.values()) {
    totalUsers += session.participants.size;
  }

  return {
    activeSessions: this.sessions.size,
    connectedUsers: totalUsers,
  };
}
```

**Step 4: Test server manually**

Run: `npm run dev:backend`
Expected: "Server running on port 3001", no errors

Test endpoints:
```bash
curl http://localhost:3001/health
curl http://localhost:3001/metrics
```

Expected: JSON responses with 200 status

**Step 5: Commit server integration**

```bash
git add backend/src/server.ts backend/src/logger.ts backend/src/services/SessionService.ts
git commit -m "feat(backend): integrate Socket.io with Express server and add logging"
```

---

## Task 12: Frontend Project Setup

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/index.html`
- Create: `frontend/src/vite-env.d.ts`

**Step 1: Create frontend package.json**

```json
{
  "name": "@mf-estimates/frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ci": "vitest run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.1.3",
    "socket.io-client": "^4.8.1",
    "styled-components": "^6.1.15"
  },
  "devDependencies": {
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.3",
    "vite": "^6.0.7",
    "vitest": "^2.1.8"
  }
}
```

**Step 2: Create frontend tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Step 3: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

**Step 4: Create vite.config.ts**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/socket.io": {
        target: "http://localhost:3001",
        ws: true,
      },
    },
  },
});
```

**Step 5: Create index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MF EstiMates - Planning Poker</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
          Arial, sans-serif;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 6: Create vite-env.d.ts**

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_BRAND_NAME: string;
  readonly VITE_BRAND_LOGO_URL: string;
  readonly VITE_BRAND_PRIMARY_COLOR: string;
  readonly VITE_BRAND_FOOTER_TEXT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

**Step 7: Install frontend dependencies**

Run: `npm install --workspace=frontend`
Expected: Dependencies installed

**Step 8: Commit frontend setup**

```bash
git add frontend/
git commit -m "chore: setup frontend with React, Vite, and TypeScript"
```

---

## Task 13: Frontend Types & Socket Hook

**Files:**
- Create: `frontend/src/types/types.ts`
- Create: `frontend/src/hooks/useSocket.ts`
- Create: `frontend/src/hooks/useSocket.test.ts`

**Step 1: Create frontend types**

```typescript
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
```

**Step 2: Create useSocket hook**

```typescript
// frontend/src/hooks/useSocket.ts
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Connected to server");
      setConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, connected };
}
```

**Step 3: Write test for useSocket hook**

```typescript
// frontend/src/hooks/useSocket.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSocket } from "./useSocket";

// Mock socket.io-client
vi.mock("socket.io-client", () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    close: vi.fn(),
  })),
}));

describe("useSocket", () => {
  it("should create socket connection on mount", () => {
    const { result } = renderHook(() => useSocket());

    expect(result.current.socket).toBeDefined();
  });

  it("should initially be disconnected", () => {
    const { result } = renderHook(() => useSocket());

    expect(result.current.connected).toBe(false);
  });

  // Note: More thorough testing would require proper socket.io mocking
  // For now, we validate that the hook structure is correct
});
```

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=frontend`
Expected: PASS - tests green

**Step 5: Commit socket hook**

```bash
git add frontend/src/types/ frontend/src/hooks/
git commit -m "feat(frontend): add types and useSocket hook"
```

---

## Task 14: Frontend Theme & Branding

**Files:**
- Create: `frontend/src/styles/theme.ts`
- Create: `frontend/src/contexts/BrandingContext.tsx`

**Step 1: Create theme configuration**

```typescript
// frontend/src/styles/theme.ts
export interface Theme {
  brandName: string;
  brandLogoUrl: string;
  brandPrimaryColor: string;
  brandFooterText: string;
  colors: {
    primary: string;
    primaryHover: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    error: string;
    warning: string;
    waiting: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

export function createTheme(primaryColor: string): Theme {
  return {
    brandName: import.meta.env.VITE_BRAND_NAME || "Mayflower GmbH",
    brandLogoUrl: import.meta.env.VITE_BRAND_LOGO_URL || "/assets/logo.svg",
    brandPrimaryColor: primaryColor,
    brandFooterText:
      import.meta.env.VITE_BRAND_FOOTER_TEXT || "Part of Mayflower Agile Tools",
    colors: {
      primary: primaryColor,
      primaryHover: darkenColor(primaryColor, 10),
      background: "#f5f5f5",
      surface: "#ffffff",
      text: "#212121",
      textSecondary: "#757575",
      border: "#e0e0e0",
      success: "#4caf50",
      error: "#f44336",
      warning: "#ff9800",
      waiting: "#9e9e9e",
    },
    spacing: {
      xs: "4px",
      sm: "8px",
      md: "16px",
      lg: "24px",
      xl: "32px",
    },
    borderRadius: {
      sm: "4px",
      md: "8px",
      lg: "16px",
    },
    shadows: {
      sm: "0 1px 3px rgba(0,0,0,0.12)",
      md: "0 4px 6px rgba(0,0,0,0.16)",
      lg: "0 10px 20px rgba(0,0,0,0.19)",
    },
  };
}

function darkenColor(hex: string, percent: number): string {
  // Simple color darkening (production should use a proper library)
  const num = Number.parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
}
```

**Step 2: Create BrandingContext**

```typescript
// frontend/src/contexts/BrandingContext.tsx
import React, { createContext, useContext, useMemo } from "react";
import { ThemeProvider } from "styled-components";
import { createTheme, type Theme } from "../styles/theme";

const BrandingContext = createContext<Theme | null>(null);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const primaryColor = import.meta.env.VITE_BRAND_PRIMARY_COLOR || "#1a73e8";
  const theme = useMemo(() => createTheme(primaryColor), [primaryColor]);

  return (
    <BrandingContext.Provider value={theme}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </BrandingContext.Provider>
  );
}

export function useBranding(): Theme {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within BrandingProvider");
  }
  return context;
}
```

**Step 3: Commit theme and branding**

```bash
git add frontend/src/styles/ frontend/src/contexts/
git commit -m "feat(frontend): add theme system and branding context"
```

---

## Task 15: Frontend Session Context

**Files:**
- Create: `frontend/src/contexts/SessionContext.tsx`
- Create: `frontend/src/contexts/SessionContext.test.tsx`

**Step 1: Write test for SessionContext**

```typescript
// frontend/src/contexts/SessionContext.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { SessionProvider, useSession } from "./SessionContext";
import type { Socket } from "socket.io-client";

describe("SessionContext", () => {
  let mockSocket: Partial<Socket>;

  beforeEach(() => {
    mockSocket = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    };
  });

  it("should provide initial state", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SessionProvider socket={mockSocket as Socket}>{children}</SessionProvider>
    );

    const { result } = renderHook(() => useSession(), { wrapper });

    expect(result.current.sessionId).toBeNull();
    expect(result.current.participants).toEqual([]);
    expect(result.current.isModerator).toBe(false);
  });

  // More tests would require proper socket mocking
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=frontend`
Expected: FAIL - SessionContext not found

**Step 3: Implement SessionContext**

```typescript
// frontend/src/contexts/SessionContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Socket } from "socket.io-client";
import type { Participant } from "../types/types";

interface SessionState {
  sessionId: string | null;
  participants: Participant[];
  isModerator: boolean;
  currentEstimate: number | null;
  roundRevealed: boolean;
  revealedEstimates: Record<string, number> | null;
  average: number | null;
}

interface SessionContextType extends SessionState {
  createSession: (name: string) => void;
  joinSession: (sessionId: string, name: string) => void;
  submitEstimate: (estimate: number) => void;
  revealCards: () => void;
  newRound: () => void;
  transferModerator: (targetSocketId: string) => void;
  toggleObserver: (targetSocketId?: string) => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

interface Props {
  children: React.ReactNode;
  socket: Socket | null;
}

export function SessionProvider({ children, socket }: Props) {
  const [state, setState] = useState<SessionState>({
    sessionId: null,
    participants: [],
    isModerator: false,
    currentEstimate: null,
    roundRevealed: false,
    revealedEstimates: null,
    average: null,
  });

  // Event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("session_created", (data) => {
      setState((prev) => ({
        ...prev,
        sessionId: data.sessionId,
        participants: [data.moderator],
        isModerator: true,
      }));
    });

    socket.on("joined_session", (data) => {
      setState((prev) => ({
        ...prev,
        participants: data.participants,
        isModerator: data.isModerator,
      }));
    });

    socket.on("participant_joined", (data) => {
      setState((prev) => ({
        ...prev,
        participants: [...prev.participants, data.participant],
      }));
    });

    socket.on("participant_left", (data) => {
      setState((prev) => ({
        ...prev,
        participants: prev.participants.filter((p) => p.socketId !== data.socketId),
      }));
    });

    socket.on("estimate_submitted", (data) => {
      setState((prev) => ({
        ...prev,
        participants: prev.participants.map((p) =>
          p.socketId === data.socketId ? { ...p, currentEstimate: -999 } : p
        ),
      }));
    });

    socket.on("cards_revealed", (data) => {
      setState((prev) => ({
        ...prev,
        roundRevealed: true,
        revealedEstimates: data.estimates,
        average: data.average,
      }));
    });

    socket.on("round_reset", () => {
      setState((prev) => ({
        ...prev,
        currentEstimate: null,
        roundRevealed: false,
        revealedEstimates: null,
        average: null,
        participants: prev.participants.map((p) => ({ ...p, currentEstimate: null })),
      }));
    });

    socket.on("moderator_transferred", (data) => {
      setState((prev) => ({
        ...prev,
        isModerator: socket.id === data.newModeratorSocketId,
        participants: prev.participants.map((p) => ({
          ...p,
          isModerator: p.socketId === data.newModeratorSocketId,
        })),
      }));
    });

    socket.on("observer_toggled", (data) => {
      setState((prev) => ({
        ...prev,
        participants: prev.participants.map((p) =>
          p.socketId === data.socketId ? { ...p, isObserver: data.isObserver } : p
        ),
      }));
    });

    socket.on("error", (data) => {
      console.error("Socket error:", data.message);
      alert(data.message);
    });

    return () => {
      socket.off("session_created");
      socket.off("joined_session");
      socket.off("participant_joined");
      socket.off("participant_left");
      socket.off("estimate_submitted");
      socket.off("cards_revealed");
      socket.off("round_reset");
      socket.off("moderator_transferred");
      socket.off("observer_toggled");
      socket.off("error");
    };
  }, [socket]);

  // Actions
  const createSession = useCallback(
    (name: string) => {
      if (!socket) return;
      socket.emit("create_session", { name });
    },
    [socket]
  );

  const joinSession = useCallback(
    (sessionId: string, name: string) => {
      if (!socket) return;
      socket.emit("join_session", { sessionId, name });
      setState((prev) => ({ ...prev, sessionId }));
    },
    [socket]
  );

  const submitEstimate = useCallback(
    (estimate: number) => {
      if (!socket) return;
      socket.emit("submit_estimate", { estimate });
      setState((prev) => ({ ...prev, currentEstimate: estimate }));
    },
    [socket]
  );

  const revealCards = useCallback(() => {
    if (!socket) return;
    socket.emit("reveal_cards");
  }, [socket]);

  const newRound = useCallback(() => {
    if (!socket) return;
    socket.emit("new_round");
  }, [socket]);

  const transferModerator = useCallback(
    (targetSocketId: string) => {
      if (!socket) return;
      socket.emit("transfer_moderator", { targetSocketId });
    },
    [socket]
  );

  const toggleObserver = useCallback(
    (targetSocketId?: string) => {
      if (!socket) return;
      socket.emit("toggle_observer", { targetSocketId });
    },
    [socket]
  );

  const value: SessionContextType = {
    ...state,
    createSession,
    joinSession,
    submitEstimate,
    revealCards,
    newRound,
    transferModerator,
    toggleObserver,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=frontend`
Expected: PASS - tests green

**Step 5: Commit session context**

```bash
git add frontend/src/contexts/SessionContext.tsx frontend/src/contexts/SessionContext.test.tsx
git commit -m "feat(frontend): implement SessionContext with Socket.io integration"
```

---

## Task 16: Frontend Landing Page Component

**Files:**
- Create: `frontend/src/components/LandingPage.tsx`
- Create: `frontend/src/components/LandingPage.test.tsx`

**Step 1: Write test for LandingPage**

```typescript
// frontend/src/components/LandingPage.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LandingPage } from "./LandingPage";
import { BrowserRouter } from "react-router-dom";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("LandingPage", () => {
  it("should render create session button", () => {
    render(
      <BrowserRouter>
        <LandingPage onCreateSession={vi.fn()} />
      </BrowserRouter>
    );

    expect(screen.getByText(/Create New Session/i)).toBeInTheDocument();
  });

  it("should call onCreateSession when button clicked", () => {
    const handleCreate = vi.fn();

    render(
      <BrowserRouter>
        <LandingPage onCreateSession={handleCreate} />
      </BrowserRouter>
    );

    const button = screen.getByText(/Create New Session/i);
    fireEvent.click(button);

    expect(handleCreate).toHaveBeenCalled();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test --workspace=frontend`
Expected: FAIL - LandingPage not found

**Step 3: Implement LandingPage**

```typescript
// frontend/src/components/LandingPage.tsx
import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useBranding } from "../contexts/BrandingContext";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${(props) => props.theme.colors.background};
  padding: ${(props) => props.theme.spacing.lg};
`;

const Logo = styled.img`
  height: 80px;
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

const Card = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  box-shadow: ${(props) => props.theme.shadows.md};
  padding: ${(props) => props.theme.spacing.xl};
  max-width: 500px;
  width: 100%;
`;

const Button = styled.button`
  background: ${(props) => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.md};
  padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.lg};
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s;

  &:hover {
    background: ${(props) => props.theme.colors.primaryHover};
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: ${(props) => props.theme.spacing.lg} 0;
  color: ${(props) => props.theme.colors.textSecondary};

  &::before,
  &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
  }

  &::before {
    margin-right: ${(props) => props.theme.spacing.md};
  }

  &::after {
    margin-left: ${(props) => props.theme.spacing.md};
  }
`;

const Input = styled.input`
  width: 100%;
  padding: ${(props) => props.theme.spacing.md};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: 1rem;
  margin-bottom: ${(props) => props.theme.spacing.md};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const Footer = styled.footer`
  margin-top: ${(props) => props.theme.spacing.xl};
  color: ${(props) => props.theme.colors.textSecondary};
  text-align: center;
`;

interface Props {
  onCreateSession: (name: string) => void;
}

export function LandingPage({ onCreateSession }: Props) {
  const branding = useBranding();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [sessionId, setSessionId] = useState("");

  const handleCreate = () => {
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }
    onCreateSession(name.trim());
  };

  const handleJoin = () => {
    if (!sessionId.trim()) {
      alert("Please enter session ID");
      return;
    }
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }
    navigate(`/session/${sessionId.trim().toUpperCase()}`);
  };

  return (
    <Container>
      {branding.brandLogoUrl && <Logo src={branding.brandLogoUrl} alt={branding.brandName} />}

      <Title>MF EstiMates</Title>

      <Card>
        <Input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
        />

        <Button onClick={handleCreate}>Create New Session</Button>

        <Divider>or</Divider>

        <Input
          type="text"
          placeholder="Session ID (6 characters)"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          maxLength={6}
        />

        <Button onClick={handleJoin}>Join Existing Session</Button>
      </Card>

      <Footer>{branding.brandFooterText}</Footer>
    </Container>
  );
}
```

**Step 4: Install testing libraries**

```bash
npm install --workspace=frontend @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom --save-dev
```

**Step 5: Configure Vitest for React**

```typescript
// frontend/vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test-setup.ts",
  },
});
```

**Step 6: Create test setup file**

```typescript
// frontend/src/test-setup.ts
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
```

**Step 7: Run test to verify it passes**

Run: `npm run test --workspace=frontend`
Expected: PASS - tests green

**Step 8: Commit landing page**

```bash
git add frontend/src/components/LandingPage.tsx frontend/src/components/LandingPage.test.tsx frontend/vitest.config.ts frontend/src/test-setup.ts
git commit -m "feat(frontend): implement LandingPage component with styled-components"
```

---

## Task 17: Frontend Estimation Cards Component

**Files:**
- Create: `frontend/src/components/EstimationCard.tsx`
- Create: `frontend/src/components/EstimationCards.tsx`

**Step 1: Implement EstimationCard**

```typescript
// frontend/src/components/EstimationCard.tsx
import React from "react";
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
```

**Step 2: Implement EstimationCards grid**

```typescript
// frontend/src/components/EstimationCards.tsx
import React from "react";
import styled from "styled-components";
import { EstimationCard } from "./EstimationCard";
import { ESTIMATE_VALUES, type EstimateValue } from "../types/types";

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

export function EstimationCards({ selectedEstimate, onSelectEstimate, disabled, isObserver }: Props) {
  if (isObserver) {
    return <Message>You are in observer mode and cannot estimate</Message>;
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
```

**Step 3: Commit estimation cards**

```bash
git add frontend/src/components/EstimationCard.tsx frontend/src/components/EstimationCards.tsx
git commit -m "feat(frontend): implement EstimationCard and EstimationCards components"
```

---

## Task 18: Frontend Participant List Component

**Files:**
- Create: `frontend/src/components/ParticipantList.tsx`

**Step 1: Implement ParticipantList**

```typescript
// frontend/src/components/ParticipantList.tsx
import React from "react";
import styled from "styled-components";
import type { Participant } from "../types/types";
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
  align-items: center;
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
  align-items: center;
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
  font-weight: ${(props) => (props.$status === "revealed" ? "700" : "400")};
`;

interface Props {
  participants: Participant[];
  revealed: boolean;
  revealedEstimates: Record<string, number> | null;
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
          {estimate !== undefined ? getEstimateLabel(estimate as any) : "-"}
        </StatusIndicator>
      );
    }

    if (participant.currentEstimate !== null) {
      return <StatusIndicator $status="estimated">✓</StatusIndicator>;
    }

    return <StatusIndicator $status="waiting">⏳</StatusIndicator>;
  };

  return (
    <Container>
      <Title>Participants ({participants.length})</Title>

      {participants.map((participant) => (
        <ParticipantItem key={participant.socketId}>
          <Name>
            {participant.name}
            {participant.isModerator && <Badge $type="moderator">👑</Badge>}
            {participant.isObserver && <Badge $type="observer">Observer</Badge>}
          </Name>
          {getStatus(participant)}
        </ParticipantItem>
      ))}
    </Container>
  );
}
```

**Step 2: Commit participant list**

```bash
git add frontend/src/components/ParticipantList.tsx
git commit -m "feat(frontend): implement ParticipantList component with status indicators"
```

---

## Task 19: Frontend Results View Component

**Files:**
- Create: `frontend/src/components/ResultsView.tsx`

**Step 1: Implement ResultsView**

```typescript
// frontend/src/components/ResultsView.tsx
import React from "react";
import styled from "styled-components";
import { getEstimateLabel } from "../types/types";

const Container = styled.div`
  background: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.lg};
  box-shadow: ${(props) => props.theme.shadows.md};
  padding: ${(props) => props.theme.spacing.xl};
  margin: ${(props) => props.theme.spacing.lg};
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  text-align: center;
`;

const Average = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.primary};
  text-align: center;
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

const EstimatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: ${(props) => props.theme.spacing.md};
  margin-top: ${(props) => props.theme.spacing.lg};
`;

const EstimateCard = styled.div`
  background: ${(props) => props.theme.colors.background};
  border-radius: ${(props) => props.theme.borderRadius.md};
  padding: ${(props) => props.theme.spacing.md};
  text-align: center;
`;

const EstimateValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: ${(props) => props.theme.spacing.xs};
`;

const EstimateCount = styled.div`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textSecondary};
`;

interface Props {
  estimates: Record<string, number>;
  average: number;
}

export function ResultsView({ estimates, average }: Props) {
  // Group estimates by value
  const groupedEstimates = Object.values(estimates).reduce(
    (acc, value) => {
      const label = getEstimateLabel(value as any);
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
    <Container>
      <Title>Results</Title>
      <Average>{average.toFixed(1)}</Average>

      <EstimatesGrid>
        {sortedGroups.map(([value, count]) => (
          <EstimateCard key={value}>
            <EstimateValue>{value}</EstimateValue>
            <EstimateCount>
              {count} {count === 1 ? "vote" : "votes"}
            </EstimateCount>
          </EstimateCard>
        ))}
      </EstimatesGrid>
    </Container>
  );
}
```

**Step 2: Commit results view**

```bash
git add frontend/src/components/ResultsView.tsx
git commit -m "feat(frontend): implement ResultsView component with estimate grouping"
```

---

## Task 20: Frontend Moderator Controls Component

**Files:**
- Create: `frontend/src/components/ModeratorControls.tsx`

**Step 1: Implement ModeratorControls**

```typescript
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
```

**Step 2: Commit moderator controls**

```bash
git add frontend/src/components/ModeratorControls.tsx
git commit -m "feat(frontend): implement ModeratorControls component"
```

---

## Task 21: Frontend Session Page

**Files:**
- Create: `frontend/src/pages/SessionPage.tsx`
- Create: `frontend/src/pages/SessionPage.test.tsx`

**Step 1: Implement SessionPage**

```typescript
// frontend/src/pages/SessionPage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { useSession } from "../contexts/SessionContext";
import { ParticipantList } from "../components/ParticipantList";
import { EstimationCards } from "../components/EstimationCards";
import { ResultsView } from "../components/ResultsView";
import { ModeratorControls } from "../components/ModeratorControls";
import { useBranding } from "../contexts/BrandingContext";
import type { EstimateValue } from "../types/types";

const Container = styled.div`
  display: flex;
  height: 100vh;
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const Header = styled.header`
  background: ${(props) => props.theme.colors.surface};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.img`
  height: 40px;
  cursor: pointer;
`;

const SessionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.lg};
`;

const SessionId = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.primary};
  font-family: monospace;
  cursor: pointer;
  user-select: all;

  &:hover {
    opacity: 0.8;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: ${(props) => props.theme.spacing.lg};
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const JoinPrompt = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.md};
  max-width: 400px;
  margin: 0 auto;
`;

const Input = styled.input`
  width: 100%;
  padding: ${(props) => props.theme.spacing.md};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.md};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

const Button = styled.button`
  background: ${(props) => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${(props) => props.theme.borderRadius.md};
  padding: ${(props) => props.theme.spacing.md} ${(props) => props.theme.spacing.lg};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;

  &:hover {
    background: ${(props) => props.theme.colors.primaryHover};
  }
`;

export function SessionPage() {
  const { sessionId: urlSessionId } = useParams<{ sessionId: string }>();
  const branding = useBranding();
  const {
    sessionId,
    participants,
    isModerator,
    currentEstimate,
    roundRevealed,
    revealedEstimates,
    average,
    joinSession,
    submitEstimate,
    revealCards,
    newRound,
  } = useSession();

  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (sessionId) {
      setJoined(true);
    }
  }, [sessionId]);

  const handleJoin = () => {
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }
    if (!urlSessionId) {
      alert("Invalid session ID");
      return;
    }
    joinSession(urlSessionId, name.trim());
  };

  const handleEstimate = (value: EstimateValue) => {
    submitEstimate(value);
  };

  const handleCopySessionId = () => {
    if (sessionId) {
      navigator.clipboard.writeText(sessionId);
      alert("Session ID copied to clipboard!");
    }
  };

  const currentParticipant = participants.find((p) => p.socketId === sessionId);
  const isObserver = currentParticipant?.isObserver || false;
  const hasEstimates = participants.some((p) => p.currentEstimate !== null);

  if (!joined) {
    return (
      <Container>
        <JoinPrompt>
          <h2>Join Session</h2>
          <Input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleJoin()}
            maxLength={50}
          />
          <Button onClick={handleJoin}>Join</Button>
        </JoinPrompt>
      </Container>
    );
  }

  return (
    <Container>
      <ParticipantList
        participants={participants}
        revealed={roundRevealed}
        revealedEstimates={revealedEstimates}
      />

      <MainArea>
        <Header>
          {branding.brandLogoUrl && (
            <Logo src={branding.brandLogoUrl} alt={branding.brandName} />
          )}
          <SessionInfo>
            <SessionId onClick={handleCopySessionId} title="Click to copy">
              {sessionId}
            </SessionId>
          </SessionInfo>
        </Header>

        <Content>
          {!roundRevealed && (
            <EstimationCards
              selectedEstimate={currentEstimate}
              onSelectEstimate={handleEstimate}
              disabled={roundRevealed}
              isObserver={isObserver}
            />
          )}

          {roundRevealed && revealedEstimates && average !== null && (
            <ResultsView estimates={revealedEstimates} average={average} />
          )}
        </Content>

        {isModerator && (
          <ModeratorControls
            revealed={roundRevealed}
            hasEstimates={hasEstimates}
            onReveal={revealCards}
            onNewRound={newRound}
          />
        )}
      </MainArea>
    </Container>
  );
}
```

**Step 2: Commit session page**

```bash
git add frontend/src/pages/SessionPage.tsx
git commit -m "feat(frontend): implement SessionPage with full estimation flow"
```

---

## Task 22: Frontend App & Routing

**Files:**
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/main.tsx`

**Step 1: Implement App with routing**

```typescript
// frontend/src/App.tsx
import React from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useSocket } from "./hooks/useSocket";
import { SessionProvider } from "./contexts/SessionContext";
import { BrandingProvider } from "./contexts/BrandingContext";
import { LandingPage } from "./components/LandingPage";
import { SessionPage } from "./pages/SessionPage";
import { useSession } from "./contexts/SessionContext";

function LandingPageWrapper() {
  const navigate = useNavigate();
  const { createSession } = useSession();

  const handleCreateSession = (name: string) => {
    createSession(name);
  };

  // Listen for session creation to navigate
  React.useEffect(() => {
    const { sessionId } = useSession();
    if (sessionId) {
      navigate(`/session/${sessionId}`);
    }
  }, [navigate]);

  return <LandingPage onCreateSession={handleCreateSession} />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPageWrapper />} />
      <Route path="/session/:sessionId" element={<SessionPage />} />
    </Routes>
  );
}

export function App() {
  const { socket, connected } = useSocket();

  if (!connected || !socket) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        Connecting to server...
      </div>
    );
  }

  return (
    <BrandingProvider>
      <SessionProvider socket={socket}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </SessionProvider>
    </BrandingProvider>
  );
}
```

**Step 2: Create main.tsx**

```typescript
// frontend/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Step 3: Test frontend development server**

Run: `npm run dev:frontend`
Expected: Vite dev server starts on port 3000

Open browser: `http://localhost:3000`
Expected: Landing page renders

**Step 4: Commit app and routing**

```bash
git add frontend/src/App.tsx frontend/src/main.tsx
git commit -m "feat(frontend): implement App with routing and socket integration"
```

---

## Task 23: Docker Configuration

**Files:**
- Create: `Dockerfile`
- Create: `docker-compose.yml`
- Create: `.dockerignore`

**Step 1: Create Dockerfile (multi-stage)**

```dockerfile
# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY package*.json ./
COPY frontend/package*.json ./frontend/

RUN npm install --workspace=frontend

COPY frontend ./frontend
COPY biome.json ./

RUN npm run build --workspace=frontend

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm install --workspace=backend --production=false

COPY backend ./backend
COPY biome.json ./

RUN npm run build --workspace=backend

# Stage 3: Production image
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm install --workspace=backend --production

COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "backend/dist/server.js"]
```

**Step 2: Create docker-compose.yml**

```yaml
version: "3.8"

services:
  mf-estimates:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - PORT=3001
      - FRONTEND_URL=http://localhost:3000
      - VITE_BACKEND_URL=http://localhost:3001
      - VITE_BRAND_NAME=Mayflower GmbH
      - VITE_BRAND_LOGO_URL=/assets/mayflower-logo.svg
      - VITE_BRAND_PRIMARY_COLOR=#1a73e8
      - VITE_BRAND_FOOTER_TEXT=Part of Mayflower Agile Tools
    volumes:
      - ./backend/src:/app/backend/src
      - ./frontend/src:/app/frontend/src
    restart: unless-stopped

  # Development services
  frontend-dev:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - .:/app
    ports:
      - "3000:3000"
    command: npm run dev:frontend
    environment:
      - VITE_BACKEND_URL=http://localhost:3001
    profiles:
      - dev

  backend-dev:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - .:/app
    ports:
      - "3001:3001"
    command: npm run dev:backend
    environment:
      - PORT=3001
      - FRONTEND_URL=http://localhost:3000
    profiles:
      - dev
```

**Step 3: Create .dockerignore**

```
node_modules
frontend/node_modules
backend/node_modules
frontend/dist
backend/dist
.git
.github
.vscode
*.log
.DS_Store
coverage
.env
```

**Step 4: Test Docker build**

Run: `docker build -t mf-estimates .`
Expected: Image builds successfully, size < 200MB

**Step 5: Test docker-compose**

Run: `docker-compose --profile dev up`
Expected: Both frontend and backend start

**Step 6: Commit Docker configuration**

```bash
git add Dockerfile docker-compose.yml .dockerignore
git commit -m "feat: add Docker multi-stage build and docker-compose setup"
```

---

## Task 24: Fix Frontend Navigation Bug

**Files:**
- Modify: `frontend/src/App.tsx`

**Step 1: Fix LandingPageWrapper navigation**

```typescript
// frontend/src/App.tsx (replace LandingPageWrapper)
function LandingPageWrapper() {
  const navigate = useNavigate();
  const { createSession, sessionId } = useSession();

  const handleCreateSession = (name: string) => {
    createSession(name);
  };

  // Navigate when session is created
  React.useEffect(() => {
    if (sessionId) {
      navigate(`/session/${sessionId}`);
    }
  }, [sessionId, navigate]);

  return <LandingPage onCreateSession={handleCreateSession} />;
}
```

**Step 2: Test manually**

Start dev servers, create session, verify navigation works

**Step 3: Commit fix**

```bash
git add frontend/src/App.tsx
git commit -m "fix(frontend): correct navigation after session creation"
```

---

## Task 25: Add Session TTL Cleanup

**Files:**
- Modify: `backend/src/services/SessionService.ts`
- Modify: `backend/src/server.ts`

**Step 1: Add cleanup method to SessionService**

```typescript
// backend/src/services/SessionService.ts (add to class)
cleanupExpiredSessions(): number {
  const now = new Date();
  const TTL_MS = 4 * 60 * 60 * 1000; // 4 hours
  let cleaned = 0;

  for (const [sessionId, session] of this.sessions.entries()) {
    const age = now.getTime() - session.lastActivity.getTime();
    if (age > TTL_MS) {
      this.sessions.delete(sessionId);
      cleaned++;
    }
  }

  return cleaned;
}
```

**Step 2: Add cleanup job in server**

```typescript
// backend/src/server.ts (add after server initialization)
// Cleanup expired sessions every 15 minutes
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000;

setInterval(() => {
  const cleaned = sessionService.cleanupExpiredSessions();
  if (cleaned > 0) {
    logger.info(`Cleaned up ${cleaned} expired sessions`);
  }
}, CLEANUP_INTERVAL_MS);
```

**Step 3: Write test for cleanup**

```typescript
// backend/src/services/SessionService.test.ts (add to describe block)
describe("cleanupExpiredSessions", () => {
  it("should remove sessions older than 4 hours", () => {
    const { sessionId } = service.createSession("socket1", "Alice");

    // Manually set old timestamp
    const session = service.getSession(sessionId);
    if (session) {
      session.lastActivity = new Date(Date.now() - 5 * 60 * 60 * 1000); // 5 hours ago
    }

    const cleaned = service.cleanupExpiredSessions();

    expect(cleaned).toBe(1);
    expect(service.getSession(sessionId)).toBeUndefined();
  });

  it("should keep sessions younger than 4 hours", () => {
    const { sessionId } = service.createSession("socket1", "Alice");

    const cleaned = service.cleanupExpiredSessions();

    expect(cleaned).toBe(0);
    expect(service.getSession(sessionId)).toBeDefined();
  });
});
```

**Step 4: Run test to verify it passes**

Run: `npm run test --workspace=backend`
Expected: PASS - all tests green

**Step 5: Commit cleanup feature**

```bash
git add backend/src/services/SessionService.ts backend/src/services/SessionService.test.ts backend/src/server.ts
git commit -m "feat(backend): add session TTL cleanup job (4h expiry)"
```

---

## Task 26: README Documentation

**Files:**
- Create: `README.md`

**Step 1: Create comprehensive README**

```markdown
# MF EstiMates - Planning Poker Estimation Tool

A real-time Planning Poker estimation tool for agile teams, built with React, Node.js, and Socket.io.

## Features

- 🎯 Real-time estimation with WebSocket communication
- 👥 Multi-participant sessions with moderator role
- 📊 Automatic average calculation
- 👁️ Observer mode for non-estimating participants
- 🎨 White-label branding support
- 🔗 Simple session sharing via URL
- ⏱️ Ephemeral sessions (4-hour TTL)

## Tech Stack

- **Frontend:** React 18, TypeScript, Styled Components, Vite
- **Backend:** Node.js, Express, Socket.io, TypeScript
- **Testing:** Vitest
- **Linting:** Biome
- **Deployment:** Docker, Kubernetes

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
npm install
```

### Development

Run both frontend and backend in development mode:

```bash
# Using Docker Compose
make dev

# Or manually
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:3001
```

### Testing

```bash
# Run all tests
make test

# Run backend tests only
npm run test --workspace=backend

# Run frontend tests only
npm run test --workspace=frontend
```

### Building

```bash
# Build Docker image
make build

# Or build separately
npm run build
```

### Linting & Formatting

```bash
# Check code
make lint

# Format code
make format
```

## Configuration

Configure branding via environment variables:

```bash
VITE_BRAND_NAME="Mayflower GmbH"
VITE_BRAND_LOGO_URL="/assets/mayflower-logo.svg"
VITE_BRAND_PRIMARY_COLOR="#1a73e8"
VITE_BRAND_FOOTER_TEXT="Part of Mayflower Agile Tools"
```

## Project Structure

```
/mf-estimates
  /frontend           - React frontend application
    /src
      /components     - UI components
      /contexts       - React contexts
      /hooks          - Custom hooks
      /pages          - Page components
      /styles         - Theme and styling
      /types          - TypeScript types
  /backend            - Node.js backend application
    /src
      /services       - Business logic
      /types          - TypeScript types
  /k8s                - Kubernetes manifests
  /docs               - Documentation
```

## Usage

### Creating a Session

1. Open the application
2. Enter your name
3. Click "Create New Session"
4. Share the session URL with participants

### Joining a Session

1. Click the shared session link
2. Enter your name
3. Start estimating!

### Estimation Flow

1. Select your estimate (Fibonacci: 1, 2, 3, 5, 8, 13, 21, ?)
2. Wait for all participants to estimate
3. Moderator clicks "Reveal Cards"
4. View results and average
5. Moderator clicks "New Round" for next ticket

## API Endpoints

- `GET /health` - Health check
- `GET /metrics` - Session metrics

## Socket.io Events

See [Design Document](./docs/plans/2026-01-22-mf-estimates-design.md) for complete event reference.

## License

Proprietary - Mayflower GmbH

## Contributing

Internal project. Contact the maintainers for contribution guidelines.
```

**Step 2: Commit README**

```bash
git add README.md
git commit -m "docs: add comprehensive README with usage and development guide"
```

---

## Next Steps

**Plan Complete!** The implementation plan is now saved and ready for execution.

**Execution Options:**

1. **Subagent-Driven Development (this session)** - I dispatch a fresh subagent per task, review between tasks, fast iteration using superpowers:subagent-driven-development

2. **Parallel Session Execution (separate)** - Open new session with superpowers:executing-plans for batch execution with checkpoints

**Which approach would you prefer?**
