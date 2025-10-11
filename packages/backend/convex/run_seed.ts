import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';

/**
 * SEEDING RUNNER SCRIPT
 *
 * This script provides a simple way to run the monitoring data seeding.
 * It can be called from the Convex dashboard or via the CLI.
 */

export const runMonitoringSeed: any = mutation({
  args: {
    clearExisting: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    try {
      console.log('🚀 Starting monitoring data seeding process...');

      // TODO: seed_monitoring_data file doesn't exist yet
      // Call the seeding function when available
      // const result = await ctx.runMutation(internal.seed_monitoring_data.seedMonitoringData, {
      //   clearExisting: args.clearExisting || false
      // });

      console.log('⚠️ Seeding function not available yet');

      return {
        success: false,
        message: 'Seeding function not implemented',
        stats: {},
      };
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      return {
        success: false,
        message: 'Seeding failed',
        error: (error as Error).message,
      };
    }
  },
});

export const checkSeedingStatus = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      // Count records in key tables to verify seeding
      const [
        userCount,
        projectCount,
        milestoneCount,
        progressCount,
        alertCount,
        notificationCount,
        transactionCount,
      ] = await Promise.all([
        ctx.db
          .query('users')
          .collect()
          .then((docs) => docs.length),
        ctx.db
          .query('projects')
          .collect()
          .then((docs) => docs.length),
        ctx.db
          .query('projectMilestones')
          .collect()
          .then((docs) => docs.length),
        ctx.db
          .query('progressUpdates')
          .collect()
          .then((docs) => docs.length),
        ctx.db
          .query('systemAlerts')
          .collect()
          .then((docs) => docs.length),
        ctx.db
          .query('notifications')
          .collect()
          .then((docs) => docs.length),
        ctx.db
          .query('transactions')
          .collect()
          .then((docs) => docs.length),
      ]);

      const stats = {
        users: userCount,
        projects: projectCount,
        milestones: milestoneCount,
        progressUpdates: progressCount,
        alerts: alertCount,
        notifications: notificationCount,
        transactions: transactionCount,
        totalRecords:
          userCount +
          projectCount +
          milestoneCount +
          progressCount +
          alertCount +
          notificationCount +
          transactionCount,
      };

      console.log('📊 Current database statistics:', stats);

      return {
        success: true,
        isSeeded: stats.totalRecords > 0,
        stats,
      };
    } catch (error) {
      console.error('❌ Status check failed:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  },
});

export const clearAllSeedData = mutation({
  args: {},
  handler: async (ctx) => {
    try {
      console.log('🧹 Clearing all seed data...');

      const tables = [
        'systemAlerts',
        'projectMilestones',
        'progressUpdates',
        'notifications',
        'auditLogs',
        'transactions',
        'projects',
        'users',
        'monitoringConfig',
        'escalationConfig',
        'analyticsSnapshots',
      ];

      let totalDeleted = 0;

      for (const table of tables) {
        const docs = await (ctx.db.query as any)(table).collect();
        for (const doc of docs) {
          await ctx.db.delete(doc._id);
          totalDeleted++;
        }
        console.log(`✅ Cleared ${docs.length} records from ${table}`);
      }

      console.log(`🎉 Successfully cleared ${totalDeleted} total records`);

      return {
        success: true,
        message: `Cleared ${totalDeleted} records`,
        totalDeleted,
      };
    } catch (error) {
      console.error('❌ Clearing failed:', error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  },
});
