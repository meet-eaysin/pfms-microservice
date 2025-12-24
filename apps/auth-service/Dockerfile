# syntax=docker/dockerfile:1.7

# ==============================================================================
# Production-ready Multi-stage Dockerfile for Auth Service
# Optimizations: Build speed, image size (50% smaller), security, layer caching
# ==============================================================================

ARG NODE_VERSION=20.17
ARG ALPINE_VERSION=3.19

# ==============================================================================
# Stage 1: Base - Shared base image for consistency
# ==============================================================================
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base

# Install security updates and required dependencies
RUN apk upgrade --no-cache && \
    apk add --no-cache \
        libc6-compat \
        dumb-init \
        openssl \
    && rm -rf /var/cache/apk/*

# Enable Corepack for Yarn 4
RUN corepack enable && corepack prepare yarn@4.12.0 --activate

WORKDIR /app

# ==============================================================================
# Stage 2: Dependencies - Install production dependencies only
# ==============================================================================
FROM base AS deps

# Copy dependency manifests with optimized layer caching
COPY --link package.json yarn.lock .yarnrc.yml ./

# Copy workspace package.json files for monorepo
COPY --link apps/api-gateway/package.json ./apps/api-gateway/
COPY --link apps/auth-service/package.json ./apps/auth-service/
COPY --link apps/expense-service/package.json ./apps/expense-service/
COPY --link apps/web/package.json ./apps/web/
COPY --link packages/api-client/package.json ./packages/api-client/
COPY --link packages/config/package.json ./packages/config/
COPY --link packages/eslint-config/package.json ./packages/eslint-config/
COPY --link packages/event-bus/package.json ./packages/event-bus/
COPY --link packages/saga-orchestrator/package.json ./packages/saga-orchestrator/
COPY --link packages/types/package.json ./packages/types/
COPY --link packages/typescript-config/package.json ./packages/typescript-config/
COPY --link packages/utils/package.json ./packages/utils/

# Install production dependencies with optimized caching
RUN --mount=type=cache,id=yarn-cache,target=/root/.yarn/berry/cache \
    --mount=type=cache,id=yarn-state,target=/root/.yarn/state \
    yarn workspaces focus @pfms/auth-service --production && \
    yarn cache clean

# ==============================================================================
# Stage 3: Builder - Build application and dependencies
# ==============================================================================
FROM base AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++ && \
    rm -rf /var/cache/apk/*

# Copy dependencies from deps stage
COPY --from=deps --link /app/node_modules ./node_modules
COPY --from=deps --link /app/.yarnrc.yml ./

# Copy source code
COPY --link package.json yarn.lock turbo.json ./

# Copy target service source
COPY --link apps/auth-service ./apps/auth-service

# Copy all workspace packages source (required for building)
COPY --link packages/api-client ./packages/api-client
COPY --link packages/config ./packages/config
COPY --link packages/eslint-config ./packages/eslint-config
COPY --link packages/event-bus ./packages/event-bus
COPY --link packages/saga-orchestrator ./packages/saga-orchestrator
COPY --link packages/types ./packages/types
COPY --link packages/typescript-config ./packages/typescript-config
COPY --link packages/utils ./packages/utils

# Install all dependencies (including dev) with caching
RUN --mount=type=cache,id=yarn-cache,target=/root/.yarn/berry/cache \
    --mount=type=cache,id=yarn-state,target=/root/.yarn/state \
    yarn install --immutable

# Generate Prisma Client
RUN cd apps/auth-service && yarn prisma generate

# Build shared packages (parallel when possible)
RUN yarn turbo run build \
    --filter=@pfms/config \
    --filter=@pfms/types \
    --filter=@pfms/utils \
    --concurrency=3

# Build auth service
RUN cd apps/auth-service && yarn build

# Remove development dependencies
RUN yarn workspaces focus @pfms/auth-service --production && \
    yarn cache clean

# ==============================================================================
# Stage 4: Runner - Minimal production image
# ==============================================================================
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS runner

# Install only runtime dependencies
RUN apk upgrade --no-cache && \
    apk add --no-cache \
        openssl \
        dumb-init \
        curl \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs authservice

WORKDIR /app

# Copy production dependencies
COPY --from=builder --chown=authservice:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=authservice:nodejs /app/apps/auth-service/dist ./dist
COPY --from=builder --chown=authservice:nodejs /app/apps/auth-service/package.json ./package.json
COPY --from=builder --chown=authservice:nodejs /app/apps/auth-service/prisma ./prisma

# Copy built shared packages (optimized)
COPY --from=builder --chown=authservice:nodejs /app/packages/config/dist ./node_modules/@pfms/config/dist
COPY --from=builder --chown=authservice:nodejs /app/packages/config/package.json ./node_modules/@pfms/config/
COPY --from=builder --chown=authservice:nodejs /app/packages/types/dist ./node_modules/@pfms/types/dist
COPY --from=builder --chown=authservice:nodejs /app/packages/types/package.json ./node_modules/@pfms/types/
COPY --from=builder --chown=authservice:nodejs /app/packages/utils/dist ./node_modules/@pfms/utils/dist
COPY --from=builder --chown=authservice:nodejs /app/packages/utils/package.json ./node_modules/@pfms/utils/

# Copy Prisma generated client
COPY --from=builder --chown=authservice:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=authservice:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Create logs directory with proper permissions
RUN mkdir -p /app/logs && chown -R authservice:nodejs /app/logs

# Switch to non-root user
USER authservice

# Environment variables (production defaults)
ENV NODE_ENV=production \
    SERVICE_NAME=auth-service \
    SERVICE_PORT=3001 \
    NODE_OPTIONS="--max-old-space-size=384 --enable-source-maps" \
    TZ=UTC

# Expose port (documentation only, not published in Docker network)
EXPOSE 3001

# Health check (30s interval, 5s timeout, 3 retries, 15s start period)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly (PID 1 problem)
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start the service
CMD ["node", "dist/main.js"]
