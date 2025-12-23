#!/bin/bash

# Database migration script

set -e

echo "Running database migrations..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Run this script from the root directory."
    exit 1
fi

# Run Prisma migrations
if [ "$NODE_ENV" = "development" ] || [ "$NODE_ENV" = "" ]; then
    echo "Running migrations in development mode..."
    npx prisma migrate dev --skip-generate
else
    echo "Running migrations in production mode..."
    npx prisma migrate deploy
fi

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

echo "Migrations completed successfully!"
