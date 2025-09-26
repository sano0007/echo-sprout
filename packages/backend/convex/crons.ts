import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

/**
 * MONITORING & TRACKING SYSTEM - CRON JOBS CONFIGURATION
 *
 * This file defines the scheduled jobs for the monitoring system:
 * - Daily project monitoring (6:00 AM UTC)
 * - Hourly urgent monitoring (every hour)
 * - Weekly report generation (Monday 8:00 AM UTC)
 */

const crons = cronJobs();

// Daily monitoring job - runs every day at 6:00 AM UTC
crons.daily(
  'Daily Project Monitoring',
  {
    hourUTC: 6, // 6:00 AM UTC
    minuteUTC: 0,
  },
  internal.monitoring.dailyProjectMonitoring
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

export default crons;
