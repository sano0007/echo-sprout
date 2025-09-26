import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { NotificationService } from '../services/notification-service';

// Get user notifications
export const getUserNotifications = query({
  args: {
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
    type: v.optional(v.string()),
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

    return await NotificationService.getUserNotifications(ctx, user._id, {
      limit: args.limit,
      unreadOnly: args.unreadOnly,
      type: args.type as any,
    });
  },
});

// Get notification statistics
export const getNotificationStats = query({
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

    if (!user) {
      throw new Error('User not found');
    }

    return await NotificationService.getNotificationStats(ctx, user._id);
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: {
    notificationId: v.id('notifications'),
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

    return await NotificationService.markAsRead(
      ctx,
      args.notificationId,
      user._id
    );
  },
});

// Mark all notifications as read
export const markAllAsRead = mutation({
  args: {
    type: v.optional(v.string()),
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

    return await NotificationService.markAllAsRead(
      ctx,
      user._id,
      args.type as any
    );
  },
});

// Create a notification (admin/system use)
export const createNotification = mutation({
  args: {
    recipientId: v.id('users'),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    priority: v.optional(v.string()),
    relatedEntityId: v.optional(v.string()),
    relatedEntityType: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
    emailNotification: v.optional(v.boolean()),
    pushNotification: v.optional(v.boolean()),
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

    return await NotificationService.createNotification(ctx, {
      recipientId: args.recipientId,
      type: args.type as any,
      title: args.title,
      message: args.message,
      priority: args.priority as any,
      relatedEntityId: args.relatedEntityId,
      relatedEntityType: args.relatedEntityType as any,
      actionUrl: args.actionUrl,
      emailNotification: args.emailNotification,
      pushNotification: args.pushNotification,
    });
  },
});

// Send deadline reminder (scheduled function)
export const sendDeadlineReminder = mutation({
  args: {
    verificationId: v.id('verifications'),
    hoursRemaining: v.number(),
  },
  handler: async (ctx, args) => {
    const verification = await ctx.db.get(args.verificationId);
    if (!verification) return;

    const project = await ctx.db.get(verification.projectId);
    if (!project) return;

    return await NotificationService.notifyDeadlineApproaching(
      ctx,
      args.verificationId,
      verification.verifierId,
      args.hoursRemaining,
      project.title
    );
  },
});

// Check for overdue verifications (scheduled function)
export const checkOverdue = mutation({
  args: {
    verificationId: v.id('verifications'),
  },
  handler: async (ctx, args) => {
    const verification = await ctx.db.get(args.verificationId);
    if (!verification) return;

    // Only process if still active
    if (!['assigned', 'in_progress'].includes(verification.status)) {
      return;
    }

    const project = await ctx.db.get(verification.projectId);
    if (!project) return;

    return await NotificationService.notifyDeadlineOverdue(
      ctx,
      args.verificationId,
      verification.verifierId,
      project.title
    );
  },
});

// Clean up old notifications (scheduled function)
export const cleanupOldNotifications = mutation({
  args: {
    olderThanDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await NotificationService.deleteOldNotifications(
      ctx,
      args.olderThanDays || 30
    );
  },
});
