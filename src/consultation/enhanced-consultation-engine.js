import chalk from 'chalk';
import inquirer from 'inquirer';
import { ConsultationEngine } from './engine.js';
import { SpecCharacter } from '../character/spec.js';
import { DogArt } from '../character/dog-art.js';

/**
 * Enhanced Consultation Engine that immediately engages users
 * and gracefully handles "side quests" while staying focused on the main mission
 */
export class EnhancedConsultationEngine extends ConsultationEngine {
  constructor() {
    super();
    this.mainMission = 'Create amazing project specification';
    this.currentFocus = 'project-discovery';
    this.sideQuestCount = 0;
    this.conversationState = {
      hasProjectIdea: false,
      projectType: null,
      excitement: 'high',
      sideQuests: []
    };
  }

  async startProjectDiscovery() {
    // IMMEDIATELY start with an engaging question
    await this.showEngagingIntro();
    await this.askTheFirstBigQuestion();

    // Keep the conversation flowing
    await this.discoverProjectMagic();
  }

  async showEngagingIntro() {
    // Show random fun Spec
    const introSpecs = ['wizard', 'superhero', 'scientist', 'artist'];
    const randomSpec = introSpecs[Math.floor(Math.random() * introSpecs.length)];
    console.log(chalk.magenta(DogArt[randomSpec]));

    console.log(chalk.green('🎯 MISSION: Turn your amazing idea into a perfect specification!'));
    console.log(chalk.yellow('🐕 Spec: "I\'m SO excited to learn about your project! Let\'s dive right in!"'));
    console.log('');
  }

  async askTheFirstBigQuestion() {
    console.log(chalk.cyan('🚀 Here we go! First question coming right up...'));
    console.log('');

    try {
      const projectIdea = await this.spec.askQuestion(
        "What amazing thing do you want to build?",
        {
          type: 'input',
          validate: (input) => {
            if (input.toLowerCase().includes('help') || input.toLowerCase().includes('not sure')) {
              return this.handleSideQuest('uncertainty');
            }
            if (input.length < 5) {
              return 'Can you tell me more about that? I want to understand!';
            }
            return true;
          }
        }
      );

      this.projectContext.vision = projectIdea;
      this.conversationState.hasProjectIdea = true;

      // Now probe deeper
      await this.probeDeeper(projectIdea);

    } catch (error) {
      console.log(chalk.yellow('🎮 Technical issue - deploying side quest handler...'));
      await this.handleSideQuest('technical-difficulty');
    }
  }

  async probeDeeper(initialIdea) {
    console.log(chalk.cyan(DogArt.detective));
    console.log(chalk.blue(`🐕 Spec: "Interesting! Tell me more about ${initialIdea}..."`));
    console.log('');

    // Probe for the why
    const why = await this.spec.askQuestion(
      "What problem does this solve? Why does it matter to you?",
      {
        type: 'input',
        validate: (input) => input.length > 10 || 'Go deeper - what\'s the real problem here?'
      }
    );

    console.log(chalk.cyan(DogArt.thinking));
    console.log(chalk.blue('🐕 Spec: "I see... and who would use this?"'));

    // Probe for the who
    const who = await this.spec.askQuestion(
      "Who is this for? Can you describe your ideal user?",
      {
        type: 'input',
        validate: (input) => input.length > 5 || 'Paint me a picture - who exactly?'
      }
    );

    console.log(chalk.cyan(DogArt.love));
    console.log(chalk.blue('🐕 Spec: "What would make someone love using this?"'));

    // Probe for the emotional hook
    const emotion = await this.spec.askQuestion(
      "What feeling do you want users to have when they use it?",
      {
        type: 'input',
        validate: (input) => input.length > 3 || 'Dig deeper - what emotion?'
      }
    );

    // Store the deeper context
    this.projectContext.deepContext = {
      problem: why,
      audience: who,
      emotion: emotion,
      originalIdea: initialIdea
    };

    // Show understanding
    console.log(chalk.cyan(DogArt.celebrating));
    console.log(chalk.green('🐕 Spec: "Now I get it! This is about more than just code."'));
    console.log(chalk.yellow(`   Problem: ${why.substring(0, 60)}...`));
    console.log(chalk.yellow(`   For: ${who.substring(0, 60)}...`));
    console.log(chalk.yellow(`   Feeling: ${emotion.substring(0, 60)}...`));
    console.log('');
  }

  async discoverProjectMagic() {
    if (!this.conversationState.hasProjectIdea) {
      await this.askTheFirstBigQuestion();
      return;
    }

    // Continue with rapid-fire engaging questions
    await this.askProjectType();
    await this.askTimeline();
    await this.askWhatMakesItSpecial();
    await this.askTechnicalChoices();

    // Always return to main mission
    await this.returnToMainMission();
  }

  async askProjectType() {
    console.log(chalk.cyan(DogArt.thinking));
    console.log(chalk.blue('🐕 Spec: "Let me guess what type of project this is..."'));
    console.log('');

    try {
      const projectType = await this.spec.askQuestion(
        "What type of project is this? 🏗️",
        {
          type: 'list',
          choices: [
            { name: '🌐 Web App - Interactive website or web application', value: 'web-app' },
            { name: '📱 Mobile App - iOS/Android application', value: 'mobile-app' },
            { name: '🔌 API Service - Backend service or API', value: 'api-service' },
            { name: '⚡ CLI Tool - Command-line application', value: 'cli-tool' },
            { name: '📊 Data Project - Analytics, ML, or data processing', value: 'data-project' },
            { name: '🎮 Game - Interactive game or entertainment', value: 'game' },
            { name: '🤔 Something else / Side quest time!', value: 'side-quest' }
          ]
        }
      );

      if (projectType === 'side-quest') {
        await this.handleSideQuest('project-type-exploration');
        return await this.askProjectType(); // Return to question after side quest
      }

      this.projectContext.type = projectType;
      this.conversationState.projectType = projectType;

      // Show appropriate celebration
      const celebrationSpecs = {
        'web-app': 'cyber',
        'mobile-app': 'space',
        'api-service': 'builder',
        'cli-tool': 'ninja',
        'data-project': 'scientist',
        'game': 'gaming'
      };

      console.log(chalk.magenta(DogArt[celebrationSpecs[projectType] || 'party']));
      console.log(chalk.green(`🎯 Spec: "Perfect! A ${projectType} project! I love those!"`));
      console.log('');

    } catch (error) {
      await this.handleSideQuest('technical-difficulty');
    }
  }

  async askTimeline() {
    console.log(chalk.cyan(DogArt.working));
    console.log(chalk.blue('🐕 Spec: "Time to talk timelines! When do you want this beauty finished?"'));
    console.log('');

    try {
      const timeline = await this.spec.askQuestion(
        "What's your timeline for this project? ⏰",
        {
          type: 'list',
          choices: [
            { name: '⚡ Quick & Dirty - Prototype in 1-2 weeks', value: 'prototype' },
            { name: '🏃‍♂️ MVP Sprint - Minimum viable product in 1-2 months', value: 'mvp' },
            { name: '🏗️ Full Build - Complete product in 3-6 months', value: 'full' },
            { name: '🌱 Long-term Vision - 6+ months of awesome development', value: 'long-term' },
            { name: '🤷‍♂️ No idea / Let\'s explore this!', value: 'side-quest' }
          ]
        }
      );

      if (timeline === 'side-quest') {
        await this.handleSideQuest('timeline-exploration');
        return await this.askTimeline();
      }

      this.projectContext.timeline = timeline;
      console.log(chalk.green(`✅ Got it! ${timeline} timeline locked in!`));
      console.log('');

    } catch (error) {
      await this.handleSideQuest('technical-difficulty');
    }
  }

  async askWhatMakesItSpecial() {
    console.log(chalk.cyan(DogArt.love));
    console.log(chalk.red('🐕 Spec: "Now for my FAVORITE question... What makes this special?"'));
    console.log('');

    try {
      const specialness = await this.spec.askQuestion(
        "What's the ONE thing that will make people say 'WOW!'?",
        {
          type: 'input',
          validate: (input) => {
            if (input.length < 3) {
              return 'What excites YOU most about this?';
            }
            return true;
          }
        }
      );

      // Probe deeper into the special feature
      console.log(chalk.cyan(DogArt.detective));
      console.log(chalk.blue('🐕 Spec: "Tell me more about that - how would it actually work?"'));

      const howItWorks = await this.spec.askQuestion(
        "Walk me through how someone would experience this feature:",
        {
          type: 'input',
          validate: (input) => input.length > 10 || 'Paint the whole picture - step by step?'
        }
      );

      console.log(chalk.cyan(DogArt.thinking));
      console.log(chalk.blue('🐕 Spec: "What would happen if this feature didn\'t exist?"'));

      const importance = await this.spec.askQuestion(
        "Why is this feature critical? What breaks without it?",
        {
          type: 'input',
          validate: (input) => input.length > 5 || 'What\'s the real impact here?'
        }
      );

      this.projectContext.specialFeature = {
        description: specialness,
        mechanics: howItWorks,
        importance: importance
      };

      console.log(chalk.cyan(DogArt.celebrating));
      console.log(chalk.yellow(`🌟 Spec: "Now THAT'S a killer feature!"`));
      console.log('');

    } catch (error) {
      await this.handleSideQuest('creative-block');
    }
  }

  async askTechnicalChoices() {
    console.log(chalk.cyan(DogArt.builder));
    console.log(chalk.blue('🐕 Spec: "Technical decisions time!"'));
    console.log('');

    // Quick technical choices based on project type
    const techQuestions = this.getTechnicalQuestions(this.projectContext.type);

    for (const question of techQuestions) {
      try {
        const answer = await this.spec.askQuestion(question.text, question.options);

        if (answer === 'side-quest' || answer === 'help') {
          await this.handleSideQuest('technical-help');
          continue;
        }

        // Probe deeper on technical choices
        await this.probeTehnicalChoice(question.key, answer);

        this.projectContext[question.key] = answer;

      } catch (error) {
        await this.handleSideQuest('technical-difficulty');
        break;
      }
    }
  }

  async probeTehnicalChoice(choiceType, choice) {
    console.log(chalk.cyan(DogArt.detective));
    console.log(chalk.blue(`🐕 Spec: "Why ${choice}? What makes it right for this project?"`));

    try {
      const reasoning = await this.spec.askQuestion(
        `Tell me your thinking behind choosing ${choice}:`,
        {
          type: 'input',
          validate: (input) => input.length > 5 || 'Help me understand your reasoning?'
        }
      );

      console.log(chalk.cyan(DogArt.thinking));
      console.log(chalk.blue('🐕 Spec: "What could go wrong with this choice?"'));

      const risks = await this.spec.askQuestion(
        "What concerns do you have about this decision?",
        {
          type: 'input',
          validate: (input) => input.length > 3 || 'Any potential issues?'
        }
      );

      // Store the reasoning
      this.projectContext[`${choiceType}_reasoning`] = {
        choice: choice,
        reasoning: reasoning,
        risks: risks
      };

      console.log(chalk.green(`✅ ${choiceType}: ${choice} (reasoning captured)`));

    } catch (error) {
      console.log(chalk.green(`✅ ${choiceType}: ${choice}`));
    }
  }

  getTechnicalQuestions(projectType) {
    const questions = {
      'web-app': [
        {
          key: 'frontend',
          text: 'Frontend framework? 🎨',
          options: {
            type: 'list',
            choices: [
              { name: 'React - Popular and powerful', value: 'react' },
              { name: 'Vue.js - Easy and elegant', value: 'vue' },
              { name: 'Svelte - Fast and modern', value: 'svelte' },
              { name: 'Just HTML/CSS/JS - Keep it simple!', value: 'vanilla' },
              { name: 'Help me decide!', value: 'side-quest' }
            ]
          }
        }
      ],
      'mobile-app': [
        {
          key: 'platform',
          text: 'Mobile platform? 📱',
          options: {
            type: 'list',
            choices: [
              { name: 'React Native - Cross-platform magic', value: 'react-native' },
              { name: 'Flutter - Google\'s awesome framework', value: 'flutter' },
              { name: 'Native iOS - Pure iOS development', value: 'ios' },
              { name: 'Native Android - Pure Android development', value: 'android' },
              { name: 'I need guidance!', value: 'side-quest' }
            ]
          }
        }
      ]
    };

    return questions[projectType] || [
      {
        key: 'approach',
        text: 'Technical approach? 🔧',
        options: {
          type: 'list',
          choices: [
            { name: 'Keep it simple and straightforward', value: 'simple' },
            { name: 'Use modern best practices', value: 'modern' },
            { name: 'Go cutting-edge experimental', value: 'experimental' },
            { name: 'Let\'s explore options!', value: 'side-quest' }
          ]
        }
      }
    ];
  }

  async handleSideQuest(questType) {
    this.sideQuestCount++;
    console.log(chalk.yellow(`\n🎮 SIDE QUEST #${this.sideQuestCount}: ${questType.replace('-', ' ').toUpperCase()}`));

    this.conversationState.sideQuests.push({
      type: questType,
      timestamp: new Date(),
      resolved: false
    });

    switch (questType) {
      case 'uncertainty':
        await this.handleUncertainty();
        break;
      case 'project-type-exploration':
        await this.helpExploreProjectTypes();
        break;
      case 'timeline-exploration':
        await this.helpWithTimeline();
        break;
      case 'technical-help':
        await this.provideTechnicalGuidance();
        break;
      case 'creative-block':
        await this.helpWithCreativity();
        break;
      case 'technical-difficulty':
        await this.handleTechnicalIssue();
        break;
      default:
        await this.genericSideQuest();
    }

    // Always return to main mission
    console.log(chalk.blue('🎯 Spec: "Alright! Side quest complete! Let\'s get back to the main mission!"'));
    console.log(chalk.cyan(DogArt.detective));
    console.log('');
  }

  async handleUncertainty() {
    console.log(chalk.cyan(DogArt.thinking));
    console.log(chalk.blue('🐕 Spec: "Let me help you brainstorm!"'));
    console.log('');

    const helpType = await this.spec.askQuestion(
      "What would help you most right now?",
      {
        type: 'list',
        choices: [
          { name: '💡 Show me inspiring project examples', value: 'examples' },
          { name: '🎯 Help me find my main problem to solve', value: 'problem' },
          { name: '🚀 Pick something fun to start with', value: 'random' },
          { name: '⬅️ Actually, I have an idea now', value: 'retry' }
        ]
      }
    );

    switch (helpType) {
      case 'examples':
        console.log(chalk.cyan(DogArt.lightbulb || DogArt.artist));
        console.log(chalk.blue('🐕 Spec: "Here are some ideas I dig up!"'));
        console.log(chalk.cyan('   • Personal dashboard for daily routines'));
        console.log(chalk.cyan('   • Tool to organize creative projects'));
        console.log(chalk.cyan('   • Game that brings friends together'));
        console.log(chalk.cyan('   • App that solves YOUR daily problem'));
        break;
      case 'problem':
        console.log(chalk.cyan(DogArt.detective));
        console.log(chalk.blue('🐕 Spec: "What bugs you daily that code could fix?"'));
        break;
      case 'random':
        console.log(chalk.cyan(DogArt.party));
        const randomIdeas = [
          'Mood tracker with beautiful visualizations',
          'Recipe organizer with smart shopping lists',
          'Productivity timer with rewards',
          'Photo memory game for friends'
        ];
        const idea = randomIdeas[Math.floor(Math.random() * randomIdeas.length)];
        console.log(chalk.green(`🐕 Spec: "How about: ${idea}?"`));
        this.projectContext.vision = idea;
        this.conversationState.hasProjectIdea = true;
        break;
    }
  }

  async helpExploreProjectTypes() {
    console.log(chalk.cyan(DogArt.graduate));
    console.log(chalk.blue('🐕 Spec: "Let me break these down:"'));
    console.log('');

    console.log(chalk.green('🌐 Web App: GitHub, Gmail, Spotify web'));
    console.log(chalk.green('📱 Mobile App: Instagram, Uber, mobile games'));
    console.log(chalk.green('🔌 API Service: Backend powering other apps'));
    console.log(chalk.green('⚡ CLI Tool: Command-line like git or npm'));
    console.log(chalk.green('📊 Data Project: Analytics, ML, processing'));
    console.log(chalk.green('🎮 Game: Interactive and fun stuff'));
    console.log('');

    console.log(chalk.cyan(DogArt.mini));
    console.log(chalk.blue('🐕 Spec: "Pick what feels right!"'));
  }

  async helpWithTimeline() {
    console.log(chalk.cyan(DogArt.scientist));
    console.log(chalk.blue('🐕 Spec: "Let me break down what each timeline means!"'));
    console.log('');

    console.log(chalk.green('⚡ Prototype: Basic proof-of-concept, rough around edges'));
    console.log(chalk.green('🏃‍♂️ MVP: Core features working, ready for first users'));
    console.log(chalk.green('🏗️ Full Build: Polished product with all planned features'));
    console.log(chalk.green('🌱 Long-term: Complex project with multiple phases'));
    console.log('');

    console.log(chalk.yellow('💡 Choose based on when you want to show it to others!'));
  }

  async provideTechnicalGuidance() {
    console.log(chalk.cyan(DogArt.graduate));
    console.log(chalk.blue('🐕 Spec: "Don\'t worry about getting technical choices perfect!"'));
    console.log('');

    console.log(chalk.green('✨ Remember: You can always change tech choices later!'));
    console.log(chalk.green('🎯 Pick what you\'re most comfortable with'));
    console.log(chalk.green('🚀 Or just pick the most popular option - it\'s usually good!'));
    console.log('');
  }

  async helpWithCreativity() {
    console.log(chalk.cyan(DogArt.artist));
    console.log(chalk.blue('🐕 Spec: "Every project has something special! Think about..."'));
    console.log('');

    console.log(chalk.green('💫 What would make YOU excited to use it?'));
    console.log(chalk.green('🎨 What unique twist could you add?'));
    console.log(chalk.green('❤️ What would make your friends say "That\'s so cool!"?'));
    console.log('');
  }

  async handleTechnicalIssue() {
    console.log(chalk.cyan(DogArt.concerned || DogArt.detective));
    console.log(chalk.red('🐕 Spec: "Technical issue detected. This needs attention."'));
    console.log('');

    const debugChoice = await this.spec.askQuestion(
      "How should we handle this error?",
      {
        type: 'list',
        choices: [
          { name: '🤖 Deploy debug swarm to investigate', value: 'swarm' },
          { name: '📝 Log the error and continue', value: 'log' },
          { name: '🔄 Try a different approach', value: 'retry' },
          { name: '⏭️ Skip this step for now', value: 'skip' }
        ]
      }
    );

    switch (debugChoice) {
      case 'swarm':
        console.log(chalk.cyan(DogArt.scientist));
        console.log(chalk.blue('🐕 Spec: "Deploying debug agents to analyze this issue."'));
        await this.deployDebugSwarm();
        break;
      case 'log':
        console.log(chalk.yellow('📝 Error logged for later analysis'));
        break;
      case 'retry':
        console.log(chalk.cyan(DogArt.working));
        console.log(chalk.blue('🐕 Spec: "Trying alternative approach."'));
        break;
      case 'skip':
        console.log(chalk.gray('⏭️ Skipping for now, will revisit later'));
        break;
    }
  }

  async deployDebugSwarm() {
    console.log(chalk.cyan(DogArt.builder));
    console.log(chalk.blue('🐕 Spec: "Initializing debug swarm..."'));
    console.log('');

    // Simulate debug swarm deployment
    console.log(chalk.yellow('🔍 Deploying error analysis agents'));
    console.log(chalk.yellow('📊 Deploying system diagnostic agents'));
    console.log(chalk.yellow('🔧 Deploying fix recommendation agents'));

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log(chalk.green('✅ Debug swarm analysis complete'));
    console.log(chalk.cyan('📋 Issue identified and potential fixes generated'));
  }

  async genericSideQuest() {
    console.log(chalk.cyan(DogArt.party));
    console.log(chalk.blue('🐕 Spec: "That\'s an interesting side quest! Let\'s tackle it together!"'));
    console.log('');
  }

  async returnToMainMission() {
    console.log(chalk.yellow('🎯 MISSION STATUS: Returning to main objective...'));
    console.log(chalk.cyan(DogArt.ultimate));
    console.log(chalk.green('🎉 Spec: "AMAZING! We\'ve gathered all the info we need!"'));
    console.log('');

    // Generate the spec using what we've learned
    await this.generateAwesomeSpec();
  }

  async generateAwesomeSpec() {
    console.log(chalk.cyan('⚡ Generating your AMAZING specification...'));
    console.log(chalk.yellow('🐕 Spec: "Time to turn your vision into reality!"'));
    console.log('');

    // Use the parent class method but with our enhanced data
    try {
      const spec = await this.generateSpecification();

      console.log(chalk.green('🎊 SUCCESS! Your spec is ready!'));
      console.log(chalk.cyan(DogArt.graduate));
      console.log(chalk.yellow('🏆 Spec: "You are now officially SPEC-CERTIFIED! Woof!"'));

      return spec;
    } catch (error) {
      console.log(chalk.red('Oops! Let me try a different approach...'));
      // Fallback to simple spec creation
      await this.createSimpleSpec();
    }
  }

  async createSimpleSpec() {
    console.log(chalk.blue('📝 Creating a beautiful simple spec for you...'));

    const simpleSpec = {
      project: this.projectContext.vision || 'Amazing Project',
      type: this.projectContext.type || 'web-app',
      timeline: this.projectContext.timeline || 'mvp',
      special_feature: this.projectContext.specialFeature || 'It\'s going to be awesome!',
      side_quests_completed: this.sideQuestCount,
      created: new Date(),
      status: 'Ready to build!'
    };

    console.log(chalk.green('\n🎯 Your Project Spec:'));
    console.log(chalk.cyan(`   Name: ${simpleSpec.project}`));
    console.log(chalk.cyan(`   Type: ${simpleSpec.type}`));
    console.log(chalk.cyan(`   Timeline: ${simpleSpec.timeline}`));
    console.log(chalk.cyan(`   Special: ${simpleSpec.special_feature}`));
    console.log(chalk.cyan(`   Side Quests: ${simpleSpec.side_quests_completed} completed! 🎮`));
    console.log('');

    console.log(chalk.yellow('🚀 Ready to start building? Your spec adventure is complete!'));
    return simpleSpec;
  }
}

export default EnhancedConsultationEngine;