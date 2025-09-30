import {
  mutation,
  query,
  internalAction,
  internalMutation,
  internalQuery,
} from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';

/**
 * AUTOMATED MONITORING SYSTEM
 *
 * This module provides comprehensive automated monitoring capabilities:
 * - Enhanced daily monitoring with performance optimization
 * - Milestone tracking with delay detection and timeline analysis
 * - Progress report monitoring with deadline tracking
 * - Advanced anomaly detection with statistical analysis
 * - Intelligent alert generation and escalation
 */

// ============= ENHANCED DAILY MONITORING =============

/**
 * Enhanced daily monitoring job with comprehensive project analysis
 */
export const enhancedDailyMonitoring = internalAction({
  args: {},
  handler: async (
    ctx
  ): Promise<{
    success: boolean;
    stats: {
      projectsMonitored: number;
      alertsGenerated: number;
      processingTime: number;
    };
  }> => {
    console.log('🔍 Starting enhanced daily project monitoring...');
    const startTime = Date.now();

    try {
      // Get monitoring statistics
      const stats: {
        activeProjects: number;
        overdueReports: number;
        delayedMilestones: number;
        activeAlerts: number;
        criticalAlerts: number;
      } = await ctx.runQuery(internal.automated_monitoring.getMonitoringStats);
      console.log(
        `📊 Monitoring overview: ${stats.activeProjects} active, ${stats.overdueReports} overdue reports, ${stats.delayedMilestones} delayed milestones`
      );

      // Run monitoring tasks in parallel for better performance
      const [
        projectAlerts,
        milestoneAlerts,
        reportAlerts,
        anomalyAlerts,
      ]: number[] = await Promise.all([
        ctx.runMutation(internal.automated_monitoring.monitorProjectProgress),
        ctx.runMutation(internal.automated_monitoring.monitorMilestoneDelays),
        ctx.runMutation(internal.automated_monitoring.monitorReportDeadlines),
        ctx.runMutation(internal.automated_monitoring.detectProjectAnomalies),
      ]);

      const totalAlerts: number =
        (projectAlerts || 0) +
        (milestoneAlerts || 0) +
        (reportAlerts || 0) +
        (anomalyAlerts || 0);

      // Generate daily monitoring report
      await ctx.runMutation(
        internal.automated_monitoring.generateDailyMonitoringReport,
        {
          stats: {
            ...stats,
            alertsGenerated: totalAlerts,
            processingTime: Date.now() - startTime,
          },
        }
      );

      // Process notifications for high-priority alerts
      if (totalAlerts > 0) {
        await ctx.runAction(
          internal.automated_monitoring.processHighPriorityNotifications
        );
      }

      const duration = (Date.now() - startTime) / 1000;
      console.log(
        `✅ Enhanced daily monitoring completed in ${duration}s: ${totalAlerts} alerts generated`
      );

      return {
        success: true,
        stats: {
          projectsMonitored: stats.activeProjects,
          alertsGenerated: totalAlerts,
          processingTime: duration,
        },
      };
    } catch (error) {
      console.error('❌ Enhanced daily monitoring failed:', error);

      // Log the failure for analysis
      await ctx.runMutation(
        internal.automated_monitoring.logMonitoringFailure,
        {
          errorMessage: (error as Error).message,
          processingTime: Date.now() - startTime,
        }
      );

      throw error;
    }
  },
});

/**
 * Get comprehensive monitoring statistics
 */
export const getMonitoringStats = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    // Get active projects
    const activeProjects = await ctx.db
      .query('projects')
      .withIndex('by_status', (q) => q.eq('status', 'active'))
      .collect();

    // Get overdue progress reports (no update in 30+ days)
    const projectsWithRecentUpdates = await ctx.db
      .query('progressUpdates')
      .withIndex('by_date', (q) => q.gte('reportingDate', thirtyDaysAgo))
      .collect();

    const projectsWithRecentUpdatesSet = new Set(
      projectsWithRecentUpdates.map((u) => u.projectId)
    );

    const overdueReports = activeProjects.filter(
      (p) => !projectsWithRecentUpdatesSet.has(p._id)
    ).length;

    // Get delayed milestones
    const delayedMilestones = await ctx.db
      .query('projectMilestones')
      .withIndex('by_status_date', (q) => q.eq('status', 'delayed'))
      .collect();

    // Get active alerts
    const activeAlerts = await ctx.db
      .query('systemAlerts')
      .filter((q) => q.eq(q.field('isResolved'), false))
      .collect();

    return {
      activeProjects: activeProjects.length,
      overdueReports,
      delayedMilestones: delayedMilestones.length,
      activeAlerts: activeAlerts.length,
      criticalAlerts: activeAlerts.filter((a) => a.severity === 'critical')
        .length,
    };
  },
});

// ============= PROJECT PROGRESS MONITORING =============

/**
 * Monitor progress across all active projects
 */
export const monitorProjectProgress = internalMutation({
  args: {},
  handler: async (ctx) => {
    const activeProjects = await ctx.db
      .query('projects')
      .withIndex('by_status', (q) => q.eq('status', 'active'))
      .collect();

    let alertsGenerated = 0;
    const batchSize = 10;

    // Process projects in batches for better performance
    for (let i = 0; i < activeProjects.length; i += batchSize) {
      const batch = activeProjects.slice(i, i + batchSize);

      for (const project of batch) {
        try {
          const alerts = await analyzeProjectProgress(ctx, project);
          alertsGenerated += alerts.length;
        } catch (error) {
          console.error(`Error monitoring project ${project._id}:`, error);
        }
      }

      // Small delay between batches to prevent system overload
      if (i + batchSize < activeProjects.length) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    console.log(
      `📊 Project progress monitoring: ${alertsGenerated} alerts generated`
    );
    return alertsGenerated;
  },
});

/**
 * Analyze individual project progress and generate alerts
 */
async function analyzeProjectProgress(
  ctx: any,
  project: any
): Promise<string[]> {
  const alerts: string[] = [];
  const now = Date.now();

  // 1. Check for stalled progress
  const recentUpdates = await ctx.db
    .query('progressUpdates')
    .withIndex('by_project', (q: any) => q.eq('projectId', project._id))
    .order('desc')
    .take(3);

  if (recentUpdates.length === 0) {
    // No progress updates at all
    const alertId = await generateAlert(ctx, {
      projectId: project._id,
      type: 'progress_reminder',
      severity: 'high',
      title: 'No Progress Updates',
      message: `Project "${project.title}" has no progress updates. Initial progress report required.`,
    });
    alerts.push(alertId);
  } else {
    // Check time since last update
    const daysSinceLastUpdate =
      (now - recentUpdates[0].reportingDate) / (1000 * 60 * 60 * 24);

    if (daysSinceLastUpdate > 35) {
      const alertId = await generateAlert(ctx, {
        projectId: project._id,
        type: 'overdue_warning',
        severity: daysSinceLastUpdate > 45 ? 'critical' : 'high',
        title: 'Progress Report Overdue',
        message: `Project "${project.title}" hasn't submitted a progress update for ${Math.floor(daysSinceLastUpdate)} days.`,
      });
      alerts.push(alertId);
    }

    // Check for progress stagnation
    if (recentUpdates.length >= 3) {
      const progressValues = recentUpdates.map(
        (u: any) => u.progressPercentage
      );
      const progressVariance =
        Math.max(...progressValues) - Math.min(...progressValues);

      if (progressVariance < 3 && daysSinceLastUpdate > 20) {
        const alertId = await generateAlert(ctx, {
          projectId: project._id,
          type: 'quality_concern',
          severity: 'medium',
          title: 'Stagnant Progress Detected',
          message: `Project "${project.title}" shows minimal progress changes over recent updates. Consider addressing potential issues.`,
        });
        alerts.push(alertId);
      }
    }
  }

  // 2. Check timeline compliance
  const timelineAlert = await checkTimelineCompliance(ctx, project);
  if (timelineAlert) {
    alerts.push(timelineAlert);
  }

  // 3. Check impact metrics consistency
  const impactAlert = await checkImpactMetricsConsistency(
    ctx,
    project,
    recentUpdates
  );
  if (impactAlert) {
    alerts.push(impactAlert);
  }

  return alerts;
}

/**
 * Check if project is following expected timeline
 */
async function checkTimelineCompliance(
  ctx: any,
  project: any
): Promise<string | null> {
  const projectStart = new Date(project.startDate).getTime();
  const projectEnd = new Date(project.expectedCompletionDate).getTime();
  const now = Date.now();

  // Skip if project just started (less than 30 days)
  if (now - projectStart < 30 * 24 * 60 * 60 * 1000) {
    return null;
  }

  const timeElapsed = (now - projectStart) / (projectEnd - projectStart);
  const currentProgress = (project.progressPercentage || 0) / 100;
  const scheduleVariance = timeElapsed - currentProgress;

  // Alert if more than 20% behind schedule
  if (scheduleVariance > 0.2 && timeElapsed > 0.3) {
    return await generateAlert(ctx, {
      projectId: project._id,
      type: 'milestone_delay',
      severity: scheduleVariance > 0.35 ? 'high' : 'medium',
      title: 'Project Behind Schedule',
      message: `Project "${project.title}" is ${Math.round(scheduleVariance * 100)}% behind expected timeline. Current progress: ${Math.round(currentProgress * 100)}%, Expected: ${Math.round(timeElapsed * 100)}%.`,
      metadata: {
        scheduleVariance: Math.round(scheduleVariance * 100),
        timeElapsed: Math.round(timeElapsed * 100),
        currentProgress: Math.round(currentProgress * 100),
      },
    });
  }

  return null;
}

/**
 * Check consistency of impact metrics
 */
async function checkImpactMetricsConsistency(
  ctx: any,
  project: any,
  recentUpdates: any[]
): Promise<string | null> {
  if (recentUpdates.length < 2) return null;

  const updatesWithMetrics = recentUpdates.filter(
    (u) =>
      u.carbonImpactToDate ||
      u.treesPlanted ||
      u.energyGenerated ||
      u.wasteProcessed
  );

  if (updatesWithMetrics.length < 2) return null;

  // Check for decreasing cumulative metrics
  for (let i = 0; i < updatesWithMetrics.length - 1; i++) {
    const current = updatesWithMetrics[i];
    const previous = updatesWithMetrics[i + 1];

    const metrics = [
      'carbonImpactToDate',
      'treesPlanted',
      'energyGenerated',
      'wasteProcessed',
    ];

    for (const metric of metrics) {
      if (
        current[metric] &&
        previous[metric] &&
        current[metric] < previous[metric]
      ) {
        return await generateAlert(ctx, {
          projectId: project._id,
          type: 'quality_concern',
          severity: 'medium',
          title: 'Inconsistent Impact Metrics',
          message: `Project "${project.title}" shows decreasing ${metric} in recent updates. Cumulative metrics should not decrease.`,
          metadata: {
            metric,
            currentValue: current[metric],
            previousValue: previous[metric],
          },
        });
      }
    }
  }

  return null;
}

// ============= MILESTONE TRACKING SYSTEM =============

/**
 * Monitor milestone delays across all projects
 */
export const monitorMilestoneDelays = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let alertsGenerated = 0;

    // Get overdue milestones
    const overdueMilestones = await ctx.db
      .query('projectMilestones')
      .withIndex('by_status_date', (q) => q.eq('status', 'pending'))
      .filter((q) => q.lt(q.field('plannedDate'), now))
      .collect();

    // Process each overdue milestone
    for (const milestone of overdueMilestones) {
      // Update milestone status to delayed
      await ctx.db.patch(milestone._id, {
        status: 'delayed' as const,
        delayReason: 'Automatically detected overdue milestone',
      });

      // Check if alert already exists
      const existingAlert = await ctx.db
        .query('systemAlerts')
        .withIndex('by_project', (q) => q.eq('projectId', milestone.projectId))
        .filter((q) =>
          q.and(
            q.eq(q.field('alertType'), 'milestone_delay'),
            q.eq(q.field('isResolved'), false)
          )
        )
        .first();

      if (!existingAlert) {
        const daysOverdue = Math.floor(
          (now - milestone.plannedDate) / (1000 * 60 * 60 * 24)
        );

        await generateAlert(ctx, {
          projectId: milestone.projectId,
          type: 'milestone_delay',
          severity: daysOverdue > 14 ? 'high' : 'medium',
          title: `Milestone Overdue: ${milestone.title}`,
          message: `Milestone "${milestone.title}" is ${daysOverdue} days overdue (planned: ${new Date(milestone.plannedDate).toLocaleDateString()}).`,
          metadata: {
            milestoneId: milestone._id,
            daysOverdue,
            plannedDate: milestone.plannedDate,
          },
        });

        alertsGenerated++;
      }
    }

    // Check upcoming milestones that are at risk
    const upcomingMilestones = await ctx.db
      .query('projectMilestones')
      .withIndex('by_status_date', (q) => q.eq('status', 'pending'))
      .filter((q) =>
        q.and(
          q.gte(q.field('plannedDate'), now),
          q.lte(q.field('plannedDate'), now + 14 * 24 * 60 * 60 * 1000) // Next 14 days
        )
      )
      .collect();

    // Analyze risk for upcoming milestones
    for (const milestone of upcomingMilestones) {
      const riskAlert = await analyzeMilestoneRisk(ctx, milestone);
      if (riskAlert) {
        alertsGenerated++;
      }
    }

    console.log(`⏰ Milestone monitoring: ${alertsGenerated} alerts generated`);
    return alertsGenerated;
  },
});

/**
 * Analyze risk level for upcoming milestones
 */
async function analyzeMilestoneRisk(
  ctx: any,
  milestone: any
): Promise<string | null> {
  const project = await ctx.db.get(milestone.projectId);
  if (!project || project.status !== 'active') return null;

  const daysUntilMilestone =
    (milestone.plannedDate - Date.now()) / (1000 * 60 * 60 * 24);

  // Get recent project progress
  const recentUpdates = await ctx.db
    .query('progressUpdates')
    .withIndex('by_project', (q: any) => q.eq('projectId', milestone.projectId))
    .order('desc')
    .take(3);

  // Risk factors
  let riskScore = 0;
  const riskFactors = [];

  // Factor 1: No recent updates
  if (recentUpdates.length === 0) {
    riskScore += 30;
    riskFactors.push('No progress updates available');
  } else {
    const daysSinceLastUpdate =
      (Date.now() - recentUpdates[0].reportingDate) / (1000 * 60 * 60 * 24);
    if (daysSinceLastUpdate > 20) {
      riskScore += 20;
      riskFactors.push(
        `${Math.floor(daysSinceLastUpdate)} days since last update`
      );
    }
  }

  // Factor 2: Slow progress rate
  if (recentUpdates.length >= 2) {
    const progressRate =
      recentUpdates[0].progressPercentage - recentUpdates[1].progressPercentage;
    if (progressRate < 2 && daysUntilMilestone < 7) {
      riskScore += 25;
      riskFactors.push('Low progress rate detected');
    }
  }

  // Factor 3: Project behind schedule
  const timelineCompliance = calculateTimelineCompliance(project);
  if (timelineCompliance < -0.1) {
    // More than 10% behind
    riskScore += 20;
    riskFactors.push('Project behind overall schedule');
  }

  // Generate risk alert if score is high
  if (riskScore >= 40) {
    return await generateAlert(ctx, {
      projectId: milestone.projectId,
      type: 'milestone_delay',
      severity: riskScore >= 60 ? 'high' : 'medium',
      title: `Milestone at Risk: ${milestone.title}`,
      message: `Milestone "${milestone.title}" (due ${new Date(milestone.plannedDate).toLocaleDateString()}) is at risk of delay. Risk factors: ${riskFactors.join(', ')}.`,
      metadata: {
        milestoneId: milestone._id,
        riskScore,
        riskFactors,
        daysUntilDeadline: Math.floor(daysUntilMilestone),
      },
    });
  }

  return null;
}

// ============= PROGRESS REPORT MONITORING =============

/**
 * Monitor progress report deadlines and overdue submissions
 */
export const monitorReportDeadlines = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let alertsGenerated = 0;

    // Get all active projects
    const activeProjects = await ctx.db
      .query('projects')
      .withIndex('by_status', (q) => q.eq('status', 'active'))
      .collect();

    for (const project of activeProjects) {
      // Get last progress update
      const lastUpdate = await ctx.db
        .query('progressUpdates')
        .withIndex('by_project', (q) => q.eq('projectId', project._id))
        .order('desc')
        .first();

      const lastUpdateDate = lastUpdate
        ? lastUpdate.reportingDate
        : new Date(project.startDate).getTime();
      const daysSinceLastUpdate =
        (now - lastUpdateDate) / (1000 * 60 * 60 * 24);

      // Check if report is overdue (30+ days)
      if (daysSinceLastUpdate >= 30) {
        // Check if alert already exists
        const existingAlert = await ctx.db
          .query('systemAlerts')
          .withIndex('by_project', (q) => q.eq('projectId', project._id))
          .filter((q) =>
            q.and(
              q.eq(q.field('alertType'), 'overdue_warning'),
              q.eq(q.field('isResolved'), false)
            )
          )
          .first();

        if (!existingAlert) {
          const severity =
            daysSinceLastUpdate >= 45
              ? 'critical'
              : daysSinceLastUpdate >= 35
                ? 'high'
                : 'medium';

          await generateAlert(ctx, {
            projectId: project._id,
            type: 'overdue_warning',
            severity,
            title: 'Progress Report Overdue',
            message: `Project "${project.title}" hasn't submitted a progress report for ${Math.floor(daysSinceLastUpdate)} days. Regular reporting is required for project transparency.`,
            metadata: {
              daysSinceLastUpdate: Math.floor(daysSinceLastUpdate),
              lastUpdateDate: lastUpdateDate,
            },
          });

          alertsGenerated++;
        }
      }

      // Send reminder notifications (7, 3, 1 days before 30-day deadline)
      else if (daysSinceLastUpdate >= 23 && daysSinceLastUpdate < 30) {
        const daysUntilOverdue = 30 - daysSinceLastUpdate;

        if ([7, 3, 1].includes(Math.floor(daysUntilOverdue))) {
          await generateAlert(ctx, {
            projectId: project._id,
            type: 'progress_reminder',
            severity: 'low',
            title: 'Progress Report Reminder',
            message: `Progress report for "${project.title}" will be due in ${Math.floor(daysUntilOverdue)} days. Please prepare your monthly update.`,
            metadata: {
              daysUntilOverdue: Math.floor(daysUntilOverdue),
              reminderType: 'upcoming_deadline',
            },
          });
        }
      }
    }

    console.log(
      `📋 Report deadline monitoring: ${alertsGenerated} alerts generated`
    );
    return alertsGenerated;
  },
});

// ============= ANOMALY DETECTION SYSTEM =============

/**
 * Detect anomalies across all projects using statistical analysis
 */
export const detectProjectAnomalies = internalMutation({
  args: {},
  handler: async (ctx) => {
    let alertsGenerated = 0;

    // Get all projects with recent activity
    const recentUpdates = await ctx.db
      .query('progressUpdates')
      .withIndex('by_date', (q) =>
        q.gte('reportingDate', Date.now() - 7 * 24 * 60 * 60 * 1000)
      )
      .collect();

    // Group updates by project
    const projectUpdates = new Map();
    for (const update of recentUpdates) {
      if (!projectUpdates.has(update.projectId)) {
        projectUpdates.set(update.projectId, []);
      }
      projectUpdates.get(update.projectId).push(update);
    }

    // Analyze each project for anomalies
    for (const [projectId, updates] of Array.from(projectUpdates.entries())) {
      try {
        const anomalies = await detectProjectSpecificAnomalies(
          ctx,
          projectId,
          updates
        );
        alertsGenerated += anomalies;
      } catch (error) {
        console.error(
          `Error detecting anomalies for project ${projectId}:`,
          error
        );
      }
    }

    // Detect platform-wide anomalies
    const platformAnomalies = await detectPlatformAnomalies(ctx, recentUpdates);
    alertsGenerated += platformAnomalies;

    console.log(`🔍 Anomaly detection: ${alertsGenerated} alerts generated`);
    return alertsGenerated;
  },
});

/**
 * Detect anomalies specific to a single project
 */
async function detectProjectSpecificAnomalies(
  ctx: any,
  projectId: string,
  updates: any[]
): Promise<number> {
  if (updates.length < 2) return 0;

  const project = await ctx.db.get(projectId);
  if (!project) return 0;

  let alertsGenerated = 0;

  // Sort updates by date
  updates.sort((a, b) => a.reportingDate - b.reportingDate);

  // 1. Detect unusual progress patterns
  const progressValues = updates.map((u) => u.progressPercentage);
  const progressAnomaly = detectProgressAnomalies(progressValues);

  if (progressAnomaly) {
    await generateAlert(ctx, {
      projectId,
      type: 'quality_concern',
      severity: 'medium',
      title: 'Unusual Progress Pattern',
      message: `Project "${project.title}" shows unusual progress patterns: ${progressAnomaly.description}`,
      metadata: progressAnomaly.data,
    });
    alertsGenerated++;
  }

  // 2. Detect metric inconsistencies
  const metricAnomaly = detectMetricAnomalies(updates, project.projectType);

  if (metricAnomaly) {
    await generateAlert(ctx, {
      projectId,
      type: 'impact_shortfall',
      severity: 'medium',
      title: 'Impact Metric Anomaly',
      message: `Project "${project.title}" has inconsistent impact metrics: ${metricAnomaly.description}`,
      metadata: metricAnomaly.data,
    });
    alertsGenerated++;
  }

  // 3. Detect reporting frequency anomalies
  const frequencyAnomaly = detectReportingFrequencyAnomaly(updates);

  if (frequencyAnomaly) {
    await generateAlert(ctx, {
      projectId,
      type: 'quality_concern',
      severity: 'low',
      title: 'Unusual Reporting Pattern',
      message: `Project "${project.title}" has unusual reporting frequency: ${frequencyAnomaly.description}`,
      metadata: frequencyAnomaly.data,
    });
    alertsGenerated++;
  }

  return alertsGenerated;
}

/**
 * Detect platform-wide anomalies
 */
async function detectPlatformAnomalies(
  ctx: any,
  recentUpdates: any[]
): Promise<number> {
  let alertsGenerated = 0;

  if (recentUpdates.length < 10) return 0; // Need sufficient data

  // 1. Detect unusual activity levels
  const dailyUpdateCounts = new Map();
  const now = Date.now();

  for (let i = 0; i < 7; i++) {
    const dayStart = now - (i + 1) * 24 * 60 * 60 * 1000;
    const dayEnd = now - i * 24 * 60 * 60 * 1000;
    const dayUpdates = recentUpdates.filter(
      (u) => u.reportingDate >= dayStart && u.reportingDate < dayEnd
    );
    dailyUpdateCounts.set(i, dayUpdates.length);
  }

  const avgDailyUpdates =
    Array.from(dailyUpdateCounts.values()).reduce((a, b) => a + b, 0) / 7;
  const today = dailyUpdateCounts.get(0) || 0;

  // Alert if today's activity is significantly different from average
  if (today < avgDailyUpdates * 0.3 && avgDailyUpdates > 5) {
    // Unusually low activity
    await ctx.db.insert('systemAlerts', {
      projectId: null,
      alertType: 'quality_concern',
      severity: 'low',
      title: 'Low Platform Activity',
      message: `Unusually low reporting activity detected today (${today} updates vs ${Math.round(avgDailyUpdates)} average).`,
      isResolved: false,
      notificationsSent: [],
      escalationLevel: 0,
      metadata: { todayUpdates: today, averageUpdates: avgDailyUpdates },
    });
    alertsGenerated++;
  }

  return alertsGenerated;
}

// ============= HELPER FUNCTIONS =============

/**
 * Generate a standardized alert
 */
async function generateAlert(
  ctx: any,
  alertData: {
    projectId: string;
    type: string;
    severity: string;
    title: string;
    message: string;
    metadata?: any;
  }
): Promise<string> {
  return await ctx.db.insert('systemAlerts', {
    projectId: alertData.projectId,
    alertType: alertData.type,
    severity: alertData.severity,
    title: alertData.title,
    message: alertData.message,
    isResolved: false,
    notificationsSent: [],
    escalationLevel: 0,
    nextEscalationAt: Date.now() + getEscalationDelay(alertData.severity),
    metadata: alertData.metadata || {},
  });
}

/**
 * Get escalation delay based on severity
 */
function getEscalationDelay(severity: string): number {
  const delays: Record<string, number> = {
    low: 7 * 24 * 60 * 60 * 1000, // 7 days
    medium: 3 * 24 * 60 * 60 * 1000, // 3 days
    high: 24 * 60 * 60 * 1000, // 1 day
    critical: 4 * 60 * 60 * 1000, // 4 hours
  };
  const delay = delays[severity];
  return delay !== undefined ? delay : delays.medium || 3 * 24 * 60 * 60 * 1000;
}

/**
 * Calculate timeline compliance score
 */
function calculateTimelineCompliance(project: any): number {
  const projectStart = new Date(project.startDate).getTime();
  const projectEnd = new Date(project.expectedCompletionDate).getTime();
  const now = Date.now();

  const timeElapsed = (now - projectStart) / (projectEnd - projectStart);
  const currentProgress = (project.progressPercentage || 0) / 100;

  return currentProgress - timeElapsed;
}

/**
 * Detect progress anomalies using statistical analysis
 */
function detectProgressAnomalies(progressValues: number[]): any {
  if (progressValues.length < 3) return null;

  // Check for impossible progress jumps
  for (let i = 1; i < progressValues.length; i++) {
    const currentValue = progressValues[i];
    const previousValue = progressValues[i - 1];
    if (currentValue === undefined || previousValue === undefined) continue;
    const jump = currentValue - previousValue;
    if (jump > 40) {
      return {
        description: `Unusually large progress increase of ${jump}% detected`,
        data: {
          progressJump: jump,
          previousValue: progressValues[i - 1],
          currentValue: progressValues[i],
        },
      };
    }
    if (jump < -10) {
      return {
        description: `Progress decreased by ${Math.abs(jump)}%, which is unusual for cumulative progress`,
        data: {
          progressDecrease: Math.abs(jump),
          previousValue: progressValues[i - 1],
          currentValue: progressValues[i],
        },
      };
    }
  }

  return null;
}

/**
 * Detect metric anomalies
 */
function detectMetricAnomalies(updates: any[], _projectType: string): any {
  // Focus on cumulative metrics that shouldn't decrease
  const cumulativeMetrics = [
    'carbonImpactToDate',
    'treesPlanted',
    'energyGenerated',
    'wasteProcessed',
  ];

  for (const metric of cumulativeMetrics) {
    for (let i = 1; i < updates.length; i++) {
      const current = updates[i][metric];
      const previous = updates[i - 1][metric];

      if (current && previous && current < previous) {
        return {
          description: `${metric} decreased from ${previous} to ${current}`,
          data: { metric, currentValue: current, previousValue: previous },
        };
      }
    }
  }

  return null;
}

/**
 * Detect reporting frequency anomalies
 */
function detectReportingFrequencyAnomaly(updates: any[]): any {
  if (updates.length < 3) return null;

  // Calculate intervals between updates
  const intervals = [];
  for (let i = 1; i < updates.length; i++) {
    const days =
      (updates[i].reportingDate - updates[i - 1].reportingDate) /
      (1000 * 60 * 60 * 24);
    intervals.push(days);
  }

  // Check for very frequent updates (multiple per day)
  const veryFrequent = intervals.filter((interval) => interval < 1).length;
  if (veryFrequent > intervals.length / 2) {
    return {
      description: `${veryFrequent} updates submitted within 24 hours of each other`,
      data: { frequentUpdates: veryFrequent, totalUpdates: updates.length },
    };
  }

  return null;
}

// ============= REPORTING AND NOTIFICATIONS =============

/**
 * Generate daily monitoring report
 */
export const generateDailyMonitoringReport = internalMutation({
  args: {
    stats: v.any(),
  },
  handler: async (ctx, { stats }) => {
    await ctx.db.insert('analytics', {
      metric: 'daily_monitoring_report',
      value: stats.alertsGenerated,
      date: Date.now(),
      metadata: {
        ...stats,
        reportType: 'daily_monitoring',
      },
    });

    console.log(
      `📊 Daily monitoring report generated: ${JSON.stringify(stats)}`
    );
  },
});

/**
 * Get urgent alerts that need notification
 */
export const getUrgentAlerts = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('systemAlerts')
      .filter((q: any) =>
        q.and(
          q.eq(q.field('isResolved'), false),
          q.or(
            q.eq(q.field('severity'), 'high'),
            q.eq(q.field('severity'), 'critical')
          )
        )
      )
      .collect();
  },
});

/**
 * Process high-priority notifications
 */
export const processHighPriorityNotifications = internalAction({
  args: {},
  handler: async (ctx) => {
    // Get high and critical severity alerts that haven't been notified
    const urgentAlerts = await ctx.runQuery(
      internal.automated_monitoring.getUrgentAlerts
    );

    // Process notifications for each alert
    for (const alert of urgentAlerts) {
      await ctx.runMutation(
        internal.automated_monitoring.sendAlertNotification,
        {
          alertId: alert._id,
        }
      );
    }

    console.log(
      `📨 Processed ${urgentAlerts.length} high-priority notifications`
    );
  },
});

/**
 * Send notification for specific alert
 */
export const sendAlertNotification = internalMutation({
  args: { alertId: v.id('systemAlerts') },
  handler: async (ctx, { alertId }) => {
    const alert = await ctx.db.get(alertId);
    if (
      !alert ||
      (alert.metadata?.notificationsSent &&
        alert.metadata.notificationsSent.length > 0)
    )
      return;

    // Determine notification recipients
    const recipients: string[] = [];

    if (alert.projectId) {
      const project = await ctx.db.get(alert.projectId);
      if (project) {
        recipients.push(project.creatorId);
        if (project.assignedVerifierId) {
          recipients.push(project.assignedVerifierId);
        }
      }
    }

    // Add admins for critical alerts
    if (alert.severity === 'critical') {
      const admins = await ctx.db
        .query('users')
        .withIndex('by_role', (q) => q.eq('role', 'admin'))
        .filter((q) => q.eq(q.field('isActive'), true))
        .collect();

      admins.forEach((admin) => {
        if (!recipients.includes(admin._id)) {
          recipients.push(admin._id);
        }
      });
    }

    // Update alert with notification recipients
    await ctx.db.patch(alertId, {
      metadata: {
        ...alert.metadata,
        notificationsSent: recipients,
      },
    });

    console.log(
      `📨 Notification sent for alert ${alertId} to ${recipients.length} recipients`
    );
  },
});

/**
 * Log monitoring system failures for analysis
 */
export const logMonitoringFailure = internalMutation({
  args: {
    errorMessage: v.string(),
    processingTime: v.number(),
  },
  handler: async (ctx, { errorMessage, processingTime }) => {
    await ctx.db.insert('auditLogs', {
      userId: undefined,
      action: 'monitoring_system_failure',
      entityType: 'system',
      entityId: 'automated-monitoring',
      metadata: {
        timestamp: Date.now(),
        errorMessage,
        processingTime,
        systemComponent: 'automated-monitoring',
      },
    });
  },
});

// Functions are exported individually above
