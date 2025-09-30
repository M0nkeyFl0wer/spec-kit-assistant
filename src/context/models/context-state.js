/**
 * ContextState Model
 * Spec: Feature 788 - Data Model Entity 1
 *
 * Shared observable state store for context synchronization between Spec Kit and Claude
 */

import semver from 'semver';

export class ContextState {
  constructor(data = {}) {
    this.version = data.version || '1.0.0';
    this.requirements = data.requirements || [];
    this.assumptions = data.assumptions || [];
    this.constraints = data.constraints || [];
    this.successCriteria = data.successCriteria || [];
    this.lastModified = data.lastModified || new Date();
    this.modifiedBy = data.modifiedBy || 'system';

    // Relationships
    this.versions = data.versions || []; // ContextVersion history
    this.alignment = data.alignment || null; // ContextAlignment

    // State
    this.state = data.state || 'draft'; // draft, active, superseded

    this.validate();
  }

  validate() {
    // Version must be valid semver
    if (!semver.valid(this.version)) {
      throw new Error(`Invalid semver version: ${this.version}`);
    }

    // Arrays must be non-null
    if (!Array.isArray(this.requirements)) {
      throw new Error('requirements must be an array');
    }
    if (!Array.isArray(this.assumptions)) {
      throw new Error('assumptions must be an array');
    }
    if (!Array.isArray(this.constraints)) {
      throw new Error('constraints must be an array');
    }
    if (!Array.isArray(this.successCriteria)) {
      throw new Error('successCriteria must be an array');
    }

    // lastModified must be valid timestamp
    if (!(this.lastModified instanceof Date) || isNaN(this.lastModified.getTime())) {
      throw new Error('lastModified must be a valid Date');
    }

    // modifiedBy must be valid entity
    const validModifiers = ['user', 'specKit', 'claude', 'reconciliation', 'system'];
    if (!validModifiers.includes(this.modifiedBy)) {
      throw new Error(`modifiedBy must be one of: ${validModifiers.join(', ')}`);
    }

    return true;
  }

  incrementVersion(changeType = 'patch') {
    const current = this.version;

    switch (changeType) {
      case 'major':
        this.version = semver.inc(current, 'major');
        break;
      case 'minor':
        this.version = semver.inc(current, 'minor');
        break;
      case 'patch':
      default:
        this.version = semver.inc(current, 'patch');
    }

    return this.version;
  }

  transitionState(newState) {
    const validTransitions = {
      draft: ['active'],
      active: ['superseded'],
      superseded: []
    };

    if (!validTransitions[this.state]?.includes(newState)) {
      throw new Error(`Invalid state transition: ${this.state} -> ${newState}`);
    }

    this.state = newState;
    return this.state;
  }

  toJSON() {
    return {
      version: this.version,
      requirements: this.requirements,
      assumptions: this.assumptions,
      constraints: this.constraints,
      successCriteria: this.successCriteria,
      lastModified: this.lastModified.toISOString(),
      modifiedBy: this.modifiedBy,
      state: this.state,
      // Exclude relationships from serialization
    };
  }

  static fromJSON(json) {
    return new ContextState({
      ...json,
      lastModified: new Date(json.lastModified)
    });
  }
}

export default ContextState;