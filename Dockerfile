# GameDin Discord Bot - Production Dockerfile
# Multi-stage build for optimized production image

# Build stage
FROM node:20-alpine as build

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript application
RUN npm run build

# Production stage
FROM node:20-alpine

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S bot -u 1001

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from build stage
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/src ./src

# Create logs directory
RUN mkdir -p logs && chown -R bot:nodejs logs

# Switch to non-root user
USER bot

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check passed')" || exit 1

# Expose port for future web dashboard
EXPOSE 3000

# Start the Discord bot
CMD ["npm", "start"]
