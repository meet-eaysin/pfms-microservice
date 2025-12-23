#!/usr/bin/env node

/**
 * Substitute environment variables in Kong configuration
 * Usage: node substitute-env.js <environment>
 * Example: node substitute-env.js dev
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const environment = process.argv[2] || 'dev';
const validEnvironments = ['dev', 'staging', 'prod'];

if (!validEnvironments.includes(environment)) {
  console.error(`Invalid environment: ${environment}`);
  console.error(`Valid environments: ${validEnvironments.join(', ')}`);
  process.exit(1);
}

const envDir = path.join(__dirname, '..', 'configs', environment);
const envFile = path.join(envDir, '.env');

// Load environment variables
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
  console.log(`Loaded environment variables from: ${envFile}`);
} else {
  console.warn(`Warning: No .env file found at ${envFile}`);
  console.warn(`Using .env.example as reference. Copy it to .env and fill in values.`);
}

// Read Kong configuration
const configPath = path.join(envDir, 'kong.yaml');
if (!fs.existsSync(configPath)) {
  console.error(`Error: Kong configuration not found at ${configPath}`);
  console.error(`Run 'node merge-config.js ${environment}' first.`);
  process.exit(1);
}

let config = fs.readFileSync(configPath, 'utf8');

// Substitute environment variables
// Pattern: ${VAR_NAME} or $VAR_NAME
const envVarPattern = /\$\{([^}]+)\}|\$([A-Z_][A-Z0-9_]*)/g;
let substitutionCount = 0;

config = config.replace(envVarPattern, (match, bracedVar, unbracedVar) => {
  const varName = bracedVar || unbracedVar;
  const value = process.env[varName];

  if (value !== undefined) {
    substitutionCount++;
    console.log(`  ✓ Substituted ${varName}`);
    return value;
  } else {
    console.warn(`  ⚠ Warning: Environment variable ${varName} not found`);
    return match; // Keep original if not found
  }
});

// Write substituted configuration
const outputPath = path.join(envDir, 'kong.generated.yaml');
fs.writeFileSync(outputPath, config, 'utf8');

console.log(`\n✅ Environment variable substitution complete!`);
console.log(`   Substituted ${substitutionCount} variable(s)`);
console.log(`   Output: ${outputPath}`);

if (substitutionCount === 0) {
  console.log(`\nℹ️  No environment variables found in configuration.`);
  console.log(`   This is normal if you're not using env var substitution.`);
}
