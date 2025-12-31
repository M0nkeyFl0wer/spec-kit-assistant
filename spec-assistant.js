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
import { FlowController } from './src/onboarding/flow-controller.js';
import { SideQuestManager } from './src/onboarding/side-quest-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
 * Display help
 */
function displayHelp() {
  console.log(SpecLogo.pixelDog);
  console.log(chalk.dim('Spec Kit Assistant\n'));

  console.log(chalk.hex('#10B981')('Spec Kit Commands:'));
  console.log(chalk.white('  node spec-assistant.js init <PROJECT>    ') + chalk.dim('# Create new project'));
  console.log(chalk.white('  node spec-assistant.js check             ') + chalk.dim('# Check project status'));
  console.log(chalk.white('  node spec-assistant.js constitution      ') + chalk.dim('# Create principles'));

  console.log(chalk.hex('#EC4899')('\nSwarm Commands:'));
  console.log(chalk.white('  node spec-assistant.js run <description> ') + chalk.dim('# Deploy swarm to implement'));
  console.log(chalk.white('  node spec-assistant.js test              ') + chalk.dim('# Run swarm tests'));

  console.log(chalk.dim('\n📖 https://github.com/github/spec-kit'));
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
 * Show next steps after init
 */
function showNextSteps() {
  console.log(chalk.green('\n✅ Project initialized!\n'));
  console.log(chalk.white('Next steps:'));
  console.log(chalk.white('  1. Open in Claude Code (or your AI)'));
  console.log(chalk.white('  2. Create specs with /specify or /constitution'));
  console.log(chalk.white('  3. Implement with /implement\n'));
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
function callSpecKit(args, injectArgs = [], options = {}) {
  const { skipAutoNextSteps = false, allowDefaultAgent = true } = options;
  const allArgs = [...args];

  if (injectArgs.length > 0) {
    if (args[0] === 'init') {
      allArgs.splice(1, 0, ...injectArgs);
    } else {
      allArgs.push(...injectArgs);
    }
  }

  // Default to Claude if this is an init command without --ai specified
  if (allowDefaultAgent && args[0] === 'init' && !allArgs.includes('--ai') && !allArgs.includes('claude')) {
    allArgs.splice(1, 0, '--ai', 'claude');
  }

  // Validate inputs to prevent command injection
  try {
    if (allArgs[0] === 'init' && allArgs[1]) {
      validateProjectName(allArgs[1]);
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

  // SECURITY FIX: Use spawn() instead of execSync to avoid shell interpretation
  // Arguments are passed as array, not concatenated string
  const uvPath = join(process.env.HOME || '~', '.local', 'bin', 'uv');
  const localSpecKitPath = join(__dirname, '..', 'spec-kit-official');
  const specSource = existsSync(localSpecKitPath) ? localSpecKitPath : 'specify-cli';
  const spawnArgs = ['tool', 'run', '--from', specSource, 'specify', ...allArgs];

  return new Promise((resolve) => {
    const specProcess = spawn(uvPath, spawnArgs, {
      stdio: 'inherit',
      shell: false  // Explicitly disable shell to prevent injection
    });

    specProcess.on('close', (code) => {
      if (code === 0) {
        // After successful init, show next steps unless caller suppresses them
        if (args[0] === 'init' && !skipAutoNextSteps) {
          showNextSteps();
        }
        resolve(0);
      } else {
        console.error(chalk.red('\n❌ Command failed'));
        process.exit(code || 1);
      }
    });

    specProcess.on('error', (error) => {
      console.error(chalk.red('\n❌ Failed to execute command:'), error.message);
      process.exit(1);
    });
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
 * Map onboarding agent choice to Specify CLI agent identifier
 */
function mapAgentToSpecify(agent) {
  if (!agent || agent === 'manual') {
    return null;
  }

  if (agent === 'openai') {
    return 'codex';
  }

  return agent;
}

/**
 * Determine default script flag for Specify CLI based on platform
 */
function getDefaultScriptArgs(existingArgs = []) {
  if (existingArgs.includes('--script')) {
    return [];
  }

  const isWindows = process.platform === 'win32';
  const scriptType = isWindows ? 'ps' : 'sh';
  return ['--script', scriptType];
}

/**
 * Launch the selected agent experience automatically
 */
function launchAgentExperience(agent, projectPath) {
  if (!agent) {
    return;
  }

  if (agent === 'claude') {
    console.log(chalk.hex('#0099FF')('\n🐕 Opening Claude Code for you...'));
    try {
      const vscode = spawnSync('code', [projectPath], { shell: false });
      if (vscode.status === 0) {
        console.log(chalk.green('✅ Project opened in VS Code / Claude Code.'));
      } else {
        throw new Error('VS Code returned non-zero exit code');
      }
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not launch VS Code automatically.'));
      console.log(chalk.dim(`   Please open ${projectPath} in Claude Code manually.`));
    }
    return;
  }

  if (agent === 'opencode') {
    console.log(chalk.hex('#0099FF')('\n🐕 Launching Big Pickle (OpenCode + DeepSeek) workspace...'));
    const url = 'http://localhost:3000';
    try {
      let command;
      let args;

      if (process.platform === 'darwin') {
        command = 'open';
        args = [url];
      } else if (process.platform === 'win32') {
        command = 'cmd';
        args = ['/c', 'start', '', url];
      } else {
        command = 'xdg-open';
        args = [url];
      }

      const opener = spawnSync(command, args, { shell: false, stdio: 'ignore' });
      if (opener.status !== 0) {
        throw new Error(`open command exited with ${opener.status}`);
      }

      console.log(chalk.green('✅ Big Pickle workspace opened in your browser.'));
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not automatically open Big Pickle.'));
      console.log(chalk.dim(`   Open ${url} in your browser to continue.`));
    }
    return;
  }

  // Default: no auto-launch, but provide guidance
  console.log(chalk.dim('\n🐕 Tip: open your project in your chosen AI tool to continue the workflow.'));
}

/**
 * Handle post-welcome actions such as project scaffolding and guided setup
 */
async function handleWelcomeOutcome(result, context = {}) {
  if (!result) {
    return;
  }

  const { flowController } = context;

  if (result.mode === 'existing') {
    flowController?.transition('complete', 'Welcome back to your existing project.');
    console.log(chalk.green('\n🐕 Welcome back to your Spec Kit project!'));
    console.log(chalk.white('Use guided commands like `node spec-assistant.js run` or `node spec-assistant.js test` to keep moving.'));
    return;
  }

  if (result.mode === 'new') {
    ensureSpecKitInstalled();

    const specifyAgent = mapAgentToSpecify(result.agent);
    const injectArgs = [];
    const callOptions = { skipAutoNextSteps: true };

    if (specifyAgent) {
      injectArgs.push('--ai', specifyAgent);
    } else {
      callOptions.allowDefaultAgent = false;
    }

    const scriptArgs = getDefaultScriptArgs(injectArgs);
    if (scriptArgs.length) {
      injectArgs.push(...scriptArgs);
    }

    flowController?.transition('projectInit', 'Scaffolding your Spec Kit project...');
    await callSpecKit(['init', result.projectName], injectArgs, callOptions);

    const projectPath = result.projectName === '.' ? process.cwd() : join(process.cwd(), result.projectName);

    if (!existsSync(projectPath)) {
      console.error(chalk.red(`\n❌ Could not find project directory at ${projectPath}`));
      console.error(chalk.red('Please rerun the command or create the project manually with `specify init`.'));
      return;
    }

    flowController?.transition('agentLaunch', 'Opening your AI workspace now.');
    launchAgentExperience(result.agent, projectPath);
    const { runSpecKitGuidedFlow } = await import('./src/onboarding/spec-kit-flow.js');
    await runSpecKitGuidedFlow(projectPath, result.agent, context);
  }
}

/**
 * Main command router
 */
async function main() {
  // No args - run welcome flow
  if (args.length === 0) {
    const flowController = new FlowController();
    const sideQuestManager = new SideQuestManager(process.cwd());
    const onboardingContext = { flowController, sideQuestManager };

    const { runWelcomeFlow } = await import('./src/onboarding/welcome-flow.js');
    const onboardingResult = await runWelcomeFlow(onboardingContext);
    await handleWelcomeOutcome(onboardingResult, onboardingContext);
    return;
  }

  // Ensure Spec Kit is installed for official commands
  if (SPEC_KIT_COMMANDS.includes(command)) {
    ensureSpecKitInstalled();
    await callSpecKit(args);
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
      await callSpecKit(args);
  }
}

// Run
main().catch(error => {
  console.error(chalk.red('\n❌ Error:'), error.message);
  process.exit(1);
});
