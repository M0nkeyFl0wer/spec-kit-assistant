/**
 * Integration test for Performance Validation Workflow
 * Tests the complete performance measurement, validation, and optimization workflow
 * These tests MUST FAIL before implementation - TDD approach
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

describe('Performance Validation Workflow Integration', () => {
  let testWorkspace;
  let performanceWorkflow;

  beforeEach(async () => {
    // Create temporary test workspace
    testWorkspace = join(process.cwd(), 'temp-performance-workspace');
    await mkdir(testWorkspace, { recursive: true });
    await mkdir(join(testWorkspace, 'src'), { recursive: true });
    await mkdir(join(testWorkspace, 'tests'), { recursive: true });
    await mkdir(join(testWorkspace, 'benchmarks'), { recursive: true });

    // This will fail until performance validation workflow is implemented
    const { PerformanceValidationWorkflow } = await import('../../src/validation/performance-workflow.js');
    performanceWorkflow = new PerformanceValidationWorkflow({
      workspace: testWorkspace,
      constitutionalStandards: true,
      swarmIntegration: true,
      realTimeMonitoring: true
    });
  });

  afterEach(async () => {
    performanceWorkflow = null;
    // Clean up test workspace
    await rm(testWorkspace, { recursive: true, force: true });
  });

  describe('Constitutional performance validation workflow', () => {
    test('should validate implementation against constitutional performance limits', async () => {
      // Create specification with performance requirements
      const performanceSpec = `# Performance-Critical Feature
## Animation Requirements
- AN-001: Character animations MUST complete within 500ms constitutional limit
- AN-002: UI transitions MUST provide immediate visual feedback
- AN-003: Loading animations MUST not block user interactions

## Analysis Requirements
- AL-001: Constitutional compliance analysis MUST complete within 100ms
- AL-002: Requirement refinement MUST complete within 500ms
- AL-003: Coverage gap analysis MUST complete within 1000ms

## System Requirements
- SY-001: Memory usage MUST not exceed 50MB during normal operation
- SY-002: CPU utilization MUST remain below 10% during idle state
- SY-003: Network requests MUST timeout after 30 seconds maximum
`;

      // Create implementation with known performance issues
      const slowImplementation = `// Implementation with performance issues
class SlowAnimationEngine {
  async renderCharacterAnimation() {
    // Violates 500ms constitutional limit
    await this.heavyComputations();
    await new Promise(resolve => setTimeout(resolve, 800));
    return 'animation-complete';
  }

  async heavyComputations() {
    // CPU-intensive operation
    let result = 0;
    for (let i = 0; i < 10000000; i++) {
      result += Math.sqrt(i);
    }
    return result;
  }
}

class SlowAnalysisEngine {
  async performConstitutionalAnalysis() {
    // Violates 100ms constitutional limit
    await new Promise(resolve => setTimeout(resolve, 200));
    return { violations: [], compliance: true };
  }

  async refineRequirements() {
    // Violates 500ms constitutional limit
    await new Promise(resolve => setTimeout(resolve, 800));
    return { refinedRequirements: [] };
  }
}

class MemoryHeavyService {
  constructor() {
    // Allocates excessive memory - violates 50MB limit
    this.largeDataStructure = new Array(10000000).fill('data');
  }

  processData() {
    // More memory allocation
    const moreData = new Array(5000000).fill('additional-data');
    return moreData.length;
  }
}`;

      // Create performance test suite
      const performanceTests = `import { test } from 'node:test';
import { performance } from 'node:perf_hooks';

test('should measure animation performance', async () => {
  const { SlowAnimationEngine } = await import('../src/slow-implementation.js');
  const engine = new SlowAnimationEngine();

  const startTime = performance.now();
  await engine.renderCharacterAnimation();
  const duration = performance.now() - startTime;

  // This will fail due to constitutional violation
  assert.ok(duration < 500, \`Animation took \${duration}ms, should be < 500ms\`);
});

test('should measure analysis performance', async () => {
  const { SlowAnalysisEngine } = await import('../src/slow-implementation.js');
  const engine = new SlowAnalysisEngine();

  const startTime = performance.now();
  await engine.performConstitutionalAnalysis();
  const duration = performance.now() - startTime;

  // This will fail due to constitutional violation
  assert.ok(duration < 100, \`Analysis took \${duration}ms, should be < 100ms\`);
});`;

      await writeFile(join(testWorkspace, 'performance-spec.md'), performanceSpec);
      await writeFile(join(testWorkspace, 'src', 'slow-implementation.js'), slowImplementation);
      await writeFile(join(testWorkspace, 'tests', 'performance.test.js'), performanceTests);

      const validationRequest = {
        specificationPath: join(testWorkspace, 'performance-spec.md'),
        implementationPath: join(testWorkspace, 'src'),
        testSuitePath: join(testWorkspace, 'tests'),
        validationOptions: {
          enforceConstitutionalLimits: true,
          measureRealTimePerformance: true,
          validateMemoryUsage: true,
          validateCpuUsage: true,
          generateOptimizationPlan: true
        }
      };

      const startTime = performance.now();
      const result = await performanceWorkflow.executeValidation(validationRequest);
      const executionTime = performance.now() - startTime;

      // Verify workflow execution
      assert.ok(result.validation_session_id);
      assert.ok(result.performance_metrics);
      assert.ok(result.constitutional_violations);
      assert.ok(result.optimization_recommendations);

      // Verify timing compliance for validation itself
      assert.ok(executionTime < 5000, `Performance validation took ${executionTime}ms, should be < 5000ms`);

      // Verify constitutional violation detection
      const violations = result.constitutional_violations;
      assert.ok(violations.length >= 3, 'Should detect multiple constitutional violations');

      // Should detect animation timing violation
      const animationViolation = violations.find(v =>
        v.metric_name === 'animation-duration' || v.description.includes('500ms')
      );
      assert.ok(animationViolation, 'Should detect animation timing violation');
      assert.strictEqual(animationViolation.compliance_status, 'violation');
      assert.ok(animationViolation.measured_value > 500);

      // Should detect analysis timing violation
      const analysisViolation = violations.find(v =>
        v.metric_name === 'analysis-time' || v.description.includes('100ms')
      );
      assert.ok(analysisViolation, 'Should detect analysis timing violation');

      // Should detect memory usage violation
      const memoryViolation = violations.find(v =>
        v.metric_name === 'memory-usage' || v.description.includes('50MB')
      );
      assert.ok(memoryViolation, 'Should detect memory usage violation');

      // Verify performance metrics structure
      assert.ok(result.performance_metrics.timing_measurements);
      assert.ok(result.performance_metrics.memory_measurements);
      assert.ok(result.performance_metrics.cpu_measurements);

      // Verify optimization recommendations
      assert.ok(Array.isArray(result.optimization_recommendations));
      result.optimization_recommendations.forEach(recommendation => {
        assert.ok(recommendation.violation_reference);
        assert.ok(recommendation.optimization_strategy);
        assert.ok(recommendation.expected_improvement);
        assert.ok(['HIGH', 'MEDIUM', 'LOW'].includes(recommendation.priority));
      });
    });

    test('should integrate with swarm orchestrator for performance testing at scale', async () => {
      const scaleSpec = `# High-Scale Performance Feature
## Concurrent Processing Requirements
- CP-001: System MUST handle 1000+ concurrent user requests
- CP-002: System MUST process data streams in parallel using swarm coordination
- CP-003: System MUST maintain <200ms response time under load
- CP-004: System MUST distribute workload across multiple agents

## Throughput Requirements
- TP-001: System MUST process 10,000 transactions per minute
- TP-002: System MUST handle peak loads without degradation
- TP-003: System MUST scale horizontally using swarm orchestrator
`;

      const swarmImplementation = `// Implementation using swarm coordination
class SwarmCoordinatedService {
  constructor() {
    this.swarmOrchestrator = null; // Will be injected
    this.performanceMetrics = new Map();
  }

  async processHighVolumeRequests(requests) {
    const startTime = performance.now();

    if (requests.length > 100) {
      // Use swarm coordination for large volumes
      return await this.distributeViaSwarm(requests);
    } else {
      // Process locally for small volumes
      return await this.processLocally(requests);
    }
  }

  async distributeViaSwarm(requests) {
    // Simulate swarm distribution
    const chunks = this.chunkRequests(requests, 100);
    const promises = chunks.map(chunk => this.processChunk(chunk));
    return await Promise.all(promises);
  }

  async processLocally(requests) {
    return requests.map(req => this.processRequest(req));
  }

  async processRequest(request) {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
    return { requestId: request.id, processed: true };
  }

  chunkRequests(requests, chunkSize) {
    const chunks = [];
    for (let i = 0; i < requests.length; i += chunkSize) {
      chunks.push(requests.slice(i, i + chunkSize));
    }
    return chunks;
  }

  async processChunk(chunk) {
    return chunk.map(req => this.processRequest(req));
  }
}`;

      const loadTests = `// Load testing suite
import { test } from 'node:test';
import { performance } from 'node:perf_hooks';

async function generateLoad(requestCount) {
  return Array.from({length: requestCount}, (_, i) => ({
    id: i,
    data: \`request-\${i}\`,
    timestamp: Date.now()
  }));
}

test('should handle moderate load efficiently', async () => {
  const { SwarmCoordinatedService } = await import('../src/swarm-implementation.js');
  const service = new SwarmCoordinatedService();

  const requests = await generateLoad(500);
  const startTime = performance.now();
  const results = await service.processHighVolumeRequests(requests);
  const duration = performance.now() - startTime;

  assert.ok(results.length === 500);
  assert.ok(duration < 2000, \`Processing took \${duration}ms for 500 requests\`);
});

test('should scale with swarm coordination for high load', async () => {
  const { SwarmCoordinatedService } = await import('../src/swarm-implementation.js');
  const service = new SwarmCoordinatedService();

  const requests = await generateLoad(2000);
  const startTime = performance.now();
  const results = await service.processHighVolumeRequests(requests);
  const duration = performance.now() - startTime;

  assert.ok(results.length === 2000);
  // Should use swarm coordination and complete faster than linear scaling
  assert.ok(duration < 5000, \`Processing took \${duration}ms for 2000 requests\`);
});`;

      await writeFile(join(testWorkspace, 'scale-spec.md'), scaleSpec);
      await writeFile(join(testWorkspace, 'src', 'swarm-implementation.js'), swarmImplementation);
      await writeFile(join(testWorkspace, 'tests', 'load.test.js'), loadTests);

      const validationRequest = {
        specificationPath: join(testWorkspace, 'scale-spec.md'),
        implementationPath: join(testWorkspace, 'src'),
        testSuitePath: join(testWorkspace, 'tests'),
        validationOptions: {
          enableSwarmTesting: true,
          testScalability: true,
          measureThroughput: true,
          validateConcurrency: true,
          simulateLoad: true
        }
      };

      const result = await performanceWorkflow.executeValidation(validationRequest);

      // Verify swarm integration metrics
      assert.ok(result.swarm_performance_metrics);
      assert.ok(result.swarm_performance_metrics.coordination_overhead);
      assert.ok(result.swarm_performance_metrics.parallel_efficiency);
      assert.ok(typeof result.swarm_performance_metrics.agents_utilized === 'number');

      // Verify scalability analysis
      assert.ok(result.scalability_analysis);
      assert.ok(result.scalability_analysis.linear_scaling_baseline);
      assert.ok(result.scalability_analysis.swarm_scaling_improvement);
      assert.ok(typeof result.scalability_analysis.efficiency_gain === 'number');

      // Should show improvement with swarm coordination
      assert.ok(result.scalability_analysis.efficiency_gain > 1.0,
               'Swarm coordination should provide efficiency gains');

      // Verify throughput measurements
      assert.ok(result.throughput_analysis);
      assert.ok(typeof result.throughput_analysis.requests_per_second === 'number');
      assert.ok(typeof result.throughput_analysis.concurrent_capacity === 'number');

      // Should meet constitutional timing requirements
      const timingCompliance = result.constitutional_compliance;
      assert.ok(timingCompliance.response_time_compliance);
      assert.ok(timingCompliance.response_time_compliance.average_response_time < 200);
    });

    test('should validate character-driven performance feedback and user experience', async () => {
      const uxPerformanceSpec = `# Character-Driven Performance Experience
## User Experience Performance Requirements
- UX-001: Loading states MUST provide friendly, encouraging feedback
- UX-002: Progress indicators MUST maintain Spec personality consistency
- UX-003: Performance delays MUST be communicated with helpful context
- UX-004: Error recovery MUST include character-appropriate guidance

## Animation Performance Requirements
- AP-001: Character animations MUST complete within 500ms
- AP-002: Feedback animations MUST feel responsive and delightful
- AP-003: Loading animations MUST not appear mechanical or harsh
- AP-004: Success animations MUST be celebratory but not cringe

## Response Time Requirements
- RT-001: User actions MUST receive immediate visual acknowledgment
- RT-002: Processing feedback MUST include estimated completion time
- RT-003: Long operations MUST provide character-friendly progress updates
`;

      const characterUxImplementation = `// Character-driven UX with performance considerations
class SpecCharacterFeedback {
  constructor() {
    this.personality = 'friendly-golden-retriever';
    this.feedbackMessages = {
      loading: ['🐕 Fetching that for you...', '🎾 On it! Just a moment...', '🦴 Good things coming up...'],
      success: ['🎉 Got it! Here you go!', '✨ All done! Wasn\'t that quick?', '🏆 Success! You\'re amazing!'],
      error: ['🤔 Hmm, let me try that again...', '🐕 Oops! Let me get that fixed...', '💪 No worries, I\'ll handle this!']
    };
  }

  async showLoadingFeedback(operation) {
    const message = this.getRandomMessage('loading');
    const startTime = performance.now();

    // Show immediate feedback (should be <100ms)
    await this.displayMessage(message);

    // Start animation (should complete within 500ms)
    const animationPromise = this.renderLoadingAnimation();

    // Execute operation with progress updates
    const result = await this.executeWithProgress(operation);

    // Ensure animation completes within constitutional limit
    await animationPromise;

    const duration = performance.now() - startTime;

    if (duration > 2000) {
      await this.showApologyMessage(duration);
    } else {
      await this.showSuccessMessage();
    }

    return result;
  }

  async renderLoadingAnimation() {
    // Character-appropriate loading animation
    const frames = ['🐕', '🐕‍🦺', '🦮', '🐕‍🦺', '🐕'];
    for (const frame of frames) {
      await this.displayFrame(frame);
      await new Promise(resolve => setTimeout(resolve, 100)); // Total: 500ms
    }
  }

  async displayMessage(message) {
    // Should provide immediate visual feedback
    console.log(message);
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate rendering
  }

  async displayFrame(frame) {
    console.log(frame);
    await new Promise(resolve => setTimeout(resolve, 20)); // Frame rendering
  }

  async executeWithProgress(operation) {
    // Simulate progress updates with character personality
    const progressMessages = [
      '🎯 25% there... you\'re doing great!',
      '🚀 50% complete... almost there!',
      '⭐ 75% done... the finish line is in sight!',
      '🎉 Nearly finished... this is exciting!'
    ];

    let progress = 0;
    const interval = setInterval(() => {
      if (progress < progressMessages.length) {
        console.log(progressMessages[progress]);
        progress++;
      }
    }, 500);

    const result = await operation();
    clearInterval(interval);
    return result;
  }

  async showSuccessMessage() {
    const message = this.getRandomMessage('success');
    await this.displayMessage(message);
    await this.renderSuccessAnimation();
  }

  async showApologyMessage(duration) {
    const apologyMessage = \`🐕 Sorry that took \${Math.round(duration/1000)} seconds! I'll try to be faster next time.\`;
    await this.displayMessage(apologyMessage);
  }

  async renderSuccessAnimation() {
    // Quick celebration animation
    const celebration = ['🎉', '✨', '🎊', '🌟', '🎈'];
    for (const emoji of celebration) {
      await this.displayFrame(emoji);
      await new Promise(resolve => setTimeout(resolve, 80)); // Total: 400ms
    }
  }

  getRandomMessage(type) {
    const messages = this.feedbackMessages[type];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}`;

      const characterTests = `// Character UX performance tests
import { test } from 'node:test';
import { performance } from 'node:perf_hooks';

test('should provide immediate visual feedback', async () => {
  const { SpecCharacterFeedback } = await import('../src/character-ux.js');
  const feedback = new SpecCharacterFeedback();

  const startTime = performance.now();
  await feedback.displayMessage('Test message');
  const feedbackTime = performance.now() - startTime;

  // Should provide immediate feedback
  assert.ok(feedbackTime < 100, \`Feedback took \${feedbackTime}ms, should be < 100ms\`);
});

test('should complete loading animation within constitutional limit', async () => {
  const { SpecCharacterFeedback } = await import('../src/character-ux.js');
  const feedback = new SpecCharacterFeedback();

  const startTime = performance.now();
  await feedback.renderLoadingAnimation();
  const animationTime = performance.now() - startTime;

  // Should complete within 500ms constitutional limit
  assert.ok(animationTime < 500, \`Animation took \${animationTime}ms, should be < 500ms\`);
});

test('should maintain character consistency in performance feedback', async () => {
  const { SpecCharacterFeedback } = await import('../src/character-ux.js');
  const feedback = new SpecCharacterFeedback();

  const mockOperation = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 'operation-complete';
  };

  const result = await feedback.showLoadingFeedback(mockOperation);
  assert.strictEqual(result, 'operation-complete');

  // Character consistency should be maintained throughout
  assert.strictEqual(feedback.personality, 'friendly-golden-retriever');
});`;

      await writeFile(join(testWorkspace, 'ux-performance-spec.md'), uxPerformanceSpec);
      await writeFile(join(testWorkspace, 'src', 'character-ux.js'), characterUxImplementation);
      await writeFile(join(testWorkspace, 'tests', 'character-performance.test.js'), characterTests);

      const validationRequest = {
        specificationPath: join(testWorkspace, 'ux-performance-spec.md'),
        implementationPath: join(testWorkspace, 'src'),
        testSuitePath: join(testWorkspace, 'tests'),
        validationOptions: {
          validateCharacterConsistency: true,
          measureUserExperienceMetrics: true,
          validateAnimationTiming: true,
          assessFeedbackQuality: true
        }
      };

      const result = await performanceWorkflow.executeValidation(validationRequest);

      // Verify character consistency validation
      assert.ok(result.character_consistency_analysis);
      assert.ok(result.character_consistency_analysis.personality_compliance);
      assert.ok(result.character_consistency_analysis.message_tone_analysis);

      // Should validate friendly, non-cringe messaging
      const toneAnalysis = result.character_consistency_analysis.message_tone_analysis;
      assert.ok(toneAnalysis.friendliness_score > 0.8);
      assert.ok(toneAnalysis.cringe_factor < 0.3);
      assert.ok(toneAnalysis.encouragement_level > 0.7);

      // Verify UX performance metrics
      assert.ok(result.ux_performance_metrics);
      assert.ok(result.ux_performance_metrics.feedback_responsiveness);
      assert.ok(result.ux_performance_metrics.animation_smoothness);
      assert.ok(typeof result.ux_performance_metrics.perceived_performance_score === 'number');

      // Should meet constitutional animation timing
      const animationMetrics = result.ux_performance_metrics.animation_performance;
      assert.ok(animationMetrics.loading_animation_duration < 500);
      assert.ok(animationMetrics.success_animation_duration < 500);
      assert.ok(animationMetrics.immediate_feedback_time < 100);

      // Verify user experience quality assessment
      assert.ok(result.user_experience_assessment);
      assert.ok(result.user_experience_assessment.delight_factor > 0.6);
      assert.ok(result.user_experience_assessment.frustration_indicators < 0.3);
      assert.ok(result.user_experience_assessment.character_authenticity > 0.8);
    });

    test('should generate comprehensive performance optimization roadmap', async () => {
      const optimizationSpec = `# Performance Optimization Requirements
## Current Performance Issues
- PI-001: Analysis operations currently exceed 100ms constitutional limit
- PI-002: Animation rendering occasionally exceeds 500ms limit
- PI-003: Memory usage peaks above 50MB during complex operations
- PI-004: CPU utilization spikes above 10% during idle periods

## Optimization Goals
- OG-001: Achieve 95% compliance with constitutional performance limits
- OG-002: Implement performance monitoring with real-time alerts
- OG-003: Optimize memory allocation patterns for efficiency
- OG-004: Establish performance regression testing pipeline

## Integration Requirements
- IR-001: Optimize swarm coordination overhead
- IR-002: Implement performance-aware task distribution
- IR-003: Enable dynamic scaling based on performance metrics
`;

      const unoptimizedImplementation = `// Unoptimized implementation with known issues
class UnoptimizedAnalysisEngine {
  constructor() {
    this.cache = new Map();
    this.largeDataSet = new Array(1000000).fill('data'); // Memory issue
  }

  async performAnalysis(data) {
    // Inefficient algorithm - O(n²) complexity
    const results = [];
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data.length; j++) {
        if (this.compareItems(data[i], data[j])) {
          results.push(\`match-\${i}-\${j}\`);
        }
      }
    }

    // Synchronous heavy computation blocking event loop
    this.heavyComputation(results);

    return results;
  }

  compareItems(a, b) {
    // Inefficient string comparison
    return JSON.stringify(a) === JSON.stringify(b);
  }

  heavyComputation(data) {
    // Blocking operation
    let sum = 0;
    for (let i = 0; i < 10000000; i++) {
      sum += Math.sqrt(i);
    }
    return sum;
  }

  async processLargeDataset(dataset) {
    // No chunking or pagination
    const allResults = [];
    for (const item of dataset) {
      const result = await this.performAnalysis([item]);
      allResults.push(...result);
    }
    return allResults;
  }
}

class InEfficientAnimationEngine {
  async renderAnimation(animationData) {
    // Inefficient rendering without optimization
    for (let frame = 0; frame < animationData.frameCount; frame++) {
      await this.renderFrame(frame, animationData);
      // No frame rate control or optimization
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  async renderFrame(frameIndex, data) {
    // Simulate expensive rendering operations
    const canvas = this.createCanvas();
    const context = canvas.getContext('2d');

    // Inefficient drawing operations
    for (let i = 0; i < 1000; i++) {
      context.beginPath();
      context.arc(Math.random() * 800, Math.random() * 600, 5, 0, 2 * Math.PI);
      context.fill();
    }

    return canvas;
  }

  createCanvas() {
    // Simulated canvas creation
    return {
      getContext: () => ({
        beginPath: () => {},
        arc: () => {},
        fill: () => {}
      })
    };
  }
}`;

      await writeFile(join(testWorkspace, 'optimization-spec.md'), optimizationSpec);
      await writeFile(join(testWorkspace, 'src', 'unoptimized.js'), unoptimizedImplementation);

      const validationRequest = {
        specificationPath: join(testWorkspace, 'optimization-spec.md'),
        implementationPath: join(testWorkspace, 'src'),
        validationOptions: {
          performDeepAnalysis: true,
          identifyBottlenecks: true,
          generateOptimizationPlan: true,
          prioritizeOptimizations: true,
          estimateImprovements: true
        }
      };

      const result = await performanceWorkflow.executeValidation(validationRequest);

      // Verify bottleneck identification
      assert.ok(result.performance_bottlenecks);
      assert.ok(Array.isArray(result.performance_bottlenecks));
      assert.ok(result.performance_bottlenecks.length >= 3);

      result.performance_bottlenecks.forEach(bottleneck => {
        assert.ok(bottleneck.bottleneck_type);
        assert.ok(bottleneck.location);
        assert.ok(bottleneck.impact_assessment);
        assert.ok(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(bottleneck.severity));
      });

      // Should identify algorithmic complexity issues
      const algorithmicBottleneck = result.performance_bottlenecks.find(b =>
        b.bottleneck_type === 'algorithmic_complexity' ||
        b.description.includes('O(n²)')
      );
      assert.ok(algorithmicBottleneck, 'Should identify O(n²) algorithmic bottleneck');

      // Should identify memory allocation issues
      const memoryBottleneck = result.performance_bottlenecks.find(b =>
        b.bottleneck_type === 'memory_allocation' ||
        b.description.includes('large array')
      );
      assert.ok(memoryBottleneck, 'Should identify memory allocation bottleneck');

      // Verify optimization roadmap
      assert.ok(result.optimization_roadmap);
      assert.ok(Array.isArray(result.optimization_roadmap.optimization_phases));

      const phases = result.optimization_roadmap.optimization_phases;
      assert.ok(phases.length >= 2, 'Should provide multi-phase optimization plan');

      phases.forEach(phase => {
        assert.ok(phase.phase_name);
        assert.ok(Array.isArray(phase.optimizations));
        assert.ok(typeof phase.estimated_improvement === 'number');
        assert.ok(typeof phase.implementation_effort === 'number');

        phase.optimizations.forEach(optimization => {
          assert.ok(optimization.optimization_type);
          assert.ok(optimization.current_issue);
          assert.ok(optimization.proposed_solution);
          assert.ok(optimization.expected_performance_gain);
        });
      });

      // Verify performance improvement estimates
      assert.ok(result.improvement_estimates);
      assert.ok(typeof result.improvement_estimates.overall_performance_gain === 'number');
      assert.ok(result.improvement_estimates.overall_performance_gain > 1.5); // At least 50% improvement expected

      // Should include constitutional compliance roadmap
      assert.ok(result.constitutional_compliance_roadmap);
      assert.ok(result.constitutional_compliance_roadmap.timing_optimizations);
      assert.ok(result.constitutional_compliance_roadmap.memory_optimizations);

      // Verify swarm integration optimization recommendations
      const swarmOptimizations = result.optimization_roadmap.optimization_phases
        .flatMap(phase => phase.optimizations)
        .filter(opt => opt.optimization_type.includes('swarm') ||
                      opt.proposed_solution.includes('swarm'));

      assert.ok(swarmOptimizations.length > 0, 'Should include swarm-specific optimizations');
    });
  });

  describe('Performance workflow error handling and resilience', () => {
    test('should handle performance measurement failures gracefully', async () => {
      const flakySpec = `# Flaky Performance Feature
## Requirements
- FP-001: System MUST handle intermittent performance measurements
- FP-002: System MUST provide fallback metrics when primary measurement fails
- FP-003: System MUST continue validation despite measurement errors
`;

      const flakyImplementation = `// Implementation with intermittent failures
class FlakyPerformanceService {
  constructor() {
    this.failureRate = 0.3; // 30% chance of measurement failure
  }

  async performOperation() {
    if (Math.random() < this.failureRate) {
      throw new Error('Simulated measurement failure');
    }

    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    return 'operation-complete';
  }

  async measurePerformance() {
    if (Math.random() < this.failureRate) {
      throw new Error('Performance measurement unavailable');
    }

    return {
      duration: Math.random() * 1000,
      memoryUsage: Math.random() * 100 * 1024 * 1024
    };
  }
}`;

      await writeFile(join(testWorkspace, 'flaky-spec.md'), flakySpec);
      await writeFile(join(testWorkspace, 'src', 'flaky-service.js'), flakyImplementation);

      const validationRequest = {
        specificationPath: join(testWorkspace, 'flaky-spec.md'),
        implementationPath: join(testWorkspace, 'src'),
        validationOptions: {
          tolerateFailures: true,
          retryFailedMeasurements: 3,
          useFallbackMetrics: true,
          generatePartialResults: true
        }
      };

      const result = await performanceWorkflow.executeValidation(validationRequest);

      // Should complete despite failures
      assert.ok(result.validation_session_id);
      assert.ok(result.performance_metrics || result.partial_results);

      // Should report measurement issues
      assert.ok(result.measurement_warnings);
      assert.ok(Array.isArray(result.measurement_warnings));

      if (result.measurement_warnings.length > 0) {
        result.measurement_warnings.forEach(warning => {
          assert.ok(warning.measurement_type);
          assert.ok(warning.failure_reason);
          assert.ok(warning.fallback_strategy);
        });
      }

      // Should provide resilience recommendations
      assert.ok(result.resilience_recommendations);
      assert.ok(Array.isArray(result.resilience_recommendations));
    });

    test('should enforce constitutional timing limits for the validation process itself', async () => {
      const selfPerformanceSpec = `# Self-Performance Validation
## Meta-Performance Requirements
- MP-001: Performance validation MUST complete within 5 seconds
- MP-002: Validation overhead MUST not exceed 10% of measured operation time
- MP-003: Real-time monitoring MUST not impact system performance
`;

      const simpleImplementation = `// Simple implementation for meta-performance testing
class SimpleService {
  async quickOperation() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return 'quick-result';
  }

  async mediumOperation() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return 'medium-result';
  }
}`;

      await writeFile(join(testWorkspace, 'self-performance-spec.md'), selfPerformanceSpec);
      await writeFile(join(testWorkspace, 'src', 'simple-service.js'), simpleImplementation);

      const validationRequest = {
        specificationPath: join(testWorkspace, 'self-performance-spec.md'),
        implementationPath: join(testWorkspace, 'src'),
        validationOptions: {
          enforceValidationTiming: true,
          measureValidationOverhead: true,
          optimizeValidationProcess: true
        }
      };

      const startTime = performance.now();
      const result = await performanceWorkflow.executeValidation(validationRequest);
      const totalValidationTime = performance.now() - startTime;

      // Should complete within constitutional limits
      assert.ok(totalValidationTime < 6000,
               `Performance validation took ${totalValidationTime}ms, should be < 6000ms`);

      // Should report validation overhead
      assert.ok(result.validation_overhead_metrics);
      assert.ok(typeof result.validation_overhead_metrics.overhead_percentage === 'number');
      assert.ok(result.validation_overhead_metrics.overhead_percentage < 15,
               'Validation overhead should be < 15%');

      // Should optimize validation process
      assert.ok(result.validation_optimization_applied);
      assert.ok(Array.isArray(result.validation_optimization_applied));
    });
  });
});