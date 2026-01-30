/**
 * Session Entity
 * Represents the user's complete state for a project, persisted across restarts.
 * @see data-model.md for specification
 */

import { v4 as uuidv4 } from 'uuid';
import { PhaseState, PhaseType } from './phase-state.js';
import { UserPreferences } from './user-preferences.js';

export class Session {
  /**
   * @param {Object} data - Session data
   * @param {string} [data.id] - UUID, auto-generated if not provided
   * @param {string} [data.version='1.0'] - Schema version
   * @param {string} data.projectId - Project name/identifier
   * @param {string} data.projectPath - Absolute path to project
   * @param {string} [data.currentPhase='onboarding'] - Current workflow phase
   * @param {Object} [data.phases] - Phase states map
   * @param {Array} [data.decisions] - User decisions
   * @param {Object} [data.preferences] - User preferences
   * @param {string} [data.createdAt] - Creation timestamp
   * @param {string} [data.updatedAt] - Last update timestamp
   */
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.version = data.version || '1.0';
    this.projectId = data.projectId;
    this.projectPath = data.projectPath;
    this.currentPhase = data.currentPhase || PhaseType.ONBOARDING;
    this.phases = this._initPhases(data.phases);
    this.decisions = data.decisions || [];
    this.preferences = data.preferences instanceof UserPreferences
      ? data.preferences
      : new UserPreferences(data.preferences);
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || this.createdAt;
  }

  /**
   * Initialize all phases with default state
   * @private
   */
  _initPhases(existingPhases = {}) {
    const phases = {};
    for (const phase of Object.values(PhaseType)) {
      if (existingPhases[phase]) {
        phases[phase] = existingPhases[phase] instanceof PhaseState
          ? existingPhases[phase]
          : new PhaseState(existingPhases[phase]);
      } else {
        phases[phase] = new PhaseState({ status: 'pending' });
      }
    }
    return phases;
  }

  /**
   * Transition to a new phase
   * @param {string} phase - Target phase
   */
  enterPhase(phase) {
    if (!Object.values(PhaseType).includes(phase)) {
      throw new Error(`Invalid phase: ${phase}`);
    }

    // Mark current phase as complete if in progress
    if (this.phases[this.currentPhase]?.status === 'in_progress') {
      this.phases[this.currentPhase].complete();
    }

    // Enter new phase
    this.currentPhase = phase;
    this.phases[phase].start();
    this.touch();
  }

  /**
   * Record a user decision
   * @param {Object} decision - Decision data
   */
  recordDecision(decision) {
    this.decisions.push({
      ...decision,
      id: decision.id || `dec-${this.decisions.length + 1}`,
      timestamp: decision.timestamp || new Date().toISOString()
    });
    this.touch();
  }

  /**
   * Get decisions for a specific phase
   * @param {string} phase - Phase type
   * @returns {Array} Decisions for that phase
   */
  getDecisionsForPhase(phase) {
    return this.decisions.filter(d => d.phase === phase);
  }

  /**
   * Get the next incomplete phase
   * @returns {string|null} Next phase or null if all complete
   */
  getNextPhase() {
    const phaseOrder = Object.values(PhaseType);
    for (const phase of phaseOrder) {
      if (this.phases[phase]?.status === 'pending') {
        return phase;
      }
    }
    return null;
  }

  /**
   * Update the updatedAt timestamp
   */
  touch() {
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Validate the session data
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    // Check UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(this.id)) {
      errors.push('id must be valid UUIDv4');
    }

    // Check required fields
    if (!this.projectId) errors.push('projectId is required');
    if (!this.projectPath) errors.push('projectPath is required');

    // Check timestamps
    if (new Date(this.updatedAt) < new Date(this.createdAt)) {
      errors.push('updatedAt must be >= createdAt');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Serialize to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      version: this.version,
      projectId: this.projectId,
      projectPath: this.projectPath,
      currentPhase: this.currentPhase,
      phases: Object.fromEntries(
        Object.entries(this.phases).map(([k, v]) => [k, v.toJSON()])
      ),
      decisions: this.decisions,
      preferences: this.preferences.toJSON(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Create Session from JSON
   * @param {Object} json
   * @returns {Session}
   */
  static fromJSON(json) {
    return new Session(json);
  }
}
