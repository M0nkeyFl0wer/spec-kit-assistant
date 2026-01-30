/**
 * MicroCelebrations
 * Provides delightful micro-interactions and celebrations.
 * Implements FR-008 (delightful micro-celebrations)
 * - 3+ message variants per celebration type
 * - <500ms animation duration
 */

import chalk from 'chalk';

/**
 * Spec Kit theme colors
 */
const COLORS = {
  purple: '#8B5CF6',
  pink: '#EC4899',
  green: '#10B981',
  yellow: '#F59E0B',
  blue: '#3B82F6'
};

/**
 * Celebration message variants (3+ per type per FR-008)
 */
const MESSAGES = {
  phaseComplete: [
    '🎉 Phase complete! Great progress.',
    '✨ Nice work! Moving forward.',
    '🚀 Phase done! You\'re cruising.',
    '🌟 Excellent! One step closer.',
    '💪 Phase conquered! Keep going.'
  ],
  onboardingComplete: [
    '🐕 Woof! Your project is all set up!',
    '🎊 Welcome aboard! Let\'s build something great.',
    '✨ Perfect! You\'re ready to spec.',
    '🚀 Blast off! Project initialized.',
    '🌈 Wonderful! Your adventure begins.'
  ],
  specificationComplete: [
    '📝 Specification locked in!',
    '✅ Spec complete! Crystal clear.',
    '🎯 Requirements captured!',
    '📋 All specified! Ready to plan.',
    '💡 Great spec! Implementation awaits.'
  ],
  implementationComplete: [
    '🏗️ Built and ready!',
    '⚡ Implementation done!',
    '🎨 Feature complete!',
    '💻 Code shipped!',
    '🛠️ All built up!'
  ],
  testsPassing: [
    '✅ All tests green!',
    '🧪 Tests passing! Quality assured.',
    '🔬 Verified! Everything works.',
    '🛡️ Test suite clear!',
    '💚 Green lights all around!'
  ],
  saved: [
    '💾 Saved!',
    '✓ Changes saved.',
    '📁 All saved.',
    '💫 Progress saved!'
  ],
  welcome: [
    '🐕 Hello! Ready to help.',
    '👋 Welcome! Let\'s get started.',
    '🌟 Hi there! What are we building?',
    '🎯 Ready when you are!'
  ],
  encouragement: [
    '💪 You\'ve got this!',
    '🌟 Keep going!',
    '✨ Great work so far!',
    '🚀 You\'re doing great!',
    '🎯 Almost there!'
  ]
};

/**
 * ASCII art celebrations (simple, <500ms to render)
 */
const MINI_ART = {
  star: '✨',
  sparkle: '⭐',
  rocket: '🚀',
  check: '✅',
  dog: '🐕',
  heart: '💜'
};

export class MicroCelebrations {
  /**
   * @param {Object} options
   * @param {boolean} [options.enabled=true] - Whether celebrations are enabled
   * @param {boolean} [options.includeArt=true] - Include ASCII art
   * @param {number} [options.animationDuration=300] - Max animation time in ms
   */
  constructor(options = {}) {
    this.enabled = options.enabled ?? true;
    this.includeArt = options.includeArt ?? true;
    this.animationDuration = options.animationDuration ?? 300;

    // Track last used messages to avoid repetition
    this._lastUsed = new Map();
  }

  /**
   * Get a random message from a category
   * @private
   */
  _getRandomMessage(category) {
    const messages = MESSAGES[category] || MESSAGES.encouragement;
    const lastUsed = this._lastUsed.get(category) || -1;

    // Avoid repeating the same message
    let index;
    do {
      index = Math.floor(Math.random() * messages.length);
    } while (index === lastUsed && messages.length > 1);

    this._lastUsed.set(category, index);
    return messages[index];
  }

  /**
   * Celebrate a phase completion
   * @param {string} [phaseName] - Optional phase name
   * @returns {Promise<void>}
   */
  async phaseComplete(phaseName) {
    if (!this.enabled) return;

    const message = this._getRandomMessage('phaseComplete');
    const display = phaseName
      ? `${message} (${phaseName})`
      : message;

    await this._animate(chalk.hex(COLORS.green)(display));
  }

  /**
   * Celebrate onboarding completion
   * @returns {Promise<void>}
   */
  async onboardingComplete() {
    if (!this.enabled) return;

    const message = this._getRandomMessage('onboardingComplete');
    await this._animate(chalk.hex(COLORS.purple)(message));
  }

  /**
   * Celebrate specification completion
   * @returns {Promise<void>}
   */
  async specificationComplete() {
    if (!this.enabled) return;

    const message = this._getRandomMessage('specificationComplete');
    await this._animate(chalk.hex(COLORS.blue)(message));
  }

  /**
   * Celebrate implementation completion
   * @returns {Promise<void>}
   */
  async implementationComplete() {
    if (!this.enabled) return;

    const message = this._getRandomMessage('implementationComplete');
    await this._animate(chalk.hex(COLORS.pink)(message));
  }

  /**
   * Celebrate tests passing
   * @returns {Promise<void>}
   */
  async testsPassing() {
    if (!this.enabled) return;

    const message = this._getRandomMessage('testsPassing');
    await this._animate(chalk.hex(COLORS.green)(message));
  }

  /**
   * Show a save confirmation
   * @returns {Promise<void>}
   */
  async saved() {
    if (!this.enabled) return;

    const message = this._getRandomMessage('saved');
    await this._animate(chalk.dim(message), 150);
  }

  /**
   * Show a welcome message
   * @returns {Promise<void>}
   */
  async welcome() {
    if (!this.enabled) return;

    const message = this._getRandomMessage('welcome');
    await this._animate(chalk.hex(COLORS.purple)(message));
  }

  /**
   * Show an encouragement message
   * @returns {Promise<void>}
   */
  async encourage() {
    if (!this.enabled) return;

    const message = this._getRandomMessage('encouragement');
    await this._animate(chalk.hex(COLORS.yellow)(message));
  }

  /**
   * Display a custom celebration
   * @param {string} message - Custom message
   * @param {string} [color] - Hex color
   * @returns {Promise<void>}
   */
  async custom(message, color = COLORS.purple) {
    if (!this.enabled) return;

    await this._animate(chalk.hex(color)(message));
  }

  /**
   * Animate the celebration display
   * @private
   */
  async _animate(message, duration = this.animationDuration) {
    // Simple fade-in effect within <500ms budget
    const steps = 3;
    const stepDelay = Math.min(duration / steps, 100);

    // Quick sparkle effect
    if (this.includeArt) {
      process.stdout.write(chalk.dim('✨ '));
      await this._delay(stepDelay);
    }

    // Show the message
    console.log(message);

    // Brief pause for readability
    await this._delay(stepDelay);
  }

  /**
   * Simple delay helper
   * @private
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Enable celebrations
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disable celebrations
   */
  disable() {
    this.enabled = false;
  }

  /**
   * Create MicroCelebrations with celebrations enabled
   * @returns {MicroCelebrations}
   */
  static enabled() {
    return new MicroCelebrations({ enabled: true });
  }

  /**
   * Create MicroCelebrations with celebrations disabled (for CI)
   * @returns {MicroCelebrations}
   */
  static disabled() {
    return new MicroCelebrations({ enabled: false });
  }
}
