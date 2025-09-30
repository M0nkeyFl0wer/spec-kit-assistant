/**
 * Spec Logo - Beautiful ASCII art for CLI startup
 * Replaces generic figlet with custom gear/cog themed design
 */

export const SpecLogo = {
  // Main logo with gear theme
  main: `
    ╔═══════════════════════════════════════════════╗
    ║                                               ║
    ║      ⚙️  ███████╗██████╗ ███████╗ ██████╗    ║
    ║         ██╔════╝██╔══██╗██╔════╝██╔════╝    ║
    ║         ███████╗██████╔╝█████╗  ██║         ║
    ║         ╚════██║██╔═══╝ ██╔══╝  ██║         ║
    ║         ███████║██║     ███████╗╚██████╗    ║
    ║         ╚══════╝╚═╝     ╚══════╝ ╚═════╝    ║
    ║                                               ║
    ║       🐕 Your Golden Retriever Guide          ║
    ║          Fetch Specs, Build Great Software!   ║
    ╚═══════════════════════════════════════════════╝
`,

  // Compact logo for smaller terminals
  compact: `
   ⚙️  ███████╗██████╗ ███████╗ ██████╗
      ██╔════╝██╔══██╗██╔════╝██╔════╝
      ███████╗██████╔╝█████╗  ██║
      ╚════██║██╔═══╝ ██╔══╝  ██║
      ███████║██║     ███████╗╚██████╗
      ╚══════╝╚═╝     ╚══════╝ ╚═════╝
         🐕 Fetch specs, build great software!
`,

  // Loading animation frames with gear
  loading: [
    `
    ⚙️  Loading Spec...
        ∩───∩
       (  ·  · )
        \ o  /
         \_\_/
    `,
    `
    ⚙️  Loading Spec...
        ∩───∩
       (  ^  ^ )
        \ o  /
         \_\_/
    `,
    `
    ⚙️  Loading Spec...
        ∩───∩
       (  ≧.≦ )
        \ o  /
         \_\_/
    `
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
      `    ⚙️    `,
      `    ⚡    `,
      `    ⚙️    `,
      `    ✨    `
    ]
  },

  // Tagline options
  taglines: [
    '🐕 Your Golden Retriever Guide to Spec-Driven Development',
    '⚙️  Fetch specs, build great software!',
    '🚀 Spec-first development made delightful',
    '🎯 From idea to implementation in minutes',
    '✨ AI-assisted, human-guided, dog-approved'
  ],

  // Loading text variations
  loadingText: [
    'Fetching specs...',
    'Wagging tail excitedly...',
    'Sniffing out the best approach...',
    'Rolling in specifications...',
    'Bringing back the perfect spec...'
  ]
};

/**
 * Get a random tagline
 */
export function getRandomTagline() {
  return SpecLogo.taglines[Math.floor(Math.random() * SpecLogo.taglines.length)];
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
  const { compact = false, color = 'cyan', tagline = true } = options;

  let logo = compact ? SpecLogo.compact : SpecLogo.main;

  if (tagline && !compact) {
    // Tagline already in main logo
    return logo;
  } else if (tagline && compact) {
    // Add random tagline to compact
    return logo + '\\n    ' + getRandomTagline();
  }

  return logo;
}

export default SpecLogo;