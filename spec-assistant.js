#!/usr/bin/env node
/**
 * Spec Kit Assistant - Friendly wrapper for GitHub Spec Kit
 * Adds a helpful dog assistant to guide users through spec-driven development
 */

import { SpecLogo } from './src/character/spec-logo.js';
import chalk from 'chalk';
import { execSync } from 'child_process';

// Show our friendly logo
console.log(SpecLogo.pixelDog);
console.log(chalk.gray('✨ Friendly assistant for GitHub Spec Kit\n'));

// Get command from args
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(chalk.hex('#EC4899')('🌱 Welcome! I\'m here to help you with Spec-Driven Development!\n'));
  console.log(chalk.hex('#10B981')('Quick start:'));
  console.log(chalk.white('  node spec-assistant.js init <PROJECT_NAME>  ') + chalk.dim('# Create new project'));
  console.log(chalk.white('  node spec-assistant.js check                ') + chalk.dim('# Check project status'));
  console.log();
  console.log(chalk.dim('This assistant wraps the official GitHub Spec Kit CLI'));
  console.log(chalk.dim('Learn more: https://github.com/github/spec-kit'));
  process.exit(0);
}

// Pass through to real specify CLI
console.log(chalk.hex('#10B981')(`\n🚀 Running: specify ${args.join(' ')}\n`));

try {
  execSync(`~/.local/bin/uv tool run --from . specify ${args.join(' ')}`, {
    stdio: 'inherit',
    cwd: __dirname
  });
} catch (error) {
  console.error(chalk.red('\n❌ Command failed'));
  process.exit(1);
}
