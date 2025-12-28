# syntax=docker/dockerfile:1.7

# ==============================================================================
# Dockerfile for Kong API Gateway Configuration
# This image contains Kong configuration files and deck CLI for deployment
# ==============================================================================

ARG KONG_VERSION=3.4-alpine

# ==============================================================================
# Stage 1: Configuration Builder
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY scripts ./scripts
COPY configs ./configs
COPY templates ./templates

# Install dependencies for config processing
RUN npm install --production

# Validate configurations
RUN node scripts/merge-config.js dev && \
    node scripts/merge-config.js staging && \
    node scripts/merge-config.js prod

# ==============================================================================
# Stage 2: Kong Runtime with Configuration
# ==============================================================================
FROM kong:${KONG_VERSION}

# Install deck CLI for configuration management
USER root
RUN apk add --no-cache curl && \
    curl -sL https://github.com/Kong/deck/releases/download/v1.28.2/deck_1.28.2_linux_amd64.tar.gz | tar -xz -C /tmp && \
    mv /tmp/deck /usr/local/bin/ && \
    chmod +x /usr/local/bin/deck && \
    apk del curl && \
    rm -rf /var/cache/apk/*

# Copy configuration files
COPY --from=builder /app/configs /etc/kong/configs
COPY --from=builder /app/scripts /etc/kong/scripts

# Create directory for declarative config
RUN mkdir -p /etc/kong/declarative && \
    chown -R kong:kong /etc/kong

USER kong

# Set environment variables
ENV KONG_DATABASE=off \
    KONG_DECLARATIVE_CONFIG=/etc/kong/declarative/kong.yaml \
    KONG_PROXY_ACCESS_LOG=/dev/stdout \
    KONG_ADMIN_ACCESS_LOG=/dev/stdout \
    KONG_PROXY_ERROR_LOG=/dev/stderr \
    KONG_ADMIN_ERROR_LOG=/dev/stderr \
    KONG_ADMIN_LISTEN="0.0.0.0:8001"

# Expose ports
EXPOSE 8000 8001 8443 8444

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
    CMD kong health

# Start Kong
CMD ["kong", "docker-start"]
