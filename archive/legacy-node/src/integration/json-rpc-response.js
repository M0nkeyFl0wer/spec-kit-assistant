/**
 * JSON-RPC Response Formatter
 * Formats JSON-RPC 2.0 responses per contracts/cli-json-schema.json
 * Implements T041 for Little Helper integration
 */

import { RPC_ERROR_CODES } from './json-rpc-parser.js';

export class JsonRpcResponse {
  /**
   * Create a success response
   * @param {*} id - Request ID
   * @param {Object} result - Result object
   * @returns {Object} JSON-RPC response
   */
  static success(id, result) {
    return {
      jsonrpc: '2.0',
      id: id ?? null,
      result
    };
  }

  /**
   * Create an error response
   * @param {*} id - Request ID
   * @param {number} code - Error code
   * @param {string} message - Error message
   * @param {Object} [data] - Additional error data
   * @returns {Object} JSON-RPC response
   */
  static error(id, code, message, data = null) {
    const error = { code, message };
    if (data !== null) {
      error.data = data;
    }

    return {
      jsonrpc: '2.0',
      id: id ?? null,
      error
    };
  }

  /**
   * Create a parse error response
   * @param {string} [detail] - Additional detail
   * @returns {Object}
   */
  static parseError(detail) {
    return this.error(
      null,
      RPC_ERROR_CODES.PARSE_ERROR,
      'Parse error - Invalid JSON',
      detail ? { detail } : null
    );
  }

  /**
   * Create an invalid request response
   * @param {*} id - Request ID
   * @param {string} [detail] - Additional detail
   * @returns {Object}
   */
  static invalidRequest(id, detail) {
    return this.error(
      id,
      RPC_ERROR_CODES.INVALID_REQUEST,
      'Invalid request',
      detail ? { detail } : null
    );
  }

  /**
   * Create a method not found response
   * @param {*} id - Request ID
   * @param {string} method - Requested method
   * @returns {Object}
   */
  static methodNotFound(id, method) {
    return this.error(
      id,
      RPC_ERROR_CODES.METHOD_NOT_FOUND,
      `Method not found: ${method}`
    );
  }

  /**
   * Create an invalid params response
   * @param {*} id - Request ID
   * @param {string} [detail] - What's invalid
   * @returns {Object}
   */
  static invalidParams(id, detail) {
    return this.error(
      id,
      RPC_ERROR_CODES.INVALID_PARAMS,
      'Invalid params',
      detail ? { detail } : null
    );
  }

  /**
   * Create an internal error response
   * @param {*} id - Request ID
   * @param {string} [detail] - Error detail
   * @returns {Object}
   */
  static internalError(id, detail) {
    return this.error(
      id,
      RPC_ERROR_CODES.INTERNAL_ERROR,
      'Internal error',
      detail ? { detail } : null
    );
  }

  /**
   * Create a session not found response
   * @param {*} id - Request ID
   * @returns {Object}
   */
  static sessionNotFound(id) {
    return this.error(
      id,
      RPC_ERROR_CODES.SESSION_NOT_FOUND,
      'Session not found'
    );
  }

  /**
   * Create a project not initialized response
   * @param {*} id - Request ID
   * @returns {Object}
   */
  static projectNotInitialized(id) {
    return this.error(
      id,
      RPC_ERROR_CODES.PROJECT_NOT_INITIALIZED,
      'Project not initialized'
    );
  }

  /**
   * Create a phase not ready response
   * @param {*} id - Request ID
   * @param {string} [requiredPhase] - Phase that needs to be completed
   * @returns {Object}
   */
  static phaseNotReady(id, requiredPhase) {
    return this.error(
      id,
      RPC_ERROR_CODES.PHASE_NOT_READY,
      'Phase not ready - complete previous phases first',
      requiredPhase ? { requiredPhase } : null
    );
  }

  /**
   * Create a validation failed response
   * @param {*} id - Request ID
   * @param {string[]} [errors] - Validation errors
   * @returns {Object}
   */
  static validationFailed(id, errors) {
    return this.error(
      id,
      RPC_ERROR_CODES.VALIDATION_FAILED,
      'Validation failed',
      errors ? { errors } : null
    );
  }

  /**
   * Serialize a response to JSON string
   * @param {Object} response - Response object
   * @returns {string}
   */
  static stringify(response) {
    return JSON.stringify(response);
  }

  /**
   * Write a response to stdout
   * @param {Object} response - Response object
   */
  static write(response) {
    process.stdout.write(this.stringify(response) + '\n');
  }
}

/**
 * Streaming response formatter for NDJSON output
 */
export class StreamingResponse {
  /**
   * Create a stream chunk notification
   * @param {string} content - Content chunk
   * @returns {Object}
   */
  static chunk(content) {
    return {
      jsonrpc: '2.0',
      method: 'stream',
      params: {
        type: 'chunk',
        content
      }
    };
  }

  /**
   * Create a progress notification
   * @param {string} phase - Current phase
   * @param {number} progress - Progress percentage (0-100)
   * @returns {Object}
   */
  static progress(phase, progress) {
    return {
      jsonrpc: '2.0',
      method: 'stream',
      params: {
        type: 'progress',
        phase,
        progress: Math.min(100, Math.max(0, progress))
      }
    };
  }

  /**
   * Create a done notification
   * @param {Object} [result] - Final result
   * @returns {Object}
   */
  static done(result) {
    return {
      jsonrpc: '2.0',
      method: 'stream',
      params: {
        type: 'done',
        ...result
      }
    };
  }

  /**
   * Create an error notification
   * @param {string} message - Error message
   * @param {number} [code] - Error code
   * @returns {Object}
   */
  static error(message, code) {
    return {
      jsonrpc: '2.0',
      method: 'stream',
      params: {
        type: 'error',
        content: message,
        code
      }
    };
  }

  /**
   * Write a streaming notification to stdout
   * @param {Object} notification - Notification object
   */
  static write(notification) {
    process.stdout.write(JSON.stringify(notification) + '\n');
  }
}
