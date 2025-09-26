/**
 * MONITORING & TRACKING SYSTEM - MODULE INDEX
 *
 * This file provides a centralized export point for all monitoring system modules
 * and serves as the main entry point for the monitoring functionality.
 */

// Re-export all monitoring functions
export * from './monitoring';
export * from './monitoring-config';
export * from './monitoring-auth';
export * from './monitoring-utils';

// Re-export types
export * from '../types/monitoring-types';

/**
 * MONITORING SYSTEM OVERVIEW
 *
 * The Echo Sprout Monitoring & Tracking System consists of the following modules:
 *
 * 1. CORE MONITORING (monitoring.ts)
 *    - Scheduled monitoring jobs (daily, hourly, weekly)
 *    - Project progress monitoring
 *    - Alert generation and escalation
 *    - Notification processing
 *    - Analytics generation
 *
 * 2. CONFIGURATION MANAGEMENT (monitoring-config.ts)
 *    - Project-type specific configurations
 *    - Monitoring thresholds and rules
 *    - Default configuration initialization
 *    - Dynamic configuration updates
 *
 * 3. AUTHENTICATION & AUTHORIZATION (monitoring-auth.ts)
 *    - Role-based permission system
 *    - Project access control
 *    - Alert management permissions
 *    - Audit logging
 *
 * 4. UTILITIES & HELPERS (monitoring-utils.ts)
 *    - Data validation functions
 *    - Metric calculations and analysis
 *    - Progress trend analysis
 *    - Performance comparison tools
 *
 * 5. SCHEDULED JOBS (crons.ts)
 *    - Daily project monitoring (6:00 AM UTC)
 *    - Hourly urgent monitoring
 *    - Weekly report generation
 *
 * SYSTEM ARCHITECTURE:
 *
 * ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
 * │   Cron Jobs     │    │  Authentication │    │  Configuration  │
 * │                 │    │                 │    │                 │
 * │ • Daily Monitor │────│ • Role Checks   │────│ • Thresholds    │
 * │ • Hourly Urgent │    │ • Permissions   │    │ • Rules         │
 * │ • Weekly Report │    │ • Access Control│    │ • Defaults      │
 * └─────────────────┘    └─────────────────┘    └─────────────────┘
 *          │                        │                        │
 *          └────────────────────────┼────────────────────────┘
 *                                   │
 *                          ┌─────────────────┐
 *                          │ Core Monitoring │
 *                          │                 │
 *                          │ • Progress Check│
 *                          │ • Alert Gen     │
 *                          │ • Notifications │
 *                          │ • Analytics     │
 *                          └─────────────────┘
 *                                   │
 *                          ┌─────────────────┐
 *                          │ Utilities       │
 *                          │                 │
 *                          │ • Validation    │
 *                          │ • Calculations  │
 *                          │ • Analysis      │
 *                          │ • Comparisons   │
 *                          └─────────────────┘
 *
 * USAGE EXAMPLES:
 *
 * 1. Initialize monitoring for a new project:
 *    ```typescript
 *    // Set up project milestones
 *    await createProjectMilestones(projectId, milestones);
 *
 *    // Initialize monitoring configuration
 *    await initializeProjectMonitoring(projectId, projectType);
 *    ```
 *
 * 2. Submit a progress update:
 *    ```typescript
 *    // Validate update data
 *    const validation = await validateProgressUpdate(updateData);
 *
 *    // Submit if valid
 *    if (validation.isValid) {
 *      await submitProgressUpdate(projectId, updateData);
 *    }
 *    ```
 *
 * 3. Check monitoring permissions:
 *    ```typescript
 *    const canMonitor = await canAccessProjectForMonitoring(projectId);
 *    const hasPermission = await hasMonitoringPermission('manage_alerts');
 *    ```
 *
 * 4. Generate project analytics:
 *    ```typescript
 *    const score = await calculateProjectProgressScore(projectId);
 *    const trends = await analyzeProgressTrends(projectId);
 *    const comparison = await compareProjectPerformance(projectId);
 *    ```
 *
 * DATABASE TABLES USED:
 * - projectMilestones: Milestone tracking and status
 * - systemAlerts: Alert management and escalation
 * - monitoringConfig: Configuration settings
 * - progressUpdates: Project progress reports
 * - projects: Core project data
 * - users: User roles and permissions
 * - auditLogs: Activity tracking
 * - analytics: System metrics and reports
 *
 * SCHEDULED JOB TIMING:
 * - Daily Monitoring: 6:00 AM UTC every day
 * - Hourly Urgent: :15 minutes past every hour
 * - Weekly Reports: Monday 8:00 AM UTC
 *
 * ALERT ESCALATION LEVELS:
 * - Level 0: Initial alert
 * - Level 1: First escalation (24-168 hours depending on severity)
 * - Level 2: Second escalation (admin notification)
 * - Level 3: Final escalation (critical priority)
 *
 * PERMISSION LEVELS:
 * - Admin: Full system access, all projects, configuration management
 * - Verifier: Assigned projects, verification alerts, reports
 * - Project Creator: Own projects, progress updates, project alerts
 * - Credit Buyer: Purchased projects, impact reports, analytics
 */

// System configuration constants
export const MONITORING_CONSTANTS = {
  DEFAULT_REPORT_FREQUENCY_DAYS: 30,
  MAX_ESCALATION_LEVEL: 3,
  CRITICAL_ALERT_THRESHOLD_HOURS: 4,
  DEFAULT_REMINDER_DAYS: [7, 3, 1],
  MAX_PHOTOS_PER_UPDATE: 20,
  MIN_PROGRESS_SCORE: 0,
  MAX_PROGRESS_SCORE: 100,
  TREND_ANALYSIS_MIN_POINTS: 2,
  COMPARISON_PROJECT_LIMIT: 10,
} as const;

// Alert severity hierarchy (for escalation logic)
export const ALERT_SEVERITY_PRIORITY = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
} as const;

// Project type specific defaults
export const PROJECT_TYPE_DEFAULTS = {
  reforestation: {
    primaryMetrics: ['treesPlanted', 'survivalRate', 'carbonImpactToDate'],
    requiredPhotos: ['before', 'during', 'after', 'close-up', 'overview'],
    reportFrequencyDays: 30,
  },
  solar: {
    primaryMetrics: ['energyGenerated', 'systemUptime', 'carbonImpactToDate'],
    requiredPhotos: ['installation', 'panels', 'inverter', 'monitoring'],
    reportFrequencyDays: 30,
  },
  wind: {
    primaryMetrics: ['energyGenerated', 'systemUptime', 'carbonImpactToDate'],
    requiredPhotos: [
      'turbines',
      'foundation',
      'grid_connection',
      'control_room',
    ],
    reportFrequencyDays: 30,
  },
  biogas: {
    primaryMetrics: ['gasProduced', 'wasteProcessed', 'carbonImpactToDate'],
    requiredPhotos: [
      'digester',
      'gas_collection',
      'waste_input',
      'output_system',
    ],
    reportFrequencyDays: 30,
  },
  waste_management: {
    primaryMetrics: ['wasteProcessed', 'recyclingRate', 'carbonImpactToDate'],
    requiredPhotos: [
      'facility',
      'sorting',
      'processing',
      'recycled_output',
      'equipment',
    ],
    reportFrequencyDays: 30,
  },
  mangrove_restoration: {
    primaryMetrics: [
      'areaRestored',
      'mangrovesPlanted',
      'survivalRate',
      'carbonImpactToDate',
    ],
    requiredPhotos: [
      'site_before',
      'planting',
      'seedlings',
      'established_growth',
      'ecosystem',
      'aerial_view',
    ],
    reportFrequencyDays: 30,
  },
} as const;
