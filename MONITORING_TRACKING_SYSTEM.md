# Monitoring & Tracking System Documentation

**EcoSprout Carbon Credit Marketplace**
**Document Version:** 1.0
**Last Updated:** 2025-10-11

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Current Capabilities](#current-capabilities)
4. [Database Schema](#database-schema)
5. [API Reference](#api-reference)
6. [Frontend Components](#frontend-components)
7. [Implementation Status](#implementation-status)
8. [Gaps & Recommendations](#gaps--recommendations)

---

## Executive Summary

### Overview

The EcoSprout Monitoring & Tracking System is a comprehensive solution designed to monitor carbon credit projects throughout their lifecycle. It provides real-time visibility into project progress, automated alerting for issues, and detailed analytics for stakeholders.

### Key Stakeholders

- **Project Creators:** Track project milestones, submit progress updates, respond to alerts
- **Verifiers:** Monitor assigned projects, review progress, validate impact metrics
- **Buyers (Credit Purchasers):** Track purchased project progress, view impact metrics, receive updates
- **Administrators:** System-wide monitoring, alert management, analytics dashboards

### Technology Stack

- **Backend:** Convex (BaaS) - TypeScript-based serverless functions
- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
- **Storage:** Convex Storage (file uploads, documents)
- **Scheduling:** Convex Cron Jobs
- **State Management:** Zustand (tracking-store.ts)
- **Authentication:** Clerk
- **Package Manager:** Bun

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Buyer      │  │   Creator    │  │    Admin     │      │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │                │
│         └─────────────────┴─────────────────┘                │
│                           │                                  │
│                    ┌──────▼──────┐                          │
│                    │   Zustand   │                          │
│                    │   Store     │                          │
│                    └──────┬──────┘                          │
└────────────────────────────┼──────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────┐
│                   Convex Backend                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Monitoring  │  │   Analytics  │  │    Alerts    │    │
│  │   Queries    │  │    Engine    │  │  Management  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Automated   │  │   Progress   │  │    PDF       │    │
│  │  Monitoring  │  │   Tracking   │  │   Reports    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │             Convex Cron Jobs (Scheduled)           │   │
│  │  • Daily Monitoring (6:00 AM UTC)                  │   │
│  │  • Hourly Urgent Checks (Every hour)               │   │
│  │  • Weekly Reports (Monday 8:00 AM UTC)             │   │
│  └────────────────────────────────────────────────────┘   │
└────────────────────────────┬──────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────┐
│                  Convex Database                           │
│  • projects                • progressUpdates               │
│  • systemAlerts            • projectMilestones             │
│  • analytics               • notifications                 │
│  • auditLogs               • pdf_reports                   │
└────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Automated Monitoring Flow:**
   - Cron jobs trigger scheduled checks
   - Query active projects from database
   - Analyze progress, milestones, metrics
   - Generate alerts for anomalies
   - Send notifications to stakeholders

2. **Buyer Tracking Flow:**
   - Buyer views purchased projects
   - System fetches project + progress data
   - Display real-time status and impact
   - Show alerts and milestones
   - Enable PDF report generation

3. **Alert Management Flow:**
   - System/Manual alert creation
   - Role-based assignment
   - Escalation if unresolved
   - Notification dispatch
   - Resolution tracking

---

## Current Capabilities

### 1. Automated Monitoring System

**Location:** `packages/backend/convex/automated_monitoring.ts`

#### Daily Monitoring
- **Schedule:** Daily at 6:00 AM UTC
- **Function:** `enhancedDailyMonitoring`
- **Capabilities:**
  - Monitors all active projects
  - Checks for overdue progress reports (30+ days)
  - Identifies delayed milestones
  - Detects impact metric anomalies
  - Generates daily monitoring reports

#### Hourly Urgent Monitoring
- **Schedule:** Every hour
- **Function:** `hourlyUrgentMonitoring`
- **Capabilities:**
  - Critical issue detection
  - High-priority alert processing
  - Urgent notification dispatch

#### Weekly Report Generation
- **Schedule:** Monday 8:00 AM UTC
- **Function:** `weeklyReportGeneration`
- **Capabilities:**
  - Platform analytics aggregation
  - Weekly summary reports
  - Stakeholder email distribution

#### Project Progress Monitoring
**Key Functions:**
```typescript
// Monitor progress across all active projects
monitorProjectProgress()

// Analyze individual project
analyzeProjectProgress(ctx, project)

// Check timeline compliance
checkTimelineCompliance(ctx, project)

// Check impact metrics consistency
checkImpactMetricsConsistency(ctx, project, updates)
```

**Monitored Aspects:**
- Stalled progress (no updates)
- Overdue progress reports (35+ days critical, 45+ days urgent)
- Progress stagnation (< 3% variance over recent updates)
- Timeline compliance (schedule variance > 20%)
- Decreasing cumulative metrics (data quality issue)

#### Milestone Monitoring
**Key Functions:**
```typescript
// Monitor milestone delays
monitorMilestoneDelays()

// Analyze risk for upcoming milestones
analyzeMilestoneRisk(ctx, milestone)
```

**Capabilities:**
- Automatic milestone status updates (pending → delayed)
- Risk assessment for upcoming milestones (14-day window)
- Risk scoring based on:
  - Days since last update
  - Progress rate
  - Overall timeline compliance
- Alert generation for overdue and at-risk milestones

#### Anomaly Detection
**Key Functions:**
```typescript
// Detect anomalies across all projects
detectProjectAnomalies()

// Project-specific anomaly detection
detectProjectSpecificAnomalies(ctx, projectId, updates)

// Platform-wide anomaly detection
detectPlatformAnomalies(ctx, recentUpdates)
```

**Detection Algorithms:**
- **Progress Anomalies:** Unusual jumps (>40%) or decreases (>10%)
- **Metric Anomalies:** Decreasing cumulative metrics
- **Reporting Frequency:** Multiple updates per day
- **Platform Activity:** Unusual activity levels

---

### 2. Alert Management System

**Location:** `packages/backend/convex/alert_management.ts`

#### CRUD Operations

**Create Alert:**
```typescript
createAlert({
  alertType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  message: string,
  description?: string,
  projectId?: Id<'projects'>,
  assignedTo?: Id<'users'>,
  metadata?: any
})
```

**Get Alerts (with filtering):**
```typescript
getAlerts({
  filters: {
    severity?: ['low', 'medium', 'high', 'critical'],
    alertType?: string[],
    isResolved?: boolean,
    projectId?: Id<'projects'>,
    assignedTo?: Id<'users'>,
    dateRange?: { start: number, end: number }
  },
  sorting: {
    field: '_creationTime' | 'severity' | 'urgencyScore' | 'lastOccurrence',
    direction: 'asc' | 'desc'
  },
  pagination: {
    limit: number,
    offset?: number
  }
})
```

**Resolve Alert:**
```typescript
resolveAlert({
  alertId: Id<'systemAlerts'>,
  resolutionNotes?: string,
  resolutionType?: 'fixed' | 'acknowledged' | 'dismissed' | 'duplicate'
})
```

#### Bulk Operations
- `bulkResolveAlerts()` - Resolve multiple alerts at once
- `bulkAssignAlerts()` - Assign multiple alerts
- `bulkDeleteResolvedAlerts()` - Cleanup old resolved alerts

#### Escalation System
**Fields:**
- `escalationLevel`: 0-3 (0=initial, 3=final warning)
- `nextEscalationTime`: When to escalate
- `autoEscalationEnabled`: Auto-escalation flag
- `urgencyScore`: 0-100 calculated score

**Escalation Delays by Severity:**
- Low: 7 days
- Medium: 3 days
- High: 1 day
- Critical: 4 hours

#### Role-Based Access Control
- **Admin:** Full access to all alerts
- **Verifier:** Access to assigned project alerts
- **Project Creator:** Access to own project alerts
- **Buyer:** Read-only access to purchased project alerts

#### Alert Enrichment
Each alert includes:
- Project information (title, type, status)
- Assigned user details
- Resolution information
- Time metrics (age, resolution time)

---

### 3. Analytics & Reporting

**Location:** `packages/backend/convex/analytics.ts`

#### Dashboard Analytics
```typescript
getDashboardAnalytics({
  timeframe: '7d' | '30d' | '90d' | '1y',
  category: 'all' | 'platform' | 'environmental' | 'financial' | 'user'
})
```

**Returns:**
- **Metrics:** Total projects, active users, CO₂ offset, revenue, credits traded
- **Charts:** Projects over time, revenue trends, project distribution, user engagement
- **Change Tracking:** Period-over-period comparisons

#### Key Metrics Tracked

**Platform Metrics:**
- Total projects
- Active projects
- Project success rate (% completed)
- Verification rate (% verified)

**User Metrics:**
- Total users
- Active users
- User growth trends

**Environmental Metrics:**
- CO₂ offset (tons)
- Trees planted
- Energy generated
- Waste processed

**Financial Metrics:**
- Total revenue (platform fees)
- Credits traded
- Average credit price
- Transaction volume

#### Report Generation
**Types:**
- Project performance reports
- Platform analytics
- Impact summaries
- User engagement reports
- Financial metrics

---

### 4. Buyer Project Tracking

**Location:**
- Backend: `packages/backend/convex/monitoring.ts`
- Frontend: `apps/web/components/buyer/ProjectTracking.tsx`
- Store: `apps/web/store/tracking-store.ts`

#### Core Functions

**Get Buyer Portfolio:**
```typescript
getBuyerProjectTracking({
  userId: Id<'users'>
})
```

**Returns for each purchased project:**
- Project details (title, type, location, creator)
- Purchase info (credits owned, purchase date, investment)
- Current status (progress %, phase, next milestone)
- Recent updates (last 3 updates with photos and metrics)
- Impact metrics (carbon offset, additional metrics)
- Active alerts (severity, message, date)
- Milestones timeline (planned/actual dates, status)
- Verification status

**Get Detailed Project Tracking:**
```typescript
getDetailedProjectTracking({
  projectId: Id<'projects'>,
  userId: Id<'users'>
})
```

**Get Portfolio Summary:**
```typescript
getBuyerPortfolioSummary({
  userId: Id<'users'>
})
```

**Returns:**
- Total credits owned
- Total investment
- Total carbon offset
- Active vs completed projects
- Projects with issues
- Average investment per project

#### Tracking Store (Zustand)

**State Management:**
```typescript
interface TrackingStore {
  // Data
  projects: ProjectProgress[]
  selectedProject: DetailedProjectTracking | null
  portfolioSummary: PortfolioSummary | null

  // UI State
  filters: TrackingFilters
  selectedProjectId: string | null

  // Loading & Errors
  loading: { projects, selectedProject, portfolio }
  errors: { projects, selectedProject, portfolio }

  // Computed Properties
  getFilteredProjects()
  getSortedProjects()
  getProjectById()
  getActiveAlertsCount()
  getCompletionRate()
  getTotalCarbonImpact()
}
```

**Filters:**
- Status: all | active | completed | issues
- Sort by: recent | progress | alerts | investment | carbon_impact
- Project type: filter by project type
- Timeframe: all | 30d | 90d | 1y

#### Frontend Components

**ProjectTracking.tsx:**
- Grid view of purchased projects
- Project cards with progress indicators
- Alert badges
- Impact metrics display
- Detailed project modal with:
  - Project overview
  - Active alerts
  - Recent updates with photos
  - Milestones timeline
  - Verification status

---

### 5. Progress Updates System

**Location:** `packages/backend/convex/progress_updates.ts`

#### Progress Update Schema
```typescript
{
  projectId: Id<'projects'>,
  updateType: 'milestone' | 'measurement' | 'photo' | 'issue' | 'completion',
  title: string,
  description: string,
  progressPercentage: number,
  reportingDate: number,

  // Photos (Convex Storage)
  photoStorageIds?: Id<'_storage'>[],
  photoUrls?: string[],

  // Location
  location?: { lat, long, name },

  // Impact Metrics
  measurementData?: {
    treesPlanted?: number,
    survivalRate?: number,
    energyGenerated?: number,
    systemUptime?: number,
    gasProduced?: number,
    wasteProcessed?: number,
    recyclingRate?: number,
    areaRestored?: number,
    mangrovesPlanted?: number,
    carbonImpactToDate?: number
  },

  nextSteps?: string,
  challenges?: string,
  status: 'pending_review' | 'approved' | 'rejected' | 'needs_revision',
  isVerified: boolean
}
```

#### Validation
**Progress Validation:**
- Required fields check
- Photo requirements (minimum count)
- Progress percentage boundaries (0-100)
- Chronological ordering
- Duplicate detection

**Impact Validation:**
- Metric thresholds validation
- Cumulative metric consistency
- Project-type specific metrics

---

### 6. Notification System

**Location:** `packages/backend/convex/notifications.ts`

#### Notification Schema
```typescript
{
  recipientId: Id<'users'>,
  subject: string,
  message: string,
  type: string,
  severity: 'info' | 'warning' | 'error' | 'critical',
  category: string,
  channels: string[], // ['email', 'in_app', 'sms']
  priority: 'low' | 'normal' | 'high' | 'urgent',

  relatedEntityType: 'project' | 'verification' | 'alert' | 'escalation',
  relatedEntityId: string,
  actionUrl: string,

  scheduledAt?: number,
  sentAt?: number,
  deliveredAt?: number,
  readAt?: number,

  isRead: boolean,
  isArchived: boolean
}
```

#### Notification Preferences
Users can configure:
- **Channels:** email, in-app, SMS
- **Alert Types:** progress reminders, milestone delays, system alerts, escalations, weekly reports
- **Quiet Hours:** Enabled, start/end times, timezone
- **Frequency:** immediate, hourly, daily, weekly

#### Delivery Tracking
- **emailDeliveryLog:** Track email delivery status
- **smsDeliveryLog:** Track SMS delivery status
- **notificationDeliveryLog:** Alert-specific delivery results

---

### 7. PDF Report Generation

**Location:** `packages/backend/convex/pdf_reports.ts`

#### Report Types

**Analytics Reports:**
- Comprehensive analytics
- Platform overview
- Environmental impact summary
- Financial metrics report

**Monitoring Reports:**
- System monitoring report
- Project monitoring report
- Alert analysis report
- Performance metrics report

#### Report Generation Flow
1. User requests report with parameters
2. System creates `pdf_reports` record (status: pending)
3. Background job processes report data
4. PDF generated and stored in Convex Storage
5. Report status updated to completed
6. Download URL provided to user
7. Auto-cleanup after expiration

#### Report Schema
```typescript
{
  templateType: 'analytics' | 'monitoring',
  reportType: string,
  title: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  progress: number, // 0-100
  requestedBy: string, // Clerk user ID
  requestedAt: number,
  completedAt?: number,
  fileUrl?: string,
  fileSize?: number,
  expiresAt: number,
  timeframe: { start, end, period },
  filters?: any,
  userInfo: { userId, name, email, role }
}
```

---

## Database Schema

### Key Tables

#### projects
**Purpose:** Store carbon credit projects
**Indexes:**
- by_creator, by_status, by_type, by_verification_status, by_verifier
- by_creator_status, by_type_status, by_status_completion, by_verifier_status

**Monitoring Fields:**
- `progressPercentage`: Current progress (0-100)
- `lastProgressUpdate`: Timestamp of last update
- `assignedVerifierId`: Assigned verifier for monitoring
- `verificationStatus`: Current verification state
- `status`: Project lifecycle status

---

#### systemAlerts
**Purpose:** Track system and project alerts
**Indexes:**
- by_project, by_type, by_severity, by_resolved, by_assigned
- by_escalation_time, by_category, by_project_resolved, by_type_resolved

**Key Fields:**
```typescript
{
  projectId?: Id<'projects'>,
  alertType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  message: string,
  description?: string,
  source: string, // 'system', 'manual_admin', etc.
  category: string, // 'monitoring', 'system', 'performance'

  // Resolution
  isResolved: boolean,
  resolvedAt?: number,
  resolvedBy?: Id<'users'>,
  resolutionNotes?: string,
  resolutionType?: 'fixed' | 'acknowledged' | 'dismissed' | 'duplicate',

  // Assignment
  assignedTo?: Id<'users'>,
  assignedBy?: Id<'users'>,
  assignedAt?: number,

  // Escalation
  escalationLevel: number, // 0-3
  lastEscalationTime?: number,
  nextEscalationTime?: number,
  autoEscalationEnabled: boolean,

  // Metrics
  urgencyScore?: number, // 0-100
  occurrenceCount?: number,
  firstOccurrence?: number,
  lastOccurrence?: number,

  // Metadata
  metadata?: any,
  lastUpdatedBy?: Id<'users'>,
  lastUpdatedAt?: number
}
```

---

#### projectMilestones
**Purpose:** Track project milestones
**Indexes:**
- by_project, by_project_status, by_project_order, by_milestone_type
- by_planned_date, by_status_date

**Milestone Types:**
- `setup`: Initial project setup
- `progress_25`: 25% completion
- `progress_50`: 50% completion
- `progress_75`: 75% completion
- `impact_first`: First impact measurement
- `verification`: Verification checkpoint
- `completion`: Project completion

**Status Values:**
- `pending`: Not started
- `in_progress`: Currently working on
- `completed`: Finished
- `delayed`: Past planned date
- `skipped`: Not applicable

---

#### progressUpdates
**Purpose:** Store project progress reports
**Indexes:**
- by_project, by_submitter, by_reporter, by_status
- by_project_status, by_submitted_at, by_reporting_date

**Update Types:**
- `milestone`: Milestone achievement
- `measurement`: Impact measurement
- `photo`: Photo evidence
- `issue`: Problem report
- `completion`: Project completion

---

#### analytics
**Purpose:** Store aggregated analytics data
**Indexes:**
- by_metric, by_date, by_metric_date, by_category
- by_project, by_project_metric, by_category_date

**Common Metrics:**
- `daily_active_projects`
- `weekly_alerts_generated`
- `weekly_progress_updates`
- `daily_monitoring_report`

---

#### notifications
**Purpose:** User notifications and alerts
**Indexes:**
- by_recipient, by_unread, by_type, by_priority, by_scheduled
- by_sent, by_status, by_category, by_severity, by_entity, by_batch

**Delivery Status Values:**
- `pending`: Awaiting delivery
- `sent`: Sent to provider
- `delivered`: Confirmed delivery
- `failed`: Delivery failed
- `bounced`: Recipient unavailable

---

#### pdf_reports
**Purpose:** Generated PDF reports
**Indexes:**
- by_user, by_status, by_template_type, by_report_type
- by_requested_at, by_expires_at, by_user_status

**Status Values:**
- `pending`: Awaiting processing
- `processing`: Currently generating
- `completed`: Ready for download
- `failed`: Generation failed

---

#### auditLogs
**Purpose:** System audit trail
**Fields:**
- userId, action, entityType, entityId
- oldValues, newValues, metadata
- severity: 'info' | 'warning' | 'error' | 'critical'

**Common Actions:**
- `alert_created`, `alert_resolved`, `alert_escalated`
- `project_created`, `project_status_changed`
- `monitoring_system_failure`

---

### Relationships

```
projects (1) ──→ (N) projectMilestones
projects (1) ──→ (N) progressUpdates
projects (1) ──→ (N) systemAlerts
projects (1) ──→ (N) transactions

users (1) ──→ (N) projects [as creator]
users (1) ──→ (N) systemAlerts [as assignee]
users (1) ──→ (N) notifications [as recipient]

transactions (1) ──→ (1) projects
transactions (1) ──→ (N) certificates
```

---

## API Reference

### Monitoring Queries

#### getBuyerProjectTracking
**Purpose:** Get all projects purchased by a buyer
**Authentication:** Required
**Parameters:**
```typescript
{
  userId: Id<'users'>
}
```
**Returns:** `ProjectProgress[]`

---

#### getDetailedProjectTracking
**Purpose:** Get detailed tracking data for a specific project
**Authentication:** Required (must own credits)
**Parameters:**
```typescript
{
  projectId: Id<'projects'>,
  userId: Id<'users'>
}
```
**Returns:** `DetailedProjectTracking`

---

#### getBuyerPortfolioSummary
**Purpose:** Get portfolio summary for a buyer
**Authentication:** Required
**Parameters:**
```typescript
{
  userId: Id<'users'>
}
```
**Returns:**
```typescript
{
  totalCredits: number,
  totalInvestment: number,
  totalCarbonOffset: number,
  activeProjects: number,
  completedProjects: number,
  projectsWithIssues: number,
  totalProjects: number,
  averageInvestment: number
}
```

---

### Alert Management Queries

#### getAlerts
**Purpose:** Get alerts with filtering and pagination
**Authentication:** Required (role-based access)
**Parameters:**
```typescript
{
  filters?: {
    severity?: ('low' | 'medium' | 'high' | 'critical')[],
    alertType?: string[],
    isResolved?: boolean,
    projectId?: Id<'projects'>,
    assignedTo?: Id<'users'>,
    dateRange?: { start: number, end: number }
  },
  sorting?: {
    field: '_creationTime' | 'severity' | 'urgencyScore' | 'lastOccurrence',
    direction: 'asc' | 'desc'
  },
  pagination?: {
    limit: number,
    offset?: number
  }
}
```
**Returns:**
```typescript
{
  alerts: EnrichedAlert[],
  total: number,
  hasMore: boolean
}
```

---

#### getAlert
**Purpose:** Get a specific alert by ID
**Authentication:** Required (must have access)
**Parameters:**
```typescript
{
  alertId: Id<'systemAlerts'>
}
```
**Returns:** `EnrichedAlert & { timeline: AuditLog[] }`

---

#### getAlertSummary
**Purpose:** Get alert statistics summary
**Authentication:** Required
**Parameters:**
```typescript
{
  timeframe?: '24h' | '7d' | '30d'
}
```
**Returns:**
```typescript
{
  total: number,
  unresolved: number,
  resolved: number,
  bySeverity: { critical, high, medium, low },
  byType: Record<string, number>,
  assigned: number,
  avgResolutionTimeHours: number,
  escalated: number
}
```

---

### Analytics Queries

#### getDashboardAnalytics
**Purpose:** Get dashboard analytics data
**Authentication:** Required (admin/verifier)
**Parameters:**
```typescript
{
  timeframe?: '7d' | '30d' | '90d' | '1y',
  category?: 'all' | 'platform' | 'environmental' | 'financial' | 'user'
}
```
**Returns:**
```typescript
{
  metrics: AnalyticsMetric[],
  charts: AnalyticsChart[],
  lastUpdated: number
}
```

---

### Alert Management Mutations

#### createAlert
**Purpose:** Create a new alert
**Authentication:** Required (admin/verifier/creator)
**Parameters:**
```typescript
{
  alertType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  message: string,
  description?: string,
  projectId?: Id<'projects'>,
  assignedTo?: Id<'users'>,
  metadata?: any,
  source?: string,
  category?: string,
  tags?: string[]
}
```
**Returns:** `Id<'systemAlerts'>`

---

#### updateAlert
**Purpose:** Update an existing alert
**Authentication:** Required (must have access)
**Parameters:**
```typescript
{
  alertId: Id<'systemAlerts'>,
  updates: {
    message?: string,
    description?: string,
    severity?: 'low' | 'medium' | 'high' | 'critical',
    assignedTo?: Id<'users'>,
    metadata?: any,
    tags?: string[]
  },
  notes?: string
}
```
**Returns:** `{ success: true }`

---

#### resolveAlert
**Purpose:** Resolve an alert
**Authentication:** Required (must have access)
**Parameters:**
```typescript
{
  alertId: Id<'systemAlerts'>,
  resolutionNotes?: string,
  resolutionType?: 'fixed' | 'acknowledged' | 'dismissed' | 'duplicate'
}
```
**Returns:** `{ success: true }`

---

#### reopenAlert
**Purpose:** Reopen a resolved alert
**Authentication:** Required (admin/verifier only)
**Parameters:**
```typescript
{
  alertId: Id<'systemAlerts'>,
  reason: string
}
```
**Returns:** `{ success: true }`

---

#### assignAlert
**Purpose:** Assign an alert to a user
**Authentication:** Required (admin/verifier)
**Parameters:**
```typescript
{
  alertId: Id<'systemAlerts'>,
  assignedTo: Id<'users'>,
  notes?: string
}
```
**Returns:** `{ success: true }`

---

#### deleteAlert
**Purpose:** Delete an alert (admin only)
**Authentication:** Required (admin only)
**Parameters:**
```typescript
{
  alertId: Id<'systemAlerts'>
}
```
**Returns:** `{ success: true, message: string }`

---

#### bulkResolveAlerts
**Purpose:** Resolve multiple alerts at once
**Authentication:** Required (admin/verifier)
**Parameters:**
```typescript
{
  alertIds: Id<'systemAlerts'>[],
  resolutionNotes?: string,
  resolutionType?: 'fixed' | 'acknowledged' | 'dismissed' | 'duplicate'
}
```
**Returns:**
```typescript
{
  processedCount: number,
  successCount: number,
  errorCount: number,
  results: Array<{ alertId, success, error? }>
}
```

---

#### bulkAssignAlerts
**Purpose:** Assign multiple alerts at once
**Authentication:** Required (admin/verifier)
**Parameters:**
```typescript
{
  alertIds: Id<'systemAlerts'>[],
  assignedTo: Id<'users'>,
  notes?: string
}
```
**Returns:**
```typescript
{
  processedCount: number,
  successCount: number,
  errorCount: number,
  results: Array<{ alertId, success, error? }>
}
```

---

#### bulkDeleteResolvedAlerts
**Purpose:** Delete old resolved alerts in bulk
**Authentication:** Required (admin only)
**Parameters:**
```typescript
{
  olderThanDays?: number // default: 30
}
```
**Returns:**
```typescript
{
  success: true,
  deletedCount: number,
  message: string
}
```

---

## Frontend Components

### 1. SystemMonitoring.tsx

**Location:** `apps/web/components/monitoring/SystemMonitoring.tsx`

**Purpose:** Real-time system health and performance monitoring dashboard

**Features:**
- System-wide metrics (CPU, memory, disk, response time, active users, error rate)
- Service health status tracking (Web Server, API, Database, Auth, Storage, Email)
- Active alerts with severity indicators
- Real-time data refresh (30-second intervals)
- Filtering by category and timeframe
- Service restart actions
- Alert resolution interface

**Props:**
```typescript
{
  onRefreshData?: () => void,
  onResolveAlert?: (alertId: string, resolution: string) => void,
  onRestartService?: (serviceId: string) => void,
  autoRefresh?: boolean
}
```

**Key Sections:**
- **Header:** System status, last updated, refresh button
- **Quick Stats:** Healthy metrics, warnings, active alerts, services online
- **Filters:** Category, timeframe, show resolved toggle
- **Metrics Grid:** Color-coded metric cards with trends
- **Service Health:** Service status with uptime and response time
- **Active Alerts:** Alert list with severity, resolution actions

---

### 2. ProjectTracking.tsx

**Location:** `apps/web/components/buyer/ProjectTracking.tsx`

**Purpose:** Buyer-facing dashboard for tracking purchased carbon credit projects

**Features:**
- Grid view of all purchased projects
- Progress indicators and status badges
- Alert notifications
- Impact metrics (carbon offset)
- Recent updates display
- Detailed project modal with:
  - Project overview
  - Active alerts
  - Recent updates with photos
  - Milestones timeline
  - Verification status

**Hooks Used:**
```typescript
useProjectTracking()  // Fetch projects, loading, errors, refresh
useProjectFilters()   // Filter state management
useProjectDetails()   // Selected project details
```

**Filtering:**
- Status: All, Active, Completed, With Issues
- Sort by: Recent Updates, Progress, Alerts, Investment, Carbon Impact
- Project type filter
- Timeframe filter

**State Management:**
- Zustand store (`tracking-store.ts`)
- Computed properties for filtering and sorting
- Real-time updates via Convex subscriptions

---

### 3. AnalyticsDashboard.tsx

**Location:** `apps/web/components/monitoring/AnalyticsDashboard.tsx`

**Purpose:** Analytics dashboard for admin and verifier roles

**Features:**
- Key metrics with period-over-period comparison
- Interactive charts (line, bar, pie, area)
- Time range selection (7d, 30d, 90d, 1y)
- Category filtering (platform, environmental, financial, user)
- Export capabilities
- Real-time data updates

**Charts:**
- Projects created over time (line)
- Revenue trends (area)
- Project distribution by type (pie)
- User registrations over time (bar)

---

## Implementation Status

### ✅ Fully Implemented

1. **Database Schema**
   - All monitoring tables defined
   - Comprehensive indexes
   - Proper relationships

2. **Alert Management**
   - CRUD operations (create, read, update, delete)
   - Filtering and pagination
   - Role-based access control
   - Bulk operations
   - Alert enrichment

3. **Buyer Tracking**
   - Portfolio overview
   - Detailed project tracking
   - Progress updates display
   - Impact metrics
   - Milestone timeline

4. **Progress Updates**
   - Update submission
   - Photo upload (Convex Storage)
   - Impact metrics tracking
   - Validation logic

5. **Analytics Engine**
   - Dashboard analytics
   - Metrics calculation
   - Chart data generation
   - Time-based filtering

6. **Frontend Components**
   - SystemMonitoring.tsx (UI ready, mock data)
   - ProjectTracking.tsx (fully functional)
   - AnalyticsDashboard.tsx (UI ready)

7. **State Management**
   - Zustand tracking store
   - Computed properties
   - Filter management

8. **Notification System**
   - Database schema
   - User preferences
   - Delivery tracking

---

### ⚠️ Partially Implemented

1. **Automated Monitoring (crons.ts)**
   - **Status:** Functions defined, cron jobs commented out
   - **Location:** `packages/backend/convex/crons.ts`
   - **Issue:** All cron jobs are disabled (TODO comments)
   - **Required Actions:**
     - Uncomment cron job definitions
     - Update API imports in `_generated/api`
     - Test scheduled execution

2. **Alert Escalation**
   - **Status:** Schema and logic defined, automation disabled
   - **Functions exist:** `escalateAlert`, escalation delays calculated
   - **Missing:** Automatic escalation cron job
   - **Required Actions:**
     - Implement `batchProcessEscalations` function
     - Enable escalation cron job
     - Test escalation chain

3. **PDF Report Generation**
   - **Status:** Database schema defined, generation logic incomplete
   - **Location:** `packages/backend/convex/pdf_reports.ts`
   - **What exists:** Report request handling, status tracking
   - **Missing:** Actual PDF generation using templates
   - **Required Actions:**
     - Implement PDF generation library (e.g., jsPDF, pdfmake)
     - Complete template rendering
     - Test report output

4. **Notification Delivery**
   - **Status:** Schema defined, no delivery implementation
   - **What exists:** Notification creation, preferences, templates
   - **Missing:** Integration with email/SMS providers
   - **Required Actions:**
     - Integrate email provider (SendGrid, AWS SES)
     - Integrate SMS provider (Twilio, AWS SNS)
     - Implement delivery queues
     - Test multi-channel delivery

5. **System Monitoring (SystemMonitoring.tsx)**
   - **Status:** UI complete, using mock data
   - **What exists:** Full UI with all features
   - **Missing:** Real data integration from Convex
   - **Required Actions:**
     - Create system health queries
     - Implement real-time metrics collection
     - Connect to actual alert data

---

### ❌ Not Implemented

1. **Alert Escalation Configuration UI**
   - **What's needed:** Admin interface to configure escalation rules
   - **Schema exists:** `escalationConfig` table
   - **Missing:** Frontend component to manage rules

2. **Monitoring Configuration UI**
   - **What's needed:** Admin interface to configure monitoring settings
   - **Schema exists:** `monitoringConfig` table
   - **Missing:** Frontend component to manage configs

3. **Real-Time WebSocket Updates**
   - **What's needed:** Live dashboard updates without polling
   - **Current approach:** Manual refresh or periodic polling
   - **Missing:** WebSocket/SSE implementation

4. **Advanced Anomaly Detection**
   - **What exists:** Basic statistical anomaly detection
   - **Missing:** Machine learning-based predictions
   - **Potential:** Trend forecasting, risk scoring

5. **Multi-Language Support**
   - **Status:** All text hardcoded in English
   - **Missing:** i18n implementation

6. **Mobile App**
   - **Status:** Responsive web only
   - **Missing:** Native mobile apps (iOS, Android)

---

## Gaps & Recommendations

### 🔴 Critical (High Priority)

#### 1. Enable Automated Monitoring Cron Jobs
**Impact:** High
**Effort:** Low
**Issue:** All monitoring jobs are disabled in `crons.ts`
**Action:**
```typescript
// In packages/backend/convex/crons.ts
// Uncomment these lines:
crons.daily(
  'Enhanced Daily Project Monitoring',
  { hourUTC: 6, minuteUTC: 0 },
  internal.automated_monitoring.enhancedDailyMonitoring
);

crons.hourly(
  'Hourly Urgent Monitoring',
  { minuteUTC: 15 },
  internal.monitoring.hourlyUrgentMonitoring
);

crons.weekly(
  'Weekly Report Generation',
  { dayOfWeek: 'monday', hourUTC: 8, minuteUTC: 0 },
  internal.monitoring.weeklyReportGeneration
);
```
**Verification:** Monitor Convex logs for scheduled job execution

---

#### 2. Implement Notification Delivery
**Impact:** High
**Effort:** Medium
**Issue:** Notifications created but not delivered
**Action:**
1. Choose providers (SendGrid for email, Twilio for SMS)
2. Create delivery service:
```typescript
// packages/backend/services/notification-delivery-service.ts
export class NotificationDeliveryService {
  async sendEmail(notification) {
    // SendGrid integration
  }

  async sendSMS(notification) {
    // Twilio integration
  }

  async sendInApp(notification) {
    // Store in notifications table
  }
}
```
3. Create delivery action:
```typescript
// packages/backend/convex/notification_delivery.ts
export const processNotificationQueue = internalAction({
  handler: async (ctx) => {
    const pending = await getPendingNotifications(ctx);
    for (const notification of pending) {
      await deliverNotification(ctx, notification);
    }
  }
});
```
4. Add cron job for processing queue

---

#### 3. Connect SystemMonitoring.tsx to Real Data
**Impact:** High
**Effort:** Medium
**Issue:** Using mock data instead of real metrics
**Action:**
1. Create system health queries:
```typescript
// packages/backend/convex/system_health.ts
export const getSystemMetrics = query({
  handler: async (ctx) => {
    // Query real metrics from analytics table
    // Calculate aggregates
    // Return formatted data
  }
});

export const getServiceHealth = query({
  handler: async (ctx) => {
    // Check Convex services
    // Check external integrations
    // Return health status
  }
});
```
2. Update SystemMonitoring.tsx to use real queries
3. Implement auto-refresh with Convex subscriptions

---

#### 4. Implement Alert Escalation Automation
**Impact:** High
**Effort:** Medium
**Issue:** Escalation logic exists but not automated
**Action:**
1. Create escalation processor:
```typescript
// packages/backend/convex/alert_escalation.ts
export const batchProcessEscalations = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const alertsToEscalate = await ctx.db
      .query('systemAlerts')
      .withIndex('by_escalation_time')
      .filter(q => q.lte(q.field('nextEscalationTime'), now))
      .filter(q => q.eq(q.field('isResolved'), false))
      .collect();

    for (const alert of alertsToEscalate) {
      await escalateAlert(ctx, alert);
      await notifyEscalation(ctx, alert);
    }
  }
});
```
2. Add cron job:
```typescript
crons.hourly(
  'Alert Escalation Processing',
  { minuteUTC: 5 },
  internal.alert_escalation.batchProcessEscalations
);
```

---

### 🟡 Important (Medium Priority)

#### 5. Complete PDF Report Generation
**Impact:** Medium
**Effort:** High
**Issue:** Report generation not implemented
**Action:**
1. Install PDF library:
```bash
bun add pdfmake
```
2. Create report generators:
```typescript
// packages/backend/lib/pdf-generator.ts
import pdfMake from 'pdfmake/build/pdfmake';

export class PDFGenerator {
  async generateAnalyticsReport(data) {
    const docDefinition = {
      content: [
        { text: 'Analytics Report', style: 'header' },
        // Add charts, tables, metrics
      ],
      styles: { /* ... */ }
    };

    const pdf = pdfMake.createPdf(docDefinition);
    return await this.uploadToConvexStorage(pdf);
  }

  async generateMonitoringReport(data) {
    // Similar implementation
  }
}
```
3. Create report generation action:
```typescript
// packages/backend/convex/pdf_generation.ts
export const generateReport = internalAction({
  args: { reportId: v.id('pdf_reports') },
  handler: async (ctx, { reportId }) => {
    const report = await ctx.db.get(reportId);
    const data = await fetchReportData(ctx, report);
    const pdfUrl = await PDFGenerator.generate(report.reportType, data);
    await ctx.db.patch(reportId, {
      status: 'completed',
      fileUrl: pdfUrl,
      completedAt: Date.now()
    });
  }
});
```

---

#### 6. Add Monitoring Configuration UI
**Impact:** Medium
**Effort:** Medium
**Issue:** No UI to manage monitoring settings
**Action:**
1. Create admin configuration page:
```typescript
// apps/web/app/(dashboard)/admin/monitoring-config/page.tsx
```
2. Build configuration form components:
   - Alert thresholds editor
   - Escalation rules builder
   - Notification template manager
   - Monitoring schedule configurator
3. Connect to `monitoringConfig` and `escalationConfig` tables

---

#### 7. Enhance Analytics with Trends
**Impact:** Medium
**Effort:** Medium
**Current:** Snapshot analytics only
**Enhancement:**
- Implement trend analysis (week-over-week, month-over-month)
- Add forecasting (predict project completion dates)
- Create benchmark comparisons (project vs similar projects)

---

### 🟢 Nice to Have (Low Priority)

#### 8. Advanced Anomaly Detection
**Impact:** Low
**Effort:** High
**Enhancement:**
- Implement machine learning models
- Historical pattern analysis
- Predictive risk scoring

---

#### 9. Real-Time Dashboard Updates
**Impact:** Low
**Effort:** Medium
**Enhancement:**
- Implement WebSocket connections
- Live metric updates without refresh
- Real-time alert notifications

---

#### 10. Mobile App Development
**Impact:** Low
**Effort:** Very High
**Enhancement:**
- React Native app
- Push notifications
- Offline support

---

#### 11. Multi-Language Support
**Impact:** Low
**Effort:** Medium
**Enhancement:**
- i18n implementation
- Translation management
- RTL support

---

### Quick Win Recommendations

1. **Enable Cron Jobs (1 hour)**
   - Uncomment cron definitions
   - Deploy and verify execution

2. **Fix Alert Assignment (2 hours)**
   - Ensure proper role-based access
   - Test assignment workflows

3. **Add Alert Filters to Frontend (3 hours)**
   - Implement filter UI
   - Connect to backend queries
   - Add saved filter presets

4. **Implement Basic Email Notifications (4 hours)**
   - SendGrid integration
   - Email templates
   - Delivery tracking

5. **Create Monitoring Dashboard for Project Creators (4 hours)**
   - Show own projects
   - Display alerts
   - Progress overview

---

## Conclusion

The EcoSprout Monitoring & Tracking System is well-architected with a solid foundation. The database schema is comprehensive, the backend logic is sophisticated, and the frontend components are well-designed.

**Current State:**
- ✅ Strong foundation (70% complete)
- ⚠️ Core automation disabled (cron jobs)
- ⚠️ Notification delivery missing
- ⚠️ PDF generation incomplete

**Priority Actions:**
1. Enable automated monitoring cron jobs
2. Implement notification delivery
3. Connect frontend to real data
4. Automate alert escalation

**Timeline Estimate:**
- Critical fixes: 2-3 days
- Important enhancements: 1-2 weeks
- Nice-to-have features: 1-2 months

With these improvements, the system will provide comprehensive, automated monitoring and tracking capabilities for all stakeholders in the carbon credit marketplace.

---

**Document End**
