import { mutation, query, action } from './_generated/server';
import { v } from 'convex/values';
import { UserService } from '../services/user-service';
import { internal } from './_generated/api';

/**
 * ALERT GENERATION ENGINE
 *
 * This module provides comprehensive alert generation capabilities:
 * - Dynamic alert creation with severity classification
 * - Alert deduplication and consolidation
 * - Context-aware alert enrichment
 * - Performance-optimized alert processing
 */

// ============= ALERT GENERATION CORE =============

/**
 * Generate alert based on monitoring conditions
 */
export const generateAlert = mutation({
  args: {
    alertType: v.string(),
    severity: v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('critical')
    ),
    message: v.string(),
    projectId: v.optional(v.id('projects')),
    metadata: v.optional(v.any()),
    source: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (
    ctx,
    {
      alertType,
      severity,
      message,
      projectId,
      metadata = {},
      source = 'system',
      category = 'monitoring',
    }
  ) => {
    // Check for duplicate alerts to prevent spam
    const existingAlert = await findSimilarAlert(ctx, {
      alertType,
      projectId,
      severity,
      timeWindow: 60 * 60 * 1000, // 1 hour
    });

    if (existingAlert) {
      // Update existing alert instead of creating duplicate
      return await consolidateAlert(ctx, existingAlert._id, {
        occurrenceCount: (existingAlert.occurrenceCount || 1) + 1,
        lastOccurrence: Date.now(),
        metadata: { ...existingAlert.metadata, ...metadata },
      });
    }

    // Enrich alert with contextual information
    const enrichedAlert = await enrichAlertContext(ctx, {
      alertType,
      severity,
      message,
      projectId,
      metadata,
      source,
      category,
    });

    // Create new alert
    const alertId = await ctx.db.insert('systemAlerts', {
      alertType,
      severity,
      message: enrichedAlert.message,
      projectId,
      isResolved: false,
      escalationLevel: 0,
      occurrenceCount: 1,
      firstOccurrence: Date.now(),
      lastOccurrence: Date.now(),
      source,
      category,
      metadata: enrichedAlert.metadata,
      tags: enrichedAlert.tags,
      urgencyScore: calculateUrgencyScore(
        severity,
        alertType,
        enrichedAlert.projectContext
      ),
      estimatedResolutionTime: estimateResolutionTime(alertType, severity),
      autoEscalationEnabled: shouldEnableAutoEscalation(severity, alertType),
      nextEscalationTime: calculateNextEscalationTime(severity),
    });

    // Log alert generation
    await ctx.db.insert('auditLogs', {
      userId: 'system',
      action: 'alert_generated',
      entityType: 'system_alert',
      entityId: alertId,
      metadata: {
        alertType,
        severity,
        source,
        projectId,
        timestamp: Date.now(),
      },
    });

    // Trigger immediate notification for critical alerts
    if (severity === 'critical') {
      await ctx.scheduler.runAfter(
        0,
        internal.notifications.sendImmediateAlert,
        {
          alertId,
        }
      );
    }

    // Schedule escalation if needed
    if (shouldEnableAutoEscalation(severity, alertType)) {
      const escalationTime = calculateNextEscalationTime(severity);
      await ctx.scheduler.runAt(
        escalationTime,
        internal.alertEscalation.processEscalation,
        {
          alertId,
        }
      );
    }

    return {
      alertId,
      severity,
      message: enrichedAlert.message,
      escalationScheduled: shouldEnableAutoEscalation(severity, alertType),
    };
  },
});

/**
 * Generate multiple alerts in batch (for performance)
 */
export const generateBatchAlerts = mutation({
  args: {
    alerts: v.array(
      v.object({
        alertType: v.string(),
        severity: v.union(
          v.literal('low'),
          v.literal('medium'),
          v.literal('high'),
          v.literal('critical')
        ),
        message: v.string(),
        projectId: v.optional(v.id('projects')),
        metadata: v.optional(v.any()),
        source: v.optional(v.string()),
        category: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { alerts }) => {
    const results = [];
    const duplicateCheck = new Map();

    for (const alert of alerts) {
      // Create a key for duplicate detection
      const duplicateKey = `${alert.alertType}-${alert.projectId || 'global'}-${alert.severity}`;

      if (duplicateCheck.has(duplicateKey)) {
        // Skip duplicate in the same batch
        continue;
      }
      duplicateCheck.set(duplicateKey, true);

      try {
        const result = await ctx.runMutation(
          internal.alertGeneration.generateAlert,
          alert
        );
        results.push({
          success: true,
          alertId: result.alertId,
          ...alert,
        });
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          ...alert,
        });
      }
    }

    return {
      processedCount: results.length,
      successCount: results.filter((r) => r.success).length,
      errorCount: results.filter((r) => !r.success).length,
      results,
    };
  },
});

/**
 * Generate progress-related alerts based on monitoring data
 */
export const generateProgressAlert = mutation({
  args: {
    projectId: v.id('projects'),
    progressData: v.any(),
    thresholds: v.optional(v.any()),
  },
  handler: async (ctx, { projectId, progressData, thresholds = {} }) => {
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const alerts = [];
    const now = Date.now();

    // Check milestone delays
    if (progressData.delayedMilestones?.length > 0) {
      const severity = progressData.delayedMilestones.some(
        (m: any) => m.daysOverdue > 30
      )
        ? 'high'
        : 'medium';

      alerts.push({
        alertType: 'milestone_delay',
        severity,
        message: `${progressData.delayedMilestones.length} milestone(s) are delayed in ${project.title}`,
        projectId,
        metadata: {
          delayedMilestones: progressData.delayedMilestones,
          maxDelay: Math.max(
            ...progressData.delayedMilestones.map((m: any) => m.daysOverdue)
          ),
        },
        category: 'progress',
      });
    }

    // Check progress score issues
    if (progressData.progressScore !== undefined) {
      const scoreThreshold = thresholds.minProgressScore || 70;
      if (progressData.progressScore < scoreThreshold) {
        const severity = progressData.progressScore < 50 ? 'high' : 'medium';

        alerts.push({
          alertType: 'low_progress_score',
          severity,
          message: `Progress score (${progressData.progressScore}%) is below threshold for ${project.title}`,
          projectId,
          metadata: {
            currentScore: progressData.progressScore,
            threshold: scoreThreshold,
            scoreHistory: progressData.scoreHistory,
          },
          category: 'quality',
        });
      }
    }

    // Check overdue reports
    if (progressData.overdueReports?.length > 0) {
      const severity = progressData.overdueReports.some(
        (r: any) => r.daysOverdue > 14
      )
        ? 'high'
        : 'medium';

      alerts.push({
        alertType: 'overdue_reports',
        severity,
        message: `${progressData.overdueReports.length} report(s) are overdue for ${project.title}`,
        projectId,
        metadata: {
          overdueReports: progressData.overdueReports,
          oldestOverdue: Math.max(
            ...progressData.overdueReports.map((r: any) => r.daysOverdue)
          ),
        },
        category: 'compliance',
      });
    }

    // Generate all alerts
    let generatedAlerts = [];
    for (const alertData of alerts) {
      try {
        const result = await ctx.runMutation(
          internal.alertGeneration.generateAlert,
          alertData
        );
        generatedAlerts.push(result);
      } catch (error) {
        console.error('Failed to generate progress alert:', error);
      }
    }

    return {
      alertsGenerated: generatedAlerts.length,
      alerts: generatedAlerts,
    };
  },
});

/**
 * Generate system health alerts
 */
export const generateSystemAlert = mutation({
  args: {
    healthMetrics: v.any(),
    thresholds: v.optional(v.any()),
  },
  handler: async (ctx, { healthMetrics, thresholds = {} }) => {
    const alerts = [];

    // Check error rates
    if (healthMetrics.errorCount > (thresholds.maxErrors || 10)) {
      alerts.push({
        alertType: 'high_error_rate',
        severity: healthMetrics.errorCount > 50 ? 'critical' : 'high',
        message: `System error rate is high: ${healthMetrics.errorCount} errors detected`,
        metadata: {
          errorCount: healthMetrics.errorCount,
          errorTypes: healthMetrics.errorTypes,
          threshold: thresholds.maxErrors || 10,
        },
        category: 'system',
        source: 'health_monitor',
      });
    }

    // Check processing delays
    if (
      healthMetrics.avgProcessingTime > (thresholds.maxProcessingTime || 30000)
    ) {
      alerts.push({
        alertType: 'slow_processing',
        severity: 'medium',
        message: `System processing time is above threshold: ${Math.round(healthMetrics.avgProcessingTime / 1000)}s`,
        metadata: {
          avgProcessingTime: healthMetrics.avgProcessingTime,
          threshold: thresholds.maxProcessingTime || 30000,
          recentTimes: healthMetrics.recentProcessingTimes,
        },
        category: 'performance',
        source: 'performance_monitor',
      });
    }

    // Check alert backlog
    if (
      healthMetrics.unresolvedAlerts > (thresholds.maxUnresolvedAlerts || 100)
    ) {
      alerts.push({
        alertType: 'alert_backlog',
        severity: 'high',
        message: `High number of unresolved alerts: ${healthMetrics.unresolvedAlerts}`,
        metadata: {
          unresolvedCount: healthMetrics.unresolvedAlerts,
          threshold: thresholds.maxUnresolvedAlerts || 100,
          oldestAlert: healthMetrics.oldestUnresolvedAlert,
        },
        category: 'operations',
        source: 'alert_monitor',
      });
    }

    // Generate alerts
    if (alerts.length > 0) {
      return await ctx.runMutation(
        internal.alertGeneration.generateBatchAlerts,
        { alerts }
      );
    }

    return { alertsGenerated: 0, alerts: [] };
  },
});

// ============= HELPER FUNCTIONS =============

async function findSimilarAlert(
  ctx: any,
  options: {
    alertType: string;
    projectId?: string;
    severity: string;
    timeWindow: number;
  }
) {
  const { alertType, projectId, timeWindow } = options;
  const cutoffTime = Date.now() - timeWindow;

  let query = ctx.db
    .query('systemAlerts')
    .withIndex('by_type', (q: any) => q.eq('alertType', alertType))
    .filter((q: any) => q.gte(q.field('_creationTime'), cutoffTime))
    .filter((q: any) => q.eq(q.field('isResolved'), false));

  if (projectId) {
    query = query.filter((q: any) => q.eq(q.field('projectId'), projectId));
  }

  const results = await query.take(1);
  return results[0] || null;
}

async function consolidateAlert(ctx: any, alertId: string, updates: any) {
  await ctx.db.patch(alertId, updates);

  return {
    alertId,
    consolidated: true,
    occurrenceCount: updates.occurrenceCount,
  };
}

async function enrichAlertContext(ctx: any, alertData: any) {
  const enriched = { ...alertData };
  const tags = [];

  // Add project context
  if (alertData.projectId) {
    const project = await ctx.db.get(alertData.projectId);
    if (project) {
      enriched.projectContext = {
        title: project.title,
        type: project.projectType,
        status: project.status,
        creatorId: project.creatorId,
        verifierId: project.assignedVerifierId,
      };

      // Enhance message with project context
      enriched.message = `${alertData.message} (Project: ${project.title})`;

      tags.push(`project:${project.projectType}`, `status:${project.status}`);
    }
  }

  // Add severity tags
  tags.push(`severity:${alertData.severity}`, `type:${alertData.alertType}`);

  // Add timestamp context
  const hour = new Date().getHours();
  if (hour >= 9 && hour <= 17) {
    tags.push('business-hours');
  } else {
    tags.push('after-hours');
  }

  enriched.tags = tags;
  enriched.metadata = {
    ...enriched.metadata,
    enrichedAt: Date.now(),
    contextVersion: '1.0',
  };

  return enriched;
}

function calculateUrgencyScore(
  severity: string,
  alertType: string,
  projectContext?: any
): number {
  let baseScore =
    {
      low: 25,
      medium: 50,
      high: 75,
      critical: 100,
    }[severity] || 50;

  // Adjust based on alert type
  const typeMultipliers = {
    milestone_delay: 1.2,
    overdue_reports: 1.1,
    system_failure: 1.5,
    security_breach: 2.0,
    data_corruption: 1.8,
    low_progress_score: 1.0,
  };

  const multiplier =
    typeMultipliers[alertType as keyof typeof typeMultipliers] || 1.0;
  baseScore *= multiplier;

  // Adjust based on project context
  if (projectContext?.status === 'active') {
    baseScore *= 1.2;
  }

  return Math.min(Math.round(baseScore), 100);
}

function estimateResolutionTime(alertType: string, severity: string): number {
  const baseTimes = {
    critical: 4 * 60 * 60 * 1000, // 4 hours
    high: 24 * 60 * 60 * 1000, // 24 hours
    medium: 3 * 24 * 60 * 60 * 1000, // 3 days
    low: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const typeAdjustments = {
    system_failure: 0.5, // Faster resolution needed
    security_breach: 0.25, // Very fast resolution
    milestone_delay: 2.0, // Longer resolution time
    overdue_reports: 1.5, // Moderate adjustment
  };

  const baseTime =
    baseTimes[severity as keyof typeof baseTimes] || baseTimes.medium;
  const adjustment =
    typeAdjustments[alertType as keyof typeof typeAdjustments] || 1.0;

  return Math.round(baseTime * adjustment);
}

function shouldEnableAutoEscalation(
  severity: string,
  alertType: string
): boolean {
  // Always escalate critical alerts
  if (severity === 'critical') return true;

  // Escalate high severity system issues
  if (
    severity === 'high' &&
    ['system_failure', 'security_breach', 'data_corruption'].includes(alertType)
  ) {
    return true;
  }

  // Escalate overdue reports after time
  if (alertType === 'overdue_reports' && severity === 'high') {
    return true;
  }

  return false;
}

function calculateNextEscalationTime(severity: string): number {
  const escalationDelays = {
    critical: 1 * 60 * 60 * 1000, // 1 hour
    high: 4 * 60 * 60 * 1000, // 4 hours
    medium: 24 * 60 * 60 * 1000, // 24 hours
    low: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  const delay =
    escalationDelays[severity as keyof typeof escalationDelays] ||
    escalationDelays.medium;
  return Date.now() + delay;
}

// ============= QUERY FUNCTIONS =============

/**
 * Get alert generation statistics
 */
export const getAlertStats = query({
  args: {
    timeframe: v.optional(
      v.union(v.literal('24h'), v.literal('7d'), v.literal('30d'))
    ),
  },
  handler: async (ctx, { timeframe = '24h' }) => {
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
        startTime = now - 24 * 60 * 60 * 1000;
    }

    const alerts = await ctx.db
      .query('systemAlerts')
      .filter((q: any) => q.gte(q.field('_creationTime'), startTime))
      .collect();

    const stats = {
      total: alerts.length,
      bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      resolved: alerts.filter((a) => a.isResolved).length,
      avgUrgencyScore: 0,
      escalationRate: 0,
    };

    alerts.forEach((alert) => {
      stats.bySeverity[alert.severity as keyof typeof stats.bySeverity]++;
      stats.byType[alert.alertType] = (stats.byType[alert.alertType] || 0) + 1;
      stats.byCategory[alert.category || 'uncategorized'] =
        (stats.byCategory[alert.category || 'uncategorized'] || 0) + 1;
    });

    if (alerts.length > 0) {
      stats.avgUrgencyScore =
        alerts.reduce((sum, a) => sum + (a.urgencyScore || 50), 0) /
        alerts.length;
      stats.escalationRate =
        alerts.filter((a) => a.escalationLevel > 0).length / alerts.length;
    }

    return stats;
  },
});

// Export internal functions for cron jobs and other modules
export const internal = {
  alertGeneration: {
    generateAlert,
    generateBatchAlerts,
    generateProgressAlert,
    generateSystemAlert,
  },
};
