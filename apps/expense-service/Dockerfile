# Production-ready Multi-stage Dockerfile for Expense Service
# Best Practice: Multi-stage builds reduce image size and improve security

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies only when needed
# Copy package files from monorepo root and workspace
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY apps/expense-service/package.json ./apps/expense-service/
COPY packages ./packages

# Install dependencies
RUN corepack enable && \
    yarn workspaces focus @pfms/expense-service --production

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn ./.yarn
COPY --from=deps /app/.yarnrc.yml ./

# Copy source code
COPY package.json yarn.lock ./
COPY apps/expense-service ./apps/expense-service
COPY packages ./packages
COPY turbo.json ./

# Build the application and shared packages
RUN corepack enable && \
    yarn install && \
    yarn build:packages && \
    cd apps/expense-service && \
    yarn build

# ============================================
# Stage 3: Runner (Production)
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expense-service

# Copy only necessary files
COPY --from=builder --chown=expense-service:nodejs /app/apps/expense-service/dist ./dist
COPY --from=builder --chown=expense-service:nodejs /app/apps/expense-service/package.json ./
COPY --from=deps --chown=expense-service:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=expense-service:nodejs /app/packages ./packages

# Create logs directory with correct permissions
RUN mkdir -p /app/logs && chown expense-service:nodejs /app/logs

# Security: Switch to non-root user
USER expense-service

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3003/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Expose port (internal only - not published to host)
EXPOSE 3003

# Set production environment
ENV NODE_ENV=production \
    SERVICE_NAME=expense-service \
    SERVICE_PORT=3003

# Start the service
CMD ["node", "dist/index.js"]
