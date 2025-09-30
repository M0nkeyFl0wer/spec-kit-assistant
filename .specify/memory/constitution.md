<!--
Sync Impact Report:
Version change: [CONSTITUTION_VERSION] → 1.0.0
Modified principles: Initial creation with 6 core principles
Added sections: Core Principles, Architecture Constraints, Development Workflow, Governance
Removed sections: None (initial creation)
Templates requiring updates:
  ✅ plan-template.md: Constitution Check section compatible
  ✅ spec-template.md: No dependencies on constitution
  ✅ tasks-template.md: TDD principles already align
  ✅ agent-file-template.md: Compatible with swarm-first principle
Follow-up TODOs: None - all placeholders filled
-->

# Spec Kit Assistant Constitution

## Core Principles

### I. Swarm-First Architecture (NON-NEGOTIABLE)

Every feature MUST use the existing enhanced swarm orchestrator (`enhanced-swarm-orchestrator.js`) rather than creating custom coordinators. Agent deployment follows established patterns with specialized swarms (data-science, production-readiness, security-fix, builder-ux, red-team-unit-test). No feature shall recreate or bypass the proven swarm stack. Direct SSH deployment to remote systems (like Seshat) is supported and encouraged for distributed processing.

### II. Spec-Driven Development

All features begin with complete specification in `.specify/` structure before implementation. Specifications must resolve all [NEEDS CLARIFICATION] markers through dedicated clarification sessions. No implementation without approved spec.md, plan.md, and tasks.md artifacts. The spec-to-implementation pipeline is sacred and ensures quality, testability, and maintainability.

### III. Test-First Development (NON-NEGOTIABLE)

TDD is mandatory: Tests written → User approved → Tests fail → Then implement. Red-Green-Refactor cycle strictly enforced. Contract tests must be created for all major components before implementation. Integration tests validate user scenarios. Unit tests cover edge cases. Performance tests verify timing requirements (e.g., 500ms animation targets).

### IV. Character-Driven UX

Spec the Golden Retriever personality must be consistent across all user interactions: friendly, honest, fun, not cringe. All UX must support the character system with ASCII animations, visual feedback, and contextual responses. Terminal compatibility includes graceful fallback to plain text with symbols. The character experience is not optional decoration—it's core to user engagement and focus management.

### V. Production Readiness Standards

All code must meet enterprise standards: security scanning, performance validation, comprehensive logging, error handling, and offline capability. No internet dependencies for core functionality. Token optimization with hybrid local/cloud processing. Real-time monitoring and health checks. The 20,000x development acceleration claim must be supported by measurable performance metrics.

### VI. Incremental Complexity Justification

Start simple and justify complexity. Every architectural decision must document simpler alternatives considered and why they were insufficient. Features should integrate with existing components rather than recreating functionality. Avoid over-engineering while maintaining the high-performance, production-ready standards.

## Architecture Constraints

### Technology Stack Requirements

- **Runtime**: Node.js 18+ with ES modules
- **Dependencies**: commander.js, figlet, chalk, inquirer, ora (proven terminal libraries)
- **Testing**: Node.js native test runner (no additional frameworks)
- **Storage**: File-based configuration (no database overhead)
- **Security**: Input sanitization, path validation, XSS prevention

### Performance Standards

- Animation responses ≤500ms
- Install script completion ≤120 seconds
- Memory usage ≤50MB for animation assets
- CPU usage ≤10% during normal operation
- Network timeouts ≤30 seconds

### Platform Compatibility

- Target: Linux and macOS (Unix-like systems)
- Terminal: Support for limited color/animation with fallback modes
- Deployment: SSH-capable remote systems with Node.js runtime
- Offline: Full functionality without internet connectivity

## Development Workflow

### Constitutional Gates

All feature development must pass constitutional compliance at these checkpoints:

1. **Spec Review**: Verify swarm-first approach, character integration, test-first planning
2. **Design Review**: Validate architecture constraints and complexity justification
3. **Implementation Review**: Confirm TDD adherence and production readiness
4. **Release Review**: Validate performance standards and character consistency

### Task Execution Rules

- Use existing swarm orchestrator for all agent coordination
- Update CLAUDE.md incrementally during development
- Maintain session continuity documentation
- Follow established file structure and naming conventions
- Commit after each completed task with descriptive messages

### Code Review Requirements

- Constitutional compliance verification mandatory
- Performance impact assessment for all changes
- Character experience testing on limited terminals
- Security review for all user input handling
- Documentation updates for architectural changes

## Governance

### Amendment Procedure

Constitution changes require:

1. Documented justification with alternatives analysis
2. Impact assessment on existing features and templates
3. Community review period (minimum 48 hours)
4. Version increment following semantic versioning
5. Template and documentation synchronization

### Compliance Enforcement

- All PRs must pass constitutional review gates
- Complexity additions require explicit justification in Complexity Tracking sections
- Performance degradation triggers mandatory optimization tasks
- Character experience degradation blocks feature acceptance
- Security vulnerabilities mandate immediate remediation

### Runtime Development Guidance

Use CLAUDE.md for session-specific architectural guidance and swarm orchestrator usage patterns. Constitutional principles supersede all other practices and cannot be compromised for expedience or convenience.

**Version**: 1.0.0 | **Ratified**: 2025-09-28 | **Last Amended**: 2025-09-28
