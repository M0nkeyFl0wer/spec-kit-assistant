/**
 * SmartDefaults
 * Analyzes user input to generate intelligent defaults with confidence scoring.
 * Implements FR-003 (auto-generate intelligent defaults)
 */

import { SmartDefault, DefaultSource } from './entities/smart-default.js';
import { detectArchetype, getArchetype, ArchetypeId } from './archetypes/index.js';

export class SmartDefaults {
  /**
   * @param {Object} options
   * @param {number} [options.minConfidence=0.5] - Minimum confidence to present default
   * @param {number} [options.autoApplyThreshold=0.9] - Confidence to auto-apply without asking
   */
  constructor(options = {}) {
    this.minConfidence = options.minConfidence ?? 0.5;
    this.autoApplyThreshold = options.autoApplyThreshold ?? 0.9;

    // Cache for user history-based defaults
    this._historyDefaults = new Map();
  }

  /**
   * Analyze a project description and generate defaults
   * @param {string} description - User's project description
   * @returns {Object} { archetype, defaults: SmartDefault[], suggestedQuestions: string[] }
   */
  analyzeProject(description) {
    const detection = detectArchetype(description);
    const archetype = detection.archetype;
    const defaults = [];
    const suggestedQuestions = [];

    // Generate SmartDefault instances from archetype defaults
    for (const [questionId, defaultData] of Object.entries(archetype.defaults)) {
      const effectiveConfidence = defaultData.confidence * detection.confidence;

      const smartDefault = new SmartDefault({
        questionId,
        value: defaultData.value,
        confidence: effectiveConfidence,
        reasoning: defaultData.reasoning,
        source: DefaultSource.ARCHETYPE
      });

      if (smartDefault.meetsThreshold(this.minConfidence)) {
        defaults.push(smartDefault);
      } else if (defaultData.value !== null) {
        // Low confidence - suggest asking about it
        suggestedQuestions.push(questionId);
      }
    }

    // Add project name default from description
    const projectName = this._extractProjectName(description);
    if (projectName) {
      defaults.push(new SmartDefault({
        questionId: 'projectName',
        value: projectName,
        confidence: 0.7,
        reasoning: 'Derived from your description',
        source: DefaultSource.PATTERN
      }));
    }

    return {
      archetype: {
        id: archetype.id,
        name: archetype.name,
        confidence: detection.confidence,
        matchedKeywords: detection.matchedKeywords
      },
      defaults,
      suggestedQuestions: suggestedQuestions.slice(0, 2) // Limit to max 2 follow-up
    };
  }

  /**
   * Analyze a feature description for the specify workflow
   * @param {string} description - Feature description
   * @returns {Object} { defaults: SmartDefault[], suggestedQuestions: string[] }
   */
  analyzeFeature(description) {
    const defaults = [];
    const suggestedQuestions = [];
    const lowerDesc = description.toLowerCase();

    // Detect feature type
    const featureType = this._detectFeatureType(lowerDesc);
    defaults.push(new SmartDefault({
      questionId: 'featureType',
      value: featureType.type,
      confidence: featureType.confidence,
      reasoning: featureType.reasoning,
      source: DefaultSource.PATTERN
    }));

    // Detect priority
    const priority = this._detectPriority(lowerDesc);
    defaults.push(new SmartDefault({
      questionId: 'priority',
      value: priority.value,
      confidence: priority.confidence,
      reasoning: priority.reasoning,
      source: DefaultSource.PATTERN
    }));

    // Detect complexity
    const complexity = this._estimateComplexity(description);
    defaults.push(new SmartDefault({
      questionId: 'complexity',
      value: complexity.value,
      confidence: complexity.confidence,
      reasoning: complexity.reasoning,
      source: DefaultSource.PATTERN
    }));

    // Suggest clarifying questions for low-confidence items
    for (const def of defaults) {
      if (!def.meetsThreshold(0.7)) {
        suggestedQuestions.push(def.questionId);
      }
    }

    return {
      defaults: defaults.filter(d => d.meetsThreshold(this.minConfidence)),
      suggestedQuestions: suggestedQuestions.slice(0, 3) // Max 3 for specify
    };
  }

  /**
   * Get a specific default for a question
   * @param {string} questionId
   * @param {Object} context - Context for generating default
   * @returns {SmartDefault|null}
   */
  getDefault(questionId, context = {}) {
    // Check history first
    if (this._historyDefaults.has(questionId)) {
      return this._historyDefaults.get(questionId);
    }

    // Check archetype if available
    if (context.archetype) {
      const archetype = getArchetype(context.archetype);
      if (archetype?.defaults?.[questionId]) {
        const defaultData = archetype.defaults[questionId];
        return new SmartDefault({
          questionId,
          value: defaultData.value,
          confidence: defaultData.confidence,
          reasoning: defaultData.reasoning,
          source: DefaultSource.ARCHETYPE
        });
      }
    }

    return null;
  }

  /**
   * Learn from a user's decision (for future defaults)
   * @param {string} questionId
   * @param {*} value
   * @param {boolean} wasDefault - Whether user accepted a default
   */
  learnFromDecision(questionId, value, wasDefault) {
    if (wasDefault) {
      // User accepted - slightly increase confidence for similar future defaults
      const existing = this._historyDefaults.get(questionId);
      if (existing) {
        existing.confidence = Math.min(existing.confidence + 0.05, 0.95);
      } else {
        this._historyDefaults.set(questionId, new SmartDefault({
          questionId,
          value,
          confidence: 0.75,
          reasoning: 'Based on your previous choice',
          source: DefaultSource.HISTORY
        }));
      }
    } else {
      // User changed default - store their preference
      this._historyDefaults.set(questionId, new SmartDefault({
        questionId,
        value,
        confidence: 0.8,
        reasoning: 'Based on your previous choice',
        source: DefaultSource.HISTORY
      }));
    }
  }

  /**
   * Get defaults that can be auto-applied (high confidence)
   * @param {SmartDefault[]} defaults
   * @returns {SmartDefault[]}
   */
  getAutoApplyDefaults(defaults) {
    return defaults.filter(d => d.canAutoApply(this.autoApplyThreshold));
  }

  /**
   * Get defaults that need user confirmation
   * @param {SmartDefault[]} defaults
   * @returns {SmartDefault[]}
   */
  getConfirmationDefaults(defaults) {
    return defaults.filter(d =>
      d.meetsThreshold(this.minConfidence) && !d.canAutoApply(this.autoApplyThreshold)
    );
  }

  /**
   * Extract project name from description
   * @private
   */
  _extractProjectName(description) {
    // Look for patterns like "build a X", "create X", "X app/tool"
    const patterns = [
      /(?:build|create|make|develop)\s+(?:a\s+)?(\w+(?:\s+\w+)?)\s+(?:app|tool|website|api|service)/i,
      /(\w+(?:\s+\w+)?)\s+(?:app|tool|website|api|service)/i,
      /(?:called|named)\s+"?([^"]+)"?/i
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        return match[1].toLowerCase().replace(/\s+/g, '-');
      }
    }

    return null;
  }

  /**
   * Detect feature type from description
   * @private
   */
  _detectFeatureType(description) {
    const types = {
      'new-feature': ['add', 'create', 'implement', 'build', 'new'],
      'enhancement': ['improve', 'enhance', 'update', 'upgrade', 'better'],
      'bug-fix': ['fix', 'bug', 'issue', 'error', 'broken', 'wrong'],
      'refactor': ['refactor', 'clean', 'reorganize', 'restructure'],
      'documentation': ['document', 'docs', 'readme', 'guide', 'explain']
    };

    for (const [type, keywords] of Object.entries(types)) {
      for (const keyword of keywords) {
        if (description.includes(keyword)) {
          return {
            type,
            confidence: 0.8,
            reasoning: `Contains "${keyword}"`
          };
        }
      }
    }

    return {
      type: 'new-feature',
      confidence: 0.5,
      reasoning: 'Default assumption'
    };
  }

  /**
   * Detect priority from description
   * @private
   */
  _detectPriority(description) {
    const highPriority = ['urgent', 'critical', 'asap', 'important', 'priority', 'blocker'];
    const lowPriority = ['nice to have', 'eventually', 'when possible', 'low priority'];

    for (const keyword of highPriority) {
      if (description.includes(keyword)) {
        return { value: 'P1', confidence: 0.85, reasoning: `Contains "${keyword}"` };
      }
    }

    for (const keyword of lowPriority) {
      if (description.includes(keyword)) {
        return { value: 'P3', confidence: 0.8, reasoning: `Contains "${keyword}"` };
      }
    }

    return { value: 'P2', confidence: 0.6, reasoning: 'Default priority' };
  }

  /**
   * Estimate complexity from description
   * @private
   */
  _estimateComplexity(description) {
    const wordCount = description.split(/\s+/).length;
    const hasMultipleParts = /\band\b.*\band\b/i.test(description);
    const hasIntegration = /integrat|connect|sync|api/i.test(description);

    let complexity = 'medium';
    let confidence = 0.6;
    let reasoning = 'Based on description length and scope';

    if (wordCount < 10 && !hasMultipleParts && !hasIntegration) {
      complexity = 'simple';
      confidence = 0.7;
      reasoning = 'Short, focused description';
    } else if (wordCount > 50 || hasMultipleParts || hasIntegration) {
      complexity = 'complex';
      confidence = 0.7;
      reasoning = hasIntegration
        ? 'Involves integration'
        : 'Multiple components mentioned';
    }

    return { value: complexity, confidence, reasoning };
  }
}
