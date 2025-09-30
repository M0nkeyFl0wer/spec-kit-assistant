/**
 * GATEElicitor Service
 * Spec: Feature 788 - T028 (FR-007, FR-008, FR-009, FR-010)
 *
 * Progressive context elicitation using problem-first GATE Framework
 */

export class GATEElicitor {
  constructor() {
    this.sessions = new Map(); // sessionId -> session data
  }

  /**
   * Start problem discovery with WHY questions
   * FR-007, FR-008
   * Performance target: < 500ms
   */
  async startProblemDiscovery(options) {
    const startTime = Date.now();

    if (!options.userVision) {
      throw new Error('userVision is required');
    }

    // Generate problem-space questions (WHY over WHAT)
    const problemQuestions = [
      `What problem are you trying to solve with "${options.userVision}"?`,
      'Who is experiencing this problem, and how does it affect them?',
      'Why is this problem important to solve now?',
      'What happens if this problem remains unsolved?'
    ];

    const duration = Date.now() - startTime;
    if (duration > 500) {
      console.warn(`startProblemDiscovery took ${duration}ms, exceeds 500ms target`);
    }

    return {
      problemQuestions,
      phase: 'Problem'
    };
  }

  /**
   * Extract context from user response
   * FR-009
   * Performance target: < 200ms
   */
  async extractContextFromResponse(options) {
    const startTime = Date.now();

    if (!options.question || !options.userResponse) {
      throw new Error('question and userResponse are required');
    }

    const response = options.userResponse;

    // Extract context elements using pattern matching
    const contextExtracted = {
      problem: this.extractProblem(response),
      users: this.extractUsers(response),
      impact: this.extractImpact(response),
      constraints: this.extractConstraints(response)
    };

    // Determine if follow-up needed (vague response)
    let nextQuestion = null;
    if (response.length < 50 || !contextExtracted.problem) {
      nextQuestion = 'Can you provide more specific details about the problem and its impact?';
    }

    const duration = Date.now() - startTime;
    if (duration > 200) {
      console.warn(`extractContextFromResponse took ${duration}ms, exceeds 200ms target`);
    }

    return {
      contextExtracted,
      nextQuestion
    };
  }

  /**
   * Measure context density improvement
   * FR-010
   * Target: >= 40% improvement over baseline
   */
  async measureContextDensity(options) {
    if (!options.beforeContext || !options.afterContext) {
      throw new Error('beforeContext and afterContext are required');
    }

    const beforeElements = this.countContextElements(options.beforeContext);
    const afterElements = this.countContextElements(options.afterContext);

    const improvement = afterElements - beforeElements;
    const improvementPercent = beforeElements > 0
      ? (improvement / beforeElements) * 100
      : afterElements * 100;

    return {
      improvementPercent: Math.max(0, improvementPercent),
      beforeCount: beforeElements,
      afterCount: afterElements
    };
  }

  /**
   * Extract problem statement from response
   * Internal method
   */
  extractProblem(text) {
    // Look for problem indicators
    const problemPatterns = [
      /(?:problem|challenge|issue|difficulty|struggle)[:\s]+([^.!?]+)/i,
      /(?:need to|trying to|want to)[:\s]+([^.!?]+)/i
    ];

    for (const pattern of problemPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    // Fallback: use first sentence
    const firstSentence = text.split(/[.!?]/)[0];
    return firstSentence.trim();
  }

  /**
   * Extract user personas from response
   * Internal method
   */
  extractUsers(text) {
    const users = [];
    const userPatterns = [
      /(?:users?|customers?|clients?|team|developers?|managers?|leads?|staff|people)[:\s]*([^,.]+)/gi
    ];

    for (const pattern of userPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const user = match[1].trim();
        if (user.length > 2 && user.length < 50) {
          users.push(user);
        }
      }
    }

    return [...new Set(users)]; // Remove duplicates
  }

  /**
   * Extract impact from response
   * Internal method
   */
  extractImpact(text) {
    const impactPatterns = [
      /(?:impact|effect|result|consequence|reduce|improve|increase)[:\s]+([^.!?]+)/i,
      /(?:leading to|resulting in|causing)[:\s]+([^.!?]+)/i
    ];

    for (const pattern of impactPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return '';
  }

  /**
   * Extract constraints from response
   * Internal method
   */
  extractConstraints(text) {
    const constraints = [];
    const constraintPatterns = [
      /(?:must|should|required?|limited|constraint)[:\s]*([^,.]+)/gi,
      /(?:within|under|max|maximum|minimum)[:\s]*([^,.]+)/gi
    ];

    for (const pattern of constraintPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const constraint = match[0].trim();
        if (constraint.length > 5) {
          constraints.push(constraint);
        }
      }
    }

    return [...new Set(constraints)];
  }

  /**
   * Count context elements
   * Internal method
   */
  countContextElements(context) {
    let count = 0;

    if (context.requirements) count += Array.isArray(context.requirements) ? context.requirements.length : 1;
    if (context.problem) count += 2; // Problem statement worth 2 points
    if (context.users) count += Array.isArray(context.users) ? context.users.length : 1;
    if (context.impact) count += 2; // Impact worth 2 points
    if (context.constraints) count += Array.isArray(context.constraints) ? context.constraints.length : 1;
    if (context.assumptions) count += Array.isArray(context.assumptions) ? context.assumptions.length : 1;
    if (context.successCriteria) count += Array.isArray(context.successCriteria) ? context.successCriteria.length : 1;

    return count;
  }
}

export default GATEElicitor;