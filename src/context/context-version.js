/**
 * ContextVersion Service
 * Spec: Feature 788 - T026 (FR-006)
 *
 * Version management with semver integration and changelog generation
 */

import { promises as fs } from 'fs';
import path from 'path';
import semver from 'semver';
import { ContextVersion as ContextVersionModel } from './models/context-version.js';

export class ContextVersion {
  constructor(options = {}) {
    this.versionHistoryDir = options.versionHistoryDir ||
      path.join(process.cwd(), '.specify/state/version-history');
    this.versions = new Map(); // Cache of loaded versions
  }

  /**
   * Create new version with semver increment
   * FR-006
   */
  async createVersion(options) {
    if (!options.previousVersion || !options.changes || !options.changeType) {
      throw new Error('previousVersion, changes, and changeType are required');
    }

    // Validate previous version
    if (!semver.valid(options.previousVersion)) {
      throw new Error(`Invalid semver previousVersion: ${options.previousVersion}`);
    }

    // Calculate new version
    const newVersionNumber = semver.inc(options.previousVersion, options.changeType);

    if (!newVersionNumber) {
      throw new Error(`Failed to increment version from ${options.previousVersion}`);
    }

    // Create changelog entries
    const changelog = options.changes.map(change => {
      if (typeof change === 'string') {
        return {
          field: 'general',
          change: change,
          before: null,
          after: null,
          timestamp: new Date()
        };
      }
      return {
        ...change,
        timestamp: new Date()
      };
    });

    // Create version model
    const versionModel = new ContextVersionModel({
      versionNumber: newVersionNumber,
      snapshot: options.snapshot || {},
      changelog,
      timestamp: new Date(),
      triggeringEvent: options.triggeringEvent || 'manual'
    });

    // Freeze to make immutable
    versionModel.freeze();

    // Persist to file
    const persistPath = await this.persistVersion(versionModel);

    // Cache it
    this.versions.set(newVersionNumber, versionModel);

    return {
      version: newVersionNumber,
      changelog,
      persistedTo: persistPath
    };
  }

  /**
   * Retrieve specific version from history
   */
  async getVersion(options = {}) {
    if (!options.version) {
      // Return current version (highest)
      const allVersions = await this.getVersionHistory();
      if (allVersions.versions.length === 0) {
        throw new Error('No versions available');
      }

      const latest = allVersions.versions[0];
      return {
        ...latest,
        isCurrent: true
      };
    }

    // Check cache first
    if (this.versions.has(options.version)) {
      const cached = this.versions.get(options.version);
      return {
        version: cached.versionNumber,
        timestamp: cached.timestamp,
        changes: cached.changelog,
        snapshot: cached.snapshot
      };
    }

    // Load from file
    const versionFile = path.join(this.versionHistoryDir, `context-${options.version}.json`);

    try {
      const data = await fs.readFile(versionFile, 'utf8');
      const json = JSON.parse(data);
      const versionModel = ContextVersionModel.fromJSON(json);

      // Cache it
      this.versions.set(options.version, versionModel);

      return {
        version: versionModel.versionNumber,
        timestamp: versionModel.timestamp,
        changes: versionModel.changelog,
        snapshot: versionModel.snapshot
      };
    } catch (error) {
      const err = new Error(`Version ${options.version} not found`);
      err.name = 'VersionNotFound';
      throw err;
    }
  }

  /**
   * Compare two versions and calculate diff
   */
  async compareVersions(options) {
    if (!options.fromVersion || !options.toVersion) {
      throw new Error('Both fromVersion and toVersion are required');
    }

    const fromVer = await this.getVersion({ version: options.fromVersion });
    const toVer = await this.getVersion({ version: options.toVersion });

    // Aggregate all changes between versions
    const allChanges = [];

    // For simplicity, we'll include the toVersion's changelog
    // In a full implementation, we'd aggregate all intermediate versions
    if (toVer.changes) {
      allChanges.push(...toVer.changes);
    }

    // Calculate semantic distance
    const distance = semver.diff(options.fromVersion, options.toVersion);

    // Determine if significantly divergent
    const isDivergent = distance === 'major' || distance === 'premajor';

    return {
      diff: {
        changes: allChanges,
        fromVersion: options.fromVersion,
        toVersion: options.toVersion
      },
      isDivergent,
      distance
    };
  }

  /**
   * Get complete version history
   */
  async getVersionHistory(options = {}) {
    await fs.mkdir(this.versionHistoryDir, { recursive: true });

    const files = await fs.readdir(this.versionHistoryDir);
    const versionFiles = files.filter(f => f.startsWith('context-') && f.endsWith('.json'));

    const versions = [];

    for (const file of versionFiles) {
      const filePath = path.join(this.versionHistoryDir, file);
      const data = await fs.readFile(filePath, 'utf8');
      const json = JSON.parse(data);

      const versionData = {
        version: json.version || json.versionNumber,
        timestamp: new Date(json.timestamp),
        changeCount: json.changelog ? json.changelog.length : 0,
        triggeringEvent: json.triggeringEvent
      };

      // Apply date range filter if provided
      if (options.from && versionData.timestamp < options.from) {
        continue;
      }

      if (options.to && versionData.timestamp > options.to) {
        continue;
      }

      versions.push(versionData);
    }

    // Sort by version (newest first)
    versions.sort((a, b) => {
      try {
        return semver.rcompare(a.version, b.version);
      } catch (error) {
        return b.timestamp - a.timestamp;
      }
    });

    return {
      versions,
      totalCount: versions.length
    };
  }

  /**
   * Rollback to a previous version
   */
  async rollbackToVersion(options) {
    if (!options.version) {
      throw new Error('version is required for rollback');
    }

    // Verify version exists
    const targetVersion = await this.getVersion({ version: options.version });

    // Get current latest version
    const history = await this.getVersionHistory();
    const currentVersion = history.versions.length > 0 ? history.versions[0].version : '1.0.0';

    // Create a new version that represents the rollback
    const rollbackVersion = semver.inc(currentVersion, 'minor');

    const newVersion = await this.createVersion({
      previousVersion: currentVersion,
      changes: [`Rolled back to version ${options.version}`],
      changeType: 'minor',
      snapshot: targetVersion.snapshot,
      triggeringEvent: 'rollback'
    });

    return {
      rolledBackTo: options.version,
      newVersion: newVersion.version,
      success: true
    };
  }

  /**
   * Persist version to file
   * Internal method
   */
  async persistVersion(versionModel) {
    await fs.mkdir(this.versionHistoryDir, { recursive: true });

    const filename = `context-${versionModel.versionNumber}.json`;
    const filePath = path.join(this.versionHistoryDir, filename);

    await fs.writeFile(filePath, JSON.stringify(versionModel.toJSON(), null, 2), 'utf8');

    return filePath;
  }
}

export default ContextVersion;