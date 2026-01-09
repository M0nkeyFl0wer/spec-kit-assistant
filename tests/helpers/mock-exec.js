/**
 * Mock helper for child_process.exec
 * Used to simulate CLI command execution in tests
 */

/**
 * Create a mock exec function that returns predefined responses
 * @param {Object} responses - Map of command patterns to responses
 * @returns {Function} Mock exec function
 */
export function createMockExec(responses = {}) {
  const calls = [];

  const mockExec = (command, options, callback) => {
    // Handle both (cmd, callback) and (cmd, options, callback) signatures
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    calls.push({ command, options });

    // Find matching response
    for (const [pattern, response] of Object.entries(responses)) {
      if (command.includes(pattern)) {
        if (response.error) {
          callback(response.error, response.stdout || '', response.stderr || '');
        } else {
          callback(null, response.stdout || '', response.stderr || '');
        }
        return;
      }
    }

    // Default: command not found
    callback(new Error(`Command not mocked: ${command}`), '', '');
  };

  // Promisified version
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

  mockExec.getCalls = () => calls;
  mockExec.reset = () => calls.length = 0;

  return mockExec;
}

/**
 * Common mock responses for GitHub CLI
 */
export const ghMockResponses = {
  authSuccess: {
    'gh auth status': { stdout: 'Logged in as M0nkeyFl0wer' }
  },
  authFailure: {
    'gh auth status': { error: new Error('Not logged in'), stderr: 'You are not logged in' }
  },
  issueCreate: {
    'gh issue create': { stdout: JSON.stringify({ number: 42, url: 'https://github.com/test/repo/issues/42' }) }
  },
  issueList: {
    'gh issue list': { stdout: JSON.stringify([]) }
  }
};

/**
 * Common mock responses for specify CLI
 */
export const specifyMockResponses = {
  initSuccess: {
    'specify init': { stdout: 'Project initialized successfully' }
  },
  checkSuccess: {
    'specify check': { stdout: 'All checks passed' }
  },
  checkFailure: {
    'specify check': { error: new Error('Checks failed'), stderr: 'Missing required sections', stdout: '' }
  },
  notInstalled: {
    'specify': { error: new Error('command not found: specify'), stderr: '' }
  }
};
