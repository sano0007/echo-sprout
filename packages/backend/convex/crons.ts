import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

/**
 * MONITORING & TRACKING SYSTEM - CRON JOBS CONFIGURATION
 *
 * This file defines the scheduled jobs for the monitoring system:
 * - Enhanced daily project monitoring (6:00 AM UTC)
 * - Hourly urgent monitoring (every hour)
 * - Weekly report generation (Monday 8:00 AM UTC)
 * - Additional monitoring jobs for comprehensive coverage
 */

const crons = cronJobs();

// Enhanced daily monitoring job - runs every day at 6:00 AM UTC
crons.daily(
  'Enhanced Daily Project Monitoring',
  {
    hourUTC: 6, // 6:00 AM UTC
    minuteUTC: 0,
  },
  internal['automated-monitoring'].enhancedDailyMonitoring
);

// Hourly urgent monitoring - runs every hour
crons.hourly(
  'Hourly Urgent Monitoring',
  {
    minuteUTC: 15, // Run at 15 minutes past each hour to avoid conflicts
  },
  internal.monitoring.hourlyUrgentMonitoring
);

// Weekly report generation - runs every Monday at 8:00 AM UTC
crons.weekly(
  'Weekly Report Generation',
  {
    dayOfWeek: 'monday',
    hourUTC: 8,
    minuteUTC: 0,
  },
  internal.monitoring.weeklyReportGeneration
);

// Additional monitoring jobs for comprehensive coverage

// Mid-day progress check - runs daily at 2:00 PM UTC
crons.daily(
  'Mid-day Progress Check',
  {
    hourUTC: 14, // 2:00 PM UTC
    minuteUTC: 30,
  },
  internal['automated-monitoring'].processHighPriorityNotifications
);

// Milestone risk assessment - runs every 6 hours
crons.interval(
  'Milestone Risk Assessment',
  { hours: 6 }, // Every 6 hours
  internal['automated-monitoring'].monitorMilestoneDelays
);

// Alert escalation processing - runs every hour
// TODO: Implement batchProcessEscalations function in alert-escalation module
// crons.hourly(
//   'Alert Escalation Processing',
//   {
//     minuteUTC: 5, // Run at 5 minutes past each hour to avoid conflicts
//   },
//   internal['alert-escalation'].batchProcessEscalations
// );

export default crons;
