#!/usr/bin/env node
/**
 * Welcome Flow - Seamless onboarding for Spec Kit Assistant
 * Detects AI capabilities and guides users through setup
 */

import chalk from 'chalk';
import { execSync, spawnSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import os from 'os';
import { promptWithGuard } from './prompt-helpers.js';

// Dog ASCII art for the flow
const dogWelcome = chalk.hex('#0099FF')(`
     ∧＿∧
    (｡･ω･｡)  Woof! Let's get you set up!
    ⊂　　 ノ
     しーＪ
`);

const dogThinking = chalk.cyan(`
     ∧＿∧
    (｡･ω･｡)  Hmm, let me check your setup...
    ⊂　　 ノ
     しーＪ
`);

const dogSuccess = chalk.green(`
     ∧＿∧
    (｡･∀･｡)  Perfect! You're all set!
    ⊂　　 ノ
     しーＪ
`);

/**
 * Check if Ollama is installed and running
 */
function checkOllama() {
  try {
    const result = spawnSync('ollama', ['list'], { encoding: 'utf8', shell: false });
    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * Check system resources for local AI
 */
function checkSystemResources() {
  const totalMemGB = Math.round(os.totalmem() / (1024 ** 3));
  const cpus = os.cpus().length;

  // DeepSeek requires ~8GB RAM minimum
  const canRunDeepSeek = totalMemGB >= 8;

  return {
    totalMemGB,
    cpus,
    canRunDeepSeek,
    platform: os.platform()
  };
}

/**
 * Check for Claude Code installation
 */
function checkClaudeCode() {
  // Check for CLAUDE.md in current directory or .claude folder
  if (existsSync('CLAUDE.md') || existsSync('.claude/CLAUDE.md')) {
    return true;
  }

  // Check for Claude Code binary (VSCode extension)
  try {
    const platform = os.platform();

    if (platform === 'darwin') {
      // macOS
      const vscodeExtensions = join(os.homedir(), '.vscode/extensions');
      const vscodiumExtensions = join(os.homedir(), '.vscode-oss/extensions');

      if (existsSync(vscodeExtensions) || existsSync(vscodiumExtensions)) {
        return true;
      }
    } else if (platform === 'linux') {
      // Linux
      const vscodeExtensions = join(os.homedir(), '.vscode/extensions');
      const vscodiumExtensions = join(os.homedir(), '.vscode-oss/extensions');

      if (existsSync(vscodeExtensions) || existsSync(vscodiumExtensions)) {
        return true;
      }
    }
  } catch {
    // Ignore errors
  }

  return false;
}

/**
 * Check for API keys
 */
function checkAPIKeys() {
  const hasClaudeKey = !!process.env.ANTHROPIC_API_KEY;
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

  return { hasClaudeKey, hasOpenAIKey };
}

/**
 * Install Ollama
 */
async function installOllama() {
  console.log(chalk.cyan('\n📦 Installing Ollama for local AI...'));

  const platform = os.platform();

  try {
    if (platform === 'darwin') {
      console.log(chalk.dim('   Downloading Ollama for macOS...'));
      execSync('curl -fsSL https://ollama.com/install.sh | sh', { stdio: 'inherit' });
    } else if (platform === 'linux') {
      console.log(chalk.dim('   Downloading Ollama for Linux...'));
      execSync('curl -fsSL https://ollama.com/install.sh | sh', { stdio: 'inherit' });
    } else {
      console.log(chalk.yellow('   Please install Ollama manually from: https://ollama.com'));
      return false;
    }

    console.log(chalk.green('✅ Ollama installed successfully!'));
    return true;
  } catch (error) {
    console.log(chalk.red('❌ Failed to install Ollama'));
    console.log(chalk.dim('   Visit https://ollama.com for manual installation'));
    return false;
  }
}

/**
 * Pull DeepSeek model
 */
async function pullDeepSeek() {
  console.log(chalk.cyan('\n📥 Downloading DeepSeek Coder (this may take a few minutes)...'));

  try {
    spawnSync('ollama', ['pull', 'deepseek-coder:6.7b'], {
      stdio: 'inherit',
      shell: false
    });
    console.log(chalk.green('✅ DeepSeek ready to use!'));
    return true;
  } catch (error) {
    console.log(chalk.red('❌ Failed to download DeepSeek'));
    return false;
  }
}

/**
 * Install and configure OpenCode + DeepSeek stack (Big Pickle mode)
 */
async function configureOpencodeAgent(options = {}, context = {}) {
  const {
    skipConfirmation = false,
    label = 'Big Pickle (OpenCode + DeepSeek)',
    showIntro = true
  } = options;

  if (showIntro) {
    console.log(chalk.hex('#0099FF')(`\n🐕 Setting up ${label}!\n`));
  }

  if (!skipConfirmation) {
    const installNow = await promptWithGuard({
      type: 'confirm',
      name: 'installNow',
      message: `Install the ${label} stack now (Ollama, DeepSeek, Open WebUI)?`,
      default: true
    }, 'agentDetection', context);

    if (!installNow) {
      return 'manual';
    }
  } else {
    console.log(chalk.dim('   Sit tight, I\'ll fetch everything you need for Big Pickle...\n'));
  }

  const ollamaInstalled = await installOllama();
  if (!ollamaInstalled) {
    return 'manual';
  }

  await pullDeepSeek();

  console.log(chalk.cyan('\n📦 Installing Open WebUI (web interface for Ollama)...'));
  console.log(chalk.dim('   This provides a chat experience for DeepSeek\n'));

  try {
    spawnSync('docker', ['run', '-d', '-p', '3000:8080', '--add-host=host.docker.internal:host-gateway',
      '-v', 'open-webui:/app/backend/data', '--name', 'open-webui', '--restart', 'always',
      'ghcr.io/open-webui/open-webui:main'], {
      stdio: 'inherit',
      shell: false
    });

    console.log(dogSuccess);
    console.log(chalk.green(`✅ ${label} installed and ready!`));
    console.log(chalk.cyan('\n  Access Open WebUI at: ') + chalk.underline('http://localhost:3000'));
    console.log(chalk.dim('  (Specify will use this with --ai opencode)\n'));
    return 'opencode';
  } catch (error) {
    console.log(chalk.yellow('\n⚠️  Open WebUI not installed (Docker required)'));
    console.log(chalk.dim('  You can still use: ollama run deepseek-coder\n'));
    return 'opencode';
  }
}

/**
 * Setup AI agent
 */
export async function setupAIAgent(context = {}) {
  console.log(dogThinking);
  console.log(chalk.hex('#0099FF').bold('🤖 AI Agent Setup\n'));

  const { hasClaudeKey, hasOpenAIKey } = checkAPIKeys();
  const hasClaudeCode = checkClaudeCode();
  const resources = checkSystemResources();
  const hasOllama = checkOllama();
  const noKnownAgents = !hasClaudeCode && !hasClaudeKey && !hasOpenAIKey;
  const canOfferBigPickle = resources.canRunDeepSeek;

  // Offer automatic Big Pickle setup when nothing else is configured
  if (noKnownAgents && canOfferBigPickle) {
    if (hasOllama) {
      console.log(chalk.cyan('\n🐕 I found Ollama already installed!'));
      console.log(chalk.white('Let\'s use Big Pickle mode (OpenCode + DeepSeek) since everything is ready.\n'));
      return 'opencode';
    }

    const autoSetupBigPickle = await promptWithGuard({
      type: 'confirm',
      name: 'autoSetupBigPickle',
      message: 'Looks like you don\'t have an AI agent yet. Set up Big Pickle (OpenCode + DeepSeek) for free?',
      default: true
    }, 'agentDetection', context);

    if (autoSetupBigPickle) {
      const result = await configureOpencodeAgent({ skipConfirmation: true }, context);
      if (result === 'opencode') {
        return result;
      }

      console.log(chalk.yellow('\n⚠️  Big Pickle setup skipped. Let\'s choose another option together.\n'));
    }
  }

  const choices = [];

  // Claude Code (if installed OR API key available)
  if (hasClaudeCode || hasClaudeKey) {
    choices.push({
      name: `${chalk.hex('#0099FF')('●')} Claude Code ${hasClaudeCode ? '(installed)' : '(API key detected)'}`,
      value: 'claude',
      short: 'Claude'
    });
  }

  // OpenAI (if API key available)
  if (hasOpenAIKey) {
    choices.push({
      name: `${chalk.green('●')} OpenAI ChatGPT (API key detected)`,
      value: 'openai',
      short: 'OpenAI'
    });
  }

  // DeepSeek local (if system capable) - uses "opencode" in Specify
  if (resources.canRunDeepSeek) {
    if (hasOllama) {
      choices.push({
        name: `${chalk.cyan('●')} Big Pickle (OpenCode + DeepSeek detected)`,
        value: 'opencode',
        short: 'Big Pickle'
      });
    } else {
      choices.push({
        name: `${chalk.cyan('○')} Big Pickle (install OpenCode + DeepSeek stack)`,
        value: 'opencode-install',
        short: 'Big Pickle'
      });
    }
  }

  // If no AI detected, offer to get Claude Code
  if (noKnownAgents) {
    choices.push({
      name: `${chalk.hex('#0099FF')('○')} Get Claude Code (recommended for best experience)`,
      value: 'get-claude',
      short: 'Get Claude'
    });
  }

  // Generic option
  choices.push({
    name: `${chalk.gray('○')} Use any AI (manual setup later)`,
    value: 'manual',
    short: 'Manual'
  });

  let defaultChoice = 'manual';
  if (hasClaudeCode || hasClaudeKey) {
    defaultChoice = 'claude';
  } else if (hasOpenAIKey) {
    defaultChoice = 'openai';
  } else if (hasOllama && resources.canRunDeepSeek) {
    defaultChoice = 'opencode';
  } else if (resources.canRunDeepSeek) {
    defaultChoice = 'opencode-install';
  } else if (noKnownAgents) {
    defaultChoice = 'get-claude';
  }

  const agent = await promptWithGuard({
    type: 'list',
    name: 'agent',
    message: 'Which AI agent would you like to use?',
    choices,
    default: defaultChoice
  }, 'agentDetection', context);

  // Handle get-claude option
  if (agent === 'get-claude') {
    console.log(chalk.hex('#0099FF')('\n📖 Getting Claude Code:\n'));
    console.log(chalk.white('  Claude Code is the best AI coding assistant for Spec Kit!'));
    console.log();
    console.log(chalk.cyan('  Download here: ') + chalk.underline('https://claude.ai/claude-code'));
    console.log();
    console.log(chalk.dim('  After installing, run this command again!\n'));
    process.exit(0);
  }

  // Handle opencode installation (Ollama + Open WebUI)
  if (agent === 'opencode-install') {
    return await configureOpencodeAgent({}, context);
  }

  return agent;
}

/**
 * Check if in existing project
 */
function isInProject() {
  return existsSync('.specify') || existsSync('constitution.md');
}

/**
 * Main welcome flow
 */
export async function runWelcomeFlow(context = {}) {
  const { flowController } = context;
  flowController?.transition('welcome', 'Welcome to Spec Kit Assistant!');

  // Show the full banner logo first
  const { SpecLogo } = await import('../character/spec-logo.js');
  console.log(SpecLogo.pixelDog);

  console.log(dogWelcome);
  console.log(chalk.hex('#0099FF').bold('I\'m Spec, your loyal companion and support dog!\n'));
  console.log(chalk.white('I\'ll guide you through setting up your project step by step.\n'));

  // Check if already in a project
  if (isInProject()) {
    console.log(chalk.green('✅ Detected existing Spec Kit project\n'));

    const action = await promptWithGuard({
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Continue with this project', value: 'continue' },
        { name: 'Create a new project', value: 'new' },
        { name: 'Exit', value: 'exit' }
      ]
    }, 'welcome', context);

    if (action === 'exit') {
      process.exit(0);
    }

    if (action === 'continue') {
      return { mode: 'existing', projectPath: '.' };
    }
  }

  // Setup AI agent
  flowController?.transition('agentDetection', 'Let\'s pick the best AI copilot for you.');
  const agent = await setupAIAgent(context);

  // Get project info
  flowController?.transition('projectInit', 'Great! Let’s reserve a project folder name.');
  const projectQuestion = {
    type: 'input',
    name: 'projectName',
    message: 'What\'s your project name?',
    default: 'my-project',
    validate: (input) => input.trim().length > 0 || 'Project name is required'
  };

  let projectName = null;
  while (!projectName) {
    const rawName = await promptWithGuard({ ...projectQuestion }, 'projectInit', context);
    const trimmed = rawName.trim();

    if (!trimmed) {
      console.log(chalk.yellow('⚠️  Project name cannot be empty.'));
      continue;
    }

    const sanitized = trimmed.replace(/\s+/g, '-');

    if (!/^[a-zA-Z0-9._-]+$/.test(sanitized)) {
      console.log(chalk.yellow('⚠️  Please use letters, numbers, dots, underscores, or hyphens.'));
      continue;
    }

    if (sanitized !== rawName) {
      console.log(chalk.dim(`   Converted to ${sanitized} for a filesystem-friendly name.`));
    }

    projectName = sanitized;
  }

  return {
    mode: 'new',
    projectName,
    agent
  };
}

/**
 * Show next steps after project creation
 */
export function showNextSteps(agent, projectPath) {
  console.log(dogSuccess);
  console.log(chalk.hex('#0099FF')('🎉 Project created successfully!\n'));

  console.log(chalk.white('📁 Your project is ready at:'), chalk.cyan(projectPath));
  console.log();

  // Agent-specific instructions
  if (agent === 'claude') {
    console.log(chalk.hex('#0099FF')('🤖 Using Claude Code:\n'));
    console.log(chalk.white('  1. Open this folder in Claude Code'));
    console.log(chalk.white('  2. Use these slash commands:\n'));
    console.log(chalk.dim('     /constitution - Define project principles'));
    console.log(chalk.dim('     /specify      - Describe what to build'));
    console.log(chalk.dim('     /implement    - Let Claude build it!\n'));
  } else if (agent === 'opencode') {
    console.log(chalk.cyan('🤖 Using DeepSeek via Open WebUI:\n'));
    console.log(chalk.white('  1. Open Open WebUI: ') + chalk.underline('http://localhost:3000'));
    console.log(chalk.white('  2. Select DeepSeek Coder model'));
    console.log(chalk.white('  3. Chat with AI about your spec!\n'));
    console.log(chalk.dim('     Or use CLI: ollama run deepseek-coder:6.7b\n'));
  } else {
    console.log(chalk.gray('🤖 Manual Setup:\n'));
    console.log(chalk.white('  1. Open this folder in your AI tool of choice'));
    console.log(chalk.white('  2. Follow the Spec Kit workflow:\n'));
    console.log(chalk.dim('     constitution.md → spec → implement\n'));
  }

  console.log(chalk.green('✨ Happy coding!\n'));
}
