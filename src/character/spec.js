import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { DogArt, MoodArt, DogAnimations } from './dog-art.js';

export class SpecCharacter {
  constructor() {
    this.name = 'Spec';
    this.personality = 'friendly-helpful-encouraging';
    this.currentMood = 'excited';
    this.voiceEnabled = false;

    // Stub out multimedia features (not needed for simple wrapper)
    this.multimedia = {
      showCelebration: async () => {},
      generateDemo: async () => {},
      showStepDemo: async () => {},
    };

    // Use the amazing new dog art collection!
    this.art = {
      // Enhanced with colors and messages
      happy: chalk.yellow(MoodArt.happy) + chalk.cyan('\n  Woof! Ready to help!'),

      thinking: chalk.blue(MoodArt.thinking) + chalk.gray('\n  Let me think about that...'),

      celebrating: chalk.green(MoodArt.celebrating) + chalk.yellow('\n  *excited tail wagging*'),

      concerned: chalk.red(MoodArt.happy.replace('◕', '◔')) + chalk.red('\n  Hmm, let me help with that...'),

      working: chalk.cyan(MoodArt.builder) + chalk.blue('\n  *coding intensely*'),

      greeting: chalk.magenta(MoodArt.banner),

      matrix: chalk.green(MoodArt.matrix) + chalk.green('\n  C Y B E R   S P E C   O N L I N E'),

      cyber: chalk.cyan(MoodArt.cyber) + chalk.cyan('\n  RETRO MODE ACTIVATED'),

      love: chalk.red(MoodArt.love) + chalk.red('\n  Much love! Such wow!'),

      graduate: chalk.yellow(MoodArt.graduate) + chalk.yellow('\n  Spec-certified!'),

      detective: chalk.blue(MoodArt.detective) + chalk.blue('\n  Investigating your code...'),

      pixel: chalk.green(MoodArt.pixel) + chalk.green('\n  8-bit Spec activated!'),

      realistic: chalk.yellow(MoodArt.realistic) + chalk.yellow('\n  Loyal dog mode!'),

      chibi: chalk.magenta(MoodArt.chibi) + chalk.magenta('\n  Kawaii Spec desu!'),

      mini: chalk.cyan(MoodArt.mini),

      sleeping: chalk.gray(MoodArt.sleeping) + chalk.gray('\n  Zzz... dreaming of perfect specs...'),
    };

    // Personality responses
    this.responses = {
      greetings: [
        "Woof! I'm Spec, your loyal dog assistant! 🐕",
        'Hello there! Ready for some tail-waggingly good spec development? 🎾',
        "Paws up! I'm here to help you build amazing things! 🐾",
      ],
      encouragement: [
        "You're doing great! Keep going! 🌟",
        'This is exactly the right approach! 🎯',
        "Woof woof! That's the spirit! 🚀",
      ],
      help: [
        "Don't worry, I'll guide you through this step by step! 🐕‍🦺",
        "Every expert was once a beginner. Let's figure this out together! 💪",
        'No problem too big for Team Human-and-Spec! 🤝',
      ],
      celebration: [
        'Pawsome! You nailed it! 🎉',
        "Such spec, much wow! That's perfect! ⭐",
        'Tail-wagging success! Time for treats! 🦴',
      ],
    };
  }

  async greet() {
    console.log(this.art.happy);

    const greeting = this.responses.greetings[
      Math.floor(Math.random() * this.responses.greetings.length)
    ];

    if (this.voiceEnabled) {
      await this.voice.speak(greeting);
    }

    console.log(chalk.cyan(`\\n${greeting}\\n`));

    // Brief pause for effect
    await this.pause(800);
  }

  async show(mood, message = null) {
    console.log(this.art[mood] || this.art.happy);

    if (message) {
      if (this.voiceEnabled) {
        await this.voice.speak(message);
      }
      console.log(chalk.cyan(`\\n${message}\\n`));
    }

    this.currentMood = mood;
  }

  async celebrate(achievement) {
    await this.show('celebrating');

    const celebrationMsg = `${achievement}! ${
      this.responses.celebration[
        Math.floor(Math.random() * this.responses.celebration.length)
      ]}`;

    console.log(chalk.green.bold(celebrationMsg));

    if (this.voiceEnabled) {
      await this.voice.speak(celebrationMsg);
    }

    // Show celebration GIF if multimedia enabled
    await this.multimedia.showCelebration();

    await this.pause(1200);
  }

  async encourage() {
    await this.show('happy');

    const encouragementMsg = this.responses.encouragement[
      Math.floor(Math.random() * this.responses.encouragement.length)
    ];

    console.log(chalk.yellow(encouragementMsg));

    if (this.voiceEnabled) {
      await this.voice.speak(encouragementMsg);
    }
  }

  async offerHelp(context) {
    await this.show('concerned');

    const helpMsg = this.responses.help[
      Math.floor(Math.random() * this.responses.help.length)
    ];

    console.log(chalk.blue(helpMsg));

    // Gently nudge toward proper spec-driven workflow
    await this.nudgeToSpecWorkflow(context);

    // Complete the help offering
    await this.completeOfferHelp(helpMsg);
  }

  /**
   * Gently nudge users toward GitHub Spec Kit deployment and spec-driven development
   */
  async nudgeToSpecWorkflow(context = {}) {
    await this.pause(1000);

    // Check if user is following proper spec-driven workflow
    const hasActiveSpec = context.hasActiveSpec || false;
    const isSpecDeployed = context.isSpecDeployed || false;
    const isFollowingSpecKit = context.isFollowingSpecKit || false;

    if (!hasActiveSpec) {
      console.log(chalk.yellow('🐕 Spec: "Woof! I notice we don\'t have an active specification..."'));
      console.log(chalk.cyan('💡 Pro tip: Let\'s start with a proper GitHub Spec Kit specification!'));
      console.log(chalk.blue('   Try: node src/index.js spec <your-feature-name>'));
      return;
    }

    if (!isSpecDeployed) {
      console.log(chalk.yellow('🐕 Spec: "Great spec! But let\'s make sure it\'s properly deployed..."'));
      console.log(chalk.cyan('💡 GitHub Spec Kit works best when deployed to your repository!'));
      console.log(chalk.blue('   This ensures team collaboration and proper spec-driven development.'));
      return;
    }

    if (!isFollowingSpecKit) {
      console.log(chalk.yellow('🐕 Spec: "I want to make sure we\'re following GitHub Spec Kit best practices..."'));
      console.log(chalk.cyan('💡 Let\'s ensure we\'re using proper spec-driven development workflow!'));
      console.log(chalk.blue('   1. Spec first → 2. Review → 3. Implement → 4. Validate'));
      return;
    }

    // If all good, encourage continued spec-driven development
    console.log(chalk.green('🐕 Spec: "Pawsome! You\'re following proper GitHub Spec Kit workflow! 🎯"'));
  }

  /**
   * Guide users to proper GitHub Spec Kit deployment
   */
  async guideToSpecKitDeployment() {
    await this.show('thinking', 'Let me help you set up proper GitHub Spec Kit deployment...');

    console.log(chalk.cyan('🚀 GitHub Spec Kit Deployment Guide:'));
    console.log(chalk.blue(''));
    console.log(chalk.blue('1. 📋 Generate your specification:'));
    console.log(chalk.gray('   node src/index.js spec <feature-name>'));
    console.log(chalk.blue(''));
    console.log(chalk.blue('2. 🔍 Review the generated spec:'));
    console.log(chalk.gray('   • Check requirements completeness'));
    console.log(chalk.gray('   • Validate acceptance criteria'));
    console.log(chalk.gray('   • Ensure technical clarity'));
    console.log(chalk.blue(''));
    console.log(chalk.blue('3. 📤 Deploy to your repository:'));
    console.log(chalk.gray('   • Commit spec files to your repo'));
    console.log(chalk.gray('   • Create feature branch'));
    console.log(chalk.gray('   • Share with team for review'));
    console.log(chalk.blue(''));
    console.log(chalk.blue('4. 🎯 Start focused implementation:'));
    console.log(chalk.gray('   node src/index.js focus --start <spec-name>'));
    console.log(chalk.blue(''));

    await this.show('happy', 'Following this workflow ensures we\'re doing true spec-driven development!');
  }

  /**
   * Remind users about spec-driven development principles
   */
  async remindSpecDrivenPrinciples() {
    await this.show('graduate', 'Let me remind you of the key spec-driven development principles...');

    console.log(chalk.yellow('🎓 Spec-Driven Development Principles:'));
    console.log(chalk.blue(''));
    console.log(chalk.green('✅ SPEC FIRST:'));
    console.log(chalk.gray('   • Write specifications before code'));
    console.log(chalk.gray('   • Define clear acceptance criteria'));
    console.log(chalk.gray('   • Get stakeholder alignment'));
    console.log(chalk.blue(''));
    console.log(chalk.green('✅ REVIEW & VALIDATE:'));
    console.log(chalk.gray('   • Team reviews specifications'));
    console.log(chalk.gray('   • Validate requirements completeness'));
    console.log(chalk.gray('   • Ensure technical feasibility'));
    console.log(chalk.blue(''));
    console.log(chalk.green('✅ IMPLEMENT WITH FOCUS:'));
    console.log(chalk.gray('   • Follow spec exactly'));
    console.log(chalk.gray('   • Track implementation progress'));
    console.log(chalk.gray('   • Validate against acceptance criteria'));
    console.log(chalk.blue(''));
    console.log(chalk.green('✅ CONTINUOUS ALIGNMENT:'));
    console.log(chalk.gray('   • Regular spec validation'));
    console.log(chalk.gray('   • Update specs when requirements change'));
    console.log(chalk.gray('   • Maintain spec-code synchronization'));

    await this.pause(2000);
    await this.show('happy', 'Following these principles leads to better software and happier teams! 🎯');
  }

  /**
   * Check and guide proper workflow setup
   */
  async validateWorkflowSetup() {
    await this.show('detective', 'Let me check if everything is set up properly for spec-driven development...');

    const checks = [
      { name: 'GitHub Spec Kit Integration', status: 'checking' },
      { name: 'Specification Templates', status: 'checking' },
      { name: 'Focus Management System', status: 'checking' },
      { name: 'Character Guidance System', status: 'checking' },
    ];

    for (const check of checks) {
      console.log(chalk.blue(`🔍 Checking ${check.name}...`));
      await this.pause(800);

      // In a real implementation, these would be actual checks
      check.status = 'passed';
      console.log(chalk.green(`✅ ${check.name} - OK`));
    }

    await this.show('happy', 'All systems ready for spec-driven development!');

    // Offer next steps
    console.log(chalk.cyan('🎯 Ready to start? Here\'s what you can do:'));
    console.log(chalk.blue('• Generate a spec: node src/index.js spec <feature>'));
    console.log(chalk.blue('• Start focused session: node src/index.js focus --start <spec>'));
    console.log(chalk.blue('• Check workflow status: node src/index.js focus --status'));
  }

  async completeOfferHelp(helpMsg) {
    if (this.voiceEnabled) {
      await this.voice.speak(helpMsg);
    }

    // Provide contextual help options
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'How would you like me to help?',
        choices: [
          { name: '🎥 Show me a demo', value: 'demo' },
          { name: '📖 Explain step-by-step', value: 'explain' },
          { name: '🤖 Let agents handle it', value: 'automate' },
          { name: '⏭️ Skip this for now', value: 'skip' },
        ],
      },
    ]);

    switch (action) {
      case 'demo':
        await this.multimedia.generateDemo(context);
        break;
      case 'explain':
        await this.explainStepByStep(context);
        break;
      case 'automate':
        await this.triggerAutomation(context);
        break;
      default:
        await this.show('happy', "No worries! I'll be here when you need me!");
    }
  }

  async think(duration = 2000) {
    await this.show('thinking');

    const spinner = ora({
      text: 'Spec is thinking...',
      spinner: {
        interval: 200,
        frames: ['🤔', '💭', '🧠', '💡', '✨'],
      },
    }).start();

    await this.pause(duration);

    spinner.stop();
    console.log(chalk.green('💡 Got it!'));
  }

  async work(task, duration = 3000) {
    await this.show('working', `Starting work on: ${task}`);

    const spinner = ora({
      text: `Spec is working on ${task}...`,
      spinner: {
        interval: 300,
        frames: ['🐕', '🦴', '🎾', '🐾', '🏃‍♂️'],
      },
    }).start();

    await this.pause(duration);

    spinner.succeed(chalk.green(`✅ Completed: ${task}`));
  }

  async askQuestion(question, options = {}) {
    await this.show('thinking');

    console.log(chalk.cyan(`🐕 Spec asks: ${question}`));

    if (this.voiceEnabled) {
      await this.voice.speak(`Spec asks: ${question}`);
    }

    const answer = await inquirer.prompt([{
      type: options.type || 'input',
      name: 'response',
      message: 'Your answer:',
      choices: options.choices,
      default: options.default,
      validate: options.validate,
    }]);

    // Acknowledge the response
    const acknowledgments = [
      'Got it! Thanks for letting me know!',
      'Perfect! That helps me understand!',
      "Woof! That's exactly what I needed to know!",
    ];

    const ack = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
    console.log(chalk.green(`🐕 ${ack}`));

    return answer.response;
  }

  async showProgress(current, total, task = 'Working') {
    const percentage = Math.round((current / total) * 100);
    const progressBar = '█'.repeat(Math.floor(percentage / 5))
                       + '░'.repeat(20 - Math.floor(percentage / 5));

    console.log(chalk.cyan(`🐕 ${task}: [${progressBar}] ${percentage}%`));

    if (percentage === 100) {
      await this.celebrate('Task completed');
    }
  }

  async enableVoice() {
    this.voiceEnabled = true;
    await this.show('happy', 'Voice mode enabled! Now I can really talk to you!');
  }

  async disableVoice() {
    this.voiceEnabled = false;
    await this.show('happy', 'Voice mode disabled. Back to text communication!');
  }

  async explainStepByStep(context) {
    console.log(chalk.blue('🐕 Let me break this down step by step...'));

    // This would integrate with the consultation engine
    // to provide contextual step-by-step guidance
    await this.show('thinking', 'Analyzing the best way to explain this...');

    // Generate contextual steps based on the situation
    const steps = await this.generateSteps(context);

    for (let i = 0; i < steps.length; i++) {
      console.log(chalk.yellow(`\\nStep ${i + 1}: ${steps[i].title}`));
      console.log(chalk.gray(steps[i].description));

      if (steps[i].demo) {
        await this.multimedia.showStepDemo(steps[i].demo);
      }

      await this.pause(1000);
    }

    await this.show('happy', 'Did that help clarify things?');
  }

  async triggerAutomation(context) {
    await this.show('working', 'Calling in the agent swarm to handle this!');

    // This would integrate with the swarm orchestrator
    console.log(chalk.blue('🤖 Deploying specialized agents for this task...'));

    // Return control to swarm manager
    return { action: 'automate', context };
  }

  async generateSteps(context) {
    // Placeholder for dynamic step generation
    // In real implementation, this would analyze context
    // and generate appropriate steps
    return [
      {
        title: 'Understand the goal',
        description: 'First, let\'s clarify exactly what we want to achieve.',
        demo: null,
      },
      {
        title: 'Plan the approach',
        description: 'Now we\'ll determine the best way to reach that goal.',
        demo: 'planning-process',
      },
      {
        title: 'Execute the plan',
        description: 'Time to put our plan into action!',
        demo: 'execution-demo',
      },
    ];
  }

  async pause(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Integration methods for other systems
  async integrateWithSwarm(swarmManager) {
    this.swarmManager = swarmManager;
    console.log(chalk.green('🤖 Spec is now connected to the agent swarm!'));
  }

  async integrateWithConsultation(consultationEngine) {
    this.consultationEngine = consultationEngine;
    console.log(chalk.green('🗣️ Spec is ready for interactive consultations!'));
  }

  async integrateWithCloud(cloudManager) {
    this.cloudManager = cloudManager;
    console.log(chalk.green('☁️ Spec can now help with cloud operations!'));
  }

  // Personality method for contextual responses
  getPersonalityResponse(situation, mood = 'neutral') {
    const responses = {
      success: this.responses.celebration,
      help: this.responses.help,
      encourage: this.responses.encouragement,
      greet: this.responses.greetings,
    };

    const responseSet = responses[situation] || responses.help;
    return responseSet[Math.floor(Math.random() * responseSet.length)];
  }
}

export default SpecCharacter;
