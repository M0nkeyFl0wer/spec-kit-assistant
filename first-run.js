#!/usr/bin/env node

import chalk from 'chalk';
import figlet from 'figlet';
import { SpecCharacter } from './src/character/spec.js';
import { ConsultationEngine } from './src/consultation/engine.js';
import { NonInteractiveConsultationEngine } from './src/consultation/non-interactive-engine.js';
import { DogArt } from './src/character/dog-art.js';
import { EnhancedConsultationEngine } from './src/consultation/enhanced-consultation-engine.js';

/**
 * First-run experience for spec-kit-assistant
 * Handles environment detection and provides graceful fallbacks
 */

async function detectEnvironment() {
  const isInteractive = process.stdin.isTTY && process.stdout.isTTY;
  const hasInquirer = process.env.TERM && process.env.TERM !== 'dumb';
  const isCI = process.env.CI || process.env.GITHUB_ACTIONS || process.env.JENKINS_URL;

  return {
    isInteractive: isInteractive && hasInquirer && !isCI,
    isCI,
    terminalType: process.env.TERM || 'unknown'
  };
}

async function showWelcome() {
  // Clear screen for maximum impact
  console.clear();

  // Show the MEGA WELCOME screen
  console.log(chalk.cyan(DogArt.megaWelcome));

  console.log('');
  console.log(chalk.yellow('🎉 Welcome to the most FUN and AMAZING spec creation experience!'));
  console.log(chalk.gray('Spec the Golden Retriever will guide you through building perfect software specs'));
  console.log('');

  // Random fun Spec to start
  const welcomeSpecs = ['space', 'rainbow', 'party', 'ultimate'];
  const randomSpec = welcomeSpecs[Math.floor(Math.random() * welcomeSpecs.length)];
  console.log(chalk.magenta(DogArt[randomSpec]));

  console.log('');
  console.log(chalk.green('🐕 Spec says: "Woof! Ready to build something AMAZING together? Let\'s create magic!" 🎆'));
  console.log('');
}

async function runInteractiveMode() {
  // Jump RIGHT into the questions - no delays!
  console.log(chalk.green('🚀 Let\'s jump right into building your project spec!'));
  console.log(chalk.yellow('🐕 Spec is ready to learn about your amazing project idea...'));
  console.log('');

  // Show a fun working Spec
  console.log(chalk.cyan(DogArt.detective));
  console.log(chalk.blue('🔍 Spec says: "I\'m here to help turn your ideas into perfect specifications!"'));
  console.log(chalk.gray('💡 Pro tip: If we go on side quests, I\'ll always bring us back to the main mission!'));
  console.log('');

  try {
    // Create enhanced consultation that handles side quests
    const consultation = new EnhancedConsultationEngine();
    await consultation.startProjectDiscovery();
  } catch (error) {
    if (error.code === 'ERR_USE_AFTER_CLOSE' || error.message.includes('readline')) {
      console.log(chalk.yellow('⚠️  Interactive mode needs a different approach here...'));
      console.log(chalk.cyan('🔄 Switching to guided adventure mode!'));
      await runGuidedMode();
    } else {
      console.error(chalk.red('❌ Interactive mode encountered an issue:'), error.message);
      console.log(chalk.cyan('🔄 No worries! Let\'s try guided mode...'));
      await runGuidedMode();
    }
  }
}

async function runGuidedMode() {
  console.log(chalk.cyan('🤖 Starting guided specification generation...'));
  console.log(chalk.gray('Perfect for getting started quickly!'));
  console.log('');

  // Show project type options
  console.log(chalk.yellow('📋 Available Project Templates:'));
  console.log(chalk.cyan('   1. 🌐 Web Application (React, API, Database)'));
  console.log(chalk.cyan('   2. 📱 Mobile App (React Native, Cross-platform)'));
  console.log(chalk.cyan('   3. 🔌 API Service (REST/GraphQL Backend)'));
  console.log(chalk.cyan('   4. ⚡ CLI Tool (Command-line Application)'));
  console.log(chalk.cyan('   5. 📊 Data Pipeline (ETL, Processing)'));
  console.log('');

  console.log(chalk.yellow('🎯 To customize your project, edit the generated spec.yaml file'));
  console.log(chalk.gray('   Or use: node src/index.js consult --project ./'));
  console.log('');

  try {
    // Generate with intelligent defaults
    const consultation = new NonInteractiveConsultationEngine({
      template: 'web-app', // Most common starting point
      timeline: 'mvp',
      teamSize: 'solo',
      experienceLevel: 'intermediate',
      verbose: true
    });

    const spec = await consultation.startGuidedSetup({
      vision: 'Create an amazing project with guided development',
      type: 'web-app'
    });

    console.log(chalk.green('\n🎉 Success! Your specification has been generated!'));
    console.log(chalk.yellow('\n🚀 Next Steps:'));
    console.log(chalk.cyan('   1. Review and edit spec.yaml to customize your project'));
    console.log(chalk.cyan('   2. Run: node src/index.js swarm --deploy (for agent assistance)'));
    console.log(chalk.cyan('   3. Run: ./retro-spec.sh (for the full retro experience)'));
    console.log(chalk.cyan('   4. Check out the generated implementation phases'));

    return spec;
  } catch (error) {
    console.error(chalk.red('❌ Guided mode failed:'), error.message);
    console.log(chalk.yellow('\n📖 Manual Setup Available:'));
    console.log(chalk.cyan('   - Run: node src/index.js --help'));
    console.log(chalk.cyan('   - Check: ./README.md for documentation'));
    console.log(chalk.cyan('   - Try: ./retro-spec.sh for ASCII experience'));
  }
}

async function showQuickCommands() {
  console.log(chalk.yellow('\n💡 Quick Commands to Remember:'));
  console.log(chalk.cyan('   spec ramble           - Conversational spec creation'));
  console.log(chalk.cyan('   spec swarm            - Deploy agent swarms'));
  console.log(chalk.cyan('   spec matrix           - Enter the Matrix mode'));
  console.log(chalk.cyan('   node src/index.js     - Full CLI interface'));
  console.log('');

  console.log(chalk.gray('🔗 Add to ~/.bashrc for global access:'));
  console.log(chalk.gray(`   alias spec='${process.cwd()}/retro-spec.sh'`));
  console.log('');
}

async function main() {
  const env = await detectEnvironment();

  await showWelcome();

  if (env.isCI) {
    console.log(chalk.blue('🤖 CI/CD environment detected - running in automated mode'));
    await runGuidedMode();
  } else if (env.isInteractive) {
    console.log(chalk.green('🎮 Interactive terminal detected - starting full experience!'));
    await runInteractiveMode();
  } else {
    console.log(chalk.yellow('📟 Limited terminal detected - using guided mode'));
    console.log(chalk.gray(`   Terminal: ${env.terminalType}`));
    await runGuidedMode();
  }

  await showQuickCommands();

  console.log(chalk.green('🐕 Spec says: Welcome to the spec-driven development family! Woof! 🎉'));
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n👋 Thanks for trying Spec Kit Assistant!'));
  console.log(chalk.cyan('   Run again anytime with: node first-run.js'));
  process.exit(0);
});

// Run the first-run experience
main().catch((error) => {
  console.error(chalk.red('\n❌ First-run experience failed:'), error.message);
  console.log(chalk.yellow('\n🔧 Troubleshooting:'));
  console.log(chalk.cyan('   1. Check Node.js version: node --version (need 18+)'));
  console.log(chalk.cyan('   2. Install dependencies: npm install'));
  console.log(chalk.cyan('   3. Check permissions: ls -la'));
  console.log(chalk.cyan('   4. Try manual mode: node src/index.js --help'));
  process.exit(1);
});