import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import { secureReadFile, validatePath } from './secure-path.js';

/**
 * Secure Configuration Management
 * Handles secrets, API keys, and configuration with proper security
 */
export class SecureConfig {
  constructor() {
    this.config = new Map();
    this.secrets = new Map();
    this.configLoaded = false;

    // Default secure configuration
    this.defaults = {
      // WebSocket Security
      'websocket.authRequired': true,
      'websocket.maxConnections': 100,
      'websocket.messageRateLimit': 10,
      'websocket.maxMessageSize': 65536, // 64KB
      'websocket.heartbeatInterval': 30000,

      // File Security
      'files.maxSize': 10485760, // 10MB
      'files.allowedExtensions': ['.json', '.yaml', '.yml', '.txt', '.md'],
      'files.preventOverwrite': false,

      // Agent Security
      'agents.maxCount': 10,
      'agents.timeout': 300000, // 5 minutes
      'agents.retryAttempts': 3,

      // Security Settings
      'security.tokenExpiry': 3600000, // 1 hour
      'security.maxFailedAuth': 3,
      'security.lockoutDuration': 900000, // 15 minutes

      // Logging
      'logging.level': 'info',
      'logging.maxSize': 104857600, // 100MB
      'logging.retention': 30, // days
    };
  }

  /**
   * Load configuration from environment and config files
   */
  async loadConfig() {
    if (this.configLoaded) return;

    try {
      // Load from environment variables
      this.loadFromEnvironment();

      // Load from secure config file if it exists
      await this.loadFromConfigFile();

      // Generate or load encryption key for secrets
      await this.initializeEncryption();

      this.configLoaded = true;
      console.log('🔧 Secure configuration loaded successfully');
    } catch (error) {
      console.warn('Warning: Failed to load some configuration:', error.message);
      // Continue with defaults - don't fail startup
    }
  }

  /**
   * Load configuration from environment variables
   */
  loadFromEnvironment() {
    const envMappings = {
      // API Keys (these should be set as environment variables)
      ELEVENLABS_API_KEY: 'api.elevenlabs.key',
      OPENAI_API_KEY: 'api.openai.key',
      GOOGLE_CLOUD_PROJECT: 'gcp.projectId',
      GOOGLE_APPLICATION_CREDENTIALS: 'gcp.credentialsPath',

      // Security Settings
      SPEC_KIT_SECRET: 'security.secret',
      WEBSOCKET_AUTH_SECRET: 'websocket.authSecret',
      SESSION_SECRET: 'security.sessionSecret',

      // Feature Toggles
      VOICE_ENABLED: 'features.voiceEnabled',
      CLOUD_ENABLED: 'features.cloudEnabled',
      DEBUG_ENABLED: 'debug.enabled',

      // Limits
      MAX_AGENTS: 'agents.maxCount',
      MAX_FILE_SIZE: 'files.maxSize',
      MAX_CONNECTIONS: 'websocket.maxConnections',
    };

    Object.entries(envMappings).forEach(([envVar, configKey]) => {
      const value = process.env[envVar];
      if (value !== undefined) {
        // Convert string values to appropriate types
        const convertedValue = this.convertConfigValue(value);

        if (this.isSecretKey(configKey)) {
          this.secrets.set(configKey, convertedValue);
        } else {
          this.config.set(configKey, convertedValue);
        }
      }
    });
  }

  /**
   * Load configuration from secure config file
   */
  async loadFromConfigFile() {
    try {
      const configContent = await secureReadFile('config.json', 'config', {
        allowedExtensions: ['.json'],
        maxSize: 1024 * 1024, // 1MB max
      });

      const fileConfig = JSON.parse(configContent);

      // Process file configuration
      this.processConfigObject(fileConfig, '');
    } catch (error) {
      // Config file is optional
      console.log('No config file found - using environment and defaults');
    }
  }

  /**
   * Process nested configuration object
   */
  processConfigObject(obj, prefix) {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        this.processConfigObject(value, fullKey);
      } else if (this.isSecretKey(fullKey)) {
        this.secrets.set(fullKey, value);
      } else {
        this.config.set(fullKey, value);
      }
    }
  }

  /**
   * Initialize encryption for secrets
   */
  async initializeEncryption() {
    // Generate or load master key for encrypting secrets at rest
    let masterKey = this.secrets.get('security.masterKey');

    if (!masterKey) {
      // Generate new master key
      masterKey = crypto.randomBytes(32).toString('hex');
      this.secrets.set('security.masterKey', masterKey);

      // In production, this should be stored securely (HSM, Key Vault, etc.)
      console.warn('⚠️ Generated new master key - store securely in production!');
    }
  }

  /**
   * Check if a configuration key is a secret
   */
  isSecretKey(key) {
    const secretPatterns = [
      /\.key$/i,
      /\.secret$/i,
      /\.token$/i,
      /\.password$/i,
      /api\./i,
      /auth/i,
    ];

    return secretPatterns.some((pattern) => pattern.test(key));
  }

  /**
   * Convert string configuration values to appropriate types
   */
  convertConfigValue(value) {
    // Boolean conversion
    if (value === 'true') return true;
    if (value === 'false') return false;

    // Number conversion
    if (/^\d+$/.test(value)) return parseInt(value, 10);
    if (/^\d+\.\d+$/.test(value)) return parseFloat(value);

    // Array conversion (comma-separated)
    if (value.includes(',')) {
      return value.split(',').map((v) => v.trim());
    }

    return value;
  }

  /**
   * Get configuration value with fallback to default
   */
  get(key, defaultValue = null) {
    // First check secrets
    if (this.secrets.has(key)) {
      return this.secrets.get(key);
    }

    // Then check regular config
    if (this.config.has(key)) {
      return this.config.get(key);
    }

    // Then check defaults
    if (this.defaults.hasOwnProperty(key)) {
      return this.defaults[key];
    }

    // Finally return provided default or null
    return defaultValue;
  }

  /**
   * Get secret value (for API keys, tokens, etc.)
   */
  getSecret(key, defaultValue = null) {
    const value = this.secrets.get(key);
    return value !== undefined ? value : defaultValue;
  }

  /**
   * Set configuration value
   */
  set(key, value) {
    if (this.isSecretKey(key)) {
      this.secrets.set(key, value);
    } else {
      this.config.set(key, value);
    }
  }

  /**
   * Check if a configuration key exists
   */
  has(key) {
    return this.secrets.has(key)
           || this.config.has(key)
           || this.defaults.hasOwnProperty(key);
  }

  /**
   * Get all configuration keys (excluding secrets)
   */
  getConfigKeys() {
    const keys = new Set([
      ...this.config.keys(),
      ...Object.keys(this.defaults),
    ]);
    return Array.from(keys);
  }

  /**
   * Validate required configuration
   */
  validateRequired(requiredKeys) {
    const missing = [];

    for (const key of requiredKeys) {
      if (!this.has(key)) {
        missing.push(key);
      }
    }

    if (missing.length > 0) {
      throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }
  }

  /**
   * Get configuration summary (safe for logging)
   */
  getSummary() {
    const summary = {
      configKeys: this.getConfigKeys().length,
      secretKeys: this.secrets.size,
      defaults: Object.keys(this.defaults).length,
      sources: [],
    };

    if (this.config.size > 0) summary.sources.push('config-file');
    if (this.secrets.size > 0) summary.sources.push('environment');
    summary.sources.push('defaults');

    return summary;
  }

  /**
   * Create secure configuration for voice synthesis
   */
  getVoiceConfig() {
    return {
      enabled: this.get('features.voiceEnabled', false),
      apiKey: this.getSecret('api.elevenlabs.key'),
      voiceId: this.get('voice.id', null), // No hardcoded default
      maxMessageLength: this.get('voice.maxLength', 1000),
      timeout: this.get('voice.timeout', 10000),
    };
  }

  /**
   * Create secure configuration for cloud integration
   */
  getCloudConfig() {
    return {
      enabled: this.get('features.cloudEnabled', false),
      projectId: this.get('gcp.projectId'),
      credentialsPath: this.getSecret('gcp.credentialsPath'),
      region: this.get('gcp.region', 'us-central1'),
      billingEnabled: this.get('gcp.billingEnabled', false),
    };
  }

  /**
   * Create secure configuration for WebSocket server
   */
  getWebSocketConfig() {
    return {
      authRequired: this.get('websocket.authRequired'),
      authSecret: this.getSecret('websocket.authSecret') || this.generateWebSocketSecret(),
      maxConnections: this.get('websocket.maxConnections'),
      messageRateLimit: this.get('websocket.messageRateLimit'),
      maxMessageSize: this.get('websocket.maxMessageSize'),
      heartbeatInterval: this.get('websocket.heartbeatInterval'),
    };
  }

  /**
   * Generate secure WebSocket authentication secret
   */
  generateWebSocketSecret() {
    const secret = crypto.randomBytes(32).toString('hex');
    this.secrets.set('websocket.authSecret', secret);
    console.warn('⚠️ Generated WebSocket auth secret - set WEBSOCKET_AUTH_SECRET environment variable');
    return secret;
  }

  /**
   * Get agent swarm configuration
   */
  getAgentConfig() {
    return {
      maxCount: this.get('agents.maxCount'),
      timeout: this.get('agents.timeout'),
      retryAttempts: this.get('agents.retryAttempts'),
      autoScale: this.get('agents.autoScale', true),
      healthCheckInterval: this.get('agents.healthCheckInterval', 30000),
    };
  }

  /**
   * Secure configuration export (removes secrets)
   */
  exportConfig() {
    const exported = {
      config: Object.fromEntries(this.config),
      defaults: this.defaults,
      summary: this.getSummary(),
    };

    return exported;
  }
}

// Singleton instance
export const secureConfig = new SecureConfig();

export default secureConfig;
