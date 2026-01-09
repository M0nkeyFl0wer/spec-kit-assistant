/**
 * Interactive Launcher
 * Smart launcher that detects state and guides user to next step.
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { execSync, spawn } from 'child_process';
import { existsSync } from 'fs';
import fs from 'fs-extra';
import { join, basename } from 'path';
import { homedir } from 'os';

import {
  detectInstalledAgents,
  detectCurrentAgent,
  getPreferredAgent,
  getAgentMeta,
  AgentType
} from './agent-detector.js';

import {
  analyzeWorkflowState,
  analyzeProjectState,
  getNextAction,
  WorkflowStage
} from './workflow-state.js';

import { getKnownSessions, registerSession } from '../guided/utils/config-paths.js';
import { runPostImplementation } from './post-implementation.js';
import { setupAgentInstructions, detectAgentSetup } from './setup-agent-instructions.js';
import dogs from '../character/ascii-dogs.js';
import { SpecLogo } from '../character/spec-logo.js';

/**
 * Main interactive launcher
 */
export async function launch(options = {}) {
  const { quiet = false } = options;

  if (!quiet) {
    // Show the beautiful pixel dog logo
    console.log(SpecLogo.pixelDog);
  }

  // Detect current state
  const currentAgent = detectCurrentAgent();
  const installedAgents = detectInstalledAgents();

  // Are we inside an agent session?
  if (currentAgent) {
    return handleInAgentFlow(currentAgent, options);
  }

  // Analyze workflow state
  const state = await analyzeWorkflowState({
    installedAgents,
    currentAgent: null,
    projectPath: options.projectPath || null
  });

  // Route based on stage
  switch (state.stage) {
    case WorkflowStage.NO_AGENT:
      return handleNoAgentFlow(installedAgents);

    case WorkflowStage.NO_PROJECT:
      return handleProjectSelectionFlow(state);

    case WorkflowStage.PROJECT_SELECTED:
      return handleLaunchAgentFlow(state);

    default:
      return handleProjectSelectionFlow(state);
  }
}

/**
 * Handle case when no agent is installed
 */
async function handleNoAgentFlow() {
  console.log(dogs.CURIOUS);
  console.log(chalk.yellow("I couldn't find any AI coding agents installed.\n"));
  console.log("Spec Kit works best with an AI agent. Here are your options:\n");

  console.log(chalk.cyan.bold('─── FREE OPTIONS ───\n'));

  const agents = [
    {
      name: `${chalk.green('★')} Gemini CLI ${chalk.green('(FREE)')}`,
      value: AgentType.GEMINI_CLI,
      description: '1,500 requests/day free - just needs Google account'
    },
    {
      name: `${chalk.green('★')} OpenCode + Local AI ${chalk.green('(FREE)')}`,
      value: 'opencode',
      description: 'Run AI locally with Ollama - no account needed!'
    },
    new inquirer.Separator(chalk.dim('\n─── PAID OPTIONS ───\n')),
    {
      name: 'Claude Code',
      value: AgentType.CLAUDE_CODE,
      description: 'Anthropic\'s CLI - best for spec-driven dev'
    },
    {
      name: 'Cursor',
      value: AgentType.CURSOR,
      description: 'AI-powered code editor'
    },
    {
      name: 'GitHub Copilot',
      value: AgentType.GITHUB_COPILOT,
      description: 'GitHub\'s AI assistant'
    },
    new inquirer.Separator(''),
    {
      name: 'Continue without an agent',
      value: 'skip',
      description: 'I\'ll guide you through manually'
    }
  ];

  const { choice } = await inquirer.prompt([{
    type: 'list',
    name: 'choice',
    message: 'Which agent would you like to install?',
    choices: agents.map(a => {
      // Handle separators
      if (a instanceof inquirer.Separator || a.type === 'separator') {
        return a;
      }
      return {
        name: `${a.name} - ${chalk.dim(a.description)}`,
        value: a.value
      };
    })
  }]);

  if (choice === 'skip') {
    console.log(chalk.dim("\nOkay! You can always install an agent later.\n"));
    return handleProjectSelectionFlow({ stage: WorkflowStage.NO_PROJECT, recentProjects: [] });
  }

  // Special handling for Gemini - it's free and easy!
  if (choice === AgentType.GEMINI_CLI) {
    return handleGeminiSetupFlow();
  }

  // Special handling for OpenCode - free with local models!
  if (choice === 'opencode') {
    return handleOpenCodeSetupFlow();
  }

  const meta = getAgentMeta(choice);
  console.log(`\n${chalk.cyan('To install ' + meta.name + ':')}\n`);
  console.log(`  ${chalk.bold(meta.installCmd)}\n`);
  console.log(chalk.dim(`Learn more: ${meta.docs}\n`));

  const { proceed } = await inquirer.prompt([{
    type: 'confirm',
    name: 'proceed',
    message: 'Would you like me to run the install command?',
    default: true
  }]);

  if (proceed) {
    console.log(chalk.dim('\nInstalling...\n'));
    try {
      execSync(meta.installCmd, { stdio: 'inherit' });
      console.log(chalk.green('\n✅ Installed! Run me again to continue.\n'));
    } catch (error) {
      console.log(chalk.red('\n❌ Installation failed. Try running manually:\n'));
      console.log(`  ${meta.installCmd}\n`);
    }
  }

  return { action: 'install_agent', agent: choice };
}

/**
 * Special setup flow for Gemini CLI - the free option!
 */
async function handleGeminiSetupFlow() {
  console.log(dogs.EXCITED);
  console.log(chalk.green.bold('\n🎉 Great choice! Gemini CLI is FREE to use.\n'));

  console.log(chalk.cyan('Here\'s what you get with Gemini\'s free tier:\n'));
  console.log(`  ${chalk.green('✓')} 1,500 requests per day`);
  console.log(`  ${chalk.green('✓')} Access to Gemini 2.0 Flash`);
  console.log(`  ${chalk.green('✓')} Full terminal integration`);
  console.log(`  ${chalk.green('✓')} Works great with Spec Kit!\n`);

  console.log(chalk.dim('─'.repeat(50) + '\n'));

  // Check if already installed
  let isInstalled = false;
  try {
    execSync('which gemini', { stdio: 'ignore' });
    isInstalled = true;
  } catch (e) {
    // Not installed
  }

  if (isInstalled) {
    console.log(dogs.CELEBRATION);
    console.log(chalk.green.bold('✅ Gemini CLI is already installed!\n'));

    const { launchNow } = await inquirer.prompt([{
      type: 'confirm',
      name: 'launchNow',
      message: 'Launch Gemini now?',
      default: true
    }]);

    if (launchNow) {
      console.log(dogs.RUNNING);
      console.log(chalk.green('Launching Gemini...\n'));

      const child = spawn('gemini', [], {
        stdio: 'inherit',
        shell: true
      });

      return new Promise((resolve) => {
        child.on('close', (code) => {
          resolve({ action: 'launched', agent: AgentType.GEMINI_CLI, exitCode: code });
        });
      });
    }

    return { action: 'gemini_ready' };
  }

  // Installation steps
  console.log(chalk.cyan.bold('📦 Installation Steps:\n'));

  console.log(`  ${chalk.bold('1.')} Install Gemini CLI:`);
  console.log(`     ${chalk.cyan('npm install -g @google/gemini-cli')}\n`);

  console.log(`  ${chalk.bold('2.')} Run ${chalk.cyan('gemini')} and follow the auth prompts`);
  console.log(`     ${chalk.dim('(Uses your Google account - no credit card needed)')}\n`);

  console.log(`  ${chalk.bold('3.')} Come back here and run ${chalk.cyan('spec')} again!\n`);

  const { installNow } = await inquirer.prompt([{
    type: 'confirm',
    name: 'installNow',
    message: 'Install Gemini CLI now?',
    default: true
  }]);

  if (installNow) {
    console.log(dogs.WORKING);
    console.log(chalk.dim('\nInstalling Gemini CLI...\n'));

    try {
      execSync('npm install -g @google/gemini-cli', { stdio: 'inherit' });

      console.log(dogs.CELEBRATION);
      console.log(chalk.green.bold('\n✅ Gemini CLI installed!\n'));

      console.log(chalk.cyan('Now let\'s set it up:\n'));

      const { setupNow } = await inquirer.prompt([{
        type: 'confirm',
        name: 'setupNow',
        message: 'Run Gemini to complete setup? (authenticates with Google)',
        default: true
      }]);

      if (setupNow) {
        console.log(chalk.dim('\nLaunching Gemini for authentication...\n'));
        console.log(chalk.yellow('Follow the prompts to sign in with Google.\n'));

        const child = spawn('gemini', [], {
          stdio: 'inherit',
          shell: true
        });

        return new Promise((resolve) => {
          child.on('close', (code) => {
            if (code === 0) {
              console.log(dogs.LOVE);
              console.log(chalk.green.bold('\n🎉 You\'re all set! Gemini is ready to use.\n'));
            }
            resolve({ action: 'gemini_setup', exitCode: code });
          });
        });
      }

      console.log(chalk.dim('\nWhen ready, just run: gemini\n'));
      return { action: 'gemini_installed' };

    } catch (error) {
      console.log(dogs.SAD);
      console.log(chalk.red('\n❌ Installation failed.\n'));
      console.log(chalk.dim('Try running manually:'));
      console.log(chalk.cyan('  npm install -g @google/gemini-cli\n'));
      return { action: 'install_failed', error };
    }
  }

  console.log(chalk.dim('\nNo problem! Run the command above when ready.\n'));
  return { action: 'deferred' };
}

/**
 * Special setup flow for OpenCode + Ollama - completely free local AI!
 */
async function handleOpenCodeSetupFlow() {
  console.log(dogs.EXCITED);
  console.log(chalk.green.bold('\n🎉 OpenCode + Local AI = Completely FREE!\n'));

  console.log(chalk.cyan('Why this combo is great:\n'));
  console.log(`  ${chalk.green('✓')} No account required`);
  console.log(`  ${chalk.green('✓')} No API keys needed`);
  console.log(`  ${chalk.green('✓')} Runs 100% locally on your machine`);
  console.log(`  ${chalk.green('✓')} Your code never leaves your computer`);
  console.log(`  ${chalk.green('✓')} Works great with Spec Kit!\n`);

  console.log(chalk.dim('─'.repeat(50) + '\n'));

  // Check what's installed
  let hasOpenCode = false;
  let hasOllama = false;

  try {
    execSync('which opencode', { stdio: 'ignore' });
    hasOpenCode = true;
  } catch (e) {}

  try {
    execSync('which ollama', { stdio: 'ignore' });
    hasOllama = true;
  } catch (e) {}

  // Show status
  console.log(chalk.cyan.bold('Current Status:\n'));
  console.log(`  OpenCode: ${hasOpenCode ? chalk.green('✓ Installed') : chalk.yellow('○ Not installed')}`);
  console.log(`  Ollama:   ${hasOllama ? chalk.green('✓ Installed') : chalk.yellow('○ Not installed')}\n`);

  if (hasOpenCode && hasOllama) {
    console.log(dogs.CELEBRATION);
    console.log(chalk.green.bold('Both are installed! You\'re ready to go.\n'));

    // Check if a model is pulled
    console.log(chalk.dim('Checking for local models...\n'));
    try {
      const models = execSync('ollama list 2>/dev/null', { encoding: 'utf8' });
      if (models.includes('llama') || models.includes('codellama') || models.includes('qwen')) {
        console.log(chalk.green('✓ Found local models ready to use!\n'));
      } else {
        console.log(chalk.yellow('No coding models found. Let\'s download one:\n'));
        console.log(chalk.dim('  Recommended: qwen2.5-coder (good balance of speed and quality)\n'));

        const { pullModel } = await inquirer.prompt([{
          type: 'confirm',
          name: 'pullModel',
          message: 'Download qwen2.5-coder model? (~4GB)',
          default: true
        }]);

        if (pullModel) {
          console.log(dogs.WORKING);
          console.log(chalk.dim('\nDownloading model (this may take a few minutes)...\n'));
          try {
            execSync('ollama pull qwen2.5-coder:7b', { stdio: 'inherit' });
            console.log(chalk.green('\n✓ Model downloaded!\n'));
          } catch (e) {
            console.log(chalk.yellow('\nDownload interrupted. You can run: ollama pull qwen2.5-coder:7b\n'));
          }
        }
      }
    } catch (e) {
      console.log(chalk.dim('Could not check models. Make sure Ollama is running.\n'));
    }

    const { launchNow } = await inquirer.prompt([{
      type: 'confirm',
      name: 'launchNow',
      message: 'Launch OpenCode now?',
      default: true
    }]);

    if (launchNow) {
      console.log(dogs.RUNNING);
      console.log(chalk.green('Launching OpenCode...\n'));
      console.log(chalk.dim('Tip: Use /models to select your local Ollama model\n'));

      const child = spawn('opencode', [], {
        stdio: 'inherit',
        shell: true
      });

      return new Promise((resolve) => {
        child.on('close', (code) => {
          resolve({ action: 'launched', agent: 'opencode', exitCode: code });
        });
      });
    }

    return { action: 'opencode_ready' };
  }

  // Installation needed
  console.log(chalk.cyan.bold('📦 Installation Steps:\n'));

  if (!hasOllama) {
    console.log(`  ${chalk.bold('1.')} Install Ollama (local AI runtime):`);
    console.log(`     ${chalk.cyan('curl -fsSL https://ollama.com/install.sh | sh')}`);
    console.log(`     ${chalk.dim('or visit: https://ollama.com/download')}\n`);
  }

  if (!hasOpenCode) {
    console.log(`  ${chalk.bold(hasOllama ? '1.' : '2.')} Install OpenCode:`);
    console.log(`     ${chalk.cyan('npm install -g opencode-ai')}\n`);
  }

  console.log(`  ${chalk.bold(hasOllama ? '2.' : '3.')} Pull a coding model:`);
  console.log(`     ${chalk.cyan('ollama pull qwen2.5-coder:7b')}`);
  console.log(`     ${chalk.dim('(~4GB, good balance of speed and quality)')}\n`);

  console.log(`  ${chalk.bold(hasOllama ? '3.' : '4.')} Launch and select model:`);
  console.log(`     ${chalk.cyan('opencode')}`);
  console.log(`     ${chalk.dim('Then use /models to select your Ollama model')}\n`);

  const { installChoice } = await inquirer.prompt([{
    type: 'list',
    name: 'installChoice',
    message: 'What would you like to do?',
    choices: [
      { name: 'Install Ollama first (required)', value: 'ollama', disabled: hasOllama ? 'Already installed' : false },
      { name: 'Install OpenCode', value: 'opencode', disabled: hasOpenCode ? 'Already installed' : false },
      { name: 'I\'ll install manually', value: 'manual' }
    ]
  }]);

  if (installChoice === 'ollama') {
    console.log(dogs.WORKING);
    console.log(chalk.dim('\nInstalling Ollama...\n'));

    try {
      execSync('curl -fsSL https://ollama.com/install.sh | sh', { stdio: 'inherit' });
      console.log(dogs.CELEBRATION);
      console.log(chalk.green.bold('\n✅ Ollama installed!\n'));

      // Recurse to continue setup
      return handleOpenCodeSetupFlow();
    } catch (error) {
      console.log(dogs.SAD);
      console.log(chalk.red('\n❌ Installation failed.\n'));
      console.log(chalk.dim('Try: curl -fsSL https://ollama.com/install.sh | sh'));
      console.log(chalk.dim('Or visit: https://ollama.com/download\n'));
    }
  }

  if (installChoice === 'opencode') {
    console.log(dogs.WORKING);
    console.log(chalk.dim('\nInstalling OpenCode...\n'));

    try {
      execSync('npm install -g opencode-ai', { stdio: 'inherit' });
      console.log(dogs.CELEBRATION);
      console.log(chalk.green.bold('\n✅ OpenCode installed!\n'));

      // Recurse to continue setup
      return handleOpenCodeSetupFlow();
    } catch (error) {
      console.log(dogs.SAD);
      console.log(chalk.red('\n❌ Installation failed.\n'));
      console.log(chalk.dim('Try: npm install -g opencode-ai\n'));
    }
  }

  console.log(chalk.dim('\nNo problem! Follow the steps above when ready.\n'));
  console.log(dogs.LOVE);
  console.log(chalk.cyan('Come back and run `spec` once you\'re set up! 🐕\n'));

  return { action: 'deferred' };
}

/**
 * Handle project selection
 */
async function handleProjectSelectionFlow(state) {
  const sessions = state.recentProjects || await getKnownSessions();

  console.log(chalk.cyan("What would you like to do?\n"));

  // Build simple numbered menu
  const options = [];

  console.log(`  ${chalk.green('1)')} Start a new project`);
  options.push({ value: 'new' });

  // Add recent projects
  let optionNum = 2;
  if (sessions.length > 0) {
    console.log(chalk.dim('\n  ── Recent Projects ──'));
    for (const session of sessions.slice(0, 5)) {
      const name = session.projectId || basename(session.projectPath);
      console.log(`  ${chalk.blue(optionNum + ')')} ${name} ${chalk.dim(`(${session.projectPath})`)}`);
      options.push({ value: { type: 'existing', path: session.projectPath, name } });
      optionNum++;
    }
  }

  console.log(`\n  ${chalk.dim(optionNum + ')')} Browse for a project`);
  options.push({ value: 'browse' });

  console.log('');

  // Use simple input prompt instead of list
  const { choice } = await inquirer.prompt([{
    type: 'input',
    name: 'choice',
    message: 'Enter number (1-' + optionNum + '):',
    validate: input => {
      const num = parseInt(input, 10);
      if (isNaN(num) || num < 1 || num > optionNum) {
        return `Please enter a number between 1 and ${optionNum}`;
      }
      return true;
    }
  }]);

  const selectedIndex = parseInt(choice, 10) - 1;
  const action = options[selectedIndex]?.value;

  if (action === 'new') {
    return handleNewProjectFlow();
  }

  if (action === 'browse') {
    return handleBrowseProjectFlow();
  }

  // Existing project selected
  if (action && action.path) {
    return handleExistingProjectFlow(action.path, action.name);
  }

  // Fallback
  console.log(chalk.yellow('\nInvalid selection. Please try again.\n'));
  return handleProjectSelectionFlow(state);
}

/**
 * Create a new project
 */
async function handleNewProjectFlow() {
  const { name } = await inquirer.prompt([{
    type: 'input',
    name: 'name',
    message: 'What should we call this project?',
    validate: input => input.trim().length > 0 || 'Please enter a name'
  }]);

  // Create directory name
  const dirName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const defaultPath = join(homedir(), 'Projects', dirName);
  const cwdPath = join(process.cwd(), dirName);

  const { location } = await inquirer.prompt([{
    type: 'list',
    name: 'location',
    message: 'Where should I create it?',
    choices: [
      { name: `~/Projects/${dirName} ${chalk.dim('(recommended)')}`, value: defaultPath },
      { name: `./${dirName} ${chalk.dim('(current directory)')}`, value: cwdPath },
      { name: 'Custom location...', value: 'custom' }
    ]
  }]);

  let targetPath = location;
  if (location === 'custom') {
    const { customPath } = await inquirer.prompt([{
      type: 'input',
      name: 'customPath',
      message: 'Enter the full path:',
      default: defaultPath
    }]);
    targetPath = customPath;
  }

  // Create directory
  await fs.ensureDir(targetPath);

  // Setup agent instructions for proactive guidance
  console.log(chalk.dim('Setting up project...'));
  await setupAgentInstructions(targetPath);

  // Register session
  await registerSession(targetPath, name);

  console.log(chalk.green(`\n✅ Created: ${targetPath}`));
  console.log(chalk.dim('   Agent instructions installed for proactive guidance.\n'));

  return launchInProject(targetPath, name);
}

/**
 * Browse for existing project
 */
async function handleBrowseProjectFlow() {
  const { path } = await inquirer.prompt([{
    type: 'input',
    name: 'path',
    message: 'Enter the project path:',
    default: process.cwd(),
    validate: input => existsSync(input) || 'Directory not found'
  }]);

  const name = basename(path);
  await registerSession(path, name);

  return handleExistingProjectFlow(path, name);
}

/**
 * Handle existing project
 */
async function handleExistingProjectFlow(projectPath, projectName) {
  console.log(chalk.dim(`\nAnalyzing ${projectName}...\n`));

  const projectStage = await analyzeProjectState(projectPath);
  const nextAction = getNextAction(projectStage);

  console.log(chalk.cyan(`📋 Project Status: ${getStageLabel(projectStage)}\n`));
  console.log(`${nextAction.message}\n`);

  // If project is in late stage, offer to run/test directly
  if (projectStage === WorkflowStage.COMPLETE ||
      projectStage === WorkflowStage.TASKS_CREATED ||
      projectStage === WorkflowStage.IMPLEMENTING) {

    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: `${chalk.green('▶️')}  Run/test the project`, value: 'run' },
        { name: `${chalk.blue('🚀')} Launch AI agent to continue`, value: 'launch' },
        { name: `${chalk.dim('👋')} Exit`, value: 'exit' }
      ]
    }]);

    if (action === 'run') {
      process.chdir(projectPath);
      return runPostImplementation(projectPath);
    }

    if (action === 'exit') {
      console.log(chalk.cyan('\n🐕 See you later!\n'));
      return { action: 'exit' };
    }
  }

  return launchInProject(projectPath, projectName, projectStage);
}

/**
 * Launch agent in project directory
 */
async function launchInProject(projectPath, projectName, stage = null) {
  const agents = detectInstalledAgents();
  const preferred = getPreferredAgent();

  if (!preferred) {
    return handleManualFlow(projectPath, projectName);
  }

  // Found an installed agent!
  console.log(dogs.ALERT);
  console.log(chalk.green(`✓ Found ${chalk.bold(preferred.name)} installed!\n`));

  const { launch } = await inquirer.prompt([{
    type: 'confirm',
    name: 'launch',
    message: `Launch ${preferred.name} in ${projectName}?`,
    default: true
  }]);

  if (!launch) {
    console.log(chalk.dim('\nOkay! When you\'re ready:\n'));
    console.log(`  cd "${projectPath}"`);
    console.log(`  ${preferred.launchCmd}\n`);
    return { action: 'deferred', projectPath };
  }

  console.log(dogs.EXCITED);
  console.log(chalk.green(`Launching ${preferred.name}...\n`));

  // Change to project directory and launch agent
  process.chdir(projectPath);

  // Analyze project state and write context file for Claude to read
  const projectStage = stage || await analyzeProjectState(projectPath);
  const nextAction = getNextAction(projectStage);

  // Write startup context that Claude should read immediately
  const contextFile = path.join(projectPath, '.speckit', 'startup-context.md');
  const contextContent = `# 🐕 Spec Kit Assistant - Startup Context

**READ THIS FIRST AND ACT ON IT IMMEDIATELY!**

## Current Project State
- **Stage**: ${getStageLabel(projectStage)}
- **Project**: ${projectName}

## Your Immediate Task
${nextAction.message}

${nextAction.command ? `**Suggested command**: \`${nextAction.command}\`\n` : ''}
## What To Do Now

Based on the stage above, take the appropriate action:

1. **No spec yet** → Ask "What would you like to build?" then run \`/spec specify\`
2. **Has spec, no plan** → Run \`/spec plan\` to create implementation plan
3. **Has plan, no tasks** → Run \`/spec tasks\` to generate tasks
4. **Has tasks** → Start implementing! Begin with task 1
5. **Implementation complete** → Run tests, celebrate, ask "What's next?"

**DO NOT** wait for user input. Start working immediately based on the stage.

---
*This file is auto-generated by come-here-spec. Delete after reading.*
`;

  // Ensure .speckit directory exists
  const speckitDir = path.join(projectPath, '.speckit');
  if (!fs.existsSync(speckitDir)) {
    fs.mkdirSync(speckitDir, { recursive: true });
  }
  fs.writeFileSync(contextFile, contextContent);

  console.log(chalk.dim(`\nLaunching ${preferred.launchCmd}...\n`));
  console.log(chalk.hex('#8B5CF6')('╭────────────────────────────────────────────────────────────╮'));
  console.log(chalk.hex('#8B5CF6')('│') + chalk.white(' 🐕 Context written! Just say "hi" to start guided flow.  ') + chalk.hex('#8B5CF6')('│'));
  console.log(chalk.hex('#8B5CF6')('╰────────────────────────────────────────────────────────────╯'));
  console.log('');

  // Launch normally - fully interactive
  const child = spawn(preferred.launchCmd, [], {
    stdio: 'inherit',
    shell: true,
    cwd: projectPath
  });

  child.on('error', (err) => {
    console.error(chalk.red(`\nFailed to launch: ${err.message}`));
    console.log(chalk.dim(`Try running manually: ${preferred.launchCmd}`));
  });

  return new Promise((resolve) => {
    child.on('close', (code) => {
      resolve({ action: 'launched', projectPath, exitCode: code });
    });
  });
}

/**
 * Handle flow when already inside an agent
 */
async function handleInAgentFlow(agentType, options) {
  const meta = getAgentMeta(agentType);

  console.log(chalk.green(`\n🐕 You're already in ${meta?.name || 'an agent session'}!\n`));

  // Check current directory for project state
  const cwd = process.cwd();
  const projectStage = await analyzeProjectState(cwd);
  const nextAction = getNextAction(projectStage);

  console.log(`${chalk.cyan('Current status:')} ${getStageLabel(projectStage)}\n`);

  // If implementation is complete or tasks are ready, offer post-implementation flow
  if (projectStage === WorkflowStage.COMPLETE ||
      projectStage === WorkflowStage.TASKS_CREATED ||
      projectStage === WorkflowStage.IMPLEMENTING) {

    const { runIt } = await inquirer.prompt([{
      type: 'confirm',
      name: 'runIt',
      message: 'Would you like to run/test your project?',
      default: true
    }]);

    if (runIt) {
      return runPostImplementation(cwd, options);
    }
  }

  console.log(`${nextAction.message}\n`);

  if (nextAction.command) {
    console.log(`${chalk.cyan('Try:')} ${chalk.bold(nextAction.command)}\n`);
  }

  return {
    action: 'in_agent',
    stage: projectStage,
    nextAction
  };
}

/**
 * Handle manual flow for users without an AI agent
 * This provides a guided experience even without Claude/Cursor/etc
 */
async function handleManualFlow(projectPath, projectName) {
  console.log(dogs.WORKING);
  console.log(chalk.cyan.bold("No AI agent detected - but don't worry!\n"));
  console.log(chalk.white("I can still guide you through the spec-driven process."));
  console.log(chalk.dim("You'll just need to run a few commands manually.\n"));

  console.log(chalk.green.bold('💡 Tip: Get a FREE AI agent in minutes!\n'));
  console.log(chalk.dim('   • Gemini CLI - free with Google account'));
  console.log(chalk.dim('   • OpenCode + Ollama - free local AI, no account needed\n'));

  const { choice } = await inquirer.prompt([{
    type: 'list',
    name: 'choice',
    message: 'What would you like to do?',
    choices: [
      {
        name: `${chalk.green('★')} Get a FREE AI agent ${chalk.green('(recommended)')}`,
        value: 'install'
      },
      {
        name: `${chalk.blue('📝')} Start with a feature description (manual)`,
        value: 'describe'
      },
      {
        name: `${chalk.dim('📋')} View the spec-driven workflow`,
        value: 'workflow'
      },
      {
        name: `${chalk.dim('👋')} Exit`,
        value: 'exit'
      }
    ]
  }]);

  if (choice === 'exit') {
    console.log(dogs.SLEEPING);
    console.log(chalk.cyan("See you later! 🐕\n"));
    return { action: 'exit', projectPath };
  }

  if (choice === 'install') {
    return handleNoAgentFlow();
  }

  if (choice === 'workflow') {
    console.log(dogs.THINKING);
    console.log(chalk.cyan.bold('\n📋 The Spec-Driven Workflow\n'));
    console.log(chalk.white('The spec-driven approach breaks features into 4 stages:\n'));

    console.log(`  ${chalk.green('1.')} ${chalk.bold('Specify')} - Describe what you want to build`);
    console.log(`     ${chalk.dim('Creates .speckit/spec.md with your feature requirements')}\n`);

    console.log(`  ${chalk.green('2.')} ${chalk.bold('Plan')} - Analyze codebase and plan implementation`);
    console.log(`     ${chalk.dim('Creates .speckit/plan.md with architectural approach')}\n`);

    console.log(`  ${chalk.green('3.')} ${chalk.bold('Tasks')} - Break into actionable work items`);
    console.log(`     ${chalk.dim('Creates .speckit/tasks.md with ordered task list')}\n`);

    console.log(`  ${chalk.green('4.')} ${chalk.bold('Implement')} - Execute tasks one by one`);
    console.log(`     ${chalk.dim('Work through tasks until feature is complete')}\n`);

    console.log(chalk.dim('─'.repeat(50) + '\n'));

    // Return to main menu
    return handleManualFlow(projectPath, projectName);
  }

  if (choice === 'describe') {
    console.log(dogs.ALERT);
    console.log(chalk.cyan.bold('\nLet\'s describe your feature!\n'));

    const { description } = await inquirer.prompt([{
      type: 'input',
      name: 'description',
      message: 'What would you like to build?',
      validate: input => input.trim().length > 0 || 'Please describe your feature'
    }]);

    // Create a basic spec file
    const specContent = `# Feature Specification

## What We're Building
${description}

## User Stories
- As a user, I want to [primary action] so that [benefit]

## Requirements
- [ ] Core functionality
- [ ] Error handling
- [ ] Testing

## Notes
Created: ${new Date().toISOString().split('T')[0]}
`;

    const fs = await import('fs-extra');
    const { join } = await import('path');

    const speckitDir = join(projectPath, '.speckit');
    await fs.default.ensureDir(speckitDir);
    await fs.default.writeFile(join(speckitDir, 'spec.md'), specContent);

    console.log(dogs.EXCITED);
    console.log(chalk.green.bold('\n✅ Spec created!\n'));
    console.log(chalk.dim(`  → ${join(speckitDir, 'spec.md')}\n`));

    console.log(chalk.cyan('Next steps:\n'));
    console.log(`  ${chalk.bold('1.')} Open ${chalk.cyan('.speckit/spec.md')} and add more details`);
    console.log(`  ${chalk.bold('2.')} Install an AI agent for guided implementation:`);
    console.log(`     ${chalk.dim('npm install -g @anthropic-ai/claude-code')}`);
    console.log(`  ${chalk.bold('3.')} Run ${chalk.cyan('claude')} to get AI assistance\n`);

    // Offer to open the spec file
    const { openIt } = await inquirer.prompt([{
      type: 'confirm',
      name: 'openIt',
      message: 'Open the spec file in your editor?',
      default: true
    }]);

    if (openIt) {
      const { execSync } = await import('child_process');
      const specPath = join(speckitDir, 'spec.md');

      // Try common editors
      const editors = ['code', 'cursor', 'subl', 'atom', 'nano', 'vim'];
      let opened = false;

      for (const editor of editors) {
        try {
          execSync(`which ${editor}`, { stdio: 'ignore' });
          const child = spawn(editor, [specPath], {
            stdio: 'ignore',
            detached: true,
            shell: true
          });
          child.unref();
          opened = true;
          console.log(chalk.dim(`\nOpened in ${editor}\n`));
          break;
        } catch (e) {
          // Try next editor
        }
      }

      if (!opened) {
        console.log(chalk.dim(`\nOpen ${specPath} in your preferred editor.\n`));
      }
    }

    console.log(dogs.LOVE);
    console.log(chalk.cyan.bold("You're all set! Happy building! 🐕\n"));

    return { action: 'manual', projectPath, specCreated: true };
  }

  return { action: 'manual', projectPath };
}

/**
 * Get human-readable stage label
 */
function getStageLabel(stage) {
  const labels = {
    [WorkflowStage.SPEC_INIT]: 'Project initialized, needs specification',
    [WorkflowStage.SPEC_CREATED]: 'Spec created, needs planning',
    [WorkflowStage.PLAN_CREATED]: 'Plan ready, needs task breakdown',
    [WorkflowStage.TASKS_CREATED]: 'Tasks ready, start implementing!',
    [WorkflowStage.IMPLEMENTING]: 'Implementation in progress',
    [WorkflowStage.COMPLETE]: 'Complete! 🎉'
  };
  return labels[stage] || stage;
}

/**
 * CLI entry point
 */
export async function main() {
  try {
    await launch();
  } catch (error) {
    if (error.name === 'ExitPromptError') {
      // User cancelled
      console.log(chalk.dim('\nSee you later! 🐕\n'));
      process.exit(0);
    }
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}
