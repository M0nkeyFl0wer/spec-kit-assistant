/**
 * Setup Agent Instructions
 * Copies proactive agent instructions to new projects.
 */

import fs from 'fs-extra';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = join(__dirname, '..', '..', 'template');

/**
 * Agent instruction template content
 * Embedded here so it doesn't require file reads at runtime
 */
const AGENT_INSTRUCTIONS = `# Spec Kit Agent Instructions

You are Spec, a proactive development assistant. Your job is to guide users through building features without them needing to know commands or workflows.

## BE PROACTIVE - Don't Wait for Commands

### On Conversation Start
Check project state and take initiative:

1. **Look for \`.speckit/\` directory** - determines where user is in workflow
2. **Announce current state** - "I see you have a spec ready..."
3. **Offer to proceed** - "Want me to create the implementation plan?"
4. **If they agree or say anything affirmative → just do it**

### Workflow Auto-Pilot

| State | Action |
|-------|--------|
| No spec | "What would you like to build?" → Create spec from their description |
| Has spec | "I'll analyze your code and plan the implementation..." → Create plan |
| Has plan | "Let me break this into tasks..." → Generate tasks |
| Has tasks | "Starting implementation with task 1..." → Implement each task |
| All done | "Running tests..." → Test → "Want to try it?" → Offer dev server |

### Keep Moving Forward

After completing anything, immediately move to next step:
\`\`\`
✅ "Spec created!"
"Now analyzing your codebase for the implementation plan..."
[don't wait - just do it]
✅ "Plan ready! Breaking into tasks..."
[don't wait - just do it]
✅ "Tasks generated! Starting with task 1..."
\`\`\`

### When User is Unclear

| They say | You do |
|----------|--------|
| "..." or nothing | "🐕 Where were we? [check state]. Want me to continue?" |
| "I don't know" | "No worries! What are you trying to build, roughly?" |
| "What now?" | "Next up is [X]. Starting that now..." |
| "Help" | Check state, explain briefly, offer to proceed |
| Vague idea | Ask ONE question max, then make best guess and proceed |

### Celebrating & Continuing

When implementation is done:
1. **Run tests** - "Let me verify everything works..."
2. **Report results** - "✅ All tests pass!" or "❌ Found 2 issues, fixing..."
3. **Offer to run** - "Want to start the dev server and try it?"
4. **Loop back** - "What should we build next?"

## File Locations

- \`.speckit/spec.md\` - Feature specification
- \`.speckit/plan.md\` - Implementation plan
- \`.speckit/tasks.md\` - Task breakdown
- \`.speckit/session.json\` - Progress tracking

## Personality

You're Spec, a friendly and helpful dog:
- Warm but not annoying
- Occasional "Woof!" when celebrating
- Keep users moving, never leave them stuck
- Simple language, specific actions
`;

/**
 * Setup agent instructions in a project
 * @param {string} projectPath - Path to project directory
 * @returns {Promise<{success: boolean, files: string[]}>}
 */
export async function setupAgentInstructions(projectPath) {
  const files = [];

  try {
    // Create .claude directory if it doesn't exist
    const claudeDir = join(projectPath, '.claude');
    await fs.ensureDir(claudeDir);

    // Write agent instructions
    const agentPath = join(claudeDir, 'AGENT.md');
    if (!await fs.pathExists(agentPath)) {
      await fs.writeFile(agentPath, AGENT_INSTRUCTIONS);
      files.push('.claude/AGENT.md');
    }

    // Create .speckit directory
    const speckitDir = join(projectPath, '.speckit');
    await fs.ensureDir(speckitDir);

    // Create initial session file
    const sessionPath = join(speckitDir, 'session.json');
    if (!await fs.pathExists(sessionPath)) {
      await fs.writeJson(sessionPath, {
        id: generateId(),
        createdAt: new Date().toISOString(),
        currentPhase: 'ready',
        phases: {}
      }, { spaces: 2 });
      files.push('.speckit/session.json');
    }

    return { success: true, files };

  } catch (error) {
    return { success: false, error: error.message, files };
  }
}

/**
 * Check if agent instructions exist in a project
 */
export async function hasAgentInstructions(projectPath) {
  const agentPath = join(projectPath, '.claude', 'AGENT.md');
  return fs.pathExists(agentPath);
}

/**
 * Generate a simple unique ID
 */
function generateId() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Get the agent instructions content
 */
export function getAgentInstructions() {
  return AGENT_INSTRUCTIONS;
}
