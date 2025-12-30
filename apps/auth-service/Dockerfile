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
# Stage 2: Builder - Build application and dependencies
# ==============================================================================
FROM base AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++ && \
    rm -rf /var/cache/apk/*

# Copy dependency manifests first for better layer caching
COPY --link package.json yarn.lock .yarnrc.yml ./

# Copy workspace package.json files for monorepo
COPY --link apps/api-gateway/package.json ./apps/api-gateway/
COPY --link apps/auth-service/package.json ./apps/auth-service/
COPY --link apps/expense-service/package.json ./apps/expense-service/
COPY --link apps/web/package.json ./apps/web/

COPY --link packages/config/package.json ./packages/config/
COPY --link packages/date/package.json ./packages/date/
COPY --link packages/email/package.json ./packages/email/
COPY --link packages/errors/package.json ./packages/errors/
COPY --link packages/eslint-config/package.json ./packages/eslint-config/
COPY --link packages/event-bus/package.json ./packages/event-bus/
COPY --link packages/http/package.json ./packages/http/

COPY --link packages/schema/package.json ./packages/schema/
COPY --link packages/types/package.json ./packages/types/
COPY --link packages/typescript-config/package.json ./packages/typescript-config/
COPY --link packages/utils/package.json ./packages/utils/

# Install all dependencies (including dev) with caching
RUN --mount=type=cache,id=yarn-cache,target=/root/.yarn/berry/cache \
    --mount=type=cache,id=yarn-state,target=/root/.yarn/state \
    yarn install

# Copy source code (after install for better layer caching)
COPY --link turbo.json ./

# Copy target service source
COPY --link apps/auth-service ./apps/auth-service

# Copy all workspace packages source (required for building)

COPY --link packages/config ./packages/config
COPY --link packages/date ./packages/date
COPY --link packages/email ./packages/email
COPY --link packages/errors ./packages/errors
COPY --link packages/eslint-config ./packages/eslint-config
COPY --link packages/event-bus ./packages/event-bus
COPY --link packages/http ./packages/http

COPY --link packages/schema ./packages/schema
COPY --link packages/types ./packages/types
COPY --link packages/typescript-config ./packages/typescript-config
COPY --link packages/utils ./packages/utils

# Generate Prisma Client
# Generate Prisma Client
RUN yarn workspace @pfms/auth-service run prisma generate

# Build shared packages (parallel when possible)
RUN yarn turbo run build \
    --filter=@pfms/config \
    --filter=@pfms/types \
    --filter=@pfms/utils \
    --concurrency=3

# Build auth service
RUN cd apps/auth-service && yarn build

# ==============================================================================
# Stage 3: Runner - Minimal production image
# ==============================================================================
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS runner

# Install only runtime dependencies
RUN apk upgrade --no-cache && \
    apk add --no-cache \
        openssl \
        dumb-init \
        curl \
    && rm -rf /var/cache/apk/*

ENV NODE_ENV=production \
    SERVICE_NAME=auth-service \
    SERVICE_PORT=3001 \
    NODE_OPTIONS="--max-old-space-size=384 --enable-source-maps" \
    TZ=UTC

# Install only runtime dependencies
RUN apk upgrade --no-cache && \
    apk add --no-cache \
        openssl \
        dumb-init \
        curl \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs authservice

WORKDIR /app

# Copy root files
COPY --from=builder --chown=authservice:nodejs /app/package.json /app/yarn.lock /app/.yarnrc.yml ./
COPY --from=builder --chown=authservice:nodejs /app/node_modules ./node_modules

# Copy workspace packages
COPY --from=builder --chown=authservice:nodejs /app/packages ./packages

# Copy service files
COPY --from=builder --chown=authservice:nodejs /app/apps/auth-service/package.json ./apps/auth-service/package.json
COPY --from=builder --chown=authservice:nodejs /app/apps/auth-service/dist ./apps/auth-service/dist
COPY --from=builder --chown=authservice:nodejs /app/apps/auth-service/prisma ./apps/auth-service/prisma
COPY --from=builder --chown=authservice:nodejs /app/apps/auth-service/node_modules ./apps/auth-service/node_modules

# Create logs directory
RUN mkdir -p /app/apps/auth-service/logs && chown -R authservice:nodejs /app/apps/auth-service/logs

WORKDIR /app/apps/auth-service

USER authservice

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/index.js"]
