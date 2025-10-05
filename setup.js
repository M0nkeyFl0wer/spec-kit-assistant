#!/usr/bin/env node
// 🐕 Spec Kit Assistant - First Time Setup
// Friendly onboarding for new users!

import chalk from 'chalk';
import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import inquirer from 'inquirer';

// Skip setup if running non-interactively (npm install in CI/CD or automated context)
if (!process.stdin.isTTY) {
  console.log(chalk.dim('Setup skipped (non-interactive mode). Run "npm run setup" to configure.'));
  process.exit(0);
}

console.clear();

// Detect if running inside Claude Code or agent context
const isInAgent = process.env.ANTHROPIC_API_KEY ||
                  process.env.CLAUDE_API_KEY ||
                  process.env.OPENAI_API_KEY ||
                  (process.env.TERM_PROGRAM === 'vscode' && process.env.VSCODE_IPC_HOOK);

if (isInAgent) {
  console.log(chalk.red.bold(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║                    ⚠️  HOLD ON A SECOND! ⚠️                    ║
║                                                                ║
║   It looks like you're running this inside an AI agent        ║
║   (Claude Code, Cursor, etc.)                                 ║
║                                                                ║
║   That's not quite right! Here's what to do:                  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`));

  console.log(chalk.yellow.bold(`\n  🪟 OPEN A NEW TERMINAL WINDOW\n`));
  console.log(chalk.white(`  1. Open your regular terminal app (not inside the AI agent)`));
  console.log(chalk.white(`  2. Navigate to this folder:`));
  console.log(chalk.cyan(`     cd ${process.cwd()}\n`));
  console.log(chalk.white(`  3. Run setup again:`));
  console.log(chalk.cyan(`     npm install\n`));

  console.log(chalk.yellow(`  Why? Because Spec Kit Assistant guides YOU through the process!`));
  console.log(chalk.white(`  If the AI runs it, the AI takes over and you miss the whole point! 😅\n`));

  console.log(chalk.hex('#8B5CF6')(`
       ∧＿∧
      (｡･ω･｡)  "See you in a real terminal! Woof!"
      ⊂　　 ノ
       しーＪ
`));

  const { continueAnyway } = await inquirer.prompt([{
    type: 'confirm',
    name: 'continueAnyway',
    message: chalk.yellow('Continue setup anyway? (Not recommended)'),
    default: false
  }]);

  if (!continueAnyway) {
    process.exit(0);
  }

  console.log(chalk.yellow(`\n⚠️  Okay, but remember: run commands yourself, not through the AI!\n`));
}

// Welcome screen with big dog!
console.log(chalk.hex('#8B5CF6')(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║                      🐕 WOOF! Welcome!                         ║
║                                                                ║
║              Thank you for downloading                         ║
║              SPEC KIT ASSISTANT!                               ║
║                                                                ║
║         Let me help you get started in just a few steps...     ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

                    |\__/,|   (\`\\
                  _.|o o  |_   ) )
                -(((---(((--------

`));

console.log(chalk.cyan(`I'm Spec, your friendly dog assistant! 🐕\n`));
console.log(chalk.white(`I'll help you set up everything you need.\n`));
console.log(chalk.yellow(`This will only take 1-2 minutes!\n`));

// Check if already setup
const setupMarker = './.spec-setup-complete';
if (existsSync(setupMarker)) {
  const { runAgain } = await inquirer.prompt([{
    type: 'confirm',
    name: 'runAgain',
    message: chalk.cyan('🐕 Looks like you already ran setup! Want to run it again?'),
    default: false
  }]);

  if (!runAgain) {
    console.log(chalk.green(`\n✨ Great! You're all set!\n`));
    console.log(chalk.cyan(`Try this command:`));
    console.log(chalk.white(`  node spec-assistant.js init "My Cool Project"\n`));
    process.exit(0);
  }
}

// Quick system check
try {
  execSync('node --version', { stdio: 'ignore' });
} catch (e) {
  console.log(chalk.red(`❌ Node.js not found! Install from https://nodejs.org\n`));
  process.exit(1);
}

console.log(chalk.yellow(`\n💡 Concerned about npm security? I support safer alternatives too!\n`));

// Check what's available
let availableManagers = [];
const managers = [
  { name: 'pnpm (Recommended - faster, more secure)', value: 'pnpm', cmd: 'pnpm', install: 'npm install -g pnpm' },
  { name: 'bun (Fastest, most secure)', value: 'bun', cmd: 'bun', install: 'curl -fsSL https://bun.sh/install | bash' },
  { name: 'yarn (Popular, audited)', value: 'yarn', cmd: 'yarn', install: 'npm install -g yarn' },
  { name: 'npm (Default)', value: 'npm', cmd: 'npm', install: null }
];

for (const mgr of managers) {
  try {
    execSync(`${mgr.cmd} --version`, { stdio: 'ignore' });
    availableManagers.push(mgr);
  } catch (e) {
    // Not installed - still add to list for installation option
  }
}

let packageManager = 'npm';
let installCmd = 'npm install';

if (availableManagers.length === 0) {
  // None installed, offer to install pnpm
  console.log(chalk.white(`No alternative package managers found.\n`));
  const { wantPnpm } = await inquirer.prompt([{
    type: 'confirm',
    name: 'wantPnpm',
    message: chalk.cyan('🐕 Install pnpm (more secure alternative to npm)?'),
    default: true
  }]);

  if (wantPnpm) {
    console.log(chalk.white(`\nInstalling pnpm...`));
    try {
      execSync('npm install -g pnpm', { stdio: 'inherit' });
      packageManager = 'pnpm';
      installCmd = 'pnpm install';
      console.log(chalk.green(`✅ pnpm installed!\n`));
    } catch (e) {
      console.log(chalk.yellow(`\n⚠️  Couldn't install pnpm, using npm\n`));
      packageManager = 'npm';
      installCmd = 'npm install';
    }
  }
} else {
  // Show available options
  const { selectedManager } = await inquirer.prompt([{
    type: 'list',
    name: 'selectedManager',
    message: chalk.cyan('🐕 Which package manager?'),
    choices: [
      ...availableManagers.map(m => m.name),
      new inquirer.Separator(),
      'Install a different one'
    ],
    default: availableManagers.find(m => m.value === 'pnpm')?.name || availableManagers[0].name
  }]);

  if (selectedManager === 'Install a different one') {
    const notInstalled = managers.filter(m => !availableManagers.find(a => a.value === m.value));
    const { toInstall } = await inquirer.prompt([{
      type: 'list',
      name: 'toInstall',
      message: chalk.cyan('Which one do you want to install?'),
      choices: notInstalled.map(m => m.name)
    }]);

    const mgr = notInstalled.find(m => m.name === toInstall);
    console.log(chalk.white(`\nInstalling ${mgr.value}...`));
    try {
      execSync(mgr.install, { stdio: 'inherit' });
      packageManager = mgr.value;
      console.log(chalk.green(`✅ ${mgr.value} installed!\n`));
    } catch (e) {
      console.log(chalk.yellow(`\n⚠️  Install failed, using npm\n`));
      packageManager = 'npm';
    }
  } else {
    packageManager = availableManagers.find(m => m.name === selectedManager).value;
  }

  installCmd = packageManager === 'npm' ? 'npm install' :
               packageManager === 'yarn' ? 'yarn install' :
               packageManager === 'bun' ? 'bun install' :
               'pnpm install';
}

console.log(chalk.green(`✅ Using ${packageManager}\n`));

const { installNow } = await inquirer.prompt([{
  type: 'confirm',
  name: 'installNow',
  message: chalk.cyan('🐕 Ready to install packages?'),
  default: true
}]);

if (installNow) {
  console.log(chalk.white(`\nInstalling with ${packageManager}... (30-60 seconds)`));
  try {
    execSync(installCmd, { stdio: 'inherit' });
    console.log(chalk.green(`\n✅ Packages installed securely!`));
  } catch (e) {
    console.log(chalk.red(`\n❌ Installation failed. Try manually:`));
    console.log(chalk.white(`  ${installCmd}\n`));
    process.exit(1);
  }
} else {
  console.log(chalk.yellow(`\nSkipped! Run this later:`));
  console.log(chalk.white(`  ${installCmd}\n`));
}

console.log(chalk.cyan(`\n🐕 Want the full power of official Spec Kit too?\n`));

const { installSpecKit } = await inquirer.prompt([{
  type: 'confirm',
  name: 'installSpecKit',
  message: chalk.cyan('Install official GitHub Spec Kit?'),
  default: false
}]);

if (installSpecKit) {
  console.log(chalk.white(`\n📦 Installing uv package manager...`));
  try {
    execSync('curl -LsSf https://astral.sh/uv/install.sh | sh', { stdio: 'inherit' });
    console.log(chalk.green(`✅ uv installed!`));

    console.log(chalk.white(`\n📦 Installing official Spec Kit...`));
    execSync('~/.local/bin/uv tool install .', { stdio: 'inherit', cwd: process.cwd() });
    console.log(chalk.green(`✅ Spec Kit installed!`));
  } catch (e) {
    console.log(chalk.yellow(`\n⚠️  Couldn't auto-install. You can try manually later:`));
    console.log(chalk.white(`  curl -LsSf https://astral.sh/uv/install.sh | sh`));
    console.log(chalk.white(`  ~/.local/bin/uv tool install .\n`));
  }
} else {
  console.log(chalk.yellow(`\nSkipped! Install later with:`));
  console.log(chalk.white(`  curl -LsSf https://astral.sh/uv/install.sh | sh`));
  console.log(chalk.white(`  ~/.local/bin/uv tool install .\n`));
}

// Mark setup as complete
writeFileSync(setupMarker, new Date().toISOString());

console.log(chalk.magenta(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`));
console.log(chalk.hex('#10B981').bold(`  ✨ ALL SET! LET'S GO! ✨\n`));

console.log(chalk.cyan(`🐕 Woof! I'm ready to help! Let's create your first spec:\n`));
console.log(chalk.white.bold(`  node spec-assistant.js init "My Awesome Project"\n`));

console.log(chalk.gray(`(Psst! I'll guide you through everything as we go!)\n`));

console.log(chalk.hex('#8B5CF6')(`
       ∧＿∧
      (｡･ω･｡)つ━☆・*。
      ⊂　　 ノ 　　　・゜+.
       しーＪ　　　°。+ *´¨)

    Let's build something awesome! 🦴
`));
