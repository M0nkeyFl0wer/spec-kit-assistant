import winston from 'winston';
import { performance } from 'perf_hooks';
import os from 'os';
import { EventEmitter } from 'events';

/**
 * Production-ready monitoring and logging system
 */
export class MonitoringSystem extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      logLevel: process.env.LOG_LEVEL || 'info',
      metricsInterval: 60000, // 1 minute
      alertThresholds: {
        cpuUsage: 80,
        memoryUsage: 85,
        errorRate: 0.05,
        responseTime: 1000
      },
      ...config
    };

    this.metrics = {
      requests: new Map(),
      errors: new Map(),
      performance: new Map(),
      system: {},
      custom: new Map()
    };

    this.logger = this.setupLogger();
    this.startMetricsCollection();
  }

  /**
   * Setup Winston logger with multiple transports
   */
  setupLogger() {
    const logger = winston.createLogger({
      level: this.config.logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: 'spec-kit-assistant',
        environment: process.env.NODE_ENV || 'development'
      },
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
          silent: process.env.NODE_ENV === 'test'
        }),

        // File transport for errors
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 10485760, // 10MB
          maxFiles: 5
        }),

        // File transport for all logs
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 10485760, // 10MB
          maxFiles: 10
        })
      ]
    });

    // Add production transports if configured
    if (process.env.NODE_ENV === 'production') {
      this.addProductionTransports(logger);
    }

    return logger;
  }

  /**
   * Add production logging transports (e.g., CloudWatch, Datadog)
   */
  addProductionTransports(logger) {
    // Example: CloudWatch transport
    if (process.env.CLOUDWATCH_GROUP) {
      // logger.add(new WinstonCloudWatch({
      //   logGroupName: process.env.CLOUDWATCH_GROUP,
      //   logStreamName: `${os.hostname()}-${process.pid}`,
      //   awsRegion: process.env.AWS_REGION
      // }));
    }

    // Example: Datadog transport
    if (process.env.DATADOG_API_KEY) {
      // logger.add(new DatadogTransport({
      //   apiKey: process.env.DATADOG_API_KEY,
      //   hostname: os.hostname(),
      //   service: 'spec-kit-assistant'
      // }));
    }
  }

  /**
   * Log a message with context
   */
  log(level, message, meta = {}) {
    this.logger.log(level, message, {
      ...meta,
      timestamp: new Date().toISOString(),
      pid: process.pid
    });
  }

  /**
   * Log an info message
   */
  info(message, meta) {
    this.log('info', message, meta);
  }

  /**
   * Log a warning message
   */
  warn(message, meta) {
    this.log('warn', message, meta);
  }

  /**
   * Log an error message
   */
  error(message, error, meta = {}) {
    this.log('error', message, {
      ...meta,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code
      }
    });

    // Track error metrics
    this.trackError(error);
  }

  /**
   * Track a request
   */
  trackRequest(requestId, method, path) {
    this.metrics.requests.set(requestId, {
      method,
      path,
      startTime: performance.now(),
      timestamp: Date.now()
    });
  }

  /**
   * Complete a request tracking
   */
  completeRequest(requestId, statusCode) {
    const request = this.metrics.requests.get(requestId);
    if (!request) return;

    const duration = performance.now() - request.startTime;

    this.log('info', 'Request completed', {
      method: request.method,
      path: request.path,
      statusCode,
      duration: Math.round(duration),
      requestId
    });

    // Store performance metrics
    const pathMetrics = this.metrics.performance.get(request.path) || {
      count: 0,
      totalDuration: 0,
      averageDuration: 0,
      maxDuration: 0
    };

    pathMetrics.count++;
    pathMetrics.totalDuration += duration;
    pathMetrics.averageDuration = pathMetrics.totalDuration / pathMetrics.count;
    pathMetrics.maxDuration = Math.max(pathMetrics.maxDuration, duration);

    this.metrics.performance.set(request.path, pathMetrics);

    // Check for slow requests
    if (duration > this.config.alertThresholds.responseTime) {
      this.emit('alert', {
        type: 'slow-request',
        path: request.path,
        duration,
        threshold: this.config.alertThresholds.responseTime
      });
    }

    this.metrics.requests.delete(requestId);
  }

  /**
   * Track an error
   */
  trackError(error) {
    const errorKey = `${error.name}:${error.message}`;
    const errorMetric = this.metrics.errors.get(errorKey) || {
      count: 0,
      firstSeen: Date.now(),
      lastSeen: Date.now()
    };

    errorMetric.count++;
    errorMetric.lastSeen = Date.now();

    this.metrics.errors.set(errorKey, errorMetric);

    // Calculate error rate
    const totalRequests = Array.from(this.metrics.performance.values())
      .reduce((sum, m) => sum + m.count, 0);

    const totalErrors = Array.from(this.metrics.errors.values())
      .reduce((sum, m) => sum + m.count, 0);

    const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0;

    if (errorRate > this.config.alertThresholds.errorRate) {
      this.emit('alert', {
        type: 'high-error-rate',
        errorRate,
        threshold: this.config.alertThresholds.errorRate
      });
    }
  }

  /**
   * Track a custom metric
   */
  trackMetric(name, value, tags = {}) {
    const metric = this.metrics.custom.get(name) || {
      values: [],
      tags
    };

    metric.values.push({
      value,
      timestamp: Date.now()
    });

    // Keep only last 1000 values
    if (metric.values.length > 1000) {
      metric.values.shift();
    }

    this.metrics.custom.set(name, metric);

    this.log('debug', 'Custom metric tracked', {
      name,
      value,
      tags
    });
  }

  /**
   * Start collecting system metrics
   */
  startMetricsCollection() {
    this.metricsInterval = setInterval(() => {
      this.collectSystemMetrics();
      this.reportMetrics();
    }, this.config.metricsInterval);
  }

  /**
   * Collect system metrics
   */
  collectSystemMetrics() {
    const cpuUsage = process.cpuUsage();
    const memUsage = process.memoryUsage();

    this.metrics.system = {
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
        percent: this.calculateCpuPercent()
      },
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        percent: (memUsage.heapUsed / memUsage.heapTotal) * 100
      },
      uptime: process.uptime(),
      loadAverage: os.loadavg(),
      freeMemory: os.freemem(),
      totalMemory: os.totalmem()
    };

    // Check thresholds
    if (this.metrics.system.cpu.percent > this.config.alertThresholds.cpuUsage) {
      this.emit('alert', {
        type: 'high-cpu',
        usage: this.metrics.system.cpu.percent,
        threshold: this.config.alertThresholds.cpuUsage
      });
    }

    if (this.metrics.system.memory.percent > this.config.alertThresholds.memoryUsage) {
      this.emit('alert', {
        type: 'high-memory',
        usage: this.metrics.system.memory.percent,
        threshold: this.config.alertThresholds.memoryUsage
      });
    }
  }

  /**
   * Calculate CPU percentage
   */
  calculateCpuPercent() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const percent = 100 - ~~(100 * idle / total);

    return percent;
  }

  /**
   * Report metrics to external services
   */
  reportMetrics() {
    const report = {
      timestamp: Date.now(),
      system: this.metrics.system,
      performance: Object.fromEntries(this.metrics.performance),
      errors: Object.fromEntries(this.metrics.errors),
      custom: Object.fromEntries(this.metrics.custom)
    };

    // Log metrics summary
    this.log('info', 'Metrics report', report);

    // Send to external monitoring services
    this.sendToMonitoringServices(report);
  }

  /**
   * Send metrics to external monitoring services
   */
  async sendToMonitoringServices(report) {
    // Example: Send to Datadog
    if (process.env.DATADOG_API_KEY) {
      // await this.sendToDatadog(report);
    }

    // Example: Send to New Relic
    if (process.env.NEW_RELIC_API_KEY) {
      // await this.sendToNewRelic(report);
    }

    // Example: Send to custom webhook
    if (process.env.METRICS_WEBHOOK_URL) {
      // await this.sendToWebhook(report);
    }
  }

  /**
   * Create a child logger with additional context
   */
  createChildLogger(context) {
    return {
      info: (message, meta) => this.info(message, { ...context, ...meta }),
      warn: (message, meta) => this.warn(message, { ...context, ...meta }),
      error: (message, error, meta) => this.error(message, error, { ...context, ...meta })
    };
  }

  /**
   * Middleware for Express apps
   */
  expressMiddleware() {
    return (req, res, next) => {
      const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      req.requestId = requestId;
      req.logger = this.createChildLogger({ requestId });

      this.trackRequest(requestId, req.method, req.path);

      // Track response
      const originalSend = res.send;
      res.send = (data) => {
        this.completeRequest(requestId, res.statusCode);
        return originalSend.call(res, data);
      };

      next();
    };
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary() {
    return {
      system: this.metrics.system,
      performance: Object.fromEntries(this.metrics.performance),
      errors: Object.fromEntries(this.metrics.errors),
      activeRequests: this.metrics.requests.size,
      uptime: process.uptime()
    };
  }

  /**
   * Health check
   */
  isHealthy() {
    const checks = {
      memory: this.metrics.system.memory.percent < this.config.alertThresholds.memoryUsage,
      cpu: this.metrics.system.cpu.percent < this.config.alertThresholds.cpuUsage,
      errors: this.calculateErrorRate() < this.config.alertThresholds.errorRate,
      uptime: process.uptime() > 10 // At least 10 seconds uptime
    };

    const healthy = Object.values(checks).every(check => check);

    return {
      healthy,
      checks,
      timestamp: Date.now()
    };
  }

  /**
   * Calculate current error rate
   */
  calculateErrorRate() {
    const recentErrors = Array.from(this.metrics.errors.values())
      .filter(e => Date.now() - e.lastSeen < 60000) // Last minute
      .reduce((sum, e) => sum + e.count, 0);

    const recentRequests = Array.from(this.metrics.performance.values())
      .reduce((sum, m) => sum + m.count, 0);

    return recentRequests > 0 ? recentErrors / recentRequests : 0;
  }

  /**
   * Graceful shutdown
   */
  shutdown() {
    clearInterval(this.metricsInterval);
    this.log('info', 'Monitoring system shutting down');

    // Flush any remaining logs
    this.logger.end();
  }
}

// Create singleton instance
let monitoringInstance;

export function getMonitoring(config) {
  if (!monitoringInstance) {
    monitoringInstance = new MonitoringSystem(config);
  }
  return monitoringInstance;
}

export default MonitoringSystem;