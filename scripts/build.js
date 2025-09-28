#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';

/**
 * Production build script for Spec Kit Assistant
 */
class BuildScript {
  constructor() {
    this.buildDir = path.resolve(process.cwd(), 'dist');
    this.sourceDir = path.resolve(process.cwd(), 'src');
    this.spinner = null;
  }

  async run() {
    console.log(chalk.blue('🏗️  Building Spec Kit Assistant for production...'));
    console.log();

    try {
      await this.clean();
      await this.runTests();
      await this.checkDependencies();
      await this.buildApplication();
      await this.optimizeAssets();
      await this.generateMetadata();
      await this.validateBuild();

      console.log();
      console.log(chalk.green('✅ Build completed successfully!'));
      this.printBuildInfo();
    } catch (error) {
      console.error(chalk.red('❌ Build failed:'), error.message);
      process.exit(1);
    }
  }

  /**
   * Clean build directory
   */
  async clean() {
    this.startSpinner('Cleaning build directory');

    await fs.remove(this.buildDir);
    await fs.ensureDir(this.buildDir);

    this.stopSpinner('Build directory cleaned');
  }

  /**
   * Run tests before building
   */
  async runTests() {
    this.startSpinner('Running tests');

    try {
      execSync('npm test -- --silent', { stdio: 'pipe' });
      this.stopSpinner('Tests passed');
    } catch (error) {
      this.stopSpinner('Tests failed', 'error');
      throw new Error('Tests must pass before building');
    }
  }

  /**
   * Check and audit dependencies
   */
  async checkDependencies() {
    this.startSpinner('Checking dependencies');

    // Check for vulnerabilities
    try {
      const auditResult = execSync('npm audit --json', { stdio: 'pipe' });
      const audit = JSON.parse(auditResult.toString());

      if (audit.metadata.vulnerabilities.high > 0 || audit.metadata.vulnerabilities.critical > 0) {
        this.stopSpinner('Security vulnerabilities found', 'warn');
        console.log(chalk.yellow('⚠️  High or critical vulnerabilities detected. Run npm audit fix'));
      } else {
        this.stopSpinner('Dependencies are secure');
      }
    } catch (error) {
      // npm audit returns non-zero exit code when vulnerabilities found
      this.stopSpinner('Dependency check completed with warnings', 'warn');
    }

    // Check for outdated packages
    try {
      const outdated = execSync('npm outdated --json', { stdio: 'pipe' });
      if (outdated.toString().trim()) {
        console.log(chalk.yellow('⚠️  Some packages are outdated. Consider updating.'));
      }
    } catch (error) {
      // npm outdated returns non-zero when packages are outdated
    }
  }

  /**
   * Build the application
   */
  async buildApplication() {
    this.startSpinner('Building application');

    // Copy source files
    await fs.copy(this.sourceDir, path.join(this.buildDir, 'src'));

    // Copy package files
    const packageJson = await fs.readJson('package.json');

    // Remove dev dependencies from production package.json
    delete packageJson.devDependencies;
    delete packageJson.scripts.test;
    delete packageJson.scripts['test:watch'];

    await fs.writeJson(
      path.join(this.buildDir, 'package.json'),
      packageJson,
      { spaces: 2 }
    );

    // Copy other necessary files
    const filesToCopy = [
      'package-lock.json',
      '.env.example',
      'LICENSE'
    ];

    for (const file of filesToCopy) {
      if (await fs.pathExists(file)) {
        await fs.copy(file, path.join(this.buildDir, file));
      }
    }

    // Copy assets
    if (await fs.pathExists('assets')) {
      await fs.copy('assets', path.join(this.buildDir, 'assets'));
    }

    this.stopSpinner('Application built');
  }

  /**
   * Optimize assets and minimize code
   */
  async optimizeAssets() {
    this.startSpinner('Optimizing assets');

    // Minify JSON files
    const jsonFiles = await this.findFiles(this.buildDir, '.json');
    for (const file of jsonFiles) {
      if (!file.includes('node_modules')) {
        const content = await fs.readJson(file);
        await fs.writeJson(file, content);
      }
    }

    // Remove unnecessary files
    const unnecessaryPatterns = [
      '**/*.test.js',
      '**/*.spec.js',
      '**/*.md',
      '**/test/**',
      '**/.git/**',
      '**/.gitignore'
    ];

    for (const pattern of unnecessaryPatterns) {
      const files = await this.findFiles(this.buildDir, pattern);
      for (const file of files) {
        await fs.remove(file);
      }
    }

    // Generate production env file
    await this.generateProductionEnv();

    this.stopSpinner('Assets optimized');
  }

  /**
   * Generate production .env template
   */
  async generateProductionEnv() {
    const envContent = `# Production Environment Variables
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Security
JWT_SECRET=
ENCRYPTION_KEY=
SESSION_SECRET=

# Database
DATABASE_URL=

# Redis
REDIS_URL=

# Cloud Services
GCP_PROJECT_ID=
AWS_REGION=
AZURE_SUBSCRIPTION_ID=

# Monitoring
DATADOG_API_KEY=
NEW_RELIC_API_KEY=
SENTRY_DSN=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
`;

    await fs.writeFile(path.join(this.buildDir, '.env.production'), envContent);
  }

  /**
   * Generate build metadata
   */
  async generateMetadata() {
    this.startSpinner('Generating build metadata');

    const metadata = {
      version: (await fs.readJson('package.json')).version,
      buildTime: new Date().toISOString(),
      buildNumber: process.env.BUILD_NUMBER || 'local',
      commit: this.getGitCommit(),
      branch: this.getGitBranch(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    };

    await fs.writeJson(
      path.join(this.buildDir, 'build-info.json'),
      metadata,
      { spaces: 2 }
    );

    this.stopSpinner('Metadata generated');
  }

  /**
   * Validate the build
   */
  async validateBuild() {
    this.startSpinner('Validating build');

    const requiredFiles = [
      'src/index.js',
      'package.json',
      'build-info.json'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(this.buildDir, file);
      if (!await fs.pathExists(filePath)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }

    // Check build size
    const buildSize = await this.getDirectorySize(this.buildDir);
    if (buildSize > 100 * 1024 * 1024) { // 100MB
      console.log(chalk.yellow(`⚠️  Build size is large: ${this.formatBytes(buildSize)}`));
    }

    this.stopSpinner('Build validated');
  }

  /**
   * Get Git commit hash
   */
  getGitCommit() {
    try {
      return execSync('git rev-parse HEAD').toString().trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get Git branch name
   */
  getGitBranch() {
    try {
      return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    } catch {
      return 'unknown';
    }
  }

  /**
   * Find files matching pattern
   */
  async findFiles(dir, pattern) {
    const files = [];

    async function walk(currentDir) {
      const items = await fs.readdir(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
          await walk(fullPath);
        } else if (fullPath.endsWith(pattern) || fullPath.includes(pattern)) {
          files.push(fullPath);
        }
      }
    }

    await walk(dir);
    return files;
  }

  /**
   * Get directory size
   */
  async getDirectorySize(dir) {
    let size = 0;

    async function walk(currentDir) {
      const items = await fs.readdir(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
          await walk(fullPath);
        } else {
          size += stat.size;
        }
      }
    }

    await walk(dir);
    return size;
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Print build information
   */
  async printBuildInfo() {
    const buildInfo = await fs.readJson(path.join(this.buildDir, 'build-info.json'));
    const buildSize = await this.getDirectorySize(this.buildDir);

    console.log();
    console.log(chalk.cyan('Build Information:'));
    console.log(chalk.gray('─'.repeat(40)));
    console.log(`Version:     ${buildInfo.version}`);
    console.log(`Build Time:  ${buildInfo.buildTime}`);
    console.log(`Commit:      ${buildInfo.commit.substring(0, 8)}`);
    console.log(`Branch:      ${buildInfo.branch}`);
    console.log(`Node:        ${buildInfo.nodeVersion}`);
    console.log(`Platform:    ${buildInfo.platform}-${buildInfo.arch}`);
    console.log(`Size:        ${this.formatBytes(buildSize)}`);
    console.log(`Output:      ${this.buildDir}`);
    console.log(chalk.gray('─'.repeat(40)));
    console.log();
    console.log(chalk.green('Next steps:'));
    console.log('1. cd dist');
    console.log('2. npm ci --production');
    console.log('3. NODE_ENV=production npm start');
  }

  /**
   * Start spinner
   */
  startSpinner(text) {
    this.spinner = ora({
      text,
      spinner: 'dots'
    }).start();
  }

  /**
   * Stop spinner
   */
  stopSpinner(text, type = 'success') {
    if (this.spinner) {
      if (type === 'success') {
        this.spinner.succeed(chalk.green(text));
      } else if (type === 'error') {
        this.spinner.fail(chalk.red(text));
      } else if (type === 'warn') {
        this.spinner.warn(chalk.yellow(text));
      } else {
        this.spinner.info(chalk.blue(text));
      }
    }
  }
}

// Run build script
const builder = new BuildScript();
builder.run().catch(error => {
  console.error(chalk.red('Build failed:'), error);
  process.exit(1);
});