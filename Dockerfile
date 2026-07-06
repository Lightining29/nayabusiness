# Stage 1: Build the React client
FROM node:20-alpine AS client-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
COPY frontend/public ./public
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Production server
FROM node:20-alpine
WORKDIR /app/backend

# Copy backend package files and install server dependencies
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy server files and models
COPY backend/server.js ./
COPY backend/models/ ./models/
COPY backend/routes/ ./routes/
COPY backend/middleware/ ./middleware/
COPY backend/utils/ ./utils/

# Copy built client from Stage 1
COPY --from=client-build /app/frontend/dist ../frontend/dist

# Expose port
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s CMD wget -qO- http://localhost:$PORT/health || exit 1

# Start the Express server
CMD ["node", "server.js"]
