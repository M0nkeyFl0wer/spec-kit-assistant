#!/usr/bin/env node
/**
 * Strategic Task Coordinator
 * Prevents agent chaos by managing task allocation strategically and ensuring proper integration
 */

import chalk from 'chalk';
import { SpecKitComplianceChecker } from './spec-compliance-checker.js';
import { IntelligentDeploymentOptimizer } from './intelligent-deployment-optimizer.js';

export class StrategicTaskCoordinator {
  constructor() {
    this.complianceChecker = new SpecKitComplianceChecker();
    this.deploymentOptimizer = new IntelligentDeploymentOptimizer();

    this.agentCapabilities = {
      'codellama-agent': {
        strengths: ['code-generation', 'syntax-correction', 'algorithm-implementation'],
        weaknesses: ['complex-architecture', 'integration-planning'],
        maxConcurrentTasks: 1,
        taskDuration: 'medium',
        integrationRequired: true
      },
      'claude-agent': {
        strengths: ['architecture-design', 'code-review', 'complex-reasoning', 'integration-planning'],
        weaknesses: ['cost-efficiency'],
        maxConcurrentTasks: 2,
        taskDuration: 'long',
        integrationRequired: false
      },
      'gemini-agent': {
        strengths: ['documentation', 'spec-analysis', 'multi-step-coordination'],
        weaknesses: ['detailed-implementation'],
        maxConcurrentTasks: 3,
        taskDuration: 'medium',
        integrationRequired: true
      },
      'local-agent': {
        strengths: ['testing', 'file-operations', 'validation'],
        weaknesses: ['complex-logic', 'creative-solutions'],
        maxConcurrentTasks: 5,
        taskDuration: 'fast',
        integrationRequired: false
      }
    };

    this.taskCategories = {
      'architecture': {
        description: 'High-level system design and integration planning',
        requiredAgents: ['claude-agent'],
        forbiddenAgents: ['codellama-agent', 'local-agent'],
        sequencing: 'must-complete-first',
        validationRequired: true
      },
      'spec-compliance': {
        description: 'Ensure implementation matches specifications',
        requiredAgents: ['gemini-agent', 'claude-agent'],
        forbiddenAgents: [],
        sequencing: 'continuous',
        validationRequired: true
      },
      'code-implementation': {
        description: 'Write actual code following architectural guidelines',
        requiredAgents: ['codellama-agent'],
        forbiddenAgents: [],
        sequencing: 'after-architecture',
        validationRequired: true
      },
      'integration': {
        description: 'Merge components and ensure they work together',
        requiredAgents: ['claude-agent'],
        forbiddenAgents: ['codellama-agent'],
        sequencing: 'after-implementation',
        validationRequired: true
      },
      'testing': {
        description: 'Validate functionality and catch issues',
        requiredAgents: ['local-agent'],
        forbiddenAgents: [],
        sequencing: 'after-implementation',
        validationRequired: false
      },
      'documentation': {
        description: 'Create clear documentation and specs',
        requiredAgents: ['gemini-agent'],
        forbiddenAgents: [],
        sequencing: 'parallel',
        validationRequired: false
      }
    };

    this.activeTaskChain = new Map();
    this.agentWorkload = new Map();
    this.integrationCheckpoints = [];
  }

  async analyzeTaskAndPlan(taskDescription) {
    console.log(chalk.blue('🎯 Analyzing task for strategic coordination...'));

    // First check spec compliance
    const compliance = await this.complianceChecker.checkCompliance();

    // Break down the task into strategic components
    const taskBreakdown = this.decomposeTask(taskDescription);

    // Plan the execution sequence
    const executionPlan = this.createExecutionPlan(taskBreakdown, compliance);

    // Select optimal agents for each phase
    const agentAssignments = await this.assignOptimalAgents(executionPlan);

    return {
      taskBreakdown,
      executionPlan,
      agentAssignments,
      integrationStrategy: this.planIntegrationStrategy(agentAssignments),
      riskMitigation: this.identifyRisks(agentAssignments)
    };
  }

  decomposeTask(description) {
    const breakdown = {
      primary: this.categorizeTask(description),
      dependencies: [],
      complexity: this.assessComplexity(description),
      integrationPoints: this.identifyIntegrationPoints(description)
    };

    // Add required dependencies based on task type
    if (breakdown.primary === 'code-implementation') {
      breakdown.dependencies.push('architecture', 'spec-compliance');
    }
    if (breakdown.primary === 'integration') {
      breakdown.dependencies.push('code-implementation', 'testing');
    }

    return breakdown;
  }

  categorizeTask(description) {
    const desc = description.toLowerCase();

    if (desc.includes('design') || desc.includes('architecture') || desc.includes('plan')) {
      return 'architecture';
    }
    if (desc.includes('implement') || desc.includes('code') || desc.includes('build')) {
      return 'code-implementation';
    }
    if (desc.includes('integrate') || desc.includes('connect') || desc.includes('merge')) {
      return 'integration';
    }
    if (desc.includes('test') || desc.includes('validate') || desc.includes('verify')) {
      return 'testing';
    }
    if (desc.includes('document') || desc.includes('spec') || desc.includes('readme')) {
      return 'documentation';
    }
    if (desc.includes('compliance') || desc.includes('spec kit') || desc.includes('standard')) {
      return 'spec-compliance';
    }

    return 'code-implementation'; // Default for unclear tasks
  }

  assessComplexity(description) {
    const complexityIndicators = {
      high: ['distributed', 'swarm', 'integration', 'architecture', 'system'],
      medium: ['api', 'component', 'feature', 'enhancement'],
      low: ['fix', 'update', 'simple', 'basic']
    };

    const desc = description.toLowerCase();

    for (const [level, indicators] of Object.entries(complexityIndicators)) {
      if (indicators.some(indicator => desc.includes(indicator))) {
        return level;
      }
    }

    return 'medium';
  }

  identifyIntegrationPoints(description) {
    const points = [];
    const desc = description.toLowerCase();

    if (desc.includes('api')) points.push('api-integration');
    if (desc.includes('database')) points.push('data-integration');
    if (desc.includes('ui') || desc.includes('frontend')) points.push('ui-integration');
    if (desc.includes('test')) points.push('test-integration');
    if (desc.includes('deploy')) points.push('deployment-integration');

    return points;
  }

  createExecutionPlan(taskBreakdown, compliance) {
    const plan = {
      phases: [],
      parallelizable: [],
      criticalPath: [],
      checkpoints: []
    };

    // Always start with architecture if complex
    if (taskBreakdown.complexity === 'high') {
      plan.phases.push({
        name: 'architecture',
        description: 'Design system architecture and integration strategy',
        blocking: true,
        duration: 'medium'
      });
    }

    // Add spec compliance check
    plan.phases.push({
      name: 'spec-compliance',
      description: 'Ensure task aligns with spec kit requirements',
      blocking: false,
      duration: 'fast'
    });

    // Add main implementation
    plan.phases.push({
      name: taskBreakdown.primary,
      description: 'Execute primary task implementation',
      blocking: true,
      duration: taskBreakdown.complexity === 'high' ? 'long' : 'medium'
    });

    // Add integration if required
    if (taskBreakdown.integrationPoints.length > 0) {
      plan.phases.push({
        name: 'integration',
        description: 'Integrate components and validate connections',
        blocking: true,
        duration: 'medium'
      });
    }

    // Add testing and validation
    plan.phases.push({
      name: 'testing',
      description: 'Validate implementation and run tests',
      blocking: false,
      duration: 'fast'
    });

    // Add final compliance check
    plan.checkpoints.push({
      name: 'final-compliance',
      description: 'Verify all spec kit requirements met',
      trigger: 'completion'
    });

    return plan;
  }

  async assignOptimalAgents(executionPlan) {
    const assignments = [];

    for (const phase of executionPlan.phases) {
      const category = this.taskCategories[phase.name];

      if (!category) {
        console.log(chalk.yellow(`⚠️ Unknown task category: ${phase.name}`));
        continue;
      }

      // Select best agent for this task type
      const optimalAgent = await this.selectOptimalAgent(phase, category);

      assignments.push({
        phase: phase.name,
        agent: optimalAgent,
        strategy: optimalAgent.strategy,
        monitoring: this.defineMonitoring(phase, optimalAgent),
        fallback: this.defineFallbackAgent(optimalAgent)
      });
    }

    return assignments;
  }

  async selectOptimalAgent(phase, category) {
    // Get deployment optimization
    const strategy = await this.deploymentOptimizer.optimizeDeployment(phase.description);

    // Ensure agent is appropriate for task category
    const allowedAgents = category.requiredAgents.length > 0
      ? category.requiredAgents
      : Object.keys(this.agentCapabilities).filter(
          agent => !category.forbiddenAgents.includes(agent)
        );

    // Check if optimal strategy agent is allowed
    const requestedAgent = `${strategy.agentType}`;
    const selectedAgent = allowedAgents.includes(requestedAgent)
      ? requestedAgent
      : allowedAgents[0];

    return {
      type: selectedAgent,
      strategy: strategy,
      capabilities: this.agentCapabilities[selectedAgent],
      restrictions: category,
      validation: this.defineValidationRequirements(phase, selectedAgent)
    };
  }

  defineMonitoring(phase, agent) {
    return {
      progressChecks: agent.capabilities.integrationRequired ? 'frequent' : 'normal',
      outputValidation: phase.name === 'code-implementation' ? 'syntax-check' : 'content-check',
      integrationTesting: agent.capabilities.integrationRequired ? 'required' : 'optional',
      specCompliance: 'continuous'
    };
  }

  defineFallbackAgent(primaryAgent) {
    const fallbacks = {
      'codellama-agent': 'claude-agent',
      'claude-agent': 'gemini-agent',
      'gemini-agent': 'local-agent',
      'local-agent': 'claude-agent'
    };

    return {
      type: fallbacks[primaryAgent.type],
      trigger: 'failure-or-timeout',
      conditions: ['syntax-errors', 'integration-failure', 'spec-violation']
    };
  }

  defineValidationRequirements(phase, agentType) {
    const baseValidation = ['output-exists', 'no-errors'];

    const validationMap = {
      'architecture': [...baseValidation, 'design-coherence', 'integration-plan'],
      'code-implementation': [...baseValidation, 'syntax-valid', 'logic-sound', 'spec-compliant'],
      'integration': [...baseValidation, 'components-connected', 'no-conflicts'],
      'testing': [...baseValidation, 'tests-pass', 'coverage-adequate'],
      'documentation': [...baseValidation, 'clarity', 'completeness']
    };

    return validationMap[phase] || baseValidation;
  }

  planIntegrationStrategy(agentAssignments) {
    return {
      checkpoints: this.defineIntegrationCheckpoints(agentAssignments),
      conflictResolution: this.defineConflictResolution(),
      validationChain: this.defineValidationChain(agentAssignments),
      rollbackPlan: this.defineRollbackPlan()
    };
  }

  defineIntegrationCheckpoints(assignments) {
    const checkpoints = [];

    // Add checkpoint after each critical phase
    assignments.forEach((assignment, index) => {
      if (assignment.phase === 'architecture' || assignment.phase === 'code-implementation') {
        checkpoints.push({
          after: assignment.phase,
          type: 'integration-validation',
          actions: ['spec-compliance-check', 'component-compatibility', 'integration-test']
        });
      }
    });

    return checkpoints;
  }

  defineConflictResolution() {
    return {
      codingStandards: 'spec-kit-framework',
      namingConventions: 'camelCase-js-modules',
      architectureDecisions: 'claude-agent-authority',
      specCompliance: 'automatic-checker-authority',
      testRequirements: '80-percent-coverage-minimum'
    };
  }

  defineValidationChain(assignments) {
    return {
      pre: 'spec-compliance-check',
      during: 'real-time-monitoring',
      post: 'integration-validation',
      final: 'complete-spec-audit'
    };
  }

  defineRollbackPlan() {
    return {
      triggerConditions: ['spec-violation', 'integration-failure', 'test-failure'],
      rollbackSteps: ['preserve-working-state', 'isolate-changes', 'selective-revert'],
      recoveryStrategy: 'fallback-agent-retry'
    };
  }

  identifyRisks(agentAssignments) {
    const risks = [];

    // Check for potential agent conflicts
    const agentTypes = agentAssignments.map(a => a.agent.type);
    const duplicateAgents = agentTypes.filter((type, index) => agentTypes.indexOf(type) !== index);

    if (duplicateAgents.length > 0) {
      risks.push({
        type: 'concurrent-agent-conflict',
        severity: 'medium',
        description: 'Multiple tasks assigned to same agent type',
        mitigation: 'Sequence tasks or use different agent variants'
      });
    }

    // Check for integration complexity
    const integrationPhases = agentAssignments.filter(a => a.phase === 'integration');
    if (integrationPhases.length > 1) {
      risks.push({
        type: 'complex-integration',
        severity: 'high',
        description: 'Multiple integration points may cause conflicts',
        mitigation: 'Extra validation checkpoints and careful sequencing'
      });
    }

    // Check for spec compliance risk
    const specRiskyAgents = agentAssignments.filter(a =>
      a.agent.capabilities.integrationRequired && a.phase === 'code-implementation'
    );

    if (specRiskyAgents.length > 0) {
      risks.push({
        type: 'spec-compliance-risk',
        severity: 'medium',
        description: 'Code generation agents may create non-compliant code',
        mitigation: 'Continuous spec checking and Claude agent review'
      });
    }

    return risks;
  }

  async executeCoordinatedTask(taskDescription) {
    console.log(chalk.blue('🎯 Executing strategically coordinated task...'));

    const plan = await this.analyzeTaskAndPlan(taskDescription);

    this.displayPlan(plan);

    // Execute each phase with proper coordination
    const results = [];

    for (const assignment of plan.agentAssignments) {
      console.log(chalk.cyan(`📋 Executing phase: ${assignment.phase}`));

      const result = await this.executePhase(assignment, plan.integrationStrategy);
      results.push(result);

      // Run integration checkpoint if required
      await this.runIntegrationCheckpoint(assignment, results);
    }

    // Final compliance check
    const finalCompliance = await this.complianceChecker.checkCompliance();

    return {
      plan,
      results,
      finalCompliance,
      success: results.every(r => r.success),
      integrationStatus: 'validated'
    };
  }

  displayPlan(plan) {
    console.log(chalk.cyan('\n📋 Strategic Execution Plan'));
    console.log(chalk.gray('─'.repeat(50)));

    plan.agentAssignments.forEach((assignment, index) => {
      const agentColor = {
        'codellama-agent': chalk.blue,
        'claude-agent': chalk.green,
        'gemini-agent': chalk.yellow,
        'local-agent': chalk.gray
      };

      const color = agentColor[assignment.agent.type] || chalk.white;
      console.log(color(`${index + 1}. ${assignment.phase} → ${assignment.agent.type}`));
      console.log(chalk.gray(`   Strategy: ${assignment.strategy.name}`));
      console.log(chalk.gray(`   Cost: ${assignment.strategy.estimatedCost}`));
    });

    if (plan.riskMitigation.length > 0) {
      console.log(chalk.yellow('\n⚠️ Risk Mitigation:'));
      plan.riskMitigation.forEach(risk => {
        console.log(chalk.gray(`  • ${risk.description}`));
      });
    }

    console.log(chalk.gray('─'.repeat(50) + '\n'));
  }

  async executePhase(assignment, integrationStrategy) {
    // This would integrate with actual agent execution
    // For now, return a structured result

    return {
      phase: assignment.phase,
      agent: assignment.agent.type,
      success: true,
      output: `Phase ${assignment.phase} executed by ${assignment.agent.type}`,
      validationPassed: true,
      integrationReady: true
    };
  }

  async runIntegrationCheckpoint(assignment, previousResults) {
    if (assignment.phase === 'code-implementation' || assignment.phase === 'integration') {
      console.log(chalk.blue('🔍 Running integration checkpoint...'));

      // Run spec compliance check
      const compliance = await this.complianceChecker.checkCompliance();

      if (compliance.overall === 'needs-improvement') {
        console.log(chalk.yellow('⚠️ Integration checkpoint identified issues'));
        await this.complianceChecker.autoFixCompliance();
      } else {
        console.log(chalk.green('✅ Integration checkpoint passed'));
      }
    }
  }
}

export default StrategicTaskCoordinator;