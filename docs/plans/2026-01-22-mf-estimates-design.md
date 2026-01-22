# MF EstiMates - Design Document

**Date:** 2026-01-22
**Status:** Draft
**Version:** 1.0

---

## Overview

MF EstiMates is a real-time Planning Poker estimation tool for Mayflower GmbH teams. It solves the problem of chaotic estimation sessions in Google Meet where developers post numbers in chat, leading to bias and lack of overview.

### Goals

- Provide simultaneous, anonymous estimation to prevent bias
- Clean, intuitive UI for rapid team estimations
- White-label branding capability for customer engagements
- Simple, ephemeral sessions with no login required
- Foundation for future Mayflower Agile Tools suite

### Non-Goals (MVP)

- Session history or persistence beyond 4h TTL
- User accounts or authentication
- Advanced analytics or metrics
- T-Shirt sizing (future enhancement)
- Mobile app (responsive web is sufficient)

---

## Architecture

### High-Level Overview

Single Docker container deployment combining:
- **Frontend:** React SPA (TypeScript + Styled Components + Vite)
- **Backend:** Node.js + Express + Socket.io (TypeScript)
- **State Management:** In-memory session store (no database)
- **Real-time:** WebSocket connections via Socket.io

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Styled Components (Material Design principles)
- Vite for build tooling
- Socket.io Client for real-time updates

**Backend:**
- Node.js + Express + TypeScript
- Socket.io for WebSocket handling
- In-memory session management

**Development Tools:**
- Vitest for testing
- Biome for linting and formatting
- Docker + Docker Compose
- Tilt for Kubernetes development

**Deployment:**
- Docker container
- Kubernetes (Mayflower K8s cluster)
- GitHub Actions for CI/CD

### Deployment Architecture

**Kubernetes Setup:**
- Single Pod deployment (sufficient for 20-30 concurrent users)
- Resource Limits: 512Mi RAM, 0.5 CPU
- ClusterIP Service + Ingress with TLS
- ConfigMap for branding configuration
- Liveness/Readiness probes on `/health` endpoint

**Branding Configuration (Environment Variables):**
```bash
BRAND_NAME=Mayflower GmbH
BRAND_LOGO_URL=/assets/mayflower-logo.svg
BRAND_PRIMARY_COLOR=#1a73e8
BRAND_FOOTER_TEXT=Part of Mayflower Agile Tools
```

---

## User Flows

### Moderator Flow

1. Opens landing page at `estimate.mayflower.de`
2. Clicks "Create New Session"
3. Enters name → Redirected to `/session/abc123`
4. Shares session link in Google Meet chat
5. Waits for participants to join and estimate
6. Clicks "Reveal Cards" → Sees all estimates + average
7. Discusses results with team
8. Clicks "New Round" → Resets cards for next ticket
9. Can transfer moderator role to another participant if needed

### Participant Flow

1. Clicks shared link from chat → Lands on `/session/abc123`
2. Enters name → Joins session
3. Sees participant list and estimation cards
4. Selects estimation card (Fibonacci: 1, 2, 3, 5, 8, 13, 21, ?)
5. Waits for moderator to reveal
6. Sees all estimates and average
7. Process repeats for next round

### Observer Flow

1. Joins session as normal participant
2. Toggles "Observer Mode" (or moderator toggles them)
3. Cannot estimate, only watches the process
4. Useful for Product Owners, stakeholders, or developers temporarily away

### Manual Session Join

If participant loses the link:
1. Goes to landing page
2. Enters 6-digit Session ID manually (like Google Meet)
3. Enters name → Joins session

---

## Data Models

### Session

```typescript
interface Session {
  id: string                              // 6-char alphanumeric
  moderatorSocketId: string               // Current moderator
  participants: Map<string, Participant>  // socketId → Participant
  currentRound: Round
  createdAt: Date
  lastActivity: Date                      // For TTL cleanup
}
```

### Participant

```typescript
interface Participant {
  socketId: string
  name: string
  isModerator: boolean
  isObserver: boolean
  currentEstimate: number | null
}
```

### Round

```typescript
interface Round {
  estimates: Map<string, number>  // socketId → estimate value
  revealed: boolean
}
```

---

## Socket.io Events

### Client → Server

| Event | Payload | Description | Auth |
|-------|---------|-------------|------|
| `create_session` | `{ name: string }` | Create new session | - |
| `join_session` | `{ sessionId: string, name: string }` | Join existing session | - |
| `submit_estimate` | `{ estimate: number }` | Submit estimation | Participant |
| `reveal_cards` | - | Reveal all estimates | Moderator only |
| `new_round` | - | Reset round | Moderator only |
| `transfer_moderator` | `{ targetSocketId: string }` | Transfer moderator role | Moderator only |
| `toggle_observer` | `{ targetSocketId?: string }` | Toggle observer mode (no target = self) | Self or Moderator |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `session_created` | `{ sessionId: string }` | Session successfully created |
| `joined_session` | `{ participants: Participant[], isModerator: boolean }` | Successfully joined session |
| `participant_joined` | `{ participant: Participant }` | New participant joined |
| `participant_left` | `{ socketId: string }` | Participant disconnected |
| `estimate_submitted` | `{ socketId: string }` | Someone submitted (no value!) |
| `cards_revealed` | `{ estimates: Map<string, number>, average: number }` | All estimates revealed |
| `round_reset` | - | New round started, estimates cleared |
| `moderator_transferred` | `{ newModeratorSocketId: string }` | Moderator role transferred |
| `observer_toggled` | `{ socketId: string, isObserver: boolean }` | Observer status changed |
| `error` | `{ message: string }` | Error occurred |

---

## UI/UX Design

### Design Principles

- Clean, minimalist Material Design aesthetic
- Desktop-first (used during meetings), but mobile-friendly
- Fast, responsive interactions
- Clear visual feedback for all actions

### Components

**Landing Page (`/`)**
- Mayflower logo (configurable)
- Large "Create New Session" button
- Secondary "Join Session" input for manual Session ID entry
- Branding footer

**Session View (`/session/:sessionId`)**

Header:
- Session ID (large, copyable)
- Participant count indicator
- Moderator badge for current moderator
- Observer toggle button (for self)
- Logo (clickable → back to landing)

Participant List (Sidebar):
- Scrollable list of participants
- Each participant shows:
  - Name
  - Status indicator:
    - ⏳ Waiting (gray) - no estimate yet
    - ✓ Estimated (green) - has estimated
    - Number (after reveal)
  - 👑 Moderator badge
  - 👁️ Observer badge
  - Toggle button (moderator only)

Estimation Cards (Main Area):
- Grid layout of large, clickable cards
- Fibonacci values: `1, 2, 3, 5, 8, 13, 21, ?`
- `?` = "No idea / Cannot estimate"
- Card states:
  - Default: Hoverable with lift effect
  - Selected: Primary color border + background
  - Disabled: Grayed out after selection
- Hidden for observers

Results View (After Reveal):
- Card flip animation
- All estimates displayed prominently
- Average calculation (excluding `?` values)
- Sorted or grouped display
- Visual histogram if estimates diverge

Moderator Controls (Bottom Bar):
- "Reveal Cards" button (primary, only active when estimates exist)
- "New Round" button (visible only after reveal)
- "Transfer Moderator" dropdown (in header menu)

**Branding Elements:**
- Logo in header
- Primary color for buttons, accents, selected states
- Footer with configurable text

---

## Edge Cases & Error Handling

### Session Lifecycle

- **Session TTL:** 4 hours after last activity
- **Cleanup Job:** Runs every 15 minutes to remove expired sessions
- **Empty Sessions:** Deleted immediately when last participant leaves

### Participant Disconnection

- **Grace Period:** 30 seconds for reconnection
- **Reconnect Success:** State restored if within grace period
- **Timeout:** Participant removed from list, others notified

### Moderator Leaves

- **Auto-Transfer:** Moderator role transferred to longest-present participant
- **Broadcast:** All participants notified of new moderator
- **Last One Out:** Session deleted when last participant leaves

### Duplicate Names

- **Allowed with Counter:** "Tom", "Tom (2)", "Tom (3)"
- Prevents confusion with explicit numbering

### Invalid Input

- **Session ID:** Backend validates format and existence
- **Estimates:** Frontend restricts to valid values, backend validates
- **Empty Names:** Frontend requires name before joining

### Connection Issues

- **Connection Lost:** UI shows "Reconnecting..." indicator
- **Exponential Backoff:** Automatic reconnection attempts
- **Failed Reconnect:** Redirect to landing with error message

---

## Testing Strategy

### Unit Tests (Vitest)

- SessionService: Create, join, estimate, reveal logic
- Utility functions: Session ID generation, name deduplication
- Event handlers: Socket.io event processing

### Integration Tests

- Socket.io event flows with mocked clients
- Session lifecycle scenarios
- Moderator transfer logic

### Manual E2E Testing

- Multi-tab testing (3-4 tabs simulating different users)
- Network disconnection scenarios
- Rapid clicking and edge case testing

### Testing Targets for MVP

- Critical paths covered with unit tests
- Key user flows verified with integration tests
- Manual testing before first customer use

---

## Monitoring & Operations

### Logging

- **Library:** Winston or Pino for structured logging
- **Log Levels:**
  - INFO: Session events (created, joined, revealed)
  - ERROR: Failures, invalid requests
- **Key Events:**
  - Session lifecycle (create, delete)
  - Participant join/leave
  - Moderator transfers
  - WebSocket errors

### Health Checks

- `GET /health` endpoint returning 200 OK
- `GET /metrics` endpoint with:
  - Active sessions count
  - Connected users count
- Kubernetes liveness/readiness probes

### Observability

- Structured JSON logs for Kubernetes log aggregation
- Metrics endpoint for Prometheus scraping (future)
- No complex APM needed for MVP

---

## Development Setup

### Project Structure

```
/mf-estimates
  /frontend
    /src
      /components
        EstimationCard.tsx
        ParticipantList.tsx
        ResultsView.tsx
        ModeratorControls.tsx
      /hooks
        useSession.ts
        useSocket.ts
        useBranding.ts
      /contexts
        SessionContext.tsx
      /styles
        theme.ts
      App.tsx
      main.tsx
    package.json
    tsconfig.json
    vite.config.ts
  /backend
    /src
      /services
        SessionService.ts
        EventHandlers.ts
      /types
        types.ts
      server.ts
    package.json
    tsconfig.json
  /k8s
    deployment.yaml
    service.yaml
    ingress.yaml
    configmap.yaml
  Dockerfile
  docker-compose.yml
  Tiltfile
  Makefile
  biome.json
  .github/workflows/ci.yml
  README.md
```

### Makefile Targets

- `make dev` - Start Docker Compose for local development
- `make build` - Build Docker image
- `make test` - Run Vitest tests
- `make lint` - Run Biome check and format
- `make k8s-dev` - Start Tilt for Minikube development
- `make clean` - Clean up containers and build artifacts

### Local Development

**Option 1: Docker Compose** (Quick)
```bash
make dev
```
- Frontend on `http://localhost:3000` with HMR
- Backend on `http://localhost:3001`
- Frontend proxies to backend for Socket.io

**Option 2: Tilt + Minikube** (K8s-like)
```bash
make k8s-dev
```
- Live reload for code changes
- Port-forward to localhost:3000
- Logs in Tilt UI
- Tests K8s manifests locally

### Docker Build

**Multi-stage Dockerfile:**
1. **Stage 1:** Build frontend (`npm run build`)
2. **Stage 2:** Build backend (`tsc`)
3. **Stage 3:** Production image (Node Alpine + built assets)

**Target Image Size:** < 150MB

---

## CI/CD Pipeline (GitHub Actions)

### Workflow Steps

1. **Lint & Format Check** - Run Biome
2. **Test** - Run Vitest tests
3. **Build** - Build Docker image
4. **Push** - Push to container registry (GitHub Container Registry or AWS ECR)
5. **Deploy** - Update Kubernetes deployment (manual approval for production)

### Triggers

- Push to `main` branch → Build and deploy to staging
- Manual trigger → Deploy to production

---

## Deployment Plan

### Phase 1: Local Development (Week 1)

- Setup project structure
- Implement core backend (Session management, Socket.io events)
- Implement frontend (Session view, estimation cards, participant list)
- Basic styled components
- Local testing with docker-compose

### Phase 2: Features & Polish (3-4 days)

- Observer toggle feature
- Moderator transfer
- Reconnection logic
- Branding configuration system
- Kubernetes manifests
- GitHub Actions pipeline
- Unit tests

### Phase 3: Testing & Deployment (2-3 days)

- Multi-user testing
- Edge case fixes
- Documentation (README, deployment guide)
- Deploy to Mayflower K8s cluster
- First team testing in real refinement

**Total Timeline:** ~2 weeks for production-ready MVP

---

## Future Enhancements (Post-MVP)

### Phase 2 Features
- T-Shirt sizing scale option
- Custom scales (configurable by moderator)
- Ticket name/description field in session

### Phase 3 Features
- Session history (optional persistence)
- Analytics dashboard (estimation patterns, team velocity)
- Export results to CSV/JSON

### Infrastructure
- Redis-backed sessions for multi-instance scaling
- Prometheus metrics for monitoring
- Advanced logging with trace IDs

### Mayflower Agile Tools Suite
- Additional tools in the suite (retrospectives, daily standups)
- Unified branding and navigation
- Shared authentication (if needed later)

---

## Security Considerations

### MVP Security

- **Input Validation:** All user input sanitized (names, session IDs)
- **Rate Limiting:** Prevent session creation spam (simple in-memory rate limit)
- **Session ID Entropy:** 6 alphanumeric characters = 36^6 ≈ 2B combinations
- **No Sensitive Data:** No PII, credentials, or persistent storage
- **HTTPS Only:** TLS termination at Ingress level

### Future Security

- CORS configuration for production domain
- CSP headers for XSS protection
- WebSocket authentication tokens (if needed for multi-instance)

---

## Success Metrics

### MVP Success Criteria

- ✅ Supports 20-30 concurrent users in single session without issues
- ✅ < 2s latency for card reveal/update across all participants
- ✅ Zero data loss during session (within 4h TTL)
- ✅ Successfully used in 3+ real team refinements
- ✅ Positive feedback from team (faster/clearer than chat-based estimation)

### Long-term Metrics

- Number of active sessions per week
- Number of unique users
- Session duration averages
- Customer adoption (external teams using it)

---

## Questions & Decisions

### Resolved

- ✅ **Tech Stack:** React + Node.js + Socket.io + TypeScript
- ✅ **Styling:** Styled Components (no Tailwind/Material-UI)
- ✅ **State Management:** React Context (no Redux)
- ✅ **Sessions:** Ephemeral, 4h TTL, no persistence
- ✅ **Roles:** Moderator + Observer support
- ✅ **Scales:** Fibonacci only for MVP, extensible later
- ✅ **Deployment:** K8s on Mayflower cluster
- ✅ **Tool Name:** MF EstiMates

### Open Questions

- Ingress hostname (TBD with ops team)
- Container registry (GitHub Container Registry vs AWS ECR)

---

## References

- Original inspiration: https://estitool.netlify.app/
- Planning Poker methodology: https://en.wikipedia.org/wiki/Planning_poker
- Socket.io docs: https://socket.io/docs/

---

**Next Steps:**
1. Create implementation plan with detailed task breakdown
2. Setup git repository with project structure
3. Begin Phase 1 development
