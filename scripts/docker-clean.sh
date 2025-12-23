#!/bin/bash

# Clean Docker environment

set -e

echo "Cleaning Docker environment..."

# Remove containers
echo "Removing containers..."
docker-compose -f infra/docker-compose.dev.yml down --remove-orphans

# Remove volumes
echo "Removing volumes..."
docker-compose -f infra/docker-compose.dev.yml down -v

# Remove images
echo "Removing images..."
docker-compose -f infra/docker-compose.dev.yml rm -f

# Remove dangling images
echo "Removing dangling images..."
docker image prune -f

# Remove dangling volumes
echo "Removing dangling volumes..."
docker volume prune -f

echo "Docker environment cleaned!"
