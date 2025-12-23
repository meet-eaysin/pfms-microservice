#!/usr/bin/env node

/**
 * Merge base Kong configuration with environment-specific overrides
 * Usage: node merge-config.js <environment>
 * Example: node merge-config.js dev
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const environment = process.argv[2] || 'dev';
const validEnvironments = ['dev', 'staging', 'prod'];

if (!validEnvironments.includes(environment)) {
  console.error(`Invalid environment: ${environment}`);
  console.error(`Valid environments: ${validEnvironments.join(', ')}`);
  process.exit(1);
}

const baseDir = path.join(__dirname, '..', 'configs', 'base');
const envDir = path.join(__dirname, '..', 'configs', environment);

// Read base configuration files
const baseFiles = [
  'services.yaml',
  'routes.yaml',
  'plugins.yaml',
  'upstreams.yaml',
  'consumers.yaml',
];
let mergedConfig = {
  _format_version: '3.0',
  _transform: true,
};

console.log(`Merging base configurations for environment: ${environment}`);

// Merge base files
baseFiles.forEach((file) => {
  const filePath = path.join(baseDir, file);
  if (fs.existsSync(filePath)) {
    const content = yaml.load(fs.readFileSync(filePath, 'utf8'));
    // Merge all properties except _format_version and _transform
    Object.keys(content).forEach((key) => {
      if (key !== '_format_version' && key !== '_transform') {
        if (!mergedConfig[key]) {
          mergedConfig[key] = content[key];
        } else if (Array.isArray(mergedConfig[key]) && Array.isArray(content[key])) {
          mergedConfig[key] = [...mergedConfig[key], ...content[key]];
        }
      }
    });
    console.log(`  ✓ Merged ${file}`);
  }
});

// Apply environment-specific overrides if they exist
const overridesPath = path.join(envDir, 'overrides.yaml');
if (fs.existsSync(overridesPath)) {
  const overrides = yaml.load(fs.readFileSync(overridesPath, 'utf8'));
  console.log(`  ✓ Applied ${environment} overrides`);

  // Deep merge overrides
  Object.keys(overrides).forEach((key) => {
    if (key !== '_format_version' && key !== '_transform') {
      mergedConfig[key] = overrides[key];
    }
  });
}

// Write merged configuration
const outputPath = path.join(envDir, 'kong.yaml');
fs.writeFileSync(outputPath, yaml.dump(mergedConfig, { lineWidth: -1 }), 'utf8');

console.log(`\n✅ Configuration merged successfully!`);
console.log(`   Output: ${outputPath}`);
console.log(`\nNext steps:`);
console.log(`  1. Review the merged configuration`);
console.log(`  2. Run validation: npm run validate:${environment}`);
console.log(`  3. Sync to Kong: npm run sync:${environment}`);
