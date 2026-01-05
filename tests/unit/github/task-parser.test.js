/**
 * Unit tests for Task Parser Module
 * Tests: T022
 */

import { describe, it, before } from 'node:test';
import { strict as assert } from 'node:assert';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.join(__dirname, '../../fixtures/tasks');

describe('Task Parser Module', () => {
  let parseTaskLine, parseTasksContent, parseTasksFile, hashTaskContent, updateTaskLineWithIssue;

  // Load the module before tests
  before(async () => {
    const module = await import('../../../src/github/task-parser.js');
    parseTaskLine = module.parseTaskLine;
    parseTasksContent = module.parseTasksContent;
    parseTasksFile = module.parseTasksFile;
    hashTaskContent = module.hashTaskContent;
    updateTaskLineWithIssue = module.updateTaskLineWithIssue;
  });

  describe('parseTaskLine', () => {
    it('should parse a basic pending task', () => {
      const line = '- [ ] T001 Create the initial setup';
      const task = parseTaskLine(line, 1, 'Setup');

      assert.strictEqual(task.id, 'T001');
      assert.strictEqual(task.status, 'pending');
      assert.strictEqual(task.phase, 'Setup');
      assert.strictEqual(task.parallel, false);
      assert.ok(task.description.includes('Create the initial setup'));
    });

    it('should parse a completed task', () => {
      const line = '- [x] T002 Completed task';
      const task = parseTaskLine(line, 2, 'Done');

      assert.strictEqual(task.id, 'T002');
      assert.strictEqual(task.status, 'complete');
    });

    it('should parse task with uppercase X', () => {
      const line = '- [X] T003 Also completed';
      const task = parseTaskLine(line, 3, '');

      assert.strictEqual(task.status, 'complete');
    });

    it('should parse parallel marker [P]', () => {
      const line = '- [ ] T004 [P] Parallel task';
      const task = parseTaskLine(line, 4, '');

      assert.strictEqual(task.parallel, true);
    });

    it('should parse user story label [US1]', () => {
      const line = '- [ ] T005 [US1] User story task';
      const task = parseTaskLine(line, 5, '');

      assert.strictEqual(task.story, 'US1');
    });

    it('should parse issue number [#42]', () => {
      const line = '- [ ] T006 Some task [#42]';
      const task = parseTaskLine(line, 6, '');

      assert.strictEqual(task.issueNumber, 42);
    });

    it('should parse dependencies (depends: T001)', () => {
      const line = '- [ ] T007 Dependent task (depends: T001)';
      const task = parseTaskLine(line, 7, '');

      assert.deepStrictEqual(task.dependencies, ['T001']);
    });

    it('should parse multiple dependencies', () => {
      const line = '- [ ] T008 Task (depends: T001, T002, T003)';
      const task = parseTaskLine(line, 8, '');

      assert.deepStrictEqual(task.dependencies, ['T001', 'T002', 'T003']);
    });

    it('should parse file path in description', () => {
      const line = '- [ ] T009 Create file at src/utils/helper.js';
      const task = parseTaskLine(line, 9, '');

      assert.strictEqual(task.filePath, 'src/utils/helper.js');
    });

    it('should parse complex task with all markers', () => {
      const line = '- [ ] T010 [P] [US2] Create tests in tests/unit/test.js (depends: T001) [#99]';
      const task = parseTaskLine(line, 10, 'Testing');

      assert.strictEqual(task.id, 'T010');
      assert.strictEqual(task.parallel, true);
      assert.strictEqual(task.story, 'US2');
      assert.strictEqual(task.issueNumber, 99);
      assert.deepStrictEqual(task.dependencies, ['T001']);
      assert.strictEqual(task.filePath, 'tests/unit/test.js');
      assert.strictEqual(task.phase, 'Testing');
    });

    it('should return null for non-task lines', () => {
      assert.strictEqual(parseTaskLine('# Header', 1, ''), null);
      assert.strictEqual(parseTaskLine('Regular text', 2, ''), null);
      assert.strictEqual(parseTaskLine('', 3, ''), null);
    });

    it('should return null for checkbox without task ID', () => {
      const line = '- [ ] Some item without task ID';
      assert.strictEqual(parseTaskLine(line, 1, ''), null);
    });
  });

  describe('parseTasksContent', () => {
    it('should parse multiple tasks', () => {
      const content = `# Tasks: Test Feature

## Phase 1: Setup

- [ ] T001 First task
- [x] T002 Second task
- [ ] T003 [P] Third task

## Phase 2: Implementation

- [ ] T004 Fourth task
`;

      const result = parseTasksContent(content);

      assert.strictEqual(result.tasks.length, 4);
      assert.deepStrictEqual(result.phases, ['Setup', 'Implementation']);
      assert.strictEqual(result.metadata.featureName, 'Test Feature');
      assert.strictEqual(result.metadata.totalTasks, 4);
      assert.strictEqual(result.metadata.completedTasks, 1);
      assert.strictEqual(result.metadata.pendingTasks, 3);
    });

    it('should generate warnings for malformed task lines', () => {
      const content = `# Tasks: Test

- [ ] T001 Valid task
- [ ] No task ID here
- [x] Also no ID
`;

      const result = parseTasksContent(content);

      assert.strictEqual(result.tasks.length, 1);
      assert.ok(result.warnings.length >= 2);
    });

    it('should handle empty content', () => {
      const result = parseTasksContent('');

      assert.strictEqual(result.tasks.length, 0);
      assert.strictEqual(result.phases.length, 0);
      assert.strictEqual(result.metadata.featureName, 'Unknown Feature');
    });

    it('should track line numbers correctly', () => {
      const content = `# Tasks: Test

## Phase 1: Setup

- [ ] T001 First task
- [ ] T002 Second task
`;

      const result = parseTasksContent(content);

      assert.strictEqual(result.tasks[0].lineNumber, 5);
      assert.strictEqual(result.tasks[1].lineNumber, 6);
    });
  });

  describe('parseTasksFile', () => {
    it('should parse sample tasks file', async () => {
      const samplePath = path.join(FIXTURES_DIR, 'sample-tasks.md');
      const result = await parseTasksFile(samplePath);

      assert.ok(result.tasks.length > 0, 'Should have tasks');
      assert.ok(result.metadata.featureName, 'Should have feature name');
    });

    it('should handle malformed tasks file', async () => {
      const malformedPath = path.join(FIXTURES_DIR, 'malformed-tasks.md');
      const result = await parseTasksFile(malformedPath);

      assert.ok(result.warnings.length > 0, 'Should have warnings');
    });
  });

  describe('hashTaskContent', () => {
    it('should generate consistent hash for same content', () => {
      const task1 = { id: 'T001', description: 'Test', status: 'pending', story: 'US1' };
      const task2 = { id: 'T001', description: 'Test', status: 'pending', story: 'US1' };

      assert.strictEqual(hashTaskContent(task1), hashTaskContent(task2));
    });

    it('should generate different hash for different content', () => {
      const task1 = { id: 'T001', description: 'Test', status: 'pending', story: 'US1' };
      const task2 = { id: 'T001', description: 'Different', status: 'pending', story: 'US1' };

      assert.notStrictEqual(hashTaskContent(task1), hashTaskContent(task2));
    });

    it('should detect status changes', () => {
      const task1 = { id: 'T001', description: 'Test', status: 'pending', story: null };
      const task2 = { id: 'T001', description: 'Test', status: 'complete', story: null };

      assert.notStrictEqual(hashTaskContent(task1), hashTaskContent(task2));
    });
  });

  describe('updateTaskLineWithIssue', () => {
    it('should add issue number to task line', () => {
      const line = '- [ ] T001 Some task';
      const updated = updateTaskLineWithIssue(line, 42);

      assert.strictEqual(updated, '- [ ] T001 Some task [#42]');
    });

    it('should replace existing issue number', () => {
      const line = '- [ ] T001 Some task [#10]';
      const updated = updateTaskLineWithIssue(line, 42);

      assert.strictEqual(updated, '- [ ] T001 Some task [#42]');
    });

    it('should preserve other markers', () => {
      const line = '- [ ] T001 [P] [US1] Task (depends: T000)';
      const updated = updateTaskLineWithIssue(line, 42);

      assert.ok(updated.includes('[P]'));
      assert.ok(updated.includes('[US1]'));
      assert.ok(updated.includes('(depends: T000)'));
      assert.ok(updated.includes('[#42]'));
    });
  });
});
