/**
 * Guided UX Module Exports
 * Central export point for all guided UX functionality
 *
 * Implements the Guided UX Flow feature (specs/001-guided-ux-flow)
 * - FR-001: Minimal questions (1 primary + 2 follow-up max)
 * - FR-002: Smart clarifications with 2-4 options
 * - FR-003: Intelligent defaults with confidence scoring
 * - FR-004: Defaults-only workflow
 * - FR-005: Progress visibility
 * - FR-006: Session persistence
 * - FR-007: Progressive disclosure
 * - FR-008: Micro-celebrations
 * - FR-009: Keyboard accessibility
 * - FR-010: Little Helper JSON-RPC integration
 */

// Entities
export { Session } from './entities/session.js';
export { PhaseState, PhaseType } from './entities/phase-state.js';
export { Decision } from './entities/decision.js';
export { UserPreferences } from './entities/user-preferences.js';
export { SmartDefault, DefaultSource } from './entities/smart-default.js';
export { ClarificationQuestion } from './entities/clarification-question.js';
export { Option } from './entities/option.js';

// Core Services
export { SessionManager } from './session-manager.js';
export { SmartDefaults } from './smart-defaults.js';
export { QuestionReducer } from './question-reducer.js';
export { QuestionPresenter } from './question-presenter.js';
export { ProgressTracker } from './progress-tracker.js';
export { MicroCelebrations } from './micro-celebrations.js';
export { StreamingOutput } from './streaming-output.js';

// Flows
export { GuidedOnboarding } from './flows/onboarding-flow.js';
export { GuidedSpecify } from './flows/specify-flow.js';
export { FlowBridge } from './flow-bridge.js';

// UI Components
export { ExpandableSection, ExpandableSectionGroup } from './ui/expandable-section.js';
export { ProgressBar, AnimatedProgress } from './ui/progress-bar.js';

// Archetypes
export { archetypes, ArchetypeId, detectArchetype, getArchetype, getAllArchetypes } from './archetypes/index.js';

// Utils
export { getConfigPath, getProjectSessionPath, getGlobalConfigPath } from './utils/config-paths.js';
