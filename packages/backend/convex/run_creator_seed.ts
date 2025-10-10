import { mutation } from './_generated/server';
import { v } from 'convex/values';
import type { MutationCtx } from './_generated/server';
import { internal } from './_generated/api';

/**
 * CREATOR-SPECIFIC SEEDING RUNNER
 *
 * This script runs the creator-specific data seeding for a given user ID.
 * Designed for userId: j575k7hvdfr79ep5qjz6a3z3xh7rfwkr (project_creator)
 */

export const runCreatorSeed: any = mutation({
  args: {
    creatorUserId: v.optional(v.string()),
    clearExisting: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    // Default to the specific creator user ID
    const creatorUserId = args.creatorUserId || "j575k7hvdfr79ep5qjz6a3z3xh7rfwkr";

    try {
      console.log(`🚀 Starting creator-specific seeding for user: ${creatorUserId}`);

      // Call the seeding function
      const result = await ctx.runMutation(internal.seed_creator_data.seedCreatorSpecificData, {
        creatorUserId,
        clearExisting: args.clearExisting || false
      });

      console.log('✅ Creator seeding completed successfully!');
      console.log(`📊 Created data for: ${result.creatorName}`);
      console.log('📊 Statistics:', result.stats);

      return {
        success: true,
        message: 'Creator data seeded successfully',
        creatorId: result.creatorId,
        creatorName: result.creatorName,
        stats: result.stats
      };

    } catch (error) {
      console.error('❌ Creator seeding failed:', error);
      return {
        success: false,
        message: 'Creator seeding failed',
        error: (error as Error).message
      };
    }
  }
});

export const checkCreatorData = mutation({
  args: {
    creatorUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const creatorUserId = args.creatorUserId || "j575k7hvdfr79ep5qjz6a3z3xh7rfwkr";

    try {
      // Get creator info
      const creator = await ctx.db.get(creatorUserId as any) as any;
      if (!creator) {
        return {
          success: false,
          error: 'Creator not found'
        };
      }

      // Count data for this creator
      const projects = await ctx.db
        .query('projects')
        .withIndex('by_creator', (q: any) => q.eq('creatorId', creatorUserId))
        .collect();

      const projectIds = projects.map(p => p._id);

      const [progressUpdates, alerts, notifications] = await Promise.all([
        ctx.db.query('progressUpdates')
          .withIndex('by_reporter', (q: any) => q.eq('reportedBy', creatorUserId))
          .collect(),
        Promise.all(projectIds.map(async (projectId) => {
          return ctx.db.query('systemAlerts')
            .withIndex('by_project', (q: any) => q.eq('projectId', projectId))
            .collect();
        })).then(results => results.flat()),
        ctx.db.query('notifications')
          .withIndex('by_recipient', (q: any) => q.eq('recipientId', creatorUserId))
          .collect()
      ]);

      const stats = {
        creator: `${creator.firstName} ${creator.lastName}`,
        email: creator.email,
        role: creator.role,
        projects: projects.length,
        progressUpdates: progressUpdates.length,
        alerts: alerts.length,
        notifications: notifications.length,
        totalRecords: projects.length + progressUpdates.length + alerts.length + notifications.length
      };

      console.log('📊 Creator data statistics:', stats);

      return {
        success: true,
        isSeeded: stats.totalRecords > 0,
        stats,
        projectDetails: projects.map(p => ({
          title: p.title,
          type: p.projectType,
          status: p.status,
          progress: p.progressPercentage
        }))
      };

    } catch (error) {
      console.error('❌ Status check failed:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }
});

export const clearCreatorData = mutation({
  args: {
    creatorUserId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const creatorUserId = args.creatorUserId || "j575k7hvdfr79ep5qjz6a3z3xh7rfwkr";

    try {
      console.log(`🧹 Clearing data for creator: ${creatorUserId}`);

      // Get all projects for this creator
      const projects = await ctx.db
        .query('projects')
        .withIndex('by_creator', (q: any) => q.eq('creatorId', creatorUserId))
        .collect();

      const projectIds = projects.map(p => p._id);
      let totalDeleted = 0;

      // Clear related data
      const tables = [
        { table: 'progressUpdates', index: 'by_reporter', field: 'reportedBy', value: creatorUserId },
        { table: 'notifications', index: 'by_recipient', field: 'recipientId', value: creatorUserId },
      ];

      // Clear data by creator ID
      for (const { table, index, field, value } of tables) {
        const docs = await (ctx.db.query as any)(table).withIndex(index, (q: any) => q.eq(field, value)).collect();
        for (const doc of docs) {
          await ctx.db.delete(doc._id);
          totalDeleted++;
        }
      }

      // Clear data by project IDs
      const projectTables = ['systemAlerts', 'projectMilestones', 'transactions'];
      for (const table of projectTables) {
        for (const projectId of projectIds) {
          const docs = await (ctx.db.query as any)(table).withIndex('by_project', (q: any) => q.eq('projectId', projectId)).collect();
          for (const doc of docs) {
            await ctx.db.delete(doc._id);
            totalDeleted++;
          }
        }
      }

      // Delete projects last
      for (const project of projects) {
        await ctx.db.delete(project._id);
        totalDeleted++;
      }

      console.log(`🎉 Successfully cleared ${totalDeleted} records for creator`);

      return {
        success: true,
        message: `Cleared ${totalDeleted} records for creator`,
        totalDeleted
      };

    } catch (error) {
      console.error('❌ Clearing failed:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }
});