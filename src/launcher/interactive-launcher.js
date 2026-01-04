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

/**
 * Main interactive launcher
 */
export async function launch(options = {}) {
  const { quiet = false } = options;

  if (!quiet) {
    console.log(dogs.WELCOME);
    console.log(chalk.bold("Woof! I'm Spec, your loyal assistant!\n"));
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

  const agents = [
    {
      name: 'Claude Code (Recommended)',
      value: AgentType.CLAUDE_CODE,
      description: 'Anthropic\'s official CLI - best for spec-driven dev'
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
    {
      name: 'Gemini CLI',
      value: AgentType.GEMINI_CLI,
      description: 'Google\'s AI in your terminal'
    },
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
    choices: agents.map(a => ({
      name: `${a.name} - ${chalk.dim(a.description)}`,
      value: a.value
    }))
  }]);

  if (choice === 'skip') {
    console.log(chalk.dim("\nOkay! You can always install an agent later.\n"));
    return handleProjectSelectionFlow({ stage: WorkflowStage.NO_PROJECT, recentProjects: [] });
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
 * Handle project selection
 */
async function handleProjectSelectionFlow(state) {
  const sessions = state.recentProjects || await getKnownSessions();

  console.log(chalk.cyan("What would you like to do?\n"));

  const choices = [
    {
      name: `${chalk.green('➕')} Start a new project`,
      value: 'new'
    }
  ];

  // Add recent projects
  if (sessions.length > 0) {
    choices.push(new inquirer.Separator(chalk.dim('── Recent Projects ──')));
    for (const session of sessions.slice(0, 5)) {
      const name = session.projectId || basename(session.projectPath);
      choices.push({
        name: `${chalk.blue('📁')} ${name} ${chalk.dim(`(${session.projectPath})`)}`,
        value: { type: 'existing', path: session.projectPath, name }
      });
    }
  }

  choices.push(new inquirer.Separator());
  choices.push({
    name: `${chalk.dim('🔍')} Browse for a project`,
    value: 'browse'
  });

  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: 'Choose an option:',
    choices
  }]);

  if (action === 'new') {
    return handleNewProjectFlow();
  }

  if (action === 'browse') {
    return handleBrowseProjectFlow();
  }

  // Existing project selected
  return handleExistingProjectFlow(action.path, action.name);
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

  console.log(`${chalk.cyan('Ready to launch!')} Using ${chalk.bold(preferred.name)}\n`);

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

  // Spawn the agent
  const child = spawn(preferred.launchCmd, [], {
    stdio: 'inherit',
    shell: true,
    cwd: projectPath
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

  const { choice } = await inquirer.prompt([{
    type: 'list',
    name: 'choice',
    message: 'What would you like to do?',
    choices: [
      {
        name: `${chalk.green('📝')} Start with a feature description`,
        value: 'describe'
      },
      {
        name: `${chalk.blue('📋')} View the spec-driven workflow`,
        value: 'workflow'
      },
      {
        name: `${chalk.yellow('⚡')} Install an AI agent (recommended)`,
        value: 'install'
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
