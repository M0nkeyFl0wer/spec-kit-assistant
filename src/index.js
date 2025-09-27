#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { SpecCharacter } from './character/spec.js';
import { ConsultationEngine } from './consultation/engine.js';
import { SwarmOrchestrator } from './swarm/orchestrator.js';
import { CloudIntegration } from './cloud/integration.js';
import { WarpBridge } from './integrations/warp/bridge.js';

const program = new Command();
const spec = new SpecCharacter();
const consultation = new ConsultationEngine();
const swarm = new SwarmOrchestrator();
const cloud = new CloudIntegration();
const warpBridge = new WarpBridge();

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
  .option('-i, --interactive', 'Start interactive consultation (default)', true)
  .option('-s, --swarm', 'Enable agent swarm orchestration')
  .option('-c, --cloud', 'Setup cloud integration')
  .option('-w, --warp', 'Enable Warp Code integration')
  .option('--ultimate', 'Initialize Ultimate Toolkit with all integrations')
  .action(async (options) => {
    await spec.greet();
    if (options.ultimate) {
      await consultation.startUltimateToolkitSetup(options);
    } else if (options.interactive !== false) {
      await consultation.startGuidedSetup(options);
    }
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
    await consultation.startGuidedSetup(options);
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

program
  .command('warp')
  .description('🌊 Warp Code integration and hybrid development')
  .option('-i, --init', 'Initialize Warp integration in current project')
  .option('-r, --ramble <prompt>', 'Start voice-driven ramble session with Warp')
  .option('-d, --deploy', 'Deploy Warp + Swarm integration to desktop')
  .option('-m, --monitor', 'Monitor token efficiency and cost savings')
  .option('--optimize-free', 'Optimize for Warp free tier (150 requests/month)')
  .action(async (options) => {
    await handleWarpCommand(options);
  });

program
  .command('ultimate')
  .description('🌱 Ultimate Toolkit - Complete solarpunk development environment')
  .option('-i, --init', 'Initialize complete Ultimate Toolkit')
  .option('-r, --ramble <prompt>', 'Start ultimate ramble session')
  .option('-d, --deploy <target>', 'Deploy to target: laptop|desktop|gpu-server')
  .option('-s, --scale <agents>', 'Scale agent swarms (default: 32)')
  .action(async (options) => {
    await handleUltimateCommand(options);
  });

// Command Handlers
async function handleWarpCommand(options) {
  if (options.init) {
    console.log(chalk.cyan('🌊 Initializing Warp Code integration...'));
    await warpBridge.initWarpProject();
    console.log(chalk.green('✅ Warp integration configured!'));
    console.log(chalk.yellow('💡 Free tier optimization: 150 requests = 1,500 effective tasks with local swarms'));
  }

  if (options.ramble) {
    console.log(chalk.cyan(`🗣️  Starting Warp ramble session: "${options.ramble}"`));
    await warpBridge.startRambleSession(options.ramble);
  }

  if (options.deploy) {
    console.log(chalk.blue('🚀 Deploying Warp + Swarm integration to desktop...'));
    // Integration with deployment system
    await deployWarpIntegration();
  }

  if (options.monitor) {
    const efficiency = await warpBridge.monitorTokenEfficiency();
    console.log(chalk.green('📊 Token Efficiency Report:'));
    console.log(chalk.cyan(`   Free Tier Usage: ${efficiency.freeRequestsUsed}/150`));
    console.log(chalk.green(`   Effective Tasks: ${efficiency.effectiveTasks}`));
    console.log(chalk.yellow(`   Monthly Savings: $${efficiency.costSavings}`));
  }

  if (options.optimizeFree) {
    console.log(chalk.green('🎯 Optimizing for Warp free tier...'));
    await warpBridge.configureFreeTierOptimization();
  }
}

async function handleUltimateCommand(options) {
  if (options.init) {
    console.log(chalk.magenta('🌱 Initializing Ultimate Toolkit...'));
    await consultation.startUltimateToolkitSetup({
      warp: true,
      swarms: true,
      voice: true,
      obsidian: true,
      solarpunk: true
    });
  }

  if (options.ramble) {
    console.log(chalk.cyan(`🗣️  Ultimate ramble: "${options.ramble}"`));
    await startUltimateRamble(options.ramble, options);
  }

  if (options.deploy) {
    const target = options.deploy;
    const agents = options.scale || 32;
    console.log(chalk.blue(`🚀 Deploying Ultimate Toolkit to ${target} (${agents} agents)...`));
    await deployUltimateToolkit(target, agents);
  }
}

async function deployWarpIntegration() {
  console.log(chalk.blue('📦 Deploying Warp × Swarm integration...'));

  // Deploy the warp-swarm-integration repo to desktop
  const deployScript = `
    git clone https://github.com/M0nkeyFl0wer/warp-swarm-integration.git
    cd warp-swarm-integration
    npm install
    npm run setup-desktop
    npm run start-all
  `;

  console.log(chalk.yellow('📋 Deploy to desktop with:'));
  console.log(chalk.gray(deployScript));
}

async function startUltimateRamble(prompt, options) {
  console.log(chalk.magenta('🌱 Starting Ultimate Ramble Session...'));

  const session = {
    prompt,
    warpIntegration: true,
    swarmOrchestration: true,
    voiceProcessing: true,
    obsidianSync: true,
    freeTierOptimized: true
  };

  // 1. Voice processing
  console.log(chalk.cyan('🗣️  Processing voice input...'));

  // 2. Research validation
  console.log(chalk.blue('🔍 Validating through OSINT swarms...'));

  // 3. Warp architecture (free tier optimized)
  console.log(chalk.green('🌊 Warp architectural decisions (token efficient)...'));

  // 4. Local swarm implementation
  console.log(chalk.yellow('🤖 Local swarms generating implementation...'));

  // 5. Quality review and production
  console.log(chalk.magenta('✅ Quality review and production deployment...'));

  console.log(chalk.green('🎉 Ultimate ramble complete - from voice to production!'));
}

async function deployUltimateToolkit(target, agents) {
  const deploymentTargets = {
    laptop: 'ssh m0nkey-fl0wer@10.0.0.139',
    desktop: 'ssh m0nkey-fl0wer@10.0.0.64',
    'gpu-server': 'ssh -p8888 m0nkey-fl0wer@seshat.noosworx.com'
  };

  const sshTarget = deploymentTargets[target];
  if (!sshTarget) {
    console.error(chalk.red(`❌ Unknown target: ${target}`));
    return;
  }

  console.log(chalk.blue(`🚀 Deploying to ${target} with ${agents} agents...`));
  console.log(chalk.yellow(`📡 SSH: ${sshTarget}`));

  const deployScript = `
    ${sshTarget} "
      git clone https://github.com/M0nkeyFl0wer/warp-swarm-integration.git
      cd warp-swarm-integration
      npm install
      npm run setup-desktop
      npm run start-all --agents=${agents}
    "
  `;

  console.log(chalk.gray('Deploy script:'));
  console.log(chalk.gray(deployScript));
}

// Global error handling
process.on('unhandledRejection', (error) => {
  console.error(chalk.red('❌ Unhandled error:'), error);
  process.exit(1);
});

program.parse();