import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { UserService } from '../services/user-service';

/**
 * MONITORING SYSTEM ADMINISTRATION
 *
 * This module provides administrative functions for the monitoring system:
 * - Manual monitoring triggers for testing and immediate checks
 * - System health monitoring and diagnostics
 * - Alert management and resolution tools
 * - Performance metrics and analytics
 */

// ============= MANUAL MONITORING TRIGGERS =============

/**
 * Manually trigger enhanced daily monitoring (Admin only)
 */
export const triggerDailyMonitoring = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user || user.role !== 'admin') {
      throw new Error('Access denied: Admin privileges required');
    }

    console.log(`🔧 Manual daily monitoring triggered by admin ${user._id}`);

    // Run the enhanced daily monitoring
    const result = await ctx.runAction(
      internal.automatedMonitoring.enhancedDailyMonitoring
    );

    // Log the manual trigger
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      action: 'manual_trigger_daily_monitoring',
      entityType: 'system',
      entityId: 'monitoring',
      metadata: {
        timestamp: Date.now(),
        result,
      },
    });

    return result;
  },
});

/**
 * Manually trigger monitoring for a specific project
 */
export const triggerProjectMonitoring = mutation({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, { projectId }) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    // Check if user has access to this project
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const hasAccess =
      user.role === 'admin' ||
      (user.role === 'project_creator' && project.creatorId === user._id) ||
      (user.role === 'verifier' && project.assignedVerifierId === user._id);

    if (!hasAccess) {
      throw new Error('Access denied: Cannot monitor this project');
    }

    console.log(
      `🔧 Manual project monitoring triggered for ${projectId} by ${user._id}`
    );

    // Run monitoring for specific project
    const alerts = await ctx.runMutation(
      internal.monitoring.monitorProjectProgress,
      {
        projectId,
      }
    );

    // Log the manual trigger
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      action: 'manual_trigger_project_monitoring',
      entityType: 'project',
      entityId: projectId,
      metadata: {
        timestamp: Date.now(),
        alertsGenerated: alerts.length,
      },
    });

    return {
      success: true,
      alertsGenerated: alerts.length,
      projectTitle: project.title,
    };
  },
});

// ============= SYSTEM HEALTH & DIAGNOSTICS =============

/**
 * Get comprehensive system health status
 */
export const getSystemHealth = query({
  args: {},
  handler: async (ctx) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user || user.role !== 'admin') {
      throw new Error('Access denied: Admin privileges required');
    }

    const now = Date.now();
    const last24Hours = now - 24 * 60 * 60 * 1000;
    const last7Days = now - 7 * 24 * 60 * 60 * 1000;

    // Get monitoring statistics
    const stats = await ctx.runQuery(
      internal.automatedMonitoring.getMonitoringStats
    );

    // Get recent system activity
    const recentMonitoringLogs = await ctx.db
      .query('auditLogs')
      .withIndex('by_action', (q) => q.eq('action', 'daily_monitoring_report'))
      .filter((q) => q.gte(q.field('_creationTime'), last7Days))
      .order('desc')
      .take(7);

    // Get error logs
    const errorLogs = await ctx.db
      .query('auditLogs')
      .withIndex('by_action', (q) =>
        q.eq('action', 'monitoring_system_failure')
      )
      .filter((q) => q.gte(q.field('_creationTime'), last7Days))
      .order('desc')
      .take(10);

    // Calculate system performance metrics
    const performanceMetrics = recentMonitoringLogs.map((log) => ({
      date: new Date(log._creationTime).toISOString().split('T')[0],
      processingTime: log.metadata?.processingTime || 0,
      alertsGenerated: log.metadata?.alertsGenerated || 0,
      projectsMonitored: log.metadata?.activeProjects || 0,
    }));

    // Get alert response metrics
    const recentAlerts = await ctx.db
      .query('systemAlerts')
      .filter((q) => q.gte(q.field('_creationTime'), last7Days))
      .collect();

    const alertStats = {
      total: recentAlerts.length,
      resolved: recentAlerts.filter((a) => a.isResolved).length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      avgResolutionTime: 0,
    };

    // Calculate alert statistics
    recentAlerts.forEach((alert) => {
      alertStats.byType[alert.alertType] =
        (alertStats.byType[alert.alertType] || 0) + 1;
      alertStats.bySeverity[alert.severity] =
        (alertStats.bySeverity[alert.severity] || 0) + 1;
    });

    const resolvedAlerts = recentAlerts.filter(
      (a) => a.isResolved && a.resolvedAt
    );
    if (resolvedAlerts.length > 0) {
      const totalResolutionTime = resolvedAlerts.reduce((sum, alert) => {
        return sum + (alert.resolvedAt! - alert._creationTime);
      }, 0);
      alertStats.avgResolutionTime =
        totalResolutionTime / resolvedAlerts.length / (1000 * 60 * 60); // in hours
    }

    return {
      status: errorLogs.length === 0 ? 'healthy' : 'issues_detected',
      timestamp: now,
      currentStats: stats,
      performance: {
        last7Days: performanceMetrics,
        avgProcessingTime:
          performanceMetrics.length > 0
            ? performanceMetrics.reduce((sum, p) => sum + p.processingTime, 0) /
              performanceMetrics.length
            : 0,
        systemErrors: errorLogs.length,
      },
      alerts: alertStats,
      recommendations: generateHealthRecommendations(
        stats,
        errorLogs.length,
        alertStats
      ),
    };
  },
});

/**
 * Get detailed monitoring performance analytics
 */
export const getMonitoringAnalytics = query({
  args: {
    timeframe: v.optional(
      v.union(v.literal('24h'), v.literal('7d'), v.literal('30d'))
    ),
  },
  handler: async (ctx, { timeframe = '7d' }) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user || user.role !== 'admin') {
      throw new Error('Access denied: Admin privileges required');
    }

    const now = Date.now();
    let startTime: number;

    switch (timeframe) {
      case '24h':
        startTime = now - 24 * 60 * 60 * 1000;
        break;
      case '7d':
        startTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        startTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        startTime = now - 7 * 24 * 60 * 60 * 1000;
    }

    // Get monitoring analytics
    const monitoringReports = await ctx.db
      .query('analytics')
      .withIndex('by_metric', (q) => q.eq('metric', 'daily_monitoring_report'))
      .filter((q) => q.gte(q.field('date'), startTime))
      .order('desc')
      .collect();

    // Get alert trends
    const alerts = await ctx.db
      .query('systemAlerts')
      .filter((q) => q.gte(q.field('_creationTime'), startTime))
      .collect();

    // Calculate trends
    const trends = {
      alertsOverTime: calculateAlertTrends(alerts, startTime, timeframe),
      processingTimeOverTime: calculateProcessingTrends(monitoringReports),
      alertTypeDistribution: calculateAlertDistribution(alerts),
      resolutionRates: calculateResolutionRates(alerts),
    };

    return {
      timeframe,
      period: {
        start: new Date(startTime).toISOString(),
        end: new Date(now).toISOString(),
      },
      summary: {
        totalAlerts: alerts.length,
        avgProcessingTime: trends.processingTimeOverTime.average,
        resolutionRate: trends.resolutionRates.overall,
      },
      trends,
      insights: generateAnalyticsInsights(trends, timeframe),
    };
  },
});

// ============= ALERT MANAGEMENT =============

/**
 * Get all active alerts with filtering and sorting
 */
export const getActiveAlerts = query({
  args: {
    severity: v.optional(
      v.union(
        v.literal('low'),
        v.literal('medium'),
        v.literal('high'),
        v.literal('critical')
      )
    ),
    alertType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { severity, alertType, limit = 50 }) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    let query = ctx.db
      .query('systemAlerts')
      .filter((q) => q.eq(q.field('isResolved'), false));

    if (severity) {
      query = query.filter((q) => q.eq(q.field('severity'), severity));
    }

    if (alertType) {
      query = query.filter((q) => q.eq(q.field('alertType'), alertType));
    }

    const alerts = await query.order('desc').take(limit);

    // Enrich alerts with project information
    const enrichedAlerts = await Promise.all(
      alerts.map(async (alert) => {
        let projectInfo = null;
        if (alert.projectId) {
          const project = await ctx.db.get(alert.projectId);
          if (project) {
            projectInfo = {
              _id: project._id,
              title: project.title,
              projectType: project.projectType,
              status: project.status,
            };
          }
        }

        return {
          ...alert,
          project: projectInfo,
          daysOld: Math.floor(
            (Date.now() - alert._creationTime) / (1000 * 60 * 60 * 24)
          ),
        };
      })
    );

    return enrichedAlerts;
  },
});

/**
 * Resolve an alert (Admin/Verifier only)
 */
export const resolveAlert = mutation({
  args: {
    alertId: v.id('systemAlerts'),
    resolutionNotes: v.optional(v.string()),
  },
  handler: async (ctx, { alertId, resolutionNotes }) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    const alert = await ctx.db.get(alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    // Check permissions
    let hasPermission = user.role === 'admin';

    if (!hasPermission && alert.projectId) {
      const project = await ctx.db.get(alert.projectId);
      if (project) {
        hasPermission =
          user.role === 'verifier' && project.assignedVerifierId === user._id;
      }
    }

    if (!hasPermission) {
      throw new Error('Access denied: Cannot resolve this alert');
    }

    // Resolve the alert
    await ctx.db.patch(alertId, {
      isResolved: true,
      resolvedAt: Date.now(),
      resolvedBy: user._id,
      resolutionNotes,
    });

    // Log the resolution
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      action: 'resolve_monitoring_alert',
      entityType: 'system_alert',
      entityId: alertId,
      metadata: {
        timestamp: Date.now(),
        alertType: alert.alertType,
        severity: alert.severity,
        resolutionNotes,
      },
    });

    return { success: true };
  },
});

// ============= HELPER FUNCTIONS =============

function generateHealthRecommendations(
  stats: any,
  errorCount: number,
  alertStats: any
): string[] {
  const recommendations = [];

  if (errorCount > 0) {
    recommendations.push(
      'Review system error logs and address recurring issues'
    );
  }

  if (stats.criticalAlerts > 5) {
    recommendations.push(
      'High number of critical alerts - investigate underlying causes'
    );
  }

  if (stats.overdueReports > stats.activeProjects * 0.3) {
    recommendations.push(
      'Many projects have overdue reports - consider increasing reminder frequency'
    );
  }

  if (alertStats.avgResolutionTime > 48) {
    recommendations.push(
      'Alert resolution time is high - consider workflow improvements'
    );
  }

  if (recommendations.length === 0) {
    recommendations.push('System is operating normally');
  }

  return recommendations;
}

function calculateAlertTrends(
  alerts: any[],
  startTime: number,
  timeframe: string
) {
  const buckets = timeframe === '24h' ? 24 : timeframe === '7d' ? 7 : 30;
  const bucketSize = (Date.now() - startTime) / buckets;

  const trends = new Array(buckets).fill(0);

  alerts.forEach((alert) => {
    const bucketIndex = Math.floor(
      (alert._creationTime - startTime) / bucketSize
    );
    if (bucketIndex >= 0 && bucketIndex < buckets) {
      trends[bucketIndex]++;
    }
  });

  return trends;
}

function calculateProcessingTrends(reports: any[]) {
  const times = reports
    .map((r) => r.metadata?.processingTime)
    .filter((t) => typeof t === 'number');

  return {
    values: times,
    average:
      times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0,
    max: times.length > 0 ? Math.max(...times) : 0,
    min: times.length > 0 ? Math.min(...times) : 0,
  };
}

function calculateAlertDistribution(alerts: any[]) {
  const distribution: Record<string, number> = {};

  alerts.forEach((alert) => {
    distribution[alert.alertType] = (distribution[alert.alertType] || 0) + 1;
  });

  return distribution;
}

function calculateResolutionRates(alerts: any[]) {
  const total = alerts.length;
  const resolved = alerts.filter((a) => a.isResolved).length;

  return {
    overall: total > 0 ? resolved / total : 0,
    bySeverity: {
      critical: calculateRateForSeverity(alerts, 'critical'),
      high: calculateRateForSeverity(alerts, 'high'),
      medium: calculateRateForSeverity(alerts, 'medium'),
      low: calculateRateForSeverity(alerts, 'low'),
    },
  };
}

function calculateRateForSeverity(alerts: any[], severity: string) {
  const severityAlerts = alerts.filter((a) => a.severity === severity);
  const resolved = severityAlerts.filter((a) => a.isResolved).length;
  return severityAlerts.length > 0 ? resolved / severityAlerts.length : 0;
}

function generateAnalyticsInsights(trends: any, timeframe: string): string[] {
  const insights = [];

  // Alert volume insights
  const totalAlerts = trends.alertsOverTime.reduce(
    (a: number, b: number) => a + b,
    0
  );
  if (totalAlerts === 0) {
    insights.push(
      'No alerts generated in this period - system operating smoothly'
    );
  } else if (totalAlerts > 100) {
    insights.push('High alert volume detected - review monitoring thresholds');
  }

  // Processing time insights
  if (trends.processingTimeOverTime.average > 30000) {
    // 30 seconds
    insights.push(
      'Monitoring processing time is high - consider performance optimization'
    );
  }

  // Resolution rate insights
  if (trends.resolutionRates.overall < 0.7) {
    insights.push(
      'Low alert resolution rate - review alert management workflow'
    );
  }

  return insights;
}

// Export internal functions
export const internal = {
  monitoringAdmin: {
    triggerDailyMonitoring,
    triggerProjectMonitoring,
  },
};
