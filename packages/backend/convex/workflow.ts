import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { WorkflowService } from '../services/workflow-service';

export const handleProjectSubmission = mutation({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    return await WorkflowService.handleProjectSubmission(ctx, args.projectId);
  },
});

export const handleVerificationAssignment = mutation({
  args: {
    verificationId: v.id('verifications'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    return await WorkflowService.handleVerificationAssignment(
      ctx,
      args.verificationId,
      user._id
    );
  },
});

export const handleVerificationStart = mutation({
  args: {
    verificationId: v.id('verifications'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    return await WorkflowService.handleVerificationStart(
      ctx,
      args.verificationId,
      user._id
    );
  },
});

export const handleVerificationCompletion = mutation({
  args: {
    verificationId: v.id('verifications'),
    recommendation: v.union(
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('revision_required')
    ),
    qualityScore: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    return await WorkflowService.handleVerificationCompletion(
      ctx,
      args.verificationId,
      args.recommendation,
      args.qualityScore,
      user._id
    );
  },
});

export const getProjectWorkflowHistory = query({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const canView =
      project.creatorId === user._id ||
      project.assignedVerifierId === user._id ||
      user.role === 'admin';

    if (!canView) {
      throw new Error('Unauthorized: Cannot view project workflow history');
    }

    return await WorkflowService.getProjectWorkflowHistory(ctx, args.projectId);
  },
});

export const getWorkflowStats = query({
  args: {
    timeframe: v.optional(
      v.union(v.literal('day'), v.literal('week'), v.literal('month'))
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .unique();

    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    return await WorkflowService.getWorkflowStats(
      ctx,
      args.timeframe || 'month'
    );
  },
});

export const sendDeadlineReminder = mutation({
  args: {
    verificationId: v.id('verifications'),
    hoursRemaining: v.number(),
  },
  handler: async (ctx, args) => {
    return await WorkflowService.handleDeadlineReminder(
      ctx,
      args.verificationId,
      args.hoursRemaining
    );
  },
});

export const checkOverdue = mutation({
  args: {
    verificationId: v.id('verifications'),
  },
  handler: async (ctx, args) => {
    return await WorkflowService.handleOverdueVerification(
      ctx,
      args.verificationId
    );
  },
});

export const triggerWorkflowEvent = mutation({
  args: {
    projectId: v.id('projects'),
    event: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .unique();

    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    switch (args.event) {
      case 'project_submitted':
        return await WorkflowService.handleProjectSubmission(
          ctx,
          args.projectId
        );
      default:
        throw new Error(`Unknown workflow event: ${args.event}`);
    }
  },
});

export const getActiveWorkflows = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .unique();

    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const activeVerifications = await ctx.db
      .query('verifications')
      .filter((q) =>
        q.or(
          q.eq(q.field('status'), 'assigned'),
          q.eq(q.field('status'), 'in_progress')
        )
      )
      .collect();

    const pendingProjects = await ctx.db
      .query('projects')
      .withIndex('by_verification_status', (q) =>
        q.eq('verificationStatus', 'pending')
      )
      .collect();

    const now = Date.now();
    const overdueVerifications = activeVerifications.filter(
      (v) => v.dueDate < now
    );

    return {
      activeVerifications: activeVerifications.length,
      pendingProjects: pendingProjects.length,
      overdueVerifications: overdueVerifications.length,
      verifications: activeVerifications,
      projects: pendingProjects,
      overdue: overdueVerifications,
    };
  },
});
