/**
 * Smoke test to verify the test runner is working correctly
 * This is the first test - if this passes, the test infrastructure is working
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';

describe('Smoke Tests', () => {
  describe('Test Infrastructure', () => {
    it('should run a basic test', () => {
      assert.strictEqual(1 + 1, 2);
    });

    it('should handle async tests', async () => {
      const result = await Promise.resolve('hello');
      assert.strictEqual(result, 'hello');
    });

    it('should support assertions', () => {
      assert.ok(true, 'true should be truthy');
      assert.strictEqual('hello', 'hello');
      assert.deepStrictEqual({ a: 1 }, { a: 1 });
    });
  });

  describe('ES Module Support', () => {
    it('should import node:test correctly', () => {
      assert.ok(describe, 'describe should be defined');
      assert.ok(it, 'it should be defined');
    });

    it('should import node:assert correctly', () => {
      assert.ok(assert, 'assert should be defined');
      assert.ok(assert.strictEqual, 'assert.strictEqual should be defined');
    });
  });

  describe('Project Structure', () => {
    it('should be able to import test utilities', async () => {
      const { TESTS_DIR, FIXTURES_DIR } = await import('../helpers/test-utils.js');
      assert.ok(TESTS_DIR, 'TESTS_DIR should be defined');
      assert.ok(FIXTURES_DIR, 'FIXTURES_DIR should be defined');
    });

    it('should be able to import mock helpers', async () => {
      const { createMockExec } = await import('../helpers/mock-exec.js');
      assert.ok(createMockExec, 'createMockExec should be defined');
      assert.strictEqual(typeof createMockExec, 'function');
    });
  });
});
