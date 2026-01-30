/**
 * Ralph Remote Execution Module
 * Handles rsync + SSH execution on remote hosts for heavy compute tasks
 *
 * @module ralph/remote
 */

import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

/**
 * Remote host configuration
 * @typedef {Object} RemoteConfig
 * @property {string} host - SSH host (hostname or alias from ~/.ssh/config)
 * @property {string} user - SSH username
 * @property {number} [port=22] - SSH port
 * @property {string} remotePath - Remote directory path
 * @property {string[]} [excludes] - Files/patterns to exclude from rsync
 */

/**
 * Execution result
 * @typedef {Object} ExecResult
 * @property {boolean} success - Whether execution succeeded
 * @property {number} exitCode - Process exit code
 * @property {string} stdout - Standard output
 * @property {string} stderr - Standard error
 * @property {string} [error] - Error message if failed
 */

/**
 * Default rsync excludes for Node.js projects
 */
const DEFAULT_EXCLUDES = [
  'node_modules',
  '.git',
  '.env',
  '.env.local',
  'dist',
  'build',
  'coverage',
  '*.log',
  '.DS_Store'
];

/**
 * Get remote configuration from environment variables
 * @returns {RemoteConfig | null} - Remote config or null if not configured
 */
export function getRemoteConfig() {
  const host = process.env.RALPH_REMOTE_HOST;
  const user = process.env.RALPH_REMOTE_USER;
  const remotePath = process.env.RALPH_REMOTE_PATH;

  if (!host || !user || !remotePath) {
    return null;
  }

  return {
    host,
    user,
    port: parseInt(process.env.RALPH_REMOTE_PORT || '22', 10),
    remotePath,
    excludes: process.env.RALPH_REMOTE_EXCLUDES
      ? process.env.RALPH_REMOTE_EXCLUDES.split(',').map(e => e.trim())
      : DEFAULT_EXCLUDES
  };
}

/**
 * Validate remote configuration
 * @param {RemoteConfig} config - Configuration to validate
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateConfig(config) {
  const errors = [];

  if (!config) {
    errors.push('No remote configuration provided');
    return { valid: false, errors };
  }

  if (!config.host) {
    errors.push('Missing required: host');
  }

  if (!config.user) {
    errors.push('Missing required: user');
  }

  if (!config.remotePath) {
    errors.push('Missing required: remotePath');
  }

  if (config.port && (config.port < 1 || config.port > 65535)) {
    errors.push('Invalid port number (must be 1-65535)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Build SSH connection string
 * @param {RemoteConfig} config - Remote configuration
 * @returns {string} - SSH connection string
 */
export function buildSshTarget(config) {
  const portOption = config.port !== 22 ? `-p ${config.port}` : '';
  return `${config.user}@${config.host}${portOption ? ' ' + portOption : ''}`;
}

/**
 * Build rsync exclude arguments
 * @param {string[]} excludes - Patterns to exclude
 * @returns {string[]} - Rsync exclude arguments
 */
function buildExcludeArgs(excludes) {
  return excludes.flatMap(pattern => ['--exclude', pattern]);
}

/**
 * Execute a command and capture output
 * @param {string} command - Command to execute
 * @param {string[]} args - Command arguments
 * @param {Object} [options] - Spawn options
 * @returns {Promise<ExecResult>}
 */
function execCommand(command, args, options = {}) {
  return new Promise((resolve) => {
    const proc = spawn(command, args, {
      ...options,
      stdio: ['inherit', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      resolve({
        success: code === 0,
        exitCode: code ?? 1,
        stdout,
        stderr
      });
    });

    proc.on('error', (err) => {
      resolve({
        success: false,
        exitCode: 1,
        stdout,
        stderr,
        error: err.message
      });
    });
  });
}

/**
 * Test SSH connection to remote host
 * @param {RemoteConfig} config - Remote configuration
 * @returns {Promise<ExecResult>}
 */
export async function testConnection(config) {
  const args = [];

  if (config.port !== 22) {
    args.push('-p', config.port.toString());
  }

  args.push(
    '-o', 'ConnectTimeout=10',
    '-o', 'BatchMode=yes',
    `${config.user}@${config.host}`,
    'echo "Connection successful"'
  );

  return execCommand('ssh', args);
}

/**
 * Sync local project to remote host using rsync
 * @param {string} localPath - Local project directory
 * @param {RemoteConfig} config - Remote configuration
 * @param {Object} [options] - Sync options
 * @param {boolean} [options.dryRun=false] - Perform dry run
 * @param {boolean} [options.delete=false] - Delete extraneous files from destination
 * @param {boolean} [options.verbose=false] - Verbose output
 * @returns {Promise<ExecResult>}
 */
export async function syncToRemote(localPath, config, options = {}) {
  const { dryRun = false, delete: deleteExtraneous = false, verbose = false } = options;

  const args = [
    '-avz',
    '--progress'
  ];

  if (dryRun) {
    args.push('--dry-run');
  }

  if (deleteExtraneous) {
    args.push('--delete');
  }

  if (verbose) {
    args.push('-v');
  }

  // Add excludes
  args.push(...buildExcludeArgs(config.excludes || DEFAULT_EXCLUDES));

  // SSH options for custom port
  if (config.port !== 22) {
    args.push('-e', `ssh -p ${config.port}`);
  }

  // Source and destination
  const source = localPath.endsWith('/') ? localPath : `${localPath}/`;
  const dest = `${config.user}@${config.host}:${config.remotePath}`;

  args.push(source, dest);

  return execCommand('rsync', args);
}

/**
 * Execute a command on the remote host via SSH
 * @param {RemoteConfig} config - Remote configuration
 * @param {string} command - Command to execute
 * @param {Object} [options] - Execution options
 * @param {boolean} [options.cd=true] - Change to remotePath before executing
 * @returns {Promise<ExecResult>}
 */
export async function execRemote(config, command, options = {}) {
  const { cd = true } = options;

  const args = [];

  if (config.port !== 22) {
    args.push('-p', config.port.toString());
  }

  args.push(`${config.user}@${config.host}`);

  // Build the remote command
  const remoteCmd = cd
    ? `cd ${config.remotePath} && ${command}`
    : command;

  args.push(remoteCmd);

  return execCommand('ssh', args);
}

/**
 * Start Ralph on remote host
 * @param {RemoteConfig} config - Remote configuration
 * @param {Object} [options] - Ralph options
 * @param {number} [options.maxIterations] - Max Ralph iterations
 * @returns {Promise<ExecResult>}
 */
export async function startRemoteRalph(config, options = {}) {
  const { maxIterations } = options;

  let command = 'ralph';

  if (maxIterations) {
    command += ` --max ${maxIterations}`;
  }

  return execRemote(config, command);
}

/**
 * Get progress from remote @fix_plan.md
 * @param {RemoteConfig} config - Remote configuration
 * @returns {Promise<{success: boolean, progress?: Object, error?: string}>}
 */
export async function getRemoteProgress(config) {
  const result = await execRemote(config, 'cat @fix_plan.md 2>/dev/null || echo ""');

  if (!result.success) {
    return {
      success: false,
      error: result.error || result.stderr
    };
  }

  const content = result.stdout;
  if (!content.trim()) {
    return {
      success: false,
      error: '@fix_plan.md not found on remote'
    };
  }

  // Parse progress from content
  const totalTasks = (content.match(/^- \[[x ]\]/gm) || []).length;
  const completedTasks = (content.match(/^- \[x\]/gm) || []).length;

  return {
    success: true,
    progress: {
      total: totalTasks,
      completed: completedTasks,
      percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    }
  };
}

/**
 * Sync results back from remote host
 * @param {string} localPath - Local project directory
 * @param {RemoteConfig} config - Remote configuration
 * @param {Object} [options] - Sync options
 * @param {string[]} [options.files] - Specific files to sync back
 * @returns {Promise<ExecResult>}
 */
export async function syncFromRemote(localPath, config, options = {}) {
  const { files } = options;

  const args = [
    '-avz',
    '--progress'
  ];

  // SSH options for custom port
  if (config.port !== 22) {
    args.push('-e', `ssh -p ${config.port}`);
  }

  // Source and destination
  const source = files && files.length > 0
    ? files.map(f => `${config.user}@${config.host}:${config.remotePath}/${f}`).join(' ')
    : `${config.user}@${config.host}:${config.remotePath}/`;

  args.push(source, localPath);

  return execCommand('rsync', args);
}

/**
 * Full remote deployment workflow
 * @param {string} projectDir - Local project directory
 * @param {RemoteConfig} config - Remote configuration
 * @param {Object} [options] - Deployment options
 * @param {boolean} [options.quiet=false] - Suppress output
 * @param {number} [options.maxIterations] - Max Ralph iterations
 * @returns {Promise<{success: boolean, steps: Object[], error?: string}>}
 */
export async function deployAndRun(projectDir, config, options = {}) {
  const { quiet = false, maxIterations } = options;
  const log = quiet ? () => {} : console.log;
  const steps = [];

  // Step 1: Validate configuration
  log(chalk.cyan('\n1. Validating remote configuration...'));
  const validation = validateConfig(config);

  if (!validation.valid) {
    return {
      success: false,
      steps,
      error: `Configuration invalid: ${validation.errors.join(', ')}`
    };
  }
  steps.push({ name: 'validate', success: true });
  log(chalk.green('   Configuration valid'));

  // Step 2: Test connection
  log(chalk.cyan('\n2. Testing SSH connection...'));
  const connTest = await testConnection(config);

  if (!connTest.success) {
    return {
      success: false,
      steps,
      error: `Connection failed: ${connTest.error || connTest.stderr}`
    };
  }
  steps.push({ name: 'connect', success: true });
  log(chalk.green('   Connection successful'));

  // Step 3: Sync project
  log(chalk.cyan('\n3. Syncing project to remote...'));
  const syncResult = await syncToRemote(projectDir, config);

  if (!syncResult.success) {
    return {
      success: false,
      steps,
      error: `Sync failed: ${syncResult.error || syncResult.stderr}`
    };
  }
  steps.push({ name: 'sync', success: true });
  log(chalk.green('   Project synced'));

  // Step 4: Install dependencies
  log(chalk.cyan('\n4. Installing dependencies on remote...'));
  const installResult = await execRemote(config, 'npm install');

  if (!installResult.success) {
    return {
      success: false,
      steps,
      error: `Install failed: ${installResult.error || installResult.stderr}`
    };
  }
  steps.push({ name: 'install', success: true });
  log(chalk.green('   Dependencies installed'));

  // Step 5: Start Ralph
  log(chalk.cyan('\n5. Starting Ralph on remote...'));
  const ralphResult = await startRemoteRalph(config, { maxIterations });

  steps.push({
    name: 'ralph',
    success: ralphResult.success,
    output: ralphResult.stdout
  });

  if (ralphResult.success) {
    log(chalk.green('   Ralph completed successfully'));
  } else {
    log(chalk.yellow('   Ralph finished with issues'));
  }

  return {
    success: ralphResult.success,
    steps
  };
}

/**
 * CLI entry point
 * @param {string[]} args - Command line arguments
 */
export async function cli(args = []) {
  const projectDir = process.cwd();
  const command = args[0] || 'status';

  // Get configuration
  const config = getRemoteConfig();

  if (!config) {
    console.log(chalk.red('\nError: Remote not configured'));
    console.log(chalk.yellow('\nSet these environment variables:'));
    console.log('  RALPH_REMOTE_HOST     - SSH host (required)');
    console.log('  RALPH_REMOTE_USER     - SSH username (required)');
    console.log('  RALPH_REMOTE_PATH     - Remote directory path (required)');
    console.log('  RALPH_REMOTE_PORT     - SSH port (default: 22)');
    console.log('  RALPH_REMOTE_EXCLUDES - Comma-separated exclude patterns');
    console.log('');
    process.exit(1);
  }

  switch (command) {
    case 'test':
      console.log(chalk.cyan('\nTesting remote connection...'));
      const testResult = await testConnection(config);
      if (testResult.success) {
        console.log(chalk.green('Connection successful!'));
        console.log(testResult.stdout);
      } else {
        console.log(chalk.red('Connection failed'));
        console.log(testResult.stderr || testResult.error);
      }
      process.exit(testResult.success ? 0 : 1);
      break;

    case 'sync':
      console.log(chalk.cyan('\nSyncing project to remote...'));
      const dryRun = args.includes('--dry-run');
      const syncResult = await syncToRemote(projectDir, config, { dryRun, verbose: true });
      if (syncResult.success) {
        console.log(chalk.green('\nSync complete!'));
      } else {
        console.log(chalk.red('\nSync failed'));
        console.log(syncResult.stderr || syncResult.error);
      }
      process.exit(syncResult.success ? 0 : 1);
      break;

    case 'run':
      const maxIterations = args.includes('--max')
        ? parseInt(args[args.indexOf('--max') + 1], 10)
        : undefined;
      const result = await deployAndRun(projectDir, config, { maxIterations });
      process.exit(result.success ? 0 : 1);
      break;

    case 'progress':
      const progress = await getRemoteProgress(config);
      if (progress.success) {
        console.log(chalk.cyan('\nRemote Progress:'));
        console.log(`  Completed: ${progress.progress.completed}/${progress.progress.total}`);
        console.log(`  Percentage: ${progress.progress.percentage}%`);
      } else {
        console.log(chalk.red(`\nFailed to get progress: ${progress.error}`));
      }
      process.exit(progress.success ? 0 : 1);
      break;

    case 'pull':
      console.log(chalk.cyan('\nPulling results from remote...'));
      const pullResult = await syncFromRemote(projectDir, config);
      if (pullResult.success) {
        console.log(chalk.green('\nPull complete!'));
      } else {
        console.log(chalk.red('\nPull failed'));
        console.log(pullResult.stderr || pullResult.error);
      }
      process.exit(pullResult.success ? 0 : 1);
      break;

    case 'status':
    default:
      console.log(chalk.cyan('\nRemote Configuration:'));
      console.log(`  Host: ${config.host}`);
      console.log(`  User: ${config.user}`);
      console.log(`  Port: ${config.port}`);
      console.log(`  Path: ${config.remotePath}`);
      console.log(`  Excludes: ${config.excludes.join(', ')}`);
      console.log('');
      console.log(chalk.cyan('Commands:'));
      console.log('  test     - Test SSH connection');
      console.log('  sync     - Sync project to remote');
      console.log('  run      - Full deploy and run workflow');
      console.log('  progress - Check remote progress');
      console.log('  pull     - Pull results back');
      break;
  }
}

// Run CLI if executed directly
const isMain = process.argv[1]?.endsWith('remote.js') || process.argv[1]?.endsWith('ralph/remote');
if (isMain) {
  cli(process.argv.slice(2));
}
