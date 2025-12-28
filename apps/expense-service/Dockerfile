# syntax=docker/dockerfile:1.7

# ==============================================================================
# Production-ready Multi-stage Dockerfile for Expense Service
# Based on standardized PFMS service template
# ==============================================================================

ARG NODE_VERSION=20.17
ARG ALPINE_VERSION=3.19

# ==============================================================================
# Stage 1: Base - Shared base image
# ==============================================================================
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base

RUN apk upgrade --no-cache && \
    apk add --no-cache \
        libc6-compat \
        dumb-init \
        openssl \
    && rm -rf /var/cache/apk/*

RUN corepack enable && corepack prepare yarn@4.12.0 --activate

WORKDIR /app

# ==============================================================================
# Stage 2: Dependencies - Install dependencies only
# ==============================================================================
FROM base AS deps

COPY --link package.json yarn.lock .yarnrc.yml ./
COPY --link apps/expense-service/package.json ./apps/expense-service/
COPY --link packages/config/package.json ./packages/config/
COPY --link packages/date/package.json ./packages/date/
COPY --link packages/eslint-config/package.json ./packages/eslint-config/
COPY --link packages/event-bus/package.json ./packages/event-bus/
COPY --link packages/types/package.json ./packages/types/
COPY --link packages/typescript-config/package.json ./packages/typescript-config/
COPY --link packages/utils/package.json ./packages/utils/

RUN --mount=type=cache,id=yarn-cache,target=/root/.yarn/berry/cache \
    --mount=type=cache,id=yarn-state,target=/root/.yarn/state \
    yarn install --immutable

# ==============================================================================
# Stage 3: Builder - Build application
# ==============================================================================
FROM base AS builder

COPY --from=deps --link /app/node_modules ./node_modules
COPY --link . .

# Generate Prisma Client
RUN cd apps/expense-service && yarn prisma generate

# Build shared packages first
RUN yarn turbo run build \
    --filter=@pfms/config \
    --filter=@pfms/date \
    --filter=@pfms/event-bus \
    --filter=@pfms/types \
    --filter=@pfms/utils

# Build the service
RUN yarn turbo run build --filter=@pfms/expense-service

# ==============================================================================
# Stage 4: Production - Minimal runtime image
# ==============================================================================
FROM base AS runner

ENV NODE_ENV=production \
    SERVICE_NAME=expense-service \
    SERVICE_PORT=3003

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/apps/expense-service/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/expense-service/package.json ./
COPY --from=builder --chown=nestjs:nodejs /app/apps/expense-service/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/apps/expense-service/node_modules ./node_modules

# Copy workspace packages
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./workspace-node_modules

USER nestjs

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
