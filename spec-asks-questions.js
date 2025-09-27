#!/usr/bin/env node
/**
 * Spec Asks Questions - Cute ASCII consultation for Ultimate Toolkit
 */

import chalk from 'chalk';

// Cute ASCII art for Spec
const specArt = {
  excited: `
${chalk.yellow('      /^-----^\\')}
     ${chalk.yellow('( ★     ★ )')}
      ${chalk.yellow('\\   ∪∪∪   /')}  ${chalk.rainbow('WOOF! So excited!')}
       ${chalk.gray('\\   ---   /')}
        ${chalk.gray('^^^  ^^^  ^^^')}  ${chalk.dim('*tail wagging intensely*')}
  `,

  curious: `
${chalk.yellow('      /^-----^\\')}
     ${chalk.yellow('( ◔     ◔ )')}
      ${chalk.yellow('\\    ?    /')}  ${chalk.cyan('Hmm, tell me more...')}
       ${chalk.gray('\\   ---   /')}
        ${chalk.gray('^^^     ^^^')}  ${chalk.dim('*ears perked up*')}
  `,

  thinking: `
${chalk.yellow('      /^-----^\\')}
     ${chalk.yellow('( •  …  • )')}
      ${chalk.yellow('\\  ≋≋≋≋≋  /')}  ${chalk.blue('Processing... 🧠')}
       ${chalk.gray('\\   ---   /')}
        ${chalk.gray('^^^     ^^^')}  ${chalk.dim('*thinking deeply*')}
  `,

  happy: `
${chalk.yellow('      /^-----^\\')}
     ${chalk.yellow('( ◕     ◕ )')}
      ${chalk.yellow('\\  ^___^  /')}  ${chalk.green('Perfect! Love it!')}
       ${chalk.gray('\\   ---   /')}
        ${chalk.gray('^^^     ^^^')}  ${chalk.dim('*happy panting*')}
  `,

  listening: `
${chalk.yellow('      /^-----^\\')}
     ${chalk.yellow('( ◕  ◡  ◕ )')}
      ${chalk.yellow('\\    o    /')}  ${chalk.magenta('I am all ears!')}
       ${chalk.gray('\\   ---   /')}
        ${chalk.gray('^^^     ^^^')}  ${chalk.dim('*attentive listening*')}
  `,

  celebration: `
${chalk.rainbow('      /^-----^\\')}
     ${chalk.rainbow('( ★  ✨  ★ )')}
      ${chalk.rainbow('\\   ∪∪∪   /')}  ${chalk.bold.green('PAWSOME! 🎉')}
       ${chalk.gray('\\   ---   /')}
        ${chalk.rainbow('^^^  ^^^  ^^^')}  ${chalk.bold('*victory dance*')}

    ${chalk.yellow('🎉')} ${chalk.green('✨')} ${chalk.blue('🐕')} ${chalk.green('✨')} ${chalk.yellow('🎉')}
    ${chalk.magenta('🌟')} ${chalk.cyan('🎊')} ${chalk.red('🐾')} ${chalk.cyan('🎊')} ${chalk.magenta('🌟')}
    ${chalk.blue('⭐')} ${chalk.yellow('🎈')} ${chalk.gray('🦴')} ${chalk.yellow('🎈')} ${chalk.blue('⭐')}
  `,

  question: `
${chalk.yellow('      /^-----^\\')}
     ${chalk.yellow('( ◕  ?  ◕ )')}
      ${chalk.yellow('\\    ❓    /')}  ${chalk.blue('Question time!')}
       ${chalk.gray('\\   ---   /')}
        ${chalk.gray('^^^     ^^^')}  ${chalk.dim('*inquisitive tilt*')}
  `
};

// Helper function for rainbow text
chalk.rainbow = (text) => {
  const colors = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'];
  return text.split('').map((char, i) =>
    chalk[colors[i % colors.length]](char)
  ).join('');
};

console.clear();
console.log(chalk.bold.blue('🐕 Spec Kit Assistant - Ultimate Toolkit Consultation'));
console.log(chalk.gray('Lets build your comprehensive agent swarm ecosystem together!'));

console.log(specArt.excited);

console.log(chalk.cyan('Hey there, amazing human! 🎉 I am Spec, and I am BOUNCING with excitement!'));
console.log(chalk.cyan('You want to build the ULTIMATE TOOLKIT - that is like... the biggest project EVER!'));
console.log(chalk.cyan('But dont worry, we will figure this out together, one question at a time! 🐾'));

console.log('\\n' + '='.repeat(80) + '\\n');

console.log(specArt.question);

console.log(chalk.bold.yellow('🎯 SPEC\\'S FIRST BIG QUESTION:'));
console.log(chalk.white('You mentioned 8 different swarm types:'));
console.log('  🔍 Research & Intelligence');
console.log('  📝 Content Creation & Publishing');
console.log('  📊 Data Science & Analytics');
console.log('  🎬 Video Production & Editing');
console.log('  🛡️ Red Team & Security Testing');
console.log('  🐛 Debugging & Code Analysis');
console.log('  🚀 Rapid Prototyping');
console.log('  💡 Ideation & Innovation');

console.log(specArt.curious);

console.log(chalk.bold.magenta('Which one makes you go "OMG I NEED THIS NOW!" ? 🤔'));
console.log(chalk.gray('(What is your biggest pain point that keeps you up at night?)'));

console.log('\\n' + '-'.repeat(40) + '\\n');

console.log(specArt.thinking);

console.log(chalk.bold.yellow('🧠 SPEC\\'S ARCHITECTURE QUESTION:'));
console.log(chalk.white('You said "preloaded in Claude" - my doggy brain is imagining:'));
console.log('');
console.log(chalk.green('  A) 🔌 Claude Code Extension') + chalk.gray(' (auto-loads when you start Claude)'));
console.log(chalk.blue('  B) 📄 Claude.md Integration') + chalk.gray(' (available in every project)'));
console.log(chalk.cyan('  C) 🛠️  Standalone Toolkit') + chalk.gray(' (works alongside Claude Code)'));
console.log(chalk.magenta('  D) 🌟 Something Even Cooler') + chalk.gray(' (tell me your wild ideas!)'));

console.log(specArt.listening);

console.log(chalk.bold.blue('What is your vision? How do you want to access these swarms? 🎪'));

console.log('\\n' + '-'.repeat(40) + '\\n');

console.log(specArt.celebration);

console.log(chalk.bold.yellow('🎯 SPEC\\'S SUCCESS QUESTION:'));
console.log(chalk.white('Picture this: 6 months from now, you are using the Ultimate Toolkit...'));

console.log(chalk.bold.rainbow('What would make you jump up and shout "YES! THIS IS EXACTLY WHAT I NEEDED!" ? 🎉'));
console.log('');
console.log(chalk.gray('• What problem is now solved forever?'));
console.log(chalk.gray('• What does your typical day look like?'));
console.log(chalk.gray('• How has your productivity changed?'));
console.log(chalk.gray('• What are you building that you could not before?'));

console.log('\\n' + '='.repeat(80) + '\\n');

console.log(specArt.listening);

console.log(chalk.bold.cyan('🐕 Spec says: "Woof! I am ready to listen with my whole heart! 💖"'));
console.log('');
console.log(chalk.green('Answer any, all, or none of these questions!'));
console.log(chalk.blue('Tell me what excites you most about this project!'));
console.log(chalk.magenta('Share your wildest dreams - no idea is too big! 🌟'));
console.log('');
console.log(chalk.bold.yellow('🎪 LETS BUILD SOMETHING AMAZING TOGETHER! 🎪'));