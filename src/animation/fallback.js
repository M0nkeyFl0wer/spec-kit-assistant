/**
 * T032: Fallback mode implementation
 * Provides graceful degradation for limited terminals and environments
 * Constitutional compliance with instant text-based alternatives
 */

import chalk from 'chalk';

export class FallbackMode {
  constructor() {
    this.isActive = false;
    this.fallbackLevel = 'none';
    this.alternativeMessages = new Map();
    this.simpleAnimations = new Map();
    this.textArt = new Map();
    this.initializeFallbacks();
  }

  /**
   * Initialize fallback content and alternatives
   */
  initializeFallbacks() {
    // Simple text alternatives for animations
    this.simpleAnimations.set('welcome', '🐕 Welcome to Spec Kit Assistant!');
    this.simpleAnimations.set('working', '🐕 Working... *tail wagging*');
    this.simpleAnimations.set('thinking', '🐕 Thinking... 💭');
    this.simpleAnimations.set('celebrating', '🐕 Success! *happy bark*');
    this.simpleAnimations.set('progress', '🐕 Making progress... ⚡');

    // Character expressions for different states
    this.textArt.set('happy', '🐕 *happy tail wagging*');
    this.textArt.set('working', '🐕 *focused concentration*');
    this.textArt.set('excited', '🐕 *bouncing with excitement*');
    this.textArt.set('concerned', '🐕 *tilted head, concerned*');
    this.textArt.set('thinking', '🐕 *thoughtful paw on chin*');

    // Alternative messages for various scenarios
    this.alternativeMessages.set('terminal_detection', 'Terminal capabilities detected - using fallback mode');
    this.alternativeMessages.set('animation_failed', 'Animation unavailable - continuing with text');
    this.alternativeMessages.set('color_unavailable', 'Color not supported - using plain text');
    this.alternativeMessages.set('unicode_fallback', 'Unicode limited - using ASCII alternatives');
  }

  /**
   * Activate fallback mode with specified level
   * @param {string} level - Fallback level: 'minimal', 'basic', 'full'
   * @param {Object} capabilities - Terminal capabilities
   */
  activate(level = 'basic', capabilities = {}) {
    this.isActive = true;
    this.fallbackLevel = level;
    this.capabilities = capabilities;

    console.log(this.formatMessage('info', 'Fallback mode activated'));

    // Configure fallback strategy based on level
    switch (level) {
      case 'minimal':
        this.setupMinimalFallback();
        break;
      case 'basic':
        this.setupBasicFallback();
        break;
      case 'full':
        this.setupFullFallback();
        break;
      default:
        this.setupBasicFallback();
    }

    return this.generateFallbackReport();
  }

  /**
   * Setup minimal fallback (text only, no colors, no emojis)
   */
  setupMinimalFallback() {
    this.useColor = false;
    this.useEmoji = false;
    this.useUnicode = false;
    this.animationStyle = 'none';

    // Override text art with plain text
    this.textArt.clear();
    this.textArt.set('happy', 'Spec (happy)');
    this.textArt.set('working', 'Spec (working)');
    this.textArt.set('excited', 'Spec (excited)');
    this.textArt.set('concerned', 'Spec (concerned)');
    this.textArt.set('thinking', 'Spec (thinking)');

    // Simple animation alternatives
    this.simpleAnimations.set('welcome', 'Spec: Welcome to Spec Kit Assistant!');
    this.simpleAnimations.set('working', 'Spec: Working...');
    this.simpleAnimations.set('thinking', 'Spec: Thinking...');
    this.simpleAnimations.set('celebrating', 'Spec: Success!');
  }

  /**
   * Setup basic fallback (some colors, basic emojis)
   */
  setupBasicFallback() {
    this.useColor = this.capabilities.supportsColor || false;
    this.useEmoji = true; // Basic emoji support assumed
    this.useUnicode = this.capabilities.supportsUnicode || false;
    this.animationStyle = 'static';
  }

  /**
   * Setup full fallback (colors, emojis, static animations)
   */
  setupFullFallback() {
    this.useColor = this.capabilities.supportsColor || false;
    this.useEmoji = this.capabilities.supportsEmoji || true;
    this.useUnicode = this.capabilities.supportsUnicode || true;
    this.animationStyle = 'static-rich';
  }

  /**
   * Display character with fallback-appropriate representation
   * @param {string} state - Character emotional state
   * @param {string} message - Message to display
   */
  displayCharacter(state, message) {
    const characterRep = this.getCharacterRepresentation(state);
    const formattedMessage = this.formatCharacterMessage(message);

    // Immediate display (constitutional compliance)
    console.log(`${characterRep} ${formattedMessage}`);
  }

  /**
   * Get character representation for current fallback level
   * @param {string} state - Character state
   * @returns {string} Character representation
   */
  getCharacterRepresentation(state) {
    const defaultRep = this.textArt.get(state) || this.textArt.get('happy');

    switch (this.fallbackLevel) {
      case 'minimal':
        return this.stripFormatting(defaultRep);
      case 'basic':
        return this.useColor ? chalk.cyan(defaultRep) : defaultRep;
      case 'full':
        return this.enhanceCharacterRep(defaultRep, state);
      default:
        return defaultRep;
    }
  }

  /**
   * Enhance character representation for full fallback
   */
  enhanceCharacterRep(baseRep, state) {
    if (!this.useColor) return baseRep;

    const colorMap = {
      happy: chalk.green,
      excited: chalk.yellow,
      working: chalk.blue,
      thinking: chalk.cyan,
      concerned: chalk.yellow
    };

    const colorFn = colorMap[state] || chalk.blue;
    return colorFn(baseRep);
  }

  /**
   * Play animation sequence with fallback
   * @param {string} sequenceName - Animation sequence name
   * @param {Object} options - Animation options
   */
  async playAnimation(sequenceName, options = {}) {
    const fallbackMessage = this.simpleAnimations.get(sequenceName) ||
                           this.simpleAnimations.get('working');

    switch (this.animationStyle) {
      case 'none':
        console.log(this.stripFormatting(fallbackMessage));
        break;

      case 'static':
        console.log(this.formatMessage('info', fallbackMessage));
        break;

      case 'static-rich':
        await this.playStaticRichAnimation(fallbackMessage, options);
        break;

      default:
        console.log(fallbackMessage);
    }

    // Return immediately (constitutional compliance)
    return Promise.resolve({
      success: true,
      fallbackMode: true,
      duration: 0
    });
  }

  /**
   * Play enhanced static animation
   */
  async playStaticRichAnimation(message, options) {
    if (this.useColor) {
      console.log(chalk.cyan('▶ ') + chalk.blue(message));
    } else {
      console.log('> ' + message);
    }

    // Optional brief pause for readability (constitutional limit)
    if (options.pause && options.pause <= 200) {
      await new Promise(resolve => setTimeout(resolve, options.pause));
    }
  }

  /**
   * Show progress indicator with fallback
   * @param {string} message - Progress message
   * @param {number} percentage - Progress percentage (0-100)
   */
  showProgress(message, percentage = null) {
    let progressBar = '';

    if (this.fallbackLevel !== 'minimal') {
      // Create simple progress bar
      const barLength = 20;
      const filled = percentage ? Math.round((percentage / 100) * barLength) : 0;
      const empty = barLength - filled;

      if (this.useUnicode) {
        progressBar = '█'.repeat(filled) + '░'.repeat(empty);
      } else {
        progressBar = '#'.repeat(filled) + '-'.repeat(empty);
      }

      const percentText = percentage !== null ? ` ${percentage}%` : '';
      progressBar = `[${progressBar}]${percentText}`;
    }

    const fullMessage = percentage !== null ?
      `${message} ${progressBar}` : message;

    console.log(this.formatMessage('progress', fullMessage));
  }

  /**
   * Format message based on fallback capabilities
   */
  formatMessage(type, message) {
    if (this.fallbackLevel === 'minimal') {
      return this.stripFormatting(message);
    }

    if (!this.useColor) {
      return message;
    }

    const formatMap = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
      progress: chalk.cyan
    };

    const formatter = formatMap[type] || (text => text);
    return formatter(message);
  }

  /**
   * Format character message
   */
  formatCharacterMessage(message) {
    if (this.fallbackLevel === 'minimal') {
      return this.stripFormatting(message);
    }

    // Add quotes to indicate speech
    const quotedMessage = `"${message}"`;

    if (this.useColor) {
      return chalk.blue(quotedMessage);
    }

    return quotedMessage;
  }

  /**
   * Strip all formatting for minimal mode
   */
  stripFormatting(text) {
    // Remove ANSI codes and emojis for maximum compatibility
    return text
      .replace(/\x1b\[[0-9;]*m/g, '') // Remove ANSI codes
      .replace(/🐕|🎉|⚡|💭|✨/g, '*') // Replace emojis with asterisk
      .replace(/[^\x00-\x7F]/g, ''); // Remove non-ASCII characters
  }

  /**
   * Handle fallback for specific features
   * @param {string} feature - Feature that needs fallback
   * @param {*} originalContent - Original content
   * @returns {*} Fallback content
   */
  handleFeatureFallback(feature, originalContent) {
    switch (feature) {
      case 'figlet':
        return this.handleFigletFallback(originalContent);
      case 'table':
        return this.handleTableFallback(originalContent);
      case 'spinner':
        return this.handleSpinnerFallback(originalContent);
      case 'interactive':
        return this.handleInteractiveFallback(originalContent);
      default:
        return originalContent;
    }
  }

  /**
   * Handle figlet/ASCII art fallback
   */
  handleFigletFallback(text) {
    if (this.fallbackLevel === 'minimal') {
      return `=== ${text.toUpperCase()} ===`;
    }

    // Simple banner for basic/full modes
    const border = '='.repeat(text.length + 4);
    return `${border}\n  ${text.toUpperCase()}  \n${border}`;
  }

  /**
   * Handle table fallback
   */
  handleTableFallback(tableData) {
    if (this.fallbackLevel === 'minimal') {
      // Convert to simple list
      return tableData.map(row => row.join(' | ')).join('\n');
    }

    // Basic table formatting
    return tableData.map(row => `| ${row.join(' | ')} |`).join('\n');
  }

  /**
   * Handle spinner fallback
   */
  handleSpinnerFallback(message) {
    return this.formatMessage('progress', message + ' (in progress)');
  }

  /**
   * Handle interactive element fallback
   */
  handleInteractiveFallback(options) {
    console.log(this.formatMessage('info', 'Interactive mode not available in fallback'));
    return { fallback: true, options };
  }

  /**
   * Generate fallback configuration report
   */
  generateFallbackReport() {
    return {
      active: this.isActive,
      level: this.fallbackLevel,
      capabilities: {
        color: this.useColor,
        emoji: this.useEmoji,
        unicode: this.useUnicode,
        animation: this.animationStyle
      },
      features: {
        characterDisplay: 'available',
        progressIndicators: 'available',
        messageFormatting: this.useColor ? 'enhanced' : 'basic',
        interactivity: 'limited'
      },
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Generate recommendations for improving terminal experience
   */
  generateRecommendations() {
    const recommendations = [];

    if (!this.useColor) {
      recommendations.push('Enable color support for better visual experience');
    }

    if (!this.useUnicode) {
      recommendations.push('Configure terminal for UTF-8 support');
    }

    if (this.fallbackLevel === 'minimal') {
      recommendations.push('Consider upgrading terminal for full feature support');
    }

    if (this.capabilities?.width < 80) {
      recommendations.push('Increase terminal width for optimal display');
    }

    return recommendations;
  }

  /**
   * Check if feature is available in current fallback mode
   * @param {string} feature - Feature to check
   * @returns {boolean} Feature availability
   */
  isFeatureAvailable(feature) {
    const featureMatrix = {
      minimal: ['text', 'basic-progress'],
      basic: ['text', 'color', 'basic-progress', 'emoji'],
      full: ['text', 'color', 'progress', 'emoji', 'unicode', 'static-animation']
    };

    const availableFeatures = featureMatrix[this.fallbackLevel] || [];
    return availableFeatures.includes(feature);
  }

  /**
   * Create fallback mode with automatic configuration
   * @param {Object} capabilities - Terminal capabilities
   * @returns {FallbackMode} Configured fallback mode
   */
  static createForCapabilities(capabilities) {
    const fallback = new FallbackMode();

    let level = 'full';
    if (!capabilities.supportsColor && !capabilities.supportsUnicode) {
      level = 'minimal';
    } else if (!capabilities.supportsAnimations) {
      level = 'basic';
    }

    fallback.activate(level, capabilities);
    return fallback;
  }

  /**
   * Quick fallback for emergency situations
   */
  static emergency() {
    const fallback = new FallbackMode();
    fallback.activate('minimal', {});
    return fallback;
  }
}

export default FallbackMode;