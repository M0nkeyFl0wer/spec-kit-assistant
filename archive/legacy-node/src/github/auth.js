/**
 * GitHub Authentication Module
 * Provides layered authentication: gh CLI → GITHUB_TOKEN env → git-only mode
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

/**
 * Authentication result
 * @typedef {Object} GitHubAuthResult
 * @property {'gh-cli' | 'env-token' | 'none'} method - Authentication method used
 * @property {boolean} available - Whether GitHub operations are possible
 * @property {string} [username] - Authenticated username (if available)
 * @property {string[]} [scopes] - Available API scopes (if known)
 */

/**
 * Check if GitHub CLI is authenticated
 * @returns {Promise<{authenticated: boolean, username?: string}>}
 */
async function checkGhCliAuth() {
  try {
    const { stdout } = await execAsync('gh auth status 2>&1');

    // Extract username from output like "Logged in to github.com as M0nkeyFl0wer"
    const usernameMatch = stdout.match(/Logged in to github\.com as (\S+)/);
    const username = usernameMatch ? usernameMatch[1] : undefined;

    return { authenticated: true, username };
  } catch (error) {
    return { authenticated: false };
  }
}

/**
 * Check if GITHUB_TOKEN environment variable is set
 * @returns {{available: boolean, token?: string}}
 */
function checkEnvToken() {
  const token = process.env.GITHUB_TOKEN;

  if (token && token.length > 0) {
    return { available: true, token };
  }

  return { available: false };
}

/**
 * Check GitHub authentication status using layered approach
 * Priority: gh CLI > GITHUB_TOKEN env var > none (git-only mode)
 *
 * @returns {Promise<GitHubAuthResult>}
 */
export async function checkGitHubAuth() {
  // First, try gh CLI (most secure, recommended)
  const ghAuth = await checkGhCliAuth();
  if (ghAuth.authenticated) {
    return {
      method: 'gh-cli',
      available: true,
      username: ghAuth.username
    };
  }

  // Second, check for GITHUB_TOKEN environment variable
  const envAuth = checkEnvToken();
  if (envAuth.available) {
    return {
      method: 'env-token',
      available: true
      // Note: We don't expose the token, and can't easily get username from it
    };
  }

  // No authentication available - git-only mode
  return {
    method: 'none',
    available: false
  };
}

/**
 * Get the current repository info from git remote
 * @returns {Promise<{owner: string, repo: string} | null>}
 */
export async function getRepoInfo() {
  try {
    const { stdout } = await execAsync('git remote get-url origin');
    const url = stdout.trim();

    // Handle both HTTPS and SSH URLs
    // https://github.com/owner/repo.git
    // git@github.com:owner/repo.git
    let match = url.match(/github\.com[:/]([^/]+)\/([^/]+?)(\.git)?$/);

    if (match) {
      return {
        owner: match[1],
        repo: match[2]
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Validate that we can make GitHub API calls
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export async function validateGitHubAccess() {
  const auth = await checkGitHubAuth();

  if (!auth.available) {
    return {
      valid: false,
      error: 'No GitHub authentication available. Run "gh auth login" or set GITHUB_TOKEN environment variable.'
    };
  }

  const repoInfo = await getRepoInfo();
  if (!repoInfo) {
    return {
      valid: false,
      error: 'Could not determine GitHub repository from git remote. Ensure this is a GitHub repository.'
    };
  }

  // Try a simple API call to validate access
  try {
    if (auth.method === 'gh-cli') {
      await execAsync(`gh repo view ${repoInfo.owner}/${repoInfo.repo} --json name`);
    }
    // For env token, we'd need to make a direct API call - skip for now

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Cannot access repository ${repoInfo.owner}/${repoInfo.repo}. Check your permissions.`
    };
  }
}

/**
 * Display friendly message about GitHub authentication status
 * @param {GitHubAuthResult} auth - Authentication result
 * @returns {string} - Human-readable status message
 */
export function getAuthStatusMessage(auth) {
  switch (auth.method) {
    case 'gh-cli':
      return `✓ Authenticated via GitHub CLI${auth.username ? ` as ${auth.username}` : ''}`;
    case 'env-token':
      return '✓ Authenticated via GITHUB_TOKEN environment variable';
    case 'none':
      return '⚠ No GitHub authentication. Running in git-only mode.\n  To enable GitHub Issues sync, run: gh auth login';
    default:
      return '? Unknown authentication status';
  }
}
