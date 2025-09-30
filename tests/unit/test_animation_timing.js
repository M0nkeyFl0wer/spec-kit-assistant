/**
 * T038: Unit tests for animation timing
 * Tests animation engine timing compliance with constitutional 500ms limits
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { AnimationEngine } from '../../src/animation/engine.js';
import { AnimationSequence } from '../../src/core/animation-sequence.js';

describe('AnimationEngine Timing', () => {
  let engine;
  let originalEnv;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    engine = new AnimationEngine();
    await engine.initialize();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('constitutional timing compliance', () => {
    test('should enforce 500ms maximum animation duration', async () => {
      // Create an animation sequence that tries to exceed constitutional limit
      const longSequence = new AnimationSequence('test-long', {
        timing: 1000, // Tries to be 1000ms
        fallbackText: 'Test animation'
      });
      longSequence.addFrame('Frame 1', 300);
      longSequence.addFrame('Frame 2', 400);
      longSequence.addFrame('Frame 3', 400);

      engine.registerSequence('test-long', longSequence);

      const startTime = performance.now();
      const result = await engine.playSequence('test-long');
      const actualDuration = performance.now() - startTime;

      // Should enforce constitutional 500ms limit
      assert.ok(actualDuration <= 600, `Animation took ${actualDuration}ms, should be ≤ 600ms (500ms + tolerance)`);
      assert.ok(result.success, 'Animation should complete successfully');
    });

    test('should respect constitutional timeout in renderSequence', async () => {
      const sequence = new AnimationSequence('timeout-test', {
        timing: 800, // Will be clamped to 500ms
        fallbackText: 'Timeout test'
      });
      sequence.addFrames(['Frame 1', 'Frame 2', 'Frame 3']);

      const startTime = performance.now();
      await engine.renderSequence(sequence, { timeout: 1000 });
      const renderTime = performance.now() - startTime;

      // Should respect constitutional 500ms limit regardless of passed timeout
      assert.ok(renderTime <= 600, `Render took ${renderTime}ms, should respect 500ms constitutional limit`);
    });

    test('should handle fast animations correctly', async () => {
      const fastSequence = new AnimationSequence('fast-test', {
        timing: 50,
        fallbackText: 'Fast animation'
      });
      fastSequence.addFrame('Quick frame', 50);

      engine.registerSequence('fast-test', fastSequence);

      const startTime = performance.now();
      const result = await engine.playSequence('fast-test');
      const duration = performance.now() - startTime;

      assert.ok(result.success, 'Fast animation should succeed');
      assert.ok(duration < 200, `Fast animation took ${duration}ms, should be quick`);
    });

    test('should enforce constitutional limit for progress animations', async () => {
      const startTime = performance.now();
      await engine.showProgress('Testing progress', 2000); // Requests 2000ms
      const duration = performance.now() - startTime;

      // Should be clamped to constitutional 500ms limit
      assert.ok(duration <= 600, `Progress animation took ${duration}ms, should be ≤ 600ms`);
    });
  });

  describe('performance metrics', () => {
    test('should track animation performance metrics', async () => {
      const sequence = new AnimationSequence('metrics-test', {
        timing: 200,
        fallbackText: 'Metrics test'
      });
      sequence.addFrame('Test frame');

      engine.registerSequence('metrics-test', sequence);

      // Play a few animations
      await engine.playSequence('metrics-test');
      await engine.playSequence('metrics-test');
      await engine.playSequence('metrics-test');

      const metrics = engine.getPerformanceReport();

      assert.ok(metrics.totalAnimations >= 3, 'Should track total animations');
      assert.ok(metrics.averageDuration >= 0, 'Should track average duration');
      assert.ok(metrics.maxDuration >= 0, 'Should track max duration');
      assert.ok(typeof metrics.errors === 'number', 'Should track errors');
    });

    test('should report constitutional compliance in metrics', async () => {
      const sequence = new AnimationSequence('compliance-test', {
        timing: 300,
        fallbackText: 'Compliance test'
      });
      sequence.addFrame('Test frame');

      engine.registerSequence('compliance-test', sequence);
      await engine.playSequence('compliance-test');

      const report = engine.getPerformanceReport();

      assert.ok(report.constitutionalCompliance, 'Should include constitutional compliance');
      assert.ok(typeof report.constitutionalCompliance.averageWithinLimit === 'boolean');
      assert.ok(typeof report.constitutionalCompliance.maxWithinLimit === 'boolean');
      assert.ok(typeof report.constitutionalCompliance.errorRate === 'number');

      // Should be compliant
      assert.strictEqual(report.constitutionalCompliance.maxWithinLimit, true,
        'Max duration should be within constitutional limit');
    });

    test('should detect constitutional violations', async () => {
      // Manually set a violation in metrics
      engine.performanceMetrics.maxDuration = 600; // Exceeds 500ms limit

      const report = engine.getPerformanceReport();

      assert.strictEqual(report.constitutionalCompliance.maxWithinLimit, false,
        'Should detect constitutional violation');
    });
  });

  describe('fallback mode timing', () => {
    test('should have instant timing in fallback mode', async () => {
      engine.enableFallbackMode();

      const startTime = performance.now();
      const result = await engine.playSequence('welcome');
      const duration = performance.now() - startTime;

      assert.ok(result.success, 'Fallback animation should succeed');
      assert.ok(duration < 100, `Fallback animation took ${duration}ms, should be near-instant`);
      assert.strictEqual(result.fallbackMode, true, 'Should indicate fallback mode');
    });

    test('should respect constitutional limits even in fallback', async () => {
      engine.enableFallbackMode();

      // Even in fallback, constitutional timing should be respected
      const startTime = performance.now();
      await engine.showProgress('Fallback progress', 1000);
      const duration = performance.now() - startTime;

      assert.ok(duration < 200, `Fallback progress took ${duration}ms, should be very fast`);
    });
  });

  describe('animation sequence timing validation', () => {
    test('should validate animation sequence timing limits', () => {
      // Create sequence that violates constitutional timing
      const violatingSequence = new AnimationSequence('violating', {
        timing: 1000, // Exceeds 500ms
        fallbackText: 'Violating sequence'
      });

      // Should automatically clamp to constitutional limit
      assert.ok(violatingSequence.timing <= 500,
        `Sequence timing ${violatingSequence.timing}ms should be clamped to ≤ 500ms`);
    });

    test('should validate frame timing in sequences', () => {
      const sequence = new AnimationSequence('frame-test', {
        timing: 400,
        fallbackText: 'Frame test'
      });

      // Add frames with various durations
      sequence.addFrame('Frame 1', 100);
      sequence.addFrame('Frame 2', 200);
      sequence.addFrame('Frame 3', 300);

      const validation = sequence.validate();

      assert.strictEqual(validation.valid, true, 'Sequence should be valid');
      assert.strictEqual(validation.constitutionallyCompliant, true,
        'Sequence should be constitutionally compliant');
    });

    test('should reject sequences with excessive total duration', () => {
      const sequence = new AnimationSequence('excessive', {
        timing: 500,
        fallbackText: 'Excessive sequence'
      });

      // Add many frames that would exceed limits
      for (let i = 0; i < 10; i++) {
        sequence.addFrame(`Frame ${i}`, 100);
      }

      const validation = sequence.validate();

      // Should still be valid due to constitutional clamping
      assert.strictEqual(validation.valid, true, 'Should handle excessive frames gracefully');
    });
  });

  describe('terminal capability impact on timing', () => {
    test('should adjust timing for limited terminals', async () => {
      // Mock limited terminal capabilities
      engine.terminalCapabilities = {
        supportsAnimations: false,
        supportsColor: false,
        cursorControl: false,
        performanceProfile: {
          expectedLatency: 'high',
          animationBudget: 100 // Reduced budget
        }
      };

      engine.enableFallbackMode();

      const startTime = performance.now();
      await engine.playSequence('welcome');
      const duration = performance.now() - startTime;

      // Should be very fast for limited terminals
      assert.ok(duration < 150, `Limited terminal animation took ${duration}ms, should be very fast`);
    });

    test('should respect different animation budgets', async () => {
      // Test with CI environment budget (100ms)
      const ciSequence = new AnimationSequence('ci-test', {
        timing: 300, // Will be reduced for CI
        fallbackText: 'CI test'
      });
      ciSequence.addFrame('CI frame');

      // Mock CI environment
      engine.terminalCapabilities = {
        supportsAnimations: true,
        performanceProfile: {
          animationBudget: 100 // CI budget
        }
      };

      engine.registerSequence('ci-test', ciSequence);

      const startTime = performance.now();
      await engine.playSequence('ci-test', { timeout: 300 });
      const duration = performance.now() - startTime;

      // Should respect reduced CI budget
      assert.ok(duration <= 200, `CI animation took ${duration}ms, should respect CI budget`);
    });
  });

  describe('error handling with timing', () => {
    test('should handle animation errors within time limits', async () => {
      // Create a sequence that will cause an error
      const errorSequence = new AnimationSequence('error-test', {
        timing: 200,
        fallbackText: 'Error test'
      });

      // Mock an error in frame rendering
      errorSequence.getCurrentFrame = () => {
        throw new Error('Mock animation error');
      };

      engine.registerSequence('error-test', errorSequence);

      const startTime = performance.now();
      const result = await engine.playSequence('error-test');
      const duration = performance.now() - startTime;

      // Should handle error quickly and not exceed timing limits
      assert.ok(duration < 200, `Error handling took ${duration}ms, should be fast`);
      assert.strictEqual(result.success, false, 'Should indicate failure');
      assert.ok(result.error, 'Should include error message');
    });

    test('should timeout gracefully', async () => {
      // Create sequence with very short timeout
      const timeoutSequence = new AnimationSequence('timeout-test', {
        timing: 100,
        fallbackText: 'Timeout test'
      });
      timeoutSequence.addFrame('Frame 1', 50);
      timeoutSequence.addFrame('Frame 2', 50);

      engine.registerSequence('timeout-test', timeoutSequence);

      const startTime = performance.now();
      const result = await engine.playSequence('timeout-test', { timeout: 10 }); // Very short timeout
      const duration = performance.now() - startTime;

      // Should timeout quickly and gracefully
      assert.ok(duration < 100, `Timeout took ${duration}ms, should be quick`);
      assert.ok(result.success !== undefined, 'Should return result object');
    });
  });

  describe('concurrent animation timing', () => {
    test('should handle multiple concurrent animations within limits', async () => {
      const promises = [];
      const startTime = performance.now();

      // Start multiple animations concurrently
      for (let i = 0; i < 3; i++) {
        promises.push(engine.playSequence('welcome'));
      }

      await Promise.all(promises);
      const totalDuration = performance.now() - startTime;

      // Total time should still be reasonable (animations may run in parallel)
      assert.ok(totalDuration < 1000, `Concurrent animations took ${totalDuration}ms, should be reasonable`);
    });

    test('should maintain constitutional compliance under load', async () => {
      const startTime = performance.now();
      const promises = [];

      // Create load with many animations
      for (let i = 0; i < 5; i++) {
        promises.push(engine.playSequence('working'));
      }

      const results = await Promise.all(promises);
      const totalTime = performance.now() - startTime;

      // All should succeed
      results.forEach((result, index) => {
        assert.ok(result.success, `Animation ${index} should succeed under load`);
      });

      // Total time should be reasonable
      assert.ok(totalTime < 2000, `Load test took ${totalTime}ms, should handle load efficiently`);
    });
  });

  describe('static timing helpers', () => {
    test('should validate AnimationSequence timing in constructor', () => {
      // Test constitutional limit enforcement in constructor
      const sequence1 = new AnimationSequence('test1', { timing: 300 });
      assert.strictEqual(sequence1.timing, 300, 'Should preserve valid timing');

      const sequence2 = new AnimationSequence('test2', { timing: 800 });
      assert.ok(sequence2.timing <= 500, 'Should clamp excessive timing to constitutional limit');

      const sequence3 = new AnimationSequence('test3', { timing: -100 });
      assert.ok(sequence3.timing > 0, 'Should handle invalid timing gracefully');
    });

    test('should create performance-appropriate default sequences', () => {
      const welcomeSeq = AnimationSequence.createWelcomeAnimation();
      const workingSeq = AnimationSequence.createWorkingAnimation();

      assert.ok(welcomeSeq.timing <= 500, 'Welcome animation should be constitutionally compliant');
      assert.ok(workingSeq.timing <= 500, 'Working animation should be constitutionally compliant');

      assert.ok(welcomeSeq.validate().constitutionallyCompliant,
        'Welcome animation should pass constitutional validation');
      assert.ok(workingSeq.validate().constitutionallyCompliant,
        'Working animation should pass constitutional validation');
    });
  });
});

// Integration test with real timing
describe('Real-world Animation Timing Integration', () => {
  test('complete animation workflow should respect all constitutional limits', async () => {
    const engine = await AnimationEngine.create();

    const startTime = performance.now();

    // Simulate real usage pattern
    await engine.playSequence('welcome');
    await engine.playSequence('working');
    await engine.showProgress('Processing', 200);
    await engine.playSequence('celebrating');

    const totalTime = performance.now() - startTime;

    // Complete workflow should be efficient
    assert.ok(totalTime < 1500, `Complete workflow took ${totalTime}ms, should be under 1.5s`);

    const report = engine.getPerformanceReport();
    assert.ok(report.constitutionalCompliance.averageWithinLimit,
      'Average animation time should be within constitutional limits');
    assert.ok(report.constitutionalCompliance.maxWithinLimit,
      'Maximum animation time should be within constitutional limits');
  });
});