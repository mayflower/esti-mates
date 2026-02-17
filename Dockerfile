# Stage 1: Build backend
FROM node:20-slim AS backend-builder

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm ci --workspace=backend --production=false

COPY backend ./backend
COPY biome.json ./

RUN npm run build --workspace=backend

# Stage 2: Production image
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json ./backend/

RUN npm ci --workspace=backend --production

COPY --from=backend-builder /app/backend/dist ./backend/dist
# Copy locally built frontend dist
COPY frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "backend/dist/server.js"]
