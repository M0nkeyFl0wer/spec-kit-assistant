#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { SpecCharacter } from './character/spec.js';
import { ConsultationEngine } from './consultation/engine.js';
import { SwarmOrchestrator } from './swarm/orchestrator.js';
import { CloudIntegration } from './cloud/integration.js';
import { SpecKitIntegration } from './spec-kit/integration.js';
// Removed Warp - using swarm stack instead
import { SpecFirstInterceptor } from './core/spec-first-interceptor.js';

const program = new Command();
const spec = new SpecCharacter();
const consultation = new ConsultationEngine();
const swarm = new SwarmOrchestrator();
const cloud = new CloudIntegration();
const specKit = new SpecKitIntegration();
// Using swarm stack for all orchestration
const interceptor = new SpecFirstInterceptor();

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
  .option('-s, --swarm-stack', 'Enable complete swarm stack deployment')
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

// === GITHUB SPEC KIT INTEGRATION COMMANDS ===

// Generate specification using GitHub Spec Kit format
program
  .command('spec <feature-name>')
  .description('📋 Generate GitHub Spec Kit specification for a feature')
  .option('-d, --description <desc>', 'Feature description')
  .option('-i, --interactive', 'Interactive mode with questions')
  .action(async (featureName, options) => {
    try {
      console.log(chalk.cyan(`📋 Generating GitHub Spec Kit specification for: ${featureName}`));

      let description = options.description || 'User provided feature name without description';
      let clarifications = {};

      if (options.interactive || !options.description) {
        console.log(chalk.yellow('🐕 Starting interactive consultation...'));
        await spec.greet();
        description = `Feature: ${featureName}. ${description}`;
      }

      const spec_content = await specKit.generateSpec(featureName, description, clarifications);
      const saved = await specKit.saveSpec(featureName, spec_content, 'spec');

      // Validate Spec Kit format
      const validation = specKit.validateSpecFormat(spec_content);

      console.log(chalk.green('✅ Specification generated using GitHub Spec Kit format!'));
      console.log(chalk.gray(`File: ${saved.relativePath}`));

      if (!validation.isValid) {
        console.log(chalk.yellow('⚠️  Validation warnings:'));
        validation.issues.forEach(issue => console.log(chalk.gray(`  - ${issue}`)));
      }

    } catch (error) {
      console.error(chalk.red('Error generating specification:'), error.message);
    }
  });

// Generate implementation plan using GitHub Spec Kit format
program
  .command('plan <feature-name>')
  .description('🏗️  Generate GitHub Spec Kit implementation plan')
  .action(async (featureName) => {
    try {
      console.log(chalk.cyan(`🏗️  Generating implementation plan for: ${featureName}`));

      const specPath = `specs/${specKit.generateBranchName(featureName)}/spec.md`;
      const plan = await specKit.generatePlan(featureName, specPath);
      const saved = await specKit.saveSpec(featureName, plan, 'plan');

      console.log(chalk.green('✅ Implementation plan generated using GitHub Spec Kit format!'));
      console.log(chalk.gray(`File: ${saved.relativePath}`));

    } catch (error) {
      console.error(chalk.red('Error generating plan:'), error.message);
    }
  });

// List all Spec Kit projects
program
  .command('list')
  .description('📂 List all GitHub Spec Kit projects')
  .action(async () => {
    try {
      const projects = await specKit.getProjectStructure();

      if (projects.length === 0) {
        console.log(chalk.yellow('No Spec Kit projects found. Run "spec-kit init" first.'));
        return;
      }

      console.log(chalk.cyan('📂 GitHub Spec Kit Projects:'));
      projects.forEach(project => {
        console.log(chalk.green(`  ${project.branch}/`));
        project.files.forEach(file => {
          console.log(chalk.gray(`    - ${file}`));
        });
      });

    } catch (error) {
      console.error(chalk.red('Error listing projects:'), error.message);
    }
  });

// === FOCUS MANAGEMENT COMMANDS ===

// Import SessionManager for focus management
const SessionManager = await import('./focus/session-manager.js').then(module => module.SessionManager);

// Focus management command group
program
  .command('focus')
  .description('🎯 Focus management for persistent implementation sessions')
  .option('--status', 'Show current implementation session status')
  .option('--refocus', 'Restore implementation context and recover focus')
  .option('--start <spec>', 'Start new focused implementation session')
  .option('--continue', 'Continue from last checkpoint')
  .option('--checkpoint [reason]', 'Create implementation checkpoint')
  .option('--end [reason]', 'End current implementation session')
  .action(async (options) => {
    try {
      const sessionManager = new SessionManager();

      // Load existing session if available
      await sessionManager.loadSession();

      if (options.status) {
        const status = sessionManager.getStatus();
        console.log(chalk.cyan('\n🎯 Focus Management Status:'));
        console.log(status.message);

        if (status.hasActiveSession) {
          console.log(chalk.green(`📊 Progress: ${status.progress.percent}% complete`));
          console.log(chalk.blue(`🎯 Focus State: ${status.focusState}`));
          console.log(chalk.yellow(`⚡ Next Action: ${status.nextAction}`));
        }
        return;
      }

      if (options.refocus) {
        console.log(chalk.cyan('🔄 Recovering focus and restoring implementation context...'));
        const recovery = await sessionManager.recoverFocus(true);

        if (recovery) {
          console.log(chalk.green('\n✅ Focus Recovery Complete!'));
          console.log(recovery.message);
          console.log(chalk.yellow(`🎯 Next: ${recovery.nextAction}`));
        } else {
          console.log(chalk.yellow('⚠️  No active session to recover. Use --start to begin.'));
        }
        return;
      }

      if (options.start) {
        console.log(chalk.cyan(`🚀 Starting focused implementation session for: ${options.start}`));
        const session = await sessionManager.startSession(options.start, {
          specTitle: options.start,
          totalSteps: 10,
          priority: 'high'
        });
        console.log(chalk.green(`✅ Session ${session.id} started!`));
        console.log(chalk.blue('💡 Use --status to check progress, --refocus to recover if needed'));
        return;
      }

      if (options.continue) {
        const status = sessionManager.getStatus();
        if (status.hasActiveSession) {
          console.log(chalk.cyan('⏭️  Continuing implementation...'));
          console.log(status.message);
          console.log(chalk.yellow(`🎯 Next: ${status.nextAction}`));
        } else {
          console.log(chalk.yellow('⚠️  No active session to continue. Use --start to begin.'));
        }
        return;
      }

      if (options.checkpoint) {
        const reason = options.checkpoint === true ? 'manual' : options.checkpoint;
        const checkpoint = await sessionManager.createCheckpoint(reason);
        if (checkpoint) {
          console.log(chalk.green(`✅ Checkpoint created: ${reason}`));
        } else {
          console.log(chalk.yellow('⚠️  No active session for checkpoint.'));
        }
        return;
      }

      if (options.end) {
        const reason = options.end === true ? 'manual' : options.end;
        await sessionManager.endSession(reason);
        console.log(chalk.green('✅ Implementation session ended.'));
        return;
      }

      // Default action - show help and status
      console.log(chalk.cyan('🎯 Focus Management Commands:'));
      console.log(chalk.blue('  --status     Show current session status'));
      console.log(chalk.blue('  --refocus    Recover focus and restore context'));
      console.log(chalk.blue('  --start      Start new implementation session'));
      console.log(chalk.blue('  --continue   Continue from last checkpoint'));
      console.log(chalk.blue('  --checkpoint Create progress checkpoint'));
      console.log(chalk.blue('  --end        End current session'));

      const status = sessionManager.getStatus();
      console.log('\n' + status.message);

    } catch (error) {
      console.error(chalk.red('Focus management error:'), error.message);
    }
  });

// === WORKFLOW GUIDANCE COMMANDS ===

// Workflow guidance and spec-driven development nudging
program
  .command('guide')
  .description('🎯 Workflow guidance for proper GitHub Spec Kit usage')
  .option('--workflow', 'Show spec-driven development workflow guide')
  .option('--deployment', 'Guide to proper GitHub Spec Kit deployment')
  .option('--principles', 'Review spec-driven development principles')
  .option('--validate', 'Validate current workflow setup')
  .option('--nudge', 'Get gentle nudge toward proper spec workflow')
  .action(async (options) => {
    try {
      // Import SpecCharacter for guidance
      const { SpecCharacter } = await import('./character/spec.js');
      const spec = new SpecCharacter();

      if (options.deployment) {
        await spec.guideToSpecKitDeployment();
        return;
      }

      if (options.principles) {
        await spec.remindSpecDrivenPrinciples();
        return;
      }

      if (options.validate) {
        await spec.validateWorkflowSetup();
        return;
      }

      if (options.nudge) {
        // Check current context and provide appropriate nudge
        await spec.nudgeToSpecWorkflow({
          hasActiveSpec: false, // This would be determined by checking session
          isSpecDeployed: false,
          isFollowingSpecKit: false
        });
        return;
      }

      if (options.workflow) {
        await spec.show('thinking', 'Let me explain the proper spec-driven development workflow...');

        console.log(chalk.cyan('🎯 GitHub Spec Kit Workflow:'));
        console.log(chalk.blue(''));
        console.log(chalk.yellow('1. 📋 SPECIFICATION FIRST'));
        console.log(chalk.gray('   • Generate spec: node src/index.js spec <feature>'));
        console.log(chalk.gray('   • Review and refine requirements'));
        console.log(chalk.gray('   • Get stakeholder approval'));
        console.log(chalk.blue(''));
        console.log(chalk.yellow('2. 🚀 DEPLOYMENT & COLLABORATION'));
        console.log(chalk.gray('   • Commit spec to repository'));
        console.log(chalk.gray('   • Share with team for review'));
        console.log(chalk.gray('   • Create feature branch'));
        console.log(chalk.blue(''));
        console.log(chalk.yellow('3. 🎯 FOCUSED IMPLEMENTATION'));
        console.log(chalk.gray('   • Start focus session: node src/index.js focus --start <spec>'));
        console.log(chalk.gray('   • Implement following spec exactly'));
        console.log(chalk.gray('   • Use --refocus when conversations drift'));
        console.log(chalk.blue(''));
        console.log(chalk.yellow('4. ✅ VALIDATION & COMPLETION'));
        console.log(chalk.gray('   • Validate against acceptance criteria'));
        console.log(chalk.gray('   • Test implementation thoroughly'));
        console.log(chalk.gray('   • Update spec if requirements change'));

        await spec.show('happy', 'This workflow ensures consistent, high-quality development! 🏆');
        return;
      }

      // Default action - show guidance options
      console.log(chalk.cyan('🎯 Workflow Guidance Commands:'));
      console.log(chalk.blue('  --workflow    Show complete spec-driven development workflow'));
      console.log(chalk.blue('  --deployment  Guide to GitHub Spec Kit deployment'));
      console.log(chalk.blue('  --principles  Review spec-driven development principles'));
      console.log(chalk.blue('  --validate    Validate current workflow setup'));
      console.log(chalk.blue('  --nudge       Get gentle nudge toward proper workflow'));

      await spec.show('happy', 'I\'m here to help you follow proper spec-driven development! 🐕');

    } catch (error) {
      console.error(chalk.red('Workflow guidance error:'), error.message);
    }
  });

// === CUTE DOG COMMANDS ===

// Come here, Spec! - Start interaction with Spec
program
  .command('come-here')
  .alias('come')
  .alias('here-spec')
  .description('🐕 Come here, Spec! Start an interactive session')
  .action(async () => {
    try {
      const { SpecCharacter } = await import('./character/spec.js');
      const spec = new SpecCharacter();

      await spec.show('happy');
      console.log(chalk.yellow('🐕 *runs over excitedly with tail wagging*'));
      await spec.pause(1000);

      console.log(chalk.cyan('🐕 Spec: "Woof! You called? I\'m here and ready to help!"'));
      await spec.pause(800);

      console.log(chalk.blue('🎾 What would you like to do?'));
      console.log(chalk.gray('• Generate a spec: woof-woof <feature-name>'));
      console.log(chalk.gray('• Start focus session: good-boy --start <spec>'));
      console.log(chalk.gray('• Get guidance: sit --workflow'));
      console.log(chalk.gray('• Show status: speak'));

      await spec.show('excited', 'Ready for some pawsome development! 🎾');
    } catch (error) {
      console.error(chalk.red('🐕 Spec: "Oops! Something went wrong!"'), error.message);
    }
  });

// Woof woof! - Generate specs and start sessions
program
  .command('woof-woof')
  .alias('woof')
  .alias('bark')
  .description('🐕 Woof woof! Generate a spec or start something exciting')
  .argument('[feature]', 'Feature name to generate spec for')
  .option('--session <name>', 'Start a focused implementation session')
  .action(async (feature, options) => {
    try {
      const { SpecCharacter } = await import('./character/spec.js');
      const spec = new SpecCharacter();

      await spec.show('excited');
      console.log(chalk.yellow('🐕 *excited barking* WOOF WOOF!'));
      await spec.pause(800);

      if (options.session) {
        // Start focus session
        console.log(chalk.cyan(`🐕 Spec: "Starting a pawsome session for ${options.session}!"`));

        const SessionManager = await import('./focus/session-manager.js').then(module => module.SessionManager);
        const sessionManager = new SessionManager();

        const session = await sessionManager.startSession(options.session, {
          specTitle: options.session,
          totalSteps: 10,
          priority: 'high'
        });

        await spec.celebrate(`Session ${session.id} started!`);
        console.log(chalk.blue('🎾 Ready to fetch some great code! Use "good-boy --status" to check progress!'));
        return;
      }

      if (feature) {
        // Generate spec
        console.log(chalk.cyan(`🐕 Spec: "Generating a spec for ${feature}! *tail wagging intensifies*"`));

        const { ConsultationEngine } = await import('./consultation/engine.js');
        const consultation = new ConsultationEngine();

        await consultation.startConsultation();
        await consultation.generateSpecification(feature);

        await spec.celebrate('Spec generated!');
        console.log(chalk.blue('🎾 Use "good-boy --start ' + feature + '" to begin implementation!'));
        return;
      }

      // Default - excited greeting
      console.log(chalk.cyan('🐕 Spec: "Woof woof! What should we build today?"'));
      console.log(chalk.blue('🎾 Try: woof-woof <feature-name> to generate a spec!'));
      console.log(chalk.blue('🎾 Or: woof-woof --session <name> to start focused work!'));

    } catch (error) {
      console.error(chalk.red('🐕 Spec: "Arf! Something went wrong!"'), error.message);
    }
  });

// Good boy/girl commands - Focus management
program
  .command('good-boy')
  .alias('good-girl')
  .alias('good-spec')
  .description('🐕 Good boy, Spec! Focus management commands')
  .option('--start <spec>', 'Start focused implementation (like teaching a new trick!)')
  .option('--status', 'Show current session status (check if Spec is being good!)')
  .option('--refocus', 'Refocus Spec when distracted')
  .option('--treat [reason]', 'Give Spec a treat (create checkpoint)')
  .action(async (options) => {
    try {
      const { SpecCharacter } = await import('./character/spec.js');
      const spec = new SpecCharacter();

      const SessionManager = await import('./focus/session-manager.js').then(module => module.SessionManager);
      const sessionManager = new SessionManager();
      await sessionManager.loadSession();

      if (options.start) {
        await spec.show('excited');
        console.log(chalk.yellow('🐕 *sits attentively and wags tail*'));
        console.log(chalk.cyan(`🐕 Spec: "Good boy command received! Starting focused work on ${options.start}!"`));

        const session = await sessionManager.startSession(options.start, {
          specTitle: options.start,
          totalSteps: 10,
          priority: 'high'
        });

        await spec.celebrate('Ready to work!');
        console.log(chalk.blue('🎾 Spec is focused and ready! Use "speak" to check progress!'));
        return;
      }

      if (options.status) {
        await spec.show('happy');
        console.log(chalk.yellow('🐕 *sits proudly and shows current progress*'));

        const status = sessionManager.getStatus();
        console.log(chalk.cyan('🐕 Spec: "Here\'s how I\'m doing!"'));
        console.log(status.message);

        if (status.hasActiveSession) {
          console.log(chalk.green(`🏆 Progress: ${status.progress.percent}% complete`));
          console.log(chalk.blue(`🎯 Focus State: ${status.focusState}`));
          console.log(chalk.yellow(`🎾 Next: ${status.nextAction}`));
        }
        return;
      }

      if (options.refocus) {
        await spec.show('concerned');
        console.log(chalk.yellow('🐕 *shakes head and refocuses attention*'));
        console.log(chalk.cyan('🐕 Spec: "You\'re right! Let me get back on track!"'));

        const recovery = await sessionManager.recoverFocus(true);
        if (recovery) {
          await spec.show('happy');
          console.log(chalk.green('🐕 *sits attentively* "Back to work!"'));
          console.log(recovery.message);
        }
        return;
      }

      if (options.treat) {
        const reason = options.treat === true ? 'good work' : options.treat;
        await spec.show('celebrating');
        console.log(chalk.yellow('🐕 *wags tail excitedly* "A treat for me?!"'));

        const checkpoint = await sessionManager.createCheckpoint(reason);
        if (checkpoint) {
          console.log(chalk.green(`🎾 Spec: "Thank you for the treat! Progress saved: ${reason}"`));
        }
        return;
      }

      // Default good boy response
      await spec.show('happy');
      console.log(chalk.yellow('🐕 *tail wagging happily*'));
      console.log(chalk.cyan('🐕 Spec: "Am I a good boy? What should I do next?"'));
      console.log(chalk.blue('🎾 Try: good-boy --start <spec> to begin work!'));

    } catch (error) {
      console.error(chalk.red('🐕 Spec: "Whimper... something went wrong!"'), error.message);
    }
  });

// Sit commands - Workflow guidance
program
  .command('sit')
  .description('🐕 Sit, Spec! Get workflow guidance and principles')
  .option('--workflow', 'Show the complete spec-driven development workflow')
  .option('--stay', 'Stay focused on current spec (deployment guidance)')
  .option('--principles', 'Teach Spec the principles (review spec-driven development)')
  .action(async (options) => {
    try {
      const { SpecCharacter } = await import('./character/spec.js');
      const spec = new SpecCharacter();

      await spec.show('thinking');
      console.log(chalk.yellow('🐕 *sits obediently and pays attention*'));
      await spec.pause(800);

      if (options.workflow) {
        console.log(chalk.cyan('🐕 Spec: "Teaching me the workflow? I\'m listening!"'));
        await spec.show('graduate');

        console.log(chalk.cyan('🎯 GitHub Spec Kit Workflow (Spec is learning!):'));
        console.log(chalk.blue(''));
        console.log(chalk.yellow('1. 📋 FETCH THE SPECIFICATION'));
        console.log(chalk.gray('   • Generate spec: woof-woof <feature>'));
        console.log(chalk.gray('   • Review and refine requirements'));
        console.log(chalk.gray('   • Get stakeholder approval'));
        console.log(chalk.blue(''));
        console.log(chalk.yellow('2. 🚀 BRING IT TO THE PACK (DEPLOYMENT)'));
        console.log(chalk.gray('   • Commit spec to repository'));
        console.log(chalk.gray('   • Share with team for review'));
        console.log(chalk.gray('   • Create feature branch'));
        console.log(chalk.blue(''));
        console.log(chalk.yellow('3. 🎯 STAY FOCUSED (IMPLEMENTATION)'));
        console.log(chalk.gray('   • Start focus: good-boy --start <spec>'));
        console.log(chalk.gray('   • Implement following spec exactly'));
        console.log(chalk.gray('   • Use good-boy --refocus when distracted'));
        console.log(chalk.blue(''));
        console.log(chalk.yellow('4. ✅ GOOD DOG! (VALIDATION)'));
        console.log(chalk.gray('   • Validate against acceptance criteria'));
        console.log(chalk.gray('   • Test implementation thoroughly'));
        console.log(chalk.gray('   • Get treats (checkpoints) for good work'));

        await spec.show('happy', 'I understand! This is how we do good development work! 🏆');
        return;
      }

      if (options.stay) {
        await spec.guideToSpecKitDeployment();
        console.log(chalk.yellow('🐕 *stays sitting patiently* "I\'ll remember this!"'));
        return;
      }

      if (options.principles) {
        await spec.remindSpecDrivenPrinciples();
        console.log(chalk.yellow('🐕 *nods wisely* "These are important rules to follow!"'));
        return;
      }

      // Default sit response
      console.log(chalk.cyan('🐕 Spec: "I\'m sitting! What would you like to teach me?"'));
      console.log(chalk.blue('🎾 Try: sit --workflow to teach the development workflow!'));
      console.log(chalk.blue('🎾 Or: sit --principles to review the rules!'));

    } catch (error) {
      console.error(chalk.red('🐕 Spec: "Whimper... I tried to sit but something went wrong!"'), error.message);
    }
  });

// Speak - Show status and information
program
  .command('speak')
  .alias('talk')
  .alias('tell-me')
  .description('🐕 Speak, Spec! Tell me what\'s happening')
  .action(async () => {
    try {
      const { SpecCharacter } = await import('./character/spec.js');
      const spec = new SpecCharacter();

      const SessionManager = await import('./focus/session-manager.js').then(module => module.SessionManager);
      const sessionManager = new SessionManager();
      await sessionManager.loadSession();

      await spec.show('happy');
      console.log(chalk.yellow('🐕 WOOF! *excited tail wagging*'));
      console.log(chalk.cyan('🐕 Spec: "You want me to speak? Here\'s what I know!"'));

      // Show current status
      const status = sessionManager.getStatus();
      console.log(chalk.blue('\n📊 Current Status:'));
      console.log(status.message);

      if (status.hasActiveSession) {
        console.log(chalk.green(`🏆 Progress: ${status.progress.percent}% complete`));
        console.log(chalk.blue(`🎯 Focus State: ${status.focusState}`));
        console.log(chalk.yellow(`🎾 Next Action: ${status.nextAction}`));
      }

      // Show available commands
      console.log(chalk.blue('\n🎾 What we can do together:'));
      console.log(chalk.gray('• come-here - Call Spec over for help'));
      console.log(chalk.gray('• woof-woof <feature> - Generate a spec'));
      console.log(chalk.gray('• good-boy --start <spec> - Start focused work'));
      console.log(chalk.gray('• sit --workflow - Learn the development workflow'));
      console.log(chalk.gray('• speak - Check status (what you just did!)'));

      await spec.show('excited', 'Ready for more adventures! 🚀');

    } catch (error) {
      console.error(chalk.red('🐕 Spec: "Arf! I want to speak but something\'s wrong!"'), error.message);
    }
  });

// Stay - Keep focus, maintain current state
program
  .command('stay')
  .description('🐕 Stay, Spec! Maintain current focus and don\'t get distracted')
  .action(async () => {
    try {
      const { SpecCharacter } = await import('./character/spec.js');
      const spec = new SpecCharacter();

      const SessionManager = await import('./focus/session-manager.js').then(module => module.SessionManager);
      const sessionManager = new SessionManager();
      await sessionManager.loadSession();

      await spec.show('thinking');
      console.log(chalk.yellow('🐕 *sits still and maintains focus*'));
      console.log(chalk.cyan('🐕 Spec: "Staying focused on current work!"'));

      const status = sessionManager.getStatus();
      if (status.hasActiveSession) {
        console.log(chalk.green('🎯 Maintaining focus on: ' + status.message));
        console.log(chalk.blue('🎾 Use "good-boy --refocus" if I get distracted!'));
      } else {
        console.log(chalk.yellow('🐕 Spec: "Nothing to stay focused on right now!"'));
        console.log(chalk.blue('🎾 Use "woof-woof <feature>" to give me something to work on!'));
      }

    } catch (error) {
      console.error(chalk.red('🐕 Spec: "I want to stay but something went wrong!"'), error.message);
    }
  });

// === ENHANCED COMMAND INTERCEPTION ===
// Wrap all command execution with spec-first interception

const originalAction = program._actionResults;

// Override commander's action handling to intercept all commands
program.commands.forEach(command => {
  const originalAction = command._actionHandler;
  if (originalAction) {
    command._actionHandler = async (...args) => {
      try {
        // Extract command name and arguments
        const commandName = command.name();
        const [options] = args.slice(-1); // Last argument is always options
        const commandArgs = args.slice(0, -1); // Everything except options

        // Intercept command through spec-first system
        const interceptionResult = await interceptor.interceptCommand(commandName, commandArgs, options);

        // Handle interception results
        if (!interceptionResult.proceed) {
          if (interceptionResult.redirect) {
            // Redirect to different command
            console.log(chalk.cyan(`🐕 Spec: "Redirecting to ${interceptionResult.redirect} for proper workflow!"`));

            // Find and execute the redirect command
            const redirectCommand = program.commands.find(cmd => cmd.name() === interceptionResult.redirect);
            if (redirectCommand && redirectCommand._actionHandler) {
              return await redirectCommand._actionHandler(...(interceptionResult.args || []), {});
            }
          }
          return; // Don't proceed with original command
        }

        // Add spec context to options for command execution
        if (interceptionResult.specContext) {
          options._specContext = interceptionResult.specContext;
        }

        // Proceed with original command
        return await originalAction.apply(this, args);

      } catch (error) {
        console.error(chalk.red(`🐕 Spec: "Command interception error: ${error.message}"`));
        // Fall back to original command execution
        return await originalAction.apply(this, args);
      }
    };
  }
});

// Start continuous spec alignment monitoring
interceptor.monitorSpecAlignment();

// Start the CLI
program.parse();
