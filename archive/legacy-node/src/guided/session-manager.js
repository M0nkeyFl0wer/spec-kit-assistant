/**
 * SessionManager
 * Handles loading, saving, and auto-saving of user sessions.
 * Implements FR-006 (auto-save) and FR-012 (persist across restarts)
 */

import fs from 'fs-extra';
import { Session } from './entities/session.js';
import {
  getProjectSessionPath,
  ensureProjectSpeckitDir,
  registerSession,
  hasProjectSession
} from './utils/config-paths.js';

export class SessionManager {
  /**
   * @param {Object} options
   * @param {number} [options.autoSaveDebounceMs=1000] - Debounce time for auto-save
   * @param {boolean} [options.autoSaveEnabled=true] - Enable auto-save
   */
  constructor(options = {}) {
    this.autoSaveDebounceMs = options.autoSaveDebounceMs ?? 1000;
    this.autoSaveEnabled = options.autoSaveEnabled ?? true;

    this._session = null;
    this._projectPath = null;
    this._saveTimeout = null;
    this._dirty = false;
  }

  /**
   * Get the current session
   * @returns {Session|null}
   */
  get session() {
    return this._session;
  }

  /**
   * Check if a session is loaded
   * @returns {boolean}
   */
  get hasSession() {
    return this._session !== null;
  }

  /**
   * Load or create a session for a project
   * @param {string} projectPath - Absolute path to project
   * @param {Object} [options] - Creation options if no session exists
   * @param {string} [options.projectId] - Project identifier
   * @returns {Promise<Session>}
   */
  async load(projectPath, options = {}) {
    this._projectPath = projectPath;

    if (await hasProjectSession(projectPath)) {
      // Load existing session
      const sessionPath = getProjectSessionPath(projectPath);
      const data = await fs.readJson(sessionPath);
      this._session = Session.fromJSON(data);
    } else {
      // Create new session
      const projectId = options.projectId || this._deriveProjectId(projectPath);
      this._session = new Session({
        projectId,
        projectPath
      });

      // Save immediately
      await this._saveNow();
    }

    // Register in global index
    await registerSession(projectPath, this._session.projectId);

    this._dirty = false;
    return this._session;
  }

  /**
   * Save the current session
   * @returns {Promise<void>}
   */
  async save() {
    if (!this._session || !this._projectPath) {
      throw new Error('No session loaded');
    }

    // Touch the session to update timestamp
    this._session.touch();

    await this._saveNow();
    this._dirty = false;
  }

  /**
   * Queue an auto-save (debounced)
   */
  queueAutoSave() {
    if (!this.autoSaveEnabled || !this._session) {
      return;
    }

    this._dirty = true;

    // Clear existing timeout
    if (this._saveTimeout) {
      clearTimeout(this._saveTimeout);
    }

    // Schedule save
    this._saveTimeout = setTimeout(async () => {
      if (this._dirty) {
        await this.save();
      }
    }, this.autoSaveDebounceMs);
  }

  /**
   * Enter a phase and auto-save
   * @param {string} phase - Phase to enter
   */
  async enterPhase(phase) {
    if (!this._session) {
      throw new Error('No session loaded');
    }

    this._session.enterPhase(phase);
    this.queueAutoSave();
  }

  /**
   * Record a decision and auto-save
   * @param {Object} decision - Decision data
   */
  async recordDecision(decision) {
    if (!this._session) {
      throw new Error('No session loaded');
    }

    this._session.recordDecision(decision);
    this.queueAutoSave();
  }

  /**
   * Update preferences and auto-save
   * @param {Object} updates - Preference updates
   */
  async updatePreferences(updates) {
    if (!this._session) {
      throw new Error('No session loaded');
    }

    this._session.preferences.update(updates);
    this._session.touch();
    this.queueAutoSave();
  }

  /**
   * Complete the current phase with artifacts
   * @param {string[]} [artifacts] - Generated artifact paths
   */
  async completeCurrentPhase(artifacts = []) {
    if (!this._session) {
      throw new Error('No session loaded');
    }

    const currentPhase = this._session.currentPhase;
    this._session.phases[currentPhase].complete(artifacts);
    this._session.touch();
    await this.save(); // Save immediately on phase completion
  }

  /**
   * Force immediate save (bypass debounce)
   * @returns {Promise<void>}
   */
  async flush() {
    if (this._saveTimeout) {
      clearTimeout(this._saveTimeout);
      this._saveTimeout = null;
    }

    if (this._dirty && this._session) {
      await this.save();
    }
  }

  /**
   * Close the session manager (flush and cleanup)
   */
  async close() {
    await this.flush();
    this._session = null;
    this._projectPath = null;
  }

  /**
   * Internal: Save session to disk
   * @private
   */
  async _saveNow() {
    if (!this._session || !this._projectPath) {
      return;
    }

    await ensureProjectSpeckitDir(this._projectPath);
    const sessionPath = getProjectSessionPath(this._projectPath);
    await fs.writeJson(sessionPath, this._session.toJSON(), { spaces: 2 });
  }

  /**
   * Derive project ID from path
   * @private
   * @param {string} projectPath
   * @returns {string}
   */
  _deriveProjectId(projectPath) {
    // Use the last directory name as project ID
    const parts = projectPath.replace(/\\/g, '/').split('/').filter(Boolean);
    return parts[parts.length - 1] || 'unnamed-project';
  }

  /**
   * Check if session has unsaved changes
   * @returns {boolean}
   */
  get isDirty() {
    return this._dirty;
  }

  /**
   * Get session summary for display
   * @returns {Object|null}
   */
  getSummary() {
    if (!this._session) return null;

    const phases = this._session.phases;
    const completed = Object.values(phases).filter(p => p.isComplete()).length;
    const total = Object.keys(phases).length;

    return {
      projectId: this._session.projectId,
      currentPhase: this._session.currentPhase,
      progress: `${completed}/${total} phases`,
      decisionCount: this._session.decisions.length,
      lastUpdated: this._session.updatedAt
    };
  }
}
