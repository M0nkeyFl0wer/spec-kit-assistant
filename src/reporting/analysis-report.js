/**
 * Analysis Report Model
 * Represents comprehensive analysis reports with constitutional compliance and refinement data
 * Supports the reporting and documentation framework
 */

/**
 * Represents a comprehensive analysis report
 */
export class AnalysisReport {
  constructor(options = {}) {
    this.id = options.id || this.generateId();
    this.report_type = options.report_type || 'comprehensive'; // comprehensive, constitutional, refinement, coverage, performance
    this.title = options.title || '';
    this.summary = options.summary || '';
    this.generated_at = options.generated_at || new Date().toISOString();
    this.analysis_scope = options.analysis_scope || {};
    this.constitutional_analysis = options.constitutional_analysis || {};
    this.refinement_analysis = options.refinement_analysis || {};
    this.coverage_analysis = options.coverage_analysis || {};
    this.performance_analysis = options.performance_analysis || {};
    this.recommendations = options.recommendations || [];
    this.remediation_plan = options.remediation_plan || {};
    this.character_feedback = options.character_feedback || {};
    this.metadata = options.metadata || {};
    this.format = options.format || 'markdown'; // markdown, json, html
    this.generated_by = options.generated_by || 'spec-assistant';
    this.version = options.version || '1.0.0';
  }

  /**
   * Generate unique report ID
   * @returns {string} Report ID
   */
  generateId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `AR-${timestamp}-${random}`;
  }

  /**
   * Validate report data structure
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];

    // Required fields validation
    if (!this.report_type) {
      errors.push('Report type is required');
    } else if (!this.isValidReportType(this.report_type)) {
      errors.push(`Invalid report type: ${this.report_type}`);
    }

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Report title is required');
    }

    if (!this.summary || this.summary.trim().length === 0) {
      warnings.push('Report summary is empty - should provide executive overview');
    }

    // Format validation
    if (!this.isValidFormat(this.format)) {
      errors.push(`Invalid report format: ${this.format}`);
    }

    // Content validation based on report type
    if (this.report_type === 'constitutional' && !this.constitutional_analysis.violations) {
      warnings.push('Constitutional report missing violations analysis');
    }

    if (this.report_type === 'refinement' && !this.refinement_analysis.requirements) {
      warnings.push('Refinement report missing requirements analysis');
    }

    if (this.report_type === 'coverage' && !this.coverage_analysis.gaps) {
      warnings.push('Coverage report missing gaps analysis');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if report type is valid
   * @param {string} type - Report type
   * @returns {boolean} True if valid
   */
  isValidReportType(type) {
    const validTypes = [
      'comprehensive',
      'constitutional',
      'refinement',
      'coverage',
      'performance',
      'swarm-coordination',
      'character-consistency'
    ];
    return validTypes.includes(type);
  }

  /**
   * Check if format is valid
   * @param {string} format - Report format
   * @returns {boolean} True if valid
   */
  isValidFormat(format) {
    const validFormats = ['markdown', 'json', 'html', 'text'];
    return validFormats.includes(format);
  }

  /**
   * Set analysis scope
   * @param {Object} scope - Analysis scope data
   */
  setAnalysisScope(scope) {
    this.analysis_scope = {
      artifacts_analyzed: scope.artifacts_analyzed || [],
      analysis_types: scope.analysis_types || [],
      time_range: scope.time_range || {},
      filters_applied: scope.filters_applied || {},
      exclusions: scope.exclusions || [],
      analysis_depth: scope.analysis_depth || 'standard' // shallow, standard, deep
    };
  }

  /**
   * Set constitutional analysis results
   * @param {Object} analysis - Constitutional analysis data
   */
  setConstitutionalAnalysis(analysis) {
    this.constitutional_analysis = {
      violations: analysis.violations || [],
      compliance_score: analysis.compliance_score || 1.0,
      principles_evaluated: analysis.principles_evaluated || [],
      performance_compliance: analysis.performance_compliance || {},
      swarm_compliance: analysis.swarm_compliance || {},
      test_first_compliance: analysis.test_first_compliance || {},
      character_compliance: analysis.character_compliance || {},
      complexity_compliance: analysis.complexity_compliance || {},
      total_violations: (analysis.violations || []).length,
      critical_violations: (analysis.violations || []).filter(v => v.severity === 'CRITICAL').length,
      remediation_priority: analysis.remediation_priority || []
    };
  }

  /**
   * Set refinement analysis results
   * @param {Object} analysis - Refinement analysis data
   */
  setRefinementAnalysis(analysis) {
    this.refinement_analysis = {
      requirements: analysis.requirements || [],
      refinements_needed: analysis.refinements_needed || 0,
      ambiguity_issues: analysis.ambiguity_issues || [],
      measurability_improvements: analysis.measurability_improvements || [],
      character_consistency_issues: analysis.character_consistency_issues || [],
      average_confidence: analysis.average_confidence || 0.8,
      approval_status_breakdown: analysis.approval_status_breakdown || {},
      testability_improvements: analysis.testability_improvements || [],
      constitutional_alignments: analysis.constitutional_alignments || []
    };
  }

  /**
   * Set coverage analysis results
   * @param {Object} analysis - Coverage analysis data
   */
  setCoverageAnalysis(analysis) {
    this.coverage_analysis = {
      gaps: analysis.gaps || [],
      coverage_percentage: analysis.coverage_percentage || 100,
      missing_implementations: analysis.missing_implementations || [],
      specification_drifts: analysis.specification_drifts || [],
      test_coverage_gaps: analysis.test_coverage_gaps || [],
      quality_issues: analysis.quality_issues || [],
      blocking_gaps: (analysis.gaps || []).filter(g => g.isBlocking && g.isBlocking()).length,
      remediation_effort_total: analysis.remediation_effort_total || 0
    };
  }

  /**
   * Set performance analysis results
   * @param {Object} analysis - Performance analysis data
   */
  setPerformanceAnalysis(analysis) {
    this.performance_analysis = {
      metrics: analysis.metrics || [],
      constitutional_violations: analysis.constitutional_violations || [],
      performance_score: analysis.performance_score || 1.0,
      bottlenecks: analysis.bottlenecks || [],
      optimization_opportunities: analysis.optimization_opportunities || [],
      timing_compliance: analysis.timing_compliance || {},
      resource_usage: analysis.resource_usage || {},
      swarm_coordination_efficiency: analysis.swarm_coordination_efficiency || {}
    };
  }

  /**
   * Add recommendation
   * @param {Object} recommendation - Recommendation data
   */
  addRecommendation(recommendation) {
    if (!recommendation || typeof recommendation !== 'object') {
      throw new Error('Recommendation must be a valid object');
    }

    const rec = {
      id: recommendation.id || this.generateRecommendationId(),
      type: recommendation.type || 'general', // constitutional, refinement, coverage, performance, character
      priority: recommendation.priority || 'MEDIUM', // CRITICAL, HIGH, MEDIUM, LOW
      title: recommendation.title || '',
      description: recommendation.description || '',
      implementation_guidance: recommendation.implementation_guidance || '',
      estimated_effort: recommendation.estimated_effort || 'MEDIUM',
      related_violations: recommendation.related_violations || [],
      constitutional_principle: recommendation.constitutional_principle || null,
      character_impact: recommendation.character_impact || false
    };

    this.recommendations.push(rec);
  }

  /**
   * Generate recommendation ID
   * @returns {string} Recommendation ID
   */
  generateRecommendationId() {
    return `REC-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  }

  /**
   * Set remediation plan
   * @param {Object} plan - Remediation plan data
   */
  setRemediationPlan(plan) {
    this.remediation_plan = {
      total_items: plan.total_items || 0,
      estimated_total_effort: plan.estimated_total_effort || 0,
      phases: plan.phases || [],
      priority_order: plan.priority_order || [],
      resource_requirements: plan.resource_requirements || {},
      timeline_estimate: plan.timeline_estimate || {},
      risk_assessment: plan.risk_assessment || {},
      success_criteria: plan.success_criteria || []
    };
  }

  /**
   * Set character feedback
   * @param {Object} feedback - Character feedback data
   */
  setCharacterFeedback(feedback) {
    this.character_feedback = {
      personality_assessment: feedback.personality_assessment || 'friendly',
      encouragement_level: feedback.encouragement_level || 0.8,
      tone_analysis: feedback.tone_analysis || {},
      user_friendly_summary: feedback.user_friendly_summary || '',
      celebration_moments: feedback.celebration_moments || [],
      areas_for_improvement: feedback.areas_for_improvement || [],
      character_score: feedback.character_score || 0.9,
      authenticity_rating: feedback.authenticity_rating || 0.8
    };
  }

  /**
   * Generate executive summary
   * @returns {string} Executive summary
   */
  generateExecutiveSummary() {
    let summary = '';

    // Overall status
    const totalIssues = (this.constitutional_analysis.violations || []).length +
                       (this.coverage_analysis.gaps || []).length +
                       (this.refinement_analysis.refinements_needed || 0);

    if (totalIssues === 0) {
      summary += '🎉 Excellent! Your specification meets all constitutional standards and requirements are well-defined. ';
    } else if (totalIssues <= 5) {
      summary += '✨ Great progress! Found a few areas for improvement that will make your specification even better. ';
    } else if (totalIssues <= 15) {
      summary += '🔧 Several opportunities identified to enhance your specification and implementation. ';
    } else {
      summary += '📋 Comprehensive analysis complete - significant improvements possible to meet constitutional standards. ';
    }

    // Constitutional compliance
    if (this.constitutional_analysis.critical_violations > 0) {
      summary += `${this.constitutional_analysis.critical_violations} critical constitutional violations need immediate attention. `;
    } else if (this.constitutional_analysis.violations && this.constitutional_analysis.violations.length > 0) {
      summary += `${this.constitutional_analysis.violations.length} constitutional compliance items to address. `;
    } else {
      summary += 'Constitutional compliance looks great! ';
    }

    // Coverage analysis
    if (this.coverage_analysis.coverage_percentage < 70) {
      summary += `Implementation coverage at ${Math.round(this.coverage_analysis.coverage_percentage)}% - significant gaps to fill. `;
    } else if (this.coverage_analysis.coverage_percentage < 90) {
      summary += `Implementation coverage at ${Math.round(this.coverage_analysis.coverage_percentage)}% - almost there! `;
    } else {
      summary += `Excellent implementation coverage at ${Math.round(this.coverage_analysis.coverage_percentage)}%! `;
    }

    // Performance analysis
    if (this.performance_analysis.constitutional_violations && this.performance_analysis.constitutional_violations.length > 0) {
      summary += `${this.performance_analysis.constitutional_violations.length} performance optimizations needed. `;
    }

    // Character consistency
    if (this.character_feedback.character_score < 0.7) {
      summary += 'Character consistency needs attention for better user experience. ';
    } else if (this.character_feedback.character_score > 0.9) {
      summary += 'Character consistency is delightfully authentic! ';
    }

    this.summary = summary;
    return summary;
  }

  /**
   * Generate detailed recommendations
   * @returns {Object[]} Detailed recommendations
   */
  generateDetailedRecommendations() {
    const recommendations = [];

    // Constitutional recommendations
    if (this.constitutional_analysis.violations) {
      this.constitutional_analysis.violations.forEach(violation => {
        if (violation.severity === 'CRITICAL' || violation.severity === 'HIGH') {
          recommendations.push({
            type: 'constitutional',
            priority: violation.severity,
            title: `Address ${violation.type} violation`,
            description: violation.description,
            implementation_guidance: violation.remediation_suggestion,
            constitutional_principle: violation.type
          });
        }
      });
    }

    // Coverage recommendations
    if (this.coverage_analysis.gaps) {
      const blockingGaps = this.coverage_analysis.gaps.filter(g => g.isBlocking && g.isBlocking());
      blockingGaps.forEach(gap => {
        recommendations.push({
          type: 'coverage',
          priority: gap.severity,
          title: `Implement missing ${gap.gap_type}`,
          description: gap.description,
          implementation_guidance: gap.remediation_suggestion?.implementation_guidance || 'Implement according to specification'
        });
      });
    }

    // Performance recommendations
    if (this.performance_analysis.constitutional_violations) {
      this.performance_analysis.constitutional_violations.forEach(violation => {
        recommendations.push({
          type: 'performance',
          priority: 'HIGH',
          title: `Optimize ${violation.metric_name}`,
          description: `Performance exceeds constitutional limit: ${violation.measured_value}${violation.unit}`,
          implementation_guidance: `Optimize to meet ${violation.constitutional_limit}${violation.unit} limit`
        });
      });
    }

    // Character consistency recommendations
    if (this.character_feedback.character_score < 0.8) {
      recommendations.push({
        type: 'character',
        priority: 'MEDIUM',
        title: 'Improve character consistency',
        description: 'User-facing content needs better alignment with Spec the Golden Retriever personality',
        implementation_guidance: 'Use friendly, encouraging language while avoiding cringe or overly technical terms',
        character_impact: true
      });
    }

    // Sort by priority
    const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    this.recommendations = recommendations;
    return recommendations;
  }

  /**
   * Generate markdown report
   * @returns {string} Markdown formatted report
   */
  generateMarkdownReport() {
    let markdown = '';

    // Header
    markdown += `# ${this.title}\n\n`;
    markdown += `**Generated**: ${new Date(this.generated_at).toLocaleString()}\n`;
    markdown += `**Report Type**: ${this.report_type}\n`;
    markdown += `**Analysis Scope**: ${this.analysis_scope.artifacts_analyzed?.length || 0} artifacts\n\n`;

    // Executive Summary
    markdown += `## 📋 Executive Summary\n\n`;
    markdown += `${this.summary}\n\n`;

    // Constitutional Analysis
    if (this.constitutional_analysis.violations && this.constitutional_analysis.violations.length > 0) {
      markdown += `## ⚖️ Constitutional Compliance\n\n`;
      markdown += `**Compliance Score**: ${Math.round(this.constitutional_analysis.compliance_score * 100)}%\n`;
      markdown += `**Total Violations**: ${this.constitutional_analysis.total_violations}\n`;
      markdown += `**Critical Issues**: ${this.constitutional_analysis.critical_violations}\n\n`;

      if (this.constitutional_analysis.critical_violations > 0) {
        markdown += `### 🚨 Critical Violations\n\n`;
        this.constitutional_analysis.violations
          .filter(v => v.severity === 'CRITICAL')
          .forEach(violation => {
            markdown += `- **${violation.type}**: ${violation.description}\n`;
            markdown += `  - *Remediation*: ${violation.remediation_suggestion}\n\n`;
          });
      }
    }

    // Coverage Analysis
    if (this.coverage_analysis.gaps && this.coverage_analysis.gaps.length > 0) {
      markdown += `## 📊 Implementation Coverage\n\n`;
      markdown += `**Coverage**: ${Math.round(this.coverage_analysis.coverage_percentage)}%\n`;
      markdown += `**Total Gaps**: ${this.coverage_analysis.gaps.length}\n`;
      markdown += `**Blocking Issues**: ${this.coverage_analysis.blocking_gaps}\n\n`;

      if (this.coverage_analysis.blocking_gaps > 0) {
        markdown += `### 🔒 Blocking Issues\n\n`;
        this.coverage_analysis.gaps
          .filter(g => g.isBlocking && g.isBlocking())
          .forEach(gap => {
            markdown += `- **${gap.gap_type}**: ${gap.description}\n`;
            markdown += `  - *Requirement*: ${gap.requirement_reference}\n`;
            markdown += `  - *Action*: ${gap.remediation_suggestion?.action_required || 'See detailed analysis'}\n\n`;
          });
      }
    }

    // Performance Analysis
    if (this.performance_analysis.constitutional_violations && this.performance_analysis.constitutional_violations.length > 0) {
      markdown += `## ⚡ Performance Analysis\n\n`;
      markdown += `**Performance Score**: ${Math.round(this.performance_analysis.performance_score * 100)}%\n`;
      markdown += `**Constitutional Violations**: ${this.performance_analysis.constitutional_violations.length}\n\n`;

      markdown += `### Performance Issues\n\n`;
      this.performance_analysis.constitutional_violations.forEach(violation => {
        markdown += `- **${violation.metric_name}**: ${violation.measured_value}${violation.unit} (limit: ${violation.constitutional_limit}${violation.unit})\n`;
      });
      markdown += '\n';
    }

    // Character Feedback
    if (this.character_feedback.user_friendly_summary) {
      markdown += `## 🐕 Character Feedback\n\n`;
      markdown += `${this.character_feedback.user_friendly_summary}\n\n`;

      if (this.character_feedback.celebration_moments && this.character_feedback.celebration_moments.length > 0) {
        markdown += `### 🎉 What's Going Great\n\n`;
        this.character_feedback.celebration_moments.forEach(moment => {
          markdown += `- ${moment}\n`;
        });
        markdown += '\n';
      }

      if (this.character_feedback.areas_for_improvement && this.character_feedback.areas_for_improvement.length > 0) {
        markdown += `### 🌟 Areas for Improvement\n\n`;
        this.character_feedback.areas_for_improvement.forEach(area => {
          markdown += `- ${area}\n`;
        });
        markdown += '\n';
      }
    }

    // Recommendations
    if (this.recommendations.length > 0) {
      markdown += `## 💡 Recommendations\n\n`;

      const priorityGroups = {
        'CRITICAL': '🚨 Critical',
        'HIGH': '⚠️ High Priority',
        'MEDIUM': '📋 Medium Priority',
        'LOW': '💭 Low Priority'
      };

      Object.keys(priorityGroups).forEach(priority => {
        const recs = this.recommendations.filter(r => r.priority === priority);
        if (recs.length > 0) {
          markdown += `### ${priorityGroups[priority]}\n\n`;
          recs.forEach(rec => {
            markdown += `- **${rec.title}**: ${rec.description}\n`;
            if (rec.implementation_guidance) {
              markdown += `  - *Guidance*: ${rec.implementation_guidance}\n`;
            }
            markdown += '\n';
          });
        }
      });
    }

    // Remediation Plan
    if (this.remediation_plan.phases && this.remediation_plan.phases.length > 0) {
      markdown += `## 🛠️ Implementation Plan\n\n`;
      markdown += `**Total Estimated Effort**: ${this.remediation_plan.estimated_total_effort} hours\n\n`;

      this.remediation_plan.phases.forEach((phase, index) => {
        markdown += `### Phase ${index + 1}: ${phase.name}\n\n`;
        markdown += `**Effort**: ${phase.estimated_effort} hours\n\n`;

        if (phase.tasks && phase.tasks.length > 0) {
          phase.tasks.forEach(task => {
            markdown += `- ${task.description}\n`;
          });
          markdown += '\n';
        }
      });
    }

    // Footer
    markdown += `---\n\n`;
    markdown += `*Report generated by ${this.generated_by} v${this.version}*\n`;
    markdown += `*Analysis completed at ${this.generated_at}*\n`;

    return markdown;
  }

  /**
   * Generate HTML report
   * @returns {string} HTML formatted report
   */
  generateHtmlReport() {
    const markdown = this.generateMarkdownReport();

    // Simple markdown to HTML conversion
    let html = markdown
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/\n/g, '<br>');

    // Wrap in basic HTML structure
    return `<!DOCTYPE html>
<html>
<head>
  <title>${this.title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #333; }
    li { margin-bottom: 5px; }
    .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
  }

  /**
   * Generate report in specified format
   * @returns {string} Formatted report
   */
  generateReport() {
    switch (this.format) {
      case 'markdown':
        return this.generateMarkdownReport();
      case 'html':
        return this.generateHtmlReport();
      case 'json':
        return JSON.stringify(this.toJSON(), null, 2);
      case 'text':
        return this.generateMarkdownReport().replace(/[#*-]/g, '');
      default:
        return this.generateMarkdownReport();
    }
  }

  /**
   * Convert to JSON representation
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      report_type: this.report_type,
      title: this.title,
      summary: this.summary,
      generated_at: this.generated_at,
      analysis_scope: this.analysis_scope,
      constitutional_analysis: this.constitutional_analysis,
      refinement_analysis: this.refinement_analysis,
      coverage_analysis: this.coverage_analysis,
      performance_analysis: this.performance_analysis,
      recommendations: this.recommendations,
      remediation_plan: this.remediation_plan,
      character_feedback: this.character_feedback,
      metadata: this.metadata,
      format: this.format,
      generated_by: this.generated_by,
      version: this.version
    };
  }

  /**
   * Create report from JSON data
   * @param {Object} data - JSON data
   * @returns {AnalysisReport} Report instance
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for AnalysisReport');
    }

    return new AnalysisReport(data);
  }

  /**
   * Create comprehensive analysis report
   * @param {Object} analysisResults - Analysis results
   * @param {Object} options - Report options
   * @returns {AnalysisReport} Comprehensive report
   */
  static createComprehensiveReport(analysisResults, options = {}) {
    const report = new AnalysisReport({
      report_type: 'comprehensive',
      title: options.title || 'Comprehensive Specification Analysis Report',
      format: options.format || 'markdown',
      ...options
    });

    // Set analysis results
    if (analysisResults.constitutional) {
      report.setConstitutionalAnalysis(analysisResults.constitutional);
    }

    if (analysisResults.refinement) {
      report.setRefinementAnalysis(analysisResults.refinement);
    }

    if (analysisResults.coverage) {
      report.setCoverageAnalysis(analysisResults.coverage);
    }

    if (analysisResults.performance) {
      report.setPerformanceAnalysis(analysisResults.performance);
    }

    // Generate content
    report.generateExecutiveSummary();
    report.generateDetailedRecommendations();

    return report;
  }

  /**
   * Create constitutional compliance report
   * @param {Object} constitutionalAnalysis - Constitutional analysis results
   * @param {Object} options - Report options
   * @returns {AnalysisReport} Constitutional report
   */
  static createConstitutionalReport(constitutionalAnalysis, options = {}) {
    const report = new AnalysisReport({
      report_type: 'constitutional',
      title: options.title || 'Constitutional Compliance Analysis Report',
      ...options
    });

    report.setConstitutionalAnalysis(constitutionalAnalysis);
    report.generateExecutiveSummary();
    report.generateDetailedRecommendations();

    return report;
  }
}