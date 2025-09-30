/**
 * T037: Unit tests for terminal detection
 * Tests terminal capability detection with constitutional compliance
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { TerminalDetector } from '../../src/core/terminal-detector.js';

describe('TerminalDetector', () => {
  let detector;
  let originalEnv;
  let originalStdout;

  beforeEach(() => {
    detector = new TerminalDetector();
    originalEnv = { ...process.env };
    originalStdout = { ...process.stdout };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    Object.assign(process.stdout, originalStdout);
  });

  describe('detectCapabilities', () => {
    test('should detect basic terminal properties', async () => {
      const capabilities = await detector.detectCapabilities();

      assert.ok(typeof capabilities.isTerminal === 'boolean');
      assert.ok(typeof capabilities.isTTY === 'boolean');
      assert.ok(typeof capabilities.width === 'number');
      assert.ok(typeof capabilities.height === 'number');
      assert.ok(capabilities.width >= 0);
      assert.ok(capabilities.height >= 0);
    });

    test('should detect color support', async () => {
      const capabilities = await detector.detectCapabilities();

      assert.ok(typeof capabilities.supportsColor === 'boolean');
      assert.ok(typeof capabilities.colorDepth === 'number');
      assert.ok(typeof capabilities.supports256Colors === 'boolean');
      assert.ok(typeof capabilities.supportsTrueColor === 'boolean');
    });

    test('should detect animation capabilities', async () => {
      const capabilities = await detector.detectCapabilities();

      assert.ok(typeof capabilities.supportsAnimations === 'boolean');
      assert.ok(typeof capabilities.supportsCursorControl === 'boolean');
      assert.ok(typeof capabilities.supportsClearing === 'boolean');
    });

    test('should enforce constitutional timing limits', async () => {
      const startTime = performance.now();
      const capabilities = await detector.detectCapabilities();
      const detectionTime = performance.now() - startTime;

      // Constitutional limit: detection should complete within reasonable time
      assert.ok(detectionTime < 1000, `Detection took ${detectionTime}ms, should be < 1000ms`);
      assert.ok(capabilities.detectionTime < 200, `Detection time ${capabilities.detectionTime}ms should be < 200ms`);
    });

    test('should handle NO_COLOR environment variable', async () => {
      process.env.NO_COLOR = '1';

      const capabilities = await detector.detectCapabilities();

      assert.strictEqual(capabilities.supportsColor, false);
      assert.strictEqual(capabilities.supports256Colors, false);
      assert.strictEqual(capabilities.supportsTrueColor, false);
      assert.strictEqual(capabilities.colorDepth, 0);
    });

    test('should handle SPEC_FALLBACK_MODE environment variable', async () => {
      process.env.SPEC_FALLBACK_MODE = 'true';

      const capabilities = await detector.detectCapabilities();

      assert.strictEqual(capabilities.supportsAnimations, false);
    });

    test('should detect CI environment', async () => {
      process.env.CI = 'true';

      const capabilities = await detector.detectCapabilities();

      assert.strictEqual(capabilities.isCI, true);
      assert.strictEqual(capabilities.environment, 'ci');
    });

    test('should detect cloud environment', async () => {
      process.env.CODESPACES = 'true';

      const capabilities = await detector.detectCapabilities();

      assert.strictEqual(capabilities.isCloud, true);
      assert.strictEqual(capabilities.environment, 'cloud');
    });

    test('should detect remote environment', async () => {
      process.env.SSH_CONNECTION = '1.2.3.4';

      const capabilities = await detector.detectCapabilities();

      assert.strictEqual(capabilities.isRemote, true);
    });
  });

  describe('platform detection', () => {
    test('should detect Linux platform', async () => {
      // Mock platform
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'linux' });

      const capabilities = await detector.detectCapabilities();

      assert.strictEqual(capabilities.platform, 'linux');

      // Restore
      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    test('should detect macOS platform', async () => {
      const originalPlatform = process.platform;
      Object.defineProperty(process, 'platform', { value: 'darwin' });

      const capabilities = await detector.detectCapabilities();

      assert.strictEqual(capabilities.platform, 'darwin');

      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });
  });

  describe('performance characteristics', () => {
    test('should calculate appropriate animation budget', async () => {
      const capabilities = await detector.detectCapabilities();

      assert.ok(capabilities.performanceProfile);
      assert.ok(typeof capabilities.performanceProfile.animationBudget === 'number');

      // Constitutional compliance: animation budget should not exceed 500ms
      assert.ok(capabilities.performanceProfile.animationBudget <= 500,
        `Animation budget ${capabilities.performanceProfile.animationBudget}ms exceeds constitutional limit of 500ms`);
    });

    test('should estimate latency correctly', async () => {
      const capabilities = await detector.detectCapabilities();

      assert.ok(capabilities.performanceProfile.expectedLatency);
      assert.ok(['low', 'medium', 'high', 'variable'].includes(
        capabilities.performanceProfile.expectedLatency
      ));
    });

    test('should reduce animation budget for CI environments', async () => {
      process.env.CI = 'true';

      const capabilities = await detector.detectCapabilities();

      // CI should get reduced animation budget
      assert.ok(capabilities.performanceProfile.animationBudget <= 100,
        'CI environment should have reduced animation budget');
    });

    test('should reduce animation budget for cloud environments', async () => {
      process.env.CODESPACES = 'true';

      const capabilities = await detector.detectCapabilities();

      // Cloud should get reduced animation budget
      assert.ok(capabilities.performanceProfile.animationBudget <= 250,
        'Cloud environment should have reduced animation budget');
    });
  });

  describe('fallback requirements', () => {
    test('should require fallback for dumb terminal', async () => {
      process.env.TERM = 'dumb';

      const capabilities = await detector.detectCapabilities();

      assert.strictEqual(capabilities.fallbackRequired, true);
      assert.strictEqual(capabilities.supportsAnimations, false);
      assert.strictEqual(capabilities.supportsColor, false);
    });

    test('should require fallback for narrow terminal', async () => {
      // Mock narrow terminal
      process.stdout.columns = 40;

      const capabilities = await detector.detectCapabilities();

      assert.strictEqual(capabilities.fallbackRequired, true);
      assert.strictEqual(capabilities.supportsAnimations, false);
      assert.strictEqual(capabilities.reason, 'narrow_terminal');
    });

    test('should not require fallback for good terminal', async () => {
      // Mock good terminal
      process.stdout.isTTY = true;
      process.stdout.columns = 100;
      process.stdout.rows = 30;
      if (process.stdout.hasColors) {
        process.stdout.hasColors = () => true;
      }
      process.env.TERM = 'xterm-256color';

      const capabilities = await detector.detectCapabilities();

      // Should have good capabilities
      assert.strictEqual(capabilities.isTTY, true);
      assert.ok(capabilities.width >= 60);
    });
  });

  describe('caching', () => {
    test('should cache detection results', async () => {
      const capabilities1 = await detector.detectCapabilities();
      const capabilities2 = await detector.detectCapabilities();

      // Should return the same object (cached)
      assert.strictEqual(capabilities1, capabilities2);
    });

    test('should respect cache timeout', async () => {
      // Set short timeout for testing
      detector.detectionTimeout = 10;

      const capabilities1 = await detector.detectCapabilities();

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 20));

      const capabilities2 = await detector.detectCapabilities();

      // Should be different objects (cache expired)
      assert.notStrictEqual(capabilities1, capabilities2);
    });
  });

  describe('generateReport', () => {
    test('should generate comprehensive report', async () => {
      const capabilities = await detector.detectCapabilities();
      const report = detector.generateReport(capabilities);

      assert.ok(report.summary);
      assert.ok(report.details);
      assert.ok(report.performance);
      assert.ok(report.constitutional);

      // Check constitutional compliance reporting
      assert.ok(typeof report.constitutional.detectionTime === 'string');
      assert.ok(typeof report.constitutional.animationBudget === 'string');
      assert.ok(['compliant', 'violation'].includes(report.constitutional.compliance));
    });

    test('should report constitutional violations', async () => {
      const mockCapabilities = {
        detectionTime: 150, // Exceeds 100ms limit
        performanceProfile: { animationBudget: 500 }
      };

      const report = detector.generateReport(mockCapabilities);

      assert.strictEqual(report.constitutional.compliance, 'violation');
    });
  });

  describe('getOptimalDisplayMode', () => {
    test('should return appropriate display mode', async () => {
      const capabilities = await detector.detectCapabilities();
      const mode = detector.getOptimalDisplayMode(capabilities);

      assert.ok(['full-animation', 'static-color', 'basic-color', 'text'].includes(mode));
    });

    test('should return text mode for minimal capabilities', () => {
      const minimalCapabilities = {
        supportsAnimations: false,
        supportsColor: false,
        supportsUnicode: false,
        fallbackRequired: true
      };

      const mode = detector.getOptimalDisplayMode(minimalCapabilities);

      assert.strictEqual(mode, 'text');
    });

    test('should return full-animation for good capabilities', () => {
      const goodCapabilities = {
        supportsAnimations: true,
        supportsColor: true,
        supportsUnicode: true,
        fallbackRequired: false
      };

      const mode = detector.getOptimalDisplayMode(goodCapabilities);

      assert.strictEqual(mode, 'full-animation');
    });
  });

  describe('static methods', () => {
    test('TerminalDetector.create should work', async () => {
      const detector = await TerminalDetector.create();

      assert.ok(detector instanceof TerminalDetector);
      assert.ok(detector.capabilities);
    });

    test('TerminalDetector.quickCheck should be fast', async () => {
      const startTime = performance.now();
      const result = await TerminalDetector.quickCheck();
      const checkTime = performance.now() - startTime;

      // Quick check should be very fast
      assert.ok(checkTime < 50, `Quick check took ${checkTime}ms, should be < 50ms`);

      assert.ok(typeof result.isTTY === 'boolean');
      assert.ok(typeof result.hasColor === 'boolean');
      assert.ok(typeof result.width === 'number');
      assert.ok(typeof result.fallbackMode === 'boolean');
    });
  });

  describe('constitutional compliance', () => {
    test('should never exceed constitutional limits', async () => {
      const startTime = performance.now();
      const capabilities = await detector.detectCapabilities();
      const totalTime = performance.now() - startTime;

      // Total detection time should be reasonable
      assert.ok(totalTime < 500, `Total detection time ${totalTime}ms exceeds reasonable limit`);

      // Animation budget should never exceed constitutional limit
      assert.ok(capabilities.performanceProfile.animationBudget <= 500,
        'Animation budget exceeds constitutional 500ms limit');

      // Detection time should be recorded accurately
      assert.ok(capabilities.detectionTime >= 0, 'Detection time should be positive');
      assert.ok(capabilities.detectionTime < 200, 'Detection time should be under 200ms');
    });

    test('should handle errors gracefully', async () => {
      // Mock an error condition
      const originalIsTTY = process.stdout.isTTY;
      Object.defineProperty(process.stdout, 'isTTY', {
        get() { throw new Error('Mock error'); }
      });

      const capabilities = await detector.detectCapabilities();

      // Should still return valid capabilities with fallback
      assert.strictEqual(capabilities.fallbackRequired, true);
      assert.ok(capabilities.error);

      // Restore
      Object.defineProperty(process.stdout, 'isTTY', {
        value: originalIsTTY
      });
    });
  });
});

// Run constitutional compliance verification
describe('Constitutional Compliance Verification', () => {
  test('all detection methods must complete within constitutional limits', async () => {
    const detector = new TerminalDetector();

    const startTime = performance.now();
    await detector.detectCapabilities();
    const endTime = performance.now();

    const totalTime = endTime - startTime;

    // Verify constitutional 100ms detection limit (with some tolerance for test environment)
    assert.ok(totalTime < 300,
      `Constitutional violation: Detection took ${totalTime}ms, should be well under 300ms in test environment`);
  });
});