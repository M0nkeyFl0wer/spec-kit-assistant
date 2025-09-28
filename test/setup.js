import { jest } from '@jest/globals';
import sinon from 'sinon';

// Global test configuration
global.testTimeout = 10000;

// Mock console methods during tests to reduce noise
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info
};

global.restoreConsole = () => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.info = originalConsole.info;
};

global.mockConsole = () => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
  console.info = jest.fn();
};

// Setup sinon sandbox for each test
global.sandbox = sinon.createSandbox();

// Cleanup after each test
afterEach(() => {
  global.sandbox.restore();
  jest.clearAllMocks();
});

// Setup environment variables for testing
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.DISABLE_ANIMATIONS = 'true';

// Mock external services
global.mockExternalServices = () => {
  // Mock GitHub API
  global.sandbox.stub(global, 'fetch').resolves({
    ok: true,
    json: async () => ({ success: true }),
    text: async () => 'mock response'
  });
};

// Test data factories
global.createMockProject = (overrides = {}) => ({
  name: 'test-project',
  version: '1.0.0',
  type: 'web-app',
  timeline: 'mvp',
  teamSize: 'small',
  ...overrides
});

global.createMockSpec = (overrides = {}) => ({
  metadata: {
    name: 'test-spec',
    version: '1.0.0',
    created: new Date(),
    type: 'web-app',
    timeline: 'mvp'
  },
  vision: {
    description: 'Test project description',
    goals: ['Goal 1', 'Goal 2'],
    success_metrics: {}
  },
  technical: {
    frontend: 'react',
    backend: 'node',
    database: 'postgresql'
  },
  ...overrides
});

// Helper functions for async testing
global.waitFor = (condition, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (condition()) {
        clearInterval(interval);
        resolve();
      }
    }, 100);

    setTimeout(() => {
      clearInterval(interval);
      reject(new Error('Timeout waiting for condition'));
    }, timeout);
  });
};

// Security testing utilities
global.testSecurityHeaders = (headers) => {
  const requiredHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Content-Security-Policy'
  ];

  return requiredHeaders.every(header => headers[header]);
};

// Performance testing utilities
global.measurePerformance = async (fn, maxDuration = 1000) => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  if (duration > maxDuration) {
    throw new Error(`Performance threshold exceeded: ${duration}ms > ${maxDuration}ms`);
  }

  return { result, duration };
};

// Mock file system for testing
global.mockFS = {
  '/test/project': {
    'package.json': JSON.stringify({
      name: 'test-project',
      version: '1.0.0',
      dependencies: {}
    }),
    'spec.yaml': 'name: test-spec\nversion: 1.0.0',
    src: {
      'index.js': 'console.log("test");'
    }
  }
};

export { jest, sinon };