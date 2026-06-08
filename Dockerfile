# Stage 1: Build the React client
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
COPY client/public ./public
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Production server
FROM node:20-alpine
WORKDIR /app

# Copy root package files and install server dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server files and models
COPY server.js ./
COPY models/ ./models/
COPY routes/ ./routes/
COPY middleware/ ./middleware/

# Copy built client from Stage 1
COPY --from=client-build /app/client/dist ./client/dist

# Expose port
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s CMD wget -qO- http://localhost:$PORT/health || exit 1

# Start the Express server
CMD ["node", "server.js"]
