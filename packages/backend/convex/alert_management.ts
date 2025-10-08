import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { UserService } from '../services/user-service';

/**
 * ALERT MANAGEMENT API
 *
 * This module provides comprehensive alert management capabilities:
 * - CRUD operations for alerts
 * - Role-based alert access control
 * - Alert lifecycle management
 * - Bulk operations for efficiency
 * - Alert analytics and reporting
 */

// ============= ALERT CRUD OPERATIONS =============

/**
 * Create a new alert (typically called by monitoring systems)
 */
export const createAlert = mutation({
  args: {
    alertType: v.string(),
    severity: v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('critical')
    ),
    message: v.string(),
    description: v.optional(v.string()),
    projectId: v.optional(v.id('projects')),
    assignedTo: v.optional(v.id('users')),
    metadata: v.optional(v.any()),
    source: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    // Check permissions for manual alert creation
    const canCreateAlerts =
      user.role === 'admin' ||
      user.role === 'verifier' ||
      (user.role === 'project_creator' && args.projectId);

    if (!canCreateAlerts) {
      throw new Error('Access denied: Cannot create alerts');
    }

    // If project-specific alert, verify access
    if (args.projectId && user.role !== 'admin') {
      const project = await ctx.db.get(args.projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const hasAccess =
        (user.role === 'verifier' && project.assignedVerifierId === user._id) ||
        (user.role === 'project_creator' && project.creatorId === user._id);

      if (!hasAccess) {
        throw new Error('Access denied: Cannot create alerts for this project');
      }
    }

    // Create alert directly with proper urgency calculation
    const urgencyScore = calculateUrgencyScore(args.severity, args.alertType);

    function calculateUrgencyScore(
      severity: string,
      alertType: string
    ): number {
      const severityWeights = { critical: 90, high: 70, medium: 50, low: 30 };
      const typeWeights: Record<string, number> = {
        system_failure: 20,
        deadline_overdue: 15,
        verification_delay: 10,
        data_anomaly: 5,
      };
      return (
        (severityWeights[severity as keyof typeof severityWeights] || 50) +
        (typeWeights[alertType] || 0)
      );
    }

    const alertId = await ctx.db.insert('systemAlerts', {
      ...args,
      source: args.source || `manual_${user.role}`,
      isResolved: false,
      escalationLevel: 0,
      urgencyScore,
      autoEscalationEnabled: true,
      occurrenceCount: 1,
      firstOccurrence: Date.now(),
      lastOccurrence: Date.now(),
      lastUpdatedBy: user._id,
      lastUpdatedAt: Date.now(),
    });

    // Log the creation
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      action: 'alert_created',
      entityType: 'system_alert',
      entityId: alertId,
      metadata: {
        alertType: args.alertType,
        severity: args.severity,
        source: args.source || `manual_${user.role}`,
        timestamp: Date.now(),
      },
    });

    return alertId;
  },
});

/**
 * Get alerts with filtering, sorting, and pagination
 */
export const getAlerts = query({
  args: {
    filters: v.optional(
      v.object({
        severity: v.optional(
          v.array(
            v.union(
              v.literal('low'),
              v.literal('medium'),
              v.literal('high'),
              v.literal('critical')
            )
          )
        ),
        alertType: v.optional(v.array(v.string())),
        isResolved: v.optional(v.boolean()),
        projectId: v.optional(v.id('projects')),
        assignedTo: v.optional(v.id('users')),
        category: v.optional(v.string()),
        dateRange: v.optional(
          v.object({
            start: v.number(),
            end: v.number(),
          })
        ),
      })
    ),
    sorting: v.optional(
      v.object({
        field: v.union(
          v.literal('_creationTime'),
          v.literal('severity'),
          v.literal('urgencyScore'),
          v.literal('lastOccurrence')
        ),
        direction: v.union(v.literal('asc'), v.literal('desc')),
      })
    ),
    pagination: v.optional(
      v.object({
        limit: v.number(),
        offset: v.optional(v.number()),
      })
    ),
  },
  handler: async (
    ctx,
    {
      filters = {},
      sorting = { field: '_creationTime', direction: 'desc' },
      pagination = { limit: 50 },
    }
  ) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    // Build base query
    let query = ctx.db.query('systemAlerts');

    // Apply filters
    if (filters.isResolved !== undefined) {
      query = query.filter((q: any) =>
        q.eq(q.field('isResolved'), filters.isResolved)
      );
    }

    if (filters.projectId) {
      query = query.filter((q: any) =>
        q.eq(q.field('projectId'), filters.projectId)
      );
    }

    if (filters.assignedTo) {
      query = query.filter((q: any) =>
        q.eq(q.field('assignedTo'), filters.assignedTo)
      );
    }

    if (filters.category) {
      query = query.filter((q: any) =>
        q.eq(q.field('category'), filters.category)
      );
    }

    if (filters.dateRange) {
      query = query.filter((q: any) =>
        q.and(
          q.gte(q.field('_creationTime'), filters.dateRange!.start),
          q.lte(q.field('_creationTime'), filters.dateRange!.end)
        )
      );
    }

    // Get results with pagination - collect all first due to filtering complexity
    const alerts = await query.collect();

    // Apply client-side filters that couldn't be done in the query
    let filteredAlerts = alerts;

    if (filters.severity?.length) {
      filteredAlerts = filteredAlerts.filter((alert) =>
        filters.severity!.includes(alert.severity as any)
      );
    }

    if (filters.alertType?.length) {
      filteredAlerts = filteredAlerts.filter((alert) =>
        filters.alertType!.includes(alert.alertType)
      );
    }

    // Apply role-based access control
    if (user.role !== 'admin') {
      filteredAlerts = await filterAlertsByAccess(ctx, filteredAlerts, user);
    }

    // Apply client-side sorting
    filteredAlerts.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sorting.field) {
        case '_creationTime':
          aValue = a._creationTime;
          bValue = b._creationTime;
          break;
        case 'severity':
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aValue = severityOrder[a.severity as keyof typeof severityOrder] || 0;
          bValue = severityOrder[b.severity as keyof typeof severityOrder] || 0;
          break;
        case 'urgencyScore':
          aValue = a.urgencyScore || 0;
          bValue = b.urgencyScore || 0;
          break;
        case 'lastOccurrence':
          aValue = a.lastOccurrence || 0;
          bValue = b.lastOccurrence || 0;
          break;
        default:
          aValue = a._creationTime;
          bValue = b._creationTime;
      }

      if (sorting.direction === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });

    // Apply pagination offset
    if (pagination.offset) {
      filteredAlerts = filteredAlerts.slice(pagination.offset);
    }

    // Limit results
    filteredAlerts = filteredAlerts.slice(0, pagination.limit);

    // Enrich alerts with additional context
    const enrichedAlerts = await Promise.all(
      filteredAlerts.map((alert) => enrichAlertForDisplay(ctx, alert))
    );

    return {
      alerts: enrichedAlerts,
      total: filteredAlerts.length,
      hasMore: alerts.length > pagination.limit + (pagination.offset || 0),
    };
  },
});

/**
 * Get a specific alert by ID
 */
export const getAlert = query({
  args: {
    alertId: v.id('systemAlerts'),
  },
  handler: async (ctx, { alertId }) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    const alert = await ctx.db.get(alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    // Check access permissions
    const hasAccess = await checkAlertAccess(ctx, alert, user);
    if (!hasAccess) {
      throw new Error('Access denied: Cannot view this alert');
    }

    // Get enriched alert data
    const enrichedAlert = await enrichAlertForDisplay(ctx, alert);

    // Get alert history/timeline
    const auditLogs = await ctx.db
      .query('auditLogs')
      .filter((q: any) =>
        q.and(
          q.eq(q.field('entityType'), 'system_alert'),
          q.eq(q.field('entityId'), alertId)
        )
      )
      .order('desc')
      .take(20);

    return {
      ...enrichedAlert,
      timeline: auditLogs,
    };
  },
});

/**
 * Update an alert
 */
export const updateAlert = mutation({
  args: {
    alertId: v.id('systemAlerts'),
    updates: v.object({
      message: v.optional(v.string()),
      description: v.optional(v.string()),
      severity: v.optional(
        v.union(
          v.literal('low'),
          v.literal('medium'),
          v.literal('high'),
          v.literal('critical')
        )
      ),
      assignedTo: v.optional(v.id('users')),
      metadata: v.optional(v.any()),
      tags: v.optional(v.array(v.string())),
    }),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { alertId, updates, notes }) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    const alert = await ctx.db.get(alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    // Check permissions
    const canUpdate =
      user.role === 'admin' ||
      (alert.assignedTo && alert.assignedTo === user._id) ||
      (await checkAlertAccess(ctx, alert, user));

    if (!canUpdate) {
      throw new Error('Access denied: Cannot update this alert');
    }

    // Update the alert
    await ctx.db.patch(alertId, {
      ...updates,
      lastUpdatedBy: user._id,
      lastUpdatedAt: Date.now(),
    });

    // Log the update
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      action: 'alert_updated',
      entityType: 'system_alert',
      entityId: alertId,
      metadata: {
        updates,
        notes,
        timestamp: Date.now(),
      },
    });

    return { success: true };
  },
});

/**
 * Resolve an alert
 */
export const resolveAlert = mutation({
  args: {
    alertId: v.id('systemAlerts'),
    resolutionNotes: v.optional(v.string()),
    resolutionType: v.optional(
      v.union(
        v.literal('fixed'),
        v.literal('acknowledged'),
        v.literal('dismissed'),
        v.literal('duplicate')
      )
    ),
  },
  handler: async (
    ctx,
    { alertId, resolutionNotes, resolutionType = 'fixed' }
  ) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    const alert = await ctx.db.get(alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    if (alert.isResolved) {
      throw new Error('Alert is already resolved');
    }

    // Check permissions
    const canResolve = await checkAlertAccess(ctx, alert, user);
    if (!canResolve) {
      throw new Error('Access denied: Cannot resolve this alert');
    }

    // Resolve the alert
    await ctx.db.patch(alertId, {
      isResolved: true,
      resolvedAt: Date.now(),
      resolvedBy: user._id,
      resolutionNotes,
      resolutionType,
    });

    // Cancel any scheduled escalations
    // Note: In a real implementation, you'd cancel scheduled jobs here

    // Log the resolution
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      action: 'alert_resolved',
      entityType: 'system_alert',
      entityId: alertId,
      metadata: {
        resolutionType,
        resolutionNotes,
        timestamp: Date.now(),
        alertType: alert.alertType,
        severity: alert.severity,
      },
    });

    return { success: true };
  },
});

/**
 * Reopen a resolved alert
 */
export const reopenAlert = mutation({
  args: {
    alertId: v.id('systemAlerts'),
    reason: v.string(),
  },
  handler: async (ctx, { alertId, reason }) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    const alert = await ctx.db.get(alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    if (!alert.isResolved) {
      throw new Error('Alert is not resolved');
    }

    // Check permissions (only admins and verifiers can reopen)
    if (user.role !== 'admin' && user.role !== 'verifier') {
      throw new Error('Access denied: Cannot reopen alerts');
    }

    // Reopen the alert
    await ctx.db.patch(alertId, {
      isResolved: false,
      reopenedAt: Date.now(),
      reopenedBy: user._id,
      reopenReason: reason,
      escalationLevel: 0, // Reset escalation
      resolvedAt: undefined,
      resolvedBy: undefined,
      resolutionNotes: undefined,
      resolutionType: undefined,
    });

    // Log the reopening
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      action: 'alert_reopened',
      entityType: 'system_alert',
      entityId: alertId,
      metadata: {
        reason,
        timestamp: Date.now(),
        previousResolver: alert.resolvedBy,
      },
    });

    return { success: true };
  },
});

/**
 * Assign alert to user
 */
export const assignAlert = mutation({
  args: {
    alertId: v.id('systemAlerts'),
    assignedTo: v.id('users'),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { alertId, assignedTo, notes }) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    const alert = await ctx.db.get(alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    // Check permissions
    const canAssign = user.role === 'admin' || user.role === 'verifier';
    if (!canAssign) {
      throw new Error('Access denied: Cannot assign alerts');
    }

    // Verify the assigned user exists and has appropriate role
    const assignedUser = await ctx.db.get(assignedTo);
    if (!assignedUser) {
      throw new Error('Assigned user not found');
    }

    const validRoles = ['admin', 'verifier', 'project_creator'];
    if (!validRoles.includes(assignedUser.role)) {
      throw new Error('Cannot assign alert to user with this role');
    }

    // Update the alert
    await ctx.db.patch(alertId, {
      assignedTo,
      assignedBy: user._id,
      assignedAt: Date.now(),
    });

    // Log the assignment
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      action: 'alert_assigned',
      entityType: 'system_alert',
      entityId: alertId,
      metadata: {
        assignedTo,
        assignedToName: assignedUser.name,
        notes,
        timestamp: Date.now(),
      },
    });

    return { success: true };
  },
});

// ============= BULK OPERATIONS =============

/**
 * Bulk resolve multiple alerts
 */
export const bulkResolveAlerts = mutation({
  args: {
    alertIds: v.array(v.id('systemAlerts')),
    resolutionNotes: v.optional(v.string()),
    resolutionType: v.optional(
      v.union(
        v.literal('fixed'),
        v.literal('acknowledged'),
        v.literal('dismissed'),
        v.literal('duplicate')
      )
    ),
  },
  handler: async (
    ctx,
    { alertIds, resolutionNotes, resolutionType = 'fixed' }
  ) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    if (user.role !== 'admin' && user.role !== 'verifier') {
      throw new Error(
        'Access denied: Bulk operations require admin or verifier role'
      );
    }

    const results = [];

    for (const alertId of alertIds) {
      try {
        // Resolve alert directly to avoid internal API issues
        const alert = await ctx.db.get(alertId);
        if (!alert || alert.isResolved) {
          throw new Error('Alert not found or already resolved');
        }

        await ctx.db.patch(alertId, {
          isResolved: true,
          resolvedAt: Date.now(),
          resolvedBy: user._id,
          resolutionNotes,
          resolutionType,
        });

        // Log the resolution
        await ctx.db.insert('auditLogs', {
          userId: user._id,
          action: 'alert_resolved_bulk',
          entityType: 'system_alert',
          entityId: alertId,
          metadata: {
            resolutionType,
            resolutionNotes,
            timestamp: Date.now(),
          },
        });
        results.push({ alertId, success: true });
      } catch (error: any) {
        results.push({ alertId, success: false, error: error.message });
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
 * Bulk assign multiple alerts
 */
export const bulkAssignAlerts = mutation({
  args: {
    alertIds: v.array(v.id('systemAlerts')),
    assignedTo: v.id('users'),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { alertIds, assignedTo, notes }) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    if (user.role !== 'admin' && user.role !== 'verifier') {
      throw new Error(
        'Access denied: Bulk operations require admin or verifier role'
      );
    }

    const results = [];

    for (const alertId of alertIds) {
      try {
        // Assign alert directly to avoid internal API issues
        const alert = await ctx.db.get(alertId);
        if (!alert) {
          throw new Error('Alert not found');
        }

        await ctx.db.patch(alertId, {
          assignedTo,
          assignedBy: user._id,
          assignedAt: Date.now(),
        });

        // Log the assignment
        await ctx.db.insert('auditLogs', {
          userId: user._id,
          action: 'alert_assigned_bulk',
          entityType: 'system_alert',
          entityId: alertId,
          metadata: {
            assignedTo,
            notes,
            timestamp: Date.now(),
          },
        });
        results.push({ alertId, success: true });
      } catch (error: any) {
        results.push({ alertId, success: false, error: error.message });
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

// ============= HELPER FUNCTIONS =============

async function filterAlertsByAccess(ctx: any, alerts: any[], user: any) {
  const accessibleAlerts = [];

  for (const alert of alerts) {
    const hasAccess = await checkAlertAccess(ctx, alert, user);
    if (hasAccess) {
      accessibleAlerts.push(alert);
    }
  }

  return accessibleAlerts;
}

async function checkAlertAccess(
  ctx: any,
  alert: any,
  user: any
): Promise<boolean> {
  // Admins can access all alerts
  if (user.role === 'admin') {
    return true;
  }

  // Users can access alerts assigned to them
  if (alert.assignedTo === user._id) {
    return true;
  }

  // Project-specific access control
  if (alert.projectId) {
    const project = await ctx.db.get(alert.projectId);
    if (project) {
      // Verifiers can access alerts for their assigned projects
      if (user.role === 'verifier' && project.assignedVerifierId === user._id) {
        return true;
      }

      // Project creators can access alerts for their projects
      if (user.role === 'project_creator' && project.creatorId === user._id) {
        return true;
      }
    }
  }

  return false;
}

async function enrichAlertForDisplay(ctx: any, alert: any) {
  const enriched = { ...alert };

  // Add project information
  if (alert.projectId) {
    const project = await ctx.db.get(alert.projectId);
    if (project) {
      enriched.project = {
        _id: project._id,
        title: project.title,
        projectType: project.projectType,
        status: project.status,
      };
    }
  }

  // Add assigned user information
  if (alert.assignedTo) {
    const assignedUser = await ctx.db.get(alert.assignedTo);
    if (assignedUser) {
      enriched.assignedUser = {
        _id: assignedUser._id,
        name: assignedUser.name,
        email: assignedUser.email,
        role: assignedUser.role,
      };
    }
  }

  // Add resolved by user information
  if (alert.resolvedBy) {
    const resolvedByUser = await ctx.db.get(alert.resolvedBy);
    if (resolvedByUser) {
      enriched.resolvedByUser = {
        _id: resolvedByUser._id,
        name: resolvedByUser.name,
        email: resolvedByUser.email,
      };
    }
  }

  // Calculate time metrics
  const now = Date.now();
  enriched.ageHours = Math.floor(
    (now - alert._creationTime) / (1000 * 60 * 60)
  );

  if (alert.resolvedAt) {
    enriched.resolutionTimeHours = Math.floor(
      (alert.resolvedAt - alert._creationTime) / (1000 * 60 * 60)
    );
  }

  return enriched;
}

// ============= ANALYTICS FUNCTIONS =============

/**
 * Get alert summary statistics
 */
export const getAlertSummary = query({
  args: {
    timeframe: v.optional(
      v.union(v.literal('24h'), v.literal('7d'), v.literal('30d'))
    ),
  },
  handler: async (ctx, { timeframe = '7d' }) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
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

    let alerts = await ctx.db
      .query('systemAlerts')
      .filter((q: any) => q.gte(q.field('_creationTime'), startTime))
      .collect();

    // Apply access control
    if (user.role !== 'admin') {
      alerts = await filterAlertsByAccess(ctx, alerts, user);
    }

    const summary = {
      total: alerts.length,
      unresolved: alerts.filter((a) => !a.isResolved).length,
      resolved: alerts.filter((a) => a.isResolved).length,
      bySeverity: {
        critical: alerts.filter((a) => a.severity === 'critical').length,
        high: alerts.filter((a) => a.severity === 'high').length,
        medium: alerts.filter((a) => a.severity === 'medium').length,
        low: alerts.filter((a) => a.severity === 'low').length,
      },
      byType: {} as Record<string, number>,
      assigned: alerts.filter((a) => a.assignedTo).length,
      avgResolutionTimeHours: 0,
      escalated: alerts.filter((a) => a.escalationLevel > 0).length,
    };

    // Calculate by type
    alerts.forEach((alert) => {
      summary.byType[alert.alertType] =
        (summary.byType[alert.alertType] || 0) + 1;
    });

    // Calculate average resolution time
    const resolvedAlerts = alerts.filter((a) => a.isResolved && a.resolvedAt);
    if (resolvedAlerts.length > 0) {
      const totalResolutionTime = resolvedAlerts.reduce((sum, alert) => {
        return sum + (alert.resolvedAt! - alert._creationTime);
      }, 0);
      summary.avgResolutionTimeHours = Math.floor(
        totalResolutionTime / resolvedAlerts.length / (1000 * 60 * 60)
      );
    }

    return summary;
  },
});

// Alert management helper functions and exports completed
