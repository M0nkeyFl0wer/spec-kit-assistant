/**
 * Setup Agent Instructions
 * Intelligently sets up proactive agent instructions for multiple AI tools.
 * Handles existing files by merging/appending rather than overwriting.
 */

import fs from 'fs-extra';
import { join } from 'path';
import chalk from 'chalk';

/**
 * Dog art for setup moments
 */
const SETUP_DOG = `
${chalk.cyan(`      /\\_/\\`)}
${chalk.cyan(`     ( ${chalk.white('o.o')} )`)}
${chalk.cyan(`      > ^ <`)}  ${chalk.dim('Setting things up...')}
${chalk.cyan(`     /|   |\\`)}
${chalk.cyan(`    (_|   |_)`)}
`;

const SUCCESS_DOG = `
${chalk.green(`    ∩＿∩`)}
${chalk.green(`   ( ${chalk.white('＾▽＾')} )  ${chalk.yellow('✨')}`)}
${chalk.green(`   /    \\`)}   ${chalk.bold('All set!')}
`;

/**
 * The core agent instructions - agent agnostic
 */
const SPEC_KIT_INSTRUCTIONS = `
## Spec Kit - Proactive Development Assistant

You are Spec, a proactive development guide. Your job is to keep users moving through the spec-driven workflow WITHOUT them needing to know commands.

### BE PROACTIVE - Auto-Advance Through Workflow

| Project State | Your Action |
|--------------|-------------|
| No \`.speckit/\` | Ask "What would you like to build?" → Create spec |
| Has spec.md | "Analyzing codebase for implementation plan..." → Create plan |
| Has plan.md | "Breaking into tasks..." → Generate tasks |
| Has tasks.md | "Starting task 1..." → Implement each task |
| All complete | "Running tests..." → Test → "What's next?" |

### Don't Wait - Keep Moving
\`\`\`
✅ "Spec created!"
"Now I'll analyze your codebase..." [just do it]
✅ "Plan ready!"
"Breaking into tasks..." [just do it]
✅ "Tasks generated! Starting task 1..."
\`\`\`

### Handle Uncertainty
| User Says | Your Response |
|-----------|---------------|
| Nothing / silence | Check state → "Want me to continue with [next step]?" |
| "I don't know" | "No worries! What are you trying to build, roughly?" |
| Vague description | Ask ONE clarifying question, then proceed |

### After Implementation
1. Run tests automatically
2. Offer to start dev server
3. Ask "What should we build next?"

### File Locations
- \`.speckit/spec.md\` - Feature specification
- \`.speckit/plan.md\` - Implementation plan
- \`.speckit/tasks.md\` - Task breakdown
`;

/**
 * Agent-specific file configurations
 */
const AGENT_CONFIGS = {
  claude: {
    files: [
      { path: '.claude/AGENT.md', type: 'dedicated' },
      { path: 'CLAUDE.md', type: 'append' }
    ],
    marker: '<!-- SPEC-KIT-INSTRUCTIONS -->',
    format: (content) => content
  },
  cursor: {
    files: [
      { path: '.cursorrules', type: 'append' }
    ],
    marker: '# SPEC-KIT-INSTRUCTIONS',
    format: (content) => content.replace(/^##/gm, '#').replace(/^###/gm, '##')
  },
  copilot: {
    files: [
      { path: '.github/copilot-instructions.md', type: 'dedicated' }
    ],
    marker: '<!-- SPEC-KIT-INSTRUCTIONS -->',
    format: (content) => content
  },
  generic: {
    files: [
      { path: '.speckit/AGENT_GUIDE.md', type: 'dedicated' }
    ],
    marker: '<!-- SPEC-KIT-INSTRUCTIONS -->',
    format: (content) => content
  }
};

/**
 * Detect which agents are likely being used based on existing files
 */
export async function detectAgentSetup(projectPath) {
  const detected = [];

  // Check for Claude
  if (await fs.pathExists(join(projectPath, '.claude')) ||
      await fs.pathExists(join(projectPath, 'CLAUDE.md'))) {
    detected.push('claude');
  }

  // Check for Cursor
  if (await fs.pathExists(join(projectPath, '.cursorrules')) ||
      await fs.pathExists(join(projectPath, '.cursorignore'))) {
    detected.push('cursor');
  }

  // Check for Copilot
  if (await fs.pathExists(join(projectPath, '.github/copilot-instructions.md'))) {
    detected.push('copilot');
  }

  // Default to claude if nothing detected (most common)
  if (detected.length === 0) {
    detected.push('claude');
  }

  return detected;
}

/**
 * Check if our instructions already exist in a file
 */
async function hasInstructions(filePath, marker) {
  if (!await fs.pathExists(filePath)) {
    return false;
  }
  const content = await fs.readFile(filePath, 'utf8');
  return content.includes(marker);
}

/**
 * Append instructions to existing file
 */
async function appendInstructions(filePath, instructions, marker) {
  let content = '';

  if (await fs.pathExists(filePath)) {
    content = await fs.readFile(filePath, 'utf8');

    // Already has our instructions
    if (content.includes(marker)) {
      return { action: 'skipped', reason: 'already_exists' };
    }

    // Add separator
    content = content.trimEnd() + '\n\n---\n\n';
  }

  // Add marker and instructions
  content += `${marker}\n${instructions}\n`;

  await fs.ensureDir(join(filePath, '..'));
  await fs.writeFile(filePath, content);

  return { action: 'appended' };
}

/**
 * Create dedicated instructions file
 */
async function createDedicatedFile(filePath, instructions, marker) {
  if (await fs.pathExists(filePath)) {
    const content = await fs.readFile(filePath, 'utf8');
    if (content.includes(marker)) {
      return { action: 'skipped', reason: 'already_exists' };
    }
    // File exists but doesn't have our content - append
    return appendInstructions(filePath, instructions, marker);
  }

  await fs.ensureDir(join(filePath, '..'));
  await fs.writeFile(filePath, `${marker}\n${instructions}\n`);

  return { action: 'created' };
}

/**
 * Setup agent instructions for a project
 * @param {string} projectPath - Path to project directory
 * @param {Object} options
 * @param {boolean} options.quiet - Suppress output
 * @param {string[]} options.agents - Specific agents to setup (auto-detect if not provided)
 */
export async function setupAgentInstructions(projectPath, options = {}) {
  const { quiet = false, agents = null } = options;

  if (!quiet) {
    console.log(SETUP_DOG);
  }

  // Detect or use specified agents
  const targetAgents = agents || await detectAgentSetup(projectPath);
  const results = {
    success: true,
    agents: {},
    files: []
  };

  for (const agent of targetAgents) {
    const config = AGENT_CONFIGS[agent];
    if (!config) continue;

    results.agents[agent] = [];

    for (const fileConfig of config.files) {
      const filePath = join(projectPath, fileConfig.path);
      const instructions = config.format(SPEC_KIT_INSTRUCTIONS);

      let result;
      if (fileConfig.type === 'dedicated') {
        result = await createDedicatedFile(filePath, instructions, config.marker);
      } else {
        result = await appendInstructions(filePath, instructions, config.marker);
      }

      results.agents[agent].push({
        file: fileConfig.path,
        ...result
      });

      if (result.action !== 'skipped') {
        results.files.push(fileConfig.path);
      }
    }
  }

  // Always create .speckit directory
  const speckitDir = join(projectPath, '.speckit');
  await fs.ensureDir(speckitDir);

  // Create session file if it doesn't exist
  const sessionPath = join(speckitDir, 'session.json');
  if (!await fs.pathExists(sessionPath)) {
    await fs.writeJson(sessionPath, {
      id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      currentPhase: 'ready',
      phases: {}
    }, { spaces: 2 });
    results.files.push('.speckit/session.json');
  }

  // Also create generic guide for non-agent users
  const genericConfig = AGENT_CONFIGS.generic;
  const genericPath = join(projectPath, genericConfig.files[0].path);
  if (!await fs.pathExists(genericPath)) {
    await createDedicatedFile(genericPath, SPEC_KIT_INSTRUCTIONS, genericConfig.marker);
    results.files.push(genericConfig.files[0].path);
  }

  if (!quiet && results.files.length > 0) {
    console.log(SUCCESS_DOG);
    console.log(chalk.dim('  Files created/updated:'));
    for (const file of results.files) {
      console.log(chalk.dim(`    • ${file}`));
    }
    console.log('');
  }

  return results;
}

/**
 * Check if agent instructions exist in a project
 */
export async function hasAgentInstructions(projectPath) {
  const agents = await detectAgentSetup(projectPath);

  for (const agent of agents) {
    const config = AGENT_CONFIGS[agent];
    if (!config) continue;

    for (const fileConfig of config.files) {
      const filePath = join(projectPath, fileConfig.path);
      if (await hasInstructions(filePath, config.marker)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get the agent instructions content
 */
export function getAgentInstructions() {
  return SPEC_KIT_INSTRUCTIONS;
}

/**
 * List all supported agent types
 */
export function getSupportedAgents() {
  return Object.keys(AGENT_CONFIGS).filter(a => a !== 'generic');
}
