/**
 * Unit tests for Ralph Parse Tasks Module
 */

import { describe, it, before } from 'node:test';
import { strict as assert } from 'node:assert';

describe('Ralph Parse Tasks Module', () => {
  let parseTaskLine, parsePhaseHeader, parseTasksContent, convertToFixPlan;

  before(async () => {
    const module = await import('../../../src/ralph/parse-tasks.js');
    parseTaskLine = module.parseTaskLine;
    parsePhaseHeader = module.parsePhaseHeader;
    parseTasksContent = module.parseTasksContent;
    convertToFixPlan = module.convertToFixPlan;
  });

  describe('parseTaskLine', () => {
    it('should parse a Spec Kit checkbox task', () => {
      const line = '- [ ] Task 1.1: Create the initial setup';
      const task = parseTaskLine(line, 1, 'Setup');

      assert.strictEqual(task.id, '1.1');
      assert.strictEqual(task.description, 'Create the initial setup');
      assert.strictEqual(task.completed, false);
      assert.strictEqual(task.phase, 'Setup');
    });

    it('should parse a completed task', () => {
      const line = '- [x] Task 2.1: Completed task';
      const task = parseTaskLine(line, 2, 'Done');

      assert.strictEqual(task.id, '2.1');
      assert.strictEqual(task.completed, true);
    });

    it('should parse uppercase X as completed', () => {
      const line = '- [X] Task 1.2: Also completed';
      const task = parseTaskLine(line, 3, '');

      assert.strictEqual(task.completed, true);
    });

    it('should parse simple task format without checkbox', () => {
      const line = '- Task 3.1: Simple task';
      const task = parseTaskLine(line, 4, 'Phase 3');

      assert.strictEqual(task.id, '3.1');
      assert.strictEqual(task.description, 'Simple task');
      assert.strictEqual(task.completed, false);
    });

    it('should return null for non-task lines', () => {
      assert.strictEqual(parseTaskLine('# Header', 1, ''), null);
      assert.strictEqual(parseTaskLine('Regular text', 2, ''), null);
      assert.strictEqual(parseTaskLine('', 3, ''), null);
    });

    it('should return null for checkbox without task format', () => {
      const line = '- [ ] Just a checkbox item';
      const result = parseTaskLine(line, 1, '');
      // This should return null because it doesn't match Task X.Y pattern
      assert.strictEqual(result, null);
    });

    it('should track line numbers', () => {
      const line = '- [ ] Task 5.5: Line test';
      const task = parseTaskLine(line, 42, '');

      assert.strictEqual(task.lineNumber, 42);
    });
  });

  describe('parsePhaseHeader', () => {
    it('should parse Phase X: format', () => {
      const result = parsePhaseHeader('## Phase 1: Setup');
      assert.strictEqual(result, 'Setup');
    });

    it('should parse Phase X - format', () => {
      const result = parsePhaseHeader('## Phase 2 - Implementation');
      assert.strictEqual(result, 'Implementation');
    });

    it('should parse generic headers', () => {
      const result = parsePhaseHeader('## Custom Section');
      assert.strictEqual(result, 'Custom Section');
    });

    it('should return null for non-headers', () => {
      assert.strictEqual(parsePhaseHeader('Regular text'), null);
      assert.strictEqual(parsePhaseHeader('# Title'), null);
    });
  });

  describe('parseTasksContent', () => {
    it('should parse multiple tasks with phases', () => {
      const content = `# Tasks: Test Feature

## Phase 1: Setup

- [ ] Task 1.1: First task
- [x] Task 1.2: Second task

## Phase 2: Implementation

- [ ] Task 2.1: Third task
`;

      const result = parseTasksContent(content);

      assert.strictEqual(result.tasks.length, 3);
      assert.deepStrictEqual(result.phases, ['Setup', 'Implementation']);
      assert.strictEqual(result.featureName, 'Test Feature');
    });

    it('should handle content without phases', () => {
      const content = `# Feature Name

- [ ] Task 1.1: First task
- [ ] Task 1.2: Second task
`;

      const result = parseTasksContent(content);

      assert.strictEqual(result.tasks.length, 2);
      assert.strictEqual(result.phases.length, 0);
    });

    it('should handle empty content', () => {
      const result = parseTasksContent('');

      assert.strictEqual(result.tasks.length, 0);
      assert.strictEqual(result.phases.length, 0);
      assert.strictEqual(result.featureName, 'Unknown Feature');
    });

    it('should assign correct phases to tasks', () => {
      const content = `# Test

## Phase 1: First

- [ ] Task 1.1: Task in first

## Phase 2: Second

- [ ] Task 2.1: Task in second
`;

      const result = parseTasksContent(content);

      assert.strictEqual(result.tasks[0].phase, 'First');
      assert.strictEqual(result.tasks[1].phase, 'Second');
    });
  });

  describe('convertToFixPlan', () => {
    it('should convert parsed tasks to fix_plan format', () => {
      const parsed = {
        tasks: [
          { id: '1.1', description: 'First task', completed: false, phase: 'Setup' },
          { id: '1.2', description: 'Second task', completed: true, phase: 'Setup' }
        ],
        phases: ['Setup'],
        featureName: 'Test Feature'
      };

      const result = convertToFixPlan(parsed);

      assert.ok(result.includes('# Test Feature'));
      assert.ok(result.includes('## Setup'));
      assert.ok(result.includes('- [ ] Task 1.1: First task'));
      assert.ok(result.includes('- [x] Task 1.2: Second task'));
    });

    it('should handle tasks without phases', () => {
      const parsed = {
        tasks: [
          { id: '1.1', description: 'Orphan task', completed: false, phase: '' }
        ],
        phases: [],
        featureName: 'No Phases'
      };

      const result = convertToFixPlan(parsed);

      assert.ok(result.includes('# No Phases'));
      assert.ok(result.includes('- [ ] Task 1.1: Orphan task'));
    });

    it('should separate phases with blank lines', () => {
      const parsed = {
        tasks: [
          { id: '1.1', description: 'Task 1', completed: false, phase: 'First' },
          { id: '2.1', description: 'Task 2', completed: false, phase: 'Second' }
        ],
        phases: ['First', 'Second'],
        featureName: 'Multi Phase'
      };

      const result = convertToFixPlan(parsed);
      const lines = result.split('\n');

      // Find the line after "## Second" should be preceded by a blank line
      const secondIndex = lines.findIndex(l => l.includes('## Second'));
      assert.ok(secondIndex > 0);
      assert.strictEqual(lines[secondIndex - 1], '');
    });
  });
});
