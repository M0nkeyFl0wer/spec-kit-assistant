#!/usr/bin/env node
// 🐕 Spec Kit Assistant - First Time Setup
// Friendly onboarding for new users!

import chalk from 'chalk';
import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import inquirer from 'inquirer';

console.clear();

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

console.log(chalk.magenta(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`));
console.log(chalk.cyan.bold(`  STEP 1: Check Your System\n`));

// Check Node.js
console.log(chalk.white(`Checking Node.js version...`));
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(chalk.green(`✅ Node.js found: ${nodeVersion}`));
} catch (e) {
  console.log(chalk.red(`❌ Node.js not found!`));
  console.log(chalk.yellow(`\nPlease install Node.js first:`));
  console.log(chalk.white(`  https://nodejs.org\n`));
  process.exit(1);
}

// Check Python
console.log(chalk.white(`\nChecking Python version...`));
try {
  const pythonVersion = execSync('python3 --version', { encoding: 'utf8' }).trim();
  console.log(chalk.green(`✅ Python found: ${pythonVersion}`));
} catch (e) {
  console.log(chalk.yellow(`⚠️  Python not found (optional, but recommended)`));
  console.log(chalk.white(`  The official Spec Kit needs Python 3.8+`));
  console.log(chalk.white(`  Download: https://www.python.org\n`));
}

console.log(chalk.magenta(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`));
console.log(chalk.cyan.bold(`  STEP 2: Install Dependencies\n`));

const { installNow } = await inquirer.prompt([{
  type: 'confirm',
  name: 'installNow',
  message: chalk.cyan('🐕 Ready to install Node.js packages?'),
  default: true
}]);

if (installNow) {
  console.log(chalk.white(`\nInstalling packages... (this may take 30-60 seconds)`));
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log(chalk.green(`\n✅ Packages installed!`));
  } catch (e) {
    console.log(chalk.red(`\n❌ Installation failed. Try running manually:`));
    console.log(chalk.white(`  npm install\n`));
    process.exit(1);
  }
} else {
  console.log(chalk.yellow(`\nSkipped! Run this later:`));
  console.log(chalk.white(`  npm install\n`));
}

console.log(chalk.magenta(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`));
console.log(chalk.cyan.bold(`  STEP 3: Install Official Spec Kit (Optional)\n`));

console.log(chalk.white(`The official GitHub Spec Kit provides core spec-driven features.`));
console.log(chalk.white(`This wrapper adds AI swarms and friendly dog personality! 🐕\n`));

const { installSpecKit } = await inquirer.prompt([{
  type: 'confirm',
  name: 'installSpecKit',
  message: chalk.cyan('Install official Spec Kit now?'),
  default: true
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

console.log(chalk.magenta(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`));
console.log(chalk.cyan.bold(`  STEP 4: Quick Tutorial\n`));

const { wantTutorial } = await inquirer.prompt([{
  type: 'confirm',
  name: 'wantTutorial',
  message: chalk.cyan('🐕 Want a quick tutorial? (30 seconds)'),
  default: true
}]);

if (wantTutorial) {
  console.log(chalk.white(`\n` + `─`.repeat(60)));
  console.log(chalk.hex('#EC4899').bold(`\n  📚 BASIC COMMANDS\n`));

  console.log(chalk.cyan(`  Official Spec Kit commands:`));
  console.log(chalk.white(`    node spec-assistant.js init "Project Name"`));
  console.log(chalk.gray(`      → Create a new spec for your project\n`));

  console.log(chalk.white(`    node spec-assistant.js check`));
  console.log(chalk.gray(`      → Validate your spec\n`));

  console.log(chalk.white(`    node spec-assistant.js constitution`));
  console.log(chalk.gray(`      → Show Spec Kit principles\n`));

  console.log(chalk.cyan(`  Enhanced AI Swarm commands:`));
  console.log(chalk.white(`    node spec-assistant.js run "implement feature X"`));
  console.log(chalk.gray(`      → Deploy AI swarms to build features\n`));

  console.log(chalk.white(`    node spec-assistant.js test`));
  console.log(chalk.gray(`      → Run automated testing swarms\n`));

  console.log(chalk.white(`    node spec-assistant.js deploy`));
  console.log(chalk.gray(`      → Production deployment with swarms\n`));

  console.log(chalk.white(`─`.repeat(60)));

  console.log(chalk.hex('#10B981').bold(`\n  💡 TIPS FOR TERMINAL BEGINNERS\n`));
  console.log(chalk.white(`  • ${chalk.cyan('cd directory-name')} - Move into a folder`));
  console.log(chalk.white(`  • ${chalk.cyan('ls')} - List files in current folder`));
  console.log(chalk.white(`  • ${chalk.cyan('pwd')} - Show where you are`));
  console.log(chalk.white(`  • ${chalk.cyan('clear')} - Clear the screen`));
  console.log(chalk.white(`  • Use ${chalk.cyan('Tab')} key to autocomplete file names!`));
  console.log(chalk.white(`  • Use ${chalk.cyan('↑')} and ${chalk.cyan('↓')} arrows to cycle through previous commands\n`));

  console.log(chalk.white(`─`.repeat(60) + `\n`));
}

// Create quick reference file
console.log(chalk.white(`\n📝 Creating quick reference file...`));
const quickRef = `# 🐕 Spec Kit Assistant - Quick Reference

## Common Commands

### Create a New Spec
\`\`\`bash
node spec-assistant.js init "My Project Name"
\`\`\`

### Validate Your Spec
\`\`\`bash
node spec-assistant.js check
\`\`\`

### Deploy AI Swarms
\`\`\`bash
node spec-assistant.js run "implement authentication"
\`\`\`

## Terminal Basics for Beginners

- **cd folder-name** - Move into a folder
- **ls** - List files
- **pwd** - Show current location
- **clear** - Clear screen
- **Tab key** - Autocomplete
- **↑/↓ arrows** - Previous commands

## Documentation

- [Full README](README.md)
- [Constitution](CONSTITUTION.md)
- [Spec](SPEC.md)

## Need Help?

- GitHub Issues: https://github.com/M0nkeyFl0wer/spec-kit-assistant/issues
- Official Spec Kit: https://github.com/github/spec-kit

---
🐕 Woof! Happy spec-driven development!
`;

writeFileSync('./QUICK-START.md', quickRef);
console.log(chalk.green(`✅ Created QUICK-START.md for reference!`));

// Mark setup as complete
writeFileSync(setupMarker, new Date().toISOString());

console.log(chalk.magenta(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`));
console.log(chalk.hex('#10B981').bold(`  ✨ SETUP COMPLETE! ✨\n`));

console.log(chalk.cyan(`🐕 You're all set! Let's create your first spec:\n`));
console.log(chalk.white.bold(`  node spec-assistant.js init "My Awesome Project"\n`));

console.log(chalk.gray(`Need help? Check QUICK-START.md or run:`));
console.log(chalk.white(`  node spec-assistant.js --help\n`));

console.log(chalk.hex('#8B5CF6')(`
       ∧＿∧
      (｡･ω･｡)つ━☆・*。
      ⊂　　 ノ 　　　・゜+.
       しーＪ　　　°。+ *´¨)

    Woof woof! Happy coding! 🦴
`));
