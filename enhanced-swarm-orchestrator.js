#!/usr/bin/env node
/**
 * Enhanced Swarm Orchestrator with Gemini Queen Coordinator
 * Integrates free Gemini tokens for intelligent task coordination
 */

import { SwarmOrchestrator } from './src/swarm/orchestrator.js';
import { GeminiCoordinatorAgent } from './gemini-coordinator-agent.js';
import { SpecCharacter } from './src/character/spec.js';
import chalk from 'chalk';

class EnhancedSwarmOrchestrator extends SwarmOrchestrator {
  constructor() {
    super();
    this.queenCoordinator = new GeminiCoordinatorAgent();
    this.spec = new SpecCharacter();

    // Enhanced agent types including all our swarms
    this.agentTypes = {
      ...this.agentTypes,

      // Queen Coordinator
      'gemini-coordinator': {
        name: 'Gemini Queen Coordinator',
        emoji: '👑',
        skills: ['task-coordination', 'swarm-orchestration', 'git-integration', 'token-optimization'],
        description: 'Uses free Gemini tokens to coordinate multi-swarm tasks',
        resourceRequirements: { cpu: 1, memory: '256MB' }
      },

      // Data Science Swarm (already deployed)
      'data-analyst': {
        name: 'Data Analysis Agent',
        emoji: '📊',
        skills: ['pandas', 'numpy', 'statistical-analysis', 'data-cleaning'],
        description: 'Analyzes datasets and generates insights'
      },
      'ml-engineer': {
        name: 'Machine Learning Agent',
        emoji: '🤖',
        skills: ['scikit-learn', 'model-training', 'feature-engineering'],
        description: 'Builds and trains ML models'
      },
      'viz-specialist': {
        name: 'Data Visualization Agent',
        emoji: '📈',
        skills: ['plotly', 'streamlit', 'interactive-dashboards'],
        description: 'Creates beautiful visualizations'
      },
      'web-scraper': {
        name: 'Web Data Collection Agent',
        emoji: '🕷️',
        skills: ['web-scraping', 'chrome-mcp', 'data-collection'],
        description: 'Collects data using Chrome MCP "eyes"'
      },

      // Builder & UX Swarm (already deployed)
      'frontend-builder': {
        name: 'Frontend Builder Agent',
        emoji: '🎨',
        skills: ['react', 'vue', 'angular', 'responsive-design'],
        description: 'Builds frontend components'
      },
      'backend-builder': {
        name: 'Backend Builder Agent',
        emoji: '⚙️',
        skills: ['api-development', 'database-design', 'server-logic'],
        description: 'Develops backend services'
      },

      // Research Swarm
      'osint-researcher': {
        name: 'OSINT Research Agent',
        emoji: '🔍',
        skills: ['open-source-intelligence', 'fact-checking', 'source-validation'],
        description: 'Conducts open source intelligence research'
      },
      'academic-researcher': {
        name: 'Academic Research Agent',
        emoji: '📚',
        skills: ['literature-review', 'citation-management', 'peer-review'],
        description: 'Researches academic papers and citations'
      }
    };
  }

  async deployIntelligentSwarm(task, options = {}) {
    console.log(chalk.bold.blue('👑 Enhanced Swarm Orchestration with Queen Coordinator'));
    console.log(chalk.gray(`Task: ${task}\n`));

    // Step 1: Queen Coordinator analyzes task
    console.log(chalk.cyan('👑 Queen Coordinator analyzing task...'));
    const coordination = await this.queenCoordinator.coordinateSwarmTask(task, options);

    console.log(chalk.green('✅ Coordination plan generated:'));
    console.log(`  📋 Analysis: ${coordination.analysis}`);
    console.log(`  🤖 Recommended Swarms: ${coordination.recommended_swarms.join(', ')}`);
    console.log(`  🔧 Git Strategy: ${coordination.git_strategy}`);
    console.log(`  ⏱️ Estimated Duration: ${coordination.estimated_duration}`);
    console.log(`  💰 Token Efficiency: ${coordination.token_efficiency}\n`);

    // Step 2: Setup git integration if requested
    if (coordination.git_strategy && coordination.git_strategy !== 'none') {
      await this.queenCoordinator.setupGitIntegration(coordination.git_strategy, task);
    }

    // Step 3: Deploy recommended swarms
    const deploymentResults = [];

    for (const swarmType of coordination.recommended_swarms) {
      console.log(chalk.blue(`🚀 Deploying ${swarmType} swarm...`));

      try {
        const result = await this.deploySpecificSwarm(swarmType, task);
        deploymentResults.push({ swarm: swarmType, result });
        console.log(chalk.green(`✅ ${swarmType} swarm deployed successfully`));
      } catch (error) {
        console.log(chalk.red(`❌ ${swarmType} swarm deployment failed: ${error.message}`));
        deploymentResults.push({ swarm: swarmType, error: error.message });
      }
    }

    // Step 4: Show final status
    this.displaySwarmStatus(deploymentResults);
    this.queenCoordinator.displayStatus();

    return {
      coordination,
      deployments: deploymentResults,
      success: deploymentResults.some(r => !r.error)
    };
  }

  async deploySpecificSwarm(swarmType, task) {
    const swarmAgents = this.getSwarmAgents(swarmType);

    console.log(chalk.yellow(`  🤖 ${swarmType} agents:`));
    swarmAgents.forEach(agentType => {
      const agent = this.agentTypes[agentType];
      if (agent) {
        console.log(`    ${agent.emoji} ${agent.name}`);
      }
    });

    // Simulate deployment with Spec animations
    console.log(this.spec.art.working);

    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      agents: swarmAgents.length,
      status: 'deployed',
      task: task
    };
  }

  getSwarmAgents(swarmType) {
    const swarmMappings = {
      'data-science': ['data-analyst', 'ml-engineer', 'viz-specialist', 'web-scraper'],
      'builder-ux': ['frontend-builder', 'backend-builder', 'ux-tester', 'design-validator'],
      'research': ['osint-researcher', 'academic-researcher', 'market-researcher', 'data-miner'],
      'content': ['content-writer', 'social-media-agent', 'seo-optimizer', 'publisher'],
      'video': ['script-writer', 'video-editor', 'effects-artist', 'distributor'],
      'red-team': ['vulnerability-scanner', 'code-auditor', 'penetration-tester', 'compliance-checker'],
      'debugging': ['bug-hunter', 'performance-profiler', 'code-reviewer', 'test-generator'],
      'prototyping': ['mvp-builder', 'ui-designer', 'api-architect', 'demo-creator']
    };

    return swarmMappings[swarmType] || ['general-agent'];
  }

  displaySwarmStatus(deploymentResults) {
    console.log(chalk.bold('\n📊 Swarm Deployment Summary:'));

    deploymentResults.forEach(deployment => {
      if (deployment.error) {
        console.log(`  ❌ ${deployment.swarm}: ${deployment.error}`);
      } else {
        console.log(`  ✅ ${deployment.swarm}: ${deployment.result.agents} agents deployed`);
      }
    });

    const successCount = deploymentResults.filter(r => !r.error).length;
    const totalCount = deploymentResults.length;

    console.log(`\n🎯 Success Rate: ${successCount}/${totalCount} swarms deployed\n`);
  }

  async rambleIntegration(voiceInput) {
    console.log(chalk.magenta('🗣️ Ramble Integration with Queen Coordinator'));

    // Process voice input (simulated for now)
    const processedTask = voiceInput || "Build a data visualization dashboard for climate data";

    console.log(chalk.blue(`📝 Processed ramble: "${processedTask}"`));

    // Use Queen Coordinator for intelligent swarm deployment
    return await this.deployIntelligentSwarm(processedTask, {
      source: 'ramble',
      priority: 'high',
      user_context: 'voice_driven'
    });
  }
}

// CLI Usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new EnhancedSwarmOrchestrator();

  const command = process.argv[2];
  const task = process.argv.slice(3).join(' ') || 'Build a simple web application';

  switch (command) {
    case 'deploy':
      orchestrator.deployIntelligentSwarm(task)
        .then(result => {
          console.log(chalk.green('🎉 Intelligent swarm deployment complete!'));
          process.exit(0);
        })
        .catch(error => {
          console.error(chalk.red('❌ Deployment failed:'), error);
          process.exit(1);
        });
      break;

    case 'ramble':
      orchestrator.rambleIntegration(task)
        .then(result => {
          console.log(chalk.green('🎉 Ramble-driven swarm deployment complete!'));
          process.exit(0);
        })
        .catch(error => {
          console.error(chalk.red('❌ Ramble integration failed:'), error);
          process.exit(1);
        });
      break;

    default:
      console.log(chalk.yellow('Enhanced Swarm Orchestrator with Gemini Queen Coordinator'));
      console.log(chalk.gray('Usage:'));
      console.log('  node enhanced-swarm-orchestrator.js deploy "task description"');
      console.log('  node enhanced-swarm-orchestrator.js ramble "voice input"');
      break;
  }
}

export { EnhancedSwarmOrchestrator };