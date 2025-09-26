import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * MONITORING & TRACKING SYSTEM - CONFIGURATION MANAGEMENT
 *
 * This module manages configuration settings for the monitoring system:
 * - Project-type specific thresholds
 * - Alert escalation rules
 * - Notification preferences
 * - Monitoring intervals
 */

// ============= CONFIGURATION QUERIES =============

/**
 * Get monitoring configuration for a specific project type
 */
export const getMonitoringConfig = query({
  args: {
    projectType: v.string(),
    configKey: v.optional(v.string()),
  },
  handler: async (ctx, { projectType, configKey }) => {
    let configQuery = ctx.db
      .query('monitoringConfig')
      .withIndex('by_project_type', (q) => q.eq('projectType', projectType))
      .filter((q) => q.eq(q.field('isActive'), true));

    if (configKey) {
      configQuery = configQuery.filter((q) =>
        q.eq(q.field('configKey'), configKey)
      );
      return await configQuery.unique();
    }

    return await configQuery.collect();
  },
});

/**
 * Get all active monitoring configurations
 */
export const getAllMonitoringConfigs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('monitoringConfig')
      .withIndex('by_active', (q) => q.eq('isActive', true))
      .collect();
  },
});

// ============= CONFIGURATION MUTATIONS =============

/**
 * Create or update monitoring configuration
 */
export const setMonitoringConfig = mutation({
  args: {
    projectType: v.string(),
    configKey: v.string(),
    configValue: v.any(),
    description: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { projectType, configKey, configValue, description }
  ) => {
    // Check if configuration already exists
    const existing = await ctx.db
      .query('monitoringConfig')
      .withIndex('by_project_type_key', (q) =>
        q.eq('projectType', projectType).eq('configKey', configKey)
      )
      .unique();

    if (existing) {
      // Update existing configuration
      await ctx.db.patch(existing._id, {
        configValue,
        description,
        isActive: true,
      });
      return existing._id;
    } else {
      // Create new configuration
      return await ctx.db.insert('monitoringConfig', {
        projectType,
        configKey,
        configValue,
        description,
        isActive: true,
      });
    }
  },
});

/**
 * Initialize default monitoring configurations
 */
export const initializeDefaultConfigs = mutation({
  args: {},
  handler: async (ctx) => {
    const defaultConfigs = getDefaultMonitoringConfigs();

    for (const config of defaultConfigs) {
      await ctx.db.insert('monitoringConfig', config);
    }

    return defaultConfigs.length;
  },
});

/**
 * Deactivate a monitoring configuration
 */
export const deactivateConfig = mutation({
  args: {
    configId: v.id('monitoringConfig'),
  },
  handler: async (ctx, { configId }) => {
    await ctx.db.patch(configId, {
      isActive: false,
    });
  },
});

// ============= DEFAULT CONFIGURATIONS =============

/**
 * Get default monitoring configurations for all project types
 */
function getDefaultMonitoringConfigs() {
  return [
    // ===== REFORESTATION PROJECT CONFIGS =====
    {
      projectType: 'reforestation',
      configKey: 'progress_report_frequency',
      configValue: { days: 30, required: true },
      description: 'How often progress reports are required',
      isActive: true,
    },
    {
      projectType: 'reforestation',
      configKey: 'reminder_schedule',
      configValue: { days: [7, 3, 1] },
      description: 'Days before deadline to send reminders',
      isActive: true,
    },
    {
      projectType: 'reforestation',
      configKey: 'impact_thresholds',
      configValue: {
        treesPlanted: { min: 1, max: 10000 },
        carbonImpact: { min: 0.01, max: 1000 },
        survivalRate: { min: 0.7, max: 1.0 },
      },
      description: 'Expected ranges for impact metrics',
      isActive: true,
    },
    {
      projectType: 'reforestation',
      configKey: 'photo_requirements',
      configValue: {
        minimumCount: 5,
        requiredTypes: ['before', 'during', 'after', 'close-up', 'overview'],
        maxFileSizeMB: 10,
      },
      description: 'Photo evidence requirements',
      isActive: true,
    },

    // ===== SOLAR PROJECT CONFIGS =====
    {
      projectType: 'solar',
      configKey: 'progress_report_frequency',
      configValue: { days: 30, required: true },
      description: 'How often progress reports are required',
      isActive: true,
    },
    {
      projectType: 'solar',
      configKey: 'reminder_schedule',
      configValue: { days: [7, 3, 1] },
      description: 'Days before deadline to send reminders',
      isActive: true,
    },
    {
      projectType: 'solar',
      configKey: 'impact_thresholds',
      configValue: {
        energyGenerated: { min: 100, max: 1000000 }, // kWh
        carbonImpact: { min: 0.05, max: 5000 }, // tons CO2
        systemUptime: { min: 0.85, max: 1.0 }, // percentage
      },
      description: 'Expected ranges for impact metrics',
      isActive: true,
    },
    {
      projectType: 'solar',
      configKey: 'photo_requirements',
      configValue: {
        minimumCount: 4,
        requiredTypes: ['installation', 'panels', 'inverter', 'monitoring'],
        maxFileSizeMB: 10,
      },
      description: 'Photo evidence requirements',
      isActive: true,
    },

    // ===== WIND PROJECT CONFIGS =====
    {
      projectType: 'wind',
      configKey: 'progress_report_frequency',
      configValue: { days: 30, required: true },
      description: 'How often progress reports are required',
      isActive: true,
    },
    {
      projectType: 'wind',
      configKey: 'reminder_schedule',
      configValue: { days: [7, 3, 1] },
      description: 'Days before deadline to send reminders',
      isActive: true,
    },
    {
      projectType: 'wind',
      configKey: 'impact_thresholds',
      configValue: {
        energyGenerated: { min: 500, max: 5000000 }, // kWh
        carbonImpact: { min: 0.25, max: 25000 }, // tons CO2
        systemUptime: { min: 0.8, max: 1.0 }, // percentage
      },
      description: 'Expected ranges for impact metrics',
      isActive: true,
    },
    {
      projectType: 'wind',
      configKey: 'photo_requirements',
      configValue: {
        minimumCount: 4,
        requiredTypes: [
          'turbines',
          'foundation',
          'grid_connection',
          'control_room',
        ],
        maxFileSizeMB: 10,
      },
      description: 'Photo evidence requirements',
      isActive: true,
    },

    // ===== BIOGAS PROJECT CONFIGS =====
    {
      projectType: 'biogas',
      configKey: 'progress_report_frequency',
      configValue: { days: 30, required: true },
      description: 'How often progress reports are required',
      isActive: true,
    },
    {
      projectType: 'biogas',
      configKey: 'reminder_schedule',
      configValue: { days: [7, 3, 1] },
      description: 'Days before deadline to send reminders',
      isActive: true,
    },
    {
      projectType: 'biogas',
      configKey: 'impact_thresholds',
      configValue: {
        gasProduced: { min: 10, max: 100000 }, // cubic meters
        carbonImpact: { min: 0.02, max: 2000 }, // tons CO2
        wasteProcessed: { min: 100, max: 1000000 }, // kg
      },
      description: 'Expected ranges for impact metrics',
      isActive: true,
    },
    {
      projectType: 'biogas',
      configKey: 'photo_requirements',
      configValue: {
        minimumCount: 4,
        requiredTypes: [
          'digester',
          'gas_collection',
          'waste_input',
          'output_system',
        ],
        maxFileSizeMB: 10,
      },
      description: 'Photo evidence requirements',
      isActive: true,
    },

    // ===== WASTE MANAGEMENT PROJECT CONFIGS =====
    {
      projectType: 'waste_management',
      configKey: 'progress_report_frequency',
      configValue: { days: 30, required: true },
      description: 'How often progress reports are required',
      isActive: true,
    },
    {
      projectType: 'waste_management',
      configKey: 'reminder_schedule',
      configValue: { days: [7, 3, 1] },
      description: 'Days before deadline to send reminders',
      isActive: true,
    },
    {
      projectType: 'waste_management',
      configKey: 'impact_thresholds',
      configValue: {
        wasteProcessed: { min: 1000, max: 10000000 }, // kg
        carbonImpact: { min: 0.1, max: 10000 }, // tons CO2
        recyclingRate: { min: 0.3, max: 0.95 }, // percentage
      },
      description: 'Expected ranges for impact metrics',
      isActive: true,
    },
    {
      projectType: 'waste_management',
      configKey: 'photo_requirements',
      configValue: {
        minimumCount: 5,
        requiredTypes: [
          'facility',
          'sorting',
          'processing',
          'recycled_output',
          'equipment',
        ],
        maxFileSizeMB: 10,
      },
      description: 'Photo evidence requirements',
      isActive: true,
    },

    // ===== MANGROVE RESTORATION PROJECT CONFIGS =====
    {
      projectType: 'mangrove_restoration',
      configKey: 'progress_report_frequency',
      configValue: { days: 30, required: true },
      description: 'How often progress reports are required',
      isActive: true,
    },
    {
      projectType: 'mangrove_restoration',
      configKey: 'reminder_schedule',
      configValue: { days: [7, 3, 1] },
      description: 'Days before deadline to send reminders',
      isActive: true,
    },
    {
      projectType: 'mangrove_restoration',
      configKey: 'impact_thresholds',
      configValue: {
        areaRestored: { min: 0.1, max: 1000 }, // hectares
        mangrovesPlanted: { min: 100, max: 100000 }, // trees
        carbonImpact: { min: 0.05, max: 5000 }, // tons CO2
        survivalRate: { min: 0.6, max: 1.0 }, // percentage
      },
      description: 'Expected ranges for impact metrics',
      isActive: true,
    },
    {
      projectType: 'mangrove_restoration',
      configKey: 'photo_requirements',
      configValue: {
        minimumCount: 6,
        requiredTypes: [
          'site_before',
          'planting',
          'seedlings',
          'established_growth',
          'ecosystem',
          'aerial_view',
        ],
        maxFileSizeMB: 10,
      },
      description: 'Photo evidence requirements',
      isActive: true,
    },

    // ===== GLOBAL ALERT CONFIGURATIONS =====
    {
      projectType: 'all',
      configKey: 'alert_escalation_rules',
      configValue: {
        low: { escalateAfterHours: 168 }, // 7 days
        medium: { escalateAfterHours: 72 }, // 3 days
        high: { escalateAfterHours: 24 }, // 1 day
        critical: { escalateAfterHours: 4 }, // 4 hours
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
  ];
}

// ============= HELPER FUNCTIONS =============

/**
 * Get configuration value with fallback
 */
export const getConfigValue = query({
  args: {
    projectType: v.string(),
    configKey: v.string(),
    fallbackValue: v.optional(v.any()),
  },
  handler: async (ctx, { projectType, configKey, fallbackValue }) => {
    const config = await ctx.db
      .query('monitoringConfig')
      .withIndex('by_project_type_key', (q) =>
        q.eq('projectType', projectType).eq('configKey', configKey)
      )
      .filter((q) => q.eq(q.field('isActive'), true))
      .unique();

    if (config) {
      return config.configValue;
    }

    // Try to get global config
    const globalConfig = await ctx.db
      .query('monitoringConfig')
      .withIndex('by_project_type_key', (q) =>
        q.eq('projectType', 'all').eq('configKey', configKey)
      )
      .filter((q) => q.eq(q.field('isActive'), true))
      .unique();

    return globalConfig ? globalConfig.configValue : fallbackValue;
  },
});

/**
 * Validate if a metric value is within expected thresholds
 */
export const validateMetricValue = query({
  args: {
    projectType: v.string(),
    metricName: v.string(),
    value: v.number(),
  },
  handler: async (ctx, { projectType, metricName, value }) => {
    const thresholds = await ctx.runQuery(
      internal.monitoringConfig.getConfigValue,
      {
        projectType,
        configKey: 'impact_thresholds',
        fallbackValue: {},
      }
    );

    const metricThreshold = thresholds[metricName];
    if (!metricThreshold) {
      return { valid: true, message: 'No threshold defined' };
    }

    const { min, max } = metricThreshold;

    if (value < min) {
      return {
        valid: false,
        message: `Value ${value} is below minimum threshold of ${min}`,
        severity: 'medium',
      };
    }

    if (value > max) {
      return {
        valid: false,
        message: `Value ${value} exceeds maximum threshold of ${max}`,
        severity: 'high',
      };
    }

    return { valid: true, message: 'Value within acceptable range' };
  },
});

// Export internal functions
export const internal = {
  monitoringConfig: {
    getConfigValue,
    validateMetricValue,
  },
};
