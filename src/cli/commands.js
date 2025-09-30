/**
 * T030: CLI command interface implementation
 * Provides cute dog commands and streamlined workflow initialization
 * Integrates with character system and enhanced consultation engine
 */

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import inquirer from 'inquirer';
import { SpecCharacterSystem } from '../character/persona.js';
import { AnimationEngine } from '../animation/engine.js';
import { SpecKitImplementer } from '../core/spec-kit-implementer.js';
import { ConsultationSession } from '../core/consultation-session.js';
import { UXState } from '../core/ux-state.js';

export class SpecKitCLI {
  constructor() {
    this.program = new Command();
    this.characterSystem = null;
    this.animationEngine = null;
    this.implementer = null;
    this.uxState = new UXState();
    this.currentSession = null;
    this.isInitialized = false;
  }

  /**
   * Initialize CLI with character and animation systems
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize animation engine
      this.animationEngine = await AnimationEngine.create();

      // Initialize character system with animation
      this.characterSystem = await SpecCharacterSystem.createWithAnimation(this.animationEngine);

      // Initialize spec kit implementer
      this.implementer = new SpecKitImplementer();

      // Update UX state
      this.uxState.updateState('initialized', {
        characterReady: true,
        animationReady: !this.animationEngine.fallbackMode,
        implementerReady: true
      });

      this.isInitialized = true;

    } catch (error) {
      console.error(chalk.red('Failed to initialize CLI systems:'), error.message);
      this.uxState.updateState('error', { error: error.message });
    }
  }

  /**
   * Setup CLI commands
   */
  setupCommands() {
    this.program
      .name('spec-kit')
      .description('🐕 Spec Kit Assistant - Your friendly Golden Retriever for specifications')
      .version('1.0.0');

    // Main command - streamlined auto-initialization
    this.program
      .command('start')
      .description('🚀 Start Spec Kit Assistant (auto-initializes and begins consultation)')
      .option('-d, --directory <path>', 'Working directory', process.cwd())
      .option('-t, --type <type>', 'Project type hint', 'auto-detect')
      .option('--no-animation', 'Disable animations')
      .action(async (options) => {
        await this.handleStartCommand(options);
      });

    // Cute dog commands for natural interaction
    this.program
      .command('come-here')
      .description('🐕 Start a focused session with Spec')
      .action(async () => {
        await this.handleComeHereCommand();
      });

    this.program
      .command('woof-woof')
      .alias('woof')
      .description('🐕 Initialize workflow and begin project discovery')
      .option('-q, --quick', 'Quick setup mode')
      .action(async (options) => {
        await this.handleWoofCommand(options);
      });

    this.program
      .command('good-boy')
      .description('🐕 Positive reinforcement and progress celebration')
      .action(async () => {
        await this.handleGoodBoyCommand();
      });

    this.program
      .command('sit')
      .description('🐕 Focus/pause command - review current state')
      .action(async () => {
        await this.handleSitCommand();
      });

    this.program
      .command('speak')
      .description('🐕 Voice interaction mode (if available)')
      .action(async () => {
        await this.handleSpeakCommand();
      });

    this.program
      .command('stay')
      .description('🐕 Maintain focus - prevent context switching')
      .action(async () => {
        await this.handleStayCommand();
      });

    // Implementation commands
    this.program
      .command('implement')
      .description('📋 Generate GitHub Spec Kit implementation')
      .option('-f, --force', 'Force regeneration of existing files')
      .action(async (options) => {
        await this.handleImplementCommand(options);
      });

    // Status and help commands
    this.program
      .command('status')
      .description('📊 Show current session status and progress')
      .action(async () => {
        await this.handleStatusCommand();
      });

    this.program
      .command('help-human')
      .description('🤝 Get help for confused humans')
      .action(async () => {
        await this.handleHelpCommand();
      });

    // Default command when no arguments provided
    this.program
      .action(async () => {
        await this.handleDefaultCommand();
      });
  }

  /**
   * Handle start command - streamlined auto-initialization
   */
  async handleStartCommand(options) {
    await this.initialize();

    // Show welcome with character
    await this.showWelcome();

    // Auto-detect if coding agent is already running
    const agentRunning = await this.detectRunningAgent();

    if (agentRunning) {
      await this.characterSystem.handleSpecialSituation('agent_conflict', {
        suggestion: 'Open a new terminal and run spec-kit from there for best results'
      });

      const shouldContinue = await this.confirmContinuation();
      if (!shouldContinue) {
        return;
      }
    }

    // Auto-initialize to current directory
    process.chdir(options.directory);

    await this.characterSystem.getResponse('working', {
      message: `Initializing in ${options.directory}`
    });

    // Auto-detect project type and begin consultation
    await this.startAutoConsultation(options);
  }

  /**
   * Handle come-here command - focused session
   */
  async handleComeHereCommand() {
    await this.initialize();

    await this.characterSystem.handleSpecialSituation('focused_session', {
      message: 'Starting focused session - let\'s create something amazing together!'
    });

    // Enable focus mode in UX state
    this.uxState.updateState('focused', {
      distractionsBlocked: true,
      deepWorkMode: true
    });

    // Start consultation in focused mode
    await this.startFocusedConsultation();
  }

  /**
   * Handle woof-woof command - workflow initialization
   */
  async handleWoofCommand(options) {
    await this.initialize();

    if (options.quick) {
      await this.characterSystem.getResponse('excited', {
        message: 'Quick mode activated! Let\'s get right to it!'
      });
      await this.startQuickWorkflow();
    } else {
      await this.characterSystem.handleSpecialSituation('workflow_start', {
        message: 'Initializing workflow - ready to discover your project!'
      });
      await this.startFullWorkflow();
    }
  }

  /**
   * Handle good-boy command - positive reinforcement
   */
  async handleGoodBoyCommand() {
    await this.initialize();

    await this.characterSystem.handleSpecialSituation('great_success', {
      celebration: true,
      encouragement: true
    });

    // Show progress if available
    if (this.currentSession) {
      await this.showProgress();
    }

    // Ask what to celebrate
    const { achievement } = await inquirer.prompt([{
      type: 'list',
      name: 'achievement',
      message: '🐕 What should we celebrate?',
      choices: [
        'Completed a major milestone',
        'Fixed a tricky bug',
        'Finished a feature',
        'Learned something new',
        'Just feeling good!'
      ]
    }]);

    await this.characterSystem.getResponse('celebrating', {
      achievement,
      personalityScore: 'high'
    });
  }

  /**
   * Handle sit command - focus/pause
   */
  async handleSitCommand() {
    await this.initialize();

    await this.characterSystem.getResponse('thinking', {
      message: 'Sitting and reviewing our current state...'
    });

    // Show current state
    await this.displayCurrentState();

    // Offer focus management
    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: '🐕 What would you like to focus on?',
      choices: [
        'Continue current work',
        'Review specifications',
        'Check implementation progress',
        'Plan next steps',
        'Take a break'
      ]
    }]);

    await this.handleFocusAction(action);
  }

  /**
   * Handle speak command - voice interaction
   */
  async handleSpeakCommand() {
    await this.initialize();

    await this.characterSystem.getResponse('excited', {
      message: 'Voice mode would be amazing! For now, let\'s chat with text.'
    });

    // Start interactive conversation
    await this.startInteractiveConversation();
  }

  /**
   * Handle stay command - maintain focus
   */
  async handleStayCommand() {
    await this.initialize();

    await this.characterSystem.getResponse('working', {
      message: 'Staying focused on current task - no distractions!'
    });

    // Enable deep focus mode
    this.uxState.updateState('deep_focus', {
      sideQuestsBlocked: true,
      notificationsOff: true,
      focusIntensity: 'high'
    });

    // Continue with current session
    if (this.currentSession) {
      await this.continueCurrentSession();
    } else {
      await this.characterSystem.getResponse('confused', {
        message: 'No active session to stay focused on. Shall we start something?'
      });
    }
  }

  /**
   * Handle implement command - GitHub Spec Kit implementation
   */
  async handleImplementCommand(options) {
    await this.initialize();

    await this.characterSystem.getResponse('working', {
      message: 'Starting GitHub Spec Kit implementation...'
    });

    try {
      // Check if consultation data exists
      let projectContext = {};

      if (this.currentSession) {
        projectContext = this.currentSession.getDiscoveryResults();
      } else {
        // Quick consultation for implementation
        projectContext = await this.quickProjectDiscovery();
      }

      // Generate implementation
      const result = await this.implementer.initializeSpecKit(projectContext);

      await this.characterSystem.handleSpecialSituation('great_success', {
        message: 'Implementation complete! Repository structure ready!'
      });

      // Show what was generated
      console.log(chalk.green('\n📋 Generated Files:'));
      if (result.specFiles) {
        Object.keys(result.specFiles).forEach(file => {
          console.log(chalk.blue(`  ✅ ${file}`));
        });
      }

      if (result.githubImplementation) {
        console.log(chalk.green('\n🐙 GitHub Integration:'));
        console.log(chalk.blue(`  ✅ Repository structure created`));
        console.log(chalk.blue(`  ✅ Issue templates generated`));
        console.log(chalk.blue(`  ✅ CI/CD workflows configured`));
      }

    } catch (error) {
      await this.characterSystem.handleSpecialSituation('technical_error', {
        error: error.message
      });
    }
  }

  /**
   * Handle status command
   */
  async handleStatusCommand() {
    await this.initialize();

    await this.characterSystem.getResponse('thinking', {
      message: 'Checking our current status...'
    });

    await this.displayDetailedStatus();
  }

  /**
   * Handle help command
   */
  async handleHelpCommand() {
    await this.showDetailedHelp();
  }

  /**
   * Handle default command when no arguments
   */
  async handleDefaultCommand() {
    await this.initialize();

    // Show figlet banner
    console.log(chalk.cyan(figlet.textSync('Spec Kit', { font: 'Small' })));

    await this.characterSystem.handleSpecialSituation('first_time_user', {
      showWelcome: true
    });

    // Start streamlined workflow
    await this.handleStartCommand({
      directory: process.cwd(),
      type: 'auto-detect'
    });
  }

  /**
   * Show welcome with character animation
   */
  async showWelcome() {
    if (this.animationEngine && !this.animationEngine.fallbackMode) {
      await this.animationEngine.playSequence('welcome');
    }

    console.log(chalk.cyan(figlet.textSync('Spec Kit Assistant', { font: 'Small' })));

    await this.characterSystem.getResponse('excited', {
      message: 'Hello! I\'m Spec, your friendly Golden Retriever for specifications!'
    });
  }

  /**
   * Detect if coding agent is running
   */
  async detectRunningAgent() {
    // Check for common agent indicators
    const indicators = [
      'CLAUDE_SESSION_ID',
      'CURSOR_SESSION',
      'CODEWHISPERER_ACTIVE',
      'COPILOT_ACTIVE'
    ];

    return indicators.some(indicator => process.env[indicator]);
  }

  /**
   * Confirm continuation when agent conflict detected
   */
  async confirmContinuation() {
    const { shouldContinue } = await inquirer.prompt([{
      type: 'confirm',
      name: 'shouldContinue',
      message: '🐕 Continue anyway? (Better to open new terminal for best results)',
      default: false
    }]);

    return shouldContinue;
  }

  /**
   * Start auto consultation based on project detection
   */
  async startAutoConsultation(options) {
    await this.characterSystem.getResponse('working', {
      message: 'Auto-detecting project and starting consultation...'
    });

    this.currentSession = new ConsultationSession();

    const discoveryOptions = {
      projectPath: process.cwd(),
      autoDetectProjectType: true,
      enableGitHubIntegration: true,
      streamlined: true,
      typeHint: options.type
    };

    try {
      const results = await this.currentSession.startDiscovery(discoveryOptions);

      await this.characterSystem.getResponse('excited', {
        message: `Great! I discovered a ${results.projectType} project. Let's build something amazing!`
      });

      // Show quick summary and offer next steps
      await this.showDiscoverySummary(results);
      await this.offerNextSteps();

    } catch (error) {
      await this.characterSystem.handleSpecialSituation('technical_error', {
        error: error.message,
        suggestion: 'Let\'s try a manual consultation instead'
      });

      await this.startManualConsultation();
    }
  }

  /**
   * Start focused consultation mode
   */
  async startFocusedConsultation() {
    // Implementation for focused consultation
    console.log(chalk.blue('🐕 Starting focused consultation...'));
    // This would integrate with the enhanced consultation engine
  }

  /**
   * Start quick workflow
   */
  async startQuickWorkflow() {
    // Implementation for quick workflow
    console.log(chalk.blue('🐕 Quick workflow starting...'));
  }

  /**
   * Start full workflow
   */
  async startFullWorkflow() {
    // Implementation for full workflow
    console.log(chalk.blue('🐕 Full workflow starting...'));
  }

  /**
   * Show current progress
   */
  async showProgress() {
    if (this.currentSession) {
      const progress = this.currentSession.getProgress();
      console.log(chalk.green(`📊 Progress: ${progress.completionPercentage}%`));
    }
  }

  /**
   * Display current state
   */
  async displayCurrentState() {
    const state = this.uxState.getCurrentState();
    console.log(chalk.blue('\n📊 Current State:'));
    console.log(chalk.gray(`  Phase: ${state.phase}`));
    console.log(chalk.gray(`  Focus: ${state.focusLevel}`));

    if (this.currentSession) {
      console.log(chalk.gray(`  Session: Active`));
    }
  }

  /**
   * Handle focus action
   */
  async handleFocusAction(action) {
    await this.characterSystem.getResponse('working', {
      message: `Focusing on: ${action}`
    });

    switch (action) {
      case 'Continue current work':
        await this.continueCurrentSession();
        break;
      case 'Review specifications':
        await this.reviewSpecifications();
        break;
      case 'Check implementation progress':
        await this.checkImplementationProgress();
        break;
      case 'Plan next steps':
        await this.planNextSteps();
        break;
      case 'Take a break':
        await this.characterSystem.getResponse('happy', {
          message: 'Good idea! Rest is important. I\'ll be here when you\'re ready!'
        });
        break;
    }
  }

  /**
   * Start interactive conversation
   */
  async startInteractiveConversation() {
    console.log(chalk.blue('🐕 Let\'s chat! (Type "exit" to finish)'));

    while (true) {
      const { message } = await inquirer.prompt([{
        type: 'input',
        name: 'message',
        message: 'You:'
      }]);

      if (message.toLowerCase() === 'exit') {
        await this.characterSystem.getResponse('happy', {
          message: 'Thanks for chatting! That was fun!'
        });
        break;
      }

      await this.characterSystem.handleConversation(message, 'general');
    }
  }

  /**
   * Continue current session
   */
  async continueCurrentSession() {
    if (this.currentSession) {
      // Resume session
      console.log(chalk.blue('🐕 Continuing where we left off...'));
    } else {
      await this.characterSystem.getResponse('confused', {
        message: 'No active session to continue. Let\'s start a new one!'
      });
    }
  }

  /**
   * Quick project discovery for implementation
   */
  async quickProjectDiscovery() {
    const { projectName } = await inquirer.prompt([{
      type: 'input',
      name: 'projectName',
      message: '🐕 What\'s your project name?',
      default: require('path').basename(process.cwd())
    }]);

    const { projectType } = await inquirer.prompt([{
      type: 'list',
      name: 'projectType',
      message: '🐕 What type of project is this?',
      choices: ['web-app', 'api', 'mobile-app', 'library', 'agent-swarm']
    }]);

    return { projectName, projectType };
  }

  /**
   * Show discovery summary
   */
  async showDiscoverySummary(results) {
    console.log(chalk.green('\n🔍 Discovery Summary:'));
    console.log(chalk.blue(`  Project: ${results.projectName || 'Unnamed'}`));
    console.log(chalk.blue(`  Type: ${results.projectType}`));
    console.log(chalk.blue(`  Complexity: ${results.complexity || 'Unknown'}`));
  }

  /**
   * Offer next steps after discovery
   */
  async offerNextSteps() {
    const { nextStep } = await inquirer.prompt([{
      type: 'list',
      name: 'nextStep',
      message: '🐕 What would you like to do next?',
      choices: [
        'Generate GitHub Spec Kit implementation',
        'Continue detailed consultation',
        'Review discovered information',
        'Start coding immediately',
        'Save and exit'
      ]
    }]);

    switch (nextStep) {
      case 'Generate GitHub Spec Kit implementation':
        await this.handleImplementCommand({});
        break;
      case 'Continue detailed consultation':
        await this.continueDetailedConsultation();
        break;
      case 'Review discovered information':
        await this.reviewDiscoveredInfo();
        break;
      case 'Start coding immediately':
        await this.startCoding();
        break;
      case 'Save and exit':
        await this.saveAndExit();
        break;
    }
  }

  /**
   * Display detailed status
   */
  async displayDetailedStatus() {
    const personalityReport = this.characterSystem.generatePersonalityReport();
    const uxState = this.uxState.getCurrentState();

    console.log(chalk.green('\n📊 Detailed Status Report:'));
    console.log(chalk.blue('\n🐕 Character System:'));
    console.log(chalk.gray(`  Current mood: ${personalityReport.currentState}`));
    console.log(chalk.gray(`  Personality score: ${personalityReport.personalityScore}`));

    console.log(chalk.blue('\n🎨 UX State:'));
    console.log(chalk.gray(`  Phase: ${uxState.phase}`));
    console.log(chalk.gray(`  Focus level: ${uxState.focusLevel}`));

    if (this.currentSession) {
      const sessionStatus = this.currentSession.getStatus();
      console.log(chalk.blue('\n💬 Consultation Session:'));
      console.log(chalk.gray(`  Phase: ${sessionStatus.currentPhase}`));
      console.log(chalk.gray(`  Progress: ${sessionStatus.progress}%`));
    }

    if (this.animationEngine) {
      const perfReport = this.animationEngine.getPerformanceReport();
      console.log(chalk.blue('\n🎬 Animation Engine:'));
      console.log(chalk.gray(`  Fallback mode: ${this.animationEngine.fallbackMode}`));
      console.log(chalk.gray(`  Animations played: ${perfReport.totalAnimations}`));
    }
  }

  /**
   * Show detailed help
   */
  async showDetailedHelp() {
    console.log(chalk.cyan(figlet.textSync('Help', { font: 'Small' })));
    console.log(chalk.green('\n🐕 Spec Kit Assistant Commands:'));
    console.log(chalk.blue('\n🚀 Main Commands:'));
    console.log(chalk.gray('  spec-kit start        # Auto-initialize and begin consultation'));
    console.log(chalk.gray('  spec-kit implement    # Generate GitHub Spec Kit files'));
    console.log(chalk.gray('  spec-kit status       # Show current status'));

    console.log(chalk.blue('\n🐕 Cute Dog Commands:'));
    console.log(chalk.gray('  spec-kit come-here    # Start focused session'));
    console.log(chalk.gray('  spec-kit woof-woof    # Initialize workflow'));
    console.log(chalk.gray('  spec-kit good-boy     # Celebrate achievements'));
    console.log(chalk.gray('  spec-kit sit          # Review current state'));
    console.log(chalk.gray('  spec-kit speak        # Interactive conversation'));
    console.log(chalk.gray('  spec-kit stay         # Maintain focus'));

    console.log(chalk.blue('\n💡 Tips:'));
    console.log(chalk.gray('  • Open a new terminal if using with coding agents'));
    console.log(chalk.gray('  • Use --no-animation for limited terminals'));
    console.log(chalk.gray('  • Commands are designed to be natural and friendly'));
    console.log(chalk.gray('  • Spec the Golden Retriever is here to help!'));
  }

  /**
   * Parse and execute CLI commands
   */
  async run(argv = process.argv) {
    this.setupCommands();
    await this.program.parseAsync(argv);
  }

  /**
   * Create CLI instance and run
   */
  static async create() {
    const cli = new SpecKitCLI();
    return cli;
  }
}

export default SpecKitCLI;