/**
 * Performance Metric Model
 * Represents performance measurements and constitutional compliance validation
 * Supports the performance validation framework
 */

/**
 * Represents a performance metric measurement
 */
export class PerformanceMetric {
  constructor(options = {}) {
    this.id = options.id || this.generateId();
    this.metric_name = options.metric_name || '';
    this.measured_value = options.measured_value || 0;
    this.unit = options.unit || '';
    this.constitutional_limit = options.constitutional_limit || null;
    this.measurement_timestamp = options.measurement_timestamp || new Date().toISOString();
    this.measurement_context = options.measurement_context || {};
    this.compliance_status = options.compliance_status || 'unknown'; // compliant, violation, warning, unknown
    this.measurement_method = options.measurement_method || 'automated';
    this.confidence_score = options.confidence_score || 1.0;
    this.tags = options.tags || [];
    this.metadata = options.metadata || {};
  }

  /**
   * Generate unique metric ID
   * @returns {string} Metric ID
   */
  generateId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `PM-${timestamp}-${random}`;
  }

  /**
   * Validate metric data structure
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    const warnings = [];

    // Required fields validation
    if (!this.metric_name || this.metric_name.trim().length === 0) {
      errors.push('Metric name is required');
    }

    if (typeof this.measured_value !== 'number' || isNaN(this.measured_value)) {
      errors.push('Measured value must be a valid number');
    }

    if (!this.unit || this.unit.trim().length === 0) {
      errors.push('Unit is required');
    }

    // Constitutional limits validation
    if (this.constitutional_limit !== null) {
      if (typeof this.constitutional_limit !== 'number' || isNaN(this.constitutional_limit)) {
        errors.push('Constitutional limit must be a valid number');
      }
    }

    // Confidence score validation
    if (this.confidence_score < 0 || this.confidence_score > 1) {
      errors.push('Confidence score must be between 0 and 1');
    }

    // Compliance status validation
    if (!this.isValidComplianceStatus(this.compliance_status)) {
      errors.push(`Invalid compliance status: ${this.compliance_status}`);
    }

    // Warning for missing constitutional limits on performance-critical metrics
    if (this.isPerformanceCritical() && this.constitutional_limit === null) {
      warnings.push('Performance-critical metric missing constitutional limit');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if compliance status is valid
   * @param {string} status - Compliance status
   * @returns {boolean} True if valid
   */
  isValidComplianceStatus(status) {
    const validStatuses = ['compliant', 'violation', 'warning', 'unknown'];
    return validStatuses.includes(status);
  }

  /**
   * Check if metric is performance-critical
   * @returns {boolean} True if performance-critical
   */
  isPerformanceCritical() {
    const criticalMetrics = [
      'animation-duration',
      'analysis-time',
      'refinement-time',
      'response-time',
      'memory-usage',
      'cpu-usage'
    ];
    return criticalMetrics.includes(this.metric_name);
  }

  /**
   * Set constitutional limit with validation
   * @param {number} limit - Constitutional limit value
   * @param {Object} context - Limit context
   */
  setConstitutionalLimit(limit, context = {}) {
    if (typeof limit !== 'number' || isNaN(limit)) {
      throw new Error('Constitutional limit must be a valid number');
    }

    this.constitutional_limit = limit;
    this.metadata.constitutional_context = {
      source: context.source || 'constitutional-standards.json',
      principle: context.principle || 'performance-standards',
      enforcement_level: context.enforcement_level || 'MANDATORY',
      version: context.version || '1.0.0'
    };
  }

  /**
   * Evaluate compliance against constitutional limit
   * @returns {Object} Compliance evaluation
   */
  evaluateCompliance() {
    if (this.constitutional_limit === null) {
      return {
        compliance_status: 'unknown',
        compliance_percentage: null,
        violation_amount: null,
        recommendation: 'Set constitutional limit for proper compliance evaluation'
      };
    }

    const violationAmount = this.measured_value - this.constitutional_limit;
    const compliancePercentage = Math.max(0, (this.constitutional_limit - Math.max(0, violationAmount)) / this.constitutional_limit);

    let status, recommendation;

    if (violationAmount <= 0) {
      status = 'compliant';
      recommendation = 'Performance meets constitutional standards';
    } else if (violationAmount <= this.constitutional_limit * 0.1) {
      status = 'warning';
      recommendation = 'Performance slightly exceeds limit - monitor and optimize';
    } else {
      status = 'violation';
      recommendation = 'Performance significantly violates constitutional limit - immediate optimization required';
    }

    // Update compliance status
    this.compliance_status = status;

    return {
      compliance_status: status,
      compliance_percentage: compliancePercentage,
      violation_amount: Math.max(0, violationAmount),
      recommendation,
      improvement_needed: violationAmount > 0 ? violationAmount : 0
    };
  }

  /**
   * Set measurement context
   * @param {Object} context - Measurement context
   */
  setMeasurementContext(context) {
    if (!context || typeof context !== 'object') {
      throw new Error('Measurement context must be a valid object');
    }

    this.measurement_context = {
      operation: context.operation || '',
      test_scenario: context.test_scenario || '',
      system_state: context.system_state || {},
      environment: context.environment || 'test',
      concurrency_level: context.concurrency_level || 1,
      data_size: context.data_size || null,
      swarm_coordination: context.swarm_coordination || false
    };
  }

  /**
   * Add performance tag
   * @param {string} tag - Performance tag
   */
  addTag(tag) {
    if (typeof tag !== 'string' || tag.trim().length === 0) {
      throw new Error('Tag must be a non-empty string');
    }

    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
    }
  }

  /**
   * Remove performance tag
   * @param {string} tag - Tag to remove
   * @returns {boolean} True if removed
   */
  removeTag(tag) {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Check if metric has specific tag
   * @param {string} tag - Tag to check
   * @returns {boolean} True if has tag
   */
  hasTag(tag) {
    return this.tags.includes(tag);
  }

  /**
   * Calculate performance score (0-1, higher is better)
   * @returns {number} Performance score
   */
  calculatePerformanceScore() {
    if (this.constitutional_limit === null) {
      return this.confidence_score;
    }

    const compliance = this.evaluateCompliance();

    if (compliance.compliance_status === 'compliant') {
      // Better performance gets higher score
      const efficiency = Math.max(0, (this.constitutional_limit - this.measured_value) / this.constitutional_limit);
      return Math.min(1.0, 0.7 + (efficiency * 0.3));
    } else if (compliance.compliance_status === 'warning') {
      return 0.5 + (compliance.compliance_percentage * 0.2);
    } else {
      return Math.max(0.1, compliance.compliance_percentage * 0.5);
    }
  }

  /**
   * Generate optimization recommendations
   * @returns {Object} Optimization recommendations
   */
  generateOptimizationRecommendations() {
    const compliance = this.evaluateCompliance();
    const recommendations = {
      metric_id: this.id,
      metric_name: this.metric_name,
      current_performance: this.measured_value,
      target_performance: this.constitutional_limit,
      priority: this.getPriorityFromCompliance(compliance.compliance_status),
      strategies: []
    };

    // Metric-specific optimization strategies
    switch (this.metric_name) {
      case 'animation-duration':
        recommendations.strategies = [
          'Optimize animation algorithms for GPU acceleration',
          'Reduce animation complexity or frame count',
          'Implement animation caching and reuse',
          'Use CSS transforms instead of JavaScript animations',
          'Consider progressive loading for complex animations'
        ];
        break;

      case 'analysis-time':
        recommendations.strategies = [
          'Implement parallel analysis using swarm coordination',
          'Cache analysis results for repeated operations',
          'Optimize parsing algorithms and data structures',
          'Use streaming processing for large datasets',
          'Implement early termination for obvious violations'
        ];
        break;

      case 'memory-usage':
        recommendations.strategies = [
          'Implement memory pooling and reuse',
          'Optimize data structures for memory efficiency',
          'Use lazy loading and pagination',
          'Clean up unused references and event listeners',
          'Consider streaming for large data processing'
        ];
        break;

      case 'cpu-usage':
        recommendations.strategies = [
          'Optimize computational algorithms',
          'Use web workers for CPU-intensive tasks',
          'Implement throttling and debouncing',
          'Cache computation results',
          'Distribute processing via swarm coordination'
        ];
        break;

      case 'response-time':
        recommendations.strategies = [
          'Implement response caching',
          'Optimize database queries and indexing',
          'Use connection pooling',
          'Implement CDN for static resources',
          'Optimize network protocols and compression'
        ];
        break;

      default:
        recommendations.strategies = [
          'Profile performance bottlenecks',
          'Implement caching where appropriate',
          'Optimize critical code paths',
          'Consider algorithmic improvements',
          'Monitor and measure continuously'
        ];
    }

    // Add constitutional compliance guidance
    if (compliance.compliance_status === 'violation') {
      recommendations.constitutional_guidance = `This metric violates constitutional ${this.metadata.constitutional_context?.principle || 'performance'} standards. Immediate optimization is required to maintain system compliance.`;
    } else if (compliance.compliance_status === 'warning') {
      recommendations.constitutional_guidance = `This metric approaches constitutional limits. Proactive optimization recommended to maintain compliance margin.`;
    }

    return recommendations;
  }

  /**
   * Get priority from compliance status
   * @param {string} status - Compliance status
   * @returns {string} Priority level
   */
  getPriorityFromCompliance(status) {
    const priorityMap = {
      'violation': 'CRITICAL',
      'warning': 'HIGH',
      'compliant': 'LOW',
      'unknown': 'MEDIUM'
    };
    return priorityMap[status] || 'MEDIUM';
  }

  /**
   * Convert to JSON representation
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      metric_name: this.metric_name,
      measured_value: this.measured_value,
      unit: this.unit,
      constitutional_limit: this.constitutional_limit,
      measurement_timestamp: this.measurement_timestamp,
      measurement_context: this.measurement_context,
      compliance_status: this.compliance_status,
      measurement_method: this.measurement_method,
      confidence_score: this.confidence_score,
      tags: this.tags,
      metadata: this.metadata
    };
  }

  /**
   * Create metric from JSON data
   * @param {Object} data - JSON data
   * @returns {PerformanceMetric} Metric instance
   */
  static fromJSON(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data for PerformanceMetric');
    }

    return new PerformanceMetric(data);
  }

  /**
   * Create animation duration metric
   * @param {number} duration - Duration in milliseconds
   * @param {Object} context - Measurement context
   * @returns {PerformanceMetric} Animation metric
   */
  static createAnimationMetric(duration, context = {}) {
    return new PerformanceMetric({
      metric_name: 'animation-duration',
      measured_value: duration,
      unit: 'milliseconds',
      constitutional_limit: 500, // Constitutional limit for animations
      measurement_context: context,
      tags: ['animation', 'ux', 'constitutional']
    });
  }

  /**
   * Create analysis time metric
   * @param {number} duration - Duration in milliseconds
   * @param {Object} context - Measurement context
   * @returns {PerformanceMetric} Analysis metric
   */
  static createAnalysisMetric(duration, context = {}) {
    return new PerformanceMetric({
      metric_name: 'analysis-time',
      measured_value: duration,
      unit: 'milliseconds',
      constitutional_limit: 100, // Constitutional limit for analysis
      measurement_context: context,
      tags: ['analysis', 'performance', 'constitutional']
    });
  }

  /**
   * Create memory usage metric
   * @param {number} usage - Usage in bytes
   * @param {Object} context - Measurement context
   * @returns {PerformanceMetric} Memory metric
   */
  static createMemoryMetric(usage, context = {}) {
    return new PerformanceMetric({
      metric_name: 'memory-usage',
      measured_value: usage,
      unit: 'bytes',
      constitutional_limit: 50 * 1024 * 1024, // 50MB constitutional limit
      measurement_context: context,
      tags: ['memory', 'resources', 'constitutional']
    });
  }
}

/**
 * Performance Metric Collection
 * Manages collections of performance metrics with analysis capabilities
 */
export class PerformanceMetricCollection {
  constructor() {
    this.metrics = [];
  }

  /**
   * Add metric to collection
   * @param {PerformanceMetric} metric - Metric to add
   */
  add(metric) {
    if (!(metric instanceof PerformanceMetric)) {
      throw new Error('Must be a PerformanceMetric instance');
    }

    this.metrics.push(metric);
  }

  /**
   * Remove metric by ID
   * @param {string} metricId - Metric ID
   * @returns {boolean} True if removed
   */
  remove(metricId) {
    const index = this.metrics.findIndex(m => m.id === metricId);
    if (index >= 0) {
      this.metrics.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get metrics by name
   * @param {string} metricName - Metric name
   * @returns {PerformanceMetric[]} Filtered metrics
   */
  getByName(metricName) {
    return this.metrics.filter(m => m.metric_name === metricName);
  }

  /**
   * Get metrics by compliance status
   * @param {string} status - Compliance status
   * @returns {PerformanceMetric[]} Filtered metrics
   */
  getByComplianceStatus(status) {
    return this.metrics.filter(m => m.compliance_status === status);
  }

  /**
   * Get constitutional violations
   * @returns {PerformanceMetric[]} Violating metrics
   */
  getViolations() {
    return this.getByComplianceStatus('violation');
  }

  /**
   * Get performance warnings
   * @returns {PerformanceMetric[]} Warning metrics
   */
  getWarnings() {
    return this.getByComplianceStatus('warning');
  }

  /**
   * Calculate overall compliance score
   * @returns {number} Overall compliance score (0-1)
   */
  calculateOverallCompliance() {
    if (this.metrics.length === 0) {
      return 1.0;
    }

    const totalScore = this.metrics.reduce((sum, metric) => {
      return sum + metric.calculatePerformanceScore();
    }, 0);

    return totalScore / this.metrics.length;
  }

  /**
   * Get performance summary
   * @returns {Object} Performance summary
   */
  getPerformanceSummary() {
    const summary = {
      total_metrics: this.metrics.length,
      compliance_breakdown: {},
      constitutional_violations: 0,
      warnings: 0,
      overall_compliance_score: this.calculateOverallCompliance(),
      performance_trends: {}
    };

    // Count by compliance status
    this.metrics.forEach(metric => {
      const status = metric.compliance_status;
      summary.compliance_breakdown[status] = (summary.compliance_breakdown[status] || 0) + 1;

      if (status === 'violation') {
        summary.constitutional_violations++;
      } else if (status === 'warning') {
        summary.warnings++;
      }
    });

    // Calculate trends by metric name
    const metricGroups = {};
    this.metrics.forEach(metric => {
      if (!metricGroups[metric.metric_name]) {
        metricGroups[metric.metric_name] = [];
      }
      metricGroups[metric.metric_name].push(metric);
    });

    Object.keys(metricGroups).forEach(metricName => {
      const group = metricGroups[metricName];
      if (group.length > 1) {
        // Sort by timestamp
        group.sort((a, b) => new Date(a.measurement_timestamp) - new Date(b.measurement_timestamp));

        const latest = group[group.length - 1];
        const previous = group[group.length - 2];

        summary.performance_trends[metricName] = {
          current_value: latest.measured_value,
          previous_value: previous.measured_value,
          trend_direction: latest.measured_value < previous.measured_value ? 'improving' : 'degrading',
          change_percentage: ((latest.measured_value - previous.measured_value) / previous.measured_value) * 100
        };
      }
    });

    return summary;
  }

  /**
   * Generate consolidated optimization report
   * @returns {Object} Optimization report
   */
  generateOptimizationReport() {
    const violations = this.getViolations();
    const warnings = this.getWarnings();

    const report = {
      executive_summary: {
        total_issues: violations.length + warnings.length,
        critical_violations: violations.length,
        warnings: warnings.length,
        overall_compliance: this.calculateOverallCompliance()
      },
      priority_optimizations: [],
      constitutional_compliance_status: {},
      optimization_timeline: {}
    };

    // Generate priority optimizations
    const allIssues = [...violations, ...warnings].sort((a, b) => {
      const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
      const aCompliance = a.evaluateCompliance();
      const bCompliance = b.evaluateCompliance();
      const aPriority = a.getPriorityFromCompliance(aCompliance.compliance_status);
      const bPriority = b.getPriorityFromCompliance(bCompliance.compliance_status);

      return priorityOrder[aPriority] - priorityOrder[bPriority];
    });

    report.priority_optimizations = allIssues.map(metric => {
      const optimization = metric.generateOptimizationRecommendations();
      return {
        ...optimization,
        compliance_evaluation: metric.evaluateCompliance()
      };
    });

    // Constitutional compliance status
    const constitutionalMetrics = this.metrics.filter(m => m.hasTag('constitutional'));
    report.constitutional_compliance_status = {
      total_constitutional_metrics: constitutionalMetrics.length,
      compliant_metrics: constitutionalMetrics.filter(m => m.compliance_status === 'compliant').length,
      violation_metrics: constitutionalMetrics.filter(m => m.compliance_status === 'violation').length,
      compliance_percentage: constitutionalMetrics.length > 0
        ? (constitutionalMetrics.filter(m => m.compliance_status === 'compliant').length / constitutionalMetrics.length) * 100
        : 100
    };

    return report;
  }

  /**
   * Export collection to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      metrics: this.metrics.map(m => m.toJSON()),
      summary: this.getPerformanceSummary()
    };
  }

  /**
   * Import collection from JSON
   * @param {Object} data - JSON data
   * @returns {PerformanceMetricCollection} Collection instance
   */
  static fromJSON(data) {
    const collection = new PerformanceMetricCollection();

    if (data.metrics && Array.isArray(data.metrics)) {
      data.metrics.forEach(metricData => {
        const metric = PerformanceMetric.fromJSON(metricData);
        collection.add(metric);
      });
    }

    return collection;
  }
}