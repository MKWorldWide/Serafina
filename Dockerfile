# Multi-stage build for Serafina and backend services
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies including TypeScript
RUN npm ci && npm install -g typescript

# Copy source code
COPY src/ ./src/

# Build the application
RUN npx tsc --project tsconfig.json

# Production stage
FROM node:18-alpine

# Set environment variables for services
ENV NODE_ENV=production
ENV SHADOW_NEXUS_PORT=10000
ENV ATHENA_CORE_PORT=10001
ENV DIVINA_PORT=10002

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S bot -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Install PM2 for process management
RUN npm install -g pm2

# Copy PM2 ecosystem file
COPY ecosystem.config.js ./

# Change ownership to non-root user
RUN chown -R bot:nodejs /app

# Switch to non-root user
USER bot

# Expose ports for services
EXPOSE 10000 10001 10002

# Health check (basic check if processes are running)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD pgrep -f "node.*dist/services/" || exit 1

# Start all services using PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
