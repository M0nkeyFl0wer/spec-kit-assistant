#!/usr/bin/env node
/**
 * Universal Spec Kit Integration Tests
 * Tests the unified CLI functionality and single-tool approach
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

// Test: Universal CLI exists and is executable
test('Universal CLI exists and is executable', () => {
  const cliPath = path.resolve('./specify');
  assert.ok(fs.existsSync(cliPath), 'Universal CLI file should exist');

  // Check if executable
  const stats = fs.statSync(cliPath);
  assert.ok(stats.mode & 0o111, 'CLI should be executable');
});

// Test: CLI shows help when no arguments
test('CLI shows help when no arguments', () => {
  try {
    const output = execSync('./specify', { encoding: 'utf-8', timeout: 10000 });
    assert.ok(output.includes('Universal Spec Kit CLI'), 'Should show help message');
    assert.ok(output.includes('GitHub Spec Kit Commands'), 'Should list GitHub commands');
    assert.ok(output.includes('Enhanced Swarm Commands'), 'Should list swarm commands');
  } catch (error) {
    // Help command might exit with code 0 or 1, both are valid
    assert.ok(error.stdout.includes('Universal Spec Kit CLI'), 'Should show help in stdout');
  }
});

// Test: Status command shows system status
test('Status command shows system status', () => {
  const output = execSync('./specify status', { encoding: 'utf-8', timeout: 15000 });
  assert.ok(output.includes('Universal Spec Kit Status'), 'Should show status header');
  assert.ok(output.includes('officialSpecKit'), 'Should show official Spec Kit status');
  assert.ok(output.includes('swarmSystem'), 'Should show swarm system status');
});

// Test: Check command routes to official GitHub CLI
test('Check command routes to official GitHub CLI', () => {
  const output = execSync('./specify check', { encoding: 'utf-8', timeout: 15000 });
  assert.ok(output.includes('Routing to GitHub Spec Kit'), 'Should route to official CLI');
  assert.ok(output.includes('Checking for installed tools'), 'Should show official check output');
  assert.ok(output.includes('Claude Code CLI'), 'Should detect Claude Code');
});

// Test: Router component functionality
test('UniversalSpecKitRouter can be imported and instantiated', async () => {
  const { UniversalSpecKitRouter } = await import('../src/integration/spec-kit-router.js');
  const router = new UniversalSpecKitRouter();

  assert.ok(router instanceof UniversalSpecKitRouter, 'Should create router instance');
  assert.ok(router.supportedCommands, 'Should have supported commands');
  assert.ok(router.routingStrategy, 'Should have routing strategy');
});

// Test: Strategic coordination components exist
test('Strategic coordination components exist', async () => {
  const { StrategicTaskCoordinator } = await import('../src/core/strategic-task-coordinator.js');
  const { IntelligentDeploymentOptimizer } = await import('../src/core/intelligent-deployment-optimizer.js');
  const { SpecKitComplianceChecker } = await import('../src/core/spec-compliance-checker.js');

  const coordinator = new StrategicTaskCoordinator();
  const optimizer = new IntelligentDeploymentOptimizer();
  const checker = new SpecKitComplianceChecker();

  assert.ok(coordinator, 'Strategic coordinator should initialize');
  assert.ok(optimizer, 'Deployment optimizer should initialize');
  assert.ok(checker, 'Compliance checker should initialize');
});

// Test: Code Llama agent integration
test('Code Llama agent can be instantiated', async () => {
  const { CodeLlamaSwarmAgent } = await import('../src/agents/codellama-swarm-agent.js');
  const agent = new CodeLlamaSwarmAgent();

  assert.ok(agent instanceof CodeLlamaSwarmAgent, 'Should create agent instance');
  assert.strictEqual(agent.model, 'codellama:7b', 'Should use correct model');
  assert.strictEqual(agent.location, 'seshat', 'Should default to Seshat location');
  assert.strictEqual(agent.costPerToken, 0, 'Should be free local processing');
});

// Test: Integration strategy is correct
test('Integration strategy correctly routes commands', async () => {
  const { UniversalSpecKitRouter } = await import('../src/integration/spec-kit-router.js');
  const router = new UniversalSpecKitRouter();

  // Native commands should go to official CLI
  assert.ok(router.routingStrategy.native.includes('init'), 'Init should route to native');
  assert.ok(router.routingStrategy.native.includes('check'), 'Check should route to native');

  // Enhanced commands should go to swarm
  assert.ok(router.routingStrategy.enhanced.includes('deploy'), 'Deploy should route to swarm');
  assert.ok(router.routingStrategy.enhanced.includes('optimize'), 'Optimize should route to swarm');
  assert.ok(router.routingStrategy.enhanced.includes('assess'), 'Assess should route to swarm');
});

// Test: Single-tool approach validation
test('Single-tool approach: Users only need our CLI', () => {
  // Check that our CLI exists
  assert.ok(fs.existsSync('./specify'), 'Our universal CLI should exist');

  // Check that it has both types of functionality
  const helpOutput = execSync('./specify', { encoding: 'utf-8' });
  assert.ok(helpOutput.includes('GitHub Spec Kit Commands'), 'Should include GitHub functionality');
  assert.ok(helpOutput.includes('Enhanced Swarm Commands'), 'Should include our enhancements');
  assert.ok(helpOutput.includes('Best of both worlds'), 'Should promote unified approach');
});

// Test: Production readiness checks
test('Production readiness: Core files exist', () => {
  const requiredFiles = [
    './package.json',
    './README.md',
    './specify',
    './src/integration/spec-kit-router.js',
    './src/core/strategic-task-coordinator.js',
    './src/core/intelligent-deployment-optimizer.js',
    './src/core/spec-compliance-checker.js',
    './src/agents/codellama-swarm-agent.js'
  ];

  requiredFiles.forEach(file => {
    assert.ok(fs.existsSync(file), `Required file should exist: ${file}`);
  });
});

// Test: Package.json has correct configuration
test('Package.json has correct configuration for single-tool approach', async () => {
  const pkg = await fs.readJson('./package.json');

  assert.strictEqual(pkg.type, 'module', 'Should use ES modules');
  assert.ok(pkg.name, 'Should have package name');
  assert.ok(pkg.version, 'Should have version');
  assert.ok(pkg.scripts, 'Should have scripts');
  assert.ok(pkg.scripts.test, 'Should have test script');
});

// Test: Error handling and fallbacks
test('Router handles missing official CLI gracefully', async () => {
  const { UniversalSpecKitRouter } = await import('../src/integration/spec-kit-router.js');
  const router = new UniversalSpecKitRouter();

  // Mock missing official CLI
  router.officialSpecKit = '/nonexistent/path';

  // Should not throw error, should fallback
  const canCheck = await router.checkOfficialSpecKit();
  assert.strictEqual(canCheck, false, 'Should detect missing CLI');
});

// Test: System capabilities detection
test('System detects available capabilities', async () => {
  const { IntelligentDeploymentOptimizer } = await import('../src/core/intelligent-deployment-optimizer.js');
  const optimizer = new IntelligentDeploymentOptimizer();

  const capabilities = await optimizer.analyzeDeploymentCapabilities();
  assert.ok(typeof capabilities === 'object', 'Should return capabilities object');
  assert.ok('local' in capabilities, 'Should detect local capabilities');
  assert.ok('claude' in capabilities, 'Should detect Claude availability');
});

console.log('🎯 All Universal Spec Kit tests completed!');