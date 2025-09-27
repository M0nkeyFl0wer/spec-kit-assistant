#!/usr/bin/env node

import chalk from 'chalk';
import { DogArt } from './src/character/dog-art.js';
import { EnhancedConsultationEngine } from './src/consultation/enhanced-consultation-engine.js';
import { PrototypeGenerator } from './src/prototype/generator.js';

/**
 * 🐕 DOG COMMANDS for Spec Kit Assistant
 * Natural dog training commands that make development fun!
 */

const commands = process.argv.slice(2);
const command = commands[0]?.toLowerCase();
const args = commands.slice(1);

async function main() {
  switch (command) {
    case 'here':
      await hereSpec();
      break;
    case 'sit':
      await sitSpec();
      break;
    case 'fetch':
      await fetchSpec();
      break;
    case 'stay':
      await staySpec();
      break;
    case 'roll':
      await rollSpec();
      break;
    case 'speak':
      await speakSpec();
      break;
    case 'play':
      await playSpec();
      break;
    case 'build':
      await buildSpec();
      break;
    case 'good':
      await goodSpec();
      break;
    case 'treat':
      await treatSpec();
      break;
    default:
      await showCommands();
  }
}

async function hereSpec() {
  console.log(chalk.cyan(DogArt.running || DogArt.happy));
  console.log(chalk.green('🐕 Spec: "Woof! I\'m here! Ready for commands!"'));
  console.log(chalk.yellow('🎯 Available commands: sit, fetch, stay, roll, speak, play, build, good, treat'));
  console.log('');
}

async function sitSpec() {
  console.log(chalk.cyan(DogArt.sitting || DogArt.happy));
  console.log(chalk.blue('🐕 Spec: "Sitting patiently, waiting for your next command..."'));
  console.log(chalk.gray('💭 Spec is ready to listen and help whenever you need!'));
  console.log('');

  if (args.includes('spec') || args.includes('consult')) {
    console.log(chalk.yellow('🎯 Starting consultation while sitting nicely...'));
    const consultation = new EnhancedConsultationEngine();
    await consultation.startProjectDiscovery();
  }
}

async function fetchSpec() {
  const target = args[0] || 'ideas';

  console.log(chalk.cyan(DogArt.detective));
  console.log(chalk.green(`🐕 Spec: "Fetching ${target} for you! *excited tail wagging*"`));
  console.log('');

  switch (target) {
    case 'ideas':
      await fetchIdeas();
      break;
    case 'code':
      await fetchCode();
      break;
    case 'templates':
      await fetchTemplates();
      break;
    case 'examples':
      await fetchExamples();
      break;
    case 'help':
      await fetchHelp();
      break;
    default:
      console.log(chalk.yellow(`🎾 Spec: "I don't know how to fetch '${target}', but I brought you some awesome ideas instead!"`));
      await fetchIdeas();
  }
}

async function fetchIdeas() {
  console.log(chalk.cyan(DogArt.lightbulb || DogArt.thinking));
  console.log(chalk.yellow('💡 Here are some amazing project ideas Spec fetched:'));
  console.log('');

  const ideas = [
    '🌟 Personal productivity dashboard with habit tracking',
    '🎮 Multiplayer drawing game for remote teams',
    '📊 Mood tracker with beautiful data visualizations',
    '🍳 Recipe organizer with smart shopping lists',
    '🎵 Music discovery app based on your daily activities',
    '📝 Voice-to-text note app with AI organization',
    '🌱 Plant care reminder with growth tracking',
    '🎯 Goal setter with achievement celebrations'
  ];

  ideas.forEach((idea, index) => {
    console.log(chalk.cyan(`   ${index + 1}. ${idea}`));
  });

  console.log('');
  console.log(chalk.green('🐕 Spec: "Which one makes your tail wag? Or tell me your own idea!"'));
}

async function fetchCode() {
  console.log(chalk.cyan(DogArt.builder));
  console.log(chalk.blue('🐕 Spec: "Time to fetch some code! Starting prototype generator..."'));
  console.log('');

  try {
    const generator = new PrototypeGenerator();
    await generator.generateFromCurrentSpec();
  } catch (error) {
    console.log(chalk.yellow('🎾 Spec: "Oops! Let me first help you create a spec, then we can fetch code!"'));
    const consultation = new EnhancedConsultationEngine();
    await consultation.startProjectDiscovery();
  }
}

async function fetchTemplates() {
  console.log(chalk.cyan(DogArt.graduate));
  console.log(chalk.blue('🐕 Spec: "Here are some template bones I dug up!"'));
  console.log('');

  const templates = [
    '🌐 React + Express + PostgreSQL (Full Stack)',
    '📱 React Native + Firebase (Mobile)',
    '⚡ Node.js CLI Tool + Commander',
    '🔌 Express REST API + MongoDB',
    '📊 Python Data Pipeline + Pandas',
    '🎮 HTML5 Canvas Game',
    '☁️ Serverless Functions + AWS Lambda',
    '🤖 Discord Bot + Node.js'
  ];

  templates.forEach((template, index) => {
    console.log(chalk.cyan(`   ${index + 1}. ${template}`));
  });

  console.log('');
  console.log(chalk.green('🐕 Spec: "Pick one and I\'ll help you set it up!"'));
}

async function fetchExamples() {
  console.log(chalk.cyan(DogArt.artist));
  console.log(chalk.blue('🐕 Spec: "Here are some inspiring examples I found!"'));
  console.log('');

  console.log(chalk.green('🎯 Simple but Amazing Projects:'));
  console.log(chalk.cyan('   • Todo app with drag & drop (classic but always useful)'));
  console.log(chalk.cyan('   • Weather dashboard with beautiful animations'));
  console.log(chalk.cyan('   • Expense tracker with spending insights'));
  console.log(chalk.cyan('   • Quote generator with social sharing'));
  console.log(chalk.cyan('   • Timer app with focus session tracking'));
  console.log('');
}

async function fetchHelp() {
  console.log(chalk.cyan(DogArt.superhero));
  console.log(chalk.blue('🐕 Spec: "Help is here! Here\'s what I can do:"'));
  console.log('');

  console.log(chalk.yellow('🐕 DOG COMMANDS:'));
  console.log(chalk.cyan('   here spec          - Get Spec\'s attention'));
  console.log(chalk.cyan('   sit spec           - Make Spec wait and listen'));
  console.log(chalk.cyan('   fetch ideas        - Get project ideas'));
  console.log(chalk.cyan('   fetch code         - Generate prototype code'));
  console.log(chalk.cyan('   fetch templates    - Get starter templates'));
  console.log(chalk.cyan('   stay spec          - Keep current project focus'));
  console.log(chalk.cyan('   roll spec          - Get random inspiration'));
  console.log(chalk.cyan('   speak spec         - Start voice mode (if available)'));
  console.log(chalk.cyan('   play spec          - Start fun interactive mode'));
  console.log(chalk.cyan('   build spec         - Generate working prototype'));
  console.log(chalk.cyan('   good spec          - Celebrate and save progress'));
  console.log(chalk.cyan('   treat spec         - Get rewards and achievements'));
  console.log('');
}

async function staySpec() {
  console.log(chalk.cyan(DogArt.detective));
  console.log(chalk.blue('🐕 Spec: "Staying focused on the current project! No side quests!"'));
  console.log('');

  console.log(chalk.yellow('🎯 Current mission: Spec-driven development'));
  console.log(chalk.gray('💭 Spec will keep you on track and return from any distractions'));
  console.log('');

  // Check if there's a current project
  const hasProject = args.includes('project') || process.env.SPEC_CURRENT_PROJECT;
  if (hasProject) {
    console.log(chalk.green('✅ Staying focused on current project'));
  } else {
    console.log(chalk.yellow('🔍 No current project found. Let\'s start one!'));
    const consultation = new EnhancedConsultationEngine();
    await consultation.startProjectDiscovery();
  }
}

async function rollSpec() {
  console.log(chalk.cyan(DogArt.party));
  console.log(chalk.green('🐕 Spec: "Rolling over for random inspiration! *happy spinning*"'));
  console.log('');

  const randomInspiration = [
    '🎨 What if your app had beautiful micro-interactions?',
    '🌙 What if it worked perfectly in dark mode?',
    '📱 What if it was mobile-first from day one?',
    '🎵 What if it had delightful sound effects?',
    '🎮 What if it felt like playing a game?',
    '✨ What if it had magical loading animations?',
    '🚀 What if it was lightning fast?',
    '❤️ What if users fell in love with using it?'
  ];

  const inspiration = randomInspiration[Math.floor(Math.random() * randomInspiration.length)];
  console.log(chalk.yellow(`💫 Random inspiration: ${inspiration}`));
  console.log('');
  console.log(chalk.cyan(DogArt.love));
  console.log(chalk.green('🐕 Spec: "How does that spark new ideas for your project?"'));
}

async function speakSpec() {
  console.log(chalk.cyan(DogArt.musician));
  console.log(chalk.blue('🐕 Spec: "Woof! Woof! Speaking mode activated!"'));
  console.log('');

  console.log(chalk.yellow('🎤 Voice features coming soon:'));
  console.log(chalk.cyan('   • Voice-to-spec conversion'));
  console.log(chalk.cyan('   • Audio explanations of technical concepts'));
  console.log(chalk.cyan('   • Spoken project walkthroughs'));
  console.log('');

  console.log(chalk.green('🐕 Spec: "For now, I\'ll speak through text! What would you like to talk about?"'));
}

async function playSpec() {
  console.log(chalk.cyan(DogArt.gaming));
  console.log(chalk.green('🐕 Spec: "Playtime! Let\'s make development fun!"'));
  console.log('');

  const games = [
    'Spec Guessing Game - I\'ll guess your project type!',
    'Feature Hunt - Find the perfect features for your app!',
    'Tech Stack Builder - Build your stack like LEGO blocks!',
    'Prototype Race - How fast can we build a working demo?'
  ];

  console.log(chalk.yellow('🎮 Choose a game:'));
  games.forEach((game, index) => {
    console.log(chalk.cyan(`   ${index + 1}. ${game}`));
  });
  console.log('');
  console.log(chalk.green('🐕 Spec: "Which game sounds fun? Or shall we start with project discovery?"'));
}

async function buildSpec() {
  console.log(chalk.cyan(DogArt.builder));
  console.log(chalk.blue('🐕 Spec: "Time to build! From spec to working prototype!"'));
  console.log('');

  try {
    const generator = new PrototypeGenerator();
    await generator.specToPrototype();
  } catch (error) {
    console.log(chalk.yellow('🔨 Spec: "Let me first help you create a solid spec, then we\'ll build!"'));
    const consultation = new EnhancedConsultationEngine();
    const spec = await consultation.startProjectDiscovery();

    if (spec) {
      console.log(chalk.green('✅ Spec complete! Now generating prototype...'));
      const generator = new PrototypeGenerator();
      await generator.generateFromSpec(spec);
    }
  }
}

async function goodSpec() {
  console.log(chalk.cyan(DogArt.love));
  console.log(chalk.green('🐕 Spec: "Good human! *happy tail wagging* Thank you for the praise!"'));
  console.log('');

  console.log(chalk.yellow('🏆 Achievement unlocked: Spec Appreciation!'));
  console.log(chalk.cyan('✨ Your kindness gives Spec extra energy for helping!'));
  console.log('');

  // Save progress or celebrate current state
  console.log(chalk.blue('💾 Saving your progress and celebrating your wins!'));
  console.log(chalk.green('🎉 Every step forward is worth celebrating!'));
}

async function treatSpec() {
  console.log(chalk.cyan(DogArt.party));
  console.log(chalk.green('🐕 Spec: "TREATS! *excited jumping* You\'re the best human!"'));
  console.log('');

  const treats = [
    '🍪 Code Quality Cookie - Your code is getting better!',
    '🥇 Specification Medal - You\'ve mastered spec creation!',
    '🚀 Prototype Badge - You\'ve built something amazing!',
    '🎯 Focus Treat - You stayed on track despite side quests!',
    '💝 Kindness Bone - You were patient with the process!',
    '⭐ Star Treat - You\'re becoming a development superstar!'
  ];

  const randomTreat = treats[Math.floor(Math.random() * treats.length)];
  console.log(chalk.yellow(`🎁 You earned: ${randomTreat}`));
  console.log('');
  console.log(chalk.cyan(DogArt.celebrating));
  console.log(chalk.green('🐕 Spec: "Keep up the amazing work! Want to build something new?"'));
}

async function showCommands() {
  console.log(chalk.cyan(DogArt.megaWelcome));
  console.log('');
  console.log(chalk.yellow('🐕 SPEC DOG COMMANDS - Make development fun with natural commands!'));
  console.log('');
  console.log(chalk.green('Basic Commands:'));
  console.log(chalk.cyan('  node dog-commands.js here      - Get Spec\'s attention'));
  console.log(chalk.cyan('  node dog-commands.js sit       - Make Spec wait and listen'));
  console.log(chalk.cyan('  node dog-commands.js stay      - Keep focus on current project'));
  console.log('');
  console.log(chalk.green('Fetch Commands:'));
  console.log(chalk.cyan('  node dog-commands.js fetch ideas     - Get project ideas'));
  console.log(chalk.cyan('  node dog-commands.js fetch code      - Generate prototype'));
  console.log(chalk.cyan('  node dog-commands.js fetch templates - Get starter templates'));
  console.log(chalk.cyan('  node dog-commands.js fetch help      - Get detailed help'));
  console.log('');
  console.log(chalk.green('Fun Commands:'));
  console.log(chalk.cyan('  node dog-commands.js roll      - Get random inspiration'));
  console.log(chalk.cyan('  node dog-commands.js speak     - Voice mode (coming soon)'));
  console.log(chalk.cyan('  node dog-commands.js play      - Interactive games'));
  console.log('');
  console.log(chalk.green('Build Commands:'));
  console.log(chalk.cyan('  node dog-commands.js build     - Generate working prototype'));
  console.log(chalk.cyan('  node dog-commands.js good      - Celebrate progress'));
  console.log(chalk.cyan('  node dog-commands.js treat     - Get rewards and achievements'));
  console.log('');
  console.log(chalk.blue('🎯 Example: node dog-commands.js fetch code'));
  console.log(chalk.gray('💡 Tip: Add "spec" as second argument for context-aware responses'));
}

// Run the command
main().catch(error => {
  console.error(chalk.red('🚨 Woof! Something went wrong:'), error.message);
  console.log(chalk.yellow('🐕 Spec: "Let\'s try a different command! Type: node dog-commands.js help"'));
});