/**
 * Unit tests for Ralph Generate Agent Module
 */

import { describe, it, before } from 'node:test';
import { strict as assert } from 'node:assert';

describe('Ralph Generate Agent Module', () => {
  let generateAgentContent, detectPackageManager;

  before(async () => {
    const module = await import('../../../src/ralph/generate-agent.js');
    generateAgentContent = module.generateAgentContent;
    detectPackageManager = module.detectPackageManager;
  });

  describe('generateAgentContent', () => {
    it('should generate basic agent content', () => {
      const commands = {
        build: [],
        test: [],
        lint: [],
        dev: [],
        packageManager: 'npm'
      };

      const result = generateAgentContent(commands, { featureName: 'Test Feature' });

      assert.ok(result.includes('# Agent Instructions: Test Feature'));
      assert.ok(result.includes('npm install'));
      assert.ok(result.includes('## Verification Workflow'));
      assert.ok(result.includes('## Completion Criteria'));
    });

    it('should include test commands when present', () => {
      const commands = {
        build: [],
        test: ['npm test', 'npm run test:unit'],
        lint: [],
        dev: [],
        packageManager: 'npm'
      };

      const result = generateAgentContent(commands);

      assert.ok(result.includes('## Test Commands'));
      assert.ok(result.includes('npm test'));
      assert.ok(result.includes('npm run test:unit'));
      assert.ok(result.includes('- [ ] All tests pass'));
    });

    it('should include build commands when present', () => {
      const commands = {
        build: ['npm run build'],
        test: [],
        lint: [],
        dev: [],
        packageManager: 'npm'
      };

      const result = generateAgentContent(commands);

      assert.ok(result.includes('## Build Commands'));
      assert.ok(result.includes('npm run build'));
      assert.ok(result.includes('- [ ] Build succeeds without errors'));
    });

    it('should include lint commands when present', () => {
      const commands = {
        build: [],
        test: [],
        lint: ['npm run lint'],
        dev: [],
        packageManager: 'npm'
      };

      const result = generateAgentContent(commands);

      assert.ok(result.includes('## Lint Commands'));
      assert.ok(result.includes('npm run lint'));
    });

    it('should use correct package manager', () => {
      const commands = {
        build: [],
        test: [],
        lint: [],
        dev: [],
        packageManager: 'pnpm'
      };

      const result = generateAgentContent(commands);

      assert.ok(result.includes('pnpm install'));
    });

    it('should include git workflow section', () => {
      const commands = {
        build: [],
        test: [],
        lint: [],
        dev: [],
        packageManager: 'npm'
      };

      const result = generateAgentContent(commands);

      assert.ok(result.includes('## Git Workflow'));
      assert.ok(result.includes('git add -A'));
      assert.ok(result.includes('git commit'));
    });

    it('should adjust verification workflow based on available commands', () => {
      const commandsWithBuild = {
        build: ['npm run build'],
        test: ['npm test'],
        lint: [],
        dev: [],
        packageManager: 'npm'
      };

      const result = generateAgentContent(commandsWithBuild);

      // Should have numbered steps that include build
      assert.ok(result.includes('Run tests'));
      assert.ok(result.includes('Run build'));
    });
  });

  describe('detectPackageManager', () => {
    it('should default to npm when no lock file found', async () => {
      // Test with a directory that doesn't have any lock files
      const result = await detectPackageManager('/tmp');
      assert.strictEqual(result, 'npm');
    });
  });
});
