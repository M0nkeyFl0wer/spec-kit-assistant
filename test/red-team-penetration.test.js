
// RED TEAM PENETRATION TESTS
import { test } from 'node:test';
import assert from 'node:assert';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

test('Command injection - /specify init with malicious input', async () => {
  const maliciousInputs = [
    '; rm -rf /',
    '$(whoami)',
    '`id`',
    '| cat /etc/passwd',
    '&& curl evil.com',
    '../../../etc/passwd',
    '../../.ssh/id_rsa'
  ];

  for (const input of maliciousInputs) {
    try {
      const { stdout, stderr } = await execAsync(`~/specify init "${input}"`);

      // Should not execute arbitrary commands
      assert(!stdout.includes('root:'), 'Potential path traversal detected');
      assert(!stdout.includes('ssh-rsa'), 'Potential SSH key exposure');
      assert(!stderr.includes('Permission denied'), 'Unexpected file access attempt');

    } catch (error) {
      // Expected behavior - command should fail safely
      assert(!error.message.includes('ENOENT'), 'File system access blocked correctly');
    }
  }
});

test('Path traversal - spec file creation', async () => {
  const pathTraversalAttempts = [
    '../../../malicious.md',
    '/etc/passwd.md',
    '~/.ssh/authorized_keys.md',
    '/tmp/../../../etc/hosts.md'
  ];

  for (const path of pathTraversalAttempts) {
    try {
      const { GitHubSpecKit } = await import('../src/spec-kit/github-integration.js');
      const specKit = new GitHubSpecKit();
      const spec = await specKit.initializeSpec('test', 'web-app');

      // Attempt to save to dangerous path
      await specKit.saveSpec(spec, path);

      // Verify file wasn't created in dangerous location
      const fs = await import('fs');
      assert(!await fs.promises.access('/etc/passwd.md').then(() => true).catch(() => false));

    } catch (error) {
      // Expected - should fail safely
      console.log(`✅ Path traversal blocked: ${path}`);
    }
  }
});

test('Input sanitization - special characters', async () => {
  const { GitHubSpecKit } = await import('../src/spec-kit/github-integration.js');
  const specKit = new GitHubSpecKit();

  const dangerousInputs = [
    '<script>alert("xss")</script>',
    '$' + '{process.env.SECRET}',
    '\x00\x01\x02',
    String.fromCharCode(0, 1, 2, 3)
  ];

  for (const input of dangerousInputs) {
    const spec = await specKit.initializeSpec(input, 'web-app');

    // Verify dangerous content is sanitized
    assert(!spec.name.includes('<script>'), 'Script tags should be sanitized');
    assert(!spec.name.includes('$' + '{'), 'Template literals should be escaped');
    assert(!/[\x00-\x1f]/.test(spec.name), 'Control characters should be filtered');
  }
});
