# Stage 1: Build frontend
FROM node:20-slim AS frontend-builder

WORKDIR /app

COPY package*.json ./
COPY frontend/package*.json ./frontend/

RUN npm ci --workspace=frontend

COPY frontend ./frontend

RUN npm run build --workspace=frontend

# Stage 2: Build backend
FROM node:20-slim AS backend-builder

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm ci --workspace=backend --production=false

COPY backend ./backend
COPY biome.json ./

RUN npm run build --workspace=backend

# Stage 3: Production image
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm ci --workspace=backend --production

COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "backend/dist/server.js"]
