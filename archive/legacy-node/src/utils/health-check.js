import os from 'os';
import fs from 'fs-extra';
import { performance } from 'perf_hooks';
import { getMonitoring } from './monitoring.js';

/**
 * Comprehensive health check system for production monitoring
 */
export class HealthCheckSystem {
  constructor(config = {}) {
    this.config = {
      checks: {
        system: true,
        database: true,
        redis: true,
        external: true,
        filesystem: true,
      },
      thresholds: {
        responseTime: 1000, // ms
        memoryUsage: 90, // percent
        cpuUsage: 80, // percent
        diskUsage: 90, // percent
        errorRate: 5, // percent
      },
      ...config,
    };

    this.monitoring = getMonitoring();
    this.checks = new Map();
    this.lastCheckResult = null;
    this.setupChecks();
  }

  /**
   * Setup health checks
   */
  setupChecks() {
    // System health check
    this.registerCheck('system', async () => this.checkSystem());

    // Database health check
    this.registerCheck('database', async () => this.checkDatabase());

    // Redis health check
    this.registerCheck('redis', async () => this.checkRedis());

    // External services health check
    this.registerCheck('external', async () => this.checkExternalServices());

    // Filesystem health check
    this.registerCheck('filesystem', async () => this.checkFilesystem());

    // Custom health checks
    this.registerCheck('custom', async () => this.checkCustom());
  }

  /**
   * Register a health check
   */
  registerCheck(name, checkFn, critical = false) {
    this.checks.set(name, {
      fn: checkFn,
      critical,
      lastResult: null,
      lastCheck: null,
    });
  }

  /**
   * Run all health checks
   */
  async runHealthChecks() {
    const startTime = performance.now();
    const results = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {},
      duration: 0,
    };

    // Run all checks in parallel
    const checkPromises = [];
    for (const [name, check] of this.checks) {
      if (this.config.checks[name] !== false) {
        checkPromises.push(
          this.runCheck(name, check).then((result) => {
            results.checks[name] = result;
            if (!result.healthy) {
              if (check.critical) {
                results.status = 'unhealthy';
              } else if (results.status === 'healthy') {
                results.status = 'degraded';
              }
            }
          }),
        );
      }
    }

    await Promise.allSettled(checkPromises);

    results.duration = Math.round(performance.now() - startTime);
    this.lastCheckResult = results;

    // Log health check result
    if (results.status !== 'healthy') {
      this.monitoring.warn('Health check failed', results);
    }

    return results;
  }

  /**
   * Run a single health check
   */
  async runCheck(name, check) {
    const startTime = performance.now();

    try {
      const result = await Promise.race([
        check.fn(),
        this.timeout(this.config.thresholds.responseTime),
      ]);

      const duration = Math.round(performance.now() - startTime);

      check.lastResult = {
        healthy: result.healthy,
        message: result.message,
        details: result.details,
        duration,
        timestamp: new Date().toISOString(),
      };

      check.lastCheck = Date.now();

      return check.lastResult;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);

      check.lastResult = {
        healthy: false,
        message: error.message,
        error: error.toString(),
        duration,
        timestamp: new Date().toISOString(),
      };

      check.lastCheck = Date.now();

      return check.lastResult;
    }
  }

  /**
   * Timeout promise
   */
  timeout(ms) {
    return new Promise((_, reject) => setTimeout(() => reject(new Error(`Health check timeout after ${ms}ms`)), ms));
  }

  /**
   * Check system health
   */
  async checkSystem() {
    const checks = {
      memory: this.checkMemory(),
      cpu: this.checkCPU(),
      disk: await this.checkDisk(),
      uptime: this.checkUptime(),
    };

    const unhealthy = Object.values(checks).filter((c) => !c.healthy);

    return {
      healthy: unhealthy.length === 0,
      message: unhealthy.length === 0 ? 'System healthy' : 'System issues detected',
      details: checks,
    };
  }

  /**
   * Check memory usage
   */
  checkMemory() {
    const usage = process.memoryUsage();
    const totalMemory = os.totalmem();
    const usedMemory = totalMemory - os.freemem();
    const percentUsed = (usedMemory / totalMemory) * 100;

    return {
      healthy: percentUsed < this.config.thresholds.memoryUsage,
      usage: {
        percent: Math.round(percentUsed),
        used: this.formatBytes(usedMemory),
        total: this.formatBytes(totalMemory),
        heap: this.formatBytes(usage.heapUsed),
        heapTotal: this.formatBytes(usage.heapTotal),
      },
    };
  }

  /**
   * Check CPU usage
   */
  checkCPU() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach((cpu) => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const percentUsed = 100 - ~~(100 * idle / total);

    return {
      healthy: percentUsed < this.config.thresholds.cpuUsage,
      usage: {
        percent: percentUsed,
        cores: cpus.length,
        loadAverage: os.loadavg(),
      },
    };
  }

  /**
   * Check disk usage
   */
  async checkDisk() {
    try {
      // This is a simplified check - in production you'd use a library like diskusage
      const stats = await fs.statfs('/');
      const totalSpace = stats.blocks * stats.bsize;
      const freeSpace = stats.bfree * stats.bsize;
      const usedSpace = totalSpace - freeSpace;
      const percentUsed = (usedSpace / totalSpace) * 100;

      return {
        healthy: percentUsed < this.config.thresholds.diskUsage,
        usage: {
          percent: Math.round(percentUsed),
          used: this.formatBytes(usedSpace),
          free: this.formatBytes(freeSpace),
          total: this.formatBytes(totalSpace),
        },
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
      };
    }
  }

  /**
   * Check uptime
   */
  checkUptime() {
    const uptime = process.uptime();
    const systemUptime = os.uptime();

    return {
      healthy: true,
      uptime: {
        process: this.formatDuration(uptime),
        system: this.formatDuration(systemUptime),
      },
    };
  }

  /**
   * Check database health
   */
  async checkDatabase() {
    try {
      // Example database check - implement based on your database
      // const db = getDatabase();
      // await db.query('SELECT 1');

      return {
        healthy: true,
        message: 'Database connection healthy',
      };
    } catch (error) {
      return {
        healthy: false,
        message: 'Database connection failed',
        error: error.message,
      };
    }
  }

  /**
   * Check Redis health
   */
  async checkRedis() {
    try {
      // Example Redis check - implement based on your Redis client
      // const redis = getRedis();
      // await redis.ping();

      return {
        healthy: true,
        message: 'Redis connection healthy',
      };
    } catch (error) {
      return {
        healthy: false,
        message: 'Redis connection failed',
        error: error.message,
      };
    }
  }

  /**
   * Check external services
   */
  async checkExternalServices() {
    const services = [
      { name: 'GitHub API', url: 'https://api.github.com/health' },
      { name: 'Cloud Provider', url: process.env.CLOUD_HEALTH_URL },
    ].filter((s) => s.url);

    const results = await Promise.allSettled(
      services.map((service) => this.checkExternalService(service)),
    );

    const healthy = results.every((r) => r.status === 'fulfilled' && r.value.healthy);

    return {
      healthy,
      message: healthy ? 'All external services healthy' : 'Some external services unhealthy',
      services: results.map((r, i) => ({
        name: services[i].name,
        ...r.value,
      })),
    };
  }

  /**
   * Check a single external service
   */
  async checkExternalService(service) {
    try {
      const response = await fetch(service.url, {
        method: 'GET',
        timeout: 5000,
      });

      return {
        healthy: response.ok,
        statusCode: response.status,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
      };
    }
  }

  /**
   * Check filesystem
   */
  async checkFilesystem() {
    const paths = [
      { path: './logs', write: true },
      { path: './temp', write: true },
      { path: './.spec-assistant', write: true },
    ];

    const results = await Promise.allSettled(
      paths.map((p) => this.checkPath(p)),
    );

    const healthy = results.every((r) => r.status === 'fulfilled' && r.value.healthy);

    return {
      healthy,
      message: healthy ? 'Filesystem access healthy' : 'Filesystem issues detected',
      paths: results.map((r, i) => ({
        path: paths[i].path,
        ...r.value,
      })),
    };
  }

  /**
   * Check a filesystem path
   */
  async checkPath(pathConfig) {
    try {
      await fs.access(pathConfig.path, fs.constants.R_OK);

      if (pathConfig.write) {
        await fs.access(pathConfig.path, fs.constants.W_OK);
      }

      return { healthy: true };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
      };
    }
  }

  /**
   * Check custom health checks
   */
  async checkCustom() {
    // Add any custom health checks here
    return {
      healthy: true,
      message: 'Custom checks passed',
    };
  }

  /**
   * Get liveness status (is the application running?)
   */
  async getLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * Get readiness status (is the application ready to serve traffic?)
   */
  async getReadiness() {
    const health = await this.runHealthChecks();

    return {
      ready: health.status === 'healthy' || health.status === 'degraded',
      status: health.status,
      timestamp: health.timestamp,
      checks: Object.keys(health.checks).reduce((acc, key) => {
        acc[key] = health.checks[key].healthy;
        return acc;
      }, {}),
    };
  }

  /**
   * Express middleware for health endpoints
   */
  expressMiddleware() {
    const router = require('express').Router();

    // Liveness probe
    router.get('/live', async (req, res) => {
      const liveness = await this.getLiveness();
      res.json(liveness);
    });

    // Readiness probe
    router.get('/ready', async (req, res) => {
      const readiness = await this.getReadiness();
      res.status(readiness.ready ? 200 : 503).json(readiness);
    });

    // Detailed health check
    router.get('/', async (req, res) => {
      const health = await this.runHealthChecks();
      const statusCode = health.status === 'healthy' ? 200
        : health.status === 'degraded' ? 200 : 503;
      res.status(statusCode).json(health);
    });

    return router;
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / 1024 ** i * 100) / 100} ${sizes[i]}`;
  }

  /**
   * Format duration to human readable
   */
  formatDuration(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }
}

// Create singleton instance
let healthCheckInstance;

export function getHealthCheck(config) {
  if (!healthCheckInstance) {
    healthCheckInstance = new HealthCheckSystem(config);
  }
  return healthCheckInstance;
}

export default HealthCheckSystem;
