/**
 * Unit tests for GitHub Labels Module
 * Tests: T021
 */

import { describe, it, before } from 'node:test';
import { strict as assert } from 'node:assert';

describe('GitHub Labels Module', () => {
  let DEFAULT_LABELS, getLabelsForTask, formatLabelsForCli;

  before(async () => {
    const module = await import('../../../src/github/labels.js');
    DEFAULT_LABELS = module.DEFAULT_LABELS;
    getLabelsForTask = module.getLabelsForTask;
    formatLabelsForCli = module.formatLabelsForCli;
  });

  describe('DEFAULT_LABELS', () => {
    it('should have spec-kit base label', () => {
      const specKitLabel = DEFAULT_LABELS.find(l => l.name === 'spec-kit');
      assert.ok(specKitLabel, 'Should have spec-kit label');
      assert.strictEqual(specKitLabel.color, '8B5CF6');
    });

    it('should have priority labels', () => {
      const priorities = DEFAULT_LABELS.filter(l => l.name.startsWith('priority:'));
      assert.strictEqual(priorities.length, 3, 'Should have 3 priority levels');
    });

    it('should have phase labels', () => {
      const phases = DEFAULT_LABELS.filter(l => l.name.startsWith('phase:'));
      assert.ok(phases.length >= 2, 'Should have at least 2 phases');
    });

    it('should have parallel and blocked labels', () => {
      const parallel = DEFAULT_LABELS.find(l => l.name === 'parallel');
      const blocked = DEFAULT_LABELS.find(l => l.name === 'blocked');
      assert.ok(parallel, 'Should have parallel label');
      assert.ok(blocked, 'Should have blocked label');
    });

    it('should have valid hex colors (without #)', () => {
      for (const label of DEFAULT_LABELS) {
        assert.match(label.color, /^[0-9A-Fa-f]{6}$/, `${label.name} should have valid hex color`);
      }
    });
  });

  describe('getLabelsForTask', () => {
    it('should always include spec-kit label', () => {
      const task = { id: 'T001', description: 'Test' };
      const labels = getLabelsForTask(task);
      assert.ok(labels.includes('spec-kit'));
    });

    it('should add priority:p1 for US1-2', () => {
      const task = { id: 'T001', story: 'US1' };
      const labels = getLabelsForTask(task);
      assert.ok(labels.includes('priority:p1'));
    });

    it('should add priority:p1 for US2', () => {
      const task = { id: 'T001', story: 'US2' };
      const labels = getLabelsForTask(task);
      assert.ok(labels.includes('priority:p1'));
    });

    it('should add priority:p2 for US3-4', () => {
      const task = { id: 'T001', story: 'US3' };
      const labels = getLabelsForTask(task);
      assert.ok(labels.includes('priority:p2'));
    });

    it('should add priority:p3 for US5+', () => {
      const task = { id: 'T001', story: 'US5' };
      const labels = getLabelsForTask(task);
      assert.ok(labels.includes('priority:p3'));
    });

    it('should add phase:setup for setup phase', () => {
      const task = { id: 'T001', phase: 'Setup and Configuration' };
      const labels = getLabelsForTask(task);
      assert.ok(labels.includes('phase:setup'));
    });

    it('should add phase:foundation for foundation phase', () => {
      const task = { id: 'T001', phase: 'Foundational Work' };
      const labels = getLabelsForTask(task);
      assert.ok(labels.includes('phase:foundation'));
    });

    it('should add phase:polish for polish phase', () => {
      const task = { id: 'T001', phase: 'Polish and Cleanup' };
      const labels = getLabelsForTask(task);
      assert.ok(labels.includes('phase:polish'));
    });

    it('should add parallel label when task is parallel', () => {
      const task = { id: 'T001', parallel: true };
      const labels = getLabelsForTask(task);
      assert.ok(labels.includes('parallel'));
    });

    it('should not add parallel label when task is not parallel', () => {
      const task = { id: 'T001', parallel: false };
      const labels = getLabelsForTask(task);
      assert.ok(!labels.includes('parallel'));
    });

    it('should add blocked label when task has dependencies', () => {
      const task = { id: 'T001', dependencies: ['T000'] };
      const labels = getLabelsForTask(task);
      assert.ok(labels.includes('blocked'));
    });

    it('should not add blocked label when no dependencies', () => {
      const task = { id: 'T001', dependencies: [] };
      const labels = getLabelsForTask(task);
      assert.ok(!labels.includes('blocked'));
    });

    it('should handle complex task with multiple labels', () => {
      const task = {
        id: 'T001',
        story: 'US1',
        phase: 'Setup Phase',
        parallel: true,
        dependencies: ['T000']
      };
      const labels = getLabelsForTask(task);

      assert.ok(labels.includes('spec-kit'));
      assert.ok(labels.includes('priority:p1'));
      assert.ok(labels.includes('phase:setup'));
      assert.ok(labels.includes('parallel'));
      assert.ok(labels.includes('blocked'));
    });
  });

  describe('formatLabelsForCli', () => {
    it('should format single label', () => {
      const result = formatLabelsForCli(['spec-kit']);
      assert.strictEqual(result, '--label "spec-kit"');
    });

    it('should format multiple labels', () => {
      const result = formatLabelsForCli(['spec-kit', 'priority:p1', 'parallel']);
      assert.strictEqual(result, '--label "spec-kit" --label "priority:p1" --label "parallel"');
    });

    it('should handle empty array', () => {
      const result = formatLabelsForCli([]);
      assert.strictEqual(result, '');
    });
  });
});
