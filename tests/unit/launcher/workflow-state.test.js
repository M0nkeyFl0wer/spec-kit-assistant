/**
 * Unit tests for Workflow State Module
 * Tests: T040-T045
 */

import { describe, it, before, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('Workflow State Module', () => {
  let workflowModule;
  let tempDir;

  before(async () => {
    workflowModule = await import('../../../src/launcher/workflow-state.js');
  });

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'workflow-test-'));
  });

  afterEach(async () => {
    if (tempDir) {
      await fs.remove(tempDir);
    }
  });

  describe('WorkflowStage constants', () => {
    it('should define all setup stages', () => {
      assert.strictEqual(workflowModule.WorkflowStage.NO_AGENT, 'no_agent');
      assert.strictEqual(workflowModule.WorkflowStage.AGENT_INSTALLED, 'agent_installed');
      assert.strictEqual(workflowModule.WorkflowStage.READY, 'ready');
    });

    it('should define all project stages', () => {
      assert.strictEqual(workflowModule.WorkflowStage.NO_PROJECT, 'no_project');
      assert.strictEqual(workflowModule.WorkflowStage.PROJECT_SELECTED, 'project_selected');
      assert.strictEqual(workflowModule.WorkflowStage.IN_AGENT, 'in_agent');
    });

    it('should define all spec workflow stages', () => {
      assert.strictEqual(workflowModule.WorkflowStage.SPEC_INIT, 'spec_init');
      assert.strictEqual(workflowModule.WorkflowStage.SPEC_CREATED, 'spec_created');
      assert.strictEqual(workflowModule.WorkflowStage.PLAN_CREATED, 'plan_created');
      assert.strictEqual(workflowModule.WorkflowStage.TASKS_CREATED, 'tasks_created');
      assert.strictEqual(workflowModule.WorkflowStage.IMPLEMENTING, 'implementing');
      assert.strictEqual(workflowModule.WorkflowStage.COMPLETE, 'complete');
    });
  });

  describe('NextActions', () => {
    it('should define actions for all stages', () => {
      const { WorkflowStage, NextActions } = workflowModule;

      // Check all stages have actions
      const expectedStages = [
        WorkflowStage.NO_AGENT,
        WorkflowStage.AGENT_INSTALLED,
        WorkflowStage.NO_PROJECT,
        WorkflowStage.PROJECT_SELECTED,
        WorkflowStage.IN_AGENT,
        WorkflowStage.SPEC_INIT,
        WorkflowStage.SPEC_CREATED,
        WorkflowStage.PLAN_CREATED,
        WorkflowStage.TASKS_CREATED,
        WorkflowStage.IMPLEMENTING,
        WorkflowStage.COMPLETE
      ];

      for (const stage of expectedStages) {
        assert.ok(NextActions[stage], `Should have action for ${stage}`);
        assert.ok(NextActions[stage].message, `${stage} should have message`);
        assert.ok(NextActions[stage].action, `${stage} should have action`);
      }
    });

    it('should have appropriate commands for spec workflow stages', () => {
      const { WorkflowStage, NextActions } = workflowModule;

      assert.ok(NextActions[WorkflowStage.SPEC_INIT].command.includes('specify'));
      assert.ok(NextActions[WorkflowStage.SPEC_CREATED].command.includes('plan'));
      assert.ok(NextActions[WorkflowStage.TASKS_CREATED].command.includes('implement'));
    });
  });

  // T040: Test SPEC_INIT stage detection
  describe('analyzeProjectState - SPEC_INIT', () => {
    it('should return SPEC_INIT for empty project', async () => {
      const result = await workflowModule.analyzeProjectState(tempDir);
      assert.strictEqual(result, workflowModule.WorkflowStage.SPEC_INIT);
    });

    it('should return SPEC_INIT when no .speckit or .specify dir', async () => {
      // Create some other files but not spec dirs
      await fs.writeFile(path.join(tempDir, 'README.md'), '# Test');

      const result = await workflowModule.analyzeProjectState(tempDir);
      assert.strictEqual(result, workflowModule.WorkflowStage.SPEC_INIT);
    });
  });

  // T041: Test SPEC_CREATED stage detection
  describe('analyzeProjectState - SPEC_CREATED', () => {
    it('should return SPEC_CREATED when spec.md exists but no plan', async () => {
      const speckitDir = path.join(tempDir, '.speckit');
      await fs.ensureDir(speckitDir);
      await fs.writeFile(path.join(speckitDir, 'spec.md'), '# Spec');

      const result = await workflowModule.analyzeProjectState(tempDir);
      assert.strictEqual(result, workflowModule.WorkflowStage.SPEC_CREATED);
    });

    it('should return SPEC_CREATED when SPEC.md exists at project root', async () => {
      await fs.ensureDir(path.join(tempDir, '.speckit'));
      await fs.writeFile(path.join(tempDir, 'SPEC.md'), '# Specification');

      const result = await workflowModule.analyzeProjectState(tempDir);
      assert.strictEqual(result, workflowModule.WorkflowStage.SPEC_CREATED);
    });
  });

  // T042: Test PLAN_CREATED stage detection
  describe('analyzeProjectState - PLAN_CREATED', () => {
    it('should return PLAN_CREATED when spec and plan exist but no tasks', async () => {
      const speckitDir = path.join(tempDir, '.speckit');
      await fs.ensureDir(speckitDir);
      await fs.writeFile(path.join(speckitDir, 'spec.md'), '# Spec');
      await fs.writeFile(path.join(speckitDir, 'plan.md'), '# Plan');

      const result = await workflowModule.analyzeProjectState(tempDir);
      assert.strictEqual(result, workflowModule.WorkflowStage.PLAN_CREATED);
    });

    it('should return PLAN_CREATED when PLAN.md exists at project root', async () => {
      await fs.ensureDir(path.join(tempDir, '.speckit'));
      await fs.writeFile(path.join(tempDir, 'SPEC.md'), '# Specification');
      await fs.writeFile(path.join(tempDir, 'PLAN.md'), '# Implementation Plan');

      const result = await workflowModule.analyzeProjectState(tempDir);
      assert.strictEqual(result, workflowModule.WorkflowStage.PLAN_CREATED);
    });
  });

  // T043: Test TASKS_CREATED stage detection
  describe('analyzeProjectState - TASKS_CREATED', () => {
    it('should return TASKS_CREATED when spec, plan, and tasks all exist', async () => {
      const speckitDir = path.join(tempDir, '.speckit');
      await fs.ensureDir(speckitDir);
      await fs.writeFile(path.join(speckitDir, 'spec.md'), '# Spec');
      await fs.writeFile(path.join(speckitDir, 'plan.md'), '# Plan');
      await fs.writeFile(path.join(speckitDir, 'tasks.md'), '# Tasks');

      const result = await workflowModule.analyzeProjectState(tempDir);
      assert.strictEqual(result, workflowModule.WorkflowStage.TASKS_CREATED);
    });

    it('should return TASKS_CREATED when TODO.md exists at project root', async () => {
      await fs.ensureDir(path.join(tempDir, '.speckit'));
      await fs.writeFile(path.join(tempDir, 'SPEC.md'), '# Spec');
      await fs.writeFile(path.join(tempDir, 'PLAN.md'), '# Plan');
      await fs.writeFile(path.join(tempDir, 'TODO.md'), '# Tasks');

      const result = await workflowModule.analyzeProjectState(tempDir);
      assert.strictEqual(result, workflowModule.WorkflowStage.TASKS_CREATED);
    });
  });

  // T044: Test IMPLEMENTING stage detection
  describe('analyzeProjectState - IMPLEMENTING', () => {
    it('should return IMPLEMENTING when session indicates implementation phase', async () => {
      const speckitDir = path.join(tempDir, '.speckit');
      await fs.ensureDir(speckitDir);
      await fs.writeFile(path.join(speckitDir, 'spec.md'), '# Spec');
      await fs.writeFile(path.join(speckitDir, 'plan.md'), '# Plan');
      await fs.writeFile(path.join(speckitDir, 'tasks.md'), '# Tasks');
      await fs.writeJson(path.join(speckitDir, 'session.json'), {
        currentPhase: 'implement'
      });

      const result = await workflowModule.analyzeProjectState(tempDir);
      assert.strictEqual(result, workflowModule.WorkflowStage.IMPLEMENTING);
    });
  });

  // T045: Test COMPLETE stage detection
  describe('analyzeProjectState - COMPLETE', () => {
    it('should return COMPLETE when session indicates complete phase', async () => {
      const speckitDir = path.join(tempDir, '.speckit');
      await fs.ensureDir(speckitDir);
      await fs.writeFile(path.join(speckitDir, 'spec.md'), '# Spec');
      await fs.writeFile(path.join(speckitDir, 'plan.md'), '# Plan');
      await fs.writeFile(path.join(speckitDir, 'tasks.md'), '# Tasks');
      await fs.writeJson(path.join(speckitDir, 'session.json'), {
        currentPhase: 'complete'
      });

      const result = await workflowModule.analyzeProjectState(tempDir);
      assert.strictEqual(result, workflowModule.WorkflowStage.COMPLETE);
    });
  });

  describe('analyzeProjectState - .specify directory', () => {
    it('should work with .specify directory instead of .speckit', async () => {
      const specifyDir = path.join(tempDir, '.specify');
      await fs.ensureDir(specifyDir);
      await fs.writeFile(path.join(specifyDir, 'spec.md'), '# Spec');
      await fs.writeFile(path.join(specifyDir, 'plan.md'), '# Plan');

      const result = await workflowModule.analyzeProjectState(tempDir);
      assert.strictEqual(result, workflowModule.WorkflowStage.PLAN_CREATED);
    });
  });

  describe('analyzeWorkflowState', () => {
    it('should return NO_AGENT when no agents installed', async () => {
      const result = await workflowModule.analyzeWorkflowState({
        installedAgents: [],
        currentAgent: null
      });

      assert.strictEqual(result.stage, workflowModule.WorkflowStage.NO_AGENT);
      assert.strictEqual(result.inAgent, false);
    });

    it('should return NO_PROJECT when in agent without project', async () => {
      const result = await workflowModule.analyzeWorkflowState({
        currentAgent: { type: 'claude', name: 'Claude Code' },
        projectPath: null
      });

      assert.strictEqual(result.stage, workflowModule.WorkflowStage.NO_PROJECT);
      assert.strictEqual(result.inAgent, true);
    });

    it('should analyze project state when in agent with project', async () => {
      const result = await workflowModule.analyzeWorkflowState({
        currentAgent: { type: 'claude', name: 'Claude Code' },
        projectPath: tempDir
      });

      assert.strictEqual(result.stage, workflowModule.WorkflowStage.SPEC_INIT);
      assert.strictEqual(result.inAgent, true);
      assert.strictEqual(result.projectPath, tempDir);
    });
  });

  describe('getNextAction', () => {
    it('should return appropriate action for each stage', () => {
      const { WorkflowStage } = workflowModule;

      const stages = [
        WorkflowStage.NO_AGENT,
        WorkflowStage.SPEC_INIT,
        WorkflowStage.SPEC_CREATED,
        WorkflowStage.PLAN_CREATED,
        WorkflowStage.TASKS_CREATED,
        WorkflowStage.IMPLEMENTING,
        WorkflowStage.COMPLETE
      ];

      for (const stage of stages) {
        const action = workflowModule.getNextAction(stage);
        assert.ok(action.message, `${stage} should have message`);
        assert.ok(action.action, `${stage} should have action type`);
      }
    });

    it('should customize command for PROJECT_SELECTED with agent context', () => {
      const action = workflowModule.getNextAction(
        workflowModule.WorkflowStage.PROJECT_SELECTED,
        {
          agent: { launchCmd: 'claude' },
          projectPath: '/path/to/project'
        }
      );

      assert.ok(action.command.includes('claude'));
      assert.ok(action.command.includes('/path/to/project'));
    });

    it('should customize command for NO_AGENT with recommended agent', () => {
      const action = workflowModule.getNextAction(
        workflowModule.WorkflowStage.NO_AGENT,
        {
          recommendedAgent: { installCmd: 'npm install -g @anthropic-ai/claude-code' }
        }
      );

      assert.ok(action.command.includes('npm install'));
    });
  });

  describe('Edge cases', () => {
    it('should handle corrupted session.json gracefully', async () => {
      const speckitDir = path.join(tempDir, '.speckit');
      await fs.ensureDir(speckitDir);
      await fs.writeFile(path.join(speckitDir, 'spec.md'), '# Spec');
      await fs.writeFile(path.join(speckitDir, 'plan.md'), '# Plan');
      await fs.writeFile(path.join(speckitDir, 'tasks.md'), '# Tasks');
      await fs.writeFile(path.join(speckitDir, 'session.json'), 'not valid json');

      // Should not throw, should return TASKS_CREATED (fallback)
      const result = await workflowModule.analyzeProjectState(tempDir);
      assert.strictEqual(result, workflowModule.WorkflowStage.TASKS_CREATED);
    });

    it('should prefer .speckit over .specify when both exist', async () => {
      // Create both directories with different states
      const speckitDir = path.join(tempDir, '.speckit');
      const specifyDir = path.join(tempDir, '.specify');

      await fs.ensureDir(speckitDir);
      await fs.ensureDir(specifyDir);

      // .speckit has spec only
      await fs.writeFile(path.join(speckitDir, 'spec.md'), '# Spec in .speckit');

      // .specify has spec and plan
      await fs.writeFile(path.join(specifyDir, 'spec.md'), '# Spec in .specify');
      await fs.writeFile(path.join(specifyDir, 'plan.md'), '# Plan in .specify');

      // Should use .speckit (hasSpeckit is checked first)
      const result = await workflowModule.analyzeProjectState(tempDir);
      assert.strictEqual(result, workflowModule.WorkflowStage.SPEC_CREATED);
    });
  });
});
