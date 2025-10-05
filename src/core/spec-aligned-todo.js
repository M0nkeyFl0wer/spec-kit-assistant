// Spec-Aligned Todo Management System
// Ensures all todos reference spec sections and maintain continuous alignment

import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import { secureReadFile, secureWriteFile, secureEnsureDir } from '../utils/secure-path.js';

/**
 * SpecAlignedTodoManager integrates todo management with specification tracking
 * Every todo item references specific spec sections for continuous validation
 */
export class SpecAlignedTodoManager {
  constructor() {
    this.todoFile = '.spec-aligned-todos.json';
    this.todos = [];
    this.activeSpecPath = null;
    this.specSections = new Map();
  }

  /**
   * Create todo aligned with specification section
   */
  async createSpecAlignedTodo(content, specSection = null, priority = 'medium') {
    try {
      // Load current spec if available
      await this.loadActiveSpec();

      // Extract validation criteria from spec
      const validationCriteria = await this.extractValidationCriteria(specSection);

      const todo = {
        id: this.generateTodoId(),
        content,
        status: 'pending',
        priority,
        createdAt: new Date().toISOString(),
        specReference: {
          specPath: this.activeSpecPath,
          section: specSection,
          validationCriteria,
          lastValidated: new Date().toISOString(),
        },
        implementation: {
          estimatedDuration: this.estimateDuration(content, validationCriteria),
          requiredSkills: this.extractRequiredSkills(content),
          dependencies: [],
          progress: 0,
        },
        activeForm: this.generateActiveForm(content),
      };

      this.todos.push(todo);
      await this.saveTodos();

      console.log(chalk.green(`✅ Todo created with spec alignment: ${todo.id}`));
      console.log(chalk.gray(`   Spec section: ${specSection || 'General'}`));
      console.log(chalk.gray(`   Validation criteria: ${validationCriteria.length} items`));

      return todo;
    } catch (error) {
      console.error(chalk.red(`Failed to create spec-aligned todo: ${error.message}`));
      throw error;
    }
  }

  /**
   * Update todo status and validate against spec
   */
  async updateTodoStatus(todoId, status) {
    const todo = this.findTodoById(todoId);
    if (!todo) {
      throw new Error(`Todo not found: ${todoId}`);
    }

    const oldStatus = todo.status;
    todo.status = status;
    todo.updatedAt = new Date().toISOString();

    // Validate against spec when marking as completed
    if (status === 'completed') {
      const validationResult = await this.validateTodoAgainstSpec(todo);

      if (!validationResult.isValid) {
        console.log(chalk.yellow('⚠️  Todo completion validation warnings:'));
        validationResult.issues.forEach((issue) => {
          console.log(chalk.gray(`   • ${issue}`));
        });

        // Ask if user wants to proceed anyway
        const proceed = await this.askUserConfirmation(
          'Complete todo despite validation warnings?',
        );

        if (!proceed) {
          todo.status = oldStatus;
          return { success: false, reason: 'validation_failed' };
        }
      }

      todo.implementation.progress = 100;
      todo.completedAt = new Date().toISOString();

      console.log(chalk.green(`🎉 Todo completed with spec validation: ${todoId}`));
    }

    await this.saveTodos();
    return { success: true, todo };
  }

  /**
   * Validate todo completion against specification requirements
   */
  async validateTodoAgainstSpec(todo) {
    const result = {
      isValid: true,
      issues: [],
    };

    if (!todo.specReference.validationCriteria
        || todo.specReference.validationCriteria.length === 0) {
      result.issues.push('No validation criteria available from spec');
      return result;
    }

    // Check each validation criterion
    for (const criterion of todo.specReference.validationCriteria) {
      const criterionCheck = await this.checkValidationCriterion(todo, criterion);

      if (!criterionCheck.passed) {
        result.isValid = false;
        result.issues.push(`Failed criterion: ${criterion}`);
      }
    }

    // Check if implementation aligns with spec requirements
    const alignmentCheck = await this.checkSpecAlignment(todo);
    if (!alignmentCheck.aligned) {
      result.issues.push(...alignmentCheck.issues);
    }

    return result;
  }

  /**
   * Check individual validation criterion
   */
  async checkValidationCriterion(todo, criterion) {
    // This would integrate with actual implementation checking
    // For now, we'll do basic keyword and pattern matching

    const result = {
      passed: false,
      details: '',
    };

    try {
      // Extract requirement keywords from criterion
      const requirementKeywords = this.extractRequirementKeywords(criterion);

      // Check if todo content addresses the requirement
      const contentMatch = requirementKeywords.some((keyword) => todo.content.toLowerCase().includes(keyword.toLowerCase()));

      if (contentMatch) {
        result.passed = true;
        result.details = 'Content matches requirement keywords';
      } else {
        result.details = 'Content may not address spec requirement fully';
      }

      return result;
    } catch (error) {
      result.details = `Validation check failed: ${error.message}`;
      return result;
    }
  }

  /**
   * Check overall spec alignment for todo
   */
  async checkSpecAlignment(todo) {
    const result = {
      aligned: true,
      issues: [],
    };

    try {
      if (!this.activeSpecPath) {
        result.aligned = false;
        result.issues.push('No active specification for alignment check');
        return result;
      }

      // Check if spec has been modified since todo creation
      const specStats = await fs.stat(this.activeSpecPath);
      const todoCreated = new Date(todo.createdAt);

      if (specStats.mtime > todoCreated) {
        result.issues.push('Specification has been modified since todo creation');

        // Re-extract validation criteria
        const updatedCriteria = await this.extractValidationCriteria(
          todo.specReference.section,
        );

        if (JSON.stringify(updatedCriteria) !== JSON.stringify(todo.specReference.validationCriteria)) {
          result.aligned = false;
          result.issues.push('Validation criteria have changed - todo may need update');
        }
      }

      return result;
    } catch (error) {
      result.aligned = false;
      result.issues.push(`Alignment check failed: ${error.message}`);
      return result;
    }
  }

  /**
   * Extract validation criteria from specification section
   */
  async extractValidationCriteria(specSection) {
    if (!this.activeSpecPath || !specSection) {
      return [];
    }

    try {
      const specContent = await secureReadFile(this.activeSpecPath, 'workspace');
      const lines = specContent.split('\\n');

      // Find the relevant section
      const sectionIndex = lines.findIndex((line) => line.toLowerCase().includes(specSection.toLowerCase())
        && line.startsWith('#'));

      if (sectionIndex === -1) {
        return [];
      }

      // Extract requirements from the section
      const sectionLines = [];
      let currentIndex = sectionIndex + 1;

      // Read until next section or end of file
      while (currentIndex < lines.length) {
        const line = lines[currentIndex];

        // Stop at next section header
        if (line.startsWith('#') && !line.startsWith('###')) {
          break;
        }

        sectionLines.push(line);
        currentIndex++;
      }

      // Extract validation criteria (MUST, SHALL, requirements)
      const criteria = sectionLines
        .filter((line) => line.includes('MUST')
          || line.includes('SHALL')
          || line.includes('FR-')
          || line.includes('TR-')
          || line.includes('**Given**')
          || line.includes('**When**')
          || line.includes('**Then**'))
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      return criteria;
    } catch (error) {
      console.error(chalk.yellow(`Warning: Could not extract validation criteria: ${error.message}`));
      return [];
    }
  }

  /**
   * Extract requirement keywords from criterion text
   */
  extractRequirementKeywords(criterion) {
    // Remove common requirement prefixes and extract key terms
    const cleanedCriterion = criterion
      .replace(/^-\s*\*?\*?[A-Z]{2}-\d+\*?\*?:?/i, '') // Remove requirement IDs
      .replace(/System MUST|Users MUST|MUST|SHALL/gi, '') // Remove requirement verbs
      .replace(/\*\*Given\*\*|\*\*When\*\*|\*\*Then\*\*/gi, '') // Remove BDD keywords
      .trim();

    // Extract meaningful keywords (avoid common words)
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an'];

    const keywords = cleanedCriterion
      .toLowerCase()
      .split(/\\s+/)
      .filter((word) => word.length > 3 && !commonWords.includes(word))
      .filter((word) => /^[a-z]+$/.test(word)); // Only alphabetic words

    return keywords;
  }

  /**
   * Estimate duration based on content and validation criteria
   */
  estimateDuration(content, validationCriteria) {
    // Simple heuristic for estimation
    const baseTime = 30; // minutes
    const complexityMultiplier = Math.max(1, validationCriteria.length * 0.5);

    let contentComplexity = 1;
    if (content.toLowerCase().includes('test') || content.toLowerCase().includes('testing')) {
      contentComplexity *= 1.5;
    }
    if (content.toLowerCase().includes('deploy') || content.toLowerCase().includes('deployment')) {
      contentComplexity *= 2;
    }
    if (content.toLowerCase().includes('security') || content.toLowerCase().includes('auth')) {
      contentComplexity *= 1.8;
    }

    const estimatedMinutes = Math.round(baseTime * complexityMultiplier * contentComplexity);

    if (estimatedMinutes < 60) {
      return `${estimatedMinutes} minutes`;
    }
    const hours = Math.round(estimatedMinutes / 60 * 10) / 10;
    return `${hours} hours`;
  }

  /**
   * Extract required skills from todo content
   */
  extractRequiredSkills(content) {
    const skillMap = {
      test: ['testing', 'quality-assurance'],
      deploy: ['deployment', 'build-automation'],
      security: ['security-audit', 'vulnerability-scanning'],
      document: ['documentation-generation'],
      performance: ['performance-testing', 'optimization'],
      bug: ['bug-fixing', 'code-repair'],
      refactor: ['refactoring', 'code-improvement'],
      auth: ['security-audit', 'authentication'],
    };

    const skills = new Set();
    const contentLower = content.toLowerCase();

    Object.entries(skillMap).forEach(([keyword, skillList]) => {
      if (contentLower.includes(keyword)) {
        skillList.forEach((skill) => skills.add(skill));
      }
    });

    return Array.from(skills);
  }

  /**
   * Generate active form of todo for display
   */
  generateActiveForm(content) {
    // Convert imperative to present continuous
    const activeFormMap = {
      implement: 'implementing',
      create: 'creating',
      build: 'building',
      test: 'testing',
      deploy: 'deploying',
      fix: 'fixing',
      update: 'updating',
      add: 'adding',
      remove: 'removing',
      refactor: 'refactoring',
      optimize: 'optimizing',
      validate: 'validating',
      configure: 'configuring',
    };

    let activeForm = content;
    Object.entries(activeFormMap).forEach(([imperative, continuous]) => {
      const regex = new RegExp(`\\b${imperative}\\b`, 'gi');
      activeForm = activeForm.replace(regex, continuous);
    });

    // Ensure it starts with capital letter
    return activeForm.charAt(0).toUpperCase() + activeForm.slice(1);
  }

  /**
   * Load active specification for reference
   */
  async loadActiveSpec() {
    try {
      // Look for active spec (similar to interceptor logic)
      const specPatterns = [
        'specs/**/spec.md',
        'SPEC.md',
        'spec.md',
      ];

      for (const pattern of specPatterns) {
        try {
          const content = await secureReadFile(pattern, 'workspace');
          if (this.isValidSpecContent(content)) {
            this.activeSpecPath = pattern;
            await this.parseSpecSections(content);
            break;
          }
        } catch (error) {
          // Continue to next pattern
        }
      }
    } catch (error) {
      console.warn(chalk.yellow(`Could not load active spec: ${error.message}`));
    }
  }

  /**
   * Check if content is valid specification
   */
  isValidSpecContent(content) {
    const specIndicators = [
      'Feature Specification',
      'Requirements',
      'User Story',
      'Acceptance Criteria',
    ];

    return specIndicators.some((indicator) => content.toLowerCase().includes(indicator.toLowerCase()));
  }

  /**
   * Parse specification sections for reference
   */
  async parseSpecSections(content) {
    const lines = content.split('\\n');
    const sections = new Map();

    let currentSection = null;
    let currentContent = [];

    lines.forEach((line) => {
      if (line.startsWith('#')) {
        // Save previous section
        if (currentSection) {
          sections.set(currentSection, currentContent.join('\\n'));
        }

        // Start new section
        currentSection = line.replace(/^#+\\s*/, '').trim();
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    });

    // Save last section
    if (currentSection) {
      sections.set(currentSection, currentContent.join('\\n'));
    }

    this.specSections = sections;
  }

  /**
   * Get todos with spec validation status
   */
  async getSpecAlignedTodos(includeCompleted = false) {
    await this.loadTodos();

    const filteredTodos = includeCompleted
      ? this.todos
      : this.todos.filter((todo) => todo.status !== 'completed');

    // Add current validation status to each todo
    const todosWithValidation = await Promise.all(
      filteredTodos.map(async (todo) => {
        const validation = await this.validateTodoAgainstSpec(todo);
        return {
          ...todo,
          currentValidation: validation,
        };
      }),
    );

    return todosWithValidation;
  }

  /**
   * Generate todo progress report aligned with spec
   */
  async generateSpecProgressReport() {
    await this.loadTodos();

    const report = {
      totalTodos: this.todos.length,
      completedTodos: this.todos.filter((t) => t.status === 'completed').length,
      inProgressTodos: this.todos.filter((t) => t.status === 'in_progress').length,
      pendingTodos: this.todos.filter((t) => t.status === 'pending').length,
      specAlignment: {
        aligned: 0,
        warnings: 0,
        outdated: 0,
      },
      specCoverage: new Map(),
      estimatedCompletion: '',
    };

    // Calculate spec alignment stats
    for (const todo of this.todos) {
      const validation = await this.validateTodoAgainstSpec(todo);

      if (validation.isValid) {
        report.specAlignment.aligned++;
      } else if (validation.issues.length > 0) {
        report.specAlignment.warnings++;
      }

      // Track spec section coverage
      const section = todo.specReference.section || 'General';
      const current = report.specCoverage.get(section) || { total: 0, completed: 0 };
      current.total++;
      if (todo.status === 'completed') {
        current.completed++;
      }
      report.specCoverage.set(section, current);
    }

    // Estimate completion time
    const remainingTodos = this.todos.filter((t) => t.status !== 'completed');
    const totalEstimatedMinutes = remainingTodos.reduce((total, todo) => {
      const duration = todo.implementation.estimatedDuration;
      const minutes = this.parseDurationToMinutes(duration);
      return total + minutes;
    }, 0);

    if (totalEstimatedMinutes < 60) {
      report.estimatedCompletion = `${totalEstimatedMinutes} minutes`;
    } else {
      const hours = Math.round(totalEstimatedMinutes / 60 * 10) / 10;
      report.estimatedCompletion = `${hours} hours`;
    }

    return report;
  }

  /**
   * Parse duration string to minutes
   */
  parseDurationToMinutes(duration) {
    if (duration.includes('hour')) {
      const hours = parseFloat(duration.match(/([\\d.]+)\\s*hour/)[1]);
      return hours * 60;
    } if (duration.includes('minute')) {
      return parseInt(duration.match(/(\\d+)\\s*minute/)[1]);
    }
    return 30; // Default fallback
  }

  /**
   * Utility methods
   */
  generateTodoId() {
    return `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  findTodoById(id) {
    return this.todos.find((todo) => todo.id === id);
  }

  async askUserConfirmation(question) {
    // Simple confirmation - in real implementation would use proper prompt
    console.log(chalk.yellow(`❓ ${question} (y/N)`));
    return false; // Default to safe choice
  }

  async saveTodos() {
    try {
      const todoData = JSON.stringify(this.todos, null, 2);
      await secureWriteFile(this.todoFile, todoData, 'workspace');
    } catch (error) {
      console.error(chalk.red(`Failed to save todos: ${error.message}`));
    }
  }

  async loadTodos() {
    try {
      const todoData = await secureReadFile(this.todoFile, 'workspace');
      this.todos = JSON.parse(todoData);
    } catch (error) {
      // File doesn't exist or is corrupted, start with empty list
      this.todos = [];
    }
  }
}

export default SpecAlignedTodoManager;
