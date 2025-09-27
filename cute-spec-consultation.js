#!/usr/bin/env node
/**
 * Cute ASCII Spec Consultation - Interactive Q&A for Ultimate Toolkit
 */

import { SpecCharacter } from './src/character/spec.js';
import chalk from 'chalk';

class CuteSpecConsultation {
  constructor() {
    this.spec = new SpecCharacter();

    // Enhanced cute ASCII art collection
    this.cuteArt = {
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
      ${chalk.yellow('\\    o    /')}  ${chalk.magenta('I\\'m all ears! 👂')}
       ${chalk.gray('\\   ---   /')}
        ${chalk.gray('^^^     ^^^')}  ${chalk.dim('*attentive listening*')}
      `,

      working: `
${chalk.yellow('      /^-----^\\')}
     ${chalk.yellow('( ◔     ◔ )')}
      ${chalk.yellow('\\  ≡≡≡≡≡  /')}  ${chalk.cyan('Working on it...')}
       ${chalk.gray('\\   ---   /')}
        ${chalk.gray('^^^     ^^^')}  ${chalk.dim('*focused concentration*')}
      `,

      celebration: `
${chalk.rainbow('      /^-----^\\')}
     ${chalk.rainbow('( ★  ✨  ★ )')}
      ${chalk.rainbow('\\   ∪∪∪   /')}  ${chalk.bold.green('PAWSOME! 🎉')}
       ${chalk.gray('\\   ---   /')}
        ${chalk.rainbow('^^^  ^^^  ^^^')}  ${chalk.bold('*victory dance*')}

    ${chalk.yellow('🎉')} ${chalk.green('✨')} ${chalk.blue('🐕')} ${chalk.green('✨')} ${chalk.yellow('🎉')}
    ${chalk.magenta('🌟')} ${chalk.cyan('🎊')} ${chalk.red('🐾')} ${chalk.cyan('🎊')} ${chalk.magenta('🌟')}
    ${chalk.blue('⭐')} ${chalk.yellow('🎈')} ${chalk.brown('🦴')} ${chalk.yellow('🎈')} ${chalk.blue('⭐')}
      `,

      question: `
${chalk.yellow('      /^-----^\\')}
     ${chalk.yellow('( ◕  ?  ◕ )')}
      ${chalk.yellow('\\    ❓    /')}  ${chalk.blue('Question time!')}
       ${chalk.gray('\\   ---   /')}
        ${chalk.gray('^^^     ^^^')}  ${chalk.dim('*inquisitive tilt*')}
      `
    };
  }

  showWelcome() {
    console.log(chalk.bold.blue('🐕 Spec Kit Assistant - Ultimate Toolkit Consultation'));
    console.log(chalk.gray('Let\\'s build your comprehensive agent swarm ecosystem together!\n'));

    console.log(this.cuteArt.excited);

    console.log(chalk.cyan('\nHey there, amazing human! 🎉 I\\'m Spec, and I\\'m BOUNCING with excitement!'));
    console.log(chalk.cyan('You want to build the ULTIMATE TOOLKIT - that\\'s like... the biggest project EVER!'));
    console.log(chalk.cyan('But don\\'t worry, we\\'ll figure this out together, one question at a time! 🐾\n'));
  }

  askPriorityQuestion() {
    console.log(this.cuteArt.question);

    console.log(chalk.bold.yellow('🎯 SPEC\\'S FIRST BIG QUESTION:'));
    console.log(chalk.white('You mentioned 8 different swarm types:'));
    console.log('  🔍 Research & Intelligence');
    console.log('  📝 Content Creation & Publishing');
    console.log('  📊 Data Science & Analytics');
    console.log('  🎬 Video Production & Editing');
    console.log('  🛡️ Red Team & Security Testing');
    console.log('  🐛 Debugging & Code Analysis');
    console.log('  🚀 Rapid Prototyping');
    console.log('  💡 Ideation & Innovation\n');

    console.log(this.cuteArt.curious);

    console.log(chalk.bold.magenta('Which one makes you go "OMG I NEED THIS NOW!" ? 🤔'));
    console.log(chalk.gray('(What\\'s your biggest pain point that keeps you up at night?)'));
  }

  askIntegrationQuestion() {
    console.log(this.cuteArt.thinking);

    console.log(chalk.bold.yellow('🧠 SPEC\\'S ARCHITECTURE QUESTION:'));
    console.log(chalk.white('You said "preloaded in Claude" - my doggy brain is imagining:'));
    console.log('');
    console.log(chalk.green('  A) 🔌 Claude Code Extension') + chalk.gray(' (auto-loads when you start Claude)'));
    console.log(chalk.blue('  B) 📄 Claude.md Integration') + chalk.gray(' (available in every project)'));
    console.log(chalk.cyan('  C) 🛠️  Standalone Toolkit') + chalk.gray(' (works alongside Claude Code)'));
    console.log(chalk.magenta('  D) 🌟 Something Even Cooler') + chalk.gray(' (tell me your wild ideas!)'));
    console.log('');

    console.log(this.cuteArt.listening);

    console.log(chalk.bold.blue('What\\'s your vision? How do you want to access these swarms? 🎪'));
  }

  askCollaborationQuestion() {
    console.log(this.cuteArt.working);

    console.log(chalk.bold.yellow('🤝 SPEC\\'S TEAMWORK QUESTION:'));
    console.log(chalk.white('When your swarms are working... should they:'));
    console.log('');
    console.log(chalk.green('  🎯 Work Independently') + chalk.gray(' (you assign tasks to each swarm separately)'));
    console.log(chalk.blue('  🔄 Auto-Collaborate') + chalk.gray(' (research swarm feeds content swarm automatically)'));
    console.log(chalk.cyan('  ⛓️  Chain Together') + chalk.gray(' (research → content → publishing pipeline)'));
    console.log(chalk.magenta('  🌟 Smart Coordination') + chalk.gray(' (they figure out who does what)'));
    console.log('');

    console.log(this.cuteArt.curious);

    console.log(chalk.bold.green('What\\'s your dream workflow? 🌈'));
  }

  askDeploymentQuestion() {
    console.log(this.cuteArt.excited);

    console.log(chalk.bold.yellow('☁️ SPEC\\'S DEPLOYMENT QUESTION:'));
    console.log(chalk.white('Where should this ultimate toolkit live?'));
    console.log('');
    console.log(chalk.blue('  ☁️  Cloud-First') + chalk.gray(' (everything runs in GCP/AWS for maximum power)'));
    console.log(chalk.green('  💻 Local-First') + chalk.gray(' (starts on your machine, scales to cloud when needed)'));
    console.log(chalk.cyan('  🌐 Hybrid') + chalk.gray(' (smart agents local, heavy compute in cloud)'));
    console.log(chalk.magenta('  🚀 Edge Computing') + chalk.gray(' (distributed across multiple locations)'));
    console.log('');

    console.log(this.cuteArt.thinking);

    console.log(chalk.bold.purple('What\\'s your compute strategy? 💪'));
  }

  askSuccessQuestion() {
    console.log(this.cuteArt.happy);

    console.log(chalk.bold.yellow('🎯 SPEC\\'S SUCCESS QUESTION:'));
    console.log(chalk.white('Picture this: 6 months from now, you\\'re using the Ultimate Toolkit...'));
    console.log('');

    console.log(this.cuteArt.celebration);

    console.log(chalk.bold.rainbow('What would make you jump up and shout "YES! THIS IS EXACTLY WHAT I NEEDED!" ? 🎉'));
    console.log('');
    console.log(chalk.gray('• What problem is now solved forever?'));
    console.log(chalk.gray('• What does your typical day look like?'));
    console.log(chalk.gray('• How has your productivity changed?'));
    console.log(chalk.gray('• What are you building that you couldn\\'t before?'));
  }

  showListeningMode() {
    console.log(this.cuteArt.listening);

    console.log(chalk.bold.cyan('🐕 Spec says: "Woof! I\\'m ready to listen with my whole heart! 💖"'));
    console.log('');
    console.log(chalk.green('Answer any, all, or none of these questions!'));
    console.log(chalk.blue('Tell me what excites you most about this project!'));
    console.log(chalk.magenta('Share your wildest dreams - no idea is too big! 🌟'));
    console.log('');
    console.log(chalk.bold.yellow('🎪 LET\\'S BUILD SOMETHING AMAZING TOGETHER! 🎪'));
  }

  runConsultation() {
    this.showWelcome();
    console.log('\n' + '='.repeat(80) + '\n');

    this.askPriorityQuestion();
    console.log('\n' + '-'.repeat(40) + '\n');

    this.askIntegrationQuestion();
    console.log('\n' + '-'.repeat(40) + '\n');

    this.askCollaborationQuestion();
    console.log('\n' + '-'.repeat(40) + '\n');

    this.askDeploymentQuestion();
    console.log('\n' + '-'.repeat(40) + '\n');

    this.askSuccessQuestion();
    console.log('\n' + '='.repeat(80) + '\n');

    this.showListeningMode();
  }
}

// Helper function for rainbow text
chalk.rainbow = (text) => {
  const colors = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'];
  return text.split('').map((char, i) =>
    chalk[colors[i % colors.length]](char)
  ).join('');
};

// Run consultation
console.clear(); // Clear screen for better presentation
const consultation = new CuteSpecConsultation();
consultation.runConsultation();