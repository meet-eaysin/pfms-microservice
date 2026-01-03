#!/usr/bin/env node

/**
 * Kong Configuration Builder
 *
 * Combines modular configuration files into a single kong.yaml for deployment.
 *
 * Usage:
 *   node scripts/build-config.js [environment]
 *
 * Arguments:
 *   environment - Target environment (dev, staging, prod). Default: dev
 *
 * Example:
 *   node scripts/build-config.js dev
 *   node scripts/build-config.js prod
 */

const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadYamlFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.load(content);
  } catch (error) {
    log(`❌ Error loading ${filePath}: ${error.message}`, 'red');
    throw error;
  }
}

function loadDirectory(dirPath, excludePattern = /^_/) {
  const files = fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .filter((f) => !excludePattern.test(f));

  return files.map((file) => loadYamlFile(path.join(dirPath, file)));
}

function mergePlugins(basePlugins, envPlugins) {
  if (!envPlugins || envPlugins.length === 0) {
    return basePlugins;
  }

  const merged = [...basePlugins];

  envPlugins.forEach((envPlugin) => {
    const existingIndex = merged.findIndex((p) => p.name === envPlugin.name);

    if (existingIndex >= 0) {
      // Merge config, environment takes precedence
      merged[existingIndex] = {
        ...merged[existingIndex],
        ...envPlugin,
        config: {
          ...merged[existingIndex].config,
          ...envPlugin.config,
        },
      };
    } else {
      // Add new plugin
      merged.push(envPlugin);
    }
  });

  return merged;
}

function buildConfig(env = 'dev') {
  log(`\n🔧 Building Kong configuration for: ${env}`, 'bright');
  log('━'.repeat(50), 'blue');

  const configDir = path.join(__dirname, '../config');
  const config = {
    _format_version: '3.0',
    services: [],
    routes: [],
    plugins: [],
  };

  // Step 1: Load service definitions
  log('\n📦 Loading service definitions...', 'blue');
  const servicesDir = path.join(configDir, 'services');
  const serviceConfigs = loadDirectory(servicesDir);

  serviceConfigs.forEach((serviceConfig) => {
    if (serviceConfig.services) {
      config.services.push(...serviceConfig.services);
      log(`  ✓ Loaded ${serviceConfig.services.length} services`, 'green');
    }
  });
  log(`  Total services: ${config.services.length}`, 'bright');

  // Step 2: Load route definitions
  log('\n🛣️  Loading route definitions...', 'blue');
  const routesDir = path.join(configDir, 'routes');
  const routeConfigs = loadDirectory(routesDir);

  routeConfigs.forEach((routeConfig) => {
    if (routeConfig.routes) {
      config.routes.push(...routeConfig.routes);
      log(`  ✓ Loaded ${routeConfig.routes.length} routes`, 'green');
    }
  });
  log(`  Total routes: ${config.routes.length}`, 'bright');

  // Step 3: Load global plugins
  log('\n🔌 Loading global plugins...', 'blue');
  const globalPluginsPath = path.join(configDir, 'plugins/global.yaml');
  const globalPlugins = loadYamlFile(globalPluginsPath);

  if (globalPlugins.plugins) {
    config.plugins = globalPlugins.plugins;
    log(`  ✓ Loaded ${globalPlugins.plugins.length} global plugins`, 'green');
  }

  // Step 4: Apply environment overrides
  log(`\n🌍 Applying ${env} environment overrides...`, 'blue');
  const envConfigPath = path.join(configDir, `environments/${env}.yaml`);

  if (fs.existsSync(envConfigPath)) {
    const envConfig = loadYamlFile(envConfigPath);

    if (envConfig.plugins) {
      config.plugins = mergePlugins(config.plugins, envConfig.plugins);
      log(`  ✓ Merged ${envConfig.plugins.length} environment plugins`, 'green');
    }

    if (envConfig.services) {
      // Merge environment-specific service overrides
      envConfig.services.forEach((envService) => {
        const existingIndex = config.services.findIndex((s) => s.name === envService.name);
        if (existingIndex >= 0) {
          config.services[existingIndex] = {
            ...config.services[existingIndex],
            ...envService,
          };
        }
      });
      log(`  ✓ Applied service overrides`, 'green');
    }
  } else {
    log(`  ⚠️  No environment config found for ${env}`, 'yellow');
  }

  // Step 5: Write final configuration
  log('\n💾 Writing final configuration...', 'blue');
  const distDir = path.join(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const outputPath = path.join(distDir, `kong-${env}.yaml`);
  fs.writeFileSync(
    outputPath,
    yaml.dump(config, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
    })
  );

  log(`  ✓ Configuration written to: ${outputPath}`, 'green');

  // Step 6: Summary
  log('\n📊 Configuration Summary:', 'bright');
  log('━'.repeat(50), 'blue');
  log(`  Services:  ${config.services.length}`, 'green');
  log(`  Routes:    ${config.routes.length}`, 'green');
  log(`  Plugins:   ${config.plugins.length}`, 'green');
  log(`  Output:    ${outputPath}`, 'green');
  log('\n✅ Build complete!\n', 'bright');

  return outputPath;
}

// Main execution
if (require.main === module) {
  const env = process.argv[2] || 'dev';

  const validEnvs = ['dev', 'staging', 'prod'];
  if (!validEnvs.includes(env)) {
    log(`❌ Invalid environment: ${env}`, 'red');
    log(`   Valid options: ${validEnvs.join(', ')}`, 'yellow');
    process.exit(1);
  }

  try {
    buildConfig(env);
  } catch (error) {
    log(`\n❌ Build failed: ${error.message}`, 'red');
    if (error.stack) {
      log(error.stack, 'red');
    }
    process.exit(1);
  }
}

module.exports = { buildConfig };
