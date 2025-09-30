/**
 * SocraticRefiner Service
 * Spec: Feature 788 - T030 (FR-014, FR-015, FR-016)
 *
 * Iterative assumption detection and refinement (max 3 iterations)
 */

import { AssumptionRefinement } from './models/assumption-refinement.js';

export class SocraticRefiner {
  constructor() {
    this.assumptions = [];
    this.refinements = new Map(); // assumptionId -> AssumptionRefinement
  }

  /**
   * Detect implicit assumptions in requirements
   * FR-014
   */
  async detectAssumptions(options) {
    if (!options.requirements || !Array.isArray(options.requirements)) {
      throw new Error('requirements array is required');
    }

    const assumptions = [];

    options.requirements.forEach((req, index) => {
      // Detect vague/ambiguous terms
      const vagueTerms = ['fast', 'good', 'scalable', 'user-friendly', 'intuitive',
                         'efficient', 'simple', 'easy', 'better', 'improved'];

      const containsVague = vagueTerms.some(term =>
        req.toLowerCase().includes(term)
      );

      if (containsVague) {
        const assumption = this.identifyAssumption(req, index);
        assumptions.push(assumption);
      }

      // Detect external dependencies
      if (req.toLowerCase().includes('api') ||
          req.toLowerCase().includes('integration') ||
          req.toLowerCase().includes('external')) {
        assumptions.push({
          statement: `Assumption: ${req} - external system availability not specified`,
          requirementIndex: index,
          riskLevel: 'high'
        });
      }

      // Detect implicit user knowledge assumptions
      if (req.toLowerCase().includes('user') &&
          req.toLowerCase().includes('understand')) {
        assumptions.push({
          statement: `Assumption: Users will understand - training/documentation not specified`,
          requirementIndex: index,
          riskLevel: 'medium'
        });
      }
    });

    this.assumptions = assumptions;

    return {
      assumptions
    };
  }

  /**
   * Generate probing question for assumption
   * FR-015
   */
  async generateProbingQuestion(options) {
    if (!options.assumption) {
      throw new Error('assumption is required');
    }

    const { assumption } = options;

    // Generate targeted question based on risk level
    let question;

    if (assumption.riskLevel === 'high') {
      question = `This seems critical: "${assumption.statement}". What specific, measurable criteria define success here?`;
    } else if (assumption.riskLevel === 'medium') {
      question = `Can you clarify: "${assumption.statement}"? What are the specific requirements?`;
    } else {
      question = `Regarding "${assumption.statement}", what are your expectations?`;
    }

    return {
      question
    };
  }

  /**
   * Refine assumption to explicit requirement
   * FR-016
   * Max 3 iterations per NFR-007
   */
  async refineAssumption(options) {
    if (!options.assumption || !options.userResponse) {
      throw new Error('assumption and userResponse are required');
    }

    const assumptionKey = options.assumption.statement;
    let refinement = this.refinements.get(assumptionKey);

    if (!refinement) {
      // Create new refinement
      refinement = new AssumptionRefinement({
        vagueInput: assumptionKey,
        assumptionIdentified: options.assumption.statement,
        iterationNumber: options.currentIteration || 1
      });
    } else {
      // Increment iteration
      try {
        refinement.incrementIteration();
      } catch (error) {
        // Max iterations reached
        return {
          explicitRequirement: refinement.refinedContext || refinement.vagueInput,
          assumptionResolved: false,
          maxIterationsReached: true,
          iterationCount: refinement.iterationNumber
        };
      }
    }

    // Process user response
    const explicitRequirement = this.extractExplicitRequirement(
      options.userResponse,
      options.assumption
    );

    // Refine the assumption
    refinement.refine(explicitRequirement);

    // Store refinement
    this.refinements.set(assumptionKey, refinement);

    return {
      explicitRequirement,
      assumptionResolved: refinement.isTestable,
      maxIterationsReached: refinement.isMaxIterations(),
      iterationCount: refinement.iterationNumber
    };
  }

  /**
   * Get refinement report
   * Target: >= 74% success rate (Acceptance 4)
   */
  async getRefinementReport() {
    const totalAssumptions = this.assumptions.length;
    const refinedAssumptions = Array.from(this.refinements.values())
      .filter(r => r.state === 'refined').length;

    const explicitRequirements = Array.from(this.refinements.values())
      .filter(r => r.refinedContext)
      .map(r => r.refinedContext);

    const unresolvedAssumptions = this.assumptions
      .filter(a => !this.refinements.has(a.statement))
      .map(a => a.statement);

    return {
      totalAssumptions,
      assumptionsRefined: refinedAssumptions,
      explicitRequirements,
      unresolvedAssumptions
    };
  }

  /**
   * Identify assumption from requirement
   * Internal method
   */
  identifyAssumption(requirement, index) {
    // Categorize risk level
    let riskLevel = 'low';

    if (requirement.toLowerCase().includes('critical') ||
        requirement.toLowerCase().includes('must') ||
        requirement.toLowerCase().includes('required')) {
      riskLevel = 'high';
    } else if (requirement.toLowerCase().includes('should') ||
               requirement.toLowerCase().includes('important')) {
      riskLevel = 'medium';
    }

    return {
      statement: `Vague requirement: "${requirement}"`,
      requirementIndex: index,
      riskLevel
    };
  }

  /**
   * Extract explicit requirement from response
   * Internal method
   */
  extractExplicitRequirement(response, assumption) {
    // Look for numeric criteria
    const numericMatch = response.match(/(\d+)/);

    // Look for measurable terms
    const measurableTerms = ['under', 'over', 'within', 'less than', 'more than',
                             'at least', 'maximum', 'minimum'];

    const hasMeasurable = measurableTerms.some(term =>
      response.toLowerCase().includes(term)
    );

    if (numericMatch || hasMeasurable) {
      return response.trim();
    }

    // Otherwise, combine original assumption with response
    return `${assumption.statement}: ${response}`;
  }
}

export default SocraticRefiner;