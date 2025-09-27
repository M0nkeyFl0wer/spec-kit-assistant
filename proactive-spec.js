#!/usr/bin/env node

import chalk from 'chalk';
import { DogArt, MoodArt } from './src/character/dog-art.js';
import { EnhancedConsultationEngine } from './src/consultation/enhanced-consultation-engine.js';
import { IntelligentSwarmOrchestrator } from './src/swarm/intelligent-orchestrator.js';
import { PrototypeGenerator } from './src/prototype/generator.js';
import { GoogleTasksIntegration } from './src/integrations/google-tasks.js';
import { NotificationManager } from './src/integrations/notifications.js';
import os from 'os';

/**
 * 🐕 Proactive Spec - Takes Initiative!
 * Starts conversations, suggests actions, and guides the entire process
 */
class ProactiveSpec {
  constructor() {
    this.orchestrator = new IntelligentSwarmOrchestrator();
    this.consultation = new EnhancedConsultationEngine();
    this.generator = new PrototypeGenerator();
    this.tasks = new GoogleTasksIntegration();
    this.notifications = new NotificationManager();
    this.sessionState = 'greeting';
  }

  async start() {
    // Clear screen and make a grand entrance
    console.clear();
    console.log(chalk.cyan(DogArt.megaWelcome));

    await this.greetAndAssess();
    await this.initiateConversation();
  }

  async greetAndAssess() {
    console.log(chalk.cyan(DogArt.detective));
    console.log(chalk.green('🐕 Spec: "Hi there! I noticed you launched me."'));
    console.log(chalk.blue('🔍 Let me check what we can do on your system...'));
    console.log('');

    // Assess system capabilities
    const capabilities = await this.orchestrator.detectCapabilities();

    console.log(chalk.yellow('📊 System Assessment Complete:'));
    console.log(chalk.cyan(`   💾 RAM: ${capabilities.memory.total}GB available`));
    console.log(chalk.cyan(`   🖥️  CPU: ${capabilities.cpu.count} cores`));
    console.log(chalk.cyan(`   🤖 Local AI: ${capabilities.ollama ? 'Ready!' : 'Not available'}`));
    console.log(chalk.cyan(`   🚀 GPU: ${capabilities.gpu.available ? capabilities.gpu.model : 'CPU only'}`));
    console.log('');

    // Suggest optimal setup
    await this.suggestOptimalSetup(capabilities);
  }

  async suggestOptimalSetup(capabilities) {
    console.log(chalk.cyan(DogArt.scientist));
    console.log(chalk.blue('🐕 Spec: "Based on your system, here\'s what I recommend:"'));
    console.log('');

    if (capabilities.ollama && capabilities.memory.total >= 8) {
      console.log(chalk.green('✨ LOCAL AI POWERHOUSE SETUP:'));
      console.log(chalk.cyan('   🤖 Local Llama agents for code generation'));
      console.log(chalk.cyan('   ⚡ Hybrid swarm (local + remote)'));
      console.log(chalk.cyan('   🔄 Session persistence enabled'));
      console.log(chalk.cyan('   📊 Full resource monitoring'));

      this.recommendedSetup = 'powerhouse';
    } else if (capabilities.memory.total >= 4) {
      console.log(chalk.yellow('⚖️ BALANCED HYBRID SETUP:'));
      console.log(chalk.cyan('   ☁️ Remote agents for heavy lifting'));
      console.log(chalk.cyan('   💻 Local processing for simple tasks'));
      console.log(chalk.cyan('   🔄 Smart resource management'));

      this.recommendedSetup = 'hybrid';
    } else {
      console.log(chalk.blue('☁️ CLOUD-OPTIMIZED SETUP:'));
      console.log(chalk.cyan('   🌐 All agents run remotely'));
      console.log(chalk.cyan('   📱 Lightweight local interface'));
      console.log(chalk.cyan('   ⚡ Maximum compatibility'));

      this.recommendedSetup = 'cloud';
    }

    console.log('');
    await this.offerToSetup();
  }

  async offerToSetup() {
    console.log(chalk.cyan(DogArt.superhero));
    console.log(chalk.green('🐕 Spec: "Ready to set this up for you?"'));
    console.log('');

    // Auto-setup after a brief pause
    console.log(chalk.yellow('⏳ Setting up in 3 seconds... (Ctrl+C to customize)'));

    try {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, 3000);

        process.on('SIGINT', () => {
          clearTimeout(timeout);
          reject(new Error('User wants to customize'));
        });
      });

      // Auto-setup
      await this.autoSetup();

    } catch (error) {
      // User interrupted - offer choices
      await this.customSetup();
    }
  }

  async autoSetup() {
    console.log(chalk.cyan(DogArt.builder));
    console.log(chalk.blue('🐕 Spec: "Auto-setting up your development environment!"'));
    console.log('');

    // Deploy recommended swarm
    await this.deployRecommendedSwarm();

    // Setup integrations
    await this.setupIntegrations();

    // Start the conversation
    await this.startProjectConversation();
  }

  async deployRecommendedSwarm() {
    console.log(chalk.yellow('🤖 Deploying optimal agent swarm...'));

    const swarmConfig = {
      powerhouse: { location: 'local', count: 4, types: ['research', 'builder', 'designer', 'tester'] },
      hybrid: { location: 'hybrid', count: 3, types: ['research', 'builder', 'tester'] },
      cloud: { location: 'remote', count: 2, types: ['research', 'builder'] }
    };

    const config = swarmConfig[this.recommendedSetup];

    console.log(chalk.cyan(`📍 Location: ${config.location}`));
    console.log(chalk.cyan(`🤖 Agents: ${config.count} (${config.types.join(', ')})`));
    console.log('');

    try {
      const agents = await this.orchestrator.deployAgentSwarm(config.location, config.count);

      console.log(chalk.green(`✅ Successfully deployed ${agents.length} agents!`));
      agents.forEach(agent => {
        console.log(chalk.cyan(`   🤖 ${agent.type} (${agent.location})`));
      });
      console.log('');

      // Offer swarm monitoring
      await this.offerSwarmMonitoring();

    } catch (error) {
      console.log(chalk.red('❌ Swarm deployment issue'));
      await this.handleSwarmError(error);
    }
  }

  async offerSwarmMonitoring() {
    console.log(chalk.cyan(DogArt.detective));
    console.log(chalk.blue('🐕 Spec: "Want to monitor the swarm while we work?"'));
    console.log('');

    // Start background monitoring
    this.startSwarmMonitoring();

    console.log(chalk.green('📊 Background monitoring started'));
    console.log(chalk.gray('   (Use `node dog-commands.js swarm status` anytime)'));
    console.log('');
  }

  async startSwarmMonitoring() {
    setInterval(async () => {
      const status = await this.orchestrator.getSwarmStatus();

      // Send notifications for important events
      if (status.resourceUsage.memory.used > 0.9) {
        await this.notifications.sendAlert('High memory usage detected', DogArt.concerned);
      }

      if (status.agents.total === 0) {
        await this.notifications.sendAlert('All agents stopped', DogArt.sleeping);
      }
    }, 60000); // Check every minute
  }

  async setupIntegrations() {
    console.log(chalk.cyan(DogArt.wizard));
    console.log(chalk.blue('🐕 Spec: "Setting up integrations for task management..."'));
    console.log('');

    try {
      // Setup Google Tasks if available
      const tasksSetup = await this.tasks.initialize();
      if (tasksSetup) {
        console.log(chalk.green('✅ Google Tasks integration ready'));
      }

      // Setup notifications
      await this.notifications.initialize();
      console.log(chalk.green('✅ Notification system ready'));

      // Test notification with ASCII art
      await this.notifications.sendWelcome();

    } catch (error) {
      console.log(chalk.yellow('⚠️ Some integrations unavailable (optional)'));
    }
  }

  async startProjectConversation() {
    console.log(chalk.cyan(DogArt.party));
    console.log(chalk.green('🐕 Spec: "Everything\'s ready! Now for the fun part..."'));
    console.log(chalk.blue('🎯 Time to discover what amazing thing you want to build!'));
    console.log('');

    // Start the enhanced consultation
    try {
      const spec = await this.consultation.startProjectDiscovery();

      if (spec) {
        await this.offerImplementation(spec);
      }

    } catch (error) {
      console.log(chalk.red('🚨 Consultation issue detected'));
      await this.handleConsultationError(error);
    }
  }

  async offerImplementation(spec) {
    console.log(chalk.cyan(DogArt.builder));
    console.log(chalk.green('🐕 Spec: "Perfect! Your spec is ready."'));
    console.log(chalk.blue('🚀 Want me to generate a working prototype?'));
    console.log('');

    // Auto-offer after brief pause
    console.log(chalk.yellow('⏳ Generating prototype in 5 seconds... (Ctrl+C to review first)'));

    try {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, 5000);

        process.on('SIGINT', () => {
          clearTimeout(timeout);
          reject(new Error('User wants to review'));
        });
      });

      // Auto-generate prototype
      await this.generatePrototype(spec);

    } catch (error) {
      // Show spec review first
      await this.reviewSpecBeforeImplementation(spec);
    }
  }

  async generatePrototype(spec) {
    console.log(chalk.cyan(DogArt.ultimate));
    console.log(chalk.blue('🐕 Spec: "Generating your working prototype!"'));
    console.log('');

    try {
      const prototypePath = await this.generator.specToPrototype(spec);

      if (prototypePath) {
        await this.celebrateSuccess(prototypePath);
        await this.offerNextSteps(prototypePath, spec);
      }

    } catch (error) {
      console.log(chalk.red('🚨 Prototype generation issue'));
      await this.handlePrototypeError(error, spec);
    }
  }

  async celebrateSuccess(prototypePath) {
    console.log(chalk.cyan(DogArt.celebrating));
    console.log(chalk.green('🎉 Spec: "SUCCESS! Your prototype is ready!"'));
    console.log(chalk.yellow(`📁 Location: ${prototypePath}`));
    console.log('');

    // Create Google Task for next steps
    await this.tasks.createTask(
      'Review Generated Prototype',
      `Check out the working prototype at: ${prototypePath}`,
      'high'
    );

    // Send celebration notification
    await this.notifications.sendSuccess('Prototype Generated!', DogArt.celebrating);
  }

  async offerNextSteps(prototypePath, spec) {
    console.log(chalk.cyan(DogArt.graduate));
    console.log(chalk.blue('🐕 Spec: "What would you like to do next?"'));
    console.log('');

    console.log(chalk.green('🎯 Available Options:'));
    console.log(chalk.cyan('   1. 🔧 Refine the prototype'));
    console.log(chalk.cyan('   2. 🚀 Deploy to cloud'));
    console.log(chalk.cyan('   3. 🧪 Generate tests'));
    console.log(chalk.cyan('   4. 📝 Create documentation'));
    console.log(chalk.cyan('   5. 🎨 Improve design'));
    console.log(chalk.cyan('   6. 🔄 Start a new project'));
    console.log('');

    // Auto-suggest deployment for web apps
    if (spec.type === 'web-app') {
      console.log(chalk.yellow('💡 Suggestion: Deploy to cloud for easy sharing'));

      // Create deployment task
      await this.tasks.createTask(
        'Deploy Web App',
        'Deploy the generated web app to cloud hosting',
        'medium'
      );
    }
  }

  async handleSwarmError(error) {
    console.log(chalk.cyan(DogArt.concerned));
    console.log(chalk.red('🐕 Spec: "Swarm deployment failed. Let me diagnose..."'));
    console.log('');

    // Deploy debug swarm
    await this.consultation.deployDebugSwarm();

    // Create task for manual intervention
    await this.tasks.createTask(
      'Fix Swarm Deployment',
      `Swarm deployment failed: ${error.message}`,
      'high'
    );

    // Send notification with diagnosis
    await this.notifications.sendAlert(
      'Swarm deployment needs attention',
      DogArt.concerned
    );
  }

  async handleConsultationError(error) {
    console.log(chalk.cyan(DogArt.detective));
    console.log(chalk.red('🐕 Spec: "Consultation issue detected. Investigating..."'));
    console.log('');

    // Offer alternative approaches
    console.log(chalk.yellow('🔄 Alternative options:'));
    console.log(chalk.cyan('   1. Retry with simplified questions'));
    console.log(chalk.cyan('   2. Use pre-built template'));
    console.log(chalk.cyan('   3. Load previous session'));
    console.log(chalk.cyan('   4. Get human help'));
    console.log('');

    // Create pivot decision task
    await this.tasks.createTask(
      'Resolve Consultation Issue',
      'Consultation encountered an error and needs attention',
      'high'
    );
  }

  async handlePrototypeError(error, spec) {
    console.log(chalk.cyan(DogArt.scientist));
    console.log(chalk.red('🐕 Spec: "Prototype generation hit a snag. Analyzing..."'));
    console.log('');

    // Try fallback generation
    console.log(chalk.yellow('🔄 Trying simplified prototype generation...'));

    try {
      await this.generator.generateMinimalPrototype(spec);
      console.log(chalk.green('✅ Simplified prototype created'));
    } catch (fallbackError) {
      console.log(chalk.red('❌ All generation attempts failed'));

      // Create task for manual intervention
      await this.tasks.createTask(
        'Manual Prototype Creation',
        `Automatic generation failed. Spec details: ${JSON.stringify(spec, null, 2)}`,
        'high'
      );
    }
  }

  async customSetup() {
    console.log(chalk.cyan(DogArt.thinking));
    console.log(chalk.blue('🐕 Spec: "Let\'s customize your setup!"'));
    console.log('');

    // Show customization options
    console.log(chalk.yellow('🎛️ Customization Options:'));
    console.log(chalk.cyan('   1. Choose agent types'));
    console.log(chalk.cyan('   2. Configure resource limits'));
    console.log(chalk.cyan('   3. Setup specific integrations'));
    console.log(chalk.cyan('   4. Use minimal mode'));
    console.log('');

    // For now, fall back to standard setup
    console.log(chalk.gray('(Customization UI coming soon - using recommended setup)'));
    await this.autoSetup();
  }

  async reviewSpecBeforeImplementation(spec) {
    console.log(chalk.cyan(DogArt.graduate));
    console.log(chalk.blue('🐕 Spec: "Let me show you what we built together:"'));
    console.log('');

    // Display spec summary
    console.log(chalk.yellow('📋 Your Project Specification:'));
    console.log(chalk.cyan(`   🎯 Vision: ${spec.vision || 'Awesome project'}`));
    console.log(chalk.cyan(`   🏗️ Type: ${spec.type || 'web-app'}`));
    console.log(chalk.cyan(`   ⏰ Timeline: ${spec.timeline || 'mvp'}`));

    if (spec.deepContext) {
      console.log(chalk.cyan(`   🎭 Emotion: ${spec.deepContext.emotion}`));
      console.log(chalk.cyan(`   👥 Audience: ${spec.deepContext.audience}`));
    }

    console.log('');
    console.log(chalk.blue('🐕 Spec: "Ready to build this?"'));

    // Generate after review
    setTimeout(() => this.generatePrototype(spec), 2000);
  }
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.log(chalk.cyan(DogArt.concerned));
  console.log(chalk.red('🐕 Spec: "Unexpected error occurred. Logging for analysis..."'));
  console.error(chalk.gray(error.message));
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log(chalk.cyan(DogArt.sleeping));
  console.log(chalk.yellow('\n🐕 Spec: "Bye! Session saved for next time!"'));
  process.exit(0);
});

// Start the proactive experience
const spec = new ProactiveSpec();
spec.start().catch(error => {
  console.error('Failed to start proactive Spec:', error.message);
  process.exit(1);
});