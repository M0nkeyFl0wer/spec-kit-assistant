#!/usr/bin/env node

/**
 * GitHub Spec Kit Integration Module
 * Provides proper integration with GitHub's Spec Kit templates and formats
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SpecKitIntegration {
    constructor() {
        this.templatesDir = path.join(__dirname, '../../templates');
        this.outputDir = path.join(process.cwd(), 'specs');
        this.templates = {
            spec: 'spec-template.md',
            plan: 'plan-template.md',
            tasks: 'tasks-template.md',
            agent: 'agent-file-template.md'
        };
    }

    /**
     * Load GitHub Spec Kit template
     */
    async loadTemplate(templateType) {
        const templatePath = path.join(this.templatesDir, this.templates[templateType]);
        try {
            const content = await fs.readFile(templatePath, 'utf8');
            return content;
        } catch (error) {
            throw new Error(`Failed to load ${templateType} template: ${error.message}`);
        }
    }

    /**
     * Generate specification using GitHub Spec Kit format
     */
    async generateSpec(featureName, userDescription, clarifications = {}) {
        const template = await this.loadTemplate('spec');
        const date = new Date().toISOString().split('T')[0];
        const branchName = this.generateBranchName(featureName);

        let spec = template
            .replace(/\[FEATURE NAME\]/g, featureName)
            .replace(/\[###-feature-name\]/g, branchName)
            .replace(/\[DATE\]/g, date)
            .replace(/\$ARGUMENTS/g, userDescription);

        // Add clarifications if provided
        if (Object.keys(clarifications).length > 0) {
            const clarificationSection = this.buildClarificationSection(clarifications);
            spec = spec.replace('## Execution Flow (main)', clarificationSection + '\n\n## Execution Flow (main)');
        }

        return spec;
    }

    /**
     * Generate implementation plan using GitHub Spec Kit format
     */
    async generatePlan(featureName, specPath) {
        const template = await this.loadTemplate('plan');
        const date = new Date().toISOString().split('T')[0];
        const branchName = this.generateBranchName(featureName);

        const plan = template
            .replace(/\[FEATURE\]/g, featureName)
            .replace(/\[###-feature-name\]/g, branchName)
            .replace(/\[DATE\]/g, date)
            .replace(/\[link\]/g, specPath);

        return plan;
    }

    /**
     * Generate tasks breakdown using GitHub Spec Kit format
     */
    async generateTasks(featureName, implementationPlan) {
        const template = await this.loadTemplate('tasks');
        const date = new Date().toISOString().split('T')[0];
        const branchName = this.generateBranchName(featureName);

        const tasks = template
            .replace(/\[FEATURE\]/g, featureName)
            .replace(/\[###-feature-name\]/g, branchName)
            .replace(/\[DATE\]/g, date);

        return tasks;
    }

    /**
     * Save specification file in proper Spec Kit structure
     */
    async saveSpec(featureName, content, type = 'spec') {
        const branchName = this.generateBranchName(featureName);
        const specDir = path.join(this.outputDir, branchName);

        // Create directory structure
        await fs.mkdir(specDir, { recursive: true });

        const filename = `${type}.md`;
        const filepath = path.join(specDir, filename);

        await fs.writeFile(filepath, content, 'utf8');

        return {
            path: filepath,
            relativePath: path.relative(process.cwd(), filepath),
            directory: specDir
        };
    }

    /**
     * Validate Spec Kit format compliance
     */
    validateSpecFormat(content) {
        const requiredSections = [
            '# Feature Specification:',
            '## Execution Flow',
            '## User Scenarios',
            '## Functional Requirements',
            '## Technical Requirements'
        ];

        const issues = [];

        for (const section of requiredSections) {
            if (!content.includes(section)) {
                issues.push(`Missing required section: ${section}`);
            }
        }

        return {
            isValid: issues.length === 0,
            issues
        };
    }

    /**
     * Generate proper branch name following Spec Kit conventions
     */
    generateBranchName(featureName) {
        const issueNumber = Math.floor(Math.random() * 999) + 1;
        const safeName = featureName
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 30);

        return `${issueNumber.toString().padStart(3, '0')}-${safeName}`;
    }

    /**
     * Build clarification section for specs
     */
    buildClarificationSection(clarifications) {
        let section = '## Clarifications Needed\n\n';

        for (const [aspect, question] of Object.entries(clarifications)) {
            section += `**${aspect}**: [NEEDS CLARIFICATION: ${question}]\n\n`;
        }

        return section;
    }

    /**
     * Get Spec Kit project structure
     */
    async getProjectStructure() {
        const specsDir = this.outputDir;

        try {
            const entries = await fs.readdir(specsDir, { withFileTypes: true });
            const specs = [];

            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const specPath = path.join(specsDir, entry.name);
                    const files = await fs.readdir(specPath);

                    specs.push({
                        branch: entry.name,
                        path: specPath,
                        files: files.filter(f => f.endsWith('.md'))
                    });
                }
            }

            return specs;
        } catch (error) {
            return [];
        }
    }

    /**
     * Initialize Spec Kit project structure
     */
    async initializeProject() {
        await fs.mkdir(this.outputDir, { recursive: true });

        const gitignore = `# Spec Kit Assistant generated files
.spec-sessions/
node_modules/
*.log
.env
`;

        await fs.writeFile(path.join(this.outputDir, '.gitignore'), gitignore, 'utf8');

        return {
            specsDirectory: this.outputDir,
            templatesDirectory: this.templatesDir,
            initialized: true
        };
    }
}

export default SpecKitIntegration;