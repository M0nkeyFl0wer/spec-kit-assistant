/**
 * Post-Implementation Flow
 * Guides users through running, testing, and celebrating their completed work.
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { spawn } from 'child_process';
import { getAvailableActions, detectProjectType, ActionType } from './project-runner.js';
import { MicroCelebrations } from '../guided/micro-celebrations.js';

// Celebration ASCII art
const CELEBRATION_DOG = `
${chalk.yellow(`    ∩＿∩`)}
${chalk.yellow(`   ( ・∀・)  ✨`)}
${chalk.yellow(`  ＿(_つ/ ￣￣￣/＿`)}
${chalk.yellow(`   ＼/   DONE!  /`)}
`;

const RUNNING_DOG = `
${chalk.cyan(`      /^ ^\\`)}
${chalk.cyan(`     / 0 0 \\   Running...`)}
${chalk.cyan(`     V\\ Y /V`)}
${chalk.cyan(`      / - \\`)}
${chalk.cyan(`     /    |`)}
${chalk.cyan(`  __(    )||`)}
`;

const SUCCESS_DOG = `
${chalk.green(`       __`)}
${chalk.green(`   ___( o)>`)}
${chalk.green(`   \\ <_. )`)}
${chalk.green(`    \`---'    Woof! Success!`)}
`;

const FAILURE_DOG = `
${chalk.red(`      /\\_/\\`)}
${chalk.red(`     ( o.o )  Uh oh...`)}
${chalk.red(`      > ^ <`)}
`;

/**
 * Main post-implementation flow
 */
export async function runPostImplementation(projectPath, options = {}) {
  const { quiet = false } = options;
  const celebrations = MicroCelebrations.enabled();

  if (!quiet) {
    console.log(CELEBRATION_DOG);
    console.log(chalk.bold.green('\n🎉 Implementation Complete!\n'));
  }

  // Detect project type
  const projectTypes = await detectProjectType(projectPath);
  console.log(chalk.dim(`Project: ${projectTypes.join(' + ')}\n`));

  // Get available actions
  const { actions, custom } = await getAvailableActions(projectPath);

  if (actions.length === 0 && custom.length === 0) {
    console.log(chalk.yellow("I couldn't detect how to run this project.\n"));
    console.log(chalk.dim("You may need to run commands manually.\n"));
    return promptWhatsNext(projectPath);
  }

  // Main action loop
  return runActionLoop(projectPath, actions, custom, celebrations);
}

/**
 * Action selection and execution loop
 */
async function runActionLoop(projectPath, actions, custom, celebrations) {
  while (true) {
    const choices = [];

    // Add main actions
    if (actions.length > 0) {
      choices.push(new inquirer.Separator(chalk.dim('── Quick Actions ──')));

      for (const action of actions) {
        let icon = '▶️';
        if (action.type === ActionType.TEST) icon = '🧪';
        if (action.type === ActionType.DEV) icon = '🔧';
        if (action.type === ActionType.BUILD) icon = '📦';
        if (action.type === ActionType.DEPLOY) icon = '🚀';
        if (action.type === ActionType.LINT) icon = '✨';

        choices.push({
          name: `${icon}  ${action.label} ${chalk.dim(`(${action.description})`)}`,
          value: { type: 'action', action }
        });
      }
    }

    // Add custom scripts
    if (custom.length > 0) {
      choices.push(new inquirer.Separator(chalk.dim('── Other Scripts ──')));

      for (const script of custom.slice(0, 5)) {
        choices.push({
          name: `📜 ${script.name} ${chalk.dim(`(${script.cmd})`)}`,
          value: { type: 'custom', script }
        });
      }
    }

    // Add meta options
    choices.push(new inquirer.Separator(chalk.dim('──────────────')));
    choices.push({
      name: `${chalk.green('✨')} Start next feature`,
      value: { type: 'next_feature' }
    });
    choices.push({
      name: `${chalk.blue('📊')} View project status`,
      value: { type: 'status' }
    });
    choices.push({
      name: `${chalk.dim('👋')} Done for now`,
      value: { type: 'done' }
    });

    const { choice } = await inquirer.prompt([{
      type: 'list',
      name: 'choice',
      message: 'What would you like to do?',
      choices
    }]);

    // Handle choice
    if (choice.type === 'done') {
      console.log(chalk.cyan('\n🐕 Great work today! See you next time.\n'));
      celebrations.celebrate('complete');
      return { action: 'done' };
    }

    if (choice.type === 'next_feature') {
      return promptNextFeature(projectPath);
    }

    if (choice.type === 'status') {
      await showProjectStatus(projectPath);
      continue;
    }

    if (choice.type === 'action') {
      const result = await executeCommand(choice.action.command.cmd, projectPath);
      if (result.success) {
        celebrations.celebrate('phase');
      }
      continue;
    }

    if (choice.type === 'custom') {
      await executeCommand(choice.script.cmd, projectPath);
      continue;
    }
  }
}

/**
 * Execute a command and show output
 */
async function executeCommand(cmd, cwd) {
  console.log(RUNNING_DOG);
  console.log(chalk.dim(`$ ${cmd}\n`));

  return new Promise((resolve) => {
    const child = spawn(cmd, [], {
      shell: true,
      cwd,
      stdio: 'inherit'
    });

    child.on('close', (code) => {
      console.log('');

      if (code === 0) {
        console.log(SUCCESS_DOG);
        console.log(chalk.green('✅ Command completed successfully!\n'));
        resolve({ success: true, code });
      } else {
        console.log(FAILURE_DOG);
        console.log(chalk.red(`❌ Command exited with code ${code}\n`));
        resolve({ success: false, code });
      }
    });

    child.on('error', (err) => {
      console.log(FAILURE_DOG);
      console.log(chalk.red(`❌ Error: ${err.message}\n`));
      resolve({ success: false, error: err });
    });
  });
}

/**
 * Show project status summary
 */
async function showProjectStatus(projectPath) {
  const projectTypes = await detectProjectType(projectPath);
  const { actions } = await getAvailableActions(projectPath);

  console.log(chalk.cyan('\n📊 Project Status\n'));
  console.log(`  ${chalk.bold('Type:')} ${projectTypes.join(' + ')}`);
  console.log(`  ${chalk.bold('Path:')} ${projectPath}`);
  console.log(`  ${chalk.bold('Available commands:')} ${actions.length}`);

  // Check for common indicators
  const fs = await import('fs-extra');
  const { join } = await import('path');

  const hasTests = await fs.default.pathExists(join(projectPath, 'tests')) ||
                   await fs.default.pathExists(join(projectPath, 'test')) ||
                   await fs.default.pathExists(join(projectPath, '__tests__'));

  const hasCI = await fs.default.pathExists(join(projectPath, '.github/workflows')) ||
                await fs.default.pathExists(join(projectPath, '.gitlab-ci.yml'));

  const hasDocker = await fs.default.pathExists(join(projectPath, 'Dockerfile')) ||
                    await fs.default.pathExists(join(projectPath, 'docker-compose.yml'));

  console.log(`  ${chalk.bold('Tests:')} ${hasTests ? chalk.green('✓') : chalk.dim('–')}`);
  console.log(`  ${chalk.bold('CI/CD:')} ${hasCI ? chalk.green('✓') : chalk.dim('–')}`);
  console.log(`  ${chalk.bold('Docker:')} ${hasDocker ? chalk.green('✓') : chalk.dim('–')}`);
  console.log('');
}

/**
 * Prompt for next feature
 */
async function promptNextFeature(projectPath) {
  console.log(chalk.cyan('\n🌟 Ready for the next feature!\n'));

  const { description } = await inquirer.prompt([{
    type: 'input',
    name: 'description',
    message: 'What would you like to build next?',
    validate: input => input.trim().length > 0 || 'Please describe the feature'
  }]);

  console.log(chalk.dim('\nGreat! To get started:\n'));
  console.log(chalk.bold(`  /specify "${description}"\n`));

  const { startNow } = await inquirer.prompt([{
    type: 'confirm',
    name: 'startNow',
    message: 'Would you like me to start the specification now?',
    default: true
  }]);

  if (startNow) {
    return {
      action: 'next_feature',
      description,
      command: `/specify "${description}"`
    };
  }

  return { action: 'deferred', description };
}

/**
 * Prompt what's next when no commands detected
 */
async function promptWhatsNext(projectPath) {
  const { choice } = await inquirer.prompt([{
    type: 'list',
    name: 'choice',
    message: 'What would you like to do?',
    choices: [
      { name: '✨ Start next feature', value: 'next' },
      { name: '🔧 Run a custom command', value: 'custom' },
      { name: '👋 Done for now', value: 'done' }
    ]
  }]);

  if (choice === 'next') {
    return promptNextFeature(projectPath);
  }

  if (choice === 'custom') {
    const { cmd } = await inquirer.prompt([{
      type: 'input',
      name: 'cmd',
      message: 'Enter the command to run:'
    }]);

    if (cmd.trim()) {
      await executeCommand(cmd, projectPath);
    }
    return promptWhatsNext(projectPath);
  }

  console.log(chalk.cyan('\n🐕 Great work! See you next time.\n'));
  return { action: 'done' };
}

/**
 * Quick test runner - just runs tests and reports
 */
export async function quickTest(projectPath) {
  const { actions } = await getAvailableActions(projectPath);
  const testAction = actions.find(a => a.type === ActionType.TEST);

  if (!testAction) {
    console.log(chalk.yellow("No test command detected.\n"));
    return { success: false, reason: 'no_tests' };
  }

  return executeCommand(testAction.command.cmd, projectPath);
}

/**
 * Quick dev server - just starts dev and returns
 */
export async function quickDev(projectPath) {
  const { actions } = await getAvailableActions(projectPath);
  const devAction = actions.find(a => a.type === ActionType.DEV);

  if (!devAction) {
    // Fall back to start
    const startAction = actions.find(a => a.type === ActionType.START);
    if (!startAction) {
      console.log(chalk.yellow("No dev/start command detected.\n"));
      return { success: false, reason: 'no_dev' };
    }
    return executeCommand(startAction.command.cmd, projectPath);
  }

  return executeCommand(devAction.command.cmd, projectPath);
}
