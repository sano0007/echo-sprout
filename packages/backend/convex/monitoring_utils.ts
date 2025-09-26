import { query } from './_generated/server';
import { v } from 'convex/values';

/**
 * MONITORING & TRACKING SYSTEM - UTILITIES & HELPERS
 *
 * This module provides utility functions and helpers for the monitoring system:
 * - Data validation and sanitization
 * - Metric calculations and analysis
 * - Date/time utilities
 * - Format conversion helpers
 * - Statistical analysis functions
 */

// ============= DATA VALIDATION UTILITIES =============

/**
 * Validate progress update data structure
 */
export const validateProgressUpdate = query({
  args: {
    updateData: v.any(),
  },
  handler: async (ctx, { updateData }) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!updateData.title || updateData.title.trim().length === 0) {
      errors.push('Title is required and cannot be empty');
    }

    if (!updateData.description || updateData.description.trim().length === 0) {
      errors.push('Description is required and cannot be empty');
    }

    if (typeof updateData.progressPercentage !== 'number') {
      errors.push('Progress percentage must be a number');
    } else if (
      updateData.progressPercentage < 0 ||
      updateData.progressPercentage > 100
    ) {
      errors.push('Progress percentage must be between 0 and 100');
    }

    // Photo validation
    if (
      !updateData.photos ||
      !Array.isArray(updateData.photos) ||
      updateData.photos.length === 0
    ) {
      warnings.push('No photos provided - visual evidence is recommended');
    }

    // Impact metrics validation
    if (updateData.carbonImpactToDate && updateData.carbonImpactToDate < 0) {
      errors.push('Carbon impact cannot be negative');
    }

    if (updateData.treesPlanted && updateData.treesPlanted < 0) {
      errors.push('Trees planted count cannot be negative');
    }

    if (updateData.energyGenerated && updateData.energyGenerated < 0) {
      errors.push('Energy generated cannot be negative');
    }

    // Title and description length validation
    if (updateData.title && updateData.title.length > 200) {
      warnings.push(
        'Title is very long - consider shortening for better readability'
      );
    }

    if (updateData.description && updateData.description.length > 2000) {
      warnings.push(
        'Description is very long - consider breaking into multiple updates'
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: calculateValidationScore(errors.length, warnings.length),
    };
  },
});

/**
 * Validate environmental impact metrics
 */
export const validateImpactMetrics = query({
  args: {
    projectType: v.string(),
    metrics: v.any(),
  },
  handler: async (ctx, { projectType, metrics }) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Get project-specific thresholds
    const config = await ctx.db
      .query('monitoringConfig')
      .withIndex('by_project_type_key', (q) =>
        q.eq('projectType', projectType).eq('configKey', 'impact_thresholds')
      )
      .filter((q) => q.eq(q.field('isActive'), true))
      .unique();

    let configValue = {};
    if (config) {
      configValue = config.configValue;
    } else {
      // Try to get global config
      const globalConfig = await ctx.db
        .query('monitoringConfig')
        .withIndex('by_project_type_key', (q) =>
          q.eq('projectType', 'all').eq('configKey', 'impact_thresholds')
        )
        .filter((q) => q.eq(q.field('isActive'), true))
        .unique();

      configValue = globalConfig ? globalConfig.configValue : {};
    }

    const thresholds: any = configValue || {};

    // Validate each metric against thresholds
    for (const [metricName, value] of Object.entries(metrics)) {
      if (typeof value !== 'number') {
        continue; // Skip non-numeric values
      }

      const threshold = thresholds[metricName];
      if (!threshold) {
        warnings.push(`No threshold defined for metric: ${metricName}`);
        continue;
      }

      if (value < threshold.min) {
        errors.push(
          `${metricName} value ${value} is below minimum threshold of ${threshold.min}`
        );
      } else if (value > threshold.max) {
        errors.push(
          `${metricName} value ${value} exceeds maximum threshold of ${threshold.max}`
        );
      } else if (value < threshold.min * 1.2) {
        warnings.push(
          `${metricName} value ${value} is close to minimum threshold`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metricsCount: Object.keys(metrics).length,
    };
  },
});

// ============= METRIC CALCULATIONS =============

/**
 * Calculate project progress score based on multiple factors
 */
export const calculateProjectProgressScore = query({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get recent progress updates
    const recentUpdates = await ctx.db
      .query('progressUpdates')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .order('desc')
      .take(10);

    // Get project milestones
    const milestones = await ctx.db
      .query('projectMilestones')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .collect();

    // Calculate various score components
    const timelineScore = calculateTimelineCompliance(project, milestones);
    const updateFrequencyScore = calculateUpdateFrequency(recentUpdates);
    const impactScore = calculateImpactAchievement(recentUpdates, project);
    const qualityScore = calculateUpdateQuality(recentUpdates);

    // Weighted overall score
    const overallScore = Math.round(
      timelineScore * 0.3 +
        updateFrequencyScore * 0.2 +
        impactScore * 0.3 +
        qualityScore * 0.2
    );

    return {
      overallScore: Math.max(0, Math.min(100, overallScore)),
      breakdown: {
        timeline: timelineScore,
        updateFrequency: updateFrequencyScore,
        impact: impactScore,
        quality: qualityScore,
      },
      factors: {
        totalUpdates: recentUpdates.length,
        completedMilestones: milestones.filter((m) => m.status === 'completed')
          .length,
        totalMilestones: milestones.length,
        daysActive: Math.floor(
          (Date.now() - new Date(project.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      },
    };
  },
});

/**
 * Calculate carbon credit potential based on current progress
 */
export const calculateCreditPotential = query({
  args: {
    projectId: v.id('projects'),
    currentProgress: v.number(),
  },
  handler: async (ctx, { projectId, currentProgress }) => {
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get latest impact metrics
    const latestUpdate = await ctx.db
      .query('progressUpdates')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .order('desc')
      .first();

    const progressRatio = Math.min(currentProgress / 100, 1);
    const estimatedCredits = project.totalCarbonCredits * progressRatio;

    // Calculate based on actual impact if available
    let actualCredits = 0;
    if (latestUpdate?.carbonImpactToDate) {
      actualCredits = latestUpdate.carbonImpactToDate;
    }

    // Calculate efficiency ratio
    const efficiency = actualCredits > 0 ? actualCredits / estimatedCredits : 1;

    return {
      estimatedCredits: Math.round(estimatedCredits * 100) / 100,
      actualCredits: Math.round(actualCredits * 100) / 100,
      efficiency: Math.round(efficiency * 100) / 100,
      projectedFinal:
        Math.round(project.totalCarbonCredits * efficiency * 100) / 100,
      variance: Math.round((efficiency - 1) * 100 * 100) / 100, // percentage variance
      status: getEfficiencyStatus(efficiency),
    };
  },
});

// ============= TIME AND DATE UTILITIES =============

/**
 * Calculate days until deadline
 */
export const calculateDaysUntilDeadline = query({
  args: {
    deadline: v.string(),
  },
  handler: async (ctx, { deadline }) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      days: diffDays,
      isOverdue: diffDays < 0,
      isUrgent: diffDays <= 3 && diffDays >= 0,
      isApproaching: diffDays <= 7 && diffDays > 3,
      deadline: deadlineDate.toISOString(),
    };
  },
});

/**
 * Get next milestone deadline for project
 */
export const getNextMilestoneDeadline = query({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, { projectId }) => {
    const upcomingMilestones = await ctx.db
      .query('projectMilestones')
      .withIndex('by_project_status', (q) =>
        q.eq('projectId', projectId).eq('status', 'pending')
      )
      .order('asc') // Order by plannedDate
      .collect();

    if (upcomingMilestones.length === 0) {
      return null;
    }

    const nextMilestone = upcomingMilestones.sort(
      (a, b) => a.plannedDate - b.plannedDate
    )[0];

    const deadlineDate = new Date(nextMilestone.plannedDate);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const daysUntil = {
      days: diffDays,
      isOverdue: diffDays < 0,
      isUrgent: diffDays <= 3 && diffDays >= 0,
      isApproaching: diffDays <= 7 && diffDays > 3,
      deadline: deadlineDate.toISOString(),
    };

    return {
      milestone: nextMilestone,
      ...daysUntil,
    };
  },
});

// ============= DATA ANALYSIS UTILITIES =============

/**
 * Analyze progress trends for a project
 */
export const analyzeProgressTrends = query({
  args: {
    projectId: v.id('projects'),
    days: v.optional(v.number()),
  },
  handler: async (ctx, { projectId, days = 90 }) => {
    const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000;

    const updates = await ctx.db
      .query('progressUpdates')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .filter((q) => q.gte(q.field('reportingDate'), cutoffDate))
      .order('asc')
      .collect();

    if (updates.length < 2) {
      return {
        trend: 'insufficient_data',
        slope: 0,
        correlation: 0,
        prediction: null,
      };
    }

    // Calculate progress trend
    const progressData = updates.map((update, index) => ({
      x: index,
      y: update.progressPercentage,
      date: update.reportingDate,
    }));

    const trend = calculateLinearTrend(progressData);

    // Predict completion date if trend continues
    const currentProgress = progressData[progressData.length - 1].y;
    const remainingProgress = 100 - currentProgress;
    const daysPerPercent =
      trend.slope > 0 ? days / updates.length / trend.slope : null;
    const predictedDaysToComplete = daysPerPercent
      ? remainingProgress * daysPerPercent
      : null;

    return {
      trend:
        trend.slope > 0.1
          ? 'improving'
          : trend.slope < -0.1
            ? 'declining'
            : 'stable',
      slope: Math.round(trend.slope * 100) / 100,
      correlation: Math.round(trend.correlation * 100) / 100,
      prediction: predictedDaysToComplete
        ? {
            daysToComplete: Math.round(predictedDaysToComplete),
            estimatedCompletionDate: new Date(
              Date.now() + predictedDaysToComplete * 24 * 60 * 60 * 1000
            ).toISOString(),
            confidence: Math.abs(trend.correlation),
          }
        : null,
      dataPoints: updates.length,
      averageProgressPerUpdate:
        Math.round((currentProgress / updates.length) * 100) / 100,
    };
  },
});

/**
 * Compare project performance against similar projects
 */
export const compareProjectPerformance = query({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, { projectId }) => {
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get similar projects (same type, similar size)
    const similarProjects = await ctx.db
      .query('projects')
      .withIndex('by_type', (q) => q.eq('projectType', project.projectType))
      .filter((q) =>
        q.and(
          q.neq(q.field('_id'), projectId),
          q.or(
            q.eq(q.field('status'), 'active'),
            q.eq(q.field('status'), 'completed')
          ),
          q.gte(q.field('areaSize'), project.areaSize * 0.5),
          q.lte(q.field('areaSize'), project.areaSize * 2)
        )
      )
      .take(10);

    if (similarProjects.length === 0) {
      return {
        comparison: 'no_similar_projects',
        percentile: null,
        benchmark: null,
      };
    }

    // Calculate scores for all projects
    // Get recent progress updates for the main project
    const recentUpdates = await ctx.db
      .query('progressUpdates')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .order('desc')
      .take(10);

    // Get project milestones for the main project
    const milestones = await ctx.db
      .query('projectMilestones')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .collect();

    // Calculate various score components
    const timelineScore = calculateTimelineCompliance(project, milestones);
    const updateFrequencyScore = calculateUpdateFrequency(recentUpdates);
    const impactScore = calculateImpactAchievement(recentUpdates, project);
    const qualityScore = calculateUpdateQuality(recentUpdates);

    // Weighted overall score
    const overallScore = Math.round(
      timelineScore * 0.3 +
        updateFrequencyScore * 0.2 +
        impactScore * 0.3 +
        qualityScore * 0.2
    );

    const projectScore = {
      overallScore: Math.max(0, Math.min(100, overallScore)),
      breakdown: {
        timeline: timelineScore,
        updateFrequency: updateFrequencyScore,
        impact: impactScore,
        quality: qualityScore,
      },
      factors: {
        totalUpdates: recentUpdates.length,
        completedMilestones: milestones.filter((m) => m.status === 'completed')
          .length,
        totalMilestones: milestones.length,
        daysActive: Math.floor(
          (Date.now() - new Date(project.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      },
    };

    const similarScores = [];
    for (const similarProject of similarProjects) {
      try {
        // Get recent progress updates for similar project
        const similarUpdates = await ctx.db
          .query('progressUpdates')
          .withIndex('by_project', (q) => q.eq('projectId', similarProject._id))
          .order('desc')
          .take(10);

        // Get project milestones for similar project
        const similarMilestones = await ctx.db
          .query('projectMilestones')
          .withIndex('by_project', (q) => q.eq('projectId', similarProject._id))
          .collect();

        // Calculate score components
        const timelineScore = calculateTimelineCompliance(similarProject, similarMilestones);
        const updateFrequencyScore = calculateUpdateFrequency(similarUpdates);
        const impactScore = calculateImpactAchievement(similarUpdates, similarProject);
        const qualityScore = calculateUpdateQuality(similarUpdates);

        // Weighted overall score
        const overallScore = Math.round(
          timelineScore * 0.3 +
            updateFrequencyScore * 0.2 +
            impactScore * 0.3 +
            qualityScore * 0.2
        );

        similarScores.push(Math.max(0, Math.min(100, overallScore)));
      } catch (error) {
        // Skip projects that can't be scored
        continue;
      }
    }

    if (similarScores.length === 0) {
      return {
        comparison: 'no_comparable_data',
        percentile: null,
        benchmark: null,
      };
    }

    // Calculate percentile ranking
    const betterThan = similarScores.filter(
      (score) => projectScore.overallScore > score
    ).length;
    const percentile = Math.round((betterThan / similarScores.length) * 100);

    // Calculate benchmark statistics
    const averageScore =
      similarScores.reduce((sum, score) => sum + score, 0) /
      similarScores.length;
    const maxScore = Math.max(...similarScores);
    const minScore = Math.min(...similarScores);

    return {
      comparison:
        projectScore.overallScore > averageScore
          ? 'above_average'
          : projectScore.overallScore < averageScore
            ? 'below_average'
            : 'average',
      percentile,
      currentScore: projectScore.overallScore,
      benchmark: {
        average: Math.round(averageScore),
        maximum: maxScore,
        minimum: minScore,
        sampleSize: similarScores.length,
      },
      deviation: Math.round(projectScore.overallScore - averageScore),
    };
  },
});

// ============= HELPER FUNCTIONS =============

/**
 * Calculate validation score based on errors and warnings
 */
function calculateValidationScore(
  errorCount: number,
  warningCount: number
): number {
  const baseScore = 100;
  const errorPenalty = errorCount * 20;
  const warningPenalty = warningCount * 5;

  return Math.max(0, baseScore - errorPenalty - warningPenalty);
}

/**
 * Calculate timeline compliance score
 */
function calculateTimelineCompliance(project: any, milestones: any[]): number {
  if (milestones.length === 0) return 80; // Default score if no milestones

  const now = Date.now();
  const projectStart = new Date(project.startDate).getTime();
  const projectEnd = new Date(project.expectedCompletionDate).getTime();

  // Calculate expected progress based on time elapsed
  const timeElapsed = now - projectStart;
  const totalTime = projectEnd - projectStart;
  const expectedProgress = Math.min((timeElapsed / totalTime) * 100, 100);

  // Count completed milestones vs expected
  const completedMilestones = milestones.filter(
    (m) => m.status === 'completed'
  ).length;
  const totalMilestones = milestones.length;
  const milestoneProgress = (completedMilestones / totalMilestones) * 100;

  // Calculate compliance score
  const timeDifference = Math.abs(milestoneProgress - expectedProgress);
  return Math.max(0, 100 - timeDifference);
}

/**
 * Calculate update frequency score
 */
function calculateUpdateFrequency(updates: any[]): number {
  if (updates.length === 0) return 0;

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentUpdates = updates.filter((u) => u.reportingDate >= thirtyDaysAgo);

  // Expect at least 1 update per month for full score
  const expectedUpdates = 1;
  const score = Math.min((recentUpdates.length / expectedUpdates) * 100, 100);

  return Math.round(score);
}

/**
 * Calculate impact achievement score
 */
function calculateImpactAchievement(updates: any[], project: any): number {
  const latestUpdate = updates[0];
  if (!latestUpdate || !latestUpdate.carbonImpactToDate) return 50; // Default score

  const expectedImpact = project.estimatedCO2Reduction;
  const actualImpact = latestUpdate.carbonImpactToDate;

  if (expectedImpact === 0) return 50;

  const ratio = actualImpact / expectedImpact;
  return Math.min(ratio * 100, 100);
}

/**
 * Calculate update quality score
 */
function calculateUpdateQuality(updates: any[]): number {
  if (updates.length === 0) return 0;

  let totalScore = 0;

  for (const update of updates) {
    let score = 0;

    // Check for required elements
    if (update.description && update.description.length > 50) score += 20;
    if (update.photos && update.photos.length > 0) score += 20;
    if (
      update.carbonImpactToDate ||
      update.treesPlanted ||
      update.energyGenerated
    )
      score += 30;
    if (update.location) score += 15;
    if (update.progressPercentage >= 0) score += 15;

    totalScore += score;
  }

  return Math.round(totalScore / updates.length);
}

/**
 * Get efficiency status based on ratio
 */
function getEfficiencyStatus(efficiency: number): string {
  if (efficiency >= 1.2) return 'excellent';
  if (efficiency >= 1.0) return 'good';
  if (efficiency >= 0.8) return 'acceptable';
  if (efficiency >= 0.6) return 'concerning';
  return 'poor';
}

/**
 * Calculate linear trend from data points
 */
function calculateLinearTrend(data: { x: number; y: number }[]) {
  const n = data.length;
  const sumX = data.reduce((sum, point) => sum + point.x, 0);
  const sumY = data.reduce((sum, point) => sum + point.y, 0);
  const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate correlation coefficient
  const meanX = sumX / n;
  const meanY = sumY / n;

  const numerator = data.reduce(
    (sum, point) => sum + (point.x - meanX) * (point.y - meanY),
    0
  );
  const denomX = Math.sqrt(
    data.reduce((sum, point) => sum + Math.pow(point.x - meanX, 2), 0)
  );
  const denomY = Math.sqrt(
    data.reduce((sum, point) => sum + Math.pow(point.y - meanY, 2), 0)
  );

  const correlation = denomX * denomY === 0 ? 0 : numerator / (denomX * denomY);

  return { slope, intercept, correlation };
}

// Export internal functions for use by other modules
export const monitoringUtilsInternal = {
  calculateDaysUntilDeadline,
  calculateProjectProgressScore,
  validateProgressUpdate,
  validateImpactMetrics,
};
