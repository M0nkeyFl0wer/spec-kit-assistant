/**
 * Platform-aware Config Path Resolver
 * Implements XDG Base Directory spec with cross-platform support.
 * @see research.md for platform-specific paths
 */

import { homedir, platform } from 'os';
import { join } from 'path';
import fs from 'fs-extra';

const APP_NAME = 'spec-kit-assistant';

/**
 * Get the global config directory for the current platform
 * @returns {string} Absolute path to config directory
 */
export function getConfigPath() {
  const home = homedir();
  const os = platform();

  switch (os) {
    case 'win32':
      // Windows: %APPDATA%\spec-kit-assistant\
      return join(process.env.APPDATA || join(home, 'AppData', 'Roaming'), APP_NAME);

    case 'darwin':
      // macOS: ~/Library/Application Support/spec-kit-assistant/ or ~/.config/
      // Prefer XDG if XDG_CONFIG_HOME is set, otherwise use macOS convention
      if (process.env.XDG_CONFIG_HOME) {
        return join(process.env.XDG_CONFIG_HOME, APP_NAME);
      }
      // Use ~/.config for consistency with Linux tools
      return join(home, '.config', APP_NAME);

    default:
      // Linux and others: ~/.config/spec-kit-assistant/
      const xdgConfig = process.env.XDG_CONFIG_HOME || join(home, '.config');
      return join(xdgConfig, APP_NAME);
  }
}

/**
 * Get the project-local session file path
 * @param {string} projectPath - Absolute path to project directory
 * @returns {string} Absolute path to session file
 */
export function getProjectSessionPath(projectPath) {
  return join(projectPath, '.speckit', 'session.json');
}

/**
 * Get the global sessions index file path
 * @returns {string} Absolute path to sessions index
 */
export function getSessionsIndexPath() {
  return join(getConfigPath(), 'sessions.json');
}

/**
 * Ensure config directory exists
 * @returns {Promise<string>} Path to created/existing config directory
 */
export async function ensureConfigDir() {
  const configPath = getConfigPath();
  await fs.ensureDir(configPath);
  return configPath;
}

/**
 * Ensure project .speckit directory exists
 * @param {string} projectPath - Project directory
 * @returns {Promise<string>} Path to created/existing .speckit directory
 */
export async function ensureProjectSpeckitDir(projectPath) {
  const speckitPath = join(projectPath, '.speckit');
  await fs.ensureDir(speckitPath);
  return speckitPath;
}

/**
 * Check if a session exists for a project
 * @param {string} projectPath - Project directory
 * @returns {Promise<boolean>}
 */
export async function hasProjectSession(projectPath) {
  const sessionPath = getProjectSessionPath(projectPath);
  return fs.pathExists(sessionPath);
}

/**
 * Get all known session paths from the global index
 * @returns {Promise<Object[]>} Array of { projectPath, sessionPath, lastAccessed }
 */
export async function getKnownSessions() {
  const indexPath = getSessionsIndexPath();

  if (await fs.pathExists(indexPath)) {
    try {
      const data = await fs.readJson(indexPath);
      return data.sessions || [];
    } catch {
      return [];
    }
  }

  return [];
}

/**
 * Register a session in the global index
 * @param {string} projectPath - Project directory
 * @param {string} projectId - Project identifier
 */
export async function registerSession(projectPath, projectId) {
  await ensureConfigDir();
  const indexPath = getSessionsIndexPath();

  let data = { sessions: [] };
  if (await fs.pathExists(indexPath)) {
    try {
      data = await fs.readJson(indexPath);
    } catch {
      data = { sessions: [] };
    }
  }

  // Remove existing entry for this path
  data.sessions = data.sessions.filter(s => s.projectPath !== projectPath);

  // Add new entry
  data.sessions.push({
    projectPath,
    projectId,
    sessionPath: getProjectSessionPath(projectPath),
    lastAccessed: new Date().toISOString()
  });

  await fs.writeJson(indexPath, data, { spaces: 2 });
}

/**
 * Get platform name for display
 * @returns {string}
 */
export function getPlatformName() {
  const os = platform();
  switch (os) {
    case 'win32': return 'Windows';
    case 'darwin': return 'macOS';
    case 'linux': return 'Linux';
    default: return os;
  }
}

/**
 * Alias for getConfigPath for clarity
 * @returns {string}
 */
export function getGlobalConfigPath() {
  return getConfigPath();
}
