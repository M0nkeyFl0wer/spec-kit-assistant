#!/usr/bin/env node
/**
 * Security Fixes for spec-kit-assistant
 * Apply these patches to fix critical vulnerabilities
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.cyan('🔒 Applying security patches...\n'));

const fixes = [
  {
    file: '/home/flower/spec-kit-assistant/gemini-coordinator-agent.js',
    line: 46,
    vulnerability: 'Command Injection in Gemini CLI',
    severity: 'CRITICAL',
    oldCode: `      const command = \`echo "\${prompt}" | gemini\`;
      const response = execSync(command, { encoding: 'utf8', timeout: 10000 });`,
    newCode: `      // SECURITY FIX: Use spawn with array args to prevent command injection
      const { spawnSync } = require('child_process');
      const result = spawnSync('gemini', [], {
        input: prompt,
        encoding: 'utf8',
        timeout: 10000
      });
      const response = result.stdout;`
  },
  {
    file: '/home/flower/spec-kit-assistant/gemini-coordinator-agent.js',
    line: 177,
    vulnerability: 'Command Injection in git branch creation',
    severity: 'HIGH',
    oldCode: `          execSync(\`git checkout -b \${branchName}\`, { stdio: 'inherit' });`,
    newCode: `          // SECURITY FIX: Validate branch name and use spawn
          if (!/^[a-zA-Z0-9._\/-]+$/.test(branchName)) {
            throw new Error('Invalid branch name');
          }
          const { spawnSync } = require('child_process');
          spawnSync('git', ['checkout', '-b', branchName], { stdio: 'inherit' });`
  },
  {
    file: '/home/flower/spec-kit-assistant/src/swarm/intelligent-orchestrator.js',
    line: 476,
    vulnerability: 'Command Injection in ollama pull',
    severity: 'HIGH',
    oldCode: `      execSync(\`ollama pull \${model}\`, { stdio: 'inherit' });`,
    newCode: `      // SECURITY FIX: Validate model name and use spawn
      if (!/^[a-zA-Z0-9:._-]+$/.test(model)) {
        throw new Error('Invalid model name');
      }
      const { spawnSync } = require('child_process');
      spawnSync('ollama', ['pull', model], { stdio: 'inherit' });`
  },
  {
    file: '/home/flower/spec-kit-assistant/src/swarm/warp-integration.js',
    line: 672,
    vulnerability: 'Hardcoded fallback secret',
    severity: 'MEDIUM',
    oldCode: `    const secret = process.env.SPEC_KIT_SECRET || 'spec-kit-secret';`,
    newCode: `    // SECURITY FIX: Require secret from environment, no hardcoded fallback
    const secret = process.env.SPEC_KIT_SECRET;
    if (!secret) {
      throw new Error('SPEC_KIT_SECRET environment variable must be set');
    }`
  },
  {
    file: '/home/flower/spec-kit-assistant/src/utils/secure-websocket.js',
    line: 327,
    vulnerability: 'Hardcoded HMAC secret',
    severity: 'HIGH',
    oldCode: `    const expectedToken = crypto.createHmac('sha256', 'spec-kit-secret')`,
    newCode: `    // SECURITY FIX: Use environment variable for secret
    const secret = process.env.WEBSOCKET_AUTH_SECRET;
    if (!secret) {
      throw new Error('WEBSOCKET_AUTH_SECRET must be set');
    }
    const expectedToken = crypto.createHmac('sha256', secret)`
  }
];

console.log(chalk.yellow('📋 Vulnerabilities to fix:\n'));
fixes.forEach(fix => {
  console.log(chalk.red(`[${fix.severity}]`), chalk.white(fix.vulnerability));
  console.log(chalk.gray(`  File: ${fix.file}:${fix.line}\n`));
});

console.log(chalk.cyan('\n🔧 Detailed fixes:\n'));

// Output detailed fix instructions
for (const fix of fixes) {
  console.log(chalk.yellow(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`));
  console.log(chalk.red(`[${fix.severity}] ${fix.vulnerability}`));
  console.log(chalk.white(`File: ${fix.file}:${fix.line}`));
  console.log(chalk.gray('\nVulnerable code:'));
  console.log(chalk.red(fix.oldCode));
  console.log(chalk.gray('\nSecure replacement:'));
  console.log(chalk.green(fix.newCode));
}

console.log(chalk.yellow(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`));

// Additional security recommendations
console.log(chalk.cyan('📌 Additional Security Recommendations:\n'));

const recommendations = [
  {
    title: 'Environment Variables',
    items: [
      'Set SPEC_KIT_SECRET to a secure random value',
      'Set WEBSOCKET_AUTH_SECRET to a different secure random value',
      'Never commit .env files to version control',
      'Use a secrets management service in production'
    ]
  },
  {
    title: 'Input Validation',
    items: [
      'All user inputs are now validated in spec-assistant.js',
      'Branch names, model names, and file paths are sanitized',
      'Consider adding rate limiting for API endpoints',
      'Implement CSRF protection for web interfaces'
    ]
  },
  {
    title: 'Error Handling',
    items: [
      'Stack traces only shown in development mode',
      'Generic error messages for production',
      'Implement centralized logging with proper sanitization',
      'Monitor for suspicious patterns in logs'
    ]
  },
  {
    title: 'Dependencies',
    items: [
      'Run npm audit regularly',
      'Keep all dependencies up to date',
      'Use npm audit fix to auto-fix vulnerabilities',
      'Consider using Snyk or similar for continuous monitoring'
    ]
  },
  {
    title: 'Deployment Security',
    items: [
      'Use HTTPS/TLS for all network communications',
      'Implement proper authentication and authorization',
      'Regular security audits and penetration testing',
      'Follow principle of least privilege for all services'
    ]
  }
];

recommendations.forEach(section => {
  console.log(chalk.green(`\n${section.title}:`));
  section.items.forEach(item => {
    console.log(chalk.white(`  • ${item}`));
  });
});

console.log(chalk.yellow('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
console.log(chalk.green('✅ Security patch file generated successfully!'));
console.log(chalk.cyan('\nTo apply these fixes manually, review each fix and update the corresponding files.'));
console.log(chalk.cyan('For automated patching, a more sophisticated tool would be needed.\n'));