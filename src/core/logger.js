/**
 * Centralized logging system with constitutional compliance
 * Works in conjunction with ErrorHandler for comprehensive logging
 */

import fs from 'fs/promises';
import path from 'path';
import { performance } from 'perf_hooks';

export class Logger {
  constructor(options = {}) {
    this.options = {
      name: options.name || 'spec-kit',
      level: options.level || 'info',
      logDir: options.logDir || 'logs',
      enableConsole: options.enableConsole !== false,
      enableFile: options.enableFile !== false,
      enableStructured: options.enableStructured !== false,
      colorize: options.colorize !== false,
      constitutionalCompliance: true,
      ...options
    };

    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      trace: 4
    };

    this.colors = {
      error: '\x1b[31m', // Red
      warn: '\x1b[33m',  // Yellow
      info: '\x1b[36m',  // Cyan
      debug: '\x1b[32m', // Green
      trace: '\x1b[37m', // White
      reset: '\x1b[0m'
    };

    this.sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.logCount = 0;
    this.startTime = performance.now();

    this.constitutionalLimits = {
      maxLogTime: 50, // 50ms max for logging operation
      maxMemoryPerLog: 1024 * 1024, // 1MB per log entry
      maxLogsPerSecond: 100
    };

    this.rateLimit = {
      count: 0,
      windowStart: Date.now()
    };
  }

  /**
   * Initialize logger
   */
  async initialize() {
    if (this.options.enableFile) {
      await fs.mkdir(this.options.logDir, { recursive: true });
    }

    await this.log('info', 'LOGGER_INITIALIZED', 'Logger initialized with constitutional compliance', {
      sessionId: this.sessionId,
      options: this.options
    });
  }

  /**
   * Main logging method with constitutional compliance
   */
  async log(level, code, message, context = {}) {
    const startTime = performance.now();

    try {
      // Check rate limiting (constitutional compliance)
      if (!this.checkRateLimit()) {
        return; // Silently drop logs that exceed rate limit
      }

      // Check if we should log this level
      if (this.levels[level] > this.levels[this.options.level]) {
        return;
      }

      const logEntry = this.createLogEntry(level, code, message, context);

      // Constitutional timing check
      const createTime = performance.now() - startTime;
      if (createTime > this.constitutionalLimits.maxLogTime / 2) {
        logEntry.constitutional = { warning: 'Log creation took longer than expected' };
      }

      // Write to outputs
      await Promise.all([
        this.options.enableConsole ? this.writeToConsole(logEntry) : Promise.resolve(),
        this.options.enableFile ? this.writeToFile(logEntry) : Promise.resolve()
      ]);

      // Track constitutional compliance
      const totalTime = performance.now() - startTime;
      if (totalTime > this.constitutionalLimits.maxLogTime) {
        console.warn(`⚠️ Constitutional violation: Logging took ${totalTime.toFixed(2)}ms (limit: ${this.constitutionalLimits.maxLogTime}ms)`);
      }

      this.logCount++;

    } catch (error) {
      // Fallback logging if main logging fails
      console.error('Logger failed:', error);
      console.log(`[${level.toUpperCase()}] ${code}: ${message}`);
    }
  }

  /**
   * Create structured log entry
   */
  createLogEntry(level, code, message, context = {}) {
    const now = new Date();
    const uptime = performance.now() - this.startTime;

    return {
      timestamp: now.toISOString(),
      sessionId: this.sessionId,
      logId: `${this.sessionId}_${this.logCount}`,
      level,
      code,
      message,
      context,
      metadata: {
        uptime: Math.round(uptime),
        pid: typeof process !== 'undefined' ? process.pid : undefined,
        memory: typeof process !== 'undefined' ? {
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        } : undefined,
        platform: typeof process !== 'undefined' ? process.platform : 'browser'
      }
    };
  }

  /**
   * Check rate limiting for constitutional compliance
   */
  checkRateLimit() {
    const now = Date.now();
    const windowSize = 1000; // 1 second window

    // Reset window if needed
    if (now - this.rateLimit.windowStart > windowSize) {
      this.rateLimit.count = 0;
      this.rateLimit.windowStart = now;
    }

    // Check limit
    if (this.rateLimit.count >= this.constitutionalLimits.maxLogsPerSecond) {
      return false;
    }

    this.rateLimit.count++;
    return true;
  }

  /**
   * Write to console with formatting
   */
  async writeToConsole(logEntry) {
    const { level, code, message, timestamp } = logEntry;
    const time = new Date(timestamp).toTimeString().split(' ')[0];

    let output = '';

    if (this.options.colorize && this.colors[level]) {
      output = `${this.colors[level]}[${time}] ${level.toUpperCase()} ${code}${this.colors.reset}: ${message}`;
    } else {
      output = `[${time}] ${level.toUpperCase()} ${code}: ${message}`;
    }

    // Add context if debug level
    if (this.levels[this.options.level] >= this.levels.debug && Object.keys(logEntry.context).length > 0) {
      output += `\n  Context: ${JSON.stringify(logEntry.context, null, 2)}`;
    }

    const consoleMethod = level === 'error' ? 'error' :
                        level === 'warn' ? 'warn' : 'log';
    console[consoleMethod](output);
  }

  /**
   * Write to file in structured format
   */
  async writeToFile(logEntry) {
    try {
      const fileName = `${this.options.name}-${new Date().toISOString().split('T')[0]}.log`;
      const filePath = path.join(this.options.logDir, fileName);

      const logLine = JSON.stringify(logEntry) + '\n';

      // Check size limit
      if (logLine.length > this.constitutionalLimits.maxMemoryPerLog) {
        const truncated = {
          ...logEntry,
          context: { truncated: true, originalSize: logLine.length },
          message: logEntry.message.substring(0, 1000) + '...[truncated]'
        };
        await fs.appendFile(filePath, JSON.stringify(truncated) + '\n', 'utf8');
      } else {
        await fs.appendFile(filePath, logLine, 'utf8');
      }

    } catch (fileError) {
      console.error('Failed to write log to file:', fileError);
    }
  }

  /**
   * Convenience methods for different log levels
   */
  async error(code, message, context = {}) {
    return this.log('error', code, message, context);
  }

  async warn(code, message, context = {}) {
    return this.log('warn', code, message, context);
  }

  async info(code, message, context = {}) {
    return this.log('info', code, message, context);
  }

  async debug(code, message, context = {}) {
    return this.log('debug', code, message, context);
  }

  async trace(code, message, context = {}) {
    return this.log('trace', code, message, context);
  }

  /**
   * Special methods for Spec character logging
   */
  async specLog(message, context = {}) {
    const specContext = {
      ...context,
      character: 'spec',
      personality: 'friendly'
    };

    // Validate that message fits Spec's personality
    if (message.includes('🐕') || message.includes('wag') || message.includes('fetch')) {
      return this.info('SPEC_MESSAGE', message, specContext);
    } else {
      return this.info('SPEC_ACTIVITY', message, specContext);
    }
  }

  /**
   * Performance logging with constitutional compliance
   */
  async performanceLog(operation, duration, context = {}) {
    const perfContext = {
      ...context,
      operation,
      duration: Math.round(duration * 100) / 100,
      constitutional: {
        withinLimits: duration <= 500, // 500ms constitutional limit
        efficiency: duration <= 100 ? 'excellent' :
                   duration <= 500 ? 'good' :
                   duration <= 1000 ? 'acceptable' : 'violation'
      }
    };

    const level = duration > 500 ? 'warn' : 'info';
    const code = duration > 500 ? 'PERFORMANCE_VIOLATION' : 'PERFORMANCE_METRIC';

    return this.log(level, code, `${operation} completed in ${duration.toFixed(2)}ms`, perfContext);
  }

  /**
   * Animation logging with timing validation
   */
  async animationLog(sequenceName, duration, frames, context = {}) {
    const animContext = {
      ...context,
      sequence: sequenceName,
      duration: Math.round(duration * 100) / 100,
      frames,
      constitutional: {
        withinAnimationLimit: duration <= 500,
        framesPerSecond: Math.round(frames / (duration / 1000))
      }
    };

    const level = duration > 500 ? 'warn' : 'debug';
    const code = duration > 500 ? 'ANIMATION_VIOLATION' : 'ANIMATION_COMPLETE';

    return this.log(level, code, `Animation "${sequenceName}" completed`, animContext);
  }

  /**
   * Get logging statistics
   */
  getStats() {
    const uptime = performance.now() - this.startTime;

    return {
      sessionId: this.sessionId,
      uptime: Math.round(uptime),
      totalLogs: this.logCount,
      logsPerSecond: Math.round((this.logCount / (uptime / 1000)) * 100) / 100,
      constitutional: {
        rateCompliant: this.rateLimit.count < this.constitutionalLimits.maxLogsPerSecond,
        currentRate: this.rateLimit.count,
        rateLimit: this.constitutionalLimits.maxLogsPerSecond
      }
    };
  }

  /**
   * Create child logger with inherited context
   */
  child(childContext = {}) {
    return new ChildLogger(this, childContext);
  }

  /**
   * Static factory method
   */
  static async create(options = {}) {
    const logger = new Logger(options);
    await logger.initialize();
    return logger;
  }
}

/**
 * Child logger that inherits from parent with additional context
 */
export class ChildLogger {
  constructor(parent, childContext = {}) {
    this.parent = parent;
    this.childContext = childContext;
  }

  async log(level, code, message, context = {}) {
    const mergedContext = { ...this.childContext, ...context };
    return this.parent.log(level, code, message, mergedContext);
  }

  async error(code, message, context = {}) {
    return this.log('error', code, message, context);
  }

  async warn(code, message, context = {}) {
    return this.log('warn', code, message, context);
  }

  async info(code, message, context = {}) {
    return this.log('info', code, message, context);
  }

  async debug(code, message, context = {}) {
    return this.log('debug', code, message, context);
  }

  async trace(code, message, context = {}) {
    return this.log('trace', code, message, context);
  }

  async specLog(message, context = {}) {
    return this.parent.specLog(message, { ...this.childContext, ...context });
  }

  async performanceLog(operation, duration, context = {}) {
    return this.parent.performanceLog(operation, duration, { ...this.childContext, ...context });
  }

  async animationLog(sequenceName, duration, frames, context = {}) {
    return this.parent.animationLog(sequenceName, duration, frames, { ...this.childContext, ...context });
  }

  child(additionalContext = {}) {
    return new ChildLogger(this.parent, { ...this.childContext, ...additionalContext });
  }
}