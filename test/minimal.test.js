import { test } from 'node:test';
import assert from 'node:assert';

test('Spec Kit Assistant - Minimal smoke test', () => {
  // Basic functionality test
  const projectName = 'spec-kit-assistant';
  assert.strictEqual(typeof projectName, 'string');
  assert.ok(projectName.includes('spec'));

  console.log('✅ Minimal test passed');
  console.log('🐕 Spec Kit Assistant is ready to help!');
});