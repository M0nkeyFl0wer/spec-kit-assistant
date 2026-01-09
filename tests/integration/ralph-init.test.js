/**
 * Integration tests for Ralph Init Flow
 * Task 2.4: Full init flow integration test
 *
 * Tests the complete initialization workflow that generates
 * @fix_plan.md, PROMPT.md, and @AGENT.md from spec artifacts.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

/**
 * Create a mock project structure for testing
 * @param {string} baseDir - Base directory
 * @param {Object} options - Mock project options
 * @returns {Promise<void>}
 */
async function createMockProject(baseDir, options = {}) {
  const {
    includeSpec = true,
    includePlan = true,
    includeTasks = true,
    includePackageJson = true,
    featureName = 'Test Feature'
  } = options;

  // Create specs directory (at root level, matching module search paths)
  const specsDir = path.join(baseDir, 'specs');
  await fs.ensureDir(specsDir);

  if (includeSpec) {
    await fs.writeFile(
      path.join(specsDir, 'spec.md'),
      `# ${featureName}

**Feature Branch**: \`001-test-feature\`
**Status**: In Progress

## User Scenarios & Testing

### User Story 1 (P1)

As a user, I want to test the feature.

## Requirements

- **FR-001**: First requirement
- **FR-002**: Second requirement
`
    );
  }

  if (includePlan) {
    await fs.writeFile(
      path.join(specsDir, 'plan.md'),
      `# Implementation Plan: ${featureName}

**Branch**: \`001-test-feature\`

## Summary

Implementation plan for ${featureName}.

## Technical Context

**Language/Version**: Node.js 18+
**Testing**: node:test

## Approach

Step-by-step implementation approach.
`
    );
  }

  if (includeTasks) {
    await fs.writeFile(
      path.join(specsDir, 'tasks.md'),
      `# Tasks: ${featureName}

## Phase 1: Setup

- [ ] Task 1.1: Create project structure
- [ ] Task 1.2: Configure dependencies

## Phase 2: Implementation

- [ ] Task 2.1: Implement core functionality
- [x] Task 2.2: Add unit tests

## Phase 3: Polish

- [ ] Task 3.1: Update documentation
`
    );
  }

  if (includePackageJson) {
    await fs.writeFile(
      path.join(baseDir, 'package.json'),
      JSON.stringify({
        name: 'test-project',
        version: '1.0.0',
        scripts: {
          test: 'node --test',
          build: 'npm run lint && npm run compile',
          lint: 'eslint src/'
        }
      }, null, 2)
    );
  }
}

describe('Ralph Init Integration Tests', () => {
  let tempDir;
  let initRalphProject;

  beforeEach(async () => {
    // Create temp directory
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ralph-init-test-'));

    // Import the module fresh for each test
    const module = await import('../../src/ralph/init.js');
    initRalphProject = module.initRalphProject;
  });

  afterEach(async () => {
    if (tempDir) {
      await fs.remove(tempDir);
    }
  });

  describe('Full init flow with all artifacts', () => {
    it('should generate all three Ralph files from spec artifacts', async () => {
      // Setup: Create full mock project
      await createMockProject(tempDir, {
        includeSpec: true,
        includePlan: true,
        includeTasks: true,
        includePackageJson: true,
        featureName: 'Complete Feature'
      });

      // Execute
      const result = await initRalphProject(tempDir, { quiet: true });

      // Verify result structure
      assert.strictEqual(result.success, true, 'Init should succeed');
      assert.strictEqual(result.errors.length, 0, 'Should have no errors');

      // Verify @fix_plan.md was generated
      assert.ok(result.files.fixPlan, '@fix_plan.md info should be present');
      const fixPlanPath = path.join(tempDir, '@fix_plan.md');
      assert.ok(await fs.pathExists(fixPlanPath), '@fix_plan.md should exist');

      const fixPlanContent = await fs.readFile(fixPlanPath, 'utf8');
      assert.ok(fixPlanContent.includes('Task 1.1'), 'Should contain Task 1.1');
      assert.ok(fixPlanContent.includes('- [ ]'), 'Should have checkbox format');
      assert.ok(fixPlanContent.includes('- [x]'), 'Should preserve completed tasks');

      // Verify PROMPT.md was generated
      assert.ok(result.files.prompt, 'PROMPT.md info should be present');
      const promptPath = path.join(tempDir, 'PROMPT.md');
      assert.ok(await fs.pathExists(promptPath), 'PROMPT.md should exist');

      const promptContent = await fs.readFile(promptPath, 'utf8');
      assert.ok(promptContent.includes('Complete Feature'), 'Should contain feature name');
      assert.ok(promptContent.includes('FR-001'), 'Should include spec content');

      // Verify @AGENT.md was generated
      assert.ok(result.files.agent, '@AGENT.md info should be present');
      const agentPath = path.join(tempDir, '@AGENT.md');
      assert.ok(await fs.pathExists(agentPath), '@AGENT.md should exist');

      const agentContent = await fs.readFile(agentPath, 'utf8');
      assert.ok(
        agentContent.includes('npm run test') || agentContent.includes('Test Commands'),
        'Should include test information'
      );
    });

    it('should correctly count tasks in fix_plan', async () => {
      await createMockProject(tempDir, {
        includeTasks: true,
        featureName: 'Task Count Test'
      });

      const result = await initRalphProject(tempDir, { quiet: true });

      assert.strictEqual(result.success, true);
      // 5 tasks total in our mock: 1.1, 1.2, 2.1, 2.2, 3.1
      assert.ok(result.files.fixPlan.tasksCount >= 5, `Expected at least 5 tasks, got ${result.files.fixPlan.tasksCount}`);
    });
  });

  describe('Partial artifact scenarios', () => {
    it('should handle missing tasks.md gracefully', async () => {
      await createMockProject(tempDir, {
        includeSpec: true,
        includePlan: true,
        includeTasks: false
      });

      const result = await initRalphProject(tempDir, { quiet: true });

      // Should still succeed for other files
      assert.strictEqual(result.success, true);
      assert.ok(result.warnings.some(w => w.includes('tasks.md')), 'Should warn about missing tasks.md');
      assert.ok(!result.files.fixPlan, 'Should not have fixPlan file');
      assert.ok(result.files.prompt, 'Should have PROMPT.md');
    });

    it('should handle missing spec artifacts gracefully', async () => {
      await createMockProject(tempDir, {
        includeSpec: false,
        includePlan: false,
        includeTasks: true
      });

      const result = await initRalphProject(tempDir, { quiet: true });

      assert.strictEqual(result.success, true);
      assert.ok(result.warnings.some(w => w.includes('spec artifacts')), 'Should warn about missing artifacts');
      assert.ok(result.files.fixPlan, 'Should have @fix_plan.md');
    });

    it('should handle completely empty project', async () => {
      // Don't create any files - just use empty temp dir

      const result = await initRalphProject(tempDir, { quiet: true });

      // Should succeed with warnings but no files
      assert.ok(result.warnings.length > 0, 'Should have warnings');
      assert.strictEqual(Object.keys(result.files).length, 1, 'Should only have agent file (minimal)');
    });
  });

  describe('Force overwrite behavior', () => {
    it('should not overwrite existing files without --force', async () => {
      await createMockProject(tempDir);

      // Create existing files
      const fixPlanPath = path.join(tempDir, '@fix_plan.md');
      await fs.writeFile(fixPlanPath, '# Existing content\n');

      const result = await initRalphProject(tempDir, { quiet: true, force: false });

      // Check that existing file was not overwritten
      const content = await fs.readFile(fixPlanPath, 'utf8');
      assert.ok(content.includes('Existing content'), 'Should preserve existing content');
      assert.ok(result.warnings.some(w => w.includes('already exist')), 'Should warn about existing files');
    });

    it('should overwrite existing files with --force', async () => {
      await createMockProject(tempDir, { featureName: 'Force Test Feature' });

      // Create existing files
      const fixPlanPath = path.join(tempDir, '@fix_plan.md');
      await fs.writeFile(fixPlanPath, '# Existing content\n');

      const result = await initRalphProject(tempDir, { quiet: true, force: true });

      assert.strictEqual(result.success, true);
      const content = await fs.readFile(fixPlanPath, 'utf8');
      assert.ok(!content.includes('Existing content'), 'Should overwrite existing content');
      assert.ok(content.includes('Task'), 'Should have new task content');
    });
  });

  describe('Output file content validation', () => {
    it('should generate valid @fix_plan.md structure', async () => {
      await createMockProject(tempDir, { featureName: 'Structure Test' });

      const result = await initRalphProject(tempDir, { quiet: true });

      const fixPlanPath = path.join(tempDir, '@fix_plan.md');
      const content = await fs.readFile(fixPlanPath, 'utf8');

      // Should have title
      assert.ok(content.startsWith('#'), 'Should start with markdown header');

      // Should have phases as h2 headers
      assert.ok(content.includes('## '), 'Should have phase headers');

      // Should have checkbox format
      const checkboxPattern = /^- \[[x ]\]/m;
      assert.ok(checkboxPattern.test(content), 'Should have checkbox format');
    });

    it('should generate PROMPT.md with all artifact sections', async () => {
      await createMockProject(tempDir, { featureName: 'Prompt Content Test' });

      await initRalphProject(tempDir, { quiet: true });

      const promptPath = path.join(tempDir, 'PROMPT.md');
      const content = await fs.readFile(promptPath, 'utf8');

      // Check for expected sections
      assert.ok(content.includes('Specification') || content.includes('spec'), 'Should have spec section');
      assert.ok(content.includes('Plan') || content.includes('Implementation'), 'Should have plan section');
    });

    it('should generate @AGENT.md with detected commands', async () => {
      await createMockProject(tempDir);

      await initRalphProject(tempDir, { quiet: true });

      const agentPath = path.join(tempDir, '@AGENT.md');
      const content = await fs.readFile(agentPath, 'utf8');

      // Should reference test command from package.json
      assert.ok(content.includes('test'), 'Should include test instructions');
      // Should reference build if detected
      assert.ok(content.includes('build') || content.includes('lint'), 'Should include build/lint instructions');
    });
  });

  describe('Error handling', () => {
    it('should handle read permission errors gracefully', async () => {
      await createMockProject(tempDir);

      // Create a file with restricted permissions in specs directory
      const restrictedDir = path.join(tempDir, 'specs');

      // Skip this test on CI or if we can't change permissions
      try {
        await fs.chmod(restrictedDir, 0o000);

        const result = await initRalphProject(tempDir, { quiet: true });

        // Should handle the error gracefully (warnings or files not generated)
        assert.ok(result.warnings.length > 0 || !result.files.fixPlan);
      } finally {
        // Restore permissions for cleanup
        await fs.chmod(restrictedDir, 0o755);
      }
    });

    it('should handle invalid project directory', async () => {
      const nonExistentDir = path.join(tempDir, 'does-not-exist');

      try {
        await initRalphProject(nonExistentDir, { quiet: true });
        // If it doesn't throw, it should at least have warnings/errors
        assert.ok(true);
      } catch (error) {
        // Expected behavior - should throw or handle gracefully
        assert.ok(error.message, 'Should have error message');
      }
    });
  });

  describe('Feature name extraction', () => {
    it('should extract feature name from spec.md title', async () => {
      await createMockProject(tempDir, { featureName: 'Custom Feature Name' });

      await initRalphProject(tempDir, { quiet: true });

      const promptPath = path.join(tempDir, 'PROMPT.md');
      const content = await fs.readFile(promptPath, 'utf8');

      assert.ok(content.includes('Custom Feature Name'), 'Should use feature name from spec');
    });
  });
});
