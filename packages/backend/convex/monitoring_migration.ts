import { internalMutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * MONITORING & TRACKING SYSTEM - DATABASE MIGRATION
 *
 * This file contains migration functions to initialize the monitoring system:
 * - Initialize default monitoring configurations
 * - Create default milestones for existing projects
 * - Set up system alerts infrastructure
 * - Populate initial analytics data
 */

/**
 * Initialize the monitoring system for existing projects
 * This should be run once after deploying the schema changes
 */
export const initializeMonitoringSystem = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log('🔄 Starting monitoring system initialization...');

    try {
      // Step 1: Initialize default monitoring configurations
      const configCount = await initializeDefaultConfigs(ctx);
      console.log(`✅ Initialized ${configCount} monitoring configurations`);

      // Step 2: Create default milestones for existing active projects
      const milestoneCount = await createDefaultMilestonesForProjects(ctx);
      console.log(`✅ Created ${milestoneCount} default milestones`);

      // Step 3: Initialize analytics tracking
      const analyticsCount = await initializeAnalyticsTracking(ctx);
      console.log(`✅ Initialized ${analyticsCount} analytics entries`);

      console.log(
        '🎉 Monitoring system initialization completed successfully!'
      );

      return {
        success: true,
        summary: {
          configurations: configCount,
          milestones: milestoneCount,
          analytics: analyticsCount,
        },
      };
    } catch (error) {
      console.error('❌ Monitoring system initialization failed:', error);
      throw error;
    }
  },
});

/**
 * Initialize default monitoring configurations for all project types
 */
async function initializeDefaultConfigs(ctx: any): Promise<number> {
  // Check if configurations already exist
  const existingConfigs = await ctx.db.query('monitoringConfig').collect();

  if (existingConfigs.length > 0) {
    console.log('⏭️ Monitoring configurations already exist, skipping...');
    return 0;
  }

  const defaultConfigs = getDefaultMonitoringConfigs();
  let insertedCount = 0;

  for (const config of defaultConfigs) {
    await ctx.db.insert('monitoringConfig', config);
    insertedCount++;
  }

  return insertedCount;
}

/**
 * Create default milestones for existing active projects
 */
async function createDefaultMilestonesForProjects(ctx: any): Promise<number> {
  const activeProjects = await ctx.db
    .query('projects')
    .withIndex('by_status', (q: any) => q.eq('status', 'active'))
    .collect();

  let milestoneCount = 0;

  for (const project of activeProjects) {
    // Check if milestones already exist for this project
    const existingMilestones = await ctx.db
      .query('projectMilestones')
      .withIndex('by_project', (q: any) => q.eq('projectId', project._id))
      .collect();

    if (existingMilestones.length > 0) {
      continue; // Skip if milestones already exist
    }

    // Create default milestones based on project timeline
    const milestones = generateDefaultMilestones(project);

    for (const milestone of milestones) {
      await ctx.db.insert('projectMilestones', {
        ...milestone,
        projectId: project._id,
      });
      milestoneCount++;
    }
  }

  return milestoneCount;
}

/**
 * Initialize analytics tracking for the monitoring system
 */
async function initializeAnalyticsTracking(ctx: any): Promise<number> {
  const currentDate = Date.now();

  // Initialize baseline analytics
  const baselineMetrics = [
    {
      metric: 'monitoring_system_initialized',
      value: 1,
      date: currentDate,
      category: 'system',
      metadata: { version: '1.0', timestamp: new Date().toISOString() },
    },
    {
      metric: 'active_projects_count',
      value: await getActiveProjectsCount(ctx),
      date: currentDate,
      category: 'monitoring',
      metadata: { type: 'baseline' },
    },
    {
      metric: 'total_alerts_count',
      value: 0, // Starting fresh
      date: currentDate,
      category: 'monitoring',
      metadata: { type: 'baseline' },
    },
  ];

  let analyticsCount = 0;

  for (const metric of baselineMetrics) {
    await ctx.db.insert('analytics', metric);
    analyticsCount++;
  }

  return analyticsCount;
}

/**
 * Reset monitoring system (USE WITH CAUTION - DEVELOPMENT ONLY)
 */
export const resetMonitoringSystem = internalMutation({
  args: {
    confirmReset: v.boolean(),
  },
  handler: async (ctx, { confirmReset }) => {
    if (!confirmReset) {
      throw new Error('Reset confirmation required');
    }

    console.log('🔄 Resetting monitoring system...');

    try {
      // Delete all monitoring configurations
      const configs = await ctx.db.query('monitoringConfig').collect();
      for (const config of configs) {
        await ctx.db.delete(config._id);
      }

      // Delete all project milestones
      const milestones = await ctx.db.query('projectMilestones').collect();
      for (const milestone of milestones) {
        await ctx.db.delete(milestone._id);
      }

      // Delete all system alerts
      const alerts = await ctx.db.query('systemAlerts').collect();
      for (const alert of alerts) {
        await ctx.db.delete(alert._id);
      }

      // Delete monitoring-related analytics
      const analytics = await ctx.db
        .query('analytics')
        .withIndex('by_category', (q) => q.eq('category', 'monitoring'))
        .collect();
      for (const analytic of analytics) {
        await ctx.db.delete(analytic._id);
      }

      console.log('✅ Monitoring system reset completed');

      return {
        success: true,
        deletedCounts: {
          configurations: configs.length,
          milestones: milestones.length,
          alerts: alerts.length,
          analytics: analytics.length,
        },
      };
    } catch (error) {
      console.error('❌ Monitoring system reset failed:', error);
      throw error;
    }
  },
});

/**
 * Verify monitoring system integrity
 */
export const verifyMonitoringSystem = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log('🔍 Verifying monitoring system integrity...');

    const verification = {
      configurations: {
        total: 0,
        active: 0,
        projectTypes: 0,
      },
      milestones: {
        total: 0,
        byStatus: {} as Record<string, number>,
      },
      alerts: {
        total: 0,
        unresolved: 0,
        bySeverity: {} as Record<string, number>,
      },
      projects: {
        withMilestones: 0,
        withoutMilestones: 0,
        active: 0,
      },
    };

    // Count configurations
    const configs = await ctx.db.query('monitoringConfig').collect();
    verification.configurations.total = configs.length;
    verification.configurations.active = configs.filter(
      (c) => c.isActive
    ).length;
    verification.configurations.projectTypes = new Set(
      configs.map((c) => c.projectType)
    ).size;

    // Count milestones
    const milestones = await ctx.db.query('projectMilestones').collect();
    verification.milestones.total = milestones.length;

    for (const milestone of milestones) {
      verification.milestones.byStatus[milestone.status] =
        (verification.milestones.byStatus[milestone.status] || 0) + 1;
    }

    // Count alerts
    const alerts = await ctx.db.query('systemAlerts').collect();
    verification.alerts.total = alerts.length;
    verification.alerts.unresolved = alerts.filter((a) => !a.isResolved).length;

    for (const alert of alerts) {
      verification.alerts.bySeverity[alert.severity] =
        (verification.alerts.bySeverity[alert.severity] || 0) + 1;
    }

    // Count projects
    const activeProjects = await ctx.db
      .query('projects')
      .withIndex('by_status', (q) => q.eq('status', 'active'))
      .collect();

    verification.projects.active = activeProjects.length;

    for (const project of activeProjects) {
      const projectMilestones = await ctx.db
        .query('projectMilestones')
        .withIndex('by_project', (q) => q.eq('projectId', project._id))
        .collect();

      if (projectMilestones.length > 0) {
        verification.projects.withMilestones++;
      } else {
        verification.projects.withoutMilestones++;
      }
    }

    console.log('✅ Monitoring system verification completed');
    console.log('📊 Verification Results:', verification);

    return {
      success: true,
      verification,
      recommendations: generateRecommendations(verification),
    };
  },
});

// ============= HELPER FUNCTIONS =============

/**
 * Get default monitoring configurations
 */
function getDefaultMonitoringConfigs() {
  return [
    // Global configurations
    {
      projectType: 'all',
      configKey: 'alert_escalation_rules',
      configValue: {
        low: { escalateAfterHours: 168 },
        medium: { escalateAfterHours: 72 },
        high: { escalateAfterHours: 24 },
        critical: { escalateAfterHours: 4 },
      },
      description: 'Alert escalation timing rules',
      isActive: true,
    },
    {
      projectType: 'all',
      configKey: 'notification_preferences',
      configValue: {
        email: true,
        sms: { criticalOnly: true },
        inApp: true,
        maxDailyAlerts: 10,
      },
      description: 'Default notification preferences',
      isActive: true,
    },
    {
      projectType: 'all',
      configKey: 'monitoring_intervals',
      configValue: {
        dailyCheck: '06:00',
        hourlyUrgent: true,
        weeklyReports: 'monday_08:00',
      },
      description: 'System monitoring intervals',
      isActive: true,
    },

    // Project-type specific configurations
    ...[
      'reforestation',
      'solar',
      'wind',
      'biogas',
      'waste_management',
      'mangrove_restoration',
    ]
      .map((projectType) => [
        {
          projectType,
          configKey: 'progress_report_frequency',
          configValue: { days: 30, required: true },
          description: 'How often progress reports are required',
          isActive: true,
        },
        {
          projectType,
          configKey: 'reminder_schedule',
          configValue: { days: [7, 3, 1] },
          description: 'Days before deadline to send reminders',
          isActive: true,
        },
        {
          projectType,
          configKey: 'photo_requirements',
          configValue: {
            minimumCount: projectType === 'mangrove_restoration' ? 6 : 4,
            maxFileSizeMB: 10,
          },
          description: 'Photo evidence requirements',
          isActive: true,
        },
      ])
      .flat(),
  ];
}

/**
 * Generate default milestones for a project
 */
function generateDefaultMilestones(project: any) {
  const startDate = new Date(project.startDate).getTime();
  const endDate = new Date(project.expectedCompletionDate).getTime();
  const duration = endDate - startDate;

  return [
    {
      milestoneType: 'setup' as const,
      title: 'Project Setup Complete',
      description: 'Initial project setup and preparation completed',
      plannedDate: startDate + duration * 0.1,
      status: 'pending' as const,
      order: 1,
      isRequired: true,
    },
    {
      milestoneType: 'progress_25' as const,
      title: '25% Progress Milestone',
      description: 'First quarter of project completion',
      plannedDate: startDate + duration * 0.25,
      status: 'pending' as const,
      order: 2,
      isRequired: true,
    },
    {
      milestoneType: 'progress_50' as const,
      title: '50% Progress Milestone',
      description: 'Half-way point of project completion',
      plannedDate: startDate + duration * 0.5,
      status: 'pending' as const,
      order: 3,
      isRequired: true,
    },
    {
      milestoneType: 'progress_75' as const,
      title: '75% Progress Milestone',
      description: 'Three-quarters completion milestone',
      plannedDate: startDate + duration * 0.75,
      status: 'pending' as const,
      order: 4,
      isRequired: true,
    },
    {
      milestoneType: 'impact_first' as const,
      title: 'First Impact Measurement',
      description: 'First measurable environmental impact achieved',
      plannedDate: startDate + duration * 0.6,
      status: 'pending' as const,
      order: 5,
      isRequired: false,
    },
    {
      milestoneType: 'completion' as const,
      title: 'Project Completion',
      description: 'Final project completion and impact assessment',
      plannedDate: endDate,
      status: 'pending' as const,
      order: 6,
      isRequired: true,
    },
  ];
}

/**
 * Get active projects count
 */
async function getActiveProjectsCount(ctx: any): Promise<number> {
  const activeProjects = await ctx.db
    .query('projects')
    .withIndex('by_status', (q: any) => q.eq('status', 'active'))
    .collect();

  return activeProjects.length;
}

/**
 * Generate recommendations based on verification results
 */
function generateRecommendations(verification: any): string[] {
  const recommendations: string[] = [];

  if (verification.projects.withoutMilestones > 0) {
    recommendations.push(
      `${verification.projects.withoutMilestones} active projects are missing milestones. Consider running milestone creation.`
    );
  }

  if (verification.alerts.unresolved > 10) {
    recommendations.push(
      `High number of unresolved alerts (${verification.alerts.unresolved}). Review and resolve critical alerts.`
    );
  }

  if (verification.configurations.projectTypes < 6) {
    recommendations.push(
      'Some project types may be missing configurations. Verify all project types are configured.'
    );
  }

  if (verification.alerts.bySeverity.critical > 0) {
    recommendations.push(
      `${verification.alerts.bySeverity.critical} critical alerts require immediate attention.`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      'Monitoring system appears to be functioning correctly.'
    );
  }

  return recommendations;
}

/**
 * Update project milestones based on current progress
 */
export const updateProjectMilestones = internalMutation({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get latest progress update
    const latestUpdate = await ctx.db
      .query('progressUpdates')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .order('desc')
      .first();

    if (!latestUpdate) {
      return { updated: 0, message: 'No progress updates found' };
    }

    // Update milestones based on progress percentage
    const milestones = await ctx.db
      .query('projectMilestones')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .collect();

    let updatedCount = 0;
    const currentProgress = latestUpdate.progressPercentage;

    for (const milestone of milestones) {
      let shouldUpdate = false;
      let newStatus = milestone.status;

      // Auto-complete milestones based on progress
      if (
        milestone.milestoneType === 'progress_25' &&
        currentProgress >= 25 &&
        milestone.status === 'pending'
      ) {
        newStatus = 'completed';
        shouldUpdate = true;
      } else if (
        milestone.milestoneType === 'progress_50' &&
        currentProgress >= 50 &&
        milestone.status === 'pending'
      ) {
        newStatus = 'completed';
        shouldUpdate = true;
      } else if (
        milestone.milestoneType === 'progress_75' &&
        currentProgress >= 75 &&
        milestone.status === 'pending'
      ) {
        newStatus = 'completed';
        shouldUpdate = true;
      } else if (
        milestone.milestoneType === 'completion' &&
        currentProgress >= 100 &&
        milestone.status === 'pending'
      ) {
        newStatus = 'completed';
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        await ctx.db.patch(milestone._id, {
          status: newStatus,
          actualDate: latestUpdate.reportingDate,
        });
        updatedCount++;
      }
    }

    return {
      updated: updatedCount,
      currentProgress,
      message: `Updated ${updatedCount} milestones based on ${currentProgress}% progress`,
    };
  },
});
