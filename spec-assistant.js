#!/usr/bin/env node
/**
 * Spec Kit Assistant - Friendly wrapper for GitHub Spec Kit
 * Adds helpful dog assistant, swarm orchestration, and Claude integration
 */

import { SpecLogo } from './src/character/spec-logo.js';
import chalk from 'chalk';
import { execSync, spawn } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Show logo
console.log(SpecLogo.pixelDog);
console.log(chalk.gray('✨ Friendly assistant for GitHub Spec Kit\n'));

// Parse args
const args = process.argv.slice(2);
const command = args[0];

// Enhanced commands (our additions)
const SWARM_COMMANDS = {
  'run': 'Deploy swarm to implement spec',
  'test': 'Run swarms to test implementation',
  'swarm': 'Swarm management',
  'deploy': 'Deploy with swarm orchestration'
};

// Official Spec Kit commands (pass through)
const SPEC_KIT_COMMANDS = ['init', 'check', 'constitution'];

/**
 * Display help with personality
 */
function displayHelp() {
  console.log(chalk.hex('#EC4899')('🌱 Welcome! I\'m here to help you with Spec-Driven Development!\n'));

  console.log(chalk.hex('#10B981')('Official Spec Kit Commands:'));
  console.log(chalk.white('  node spec-assistant.js init <PROJECT>    ') + chalk.dim('# Create new project'));
  console.log(chalk.white('  node spec-assistant.js check             ') + chalk.dim('# Check project status'));
  console.log(chalk.white('  node spec-assistant.js constitution      ') + chalk.dim('# Create project principles'));

  console.log(chalk.hex('#EC4899')('\n🤖 Enhanced Swarm Commands:'));
  console.log(chalk.white('  node spec-assistant.js run <description> ') + chalk.dim('# Deploy swarm to implement'));
  console.log(chalk.white('  node spec-assistant.js test              ') + chalk.dim('# Run swarm tests'));
  console.log(chalk.white('  node spec-assistant.js deploy <task>     ') + chalk.dim('# Full swarm deployment'));

  console.log(chalk.dim('\n📖 Learn more: https://github.com/github/spec-kit'));
  console.log(chalk.dim('💜 Official Spec Kit + 🤖 Swarm Power'));
}

/**
 * Check if uv and specify are installed
 */
function checkSpecKitInstalled() {
  try {
    execSync('which uv', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Install Spec Kit if needed
 */
function ensureSpecKitInstalled() {
  if (!checkSpecKitInstalled()) {
    console.log(chalk.yellow('📦 Installing uv package manager...'));
    execSync('curl -LsSf https://astral.sh/uv/install.sh | sh', { stdio: 'inherit' });
  }

  // Check if specify is installed
  try {
    execSync('~/.local/bin/uv tool list | grep specify-cli', { stdio: 'pipe' });
  } catch {
    console.log(chalk.yellow('📦 Installing GitHub Spec Kit...'));
    execSync(`~/.local/bin/uv tool install .`, { stdio: 'inherit', cwd: __dirname });
  }
}

/**
 * Show friendly dog guidance after init
 */
function showDogNextSteps() {
  console.log(chalk.hex('#8B5CF6')(`
       ∧＿∧
      (｡･ω･｡)  "Great! Your project is ready!"
      ⊂　　 ノ
       しーＪ
`));

  console.log(chalk.cyan.bold(`\n🐕 Now let's build your spec! Here's how it works:\n`));
  console.log(chalk.white(`  1. Open this project in ${chalk.cyan('Claude Code')} (or your chosen AI)`));
  console.log(chalk.white(`  2. Use ${chalk.cyan('slash commands')} to guide the AI:\n`));

  console.log(chalk.hex('#EC4899')(`     The Spec-Driven Process:`));
  console.log(chalk.white(`     ${chalk.cyan('/constitution')}  - Define project principles`));
  console.log(chalk.white(`     ${chalk.cyan('/specify')}       - Write what to build`));
  console.log(chalk.white(`     ${chalk.cyan('/plan')}          - Create implementation plan`));
  console.log(chalk.white(`     ${chalk.cyan('/tasks')}         - Break into tasks`));
  console.log(chalk.white(`     ${chalk.cyan('/implement')}     - AI builds it!\n`));

  console.log(chalk.yellow(`  💡 Remember: ${chalk.dim('You drive the process, AI executes')}`));
  console.log(chalk.gray(`     Run these slash commands IN Claude Code, not here!\n`));
}

/**
 * Call official Spec Kit CLI with optional argument injection
 */
function callSpecKit(args, injectArgs = []) {
  const allArgs = [...injectArgs, ...args];

  // Default to Claude if this is an init command without --ai specified
  if (args[0] === 'init' && !args.includes('--ai') && !args.includes('claude')) {
    console.log(chalk.cyan(`🐕 Defaulting to Claude Code (use --ai to change)\n`));
    allArgs.splice(1, 0, '--ai', 'claude');
  }

  console.log(chalk.hex('#10B981')(`\n🐕 Running: specify ${allArgs.join(' ')}\n`));

  try {
    execSync(`~/.local/bin/uv tool run --from . specify ${allArgs.join(' ')}`, {
      stdio: 'inherit',
      cwd: __dirname
    });

    // After successful init, show friendly next steps
    if (args[0] === 'init') {
      showDogNextSteps();
    }
  } catch (error) {
    console.error(chalk.red('\n❌ Command failed'));
    process.exit(error.status || 1);
  }
}

/**
 * Deploy swarm for implementation
 */
async function deploySwarm(description) {
  console.log(chalk.hex('#EC4899')('\n🤖 Initializing swarm orchestrator...\n'));

  // Lazy load swarm orchestrator
  const { default: EnhancedSwarmOrchestrator } = await import('./enhanced-swarm-orchestrator.js');

  console.log(chalk.hex('#10B981')(`📋 Task: ${description}\n`));

  // Deploy swarm
  const swarmProcess = spawn('node', ['enhanced-swarm-orchestrator.js', 'deploy', description], {
    stdio: 'inherit',
    cwd: __dirname
  });

  swarmProcess.on('close', (code) => {
    if (code === 0) {
      console.log(chalk.green('\n✅ Swarm deployment completed!'));
    } else {
      console.error(chalk.red('\n❌ Swarm deployment failed'));
      process.exit(code);
    }
  });
}

/**
 * Run tests with swarm
 */
async function runSwarmTests() {
  console.log(chalk.hex('#EC4899')('\n🧪 Running tests with red-team swarm...\n'));

  const testProcess = spawn('node', ['red-team-unit-test-swarm.js'], {
    stdio: 'inherit',
    cwd: __dirname
  });

  testProcess.on('close', (code) => {
    if (code === 0) {
      console.log(chalk.green('\n✅ All tests passed!'));
    } else {
      console.error(chalk.red('\n❌ Tests failed'));
      process.exit(code);
    }
  });
}

/**
 * Main command router
 */
async function main() {
  // No args - show help
  if (args.length === 0) {
    displayHelp();
    process.exit(0);
  }

  // Ensure Spec Kit is installed for official commands
  if (SPEC_KIT_COMMANDS.includes(command)) {
    ensureSpecKitInstalled();
    callSpecKit(args);
    return;
  }

  // Handle swarm commands
  switch (command) {
    case 'run':
    case 'deploy':
      if (args.length < 2) {
        console.error(chalk.red('❌ Please provide a description'));
        console.log(chalk.dim('Example: node spec-assistant.js run "implement user authentication"'));
        process.exit(1);
      }
      await deploySwarm(args.slice(1).join(' '));
      break;

    case 'test':
      await runSwarmTests();
      break;

    case 'swarm':
      if (args[1] === 'status') {
        console.log(chalk.hex('#10B981')('🤖 Swarm Status:'));
        console.log(chalk.dim('  Checking active swarms...'));
        execSync('ps aux | grep "swarm" | grep -v grep || echo "No active swarms"', { stdio: 'inherit' });
      } else {
        console.log(chalk.yellow('Available swarm commands: status'));
      }
      break;

    default:
      // Try to pass through to Spec Kit anyway
      console.log(chalk.yellow(`⚠️  Unknown command: ${command}`));
      console.log(chalk.dim('Attempting to pass through to Spec Kit...\n'));
      ensureSpecKitInstalled();
      callSpecKit(args);
  }
}

// Run
main().catch(error => {
  console.error(chalk.red('\n❌ Error:'), error.message);
  process.exit(1);
});
