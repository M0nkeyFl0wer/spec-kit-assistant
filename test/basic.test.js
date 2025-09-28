import { test } from 'node:test';
import assert from 'node:assert';

test('Basic functionality test', () => {
  assert.strictEqual(1 + 1, 2, 'Math works');
});

test('Environment validation', () => {
  assert(typeof process !== 'undefined', 'Node.js environment available');
  assert(typeof console !== 'undefined', 'Console available');
});
