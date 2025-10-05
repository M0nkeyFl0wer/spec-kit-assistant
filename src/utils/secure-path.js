import path from 'path';
import fs from 'fs-extra';

/**
 * Secure Path Utilities - Prevents path traversal attacks
 * Implements OWASP recommendations for secure file handling
 */

// Allowed directories for different operations
const ALLOWED_DIRECTORIES = {
  config: ['.spec-assistant', 'config'],
  templates: ['assets', 'templates'],
  workspace: ['.spec-assistant', 'workspace'],
  temp: ['.spec-assistant', 'temp'],
  output: ['.spec-assistant', 'generated'],
  logs: ['.spec-assistant', 'logs'],
};

// Allowed file extensions by context
const ALLOWED_EXTENSIONS = {
  config: ['.json', '.yaml', '.yml', '.env'],
  templates: ['.yaml', '.yml', '.json', '.sh', '.dockerfile'],
  multimedia: ['.png', '.jpg', '.jpeg', '.gif', '.mp3', '.wav'],
  text: ['.txt', '.md', '.log'],
  all: ['.json', '.yaml', '.yml', '.txt', '.md', '.png', '.jpg', '.gif', '.mp3', '.wav', '.log', '.sh'],
};

/**
 * Validates and sanitizes a file path to prevent path traversal
 * @param {string} userPath - User-provided path
 * @param {string} context - Context (config, templates, workspace, etc.)
 * @param {Object} options - Additional options
 * @returns {string} Sanitized absolute path
 * @throws {Error} If path is invalid or dangerous
 */
export function validatePath(userPath, context = 'workspace', options = {}) {
  if (!userPath || typeof userPath !== 'string') {
    throw new Error('Path must be a non-empty string');
  }

  // Remove null bytes and other dangerous characters
  const sanitized = userPath.replace(/\0/g, '').trim();

  if (sanitized !== userPath) {
    throw new Error('Path contains invalid characters');
  }

  // Check for path traversal attempts
  if (sanitized.includes('..') || sanitized.includes('~')) {
    throw new Error('Path traversal detected - relative paths not allowed');
  }

  // Get allowed directories for this context
  const allowedDirs = ALLOWED_DIRECTORIES[context];
  if (!allowedDirs) {
    throw new Error(`Invalid context: ${context}`);
  }

  // Build the safe base path
  const basePath = path.resolve(process.cwd(), ...allowedDirs);

  // Resolve the user path relative to base
  const resolvedPath = path.resolve(basePath, sanitized);

  // Ensure the resolved path is still within the allowed directory
  if (!resolvedPath.startsWith(basePath)) {
    throw new Error('Path would escape allowed directory');
  }

  // Validate file extension if specified
  if (options.allowedExtensions) {
    const ext = path.extname(resolvedPath).toLowerCase();
    const allowed = ALLOWED_EXTENSIONS[options.allowedExtensions] || options.allowedExtensions;

    if (ext && !allowed.includes(ext)) {
      throw new Error(`File extension '${ext}' not allowed for context '${context}'`);
    }
  }

  // Additional length check
  if (resolvedPath.length > 500) {
    throw new Error('Path too long - maximum 500 characters');
  }

  return resolvedPath;
}

/**
 * Safely reads a file with path validation
 * @param {string} userPath - User-provided file path
 * @param {string} context - Security context
 * @param {Object} options - File reading options
 * @returns {Promise<string>} File contents
 */
export async function secureReadFile(userPath, context = 'workspace', options = {}) {
  const safePath = validatePath(userPath, context, {
    allowedExtensions: options.allowedExtensions || 'all',
  });

  // Check if file exists and is readable
  const stats = await fs.stat(safePath).catch(() => null);
  if (!stats) {
    throw new Error(`File not found: ${path.basename(userPath)}`);
  }

  if (!stats.isFile()) {
    throw new Error('Path is not a file');
  }

  // Size limit check (default 10MB)
  const maxSize = options.maxSize || 10 * 1024 * 1024;
  if (stats.size > maxSize) {
    throw new Error(`File too large: ${stats.size} bytes (max: ${maxSize})`);
  }

  try {
    const content = await fs.readFile(safePath, options.encoding || 'utf8');
    return content;
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
}

/**
 * Safely writes a file with path validation
 * @param {string} userPath - User-provided file path
 * @param {string} data - Data to write
 * @param {string} context - Security context
 * @param {Object} options - File writing options
 */
export async function secureWriteFile(userPath, data, context = 'workspace', options = {}) {
  if (!data && data !== '') {
    throw new Error('Data is required for file writing');
  }

  const safePath = validatePath(userPath, context, {
    allowedExtensions: options.allowedExtensions || 'all',
  });

  // Size limit check for data (default 10MB)
  const maxSize = options.maxSize || 10 * 1024 * 1024;
  const dataSize = Buffer.byteLength(data, options.encoding || 'utf8');

  if (dataSize > maxSize) {
    throw new Error(`Data too large: ${dataSize} bytes (max: ${maxSize})`);
  }

  // Ensure directory exists
  await fs.ensureDir(path.dirname(safePath));

  // Check for overwrite protection
  if (options.preventOverwrite) {
    const exists = await fs.pathExists(safePath);
    if (exists) {
      throw new Error('File already exists and overwrite is disabled');
    }
  }

  try {
    await fs.writeFile(safePath, data, {
      encoding: options.encoding || 'utf8',
      mode: options.mode || 0o644, // Secure default permissions
      flag: options.flag || 'w',
    });
  } catch (error) {
    throw new Error(`Failed to write file: ${error.message}`);
  }

  return safePath;
}

/**
 * Safely creates a directory with path validation
 * @param {string} userPath - User-provided directory path
 * @param {string} context - Security context
 */
export async function secureEnsureDir(userPath, context = 'workspace') {
  const safePath = validatePath(userPath, context);

  try {
    await fs.ensureDir(safePath);
    return safePath;
  } catch (error) {
    throw new Error(`Failed to create directory: ${error.message}`);
  }
}

/**
 * Lists files in a directory securely
 * @param {string} userPath - User-provided directory path
 * @param {string} context - Security context
 * @param {Object} options - Listing options
 * @returns {Promise<Array>} List of files
 */
export async function secureListFiles(userPath, context = 'workspace', options = {}) {
  const safePath = validatePath(userPath, context);

  try {
    const items = await fs.readdir(safePath, { withFileTypes: true });

    let results = items.map((item) => ({
      name: item.name,
      isFile: item.isFile(),
      isDirectory: item.isDirectory(),
      path: path.join(safePath, item.name),
    }));

    // Filter by file extensions if specified
    if (options.extensions) {
      const allowed = Array.isArray(options.extensions) ? options.extensions : [options.extensions];
      results = results.filter((item) => {
        if (!item.isFile) return true;
        const ext = path.extname(item.name).toLowerCase();
        return allowed.includes(ext);
      });
    }

    // Limit results to prevent DoS
    const maxResults = options.maxResults || 1000;
    if (results.length > maxResults) {
      results = results.slice(0, maxResults);
    }

    return results;
  } catch (error) {
    throw new Error(`Failed to list directory: ${error.message}`);
  }
}

/**
 * Validates a project path for analysis
 * @param {string} userPath - User-provided project path
 * @returns {string} Validated project path
 */
export function validateProjectPath(userPath) {
  if (!userPath || typeof userPath !== 'string') {
    throw new Error('Project path must be a non-empty string');
  }

  const sanitized = userPath.replace(/\0/g, '').trim();

  // For project paths, we allow more flexibility but still validate
  const resolved = path.resolve(sanitized);

  // Prevent access to system directories
  const systemDirs = ['/etc', '/proc', '/sys', '/dev', '/root', '/var', '/usr/bin', '/usr/sbin'];
  const isSystemDir = systemDirs.some((dir) => resolved.startsWith(dir));

  if (isSystemDir) {
    throw new Error('Access to system directories not allowed');
  }

  // Check for dangerous patterns
  if (resolved.includes('..') && resolved.includes('/')) {
    throw new Error('Potentially unsafe path detected');
  }

  return resolved;
}

export default {
  validatePath,
  secureReadFile,
  secureWriteFile,
  secureEnsureDir,
  secureListFiles,
  validateProjectPath,
  ALLOWED_DIRECTORIES,
  ALLOWED_EXTENSIONS,
};
