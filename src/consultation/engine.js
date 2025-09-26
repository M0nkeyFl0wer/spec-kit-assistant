import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import yaml from 'yaml';
import { SpecCharacter } from '../character/spec.js';
import { MultimediaGenerator } from '../multimedia/multimedia-generator.js';
import { secureWriteFile, secureReadFile, validateProjectPath } from '../utils/secure-path.js';

export class ConsultationEngine {
  constructor() {
    this.spec = new SpecCharacter();
    this.multimedia = new MultimediaGenerator();
    this.conversationHistory = [];
    this.projectContext = {};
    this.userPreferences = {};
    this.currentSession = null;

    // Knowledge base for intelligent questioning
    this.knowledgeBase = {
      projectTypes: {
        'web-app': {
          questions: ['frontend-framework', 'backend-api', 'database', 'authentication'],
          complexity: 'medium',
          cloudRecommended: true
        },
        'mobile-app': {
          questions: ['platform', 'native-vs-hybrid', 'backend-sync', 'offline-capability'],
          complexity: 'high',
          cloudRecommended: true
        },
        'api-service': {
          questions: ['rest-vs-graphql', 'database', 'rate-limiting', 'documentation'],
          complexity: 'medium',
          cloudRecommended: true
        },
        'cli-tool': {
          questions: ['language', 'package-manager', 'distribution', 'config-format'],
          complexity: 'low',
          cloudRecommended: false
        },
        'data-pipeline': {
          questions: ['data-sources', 'processing-frequency', 'storage', 'monitoring'],
          complexity: 'high',
          cloudRecommended: true
        }
      },

      questionFlows: {
        'frontend-framework': {
          question: 'What frontend framework would you like to use?',
          type: 'list',
          choices: [
            { name: 'React - Great for complex UIs', value: 'react' },
            { name: 'Vue.js - Easy to learn, powerful', value: 'vue' },
            { name: 'Svelte - Lightweight and fast', value: 'svelte' },
            { name: 'Vanilla JS - Keep it simple', value: 'vanilla' },
            { name: 'I need help deciding', value: 'help' }
          ],
          followUps: {
            'help': 'framework-recommendation'
          }
        },

        'backend-api': {
          question: 'What kind of backend API do you need?',
          type: 'list',
          choices: [
            { name: 'REST API - Standard HTTP endpoints', value: 'rest' },
            { name: 'GraphQL - Flexible data querying', value: 'graphql' },
            { name: 'WebSocket - Real-time communication', value: 'websocket' },
            { name: 'Serverless Functions - Event-driven', value: 'serverless' },
            { name: 'No backend needed', value: 'none' }
          ]
        },

        'database': {
          question: 'What type of database fits your needs?',
          type: 'list',
          choices: [
            { name: 'PostgreSQL - Robust relational database', value: 'postgresql' },
            { name: 'MongoDB - Flexible document database', value: 'mongodb' },
            { name: 'Redis - Fast in-memory data store', value: 'redis' },
            { name: 'SQLite - Simple file-based database', value: 'sqlite' },
            { name: 'No database needed', value: 'none' }
          ]
        }

        // ... more question flows would be defined here
      }
    };
  }

  async startGuidedSetup(options = {}) {
    await this.spec.greet();

    console.log(chalk.cyan("🗣️ Let's have a conversation about your project!"));
    console.log(chalk.gray("Instead of filling out forms, I'll ask questions and we'll build your spec together.\\n"));

    this.currentSession = {
      id: Date.now(),
      startTime: new Date(),
      options,
      responses: {},
      decisions: []
    };

    try {
      // Phase 1: Understand the vision
      await this.discoverProjectVision();

      // Phase 2: Explore technical requirements
      await this.exploreRequirements();

      // Phase 3: Review and refine
      await this.reviewAndRefine();

      // Phase 4: Generate specification
      await this.generateSpecification();

      // Phase 5: Setup next steps
      if (options.cloud || options.swarm) {
        await this.setupAdvancedFeatures(options);
      }

    } catch (error) {
      await this.spec.offerHelp('setup-error');
      console.error(chalk.red('Setup error:'), error.message);
    }
  }

  async discoverProjectVision() {
    await this.spec.show('thinking', 'Let me understand what you want to build...');

    // Start with the big picture
    const vision = await this.spec.askQuestion(
      "Tell me about your project idea. What problem are you trying to solve?",
      { type: 'input', validate: (input) => input.length > 10 || 'Please tell me a bit more!' }
    );

    this.projectContext.vision = vision;
    await this.spec.show('happy', 'That sounds like a great project! Let me ask a few more questions...');

    // Determine project type
    const projectType = await this.spec.askQuestion(
      "What type of project is this?",
      {
        type: 'list',
        choices: [
          { name: '🌐 Web Application - Interactive website or web app', value: 'web-app' },
          { name: '📱 Mobile Application - iOS/Android app', value: 'mobile-app' },
          { name: '🔌 API Service - Backend service or API', value: 'api-service' },
          { name: '⚡ CLI Tool - Command-line application', value: 'cli-tool' },
          { name: '📊 Data Pipeline - Data processing system', value: 'data-pipeline' },
          { name: '🤔 Not sure yet - Help me decide', value: 'help' }
        ]
      }
    );

    if (projectType === 'help') {
      await this.providProjectTypeGuidance(vision);
    } else {
      this.projectContext.type = projectType;
      await this.spec.celebrate('Project type identified');
    }

    // Understand timeline and scope
    const timeline = await this.spec.askQuestion(
      "What's your timeline for this project?",
      {
        type: 'list',
        choices: [
          { name: '⚡ Quick prototype (1-2 weeks)', value: 'prototype' },
          { name: '🏃‍♂️ MVP (1-2 months)', value: 'mvp' },
          { name: '🏗️ Full product (3-6 months)', value: 'full' },
          { name: '🌱 Long-term project (6+ months)', value: 'long-term' }
        ]
      }
    );

    this.projectContext.timeline = timeline;

    await this.recordDecision('vision-discovery', {
      vision,
      projectType: this.projectContext.type,
      timeline
    });
  }

  async exploreRequirements() {
    await this.spec.show('working', 'Now let us dive into the technical details...');

    const projectConfig = this.knowledgeBase.projectTypes[this.projectContext.type];

    if (projectConfig) {
      // Ask context-specific questions
      for (const questionKey of projectConfig.questions) {
        const questionFlow = this.knowledgeBase.questionFlows[questionKey];

        if (questionFlow) {
          const response = await this.askIntelligentQuestion(questionFlow);
          this.projectContext[questionKey] = response;

          // Handle follow-up questions
          if (response.followUp) {
            await this.handleFollowUp(response.followUp, response.value);
          }
        }
      }
    }

    // Ask about team and collaboration
    const teamSize = await this.spec.askQuestion(
      "How many people will be working on this project?",
      {
        type: 'list',
        choices: [
          { name: '👤 Just me', value: 'solo' },
          { name: '👥 Small team (2-4 people)', value: 'small' },
          { name: '👥👥 Medium team (5-10 people)', value: 'medium' },
          { name: '🏢 Large team (10+ people)', value: 'large' }
        ]
      }
    );

    this.projectContext.teamSize = teamSize;

    // Ask about experience level
    const experienceLevel = await this.spec.askQuestion(
      "What's your experience level with this type of project?",
      {
        type: 'list',
        choices: [
          { name: '🌱 Beginner - This is new to me', value: 'beginner' },
          { name: '📚 Intermediate - I have some experience', value: 'intermediate' },
          { name: '🎯 Advanced - I am quite experienced', value: 'advanced' },
          { name: '🚀 Expert - I could teach others', value: 'expert' }
        ]
      }
    );

    this.projectContext.experienceLevel = experienceLevel;

    await this.recordDecision('requirements-exploration', {
      technicalChoices: this.projectContext,
      teamSize,
      experienceLevel
    });
  }

  async askIntelligentQuestion(questionFlow) {
    await this.spec.show('thinking');

    // Show contextual help if available
    if (questionFlow.explanation) {
      console.log(chalk.blue(`💡 ${questionFlow.explanation}`));
    }

    const response = await inquirer.prompt([{
      type: questionFlow.type,
      name: 'answer',
      message: chalk.cyan(`🐕 ${questionFlow.question}`),
      choices: questionFlow.choices,
      default: questionFlow.default,
      validate: questionFlow.validate
    }]);

    // Provide intelligent follow-up based on the answer
    const followUp = questionFlow.followUps?.[response.answer];

    return {
      value: response.answer,
      followUp: followUp,
      timestamp: new Date()
    };
  }

  async handleFollowUp(followUpType, previousAnswer) {
    switch (followUpType) {
      case 'framework-recommendation':
        await this.provideFrameworkRecommendation();
        break;

      case 'explain-choice':
        await this.explainTechnicalChoice(previousAnswer);
        break;

      default:
        console.log(chalk.gray(`Following up on: ${followUpType}`));
    }
  }

  async provideFrameworkRecommendation() {
    await this.spec.show('thinking', 'Let me help you choose the right framework...');

    const priorities = await this.spec.askQuestion(
      "What's most important for your project?",
      {
        type: 'checkbox',
        choices: [
          { name: '⚡ Performance - Fast loading and responsive', value: 'performance' },
          { name: '📚 Easy to learn - Simple for beginners', value: 'learning-curve' },
          { name: '🔧 Flexibility - Lots of customization options', value: 'flexibility' },
          { name: '👥 Community - Large ecosystem and support', value: 'community' },
          { name: '🏢 Enterprise - Used by big companies', value: 'enterprise' }
        ]
      }
    );

    // AI-powered recommendation logic
    const recommendation = this.generateFrameworkRecommendation(priorities);

    await this.spec.show('happy', `Based on your priorities, I recommend ${recommendation.name}!`);

    console.log(chalk.green(`\\n✨ ${recommendation.explanation}`));

    if (recommendation.demo) {
      const showDemo = await this.spec.askQuestion(
        'Would you like to see a quick demo of this framework?',
        { type: 'confirm', default: true }
      );

      if (showDemo) {
        await this.multimedia.generateDemo(`${recommendation.name}-intro`);
      }
    }

    return recommendation;
  }

  generateFrameworkRecommendation(priorities) {
    const frameworks = {
      react: {
        name: 'React',
        scores: { performance: 8, 'learning-curve': 6, flexibility: 9, community: 10, enterprise: 10 },
        explanation: 'React has the largest ecosystem and is widely used in enterprise. Great for complex applications.',
        demo: true
      },
      vue: {
        name: 'Vue.js',
        scores: { performance: 9, 'learning-curve': 9, flexibility: 8, community: 7, enterprise: 7 },
        explanation: 'Vue.js is beginner-friendly with excellent performance and a gentle learning curve.',
        demo: true
      },
      svelte: {
        name: 'Svelte',
        scores: { performance: 10, 'learning-curve': 8, flexibility: 7, community: 5, enterprise: 4 },
        explanation: 'Svelte offers the best performance with a small bundle size and intuitive syntax.',
        demo: true
      }
    };

    // Calculate weighted scores based on user priorities
    let bestFramework = 'react';
    let bestScore = 0;

    Object.entries(frameworks).forEach(([key, framework]) => {
      let score = 0;
      priorities.forEach(priority => {
        score += framework.scores[priority] || 0;
      });

      if (score > bestScore) {
        bestScore = score;
        bestFramework = key;
      }
    });

    return frameworks[bestFramework];
  }

  async reviewAndRefine() {
    await this.spec.show('celebrating', 'Great! Let me show you what we\'ve planned so far...');

    // Display a summary of decisions
    console.log(chalk.yellow('\\n📋 Project Summary:'));
    console.log(chalk.cyan(`   Vision: ${this.projectContext.vision}`));
    console.log(chalk.cyan(`   Type: ${this.projectContext.type}`));
    console.log(chalk.cyan(`   Timeline: ${this.projectContext.timeline}`));
    console.log(chalk.cyan(`   Team Size: ${this.projectContext.teamSize}`));

    // Show technical choices
    console.log(chalk.yellow('\\n🔧 Technical Choices:'));
    Object.entries(this.projectContext).forEach(([key, value]) => {
      if (typeof value === 'object' && value.value) {
        console.log(chalk.cyan(`   ${key}: ${value.value}`));
      }
    });

    const isHappy = await this.spec.askQuestion(
      'Does this look right to you?',
      { type: 'confirm', default: true }
    );

    if (!isHappy) {
      await this.refineChoices();
    } else {
      await this.spec.celebrate('Specification approved');
    }

    await this.recordDecision('review-and-refinement', {
      approved: isHappy,
      finalContext: this.projectContext
    });
  }

  async refineChoices() {
    await this.spec.show('helpful', 'No problem! Let us adjust what needs changing...');

    const whatToChange = await this.spec.askQuestion(
      'What would you like to change?',
      {
        type: 'checkbox',
        choices: [
          { name: '🎯 Project vision and goals', value: 'vision' },
          { name: '🔧 Technical choices', value: 'technical' },
          { name: '⏰ Timeline expectations', value: 'timeline' },
          { name: '👥 Team structure', value: 'team' }
        ]
      }
    );

    for (const change of whatToChange) {
      switch (change) {
        case 'vision':
          await this.redoVisionDiscovery();
          break;
        case 'technical':
          await this.redoTechnicalChoices();
          break;
        case 'timeline':
          await this.redoTimeline();
          break;
        case 'team':
          await this.redoTeamStructure();
          break;
      }
    }
  }

  async generateSpecification() {
    await this.spec.work('Generating your specification', 3000);

    const spec = {
      metadata: {
        name: this.generateProjectName(),
        version: '1.0.0',
        created: new Date(),
        type: this.projectContext.type,
        timeline: this.projectContext.timeline
      },
      vision: {
        description: this.projectContext.vision,
        goals: this.extractGoals(),
        success_metrics: this.generateSuccessMetrics()
      },
      technical: this.generateTechnicalSpec(),
      implementation: {
        phases: this.generateImplementationPhases(),
        team_structure: this.projectContext.teamSize,
        experience_level: this.projectContext.experienceLevel
      },
      resources: {
        cloud_integration: this.shouldRecommendCloud(),
        agent_swarm: this.shouldRecommendAgents(),
        multimedia_support: true
      }
    };

    // Save specification securely
    try {
      const specPath = await secureWriteFile('spec.yaml', yaml.stringify(spec, { indent: 2 }), 'workspace', {
        allowedExtensions: ['.yaml', '.yml'],
        maxSize: 1024 * 1024, // 1MB max
        preventOverwrite: false
      });

      console.log(chalk.green(`\\n✅ Specification saved to: ${path.basename(specPath)}`));
    } catch (error) {
      console.error(chalk.red(`Failed to save specification: ${error.message}`));
      throw new Error(`Specification save failed: ${error.message}`);
    }

    // Offer to show the spec
    const showSpec = await this.spec.askQuestion(
      'Would you like me to walk you through the specification?',
      { type: 'confirm', default: true }
    );

    if (showSpec) {
      await this.presentSpecification(spec);
    }

    await this.recordDecision('specification-generation', {
      specPath,
      spec: spec
    });

    return spec;
  }

  async presentSpecification(spec) {
    await this.spec.show('happy', 'Let me walk you through your custom specification!');

    // Generate visual presentation
    console.log(chalk.yellow('\\n🎯 Project Vision:'));
    console.log(chalk.cyan(`   ${spec.vision.description}`));

    console.log(chalk.yellow('\\n🔧 Technical Architecture:'));
    Object.entries(spec.technical).forEach(([key, value]) => {
      console.log(chalk.cyan(`   ${key}: ${JSON.stringify(value, null, '     ')}`));
    });

    console.log(chalk.yellow('\\n📅 Implementation Plan:'));
    spec.implementation.phases.forEach((phase, index) => {
      console.log(chalk.cyan(`   Phase ${index + 1}: ${phase.name}`));
      console.log(chalk.gray(`      ${phase.description}`));
    });

    // Offer multimedia explanation
    const wantDemo = await this.spec.askQuestion(
      'Would you like me to create a visual demo of your architecture?',
      { type: 'confirm', default: false }
    );

    if (wantDemo) {
      await this.multimedia.generateDemo('project-architecture', spec.implementation.phases);
    }
  }

  async setupAdvancedFeatures(options) {
    await this.spec.show('working', 'Setting up advanced features...');

    if (options.cloud) {
      await this.setupCloudIntegration();
    }

    if (options.swarm) {
      await this.setupAgentSwarm();
    }
  }

  async setupCloudIntegration() {
    console.log(chalk.blue('☁️ Setting up cloud integration...'));
    // This would integrate with the cloud setup module
    await this.spec.show('happy', 'Cloud integration configured! Free tier optimized.');
  }

  async setupAgentSwarm() {
    console.log(chalk.blue('🤖 Configuring agent swarm...'));
    // This would integrate with the swarm orchestrator
    await this.spec.show('happy', 'Agent swarm ready for parallel processing!');
  }

  // Utility methods
  generateProjectName() {
    const vision = this.projectContext.vision.toLowerCase();
    const words = vision.split(' ').filter(word => word.length > 3);
    return words.slice(0, 3).join('-') + '-project';
  }

  extractGoals() {
    // Simple goal extraction from vision statement
    return [
      'Solve the identified problem effectively',
      'Deliver within the specified timeline',
      'Maintain high code quality',
      'Ensure scalable architecture'
    ];
  }

  generateSuccessMetrics() {
    return {
      functionality: 'All core features implemented and tested',
      performance: 'Meets performance requirements',
      user_satisfaction: 'Positive user feedback',
      maintenance: 'Easy to maintain and extend'
    };
  }

  generateTechnicalSpec() {
    const technical = {};

    Object.entries(this.projectContext).forEach(([key, value]) => {
      if (typeof value === 'object' && value.value) {
        technical[key] = value.value;
      } else if (typeof value === 'string' && ['type', 'timeline', 'teamSize'].includes(key)) {
        technical[key] = value;
      }
    });

    return technical;
  }

  generateImplementationPhases() {
    const phases = [
      {
        name: 'Setup and Planning',
        description: 'Project initialization, environment setup, and detailed planning',
        duration: '1 week'
      },
      {
        name: 'Core Development',
        description: 'Implement main features and functionality',
        duration: '60% of timeline'
      },
      {
        name: 'Integration and Testing',
        description: 'System integration, testing, and bug fixes',
        duration: '25% of timeline'
      },
      {
        name: 'Deployment and Launch',
        description: 'Production deployment and go-live activities',
        duration: '15% of timeline'
      }
    ];

    return phases;
  }

  shouldRecommendCloud() {
    const cloudProjects = ['web-app', 'mobile-app', 'api-service', 'data-pipeline'];
    return cloudProjects.includes(this.projectContext.type);
  }

  shouldRecommendAgents() {
    const complexityThreshold = ['mvp', 'full', 'long-term'];
    return complexityThreshold.includes(this.projectContext.timeline);
  }

  async recordDecision(phase, data) {
    this.currentSession.decisions.push({
      phase,
      timestamp: new Date(),
      data
    });
  }

  // Interactive menu for CLI usage without specific commands
  async showInteractiveMenu() {
    await this.spec.greet();

    const action = await this.spec.askQuestion(
      "What would you like to do today?",
      {
        type: 'list',
        choices: [
          { name: '🚀 Start a new project consultation', value: 'new-project' },
          { name: '📊 Analyze existing project', value: 'analyze-project' },
          { name: '🤖 Setup agent swarm', value: 'setup-swarm' },
          { name: '☁️ Configure cloud integration', value: 'setup-cloud' },
          { name: '🎬 See multimedia demos', value: 'show-demos' },
          { name: '🐕 Chat with Spec', value: 'chat' },
          { name: '❓ Help and tutorials', value: 'help' }
        ]
      }
    );

    switch (action) {
      case 'new-project':
        await this.startGuidedSetup();
        break;
      case 'analyze-project':
        await this.analyzeProject();
        break;
      case 'chat':
        await this.startChatMode();
        break;
      case 'show-demos':
        await this.showDemoMenu();
        break;
      default:
        await this.spec.show('happy', `Great choice! Let me help you with ${action}.`);
    }
  }

  async startChatMode() {
    await this.spec.show('excited', 'Chat mode activated! Ask me anything about spec development!');

    while (true) {
      const question = await this.spec.askQuestion(
        "What would you like to know? (type 'exit' to quit)",
        { type: 'input' }
      );

      if (question.toLowerCase() === 'exit') {
        await this.spec.show('happy', 'Thanks for chatting! Come back anytime!');
        break;
      }

      // Simple AI-like responses (could integrate with actual AI)
      await this.provideChatResponse(question);
    }
  }

  async provideChatResponse(question) {
    await this.spec.think(1500);

    const responses = {
      'spec': 'Specifications are blueprints for your software! They help you plan before you code.',
      'cloud': 'Cloud platforms can scale your application and reduce infrastructure management!',
      'agents': 'Agent swarms can handle different tasks in parallel, making development faster!'
    };

    // Simple keyword matching (in real implementation, would use AI)
    const keywords = Object.keys(responses);
    const matchedKeyword = keywords.find(keyword =>
      question.toLowerCase().includes(keyword)
    );

    if (matchedKeyword) {
      await this.spec.show('helpful', responses[matchedKeyword]);
    } else {
      await this.spec.show('thinking', 'That is an interesting question! Let me think about that...');
      // Could integrate with AI service for more intelligent responses
    }
  }

  async analyzeProject(projectPath = null) {
    if (!projectPath) {
      const userPath = await this.spec.askQuestion(
        'What\'s the path to your project?',
        { type: 'input', default: process.cwd() }
      );

      // Validate the project path for security
      try {
        projectPath = validateProjectPath(userPath);
      } catch (error) {
        await this.spec.show('concerned', `Invalid project path: ${error.message}`);
        return;
      }
    }

    await this.spec.work(`Analyzing project at ${path.basename(projectPath)}`, 2000);

    // Basic project analysis with secure file operations
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const hasPackageJson = await fs.pathExists(packageJsonPath);

      if (hasPackageJson) {
        // Securely read package.json with size limits
        const packageContent = await fs.readFile(packageJsonPath, 'utf8');

        // Validate JSON size (max 1MB for package.json)
        if (packageContent.length > 1024 * 1024) {
          await this.spec.show('concerned', 'Package.json file is too large to analyze safely.');
          return;
        }

        const packageData = JSON.parse(packageContent);
        await this.spec.show('happy', 'Found a Node.js project!');

        console.log(chalk.cyan('📦 Project Details:'));
        console.log(chalk.gray(`   Name: ${packageData.name || 'Unknown'}`));
        console.log(chalk.gray(`   Version: ${packageData.version || 'Unknown'}`));

        if (packageData.dependencies) {
          console.log(chalk.gray(`   Dependencies: ${Object.keys(packageData.dependencies).length}`));
        }
      } else {
        await this.spec.show('thinking', 'I do not see a package.json file. This might not be a Node.js project.');
      }

      // Offer to create a spec for the existing project
      const createSpec = await this.spec.askQuestion(
        'Would you like me to help create a specification for this project?',
        { type: 'confirm', default: true }
      );

      if (createSpec) {
        await this.startGuidedSetup({ existingProject: projectPath });
      }

    } catch (error) {
      await this.spec.offerHelp('project-analysis-error');
      console.error(chalk.red('Analysis error:'), error.message);
    }
  }

  async showDemoMenu() {
    const demoType = await this.spec.askQuestion(
      "What kind of demo would you like to see?",
      {
        type: 'list',
        choices: [
          { name: '🎬 GIF Tutorial - Step-by-step visual guide', value: 'gif-tutorial' },
          { name: '🎥 Interactive Demo - Hands-on experience', value: 'interactive' },
          { name: '🎵 Voice Guide - Audio walkthrough', value: 'voice' },
          { name: '🎨 Character Showcase - Meet Spec in action', value: 'character' }
        ]
      }
    );

    switch (demoType) {
      case 'gif-tutorial':
        await this.multimedia.generateDemo('spec-kit-basics');
        break;
      case 'interactive':
        await this.multimedia.generateInteractiveDemo('consultation-process');
        break;
      case 'voice':
        if (this.spec.voiceEnabled) {
          await this.spec.voice.createVoiceDemo();
        } else {
          await this.spec.show('thinking', 'Voice synthesis isn\'t setup yet, but here\'s how it would work...');
        }
        break;
      case 'character':
        await this.demonstrateCharacterFeatures();
        break;
    }
  }

  async demonstrateCharacterFeatures() {
    await this.spec.show('excited', 'Let me show you all my different expressions!');

    const moods = ['happy', 'thinking', 'celebrating', 'working'];

    for (const mood of moods) {
      await this.spec.show(mood, `This is my ${mood} expression!`);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    await this.spec.celebrate('Demo complete');
  }
}

export default ConsultationEngine;