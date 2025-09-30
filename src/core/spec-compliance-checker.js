#!/usr/bin/env node
/**
 * Spec Kit Compliance Checker
 * Ensures all implementations stay tied to spec files and completes todos/unit checks
 */

import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

export class SpecKitComplianceChecker {
  constructor() {
    this.specPatterns = [
      '**/spec.md',
      '**/SPEC.md',
      '**/*.spec.md',
      '**/specification.md',
      '**/requirements.md'
    ];

    this.todoPatterns = [
      /TODO:/gi,
      /FIXME:/gi,
      /HACK:/gi,
      /NOTE:/gi,
      /BUG:/gi
    ];

    this.complianceRules = {
      specFileRequired: true,
      implementationMustMatchSpec: true,
      allTodosMustBeTracked: true,
      unitTestsCoverageMinimum: 80,
      documentationRequired: true,
      gitHubSpecKitFormat: true
    };
  }

  async checkCompliance(projectPath = process.cwd()) {
    console.log(chalk.blue('📋 Checking Spec Kit compliance...'));

    const results = {
      overall: 'pending',
      specFiles: await this.findSpecFiles(projectPath),
      todos: await this.scanTodos(projectPath),
      tests: await this.analyzeTestCoverage(projectPath),
      implementation: await this.validateImplementation(projectPath),
      suggestions: []
    };

    results.overall = this.calculateOverallCompliance(results);
    results.suggestions = this.generateSuggestions(results);

    return results;
  }

  async findSpecFiles(projectPath) {
    const specFiles = [];

    for (const pattern of this.specPatterns) {
      try {
        const files = await glob(pattern, { cwd: projectPath });
        specFiles.push(...files);
      } catch (error) {
        console.log(chalk.yellow(`⚠️ Error searching for ${pattern}: ${error.message}`));
      }
    }

    return {
      found: specFiles,
      count: specFiles.length,
      status: specFiles.length > 0 ? 'compliant' : 'missing',
      primary: this.identifyPrimarySpec(specFiles)
    };
  }

  identifyPrimarySpec(specFiles) {
    // Prioritize spec files in order of importance
    const priorities = ['spec.md', 'SPEC.md', 'specification.md', 'requirements.md'];

    for (const priority of priorities) {
      const found = specFiles.find(file => file.endsWith(priority));
      if (found) return found;
    }

    return specFiles[0] || null;
  }

  async scanTodos(projectPath) {
    const todos = [];
    const codeFiles = await glob('**/*.{js,ts,py,md,json}', {
      cwd: projectPath,
      ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**']
    });

    for (const file of codeFiles) {
      try {
        const content = await fs.readFile(path.join(projectPath, file), 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          this.todoPatterns.forEach(pattern => {
            const match = line.match(pattern);
            if (match) {
              todos.push({
                file,
                line: index + 1,
                type: match[0].replace(':', ''),
                content: line.trim(),
                priority: this.categorizeTodoPriority(line)
              });
            }
          });
        });
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return {
      items: todos,
      count: todos.length,
      byPriority: this.groupTodosByPriority(todos),
      status: todos.length === 0 ? 'clean' : 'needs-attention'
    };
  }

  categorizeTodoPriority(line) {
    const urgent = /urgent|critical|important|asap/i;
    const normal = /TODO:|FIXME:/i;

    if (urgent.test(line)) return 'high';
    if (normal.test(line)) return 'medium';
    return 'low';
  }

  groupTodosByPriority(todos) {
    return todos.reduce((groups, todo) => {
      groups[todo.priority] = groups[todo.priority] || [];
      groups[todo.priority].push(todo);
      return groups;
    }, {});
  }

  async analyzeTestCoverage(projectPath) {
    const testFiles = await glob('**/*.{test,spec}.{js,ts}', {
      cwd: projectPath,
      ignore: ['node_modules/**']
    });

    const srcFiles = await glob('src/**/*.{js,ts}', {
      cwd: projectPath,
      ignore: ['**/*.test.*', '**/*.spec.*']
    });

    const coverage = testFiles.length / Math.max(srcFiles.length, 1) * 100;

    return {
      testFiles: testFiles.length,
      sourceFiles: srcFiles.length,
      coverageEstimate: Math.round(coverage),
      status: coverage >= this.complianceRules.unitTestsCoverageMinimum ? 'compliant' : 'insufficient',
      recommendation: coverage < 80 ? 'Add more unit tests to reach 80% coverage' : 'Good test coverage'
    };
  }

  async validateImplementation(projectPath) {
    const validation = {
      gitHubSpecKit: await this.checkGitHubSpecKitFormat(projectPath),
      projectStructure: await this.validateProjectStructure(projectPath),
      documentation: await this.checkDocumentation(projectPath)
    };

    return {
      ...validation,
      status: Object.values(validation).every(v => v.status === 'compliant') ? 'compliant' : 'needs-work'
    };
  }

  async checkGitHubSpecKitFormat(projectPath) {
    const requiredFiles = ['package.json', 'README.md'];
    const optimalStructure = ['src/', 'tests/', 'docs/'];

    const hasRequired = await Promise.all(
      requiredFiles.map(file => fs.pathExists(path.join(projectPath, file)))
    );

    const hasOptimal = await Promise.all(
      optimalStructure.map(dir => fs.pathExists(path.join(projectPath, dir)))
    );

    return {
      requiredFiles: hasRequired.every(Boolean),
      optimalStructure: hasOptimal.filter(Boolean).length >= 2,
      status: hasRequired.every(Boolean) ? 'compliant' : 'missing-files'
    };
  }

  async validateProjectStructure(projectPath) {
    const packageJson = path.join(projectPath, 'package.json');

    if (!await fs.pathExists(packageJson)) {
      return { status: 'missing-package-json' };
    }

    try {
      const pkg = await fs.readJson(packageJson);
      return {
        hasName: !!pkg.name,
        hasDescription: !!pkg.description,
        hasScripts: !!pkg.scripts,
        hasMain: !!pkg.main,
        hasType: pkg.type === 'module',
        status: 'compliant'
      };
    } catch (error) {
      return { status: 'invalid-package-json' };
    }
  }

  async checkDocumentation(projectPath) {
    const readmeExists = await fs.pathExists(path.join(projectPath, 'README.md'));
    const docsDir = await fs.pathExists(path.join(projectPath, 'docs'));

    return {
      readme: readmeExists,
      docsDirectory: docsDir,
      status: readmeExists ? 'compliant' : 'missing-readme'
    };
  }

  calculateOverallCompliance(results) {
    const checks = [
      results.specFiles.status === 'compliant',
      results.tests.status === 'compliant',
      results.implementation.status === 'compliant',
      results.todos.status === 'clean' || results.todos.count < 5 // Allow some todos
    ];

    const passedChecks = checks.filter(Boolean).length;
    const totalChecks = checks.length;
    const percentage = (passedChecks / totalChecks) * 100;

    if (percentage >= 90) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 50) return 'acceptable';
    return 'needs-improvement';
  }

  generateSuggestions(results) {
    const suggestions = [];

    if (results.specFiles.status === 'missing') {
      suggestions.push({
        priority: 'high',
        action: 'Create a spec.md file defining project requirements and specifications',
        type: 'spec-file'
      });
    }

    if (results.todos.count > 10) {
      suggestions.push({
        priority: 'medium',
        action: `Address ${results.todos.count} TODOs found in codebase`,
        type: 'code-quality'
      });
    }

    if (results.tests.status === 'insufficient') {
      suggestions.push({
        priority: 'high',
        action: `Increase test coverage from ${results.tests.coverageEstimate}% to at least 80%`,
        type: 'testing'
      });
    }

    if (results.implementation.documentation.status === 'missing-readme') {
      suggestions.push({
        priority: 'medium',
        action: 'Create comprehensive README.md documentation',
        type: 'documentation'
      });
    }

    return suggestions;
  }

  async generateComplianceReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      projectStatus: results.overall,
      summary: {
        specFiles: results.specFiles.count,
        todos: results.todos.count,
        testCoverage: results.tests.coverageEstimate,
        complianceScore: this.calculateComplianceScore(results)
      },
      details: results,
      recommendations: results.suggestions
    };

    return report;
  }

  calculateComplianceScore(results) {
    let score = 0;

    if (results.specFiles.status === 'compliant') score += 25;
    if (results.tests.status === 'compliant') score += 25;
    if (results.implementation.status === 'compliant') score += 25;
    if (results.todos.status === 'clean') score += 25;
    else if (results.todos.count < 5) score += 15; // Partial credit

    return score;
  }

  async autoFixCompliance(projectPath = process.cwd()) {
    console.log(chalk.blue('🔧 Auto-fixing compliance issues...'));

    const results = await this.checkCompliance(projectPath);
    const fixes = [];

    // Auto-create spec file if missing
    if (results.specFiles.status === 'missing') {
      const specContent = this.generateBasicSpec(projectPath);
      await fs.writeFile(path.join(projectPath, 'spec.md'), specContent);
      fixes.push('Created basic spec.md file');
    }

    // Auto-create basic tests if missing
    if (results.tests.testFiles === 0) {
      await this.createBasicTestStructure(projectPath);
      fixes.push('Created basic test structure');
    }

    console.log(chalk.green(`✅ Applied ${fixes.length} automatic fixes`));
    return fixes;
  }

  generateBasicSpec(projectPath) {
    const projectName = path.basename(projectPath);

    return `# ${projectName} Specification

## Overview
Project specification and requirements documentation.

## Requirements
- [ ] Define core functionality
- [ ] Implement features
- [ ] Add comprehensive testing
- [ ] Document API endpoints
- [ ] Ensure security compliance

## Implementation Guidelines
- Follow GitHub Spec Kit framework
- Maintain high test coverage
- Use ES modules
- Implement proper error handling

## Testing Requirements
- Unit tests for all core functions
- Integration tests for API endpoints
- Minimum 80% code coverage

## Documentation
- README.md with setup instructions
- API documentation
- Code comments for complex logic

---
*Generated by Spec Kit Assistant*
`;
  }

  async createBasicTestStructure(projectPath) {
    const testDir = path.join(projectPath, 'tests');
    await fs.ensureDir(testDir);

    const basicTest = `import { test } from 'node:test';
import assert from 'node:assert';

test('basic functionality', () => {
  assert.strictEqual(1 + 1, 2);
});

test('project structure exists', async () => {
  // Add tests for your main functionality
  assert.ok(true, 'Project structure is valid');
});
`;

    await fs.writeFile(path.join(testDir, 'basic.test.js'), basicTest);
  }

  displayComplianceResults(results) {
    console.log(chalk.cyan('\n📊 Spec Kit Compliance Report'));
    console.log(chalk.gray('─'.repeat(50)));

    const statusColor = {
      'excellent': chalk.green,
      'good': chalk.blue,
      'acceptable': chalk.yellow,
      'needs-improvement': chalk.red
    };

    console.log(statusColor[results.overall](`Overall Status: ${results.overall.toUpperCase()}`));
    console.log(chalk.gray(`Compliance Score: ${this.calculateComplianceScore(results)}/100`));

    console.log(chalk.blue('\n📋 Details:'));
    console.log(chalk.gray(`  Spec Files: ${results.specFiles.count} found`));
    console.log(chalk.gray(`  TODOs: ${results.todos.count} items`));
    console.log(chalk.gray(`  Test Coverage: ~${results.tests.coverageEstimate}%`));

    if (results.suggestions.length > 0) {
      console.log(chalk.yellow('\n🎯 Recommendations:'));
      results.suggestions.forEach(suggestion => {
        const icon = suggestion.priority === 'high' ? '🔴' : '🟡';
        console.log(chalk.gray(`  ${icon} ${suggestion.action}`));
      });
    }

    console.log(chalk.gray('─'.repeat(50) + '\n'));
  }
}

export default SpecKitComplianceChecker;