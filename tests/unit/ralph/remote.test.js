/**
 * Unit tests for Ralph Remote Execution Module
 */

import { describe, it, before, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('Ralph Remote Module', () => {
  let getRemoteConfig, validateConfig, buildSshTarget;
  let originalEnv;

  before(async () => {
    const module = await import('../../../src/ralph/remote.js');
    getRemoteConfig = module.getRemoteConfig;
    validateConfig = module.validateConfig;
    buildSshTarget = module.buildSshTarget;
  });

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('getRemoteConfig', () => {
    it('should return null when no environment variables set', () => {
      delete process.env.RALPH_REMOTE_HOST;
      delete process.env.RALPH_REMOTE_USER;
      delete process.env.RALPH_REMOTE_PATH;

      const config = getRemoteConfig();
      assert.strictEqual(config, null);
    });

    it('should return null when missing required variables', () => {
      process.env.RALPH_REMOTE_HOST = 'example.com';
      delete process.env.RALPH_REMOTE_USER;
      delete process.env.RALPH_REMOTE_PATH;

      const config = getRemoteConfig();
      assert.strictEqual(config, null);
    });

    it('should return config when all required variables set', () => {
      process.env.RALPH_REMOTE_HOST = 'example.com';
      process.env.RALPH_REMOTE_USER = 'testuser';
      process.env.RALPH_REMOTE_PATH = '/home/testuser/project';

      const config = getRemoteConfig();

      assert.strictEqual(config.host, 'example.com');
      assert.strictEqual(config.user, 'testuser');
      assert.strictEqual(config.remotePath, '/home/testuser/project');
      assert.strictEqual(config.port, 22); // Default port
    });

    it('should use custom port from environment', () => {
      process.env.RALPH_REMOTE_HOST = 'example.com';
      process.env.RALPH_REMOTE_USER = 'testuser';
      process.env.RALPH_REMOTE_PATH = '/home/testuser/project';
      process.env.RALPH_REMOTE_PORT = '2222';

      const config = getRemoteConfig();

      assert.strictEqual(config.port, 2222);
    });

    it('should use custom excludes from environment', () => {
      process.env.RALPH_REMOTE_HOST = 'example.com';
      process.env.RALPH_REMOTE_USER = 'testuser';
      process.env.RALPH_REMOTE_PATH = '/home/testuser/project';
      process.env.RALPH_REMOTE_EXCLUDES = 'foo,bar,baz';

      const config = getRemoteConfig();

      assert.deepStrictEqual(config.excludes, ['foo', 'bar', 'baz']);
    });

    it('should use default excludes when not specified', () => {
      process.env.RALPH_REMOTE_HOST = 'example.com';
      process.env.RALPH_REMOTE_USER = 'testuser';
      process.env.RALPH_REMOTE_PATH = '/home/testuser/project';
      delete process.env.RALPH_REMOTE_EXCLUDES;

      const config = getRemoteConfig();

      assert.ok(config.excludes.includes('node_modules'));
      assert.ok(config.excludes.includes('.git'));
    });
  });

  describe('validateConfig', () => {
    it('should return invalid for null config', () => {
      const result = validateConfig(null);

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.length > 0);
    });

    it('should return invalid when missing host', () => {
      const config = {
        user: 'testuser',
        remotePath: '/home/testuser/project'
      };

      const result = validateConfig(config);

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('host')));
    });

    it('should return invalid when missing user', () => {
      const config = {
        host: 'example.com',
        remotePath: '/home/testuser/project'
      };

      const result = validateConfig(config);

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('user')));
    });

    it('should return invalid when missing remotePath', () => {
      const config = {
        host: 'example.com',
        user: 'testuser'
      };

      const result = validateConfig(config);

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('remotePath')));
    });

    it('should return invalid for port out of range', () => {
      const config = {
        host: 'example.com',
        user: 'testuser',
        remotePath: '/home/testuser/project',
        port: 70000
      };

      const result = validateConfig(config);

      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('port')));
    });

    it('should return valid for complete config', () => {
      const config = {
        host: 'example.com',
        user: 'testuser',
        remotePath: '/home/testuser/project',
        port: 22
      };

      const result = validateConfig(config);

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it('should return valid for config without port', () => {
      const config = {
        host: 'example.com',
        user: 'testuser',
        remotePath: '/home/testuser/project'
      };

      const result = validateConfig(config);

      assert.strictEqual(result.valid, true);
    });
  });

  describe('buildSshTarget', () => {
    it('should build basic SSH target', () => {
      const config = {
        host: 'example.com',
        user: 'testuser',
        port: 22
      };

      const target = buildSshTarget(config);

      assert.strictEqual(target, 'testuser@example.com');
    });

    it('should include port option for non-standard port', () => {
      const config = {
        host: 'example.com',
        user: 'testuser',
        port: 2222
      };

      const target = buildSshTarget(config);

      assert.ok(target.includes('testuser@example.com'));
      assert.ok(target.includes('-p 2222'));
    });

    it('should handle SSH aliases', () => {
      const config = {
        host: 'myserver',
        user: 'deploy',
        port: 22
      };

      const target = buildSshTarget(config);

      assert.strictEqual(target, 'deploy@myserver');
    });
  });
});

describe('Ralph Remote Environment Variables', () => {
  let originalEnv;
  let getRemoteConfig;

  before(async () => {
    const module = await import('../../../src/ralph/remote.js');
    getRemoteConfig = module.getRemoteConfig;
  });

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should support all environment variables', () => {
    process.env.RALPH_REMOTE_HOST = 'remote.example.com';
    process.env.RALPH_REMOTE_USER = 'deploy';
    process.env.RALPH_REMOTE_PATH = '/var/www/app';
    process.env.RALPH_REMOTE_PORT = '8022';
    process.env.RALPH_REMOTE_EXCLUDES = '.env,secrets,*.log';

    const config = getRemoteConfig();

    assert.strictEqual(config.host, 'remote.example.com');
    assert.strictEqual(config.user, 'deploy');
    assert.strictEqual(config.remotePath, '/var/www/app');
    assert.strictEqual(config.port, 8022);
    assert.deepStrictEqual(config.excludes, ['.env', 'secrets', '*.log']);
  });

  it('should handle trimming spaces in excludes', () => {
    process.env.RALPH_REMOTE_HOST = 'example.com';
    process.env.RALPH_REMOTE_USER = 'user';
    process.env.RALPH_REMOTE_PATH = '/path';
    process.env.RALPH_REMOTE_EXCLUDES = ' foo , bar , baz ';

    const config = getRemoteConfig();

    assert.deepStrictEqual(config.excludes, ['foo', 'bar', 'baz']);
  });
});
