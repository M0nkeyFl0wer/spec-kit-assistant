/**
 * ContextVersion Model
 * Spec: Feature 788 - Data Model Entity 2
 *
 * Immutable snapshot of context state at a specific version
 */

import semver from 'semver';

export class ContextVersion {
  constructor(data = {}) {
    this.versionNumber = data.versionNumber;
    this.snapshot = data.snapshot;
    this.changelog = data.changelog || [];
    this.timestamp = data.timestamp || new Date();
    this.triggeringEvent = data.triggeringEvent || '';

    // Immutability flag - once set, cannot be modified
    this._immutable = data._immutable || false;

    this.validate();
  }

  validate() {
    // versionNumber must be valid semver
    if (!semver.valid(this.versionNumber)) {
      throw new Error(`Invalid semver version: ${this.versionNumber}`);
    }

    // snapshot must exist and be an object
    if (!this.snapshot || typeof this.snapshot !== 'object') {
      throw new Error('snapshot must be a valid ContextState object');
    }

    // timestamp must be valid
    if (!(this.timestamp instanceof Date) || isNaN(this.timestamp.getTime())) {
      throw new Error('timestamp must be a valid Date');
    }

    // changelog validation
    if (!Array.isArray(this.changelog)) {
      throw new Error('changelog must be an array');
    }

    // v1.0.0 can have empty changelog, others must have entries
    if (this.versionNumber !== '1.0.0' && this.changelog.length === 0) {
      throw new Error('changelog must have at least one entry (except v1.0.0)');
    }

    return true;
  }

  // Make this version immutable
  freeze() {
    this._immutable = true;
    Object.freeze(this);
    return this;
  }

  // Check if modifications are allowed
  checkMutable() {
    if (this._immutable) {
      throw new Error('ContextVersion is immutable and cannot be modified');
    }
  }

  addChangelogEntry(entry) {
    this.checkMutable();

    if (!entry.field || !entry.change) {
      throw new Error('Changelog entry must have field and change');
    }

    this.changelog.push({
      field: entry.field,
      change: entry.change,
      before: entry.before,
      after: entry.after,
      timestamp: new Date()
    });

    return this.changelog;
  }

  toJSON() {
    return {
      versionNumber: this.versionNumber,
      snapshot: this.snapshot,
      changelog: this.changelog,
      timestamp: this.timestamp.toISOString(),
      triggeringEvent: this.triggeringEvent,
      _immutable: this._immutable
    };
  }

  static fromJSON(json) {
    const version = new ContextVersion({
      ...json,
      timestamp: new Date(json.timestamp)
    });

    if (json._immutable) {
      version.freeze();
    }

    return version;
  }

  static compare(versionA, versionB) {
    return semver.compare(versionA.versionNumber, versionB.versionNumber);
  }

  static diff(fromVersion, toVersion) {
    const changes = [];

    // Aggregate all changelog entries between versions
    if (toVersion.changelog) {
      changes.push(...toVersion.changelog);
    }

    return {
      from: fromVersion.versionNumber,
      to: toVersion.versionNumber,
      changes,
      distance: semver.diff(fromVersion.versionNumber, toVersion.versionNumber)
    };
  }
}

export default ContextVersion;