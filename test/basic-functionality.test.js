import { test, describe } from 'node:test';
import assert from 'node:assert';
import { SpecCharacter } from '../src/character/spec.js';
import { ConsultationEngine } from '../src/consultation/engine.js';
import { SwarmOrchestrator } from '../src/swarm/orchestrator.js';
import { OversightSystem } from '../src/oversight/oversight-system.js';
import { CloudIntegration } from '../src/cloud/integration.js';

describe('Spec Kit Assistant - Core Functionality', () => {

  test('SpecCharacter initializes correctly', () => {
    const spec = new SpecCharacter();

    assert.strictEqual(spec.name, 'Spec');
    assert.strictEqual(spec.personality, 'friendly-helpful-encouraging');
    assert.strictEqual(spec.currentMood, 'excited');
    assert.ok(spec.art.happy);
    assert.ok(spec.responses.greetings.length > 0);
  });

  test('SpecCharacter has all required moods', () => {
    const spec = new SpecCharacter();

    const requiredMoods = ['happy', 'thinking', 'celebrating', 'concerned', 'working'];
    requiredMoods.forEach(mood => {
      assert.ok(spec.art[mood], `Missing ${mood} mood art`);
    });
  });

  test('ConsultationEngine initializes with knowledge base', () => {
    const consultation = new ConsultationEngine();

    assert.ok(consultation.spec);
    assert.ok(consultation.knowledgeBase);
    assert.ok(consultation.knowledgeBase.projectTypes);
    assert.ok(consultation.knowledgeBase.questionFlows);
  });

  test('ConsultationEngine has project type configurations', () => {
    const consultation = new ConsultationEngine();

    const expectedTypes = ['web-app', 'mobile-app', 'api-service', 'cli-tool', 'data-pipeline'];
    expectedTypes.forEach(type => {
      assert.ok(consultation.knowledgeBase.projectTypes[type], `Missing ${type} configuration`);
      assert.ok(consultation.knowledgeBase.projectTypes[type].questions);
      assert.ok(typeof consultation.knowledgeBase.projectTypes[type].complexity === 'string');
    });
  });

  test('SwarmOrchestrator initializes with agent types', () => {
    const swarm = new SwarmOrchestrator();

    assert.ok(swarm.agentTypes);
    assert.ok(swarm.agents instanceof Map);
    assert.ok(swarm.tasks instanceof Map);

    const expectedAgents = [
      'quality-assurance',
      'security-scanner',
      'performance-monitor',
      'code-repair',
      'documentation',
      'deployment'
    ];

    expectedAgents.forEach(agentType => {
      assert.ok(swarm.agentTypes[agentType], `Missing ${agentType} agent type`);
      assert.ok(swarm.agentTypes[agentType].name);
      assert.ok(swarm.agentTypes[agentType].skills);
      assert.ok(swarm.agentTypes[agentType].emoji);
    });
  });

  test('OversightSystem initializes with correct modes', () => {
    const oversight = new OversightSystem();

    assert.strictEqual(oversight.mode, 'strategic');
    assert.ok(oversight.config.criticalDecisionPoints.length > 0);
    assert.ok(oversight.config.trivialOperations.length > 0);
    assert.strictEqual(typeof oversight.config.autoApprovalThreshold, 'number');
  });

  test('OversightSystem calculates risk correctly', () => {
    const oversight = new OversightSystem();

    const lowRiskTask = {
      type: 'documentation',
      description: 'Update README file'
    };

    const highRiskTask = {
      type: 'security',
      description: 'Database migration with security changes'
    };

    const lowRisk = oversight.calculateRisk(lowRiskTask, {});
    const highRisk = oversight.calculateRisk(highRiskTask, {});

    assert.ok(lowRisk < highRisk, 'Risk assessment should differentiate task complexity');
    assert.ok(lowRisk >= 0 && lowRisk <= 1, 'Risk should be between 0 and 1');
    assert.ok(highRisk >= 0 && highRisk <= 1, 'Risk should be between 0 and 1');
  });

  test('CloudIntegration initializes with free tier limits', () => {
    const cloud = new CloudIntegration();

    assert.ok(cloud.freeTierLimits);
    assert.ok(cloud.freeTierLimits.compute);
    assert.ok(cloud.freeTierLimits.storage);
    assert.ok(cloud.freeTierLimits.cloudRun);

    // Check specific free tier configurations
    assert.ok(cloud.freeTierLimits.compute['e2-micro']);
    assert.strictEqual(cloud.freeTierLimits.compute['e2-micro'].instances, 1);
    assert.strictEqual(cloud.freeTierLimits.compute['e2-micro'].hours, 744);
  });

  test('CloudIntegration has cost optimization rules', () => {
    const cloud = new CloudIntegration();

    assert.ok(Array.isArray(cloud.costOptimizations));
    assert.ok(Array.isArray(cloud.resourceRecommendations));
    assert.strictEqual(cloud.gcpConfig.region, 'us-central1'); // Cost-optimized region
  });

  test('Integration between components works', () => {
    const spec = new SpecCharacter();
    const consultation = new ConsultationEngine();
    const swarm = new SwarmOrchestrator();
    const oversight = new OversightSystem();
    const cloud = new CloudIntegration();

    // Test that components can reference each other
    assert.ok(consultation.spec);
    assert.ok(swarm.spec);
    assert.ok(oversight.spec);
    assert.ok(cloud.spec);

    // Test that components have necessary methods for integration
    assert.strictEqual(typeof spec.integrateWithSwarm, 'function');
    assert.strictEqual(typeof spec.integrateWithConsultation, 'function');
    assert.strictEqual(typeof spec.integrateWithCloud, 'function');
  });

  test('Recommendation systems work correctly', () => {
    const consultation = new ConsultationEngine();

    const recommendation = consultation.generateFrameworkRecommendation([
      'performance', 'learning-curve'
    ]);

    assert.ok(recommendation);
    assert.ok(recommendation.name);
    assert.ok(recommendation.explanation);
    assert.ok(typeof recommendation.demo === 'boolean');
  });

  test('Task assessment in oversight system', () => {
    const oversight = new OversightSystem();

    const testTask = {
      id: 'test-task-1',
      type: 'code-style',
      description: 'Fix code formatting issues'
    };

    const assessment = oversight.assessTask(testTask);

    assert.ok(assessment.taskId);
    assert.ok(assessment.task);
    assert.ok(typeof assessment.risk === 'number');
    assert.ok(typeof assessment.confidence === 'number');
    assert.ok(typeof assessment.requiresApproval === 'boolean');
    assert.ok(assessment.timestamp instanceof Date);
  });

  test('Agent swarm metrics tracking', () => {
    const swarm = new SwarmOrchestrator();

    assert.ok(swarm.swarmMetrics);
    assert.strictEqual(swarm.swarmMetrics.tasksCompleted, 0);
    assert.strictEqual(swarm.swarmMetrics.tasksInProgress, 0);
    assert.strictEqual(swarm.swarmMetrics.tasksFailed, 0);

    // Test metrics methods
    const metrics = swarm.getSwarmMetrics();
    assert.ok(metrics);
    assert.ok(typeof metrics.tasksCompleted === 'number');
  });

  test('Character personality responses', () => {
    const spec = new SpecCharacter();

    const greetingResponse = spec.getPersonalityResponse('greet');
    const helpResponse = spec.getPersonalityResponse('help');
    const successResponse = spec.getPersonalityResponse('success');

    assert.ok(typeof greetingResponse === 'string');
    assert.ok(typeof helpResponse === 'string');
    assert.ok(typeof successResponse === 'string');

    // Responses should be different
    assert.notStrictEqual(greetingResponse, helpResponse);
  });

  test('Project name generation', () => {
    const cloud = new CloudIntegration();

    const projectName = cloud.generateProjectName();

    assert.ok(projectName.name);
    assert.ok(projectName.id);
    assert.ok(typeof projectName.name === 'string');
    assert.ok(typeof projectName.id === 'string');
    assert.ok(projectName.name.length > 0);
    assert.ok(projectName.id.length > 0);
  });

});

describe('Error Handling and Edge Cases', () => {

  test('SpecCharacter handles invalid mood gracefully', async () => {
    const spec = new SpecCharacter();

    // Should not throw error for invalid mood
    await spec.show('invalid-mood');
    assert.strictEqual(spec.currentMood, 'invalid-mood');
  });

  test('OversightSystem handles unknown agent types', () => {
    const oversight = new OversightSystem();

    const unknownTask = {
      type: 'unknown-task-type',
      description: 'This is an unknown task type'
    };

    const assessment = oversight.assessTask(unknownTask);
    assert.ok(assessment);
    assert.ok(typeof assessment.risk === 'number');
  });

  test('SwarmOrchestrator handles agent not found', () => {
    const swarm = new SwarmOrchestrator();

    const status = swarm.getAgentStatus('non-existent-agent');
    assert.strictEqual(status, undefined);
  });

  test('CloudIntegration handles missing configuration', () => {
    const cloud = new CloudIntegration();

    // Should not crash when accessing config before setup
    const config = cloud.getOptimizedConfiguration();
    assert.ok(config);
    assert.ok(config.project);
    assert.ok(config.freeTierLimits);
  });

});

// Run basic smoke test
test('Smoke test - All components can be instantiated', () => {
  const spec = new SpecCharacter();
  const consultation = new ConsultationEngine();
  const swarm = new SwarmOrchestrator();
  const oversight = new OversightSystem();
  const cloud = new CloudIntegration();

  assert.ok(spec);
  assert.ok(consultation);
  assert.ok(swarm);
  assert.ok(oversight);
  assert.ok(cloud);

  console.log('✅ All core components initialized successfully');
  console.log(`🐕 Spec says: "${spec.getPersonalityResponse('success')}"`);
});