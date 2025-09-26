#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { SpecCharacter } from './character/spec.js';
import { ConsultationEngine } from './consultation/engine.js';
import { SwarmOrchestrator } from './swarm/orchestrator.js';
import { CloudIntegration } from './cloud/integration.js';

const program = new Command();
const spec = new SpecCharacter();
const consultation = new ConsultationEngine();
const swarm = new SwarmOrchestrator();
const cloud = new CloudIntegration();

// Welcome message with Spec character
console.log(chalk.yellow(figlet.textSync('Spec Kit Assistant', { horizontalLayout: 'full' })));
console.log(chalk.cyan('🐕 Meet Spec - Your Golden Retriever Guide to Spec-Driven Development!'));
console.log(chalk.gray('Addressing user feedback: Smart oversight, agent swarms, and delightful UX'));

program
  .name('spec-assistant')
  .description('🐕 Intelligent Spec Kit Assistant with Agent Swarm Orchestration')
  .version('1.0.0');

program
  .command('init')
  .description('🚀 Interactive project initialization with Spec\'s guidance')
  .option('-s, --swarm', 'Enable agent swarm orchestration')
  .option('-c, --cloud', 'Setup cloud integration')
  .action(async (options) => {
    await spec.greet();
    await consultation.startGuidedSetup(options);
  });

program
  .command('swarm')
  .description('🤖 Agent swarm management and deployment')
  .option('-d, --deploy', 'Deploy agent swarm to cloud')
  .option('-m, --monitor', 'Monitor active agent swarms')
  .option('-s, --scale <size>', 'Scale agent swarm size')
  .action(async (options) => {
    await swarm.handleCommand(options);
  });

program
  .command('consult')
  .description('🗣️ Start interactive consultation with Spec')
  .option('-p, --project <path>', 'Analyze existing project')
  .action(async (options) => {
    await consultation.startInteractiveSession(options);
  });

program
  .command('cloud')
  .description('☁️ Cloud platform integration and setup')
  .option('-g, --gcp', 'Setup Google Cloud Platform integration')
  .option('-o, --optimize', 'Optimize for free tier usage')
  .action(async (options) => {
    await cloud.setup(options);
  });

program
  .command('oversight')
  .description('✋ Configure smart oversight and approval modes')
  .option('-m, --mode <type>', 'Set oversight mode: trust-verify|checkpoints|full-control')
  .action(async (options) => {
    await swarm.configureOversight(options);
  });

// Global error handling
process.on('unhandledRejection', (error) => {
  console.error(chalk.red('❌ Unhandled error:'), error);
  process.exit(1);
});

program.parse();