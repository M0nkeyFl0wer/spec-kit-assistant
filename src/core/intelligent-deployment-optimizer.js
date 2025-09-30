#!/usr/bin/env node
/**
 * Intelligent Deployment Optimizer
 * Analyzes tasks and selects optimal agent deployment strategy for cost and efficiency
 */

import chalk from 'chalk';
import { execSync } from 'child_process';

export class IntelligentDeploymentOptimizer {
  constructor() {
    this.deploymentOptions = {
      local: {
        costPerMinute: 0, // Free local compute
        latency: 'low',
        privacy: 'high',
        availability: 'depends on system'
      },
      localAI: {
        costPerMinute: 0, // Free Code Llama on Seshat
        latency: 'low',
        privacy: 'high',
        codeQuality: 'high',
        availability: 'depends on ollama'
      },
      gemini: {
        costPerMinute: 0.02, // Estimated API cost
        latency: 'medium',
        privacy: 'medium',
        intelligence: 'very high',
        availability: 'high'
      },
      claude: {
        costPerMinute: 0.05, // Higher cost but excellent quality
        latency: 'medium',
        privacy: 'medium',
        codeQuality: 'excellent',
        availability: 'high'
      }
    };

    this.taskProfiles = {
      'code-generation': {
        preferredOrder: ['localAI', 'claude', 'gemini', 'local'],
        requirements: ['code-quality', 'syntax-accuracy']
      },
      'code-review': {
        preferredOrder: ['claude', 'localAI', 'gemini', 'local'],
        requirements: ['analysis-depth', 'best-practices']
      },
      'testing': {
        preferredOrder: ['local', 'localAI', 'gemini', 'claude'],
        requirements: ['fast-execution', 'comprehensive-coverage']
      },
      'documentation': {
        preferredOrder: ['gemini', 'claude', 'localAI', 'local'],
        requirements: ['clarity', 'completeness']
      },
      'spec-compliance': {
        preferredOrder: ['claude', 'gemini', 'localAI', 'local'],
        requirements: ['spec-understanding', 'compliance-checking']
      },
      'security-audit': {
        preferredOrder: ['localAI', 'claude', 'local', 'gemini'],
        requirements: ['privacy', 'thorough-analysis']
      }
    };
  }

  async analyzeDeploymentCapabilities() {
    const capabilities = {
      local: true,
      localAI: false,
      gemini: false,
      claude: true // Assuming Claude is available via this interface
    };

    // Check Code Llama availability on Seshat
    try {
      const result = execSync('ssh -p8888 m0nkey-fl0wer@seshat.noosworx.com "ollama list | grep codellama"', {
        stdio: 'pipe',
        timeout: 5000
      }).toString();

      if (result.includes('codellama:7b')) {
        capabilities.localAI = true;
        console.log(chalk.green('✅ Code Llama 7B available on Seshat'));
      }
    } catch (error) {
      console.log(chalk.yellow('⚠️ Code Llama not accessible on Seshat'));
    }

    // Check Gemini API availability
    try {
      if (process.env.GEMINI_API_KEY) {
        capabilities.gemini = true;
        console.log(chalk.green('✅ Gemini API available'));
      }
    } catch (error) {
      console.log(chalk.yellow('⚠️ Gemini API not available'));
    }

    return capabilities;
  }

  async optimizeDeployment(taskDescription) {
    console.log(chalk.blue('🎯 Analyzing optimal deployment strategy...'));

    const capabilities = await this.analyzeDeploymentCapabilities();
    const taskType = this.classifyTask(taskDescription);
    const profile = this.taskProfiles[taskType];

    // Find best available option
    let selectedDeployment = null;
    for (const option of profile.preferredOrder) {
      if (capabilities[option]) {
        selectedDeployment = option;
        break;
      }
    }

    const strategy = this.createDeploymentStrategy(selectedDeployment, taskType, taskDescription);

    console.log(chalk.cyan(`📊 Optimal Strategy: ${strategy.name}`));
    console.log(chalk.gray(`   Cost: ${strategy.estimatedCost}/min`));
    console.log(chalk.gray(`   Quality: ${strategy.expectedQuality}`));
    console.log(chalk.gray(`   Speed: ${strategy.expectedSpeed}`));

    return strategy;
  }

  classifyTask(description) {
    const desc = description.toLowerCase();

    if (desc.includes('code') || desc.includes('implement') || desc.includes('build')) {
      return 'code-generation';
    }
    if (desc.includes('review') || desc.includes('analyze') || desc.includes('check')) {
      return 'code-review';
    }
    if (desc.includes('test') || desc.includes('unit') || desc.includes('validate')) {
      return 'testing';
    }
    if (desc.includes('document') || desc.includes('readme') || desc.includes('spec')) {
      return 'documentation';
    }
    if (desc.includes('spec') || desc.includes('compliance') || desc.includes('standard')) {
      return 'spec-compliance';
    }
    if (desc.includes('security') || desc.includes('audit') || desc.includes('vulnerability')) {
      return 'security-audit';
    }

    return 'code-generation'; // Default
  }

  createDeploymentStrategy(deployment, taskType, description) {
    const strategies = {
      localAI: {
        name: 'Code Llama Local AI',
        agentType: 'codellama-agent',
        location: 'seshat',
        model: 'codellama:7b',
        estimatedCost: '$0.00/min',
        expectedQuality: 'High',
        expectedSpeed: 'Fast',
        instructions: 'Deploy Code Llama agent on Seshat for local AI processing'
      },
      claude: {
        name: 'Claude Premium',
        agentType: 'claude-agent',
        location: 'api',
        model: 'claude-3-sonnet',
        estimatedCost: '$0.05/min',
        expectedQuality: 'Excellent',
        expectedSpeed: 'Medium',
        instructions: 'Use Claude API for highest quality output'
      },
      gemini: {
        name: 'Gemini Free Tier',
        agentType: 'gemini-agent',
        location: 'api',
        model: 'gemini-pro',
        estimatedCost: '$0.02/min',
        expectedQuality: 'High',
        expectedSpeed: 'Medium',
        instructions: 'Use Gemini free tier for cost-effective processing'
      },
      local: {
        name: 'Local Processing',
        agentType: 'local-agent',
        location: 'local',
        model: 'rule-based',
        estimatedCost: '$0.00/min',
        expectedQuality: 'Medium',
        expectedSpeed: 'Very Fast',
        instructions: 'Use local rule-based processing'
      }
    };

    return strategies[deployment] || strategies.local;
  }

  async calculateCostEfficiency(strategy, estimatedDuration) {
    const costPerHour = parseFloat(strategy.estimatedCost.replace(/[$\/minhour]/g, ''));
    const totalCost = (costPerHour * estimatedDuration) / 60; // Convert to actual cost

    return {
      strategy: strategy.name,
      duration: estimatedDuration,
      totalCost: totalCost,
      costEfficiency: totalCost === 0 ? 'Maximum' : `$${totalCost.toFixed(4)}`,
      recommendation: totalCost === 0 ? 'Highly Recommended - Zero Cost' :
                     totalCost < 0.10 ? 'Recommended - Low Cost' : 'Consider alternatives'
    };
  }

  generateOptimizationReport(strategy, taskDescription) {
    return {
      task: taskDescription,
      selectedStrategy: strategy,
      reasoning: `Selected ${strategy.name} for optimal balance of cost, quality, and speed`,
      alternatives: this.getAlternativeStrategies(strategy),
      specCompliance: 'Strategy maintains spec kit framework compliance',
      costSavings: strategy.estimatedCost === '$0.00/min' ? 'Maximum savings with local processing' :
                   'Cost-optimized deployment'
    };
  }

  getAlternativeStrategies(primaryStrategy) {
    return Object.keys(this.deploymentOptions)
      .filter(key => key !== primaryStrategy.agentType)
      .map(key => ({
        name: key,
        tradeoff: `${this.deploymentOptions[key].latency} latency, cost: ${this.deploymentOptions[key].costPerMinute}/min`
      }));
  }
}

export default IntelligentDeploymentOptimizer;