import { WebSocketServer } from 'ws';
import crypto from 'crypto';
import { EventEmitter } from 'events';

/**
 * Secure WebSocket Server with authentication, rate limiting, and safe message handling
 */
export class SecureWebSocketServer extends EventEmitter {
  constructor(options = {}) {
    super();

    this.options = {
      port: options.port || 8080,
      maxConnections: options.maxConnections || 100,
      messageRateLimit: options.messageRateLimit || 10, // messages per second
      maxMessageSize: options.maxMessageSize || 64 * 1024, // 64KB
      authTimeout: options.authTimeout || 30000, // 30 seconds
      heartbeatInterval: options.heartbeatInterval || 30000, // 30 seconds
      authRequired: options.authRequired !== false, // Default to true
      ...options
    };

    this.connections = new Map();
    this.rateLimitData = new Map();
    this.authenticatedAgents = new Set();
    this.server = null;
    this.heartbeatInterval = null;

    // Valid message types and schemas
    this.messageSchemas = {
      'agent-register': {
        required: ['agentId', 'agentType', 'capabilities'],
        optional: ['metadata']
      },
      'task-progress': {
        required: ['taskId', 'progress', 'status'],
        optional: ['details', 'metrics']
      },
      'task-completed': {
        required: ['taskId', 'result'],
        optional: ['metrics', 'artifacts']
      },
      'task-failed': {
        required: ['taskId', 'error'],
        optional: ['context', 'retry']
      },
      'heartbeat': {
        required: ['timestamp'],
        optional: ['status', 'metrics']
      },
      'agent-alert': {
        required: ['severity', 'message', 'type'],
        optional: ['context', 'actionRequired']
      }
    };
  }

  /**
   * Start the secure WebSocket server
   */
  async start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = new WebSocketServer({
          port: this.options.port,
          maxPayload: this.options.maxMessageSize,
          verifyClient: this.verifyClient.bind(this)
        });

        this.server.on('connection', this.handleConnection.bind(this));
        this.server.on('error', (error) => {
          console.error('WebSocket server error:', error);
          this.emit('error', error);
        });

        // Start heartbeat monitoring
        this.startHeartbeatMonitoring();

        console.log(`🔒 Secure WebSocket server listening on port ${this.options.port}`);
        resolve();

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Verify client connection during handshake
   */
  verifyClient(info) {
    // Check connection count
    if (this.connections.size >= this.options.maxConnections) {
      console.warn('Connection rejected: Maximum connections reached');
      return false;
    }

    // Check rate limiting by IP
    const clientIP = info.req.connection.remoteAddress;
    const rateLimitKey = `ip:${clientIP}`;
    const now = Date.now();

    if (!this.rateLimitData.has(rateLimitKey)) {
      this.rateLimitData.set(rateLimitKey, { count: 1, resetTime: now + 60000 });
    } else {
      const rateLimitInfo = this.rateLimitData.get(rateLimitKey);
      if (now > rateLimitInfo.resetTime) {
        rateLimitInfo.count = 1;
        rateLimitInfo.resetTime = now + 60000;
      } else {
        rateLimitInfo.count++;
        if (rateLimitInfo.count > 10) { // Max 10 connections per minute per IP
          console.warn(`Connection rejected: Rate limit exceeded for ${clientIP}`);
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Handle new WebSocket connection
   */
  handleConnection(ws, request) {
    const connectionId = crypto.randomUUID();
    const clientIP = request.connection.remoteAddress;

    console.log(`🔗 New connection: ${connectionId} from ${clientIP}`);

    // Initialize connection state
    const connectionInfo = {
      id: connectionId,
      ws: ws,
      ip: clientIP,
      authenticated: false,
      agentId: null,
      agentType: null,
      connectedAt: new Date(),
      lastHeartbeat: new Date(),
      messageCount: 0,
      lastMessageTime: 0
    };

    this.connections.set(connectionId, connectionInfo);

    // Set up connection handlers
    ws.on('message', (data) => this.handleMessage(connectionId, data));
    ws.on('close', (code, reason) => this.handleDisconnection(connectionId, code, reason));
    ws.on('error', (error) => this.handleConnectionError(connectionId, error));
    ws.on('pong', () => this.handlePong(connectionId));

    // Start authentication timeout if auth is required
    if (this.options.authRequired) {
      setTimeout(() => {
        if (!connectionInfo.authenticated) {
          console.warn(`Authentication timeout for connection ${connectionId}`);
          ws.close(4001, 'Authentication timeout');
        }
      }, this.options.authTimeout);
    }

    this.emit('connection', connectionId, connectionInfo);
  }

  /**
   * Handle incoming messages with security validation
   */
  async handleMessage(connectionId, data) {
    const connectionInfo = this.connections.get(connectionId);
    if (!connectionInfo) return;

    try {
      // Rate limiting per connection
      const now = Date.now();
      const timeDiff = now - connectionInfo.lastMessageTime;

      if (timeDiff < (1000 / this.options.messageRateLimit)) {
        console.warn(`Rate limit exceeded for connection ${connectionId}`);
        this.sendError(connectionId, 'Rate limit exceeded');
        return;
      }

      connectionInfo.lastMessageTime = now;
      connectionInfo.messageCount++;

      // Parse and validate JSON safely
      let message;
      try {
        const rawMessage = data.toString('utf8');

        // Size check
        if (rawMessage.length > this.options.maxMessageSize) {
          throw new Error('Message too large');
        }

        // Safe JSON parsing
        message = this.parseJsonSafely(rawMessage);
      } catch (parseError) {
        console.warn(`Invalid message format from ${connectionId}: ${parseError.message}`);
        this.sendError(connectionId, 'Invalid message format');
        return;
      }

      // Validate message structure
      const validationResult = this.validateMessage(message);
      if (!validationResult.valid) {
        console.warn(`Invalid message structure from ${connectionId}: ${validationResult.error}`);
        this.sendError(connectionId, `Invalid message: ${validationResult.error}`);
        return;
      }

      // Check authentication for non-auth messages
      if (message.type !== 'authenticate' && this.options.authRequired && !connectionInfo.authenticated) {
        console.warn(`Unauthenticated message from ${connectionId}`);
        this.sendError(connectionId, 'Authentication required');
        return;
      }

      // Process the message
      await this.processMessage(connectionId, message);

    } catch (error) {
      console.error(`Message handling error for ${connectionId}:`, error);
      this.sendError(connectionId, 'Message processing failed');
    }
  }

  /**
   * Safely parse JSON with protection against prototype pollution
   */
  parseJsonSafely(jsonString) {
    // Basic prototype pollution protection
    if (jsonString.includes('__proto__') || jsonString.includes('constructor') || jsonString.includes('prototype')) {
      throw new Error('Potentially malicious JSON detected');
    }

    const parsed = JSON.parse(jsonString);

    // Additional validation
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Invalid JSON object');
    }

    // Remove any dangerous properties if they somehow got through
    delete parsed.__proto__;
    delete parsed.constructor;
    delete parsed.prototype;

    return parsed;
  }

  /**
   * Validate message structure against schemas
   */
  validateMessage(message) {
    if (!message.type || typeof message.type !== 'string') {
      return { valid: false, error: 'Missing or invalid message type' };
    }

    // Check if message type is allowed
    const schema = this.messageSchemas[message.type];
    if (!schema && message.type !== 'authenticate') {
      return { valid: false, error: `Unknown message type: ${message.type}` };
    }

    if (schema) {
      // Check required fields
      for (const field of schema.required) {
        if (!(field in message)) {
          return { valid: false, error: `Missing required field: ${field}` };
        }
      }

      // Check for unknown fields (strict validation)
      const allowedFields = [...schema.required, ...schema.optional, 'type'];
      for (const field of Object.keys(message)) {
        if (!allowedFields.includes(field)) {
          return { valid: false, error: `Unknown field: ${field}` };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Process validated messages
   */
  async processMessage(connectionId, message) {
    const connectionInfo = this.connections.get(connectionId);
    if (!connectionInfo) return;

    switch (message.type) {
      case 'authenticate':
        await this.handleAuthentication(connectionId, message);
        break;

      case 'agent-register':
        await this.handleAgentRegistration(connectionId, message);
        break;

      case 'heartbeat':
        this.handleHeartbeat(connectionId, message);
        break;

      default:
        // Forward to application layer
        this.emit('message', connectionId, message, connectionInfo);
    }
  }

  /**
   * Handle agent authentication
   */
  async handleAuthentication(connectionId, message) {
    const connectionInfo = this.connections.get(connectionId);
    if (!connectionInfo) return;

    // Simple token-based authentication (in production, use proper JWT or API keys)
    const { token, agentId, agentType } = message;

    if (!token || !agentId || !agentType) {
      this.sendError(connectionId, 'Missing authentication credentials');
      return;
    }

    // Validate token (simplified - in production use proper crypto)
    const expectedToken = crypto.createHmac('sha256', 'spec-kit-secret')
      .update(agentId + agentType)
      .digest('hex');

    if (token !== expectedToken) {
      console.warn(`Authentication failed for ${agentId}: Invalid token`);
      this.sendError(connectionId, 'Authentication failed');
      connectionInfo.ws.close(4003, 'Authentication failed');
      return;
    }

    // Check if agent is already connected
    if (this.authenticatedAgents.has(agentId)) {
      console.warn(`Agent ${agentId} already connected`);
      this.sendError(connectionId, 'Agent already connected');
      return;
    }

    // Success
    connectionInfo.authenticated = true;
    connectionInfo.agentId = agentId;
    connectionInfo.agentType = agentType;
    this.authenticatedAgents.add(agentId);

    this.sendMessage(connectionId, {
      type: 'auth-success',
      message: 'Authentication successful'
    });

    console.log(`✅ Agent ${agentId} (${agentType}) authenticated successfully`);
    this.emit('agent-authenticated', connectionId, agentId, agentType);
  }

  /**
   * Handle agent registration after authentication
   */
  async handleAgentRegistration(connectionId, message) {
    const connectionInfo = this.connections.get(connectionId);
    if (!connectionInfo || !connectionInfo.authenticated) return;

    const { agentId, agentType, capabilities } = message;

    // Validate that agent ID matches authenticated agent
    if (agentId !== connectionInfo.agentId) {
      this.sendError(connectionId, 'Agent ID mismatch');
      return;
    }

    console.log(`🤖 Agent ${agentId} registered with capabilities:`, capabilities);
    this.emit('agent-registered', connectionId, agentId, agentType, capabilities);
  }

  /**
   * Handle heartbeat messages
   */
  handleHeartbeat(connectionId, message) {
    const connectionInfo = this.connections.get(connectionId);
    if (!connectionInfo) return;

    connectionInfo.lastHeartbeat = new Date();

    // Send heartbeat response
    this.sendMessage(connectionId, {
      type: 'heartbeat-ack',
      timestamp: Date.now()
    });
  }

  /**
   * Send message to a specific connection
   */
  sendMessage(connectionId, message) {
    const connectionInfo = this.connections.get(connectionId);
    if (!connectionInfo || connectionInfo.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      const messageString = JSON.stringify(message);
      connectionInfo.ws.send(messageString);
      return true;
    } catch (error) {
      console.error(`Failed to send message to ${connectionId}:`, error);
      return false;
    }
  }

  /**
   * Send error message to a connection
   */
  sendError(connectionId, errorMessage) {
    this.sendMessage(connectionId, {
      type: 'error',
      error: errorMessage,
      timestamp: Date.now()
    });
  }

  /**
   * Broadcast message to all authenticated agents
   */
  broadcast(message, filter = null) {
    let sentCount = 0;

    for (const [connectionId, connectionInfo] of this.connections) {
      if (connectionInfo.authenticated) {
        if (!filter || filter(connectionInfo)) {
          if (this.sendMessage(connectionId, message)) {
            sentCount++;
          }
        }
      }
    }

    return sentCount;
  }

  /**
   * Handle connection disconnection
   */
  handleDisconnection(connectionId, code, reason) {
    const connectionInfo = this.connections.get(connectionId);
    if (!connectionInfo) return;

    console.log(`🔌 Connection ${connectionId} disconnected: ${code} ${reason}`);

    // Clean up authenticated agent
    if (connectionInfo.agentId) {
      this.authenticatedAgents.delete(connectionInfo.agentId);
    }

    // Remove connection
    this.connections.delete(connectionId);

    this.emit('disconnection', connectionId, connectionInfo, code, reason);
  }

  /**
   * Handle connection errors
   */
  handleConnectionError(connectionId, error) {
    console.error(`Connection ${connectionId} error:`, error);
    this.emit('connection-error', connectionId, error);
  }

  /**
   * Handle pong responses
   */
  handlePong(connectionId) {
    const connectionInfo = this.connections.get(connectionId);
    if (connectionInfo) {
      connectionInfo.lastHeartbeat = new Date();
    }
  }

  /**
   * Start heartbeat monitoring
   */
  startHeartbeatMonitoring() {
    this.heartbeatInterval = setInterval(() => {
      const now = new Date();
      const timeout = this.options.heartbeatInterval * 2;

      for (const [connectionId, connectionInfo] of this.connections) {
        const timeSinceLastHeartbeat = now - connectionInfo.lastHeartbeat;

        if (timeSinceLastHeartbeat > timeout) {
          console.warn(`Heartbeat timeout for connection ${connectionId}`);
          connectionInfo.ws.close(4002, 'Heartbeat timeout');
        } else {
          // Send ping
          if (connectionInfo.ws.readyState === WebSocket.OPEN) {
            connectionInfo.ws.ping();
          }
        }
      }

      // Clean up rate limit data
      this.cleanupRateLimitData();

    }, this.options.heartbeatInterval);
  }

  /**
   * Clean up expired rate limit data
   */
  cleanupRateLimitData() {
    const now = Date.now();
    for (const [key, data] of this.rateLimitData) {
      if (now > data.resetTime) {
        this.rateLimitData.delete(key);
      }
    }
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      totalConnections: this.connections.size,
      authenticatedConnections: Array.from(this.connections.values()).filter(c => c.authenticated).length,
      authenticatedAgents: this.authenticatedAgents.size,
      rateLimitEntries: this.rateLimitData.size
    };
  }

  /**
   * Close the server
   */
  async close() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log('🔒 Secure WebSocket server closed');
          resolve();
        });
      });
    }
  }

  /**
   * Generate authentication token for an agent (helper method)
   */
  static generateAuthToken(agentId, agentType, secret = 'spec-kit-secret') {
    return crypto.createHmac('sha256', secret)
      .update(agentId + agentType)
      .digest('hex');
  }
}

export default SecureWebSocketServer;