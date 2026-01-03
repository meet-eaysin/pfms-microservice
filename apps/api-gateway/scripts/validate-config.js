#!/usr/bin/env node

/**
 * Kong Configuration Validator
 *
 * Validates the built Kong configuration before deployment.
 *
 * Usage:
 *   node scripts/validate-config.js [environment]
 *
 * Checks:
 *   - YAML syntax
 *   - Required fields
 *   - Service references
 *   - Route conflicts
 *   - Plugin configurations
 */

const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateConfig(env = 'dev') {
  log(`\n🔍 Validating Kong configuration for: ${env}`, 'bright');
  log('━'.repeat(50), 'yellow');

  const configPath = path.join(__dirname, `../dist/kong-${env}.yaml`);

  if (!fs.existsSync(configPath)) {
    log(`❌ Configuration file not found: ${configPath}`, 'red');
    log(`   Run: node scripts/build-config.js ${env}`, 'yellow');
    return false;
  }

  let config;
  try {
    config = yaml.load(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    log(`❌ Invalid YAML syntax: ${error.message}`, 'red');
    return false;
  }

  let errors = 0;
  let warnings = 0;

  // Validate format version
  log('\n📋 Checking format version...', 'yellow');
  if (!config._format_version) {
    log('  ❌ Missing _format_version', 'red');
    errors++;
  } else {
    log(`  ✓ Format version: ${config._format_version}`, 'green');
  }

  // Validate services
  log('\n📦 Validating services...', 'yellow');
  const serviceNames = new Set();

  if (!config.services || config.services.length === 0) {
    log('  ❌ No services defined', 'red');
    errors++;
  } else {
    config.services.forEach((service, index) => {
      if (!service.name) {
        log(`  ❌ Service ${index} missing name`, 'red');
        errors++;
      } else {
        if (serviceNames.has(service.name)) {
          log(`  ❌ Duplicate service name: ${service.name}`, 'red');
          errors++;
        }
        serviceNames.add(service.name);

        if (!service.url && (!service.host || !service.port)) {
          log(`  ❌ Service ${service.name} missing url or host/port`, 'red');
          errors++;
        }
      }
    });
    log(`  ✓ Found ${config.services.length} services`, 'green');
  }

  // Validate routes
  log('\n🛣️  Validating routes...', 'yellow');
  const routeNames = new Set();
  const routePaths = new Map();

  if (!config.routes || config.routes.length === 0) {
    log('  ⚠️  No routes defined', 'yellow');
    warnings++;
  } else {
    config.routes.forEach((route, index) => {
      if (!route.name) {
        log(`  ❌ Route ${index} missing name`, 'red');
        errors++;
      } else {
        if (routeNames.has(route.name)) {
          log(`  ❌ Duplicate route name: ${route.name}`, 'red');
          errors++;
        }
        routeNames.add(route.name);
      }

      if (!route.service) {
        log(`  ❌ Route ${route.name || index} missing service`, 'red');
        errors++;
      } else if (!serviceNames.has(route.service)) {
        log(`  ❌ Route ${route.name} references unknown service: ${route.service}`, 'red');
        errors++;
      }

      if (!route.paths || route.paths.length === 0) {
        log(`  ❌ Route ${route.name || index} missing paths`, 'red');
        errors++;
      } else {
        route.paths.forEach((path) => {
          if (routePaths.has(path)) {
            log(`  ⚠️  Path ${path} used by multiple routes`, 'yellow');
            warnings++;
          }
          routePaths.set(path, route.name);
        });
      }
    });
    log(`  ✓ Found ${config.routes.length} routes`, 'green');
  }

  // Validate plugins
  log('\n🔌 Validating plugins...', 'yellow');
  if (!config.plugins || config.plugins.length === 0) {
    log('  ⚠️  No global plugins defined', 'yellow');
    warnings++;
  } else {
    const pluginNames = new Set();
    config.plugins.forEach((plugin, index) => {
      if (!plugin.name) {
        log(`  ❌ Plugin ${index} missing name`, 'red');
        errors++;
      } else {
        if (pluginNames.has(plugin.name)) {
          log(`  ⚠️  Duplicate plugin: ${plugin.name}`, 'yellow');
          warnings++;
        }
        pluginNames.add(plugin.name);
      }
    });
    log(`  ✓ Found ${config.plugins.length} global plugins`, 'green');
  }

  // Summary
  log('\n📊 Validation Summary:', 'bright');
  log('━'.repeat(50), 'yellow');
  log(`  Services:  ${config.services?.length || 0}`, 'green');
  log(`  Routes:    ${config.routes?.length || 0}`, 'green');
  log(`  Plugins:   ${config.plugins?.length || 0}`, 'green');
  log(`  Errors:    ${errors}`, errors > 0 ? 'red' : 'green');
  log(`  Warnings:  ${warnings}`, warnings > 0 ? 'yellow' : 'green');

  if (errors > 0) {
    log('\n❌ Validation failed!\n', 'red');
    return false;
  } else if (warnings > 0) {
    log('\n⚠️  Validation passed with warnings\n', 'yellow');
    return true;
  } else {
    log('\n✅ Validation passed!\n', 'green');
    return true;
  }
}

// Main execution
if (require.main === module) {
  const env = process.argv[2] || 'dev';
  const valid = validateConfig(env);
  process.exit(valid ? 0 : 1);
}

module.exports = { validateConfig };
