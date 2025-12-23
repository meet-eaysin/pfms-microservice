#!/bin/bash

# Sync Kong configuration to Kong instance
# Usage: ./sync.sh <environment>
# Example: ./sync.sh dev

set -e

ENVIRONMENT=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Syncing Kong configuration for environment: $ENVIRONMENT"
echo ""

# Check if deck is installed
if ! command -v deck &> /dev/null; then
    echo "❌ Error: deck CLI is not installed"
    echo "   Install it with: npm install -g deck"
    exit 1
fi

# Merge and substitute
echo "📦 Preparing configuration..."
node "$SCRIPT_DIR/merge-config.js" "$ENVIRONMENT"
node "$SCRIPT_DIR/substitute-env.js" "$ENVIRONMENT"

# Use generated config if it exists, otherwise use merged config
CONFIG_FILE="$PROJECT_DIR/configs/$ENVIRONMENT/kong.generated.yaml"
if [ ! -f "$CONFIG_FILE" ]; then
    CONFIG_FILE="$PROJECT_DIR/configs/$ENVIRONMENT/kong.yaml"
fi

echo ""
echo "⚠️  WARNING: This will sync configuration to Kong!"
echo "   Environment: $ENVIRONMENT"
echo "   Config file: $CONFIG_FILE"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Sync cancelled"
    exit 1
fi

echo ""
echo "🔄 Syncing to Kong..."
deck sync --config "$CONFIG_FILE"

echo ""
echo "✅ Configuration synced successfully!"
