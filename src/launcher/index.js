/**
 * Launcher Module
 * Smart project launcher with agent detection and workflow state.
 */

export {
  AgentType,
  detectInstalledAgents,
  detectCurrentAgent,
  getPreferredAgent,
  getAgentMeta,
  getAllAgents
} from './agent-detector.js';

export {
  WorkflowStage,
  NextActions,
  analyzeWorkflowState,
  analyzeProjectState,
  getNextAction
} from './workflow-state.js';

export {
  launch,
  main
} from './interactive-launcher.js';

export {
  ActionType,
  detectProjectCommands,
  getAvailableActions,
  detectProjectType
} from './project-runner.js';

export {
  runPostImplementation,
  quickTest,
  quickDev
} from './post-implementation.js';

export {
  analyzeAndGuide,
  getContextualHelp,
  runGuidedPrompt,
  getNudge,
  needsGuidance,
  formatSuggestions
} from './proactive-guide.js';

export {
  setupAgentInstructions,
  hasAgentInstructions,
  getAgentInstructions
} from './setup-agent-instructions.js';
