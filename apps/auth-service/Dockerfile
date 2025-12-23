# Production-ready Multi-stage Dockerfile for Auth Service
# Best Practice: Multi-stage builds reduce image size and improve security

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:24-alpine AS deps
WORKDIR /app

# Install dependencies only when needed
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    gcc \
    git

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY apps/auth-service/package.json ./apps/auth-service/
COPY packages ./packages

# Install dependencies
RUN corepack enable && \
    yarn workspaces focus @pfms/auth-service --production

# ============================================
# Stage 2: Builder
# ============================================
FROM node:24-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn ./.yarn
COPY --from=deps /app/.yarnrc.yml ./

# Copy source code
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    gcc \
    git

COPY package.json yarn.lock ./
COPY apps/auth-service ./apps/auth-service
COPY packages ./packages
COPY turbo.json ./

# Build the application and shared packages
RUN corepack enable && \
    yarn install && \
    yarn workspace @pfms/config build && \
    yarn workspace @pfms/types build && \
    yarn workspace @pfms/utils build && \
    yarn workspace @pfms/event-bus build && \
    cd apps/auth-service && \
    yarn prisma generate && \
    yarn build

# ============================================
# Stage 3: Runner (Production)
# ============================================
FROM node:24-alpine AS runner
WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 auth-service

# Copy only necessary files
COPY --from=builder --chown=auth-service:nodejs /app/apps/auth-service/dist ./dist
COPY --from=builder --chown=auth-service:nodejs /app/apps/auth-service/package.json ./
COPY --from=builder --chown=auth-service:nodejs /app/apps/auth-service/prisma ./prisma
COPY --from=deps --chown=auth-service:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=auth-service:nodejs /app/packages ./packages

# Copy generated Prisma client
COPY --from=builder --chown=auth-service:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=auth-service:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Create logs directory with correct permissions
RUN mkdir -p /app/logs && chown auth-service:nodejs /app/logs

# Security: Switch to non-root user
USER auth-service

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Expose port (internal only - not published to host in production)
EXPOSE 3001

# Set production environment
ENV NODE_ENV=production \
    SERVICE_NAME=auth-service \
    SERVICE_PORT=3001

# Start the service
CMD ["node", "dist/main.js"]
