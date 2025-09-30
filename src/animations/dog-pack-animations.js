#!/usr/bin/env node
/**
 * Enhanced ASCII Dog Pack Animations
 * Loading screens, swarm deployment visualization, and progress indicators
 */

import chalk from 'chalk';

export class DogPackAnimations {
  constructor() {
    this.isAnimating = false;
    this.currentFrame = 0;
  }

  // Single dog running animation frames
  static runningDogFrames = [
    '🐕     ',
    ' 🐕    ',
    '  🐕   ',
    '   🐕  ',
    '    🐕 ',
    '     🐕',
    '    🐕 ',
    '   🐕  ',
    '  🐕   ',
    ' 🐕    '
  ];

  // Pack formation frames
  static packFormationFrames = [
    // Pack gathering
    `
     🐕 (Leader - Spec)
    `,
    `
     🐕 (Leader - Spec)
   🐕‍🦮
    `,
    `
     🐕 (Leader - Spec)
   🐕‍🦮     🐕‍🦮
    `,
    `
     🐕 (Leader - Spec)
   🐕‍🦮     🐕‍🦮
     🐕‍🦮   🐕‍🦮
    `,
    // Final formation
    `
        🐕 Spec (Queen Coordinator)
       ╱ ╲
    🐕‍🦮───┼───🐕‍🦮 (Frontend Pack)
      ╱   ╲
   🐕‍🦮─────🐕‍🦮 (Backend Pack)
      ╱   ╲
   🐕‍🦮─────🐕‍🦮 (Security Pack)
    `
  ];

  // Loading progress with running dog
  static loadingFrames = [
    '🐕💨 Initializing swarm...     ▓░░░░░░░░░ 10%',
    ' 🐕💨 Loading agents...        ▓▓░░░░░░░░ 20%',
    '  🐕💨 Connecting network...   ▓▓▓░░░░░░░ 30%',
    '   🐕💨 Deploying pack...      ▓▓▓▓░░░░░░ 40%',
    '    🐕💨 Syncing protocols...  ▓▓▓▓▓░░░░░ 50%',
    '     🐕💨 Testing links...     ▓▓▓▓▓▓░░░░ 60%',
    '    🐕💨 Optimizing routes...  ▓▓▓▓▓▓▓░░░ 70%',
    '   🐕💨 Validating agents...   ▓▓▓▓▓▓▓▓░░ 80%',
    '  🐕💨 Finalizing setup...     ▓▓▓▓▓▓▓▓▓░ 90%',
    ' 🐕💨 Pack ready!             ▓▓▓▓▓▓▓▓▓▓ 100%'
  ];

  // Swarm activity visualization
  static swarmActivityFrames = [
    `
┌─── 🐕 Swarm Pack Status ───────────────────┐
│ 🐕 Spec (Leader): Coordinating tasks       │
│ 🐕‍🦮 Agent-1: ████████░░ Processing (80%)   │
│ 🐕‍🦮 Agent-2: ██████░░░░ Building (60%)     │
│ 🐕‍🦮 Agent-3: ████░░░░░░ Testing (40%)      │
│ 🐕‍🦮 Agent-4: ██░░░░░░░░ Starting (20%)     │
└─────────────────────────────────────────────┘
    `,
    `
┌─── 🐕 Swarm Pack Status ───────────────────┐
│ 🐕 Spec (Leader): Managing workflow        │
│ 🐕‍🦮 Agent-1: ██████████ Complete! ✅       │
│ 🐕‍🦮 Agent-2: ████████░░ Building (80%)     │
│ 🐕‍🦮 Agent-3: ██████░░░░ Testing (60%)      │
│ 🐕‍🦮 Agent-4: ████░░░░░░ Working (40%)      │
└─────────────────────────────────────────────┘
    `
  ];

  // Single dog running in place (loading)
  async showLoadingDog(message = "Working...", duration = 3000) {
    const frames = [
      '🐕     ',
      ' 🐕    ',
      '  🐕   ',
      '   🐕💨',
      '  🐕   ',
      ' 🐕    '
    ];

    this.isAnimating = true;
    const startTime = Date.now();
    let frameIndex = 0;

    while (this.isAnimating && (Date.now() - startTime) < duration) {
      process.stdout.write('\\r' + chalk.blue(frames[frameIndex]) + chalk.gray(message));
      frameIndex = (frameIndex + 1) % frames.length;
      await this.sleep(200);
    }

    process.stdout.write('\\r' + chalk.green('🐕✨ ') + chalk.green(message.replace('Working', 'Done')) + '\\n');
  }

  // Pack deployment animation
  async showPackDeployment() {
    console.log(chalk.yellow('\\n🐕 Spec: "Calling the pack to formation!"\\n'));

    for (let i = 0; i < DogPackAnimations.packFormationFrames.length; i++) {
      console.clear();
      console.log(chalk.blue('🌟 SWARM PACK DEPLOYMENT 🌟'));
      console.log(chalk.cyan(DogPackAnimations.packFormationFrames[i]));

      if (i === 0) console.log(chalk.gray('   🐕 Spec is ready to lead...'));
      if (i === 1) console.log(chalk.gray('   🐕‍🦮 First agent joining...'));
      if (i === 2) console.log(chalk.gray('   🐕‍🦮 Frontend agents assembling...'));
      if (i === 3) console.log(chalk.gray('   🐕‍🦮 Backend agents ready...'));
      if (i === 4) console.log(chalk.green('   ✨ Pack formation complete!'));

      await this.sleep(1500);
    }

    console.log(chalk.green('\\n🎉 The pack is ready for action! All agents deployed and synchronized.\\n'));
  }

  // Enhanced loading with progress bar
  async showEnhancedLoading(taskName = "Initializing Swarm") {
    console.log(chalk.blue(`\\n🐕 Spec: "Let me get the pack ready for ${taskName}!"\\n`));

    for (let i = 0; i < DogPackAnimations.loadingFrames.length; i++) {
      process.stdout.write('\\r' + chalk.blue(DogPackAnimations.loadingFrames[i]));
      await this.sleep(400);
    }

    console.log(chalk.green('\\n\\n🎉 Pack deployment complete! Ready to execute tasks.\\n'));
  }

  // Real-time swarm activity monitor
  async showSwarmActivity(agents = [], duration = 10000) {
    console.log(chalk.cyan('\\n📊 Real-time Swarm Monitor\\n'));

    const startTime = Date.now();
    let frameIndex = 0;

    while ((Date.now() - startTime) < duration) {
      console.clear();
      console.log(chalk.cyan('📊 LIVE SWARM ACTIVITY MONITOR'));
      console.log(DogPackAnimations.swarmActivityFrames[frameIndex % DogPackAnimations.swarmActivityFrames.length]);

      // Add live stats
      console.log(chalk.gray('⚡ Live Stats:'));
      console.log(chalk.gray(`   • Uptime: ${Math.floor((Date.now() - startTime) / 1000)}s`));
      console.log(chalk.gray(`   • Active Agents: ${agents.length || 4}`));
      console.log(chalk.gray(`   • Tasks Completed: ${Math.floor(Math.random() * 10) + 1}`));
      console.log(chalk.gray(`   • Success Rate: 98.5%`));

      frameIndex++;
      await this.sleep(1000);
    }
  }

  // Pack celebration animation
  async showCelebration(message = "Task completed successfully!") {
    const celebrationFrames = [
      '🐕 🐕‍🦮 🐕‍🦮 🐕‍🦮',
      '🐕🎉🐕‍🦮🎉🐕‍🦮🎉🐕‍🦮',
      '🎉🐕🎉🐕‍🦮🎉🐕‍🦮🎉',
      '🐕🎉🐕‍🦮🎉🐕‍🦮🎉🐕‍🦮'
    ];

    console.log(chalk.green('\\n✨ MISSION ACCOMPLISHED! ✨\\n'));

    for (let i = 0; i < 3; i++) {
      for (const frame of celebrationFrames) {
        process.stdout.write('\\r' + chalk.yellow(frame) + ' ' + chalk.green(message));
        await this.sleep(300);
      }
    }

    console.log(chalk.green('\\n\\n🐕 Spec: "Great work, pack! Mission accomplished!"\\n'));
  }

  // Interactive command prompt with animated dog
  async showInteractivePrompt() {
    const promptFrames = [
      '🐕 Spec: "What should we build next?" ',
      '🐕💭 Spec: "What should we build next?" ',
      '🐕 Spec: "What should we build next?" '
    ];

    let frameIndex = 0;
    setInterval(() => {
      process.stdout.write('\\r' + chalk.blue(promptFrames[frameIndex]));
      frameIndex = (frameIndex + 1) % promptFrames.length;
    }, 1000);
  }

  // Stop all animations
  stop() {
    this.isAnimating = false;
  }

  // Helper method for delays
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate random dog emoji for variety
  getRandomDog() {
    const dogs = ['🐕', '🐕‍🦮', '🐶', '🦮'];
    return dogs[Math.floor(Math.random() * dogs.length)];
  }

  // Status indicator with animated dots
  async showStatusWithDots(message, duration = 2000) {
    const dots = ['', '.', '..', '...'];
    let dotIndex = 0;
    const startTime = Date.now();

    while ((Date.now() - startTime) < duration) {
      process.stdout.write('\\r🐕 ' + message + dots[dotIndex]);
      dotIndex = (dotIndex + 1) % dots.length;
      await this.sleep(500);
    }

    process.stdout.write('\\r🐕 ' + message + ' ✅\\n');
  }
}

// Demo function to showcase all animations
export async function runAnimationDemo() {
  const animator = new DogPackAnimations();

  console.log(chalk.blue('🎬 Dog Pack Animation Demo\\n'));

  // 1. Loading dog
  await animator.showLoadingDog("Fetching bones...", 3000);

  // 2. Enhanced loading
  await animator.showEnhancedLoading("Fetch Quest");

  // 3. Pack deployment
  await animator.showPackDeployment();

  // 4. Swarm activity monitor
  await animator.showSwarmActivity([], 5000);

  // 5. Celebration
  await animator.showCelebration("All bones retrieved!");

  console.log(chalk.green('🎬 Animation demo complete!'));
}

// CLI integration
if (import.meta.url === `file://${process.argv[1]}`) {
  runAnimationDemo().catch(console.error);
}