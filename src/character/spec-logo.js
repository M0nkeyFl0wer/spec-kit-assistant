/**
 * Spec Logo - Beautiful ASCII art for CLI startup
 * Based on official GitHub Spec Kit branding
 *
 * Colors from official Spec Kit logo:
 * - Purple #8B5CF6
 * - Pink #EC4899
 * - Green #10B981 (seedling/plant)
 * - Brown #8B4513 (soil)
 */

import chalk from 'chalk';

export const SpecLogo = {
  // Pixel dog art with SPEC text inline - Official Spec Kit colors
  pixelDog: chalk.hex('#8B5CF6')(`
    ╔════════════════════════════════════════════════════════════════╗
    ║                             `) + chalk.hex('#8B4513')('██████          ██████') + chalk.hex('#8B5CF6')(`             ║
    ║                           `) + chalk.hex('#8B4513')('██▓▓▓▓▓▓██████████▓▓▓▓▓▓██') + chalk.hex('#8B5CF6')(`           ║
    ║   `) + chalk.hex('#EC4899')('███████╗██████╗ ███████╗ ██████╗') + chalk.hex('#8B5CF6')(` `) + chalk.hex('#8B4513')('██▓▓▓▓██          ██▓▓▓▓██') + chalk.hex('#8B5CF6')(`  ║
    ║   `) + chalk.hex('#EC4899')('██╔════╝██╔══██╗██╔════╝██╔════╝') + chalk.hex('#8B5CF6')(` `) + chalk.hex('#8B4513')('██▓▓████    ▓▓▓▓▓▓████▓▓██') + chalk.hex('#8B5CF6')(`  ║
    ║   `) + chalk.hex('#EC4899')('███████╗██████╔╝█████╗  ██║') + chalk.hex('#8B5CF6')(`      `) + chalk.hex('#8B4513')('██  ██  ██▓▓██▓▓██  ██') + chalk.hex('#8B5CF6')(`    ║
    ║   `) + chalk.hex('#EC4899')('╚════██║██╔═══╝ ██╔══╝  ██║') + chalk.hex('#8B5CF6')(`          `) + chalk.hex('#10B981')('██    ▓▓▓▓▓▓██') + chalk.hex('#8B5CF6')(`        ║
    ║   `) + chalk.hex('#8B5CF6')('███████║██║     ███████╗╚██████╗') + chalk.hex('#8B5CF6')(`    `) + chalk.hex('#10B981')('██              ██') + chalk.hex('#8B5CF6')(`      ║
    ║   `) + chalk.hex('#8B5CF6')('╚══════╝╚═╝     ╚══════╝ ╚═════╝') + chalk.hex('#8B5CF6')(`    `) + chalk.hex('#10B981')('██    ██████    ██') + chalk.hex('#8B5CF6')(`      ║
    ║                                     `) + chalk.hex('#10B981')('██    ██████    ██') + chalk.hex('#8B5CF6')(`      ║
    ║                                     `) + chalk.hex('#10B981')('██              ██') + chalk.hex('#8B5CF6')(`      ║
    ║`) + chalk.hex('#EC4899')('    🌱 GitHub Spec Kit Assistant') + chalk.hex('#8B5CF6')(`     `) + chalk.hex('#10B981')('██    ██    ██') + chalk.hex('#8B5CF6')(`        ║
    ║`) + chalk.hex('#10B981')('  Spec-Driven Development Made Easy') + chalk.hex('#8B5CF6')(` `) + chalk.hex('#8B4513')('████░░████') + chalk.hex('#8B5CF6')(`          ║
    ╚════════════════════════════════════════════════════════════════╝
`),

  // Main logo with dog and SPEC text (colored) - keep original as fallback
  main: chalk.yellow(`
    ╔═══════════════════════════════════════════════╗
    ║`) + chalk.cyan('       /^─────^\\') + chalk.yellow(`                          ║
    ║`) + chalk.cyan('      ( ◕  📋  ◕ )') + chalk.yellow(`                         ║
    ║`) + chalk.cyan('       \\  ^───^  /') + chalk.yellow(`                          ║
    ║`) + chalk.cyan('        \\   ─   /') + chalk.yellow(`                           ║
    ║`) + chalk.cyan('         ^^^   ^^^') + chalk.yellow(`                          ║
    ║                                               ║
    ║`) + chalk.hex('#FFD700')('      ███████╗██████╗ ███████╗ ██████╗     ') + chalk.yellow(`║
    ║`) + chalk.hex('#FFD700')('      ██╔════╝██╔══██╗██╔════╝██╔════╝     ') + chalk.yellow(`║
    ║`) + chalk.hex('#F28500')('      ███████╗██████╔╝█████╗  ██║          ') + chalk.yellow(`║
    ║`) + chalk.hex('#F28500')('      ╚════██║██╔═══╝ ██╔══╝  ██║          ') + chalk.yellow(`║
    ║`) + chalk.hex('#2E86AB')('      ███████║██║     ███████╗╚██████╗     ') + chalk.yellow(`║
    ║`) + chalk.hex('#2E86AB')('      ╚══════╝╚═╝     ╚══════╝ ╚═════╝     ') + chalk.yellow(`║
    ║                                               ║
    ║`) + chalk.hex('#00CED1')('       🐕 Your Loyal Spec Kit Assistant       ') + chalk.yellow(`║
    ║`) + chalk.hex('#00CED1')('          Fetch Specs, Build Great Software!  ') + chalk.yellow(`║
    ╚═══════════════════════════════════════════════╝
`),

  // Compact logo for smaller terminals
  compact: chalk.cyan(`      /^─────^\\
     ( ◕  📋  ◕ )
      \\  ^───^  /
   `) + chalk.hex('#FFD700')(`███████╗██████╗ ███████╗ ██████╗
   ██╔════╝██╔══██╗██╔════╝██╔════╝
   `) + chalk.hex('#F28500')(`███████╗██████╔╝█████╗  ██║
   ╚════██║██╔═══╝ ██╔══╝  ██║
   `) + chalk.hex('#2E86AB')(`███████║██║     ███████╗╚██████╗
   ╚══════╝╚═╝     ╚══════╝ ╚═════╝
   `) + chalk.hex('#00CED1')(`   🐕 Fetch specs, build great software!
`),

  // Loading animation - use new logo with official colors
  loading: [
    chalk.hex('#8B5CF6')(`
    ╔════════════════════════════════════════════════════════════════╗
    ║                             `) + chalk.hex('#8B4513')('██████          ██████') + chalk.hex('#8B5CF6')(`             ║
    ║                           `) + chalk.hex('#8B4513')('██▓▓▓▓▓▓██████████▓▓▓▓▓▓██') + chalk.hex('#8B5CF6')(`           ║
    ║   `) + chalk.hex('#EC4899')('███████╗██████╗ ███████╗ ██████╗') + chalk.hex('#8B5CF6')(` `) + chalk.hex('#8B4513')('██▓▓▓▓██          ██▓▓▓▓██') + chalk.hex('#8B5CF6')(`  ║
    ║   `) + chalk.hex('#EC4899')('██╔════╝██╔══██╗██╔════╝██╔════╝') + chalk.hex('#8B5CF6')(` `) + chalk.hex('#8B4513')('██▓▓████    ▓▓▓▓▓▓████▓▓██') + chalk.hex('#8B5CF6')(`  ║
    ║   `) + chalk.hex('#EC4899')('███████╗██████╔╝█████╗  ██║') + chalk.hex('#8B5CF6')(`      `) + chalk.hex('#8B4513')('██  ██  ██▓▓██▓▓██  ██') + chalk.hex('#8B5CF6')(`    ║
    ║   `) + chalk.hex('#EC4899')('╚════██║██╔═══╝ ██╔══╝  ██║') + chalk.hex('#8B5CF6')(`          `) + chalk.hex('#10B981')('██    ▓▓▓▓▓▓██') + chalk.hex('#8B5CF6')(`        ║
    ║   `) + chalk.hex('#8B5CF6')('███████║██║     ███████╗╚██████╗') + chalk.hex('#8B5CF6')(`    `) + chalk.hex('#10B981')('██              ██') + chalk.hex('#8B5CF6')(`      ║
    ║   `) + chalk.hex('#8B5CF6')('╚══════╝╚═╝     ╚══════╝ ╚═════╝') + chalk.hex('#8B5CF6')(`    `) + chalk.hex('#10B981')('██    ██████    ██') + chalk.hex('#8B5CF6')(`      ║
    ║                                     `) + chalk.hex('#10B981')('██    ██████    ██') + chalk.hex('#8B5CF6')(`      ║
    ║                                     `) + chalk.hex('#10B981')('██              ██') + chalk.hex('#8B5CF6')(`      ║
    ║`) + chalk.hex('#EC4899')('    🌱 GitHub Spec Kit Assistant') + chalk.hex('#8B5CF6')(`     `) + chalk.hex('#10B981')('██    ██    ██') + chalk.hex('#8B5CF6')(`        ║
    ║`) + chalk.hex('#10B981')('  Spec-Driven Development Made Easy') + chalk.hex('#8B5CF6')(` `) + chalk.hex('#8B4513')('████░░████') + chalk.hex('#8B5CF6')(`          ║
    ╚════════════════════════════════════════════════════════════════╝
    `),
  ],

  // Reward dogs for phase completion (larger ASCII art)
  rewardDogs: [
    chalk.hex('#F28500')(`
       / \\__
      (    @\\___
      /         O
     /   (_____/
    /_____/   U

    🎉 Phase Complete! Good dog!
    `) + chalk.dim(`(To disable ASCII art: spec --no-ascii)`),

    chalk.hex('#FFD700')(`
         __
    (___()'\`;
    /,    /\`
    \\\\"--\\\\

    ✨ Great work! Spec is proud!
    `) + chalk.dim(`(To disable ASCII art: spec --no-ascii)`),

    chalk.hex('#2E86AB')(`
       ,--._______,-.
      ( )   (  \\_O/( )
       |\\    \\  / '|
       | \\  .~  / |
        \\  \\   /  /
        |    ~   |
        |  (\\/) |
        ;   ..   ;
       ;  _/  \\_ ;
      /   '    '  \\

    🚀 Excellent! Moving to next phase!
    `) + chalk.dim(`(To disable ASCII art: spec --no-ascii)`),

    chalk.hex('#00CED1')(`
      /^ ^\\
     / 0 0 \\
     V\\ Y /V
      / - \\
     /    |
    V__) ||

    🌟 Well done! Spec says woof!
    `) + chalk.dim(`(To disable ASCII art: spec --no-ascii)`),
  ],

  // Gear ASCII art options
  gears: {
    small: `
    ⚙️
    `,
    medium: `
        ___
       /   \\
      | ⚙️  |
       \\___/
    `,
    large: `
         ._____.
        /  ⚙️   \\
       |    ☼    |
        \\ ___ /
         '---'
    `,
    spinning: [
      '    ⚙️    ',
      '    ⚡    ',
      '    ⚙️    ',
      '    ✨    ',
    ],
  },

  // Tagline options
  taglines: [
    '🐕 Your Loyal Dog Assistant for Spec-Driven Development',
    '⚙️  Fetch specs, build great software!',
    '🚀 Spec-first development made delightful',
    '🎯 From idea to implementation in minutes',
    '✨ AI-assisted, human-guided, dog-approved',
  ],

  // Loading text variations
  loadingText: [
    'Fetching specs...',
    'Wagging tail excitedly...',
    'Sniffing out the best approach...',
    'Rolling in specifications...',
    'Bringing back the perfect spec...',
  ],
};

/**
 * Get a random tagline
 */
export function getRandomTagline() {
  return SpecLogo.taglines[Math.floor(Math.random() * SpecLogo.taglines.length)];
}

/**
 * Get a random reward dog for phase completion
 */
export function getRandomRewardDog() {
  return SpecLogo.rewardDogs[Math.floor(Math.random() * SpecLogo.rewardDogs.length)];
}

/**
 * Get a random loading text
 */
export function getRandomLoadingText() {
  return SpecLogo.loadingText[Math.floor(Math.random() * SpecLogo.loadingText.length)];
}

/**
 * Display logo with optional tagline
 */
export function displayLogo(options = {}) {
  const { compact = false, color = 'cyan', tagline = true, pixelArt = true } = options;

  // Use new pixel dog by default, fallback to original
  const logo = compact ? SpecLogo.compact : (pixelArt ? SpecLogo.pixelDog : SpecLogo.main);

  if (tagline && !compact) {
    // Tagline already in main logo
    return logo;
  } if (tagline && compact) {
    // Add random tagline to compact
    return `${logo}\\n    ${getRandomTagline()}`;
  }

  return logo;
}

export default SpecLogo;
