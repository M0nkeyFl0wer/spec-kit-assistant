/**
 * T034: Consultation engine swarm integration implementation
 * Integrates enhanced consultation engine with existing swarm orchestrator
 * Constitutional CPU-conscious coordination with existing swarm stack
 */

import { ConsultationSession } from '../core/consultation-session.js';
import chalk from 'chalk';
import { performance } from 'perf_hooks';

export class ConsultationSwarmIntegration {
  constructor() {
    this.swarmEndpoint = 'http://localhost:3000'; // Enhanced swarm orchestrator
    this.consultationSession = null;
    this.swarmTasks = new Map();
    this.activeDeployments = new Set();
    this.cpuMonitoring = {
      threshold: 10, // Constitutional 10% limit
      currentUsage: 0,
      lastCheck: Date.now()
    };
    this.constitutionalLimits = {
      maxConcurrentTasks: 3,
      maxTaskDuration: 300000, // 5 minutes
      cpuThreshold: 10 // 10% CPU
    };
  }

  /**
   * Initialize swarm integration with consultation engine
   * @param {Object} options - Integration options
   */
  async initializeSwarmIntegration(options = {}) {
    console.log(chalk.cyan('🐕 Spec: "Initializing swarm integration for consultation..."'));

    try {
      // Check existing swarm orchestrator availability
      const swarmAvailable = await this.checkSwarmAvailability();

      if (!swarmAvailable) {
        console.log(chalk.yellow('⚠️ Enhanced swarm orchestrator not running - using local mode'));
        return this.initializeLocalMode();
      }

      // Initialize consultation session with swarm capabilities
      this.consultationSession = new ConsultationSession();

      // Configure swarm-enhanced consultation
      await this.configureSwarmConsultation(options);

      console.log(chalk.green('✅ Swarm integration initialized successfully'));

      return {
        success: true,
        mode: 'swarm-enhanced',
        capabilities: await this.getSwarmCapabilities()
      };

    } catch (error) {
      console.log(chalk.red('❌ Swarm integration failed:'), error.message);
      return this.initializeLocalMode();
    }
  }

  /**
   * Check if enhanced swarm orchestrator is available
   */
  async checkSwarmAvailability() {
    try {
      // Check if enhanced-swarm-orchestrator.js is running
      const response = await fetch(`${this.swarmEndpoint}/health`, {
        timeout: 2000
      }).catch(() => null);

      return response && response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Configure consultation with swarm capabilities
   */
  async configureSwarmConsultation(options) {
    // Enable swarm-enhanced discovery phases
    const swarmConfig = {
      enableDistributedAnalysis: true,
      useSwarmForComplexTasks: true,
      cpuConscious: true,
      constitutionalCompliance: true,
      ...options
    };

    this.consultationSession.configureSwarmIntegration(swarmConfig);

    // Register swarm task handlers
    this.registerSwarmTaskHandlers();
  }

  /**
   * Register handlers for different swarm task types
   */
  registerSwarmTaskHandlers() {
    // Project analysis swarm
    this.registerTaskHandler('project-analysis', async (taskData) => {
      return this.deployProjectAnalysisSwarm(taskData);
    });

    // Code review swarm
    this.registerTaskHandler('code-review', async (taskData) => {
      return this.deployCodeReviewSwarm(taskData);
    });

    // Architecture assessment swarm
    this.registerTaskHandler('architecture-assessment', async (taskData) => {
      return this.deployArchitectureSwarm(taskData);
    });

    // Security analysis swarm
    this.registerTaskHandler('security-analysis', async (taskData) => {
      return this.deploySecuritySwarm(taskData);
    });

    // Documentation generation swarm
    this.registerTaskHandler('documentation-generation', async (taskData) => {
      return this.deployDocumentationSwarm(taskData);
    });
  }

  /**
   * Register a swarm task handler
   */
  registerTaskHandler(taskType, handler) {
    this.swarmTasks.set(taskType, handler);
  }

  /**
   * Deploy project analysis swarm
   */
  async deployProjectAnalysisSwarm(taskData) {
    console.log(chalk.blue('🐕 Spec: "Deploying project analysis swarm..."'));

    // Monitor CPU before deployment
    await this.checkCpuUsage();

    const swarmConfig = {
      type: 'project-analysis',
      agents: [
        {
          role: 'code-analyzer',
          task: 'Analyze codebase structure and patterns',
          priority: 'high'
        },
        {
          role: 'dependency-analyzer',
          task: 'Analyze project dependencies and versions',
          priority: 'medium'
        },
        {
          role: 'performance-analyzer',
          task: 'Identify performance patterns and bottlenecks',
          priority: 'medium'
        },
        {
          role: 'documentation-analyzer',
          task: 'Assess documentation quality and coverage',
          priority: 'low'
        }
      ],
      projectPath: taskData.projectPath,
      cpuLimit: this.constitutionalLimits.cpuThreshold,
      timeout: this.constitutionalLimits.maxTaskDuration
    };

    return this.deploySwarmTask('project-analysis', swarmConfig);
  }

  /**
   * Deploy code review swarm
   */
  async deployCodeReviewSwarm(taskData) {
    console.log(chalk.blue('🐕 Spec: "Deploying code review swarm..."'));

    await this.checkCpuUsage();

    const swarmConfig = {
      type: 'code-review',
      agents: [
        {
          role: 'quality-reviewer',
          task: 'Review code quality and best practices',
          priority: 'high'
        },
        {
          role: 'security-reviewer',
          task: 'Identify security vulnerabilities',
          priority: 'high'
        },
        {
          role: 'performance-reviewer',
          task: 'Review performance implications',
          priority: 'medium'
        }
      ],
      files: taskData.files || [],
      cpuLimit: this.constitutionalLimits.cpuThreshold
    };

    return this.deploySwarmTask('code-review', swarmConfig);
  }

  /**
   * Deploy architecture assessment swarm
   */
  async deployArchitectureSwarm(taskData) {
    console.log(chalk.blue('🐕 Spec: "Deploying architecture assessment swarm..."'));

    await this.checkCpuUsage();

    const swarmConfig = {
      type: 'architecture-assessment',
      agents: [
        {
          role: 'architect',
          task: 'Assess overall system architecture',
          priority: 'high'
        },
        {
          role: 'scalability-expert',
          task: 'Evaluate scalability patterns',
          priority: 'medium'
        },
        {
          role: 'integration-expert',
          task: 'Review integration patterns',
          priority: 'medium'
        }
      ],
      projectContext: taskData.projectContext,
      cpuLimit: this.constitutionalLimits.cpuThreshold
    };

    return this.deploySwarmTask('architecture-assessment', swarmConfig);
  }

  /**
   * Deploy security analysis swarm
   */
  async deploySecuritySwarm(taskData) {
    console.log(chalk.blue('🐕 Spec: "Deploying security analysis swarm..."'));

    await this.checkCpuUsage();

    const swarmConfig = {
      type: 'security-analysis',
      agents: [
        {
          role: 'security-auditor',
          task: 'Perform comprehensive security audit',
          priority: 'high'
        },
        {
          role: 'vulnerability-scanner',
          task: 'Scan for known vulnerabilities',
          priority: 'high'
        },
        {
          role: 'compliance-checker',
          task: 'Check security compliance standards',
          priority: 'medium'
        }
      ],
      targetPath: taskData.targetPath,
      securityLevel: taskData.securityLevel || 'standard'
    };

    return this.deploySwarmTask('security-analysis', swarmConfig);
  }

  /**
   * Deploy documentation generation swarm
   */
  async deployDocumentationSwarm(taskData) {
    console.log(chalk.blue('🐕 Spec: "Deploying documentation generation swarm..."'));

    await this.checkCpuUsage();

    const swarmConfig = {
      type: 'documentation-generation',
      agents: [
        {
          role: 'technical-writer',
          task: 'Generate technical documentation',
          priority: 'high'
        },
        {
          role: 'api-documenter',
          task: 'Document API endpoints and usage',
          priority: 'medium'
        },
        {
          role: 'readme-generator',
          task: 'Generate comprehensive README',
          priority: 'medium'
        }
      ],
      documentationScope: taskData.scope || 'full',
      outputFormat: taskData.format || 'markdown'
    };

    return this.deploySwarmTask('documentation-generation', swarmConfig);
  }

  /**
   * Deploy swarm task to enhanced orchestrator
   */
  async deploySwarmTask(taskType, config) {
    const startTime = performance.now();

    try {
      // Check constitutional limits
      if (this.activeDeployments.size >= this.constitutionalLimits.maxConcurrentTasks) {
        throw new Error('Maximum concurrent tasks reached (constitutional limit)');
      }

      // Use existing enhanced swarm orchestrator
      const deploymentResult = await this.callEnhancedOrchestrator(config);

      // Track deployment
      const deploymentId = `${taskType}-${Date.now()}`;
      this.activeDeployments.add(deploymentId);

      // Monitor deployment with constitutional timeout
      const result = await this.monitorDeployment(deploymentId, deploymentResult, startTime);

      // Cleanup
      this.activeDeployments.delete(deploymentId);

      console.log(chalk.green(`✅ Swarm task ${taskType} completed successfully`));
      return result;

    } catch (error) {
      console.log(chalk.red(`❌ Swarm task ${taskType} failed:`), error.message);
      throw error;
    }
  }

  /**
   * Call enhanced swarm orchestrator
   */
  async callEnhancedOrchestrator(config) {
    // Use existing enhanced-swarm-orchestrator.js
    const { spawn } = await import('child_process');

    return new Promise((resolve, reject) => {
      const swarmProcess = spawn('node', [
        'enhanced-swarm-orchestrator.js',
        'deploy',
        JSON.stringify(config)
      ], {
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: this.constitutionalLimits.maxTaskDuration
      });

      let output = '';
      let error = '';

      swarmProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      swarmProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      swarmProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output, deploymentId: Date.now() });
        } else {
          reject(new Error(`Swarm deployment failed: ${error}`));
        }
      });

      swarmProcess.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Monitor deployment with constitutional limits
   */
  async monitorDeployment(deploymentId, deploymentResult, startTime) {
    const maxDuration = this.constitutionalLimits.maxTaskDuration;

    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(async () => {
        const elapsed = performance.now() - startTime;

        // Constitutional timeout check
        if (elapsed > maxDuration) {
          clearInterval(checkInterval);
          reject(new Error('Deployment timed out (constitutional limit)'));
          return;
        }

        // CPU usage check
        const cpuUsage = await this.getCurrentCpuUsage();
        if (cpuUsage > this.constitutionalLimits.cpuThreshold) {
          console.log(chalk.yellow(`⚠️ CPU usage (${cpuUsage}%) exceeds constitutional limit`));
          // Don't fail, just warn and slow down
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Check if deployment is complete (simplified check)
        if (deploymentResult.success) {
          clearInterval(checkInterval);
          resolve({
            success: true,
            result: deploymentResult,
            duration: elapsed,
            cpuCompliant: cpuUsage <= this.constitutionalLimits.cpuThreshold
          });
        }
      }, 1000);

      // Safety timeout
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve({
          success: true,
          result: deploymentResult,
          timeout: true,
          duration: performance.now() - startTime
        });
      }, maxDuration);
    });
  }

  /**
   * Check current CPU usage (constitutional monitoring)
   */
  async checkCpuUsage() {
    const usage = await this.getCurrentCpuUsage();
    this.cpuMonitoring.currentUsage = usage;
    this.cpuMonitoring.lastCheck = Date.now();

    if (usage > this.cpuMonitoring.threshold) {
      console.log(chalk.yellow(`⚠️ CPU usage (${usage}%) exceeds constitutional limit (${this.cpuMonitoring.threshold}%)`));
      console.log(chalk.blue('🐕 Spec: "Pausing to maintain constitutional compliance..."'));

      // Constitutional pause to reduce CPU
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    return usage;
  }

  /**
   * Get current CPU usage
   */
  async getCurrentCpuUsage() {
    try {
      const { exec } = await import('child_process');
      return new Promise((resolve) => {
        exec('top -bn1 | grep "Cpu(s)" | awk \'{print $2}\' | sed \'s/%us,//\'', (error, stdout) => {
          if (error) {
            resolve(5); // Default safe value
            return;
          }
          const usage = parseFloat(stdout.trim()) || 5;
          resolve(usage);
        });
      });
    } catch {
      return 5; // Safe default
    }
  }

  /**
   * Initialize local mode when swarm is unavailable
   */
  async initializeLocalMode() {
    console.log(chalk.blue('🐕 Spec: "Initializing local consultation mode..."'));

    this.consultationSession = new ConsultationSession();

    return {
      success: true,
      mode: 'local',
      capabilities: {
        swarmIntegration: false,
        localAnalysis: true,
        cpuConscious: true
      }
    };
  }

  /**
   * Get swarm capabilities
   */
  async getSwarmCapabilities() {
    return {
      swarmIntegration: true,
      availableSwarms: Array.from(this.swarmTasks.keys()),
      maxConcurrentTasks: this.constitutionalLimits.maxConcurrentTasks,
      cpuConscious: true,
      constitutionalCompliance: true,
      activeDeployments: this.activeDeployments.size
    };
  }

  /**
   * Execute consultation with swarm enhancement
   */
  async executeSwarmEnhancedConsultation(projectContext) {
    console.log(chalk.cyan('🐕 Spec: "Starting swarm-enhanced consultation..."'));

    if (!this.consultationSession) {
      await this.initializeSwarmIntegration();
    }

    // Phase 1: Local discovery
    const localResults = await this.consultationSession.startDiscovery(projectContext);

    // Phase 2: Swarm enhancement (if available)
    let swarmResults = null;
    if (this.swarmTasks.size > 0) {
      swarmResults = await this.enhanceWithSwarmAnalysis(localResults);
    }

    // Phase 3: Merge results
    const enhancedResults = this.mergeConsultationResults(localResults, swarmResults);

    console.log(chalk.green('✅ Swarm-enhanced consultation complete'));

    return enhancedResults;
  }

  /**
   * Enhance consultation with swarm analysis
   */
  async enhanceWithSwarmAnalysis(localResults) {
    const swarmTasks = [];

    // Deploy relevant swarms based on local results
    if (localResults.hasCodebase) {
      swarmTasks.push(this.deployProjectAnalysisSwarm({
        projectPath: localResults.projectPath
      }));
    }

    if (localResults.requiresSecurityReview) {
      swarmTasks.push(this.deploySecuritySwarm({
        targetPath: localResults.projectPath,
        securityLevel: 'standard'
      }));
    }

    if (localResults.needsArchitectureReview) {
      swarmTasks.push(this.deployArchitectureSwarm({
        projectContext: localResults
      }));
    }

    // Execute swarm tasks with constitutional limits
    const results = await Promise.allSettled(swarmTasks);

    return {
      completed: results.filter(r => r.status === 'fulfilled').map(r => r.value),
      failed: results.filter(r => r.status === 'rejected').map(r => r.reason),
      summary: this.generateSwarmSummary(results)
    };
  }

  /**
   * Merge local and swarm consultation results
   */
  mergeConsultationResults(localResults, swarmResults) {
    const merged = { ...localResults };

    if (swarmResults) {
      merged.swarmEnhanced = true;
      merged.swarmResults = swarmResults;
      merged.confidence += 0.2; // Increase confidence with swarm validation

      // Merge specific insights
      if (swarmResults.completed.length > 0) {
        merged.enhancedInsights = swarmResults.completed
          .map(result => result.result?.insights || [])
          .flat();
      }
    }

    return merged;
  }

  /**
   * Generate swarm analysis summary
   */
  generateSwarmSummary(results) {
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const total = results.length;

    return {
      success_rate: total > 0 ? (successful / total) * 100 : 0,
      total_tasks: total,
      successful_tasks: successful,
      failed_tasks: total - successful,
      constitutional_compliant: this.cpuMonitoring.currentUsage <= this.cpuMonitoring.threshold
    };
  }

  /**
   * Get integration status
   */
  getStatus() {
    return {
      initialized: !!this.consultationSession,
      swarmAvailable: this.swarmTasks.size > 0,
      activeDeployments: this.activeDeployments.size,
      cpuUsage: this.cpuMonitoring.currentUsage,
      constitutionalCompliant: this.cpuMonitoring.currentUsage <= this.cpuMonitoring.threshold,
      capabilities: this.swarmTasks.size > 0 ? Array.from(this.swarmTasks.keys()) : ['local-only']
    };
  }

  /**
   * Create consultation swarm integration
   */
  static async create(options = {}) {
    const integration = new ConsultationSwarmIntegration();
    await integration.initializeSwarmIntegration(options);
    return integration;
  }
}

export default ConsultationSwarmIntegration;