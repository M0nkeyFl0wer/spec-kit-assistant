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
 * Call official Spec Kit CLI (v1.0.0+)
 * SECURITY: Uses spawn() instead of execSync to prevent command injection
 */
function callSpecKit(args) {
  const allArgs = [...args];

  // Validate inputs to prevent command injection
  try {
    // Find project name (first non-flag argument after command)
    const projectNameIndex = allArgs.findIndex((arg, i) => i > 0 && !arg.startsWith('--') && !['claude', 'sh', 'ps'].includes(arg));
    if (projectNameIndex > 0) {
      validateProjectName(allArgs[projectNameIndex]);
    }

    // Validate all arguments
    allArgs.forEach((arg) => {
      if (arg.startsWith('--') || ['init', 'check', 'constitution', 'version', 'claude', 'sh', 'ps'].includes(arg)) {
        return;
      }
      validateInput(arg);
    });
  } catch (error) {
    console.error(chalk.red(`\n❌ Security error: ${error.message}`));
    process.exit(1);
  }

  // Use specify (v1.0.0)
  const uvPath = join(process.env.HOME || '~', '.local', 'bin', 'uv');
  const spawnArgs = ['tool', 'run', '--from', 'specify-cli', 'specify', ...allArgs];

  return new Promise((resolve) => {
    const specProcess = spawn(uvPath, spawnArgs, {
      stdio: 'inherit',
      shell: false
    });

    specProcess.on('close', (code) => {
      if (code === 0) {
        if (args[0] === 'init') {
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
 * Auto-detect best AI agent
 */
function detectAIAgent() {
  // Check for Claude Code CLI
  try {
    execSync('which claude', { stdio: 'pipe' });
    return 'claude';
  } catch {}

  // Check for API key
  if (process.env.ANTHROPIC_API_KEY) {
    return 'claude';
  }

  // Check for OpenAI
  if (process.env.OPENAI_API_KEY) {
    return 'codex';
  }

  // Default to claude (most common)
  return 'claude';
}

/**
 * Main command router
 */
async function main() {
  // No args - quick start with auto-detection
  if (args.length === 0) {
    console.log(SpecLogo.pixelDog);
    console.log(chalk.hex('#0099FF')('\n🐕 Spec Kit Assistant - Quick Start\n'));

    const agent = detectAIAgent();
    console.log(chalk.dim(`   Detected AI: ${agent}\n`));

    console.log(chalk.white('Usage:'));
    console.log(chalk.white('  node spec-assistant.js init <project-name>  ') + chalk.dim('# Create new project'));
    console.log(chalk.white('  node spec-assistant.js init .               ') + chalk.dim('# Initialize current directory'));
    console.log(chalk.white('  node spec-assistant.js check                ') + chalk.dim('# Check project status'));
    console.log(chalk.white('  node spec-assistant.js run "task"           ') + chalk.dim('# Deploy swarm'));
    console.log();
    console.log(chalk.hex('#10B981')('Quick start:'));
    console.log(chalk.cyan(`  node spec-assistant.js init my-project\n`));
    return;
  }

  // Handle init specially - auto-detect agent and use v1.0.0 flags
  if (command === 'init') {
    ensureSpecKitInstalled();

    // Determine project path before running
    const projectArg = args[1];
    const isCurrentDir = projectArg === '.' || args.includes('--here');
    const projectPath = isCurrentDir ? process.cwd() : join(process.cwd(), projectArg);

    // If no --ai flag provided, auto-detect
    const agent = detectAIAgent();
    if (!args.includes('--ai')) {
      console.log(chalk.dim(`🐕 Using AI agent: ${agent}\n`));
      args.splice(1, 0, '--ai', agent);
    }

    // Add script type if not specified
    if (!args.includes('--script')) {
      const scriptType = process.platform === 'win32' ? 'ps' : 'sh';
      args.push('--script', scriptType);
    }

    await callSpecKit(args);

    // Auto-launch Claude if that's the agent
    if (agent === 'claude' && existsSync(projectPath)) {
      // Create CLAUDE.md with guided workflow instructions
      const claudeMdPath = join(projectPath, 'CLAUDE.md');
      if (!existsSync(claudeMdPath)) {
        const claudeMdContent = `# Spec Kit Project

This is a spec-driven development project. Guide the user through the workflow.

## Workflow Steps

1. **Constitution** - Run \`/speckit.constitution\` with user's project description
2. **Specification** - Run \`/speckit.specify <feature>\` for each feature
3. **Planning** - Run \`/speckit.plan\` to create implementation plan
4. **Tasks** - Run \`/speckit.tasks\` to generate actionable tasks
5. **Implementation** - Run \`/speckit.implement\` to build it

## Guided Mode

When the user starts a new session, ask them:
- What they want to build (if constitution not done)
- What feature to specify next (if constitution done)

Then run the appropriate slash command FOR them with their input.

## Available Commands

- \`/speckit.constitution\` - Establish project principles
- \`/speckit.specify <description>\` - Create feature specification
- \`/speckit.clarify\` - Clarify ambiguous requirements
- \`/speckit.plan\` - Create implementation plan
- \`/speckit.tasks\` - Generate tasks from plan
- \`/speckit.implement\` - Execute implementation
- \`/speckit.analyze\` - Cross-artifact consistency check
- \`/speckit.checklist\` - Quality validation checklist
`;
        const { writeFileSync } = await import('fs');
        writeFileSync(claudeMdPath, claudeMdContent);
        console.log(chalk.dim('   Created CLAUDE.md with workflow guidance'));
      }

      console.log(chalk.hex('#0099FF')('\n🐕 Launching Claude Code with guided setup...\n'));

      // Small delay to let user see the message
      await new Promise(resolve => setTimeout(resolve, 500));

      // Guided prompt that walks user through the spec-kit workflow
      const guidedPrompt = `🐕 Welcome to your new Spec Kit project!

I'll guide you through setting up your project step by step.

**Step 1: Project Constitution**
First, let's establish your project's core principles and guidelines.

Please tell me briefly:
- What is this project? (1-2 sentences)
- Who is it for?
- Any key constraints or principles?

Once you answer, I'll run /speckit.constitution to formalize these into your project's constitution.

(Or if you'd like to skip ahead, just say "skip" and I'll show you all available commands.)`;

      // Launch Claude with the guided prompt
      const claudeProcess = spawn('claude', [guidedPrompt], {
        cwd: projectPath,
        stdio: 'inherit',
        shell: false
      });

      claudeProcess.on('error', (error) => {
        console.log(chalk.yellow('\n⚠️  Could not auto-launch Claude.'));
        console.log(chalk.white('Run manually:'));
        console.log(chalk.cyan(`  cd ${projectPath} && claude\n`));
      });

      // Don't wait for Claude to exit - let it take over
      return;
    }

    return;
  }

  // Other Spec Kit commands (check, constitution)
  if (SPEC_KIT_COMMANDS.includes(command) && command !== 'init') {
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
