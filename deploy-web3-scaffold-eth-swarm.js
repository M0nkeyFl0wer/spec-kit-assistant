#!/usr/bin/env node
/**
 * Web3 Swarm - Scaffold-ETH Edition
 * Specialized swarm for Ethereum dApp development using Scaffold-ETH-2
 */

import chalk from 'chalk';
import { ScaffoldEthIntegration } from './src/integrations/scaffold-eth.js';
import { SpecCharacter } from './src/character/spec.js';

class Web3ScaffoldEthSwarm {
  constructor() {
    this.spec = new SpecCharacter();
    this.integration = new ScaffoldEthIntegration();
    this.agents = {
      'contract-architect': {
        name: 'Smart Contract Architect',
        emoji: '🏗️',
        skills: ['solidity', 'openzeppelin', 'security-patterns', 'gas-optimization'],
        description: 'Designs and generates secure, optimized smart contracts'
      },
      'frontend-builder': {
        name: 'Web3 Frontend Builder',
        emoji: '🎨',
        skills: ['react', 'wagmi', 'viem', 'rainbowkit', 'nextjs'],
        description: 'Creates beautiful Web3 UIs with Scaffold-ETH hooks'
      },
      'deployment-specialist': {
        name: 'Deployment Specialist',
        emoji: '🚀',
        skills: ['hardhat', 'deployment-scripts', 'network-config', 'verification'],
        description: 'Handles contract deployment and verification'
      },
      'security-auditor': {
        name: 'Smart Contract Security Auditor',
        emoji: '🔒',
        skills: ['slither', 'mythril', 'vulnerability-detection', 'best-practices'],
        description: 'Audits contracts for security vulnerabilities'
      }
    };
  }

  async deploy(task) {
    console.log(chalk.hex('#8B5CF6').bold('\n🔗 Web3 Scaffold-ETH Swarm Deployed\n'));

    await this.spec.show('thinking', 'Analyzing your Web3 development task...');

    // Check if Scaffold-ETH project
    const isScaffoldEth = await this.integration.isScaffoldEthProject();

    if (!isScaffoldEth) {
      console.log(chalk.yellow('\n⚠️  Not a Scaffold-ETH project detected.'));
      console.log(chalk.white('\n💡 To create a new Scaffold-ETH project:\n'));
      console.log(chalk.cyan('   npx create-eth@latest my-dapp'));
      console.log(chalk.cyan('   cd my-dapp'));
      console.log(chalk.cyan('   node path/to/spec-assistant.js /scaffold-eth\n'));
      return;
    }

    // Get project info
    const projectInfo = await this.integration.getProjectInfo();
    console.log(chalk.green('✅ Scaffold-ETH-2 project detected!'));
    console.log(chalk.dim(`   Contracts: ${projectInfo.contracts.length}`));
    console.log(chalk.dim(`   Networks: ${projectInfo.networks.join(', ')}\n`));

    // Analyze task
    const analysis = await this.analyzeTask(task);

    // Deploy agents
    await this.deployAgents(analysis);

    // Generate artifacts
    await this.generateArtifacts(analysis);

    // Show summary
    await this.showSummary(analysis);
  }

  async analyzeTask(task) {
    console.log(chalk.blue('📋 Task Analysis\n'));

    const taskLower = task.toLowerCase();
    const analysis = {
      type: 'unknown',
      contractType: 'basic',
      needsFrontend: true,
      needsDeployment: true,
      needsAudit: true,
      components: []
    };

    // Detect task type
    if (taskLower.includes('nft') || taskLower.includes('721')) {
      analysis.type = 'nft';
      analysis.contractType = 'erc721';
      analysis.components.push('NFT Contract', 'Minting Component', 'Gallery Component');
    } else if (taskLower.includes('token') || taskLower.includes('erc20') || taskLower.includes('20')) {
      analysis.type = 'token';
      analysis.contractType = 'erc20';
      analysis.components.push('ERC-20 Token', 'Transfer Component');
    } else if (taskLower.includes('staking') || taskLower.includes('stake')) {
      analysis.type = 'staking';
      analysis.contractType = 'staking';
      analysis.components.push('Staking Contract', 'Stake UI', 'Rewards Dashboard');
    } else if (taskLower.includes('marketplace') || taskLower.includes('market')) {
      analysis.type = 'marketplace';
      analysis.contractType = 'marketplace';
      analysis.components.push('Marketplace Contract', 'Listing UI', 'Buy Component');
    } else if (taskLower.includes('dao') || taskLower.includes('governance')) {
      analysis.type = 'dao';
      analysis.contractType = 'basic';
      analysis.components.push('DAO Contract', 'Voting UI', 'Proposal Component');
    } else if (taskLower.includes('dex') || taskLower.includes('swap')) {
      analysis.type = 'dex';
      analysis.contractType = 'basic';
      analysis.components.push('DEX Contract', 'Swap UI', 'Liquidity Pool');
    }

    console.log(chalk.white(`   Type: ${chalk.cyan(analysis.type)}`));
    console.log(chalk.white(`   Contract: ${chalk.cyan(analysis.contractType)}`));
    console.log(chalk.white(`   Components: ${chalk.cyan(analysis.components.length)}\n`));

    return analysis;
  }

  async deployAgents(analysis) {
    console.log(chalk.blue('🤖 Deploying Agents\n'));

    for (const [key, agent] of Object.entries(this.agents)) {
      console.log(chalk.white(`   ${agent.emoji} ${agent.name}`));
      console.log(chalk.dim(`      ${agent.description}`));
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    console.log('');
  }

  async generateArtifacts(analysis) {
    console.log(chalk.blue('⚙️  Generating Artifacts\n'));

    const artifacts = {
      contracts: [],
      deployScripts: [],
      components: [],
      tests: []
    };

    try {
      // Determine contract name from type
      const contractName = this.getContractName(analysis.type);

      // Generate contract
      console.log(chalk.white(`   🏗️  Generating ${contractName} contract...`));
      const contractPath = await this.integration.generateContract(
        contractName,
        analysis.contractType
      );
      artifacts.contracts.push(contractPath);

      // Generate deployment script
      console.log(chalk.white(`   🚀 Generating deployment script...`));
      const deployPath = await this.integration.generateDeployScript(contractName);
      artifacts.deployScripts.push(deployPath);

      // Generate frontend component
      if (analysis.needsFrontend) {
        console.log(chalk.white(`   🎨 Generating frontend component...`));
        const componentPath = await this.integration.generateFrontendComponent(
          contractName,
          'interact'
        );
        artifacts.components.push(componentPath);
      }

      console.log(chalk.green('\n✅ All artifacts generated successfully!\n'));

      return artifacts;
    } catch (error) {
      console.error(chalk.red('\n❌ Error generating artifacts:'), error.message);
      throw error;
    }
  }

  getContractName(type) {
    const names = {
      nft: 'MyNFTCollection',
      token: 'MyToken',
      staking: 'StakingPool',
      marketplace: 'NFTMarketplace',
      dao: 'DAOGovernance',
      dex: 'SimpleDEX',
      unknown: 'MyContract'
    };
    return names[type] || names.unknown;
  }

  async showSummary(analysis) {
    console.log(chalk.hex('#8B5CF6').bold('📊 Deployment Summary\n'));

    console.log(chalk.white('Generated Files:'));
    console.log(chalk.green('   ✅ Smart Contract (Solidity)'));
    console.log(chalk.green('   ✅ Deployment Script (Hardhat)'));
    console.log(chalk.green('   ✅ Frontend Component (React + Scaffold-ETH hooks)'));

    console.log(chalk.white('\n\nNext Steps:'));
    console.log(chalk.cyan('   1. Deploy locally:'));
    console.log(chalk.white('      cd packages/hardhat && yarn deploy\n'));
    console.log(chalk.cyan('   2. Start frontend:'));
    console.log(chalk.white('      cd packages/nextjs && yarn start\n'));
    console.log(chalk.cyan('   3. Test your dApp:'));
    console.log(chalk.white('      Open http://localhost:3000\n'));

    console.log(chalk.white('\nFor testnet deployment:'));
    console.log(chalk.white('   yarn deploy --network sepolia\n'));

    await this.spec.show('success', 'Web3 swarm deployment complete! Your dApp is ready to build! 🚀');
  }
}

// CLI Usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const swarm = new Web3ScaffoldEthSwarm();
  const task = process.argv.slice(2).join(' ') || 'Create a basic Web3 application';

  console.log(chalk.hex('#8B5CF6').bold('═══════════════════════════════════════'));
  console.log(chalk.hex('#EC4899').bold('   🔗 Web3 Scaffold-ETH Swarm'));
  console.log(chalk.hex('#8B5CF6').bold('═══════════════════════════════════════\n'));

  swarm
    .deploy(task)
    .then(() => {
      console.log(chalk.green('\n🎉 Swarm mission complete!\n'));
      process.exit(0);
    })
    .catch(error => {
      console.error(chalk.red('\n❌ Swarm deployment failed:'), error.message);
      console.error(error.stack);
      process.exit(1);
    });
}

export { Web3ScaffoldEthSwarm };
