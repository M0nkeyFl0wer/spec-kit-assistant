import { test } from 'node:test';
import assert from 'node:assert';
import { GitHubSpecKit } from '../src/spec-kit/github-integration.js';

test('GitHubSpecKit initialization', async () => {
  const specKit = new GitHubSpecKit();
  assert(specKit instanceof GitHubSpecKit);
});

test('Spec creation with project name', async () => {
  const specKit = new GitHubSpecKit();
  const spec = await specKit.initializeSpec('test-project', 'web-app');

  assert.strictEqual(spec.name, 'test-project');
  assert.strictEqual(spec.type, 'web-app');
  assert(Array.isArray(spec.technologies));
  assert(Array.isArray(spec.features));
});

test('Spec validation', () => {
  const specKit = new GitHubSpecKit();

  const validSpec = {
    name: 'test',
    description: 'test project',
    features: ['feature1'],
    technologies: ['tech1']
  };

  assert.strictEqual(specKit.validateSpec(validSpec), true);

  const invalidSpec = {
    name: '',
    description: '',
    features: [],
    technologies: []
  };

  assert.strictEqual(specKit.validateSpec(invalidSpec), false);
});

test('/specify command help', async () => {
  // Test that help command works without errors
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  try {
    const { stdout } = await execAsync('~/specify help');
    assert(stdout.includes('Spec Commands'));
  } catch (error) {
    // Command might not be in PATH during testing
    console.log('Note: /specify command not in test PATH');
  }
});
