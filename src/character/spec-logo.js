/**
 * Spec Logo - Beautiful ASCII art for CLI startup
 * Based on official Specify branding
 *
 * Colors from official Specify logo:
 * - Cyan/Light Blue #00D9FF (top gradient)
 * - Blue #0099FF (mid gradient)
 * - Deep Blue #0066FF (bottom gradient)
 * - White #FFFFFF (text)
 */

import chalk from 'chalk';

export const SpecLogo = {
  // ULTRA SIMPLE - just text, no fancy characters at all
  pixelDog: `
    ${chalk.hex('#00D9FF')('   ███████╗')}${chalk.hex('#0099FF')('██████╗ ')}${chalk.hex('#0099FF')('███████╗')}${chalk.hex('#0066FF')(' ██████╗')}
    ${chalk.hex('#00D9FF')('   ██╔════╝')}${chalk.hex('#0099FF')('██╔══██╗')}${chalk.hex('#0099FF')('██╔════╝')}${chalk.hex('#0066FF')('██╔════╝')}
    ${chalk.hex('#00D9FF')('   ███████╗')}${chalk.hex('#0099FF')('██████╔╝')}${chalk.hex('#0099FF')('█████╗  ')}${chalk.hex('#0066FF')('██║     ')}
    ${chalk.hex('#00D9FF')('   ╚════██║')}${chalk.hex('#0099FF')('██╔═══╝ ')}${chalk.hex('#0099FF')('██╔══╝  ')}${chalk.hex('#0066FF')('██║     ')}
    ${chalk.hex('#00D9FF')('   ███████║')}${chalk.hex('#0099FF')('██║     ')}${chalk.hex('#0099FF')('███████╗')}${chalk.hex('#0066FF')('╚██████╗')}
    ${chalk.hex('#00D9FF')('   ╚══════╝')}${chalk.hex('#0099FF')('╚═╝     ')}${chalk.hex('#0099FF')('╚══════╝')}${chalk.hex('#0066FF')(' ╚═════╝')}

      ${chalk.hex('#0099FF')('🐕 Your Loyal Spec Kit Assistant')}
`,

  // Main logo with dog and SPEC text (colored) - keep original as fallback
  main: chalk.hex('#8B5CF6')(`
    ╔═══════════════════════════════════════════════╗
    ║`) + chalk.hex('#8B4513')('       /^─────^\\') + chalk.hex('#8B5CF6')(`                          ║
    ║`) + chalk.hex('#8B4513')('      ( ◕  📋  ◕ )') + chalk.hex('#8B5CF6')(`                         ║
    ║`) + chalk.hex('#8B4513')('       \\  ^───^  /') + chalk.hex('#8B5CF6')(`                          ║
    ║`) + chalk.hex('#8B4513')('        \\   ─   /') + chalk.hex('#8B5CF6')(`                           ║
    ║`) + chalk.hex('#8B4513')('         ^^^   ^^^') + chalk.hex('#8B5CF6')(`                          ║
    ║                                               ║
    ║`) + chalk.hex('#EC4899')('      ███████╗██████╗ ███████╗ ██████╗     ') + chalk.hex('#8B5CF6')(`║
    ║`) + chalk.hex('#EC4899')('      ██╔════╝██╔══██╗██╔════╝██╔════╝     ') + chalk.hex('#8B5CF6')(`║
    ║`) + chalk.hex('#EC4899')('      ███████╗██████╔╝█████╗  ██║          ') + chalk.hex('#8B5CF6')(`║
    ║`) + chalk.hex('#EC4899')('      ╚════██║██╔═══╝ ██╔══╝  ██║          ') + chalk.hex('#8B5CF6')(`║
    ║`) + chalk.hex('#8B5CF6')('      ███████║██║     ███████╗╚██████╗     ') + chalk.hex('#8B5CF6')(`║
    ║`) + chalk.hex('#8B5CF6')('      ╚══════╝╚═╝     ╚══════╝ ╚═════╝     ') + chalk.hex('#8B5CF6')(`║
    ║                                               ║
    ║`) + chalk.hex('#10B981')('       🐕 Your Loyal Spec Kit Assistant       ') + chalk.hex('#8B5CF6')(`║
    ║`) + chalk.hex('#10B981')('          Fetch Specs, Build Great Software!  ') + chalk.hex('#8B5CF6')(`║
    ╚═══════════════════════════════════════════════╝
`),

  // Compact logo for smaller terminals
  compact: chalk.hex('#8B4513')(`      /^─────^\\
     ( ◕  📋  ◕ )
      \\  ^───^  /
   `) + chalk.hex('#EC4899')(`███████╗██████╗ ███████╗ ██████╗
   ██╔════╝██╔══██╗██╔════╝██╔════╝
   ███████╗██████╔╝█████╗  ██║
   ╚════██║██╔═══╝ ██╔══╝  ██║
   `) + chalk.hex('#8B5CF6')(`███████║██║     ███████╗╚██████╗
   ╚══════╝╚═╝     ╚══════╝ ╚═════╝
   `) + chalk.hex('#10B981')(`   🐕 Fetch specs, build great software!
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
    chalk.hex('#8B4513')(`
       / \\__
      (    @\\___
      /         O
     /   (_____/
    /_____/   U

    🎉 Phase Complete! Good dog!
    `) + chalk.dim(`(To disable ASCII art: spec --no-ascii)`),

    chalk.hex('#EC4899')(`
         __
    (___()'\`;
    /,    /\`
    \\\\"--\\\\

    ✨ Great work! Spec is proud!
    `) + chalk.dim(`(To disable ASCII art: spec --no-ascii)`),

    chalk.hex('#10B981')(`
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

    chalk.hex('#8B5CF6')(`
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
