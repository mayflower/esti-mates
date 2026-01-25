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
