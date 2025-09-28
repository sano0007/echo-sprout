/**
 * MONITORING & TRACKING SYSTEM - TYPE DEFINITIONS
 *
 * This file contains TypeScript type definitions for the monitoring system:
 * - Progress update types
 * - Alert and notification types
 * - Milestone and configuration types
 * - Analytics and reporting types
 */

// ============= CORE MONITORING TYPES =============

export type MilestoneType =
  | 'setup'
  | 'progress_25'
  | 'progress_50'
  | 'progress_75'
  | 'impact_first'
  | 'verification'
  | 'completion';

export type MilestoneStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'delayed'
  | 'skipped';

export type AlertType =
  | 'progress_reminder'
  | 'overdue_warning'
  | 'milestone_delay'
  | 'impact_shortfall'
  | 'quality_concern'
  | 'document_missing'
  | 'verification_overdue';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ProjectUpdateType =
  | 'milestone'
  | 'measurement'
  | 'photo'
  | 'issue'
  | 'completion';

// ============= PROGRESS UPDATE TYPES =============

export interface ProgressUpdateData {
  projectId: string;
  updateType: ProjectUpdateType;
  title: string;
  description: string;
  progressPercentage: number;
  reportingDate: number;

  // Optional location data
  location?: {
    lat: number;
    long: number;
    name: string;
  };

  // Photo evidence
  photos: {
    cloudinary_public_id: string;
    cloudinary_url: string;
  }[];

  // Impact metrics (project-specific)
  measurementData?: {
    // Reforestation
    treesPlanted?: number;
    survivalRate?: number;

    // Solar/Wind energy
    energyGenerated?: number; // kWh
    systemUptime?: number; // percentage

    // Biogas
    gasProduced?: number; // cubic meters

    // Waste management
    wasteProcessed?: number; // kg
    recyclingRate?: number; // percentage

    // Mangrove restoration
    areaRestored?: number; // hectares
    mangrovesPlanted?: number;

    // Common
    carbonImpactToDate?: number; // tons CO2
  };
}

export interface ProgressValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

export interface ImpactValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  metricsCount: number;
}

// ============= MILESTONE TYPES =============

export interface ProjectMilestone {
  _id: string;
  projectId: string;
  milestoneType: MilestoneType;
  title: string;
  description: string;
  plannedDate: number;
  actualDate?: number;
  status: MilestoneStatus;
  delayReason?: string;
  impactOnTimeline?: string;
  order: number;
  isRequired: boolean;
}

export interface MilestoneProgress {
  milestone: ProjectMilestone;
  days: number;
  isOverdue: boolean;
  isUrgent: boolean;
  isApproaching: boolean;
  deadline: string;
}

// ============= ALERT TYPES =============

export interface SystemAlert {
  _id: string;
  projectId: string;
  alertType: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  targetUserId?: string;
  isResolved: boolean;
  resolvedAt?: number;
  resolvedBy?: string;
  resolutionNotes?: string;
  notificationsSent: string[];
  escalationLevel: number;
  nextEscalationAt?: number;
  metadata?: any;
  _creationTime: number;
}

export interface AlertEscalationRules {
  low: { escalateAfterHours: number };
  medium: { escalateAfterHours: number };
  high: { escalateAfterHours: number };
  critical: { escalateAfterHours: number };
}

// ============= CONFIGURATION TYPES =============

export interface MonitoringConfig {
  _id: string;
  projectType: string;
  configKey: string;
  configValue: any;
  isActive: boolean;
  description?: string;
}

export interface ProjectTypeConfig {
  progressReportFrequency: {
    days: number;
    required: boolean;
  };
  reminderSchedule: {
    days: number[];
  };
  impactThresholds: {
    [metricName: string]: {
      min: number;
      max: number;
    };
  };
  photoRequirements: {
    minimumCount: number;
    requiredTypes: string[];
    maxFileSizeMB: number;
  };
}

export interface NotificationPreferences {
  email: boolean;
  sms: {
    criticalOnly: boolean;
  };
  inApp: boolean;
  maxDailyAlerts: number;
}

// ============= ANALYTICS TYPES =============

export interface ProjectProgressScore {
  overallScore: number;
  breakdown: {
    timeline: number;
    updateFrequency: number;
    impact: number;
    quality: number;
  };
  factors: {
    totalUpdates: number;
    completedMilestones: number;
    totalMilestones: number;
    daysActive: number;
  };
}

export interface CreditPotential {
  estimatedCredits: number;
  actualCredits: number;
  efficiency: number;
  projectedFinal: number;
  variance: number;
  status: 'excellent' | 'good' | 'acceptable' | 'concerning' | 'poor';
}

export interface ProgressTrend {
  trend: 'improving' | 'declining' | 'stable' | 'insufficient_data';
  slope: number;
  correlation: number;
  prediction?: {
    daysToComplete: number;
    estimatedCompletionDate: string;
    confidence: number;
  };
  dataPoints: number;
  averageProgressPerUpdate: number;
}

export interface ProjectComparison {
  comparison:
    | 'above_average'
    | 'below_average'
    | 'average'
    | 'no_similar_projects'
    | 'no_comparable_data';
  percentile?: number;
  currentScore: number;
  benchmark?: {
    average: number;
    maximum: number;
    minimum: number;
    sampleSize: number;
  };
  deviation?: number;
}

// ============= PERMISSION TYPES =============

export type MonitoringPermission =
  | 'view_all_projects'
  | 'monitor_all_projects'
  | 'manage_alerts'
  | 'resolve_any_alert'
  | 'view_system_analytics'
  | 'manage_monitoring_config'
  | 'escalate_alerts'
  | 'send_notifications'
  | 'generate_reports'
  | 'view_audit_logs'
  | 'view_assigned_projects'
  | 'monitor_assigned_projects'
  | 'create_verification_alerts'
  | 'resolve_verification_alerts'
  | 'view_project_analytics'
  | 'generate_verification_reports'
  | 'view_own_projects'
  | 'monitor_own_projects'
  | 'resolve_project_alerts'
  | 'submit_progress_updates'
  | 'respond_to_alerts'
  | 'view_purchased_projects'
  | 'monitor_purchased_projects'
  | 'view_impact_reports'
  | 'generate_impact_certificates'
  | 'view_buyer_analytics';

export interface MonitoringAccessLevel {
  level: 'admin' | 'verifier' | 'project_creator' | 'credit_buyer' | 'none';
  permissions: MonitoringPermission[];
  userId: string;
  canViewSystemAnalytics: boolean;
  canManageConfig: boolean;
  canEscalateAlerts: boolean;
}

// ============= REPORT TYPES =============

export interface DailyMonitoringReport {
  date: string;
  totalProjectsMonitored: number;
  alertsGenerated: number;
  alertsByType: Record<AlertType, number>;
  alertsBySeverity: Record<AlertSeverity, number>;
  overdueProjects: number;
  completedMilestones: number;
  avgProjectScore: number;
}

export interface WeeklyAnalytics {
  period: {
    start: string;
    end: string;
  };
  activeProjects: number;
  alertsGenerated: number;
  progressUpdates: number;
  completionRate: number;
  avgResponseTime: number;
  topIssues: {
    type: AlertType;
    count: number;
    avgResolutionTime: number;
  }[];
}

export interface ProjectReport {
  projectId: string;
  projectTitle: string;
  reportType: 'progress' | 'impact' | 'compliance';
  generatedAt: string;
  generatedBy: string;

  summary: {
    overallProgress: number;
    milestonesCompleted: number;
    totalMilestones: number;
    daysActive: number;
    nextDeadline?: string;
  };

  progressData: {
    updates: number;
    lastUpdateDate: string;
    impactMetrics: Record<string, number>;
    photos: number;
  };

  alerts: {
    active: number;
    resolved: number;
    byType: Record<AlertType, number>;
  };

  performance: ProjectProgressScore;
  trends: ProgressTrend;
}

// ============= API RESPONSE TYPES =============

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============= MONITORING DASHBOARD TYPES =============

export interface DashboardStats {
  activeProjects: number;
  totalAlerts: number;
  criticalAlerts: number;
  overdueReports: number;
  completedMilestones: number;
  avgProjectScore: number;
  recentActivity: {
    type: 'alert' | 'update' | 'milestone' | 'resolution';
    timestamp: number;
    description: string;
    projectId: string;
  }[];
}

export interface ProjectCard {
  _id: string;
  title: string;
  projectType: string;
  status: string;
  creatorName: string;
  progressPercentage: number;
  nextMilestone?: {
    title: string;
    dueDate: string;
    daysUntil: number;
  };
  activeAlerts: number;
  lastUpdate?: string;
  score: number;
  impactToDate: number;
}

// ============= UTILITY TYPES =============

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score?: number;
}

export interface TimelineInfo {
  days: number;
  isOverdue: boolean;
  isUrgent: boolean;
  isApproaching: boolean;
  deadline: string;
}

export interface MetricThreshold {
  min: number;
  max: number;
}

export interface ThresholdValidation {
  valid: boolean;
  message: string;
  severity?: AlertSeverity;
}

// ============= EXPORT TYPES =============

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'json';
  dateRange: {
    start: string;
    end: string;
  };
  includePhotos: boolean;
  includeCharts: boolean;
  sections: string[];
}

export interface ExportResult {
  success: boolean;
  downloadUrl?: string;
  error?: string;
  fileSize?: number;
  expiresAt?: string;
}
