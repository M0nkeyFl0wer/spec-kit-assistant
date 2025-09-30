/**
 * T031: Terminal capability detection implementation
 * Detects terminal capabilities for optimal character and animation display
 * Constitutional compliance with fallback modes for limited environments
 */

import { performance } from 'perf_hooks';

export class TerminalDetector {
  constructor() {
    this.capabilities = null;
    this.detectionCache = new Map();
    this.lastDetection = null;
    this.detectionTimeout = 5000; // 5 second cache
  }

  /**
   * Detect comprehensive terminal capabilities
   * @returns {Object} Terminal capability report
   */
  async detectCapabilities() {
    const startTime = performance.now();

    // Check cache first
    if (this.isDetectionCached()) {
      return this.capabilities;
    }

    const capabilities = {
      // Basic terminal info
      isTerminal: false,
      isTTY: false,
      width: 80,
      height: 24,

      // Color support
      supportsColor: false,
      colorDepth: 0,
      supports256Colors: false,
      supportsTrueColor: false,

      // Animation capabilities
      supportsAnimations: false,
      supportsCursorControl: false,
      supportsClearing: false,

      // Character encoding
      supportsUnicode: false,
      supportsEmoji: false,

      // Performance characteristics
      isRemote: false,
      isCloud: false,
      isCI: false,

      // Environment detection
      environment: 'unknown',
      terminalProgram: 'unknown',
      platform: process.platform,

      // Constitutional compliance
      detectionTime: 0,
      fallbackRequired: false,

      // Detailed info
      raw: {}
    };

    try {
      // Basic terminal detection
      this.detectBasicTerminal(capabilities);

      // Color support detection
      this.detectColorSupport(capabilities);

      // Animation capability detection
      await this.detectAnimationSupport(capabilities);

      // Character encoding detection
      this.detectCharacterSupport(capabilities);

      // Environment detection
      this.detectEnvironment(capabilities);

      // Performance characteristics
      this.detectPerformanceCharacteristics(capabilities);

      // Apply constitutional limits
      this.applyConstitutionalLimits(capabilities);

    } catch (error) {
      // Safe fallback for any detection errors
      capabilities.fallbackRequired = true;
      capabilities.error = error.message;
    }

    // Record detection time (constitutional monitoring)
    capabilities.detectionTime = performance.now() - startTime;

    // Cache results
    this.capabilities = capabilities;
    this.lastDetection = Date.now();

    return capabilities;
  }

  /**
   * Detect basic terminal properties
   */
  detectBasicTerminal(capabilities) {
    // Check if we're in a terminal
    capabilities.isTerminal = Boolean(process.stdout && process.stderr);
    capabilities.isTTY = Boolean(process.stdout.isTTY);

    if (capabilities.isTTY) {
      // Get terminal dimensions
      capabilities.width = process.stdout.columns || 80;
      capabilities.height = process.stdout.rows || 24;
    }

    // Store raw process info
    capabilities.raw.stdout = {
      isTTY: process.stdout.isTTY,
      columns: process.stdout.columns,
      rows: process.stdout.rows
    };
  }

  /**
   * Detect color support capabilities
   */
  detectColorSupport(capabilities) {
    // Check for color support
    if (process.stdout.hasColors) {
      capabilities.supportsColor = process.stdout.hasColors();

      // Check for extended color support
      if (process.stdout.hasColors(256)) {
        capabilities.supports256Colors = true;
        capabilities.colorDepth = 256;
      }

      if (process.stdout.hasColors(16777216)) {
        capabilities.supportsTrueColor = true;
        capabilities.colorDepth = 16777216;
      }
    }

    // Environment variable overrides
    if (process.env.NO_COLOR || process.env.MONOCHROME) {
      capabilities.supportsColor = false;
      capabilities.supports256Colors = false;
      capabilities.supportsTrueColor = false;
      capabilities.colorDepth = 0;
    }

    // Terminal specific detection
    const term = process.env.TERM || '';
    if (term.includes('color') || term.includes('256') || term.includes('truecolor')) {
      capabilities.supportsColor = true;
    }

    if (term.includes('256')) {
      capabilities.supports256Colors = true;
      capabilities.colorDepth = Math.max(capabilities.colorDepth, 256);
    }

    // Force color detection for known terminals
    const colorfulTerminals = [
      'xterm-256color',
      'xterm-kitty',
      'alacritty',
      'iTerm.app',
      'Terminal.app'
    ];

    if (colorfulTerminals.some(t => term.includes(t) || process.env.TERM_PROGRAM === t)) {
      capabilities.supportsColor = true;
      capabilities.supports256Colors = true;
    }
  }

  /**
   * Detect animation support capabilities
   */
  async detectAnimationSupport(capabilities) {
    // Basic cursor control detection
    if (capabilities.isTTY) {
      try {
        // Test if we can move cursor (constitutional 50ms timeout)
        const testPromise = this.testCursorControl();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 50)
        );

        await Promise.race([testPromise, timeoutPromise]);
        capabilities.supportsCursorControl = true;
        capabilities.supportsClearing = true;
      } catch (error) {
        // Cursor control failed or timed out
        capabilities.supportsCursorControl = false;
        capabilities.supportsClearing = false;
      }
    }

    // Animation support is combination of factors
    capabilities.supportsAnimations =
      capabilities.isTTY &&
      capabilities.supportsCursorControl &&
      capabilities.width >= 60 &&
      !this.isLimitedEnvironment();

    // Environment-specific overrides
    if (process.env.SPEC_FALLBACK_MODE === 'true' ||
        process.env.CI === 'true' ||
        process.env.GITHUB_ACTIONS === 'true') {
      capabilities.supportsAnimations = false;
    }
  }

  /**
   * Test cursor control (quick constitutional test)
   */
  async testCursorControl() {
    return new Promise((resolve, reject) => {
      if (!process.stdout.isTTY) {
        reject(new Error('Not a TTY'));
        return;
      }

      // Try to save and restore cursor position
      process.stdout.write('\x1b[s'); // Save cursor
      process.stdout.write('\x1b[u'); // Restore cursor

      // If we get here without error, cursor control works
      resolve(true);
    });
  }

  /**
   * Detect character encoding support
   */
  detectCharacterSupport(capabilities) {
    // Unicode detection
    const locale = process.env.LANG || process.env.LC_ALL || '';
    capabilities.supportsUnicode = locale.includes('UTF-8') || locale.includes('utf8');

    // Emoji detection (basic heuristic)
    capabilities.supportsEmoji =
      capabilities.supportsUnicode &&
      !this.isLimitedEnvironment() &&
      capabilities.width >= 60;

    // Terminal-specific emoji support
    const emojiTerminals = ['iTerm', 'Terminal.app', 'kitty', 'alacritty'];
    if (emojiTerminals.some(t => process.env.TERM_PROGRAM === t)) {
      capabilities.supportsEmoji = true;
    }
  }

  /**
   * Detect environment characteristics
   */
  detectEnvironment(capabilities) {
    // CI/CD detection
    capabilities.isCI = Boolean(
      process.env.CI ||
      process.env.GITHUB_ACTIONS ||
      process.env.GITLAB_CI ||
      process.env.JENKINS_URL ||
      process.env.TRAVIS ||
      process.env.CIRCLECI
    );

    // Cloud environment detection
    capabilities.isCloud = Boolean(
      process.env.CODESPACES ||
      process.env.GITPOD_WORKSPACE_ID ||
      process.env.REPLIT_DB_URL ||
      process.env.CLOUD9_USER
    );

    // Remote terminal detection
    capabilities.isRemote = Boolean(
      process.env.SSH_CONNECTION ||
      process.env.SSH_CLIENT ||
      process.env.SSH_TTY ||
      capabilities.isCloud
    );

    // Terminal program detection
    capabilities.terminalProgram =
      process.env.TERM_PROGRAM ||
      process.env.TERMINAL_EMULATOR ||
      'unknown';

    // Environment classification
    if (capabilities.isCI) {
      capabilities.environment = 'ci';
    } else if (capabilities.isCloud) {
      capabilities.environment = 'cloud';
    } else if (capabilities.isRemote) {
      capabilities.environment = 'remote';
    } else if (capabilities.isTTY) {
      capabilities.environment = 'local';
    } else {
      capabilities.environment = 'non-interactive';
    }
  }

  /**
   * Detect performance characteristics
   */
  detectPerformanceCharacteristics(capabilities) {
    // Add performance-related metadata
    capabilities.performanceProfile = {
      expectedLatency: this.estimateLatency(capabilities),
      bandwidthConstrained: capabilities.isRemote || capabilities.isCloud,
      cpuConstrained: capabilities.isCI,
      animationBudget: this.calculateAnimationBudget(capabilities)
    };
  }

  /**
   * Estimate terminal latency
   */
  estimateLatency(capabilities) {
    if (capabilities.isCloud) return 'high';
    if (capabilities.isRemote) return 'medium';
    if (capabilities.isCI) return 'variable';
    return 'low';
  }

  /**
   * Calculate animation time budget (constitutional compliance)
   */
  calculateAnimationBudget(capabilities) {
    const baseBudget = 500; // Constitutional 500ms limit

    if (capabilities.isCI) return Math.min(baseBudget, 100); // CI gets 100ms max
    if (capabilities.isCloud) return Math.min(baseBudget, 250); // Cloud gets 250ms max
    if (capabilities.isRemote) return Math.min(baseBudget, 350); // Remote gets 350ms max

    return baseBudget; // Local gets full budget
  }

  /**
   * Apply constitutional limits and fallback decisions
   */
  applyConstitutionalLimits(capabilities) {
    // Enforce fallback for limited environments
    if (this.isLimitedEnvironment()) {
      capabilities.fallbackRequired = true;
      capabilities.supportsAnimations = false;
      capabilities.supportsColor = false;
    }

    // Constitutional performance enforcement
    if (capabilities.detectionTime > 100) { // 100ms detection limit
      capabilities.fallbackRequired = true;
      capabilities.performanceIssue = 'slow_detection';
    }

    // Width-based fallbacks
    if (capabilities.width < 60) {
      capabilities.supportsAnimations = false;
      capabilities.fallbackRequired = true;
      capabilities.reason = 'narrow_terminal';
    }
  }

  /**
   * Check if environment has known limitations
   */
  isLimitedEnvironment() {
    const limitedTerms = ['dumb', 'unknown', 'cons25'];
    const term = process.env.TERM || '';

    return (
      limitedTerms.includes(term) ||
      process.env.NO_COLOR === '1' ||
      process.env.TERM === 'dumb' ||
      !process.stdout.isTTY
    );
  }

  /**
   * Check if detection results are cached and valid
   */
  isDetectionCached() {
    return (
      this.capabilities &&
      this.lastDetection &&
      (Date.now() - this.lastDetection) < this.detectionTimeout
    );
  }

  /**
   * Generate capability report for debugging
   */
  generateReport(capabilities = null) {
    const caps = capabilities || this.capabilities;
    if (!caps) return 'No capabilities detected yet';

    const report = {
      summary: {
        environment: caps.environment,
        animations: caps.supportsAnimations ? 'enabled' : 'disabled',
        colors: caps.supportsColor ? `${caps.colorDepth} colors` : 'disabled',
        fallback: caps.fallbackRequired ? 'required' : 'not required'
      },
      details: {
        terminal: `${caps.width}x${caps.height} ${caps.isTTY ? 'TTY' : 'non-TTY'}`,
        unicode: caps.supportsUnicode ? 'yes' : 'no',
        emoji: caps.supportsEmoji ? 'yes' : 'no',
        cursor: caps.supportsCursorControl ? 'yes' : 'no'
      },
      performance: caps.performanceProfile,
      constitutional: {
        detectionTime: `${caps.detectionTime.toFixed(1)}ms`,
        animationBudget: `${caps.performanceProfile?.animationBudget || 0}ms`,
        compliance: caps.detectionTime <= 100 ? 'compliant' : 'violation'
      }
    };

    return report;
  }

  /**
   * Get optimal display mode based on capabilities
   */
  getOptimalDisplayMode(capabilities = null) {
    const caps = capabilities || this.capabilities;
    if (!caps) return 'text';

    if (caps.supportsAnimations && !caps.fallbackRequired) {
      return 'full-animation';
    } else if (caps.supportsColor && caps.supportsUnicode) {
      return 'static-color';
    } else if (caps.supportsColor) {
      return 'basic-color';
    } else {
      return 'text';
    }
  }

  /**
   * Create terminal detector with immediate capability check
   */
  static async create() {
    const detector = new TerminalDetector();
    await detector.detectCapabilities();
    return detector;
  }

  /**
   * Quick capability check (for constitutional compliance)
   */
  static async quickCheck() {
    const detector = new TerminalDetector();

    // Simplified detection under 50ms
    return {
      isTTY: Boolean(process.stdout.isTTY),
      hasColor: Boolean(process.stdout.hasColors?.()),
      width: process.stdout.columns || 80,
      fallbackMode: !process.stdout.isTTY || process.env.SPEC_FALLBACK_MODE === 'true'
    };
  }
}

export default TerminalDetector;