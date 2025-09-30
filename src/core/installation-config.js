/**
 * T018: InstallationConfig model
 * Manages system setup and dependency verification
 * Based on data-model.md specification
 */

export class InstallationConfig {
  constructor() {
    this.platformInfo = {
      type: null,
      version: null,
      architecture: null
    };
    this.dependencies = [];
    this.installOptions = {
      verbose: false,
      checkOnly: false,
      forceInstall: false
    };
    this.verificationSteps = [];
    this.state = 'CHECKING';
  }

  /**
   * Detect and validate current platform
   * @returns {boolean} true if platform is supported (Linux/macOS)
   */
  detectPlatform() {
    const os = require('os');

    this.platformInfo = {
      type: os.platform(),
      version: os.release(),
      architecture: os.arch()
    };

    // Validate supported platforms per constitutional requirements
    const supportedPlatforms = ['linux', 'darwin']; // macOS = darwin
    const isSupported = supportedPlatforms.includes(this.platformInfo.type);

    this.state = isSupported ? 'COMPATIBLE' : 'INCOMPATIBLE';
    return isSupported;
  }

  /**
   * Add required dependency with version constraint
   * @param {string} name - Package name
   * @param {string} minVersion - Minimum required version
   * @param {string} command - Command to check if installed
   */
  addDependency(name, minVersion, command) {
    this.dependencies.push({
      name,
      minVersion,
      command,
      installed: false,
      currentVersion: null
    });
  }

  /**
   * Add verification step to installation process
   * @param {string} description - What this step verifies
   * @param {string} command - Command to execute
   * @param {string} expectedOutput - Expected output pattern
   */
  addVerificationStep(description, command, expectedOutput = null) {
    this.verificationSteps.push({
      description,
      command,
      expectedOutput,
      passed: false
    });
  }

  /**
   * Validate all dependencies and system requirements
   * @returns {Object} Validation results
   */
  async validateSystem() {
    const results = {
      platform: this.detectPlatform(),
      dependencies: [],
      verificationSteps: [],
      overall: false
    };

    // Check each dependency
    for (const dep of this.dependencies) {
      try {
        const { execSync } = require('child_process');
        const output = execSync(dep.command, { encoding: 'utf8', timeout: 5000 });

        dep.installed = true;
        dep.currentVersion = this.extractVersion(output);

        results.dependencies.push({
          name: dep.name,
          required: dep.minVersion,
          current: dep.currentVersion,
          satisfied: this.compareVersions(dep.currentVersion, dep.minVersion)
        });
      } catch (error) {
        dep.installed = false;
        results.dependencies.push({
          name: dep.name,
          required: dep.minVersion,
          current: null,
          satisfied: false,
          error: error.message
        });
      }
    }

    // Run verification steps
    for (const step of this.verificationSteps) {
      try {
        const { execSync } = require('child_process');
        const output = execSync(step.command, { encoding: 'utf8', timeout: 5000 });

        step.passed = step.expectedOutput ?
          output.includes(step.expectedOutput) :
          true; // If no expected output, just check command succeeds

        results.verificationSteps.push({
          description: step.description,
          passed: step.passed,
          output: output.trim()
        });
      } catch (error) {
        step.passed = false;
        results.verificationSteps.push({
          description: step.description,
          passed: false,
          error: error.message
        });
      }
    }

    // Overall result
    results.overall = results.platform &&
                     results.dependencies.every(dep => dep.satisfied) &&
                     results.verificationSteps.every(step => step.passed);

    this.state = results.overall ? 'COMPATIBLE' : 'INCOMPATIBLE';
    return results;
  }

  /**
   * Extract version number from command output
   * @param {string} output - Command output
   * @returns {string} Version string
   */
  extractVersion(output) {
    // Common version patterns: v1.2.3, 1.2.3, version 1.2.3
    const versionMatch = output.match(/v?(\d+\.\d+\.?\d*)/);
    return versionMatch ? versionMatch[1] : '0.0.0';
  }

  /**
   * Compare version strings (simple semver comparison)
   * @param {string} current - Current version
   * @param {string} required - Required minimum version
   * @returns {boolean} true if current >= required
   */
  compareVersions(current, required) {
    const currentParts = current.split('.').map(Number);
    const requiredParts = required.split('.').map(Number);

    for (let i = 0; i < Math.max(currentParts.length, requiredParts.length); i++) {
      const currentPart = currentParts[i] || 0;
      const requiredPart = requiredParts[i] || 0;

      if (currentPart > requiredPart) return true;
      if (currentPart < requiredPart) return false;
    }

    return true; // Equal versions
  }

  /**
   * Generate installation summary
   * @returns {Object} Installation configuration summary
   */
  getSummary() {
    return {
      platform: this.platformInfo,
      state: this.state,
      dependencyCount: this.dependencies.length,
      verificationStepCount: this.verificationSteps.length,
      options: this.installOptions
    };
  }

  /**
   * Set installation options
   * @param {Object} options - Installation options
   */
  setOptions(options) {
    this.installOptions = { ...this.installOptions, ...options };
  }

  /**
   * Create default configuration for Spec Kit Assistant
   * @returns {InstallationConfig} Configured instance
   */
  static createDefault() {
    const config = new InstallationConfig();

    // Add required dependencies per technical context
    config.addDependency('node', '18.0.0', 'node --version');
    config.addDependency('npm', '8.0.0', 'npm --version');

    // Add verification steps
    config.addVerificationStep(
      'Node.js ES modules support',
      'node -e "console.log(process.versions.node)"'
    );

    config.addVerificationStep(
      'File system permissions',
      'node -e "require(\'fs\').accessSync(\'.\', require(\'fs\').constants.W_OK)"'
    );

    return config;
  }
}

export default InstallationConfig;