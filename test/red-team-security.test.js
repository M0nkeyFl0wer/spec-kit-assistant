
// RED TEAM SECURITY AUDIT TESTS
import { test } from 'node:test';
import assert from 'node:assert';

test('File system security - directory traversal prevention', async () => {
  const { GitHubSpecKit } = await import('../src/spec-kit/github-integration.js');
  const specKit = new GitHubSpecKit();

  // Test for directory traversal in file operations
  const dangerousPaths = [
    '../../../etc/passwd',
    '/proc/self/environ',
    '\\..\\..\\windows\\system32\\config\\sam'
  ];

  for (const path of dangerousPaths) {
    try {
      await specKit.saveSpec({}, path);
      assert.fail('Should not allow dangerous file paths');
    } catch (error) {
      // Expected - should reject dangerous paths
      assert(error.message.includes('Invalid') || error.code === 'ENOENT');
    }
  }
});

test('Memory exhaustion protection', async () => {
  const { GitHubSpecKit } = await import('../src/spec-kit/github-integration.js');
  const specKit = new GitHubSpecKit();

  // Test with extremely large inputs
  const largeString = 'A'.repeat(10000000); // 10MB string
  const massiveArray = new Array(1000000).fill('test');

  const spec = {
    name: largeString,
    description: largeString,
    features: massiveArray,
    technologies: massiveArray
  };

  try {
    const result = specKit.validateSpec(spec);
    // Should handle large inputs gracefully
    assert(typeof result === 'boolean', 'Should return boolean result');
  } catch (error) {
    // Acceptable if it fails gracefully with proper error
    assert(error.message.includes('too large') || error.name === 'RangeError');
  }
});

test('Race condition testing - concurrent file operations', async (t) => {
  const { GitHubSpecKit } = await import('../src/spec-kit/github-integration.js');

  const promises = [];
  for (let i = 0; i < 10; i++) {
    const specKit = new GitHubSpecKit();
    const spec = await specKit.initializeSpec(`race-test-${i}`, 'web-app');
    promises.push(specKit.saveSpec(spec, `./test-race-${i}.md`));
  }

  // All operations should complete without corruption
  const results = await Promise.allSettled(promises);
  const successful = results.filter(r => r.status === 'fulfilled').length;

  assert(successful >= 8, 'Most concurrent operations should succeed');

  // Cleanup
  const fs = await import('fs');
  for (let i = 0; i < 10; i++) {
    try {
      await fs.promises.unlink(`./test-race-${i}.md`);
    } catch (e) { /* ignore */ }
  }
});
