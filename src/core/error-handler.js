/**
 * T043: Error handling and logging implementation
 * Comprehensive error management with constitutional compliance
 */

import fs from 'fs/promises';
import path from 'path';
import { performance } from 'perf_hooks';
import { CharacterPersonality } from './character-personality.js';

export class ErrorHandler {
  constructor(options = {}) {
    this.options = {
      logLevel: options.logLevel || 'info',
      logFile: options.logFile || 'logs/spec-kit.log',
      maxLogSize: options.maxLogSize || 10 * 1024 * 1024, // 10MB
      enableConsole: options.enableConsole !== false,
      enableFile: options.enableFile !== false,
      enableCharacterResponses: options.enableCharacterResponses !== false,
      constitutionalCompliance: true,
      ...options
    };

    this.character = new CharacterPersonality();
    this.errorCounts = new Map();
    this.performanceMetrics = {
      totalErrors: 0,
      errorsByType: new Map(),
      errorsByTimestamp: [],
      averageHandlingTime: 0,
      maxHandlingTime: 0,
      constitutionalViolations: 0
    };

    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4
    };

    this.constitutionalLimits = {
      maxHandlingTime: 100, // 100ms for error handling
      maxMemoryUsage: 50 * 1024 * 1024, // 50MB
      maxLogSize: this.options.maxLogSize
    };

    this.initialized = false;
  }

  /**
   * Initialize error handler with constitutional compliance
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Ensure log directory exists
      if (this.options.enableFile) {
        const logDir = path.dirname(this.options.logFile);
        await fs.mkdir(logDir, { recursive: true });
      }

      // Set up global error handlers
      if (typeof process !== 'undefined') {
        process.on('uncaughtException', (error) => {
          this.logError('UNCAUGHT_EXCEPTION', error, {
            critical: true,
            source: 'process'
          });
        });

        process.on('unhandledRejection', (reason, promise) => {
          this.logError('UNHANDLED_REJECTION', reason, {
            critical: true,
            source: 'promise',
            promise: promise
          });
        });
      }

      this.initialized = true;
      await this.logInfo('ERROR_HANDLER_INITIALIZED', 'Error handler initialized with constitutional compliance');
    } catch (error) {
      console.error('Failed to initialize error handler:', error);
    }
  }

  /**
   * Log error with constitutional timing compliance
   */
  async logError(code, error, context = {}) {
    const startTime = performance.now();

    try {
      const errorInfo = this.formatError(code, error, context);
      await this.writeLog('error', errorInfo);

      // Update metrics
      this.updateErrorMetrics(errorInfo, startTime);

      // Generate character response if enabled
      if (this.options.enableCharacterResponses && !context.skipCharacter) {
        const characterResponse = await this.generateCharacterErrorResponse(errorInfo);
        if (characterResponse) {
          await this.writeLog('info', {
            ...errorInfo,
            characterResponse,
            type: 'CHARACTER_RESPONSE'
          });
        }
      }

      return errorInfo;
    } catch (handlingError) {
      // Fallback logging if error handling fails
      console.error('Error handler failed:', handlingError);
      console.error('Original error:', error);
    }
  }

  /**
   * Log warning with constitutional compliance
   */
  async logWarning(code, message, context = {}) {
    const warningInfo = {
      level: 'warn',
      code,
      message,
      context,
      timestamp: new Date().toISOString(),
      source: context.source || 'application'
    };

    await this.writeLog('warn', warningInfo);
    return warningInfo;
  }

  /**
   * Log info with constitutional compliance
   */
  async logInfo(code, message, context = {}) {
    const infoData = {
      level: 'info',
      code,
      message,
      context,
      timestamp: new Date().toISOString(),
      source: context.source || 'application'
    };

    await this.writeLog('info', infoData);
    return infoData;
  }

  /**
   * Log debug information
   */
  async logDebug(code, message, context = {}) {
    if (this.logLevels[this.options.logLevel] < this.logLevels.debug) {
      return null;
    }

    const debugData = {
      level: 'debug',
      code,
      message,
      context,
      timestamp: new Date().toISOString(),
      source: context.source || 'application'
    };

    await this.writeLog('debug', debugData);
    return debugData;
  }

  /**
   * Format error with comprehensive context
   */
  formatError(code, error, context = {}) {
    const timestamp = new Date().toISOString();
    const errorId = `${code}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const errorInfo = {
      id: errorId,
      level: 'error',
      code,
      timestamp,
      message: error?.message || String(error),
      stack: error?.stack,
      name: error?.name,
      context: {
        ...context,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
        nodeVersion: typeof process !== 'undefined' ? process.version : 'unknown',
        platform: typeof process !== 'undefined' ? process.platform : 'unknown',
        memoryUsage: typeof process !== 'undefined' ? process.memoryUsage() : undefined
      },
      severity: this.determineSeverity(error, context),
      category: this.categorizeError(error, context),
      actionable: this.isActionableError(error, context),
      constitutional: this.checkConstitutionalCompliance(error, context)
    };

    return errorInfo;
  }

  /**
   * Determine error severity
   */
  determineSeverity(error, context) {
    if (context.critical) return 'critical';
    if (context.severity) return context.severity;

    // Analyze error characteristics
    if (error?.name === 'TypeError' || error?.name === 'ReferenceError') {
      return 'high';
    }

    if (error?.message?.includes('timeout') || error?.message?.includes('network')) {
      return 'medium';
    }

    if (error?.message?.includes('validation') || error?.message?.includes('format')) {
      return 'low';
    }

    return 'medium';
  }

  /**
   * Categorize error for better handling
   */
  categorizeError(error, context) {
    if (context.category) return context.category;

    const message = error?.message?.toLowerCase() || '';
    const stack = error?.stack?.toLowerCase() || '';

    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'network';
    }

    if (message.includes('timeout') || message.includes('time') || message.includes('duration')) {
      return 'performance';
    }

    if (message.includes('permission') || message.includes('access') || message.includes('auth')) {
      return 'security';
    }

    if (message.includes('validation') || message.includes('schema') || message.includes('format')) {
      return 'validation';
    }

    if (message.includes('animation') || message.includes('terminal') || message.includes('ascii')) {
      return 'ui';
    }

    if (stack.includes('spec') || stack.includes('character') || stack.includes('consultation')) {
      return 'spec_kit';
    }

    return 'general';
  }

  /**
   * Check if error is actionable by user
   */
  isActionableError(error, context) {
    const message = error?.message?.toLowerCase() || '';

    // User-actionable errors
    if (message.includes('file not found') ||
        message.includes('permission denied') ||
        message.includes('invalid') ||
        message.includes('missing')) {
      return true;
    }

    // System errors that user can't fix
    if (message.includes('out of memory') ||
        message.includes('system error') ||
        message.includes('internal')) {
      return false;
    }

    return true;
  }

  /**
   * Check constitutional compliance of error
   */
  checkConstitutionalCompliance(error, context) {
    const compliance = {
      withinTimingLimits: true,
      withinMemoryLimits: true,
      properErrorHandling: true,
      characterFriendly: true
    };

    // Check timing violations
    if (context.duration > this.constitutionalLimits.maxHandlingTime) {
      compliance.withinTimingLimits = false;
    }

    // Check memory violations
    if (typeof process !== 'undefined') {
      const memUsage = process.memoryUsage().heapUsed;
      if (memUsage > this.constitutionalLimits.maxMemoryUsage) {
        compliance.withinMemoryLimits = false;
      }
    }

    // Check if error message is character-friendly
    const message = error?.message || '';
    if (message.includes('crash') || message.includes('die') || message.includes('kill')) {
      compliance.characterFriendly = false;
    }

    return compliance;
  }

  /**
   * Generate character-appropriate error response
   */
  async generateCharacterErrorResponse(errorInfo) {
    try {
      const category = errorInfo.category;
      const severity = errorInfo.severity;
      const actionable = errorInfo.actionable;

      let response = '';

      // Base character response based on severity
      if (severity === 'critical') {
        response = '🐕 *concerned whimper* Oh no! Something serious happened. Let me help you fix this right away!';
      } else if (severity === 'high') {
        response = '🐕 *alert ears* Woof! I noticed an issue we should address. Don\'t worry, we can handle this together!';
      } else if (severity === 'medium') {
        response = '🐕 *head tilt* Hmm, there\'s a small hiccup here. Let\'s take a look and sort it out!';
      } else {
        response = '🐕 *gentle tail wag* Just a tiny issue here - nothing we can\'t handle with some good teamwork!';
      }

      // Add category-specific guidance
      if (actionable) {
        switch (category) {
          case 'network':
            response += ' 🌐 This looks like a network issue. Maybe check your connection?';
            break;
          case 'performance':
            response += ' ⚡ This is about timing - let\'s make sure we stay within our constitutional limits!';
            break;
          case 'security':
            response += ' 🛡️ This is a security matter. Better safe than sorry - let\'s be extra careful here!';
            break;
          case 'validation':
            response += ' ✅ This is about data validation. Let\'s make sure everything is in the right format!';
            break;
          case 'ui':
            response += ' 🎨 This is about our display. Let\'s make sure the animations stay beautiful!';
            break;
          case 'spec_kit':
            response += ' 📋 This is about our spec work. Let\'s keep our specifications clean and clear!';
            break;
          default:
            response += ' 🔧 Let\'s investigate this together and find a solution!';
        }
      } else {
        response += ' 🤔 This might be a system issue. I\'ll do my best to handle it gracefully!';
      }

      // Validate character response
      const validation = this.character.validateResponse(response);
      if (validation.valid && validation.score > 0.7) {
        return response;
      }

      // Fallback if validation fails
      return '🐕 *supportive wag* I\'m here to help work through any issues that come up!';
    } catch (responseError) {
      // Fallback if character response generation fails
      return null;
    }
  }

  /**
   * Write log entry with constitutional compliance
   */
  async writeLog(level, data) {
    const startTime = performance.now();

    try {
      // Check if we should log this level
      if (this.logLevels[level] > this.logLevels[this.options.logLevel]) {
        return;
      }

      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        ...data,
        handlingTime: performance.now() - startTime
      };

      const logLine = JSON.stringify(logEntry) + '\n';

      // Console logging
      if (this.options.enableConsole) {
        const consoleMethod = level === 'error' ? 'error' :
                            level === 'warn' ? 'warn' : 'log';
        console[consoleMethod](`[${level.toUpperCase()}] ${data.code || 'LOG'}: ${data.message || JSON.stringify(data)}`);
      }

      // File logging
      if (this.options.enableFile) {
        await this.writeToFile(logLine);
      }

      // Check constitutional compliance
      const handlingTime = performance.now() - startTime;
      if (handlingTime > this.constitutionalLimits.maxHandlingTime) {
        this.performanceMetrics.constitutionalViolations++;
      }

    } catch (writeError) {
      console.error('Failed to write log:', writeError);
    }
  }

  /**
   * Write to log file with rotation
   */
  async writeToFile(logLine) {
    try {
      // Check file size and rotate if necessary
      try {
        const stats = await fs.stat(this.options.logFile);
        if (stats.size > this.constitutionalLimits.maxLogSize) {
          await this.rotateLog();
        }
      } catch (statError) {
        // File doesn't exist yet, which is fine
      }

      await fs.appendFile(this.options.logFile, logLine, 'utf8');
    } catch (fileError) {
      console.error('Failed to write to log file:', fileError);
    }
  }

  /**
   * Rotate log file when it gets too large
   */
  async rotateLog() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedFile = this.options.logFile.replace('.log', `-${timestamp}.log`);

      await fs.rename(this.options.logFile, rotatedFile);

      await this.logInfo('LOG_ROTATED', 'Log file rotated', {
        oldFile: this.options.logFile,
        newFile: rotatedFile
      });
    } catch (rotateError) {
      console.error('Failed to rotate log file:', rotateError);
    }
  }

  /**
   * Update error metrics
   */
  updateErrorMetrics(errorInfo, startTime) {
    const handlingTime = performance.now() - startTime;

    this.performanceMetrics.totalErrors++;

    // Update by type
    const type = errorInfo.category || 'unknown';
    const typeCount = this.performanceMetrics.errorsByType.get(type) || 0;
    this.performanceMetrics.errorsByType.set(type, typeCount + 1);

    // Update timing metrics
    this.performanceMetrics.averageHandlingTime =
      (this.performanceMetrics.averageHandlingTime * (this.performanceMetrics.totalErrors - 1) + handlingTime) /
      this.performanceMetrics.totalErrors;

    this.performanceMetrics.maxHandlingTime = Math.max(
      this.performanceMetrics.maxHandlingTime,
      handlingTime
    );

    // Keep recent errors for analysis
    this.performanceMetrics.errorsByTimestamp.push({
      timestamp: new Date().toISOString(),
      code: errorInfo.code,
      category: errorInfo.category,
      severity: errorInfo.severity,
      handlingTime
    });

    // Keep only last 100 errors
    if (this.performanceMetrics.errorsByTimestamp.length > 100) {
      this.performanceMetrics.errorsByTimestamp.shift();
    }
  }

  /**
   * Get performance and constitutional compliance report
   */
  getPerformanceReport() {
    const report = {
      summary: {
        totalErrors: this.performanceMetrics.totalErrors,
        averageHandlingTime: Math.round(this.performanceMetrics.averageHandlingTime * 100) / 100,
        maxHandlingTime: Math.round(this.performanceMetrics.maxHandlingTime * 100) / 100,
        constitutionalViolations: this.performanceMetrics.constitutionalViolations
      },
      constitutional: {
        handlingTimeCompliant: this.performanceMetrics.maxHandlingTime <= this.constitutionalLimits.maxHandlingTime,
        averageWithinLimits: this.performanceMetrics.averageHandlingTime <= this.constitutionalLimits.maxHandlingTime / 2,
        violationRate: this.performanceMetrics.totalErrors > 0 ?
          this.performanceMetrics.constitutionalViolations / this.performanceMetrics.totalErrors : 0
      },
      breakdown: {
        byType: Object.fromEntries(this.performanceMetrics.errorsByType),
        recentErrors: this.performanceMetrics.errorsByTimestamp.slice(-10)
      }
    };

    return report;
  }

  /**
   * Create error recovery context
   */
  createRecoveryContext(error, options = {}) {
    return {
      originalError: error,
      timestamp: new Date().toISOString(),
      attemptCount: options.attemptCount || 1,
      maxAttempts: options.maxAttempts || 3,
      strategy: options.strategy || 'retry',
      fallbackValue: options.fallbackValue,
      characterMessage: options.characterMessage
    };
  }

  /**
   * Execute with error recovery
   */
  async executeWithRecovery(fn, recoveryContext = {}) {
    const context = this.createRecoveryContext(null, recoveryContext);

    for (let attempt = 1; attempt <= context.maxAttempts; attempt++) {
      try {
        context.attemptCount = attempt;
        return await fn(context);
      } catch (error) {
        context.originalError = error;

        await this.logError('RECOVERY_ATTEMPT', error, {
          attempt,
          maxAttempts: context.maxAttempts,
          strategy: context.strategy
        });

        if (attempt === context.maxAttempts) {
          if (context.fallbackValue !== undefined) {
            await this.logWarning('RECOVERY_FALLBACK', 'Using fallback value after all attempts failed', {
              fallbackValue: context.fallbackValue
            });
            return context.fallbackValue;
          }
          throw error;
        }

        // Wait before retry (with exponential backoff)
        const delay = Math.min(100 * Math.pow(2, attempt - 1), 1000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    if (typeof process !== 'undefined') {
      process.removeAllListeners('uncaughtException');
      process.removeAllListeners('unhandledRejection');
    }

    await this.logInfo('ERROR_HANDLER_CLEANUP', 'Error handler cleaning up');
    this.initialized = false;
  }

  /**
   * Static factory method
   */
  static async create(options = {}) {
    const handler = new ErrorHandler(options);
    await handler.initialize();
    return handler;
  }

  /**
   * Global error handler setup
   */
  static async setupGlobal(options = {}) {
    const handler = await ErrorHandler.create(options);

    // Make available globally
    if (typeof globalThis !== 'undefined') {
      globalThis.specErrorHandler = handler;
    }

    return handler;
  }
}