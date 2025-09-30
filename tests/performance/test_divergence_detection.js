/**
 * Performance Test: Context Divergence Detection (T039)
 * Target: < 100ms (FR-003)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import ContextState from '../../src/context/context-state.js';

describe('Divergence Detection Performance', () => {
  it('should detect divergence within 100ms', async () => {
    const contextState = new ContextState();

    const times = [];
    for (let i = 0; i < 10; i++) {
      const start = Date.now();

      await contextState.checkAlignment({
        specKitVersion: '1.0.0',
        claudeVersion: '1.1.0'
      });

      const duration = Date.now() - start;
      times.push(duration);
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const max = Math.max(...times);

    console.log(`Average: ${avg.toFixed(2)}ms, Max: ${max}ms`);
    assert.ok(avg < 100, `Average detection time ${avg.toFixed(2)}ms should be < 100ms`);
    assert.ok(max < 100, `Max detection time ${max}ms should be < 100ms`);
  });
});