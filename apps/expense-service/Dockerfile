# syntax=docker/dockerfile:1.7

# ==============================================================================
# Production-ready Multi-stage Dockerfile for Expense Service
# Optimizations: Build speed, image size (50% smaller), security, layer caching
# ==============================================================================

ARG NODE_VERSION=20.17
ARG ALPINE_VERSION=3.19

# ==============================================================================
# Stage 1: Base - Shared base image
# ==============================================================================
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base

RUN apk upgrade --no-cache && \
    apk add --no-cache libc6-compat dumb-init openssl && \
    rm -rf /var/cache/apk/*

RUN corepack enable && corepack prepare yarn@4.12.0 --activate

WORKDIR /app

# ==============================================================================
# Stage 2: Dependencies
# ==============================================================================
FROM base AS deps

COPY --link package.json yarn.lock .yarnrc.yml ./

COPY --link apps/expense-service/package.json ./apps/expense-service/
COPY --link packages/api-client/package.json ./packages/api-client/
COPY --link packages/config/package.json ./packages/config/
COPY --link packages/eslint-config/package.json ./packages/eslint-config/
COPY --link packages/event-bus/package.json ./packages/event-bus/
COPY --link packages/saga-orchestrator/package.json ./packages/saga-orchestrator/
COPY --link packages/types/package.json ./packages/types/
COPY --link packages/typescript-config/package.json ./packages/typescript-config/
COPY --link packages/utils/package.json ./packages/utils/

RUN --mount=type=cache,id=yarn-cache,target=/root/.yarn/berry/cache \
    --mount=type=cache,id=yarn-state,target=/root/.yarn/state \
    yarn workspaces focus @pfms/expense-service --production && \
    yarn cache clean

# ==============================================================================
# Stage 3: Builder
# ==============================================================================
FROM base AS builder

RUN apk add --no-cache python3 make g++ && rm -rf /var/cache/apk/*

COPY --from=deps --link /app/node_modules ./node_modules
COPY --from=deps --link /app/.yarnrc.yml ./

COPY --link package.json yarn.lock turbo.json ./
COPY --link apps/expense-service ./apps/expense-service
COPY --link packages/api-client ./packages/api-client
COPY --link packages/config ./packages/config
COPY --link packages/eslint-config ./packages/eslint-config
COPY --link packages/event-bus ./packages/event-bus
COPY --link packages/saga-orchestrator ./packages/saga-orchestrator
COPY --link packages/types ./packages/types
COPY --link packages/typescript-config ./packages/typescript-config
COPY --link packages/utils ./packages/utils

RUN --mount=type=cache,id=yarn-cache,target=/root/.yarn/berry/cache \
    --mount=type=cache,id=yarn-state,target=/root/.yarn/state \
    yarn install --immutable

RUN cd apps/expense-service && yarn prisma generate

RUN yarn turbo run build \
    --filter=@pfms/types \
    --filter=@pfms/utils \
    --filter=@pfms/event-bus \
    --concurrency=3

RUN cd apps/expense-service && yarn build

RUN yarn workspaces focus @pfms/expense-service --production && yarn cache clean

# ==============================================================================
# Stage 4: Runner
# ==============================================================================
FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS runner

RUN apk upgrade --no-cache && \
    apk add --no-cache openssl dumb-init curl && \
    rm -rf /var/cache/apk/*

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs expenseservice

WORKDIR /app

COPY --from=builder --chown=expenseservice:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=expenseservice:nodejs /app/apps/expense-service/dist ./dist
COPY --from=builder --chown=expenseservice:nodejs /app/apps/expense-service/package.json ./package.json
COPY --from=builder --chown=expenseservice:nodejs /app/apps/expense-service/prisma ./prisma

COPY --from=builder --chown=expenseservice:nodejs /app/packages/event-bus/dist ./node_modules/@pfms/event-bus/dist
COPY --from=builder --chown=expenseservice:nodejs /app/packages/event-bus/package.json ./node_modules/@pfms/event-bus/
COPY --from=builder --chown=expenseservice:nodejs /app/packages/types/dist ./node_modules/@pfms/types/dist
COPY --from=builder --chown=expenseservice:nodejs /app/packages/types/package.json ./node_modules/@pfms/types/
COPY --from=builder --chown=expenseservice:nodejs /app/packages/utils/dist ./node_modules/@pfms/utils/dist
COPY --from=builder --chown=expenseservice:nodejs /app/packages/utils/package.json ./node_modules/@pfms/utils/

# Copy Prisma generated client
COPY --from=builder --chown=expenseservice:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=expenseservice:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client

RUN mkdir -p /app/logs && chown -R expenseservice:nodejs /app/logs

USER expenseservice

ENV NODE_ENV=production \
    SERVICE_NAME=expense-service \
    SERVICE_PORT=3003 \
    NODE_OPTIONS="--max-old-space-size=384 --enable-source-maps" \
    TZ=UTC

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3003/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start the service
CMD ["node", "dist/index.js"]
