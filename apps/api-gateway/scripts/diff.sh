#!/bin/bash

# Show diff between local configuration and Kong instance
# Usage: ./diff.sh <environment>
# Example: ./diff.sh dev

set -e

ENVIRONMENT=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔍 Comparing local configuration with Kong for environment: $ENVIRONMENT"
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
echo "📊 Running diff..."
deck diff --config "$CONFIG_FILE"

echo ""
echo "✅ Diff complete!"
