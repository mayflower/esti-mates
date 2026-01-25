# MF EstiMates

**A modern, real-time planning poker application for agile teams**

Planning poker (also known as Scrum poker) is a consensus-based estimation technique used by agile teams to estimate the effort or relative size of development tasks. MF EstiMates provides a streamlined, real-time collaborative platform where distributed teams can run estimation sessions efficiently with moderator controls, automatic average calculation, and observer support.

## Features

- **Real-time collaborative estimation** - All participants see updates instantly via WebSocket connections
- **Multi-participant sessions with moderator controls** - First participant becomes moderator with exclusive reveal/reset powers
- **Automatic average calculation** - Instantly compute the mean of all revealed estimates
- **Observer mode** - Join sessions to watch without participating in voting
- **White-label branding support** - Customize brand name, logo, colors, and footer text via environment variables
- **Simple session sharing** - Easy-to-remember 6-character session IDs (e.g., ABC123)
- **4-hour session TTL with automatic cleanup** - Sessions expire automatically to free resources

## Tech Stack

### Frontend
- **React** 18.3.1 - UI framework
- **TypeScript** 5.7.3 - Type safety
- **Styled Components** 6.1.15 - CSS-in-JS styling
- **Vite** 6.0.7 - Build tool and dev server
- **React Router** 7.1.3 - Client-side routing
- **Socket.io Client** 4.8.1 - Real-time communication

### Backend
- **Node.js** 20 - Runtime environment
- **Express** 4.22.1 - Web framework
- **Socket.io** 4.8.1 - Real-time WebSocket server
- **TypeScript** 5.7.3 - Type safety
- **Pino** 10.3.0 - High-performance logging
- **CORS** 2.8.5 - Cross-origin resource sharing

### Testing
- **Vitest** 2.1.8 - Unit testing framework
- **React Testing Library** 16.3.2 - Component testing

### Linting
- **Biome** 1.9.4 - Linting and formatting

### Development & Deployment
- **Docker** - Multi-stage containerization
- **Kubernetes** - Orchestration with manifests
- **Tilt** - Local Kubernetes development with live reload

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm 10 or higher
- Docker and Docker Compose (optional, for containerized development)
- Kubernetes (minikube/Docker Desktop) and Tilt (optional, for local Kubernetes development)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd mf-estimates

# Install dependencies for all workspaces
npm install
```

## Development Commands

### Kubernetes with Tilt (Recommended)

Run the application in a local Kubernetes cluster with live reload using Tilt:

```bash
# Start minikube (if not already running)
minikube start

# Start Tilt
tilt up
```

This starts:
- Frontend at http://localhost:3000
- Backend WebSocket at http://localhost:3001
- Automatic rebuild and live reload on file changes
- Interactive Tilt UI in browser (press 'space' in terminal)

The Tiltfile provides:
- Multi-stage Docker builds with caching
- Live updates for backend and frontend code
- Automatic port forwarding for both HTTP and WebSocket
- Health checks and logs in the Tilt UI

To stop:
```bash
tilt down
```

### Docker Compose

Run both frontend and backend in development mode with hot reload:

```bash
docker-compose --profile dev up
```

This starts:
- Frontend at http://localhost:3000
- Backend at http://localhost:3001

To stop:
```bash
docker-compose --profile dev down
```

### Manual

Run frontend and backend separately in different terminals:

```bash
# Terminal 1 - Frontend
npm run dev:frontend

# Terminal 2 - Backend
npm run dev:backend
```

Frontend will be available at http://localhost:3000, backend at http://localhost:3001.

Additional commands:
```bash
npm test              # Run all tests (frontend + backend)
npm run build         # Build both frontend and backend for production
npm run lint          # Lint code with Biome
npm run format        # Format code with Biome
```

## Configuration

### Frontend Environment Variables

Configure branding by setting environment variables in `.env` file or Docker Compose:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_BRAND_NAME` | `"Mayflower GmbH"` | Company/product name displayed in header |
| `VITE_BRAND_LOGO_URL` | `"/assets/logo.svg"` | Path to logo image |
| `VITE_BRAND_PRIMARY_COLOR` | `"#1a73e8"` | Primary theme color (hex) |
| `VITE_BRAND_FOOTER_TEXT` | `"Part of Mayflower Agile Tools"` | Footer text |
| `VITE_BACKEND_URL` | `"http://localhost:3001"` | Backend API URL |

### Backend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Port for backend server |
| `FRONTEND_URL` | `"http://localhost:3000"` | Frontend URL for CORS |
| `NODE_ENV` | `"development"` | Environment mode |

## Project Structure

```
mf-estimates/
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   │   ├── Card.tsx       # Estimation card component
│   │   │   ├── EstimationGrid.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Participant.tsx
│   │   │   └── ...
│   │   ├── contexts/          # React contexts
│   │   │   ├── BrandingContext.tsx
│   │   │   └── SocketContext.tsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useSocket.ts
│   │   │   └── useBranding.ts
│   │   ├── pages/             # Page components
│   │   │   └── SessionPage.tsx
│   │   ├── styles/            # Theme and styling
│   │   │   ├── theme.ts       # Theme tokens
│   │   │   └── styled.d.ts    # TypeScript definitions
│   │   ├── types/             # TypeScript type definitions
│   │   │   └── session.ts
│   │   ├── App.tsx            # Root application component
│   │   └── main.tsx           # Application entry point
│   ├── public/                # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                    # Express + Socket.io backend
│   ├── src/
│   │   ├── services/          # Business logic
│   │   │   ├── SessionService.ts    # Session management
│   │   │   ├── EventHandlers.ts     # Socket event handlers
│   │   │   └── CleanupService.ts    # TTL cleanup
│   │   ├── types/             # TypeScript type definitions
│   │   │   ├── session.ts
│   │   │   └── socket.ts
│   │   ├── server.ts          # Main server file
│   │   └── logger.ts          # Pino logger configuration
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                       # Documentation
│   └── plans/                 # Implementation plans
│
├── k8s/                        # Kubernetes manifests
│   ├── configmap.yaml         # Environment configuration
│   ├── deployment.yaml        # Pod deployment spec
│   └── service.yaml           # Service definition
│
├── Dockerfile                  # Multi-stage Docker build
├── Tiltfile                    # Tilt configuration for local K8s dev
├── docker-compose.yml          # Development setup
├── biome.json                  # Biome configuration
├── package.json                # Root workspace configuration
├── Makefile                    # Build automation
└── README.md                   # This file
```

## Usage Guide

### Creating a Session

1. Open the application at http://localhost:3000
2. Enter your name in the "Your Name" field
3. Click "Create New Session"
4. Share the generated 6-character session ID with your team

As the session creator, you become the **moderator** with exclusive controls to:
- Reveal all cards
- Start new estimation rounds

### Joining a Session

1. Open the application at http://localhost:3000
2. Enter your name
3. Enter the 6-character session ID shared by the moderator
4. Click "Join Session"

### Estimation Flow

1. **Select your estimate** - Click on a card value (1, 2, 3, 5, 8, 13, 21, ?)
2. **Wait for others** - Your card appears face-down to others until reveal
3. **Moderator reveals** - Moderator clicks "Reveal Cards" when everyone has voted
4. **View results** - See all estimates and the calculated average
5. **New round** - Moderator clicks "New Round" to reset for next story

### Observer Mode

Observer mode allows users to watch sessions without participating in voting. Observers can see all activity but cannot submit estimates and aren't counted in voting completion or average calculations.

**Note:** In the current version, observer mode must be set when joining a session by including `isObserver: true` in the join request. There is no UI toggle available.

## API Endpoints

### REST API

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/health` | GET | Health check | `{"status": "ok"}` |
| `/metrics` | GET | Session metrics | `{"sessionCount": number, "totalParticipants": number}` |

### Socket.io Events

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `create_session` | `{name: string, isObserver?: boolean}` | Create new session |
| `join_session` | `{name: string, sessionId: string, isObserver?: boolean}` | Join existing session |
| `submit_estimate` | `{estimate: string}` | Submit vote |
| `reveal_cards` | - | Reveal all votes (moderator only) |
| `new_round` | - | Start new round (moderator only) |
| `transfer_moderator` | `{targetParticipantId: string}` | Transfer moderator role |
| `toggle_observer` | `{isObserver: boolean}` | Toggle observer status |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `session_created` | `{sessionId: string, session: Session}` | Session created successfully |
| `joined_session` | `{session: Session}` | Joined session successfully |
| `session_updated` | `{session: Session}` | Session state changed |
| `error` | `{message: string}` | Error occurred |

## License

**Proprietary** - Mayflower GmbH

All rights reserved. This software is the property of Mayflower GmbH and is protected by copyright law. Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited without the express written permission of Mayflower GmbH.

## Contributing

This is an internal Mayflower project. External contributions are not accepted.
