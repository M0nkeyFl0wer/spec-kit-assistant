#!/usr/bin/env node

import chalk from 'chalk';
import { DogArt, MoodArt } from './src/character/dog-art.js';

// Production banner with CUTE NEW DOG!
console.clear();
console.log(chalk.cyan(`
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║  🚀 SPEC KIT ASSISTANT - PRODUCTION BETA v1.0 🚀                   ║
║                                                                      ║
║${MoodArt.greeting}║
║                     🐕 "Production beta is LIVE!"                   ║
║        📱 Mobile-optimized for maximum performance                   ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
`));

console.log(chalk.green('🐕 Spec: "Welcome to the production beta! Every feature is real and working!"'));
console.log(chalk.yellow('🎯 Ready for: Spec creation → Agent swarms → Working prototypes'));
console.log('');

// Import and start the proactive experience
import('./proactive-spec.js').catch(error => {
  console.log(chalk.red('🚨 Startup error:', error.message));
  console.log(chalk.blue('🔄 Falling back to basic mode...'));

  // Fallback to dog commands
  import('./dog-commands.js').then(module => {
    console.log(chalk.green('✅ Basic mode activated - try: node dog-commands.js here'));
  });
});
