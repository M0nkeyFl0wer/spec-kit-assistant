#!/usr/bin/env node
/**
 * Spec Kit Assistant - Friendly wrapper for GitHub Spec Kit
 * Adds helpful dog assistant, swarm orchestration, and Claude integration
 */

import { SpecLogo } from './src/character/spec-logo.js';
import chalk from 'chalk';
import { execSync, spawn, spawnSync } from 'child_process';
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
    try {
      execSync('curl -LsSf https://astral.sh/uv/install.sh | sh', { stdio: 'inherit' });
    } catch (error) {
      console.log(chalk.red('❌ Failed to install uv. Please install manually:'));
      console.log(chalk.white('   curl -LsSf https://astral.sh/uv/install.sh | sh'));
      process.exit(1);
    }
  }

  // Check if specify is installed
  try {
    execSync('~/.local/bin/uv tool list | grep specify-cli', { stdio: 'pipe' });
  } catch {
    console.log(chalk.yellow('📦 Installing GitHub Spec Kit (one-time setup)...'));
    console.log(chalk.dim('   This installs the official Spec Kit CLI tool'));
    try {
      execSync('~/.local/bin/uv tool install specify-cli', { stdio: 'inherit' });
      console.log(chalk.green('✅ Spec Kit installed successfully!'));
    } catch (error) {
      console.log(chalk.red('❌ Failed to install Spec Kit. Please install manually:'));
      console.log(chalk.white('   ~/.local/bin/uv tool install specify-cli'));
      process.exit(1);
    }
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
 * Validate and sanitize user input to prevent command injection
 */
function validateInput(input) {
  // Reject inputs with shell metacharacters
  const dangerousChars = /[;&|`$(){}[\]<>\\'"]/;
  if (dangerousChars.test(input)) {
    throw new Error(`Invalid input: contains shell metacharacters`);
  }
  return input;
}

/**
 * Validate project name (for init command)
 */
function validateProjectName(name) {
  // Only allow alphanumeric, hyphens, underscores, and dots
  const validPattern = /^[a-zA-Z0-9._-]+$/;
  if (!validPattern.test(name)) {
    throw new Error(`Invalid project name: must contain only letters, numbers, hyphens, underscores, and dots`);
  }
  return name;
}

/**
 * Call official Spec Kit CLI with optional argument injection
 * SECURITY: Uses spawn() instead of execSync to prevent command injection
 */
function callSpecKit(args, injectArgs = []) {
  const allArgs = [...injectArgs, ...args];

  // Default to Claude if this is an init command without --ai specified
  if (args[0] === 'init' && !args.includes('--ai') && !args.includes('claude')) {
    console.log(chalk.cyan(`🐕 Defaulting to Claude Code (use --ai to change)\n`));
    allArgs.splice(1, 0, '--ai', 'claude');
  }

  // Validate inputs to prevent command injection
  try {
    if (args[0] === 'init' && args[1]) {
      validateProjectName(args[1]);
    }

    // Validate all arguments
    allArgs.forEach((arg, index) => {
      // Skip validation for known safe flags
      if (arg.startsWith('--') || arg === 'init' || arg === 'check' || arg === 'constitution' || arg === 'claude') {
        return;
      }
      validateInput(arg);
    });
  } catch (error) {
    console.error(chalk.red(`\n❌ Security error: ${error.message}`));
    process.exit(1);
  }

  console.log(chalk.hex('#10B981')(`\n🐕 Running: specify ${allArgs.join(' ')}\n`));

  // SECURITY FIX: Use spawn() instead of execSync to avoid shell interpretation
  // Arguments are passed as array, not concatenated string
  const uvPath = join(process.env.HOME || '~', '.local', 'bin', 'uv');
  const specProcess = spawn(uvPath, ['tool', 'run', '--from', 'specify-cli', 'specify', ...allArgs], {
    stdio: 'inherit',
    shell: false  // Explicitly disable shell to prevent injection
  });

  specProcess.on('close', (code) => {
    if (code === 0) {
      // After successful init, show friendly next steps
      if (args[0] === 'init') {
        showDogNextSteps();
      }
    } else {
      console.error(chalk.red('\n❌ Command failed'));
      process.exit(code || 1);
    }
  });

  specProcess.on('error', (error) => {
    console.error(chalk.red('\n❌ Failed to execute command:'), error.message);
    process.exit(1);
  });
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
  // No args - run welcome flow instead of showing help
  if (args.length === 0) {
    const { runWelcomeFlow, showNextSteps } = await import('./src/onboarding/welcome-flow.js');

    try {
      const config = await runWelcomeFlow();

      if (config.mode === 'existing') {
        console.log(chalk.green('\n✅ Ready to continue! Use /specify or /implement in your AI tool\n'));
        process.exit(0);
      }

      // Create new project
      ensureSpecKitInstalled();

      const initArgs = ['init', config.projectName];
      if (config.agent && config.agent !== 'manual') {
        initArgs.push('--ai', config.agent);
      }

      console.log(chalk.cyan(`\n🚀 Creating project: ${config.projectName}\n`));

      // Call Spec Kit init
      const uvPath = join(process.env.HOME || '~', '.local', 'bin', 'uv');
      const result = spawnSync(uvPath, ['tool', 'run', '--from', 'specify-cli', 'specify', ...initArgs], {
        stdio: 'inherit',
        shell: false
      });

      if (result.status === 0) {
        // Instead of just showing next steps, automatically start the interactive guide!
        const { guideConstitution, guideSpec, guideNextSteps } = await import('./src/onboarding/interactive-guide.js');

        // Guide through constitution
        const constitutionAnswers = await guideConstitution(config.projectName);

        // Guide through first spec
        const specAnswers = await guideSpec(config.projectName, constitutionAnswers);

        // Show next steps and launch AI
        await guideNextSteps(config.agent, config.projectName, specAnswers.specPath);
      } else {
        console.error(chalk.red('\n❌ Failed to create project'));
        process.exit(1);
      }

    } catch (error) {
      if (error.message === 'User force closed the prompt') {
        console.log(chalk.dim('\n👋 Goodbye!'));
        process.exit(0);
      }
      throw error;
    }

    return;
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
