/**
 * Shared test utilities and assertion helpers
 */

import { strict as assert } from 'node:assert';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the tests directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const TESTS_DIR = dirname(__dirname);
export const FIXTURES_DIR = join(TESTS_DIR, 'fixtures');
export const PROJECTS_FIXTURES_DIR = join(FIXTURES_DIR, 'projects');
export const TASKS_FIXTURES_DIR = join(FIXTURES_DIR, 'tasks');

/**
 * Assert that a value is defined (not undefined)
 */
export function assertDefined(value, message = 'Expected value to be defined') {
  assert.notStrictEqual(value, undefined, message);
}

/**
 * Assert that a value is truthy
 */
export function assertTruthy(value, message = 'Expected value to be truthy') {
  assert.ok(value, message);
}

/**
 * Assert that a value is falsy
 */
export function assertFalsy(value, message = 'Expected value to be falsy') {
  assert.ok(!value, message);
}

/**
 * Assert that an async function throws
 */
export async function assertThrowsAsync(fn, expectedError, message) {
  let threw = false;
  let error;

  try {
    await fn();
  } catch (e) {
    threw = true;
    error = e;
  }

  assert.ok(threw, message || 'Expected function to throw');

  if (expectedError) {
    if (typeof expectedError === 'string') {
      assert.ok(
        error.message.includes(expectedError),
        `Expected error message to include "${expectedError}", got "${error.message}"`
      );
    } else if (expectedError instanceof RegExp) {
      assert.ok(
        expectedError.test(error.message),
        `Expected error message to match ${expectedError}, got "${error.message}"`
      );
    } else if (typeof expectedError === 'function') {
      assert.ok(
        error instanceof expectedError,
        `Expected error to be instance of ${expectedError.name}`
      );
    }
  }

  return error;
}

/**
 * Assert that an array contains a specific item
 */
export function assertContains(array, item, message) {
  assert.ok(
    array.includes(item),
    message || `Expected array to contain ${JSON.stringify(item)}`
  );
}

/**
 * Assert that an array does not contain a specific item
 */
export function assertNotContains(array, item, message) {
  assert.ok(
    !array.includes(item),
    message || `Expected array not to contain ${JSON.stringify(item)}`
  );
}

/**
 * Assert that an object has a specific property
 */
export function assertHasProperty(obj, property, message) {
  assert.ok(
    property in obj,
    message || `Expected object to have property "${property}"`
  );
}

/**
 * Assert that a string matches a pattern
 */
export function assertMatches(value, pattern, message) {
  assert.ok(
    pattern.test(value),
    message || `Expected "${value}" to match ${pattern}`
  );
}

/**
 * Create a temporary test context that cleans up after itself
 */
export function createTestContext() {
  const cleanupFns = [];

  return {
    addCleanup: (fn) => cleanupFns.push(fn),
    cleanup: async () => {
      for (const fn of cleanupFns.reverse()) {
        await fn();
      }
      cleanupFns.length = 0;
    }
  };
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(condition, options = {}) {
  const { timeout = 5000, interval = 100 } = options;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (await condition()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error(`Condition not met within ${timeout}ms`);
}

/**
 * Create a mock logger for capturing log output
 */
export function createMockLogger() {
  const logs = {
    log: [],
    error: [],
    warn: [],
    info: [],
    debug: []
  };

  return {
    log: (...args) => logs.log.push(args),
    error: (...args) => logs.error.push(args),
    warn: (...args) => logs.warn.push(args),
    info: (...args) => logs.info.push(args),
    debug: (...args) => logs.debug.push(args),
    getLogs: () => logs,
    clear: () => {
      for (const key of Object.keys(logs)) {
        logs[key] = [];
      }
    }
  };
}

/**
 * Snapshot helper for comparing complex objects
 */
export function createSnapshot(value) {
  return JSON.stringify(value, null, 2);
}

/**
 * Compare two snapshots
 */
export function assertSnapshotMatch(actual, expected, message) {
  const actualSnapshot = createSnapshot(actual);
  const expectedSnapshot = typeof expected === 'string' ? expected : createSnapshot(expected);
  assert.strictEqual(actualSnapshot, expectedSnapshot, message);
}
