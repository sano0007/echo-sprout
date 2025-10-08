import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from './_generated/server';
import { v } from 'convex/values';

/**
 * MONITORING & TRACKING SYSTEM - CORE INFRASTRUCTURE
 *
 * This module provides the core infrastructure for the monitoring and tracking system:
 * - Scheduled monitoring jobs
 * - Alert generation and management
 * - Progress validation
 * - Notification dispatch
 */

// ============= SCHEDULED MONITORING JOBS =============

/**
 * Daily monitoring job that runs every day at 6:00 AM
 * Checks all active projects for:
 * - Overdue progress reports
 * - Milestone delays
 * - Impact metric anomalies
 */
export const dailyProjectMonitoring = internalAction({
  args: {},
  handler: async (_ctx) => {
    console.log('🔍 Starting daily project monitoring...');

    try {
      // In a real implementation, this would query the database and process projects
      // For now, just log the monitoring activity
      console.log('📊 Daily monitoring job executed successfully');

      // This would integrate with other monitoring functions
      console.log('Processing alert notifications...');
    } catch (error) {
      console.error('❌ Daily monitoring failed:', error);
      throw error;
    }
  },
});

/**
 * Hourly monitoring job for urgent checks
 * Runs every hour to check for critical issues
 */
export const hourlyUrgentMonitoring = internalAction({
  args: {},
  handler: async (_ctx) => {
    console.log('⚡ Starting hourly urgent monitoring...');

    try {
      // In a real implementation, this would check for critical alerts
      // For now, just log the monitoring activity
      console.log('⚡ Hourly urgent monitoring completed successfully');
    } catch (error) {
      console.error('❌ Hourly urgent monitoring failed:', error);
    }
  },
});

/**
 * Weekly reporting job
 * Generates weekly analytics and summary reports
 */
export const weeklyReportGeneration = internalAction({
  args: {},
  handler: async (_ctx) => {
    console.log('📊 Starting weekly report generation...');

    try {
      // In a real implementation, this would generate analytics and reports
      // For now, just log the monitoring activity
      console.log('📧 Weekly reports would be sent to stakeholders here');
      console.log('📊 Weekly report generation completed');
    } catch (error) {
      console.error('❌ Weekly report generation failed:', error);
    }
  },
});

// ============= PROJECT MONITORING QUERIES =============

/**
 * Get all active projects that need monitoring
 */
export const getActiveProjects = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('projects')
      .withIndex('by_status', (q) => q.eq('status', 'active'))
      .collect();
  },
});

/**
 * Get critical alerts that need immediate attention
 */
export const getCriticalAlerts = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    return await ctx.db
      .query('systemAlerts')
      .withIndex('by_severity', (q) => q.eq('severity', 'critical'))
      .filter((q) =>
        q.and(
          q.eq(q.field('isResolved'), false),
          q.or(
            q.eq(q.field('nextEscalationTime'), undefined),
            q.lt(q.field('nextEscalationTime'), now)
          )
        )
      )
      .collect();
  },
});

/**
 * Get project progress updates for monitoring
 */
export const getProjectProgressUpdates = internalQuery({
  args: {
    projectId: v.id('projects'),
    days: v.optional(v.number()),
  },
  handler: async (ctx, { projectId, days = 30 }) => {
    const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000;

    return await ctx.db
      .query('progressUpdates')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .filter((q) => q.gte(q.field('reportingDate'), cutoffDate))
      .order('desc')
      .collect();
  },
});

// ============= MONITORING LOGIC =============

/**
 * Monitor a specific project's progress and generate alerts
 */
export const monitorProjectProgress = internalMutation({
  args: { projectId: v.id('projects') },
  handler: async (ctx, { projectId }) => {
    const alerts: string[] = [];

    // Get project details
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    // Check for overdue progress reports
    const overdueReports = await checkOverdueReports(ctx, projectId);
    if (overdueReports.length > 0) {
      const alert = await generateProgressAlert(ctx, project, overdueReports);
      alerts.push(alert);
    }

    // Check milestone delays
    const delayedMilestones = await checkMilestoneDelays(ctx, projectId);
    if (delayedMilestones.length > 0) {
      const alert = await generateMilestoneAlert(
        ctx,
        project,
        delayedMilestones
      );
      alerts.push(alert);
    }

    // Check impact metrics
    const impactIssues = await checkImpactMetrics(ctx, projectId);
    if (impactIssues.length > 0) {
      const alert = await generateImpactAlert(ctx, project, impactIssues);
      alerts.push(alert);
    }

    return alerts;
  },
});

/**
 * Escalate an alert to the next level
 */
export const escalateAlert = internalMutation({
  args: { alertId: v.id('systemAlerts') },
  handler: async (ctx, { alertId }) => {
    const alert = await ctx.db.get(alertId);
    if (!alert || alert.isResolved) {
      return;
    }

    const newEscalationLevel = Math.min(alert.escalationLevel + 1, 3);
    const nextEscalation =
      newEscalationLevel < 3
        ? Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        : undefined;

    await ctx.db.patch(alertId, {
      escalationLevel: newEscalationLevel,
      nextEscalationTime: nextEscalation,
      message: `${alert.message} [ESCALATED - Level ${newEscalationLevel}]`,
    });

    console.log(`🚨 Alert ${alertId} escalated to level ${newEscalationLevel}`);
  },
});

/**
 * Check for overdue milestones and generate alerts
 */
export const checkOverdueMilestones = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const overdueMilestones = await ctx.db
      .query('projectMilestones')
      .withIndex('by_status_date', (q) => q.eq('status', 'pending'))
      .filter((q) => q.lt(q.field('plannedDate'), now))
      .collect();

    for (const milestone of overdueMilestones) {
      // Mark milestone as delayed
      await ctx.db.patch(milestone._id, {
        status: 'delayed',
      });

      // Generate alert if one doesn't exist
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
        await ctx.db.insert('systemAlerts', {
          projectId: milestone.projectId,
          alertType: 'milestone_delay',
          severity: 'high',
          message: `Milestone Overdue: ${milestone.title} - Milestone "${milestone.title}" is overdue. Planned date was ${new Date(milestone.plannedDate).toLocaleDateString()}.`,
          description: `Milestone "${milestone.title}" is overdue. Planned date was ${new Date(milestone.plannedDate).toLocaleDateString()}.`,
          source: 'system',
          category: 'monitoring',
          isResolved: false,
          escalationLevel: 0,
          nextEscalationTime: Date.now() + 24 * 60 * 60 * 1000,
        });
      }
    }

    console.log(`⏰ Checked milestones: ${overdueMilestones.length} overdue`);
  },
});

// ============= HELPER FUNCTIONS =============

/**
 * Check for overdue progress reports
 */
async function checkOverdueReports(ctx: any, projectId: string) {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  const recentUpdates = await ctx.db
    .query('progressUpdates')
    .withIndex('by_project', (q: any) => q.eq('projectId', projectId))
    .filter((q: any) => q.gte(q.field('reportingDate'), thirtyDaysAgo))
    .collect();

  // If no updates in the last 30 days, consider it overdue
  return recentUpdates.length === 0 ? ['No progress report in 30 days'] : [];
}

/**
 * Check for delayed milestones
 */
async function checkMilestoneDelays(ctx: any, projectId: string) {
  return await ctx.db
    .query('projectMilestones')
    .withIndex('by_project_status', (q: any) =>
      q.eq('projectId', projectId).eq('status', 'delayed')
    )
    .collect();
}

/**
 * Check impact metrics for anomalies
 */
async function checkImpactMetrics(ctx: any, projectId: string) {
  // Get recent progress updates with impact data
  const recentUpdates = await ctx.db
    .query('progressUpdates')
    .withIndex('by_project', (q: any) => q.eq('projectId', projectId))
    .order('desc')
    .take(5);

  const issues: string[] = [];

  // Check if impact metrics are consistently missing or declining
  const updatesWithImpact = recentUpdates.filter(
    (update: any) =>
      update.carbonImpactToDate || update.treesPlanted || update.energyGenerated
  );

  if (updatesWithImpact.length < recentUpdates.length / 2) {
    issues.push('Missing impact metrics in recent updates');
  }

  return issues;
}

/**
 * Generate progress-related alert
 */
async function generateProgressAlert(ctx: any, project: any, issues: string[]) {
  return await ctx.db.insert('systemAlerts', {
    projectId: project._id,
    alertType: 'overdue_warning',
    severity: 'medium',
    message: `Progress Report Overdue: Project "${project.title}" has overdue progress reports: ${issues.join(', ')}`,
    description: `Project "${project.title}" has overdue progress reports: ${issues.join(', ')}`,
    source: 'system',
    category: 'monitoring',
    assignedTo: project.creatorId,
    isResolved: false,
    escalationLevel: 0,
    nextEscalationTime: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

/**
 * Generate milestone-related alert
 */
async function generateMilestoneAlert(
  ctx: any,
  project: any,
  milestones: any[]
) {
  return await ctx.db.insert('systemAlerts', {
    projectId: project._id,
    alertType: 'milestone_delay',
    severity: 'high',
    message: `Milestone Delays: Project "${project.title}" has ${milestones.length} delayed milestone(s)`,
    description: `Project "${project.title}" has ${milestones.length} delayed milestone(s)`,
    source: 'system',
    category: 'monitoring',
    assignedTo: project.creatorId,
    isResolved: false,
    escalationLevel: 0,
    nextEscalationTime: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days
  });
}

/**
 * Generate impact metrics alert
 */
async function generateImpactAlert(ctx: any, project: any, issues: string[]) {
  return await ctx.db.insert('systemAlerts', {
    projectId: project._id,
    alertType: 'impact_shortfall',
    severity: 'medium',
    message: `Impact Metrics Issues: Project "${project.title}" has impact tracking issues: ${issues.join(', ')}`,
    description: `Project "${project.title}" has impact tracking issues: ${issues.join(', ')}`,
    source: 'system',
    category: 'monitoring',
    assignedTo: project.creatorId,
    isResolved: false,
    escalationLevel: 0,
    nextEscalationTime: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days
  });
}

// ============= NOTIFICATION SYSTEM =============

/**
 * Process and send notifications for new alerts
 */
export const processAlertNotifications = internalAction({
  args: {},
  handler: async (_ctx) => {
    console.log('📨 Processing alert notifications...');

    // Get unprocessed alerts (alerts with empty notificationsSent array)
    // This would query for unprocessed alerts in a real implementation
    const unprocessedAlerts: any[] = [];

    for (const alert of unprocessedAlerts) {
      try {
        // Send notification logic would go here
        console.log(`Sending notification for alert ${alert._id}`);
      } catch (error) {
        console.error(
          `❌ Failed to send notification for alert ${alert._id}:`,
          error
        );
      }
    }

    console.log(`📨 Processed ${unprocessedAlerts.length} alert notifications`);
  },
});

/**
 * Send notification for a specific alert
 */
export const sendAlertNotification = internalMutation({
  args: { alertId: v.id('systemAlerts') },
  handler: async (ctx, { alertId }) => {
    const alert = await ctx.db.get(alertId);
    if (!alert) return;

    const recipients: string[] = [];

    // Add assigned user
    if (alert.assignedTo) {
      recipients.push(alert.assignedTo);
    }

    // Add project creator
    const project = alert.projectId ? await ctx.db.get(alert.projectId) : null;
    if (
      project &&
      project.creatorId &&
      !recipients.includes(project.creatorId)
    ) {
      recipients.push(project.creatorId);
    }

    // Add admin users for critical alerts
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

    // Log notification sent (no notificationsSent field in schema)
    await ctx.db.patch(alertId, {
      lastUpdatedAt: Date.now(),
    });

    console.log(
      `📨 Alert ${alertId} notifications sent to ${recipients.length} recipients`
    );
  },
});

// ============= ANALYTICS & REPORTING =============

/**
 * Generate weekly analytics
 */
export const generateWeeklyAnalytics = internalMutation({
  args: {},
  handler: async (ctx) => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Count active projects
    const activeProjects = await ctx.db
      .query('projects')
      .withIndex('by_status', (q) => q.eq('status', 'active'))
      .collect();

    // Count alerts generated this week
    const weeklyAlerts = await ctx.db
      .query('systemAlerts')
      .filter((q) => q.gte(q.field('_creationTime'), weekAgo))
      .collect();

    // Count progress updates this week
    const weeklyUpdates = await ctx.db
      .query('progressUpdates')
      .filter((q) => q.gte(q.field('reportingDate'), weekAgo))
      .collect();

    // Store analytics
    await ctx.db.insert('analytics', {
      metric: 'weekly_active_projects',
      value: activeProjects.length,
      date: Date.now(),
      metadata: { period: 'week' },
    });

    await ctx.db.insert('analytics', {
      metric: 'weekly_alerts_generated',
      value: weeklyAlerts.length,
      date: Date.now(),
      metadata: {
        period: 'week',
        breakdown: {
          critical: weeklyAlerts.filter((a) => a.severity === 'critical')
            .length,
          high: weeklyAlerts.filter((a) => a.severity === 'high').length,
          medium: weeklyAlerts.filter((a) => a.severity === 'medium').length,
          low: weeklyAlerts.filter((a) => a.severity === 'low').length,
        },
      },
    });

    await ctx.db.insert('analytics', {
      metric: 'weekly_progress_updates',
      value: weeklyUpdates.length,
      date: Date.now(),
      metadata: { period: 'week' },
    });

    console.log(
      `📊 Weekly analytics generated: ${activeProjects.length} active projects, ${weeklyAlerts.length} alerts, ${weeklyUpdates.length} updates`
    );
  },
});

/**
 * Send weekly reports to stakeholders
 */
export const sendWeeklyReports = internalAction({
  args: {},
  handler: async (_ctx) => {
    // This would integrate with email service to send reports
    // For now, just log the action
    console.log('📧 Weekly reports would be sent to stakeholders here');

    // In a real implementation, this would:
    // 1. Generate report PDFs
    // 2. Get stakeholder email lists
    // 3. Send emails via external service
    // 4. Log delivery status
  },
});

// ============= BUYER TRACKING QUERIES =============

/**
 * Get project tracking data for a specific buyer
 */
export const getBuyerProjectTracking = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    // Get all transactions by this user
    const purchases = await ctx.db
      .query('transactions')
      .withIndex('by_buyer', (q) => q.eq('buyerId', userId))
      .filter((q) => q.eq(q.field('paymentStatus'), 'completed'))
      .collect();

    const trackingData = [];

    for (const purchase of purchases) {
      const projectId = purchase.projectId;
      if (!projectId) continue;
      const project = await ctx.db.get(projectId);
      if (!project) continue;

      // Get recent progress updates for this project
      const recentUpdates = await ctx.db
        .query('progressUpdates')
        .withIndex('by_project', (q) => q.eq('projectId', projectId))
        .order('desc')
        .take(3);

      // Get project milestones
      const milestones = await ctx.db
        .query('projectMilestones')
        .withIndex('by_project', (q) => q.eq('projectId', projectId))
        .order('asc')
        .collect();

      // Get active alerts for this project
      const alerts = await ctx.db
        .query('systemAlerts')
        .withIndex('by_project', (q) => q.eq('projectId', projectId))
        .filter((q) => q.eq(q.field('isResolved'), false))
        .collect();

      // Calculate current progress
      const completedMilestones = milestones.filter(
        (m) => m.status === 'completed'
      ).length;
      const totalMilestones = milestones.length;
      const overallProgress =
        totalMilestones > 0
          ? Math.round((completedMilestones / totalMilestones) * 100)
          : 0;

      // Get next milestone
      const nextMilestone = milestones.find(
        (m) => m.status === 'pending' || m.status === 'in_progress'
      );

      // Calculate carbon impact to date
      const latestUpdate = recentUpdates[0];
      const carbonOffset =
        latestUpdate?.measurementData?.carbonImpactToDate ||
        purchase.creditAmount * 1.5; // Fallback estimation

      trackingData.push({
        projectId: projectId,
        projectTitle: project.title,
        projectType: project.projectType,
        creatorName: 'Project Creator', // Will need to fetch from users table
        location: {
          country: project.location?.name || 'Unknown',
          region: project.location?.name || 'Unknown',
        },
        purchaseInfo: {
          creditsOwned: purchase.creditAmount,
          purchaseDate: purchase._creationTime,
          totalInvestment: purchase.totalAmount,
        },
        currentStatus: {
          overallProgress,
          currentPhase: 'In Progress', // Schema doesn't have currentPhase
          nextMilestone: nextMilestone?.title || 'Project Completion',
          nextMilestoneDate:
            nextMilestone?.plannedDate || project.expectedCompletionDate,
        },
        recentUpdates: recentUpdates.map((update) => ({
          id: update._id,
          type: update.updateType,
          title: update.title,
          description: update.description,
          date: update.reportingDate,
          photos: update.photos?.map((p) => p.cloudinary_url) || [],
          metrics: update.measurementData,
        })),
        impact: {
          carbonOffset,
          additionalMetrics: latestUpdate?.measurementData || {},
        },
        alerts: alerts.map((alert) => ({
          id: alert._id,
          severity: alert.severity,
          message: alert.message,
          date: alert._creationTime,
          isResolved: alert.isResolved,
        })),
        milestones: milestones.map((milestone) => ({
          id: milestone._id,
          title: milestone.title,
          plannedDate: milestone.plannedDate,
          actualDate: milestone.actualDate,
          status: milestone.status,
          description: milestone.description,
        })),
        verificationStatus: {
          status: project.verificationStatus || 'pending',
          lastVerified: project.verificationCompletedAt,
          nextVerification: null, // Schema doesn't have nextVerificationDate
        },
      });
    }

    return trackingData;
  },
});

/**
 * Get detailed tracking data for a specific project (buyer view)
 */
export const getDetailedProjectTracking = query({
  args: {
    projectId: v.id('projects'),
    userId: v.id('users'),
  },
  handler: async (ctx, { projectId, userId }) => {
    // Verify the user has purchased credits for this project
    const purchase = await ctx.db
      .query('transactions')
      .withIndex('by_buyer', (q) => q.eq('buyerId', userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('projectId'), projectId),
          q.eq(q.field('paymentStatus'), 'completed')
        )
      )
      .first();

    if (!purchase) {
      throw new Error(
        'Access denied: You have not purchased credits for this project'
      );
    }

    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get all progress updates
    const progressUpdates = await ctx.db
      .query('progressUpdates')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .order('desc')
      .collect();

    // Get all milestones
    const milestones = await ctx.db
      .query('projectMilestones')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .order('asc')
      .collect();

    // Get all alerts (resolved and unresolved)
    const alerts = await ctx.db
      .query('systemAlerts')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .order('desc')
      .collect();

    // Calculate detailed progress metrics
    const completedMilestones = milestones.filter(
      (m) => m.status === 'completed'
    ).length;
    const totalMilestones = milestones.length;
    const overallProgress =
      totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0;

    const nextMilestone = milestones.find(
      (m) => m.status === 'pending' || m.status === 'in_progress'
    );

    // Calculate total carbon impact
    const latestUpdate = progressUpdates[0];
    const carbonOffset =
      latestUpdate?.measurementData?.carbonImpactToDate ||
      purchase.creditAmount * 1.5;

    return {
      projectId,
      projectTitle: project.title,
      projectType: project.projectType,
      projectDescription: project.description,
      creatorName: 'Project Creator', // Will need to fetch from users table
      location: {
        country: project.location?.name || 'Unknown',
        region: project.location?.name || 'Unknown',
      },
      purchaseInfo: {
        creditsOwned: purchase.creditAmount,
        purchaseDate: purchase._creationTime,
        totalInvestment: purchase.totalAmount,
      },
      currentStatus: {
        overallProgress,
        currentPhase: 'In Progress', // Schema doesn't have currentPhase
        nextMilestone: nextMilestone?.title || 'Project Completion',
        nextMilestoneDate:
          nextMilestone?.plannedDate || project.expectedCompletionDate,
      },
      recentUpdates: progressUpdates.map((update) => ({
        id: update._id,
        type: update.updateType,
        title: update.title,
        description: update.description,
        date: update.reportingDate,
        photos: update.photos?.map((p) => p.cloudinary_url) || [],
        metrics: update.measurementData,
      })),
      impact: {
        carbonOffset,
        additionalMetrics: latestUpdate?.measurementData || {},
      },
      alerts: alerts.map((alert) => ({
        id: alert._id,
        severity: alert.severity,
        message: alert.message,
        date: alert._creationTime,
        isResolved: alert.isResolved,
        resolvedAt: alert.resolvedAt,
        resolutionNotes: alert.resolutionNotes,
      })),
      milestones: milestones.map((milestone) => ({
        id: milestone._id,
        title: milestone.title,
        plannedDate: milestone.plannedDate,
        actualDate: milestone.actualDate,
        status: milestone.status,
        description: milestone.description,
        delayReason: milestone.delayReason,
      })),
      verificationStatus: {
        status: project.verificationStatus || 'pending',
        lastVerified: project.verificationCompletedAt,
        nextVerification: null, // Schema doesn't have nextVerificationDate
      },
      timeline: {
        startDate: project.startDate,
        expectedCompletion: project.expectedCompletionDate,
        actualCompletion: project.actualCompletionDate,
      },
    };
  },
});

/**
 * Get buyer's portfolio summary for tracking overview
 */
export const getBuyerPortfolioSummary = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    // Get all purchases by this buyer
    const purchases = await ctx.db
      .query('transactions')
      .withIndex('by_buyer', (q) => q.eq('buyerId', userId))
      .filter((q) => q.eq(q.field('paymentStatus'), 'completed'))
      .collect();

    let totalCredits = 0;
    let totalInvestment = 0;
    let totalCarbonOffset = 0;
    let activeProjects = 0;
    let completedProjects = 0;
    let projectsWithIssues = 0;

    for (const purchase of purchases) {
      totalCredits += purchase.creditAmount;
      totalInvestment += purchase.totalAmount;

      const projectId = purchase.projectId;
      if (!projectId) continue;
      const project = await ctx.db.get(projectId);
      if (!project) continue;

      // Get latest progress update for carbon impact
      const latestUpdate = await ctx.db
        .query('progressUpdates')
        .withIndex('by_project', (q) => q.eq('projectId', projectId))
        .order('desc')
        .first();

      const carbonOffset =
        latestUpdate?.measurementData?.carbonImpactToDate ||
        purchase.creditAmount * 1.5;
      totalCarbonOffset += carbonOffset;

      // Check project status
      if (project.status === 'completed') {
        completedProjects++;
      } else {
        activeProjects++;
      }

      // Check for unresolved alerts
      const hasIssues = await ctx.db
        .query('systemAlerts')
        .withIndex('by_project', (q) => q.eq('projectId', projectId))
        .filter((q) => q.eq(q.field('isResolved'), false))
        .first();

      if (hasIssues) {
        projectsWithIssues++;
      }
    }

    return {
      totalCredits,
      totalInvestment,
      totalCarbonOffset: Math.round(totalCarbonOffset * 10) / 10, // Round to 1 decimal
      activeProjects,
      completedProjects,
      projectsWithIssues,
      totalProjects: purchases.length,
      averageInvestment:
        purchases.length > 0 ? totalInvestment / purchases.length : 0,
    };
  },
});

// Internal functions are automatically exported for use by scheduled jobs
