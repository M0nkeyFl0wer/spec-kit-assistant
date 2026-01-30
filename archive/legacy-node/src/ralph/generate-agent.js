/**
 * Generate Agent Module
 * Extracts build/test commands for @AGENT.md
 */

import fs from 'fs-extra';
import path from 'path';

/**
 * Detected commands
 * @typedef {Object} DetectedCommands
 * @property {string[]} build - Build commands
 * @property {string[]} test - Test commands
 * @property {string[]} lint - Lint commands
 * @property {string[]} dev - Development server commands
 * @property {string} packageManager - Package manager (npm, yarn, pnpm)
 */

/**
 * Detect package manager from project
 * @param {string} projectDir - Project root directory
 * @returns {Promise<string>} - Package manager name
 */
export async function detectPackageManager(projectDir) {
  const lockFiles = {
    'pnpm-lock.yaml': 'pnpm',
    'yarn.lock': 'yarn',
    'bun.lockb': 'bun',
    'package-lock.json': 'npm'
  };

  for (const [file, manager] of Object.entries(lockFiles)) {
    if (await fs.pathExists(path.join(projectDir, file))) {
      return manager;
    }
  }

  return 'npm'; // Default
}

/**
 * Extract commands from package.json scripts
 * @param {string} projectDir - Project root directory
 * @returns {Promise<DetectedCommands | null>}
 */
export async function extractFromPackageJson(projectDir) {
  const packagePath = path.join(projectDir, 'package.json');

  if (!await fs.pathExists(packagePath)) {
    return null;
  }

  const pkg = await fs.readJson(packagePath);
  const scripts = pkg.scripts || {};
  const pm = await detectPackageManager(projectDir);

  const commands = {
    build: [],
    test: [],
    lint: [],
    dev: [],
    packageManager: pm
  };

  // Map script names to command types
  const scriptMappings = {
    build: ['build', 'compile', 'bundle'],
    test: ['test', 'test:unit', 'test:integration', 'test:ci', 'test:e2e'],
    lint: ['lint', 'lint:fix', 'check', 'typecheck'],
    dev: ['dev', 'start', 'serve', 'watch']
  };

  for (const [scriptName, scriptCmd] of Object.entries(scripts)) {
    const lowerName = scriptName.toLowerCase();

    for (const [type, patterns] of Object.entries(scriptMappings)) {
      if (patterns.some(p => lowerName === p || lowerName.startsWith(p + ':'))) {
        commands[type].push(`${pm} run ${scriptName}`);
        break;
      }
    }
  }

  return commands;
}

/**
 * Extract commands from CLAUDE.md
 * @param {string} projectDir - Project root directory
 * @returns {Promise<DetectedCommands | null>}
 */
export async function extractFromClaudeMd(projectDir) {
  const claudePath = path.join(projectDir, 'CLAUDE.md');

  if (!await fs.pathExists(claudePath)) {
    return null;
  }

  const content = await fs.readFile(claudePath, 'utf8');
  const commands = {
    build: [],
    test: [],
    lint: [],
    dev: [],
    packageManager: 'npm'
  };

  // Find code blocks with commands
  const codeBlockRegex = /```(?:bash|sh|shell)?\n([\s\S]*?)```/g;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const block = match[1];
    const lines = block.split('\n').filter(l => l.trim());

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip comments and empty lines
      if (trimmed.startsWith('#') || !trimmed) {
        continue;
      }

      // Categorize by keywords
      if (/\b(test|jest|mocha|vitest|pytest)\b/i.test(trimmed)) {
        if (!commands.test.includes(trimmed)) {
          commands.test.push(trimmed);
        }
      } else if (/\b(build|compile|bundle|tsc)\b/i.test(trimmed)) {
        if (!commands.build.includes(trimmed)) {
          commands.build.push(trimmed);
        }
      } else if (/\b(lint|eslint|prettier|check)\b/i.test(trimmed)) {
        if (!commands.lint.includes(trimmed)) {
          commands.lint.push(trimmed);
        }
      } else if (/\b(dev|start|serve|watch)\b/i.test(trimmed)) {
        if (!commands.dev.includes(trimmed)) {
          commands.dev.push(trimmed);
        }
      }
    }
  }

  return commands;
}

/**
 * Merge command sources, preferring package.json
 * @param {DetectedCommands[]} sources - Command sources
 * @returns {DetectedCommands}
 */
function mergeCommands(sources) {
  const merged = {
    build: [],
    test: [],
    lint: [],
    dev: [],
    packageManager: 'npm'
  };

  for (const source of sources) {
    if (!source) continue;

    for (const type of ['build', 'test', 'lint', 'dev']) {
      for (const cmd of source[type]) {
        if (!merged[type].includes(cmd)) {
          merged[type].push(cmd);
        }
      }
    }

    if (source.packageManager !== 'npm') {
      merged.packageManager = source.packageManager;
    }
  }

  return merged;
}

/**
 * Detect all commands from project
 * @param {string} projectDir - Project root directory
 * @returns {Promise<DetectedCommands>}
 */
export async function detectCommands(projectDir) {
  const [pkgCommands, claudeCommands] = await Promise.all([
    extractFromPackageJson(projectDir),
    extractFromClaudeMd(projectDir)
  ]);

  return mergeCommands([pkgCommands, claudeCommands]);
}

/**
 * Generate @AGENT.md content
 * @param {DetectedCommands} commands - Detected commands
 * @param {Object} options - Generation options
 * @param {string} options.featureName - Feature name
 * @returns {string} - @AGENT.md content
 */
export function generateAgentContent(commands, options = {}) {
  const { featureName = 'Feature Implementation' } = options;
  const sections = [];

  sections.push(`# Agent Instructions: ${featureName}`);
  sections.push('');
  sections.push('## Environment Setup');
  sections.push('');
  sections.push('Before starting implementation:');
  sections.push('');
  sections.push('```bash');
  sections.push('# Install dependencies');
  sections.push(`${commands.packageManager} install`);
  sections.push('```');
  sections.push('');

  // Build commands
  if (commands.build.length > 0) {
    sections.push('## Build Commands');
    sections.push('');
    sections.push('Run after changes to verify build:');
    sections.push('');
    sections.push('```bash');
    for (const cmd of commands.build) {
      sections.push(cmd);
    }
    sections.push('```');
    sections.push('');
  }

  // Test commands
  if (commands.test.length > 0) {
    sections.push('## Test Commands');
    sections.push('');
    sections.push('Run tests after each task:');
    sections.push('');
    sections.push('```bash');
    for (const cmd of commands.test) {
      sections.push(cmd);
    }
    sections.push('```');
    sections.push('');
  }

  // Lint commands
  if (commands.lint.length > 0) {
    sections.push('## Lint Commands');
    sections.push('');
    sections.push('Check code style:');
    sections.push('');
    sections.push('```bash');
    for (const cmd of commands.lint) {
      sections.push(cmd);
    }
    sections.push('```');
    sections.push('');
  }

  // Verification workflow
  sections.push('## Verification Workflow');
  sections.push('');
  sections.push('After completing each task:');
  sections.push('');
  sections.push('1. Run tests to verify no regressions');
  if (commands.build.length > 0) {
    sections.push('2. Run build to ensure compilation succeeds');
  }
  sections.push(`${commands.build.length > 0 ? '3' : '2'}. Update @fix_plan.md checkbox to [x]`);
  sections.push(`${commands.build.length > 0 ? '4' : '3'}. Commit changes with descriptive message`);
  sections.push('');

  // Git workflow
  sections.push('## Git Workflow');
  sections.push('');
  sections.push('```bash');
  sections.push('# After each task');
  sections.push('git add -A');
  sections.push('git commit -m "Task X.Y: Description"');
  sections.push('```');
  sections.push('');

  // Completion criteria
  sections.push('## Completion Criteria');
  sections.push('');
  sections.push('Implementation is complete when:');
  sections.push('');
  sections.push('- [ ] All tasks in @fix_plan.md are checked');
  if (commands.test.length > 0) {
    sections.push('- [ ] All tests pass');
  }
  if (commands.build.length > 0) {
    sections.push('- [ ] Build succeeds without errors');
  }
  sections.push('- [ ] All changes are committed');
  sections.push('');

  return sections.join('\n');
}

/**
 * Generate @AGENT.md file
 * @param {string} projectDir - Project root directory
 * @param {string} outputPath - Path to write @AGENT.md
 * @param {Object} options - Generation options
 * @returns {Promise<{success: boolean, commands: DetectedCommands, error?: string}>}
 */
export async function generateAgentFile(projectDir, outputPath, options = {}) {
  try {
    const commands = await detectCommands(projectDir);
    const content = generateAgentContent(commands, options);

    await fs.writeFile(outputPath, content);

    return {
      success: true,
      commands
    };
  } catch (error) {
    return {
      success: false,
      commands: null,
      error: error.message
    };
  }
}
