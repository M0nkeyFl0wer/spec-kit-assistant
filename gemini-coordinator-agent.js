#!/usr/bin/env node
/**
 * Gemini CLI Coordinator Agent
 * Queen agent that uses free Gemini tokens to coordinate swarm tasks
 */

import { execSync, spawnSync } from 'child_process';
import chalk from 'chalk';

class GeminiCoordinatorAgent {
  constructor() {
    this.agentType = 'gemini-coordinator';
    this.name = 'Gemini Queen Coordinator';
    this.emoji = '👑';
    this.skills = ['task-coordination', 'swarm-orchestration', 'git-integration', 'free-token-optimization'];
    this.dailyTokenLimit = 1000; // Gemini free tier
    this.tokensUsed = 0;

    console.log(chalk.cyan('👑 Gemini Queen Coordinator initializing...'));
    this.checkGeminiCLI();
  }

  checkGeminiCLI() {
    try {
      execSync('gemini --version', { stdio: 'pipe' });
      console.log(chalk.green('✅ Gemini CLI available and ready'));
      return true;
    } catch (error) {
      console.log(chalk.yellow('⚠️ Gemini CLI not found - install with: pip install google-generativeai'));
      return false;
    }
  }

  async coordinateSwarmTask(task, context = {}) {
    if (this.tokensUsed >= this.dailyTokenLimit) {
      console.log(chalk.yellow('⚠️ Gemini daily token limit reached, falling back to local agents'));
      return this.fallbackToLocalAgents(task);
    }

    const prompt = this.buildCoordinatorPrompt(task, context);

    try {
      console.log(chalk.cyan('👑 Queen Coordinator analyzing task...'));

      // SECURITY FIX: Use spawn instead of execSync to prevent command injection
      const result = spawnSync('gemini', [], {
        input: prompt,
        encoding: 'utf8',
        timeout: 10000,
        shell: false  // Explicitly disable shell
      });

      if (result.error) {
        throw result.error;
      }

      const response = result.stdout;

      this.tokensUsed += this.estimateTokens(prompt + response);

      console.log(chalk.green('👑 Coordination plan generated'));
      return this.parseCoordinationResponse(response);

    } catch (error) {
      console.log(chalk.yellow('⚠️ Gemini coordination failed, using local fallback'));
      return this.fallbackToLocalAgents(task);
    }
  }

  buildCoordinatorPrompt(task, context) {
    return `You are the Queen Coordinator Agent for an Ultimate Toolkit swarm system.

TASK: ${task}
CONTEXT: ${JSON.stringify(context, null, 2)}

AVAILABLE SWARMS:
- Data Science: 📊 Analysis, ML, Visualization, Web Scraping
- Builder & UX: 🎨 Frontend, Backend, UX Testing, Design Validation
- Research: 🔍 OSINT, Academic, Market, Data Mining
- Content: 📝 Writing, Social Media, SEO, Publishing
- Video: 🎬 Script, Editing, Effects, Distribution
- Red Team: 🛡️ Security, Vulnerability, Compliance, Auditing
- Debugging: 🐛 Bug Hunting, Performance, Code Review, Testing
- Prototyping: 🚀 MVP Building, UI/UX Design, API Architecture, Demos

GIT INTEGRATION OPTIONS:
- Create branch for feature work
- Generate issues for tracking
- Setup GitHub Actions for automation
- Coordinate pull request reviews

COORDINATION STRATEGY:
1. Analyze the task complexity and requirements
2. Recommend which swarms to deploy (be specific)
3. Suggest git workflow integration
4. Provide coordination timeline
5. Identify potential bottlenecks

Respond in JSON format:
{
  "analysis": "brief task analysis",
  "recommended_swarms": ["swarm1", "swarm2"],
  "git_strategy": "branch/issue/action strategy",
  "coordination_plan": "step by step plan",
  "estimated_duration": "time estimate",
  "token_efficiency": "how to minimize API usage"
}`;
  }

  parseCoordinationResponse(response) {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.log(chalk.yellow('⚠️ Failed to parse Gemini response, using structured fallback'));
    }

    // Fallback structured response
    return {
      analysis: "Task requires multi-swarm coordination",
      recommended_swarms: ["data-science", "builder-ux"],
      git_strategy: "feature-branch-workflow",
      coordination_plan: "Deploy swarms, coordinate via git issues, track progress",
      estimated_duration: "2-4 hours",
      token_efficiency: "Use local agents for routine tasks, Gemini for complex coordination"
    };
  }

  fallbackToLocalAgents(task) {
    console.log(chalk.blue('🤖 Using local agent coordination fallback'));

    // Simple local coordination logic
    const taskType = this.analyzeTaskType(task);

    return {
      analysis: `Local analysis: ${taskType} task detected`,
      recommended_swarms: this.getRecommendedSwarms(taskType),
      git_strategy: "standard-feature-branch",
      coordination_plan: "Sequential swarm deployment with local coordination",
      estimated_duration: "1-3 hours",
      token_efficiency: "100% local processing"
    };
  }

  analyzeTaskType(task) {
    const taskLower = task.toLowerCase();

    if (taskLower.includes('data') || taskLower.includes('analysis')) return 'data-science';
    if (taskLower.includes('ui') || taskLower.includes('frontend')) return 'builder-ux';
    if (taskLower.includes('research') || taskLower.includes('information')) return 'research';
    if (taskLower.includes('content') || taskLower.includes('writing')) return 'content';
    if (taskLower.includes('video') || taskLower.includes('media')) return 'video';
    if (taskLower.includes('security') || taskLower.includes('test')) return 'red-team';
    if (taskLower.includes('bug') || taskLower.includes('debug')) return 'debugging';
    if (taskLower.includes('prototype') || taskLower.includes('mvp')) return 'prototyping';

    return 'general';
  }

  getRecommendedSwarms(taskType) {
    const swarmMappings = {
      'data-science': ['data-science', 'research'],
      'builder-ux': ['builder-ux', 'prototyping'],
      'research': ['research', 'content'],
      'content': ['content', 'research'],
      'video': ['video', 'content'],
      'red-team': ['red-team', 'debugging'],
      'debugging': ['debugging', 'builder-ux'],
      'prototyping': ['prototyping', 'builder-ux'],
      'general': ['builder-ux', 'research']
    };

    return swarmMappings[taskType] || ['builder-ux'];
  }

  async setupGitIntegration(strategy, task) {
    console.log(chalk.blue(`🔧 Setting up git integration: ${strategy}`));

    try {
      const branchName = this.generateBranchName(task);

      // SECURITY FIX: Validate branch name to prevent command injection
      if (!/^[a-zA-Z0-9._/-]+$/.test(branchName)) {
        throw new Error('Invalid branch name - contains unsafe characters');
      }

      switch (strategy) {
        case 'feature-branch-workflow':
          // SECURITY FIX: Use spawnSync instead of execSync
          const result = spawnSync('git', ['checkout', '-b', branchName], {
            stdio: 'inherit',
            shell: false
          });
          if (result.error || result.status !== 0) {
            throw new Error('Failed to create git branch');
          }
          console.log(chalk.green(`✅ Created feature branch: ${branchName}`));
          break;

        case 'issue-tracking':
          // Could integrate with GitHub CLI to create issues
          console.log(chalk.blue('📋 Issue tracking strategy activated'));
          break;

        case 'github-actions':
          console.log(chalk.blue('⚙️ GitHub Actions integration planned'));
          break;
      }

    } catch (error) {
      console.log(chalk.yellow('⚠️ Git integration setup failed, continuing without'));
    }
  }

  generateBranchName(task) {
    const cleanTask = task
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);

    const timestamp = new Date().toISOString().slice(0, 10);
    return `swarm-task-${cleanTask}-${timestamp}`;
  }

  estimateTokens(text) {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  getTokenUsageStatus() {
    const remaining = this.dailyTokenLimit - this.tokensUsed;
    const percentage = (this.tokensUsed / this.dailyTokenLimit) * 100;

    return {
      used: this.tokensUsed,
      remaining: remaining,
      percentage: Math.round(percentage),
      canContinue: remaining > 50
    };
  }

  displayStatus() {
    const status = this.getTokenUsageStatus();

    console.log(chalk.cyan('👑 Gemini Queen Coordinator Status:'));
    console.log(`  📊 Tokens used: ${status.used}/${this.dailyTokenLimit} (${status.percentage}%)`);
    console.log(`  ⚡ Remaining: ${status.remaining} tokens`);
    console.log(`  🚦 Status: ${status.canContinue ? chalk.green('Ready') : chalk.yellow('Near limit')}`);
  }
}

// Export for use in swarm orchestration
export { GeminiCoordinatorAgent };

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const coordinator = new GeminiCoordinatorAgent();

  if (process.argv[2]) {
    const task = process.argv.slice(2).join(' ');

    coordinator.coordinateSwarmTask(task, { source: 'cli' })
      .then(result => {
        console.log(chalk.green('👑 Coordination Result:'));
        console.log(JSON.stringify(result, null, 2));
        coordinator.displayStatus();
      })
      .catch(error => {
        console.error(chalk.red('❌ Coordination failed:'), error);
      });
  } else {
    console.log(chalk.yellow('Usage: node gemini-coordinator-agent.js "task description"'));
    coordinator.displayStatus();
  }
}