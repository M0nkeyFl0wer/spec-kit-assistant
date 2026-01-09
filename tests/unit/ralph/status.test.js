/**
 * Unit tests for Ralph Status Module
 */

import { describe, it, before } from 'node:test';
import { strict as assert } from 'node:assert';

describe('Ralph Status Module', () => {
  let parseFixPlan;

  before(async () => {
    const module = await import('../../../src/ralph/status.js');
    parseFixPlan = module.parseFixPlan;
  });

  describe('parseFixPlan', () => {
    it('should parse basic fix_plan content', () => {
      const content = `# Test Feature

## Setup

- [ ] Task 1: First task
- [x] Task 2: Second task

## Implementation

- [ ] Task 3: Third task
`;

      const result = parseFixPlan(content);

      assert.strictEqual(result.total, 3);
      assert.strictEqual(result.completed, 1);
      assert.strictEqual(result.pending, 2);
      assert.strictEqual(result.percentComplete, 33);
    });

    it('should handle all completed tasks', () => {
      const content = `# Feature

- [x] Task 1
- [x] Task 2
`;

      const result = parseFixPlan(content);

      assert.strictEqual(result.total, 2);
      assert.strictEqual(result.completed, 2);
      assert.strictEqual(result.pending, 0);
      assert.strictEqual(result.percentComplete, 100);
    });

    it('should handle empty content', () => {
      const result = parseFixPlan('');

      assert.strictEqual(result.total, 0);
      assert.strictEqual(result.completed, 0);
      assert.strictEqual(result.percentComplete, 0);
    });

    it('should track phases', () => {
      const content = `# Feature

## Phase One

- [ ] Task 1

## Phase Two

- [ ] Task 2
`;

      const result = parseFixPlan(content);

      assert.deepStrictEqual(result.phases, ['Phase One', 'Phase Two']);
    });

    it('should extract task descriptions', () => {
      const content = `# Feature

- [ ] First task description
- [x] Second task description
`;

      const result = parseFixPlan(content);

      assert.strictEqual(result.tasks[0].description, 'First task description');
      assert.strictEqual(result.tasks[1].description, 'Second task description');
    });

    it('should track line numbers', () => {
      const content = `# Feature

- [ ] Task 1
- [ ] Task 2
`;

      const result = parseFixPlan(content);

      assert.strictEqual(result.tasks[0].lineNumber, 3);
      assert.strictEqual(result.tasks[1].lineNumber, 4);
    });

    it('should handle uppercase X', () => {
      const content = `# Feature

- [X] Completed with uppercase
`;

      const result = parseFixPlan(content);

      assert.strictEqual(result.tasks[0].completed, true);
    });

    it('should assign phases to tasks', () => {
      const content = `# Feature

## Setup Phase

- [ ] Setup task

## Build Phase

- [ ] Build task
`;

      const result = parseFixPlan(content);

      assert.strictEqual(result.tasks[0].phase, 'Setup Phase');
      assert.strictEqual(result.tasks[1].phase, 'Build Phase');
    });

    it('should calculate percentage correctly', () => {
      const content = `# Feature

- [x] Task 1
- [x] Task 2
- [ ] Task 3
- [ ] Task 4
`;

      const result = parseFixPlan(content);

      assert.strictEqual(result.percentComplete, 50);
    });

    it('should ignore non-checkbox lines', () => {
      const content = `# Feature

Some description text.

- [ ] Real task

More text here.
`;

      const result = parseFixPlan(content);

      assert.strictEqual(result.total, 1);
    });
  });
});
