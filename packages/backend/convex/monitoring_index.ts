/**
 * MONITORING & TRACKING SYSTEM - MODULE INDEX
 *
 * This file provides a centralized export point for all monitoring system modules
 * and serves as the main entry point for the monitoring functionality.
 */

// Re-export monitoring functions with explicit naming to avoid conflicts
export {
  monitorProjectProgress as coreMonitorProjectProgress,
  sendAlertNotification as coreSendAlertNotification,
  dailyProjectMonitoring,
  hourlyUrgentMonitoring,
  weeklyReportGeneration,
  getActiveProjects,
  getCriticalAlerts,
  getProjectProgressUpdates,
  checkOverdueMilestones,
  processAlertNotifications,
  generateWeeklyAnalytics,
  sendWeeklyReports,
} from './monitoring';

export {
  getMonitoringConfig,
  setMonitoringConfig,
  initializeDefaultConfigs,
  getConfigValue,
  validateMetricValue,
} from './monitoring_config';

export {
  getCurrentUserWithRole,
  hasMonitoringPermission,
  requireMonitoringPermission,
  canAccessProjectForMonitoring,
  canManageAlert,
  getMonitoringAccessLevel,
  getAccessibleProjectsForMonitoring,
  getAccessibleAlerts,
  logMonitoringAction,
  validateMonitoringSession,
  grantMonitoringAccess,
  revokeMonitoringAccess,
} from './monitoring_auth';

export {
  validateProgressUpdate,
  validateImpactMetrics,
  calculateProjectProgressScore,
  calculateCreditPotential,
  calculateDaysUntilDeadline,
  getNextMilestoneDeadline,
  analyzeProgressTrends,
  compareProjectPerformance as utilsCompareProjectPerformance,
} from './monitoring_utils';

export { submitProgressUpdate } from './progress_updates';

export { internal as progressValidationInternal } from './progress_validation';

export { generateAlert } from './alert_generation';

export { getAlerts, updateAlert } from './alert_management';

export { processEscalation } from './alert_escalation';

export {
  getNotificationStats,
  updateNotificationPreferences,
  sendImmediateAlert,
  sendEscalationNotification,
  sendProgressReminders,
  sendWeeklyReport,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} from './notifications';

// Environmental Impact Validation System - export types separately
export type { ValidationResult as ImpactValidationResult } from './impact_validation';

export { validateEnvironmentalMetrics } from './impact_validation';

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
 * 2. CONFIGURATION MANAGEMENT (monitoring_config.ts)
 *    - Project-type specific configurations
 *    - Monitoring thresholds and rules
 *    - Default configuration initialization
 *    - Dynamic configuration updates
 *
 * 3. AUTHENTICATION & AUTHORIZATION (monitoring_auth.ts)
 *    - Role-based permission system
 *    - Project access control
 *    - Alert management permissions
 *    - Audit logging
 *
 * 4. UTILITIES & HELPERS (monitoring_utils.ts)
 *    - Data validation functions
 *    - Metric calculations and analysis
 *    - Progress trend analysis
 *    - Performance comparison tools
 *
 * 5. ALERT GENERATION SYSTEM (alert_generation.ts)
 *    - Dynamic alert creation with severity classification
 *    - Alert deduplication and consolidation
 *    - Context-aware alert enrichment
 *    - Performance-optimized alert processing
 *
 * 6. ALERT MANAGEMENT API (alert_management.ts)
 *    - CRUD operations for alerts
 *    - Role-based alert access control
 *    - Alert lifecycle management
 *    - Bulk operations for efficiency
 *
 * 7. ALERT ESCALATION SYSTEM (alert_escalation.ts)
 *    - Time-based escalation with severity consideration
 *    - Priority management and dynamic adjustment
 *    - Escalation chain management
 *    - Escalation analytics and monitoring
 *
 * 8. NOTIFICATION SYSTEM (notifications.ts)
 *    - Multi-channel notifications (email, in-app, SMS)
 *    - Template-based messaging system
 *    - User preference management
 *    - Notification queue and delivery tracking
 *
 * 9. ENVIRONMENTAL IMPACT VALIDATION (impact_validation.ts)
 *    - Comprehensive metric validation framework
 *    - Project-type specific validation algorithms
 *    - Range checking and anomaly detection
 *    - Historical data validation and comparison
 *
 * 10. PROJECT-SPECIFIC VALIDATORS (project_validators.ts)
 *    - Advanced reforestation validation with survival rates
 *    - Solar energy validation with weather factors
 *    - Wind, biogas, waste management validators
 *    - Seasonal and location-based adjustments
 *
 * 11. TREND ANALYSIS ENGINE (trend_analysis.ts)
 *    - Statistical trend analysis and forecasting
 *    - Anomaly detection and pattern recognition
 *    - Performance benchmarking against similar projects
 *    - Data quality assessment and recommendations
 *
 * 12. THIRD-PARTY VALIDATION (third_party_validation.ts)
 *    - Satellite imagery validation integration
 *    - Weather data cross-referencing
 *    - Carbon registry verification
 *    - IoT sensor data validation
 *    - Consensus-based multi-provider validation
 *
 * 13. SCHEDULED JOBS (crons.ts)
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
 * - notifications: In-app notification delivery
 * - escalationConfig: Alert escalation configuration
 * - emailDeliveryLog: Email notification tracking
 * - smsDeliveryLog: SMS notification tracking
 * - notificationDeliveryLog: Multi-channel delivery tracking
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
