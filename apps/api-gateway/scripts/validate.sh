#!/bin/bash

# Validate Kong configuration for a specific environment
# Usage: ./validate.sh <environment>
# Example: ./validate.sh dev

set -e

ENVIRONMENT=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔍 Validating Kong configuration for environment: $ENVIRONMENT"
echo ""

# Check if deck is installed
if ! command -v deck &> /dev/null; then
    echo "❌ Error: deck CLI is not installed"
    echo "   Install it with: npm install -g deck"
    exit 1
fi

# Merge configuration
echo "📦 Merging base configuration with $ENVIRONMENT overrides..."
node "$SCRIPT_DIR/merge-config.js" "$ENVIRONMENT"

# Validate with deck
CONFIG_FILE="$PROJECT_DIR/configs/$ENVIRONMENT/kong.yaml"

echo ""
echo "✅ Running deck validation..."
deck validate --config "$CONFIG_FILE"

echo ""
echo "✅ Configuration is valid!"
