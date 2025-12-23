# syntax=docker/dockerfile:1.4

# Production-ready Multi-stage Dockerfile for Auth Service
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


# Copy workspace package.json files
COPY apps/auth-service/package.json ./apps/auth-service/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/

# Install production dependencies only with cache mounts
RUN --mount=type=cache,target=/root/.yarn \
    --mount=type=cache,target=/root/.cache \
    yarn workspaces focus @pfms/auth-service --production

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
COPY apps/auth-service ./apps/auth-service
COPY packages/config ./packages/config
COPY packages/types ./packages/types
COPY packages/utils ./packages/utils

# Install all dependencies (including dev dependencies for build) with cache mounts
RUN --mount=type=cache,target=/root/.yarn \
    --mount=type=cache,target=/root/.cache \
    yarn install --immutable

# Generate Prisma Client
RUN cd apps/auth-service && yarn prisma generate

# Build shared packages using Turbo
RUN yarn turbo run build --filter=@pfms/config --filter=@pfms/types --filter=@pfms/utils

# Build auth service
RUN cd apps/auth-service && yarn build

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
    adduser --system --uid 1001 authservice

# Copy production dependencies
COPY --from=deps --chown=authservice:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=authservice:nodejs /app/apps/auth-service/dist ./dist
COPY --from=builder --chown=authservice:nodejs /app/apps/auth-service/package.json ./package.json
COPY --from=builder --chown=authservice:nodejs /app/apps/auth-service/prisma ./prisma

# Copy built shared packages
COPY --from=builder --chown=authservice:nodejs /app/packages/config/dist ./node_modules/@pfms/config/dist
COPY --from=builder --chown=authservice:nodejs /app/packages/types/dist ./node_modules/@pfms/types/dist
COPY --from=builder --chown=authservice:nodejs /app/packages/utils/dist ./node_modules/@pfms/utils/dist

# Copy Prisma generated client
COPY --from=builder --chown=authservice:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=authservice:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Create logs directory
RUN mkdir -p /app/logs && chown authservice:nodejs /app/logs

# Switch to non-root user
USER authservice

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Expose port
EXPOSE 3001

# Environment variables
ENV NODE_ENV=production \
    SERVICE_NAME=auth-service \
    SERVICE_PORT=3001 \
    NODE_OPTIONS="--max-old-space-size=512"

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start the service
CMD ["node", "dist/main.js"]
