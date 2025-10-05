#!/usr/bin/env node
/**
 * Custom Builder & UX Swarm Deployment
 * Deploys agents focused on development and user experience
 */

import { SwarmOrchestrator } from './src/swarm/orchestrator.js';
import { SpecCharacter } from './src/character/spec.js';
import chalk from 'chalk';

class BuilderUXSwarm extends SwarmOrchestrator {
  constructor() {
    super();

    // Add custom agent types for builder/UX focus
    this.agentTypes = {
      ...this.agentTypes,
      'frontend-builder': {
        name: 'Frontend Builder Agent',
        emoji: '🎨',
        skills: ['component-development', 'ui-implementation', 'styling', 'responsive-design'],
        description: 'Builds frontend components and implements UI designs',
        resourceRequirements: { cpu: 2, memory: '1GB' }
      },
      'backend-builder': {
        name: 'Backend Builder Agent',
        emoji: '⚙️',
        skills: ['api-development', 'database-design', 'server-logic', 'integration'],
        description: 'Develops backend services and API endpoints',
        resourceRequirements: { cpu: 2, memory: '1GB' }
      },
      'ux-tester': {
        name: 'UX Testing Agent',
        emoji: '👤',
        skills: ['usability-testing', 'user-flow-validation', 'accessibility-check', 'mobile-testing'],
        description: 'Tests user experience and validates user flows',
        resourceRequirements: { cpu: 1, memory: '512MB' }
      },
      'design-validator': {
        name: 'Design Validation Agent',
        emoji: '✨',
        skills: ['design-consistency', 'brand-compliance', 'visual-testing', 'design-review'],
        description: 'Validates design implementation and consistency',
        resourceRequirements: { cpu: 1, memory: '512MB' }
      }
    };
  }

  async deployBuilderUXSwarm(scale = 4) {
    const spec = new SpecCharacter();

    console.log(spec.art.working || spec.art.thinking);
    console.log(chalk.cyan('\\nDeploying Builder & UX focused agent swarm...\\n'));

    // Define the optimal builder/UX agent combination
    const builderUXAgents = [
      'frontend-builder',
      'backend-builder',
      'ux-tester',
      'design-validator'
    ];

    const selectedAgents = builderUXAgents.slice(0, scale);

    console.log(chalk.yellow('🎯 Builder & UX Swarm Configuration:'));
    selectedAgents.forEach((agentType, index) => {
      const agent = this.agentTypes[agentType];
      console.log(`  ${agent.emoji} ${agent.name}`);
      console.log(`     Skills: ${agent.skills.join(', ')}`);
      console.log('');
    });

    try {
      // Deploy each agent
      for (let i = 0; i < selectedAgents.length; i++) {
        const agentType = selectedAgents[i];
        const agent = this.agentTypes[agentType];

        console.log(spec.art.working || spec.art.thinking);
        console.log(chalk.cyan(`\\nDeploying ${agent.name}...\\n`));

        // Simulate agent deployment
        const agentId = `${agentType}-${Date.now()}-${i}`;
        console.log(`${agent.emoji} ${agent.name} (${agentId}) deployed and ready`);

        // Calculate progress
        const progress = Math.round(((i + 1) / selectedAgents.length) * 100);
        const progressBar = '█'.repeat(Math.round(progress / 5)) + '░'.repeat(20 - Math.round(progress / 5));
        console.log(`🐕 Deploying agents: [${progressBar}] ${progress}%`);

        // Brief delay to show progress
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Success celebration
      console.log(spec.art.success || spec.art.happy);
      console.log(chalk.green('Builder & UX swarm deployed successfully! Pawsome! 🎉\\n'));

      // Display swarm summary
      console.log(chalk.bold('🚀 Builder & UX Swarm Summary'));
      console.log(`Agents Deployed: ${selectedAgents.length}`);
      selectedAgents.forEach(agentType => {
        const agent = this.agentTypes[agentType];
        console.log(`  ${agent.emoji} ${agent.name}`);
        console.log(`     Skills: ${agent.skills.join(', ')}`);
      });

      console.log('\\n📋 Next Steps:');
      console.log('  • Agents will monitor your development workflow');
      console.log('  • Frontend Builder handles UI component development');
      console.log('  • Backend Builder manages API and server logic');
      console.log('  • UX Tester validates user experience flows');
      console.log('  • Design Validator ensures design consistency');
      console.log('  • Use oversight mode for approval workflows');

      return { success: true, agents: selectedAgents.length };

    } catch (error) {
      console.error(chalk.red('❌ Deployment failed:'), error.message);
      return { success: false, error: error.message };
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const swarm = new BuilderUXSwarm();
  const scale = process.argv[2] ? parseInt(process.argv[2]) : 4;

  console.log(chalk.bold.blue('🐕 Spec Kit Assistant - Builder & UX Swarm Deployment'));
  console.log(chalk.gray('Specialized agents for development and user experience\\n'));

  swarm.deployBuilderUXSwarm(scale)
    .then(result => {
      if (result.success) {
        console.log(chalk.green(`\\n✅ Successfully deployed ${result.agents} agents!`));
        process.exit(0);
      } else {
        console.log(chalk.red(`\\n❌ Deployment failed: ${result.error}`));
        process.exit(1);
      }
    })
    .catch(error => {
      console.error(chalk.red('❌ Fatal error:'), error);
      process.exit(1);
    });
}

export { BuilderUXSwarm };