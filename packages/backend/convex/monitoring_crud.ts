import { mutation, query, internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import { UserService } from '../services/user-service';

/**
 * MONITORING SYSTEM - COMPREHENSIVE CRUD OPERATIONS
 *
 * This module provides complete CRUD operations for all monitoring system entities:
 * - Progress Updates (Create, Read, Update, Delete)
 * - Project Milestones (Create, Read, Update, Delete)
 * - System Alerts (Create, Read, Update, Delete)
 * - Analytics Data (Create, Read, Update, Delete)
 * - Monitoring Configuration (Create, Read, Update, Delete)
 */

// ============= PROGRESS UPDATES CRUD =============

/**
 * Create a new progress update with validation
 */
export const createProgressUpdate = mutation({
  args: {
    projectId: v.id('projects'),
    title: v.string(),
    description: v.string(),
    updateType: v.union(
      v.literal('milestone'),
      v.literal('measurement'),
      v.literal('photo'),
      v.literal('issue'),
      v.literal('completion')
    ),
    progressPercentage: v.number(),
    measurementData: v.optional(v.object({
      carbonImpactToDate: v.optional(v.number()),
      treesPlanted: v.optional(v.number()),
      energyGenerated: v.optional(v.number()),
      wasteProcessed: v.optional(v.number()),
    })),
    photoStorageIds: v.optional(v.array(v.id('_storage'))),
    photoUrls: v.optional(v.array(v.string())),
    nextSteps: v.optional(v.string()),
    challenges: v.optional(v.string()),
    location: v.optional(v.object({
      lat: v.number(),
      long: v.number(),
      name: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    // Verify project exists and user has permission
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const canCreate =
      user.role === 'admin' ||
      (user.role === 'project_creator' && project.creatorId === user._id);

    if (!canCreate) {
      throw new Error('Access denied: Cannot create progress update for this project');
    }

    // Validate progress percentage
    if (args.progressPercentage < 0 || args.progressPercentage > 100) {
      throw new Error('Progress percentage must be between 0 and 100');
    }

    // Create the progress update
    const progressUpdateId = await ctx.db.insert('progressUpdates', {
      projectId: args.projectId,
      submittedBy: user._id,
      title: args.title,
      description: args.description,
      updateType: args.updateType,
      progressPercentage: args.progressPercentage,
      measurementData: args.measurementData || {},
      photoStorageIds: args.photoStorageIds,
      photoUrls: args.photoUrls,
      nextSteps: args.nextSteps,
      challenges: args.challenges,
      location: args.location,
      reportingDate: Date.now(),
      isVerified: false,
    });

    // Update project's last progress update time
    await ctx.db.patch(args.projectId, {
      lastProgressUpdate: Date.now(),
    });

    return progressUpdateId;
  },
});

/**
 * Get progress updates for a project with filtering and pagination
 */
export const getProgressUpdates = query({
  args: {
    projectId: v.optional(v.id('projects')),
    updateType: v.optional(v.union(
      v.literal('milestone'),
      v.literal('measurement'),
      v.literal('photo'),
      v.literal('issue'),
      v.literal('completion')
    )),
    status: v.optional(v.union(
      v.literal('submitted'),
      v.literal('under_review'),
      v.literal('approved'),
      v.literal('rejected')
    )),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    let query = ctx.db.query('progressUpdates');

    // Apply project filter
    if (args.projectId) {
      query = query.filter(q => q.eq(q.field('projectId'), args.projectId));
    }

    // Apply role-based filtering
    if (user.role === 'project_creator') {
      // Project creators can only see their own updates
      const userProjects = await ctx.db
        .query('projects')
        .filter(q => q.eq(q.field('creatorId'), user._id))
        .collect();

      const projectIds = userProjects.map(p => p._id);
      query = query.filter(q =>
        projectIds.some(id => q.eq(q.field('projectId'), id))
      );
    }

    let updates = await query
      .order('desc')
      .collect();

    // Apply additional filters
    if (args.updateType) {
      updates = updates.filter(u => u.updateType === args.updateType);
    }

    if (args.status) {
      updates = updates.filter(u => u.status === args.status);
    }

    // Apply search filter
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      updates = updates.filter(u =>
        u.title.toLowerCase().includes(searchLower) ||
        u.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 20;
    updates = updates.slice(offset, offset + limit);

    return updates;
  },
});

/**
 * Update an existing progress update
 */
export const updateProgressUpdate = mutation({
  args: {
    updateId: v.id('progressUpdates'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    progressPercentage: v.optional(v.number()),
    measurementData: v.optional(v.object({
      carbonImpactToDate: v.optional(v.number()),
      treesPlanted: v.optional(v.number()),
      energyGenerated: v.optional(v.number()),
      wasteProcessed: v.optional(v.number()),
    })),
    nextSteps: v.optional(v.string()),
    challenges: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    const update = await ctx.db.get(args.updateId);
    if (!update) {
      throw new Error('Progress update not found');
    }

    // Check permissions
    const canUpdate =
      user.role === 'admin' ||
      (user.role === 'project_creator' && (update.submittedBy === user._id || update.reportedBy === user._id));

    if (!canUpdate) {
      throw new Error('Access denied: Cannot update this progress update');
    }

    // Validate progress percentage if provided
    if (args.progressPercentage !== undefined &&
        (args.progressPercentage < 0 || args.progressPercentage > 100)) {
      throw new Error('Progress percentage must be between 0 and 100');
    }

    // Build update object
    const updateData: any = {
      lastModified: Date.now(),
    };

    if (args.title !== undefined) updateData.title = args.title;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.progressPercentage !== undefined) updateData.progressPercentage = args.progressPercentage;
    if (args.measurementData !== undefined) updateData.measurementData = args.measurementData;
    if (args.nextSteps !== undefined) updateData.nextSteps = args.nextSteps;
    if (args.challenges !== undefined) updateData.challenges = args.challenges;

    await ctx.db.patch(args.updateId, updateData);

    return args.updateId;
  },
});

/**
 * Delete a progress update
 */
export const deleteProgressUpdate = mutation({
  args: {
    updateId: v.id('progressUpdates'),
  },
  handler: async (ctx, args) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    const update = await ctx.db.get(args.updateId);
    if (!update) {
      throw new Error('Progress update not found');
    }

    // Check permissions
    const canDelete =
      user.role === 'admin' ||
      (user.role === 'project_creator' && (update.submittedBy === user._id || update.reportedBy === user._id));

    if (!canDelete) {
      throw new Error('Access denied: Cannot delete this progress update');
    }

    await ctx.db.delete(args.updateId);
    return { success: true };
  },
});

// ============= PROJECT MILESTONES CRUD =============

/**
 * Create a new project milestone
 */
export const createMilestone = mutation({
  args: {
    projectId: v.id('projects'),
    title: v.string(),
    description: v.string(),
    milestoneType: v.union(
      v.literal('setup'),
      v.literal('progress_25'),
      v.literal('progress_50'),
      v.literal('progress_75'),
      v.literal('impact_first'),
      v.literal('verification'),
      v.literal('completion')
    ),
    plannedDate: v.number(),
    order: v.number(),
    isRequired: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    // Verify project exists and user has permission
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const canCreate =
      user.role === 'admin' ||
      (user.role === 'project_creator' && project.creatorId === user._id);

    if (!canCreate) {
      throw new Error('Access denied: Cannot create milestone for this project');
    }

    const milestoneId = await ctx.db.insert('projectMilestones', {
      projectId: args.projectId,
      title: args.title,
      description: args.description,
      milestoneType: args.milestoneType,
      plannedDate: args.plannedDate,
      order: args.order,
      isRequired: args.isRequired ?? true,
      status: 'pending',
    });

    return milestoneId;
  },
});

/**
 * Get milestones for a project with filtering
 */
export const getMilestones = query({
  args: {
    projectId: v.optional(v.id('projects')),
    status: v.optional(v.union(
      v.literal('pending'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('delayed'),
      v.literal('skipped')
    )),
    milestoneType: v.optional(v.union(
      v.literal('setup'),
      v.literal('progress_25'),
      v.literal('progress_50'),
      v.literal('progress_75'),
      v.literal('impact_first'),
      v.literal('verification'),
      v.literal('completion')
    )),
  },
  handler: async (ctx, args) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    let query = ctx.db.query('projectMilestones');

    // Apply project filter
    if (args.projectId) {
      query = query.filter(q => q.eq(q.field('projectId'), args.projectId));
    }

    let milestones = await query.order('asc').collect();

    // Apply additional filters
    if (args.status) {
      milestones = milestones.filter(m => m.status === args.status);
    }

    if (args.milestoneType) {
      milestones = milestones.filter(m => m.milestoneType === args.milestoneType);
    }

    return milestones;
  },
});

/**
 * Update milestone status and details
 */
export const updateMilestone = mutation({
  args: {
    milestoneId: v.id('projectMilestones'),
    status: v.optional(v.union(
      v.literal('pending'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('delayed'),
      v.literal('skipped')
    )),
    actualDate: v.optional(v.number()),
    delayReason: v.optional(v.string()),
    impactOnTimeline: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    const milestone = await ctx.db.get(args.milestoneId);
    if (!milestone) {
      throw new Error('Milestone not found');
    }

    // Check permissions
    const project = await ctx.db.get(milestone.projectId);
    const canUpdate =
      user.role === 'admin' ||
      (user.role === 'project_creator' && project?.creatorId === user._id);

    if (!canUpdate) {
      throw new Error('Access denied: Cannot update this milestone');
    }

    // Build update object
    const updateData: any = {};

    if (args.status !== undefined) updateData.status = args.status;
    if (args.actualDate !== undefined) updateData.actualDate = args.actualDate;
    if (args.delayReason !== undefined) updateData.delayReason = args.delayReason;
    if (args.impactOnTimeline !== undefined) updateData.impactOnTimeline = args.impactOnTimeline;

    await ctx.db.patch(args.milestoneId, updateData);

    return args.milestoneId;
  },
});

/**
 * Delete a milestone
 */
export const deleteMilestone = mutation({
  args: {
    milestoneId: v.id('projectMilestones'),
  },
  handler: async (ctx, args) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    const milestone = await ctx.db.get(args.milestoneId);
    if (!milestone) {
      throw new Error('Milestone not found');
    }

    // Check permissions
    const project = await ctx.db.get(milestone.projectId);
    const canDelete =
      user.role === 'admin' ||
      (user.role === 'project_creator' && project?.creatorId === user._id);

    if (!canDelete) {
      throw new Error('Access denied: Cannot delete this milestone');
    }

    await ctx.db.delete(args.milestoneId);
    return { success: true };
  },
});

// ============= SYSTEM ALERTS CRUD =============

/**
 * Create a new system alert
 */
export const createAlert = mutation({
  args: {
    projectId: v.optional(v.id('projects')),
    alertType: v.union(
      v.literal('overdue_warning'),
      v.literal('milestone_delay'),
      v.literal('impact_shortfall'),
      v.literal('quality_concern'),
      v.literal('verification_required')
    ),
    severity: v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('critical')
    ),
    message: v.string(),
    description: v.string(),
    assignedTo: v.optional(v.id('users')),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    // Only admins and system can create alerts
    if (user.role !== 'admin') {
      throw new Error('Access denied: Only admins can create alerts');
    }

    const alertId = await ctx.db.insert('systemAlerts', {
      projectId: args.projectId,
      alertType: args.alertType,
      severity: args.severity,
      message: args.message,
      description: args.description,
      source: 'manual',
      category: args.category || 'monitoring',
      assignedTo: args.assignedTo,
      isResolved: false,
      escalationLevel: 0,
      nextEscalationTime: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    return alertId;
  },
});

/**
 * Get alerts with filtering and search
 */
export const getAlerts = query({
  args: {
    projectId: v.optional(v.id('projects')),
    severity: v.optional(v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('critical')
    )),
    isResolved: v.optional(v.boolean()),
    assignedTo: v.optional(v.id('users')),
    limit: v.optional(v.number()),
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    let query = ctx.db.query('systemAlerts');

    // Apply filters
    if (args.projectId) {
      query = query.filter(q => q.eq(q.field('projectId'), args.projectId));
    }

    if (args.assignedTo) {
      query = query.filter(q => q.eq(q.field('assignedTo'), args.assignedTo));
    }

    let alerts = await query.order('desc').collect();

    // Apply additional filters
    if (args.severity) {
      alerts = alerts.filter(a => a.severity === args.severity);
    }

    if (args.isResolved !== undefined) {
      alerts = alerts.filter(a => a.isResolved === args.isResolved);
    }

    // Apply search filter
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      alerts = alerts.filter(a =>
        a.message.toLowerCase().includes(searchLower) ||
        (a.description?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    // Apply limit
    if (args.limit) {
      alerts = alerts.slice(0, args.limit);
    }

    return alerts;
  },
});

/**
 * Resolve an alert
 */
export const resolveAlert = mutation({
  args: {
    alertId: v.id('systemAlerts'),
    resolutionNotes: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    const alert = await ctx.db.get(args.alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    // Check permissions
    const canResolve =
      user.role === 'admin' ||
      alert.assignedTo === user._id;

    if (!canResolve) {
      throw new Error('Access denied: Cannot resolve this alert');
    }

    await ctx.db.patch(args.alertId, {
      isResolved: true,
      resolvedAt: Date.now(),
      resolvedBy: user._id,
      resolutionNotes: args.resolutionNotes,
    });

    return args.alertId;
  },
});

/**
 * Delete an alert
 */
export const deleteAlert = mutation({
  args: {
    alertId: v.id('systemAlerts'),
  },
  handler: async (ctx, args) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    // Only admins can delete alerts
    if (user.role !== 'admin') {
      throw new Error('Access denied: Only admins can delete alerts');
    }

    const alert = await ctx.db.get(args.alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    await ctx.db.delete(args.alertId);
    return { success: true };
  },
});

// ============= ANALYTICS DATA CRUD =============

/**
 * Create analytics entry
 */
export const createAnalytics = mutation({
  args: {
    metric: v.string(),
    value: v.number(),
    date: v.number(),
    metadata: v.optional(v.any()),
    projectId: v.optional(v.id('projects')),
  },
  handler: async (ctx, args) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    // Only admins and system can create analytics
    if (user.role !== 'admin') {
      throw new Error('Access denied: Only admins can create analytics');
    }

    const analyticsId = await ctx.db.insert('analytics', {
      metric: args.metric,
      value: args.value,
      date: args.date,
      metadata: args.metadata || {},
      projectId: args.projectId,
    });

    return analyticsId;
  },
});

/**
 * Get analytics data with filtering
 */
export const getAnalytics = query({
  args: {
    metric: v.optional(v.string()),
    projectId: v.optional(v.id('projects')),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    let query = ctx.db.query('analytics');

    if (args.metric) {
      query = query.filter(q => q.eq(q.field('metric'), args.metric));
    }

    if (args.projectId) {
      query = query.filter(q => q.eq(q.field('projectId'), args.projectId));
    }

    let analytics = await query.order('desc').collect();

    // Apply date range filter
    if (args.startDate) {
      analytics = analytics.filter(a => a.date >= args.startDate!);
    }

    if (args.endDate) {
      analytics = analytics.filter(a => a.date <= args.endDate!);
    }

    // Apply limit
    if (args.limit) {
      analytics = analytics.slice(0, args.limit);
    }

    return analytics;
  },
});

// ============= MONITORING SEARCH FUNCTIONALITY =============

/**
 * Global search across all monitoring data
 */
export const searchMonitoringData = query({
  args: {
    searchTerm: v.string(),
    entityTypes: v.optional(v.array(v.union(
      v.literal('progress_updates'),
      v.literal('milestones'),
      v.literal('alerts'),
      v.literal('projects')
    ))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    const searchLower = args.searchTerm.toLowerCase();
    const limit = args.limit || 50;
    const entityTypes = args.entityTypes || ['progress_updates', 'milestones', 'alerts', 'projects'];

    const results: any[] = [];

    // Search progress updates
    if (entityTypes.includes('progress_updates')) {
      const progressUpdates = await ctx.db.query('progressUpdates').collect();
      const filteredUpdates = progressUpdates
        .filter(u =>
          u.title.toLowerCase().includes(searchLower) ||
          u.description.toLowerCase().includes(searchLower)
        )
        .slice(0, Math.floor(limit / entityTypes.length))
        .map(u => ({ ...u, entityType: 'progress_update' }));

      results.push(...filteredUpdates);
    }

    // Search milestones
    if (entityTypes.includes('milestones')) {
      const milestones = await ctx.db.query('projectMilestones').collect();
      const filteredMilestones = milestones
        .filter(m =>
          m.title.toLowerCase().includes(searchLower) ||
          m.description.toLowerCase().includes(searchLower)
        )
        .slice(0, Math.floor(limit / entityTypes.length))
        .map(m => ({ ...m, entityType: 'milestone' }));

      results.push(...filteredMilestones);
    }

    // Search alerts
    if (entityTypes.includes('alerts')) {
      const alerts = await ctx.db.query('systemAlerts').collect();
      const filteredAlerts = alerts
        .filter(a =>
          a.message.toLowerCase().includes(searchLower) ||
          (a.description?.toLowerCase().includes(searchLower) ?? false)
        )
        .slice(0, Math.floor(limit / entityTypes.length))
        .map(a => ({ ...a, entityType: 'alert' }));

      results.push(...filteredAlerts);
    }

    // Search projects
    if (entityTypes.includes('projects')) {
      const projects = await ctx.db.query('projects').collect();
      const filteredProjects = projects
        .filter(p =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
        )
        .slice(0, Math.floor(limit / entityTypes.length))
        .map(p => ({ ...p, entityType: 'project' }));

      results.push(...filteredProjects);
    }

    // Sort by creation time (most recent first)
    return results
      .sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0))
      .slice(0, limit);
  },
});

// ============= DASHBOARD STATISTICS =============

/**
 * Get monitoring dashboard statistics
 */
export const getMonitoringStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Get basic counts
    const totalProjects = await ctx.db.query('projects').collect();
    const activeProjects = totalProjects.filter(p => p.status === 'active');

    const totalUpdates = await ctx.db.query('progressUpdates').collect();
    const recentUpdates = totalUpdates.filter(u => u.reportingDate >= thirtyDaysAgo);

    const totalAlerts = await ctx.db.query('systemAlerts').collect();
    const unresolved = totalAlerts.filter(a => !a.isResolved);
    const critical = totalAlerts.filter(a => a.severity === 'critical' && !a.isResolved);

    const totalMilestones = await ctx.db.query('projectMilestones').collect();
    const overdue = totalMilestones.filter(m =>
      m.status === 'pending' && m.plannedDate < now
    );

    return {
      projects: {
        total: totalProjects.length,
        active: activeProjects.length,
        completed: totalProjects.filter(p => p.status === 'completed').length,
      },
      progressUpdates: {
        total: totalUpdates.length,
        thisMonth: recentUpdates.length,
        thisWeek: totalUpdates.filter(u => u.reportingDate >= sevenDaysAgo).length,
      },
      alerts: {
        total: totalAlerts.length,
        unresolved: unresolved.length,
        critical: critical.length,
        resolved: totalAlerts.filter(a => a.isResolved).length,
      },
      milestones: {
        total: totalMilestones.length,
        completed: totalMilestones.filter(m => m.status === 'completed').length,
        overdue: overdue.length,
        pending: totalMilestones.filter(m => m.status === 'pending').length,
      },
    };
  },
});