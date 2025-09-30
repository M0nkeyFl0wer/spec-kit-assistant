/**
 * ContextState Service
 * Spec: Feature 788 - T025 (FR-001, FR-002, FR-003)
 *
 * Shared observable state store with EventEmitter and file persistence
 */

import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import path from 'path';
import { ContextState as ContextStateModel } from './models/context-state.js';
import { ContextAlignment } from './models/context-alignment.js';

export class ContextState extends EventEmitter {
  constructor(options = {}) {
    super();

    this.stateFile = options.stateFile || path.join(process.cwd(), '.specify/state/context-state.json');
    this.currentState = null;
    this.alignment = null;
  }

  /**
   * Get current or specific version of context state
   * FR-001, FR-002
   * Performance target: < 50ms for current state
   */
  async getState(options = {}) {
    const startTime = Date.now();

    if (options.version) {
      // Retrieve historical version
      const versionFile = path.join(
        path.dirname(this.stateFile),
        'version-history',
        `context-${options.version}.json`
      );

      try {
        const data = await fs.readFile(versionFile, 'utf8');
        const json = JSON.parse(data);

        const duration = Date.now() - startTime;
        if (duration > 200) {
          console.warn(`getState(version) took ${duration}ms, exceeds 200ms target`);
        }

        return {
          state: ContextStateModel.fromJSON(json.state),
          version: json.version
        };
      } catch (error) {
        const err = new Error('Requested version does not exist in history');
        err.name = 'VersionNotFound';
        throw err;
      }
    }

    // Retrieve current state
    if (!this.currentState) {
      await this.loadState();
    }

    const duration = Date.now() - startTime;
    if (duration > 50) {
      console.warn(`getState() took ${duration}ms, exceeds 50ms target`);
    }

    return {
      state: this.currentState,
      version: this.currentState ? this.currentState.version : '1.0.0'
    };
  }

  /**
   * Update context state and increment version
   * FR-001, FR-003
   * Performance target: < 100ms including file persistence
   */
  async updateState(options) {
    const startTime = Date.now();

    if (!options.updates || typeof options.updates !== 'object') {
      const err = new Error('Update format invalid or empty');
      err.name = 'InvalidUpdate';
      throw err;
    }

    if (!options.triggeredBy) {
      const err = new Error('triggeredBy is required');
      err.name = 'InvalidUpdate';
      throw err;
    }

    // Validate triggeredBy
    const validTriggers = ['user', 'specKit', 'claude', 'reconciliation'];
    if (!validTriggers.includes(options.triggeredBy)) {
      const err = new Error(`triggeredBy must be one of: ${validTriggers.join(', ')}`);
      err.name = 'InvalidUpdate';
      throw err;
    }

    // Load current state if needed
    if (!this.currentState) {
      await this.loadState();
    }

    // Apply updates
    const changelog = [];
    const updates = options.updates;

    if (updates.requirements) {
      changelog.push({
        field: 'requirements',
        change: 'updated',
        before: this.currentState.requirements,
        after: updates.requirements
      });
      this.currentState.requirements = updates.requirements;
    }

    if (updates.assumptions) {
      changelog.push({
        field: 'assumptions',
        change: 'updated',
        before: this.currentState.assumptions,
        after: updates.assumptions
      });
      this.currentState.assumptions = updates.assumptions;
    }

    if (updates.constraints) {
      changelog.push({
        field: 'constraints',
        change: 'updated',
        before: this.currentState.constraints,
        after: updates.constraints
      });
      this.currentState.constraints = updates.constraints;
    }

    if (updates.successCriteria) {
      changelog.push({
        field: 'successCriteria',
        change: 'updated',
        before: this.currentState.successCriteria,
        after: updates.successCriteria
      });
      this.currentState.successCriteria = updates.successCriteria;
    }

    // Handle other fields from updates
    Object.keys(updates).forEach(key => {
      if (!['requirements', 'assumptions', 'constraints', 'successCriteria'].includes(key)) {
        if (!this.currentState[key]) {
          this.currentState[key] = updates[key];
          changelog.push({
            field: key,
            change: 'added',
            before: undefined,
            after: updates[key]
          });
        }
      }
    });

    // Increment version
    const oldVersion = this.currentState.version;
    const changeType = this.determineChangeType(changelog);
    const newVersion = this.currentState.incrementVersion(changeType);

    // Update metadata
    this.currentState.lastModified = new Date();
    this.currentState.modifiedBy = options.triggeredBy;

    // Persist state
    await this.persistState();

    // Emit stateUpdated event
    this.emit('stateUpdated', {
      version: newVersion,
      triggeredBy: options.triggeredBy,
      changelog
    });

    const duration = Date.now() - startTime;
    if (duration > 100) {
      console.warn(`updateState() took ${duration}ms, exceeds 100ms target`);
    }

    return {
      newVersion,
      changelog
    };
  }

  /**
   * Compare Spec Kit and Claude context versions for divergence
   * FR-002, FR-003
   * Performance target: < 10ms
   */
  async checkAlignment(options) {
    const startTime = Date.now();

    if (!options.specKitVersion || !options.claudeVersion) {
      const err = new Error('Both specKitVersion and claudeVersion required');
      err.name = 'InvalidVersion';
      throw err;
    }

    // Initialize alignment if needed
    if (!this.alignment) {
      this.alignment = new ContextAlignment({
        specKitStateVersion: options.specKitVersion,
        claudeStateVersion: options.claudeVersion
      });
    }

    const result = this.alignment.checkAlignment(
      options.specKitVersion,
      options.claudeVersion,
      startTime
    );

    const duration = Date.now() - startTime;
    if (duration > 10) {
      console.warn(`checkAlignment() took ${duration}ms, exceeds 10ms target`);
    }

    return result;
  }

  /**
   * Load state from file
   * Internal method
   */
  async loadState() {
    try {
      const data = await fs.readFile(this.stateFile, 'utf8');
      const json = JSON.parse(data);
      this.currentState = ContextStateModel.fromJSON(json);

      if (json.alignment) {
        this.alignment = ContextAlignment.fromJSON(json.alignment);
      }
    } catch (error) {
      // Initialize with default state if file doesn't exist
      this.currentState = new ContextStateModel({
        version: '1.0.0',
        requirements: [],
        assumptions: [],
        constraints: [],
        successCriteria: [],
        modifiedBy: 'system'
      });

      this.alignment = new ContextAlignment({
        specKitStateVersion: '1.0.0',
        claudeStateVersion: '1.0.0'
      });

      await this.persistState();
    }
  }

  /**
   * Persist state to file
   * Internal method
   */
  async persistState() {
    // Ensure directory exists
    const dir = path.dirname(this.stateFile);
    await fs.mkdir(dir, { recursive: true });

    const data = {
      ...this.currentState.toJSON(),
      alignment: this.alignment ? this.alignment.toJSON() : null
    };

    await fs.writeFile(this.stateFile, JSON.stringify(data, null, 2), 'utf8');

    // Also create version snapshot
    const versionDir = path.join(dir, 'version-history');
    await fs.mkdir(versionDir, { recursive: true });

    const versionFile = path.join(versionDir, `context-${this.currentState.version}.json`);
    await fs.writeFile(versionFile, JSON.stringify({
      version: this.currentState.version,
      state: this.currentState.toJSON(),
      timestamp: new Date().toISOString()
    }, null, 2), 'utf8');
  }

  /**
   * Determine change type for version increment
   * Internal method
   */
  determineChangeType(changelog) {
    // Simple heuristic: if many changes or critical fields, use minor
    // For now, default to patch
    if (changelog.length > 5) {
      return 'minor';
    }
    return 'patch';
  }
}

export default ContextState;