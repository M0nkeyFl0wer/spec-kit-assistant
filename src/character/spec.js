import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { MultimediaGenerator } from '../multimedia/multimedia-generator.js';
import { VoiceSynthesis } from '../multimedia/voice-synthesis.js';

export class SpecCharacter {
  constructor() {
    this.name = 'Spec';
    this.personality = 'friendly-helpful-encouraging';
    this.currentMood = 'excited';
    this.voiceEnabled = false;
    this.multimedia = new MultimediaGenerator();
    this.voice = new VoiceSynthesis();

    // Character art states
    this.art = {
      happy: `
${chalk.yellow('      /^-----^')}\\
     ${chalk.yellow('( ◕     ◕ )')}
      ${chalk.yellow('\\  ^___^  /')}  ${chalk.cyan('Woof! Ready to help!')}
       ${chalk.gray('\\   ---   /')}
        ${chalk.gray('^^^     ^^^')}
      `,

      thinking: `
${chalk.yellow('      /^-----^')}\\
     ${chalk.yellow('( •     • )')}
      ${chalk.yellow('\\    ?    /')}  ${chalk.blue('Let me think about that...')}
       ${chalk.gray('\\   ---   /')}
        ${chalk.gray('^^^     ^^^')}
      `,

      celebrating: `
${chalk.yellow('      /^-----^')}\\
     ${chalk.yellow('( ★     ★ )')}
      ${chalk.yellow('\\   ∪∪∪   /')}  ${chalk.green('Fantastic work!')}
       ${chalk.gray('\\   ---   /')}
        ${chalk.gray('^^^  ^^^  ^^^')}  ${chalk.yellow('*tail wagging*')}
      `,

      concerned: `
${chalk.yellow('      /^-----^')}\\
     ${chalk.yellow('( ◕     ◕ )')}
      ${chalk.yellow('\\    ∩    /')}  ${chalk.red('Hmm, let me help with that...')}
       ${chalk.gray('\\   ---   /')}
        ${chalk.gray('^^^     ^^^')}
      `,

      working: `
${chalk.yellow('      /^-----^')}\\
     ${chalk.yellow('( ◔     ◔ )')}
      ${chalk.yellow('\\  ≡≡≡≡≡  /')}  ${chalk.cyan('Working on it...')}
       ${chalk.gray('\\   ---   /')}
        ${chalk.gray('^^^     ^^^')}
      `
    };

    // Personality responses
    this.responses = {
      greetings: [
        "Woof! I'm Spec, your friendly golden retriever guide! 🐕",
        "Hello there! Ready for some tail-waggingly good spec development? 🎾",
        "Paws up! I'm here to help you build amazing things! 🐾"
      ],
      encouragement: [
        "You're doing great! Keep going! 🌟",
        "This is exactly the right approach! 🎯",
        "Woof woof! That's the spirit! 🚀"
      ],
      help: [
        "Don't worry, I'll guide you through this step by step! 🐕‍🦺",
        "Every expert was once a beginner. Let's figure this out together! 💪",
        "No problem too big for Team Human-and-Spec! 🤝"
      ],
      celebration: [
        "Pawsome! You nailed it! 🎉",
        "Such spec, much wow! That's perfect! ⭐",
        "Tail-wagging success! Time for treats! 🦴"
      ]
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

    const celebrationMsg = `${achievement}! ` +
      this.responses.celebration[
        Math.floor(Math.random() * this.responses.celebration.length)
      ];

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
          { name: '⏭️ Skip this for now', value: 'skip' }
        ]
      }
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
        frames: ['🤔', '💭', '🧠', '💡', '✨']
      }
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
        frames: ['🐕', '🦴', '🎾', '🐾', '🏃‍♂️']
      }
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
      validate: options.validate
    }]);

    // Acknowledge the response
    const acknowledgments = [
      "Got it! Thanks for letting me know!",
      "Perfect! That helps me understand!",
      "Woof! That's exactly what I needed to know!"
    ];

    const ack = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
    console.log(chalk.green(`🐕 ${ack}`));

    return answer.response;
  }

  async showProgress(current, total, task = 'Working') {
    const percentage = Math.round((current / total) * 100);
    const progressBar = '█'.repeat(Math.floor(percentage / 5)) +
                       '░'.repeat(20 - Math.floor(percentage / 5));

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
        demo: null
      },
      {
        title: 'Plan the approach',
        description: 'Now we\'ll determine the best way to reach that goal.',
        demo: 'planning-process'
      },
      {
        title: 'Execute the plan',
        description: 'Time to put our plan into action!',
        demo: 'execution-demo'
      }
    ];
  }

  async pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
      greet: this.responses.greetings
    };

    const responseSet = responses[situation] || responses.help;
    return responseSet[Math.floor(Math.random() * responseSet.length)];
  }
}

export default SpecCharacter;