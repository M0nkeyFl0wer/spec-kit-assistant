/**
 * Workflow State Machine
 * Tracks user's progress through the spec-driven development workflow.
 */

import fs from 'fs-extra';
import { join } from 'path';
import { getConfigPath, getKnownSessions } from '../guided/utils/config-paths.js';

/**
 * Workflow stages
 */
export const WorkflowStage = {
  // Setup stages
  NO_AGENT: 'no_agent',           // No AI agent installed
  AGENT_INSTALLED: 'agent_installed', // Agent installed but not configured
  READY: 'ready',                 // Ready to start/continue projects

  // Project stages
  NO_PROJECT: 'no_project',       // No active project
  PROJECT_SELECTED: 'project_selected', // Project chosen
  IN_AGENT: 'in_agent',           // Running inside an agent session

  // Spec workflow stages
  SPEC_INIT: 'spec_init',         // Project initialized, needs spec
  SPEC_CREATED: 'spec_created',   // Spec created, needs plan
  PLAN_CREATED: 'plan_created',   // Plan created, needs tasks
  TASKS_CREATED: 'tasks_created', // Tasks created, ready to implement
  IMPLEMENTING: 'implementing',   // Implementation in progress
  COMPLETE: 'complete'            // All done
};

/**
 * Determine next action based on stage
 */
export const NextActions = {
  [WorkflowStage.NO_AGENT]: {
    message: "You need an AI coding agent to use Spec Kit effectively.",
    action: 'install_agent',
    command: null
  },
  [WorkflowStage.AGENT_INSTALLED]: {
    message: "Your agent is installed! Let's configure it for spec-driven development.",
    action: 'configure_agent',
    command: null
  },
  [WorkflowStage.NO_PROJECT]: {
    message: "Ready to start! What would you like to build?",
    action: 'create_project',
    command: 'spec init "Project Name"'
  },
  [WorkflowStage.PROJECT_SELECTED]: {
    message: "Project found. Launch your agent to continue.",
    action: 'launch_agent',
    command: null // Will be filled with agent launch command
  },
  [WorkflowStage.IN_AGENT]: {
    message: "You're in an agent session. Use slash commands to continue.",
    action: 'use_slash_commands',
    command: '/spec'
  },
  [WorkflowStage.SPEC_INIT]: {
    message: "Project initialized. Create a specification first.",
    action: 'create_spec',
    command: '/specify "feature description"'
  },
  [WorkflowStage.SPEC_CREATED]: {
    message: "Spec created! Now let's plan the implementation.",
    action: 'create_plan',
    command: '/plan'
  },
  [WorkflowStage.PLAN_CREATED]: {
    message: "Plan ready! Generate tasks to start building.",
    action: 'create_tasks',
    command: '/tasks'
  },
  [WorkflowStage.TASKS_CREATED]: {
    message: "Tasks generated! Start implementing.",
    action: 'implement',
    command: '/implement'
  },
  [WorkflowStage.IMPLEMENTING]: {
    message: "Implementation in progress. Keep going!",
    action: 'continue',
    command: null
  },
  [WorkflowStage.COMPLETE]: {
    message: "Project complete! Ready for next feature or project.",
    action: 'celebrate',
    command: null
  }
};

/**
 * Analyze current workflow state
 */
export async function analyzeWorkflowState(options = {}) {
  const {
    installedAgents = [],
    currentAgent = null,
    projectPath = null
  } = options;

  // Check if running inside an agent
  if (currentAgent) {
    // We're inside an agent session
    if (!projectPath) {
      return {
        stage: WorkflowStage.NO_PROJECT,
        inAgent: true,
        agent: currentAgent
      };
    }

    // Check project state
    const projectStage = await analyzeProjectState(projectPath);
    return {
      stage: projectStage,
      inAgent: true,
      agent: currentAgent,
      projectPath
    };
  }

  // Not in an agent - check if any agents installed
  if (installedAgents.length === 0) {
    return {
      stage: WorkflowStage.NO_AGENT,
      inAgent: false
    };
  }

  // Agent installed - check for recent projects
  const sessions = await getKnownSessions();

  if (sessions.length === 0) {
    return {
      stage: WorkflowStage.NO_PROJECT,
      inAgent: false,
      agents: installedAgents
    };
  }

  // Has projects - check if one is selected/active
  if (projectPath) {
    const projectStage = await analyzeProjectState(projectPath);
    return {
      stage: WorkflowStage.PROJECT_SELECTED,
      projectStage,
      inAgent: false,
      agents: installedAgents,
      projectPath,
      recentProjects: sessions
    };
  }

  return {
    stage: WorkflowStage.NO_PROJECT,
    inAgent: false,
    agents: installedAgents,
    recentProjects: sessions
  };
}

/**
 * Analyze project-specific state
 */
export async function analyzeProjectState(projectPath) {
  const speckitDir = join(projectPath, '.speckit');
  const specifyDir = join(projectPath, '.specify');

  // Check which system is being used
  const hasSpeckit = await fs.pathExists(speckitDir);
  const hasSpecify = await fs.pathExists(specifyDir);

  if (!hasSpeckit && !hasSpecify) {
    return WorkflowStage.SPEC_INIT;
  }

  const baseDir = hasSpeckit ? speckitDir : specifyDir;

  // Check for spec artifacts
  const hasSpec = await fs.pathExists(join(baseDir, 'spec.md')) ||
                  await fs.pathExists(join(projectPath, 'SPEC.md'));
  const hasPlan = await fs.pathExists(join(baseDir, 'plan.md')) ||
                  await fs.pathExists(join(projectPath, 'PLAN.md'));
  const hasTasks = await fs.pathExists(join(baseDir, 'tasks.md')) ||
                   await fs.pathExists(join(projectPath, 'TODO.md'));

  // Check session for more detailed state
  const sessionPath = join(baseDir, 'session.json');
  let session = null;
  if (await fs.pathExists(sessionPath)) {
    try {
      session = await fs.readJson(sessionPath);
    } catch {
      // Ignore parse errors
    }
  }

  // Determine stage based on artifacts
  if (!hasSpec) {
    return WorkflowStage.SPEC_INIT;
  }
  if (!hasPlan) {
    return WorkflowStage.SPEC_CREATED;
  }
  if (!hasTasks) {
    return WorkflowStage.PLAN_CREATED;
  }

  // Check session for implementation progress
  if (session?.currentPhase === 'implement') {
    return WorkflowStage.IMPLEMENTING;
  }
  if (session?.currentPhase === 'complete') {
    return WorkflowStage.COMPLETE;
  }

  return WorkflowStage.TASKS_CREATED;
}

/**
 * Get the recommended next action
 */
export function getNextAction(stage, context = {}) {
  const action = { ...NextActions[stage] };

  // Customize based on context
  if (stage === WorkflowStage.PROJECT_SELECTED && context.agent) {
    action.command = `cd "${context.projectPath}" && ${context.agent.launchCmd}`;
  }

  if (stage === WorkflowStage.NO_AGENT && context.recommendedAgent) {
    action.command = context.recommendedAgent.installCmd;
  }

  return action;
}
