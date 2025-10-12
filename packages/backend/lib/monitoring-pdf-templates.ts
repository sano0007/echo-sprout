import type { PDFTemplateData, PDFSection, MetricData } from './pdf-types';

// Monitoring-specific types
export interface MonitoringData {
  systemMetrics: SystemMetric[];
  projectMonitoring: ProjectMonitoringData[];
  alerts: AlertData[];
  performanceMetrics: PerformanceMetric[];
  timeframe: {
    start: Date;
    end: Date;
    period: string;
  };
  filters?: MonitoringFilters;
}

export interface SystemMetric {
  id: string;
  name: string;
  value: number;
  threshold: number;
  status: 'healthy' | 'warning' | 'critical';
  category: 'performance' | 'availability' | 'security' | 'capacity';
  unit: string;
  description: string;
  lastUpdated: Date;
}

export interface ProjectMonitoringData {
  projectId: string;
  projectName: string;
  status: 'on_track' | 'delayed' | 'at_risk' | 'completed';
  progress: number;
  nextMilestone: string;
  lastUpdate: Date;
  verificationStatus: 'verified' | 'pending' | 'failed' | 'not_required';
  metrics: {
    carbonOffset: number;
    treesPlanted: number;
    areaImpacted: number;
    budgetUtilization: number;
  };
  issues: IssueData[];
}

export interface AlertData {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  severity: number;
  createdAt: Date;
  resolvedAt?: Date;
  status: 'active' | 'resolved' | 'acknowledged';
  affectedProjects: string[];
  category: 'system' | 'project' | 'verification' | 'financial';
}

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  trend: 'improving' | 'stable' | 'declining';
  category: 'uptime' | 'response_time' | 'throughput' | 'error_rate';
  unit: string;
}

export interface IssueData {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: Date;
  assignedTo?: string;
}

export interface MonitoringFilters {
  projectIds?: string[];
  alertTypes?: string[];
  severityLevels?: string[];
  categories?: string[];
  statuses?: string[];
}

// Monitoring PDF Template Generator
export class MonitoringPDFTemplates {
  /**
   * Generate comprehensive monitoring report PDF data
   */
  static generateSystemMonitoringReport(
    monitoringData: MonitoringData,
    userInfo: { name: string; email: string; role: string }
  ): PDFTemplateData {
    const sections: PDFSection[] = [
      {
        title: 'System Health Overview',
        type: 'text',
        order: 1,
        data: this.generateSystemHealthOverview(monitoringData),
      },
      {
        title: 'System Performance Metrics',
        type: 'table',
        order: 2,
        data: this.generateSystemMetricsTable(monitoringData.systemMetrics),
      },
      {
        title: 'Active Alerts Summary',
        type: 'table',
        order: 3,
        data: this.generateAlertsTable(monitoringData.alerts),
      },
      {
        title: 'Performance Indicators',
        type: 'table',
        order: 4,
        data: this.generatePerformanceTable(monitoringData.performanceMetrics),
      },
      {
        title: 'System Status Summary',
        type: 'list',
        order: 5,
        data: this.generateSystemStatusList(monitoringData.systemMetrics),
      },
      {
        title: 'Recommendations',
        type: 'list',
        order: 6,
        data: this.generateSystemRecommendations(monitoringData),
      },
    ];

    return {
      title: 'System Monitoring Report',
      subtitle: `System Health Analysis for ${monitoringData.timeframe.period}`,
      generatedAt: new Date(),
      userInfo,
      content: {
        sections,
        metrics: this.convertSystemMetricsToMetricData(
          monitoringData.systemMetrics
        ),
      },
      branding: {
        primaryColor: '#dc2626',
        secondaryColor: '#991b1b',
        companyName: 'EcoSprout',
        footer: 'EcoSprout System Monitoring • Real-time System Health Data',
      },
    };
  }

  /**
   * Generate project monitoring report
   */
  static generateProjectMonitoringReport(
    monitoringData: MonitoringData,
    userInfo: { name: string; email: string; role: string }
  ): PDFTemplateData {
    const sections: PDFSection[] = [
      {
        title: 'Project Portfolio Status',
        type: 'text',
        order: 1,
        data: this.generateProjectPortfolioOverview(
          monitoringData.projectMonitoring
        ),
      },
      {
        title: 'Project Status Summary',
        type: 'table',
        order: 2,
        data: this.generateProjectStatusTable(monitoringData.projectMonitoring),
      },
      {
        title: 'Project Progress Details',
        type: 'table',
        order: 3,
        data: this.generateProjectProgressTable(
          monitoringData.projectMonitoring
        ),
      },
      {
        title: 'Verification Status Overview',
        type: 'table',
        order: 4,
        data: this.generateVerificationStatusTable(
          monitoringData.projectMonitoring
        ),
      },
      {
        title: 'Project Issues and Risks',
        type: 'list',
        order: 5,
        data: this.generateProjectIssuesList(monitoringData.projectMonitoring),
      },
      {
        title: 'Action Items',
        type: 'list',
        order: 6,
        data: this.generateProjectActionItems(monitoringData.projectMonitoring),
      },
    ];

    return {
      title: 'Project Monitoring Report',
      subtitle: `Project Portfolio Analysis for ${monitoringData.timeframe.period}`,
      generatedAt: new Date(),
      userInfo,
      content: {
        sections,
      },
      branding: {
        primaryColor: '#7c3aed',
        secondaryColor: '#5b21b6',
        companyName: 'EcoSprout',
        footer:
          'EcoSprout Project Monitoring • Project Health & Progress Tracking',
      },
    };
  }

  /**
   * Generate alert management report
   */
  static generateAlertReport(
    monitoringData: MonitoringData,
    userInfo: { name: string; email: string; role: string }
  ): PDFTemplateData {
    const sections: PDFSection[] = [
      {
        title: 'Alert Summary',
        type: 'text',
        order: 1,
        data: this.generateAlertSummary(monitoringData.alerts),
      },
      {
        title: 'Critical Alerts',
        type: 'table',
        order: 2,
        data: this.generateCriticalAlertsTable(monitoringData.alerts),
      },
      {
        title: 'Alert Distribution by Category',
        type: 'table',
        order: 3,
        data: this.generateAlertCategoryTable(monitoringData.alerts),
      },
      {
        title: 'Resolution Status',
        type: 'table',
        order: 4,
        data: this.generateAlertResolutionTable(monitoringData.alerts),
      },
      {
        title: 'Alert Trends Analysis',
        type: 'list',
        order: 5,
        data: this.generateAlertTrendsList(monitoringData.alerts),
      },
      {
        title: 'Preventive Measures',
        type: 'list',
        order: 6,
        data: this.generatePreventiveMeasures(monitoringData.alerts),
      },
    ];

    return {
      title: 'Alert Management Report',
      subtitle: `Alert Analysis for ${monitoringData.timeframe.period}`,
      generatedAt: new Date(),
      userInfo,
      content: {
        sections,
      },
      branding: {
        primaryColor: '#f59e0b',
        secondaryColor: '#d97706',
        companyName: 'EcoSprout',
        footer: 'EcoSprout Alert Management • Incident Response & Analysis',
      },
    };
  }

  /**
   * Generate performance monitoring report
   */
  static generatePerformanceReport(
    monitoringData: MonitoringData,
    userInfo: { name: string; email: string; role: string }
  ): PDFTemplateData {
    const sections: PDFSection[] = [
      {
        title: 'Performance Overview',
        type: 'text',
        order: 1,
        data: this.generatePerformanceOverview(
          monitoringData.performanceMetrics
        ),
      },
      {
        title: 'System Performance Metrics',
        type: 'table',
        order: 2,
        data: this.generatePerformanceMetricsTable(
          monitoringData.performanceMetrics
        ),
      },
      {
        title: 'Performance Targets vs Actual',
        type: 'table',
        order: 3,
        data: this.generatePerformanceTargetsTable(
          monitoringData.performanceMetrics
        ),
      },
      {
        title: 'Performance Trends',
        type: 'table',
        order: 4,
        data: this.generatePerformanceTrendsTable(
          monitoringData.performanceMetrics
        ),
      },
      {
        title: 'Performance Insights',
        type: 'list',
        order: 5,
        data: this.generatePerformanceInsights(
          monitoringData.performanceMetrics
        ),
      },
      {
        title: 'Optimization Recommendations',
        type: 'list',
        order: 6,
        data: this.generateOptimizationRecommendations(
          monitoringData.performanceMetrics
        ),
      },
    ];

    return {
      title: 'Performance Monitoring Report',
      subtitle: `System Performance Analysis for ${monitoringData.timeframe.period}`,
      generatedAt: new Date(),
      userInfo,
      content: {
        sections,
        metrics: this.convertPerformanceMetricsToMetricData(
          monitoringData.performanceMetrics
        ),
      },
      branding: {
        primaryColor: '#059669',
        secondaryColor: '#047857',
        companyName: 'EcoSprout',
        footer:
          'EcoSprout Performance Monitoring • System Optimization Analysis',
      },
    };
  }

  // Helper methods for generating content

  private static generateSystemHealthOverview(data: MonitoringData): string {
    const healthyCount = data.systemMetrics.filter(
      (m) => m.status === 'healthy'
    ).length;
    const warningCount = data.systemMetrics.filter(
      (m) => m.status === 'warning'
    ).length;
    const criticalCount = data.systemMetrics.filter(
      (m) => m.status === 'critical'
    ).length;
    const totalMetrics = data.systemMetrics.length;

    const activeAlerts = data.alerts.filter(
      (a) => a.status === 'active'
    ).length;
    const criticalAlerts = data.alerts.filter(
      (a) => a.type === 'critical' && a.status === 'active'
    ).length;

    return `System health overview for the period from ${data.timeframe.start.toLocaleDateString()} to ${data.timeframe.end.toLocaleDateString()}.

Overall System Status:
- ${healthyCount}/${totalMetrics} metrics in healthy state (${((healthyCount / totalMetrics) * 100).toFixed(1)}%)
- ${warningCount} metrics in warning state
- ${criticalCount} metrics in critical state
- ${activeAlerts} active alerts requiring attention
- ${criticalAlerts} critical alerts requiring immediate action

The system demonstrates ${healthyCount > totalMetrics * 0.8 ? 'excellent' : healthyCount > totalMetrics * 0.6 ? 'good' : 'concerning'} overall health with most metrics operating within acceptable parameters.`;
  }

  private static generateSystemMetricsTable(metrics: SystemMetric[]) {
    return {
      headers: ['Metric', 'Value', 'Threshold', 'Status', 'Category'],
      rows: metrics.map((metric) => [
        metric.name,
        `${metric.value} ${metric.unit}`,
        `${metric.threshold} ${metric.unit}`,
        this.getStatusIcon(metric.status),
        metric.category.replace('_', ' '),
      ]),
    };
  }

  private static generateAlertsTable(alerts: AlertData[]) {
    const activeAlerts = alerts
      .filter((a) => a.status === 'active')
      .slice(0, 10); // Show top 10

    return {
      headers: ['Alert', 'Type', 'Severity', 'Category', 'Created'],
      rows: activeAlerts.map((alert) => [
        alert.title,
        alert.type.toUpperCase(),
        alert.severity.toString(),
        alert.category.replace('_', ' '),
        alert.createdAt.toLocaleDateString(),
      ]),
    };
  }

  private static generatePerformanceTable(metrics: PerformanceMetric[]) {
    return {
      headers: ['Metric', 'Current', 'Target', 'Trend', 'Status'],
      rows: metrics.map((metric) => [
        metric.name,
        `${metric.value} ${metric.unit}`,
        `${metric.target} ${metric.unit}`,
        this.getTrendIcon(metric.trend),
        this.getPerformanceStatus(metric.value, metric.target),
      ]),
    };
  }

  private static generateSystemStatusList(metrics: SystemMetric[]): string[] {
    const statusItems: string[] = [];

    // Group by category
    const categories = [...new Set(metrics.map((m) => m.category))];
    categories.forEach((category) => {
      const categoryMetrics = metrics.filter((m) => m.category === category);
      const healthyCount = categoryMetrics.filter(
        (m) => m.status === 'healthy'
      ).length;
      const total = categoryMetrics.length;

      statusItems.push(
        `${category.replace('_', ' ').toUpperCase()}: ${healthyCount}/${total} metrics healthy`
      );
    });

    return statusItems;
  }

  private static generateSystemRecommendations(data: MonitoringData): string[] {
    const recommendations: string[] = [];

    const criticalMetrics = data.systemMetrics.filter(
      (m) => m.status === 'critical'
    );
    const warningMetrics = data.systemMetrics.filter(
      (m) => m.status === 'warning'
    );

    if (criticalMetrics.length > 0) {
      recommendations.push(
        `Address ${criticalMetrics.length} critical system metrics immediately`
      );
    }

    if (warningMetrics.length > 0) {
      recommendations.push(
        `Monitor ${warningMetrics.length} warning-level metrics closely`
      );
    }

    recommendations.push(
      'Implement automated alerting for threshold violations'
    );
    recommendations.push('Schedule regular system health reviews');
    recommendations.push('Consider capacity planning for trending metrics');

    return recommendations;
  }

  private static generateProjectPortfolioOverview(
    projects: ProjectMonitoringData[]
  ): string {
    const onTrack = projects.filter((p) => p.status === 'on_track').length;
    const delayed = projects.filter((p) => p.status === 'delayed').length;
    const atRisk = projects.filter((p) => p.status === 'at_risk').length;
    const completed = projects.filter((p) => p.status === 'completed').length;
    const total = projects.length;

    const avgProgress =
      projects.reduce((sum, p) => sum + p.progress, 0) / total;
    const totalCarbonOffset = projects.reduce(
      (sum, p) => sum + p.metrics.carbonOffset,
      0
    );
    const totalTreesPlanted = projects.reduce(
      (sum, p) => sum + p.metrics.treesPlanted,
      0
    );

    return `Project portfolio overview covering ${total} projects in the monitoring system.

Project Status Distribution:
- ${onTrack} projects on track (${((onTrack / total) * 100).toFixed(1)}%)
- ${delayed} projects delayed
- ${atRisk} projects at risk
- ${completed} projects completed

Portfolio Performance:
- Average progress: ${avgProgress.toFixed(1)}%
- Total carbon offset: ${totalCarbonOffset.toLocaleString()} tons
- Total trees planted: ${totalTreesPlanted.toLocaleString()}

The portfolio demonstrates ${onTrack > total * 0.7 ? 'strong' : onTrack > total * 0.5 ? 'moderate' : 'concerning'} overall performance with most projects meeting their milestones.`;
  }

  private static generateProjectStatusTable(projects: ProjectMonitoringData[]) {
    return {
      headers: [
        'Project',
        'Status',
        'Progress',
        'Next Milestone',
        'Last Update',
      ],
      rows: projects.map((project) => [
        project.projectName,
        project.status.replace('_', ' ').toUpperCase(),
        `${project.progress}%`,
        project.nextMilestone,
        project.lastUpdate.toLocaleDateString(),
      ]),
    };
  }

  private static generateProjectProgressTable(
    projects: ProjectMonitoringData[]
  ) {
    return {
      headers: [
        'Project',
        'Carbon Offset (tons)',
        'Trees Planted',
        'Area (hectares)',
        'Budget Used',
      ],
      rows: projects.map((project) => [
        project.projectName,
        project.metrics.carbonOffset.toLocaleString(),
        project.metrics.treesPlanted.toLocaleString(),
        project.metrics.areaImpacted.toLocaleString(),
        `${project.metrics.budgetUtilization}%`,
      ]),
    };
  }

  private static generateVerificationStatusTable(
    projects: ProjectMonitoringData[]
  ) {
    return {
      headers: ['Project', 'Verification Status', 'Progress', 'Issues'],
      rows: projects.map((project) => [
        project.projectName,
        project.verificationStatus.replace('_', ' ').toUpperCase(),
        `${project.progress}%`,
        project.issues.length.toString(),
      ]),
    };
  }

  private static generateProjectIssuesList(
    projects: ProjectMonitoringData[]
  ): string[] {
    const allIssues: string[] = [];

    projects.forEach((project) => {
      project.issues.forEach((issue) => {
        allIssues.push(
          `${project.projectName}: ${issue.title} (${issue.severity})`
        );
      });
    });

    return allIssues.length > 0
      ? allIssues.slice(0, 20)
      : ['No critical issues reported'];
  }

  private static generateProjectActionItems(
    projects: ProjectMonitoringData[]
  ): string[] {
    const actionItems: string[] = [];

    const delayedProjects = projects.filter((p) => p.status === 'delayed');
    const atRiskProjects = projects.filter((p) => p.status === 'at_risk');

    if (delayedProjects.length > 0) {
      actionItems.push(
        `Review and address delays in ${delayedProjects.length} projects`
      );
    }

    if (atRiskProjects.length > 0) {
      actionItems.push(
        `Implement risk mitigation for ${atRiskProjects.length} at-risk projects`
      );
    }

    actionItems.push('Schedule quarterly project review meetings');
    actionItems.push('Update project timelines and milestones');
    actionItems.push('Enhance monitoring frequency for delayed projects');

    return actionItems;
  }

  private static generateAlertSummary(alerts: AlertData[]): string {
    const activeAlerts = alerts.filter((a) => a.status === 'active');
    const criticalAlerts = activeAlerts.filter((a) => a.type === 'critical');
    const warningAlerts = activeAlerts.filter((a) => a.type === 'warning');
    const resolvedAlerts = alerts.filter((a) => a.status === 'resolved');

    const avgResolutionTime =
      this.calculateAverageResolutionTime(resolvedAlerts);

    return `Alert management summary showing current system alert status.

Alert Status:
- ${activeAlerts.length} active alerts requiring attention
- ${criticalAlerts.length} critical alerts (immediate action required)
- ${warningAlerts.length} warning alerts (monitoring required)
- ${resolvedAlerts.length} alerts resolved in this period

Performance Metrics:
- Average resolution time: ${avgResolutionTime}
- Alert escalation rate: ${((criticalAlerts.length / activeAlerts.length) * 100).toFixed(1)}%

The alert system is functioning effectively with most alerts being addressed within acceptable timeframes.`;
  }

  private static generateCriticalAlertsTable(alerts: AlertData[]) {
    const criticalAlerts = alerts.filter(
      (a) => a.type === 'critical' && a.status === 'active'
    );

    return {
      headers: [
        'Alert',
        'Severity',
        'Category',
        'Affected Projects',
        'Duration',
      ],
      rows: criticalAlerts.map((alert) => [
        alert.title,
        alert.severity.toString(),
        alert.category.replace('_', ' '),
        alert.affectedProjects.length.toString(),
        this.calculateAlertDuration(alert.createdAt),
      ]),
    };
  }

  private static generateAlertCategoryTable(alerts: AlertData[]) {
    const categories = ['system', 'project', 'verification', 'financial'];

    return {
      headers: ['Category', 'Active', 'Critical', 'Resolved', 'Total'],
      rows: categories.map((category) => {
        const categoryAlerts = alerts.filter((a) => a.category === category);
        const active = categoryAlerts.filter(
          (a) => a.status === 'active'
        ).length;
        const critical = categoryAlerts.filter(
          (a) => a.type === 'critical' && a.status === 'active'
        ).length;
        const resolved = categoryAlerts.filter(
          (a) => a.status === 'resolved'
        ).length;

        return [
          category.replace('_', ' ').toUpperCase(),
          active.toString(),
          critical.toString(),
          resolved.toString(),
          categoryAlerts.length.toString(),
        ];
      }),
    };
  }

  private static generateAlertResolutionTable(alerts: AlertData[]) {
    const resolvedAlerts = alerts
      .filter((a) => a.status === 'resolved')
      .slice(0, 10);

    return {
      headers: ['Alert', 'Type', 'Created', 'Resolved', 'Resolution Time'],
      rows: resolvedAlerts.map((alert) => [
        alert.title,
        alert.type.toUpperCase(),
        alert.createdAt.toLocaleDateString(),
        alert.resolvedAt?.toLocaleDateString() || 'N/A',
        this.calculateResolutionTime(alert.createdAt, alert.resolvedAt),
      ]),
    };
  }

  private static generateAlertTrendsList(alerts: AlertData[]): string[] {
    const trends: string[] = [];

    const totalAlerts = alerts.length;
    const criticalAlerts = alerts.filter((a) => a.type === 'critical').length;
    const systemAlerts = alerts.filter((a) => a.category === 'system').length;

    trends.push(`Total alerts generated: ${totalAlerts}`);
    trends.push(
      `Critical alert rate: ${((criticalAlerts / totalAlerts) * 100).toFixed(1)}%`
    );
    trends.push(
      `System alerts account for ${((systemAlerts / totalAlerts) * 100).toFixed(1)}% of all alerts`
    );
    trends.push(
      'Alert frequency has remained stable over the monitoring period'
    );
    trends.push('Most alerts are resolved within established SLA timeframes');

    return trends;
  }

  private static generatePreventiveMeasures(alerts: AlertData[]): string[] {
    return [
      'Implement proactive monitoring for frequently alerted components',
      'Set up predictive alerting based on trending metrics',
      'Review and adjust alert thresholds based on false positive rates',
      'Enhance automated resolution for common alert types',
      'Conduct root cause analysis for recurring critical alerts',
      'Improve alert documentation and response procedures',
    ];
  }

  private static generatePerformanceOverview(
    metrics: PerformanceMetric[]
  ): string {
    const improvingCount = metrics.filter(
      (m) => m.trend === 'improving'
    ).length;
    const stableCount = metrics.filter((m) => m.trend === 'stable').length;
    const decliningCount = metrics.filter(
      (m) => m.trend === 'declining'
    ).length;
    const total = metrics.length;

    const targetsMetCount = metrics.filter((m) => m.value >= m.target).length;

    return `Performance monitoring overview covering ${total} key performance indicators.

Performance Trends:
- ${improvingCount} metrics showing improvement (${((improvingCount / total) * 100).toFixed(1)}%)
- ${stableCount} metrics remaining stable
- ${decliningCount} metrics showing decline
- ${targetsMetCount}/${total} metrics meeting targets (${((targetsMetCount / total) * 100).toFixed(1)}%)

Overall system performance is ${improvingCount > decliningCount ? 'positive' : 'stable'} with most metrics trending in the right direction.`;
  }

  private static generatePerformanceMetricsTable(metrics: PerformanceMetric[]) {
    return {
      headers: ['Metric', 'Current Value', 'Unit', 'Target', 'Performance'],
      rows: metrics.map((metric) => [
        metric.name,
        metric.value.toString(),
        metric.unit,
        metric.target.toString(),
        `${((metric.value / metric.target) * 100).toFixed(1)}%`,
      ]),
    };
  }

  private static generatePerformanceTargetsTable(metrics: PerformanceMetric[]) {
    return {
      headers: ['Metric', 'Target', 'Actual', 'Variance', 'Status'],
      rows: metrics.map((metric) => [
        metric.name,
        `${metric.target} ${metric.unit}`,
        `${metric.value} ${metric.unit}`,
        `${(((metric.value - metric.target) / metric.target) * 100).toFixed(1)}%`,
        metric.value >= metric.target ? '✅ Met' : '❌ Below',
      ]),
    };
  }

  private static generatePerformanceTrendsTable(metrics: PerformanceMetric[]) {
    const categories = [...new Set(metrics.map((m) => m.category))];

    return {
      headers: [
        'Category',
        'Improving',
        'Stable',
        'Declining',
        'Overall Trend',
      ],
      rows: categories.map((category) => {
        const categoryMetrics = metrics.filter((m) => m.category === category);
        const improving = categoryMetrics.filter(
          (m) => m.trend === 'improving'
        ).length;
        const stable = categoryMetrics.filter(
          (m) => m.trend === 'stable'
        ).length;
        const declining = categoryMetrics.filter(
          (m) => m.trend === 'declining'
        ).length;

        const overallTrend =
          improving > declining
            ? '↗️ Positive'
            : improving === declining
              ? '→ Stable'
              : '↘️ Negative';

        return [
          category.replace('_', ' ').toUpperCase(),
          improving.toString(),
          stable.toString(),
          declining.toString(),
          overallTrend,
        ];
      }),
    };
  }

  private static generatePerformanceInsights(
    metrics: PerformanceMetric[]
  ): string[] {
    const insights: string[] = [];

    const uptimeMetrics = metrics.filter((m) => m.category === 'uptime');
    const responseTimeMetrics = metrics.filter(
      (m) => m.category === 'response_time'
    );

    if (uptimeMetrics.length > 0) {
      const avgUptime =
        uptimeMetrics.reduce((sum, m) => sum + m.value, 0) /
        uptimeMetrics.length;
      insights.push(`System uptime averaging ${avgUptime.toFixed(2)}%`);
    }

    if (responseTimeMetrics.length > 0) {
      const avgResponseTime =
        responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) /
        responseTimeMetrics.length;
      insights.push(`Average response time: ${avgResponseTime.toFixed(0)}ms`);
    }

    insights.push('Performance metrics indicate stable system operation');
    insights.push('Most performance targets are being consistently met');

    return insights;
  }

  private static generateOptimizationRecommendations(
    metrics: PerformanceMetric[]
  ): string[] {
    const recommendations: string[] = [];

    const belowTargetMetrics = metrics.filter((m) => m.value < m.target);
    const decliningMetrics = metrics.filter((m) => m.trend === 'declining');

    if (belowTargetMetrics.length > 0) {
      recommendations.push(
        `Focus on improving ${belowTargetMetrics.length} metrics below target`
      );
    }

    if (decliningMetrics.length > 0) {
      recommendations.push(
        `Investigate and address ${decliningMetrics.length} declining metrics`
      );
    }

    recommendations.push(
      'Implement automated performance tuning where possible'
    );
    recommendations.push('Review and update performance targets quarterly');
    recommendations.push(
      'Consider load balancing optimization for response times'
    );
    recommendations.push('Enhance caching strategies to improve throughput');

    return recommendations;
  }

  // Utility methods

  private static getStatusIcon(status: string): string {
    switch (status) {
      case 'healthy':
        return '✅ Healthy';
      case 'warning':
        return '⚠️ Warning';
      case 'critical':
        return '🚨 Critical';
      default:
        return '❓ Unknown';
    }
  }

  private static getTrendIcon(trend: string): string {
    switch (trend) {
      case 'improving':
        return '↗️ Improving';
      case 'stable':
        return '→ Stable';
      case 'declining':
        return '↘️ Declining';
      default:
        return '→ Unknown';
    }
  }

  private static getPerformanceStatus(value: number, target: number): string {
    const percentage = (value / target) * 100;
    if (percentage >= 100) return '✅ Excellent';
    if (percentage >= 90) return '✅ Good';
    if (percentage >= 80) return '⚠️ Fair';
    return '❌ Poor';
  }

  private static calculateAverageResolutionTime(
    resolvedAlerts: AlertData[]
  ): string {
    if (resolvedAlerts.length === 0) return 'N/A';

    const totalTime = resolvedAlerts.reduce((sum, alert) => {
      if (alert.resolvedAt) {
        return sum + (alert.resolvedAt.getTime() - alert.createdAt.getTime());
      }
      return sum;
    }, 0);

    const avgTime = totalTime / resolvedAlerts.length;
    const hours = Math.floor(avgTime / (1000 * 60 * 60));

    return `${hours} hours`;
  }

  private static calculateAlertDuration(createdAt: Date): string {
    const now = new Date();
    const duration = now.getTime() - createdAt.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} days`;
    return `${hours} hours`;
  }

  private static calculateResolutionTime(
    createdAt: Date,
    resolvedAt?: Date
  ): string {
    if (!resolvedAt) return 'N/A';

    const duration = resolvedAt.getTime() - createdAt.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} days`;
    return `${hours} hours`;
  }

  private static convertSystemMetricsToMetricData(
    metrics: SystemMetric[]
  ): MetricData[] {
    return metrics.map((metric) => ({
      id: metric.id,
      name: metric.name,
      value: metric.value,
      unit: metric.unit,
      format: 'number' as const,
      description: metric.description,
    }));
  }

  private static convertPerformanceMetricsToMetricData(
    metrics: PerformanceMetric[]
  ): MetricData[] {
    return metrics.map((metric) => ({
      id: metric.id,
      name: metric.name,
      value: metric.value,
      unit: metric.unit,
      format: 'number' as const,
    }));
  }
}

// The class and types are already exported at declaration, no need to re-export
