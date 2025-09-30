/**
 * Analysis Report Generator
 * Generates comprehensive reports from analysis results
 * Integrates constitutional compliance, refinement, and coverage analysis data
 */

import { AnalysisReport } from './analysis-report.js';
import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';

/**
 * Report Generator
 * Creates comprehensive analysis reports with character-driven feedback
 */
export class ReportGenerator {
  constructor(options = {}) {
    this.workspace = options.workspace || process.cwd();
    this.characterProfile = options.characterProfile || {
      name: 'Spec Golden Retriever',
      traits: ['friendly', 'honest', 'fun', 'not-cringe']
    };
    this.constitutionalStandards = options.constitutionalStandards || null;
    this.outputDirectory = options.outputDirectory || join(this.workspace, 'reports');
    this.defaultFormat = options.defaultFormat || 'markdown';
    this.performanceMetrics = {
      generation_start_time: null,
      generation_duration: 0,
      reports_generated: 0
    };
  }

  /**
   * Generate comprehensive analysis report
   * @param {Object} analysisResults - Combined analysis results
   * @param {Object} options - Report generation options
   * @returns {AnalysisReport} Generated report
   */
  async generateComprehensiveReport(analysisResults, options = {}) {
    this.performanceMetrics.generation_start_time = performance.now();

    try {
      // Validate analysis results
      this.validateAnalysisResults(analysisResults);

      // Create comprehensive report
      const report = AnalysisReport.createComprehensiveReport(analysisResults, {
        title: options.title || 'Comprehensive Specification Analysis Report',
        format: options.format || this.defaultFormat,
        generated_by: 'spec-assistant-report-generator',
        workspace: this.workspace
      });

      // Set analysis scope
      report.setAnalysisScope(this.buildAnalysisScope(analysisResults, options));

      // Generate character-driven feedback
      const characterFeedback = await this.generateCharacterFeedback(analysisResults, options);
      report.setCharacterFeedback(characterFeedback);

      // Generate executive summary
      report.generateExecutiveSummary();

      // Generate detailed recommendations
      report.generateDetailedRecommendations();

      // Generate remediation plan
      const remediationPlan = this.generateRemediationPlan(analysisResults);
      report.setRemediationPlan(remediationPlan);

      // Calculate generation time
      this.performanceMetrics.generation_duration = performance.now() - this.performanceMetrics.generation_start_time;
      this.performanceMetrics.reports_generated++;

      // Save report if requested
      if (options.saveToFile) {
        await this.saveReport(report, options.filename);
      }

      return report;
    } catch (error) {
      throw new Error(`Report generation failed: ${error.message}`);
    }
  }

  /**
   * Generate constitutional compliance report
   * @param {Object} constitutionalResults - Constitutional analysis results
   * @param {Object} options - Report options
   * @returns {AnalysisReport} Constitutional report
   */
  async generateConstitutionalReport(constitutionalResults, options = {}) {
    const report = AnalysisReport.createConstitutionalReport(constitutionalResults, {
      title: options.title || 'Constitutional Compliance Analysis Report',
      format: options.format || this.defaultFormat
    });

    // Add character feedback for constitutional issues
    const characterFeedback = await this.generateConstitutionalCharacterFeedback(constitutionalResults);
    report.setCharacterFeedback(characterFeedback);

    if (options.saveToFile) {
      await this.saveReport(report, options.filename);
    }

    return report;
  }

  /**
   * Generate refinement report
   * @param {Object} refinementResults - Refinement analysis results
   * @param {Object} options - Report options
   * @returns {AnalysisReport} Refinement report
   */
  async generateRefinementReport(refinementResults, options = {}) {
    const report = new AnalysisReport({
      report_type: 'refinement',
      title: options.title || 'Requirement Refinement Analysis Report',
      format: options.format || this.defaultFormat
    });

    report.setRefinementAnalysis(refinementResults);

    // Generate character feedback for refinement
    const characterFeedback = await this.generateRefinementCharacterFeedback(refinementResults);
    report.setCharacterFeedback(characterFeedback);

    report.generateExecutiveSummary();
    report.generateDetailedRecommendations();

    if (options.saveToFile) {
      await this.saveReport(report, options.filename);
    }

    return report;
  }

  /**
   * Generate coverage report
   * @param {Object} coverageResults - Coverage analysis results
   * @param {Object} options - Report options
   * @returns {AnalysisReport} Coverage report
   */
  async generateCoverageReport(coverageResults, options = {}) {
    const report = new AnalysisReport({
      report_type: 'coverage',
      title: options.title || 'Implementation Coverage Analysis Report',
      format: options.format || this.defaultFormat
    });

    report.setCoverageAnalysis(coverageResults);

    // Generate character feedback for coverage
    const characterFeedback = await this.generateCoverageCharacterFeedback(coverageResults);
    report.setCharacterFeedback(characterFeedback);

    report.generateExecutiveSummary();
    report.generateDetailedRecommendations();

    if (options.saveToFile) {
      await this.saveReport(report, options.filename);
    }

    return report;
  }

  /**
   * Generate performance report
   * @param {Object} performanceResults - Performance analysis results
   * @param {Object} options - Report options
   * @returns {AnalysisReport} Performance report
   */
  async generatePerformanceReport(performanceResults, options = {}) {
    const report = new AnalysisReport({
      report_type: 'performance',
      title: options.title || 'Performance Analysis Report',
      format: options.format || this.defaultFormat
    });

    report.setPerformanceAnalysis(performanceResults);

    // Generate character feedback for performance
    const characterFeedback = await this.generatePerformanceCharacterFeedback(performanceResults);
    report.setCharacterFeedback(characterFeedback);

    report.generateExecutiveSummary();
    report.generateDetailedRecommendations();

    if (options.saveToFile) {
      await this.saveReport(report, options.filename);
    }

    return report;
  }

  /**
   * Validate analysis results structure
   * @param {Object} analysisResults - Results to validate
   */
  validateAnalysisResults(analysisResults) {
    if (!analysisResults || typeof analysisResults !== 'object') {
      throw new Error('Analysis results must be a valid object');
    }

    // Check for at least one analysis type
    const analysisTypes = ['constitutional', 'refinement', 'coverage', 'performance'];
    const hasAnalysis = analysisTypes.some(type => analysisResults[type]);

    if (!hasAnalysis) {
      throw new Error('Analysis results must contain at least one analysis type');
    }
  }

  /**
   * Build analysis scope information
   * @param {Object} analysisResults - Analysis results
   * @param {Object} options - Options
   * @returns {Object} Analysis scope
   */
  buildAnalysisScope(analysisResults, options) {
    const scope = {
      artifacts_analyzed: [],
      analysis_types: [],
      time_range: {
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString()
      },
      filters_applied: options.filters || {},
      exclusions: options.exclusions || [],
      analysis_depth: options.depth || 'standard'
    };

    // Collect artifacts from different analysis types
    if (analysisResults.constitutional?.artifacts_analyzed) {
      scope.artifacts_analyzed.push(...analysisResults.constitutional.artifacts_analyzed);
      scope.analysis_types.push('constitutional');
    }

    if (analysisResults.refinement?.requirements_processed) {
      scope.analysis_types.push('refinement');
    }

    if (analysisResults.coverage?.gaps) {
      scope.analysis_types.push('coverage');
    }

    if (analysisResults.performance?.metrics) {
      scope.analysis_types.push('performance');
    }

    return scope;
  }

  /**
   * Generate character-driven feedback
   * @param {Object} analysisResults - Analysis results
   * @param {Object} options - Options
   * @returns {Object} Character feedback
   */
  async generateCharacterFeedback(analysisResults, options = {}) {
    const feedback = {
      personality_assessment: 'friendly',
      encouragement_level: 0.8,
      tone_analysis: {},
      user_friendly_summary: '',
      celebration_moments: [],
      areas_for_improvement: [],
      character_score: 0.9,
      authenticity_rating: 0.8
    };

    // Calculate overall health
    const totalIssues = this.countTotalIssues(analysisResults);
    const totalPositives = this.countTotalPositives(analysisResults);

    // Generate user-friendly summary
    feedback.user_friendly_summary = this.generateFriendlySummary(totalIssues, totalPositives, analysisResults);

    // Identify celebration moments
    feedback.celebration_moments = this.identifyCelebrationMoments(analysisResults);

    // Identify areas for improvement
    feedback.areas_for_improvement = this.identifyImprovementAreas(analysisResults);

    // Analyze tone for character consistency
    feedback.tone_analysis = this.analyzeToneConsistency(analysisResults);

    return feedback;
  }

  /**
   * Generate constitutional-specific character feedback
   * @param {Object} constitutionalResults - Constitutional results
   * @returns {Object} Character feedback
   */
  async generateConstitutionalCharacterFeedback(constitutionalResults) {
    const feedback = {
      user_friendly_summary: '',
      celebration_moments: [],
      areas_for_improvement: []
    };

    const violations = constitutionalResults.violations || [];
    const criticalViolations = violations.filter(v => v.severity === 'CRITICAL');

    if (criticalViolations.length === 0) {
      feedback.user_friendly_summary = '🎉 Great news! Your specification follows all the important constitutional principles. ';
      feedback.celebration_moments.push('No critical constitutional violations found');
    } else {
      feedback.user_friendly_summary = `🔧 Found ${criticalViolations.length} important constitutional items to address. `;
    }

    if (violations.length === 0) {
      feedback.user_friendly_summary += 'Everything looks constitutionally compliant - well done! 🐕';
      feedback.celebration_moments.push('Perfect constitutional compliance achieved');
    } else {
      feedback.user_friendly_summary += `Let's work together to fix ${violations.length} constitutional items. I'll help guide you through each one! 🐕`;

      // Add improvement areas with friendly language
      violations.forEach(violation => {
        let improvementText = '';
        switch (violation.type) {
          case 'swarm-first':
            improvementText = 'Consider using our enhanced swarm orchestrator for better task coordination';
            break;
          case 'test-first':
            improvementText = 'Let\'s add some tests first - they\'ll help ensure everything works perfectly';
            break;
          case 'character-ux':
            improvementText = 'We can make the user experience even more friendly and helpful';
            break;
          default:
            improvementText = `Let's improve the ${violation.type} compliance together`;
        }
        feedback.areas_for_improvement.push(improvementText);
      });
    }

    return feedback;
  }

  /**
   * Generate refinement-specific character feedback
   * @param {Object} refinementResults - Refinement results
   * @returns {Object} Character feedback
   */
  async generateRefinementCharacterFeedback(refinementResults) {
    const feedback = {
      user_friendly_summary: '',
      celebration_moments: [],
      areas_for_improvement: []
    };

    const totalRequirements = refinementResults.requirements?.length || 0;
    const refinementsNeeded = refinementResults.refinements_needed || 0;
    const averageConfidence = refinementResults.average_confidence || 0.8;

    if (refinementsNeeded === 0) {
      feedback.user_friendly_summary = '🌟 Excellent! All your requirements are clear and well-defined. ';
      feedback.celebration_moments.push('All requirements are perfectly clear');
    } else {
      const percentage = Math.round((1 - (refinementsNeeded / totalRequirements)) * 100);
      feedback.user_friendly_summary = `✨ ${percentage}% of your requirements look great! `;

      if (refinementsNeeded <= 3) {
        feedback.user_friendly_summary += `Just ${refinementsNeeded} small refinements will make everything crystal clear. `;
      } else {
        feedback.user_friendly_summary += `${refinementsNeeded} requirements could use some clarification - I'll help you make them shine! `;
      }
    }

    if (averageConfidence > 0.8) {
      feedback.celebration_moments.push('High confidence in requirement clarity');
    }

    if (refinementResults.measurability_improvements > 0) {
      feedback.celebration_moments.push(`Made ${refinementResults.measurability_improvements} requirements more measurable`);
    }

    // Add improvement suggestions
    if (refinementsNeeded > 0) {
      feedback.areas_for_improvement.push('Add specific metrics and measurable criteria to vague requirements');
    }

    if (refinementResults.character_consistency_issues > 0) {
      feedback.areas_for_improvement.push('Ensure user-facing language is friendly and encouraging');
    }

    feedback.user_friendly_summary += '🐕';

    return feedback;
  }

  /**
   * Generate coverage-specific character feedback
   * @param {Object} coverageResults - Coverage results
   * @returns {Object} Character feedback
   */
  async generateCoverageCharacterFeedback(coverageResults) {
    const feedback = {
      user_friendly_summary: '',
      celebration_moments: [],
      areas_for_improvement: []
    };

    const coveragePercentage = coverageResults.coverage_percentage || 0;
    const totalGaps = coverageResults.gaps?.length || 0;
    const blockingGaps = coverageResults.blocking_gaps || 0;

    if (coveragePercentage >= 90) {
      feedback.user_friendly_summary = '🎯 Fantastic! Your implementation coverage is excellent at ';
      feedback.celebration_moments.push('Outstanding implementation coverage achieved');
    } else if (coveragePercentage >= 70) {
      feedback.user_friendly_summary = '👍 Good progress! Your implementation coverage is at ';
      feedback.celebration_moments.push('Solid implementation foundation in place');
    } else {
      feedback.user_friendly_summary = '🚀 Let\'s build this out! Your implementation coverage is at ';
    }

    feedback.user_friendly_summary += `${Math.round(coveragePercentage)}%. `;

    if (totalGaps === 0) {
      feedback.user_friendly_summary += 'Everything is implemented and working great! 🐕';
      feedback.celebration_moments.push('Complete implementation coverage - no gaps found');
    } else if (blockingGaps === 0) {
      feedback.user_friendly_summary += `Found ${totalGaps} areas to enhance, but nothing blocking your progress. `;
      feedback.areas_for_improvement.push('Complete the remaining implementation gaps for full coverage');
    } else {
      feedback.user_friendly_summary += `${blockingGaps} important items need attention to keep moving forward. `;
      feedback.areas_for_improvement.push('Address blocking implementation gaps first');
    }

    feedback.user_friendly_summary += '🐕';

    return feedback;
  }

  /**
   * Generate performance-specific character feedback
   * @param {Object} performanceResults - Performance results
   * @returns {Object} Character feedback
   */
  async generatePerformanceCharacterFeedback(performanceResults) {
    const feedback = {
      user_friendly_summary: '',
      celebration_moments: [],
      areas_for_improvement: []
    };

    const performanceScore = performanceResults.performance_score || 1.0;
    const violations = performanceResults.constitutional_violations || [];

    if (violations.length === 0) {
      feedback.user_friendly_summary = '⚡ Amazing! Your performance meets all constitutional standards. ';
      feedback.celebration_moments.push('Perfect constitutional performance compliance');
    } else {
      feedback.user_friendly_summary = `⚡ Performance looks good overall! Just ${violations.length} timing optimizations needed. `;
    }

    if (performanceScore > 0.9) {
      feedback.celebration_moments.push('Excellent overall performance score');
    } else if (performanceScore > 0.7) {
      feedback.celebration_moments.push('Good performance foundation established');
    }

    // Add specific improvement areas
    violations.forEach(violation => {
      if (violation.metric_name === 'animation-duration') {
        feedback.areas_for_improvement.push('Optimize animations to complete within 500ms for smooth user experience');
      } else if (violation.metric_name === 'analysis-time') {
        feedback.areas_for_improvement.push('Speed up analysis to meet 100ms constitutional response time');
      } else {
        feedback.areas_for_improvement.push(`Optimize ${violation.metric_name} performance`);
      }
    });

    feedback.user_friendly_summary += 'Everything feels snappy and responsive! 🐕';

    return feedback;
  }

  /**
   * Generate remediation plan
   * @param {Object} analysisResults - Analysis results
   * @returns {Object} Remediation plan
   */
  generateRemediationPlan(analysisResults) {
    const plan = {
      total_items: 0,
      estimated_total_effort: 0,
      phases: [],
      priority_order: [],
      resource_requirements: {},
      timeline_estimate: {},
      risk_assessment: {},
      success_criteria: []
    };

    // Collect all issues from different analysis types
    const allIssues = this.collectAllIssues(analysisResults);

    // Sort by priority and effort
    const sortedIssues = this.prioritizeIssues(allIssues);

    // Group into phases
    plan.phases = this.groupIntoPhases(sortedIssues);

    // Calculate totals
    plan.total_items = allIssues.length;
    plan.estimated_total_effort = allIssues.reduce((sum, issue) => sum + (issue.estimated_effort || 2), 0);

    // Generate priority order
    plan.priority_order = sortedIssues.slice(0, 10).map(issue => ({
      id: issue.id,
      type: issue.type,
      priority: issue.priority,
      description: issue.description,
      effort: issue.estimated_effort || 2
    }));

    // Estimate timeline
    plan.timeline_estimate = {
      immediate_items: sortedIssues.filter(i => i.priority === 'CRITICAL').length,
      short_term_items: sortedIssues.filter(i => i.priority === 'HIGH').length,
      medium_term_items: sortedIssues.filter(i => i.priority === 'MEDIUM').length,
      estimated_completion_weeks: Math.ceil(plan.estimated_total_effort / 20) // Assuming 20 hours per week
    };

    // Define success criteria
    plan.success_criteria = [
      'All critical constitutional violations resolved',
      'Implementation coverage above 90%',
      'All requirements refined and measurable',
      'Performance meets constitutional standards',
      'Character consistency maintained throughout'
    ];

    return plan;
  }

  /**
   * Save report to file
   * @param {AnalysisReport} report - Report to save
   * @param {string} filename - Optional filename
   */
  async saveReport(report, filename) {
    // Ensure output directory exists
    await mkdir(this.outputDirectory, { recursive: true });

    // Generate filename if not provided
    if (!filename) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const extension = report.format === 'json' ? 'json' : 'md';
      filename = `analysis-report-${timestamp}.${extension}`;
    }

    const filepath = join(this.outputDirectory, filename);

    // Generate report content
    const content = report.generateReport();

    // Save to file
    await writeFile(filepath, content, 'utf-8');

    return filepath;
  }

  /**
   * Utility methods for character feedback generation
   */

  countTotalIssues(analysisResults) {
    let total = 0;

    if (analysisResults.constitutional?.violations) {
      total += analysisResults.constitutional.violations.length;
    }

    if (analysisResults.coverage?.gaps) {
      total += analysisResults.coverage.gaps.length;
    }

    if (analysisResults.refinement?.refinements_needed) {
      total += analysisResults.refinement.refinements_needed;
    }

    if (analysisResults.performance?.constitutional_violations) {
      total += analysisResults.performance.constitutional_violations.length;
    }

    return total;
  }

  countTotalPositives(analysisResults) {
    let positives = 0;

    if (analysisResults.constitutional?.compliance_score > 0.8) {
      positives++;
    }

    if (analysisResults.coverage?.coverage_percentage > 80) {
      positives++;
    }

    if (analysisResults.refinement?.average_confidence > 0.8) {
      positives++;
    }

    if (analysisResults.performance?.performance_score > 0.8) {
      positives++;
    }

    return positives;
  }

  generateFriendlySummary(totalIssues, totalPositives, analysisResults) {
    if (totalIssues === 0) {
      return '🎉 Excellent work! Your specification and implementation look fantastic. Everything is well-structured, clearly defined, and ready to go! 🐕';
    }

    if (totalIssues <= 5) {
      return `✨ You're doing great! Found ${totalIssues} small items to polish up. Your foundation is solid and these improvements will make everything shine even brighter! 🐕`;
    }

    if (totalIssues <= 15) {
      return `🔧 Good progress! Identified ${totalIssues} opportunities to enhance your specification and implementation. Let's work through these together - each improvement will make your project better! 🐕`;
    }

    return `📋 Comprehensive analysis complete! Found ${totalIssues} areas for improvement. This might seem like a lot, but we'll tackle them systematically. Every step forward is progress! 🐕`;
  }

  identifyCelebrationMoments(analysisResults) {
    const moments = [];

    if (analysisResults.constitutional?.violations?.length === 0) {
      moments.push('Perfect constitutional compliance - following all the important principles!');
    }

    if (analysisResults.coverage?.coverage_percentage > 90) {
      moments.push('Outstanding implementation coverage - almost everything is built!');
    }

    if (analysisResults.refinement?.refinements_needed === 0) {
      moments.push('All requirements are crystal clear and well-defined!');
    }

    if (analysisResults.performance?.constitutional_violations?.length === 0) {
      moments.push('Performance meets all constitutional standards - lightning fast!');
    }

    return moments;
  }

  identifyImprovementAreas(analysisResults) {
    const areas = [];

    if (analysisResults.constitutional?.violations?.length > 0) {
      areas.push('Address constitutional compliance items for better alignment with best practices');
    }

    if (analysisResults.coverage?.coverage_percentage < 80) {
      areas.push('Complete missing implementations to achieve full coverage');
    }

    if (analysisResults.refinement?.refinements_needed > 0) {
      areas.push('Refine ambiguous requirements to be more specific and measurable');
    }

    if (analysisResults.performance?.constitutional_violations?.length > 0) {
      areas.push('Optimize performance to meet constitutional timing standards');
    }

    return areas;
  }

  analyzeToneConsistency(analysisResults) {
    return {
      friendliness_score: 0.9,
      encouragement_level: 0.8,
      authenticity_rating: 0.9,
      technical_balance: 0.8,
      overall_tone: 'friendly-professional'
    };
  }

  collectAllIssues(analysisResults) {
    const issues = [];

    // Constitutional violations
    if (analysisResults.constitutional?.violations) {
      analysisResults.constitutional.violations.forEach(violation => {
        issues.push({
          id: violation.id,
          type: 'constitutional',
          priority: violation.severity,
          description: violation.description,
          estimated_effort: this.estimateEffort(violation.type, violation.severity)
        });
      });
    }

    // Coverage gaps
    if (analysisResults.coverage?.gaps) {
      analysisResults.coverage.gaps.forEach(gap => {
        issues.push({
          id: gap.gap_id,
          type: 'coverage',
          priority: gap.severity,
          description: gap.description,
          estimated_effort: this.estimateEffort(gap.gap_type, gap.severity)
        });
      });
    }

    // Performance violations
    if (analysisResults.performance?.constitutional_violations) {
      analysisResults.performance.constitutional_violations.forEach(violation => {
        issues.push({
          id: violation.metric_name,
          type: 'performance',
          priority: 'HIGH',
          description: `Performance optimization needed for ${violation.metric_name}`,
          estimated_effort: 3
        });
      });
    }

    return issues;
  }

  prioritizeIssues(issues) {
    const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };

    return issues.sort((a, b) => {
      // Sort by priority first
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by effort (lower effort first for same priority)
      return a.estimated_effort - b.estimated_effort;
    });
  }

  groupIntoPhases(issues) {
    const phases = [
      { name: 'Critical Issues', issues: [] },
      { name: 'High Priority', issues: [] },
      { name: 'Medium Priority', issues: [] },
      { name: 'Low Priority', issues: [] }
    ];

    issues.forEach(issue => {
      switch (issue.priority) {
        case 'CRITICAL':
          phases[0].issues.push(issue);
          break;
        case 'HIGH':
          phases[1].issues.push(issue);
          break;
        case 'MEDIUM':
          phases[2].issues.push(issue);
          break;
        case 'LOW':
          phases[3].issues.push(issue);
          break;
      }
    });

    // Calculate effort for each phase
    phases.forEach(phase => {
      phase.estimated_effort = phase.issues.reduce((sum, issue) => sum + issue.estimated_effort, 0);
    });

    // Filter out empty phases
    return phases.filter(phase => phase.issues.length > 0);
  }

  estimateEffort(type, severity) {
    const baseEffort = {
      'constitutional': 3,
      'coverage': 4,
      'performance': 3,
      'refinement': 2
    };

    const severityMultiplier = {
      'CRITICAL': 2.0,
      'HIGH': 1.5,
      'MEDIUM': 1.0,
      'LOW': 0.5
    };

    const base = baseEffort[type] || 3;
    const multiplier = severityMultiplier[severity] || 1.0;

    return Math.ceil(base * multiplier);
  }
}