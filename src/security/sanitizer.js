// SECURITY PATCH: Input Sanitization Module
import chalk from 'chalk';

export class SecuritySanitizer {
  constructor() {
    this.dangerousPatterns = [
      // Command injection patterns
      /[;|&$`\\]/g,
      /\$\{[^}]*\}/g,
      /\$\([^)]*\)/g,

      // Script injection patterns
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,

      // Path traversal patterns
      /\.\.\/|\.\.\\/g,
      /\.\.\//g,

      // Control characters
      /[\x00-\x1f\x7f-\x9f]/g
    ];

    this.maxInputLength = 1000;
  }

  /**
   * Sanitize project name input
   */
  sanitizeProjectName(input) {
    if (!input || typeof input !== 'string') {
      return 'sanitized-project';
    }

    // Length check
    if (input.length > this.maxInputLength) {
      console.log(chalk.yellow('⚠️  Input truncated due to length'));
      input = input.substring(0, this.maxInputLength);
    }

    // Remove dangerous patterns
    let sanitized = input;
    for (const pattern of this.dangerousPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Additional safety measures
    sanitized = sanitized
      .replace(/[<>"\']/g, '') // Remove quotes and brackets
      .replace(/\s+/g, '-')     // Replace spaces with dashes
      .replace(/[^a-zA-Z0-9-_]/g, '') // Only allow safe characters
      .toLowerCase()
      .trim();

    // Ensure non-empty result
    if (!sanitized || sanitized.length === 0) {
      sanitized = 'safe-project-name';
    }

    if (sanitized !== input) {
      console.log(chalk.yellow(`🧼 Input sanitized: "${input}" → "${sanitized}"`));
    }

    return sanitized;
  }

  /**
   * Validate and sanitize file paths
   */
  sanitizeFilePath(path) {
    if (!path || typeof path !== 'string') {
      throw new Error('Invalid file path provided');
    }

    // Prevent directory traversal
    if (path.includes('..') || path.startsWith('/') || path.includes('\\')) {
      throw new Error('Path traversal attempt blocked');
    }

    // Only allow safe file extensions
    const allowedExtensions = ['.md', '.txt', '.json'];
    const hasValidExtension = allowedExtensions.some(ext => path.endsWith(ext));

    if (!hasValidExtension) {
      path += '.md'; // Force safe extension
    }

    // Sanitize filename
    const sanitized = path
      .replace(/[<>:"|*?]/g, '') // Remove dangerous characters
      .replace(/\s+/g, '-')      // Replace spaces
      .replace(/[^a-zA-Z0-9.-_/]/g, ''); // Only safe characters

    return sanitized;
  }

  /**
   * Detect and handle circular references
   */
  detectCircularReferences(obj, seen = new WeakSet()) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (seen.has(obj)) {
      return '[Circular Reference Detected]';
    }

    seen.add(obj);

    const result = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = this.detectCircularReferences(obj[key], seen);
      }
    }

    seen.delete(obj);
    return result;
  }

  /**
   * Validate project type
   */
  sanitizeProjectType(type) {
    const allowedTypes = ['web-app', 'api', 'mobile-app', 'agent-swarm', 'cli-tool'];

    if (!type || !allowedTypes.includes(type)) {
      console.log(chalk.yellow(`⚠️  Invalid project type: ${type}, using default`));
      return 'web-app';
    }

    return type;
  }
}

export default SecuritySanitizer;