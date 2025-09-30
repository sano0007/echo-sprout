import { action, mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { UserService } from '../services/user-service';

/**
 * ALERT ESCALATION SYSTEM
 *
 * This module provides intelligent alert escalation capabilities:
 * - Time-based escalation with severity consideration
 * - Priority management and dynamic adjustment
 * - Escalation chain management
 * - Notification scheduling and delivery
 * - Escalation analytics and monitoring
 */

// ============= ESCALATION PROCESSING =============

/**
 * Process escalation for a specific alert (called by scheduler)
 */
export const processEscalation = action({
  args: {
    alertId: v.id('systemAlerts'),
  },
  handler: async (ctx, { alertId }) => {
    const alert = await getAlertForEscalationData(ctx, alertId);

    if (!alert) {
      console.log(`Alert ${alertId} not found or already resolved`);
      return { escalated: false, reason: 'Alert not found or resolved' };
    }

    if (alert.isResolved) {
      console.log(`Alert ${alertId} is resolved, canceling escalation`);
      return { escalated: false, reason: 'Alert already resolved' };
    }

    if (!alert.autoEscalationEnabled) {
      console.log(`Auto-escalation disabled for alert ${alertId}`);
      return { escalated: false, reason: 'Auto-escalation disabled' };
    }

    // Check if escalation should proceed
    const shouldEscalate = await evaluateEscalationCriteria(ctx, alert);
    if (!shouldEscalate.escalate) {
      console.log(
        `Escalation criteria not met for alert ${alertId}: ${shouldEscalate.reason}`
      );
      return { escalated: false, reason: shouldEscalate.reason };
    }

    // Perform escalation
    const escalationResult = await performEscalation(ctx, alert);

    return escalationResult;
  },
});

/**
 * Manual escalation of an alert
 */
export const manualEscalation = mutation({
  args: {
    alertId: v.id('systemAlerts'),
    reason: v.string(),
    skipLevels: v.optional(v.number()),
  },
  handler: async (ctx, { alertId, reason, skipLevels = 0 }) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    const alert = await ctx.db.get(alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    if (alert.isResolved) {
      throw new Error('Cannot escalate resolved alert');
    }

    // Check permissions
    const canEscalate =
      user.role === 'admin' ||
      user.role === 'verifier' ||
      (alert.assignedTo && alert.assignedTo === user._id);

    if (!canEscalate) {
      throw new Error('Access denied: Cannot escalate this alert');
    }

    // Perform manual escalation
    const newLevel = Math.min(alert.escalationLevel + 1 + skipLevels, 3);
    const escalationChain = getEscalationChain(alert.severity, alert.alertType);

    await ctx.db.patch(alertId, {
      escalationLevel: newLevel,
      lastEscalationTime: Date.now(),
      escalatedBy: user._id,
      escalationReason: reason,
      nextEscalationTime:
        newLevel < 3
          ? calculateNextEscalationTime(alert.severity, newLevel)
          : undefined,
    });

    // Send notifications for manual escalation
    const recipients =
      escalationChain[newLevel] ||
      escalationChain[escalationChain.length - 1] ||
      [];
    // Note: Notification sending would be implemented here
    // await sendEscalationNotification({
    //   alertId,
    //   escalationLevel: newLevel,
    //   recipients,
    //   escalationType: 'manual',
    //   escalatedBy: user._id,
    //   reason,
    // });

    // Log the escalation
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      action: 'alert_escalated_manual',
      entityType: 'system_alert',
      entityId: alertId,
      metadata: {
        fromLevel: alert.escalationLevel,
        toLevel: newLevel,
        reason,
        skipLevels,
        timestamp: Date.now(),
      },
    });

    return {
      success: true,
      newEscalationLevel: newLevel,
      recipientsNotified: recipients.length,
    };
  },
});

/**
 * De-escalate an alert (reduce escalation level)
 */
export const deEscalateAlert = mutation({
  args: {
    alertId: v.id('systemAlerts'),
    reason: v.string(),
    newLevel: v.optional(v.number()),
  },
  handler: async (ctx, { alertId, reason, newLevel }) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    const alert = await ctx.db.get(alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    // Only admins and verifiers can de-escalate
    if (user.role !== 'admin' && user.role !== 'verifier') {
      throw new Error('Access denied: Cannot de-escalate alerts');
    }

    if (alert.escalationLevel === 0) {
      throw new Error('Alert is not escalated');
    }

    const targetLevel =
      newLevel !== undefined
        ? newLevel
        : Math.max(alert.escalationLevel - 1, 0);

    if (targetLevel >= alert.escalationLevel) {
      throw new Error('Cannot de-escalate to a higher or same level');
    }

    await ctx.db.patch(alertId, {
      escalationLevel: targetLevel,
      deEscalatedAt: Date.now(),
      deEscalatedBy: user._id,
      deEscalationReason: reason,
      nextEscalationTime:
        targetLevel < 3
          ? calculateNextEscalationTime(alert.severity, targetLevel)
          : undefined,
    });

    // Log the de-escalation
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      action: 'alert_de_escalated',
      entityType: 'system_alert',
      entityId: alertId,
      metadata: {
        fromLevel: alert.escalationLevel,
        toLevel: targetLevel,
        reason,
        timestamp: Date.now(),
      },
    });

    return { success: true, newEscalationLevel: targetLevel };
  },
});

// ============= ESCALATION MANAGEMENT =============

/**
 * Configure escalation rules for alert types
 */
export const configureEscalationRules = mutation({
  args: {
    alertType: v.string(),
    severity: v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('critical')
    ),
    rules: v.object({
      escalationChain: v.array(
        v.object({
          level: v.number(),
          roles: v.array(v.string()),
          delayMinutes: v.number(),
          specificUsers: v.optional(v.array(v.id('users'))),
        })
      ),
      maxEscalationLevel: v.number(),
      autoEscalationEnabled: v.boolean(),
      businessHoursOnly: v.optional(v.boolean()),
      cooldownPeriod: v.optional(v.number()), // minutes
    }),
  },
  handler: async (ctx, { alertType, severity, rules }) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user || user.role !== 'admin') {
      throw new Error('Access denied: Admin privileges required');
    }

    // Validate rules
    if (rules.maxEscalationLevel < 1 || rules.maxEscalationLevel > 3) {
      throw new Error('Max escalation level must be between 1 and 3');
    }

    if (rules.escalationChain.length === 0) {
      throw new Error('Escalation chain cannot be empty');
    }

    // Store escalation configuration
    const configId = await ctx.db.insert('escalationConfig', {
      alertType,
      severity,
      rules,
      createdBy: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log the configuration
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      action: 'escalation_rules_configured',
      entityType: 'escalation_config',
      entityId: configId,
      metadata: {
        alertType,
        severity,
        rules,
        timestamp: Date.now(),
      },
    });

    return { success: true, configId };
  },
});

/**
 * Get escalation configuration for alert type and severity
 */
export const getEscalationConfig = query({
  args: {
    alertType: v.string(),
    severity: v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('critical')
    ),
  },
  handler: async (ctx, { alertType, severity }) => {
    const config = await ctx.db
      .query('escalationConfig')
      .withIndex('by_type_severity', (q) =>
        q.eq('alertType', alertType).eq('severity', severity)
      )
      .first();

    if (!config) {
      // Return default configuration
      return getDefaultEscalationConfig(severity);
    }

    return config;
  },
});

/**
 * Batch process escalations (called by cron job)
 */
export const batchProcessEscalations = action({
  args: {},
  handler: async (ctx) => {
    console.log('🔄 Starting batch escalation processing');
    const startTime = Date.now();

    // Get alerts that need escalation
    const alertsToEscalate = await getAlertsForEscalationData(ctx);

    const results = {
      processed: 0,
      escalated: 0,
      errors: 0,
      skipped: 0,
    };

    for (const alert of alertsToEscalate) {
      try {
        results.processed++;

        const escalationResult = await processEscalationLogic(ctx, alert._id);

        if (escalationResult.escalated) {
          results.escalated++;
        } else {
          results.skipped++;
        }
      } catch (error) {
        console.error(`Failed to escalate alert ${alert._id}:`, error);
        results.errors++;
      }
    }

    const processingTime = Date.now() - startTime;

    // Log batch processing results
    // Log batch processing results
    console.log('Batch processing completed:', results);

    console.log(
      `✅ Batch escalation completed: ${results.escalated} escalated, ${results.skipped} skipped, ${results.errors} errors in ${processingTime}ms`
    );

    return results;
  },
});

// ============= HELPER FUNCTIONS =============

async function evaluateEscalationCriteria(ctx: any, alert: any) {
  const now = Date.now();

  // Check if enough time has passed since last escalation
  if (alert.nextEscalationTime && now < alert.nextEscalationTime) {
    return {
      escalate: false,
      reason: `Next escalation scheduled for ${new Date(alert.nextEscalationTime).toISOString()}`,
    };
  }

  // Check maximum escalation level
  if (alert.escalationLevel >= 3) {
    return { escalate: false, reason: 'Maximum escalation level reached' };
  }

  // Check business hours if required
  const config = await getEscalationConfigData(ctx, {
    alertType: alert.alertType,
    severity: alert.severity,
  });

  if (config.rules.businessHoursOnly) {
    const businessHours = isBusinessHours(now);
    if (!businessHours.inBusinessHours) {
      // Schedule for next business hour
      await ctx.db.patch(alert._id, {
        nextEscalationTime: businessHours.nextBusinessHour,
      });
      return { escalate: false, reason: 'Waiting for business hours' };
    }
  }

  // Check cooldown period
  if (config.rules.cooldownPeriod && alert.lastEscalationTime) {
    const cooldownEnd =
      alert.lastEscalationTime + config.rules.cooldownPeriod * 60 * 1000;
    if (now < cooldownEnd) {
      return { escalate: false, reason: 'Still in cooldown period' };
    }
  }

  return { escalate: true, reason: 'Escalation criteria met' };
}

async function performEscalation(ctx: any, alert: any) {
  const newLevel = alert.escalationLevel + 1;
  const escalationChain = getEscalationChain(alert.severity, alert.alertType);

  // Update alert escalation
  const nextEscalationTime =
    newLevel < 3
      ? calculateNextEscalationTime(alert.severity, newLevel)
      : undefined;

  await ctx.db.patch(alert._id, {
    escalationLevel: newLevel,
    lastEscalationTime: Date.now(),
    nextEscalationTime,
  });

  // Send notifications
  const recipients =
    escalationChain[newLevel] ||
    escalationChain[escalationChain.length - 1] ||
    [];
  // Note: Notification sending would be implemented here
  console.log(
    `Sending escalation notification to ${recipients.length} recipients`
  );

  // Log escalation
  await ctx.db.insert('auditLogs', {
    userId: undefined,
    action: 'alert_escalated_automatic',
    entityType: 'system_alert',
    entityId: alert._id,
    metadata: {
      fromLevel: alert.escalationLevel,
      toLevel: newLevel,
      recipientsNotified: recipients.length,
      timestamp: Date.now(),
    },
  });

  // Schedule next escalation if not at max level
  if (newLevel < 3) {
    const nextEscalationTime = calculateNextEscalationTime(
      alert.severity,
      newLevel
    );
    // Schedule next escalation
    console.log(
      `Next escalation scheduled for ${new Date(nextEscalationTime).toISOString()}`
    );
  }

  return {
    escalated: true,
    newLevel,
    recipientsNotified: recipients.length,
    nextEscalationScheduled: newLevel < 3,
  };
}

function getEscalationChain(severity: string, _alertType: string): string[][] {
  // Default escalation chains by severity
  const defaultChains = {
    critical: [
      ['verifier'], // Level 0: Assigned verifier
      ['admin'], // Level 1: Admin
      ['admin'], // Level 2: Admin (repeat for emphasis)
      ['admin'], // Level 3: Admin (final level)
    ],
    high: [['verifier'], ['admin'], ['admin'], ['admin']],
    medium: [['verifier'], ['verifier', 'admin'], ['admin'], ['admin']],
    low: [['verifier'], ['verifier'], ['admin'], ['admin']],
  };

  return (
    defaultChains[severity as keyof typeof defaultChains] ||
    defaultChains.medium
  );
}

function calculateNextEscalationTime(
  severity: string,
  currentLevel: number
): number {
  // Escalation delays by severity and level (in minutes)
  const delays = {
    critical: [30, 60, 120], // 30m, 1h, 2h
    high: [60, 240, 480], // 1h, 4h, 8h
    medium: [240, 720, 1440], // 4h, 12h, 24h
    low: [1440, 2880, 4320], // 24h, 48h, 72h
  };

  const severityDelays =
    delays[severity as keyof typeof delays] || delays.medium;
  const delayIndex = Math.min(currentLevel, severityDelays.length - 1);
  const delayMinutes = severityDelays[delayIndex] || 240; // Default to 4 hours if undefined

  return Date.now() + delayMinutes * 60 * 1000;
}

function isBusinessHours(timestamp: number) {
  const date = new Date(timestamp);
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = date.getHours();

  // Business hours: Monday-Friday, 9 AM - 5 PM
  const inBusinessHours = day >= 1 && day <= 5 && hour >= 9 && hour < 17;

  let nextBusinessHour = timestamp;
  if (!inBusinessHours) {
    const nextDate = new Date(timestamp);

    if (day === 0 || day === 6) {
      // Weekend: move to next Monday 9 AM
      const daysUntilMonday = day === 0 ? 1 : 2;
      nextDate.setDate(nextDate.getDate() + daysUntilMonday);
      nextDate.setHours(9, 0, 0, 0);
    } else if (hour < 9) {
      // Before business hours: move to 9 AM today
      nextDate.setHours(9, 0, 0, 0);
    } else {
      // After business hours: move to 9 AM next day
      nextDate.setDate(nextDate.getDate() + 1);
      if (nextDate.getDay() === 0) {
        // If next day is Sunday, move to Monday
        nextDate.setDate(nextDate.getDate() + 1);
      }
      nextDate.setHours(9, 0, 0, 0);
    }

    nextBusinessHour = nextDate.getTime();
  }

  return { inBusinessHours, nextBusinessHour };
}

function getDefaultEscalationConfig(severity: string) {
  const baseConfig = {
    escalationChain: [
      { level: 0, roles: ['verifier'], delayMinutes: 0 },
      { level: 1, roles: ['admin'], delayMinutes: 240 },
      { level: 2, roles: ['admin'], delayMinutes: 720 },
      { level: 3, roles: ['admin'], delayMinutes: 1440 },
    ],
    maxEscalationLevel: 3,
    autoEscalationEnabled: true,
    businessHoursOnly: false,
    cooldownPeriod: 60,
  };

  // Adjust delays based on severity
  if (severity === 'critical') {
    if (baseConfig.escalationChain[1])
      baseConfig.escalationChain[1].delayMinutes = 30;
    if (baseConfig.escalationChain[2])
      baseConfig.escalationChain[2].delayMinutes = 120;
    if (baseConfig.escalationChain[3])
      baseConfig.escalationChain[3].delayMinutes = 240;
  } else if (severity === 'high') {
    if (baseConfig.escalationChain[1])
      baseConfig.escalationChain[1].delayMinutes = 60;
    if (baseConfig.escalationChain[2])
      baseConfig.escalationChain[2].delayMinutes = 240;
    if (baseConfig.escalationChain[3])
      baseConfig.escalationChain[3].delayMinutes = 480;
  }

  return { rules: baseConfig };
}

// ============= QUERY FUNCTIONS =============

/**
 * Get alert for escalation processing (internal use)
 */
export const getAlertForEscalation = query({
  args: {
    alertId: v.id('systemAlerts'),
  },
  handler: async (ctx, { alertId }) => {
    return await ctx.db.get(alertId);
  },
});

/**
 * Get alerts that need escalation (internal use)
 */
export const getAlertsForEscalation = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    return await ctx.db
      .query('systemAlerts')
      .filter(
        (q) =>
          q.eq(q.field('isResolved'), false) &&
          q.eq(q.field('autoEscalationEnabled'), true) &&
          q.lt(q.field('escalationLevel'), 3) &&
          q.lte(q.field('nextEscalationTime'), now)
      )
      .take(100); // Process in batches
  },
});

/**
 * Update alert escalation (internal use)
 */
export const updateAlertEscalation = mutation({
  args: {
    alertId: v.id('systemAlerts'),
    newLevel: v.number(),
  },
  handler: async (ctx, { alertId, newLevel }) => {
    const nextEscalationTime =
      newLevel < 3
        ? calculateNextEscalationTime('medium', newLevel)
        : undefined;

    await ctx.db.patch(alertId, {
      escalationLevel: newLevel,
      lastEscalationTime: Date.now(),
      nextEscalationTime,
    });
  },
});

/**
 * Schedule next escalation (internal use)
 */
export const scheduleNextEscalation = mutation({
  args: {
    alertId: v.id('systemAlerts'),
    nextTime: v.number(),
  },
  handler: async (ctx, { alertId, nextTime }) => {
    await ctx.db.patch(alertId, {
      nextEscalationTime: nextTime,
    });
  },
});

/**
 * Get escalation metrics
 */
export const getEscalationMetrics = query({
  args: {
    timeframe: v.optional(
      v.union(v.literal('24h'), v.literal('7d'), v.literal('30d'))
    ),
  },
  handler: async (ctx, { timeframe = '7d' }) => {
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

    const alerts = await ctx.db
      .query('systemAlerts')
      .filter((q) => q.gte(q.field('_creationTime'), startTime))
      .collect();

    const escalated = alerts.filter((a) => a.escalationLevel > 0);

    const metrics = {
      totalAlerts: alerts.length,
      escalatedAlerts: escalated.length,
      escalationRate: alerts.length > 0 ? escalated.length / alerts.length : 0,
      byLevel: {
        level1: escalated.filter((a) => a.escalationLevel === 1).length,
        level2: escalated.filter((a) => a.escalationLevel === 2).length,
        level3: escalated.filter((a) => a.escalationLevel === 3).length,
      },
      avgEscalationTime: 0,
      manualEscalations: escalated.filter((a) => a.escalatedBy).length,
      autoEscalations: escalated.filter((a) => !a.escalatedBy).length,
    };

    // Calculate average time to escalation
    if (escalated.length > 0) {
      const totalEscalationTime = escalated.reduce((sum, alert) => {
        return sum + ((alert.lastEscalationTime || 0) - alert._creationTime);
      }, 0);
      metrics.avgEscalationTime = Math.floor(
        totalEscalationTime / escalated.length / (1000 * 60 * 60)
      ); // in hours
    }

    return metrics;
  },
});

// ============= HELPER FUNCTIONS =============

async function getAlertForEscalationData(ctx: any, alertId: string) {
  return await ctx.db.get(alertId);
}

async function getAlertsForEscalationData(ctx: any) {
  const now = Date.now();
  return await ctx.db
    .query('systemAlerts')
    .filter(
      (q: any) =>
        q.eq(q.field('isResolved'), false) &&
        q.eq(q.field('autoEscalationEnabled'), true) &&
        q.lt(q.field('escalationLevel'), 3) &&
        q.lte(q.field('nextEscalationTime'), now)
    )
    .take(100);
}

async function getEscalationConfigData(
  ctx: any,
  { alertType, severity }: { alertType: string; severity: string }
) {
  const config = await ctx.db
    .query('escalationConfig')
    .withIndex('by_type_severity', (q: any) =>
      q.eq('alertType', alertType).eq('severity', severity)
    )
    .first();

  if (!config) {
    return getDefaultEscalationConfig(severity);
  }
  return config;
}

async function processEscalationLogic(ctx: any, alert: any) {
  // Check if escalation should proceed
  const shouldEscalate = await evaluateEscalationCriteria(ctx, alert);
  if (!shouldEscalate.escalate) {
    return { escalated: false, reason: shouldEscalate.reason };
  }

  // Perform escalation
  const escalationResult = await performEscalation(ctx, alert);
  return escalationResult;
}
