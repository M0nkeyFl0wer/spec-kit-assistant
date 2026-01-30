/**
 * Ralph Start Module
 * Starts the Ralph autonomous loop
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { spawn } from 'node:child_process';

/**
 * Check if Ralph CLI is installed
 * @returns {Promise<{installed: boolean, path?: string, version?: string}>}
 */
export async function checkRalphInstalled() {
  const searchPaths = [
    path.join(process.env.HOME || '', '.local', 'bin', 'ralph'),
    path.join(process.env.HOME || '', '.ralph', 'ralph'),
    '/usr/local/bin/ralph',
    '/usr/bin/ralph'
  ];

  // Check PATH first
  try {
    const { execSync } = await import('node:child_process');
    const whichResult = execSync('which ralph 2>/dev/null', { encoding: 'utf8' }).trim();
    if (whichResult) {
      return { installed: true, path: whichResult };
    }
  } catch {
    // Not in PATH, check other locations
  }

  for (const searchPath of searchPaths) {
    if (await fs.pathExists(searchPath)) {
      return { installed: true, path: searchPath };
    }
  }

  return { installed: false };
}

/**
 * Verify required files exist
 * @param {string} projectDir - Project root directory
 * @returns {Promise<{valid: boolean, missing: string[]}>}
 */
export async function verifyRequiredFiles(projectDir) {
  const requiredFiles = [
    '@fix_plan.md',
    'PROMPT.md',
    '@AGENT.md'
  ];

  const missing = [];

  for (const file of requiredFiles) {
    const filePath = path.join(projectDir, file);
    if (!await fs.pathExists(filePath)) {
      missing.push(file);
    }
  }

  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Start Ralph execution
 * @param {string} projectDir - Project root directory
 * @param {Object} options - Start options
 * @param {number} [options.max] - Maximum iterations
 * @param {boolean} [options.monitor=false] - Open monitor mode
 * @param {boolean} [options.dryRun=false] - Just validate, don't run
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function startRalph(projectDir, options = {}) {
  const { max, monitor = false, dryRun = false } = options;

  // Check Ralph is installed
  const ralphCheck = await checkRalphInstalled();
  if (!ralphCheck.installed) {
    return {
      success: false,
      error: 'Ralph CLI not found. Install from: https://github.com/anthropics/ralph'
    };
  }

  // Verify required files
  const filesCheck = await verifyRequiredFiles(projectDir);
  if (!filesCheck.valid) {
    return {
      success: false,
      error: `Missing required files: ${filesCheck.missing.join(', ')}. Run '/speckit.ralph init' first.`
    };
  }

  if (dryRun) {
    console.log(chalk.green('✓ All checks passed. Ready to start Ralph.'));
    return { success: true };
  }

  // Build Ralph command
  const args = [];

  if (max) {
    args.push('--max', String(max));
  }

  if (monitor) {
    args.push('--monitor');
  }

  console.log(chalk.cyan(`\n🚀 Starting Ralph...`));
  console.log(chalk.gray(`   Command: ${ralphCheck.path} ${args.join(' ')}`));
  console.log(chalk.gray(`   Project: ${projectDir}`));
  console.log('');

  // Spawn Ralph process
  return new Promise((resolve) => {
    const ralph = spawn(ralphCheck.path, args, {
      cwd: projectDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        RALPH_PROJECT_DIR: projectDir
      }
    });

    ralph.on('error', (error) => {
      resolve({
        success: false,
        error: `Failed to start Ralph: ${error.message}`
      });
    });

    ralph.on('exit', (code) => {
      if (code === 0) {
        console.log(chalk.green('\n✅ Ralph completed successfully'));
        resolve({ success: true });
      } else {
        resolve({
          success: false,
          error: `Ralph exited with code ${code}`
        });
      }
    });
  });
}

/**
 * CLI entry point
 * @param {string[]} args - Command line arguments
 */
export async function cli(args = []) {
  const projectDir = process.cwd();

  // Parse arguments
  const options = {
    max: undefined,
    monitor: false,
    dryRun: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--max' || arg === '-m') {
      options.max = parseInt(args[++i], 10);
    } else if (arg === '--monitor') {
      options.monitor = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    }
  }

  try {
    const result = await startRalph(projectDir, options);

    if (!result.success) {
      console.error(chalk.red(`\n❌ ${result.error}`));
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}`));
    process.exit(1);
  }
}

// Run CLI if executed directly
const isMain = process.argv[1]?.endsWith('start.js') || process.argv[1]?.endsWith('ralph/start');
if (isMain) {
  cli(process.argv.slice(2));
}
