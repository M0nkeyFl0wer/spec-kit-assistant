#!/usr/bin/env node

import chalk from 'chalk';
import { DogArt, MoodArt } from './src/character/dog-art.js';

// Quick /specify command launcher with SUPER CUTE DOG!
console.clear();
console.log(chalk.cyan(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║  🐕 /specify - SPEC THE GOLDEN RETRIEVER 🐕           ║
║                                                        ║
║${MoodArt.happy}║
║                "Let's build something cool!"           ║
║                🚀 Quick spec consultation              ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
`));

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'help' || command === '--help' || command === '-h') {
  console.log(chalk.green(`
🐕 Spec Commands:
   /specify         - Start interactive consultation
   /specify quick   - Quick spec generation
   /specify swarm   - Deploy agent swarm
   /specify retro   - Retro terminal experience
   /specify help    - This help message
`));
  process.exit(0);
}

if (command === 'retro') {
  console.log(chalk.magenta('🎮 Launching retro terminal experience...'));
  const { exec } = await import('child_process');
  exec('./retro-spec.sh', { cwd: process.cwd() });
  process.exit(0);
}

if (command === 'swarm') {
  console.log(chalk.yellow('🤖 Launching agent swarm orchestrator...'));
  await import('./enhanced-swarm-orchestrator.js');
  process.exit(0);
}

if (command === 'quick') {
  console.log(chalk.blue('⚡ Quick spec mode activated...'));
  console.log(chalk.green('🐕 Spec: "Let\'s start with a quick consultation!"'));
  console.log(chalk.yellow('Type: specify init [project-name] to create a new specification'));
  process.exit(0);
}

if (command === 'init') {
  const projectName = args[1] || 'my-project';
  console.log(chalk.cyan(`🚀 Creating new specification for: ${projectName}`));

  // SECURITY: Use the hardened GitHub integration with sanitizer
  const { GitHubSpecKit } = await import('./src/spec-kit/github-integration-secure.js');
  const specKit = new GitHubSpecKit();

  const spec = await specKit.initializeSpec(projectName, 'web-app');
  await specKit.saveSpec(spec, `./SPEC-${projectName}.md`);

  console.log(chalk.green(`🐕 Spec: "Created SPEC-${projectName}.md using GitHub Spec Kit!"`));
  process.exit(0);
}

// Default: Start interactive consultation with GitHub Spec Kit
console.log(chalk.green('🐕 Spec: "Starting GitHub Spec Kit consultation!"'));
console.log(chalk.blue('🔧 Using spec.new foundation for professional specifications'));
await import('./proactive-spec.js');