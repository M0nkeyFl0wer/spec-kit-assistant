/**
 * ContextAlignment Model
 * Spec: Feature 788 - Data Model Entity 7
 *
 * Monitor synchronization status between Spec Kit and Claude context versions
 */

import semver from 'semver';

export class ContextAlignment {
  constructor(data = {}) {
    this.specKitStateVersion = data.specKitStateVersion || '1.0.0';
    this.claudeStateVersion = data.claudeStateVersion || '1.0.0';
    this.divergenceStatus = data.divergenceStatus || false;
    this.lastSyncTime = data.lastSyncTime || new Date();
    this.divergenceDetectedAt = data.divergenceDetectedAt || null;
    this.autoReconcile = data.autoReconcile !== undefined ? data.autoReconcile : true;

    // State
    this.state = data.state || 'aligned'; // aligned, diverged, reconciling

    // Performance tracking
    this.divergenceDetectionTime = data.divergenceDetectionTime || null;

    this.validate();
  }

  validate() {
    // Both versions must be valid semver
    if (!semver.valid(this.specKitStateVersion)) {
      throw new Error(`specKitStateVersion must be valid semver: ${this.specKitStateVersion}`);
    }

    if (!semver.valid(this.claudeStateVersion)) {
      throw new Error(`claudeStateVersion must be valid semver: ${this.claudeStateVersion}`);
    }

    // divergenceStatus must match version comparison
    const versionsMatch = this.specKitStateVersion === this.claudeStateVersion;
    if (this.divergenceStatus === versionsMatch) {
      throw new Error('divergenceStatus must be false when versions match, true when different');
    }

    // divergenceDetectedAt must be null when divergenceStatus is false
    if (!this.divergenceStatus && this.divergenceDetectedAt !== null) {
      throw new Error('divergenceDetectedAt must be null when divergenceStatus is false');
    }

    // lastSyncTime validation
    if (!(this.lastSyncTime instanceof Date) || isNaN(this.lastSyncTime.getTime())) {
      throw new Error('lastSyncTime must be a valid Date');
    }

    // divergenceDetectedAt validation if set
    if (this.divergenceDetectedAt !== null &&
        (!(this.divergenceDetectedAt instanceof Date) || isNaN(this.divergenceDetectedAt.getTime()))) {
      throw new Error('divergenceDetectedAt must be a valid Date or null');
    }

    // Divergence must be detected within 100ms (FR-003)
    if (this.divergenceDetectionTime !== null && this.divergenceDetectionTime > 100) {
      console.warn(`Divergence detection took ${this.divergenceDetectionTime}ms, exceeds 100ms budget (FR-003)`);
    }

    return true;
  }

  checkAlignment(specKitVersion, claudeVersion, detectionStartTime = null) {
    this.specKitStateVersion = specKitVersion;
    this.claudeStateVersion = claudeVersion;

    const wasAligned = !this.divergenceStatus;
    const isAligned = specKitVersion === claudeVersion;

    this.divergenceStatus = !isAligned;

    // Track detection time if provided
    if (detectionStartTime) {
      this.divergenceDetectionTime = Date.now() - detectionStartTime;
    }

    // State transitions
    if (isAligned) {
      this.state = 'aligned';
      this.divergenceDetectedAt = null;
      this.lastSyncTime = new Date();
    } else if (wasAligned && !isAligned) {
      // Just diverged
      this.state = 'diverged';
      this.divergenceDetectedAt = new Date();
    }

    this.validate();

    return {
      aligned: !this.divergenceStatus,
      divergenceSince: this.divergenceDetectedAt,
      detectionTime: this.divergenceDetectionTime
    };
  }

  startReconciliation() {
    if (!this.divergenceStatus) {
      throw new Error('Cannot reconcile when already aligned');
    }

    if (this.state === 'reconciling') {
      throw new Error('Reconciliation already in progress');
    }

    this.state = 'reconciling';
    return this.state;
  }

  completeReconciliation(newVersion) {
    if (this.state !== 'reconciling') {
      throw new Error('No reconciliation in progress');
    }

    this.specKitStateVersion = newVersion;
    this.claudeStateVersion = newVersion;
    this.divergenceStatus = false;
    this.divergenceDetectedAt = null;
    this.lastSyncTime = new Date();
    this.state = 'aligned';

    this.validate();

    return {
      aligned: true,
      newVersion,
      syncTime: this.lastSyncTime
    };
  }

  getDivergenceDuration() {
    if (!this.divergenceDetectedAt) {
      return 0;
    }

    return Date.now() - this.divergenceDetectedAt.getTime();
  }

  getVersionDifference() {
    try {
      return semver.diff(this.specKitStateVersion, this.claudeStateVersion);
    } catch (error) {
      return 'unknown';
    }
  }

  toJSON() {
    return {
      specKitStateVersion: this.specKitStateVersion,
      claudeStateVersion: this.claudeStateVersion,
      divergenceStatus: this.divergenceStatus,
      lastSyncTime: this.lastSyncTime.toISOString(),
      divergenceDetectedAt: this.divergenceDetectedAt ? this.divergenceDetectedAt.toISOString() : null,
      autoReconcile: this.autoReconcile,
      state: this.state,
      divergenceDetectionTime: this.divergenceDetectionTime
    };
  }

  static fromJSON(json) {
    return new ContextAlignment({
      ...json,
      lastSyncTime: new Date(json.lastSyncTime),
      divergenceDetectedAt: json.divergenceDetectedAt ? new Date(json.divergenceDetectedAt) : null
    });
  }
}

export default ContextAlignment;