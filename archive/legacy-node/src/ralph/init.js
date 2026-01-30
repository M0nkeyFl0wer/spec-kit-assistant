/**
 * Ralph Init Module
 * CLI entry point for /speckit.ralph init
 * Generates all Ralph project files from Spec Kit artifacts
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

import { findTasksFile, generateFixPlan } from './parse-tasks.js';
import { findAllArtifacts, generatePromptFile } from './generate-prompt.js';
import { generateAgentFile } from './generate-agent.js';

/**
 * Init result
 * @typedef {Object} InitResult
 * @property {boolean} success - Overall success
 * @property {Object} files - Generated files info
 * @property {string[]} warnings - Any warnings
 * @property {string[]} errors - Any errors
 */

/**
 * Initialize Ralph project files
 * @param {string} projectDir - Project root directory
 * @param {Object} options - Init options
 * @param {boolean} [options.force=false] - Overwrite existing files
 * @param {boolean} [options.quiet=false] - Suppress output
 * @returns {Promise<InitResult>}
 */
export async function initRalphProject(projectDir, options = {}) {
  const { force = false, quiet = false } = options;
  const result = {
    success: false,
    files: {},
    warnings: [],
    errors: []
  };

  const log = quiet ? () => {} : console.log;

  log(chalk.cyan('\n🔧 Initializing Ralph project files...\n'));

  // Output paths
  const fixPlanPath = path.join(projectDir, '@fix_plan.md');
  const promptPath = path.join(projectDir, 'PROMPT.md');
  const agentPath = path.join(projectDir, '@AGENT.md');

  // Check for existing files
  const existingFiles = [];
  for (const filePath of [fixPlanPath, promptPath, agentPath]) {
    if (await fs.pathExists(filePath)) {
      existingFiles.push(path.basename(filePath));
    }
  }

  if (existingFiles.length > 0 && !force) {
    result.warnings.push(`Files already exist: ${existingFiles.join(', ')}. Use --force to overwrite.`);
    log(chalk.yellow(`⚠️  ${result.warnings[0]}`));
  }

  // Step 1: Find and convert tasks.md to @fix_plan.md
  log(chalk.blue('📋 Looking for tasks.md...'));
  const tasksPath = await findTasksFile(projectDir);

  if (tasksPath) {
    log(chalk.green(`   Found: ${path.relative(projectDir, tasksPath)}`));

    if (!existingFiles.includes('@fix_plan.md') || force) {
      const fixPlanResult = await generateFixPlan(tasksPath, fixPlanPath);

      if (fixPlanResult.success) {
        result.files.fixPlan = {
          path: fixPlanPath,
          tasksCount: fixPlanResult.tasksCount
        };
        log(chalk.green(`   ✓ Generated @fix_plan.md (${fixPlanResult.tasksCount} tasks)`));
      } else {
        result.errors.push(`Failed to generate @fix_plan.md: ${fixPlanResult.error}`);
        log(chalk.red(`   ✗ ${fixPlanResult.error}`));
      }
    } else {
      log(chalk.gray('   Skipped @fix_plan.md (already exists)'));
    }
  } else {
    result.warnings.push('No tasks.md found in specs/, .speckit/, or project root');
    log(chalk.yellow('   ⚠️  No tasks.md found'));
  }

  // Step 2: Generate PROMPT.md from spec artifacts
  log(chalk.blue('\n📄 Looking for spec artifacts...'));
  const artifacts = await findAllArtifacts(projectDir);
  const artifactNames = Object.keys(artifacts);

  if (artifactNames.length > 0) {
    log(chalk.green(`   Found: ${artifactNames.join(', ')}`));

    if (!existingFiles.includes('PROMPT.md') || force) {
      // Try to extract feature name from spec or tasks
      let featureName = 'Feature Implementation';
      if (artifacts.spec) {
        const specContent = await fs.readFile(artifacts.spec, 'utf8');
        const titleMatch = specContent.match(/^#\s+(.+)/m);
        if (titleMatch) {
          featureName = titleMatch[1].trim();
        }
      }

      const promptResult = await generatePromptFile(projectDir, promptPath, { featureName });

      if (promptResult.success) {
        result.files.prompt = {
          path: promptPath,
          artifactsUsed: promptResult.artifactsUsed
        };
        log(chalk.green(`   ✓ Generated PROMPT.md (using ${promptResult.artifactsUsed.join(', ')})`));
      } else {
        result.errors.push(`Failed to generate PROMPT.md: ${promptResult.error}`);
        log(chalk.red(`   ✗ ${promptResult.error}`));
      }
    } else {
      log(chalk.gray('   Skipped PROMPT.md (already exists)'));
    }
  } else {
    result.warnings.push('No spec artifacts found (constitution.md, spec.md, plan.md)');
    log(chalk.yellow('   ⚠️  No spec artifacts found'));
  }

  // Step 3: Generate @AGENT.md from build/test commands
  log(chalk.blue('\n🤖 Detecting build/test commands...'));

  if (!existingFiles.includes('@AGENT.md') || force) {
    const agentResult = await generateAgentFile(projectDir, agentPath);

    if (agentResult.success) {
      const cmdCount =
        agentResult.commands.build.length +
        agentResult.commands.test.length +
        agentResult.commands.lint.length;

      result.files.agent = {
        path: agentPath,
        commands: agentResult.commands
      };

      log(chalk.green(`   ✓ Generated @AGENT.md (${cmdCount} commands detected)`));

      if (agentResult.commands.test.length > 0) {
        log(chalk.gray(`      Tests: ${agentResult.commands.test.join(', ')}`));
      }
      if (agentResult.commands.build.length > 0) {
        log(chalk.gray(`      Build: ${agentResult.commands.build.join(', ')}`));
      }
    } else {
      result.errors.push(`Failed to generate @AGENT.md: ${agentResult.error}`);
      log(chalk.red(`   ✗ ${agentResult.error}`));
    }
  } else {
    log(chalk.gray('   Skipped @AGENT.md (already exists)'));
  }

  // Summary
  const filesGenerated = Object.keys(result.files).length;
  result.success = filesGenerated > 0 || result.errors.length === 0;

  log('');

  if (filesGenerated > 0) {
    log(chalk.green(`✅ Generated ${filesGenerated} file(s)`));
    log('');
    log(chalk.cyan('Next steps:'));
    log(chalk.white('  1. Review generated files'));
    log(chalk.white('  2. Run: /speckit.ralph start'));
    log('');
  } else if (result.errors.length > 0) {
    log(chalk.red(`❌ Failed with ${result.errors.length} error(s)`));
  } else {
    log(chalk.yellow('⚠️  No files generated (already exist or missing sources)'));
  }

  if (result.warnings.length > 0) {
    log(chalk.yellow('\nWarnings:'));
    for (const warning of result.warnings) {
      log(chalk.yellow(`  - ${warning}`));
    }
  }

  return result;
}

/**
 * CLI entry point
 * @param {string[]} args - Command line arguments
 */
export async function cli(args = []) {
  const projectDir = process.cwd();
  const force = args.includes('--force') || args.includes('-f');
  const quiet = args.includes('--quiet') || args.includes('-q');

  try {
    const result = await initRalphProject(projectDir, { force, quiet });
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}`));
    process.exit(1);
  }
}

// Run CLI if executed directly
const isMain = process.argv[1]?.endsWith('init.js') || process.argv[1]?.endsWith('ralph/init');
if (isMain) {
  cli(process.argv.slice(2));
}
