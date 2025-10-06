#!/usr/bin/env node
/**
 * Welcome Flow - Seamless onboarding for Spec Kit Assistant
 * Detects AI capabilities and guides users through setup
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import { execSync, spawnSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import os from 'os';

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
 * Setup AI agent
 */
export async function setupAIAgent() {
  console.log(chalk.hex('#0099FF').bold('\n🤖 AI Agent Setup\n'));

  const { hasClaudeKey, hasOpenAIKey } = checkAPIKeys();
  const hasClaudeCode = checkClaudeCode();
  const resources = checkSystemResources();
  const hasOllama = checkOllama();

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

  // DeepSeek local (if system capable)
  if (resources.canRunDeepSeek) {
    if (hasOllama) {
      choices.push({
        name: `${chalk.cyan('●')} DeepSeek Coder (Free, runs locally on this device)`,
        value: 'deepseek',
        short: 'DeepSeek'
      });
    } else {
      choices.push({
        name: `${chalk.cyan('○')} DeepSeek Coder (Free, needs Ollama installation)`,
        value: 'deepseek-install',
        short: 'DeepSeek'
      });
    }
  }

  // If no AI detected, offer to get Claude Code
  if (!hasClaudeCode && !hasClaudeKey && !hasOpenAIKey) {
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

  const { agent } = await inquirer.prompt([{
    type: 'list',
    name: 'agent',
    message: 'Which AI agent would you like to use?',
    choices,
    default: hasClaudeCode || hasClaudeKey ? 'claude' : (hasOllama ? 'deepseek' : 'get-claude')
  }]);

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

  // Handle installation if needed
  if (agent === 'deepseek-install') {
    const { installNow } = await inquirer.prompt([{
      type: 'confirm',
      name: 'installNow',
      message: 'Install Ollama and DeepSeek now?',
      default: true
    }]);

    if (installNow) {
      const ollamaInstalled = await installOllama();
      if (ollamaInstalled) {
        await pullDeepSeek();
        return 'deepseek';
      }
    }
    return 'manual';
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
export async function runWelcomeFlow() {
  console.log(chalk.hex('#0099FF').bold('\n🐕 Welcome to Spec Kit Assistant!\n'));

  // Check if already in a project
  if (isInProject()) {
    console.log(chalk.green('✅ Detected existing Spec Kit project\n'));

    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Continue with this project', value: 'continue' },
        { name: 'Create a new project', value: 'new' },
        { name: 'Exit', value: 'exit' }
      ]
    }]);

    if (action === 'exit') {
      process.exit(0);
    }

    if (action === 'continue') {
      return { mode: 'existing', projectPath: '.' };
    }
  }

  // Setup AI agent
  const agent = await setupAIAgent();

  // Get project info
  const { projectName } = await inquirer.prompt([{
    type: 'input',
    name: 'projectName',
    message: 'What\'s your project name?',
    default: 'my-project',
    validate: (input) => {
      if (!/^[a-zA-Z0-9._-]+$/.test(input)) {
        return 'Project name must contain only letters, numbers, hyphens, underscores, and dots';
      }
      return true;
    }
  }]);

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
  console.log(chalk.hex('#0099FF')('\n🎉 Project created successfully!\n'));

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
  } else if (agent === 'deepseek') {
    console.log(chalk.cyan('🤖 Using DeepSeek (Local AI):\n'));
    console.log(chalk.white('  1. Start coding in your favorite editor'));
    console.log(chalk.white('  2. Run DeepSeek for AI assistance:'));
    console.log(chalk.dim('     ollama run deepseek-coder:6.7b\n'));
  } else {
    console.log(chalk.gray('🤖 Manual Setup:\n'));
    console.log(chalk.white('  1. Open this folder in your AI tool of choice'));
    console.log(chalk.white('  2. Follow the Spec Kit workflow:\n'));
    console.log(chalk.dim('     constitution.md → spec → implement\n'));
  }

  console.log(chalk.green('✨ Happy coding!\n'));
}
