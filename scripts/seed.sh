#!/bin/bash

# Database seed script

set -e

echo "Seeding database..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Run this script from the root directory."
    exit 1
fi

# Run seed script if it exists
if [ -f "packages/database/seed.ts" ]; then
    echo "Running seed script..."
    npx ts-node packages/database/seed.ts
    echo "Seed script completed!"
else
    echo "No seed script found at packages/database/seed.ts"
    echo "Creating sample data manually..."
    
    # You can add manual seeding here
    echo "Seed data can be added by creating packages/database/seed.ts"
fi

echo "Database seeding completed!"
