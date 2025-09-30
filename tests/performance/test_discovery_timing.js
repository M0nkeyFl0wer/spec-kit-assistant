/**
 * Performance Test: Discovery Protocol (T041)
 * Target: <= 900s (15 minutes) (NFR-003)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import DiscoveryTimer from '../../src/context/discovery-timer.js';

describe('Discovery Protocol Performance', () => {
  it('should complete discovery within 900 seconds', async () => {
    const timer = new DiscoveryTimer();

    const start = Date.now();

    await timer.startDiscovery();

    // Simulate quick discovery (fast-forward through phases)
    for (let i = 0; i < 4; i++) {
      await timer.advancePhase();
    }

    const result = await timer.completeDiscovery();

    const duration = Date.now() - start;

    console.log(`Discovery completed in ${result.totalTimeSeconds}s (${duration}ms actual)`);
    assert.ok(result.totalTimeSeconds <= 900, `Discovery should be <= 900s, was ${result.totalTimeSeconds}s`);
    assert.ok(result.withinBudget, 'Discovery should be within budget');
  });
});