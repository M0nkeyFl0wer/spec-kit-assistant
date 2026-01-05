/**
 * Mock helper for GitHub CLI (gh) commands
 * Provides realistic mock responses for testing GitHub integration
 */

import { createMockExec } from './mock-exec.js';

/**
 * Create a mock GitHub CLI environment
 * @param {Object} options - Configuration options
 * @returns {Object} Mock gh environment with exec and state
 */
export function createMockGh(options = {}) {
  const {
    authenticated = true,
    username = 'M0nkeyFl0wer',
    repo = 'spec-kit-assistant',
    owner = 'M0nkeyFl0wer'
  } = options;

  // Track created issues
  let issueCounter = options.startingIssueNumber || 100;
  const issues = new Map();
  const labels = new Set(['bug', 'enhancement', 'documentation', 'spec-kit']);

  // Build mock responses
  const responses = {};

  // Auth status
  if (authenticated) {
    responses['gh auth status'] = {
      stdout: `github.com
  ✓ Logged in to github.com as ${username}
  ✓ Git operations for github.com configured to use https protocol.
  ✓ Token: gho_************************************`
    };
  } else {
    responses['gh auth status'] = {
      error: new Error('You are not logged in'),
      stderr: 'You are not logged in to any GitHub hosts. Run gh auth login to authenticate.'
    };
  }

  // Issue create
  responses['gh issue create'] = {
    handler: (command) => {
      const titleMatch = command.match(/--title\s+"([^"]+)"/);
      const bodyMatch = command.match(/--body\s+"([^"]+)"/);
      const labelsMatch = command.match(/--label\s+"([^"]+)"/);

      const issue = {
        number: ++issueCounter,
        title: titleMatch ? titleMatch[1] : 'Untitled',
        body: bodyMatch ? bodyMatch[1] : '',
        labels: labelsMatch ? labelsMatch[1].split(',') : [],
        state: 'open',
        url: `https://github.com/${owner}/${repo}/issues/${issueCounter}`,
        createdAt: new Date().toISOString()
      };

      issues.set(issue.number, issue);

      return {
        stdout: JSON.stringify({
          number: issue.number,
          url: issue.url
        })
      };
    }
  };

  // Issue edit
  responses['gh issue edit'] = {
    handler: (command) => {
      const numberMatch = command.match(/gh issue edit (\d+)/);
      if (!numberMatch) {
        return { error: new Error('Issue number required') };
      }

      const number = parseInt(numberMatch[1]);
      const issue = issues.get(number);

      if (!issue) {
        return { error: new Error(`Issue #${number} not found`) };
      }

      const bodyMatch = command.match(/--body\s+"([^"]+)"/);
      if (bodyMatch) {
        issue.body = bodyMatch[1];
      }

      return { stdout: '' };
    }
  };

  // Issue close
  responses['gh issue close'] = {
    handler: (command) => {
      const numberMatch = command.match(/gh issue close (\d+)/);
      if (!numberMatch) {
        return { error: new Error('Issue number required') };
      }

      const number = parseInt(numberMatch[1]);
      const issue = issues.get(number);

      if (!issue) {
        return { error: new Error(`Issue #${number} not found`) };
      }

      issue.state = 'closed';
      return { stdout: `✓ Closed issue #${number}` };
    }
  };

  // Issue list
  responses['gh issue list'] = {
    handler: (command) => {
      const stateMatch = command.match(/--state\s+(\w+)/);
      const state = stateMatch ? stateMatch[1] : 'open';

      const filtered = Array.from(issues.values())
        .filter(i => state === 'all' || i.state === state);

      return { stdout: JSON.stringify(filtered) };
    }
  };

  // Issue view
  responses['gh issue view'] = {
    handler: (command) => {
      const numberMatch = command.match(/gh issue view (\d+)/);
      if (!numberMatch) {
        return { error: new Error('Issue number required') };
      }

      const number = parseInt(numberMatch[1]);
      const issue = issues.get(number);

      if (!issue) {
        return {
          error: new Error(`Issue #${number} not found`),
          stderr: `GraphQL: Could not resolve to an issue or pull request with the number of ${number}.`
        };
      }

      return { stdout: JSON.stringify(issue) };
    }
  };

  // Label create
  responses['gh label create'] = {
    handler: (command) => {
      const nameMatch = command.match(/gh label create "([^"]+)"/);
      if (nameMatch) {
        labels.add(nameMatch[1]);
      }
      return { stdout: '' };
    }
  };

  // Create custom exec that handles dynamic responses
  const mockExec = (command, options, callback) => {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    for (const [pattern, response] of Object.entries(responses)) {
      if (command.includes(pattern)) {
        let result;
        if (response.handler) {
          result = response.handler(command);
        } else {
          result = response;
        }

        if (result.error) {
          callback(result.error, result.stdout || '', result.stderr || '');
        } else {
          callback(null, result.stdout || '', result.stderr || '');
        }
        return;
      }
    }

    callback(new Error(`gh command not mocked: ${command}`), '', '');
  };

  mockExec.async = (command, options = {}) => {
    return new Promise((resolve, reject) => {
      mockExec(command, options, (error, stdout, stderr) => {
        if (error) {
          error.stdout = stdout;
          error.stderr = stderr;
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  };

  return {
    exec: mockExec,
    getIssues: () => Array.from(issues.values()),
    getIssue: (number) => issues.get(number),
    getLabels: () => Array.from(labels),
    reset: () => {
      issues.clear();
      issueCounter = options.startingIssueNumber || 100;
    }
  };
}

/**
 * Environment variable mock helpers
 */
export function mockGitHubToken(token = 'ghp_test1234567890') {
  const original = process.env.GITHUB_TOKEN;
  process.env.GITHUB_TOKEN = token;
  return () => {
    if (original === undefined) {
      delete process.env.GITHUB_TOKEN;
    } else {
      process.env.GITHUB_TOKEN = original;
    }
  };
}

export function clearGitHubToken() {
  const original = process.env.GITHUB_TOKEN;
  delete process.env.GITHUB_TOKEN;
  return () => {
    if (original !== undefined) {
      process.env.GITHUB_TOKEN = original;
    }
  };
}
