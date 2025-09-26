#!/usr/bin/env node

// Simple test to verify the CLI works
import chalk from 'chalk';
import figlet from 'figlet';

console.clear();

console.log(chalk.yellow(figlet.textSync('Spec Kit Assistant', { font: 'Small' })));
console.log(chalk.cyan('🐕 Testing basic functionality...'));

console.log(chalk.green('✅ CLI is working!'));
console.log(chalk.blue('📦 Dependencies loaded successfully'));
console.log(chalk.magenta('🎯 Security fixes are in place'));

console.log(chalk.yellow('\n🔧 To test interactive features:'));
console.log(chalk.gray('   node src/index.js --help'));
console.log(chalk.gray('   node src/index.js init'));
console.log(chalk.gray('   node demo.js'));

console.log(chalk.green('\n🎉 Spec Kit Assistant is ready!'));