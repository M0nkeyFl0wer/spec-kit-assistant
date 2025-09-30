#!/usr/bin/env node
/**
 * Distributed Process Manager - SSH-Enabled Swarm Process Control
 * Manages processes across local and remote systems with graceful shutdown
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

export class DistributedProcessManager {
  constructor() {
    this.localProcesses = new Map();
    this.remoteProcesses = new Map();
    this.shutdownInProgress = false;
    this.sshConfig = {
      host: 'seshat.noosworx.com',
      port: 8888,
      username: 'm0nkey-fl0wer'
    };

    // Setup graceful shutdown handlers
    this.setupGracefulShutdown();
    console.log(chalk.blue('🔧 Distributed Process Manager initialized'));
  }

  setupGracefulShutdown() {
    const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];

    signals.forEach(signal => {
      process.on(signal, async () => {
        if (!this.shutdownInProgress) {
          this.shutdownInProgress = true;
          console.log(chalk.yellow(`\\n🛑 Received ${signal}, initiating graceful shutdown...`));
          await this.shutdownAll();
          process.exit(0);
        }
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      console.error(chalk.red('💥 Uncaught Exception:'), error);
      await this.shutdownAll();
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      console.error(chalk.red('🚫 Unhandled Rejection at:'), promise, 'reason:', reason);
      await this.shutdownAll();
      process.exit(1);
    });
  }

  async startLocalProcess(command, args = [], options = {}) {
    const processId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log(chalk.blue(`🚀 Starting local process: ${command} ${args.join(' ')}`));

    try {
      const childProcess = spawn(command, args, {
        stdio: options.silent ? 'ignore' : ['ignore', 'pipe', 'pipe'],
        detached: false,
        ...options
      });

      const processInfo = {
        id: processId,
        process: childProcess,
        command: command,
        args: args,
        startTime: new Date(),
        type: 'local',
        status: 'running'
      };

      // Handle process output
      if (!options.silent) {
        childProcess.stdout?.on('data', (data) => {
          const output = data.toString().trim();
          if (output) {
            console.log(chalk.gray(`[${processId}] ${output}`));
          }
        });

        childProcess.stderr?.on('data', (data) => {
          const output = data.toString().trim();
          if (output) {
            console.log(chalk.yellow(`[${processId}] ${output}`));
          }
        });
      }

      // Handle process exit
      childProcess.on('exit', (code, signal) => {
        processInfo.status = 'terminated';
        processInfo.exitCode = code;
        processInfo.exitSignal = signal;
        processInfo.endTime = new Date();

        if (code === 0) {
          console.log(chalk.green(`✅ [${processId}] Process completed successfully`));
        } else {
          console.log(chalk.yellow(`⚠️ [${processId}] Process exited with code ${code}`));
        }

        this.localProcesses.delete(processId);
      });

      childProcess.on('error', (error) => {
        console.error(chalk.red(`❌ [${processId}] Process error:`, error.message));
        processInfo.status = 'error';
        processInfo.error = error.message;
        this.localProcesses.delete(processId);
      });

      this.localProcesses.set(processId, processInfo);
      return processId;

    } catch (error) {
      console.error(chalk.red(`❌ Failed to start local process: ${error.message}`));
      throw error;
    }
  }

  async startRemoteProcess(command, args = [], options = {}) {
    const processId = `remote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log(chalk.cyan(`🌐 Starting remote process on Seshat: ${command} ${args.join(' ')}`));

    try {
      const fullCommand = `${command} ${args.join(' ')}`;
      const sshCommand = options.background
        ? `ssh -p${this.sshConfig.port} ${this.sshConfig.username}@${this.sshConfig.host} "nohup ${fullCommand} > ~/process-${processId}.log 2>&1 & echo \\$!"`
        : `ssh -p${this.sshConfig.port} ${this.sshConfig.username}@${this.sshConfig.host} "${fullCommand}"`;

      const processInfo = {
        id: processId,
        command: command,
        args: args,
        startTime: new Date(),
        type: 'remote',
        status: 'running',
        sshCommand: sshCommand
      };

      if (options.background) {
        // Background process - get PID and track
        const { stdout } = await execAsync(sshCommand);
        const remotePid = stdout.trim();
        processInfo.remotePid = remotePid;

        console.log(chalk.green(`✅ Remote background process started with PID: ${remotePid}`));
      } else {
        // Foreground process - execute and wait
        const { stdout, stderr } = await execAsync(sshCommand);
        processInfo.stdout = stdout;
        processInfo.stderr = stderr;
        processInfo.status = 'completed';
        processInfo.endTime = new Date();

        console.log(chalk.green(`✅ Remote process completed`));
        if (stdout.trim()) {
          console.log(chalk.gray(`[${processId}] ${stdout.trim()}`));
        }
      }

      this.remoteProcesses.set(processId, processInfo);
      return processId;

    } catch (error) {
      console.error(chalk.red(`❌ Failed to start remote process: ${error.message}`));
      throw error;
    }
  }

  async stopLocalProcess(processId) {
    const processInfo = this.localProcesses.get(processId);
    if (!processInfo) {
      console.log(chalk.yellow(`⚠️ Local process ${processId} not found`));
      return false;
    }

    console.log(chalk.yellow(`🛑 Stopping local process ${processId}...`));

    try {
      // Try graceful termination first
      processInfo.process.kill('SIGTERM');

      // Wait for graceful shutdown
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          // Force kill if still running
          if (processInfo.status === 'running') {
            console.log(chalk.red(`💀 Force killing process ${processId}`));
            processInfo.process.kill('SIGKILL');
          }
          resolve();
        }, 5000);

        processInfo.process.on('exit', () => {
          clearTimeout(timeout);
          resolve();
        });
      });

      return true;
    } catch (error) {
      console.error(chalk.red(`❌ Error stopping process ${processId}:`, error.message));
      return false;
    }
  }

  async stopRemoteProcess(processId) {
    const processInfo = this.remoteProcesses.get(processId);
    if (!processInfo) {
      console.log(chalk.yellow(`⚠️ Remote process ${processId} not found`));
      return false;
    }

    console.log(chalk.yellow(`🛑 Stopping remote process ${processId}...`));

    try {
      if (processInfo.remotePid) {
        const killCommand = `ssh -p${this.sshConfig.port} ${this.sshConfig.username}@${this.sshConfig.host} "kill -TERM ${processInfo.remotePid} 2>/dev/null || kill -KILL ${processInfo.remotePid} 2>/dev/null"`;
        await execAsync(killCommand);
      }

      processInfo.status = 'terminated';
      processInfo.endTime = new Date();
      this.remoteProcesses.delete(processId);

      console.log(chalk.green(`✅ Remote process ${processId} stopped`));
      return true;
    } catch (error) {
      console.error(chalk.red(`❌ Error stopping remote process ${processId}:`, error.message));
      return false;
    }
  }

  async shutdownAll() {
    console.log(chalk.yellow('🛑 Shutting down all distributed processes...'));

    const localShutdowns = Array.from(this.localProcesses.keys()).map(id =>
      this.stopLocalProcess(id)
    );

    const remoteShutdowns = Array.from(this.remoteProcesses.keys()).map(id =>
      this.stopRemoteProcess(id)
    );

    try {
      await Promise.allSettled([...localShutdowns, ...remoteShutdowns]);
      console.log(chalk.green('✅ All distributed processes shut down'));
    } catch (error) {
      console.error(chalk.red('❌ Error during shutdown:'), error);
    }
  }

  getStatus() {
    const localCount = this.localProcesses.size;
    const remoteCount = this.remoteProcesses.size;

    return {
      localProcesses: localCount,
      remoteProcesses: remoteCount,
      totalProcesses: localCount + remoteCount,
      localDetails: Array.from(this.localProcesses.values()).map(p => ({
        id: p.id,
        command: p.command,
        status: p.status,
        uptime: p.startTime ? Date.now() - p.startTime.getTime() : 0
      })),
      remoteDetails: Array.from(this.remoteProcesses.values()).map(p => ({
        id: p.id,
        command: p.command,
        status: p.status,
        uptime: p.startTime ? Date.now() - p.startTime.getTime() : 0,
        remotePid: p.remotePid
      }))
    };
  }

  displayStatus() {
    const status = this.getStatus();

    console.log(chalk.cyan('\\n📊 Distributed Process Manager Status'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.blue(`Local Processes: ${status.localProcesses}`));
    console.log(chalk.cyan(`Remote Processes: ${status.remoteProcesses}`));
    console.log(chalk.green(`Total Processes: ${status.totalProcesses}`));

    if (status.localDetails.length > 0) {
      console.log(chalk.blue('\\n🏠 Local Processes:'));
      status.localDetails.forEach(p => {
        const uptime = Math.floor(p.uptime / 1000);
        console.log(chalk.gray(`  • ${p.id}: ${p.command} (${p.status}, ${uptime}s)`));
      });
    }

    if (status.remoteDetails.length > 0) {
      console.log(chalk.cyan('\\n🌐 Remote Processes:'));
      status.remoteDetails.forEach(p => {
        const uptime = Math.floor(p.uptime / 1000);
        const pid = p.remotePid ? ` PID:${p.remotePid}` : '';
        console.log(chalk.gray(`  • ${p.id}: ${p.command} (${p.status}, ${uptime}s)${pid}`));
      });
    }

    console.log(chalk.gray('─'.repeat(50) + '\\n'));
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new DistributedProcessManager();

  // Demo usage
  async function demo() {
    console.log(chalk.blue('🎬 Distributed Process Manager Demo'));

    // Start local animation process
    const localId = await manager.startLocalProcess('node', ['src/animations/dog-pack-animations.js'], { silent: true });

    // Start remote process
    const remoteId = await manager.startRemoteProcess('node', ['~/dog-pack-animations.js'], { background: true });

    // Show status
    setTimeout(() => {
      manager.displayStatus();
    }, 2000);

    // Cleanup after demo
    setTimeout(async () => {
      await manager.shutdownAll();
    }, 10000);
  }

  demo().catch(console.error);
}

export default DistributedProcessManager;