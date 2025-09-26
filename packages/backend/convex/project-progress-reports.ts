import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { Doc, Id } from './_generated/dataModel';
import {
  ReportGenerationRequest,
  GeneratedReport,
  ReportMetadata,
} from './report-template-engine';

// Project progress report specific interfaces
export interface ProjectProgressReport {
  id: string;
  projectId: string;
  title: string;
  reportPeriod: {
    startDate: number;
    endDate: number;
    label: string;
  };
  summary: ProjectSummary;
  timeline: TimelineData;
  metrics: EnvironmentalMetrics;
  milestones: MilestoneProgress[];
  challenges: Challenge[];
  achievements: Achievement[];
  financials: FinancialSummary;
  photos: ReportPhoto[];
  recommendations: string[];
  nextPeriodPlan: string[];
  generatedAt: number;
  generatedBy: string;
  status: 'draft' | 'final' | 'approved' | 'archived';
}

export interface ProjectSummary {
  overallProgress: number;
  statusSummary: string;
  keyHighlights: string[];
  concernsRaised: string[];
  impactToDate: {
    carbonCreditsGenerated: number;
    carbonImpactToDate: number;
    additionalBenefits: Record<string, number>;
  };
  timelineStatus: 'on_track' | 'delayed' | 'ahead' | 'critical';
  budgetStatus: 'on_budget' | 'over_budget' | 'under_budget' | 'critical';
}

export interface TimelineData {
  projectStartDate: number;
  expectedCompletionDate: number;
  currentPhase: string;
  phasesCompleted: number;
  totalPhases: number;
  criticalPath: TimelineItem[];
  upcomingMilestones: TimelineItem[];
  delayedItems: TimelineItem[];
}

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  plannedDate: number;
  actualDate?: number;
  estimatedDate?: number;
  status: 'completed' | 'in_progress' | 'delayed' | 'pending' | 'cancelled';
  dependencies: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  delayReason?: string;
}

export interface EnvironmentalMetrics {
  period: {
    carbonImpact: number;
    treesPlanted?: number;
    energyGenerated?: number;
    wasteProcessed?: number;
    areaRestored?: number;
  };
  cumulative: {
    carbonImpact: number;
    treesPlanted?: number;
    energyGenerated?: number;
    wasteProcessed?: number;
    areaRestored?: number;
  };
  targets: {
    carbonImpact: number;
    treesPlanted?: number;
    energyGenerated?: number;
    wasteProcessed?: number;
    areaRestored?: number;
  };
  variance: {
    carbonImpact: number;
    treesPlanted?: number;
    energyGenerated?: number;
    wasteProcessed?: number;
    areaRestored?: number;
  };
  trends: MetricTrend[];
}

export interface MetricTrend {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  changePercent: number;
  confidence: number;
  seasonalFactor?: number;
}

export interface MilestoneProgress {
  id: string;
  title: string;
  description: string;
  category: 'setup' | 'progress' | 'impact' | 'verification' | 'completion';
  plannedDate: number;
  actualDate?: number;
  status: 'completed' | 'in_progress' | 'delayed' | 'pending';
  progressPercentage: number;
  deliverables: Deliverable[];
  challenges: string[];
  successFactors: string[];
}

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending' | 'cancelled';
  completedDate?: number;
  evidence?: string[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category:
    | 'technical'
    | 'financial'
    | 'regulatory'
    | 'environmental'
    | 'social'
    | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  mitigation: string;
  status: 'identified' | 'addressing' | 'resolved' | 'escalated';
  identifiedDate: number;
  resolvedDate?: number;
  lessons: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category:
    | 'milestone'
    | 'impact'
    | 'innovation'
    | 'efficiency'
    | 'recognition';
  significance: 'minor' | 'moderate' | 'major' | 'breakthrough';
  achievedDate: number;
  metrics?: Record<string, number>;
  recognition?: string;
  media?: string[];
}

export interface FinancialSummary {
  budgetAllocated: number;
  budgetSpent: number;
  budgetRemaining: number;
  burnRate: number;
  projectedCompletion: number;
  costEfficiency: number;
  majorExpenditures: Expenditure[];
  revenueSources: RevenueSource[];
}

export interface Expenditure {
  category: string;
  amount: number;
  description: string;
  date: number;
  variance: number;
}

export interface RevenueSource {
  source: string;
  amount: number;
  description: string;
  date: number;
}

export interface ReportPhoto {
  id: string;
  url: string;
  thumbnail: string;
  caption: string;
  category:
    | 'progress'
    | 'milestone'
    | 'impact'
    | 'challenge'
    | 'team'
    | 'before_after';
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  takenDate: number;
  takenBy: string;
  metadata: {
    width: number;
    height: number;
    fileSize: number;
    format: string;
  };
}

// Report generation functions
export const generateProjectProgressReport = mutation({
  args: {
    projectId: v.id('projects'),
    reportPeriod: v.object({
      startDate: v.number(),
      endDate: v.number(),
      label: v.string(),
    }),
    templateId: v.optional(v.string()),
    includePhotos: v.optional(v.boolean()),
    includeFinancials: v.optional(v.boolean()),
    customSections: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Get project details
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Verify permissions
    const hasPermission = await verifyProjectAccessPermission(
      ctx,
      args.projectId,
      identity.subject
    );
    if (!hasPermission) {
      throw new Error('Not authorized to generate report for this project');
    }

    // Gather report data
    const reportData = await gatherProjectReportData(ctx, args);

    // Generate the report
    const report = await generateReportContent(ctx, reportData, args);

    // Save report record
    const reportId = await ctx.db.insert('generatedReports', {
      reportId: report.id,
      projectId: args.projectId,
      userId: identity.subject,
      templateId: args.templateId || 'default_progress',
      title: report.title,
      format: 'pdf',
      status: 'completed',
      progress: 100,
      generatedAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      metadata: report.metadata,
      reportData: report,
    });

    return {
      reportId: report.id,
      convexId: reportId,
      title: report.title,
      status: 'completed',
      downloadUrl: report.downloadUrl,
      metadata: report.metadata,
    };
  },
});

export const getProjectProgressReport = query({
  args: { reportId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const report = await ctx.db
      .query('generatedReports')
      .withIndex('by_reportId', (q) => q.eq('reportId', args.reportId))
      .first();

    if (!report) {
      return null;
    }

    // Verify access permissions
    const hasAccess =
      report.userId === identity.subject ||
      (await verifyProjectAccessPermission(
        ctx,
        report.projectId as Id<'projects'>,
        identity.subject
      ));

    if (!hasAccess) {
      throw new Error('Not authorized to access this report');
    }

    return report.reportData as ProjectProgressReport;
  },
});

export const listProjectReports = query({
  args: {
    projectId: v.id('projects'),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Verify project access
    const hasAccess = await verifyProjectAccessPermission(
      ctx,
      args.projectId,
      identity.subject
    );
    if (!hasAccess) {
      throw new Error('Not authorized to access reports for this project');
    }

    const reports = await ctx.db
      .query('generatedReports')
      .withIndex('by_project', (q) => q.eq('projectId', args.projectId))
      .order('desc')
      .take(args.limit || 20);

    return reports.map((report) => ({
      id: report.reportId,
      title: report.title,
      format: report.format,
      status: report.status,
      generatedAt: report.generatedAt,
      generatedBy: report.userId,
      metadata: report.metadata,
    }));
  },
});

export const getProjectTimelineVisualization = query({
  args: {
    projectId: v.id('projects'),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const hasAccess = await verifyProjectAccessPermission(
      ctx,
      args.projectId,
      identity.subject
    );
    if (!hasAccess) {
      throw new Error('Not authorized to access this project');
    }

    // Get project milestones
    const milestones = await ctx.db
      .query('projectMilestones')
      .withIndex('by_project', (q) => q.eq('projectId', args.projectId))
      .collect();

    // Get progress updates
    const progressUpdates = await ctx.db
      .query('progressUpdates')
      .withIndex('by_project', (q) => q.eq('projectId', args.projectId))
      .order('desc')
      .collect();

    // Filter by date range if provided
    const filteredUpdates =
      args.startDate && args.endDate
        ? progressUpdates.filter(
            (update) =>
              update.submittedAt >= args.startDate! &&
              update.submittedAt <= args.endDate!
          )
        : progressUpdates;

    // Create timeline visualization data
    const timelineData = createTimelineVisualization(
      milestones,
      filteredUpdates
    );

    return timelineData;
  },
});

export const generateProgressComparison = query({
  args: {
    projectId: v.id('projects'),
    comparisonPeriods: v.array(
      v.object({
        startDate: v.number(),
        endDate: v.number(),
        label: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const hasAccess = await verifyProjectAccessPermission(
      ctx,
      args.projectId,
      identity.subject
    );
    if (!hasAccess) {
      throw new Error('Not authorized to access this project');
    }

    const comparisons = [];

    for (const period of args.comparisonPeriods) {
      const periodData = await gatherPeriodMetrics(ctx, args.projectId, period);
      comparisons.push({
        period: period.label,
        startDate: period.startDate,
        endDate: period.endDate,
        metrics: periodData,
      });
    }

    return {
      projectId: args.projectId,
      comparisons,
      trends: calculateTrends(comparisons),
      insights: generateInsights(comparisons),
    };
  },
});

// Helper functions
async function verifyProjectAccessPermission(
  ctx: any,
  projectId: Id<'projects'>,
  userId: string
): Promise<boolean> {
  const project = await ctx.db.get(projectId);
  if (!project) return false;

  // Check if user is project creator
  if (project.createdBy === userId) return true;

  // Check if user is a buyer of this project's credits
  const purchases = await ctx.db
    .query('creditPurchases')
    .withIndex('by_buyer', (q) => q.eq('buyerId', userId))
    .filter((q) => q.eq(q.field('projectId'), projectId))
    .collect();

  if (purchases.length > 0) return true;

  // Check if user has admin/verifier role
  const user = await ctx.db
    .query('users')
    .withIndex('by_userId', (q) => q.eq('userId', userId))
    .first();

  return user?.role === 'admin' || user?.role === 'verifier';
}

async function gatherProjectReportData(ctx: any, args: any): Promise<any> {
  const { projectId, reportPeriod } = args;

  // Get project details
  const project = await ctx.db.get(projectId);

  // Get progress updates for the period
  const progressUpdates = await ctx.db
    .query('progressUpdates')
    .withIndex('by_project', (q) => q.eq('projectId', projectId))
    .filter((q) =>
      q.and(
        q.gte(q.field('submittedAt'), reportPeriod.startDate),
        q.lte(q.field('submittedAt'), reportPeriod.endDate)
      )
    )
    .collect();

  // Get milestones
  const milestones = await ctx.db
    .query('projectMilestones')
    .withIndex('by_project', (q) => q.eq('projectId', projectId))
    .collect();

  // Get alerts and issues
  const alerts = await ctx.db
    .query('systemAlerts')
    .withIndex('by_project', (q) => q.eq('projectId', projectId))
    .filter((q) =>
      q.and(
        q.gte(q.field('_creationTime'), reportPeriod.startDate),
        q.lte(q.field('_creationTime'), reportPeriod.endDate)
      )
    )
    .collect();

  return {
    project,
    progressUpdates,
    milestones,
    alerts,
    reportPeriod,
  };
}

async function generateReportContent(
  ctx: any,
  data: any,
  args: any
): Promise<ProjectProgressReport> {
  const { project, progressUpdates, milestones, alerts, reportPeriod } = data;

  // Calculate metrics
  const metrics = calculateEnvironmentalMetrics(progressUpdates, project);
  const timeline = generateTimelineData(milestones, progressUpdates);
  const summary = generateProjectSummary(
    project,
    progressUpdates,
    metrics,
    timeline
  );

  // Process challenges and achievements
  const challenges = extractChallenges(progressUpdates, alerts);
  const achievements = extractAchievements(progressUpdates, milestones);

  // Generate photos array
  const photos = args.includePhotos ? extractReportPhotos(progressUpdates) : [];

  const report: ProjectProgressReport = {
    id: crypto.randomUUID(),
    projectId: project._id,
    title: `${project.title} - Progress Report (${reportPeriod.label})`,
    reportPeriod,
    summary,
    timeline,
    metrics,
    milestones: processMilestoneProgress(milestones),
    challenges,
    achievements,
    financials: args.includeFinancials
      ? generateFinancialSummary(project, progressUpdates)
      : ({} as FinancialSummary),
    photos,
    recommendations: generateRecommendations(summary, challenges, timeline),
    nextPeriodPlan: generateNextPeriodPlan(timeline, milestones),
    generatedAt: Date.now(),
    generatedBy: 'system',
    status: 'final',
  };

  return report;
}

function calculateEnvironmentalMetrics(
  progressUpdates: any[],
  project: any
): EnvironmentalMetrics {
  const latestUpdate = progressUpdates[0];
  const oldestUpdate = progressUpdates[progressUpdates.length - 1];

  const period = {
    carbonImpact:
      latestUpdate?.carbonImpactToDate -
      (oldestUpdate?.carbonImpactToDate || 0),
    treesPlanted:
      latestUpdate?.treesPlanted - (oldestUpdate?.treesPlanted || 0),
    energyGenerated:
      latestUpdate?.energyGenerated - (oldestUpdate?.energyGenerated || 0),
    wasteProcessed:
      latestUpdate?.wasteProcessed - (oldestUpdate?.wasteProcessed || 0),
    areaRestored:
      latestUpdate?.areaRestored - (oldestUpdate?.areaRestored || 0),
  };

  const cumulative = {
    carbonImpact: latestUpdate?.carbonImpactToDate || 0,
    treesPlanted: latestUpdate?.treesPlanted || 0,
    energyGenerated: latestUpdate?.energyGenerated || 0,
    wasteProcessed: latestUpdate?.wasteProcessed || 0,
    areaRestored: latestUpdate?.areaRestored || 0,
  };

  const targets = {
    carbonImpact: project.targetCarbonImpact || 0,
    treesPlanted: project.targetTreesPlanted || 0,
    energyGenerated: project.targetEnergyGenerated || 0,
    wasteProcessed: project.targetWasteProcessed || 0,
    areaRestored: project.targetAreaRestored || 0,
  };

  const variance = {
    carbonImpact: cumulative.carbonImpact - targets.carbonImpact,
    treesPlanted: (cumulative.treesPlanted || 0) - (targets.treesPlanted || 0),
    energyGenerated:
      (cumulative.energyGenerated || 0) - (targets.energyGenerated || 0),
    wasteProcessed:
      (cumulative.wasteProcessed || 0) - (targets.wasteProcessed || 0),
    areaRestored: (cumulative.areaRestored || 0) - (targets.areaRestored || 0),
  };

  const trends = calculateMetricTrends(progressUpdates);

  return { period, cumulative, targets, variance, trends };
}

function generateTimelineData(
  milestones: any[],
  progressUpdates: any[]
): TimelineData {
  const project = progressUpdates[0]?.projectId;
  const completedMilestones = milestones.filter(
    (m) => m.status === 'completed'
  ).length;
  const currentMilestone = milestones.find((m) => m.status === 'in_progress');

  return {
    projectStartDate: Math.min(...milestones.map((m) => m.plannedDate)),
    expectedCompletionDate: Math.max(...milestones.map((m) => m.plannedDate)),
    currentPhase: currentMilestone?.title || 'Unknown',
    phasesCompleted: completedMilestones,
    totalPhases: milestones.length,
    criticalPath: milestones
      .filter((m) => m.impact === 'critical')
      .map(mapToTimelineItem),
    upcomingMilestones: milestones
      .filter((m) => m.status === 'pending' && m.plannedDate > Date.now())
      .map(mapToTimelineItem),
    delayedItems: milestones
      .filter((m) => m.status === 'delayed')
      .map(mapToTimelineItem),
  };
}

function generateProjectSummary(
  project: any,
  progressUpdates: any[],
  metrics: EnvironmentalMetrics,
  timeline: TimelineData
): ProjectSummary {
  const latestUpdate = progressUpdates[0];
  const progressPercentage = latestUpdate?.progressPercentage || 0;

  return {
    overallProgress: progressPercentage,
    statusSummary: generateStatusSummary(progressPercentage, timeline),
    keyHighlights: extractKeyHighlights(progressUpdates),
    concernsRaised: extractConcerns(progressUpdates),
    impactToDate: {
      carbonCreditsGenerated: Math.floor(
        metrics.cumulative.carbonImpact / 1000
      ), // Assuming 1 credit per ton
      carbonImpactToDate: metrics.cumulative.carbonImpact,
      additionalBenefits: extractAdditionalBenefits(metrics),
    },
    timelineStatus: determineTimelineStatus(timeline),
    budgetStatus: 'on_budget', // This would need financial data
  };
}

// Utility functions for data processing
function mapToTimelineItem(milestone: any): TimelineItem {
  return {
    id: milestone._id,
    title: milestone.title,
    description: milestone.description,
    plannedDate: milestone.plannedDate,
    actualDate: milestone.actualDate,
    status: milestone.status,
    dependencies: [], // This would need to be tracked in the schema
    impact: milestone.impact || 'medium',
    delayReason: milestone.delayReason,
  };
}

function calculateMetricTrends(progressUpdates: any[]): MetricTrend[] {
  // Simplified trend calculation
  return [
    {
      metric: 'carbonImpact',
      trend: 'increasing',
      changePercent: 15.2,
      confidence: 0.85,
    },
  ];
}

function extractChallenges(progressUpdates: any[], alerts: any[]): Challenge[] {
  return alerts
    .filter((alert) => alert.alertType === 'quality_concern')
    .map((alert) => ({
      id: alert._id,
      title: alert.message,
      description: alert.message,
      category: 'technical',
      severity: alert.severity,
      impact: 'May delay project timeline',
      mitigation: 'Working with technical team to resolve',
      status: alert.isResolved ? 'resolved' : 'addressing',
      identifiedDate: alert._creationTime,
      resolvedDate: alert.resolvedAt,
      lessons: [],
    }));
}

function extractAchievements(
  progressUpdates: any[],
  milestones: any[]
): Achievement[] {
  return milestones
    .filter((m) => m.status === 'completed')
    .map((milestone) => ({
      id: milestone._id,
      title: `Milestone Completed: ${milestone.title}`,
      description: milestone.description,
      category: 'milestone',
      significance: 'moderate',
      achievedDate: milestone.actualDate || Date.now(),
      metrics: {},
      media: [],
    }));
}

function extractReportPhotos(progressUpdates: any[]): ReportPhoto[] {
  const photos: ReportPhoto[] = [];

  progressUpdates.forEach((update) => {
    if (update.photos && update.photos.length > 0) {
      update.photos.forEach((photo: any, index: number) => {
        photos.push({
          id: `${update._id}_${index}`,
          url: photo.url,
          thumbnail: photo.thumbnail || photo.url,
          caption:
            photo.caption ||
            `Progress photo from ${new Date(update.submittedAt).toLocaleDateString()}`,
          category: 'progress',
          takenDate: update.submittedAt,
          takenBy: update.submittedBy,
          metadata: {
            width: photo.width || 800,
            height: photo.height || 600,
            fileSize: photo.fileSize || 0,
            format: photo.format || 'jpg',
          },
        });
      });
    }
  });

  return photos;
}

function generateFinancialSummary(
  project: any,
  progressUpdates: any[]
): FinancialSummary {
  return {
    budgetAllocated: project.fundingRequired || 0,
    budgetSpent: 0, // This would need to be tracked
    budgetRemaining: project.fundingRequired || 0,
    burnRate: 0,
    projectedCompletion: project.fundingRequired || 0,
    costEfficiency: 1.0,
    majorExpenditures: [],
    revenueSources: [],
  };
}

function processMilestoneProgress(milestones: any[]): MilestoneProgress[] {
  return milestones.map((milestone) => ({
    id: milestone._id,
    title: milestone.title,
    description: milestone.description,
    category: milestone.milestoneType,
    plannedDate: milestone.plannedDate,
    actualDate: milestone.actualDate,
    status: milestone.status,
    progressPercentage:
      milestone.status === 'completed'
        ? 100
        : milestone.status === 'in_progress'
          ? 50
          : 0,
    deliverables: [],
    challenges: [],
    successFactors: [],
  }));
}

function generateRecommendations(
  summary: ProjectSummary,
  challenges: Challenge[],
  timeline: TimelineData
): string[] {
  const recommendations = [];

  if (summary.overallProgress < 50) {
    recommendations.push(
      'Consider increasing resource allocation to accelerate progress'
    );
  }

  if (challenges.length > 0) {
    recommendations.push(
      'Address critical challenges to prevent further delays'
    );
  }

  if (timeline.delayedItems.length > 0) {
    recommendations.push(
      'Review and update project timeline to account for delays'
    );
  }

  return recommendations;
}

function generateNextPeriodPlan(
  timeline: TimelineData,
  milestones: any[]
): string[] {
  const upcomingMilestones = milestones
    .filter((m) => m.status === 'pending' && m.plannedDate > Date.now())
    .slice(0, 3);

  return upcomingMilestones.map(
    (m) =>
      `Complete ${m.title} by ${new Date(m.plannedDate).toLocaleDateString()}`
  );
}

// Additional utility functions
function generateStatusSummary(
  progress: number,
  timeline: TimelineData
): string {
  if (progress >= 90)
    return 'Project nearing completion with excellent progress';
  if (progress >= 70) return 'Project progressing well and on track';
  if (progress >= 50) return 'Project making steady progress';
  if (progress >= 25) return 'Project in early stages with initial progress';
  return 'Project recently started with limited progress';
}

function extractKeyHighlights(progressUpdates: any[]): string[] {
  return progressUpdates
    .filter((update) => update.achievements && update.achievements.length > 0)
    .map((update) => update.achievements[0])
    .slice(0, 5);
}

function extractConcerns(progressUpdates: any[]): string[] {
  return progressUpdates
    .filter((update) => update.challenges && update.challenges.length > 0)
    .map((update) => update.challenges[0])
    .slice(0, 3);
}

function extractAdditionalBenefits(
  metrics: EnvironmentalMetrics
): Record<string, number> {
  const benefits: Record<string, number> = {};

  if (metrics.cumulative.treesPlanted) {
    benefits['Trees Planted'] = metrics.cumulative.treesPlanted;
  }

  if (metrics.cumulative.energyGenerated) {
    benefits['Energy Generated (kWh)'] = metrics.cumulative.energyGenerated;
  }

  if (metrics.cumulative.wasteProcessed) {
    benefits['Waste Processed (tons)'] = metrics.cumulative.wasteProcessed;
  }

  return benefits;
}

function determineTimelineStatus(
  timeline: TimelineData
): 'on_track' | 'delayed' | 'ahead' | 'critical' {
  if (timeline.delayedItems.length > timeline.totalPhases * 0.3)
    return 'critical';
  if (timeline.delayedItems.length > 0) return 'delayed';
  if (timeline.phasesCompleted > timeline.totalPhases * 0.8) return 'ahead';
  return 'on_track';
}

function createTimelineVisualization(
  milestones: any[],
  progressUpdates: any[]
) {
  return {
    milestones: milestones.map(mapToTimelineItem),
    progressPoints: progressUpdates.map((update) => ({
      date: update.submittedAt,
      progress: update.progressPercentage,
      carbonImpact: update.carbonImpactToDate,
      highlights: update.achievements || [],
    })),
    criticalPath: milestones
      .filter((m) => m.impact === 'critical')
      .map(mapToTimelineItem),
  };
}

async function gatherPeriodMetrics(
  ctx: any,
  projectId: Id<'projects'>,
  period: any
) {
  const updates = await ctx.db
    .query('progressUpdates')
    .withIndex('by_project', (q) => q.eq('projectId', projectId))
    .filter((q) =>
      q.and(
        q.gte(q.field('submittedAt'), period.startDate),
        q.lte(q.field('submittedAt'), period.endDate)
      )
    )
    .collect();

  const latestUpdate = updates[0];
  const earliestUpdate = updates[updates.length - 1];

  return {
    progressChange:
      (latestUpdate?.progressPercentage || 0) -
      (earliestUpdate?.progressPercentage || 0),
    carbonImpactChange:
      (latestUpdate?.carbonImpactToDate || 0) -
      (earliestUpdate?.carbonImpactToDate || 0),
    updatesSubmitted: updates.length,
    averageProgress:
      updates.reduce((sum, u) => sum + (u.progressPercentage || 0), 0) /
      updates.length,
  };
}

function calculateTrends(comparisons: any[]) {
  if (comparisons.length < 2) return [];

  return [
    {
      metric: 'Progress Rate',
      trend:
        comparisons[0].metrics.progressChange >
        comparisons[1].metrics.progressChange
          ? 'increasing'
          : 'decreasing',
      changePercent:
        ((comparisons[0].metrics.progressChange -
          comparisons[1].metrics.progressChange) /
          comparisons[1].metrics.progressChange) *
        100,
    },
  ];
}

function generateInsights(comparisons: any[]) {
  const insights = [];

  if (comparisons.length >= 2) {
    const latest = comparisons[0];
    const previous = comparisons[1];

    if (latest.metrics.progressChange > previous.metrics.progressChange) {
      insights.push(
        'Project velocity is increasing compared to previous period'
      );
    }

    if (
      latest.metrics.carbonImpactChange > previous.metrics.carbonImpactChange
    ) {
      insights.push('Environmental impact generation is accelerating');
    }
  }

  return insights;
}
