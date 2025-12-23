# syntax=docker/dockerfile:1.4

# Production-ready Multi-stage Dockerfile for Expense Service
# Optimized for: Build speed, image size, security, and caching

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps
WORKDIR /app

# Install only required system dependencies
RUN apk add --no-cache libc6-compat

# Enable Corepack for Yarn 4
RUN corepack enable && corepack prepare yarn@4.12.0 --activate

# Copy package files for dependency installation
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases ./.yarn/releases
COPY .yarn/plugins ./.yarn/plugins

# Copy workspace package.json files
COPY apps/expense-service/package.json ./apps/expense-service/
COPY packages/event-bus/package.json ./packages/event-bus/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/

# Install production dependencies only with cache mounts
RUN --mount=type=cache,target=/root/.yarn \
    --mount=type=cache,target=/root/.cache \
    yarn workspaces focus @pfms/expense-service --production

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat python3 make g++

# Enable Corepack
RUN corepack enable && corepack prepare yarn@4.12.0 --activate

# Copy dependency files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn ./.yarn
COPY --from=deps /app/.yarnrc.yml ./

# Copy source code
COPY package.json yarn.lock turbo.json ./
COPY apps/expense-service ./apps/expense-service
COPY packages/event-bus ./packages/event-bus
COPY packages/types ./packages/types
COPY packages/utils ./packages/utils

# Install all dependencies (including dev dependencies for build) with cache mounts
RUN --mount=type=cache,target=/root/.yarn \
    --mount=type=cache,target=/root/.cache \
    yarn install --immutable

# Generate Prisma Client
RUN cd apps/expense-service && yarn prisma generate

# Build shared packages using Turbo
RUN yarn turbo run build --filter=@pfms/types --filter=@pfms/utils --filter=@pfms/event-bus

# Build expense service
RUN cd apps/expense-service && yarn build

# ============================================
# Stage 3: Runner (Production)
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    openssl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expenseservice

# Copy production dependencies
COPY --from=deps --chown=expenseservice:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=expenseservice:nodejs /app/apps/expense-service/dist ./dist
COPY --from=builder --chown=expenseservice:nodejs /app/apps/expense-service/package.json ./package.json
COPY --from=builder --chown=expenseservice:nodejs /app/apps/expense-service/prisma ./prisma

# Copy built shared packages
COPY --from=builder --chown=expenseservice:nodejs /app/packages/event-bus/dist ./node_modules/@pfms/event-bus/dist
COPY --from=builder --chown=expenseservice:nodejs /app/packages/types/dist ./node_modules/@pfms/types/dist
COPY --from=builder --chown=expenseservice:nodejs /app/packages/utils/dist ./node_modules/@pfms/utils/dist

# Copy Prisma generated client
COPY --from=builder --chown=expenseservice:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=expenseservice:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Create logs directory
RUN mkdir -p /app/logs && chown expenseservice:nodejs /app/logs

# Switch to non-root user
USER expenseservice

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3003/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Expose port
EXPOSE 3003

# Environment variables
ENV NODE_ENV=production \
    SERVICE_NAME=expense-service \
    SERVICE_PORT=3003 \
    NODE_OPTIONS="--max-old-space-size=512"

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start the service
CMD ["node", "dist/index.js"]
