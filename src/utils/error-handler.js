import { getMonitoring } from './monitoring.js';

/**
 * Custom error classes for different error types
 */
export class ApplicationError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = {}) {
    super(message);
    this.name = 'ApplicationError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
      stack: process.env.NODE_ENV === 'development' ? this.stack : undefined,
    };
  }
}

export class ValidationError extends ApplicationError {
  constructor(message, field, value) {
    super(message, 400, 'VALIDATION_ERROR', { field, value });
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApplicationError {
  constructor(message = 'Permission denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApplicationError {
  constructor(resource, id) {
    super(`${resource} not found`, 404, 'NOT_FOUND', { resource, id });
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApplicationError {
  constructor(message, resource) {
    super(message, 409, 'CONFLICT', { resource });
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends ApplicationError {
  constructor(limit, window) {
    super('Rate limit exceeded', 429, 'RATE_LIMIT', { limit, window });
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends ApplicationError {
  constructor(service, originalError) {
    super(`External service error: ${service}`, 503, 'EXTERNAL_SERVICE_ERROR', {
      service,
      originalMessage: originalError.message,
    });
    this.name = 'ExternalServiceError';
  }
}

/**
 * Global error handler for uncaught exceptions and rejections
 */
export class ErrorHandler {
  constructor() {
    this.monitoring = getMonitoring();
    this.errorQueue = [];
    this.maxQueueSize = 100;
    this.setupHandlers();
  }

  /**
   * Setup global error handlers
   */
  setupHandlers() {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.handleFatalError('uncaughtException', error);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.handleFatalError('unhandledRejection', reason);
    });

    // Handle warnings
    process.on('warning', (warning) => {
      this.monitoring.warn('Process warning', {
        name: warning.name,
        message: warning.message,
        stack: warning.stack,
      });
    });

    // Handle SIGTERM for graceful shutdown
    process.on('SIGTERM', () => {
      this.handleShutdown('SIGTERM');
    });

    // Handle SIGINT for graceful shutdown
    process.on('SIGINT', () => {
      this.handleShutdown('SIGINT');
    });
  }

  /**
   * Handle fatal errors
   */
  handleFatalError(type, error) {
    console.error(`Fatal error (${type}):`, error);

    // Log to monitoring
    this.monitoring.error(`Fatal error: ${type}`, error, {
      type,
      fatal: true,
    });

    // Queue error for recovery attempt
    this.queueError(error);

    // Attempt recovery or exit
    if (this.canRecover(error)) {
      this.attemptRecovery(error);
    } else {
      this.gracefulExit(1);
    }
  }

  /**
   * Queue error for analysis
   */
  queueError(error) {
    this.errorQueue.push({
      error,
      timestamp: Date.now(),
      context: this.captureContext(),
    });

    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  /**
   * Capture current context for error analysis
   */
  captureContext() {
    return {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
      platform: process.platform,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
    };
  }

  /**
   * Check if error is recoverable
   */
  canRecover(error) {
    // Define recoverable error patterns
    const recoverablePatterns = [
      /ECONNRESET/,
      /ETIMEDOUT/,
      /ENOTFOUND/,
      /socket hang up/,
    ];

    return recoverablePatterns.some((pattern) => pattern.test(error.message || error.toString()));
  }

  /**
   * Attempt to recover from error
   */
  attemptRecovery(error) {
    this.monitoring.info('Attempting error recovery', {
      error: error.message,
      attempt: 1,
    });

    // Implement recovery strategies
    if (error.message?.includes('ECONNRESET')) {
      this.recoverConnection();
    } else if (error.message?.includes('memory')) {
      this.recoverMemory();
    } else {
      this.genericRecovery();
    }
  }

  /**
   * Recover from connection errors
   */
  recoverConnection() {
    // Reset connections, clear pools, etc.
    this.monitoring.info('Recovering from connection error');

    // Emit recovery event
    process.emit('connection-recovery');
  }

  /**
   * Recover from memory issues
   */
  recoverMemory() {
    this.monitoring.info('Recovering from memory issue');

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    // Clear caches
    process.emit('clear-caches');
  }

  /**
   * Generic recovery attempt
   */
  genericRecovery() {
    this.monitoring.info('Attempting generic recovery');

    // Emit generic recovery event
    process.emit('error-recovery');
  }

  /**
   * Handle graceful shutdown
   */
  handleShutdown(signal) {
    console.info(`Received ${signal}, starting graceful shutdown...`);

    this.monitoring.info('Graceful shutdown initiated', { signal });

    // Set shutdown timeout
    const shutdownTimeout = setTimeout(() => {
      console.error('Graceful shutdown timeout, forcing exit');
      process.exit(1);
    }, 30000); // 30 seconds timeout

    // Perform cleanup
    this.cleanup()
      .then(() => {
        console.info('Graceful shutdown completed');
        clearTimeout(shutdownTimeout);
        process.exit(0);
      })
      .catch((error) => {
        console.error('Error during shutdown:', error);
        clearTimeout(shutdownTimeout);
        process.exit(1);
      });
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    const cleanupTasks = [];

    // Close database connections
    cleanupTasks.push(this.closeDatabaseConnections());

    // Close server connections
    cleanupTasks.push(this.closeServerConnections());

    // Flush logs
    cleanupTasks.push(this.flushLogs());

    // Save state if needed
    cleanupTasks.push(this.saveState());

    await Promise.allSettled(cleanupTasks);
  }

  /**
   * Close database connections
   */
  async closeDatabaseConnections() {
    // Implement database cleanup
    process.emit('close-database');
  }

  /**
   * Close server connections
   */
  async closeServerConnections() {
    // Implement server cleanup
    process.emit('close-servers');
  }

  /**
   * Flush logs
   */
  async flushLogs() {
    this.monitoring.shutdown();
  }

  /**
   * Save application state
   */
  async saveState() {
    // Save any critical state
    process.emit('save-state');
  }

  /**
   * Graceful exit
   */
  gracefulExit(code = 0) {
    this.cleanup()
      .finally(() => {
        process.exit(code);
      });
  }

  /**
   * Express error middleware
   */
  expressErrorHandler() {
    return (error, req, res, next) => {
      // Log error
      this.monitoring.error('Request error', error, {
        method: req.method,
        path: req.path,
        ip: req.ip,
        requestId: req.requestId,
      });

      // Queue error
      this.queueError(error);

      // Determine status code
      const statusCode = error.statusCode || error.status || 500;

      // Prepare error response
      const errorResponse = this.formatErrorResponse(error, statusCode);

      // Send response
      res.status(statusCode).json(errorResponse);
    };
  }

  /**
   * Format error response
   */
  formatErrorResponse(error, statusCode) {
    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
      return {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An internal error occurred',
          timestamp: new Date().toISOString(),
        },
      };
    }

    // Format application errors
    if (error instanceof ApplicationError) {
      return {
        error: error.toJSON(),
      };
    }

    // Format validation errors (from libraries like Joi, Yup, etc.)
    if (error.name === 'ValidationError' && error.details) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.details,
          timestamp: new Date().toISOString(),
        },
      };
    }

    // Default error format
    return {
      error: {
        code: error.code || 'ERROR',
        message: error.message || 'An error occurred',
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      },
    };
  }

  /**
   * Async error wrapper for route handlers
   */
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const recentErrors = this.errorQueue.filter(
      (e) => Date.now() - e.timestamp < 3600000, // Last hour
    );

    const errorTypes = {};
    recentErrors.forEach(({ error }) => {
      const type = error.name || 'Unknown';
      errorTypes[type] = (errorTypes[type] || 0) + 1;
    });

    return {
      total: this.errorQueue.length,
      recent: recentErrors.length,
      types: errorTypes,
      oldestError: this.errorQueue[0]?.timestamp,
      newestError: this.errorQueue[this.errorQueue.length - 1]?.timestamp,
    };
  }

  /**
   * Clear error queue
   */
  clearErrorQueue() {
    const count = this.errorQueue.length;
    this.errorQueue = [];
    return count;
  }
}

// Create singleton instance
let errorHandlerInstance;

export function getErrorHandler() {
  if (!errorHandlerInstance) {
    errorHandlerInstance = new ErrorHandler();
  }
  return errorHandlerInstance;
}

// Helper function to create errors
export function createError(type, ...args) {
  const errorTypes = {
    validation: ValidationError,
    authentication: AuthenticationError,
    authorization: AuthorizationError,
    notFound: NotFoundError,
    conflict: ConflictError,
    rateLimit: RateLimitError,
    external: ExternalServiceError,
    application: ApplicationError,
  };

  const ErrorClass = errorTypes[type] || ApplicationError;
  return new ErrorClass(...args);
}

export default ErrorHandler;
