/**
 * T041: Unit tests for GitHub Spec Kit template generation
 * Tests spec.new integration and GitHub Spec Kit template compliance
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { GitHubTemplateGenerator } from '../../src/integration/github-template-generator.js';
import { SpecValidator } from '../../src/core/spec-validator.js';

describe('GitHubTemplateGenerator', () => {
  let generator;
  let validator;
  let originalEnv;

  beforeEach(async () => {
    originalEnv = { ...process.env };
    generator = new GitHubTemplateGenerator();
    validator = new SpecValidator();
    await generator.initialize();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('GitHub Spec Kit template generation', () => {
    test('should generate valid spec.new compatible template', async () => {
      const specData = {
        projectName: 'Test Web App',
        projectType: 'web-app',
        features: ['authentication', 'user-profiles', 'dashboard'],
        technicalRequirements: {
          framework: 'React',
          database: 'PostgreSQL',
          authentication: 'JWT'
        }
      };

      const template = await generator.generateTemplate(specData);

      // Should be valid spec.new format
      assert.ok(template.includes('# Test Web App'));
      assert.ok(template.includes('## Overview'));
      assert.ok(template.includes('## Features'));
      assert.ok(template.includes('## Technical Requirements'));
      assert.ok(template.includes('## Implementation Notes'));

      // Should include GitHub-specific sections
      assert.ok(template.includes('## GitHub Integration'));
      assert.ok(template.includes('## CI/CD Pipeline'));
      assert.ok(template.includes('## Issue Templates'));
    });

    test('should include constitutional compliance markers', async () => {
      const specData = {
        projectName: 'Mobile App',
        projectType: 'mobile-app',
        features: ['offline-sync', 'notifications']
      };

      const template = await generator.generateTemplate(specData);

      // Should include constitutional compliance
      assert.ok(template.includes('**Constitutional Compliance**'));
      assert.ok(template.includes('500ms animation limit'));
      assert.ok(template.includes('10% CPU usage limit'));
      assert.ok(template.includes('Accessibility: WCAG 2.1 AA'));
    });

    test('should generate appropriate file structure for GitHub', async () => {
      const specData = {
        projectName: 'API Service',
        projectType: 'api',
        features: ['rest-endpoints', 'authentication', 'rate-limiting']
      };

      const githubFiles = await generator.generateGitHubFiles(specData);

      assert.ok(githubFiles['.github/ISSUE_TEMPLATE/bug_report.md']);
      assert.ok(githubFiles['.github/ISSUE_TEMPLATE/feature_request.md']);
      assert.ok(githubFiles['.github/workflows/ci.yml']);
      assert.ok(githubFiles['.github/workflows/deploy.yml']);
      assert.ok(githubFiles['README.md']);
      assert.ok(githubFiles['CONTRIBUTING.md']);
      assert.ok(githubFiles['spec.md']);

      // Verify CI workflow includes constitutional compliance checks
      const ciWorkflow = githubFiles['.github/workflows/ci.yml'];
      assert.ok(ciWorkflow.includes('performance-check'));
      assert.ok(ciWorkflow.includes('accessibility-check'));
    });

    test('should generate spec with proper GitHub markdown formatting', async () => {
      const specData = {
        projectName: 'E-commerce Platform',
        projectType: 'web-app',
        features: ['product-catalog', 'shopping-cart', 'payment-processing']
      };

      const template = await generator.generateTemplate(specData);

      // Should have proper GitHub markdown structure
      assert.ok(template.includes('```mermaid')); // Mermaid diagrams
      assert.ok(template.includes('- [ ]')); // GitHub checkboxes
      assert.ok(template.includes('> **Note**')); // GitHub callouts
      assert.ok(template.includes('[!IMPORTANT]') || template.includes('> [!IMPORTANT]')); // GitHub alerts

      // Should include badges
      assert.ok(template.includes('!['));
      assert.ok(template.includes('shields.io') || template.includes('badge'));
    });

    test('should include comprehensive issue templates', async () => {
      const specData = {
        projectName: 'Dashboard App',
        projectType: 'web-app',
        features: ['analytics', 'reporting']
      };

      const files = await generator.generateGitHubFiles(specData);
      const bugTemplate = files['.github/ISSUE_TEMPLATE/bug_report.md'];
      const featureTemplate = files['.github/ISSUE_TEMPLATE/feature_request.md'];

      // Bug report template should be comprehensive
      assert.ok(bugTemplate.includes('**Describe the bug**'));
      assert.ok(bugTemplate.includes('**Steps to reproduce**'));
      assert.ok(bugTemplate.includes('**Expected behavior**'));
      assert.ok(bugTemplate.includes('**Screenshots**'));
      assert.ok(bugTemplate.includes('**Environment**'));
      assert.ok(bugTemplate.includes('**Constitutional Compliance**'));

      // Feature request template should align with spec
      assert.ok(featureTemplate.includes('**Is your feature request related to a problem?**'));
      assert.ok(featureTemplate.includes('**Describe the solution**'));
      assert.ok(featureTemplate.includes('**Spec Alignment**'));
      assert.ok(featureTemplate.includes('**Constitutional Impact**'));
    });
  });

  describe('spec.new integration', () => {
    test('should generate spec.new URL with proper encoding', async () => {
      const specData = {
        projectName: 'Test App',
        projectType: 'web-app',
        features: ['auth', 'dashboard']
      };

      const template = await generator.generateTemplate(specData);
      const specNewUrl = generator.generateSpecNewUrl(template);

      assert.ok(specNewUrl.startsWith('https://spec.new/'));
      assert.ok(specNewUrl.includes('?content='));

      // URL should be properly encoded
      const decodedContent = decodeURIComponent(specNewUrl.split('?content=')[1]);
      assert.ok(decodedContent.includes('Test App'));
    });

    test('should handle special characters in spec.new URLs', async () => {
      const specData = {
        projectName: 'App with "Quotes" & Symbols',
        projectType: 'web-app',
        features: ['special-chars']
      };

      const template = await generator.generateTemplate(specData);
      const specNewUrl = generator.generateSpecNewUrl(template);

      // Should not break URL encoding
      assert.ok(specNewUrl.startsWith('https://spec.new/'));
      assert.ok(!specNewUrl.includes('"'));
      assert.ok(!specNewUrl.includes('&') || specNewUrl.includes('%26'));
    });

    test('should support spec.new collaborative features', async () => {
      const specData = {
        projectName: 'Collaborative Project',
        projectType: 'web-app',
        features: ['collaboration']
      };

      const template = await generator.generateTemplate(specData);

      // Should include collaboration instructions
      assert.ok(template.includes('## Collaboration'));
      assert.ok(template.includes('spec.new'));
      assert.ok(template.includes('real-time editing'));
      assert.ok(template.includes('comment'));
    });
  });

  describe('constitutional compliance in GitHub templates', () => {
    test('should enforce constitutional limits in template generation', async () => {
      const specData = {
        projectName: 'Large Enterprise App',
        projectType: 'enterprise-app',
        features: Array.from({length: 50}, (_, i) => `feature-${i}`) // Many features
      };

      const startTime = performance.now();
      const template = await generator.generateTemplate(specData);
      const generationTime = performance.now() - startTime;

      // Constitutional limit: generation should be fast
      assert.ok(generationTime < 2000, `Template generation took ${generationTime}ms, should be < 2000ms`);

      // Should still be comprehensive despite size
      assert.ok(template.length > 1000);
      assert.ok(template.includes('Constitutional Compliance'));
    });

    test('should include performance requirements in templates', async () => {
      const specData = {
        projectName: 'Performance-Critical App',
        projectType: 'web-app',
        features: ['real-time-updates', 'animations']
      };

      const template = await generator.generateTemplate(specData);

      // Should include specific performance requirements
      assert.ok(template.includes('Animation duration: ≤ 500ms'));
      assert.ok(template.includes('CPU usage: ≤ 10%'));
      assert.ok(template.includes('Memory usage: monitored'));
      assert.ok(template.includes('Lighthouse score: ≥ 90'));
    });

    test('should include accessibility requirements', async () => {
      const specData = {
        projectName: 'Accessible Web App',
        projectType: 'web-app',
        features: ['user-interface', 'forms']
      };

      const template = await generator.generateTemplate(specData);

      // Should include accessibility requirements
      assert.ok(template.includes('WCAG 2.1 AA'));
      assert.ok(template.includes('keyboard navigation'));
      assert.ok(template.includes('screen reader'));
      assert.ok(template.includes('color contrast'));
      assert.ok(template.includes('focus management'));
    });
  });

  describe('template validation', () => {
    test('should validate generated templates', async () => {
      const specData = {
        projectName: 'Validation Test App',
        projectType: 'web-app',
        features: ['basic-features']
      };

      const template = await generator.generateTemplate(specData);
      const validation = await validator.validateSpec(template);

      assert.strictEqual(validation.isValid, true);
      assert.ok(validation.sections.overview);
      assert.ok(validation.sections.features);
      assert.ok(validation.sections.technicalRequirements);
      assert.ok(validation.completeness > 0.8);
    });

    test('should validate GitHub file structure', async () => {
      const specData = {
        projectName: 'Structure Test',
        projectType: 'api',
        features: ['endpoints']
      };

      const files = await generator.generateGitHubFiles(specData);
      const validation = generator.validateGitHubStructure(files);

      assert.strictEqual(validation.valid, true);
      assert.ok(validation.hasIssueTemplates);
      assert.ok(validation.hasWorkflows);
      assert.ok(validation.hasReadme);
      assert.ok(validation.hasSpec);
    });

    test('should detect missing required sections', async () => {
      const incompleteSpec = {
        projectName: 'Incomplete App'
        // Missing required fields
      };

      const template = await generator.generateTemplate(incompleteSpec);
      const validation = await validator.validateSpec(template);

      assert.ok(validation.warnings.length > 0);
      assert.ok(validation.missingRequired.length > 0);
    });
  });

  describe('GitHub Actions workflow generation', () => {
    test('should generate comprehensive CI workflow', async () => {
      const specData = {
        projectName: 'CI Test App',
        projectType: 'web-app',
        features: ['testing', 'deployment']
      };

      const files = await generator.generateGitHubFiles(specData);
      const ciWorkflow = files['.github/workflows/ci.yml'];

      // Should include standard CI steps
      assert.ok(ciWorkflow.includes('checkout@v4'));
      assert.ok(ciWorkflow.includes('setup-node@v4'));
      assert.ok(ciWorkflow.includes('npm ci'));
      assert.ok(ciWorkflow.includes('npm test'));
      assert.ok(ciWorkflow.includes('npm run build'));

      // Should include constitutional compliance checks
      assert.ok(ciWorkflow.includes('performance-check'));
      assert.ok(ciWorkflow.includes('accessibility-audit'));
      assert.ok(ciWorkflow.includes('lighthouse'));
    });

    test('should generate deployment workflow with safeguards', async () => {
      const specData = {
        projectName: 'Deploy Test App',
        projectType: 'web-app',
        features: ['production-deployment']
      };

      const files = await generator.generateGitHubFiles(specData);
      const deployWorkflow = files['.github/workflows/deploy.yml'];

      // Should include deployment safeguards
      assert.ok(deployWorkflow.includes('environment: production'));
      assert.ok(deployWorkflow.includes('if: github.ref == \'refs/heads/main\''));
      assert.ok(deployWorkflow.includes('performance-check'));

      // Should include rollback capability
      assert.ok(deployWorkflow.includes('rollback') || deployWorkflow.includes('previous-version'));
    });

    test('should customize workflows based on project type', async () => {
      const apiSpec = {
        projectName: 'API Service',
        projectType: 'api',
        features: ['rest-endpoints']
      };

      const mobileSpec = {
        projectName: 'Mobile App',
        projectType: 'mobile-app',
        features: ['ios', 'android']
      };

      const apiFiles = await generator.generateGitHubFiles(apiSpec);
      const mobileFiles = await generator.generateGitHubFiles(mobileSpec);

      const apiCi = apiFiles['.github/workflows/ci.yml'];
      const mobileCi = mobileFiles['.github/workflows/ci.yml'];

      // API should have API-specific steps
      assert.ok(apiCi.includes('api-test') || apiCi.includes('integration-test'));

      // Mobile should have mobile-specific steps
      assert.ok(mobileCi.includes('build-ios') || mobileCi.includes('build-android'));
    });
  });

  describe('integration with existing GitHub repos', () => {
    test('should merge with existing GitHub structure', async () => {
      const existingFiles = {
        'README.md': '# Existing Project\n\nSome content',
        '.github/workflows/existing.yml': 'name: Existing Workflow'
      };

      const specData = {
        projectName: 'Merge Test',
        projectType: 'web-app',
        features: ['merge-capability']
      };

      const mergedFiles = await generator.mergeWithExisting(specData, existingFiles);

      // Should preserve existing content while adding new
      assert.ok(mergedFiles['README.md'].includes('Existing Project'));
      assert.ok(mergedFiles['README.md'].includes('Merge Test'));
      assert.ok(mergedFiles['.github/workflows/existing.yml']);
      assert.ok(mergedFiles['.github/workflows/ci.yml']);
    });

    test('should handle conflicts gracefully', async () => {
      const conflictingFiles = {
        'spec.md': '# Old Spec\n\nConflicting content'
      };

      const specData = {
        projectName: 'Conflict Test',
        projectType: 'web-app',
        features: ['conflict-resolution']
      };

      const result = await generator.mergeWithExisting(specData, conflictingFiles);

      // Should handle conflicts with backup
      assert.ok(result['spec.md'].includes('Conflict Test'));
      assert.ok(result['spec.md.backup'] || result['spec-old.md']);
    });
  });

  describe('community and collaboration features', () => {
    test('should generate CONTRIBUTING.md with spec alignment', async () => {
      const specData = {
        projectName: 'Community Project',
        projectType: 'open-source',
        features: ['community-contributions']
      };

      const files = await generator.generateGitHubFiles(specData);
      const contributing = files['CONTRIBUTING.md'];

      assert.ok(contributing.includes('# Contributing'));
      assert.ok(contributing.includes('spec.md'));
      assert.ok(contributing.includes('constitutional compliance'));
      assert.ok(contributing.includes('code of conduct'));
      assert.ok(contributing.includes('pull request'));
    });

    test('should include Code of Conduct', async () => {
      const specData = {
        projectName: 'Community App',
        projectType: 'web-app',
        features: ['community']
      };

      const files = await generator.generateGitHubFiles(specData);

      assert.ok(files['CODE_OF_CONDUCT.md']);
      const codeOfConduct = files['CODE_OF_CONDUCT.md'];
      assert.ok(codeOfConduct.includes('Contributor Covenant'));
    });

    test('should generate PR templates', async () => {
      const specData = {
        projectName: 'PR Template Test',
        projectType: 'web-app',
        features: ['pull-requests']
      };

      const files = await generator.generateGitHubFiles(specData);
      const prTemplate = files['.github/pull_request_template.md'];

      assert.ok(prTemplate.includes('## Description'));
      assert.ok(prTemplate.includes('## Type of change'));
      assert.ok(prTemplate.includes('## Spec compliance'));
      assert.ok(prTemplate.includes('## Constitutional compliance'));
      assert.ok(prTemplate.includes('- [ ]')); // Checkboxes
    });
  });

  describe('error handling and edge cases', () => {
    test('should handle malformed spec data', async () => {
      const malformedData = {
        // Missing required fields
        projectType: null,
        features: 'not-an-array'
      };

      const template = await generator.generateTemplate(malformedData);

      // Should generate a basic template with defaults
      assert.ok(template.includes('# Untitled Project'));
      assert.ok(template.includes('## Overview'));
      assert.ok(template.length > 200);
    });

    test('should handle generation errors gracefully', async () => {
      // Mock an error condition
      const originalGenerate = generator.generateSection;
      generator.generateSection = () => {
        throw new Error('Mock generation error');
      };

      const result = await generator.generateTemplate({
        projectName: 'Error Test',
        projectType: 'web-app'
      });

      // Should still return a basic template
      assert.ok(result.includes('Error Test'));
      assert.ok(result.length > 100);

      // Restore
      generator.generateSection = originalGenerate;
    });

    test('should validate template size limits', async () => {
      const hugeSpecData = {
        projectName: 'Huge Project',
        projectType: 'enterprise-app',
        features: Array.from({length: 1000}, (_, i) => `feature-${i}`),
        description: 'A'.repeat(10000) // Very long description
      };

      const template = await generator.generateTemplate(hugeSpecData);

      // Should be reasonable size for GitHub
      assert.ok(template.length < 100000, 'Template should be under 100KB for GitHub compatibility');
      assert.ok(template.includes('Huge Project'));
    });
  });
});

// Integration test with real GitHub API (if available)
describe('GitHub API Integration (Optional)', () => {
  test('should create GitHub repository with generated files', async function() {
    // Skip if no GitHub token available
    if (!process.env.GITHUB_TOKEN) {
      this.skip();
      return;
    }

    const generator = new GitHubTemplateGenerator();
    const specData = {
      projectName: 'Test Integration Repo',
      projectType: 'web-app',
      features: ['integration-test']
    };

    const repoData = await generator.createGitHubRepository(specData, {
      private: true,
      deleteAfterTest: true
    });

    assert.ok(repoData.url);
    assert.ok(repoData.url.includes('github.com'));

    // Cleanup
    if (repoData.deleteAfterTest) {
      await generator.deleteGitHubRepository(repoData.name);
    }
  });
});