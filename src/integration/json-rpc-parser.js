/**
 * JSON-RPC Request Parser
 * Parses and validates JSON-RPC 2.0 requests per contracts/cli-json-schema.json
 * Implements T040 for Little Helper integration
 */

/**
 * Standard JSON-RPC error codes
 */
export const RPC_ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  // Custom error codes
  SESSION_NOT_FOUND: 1001,
  PROJECT_NOT_INITIALIZED: 1002,
  PHASE_NOT_READY: 1003,
  VALIDATION_FAILED: 1004
};

/**
 * Valid methods per the protocol
 */
export const VALID_METHODS = [
  'init',
  'specify',
  'answer',
  'status',
  'plan',
  'tasks',
  'stream'
];

export class JsonRpcParser {
  /**
   * Parse a JSON-RPC request from a string
   * @param {string} input - Raw JSON string
   * @returns {Object} { valid: boolean, request?: Object, error?: Object }
   */
  parse(input) {
    // Step 1: Parse JSON
    let parsed;
    try {
      parsed = JSON.parse(input);
    } catch (error) {
      return {
        valid: false,
        error: {
          code: RPC_ERROR_CODES.PARSE_ERROR,
          message: 'Parse error - Invalid JSON',
          data: { detail: error.message }
        }
      };
    }

    // Step 2: Validate basic structure
    const validation = this.validate(parsed);
    if (!validation.valid) {
      return {
        valid: false,
        error: validation.error
      };
    }

    return {
      valid: true,
      request: this.normalize(parsed)
    };
  }

  /**
   * Validate a parsed JSON-RPC request
   * @param {Object} request - Parsed JSON object
   * @returns {Object} { valid: boolean, error?: Object }
   */
  validate(request) {
    // Must be an object
    if (typeof request !== 'object' || request === null) {
      return {
        valid: false,
        error: {
          code: RPC_ERROR_CODES.INVALID_REQUEST,
          message: 'Invalid request - Not an object'
        }
      };
    }

    // Must have jsonrpc: "2.0"
    if (request.jsonrpc !== '2.0') {
      return {
        valid: false,
        error: {
          code: RPC_ERROR_CODES.INVALID_REQUEST,
          message: 'Invalid request - Missing or invalid jsonrpc version'
        }
      };
    }

    // Must have method
    if (!request.method || typeof request.method !== 'string') {
      return {
        valid: false,
        error: {
          code: RPC_ERROR_CODES.INVALID_REQUEST,
          message: 'Invalid request - Missing method'
        }
      };
    }

    // Method must be valid
    if (!VALID_METHODS.includes(request.method)) {
      return {
        valid: false,
        error: {
          code: RPC_ERROR_CODES.METHOD_NOT_FOUND,
          message: `Method not found: ${request.method}`
        }
      };
    }

    // Params must be an object if present
    if (request.params !== undefined && typeof request.params !== 'object') {
      return {
        valid: false,
        error: {
          code: RPC_ERROR_CODES.INVALID_PARAMS,
          message: 'Invalid params - Must be an object'
        }
      };
    }

    // Id must be string, number, or null if present
    if (request.id !== undefined) {
      const idType = typeof request.id;
      if (idType !== 'string' && idType !== 'number' && request.id !== null) {
        return {
          valid: false,
          error: {
            code: RPC_ERROR_CODES.INVALID_REQUEST,
            message: 'Invalid request - id must be string, number, or null'
          }
        };
      }
    }

    return { valid: true };
  }

  /**
   * Normalize a validated request
   * @param {Object} request - Validated request object
   * @returns {Object} Normalized request
   */
  normalize(request) {
    return {
      jsonrpc: '2.0',
      id: request.id ?? null,
      method: request.method,
      params: request.params || {}
    };
  }

  /**
   * Parse multiple NDJSON requests (newline-delimited)
   * @param {string} input - Multiple JSON objects separated by newlines
   * @returns {Object[]} Array of parse results
   */
  parseNdjson(input) {
    const lines = input.split('\n').filter(line => line.trim());
    return lines.map(line => this.parse(line));
  }

  /**
   * Validate method-specific params
   * @param {string} method - Method name
   * @param {Object} params - Request params
   * @returns {Object} { valid: boolean, error?: Object }
   */
  validateParams(method, params) {
    switch (method) {
      case 'init':
        if (!params.projectName) {
          return {
            valid: false,
            error: {
              code: RPC_ERROR_CODES.INVALID_PARAMS,
              message: 'Invalid params - projectName is required'
            }
          };
        }
        break;

      case 'specify':
        if (!params.description) {
          return {
            valid: false,
            error: {
              code: RPC_ERROR_CODES.INVALID_PARAMS,
              message: 'Invalid params - description is required'
            }
          };
        }
        break;

      case 'answer':
        if (!params.questionId || params.answer === undefined) {
          return {
            valid: false,
            error: {
              code: RPC_ERROR_CODES.INVALID_PARAMS,
              message: 'Invalid params - questionId and answer are required'
            }
          };
        }
        break;

      // status, plan, tasks have no required params
    }

    return { valid: true };
  }

  /**
   * Check if input is a notification (no id, no response expected)
   * @param {Object} request - Parsed request
   * @returns {boolean}
   */
  isNotification(request) {
    return request.id === undefined || request.id === null;
  }
}
