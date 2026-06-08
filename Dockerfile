# Stage 1: Build the React client
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Production server
FROM node:20-alpine
WORKDIR /app

# Copy root package files and install server dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy server files and models
COPY server.js ./
COPY models/ ./models/
COPY routes/ ./routes/
COPY middleware/ ./middleware/

# Copy built client from Stage 1
COPY --from=client-build /app/client/dist ./client/dist

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Start the Express server
CMD ["node", "server.js"]
