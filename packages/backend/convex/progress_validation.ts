import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { CloudinaryService } from '../services/cloudinary-service';
import type {
  ProgressValidationResult,
  ImpactValidationResult,
} from '../types/monitoring-types';

/**
 * PROGRESS VALIDATION ENGINE
 *
 * This module provides comprehensive validation for progress updates including:
 * - Impact metrics validation with project-specific thresholds
 * - Anomaly detection for unusual progress patterns
 * - Photo evidence validation
 * - Timeline consistency checks
 * - Data quality scoring
 */

// ============= CORE VALIDATION FUNCTIONS =============

/**
 * Comprehensive progress update validation
 */
export const validateCompleteProgressUpdate = query({
  args: {
    projectId: v.id('projects'),
    updateData: v.any(),
    validatePhotos: v.optional(v.boolean()),
    validateTimeline: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    { projectId, updateData, validatePhotos = true, validateTimeline = true }
  ) => {
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    let qualityScore = 100;

    // 1. Basic field validation
    const basicValidation = validateBasicFields(updateData);
    errors.push(...basicValidation.errors);
    warnings.push(...basicValidation.warnings);
    qualityScore -= basicValidation.penalties;

    // 2. Progress consistency validation
    const progressValidation = await validateProgressConsistency(
      ctx,
      projectId,
      updateData
    );
    errors.push(...progressValidation.errors);
    warnings.push(...progressValidation.warnings);
    qualityScore -= progressValidation.penalties;

    // 3. Impact metrics validation
    if (updateData.measurementData) {
      const metricsValidation = await validateImpactMetricsAdvancedHelper(
        ctx,
        project.projectType,
        updateData.measurementData,
        projectId,
        true
      );
      errors.push(...metricsValidation.errors);
      warnings.push(...metricsValidation.warnings);
      qualityScore -= metricsValidation.penalties;
    }

    // 4. Photo validation
    if (validatePhotos && updateData.photos) {
      const photoValidation = CloudinaryService.validatePhotoUpload(
        updateData.photos,
        project.projectType
      );
      errors.push(...photoValidation.errors);
      warnings.push(...photoValidation.warnings);
      qualityScore -=
        photoValidation.errors.length * 10 +
        photoValidation.warnings.length * 2;
    }

    // 5. Timeline validation
    if (validateTimeline) {
      const timelineValidation = await validateTimelineConsistency(
        ctx,
        projectId,
        updateData
      );
      warnings.push(...timelineValidation.warnings);
      qualityScore -= timelineValidation.penalties;
    }

    // 6. Anomaly detection
    const anomalyValidation = await detectProgressAnomaliesHelper(
      ctx,
      projectId,
      updateData
    );
    warnings.push(...anomalyValidation.warnings);
    qualityScore -= anomalyValidation.penalties;

    // 7. Content quality assessment
    const contentValidation = validateContentQuality(updateData);
    warnings.push(...contentValidation.warnings);
    qualityScore -= contentValidation.penalties;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, Math.min(100, Math.round(qualityScore))),
      details: {
        basicValidation: basicValidation.score,
        progressConsistency: progressValidation.score,
        metricsQuality: updateData.measurementData ? 85 : 60, // Lower if no metrics
        photoQuality: validatePhotos ? 90 : 80,
        timelineConsistency: validateTimeline ? 85 : 80,
        contentQuality: contentValidation.score,
      },
      recommendations: generateRecommendations(
        errors,
        warnings,
        updateData,
        project.projectType
      ),
    };
  },
});

/**
 * Helper function for impact metrics validation
 */
async function validateImpactMetricsAdvancedHelper(
  ctx: any,
  projectType: string,
  metrics: any,
  projectId: string,
  compareToHistory = true
): Promise<{
  errors: string[];
  warnings: string[];
  penalties: number;
  score: number;
  insights: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const insights: string[] = [];
  let penalties = 0;

  // Get project-specific thresholds
  const thresholds = getProjectThresholds(projectType);

  // Validate each metric
  for (const [metricName, value] of Object.entries(metrics)) {
    if (typeof value !== 'number') continue;

    const threshold = thresholds[metricName];
    if (!threshold) {
      warnings.push(
        `No validation threshold defined for metric: ${metricName}`
      );
      penalties += 2;
      continue;
    }

    // Range validation
    if (value < threshold.min) {
      errors.push(
        `${metricName} value ${value} is below minimum threshold of ${threshold.min}`
      );
      penalties += 15;
    } else if (value > threshold.max) {
      errors.push(
        `${metricName} value ${value} exceeds maximum threshold of ${threshold.max}`
      );
      penalties += 10;
    } else if (value < threshold.min * 1.2) {
      warnings.push(
        `${metricName} value ${value} is close to minimum threshold`
      );
      penalties += 3;
    } else if (value > threshold.max * 0.8) {
      insights.push(
        `${metricName} value ${value} is approaching maximum expected range`
      );
    }

    // Reasonableness checks
    if (value === 0 && metricName !== 'treesPlanted') {
      warnings.push(
        `${metricName} is reported as zero - verify this is accurate`
      );
      penalties += 5;
    }
  }

  // Historical comparison
  if (compareToHistory) {
    const historicalAnalysis = await analyzeHistoricalMetrics(
      ctx,
      projectId,
      metrics
    );
    warnings.push(...historicalAnalysis.warnings);
    insights.push(...historicalAnalysis.insights);
    penalties += historicalAnalysis.penalties;
  }

  // Project-specific validations
  const projectValidation = validateProjectSpecificMetrics(
    projectType,
    metrics
  );
  errors.push(...projectValidation.errors);
  warnings.push(...projectValidation.warnings);
  penalties += projectValidation.penalties;

  const score = Math.max(0, 100 - penalties);

  return { errors, warnings, penalties, score, insights };
}

/**
 * Advanced impact metrics validation with historical analysis
 */
export const validateImpactMetricsAdvanced = query({
  args: {
    projectType: v.string(),
    metrics: v.any(),
    projectId: v.id('projects'),
    compareToHistory: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    { projectType, metrics, projectId, compareToHistory = true }
  ) => {
    return await validateImpactMetricsAdvancedHelper(
      ctx,
      projectType,
      metrics,
      projectId,
      compareToHistory
    );
  },
});

/**
 * Helper function for detecting progress anomalies
 */
async function detectProgressAnomaliesHelper(
  ctx: any,
  projectId: string,
  newUpdateData: any
): Promise<{
  warnings: string[];
  insights: string[];
  penalties: number;
}> {
  const warnings: string[] = [];
  const insights: string[] = [];
  let penalties = 0;

  // Get recent progress history
  const recentUpdates = await ctx.db
    .query('progressUpdates')
    .withIndex('by_project', (q: any) => q.eq('projectId', projectId))
    .order('desc')
    .take(10);

  if (recentUpdates.length === 0) {
    return { warnings, insights, penalties };
  }

  const newProgress = newUpdateData.progressPercentage;

  // 1. Detect unusual progress jumps
  const lastProgress = recentUpdates[0].progressPercentage;
  const progressDiff = newProgress - lastProgress;

  if (progressDiff > 25) {
    warnings.push(
      `Progress increased by ${progressDiff}% in a single update. Large jumps should be accompanied by detailed explanations.`
    );
    penalties += 8;
  } else if (progressDiff > 15) {
    insights.push(
      `Significant progress increase of ${progressDiff}%. Consider providing additional context.`
    );
  }

  if (progressDiff < -5) {
    warnings.push(
      `Progress decreased by ${Math.abs(progressDiff)}%. Progress reversals require explanation.`
    );
    penalties += 10;
  }

  // 2. Detect stagnant progress
  if (recentUpdates.length >= 3) {
    const recentProgressValues = recentUpdates
      .slice(0, 3)
      .map((u: any) => u.progressPercentage);
    const maxDiff =
      Math.max(...recentProgressValues) - Math.min(...recentProgressValues);

    if (maxDiff < 2 && newProgress - recentProgressValues[0] < 2) {
      warnings.push(
        'Progress has been stagnant for the last several updates. Consider reporting any challenges or delays.'
      );
      penalties += 5;
    }
  }

  // 3. Analyze reporting frequency
  const daysBetweenUpdates =
    recentUpdates.length > 1
      ? (recentUpdates[0].reportingDate - recentUpdates[1].reportingDate) /
        (1000 * 60 * 60 * 24)
      : 0;

  if (daysBetweenUpdates < 7) {
    insights.push(
      'Frequent updates detected. Ensure each update provides meaningful new information.'
    );
  } else if (daysBetweenUpdates > 45) {
    warnings.push(
      'Long gap since last update. Regular reporting helps maintain project transparency.'
    );
    penalties += 3;
  }

  // 4. Impact metrics consistency
  if (newUpdateData.measurementData && recentUpdates.length > 0) {
    const metricConsistency = analyzeMetricConsistency(
      recentUpdates,
      newUpdateData.measurementData
    );
    warnings.push(...metricConsistency.warnings);
    insights.push(...metricConsistency.insights);
    penalties += metricConsistency.penalties;
  }

  return { warnings, insights, penalties };
}

/**
 * Detect progress anomalies and unusual patterns
 */
export const detectProgressAnomalies = query({
  args: {
    projectId: v.id('projects'),
    newUpdateData: v.any(),
  },
  handler: async (ctx, { projectId, newUpdateData }) => {
    return await detectProgressAnomaliesHelper(ctx, projectId, newUpdateData);
  },
});

// ============= HELPER FUNCTIONS =============

/**
 * Validate basic required fields
 */
function validateBasicFields(updateData: any): {
  errors: string[];
  warnings: string[];
  penalties: number;
  score: number;
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  let penalties = 0;

  // Required field validation
  if (!updateData.title?.trim()) {
    errors.push('Title is required and cannot be empty');
    penalties += 20;
  } else if (updateData.title.length < 10) {
    warnings.push(
      'Title is very short - consider providing more descriptive titles'
    );
    penalties += 3;
  } else if (updateData.title.length > 200) {
    warnings.push(
      'Title is very long - consider shortening for better readability'
    );
    penalties += 2;
  }

  if (!updateData.description?.trim()) {
    errors.push('Description is required and cannot be empty');
    penalties += 20;
  } else if (updateData.description.length < 50) {
    warnings.push(
      'Description is quite short - more detailed descriptions provide better transparency'
    );
    penalties += 5;
  } else if (updateData.description.length > 2000) {
    warnings.push(
      'Description is very long - consider breaking into multiple updates or using clearer structure'
    );
    penalties += 2;
  }

  if (typeof updateData.progressPercentage !== 'number') {
    errors.push('Progress percentage must be a number');
    penalties += 20;
  } else if (
    updateData.progressPercentage < 0 ||
    updateData.progressPercentage > 100
  ) {
    errors.push('Progress percentage must be between 0 and 100');
    penalties += 15;
  }

  const score = Math.max(0, 100 - penalties);
  return { errors, warnings, penalties, score };
}

/**
 * Validate progress consistency with previous updates
 */
async function validateProgressConsistency(
  ctx: any,
  projectId: string,
  updateData: any
): Promise<{
  errors: string[];
  warnings: string[];
  penalties: number;
  score: number;
}> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let penalties = 0;

  const project = await ctx.db.get(projectId);
  const currentProgress = project?.progressPercentage || 0;

  // Check for logical progress flow
  if (updateData.progressPercentage < currentProgress - 5) {
    warnings.push(
      'Progress appears to have decreased significantly compared to previous reports'
    );
    penalties += 8;
  }

  // Check for reasonable progress increments
  const progressIncrease = updateData.progressPercentage - currentProgress;
  if (progressIncrease > 30) {
    warnings.push(
      'Very large progress increase detected - ensure this accurately reflects actual progress'
    );
    penalties += 6;
  }

  const score = Math.max(0, 100 - penalties);
  return { errors, warnings, penalties, score };
}

/**
 * Validate timeline consistency
 */
async function validateTimelineConsistency(
  ctx: any,
  projectId: string,
  updateData: any
): Promise<{
  warnings: string[];
  penalties: number;
}> {
  const warnings: string[] = [];
  let penalties = 0;

  const project = await ctx.db.get(projectId);
  if (!project) return { warnings, penalties };

  // Check if progress aligns with project timeline
  const projectStart = new Date(project.startDate).getTime();
  const projectEnd = new Date(project.expectedCompletionDate).getTime();
  const now = updateData.reportingDate || Date.now();

  const timeElapsed = (now - projectStart) / (projectEnd - projectStart);
  const progressRatio = updateData.progressPercentage / 100;

  if (timeElapsed > 0.5 && progressRatio < timeElapsed - 0.2) {
    // 20% tolerance
    warnings.push(
      'Project appears to be behind schedule based on expected timeline'
    );
    penalties += 5;
  } else if (progressRatio > timeElapsed + 0.3) {
    // Ahead of schedule by more than 30%
    warnings.push(
      'Project is significantly ahead of schedule - verify progress accuracy'
    );
    penalties += 2;
  }

  return { warnings, penalties };
}

/**
 * Validate content quality and completeness
 */
function validateContentQuality(updateData: any): {
  warnings: string[];
  penalties: number;
  score: number;
} {
  const warnings: string[] = [];
  let penalties = 0;

  // Check for meaningful content
  if (updateData.description) {
    const wordCount = updateData.description.trim().split(/\s+/).length;
    if (wordCount < 20) {
      warnings.push(
        'Description is quite brief - more detailed updates provide better transparency'
      );
      penalties += 5;
    }

    // Check for generic or low-quality content
    const genericPhrases = [
      'good progress',
      'everything is fine',
      'work continues',
      'no issues',
    ];
    const hasGenericContent = genericPhrases.some((phrase) =>
      updateData.description.toLowerCase().includes(phrase)
    );

    if (hasGenericContent) {
      warnings.push(
        'Description contains generic phrases - specific details are more valuable'
      );
      penalties += 3;
    }
  }

  // Check for location data
  if (!updateData.location) {
    warnings.push(
      'No location data provided - location verification helps build trust'
    );
    penalties += 2;
  }

  const score = Math.max(0, 100 - penalties);
  return { warnings, penalties, score };
}

/**
 * Get project-specific validation thresholds
 */
function getProjectThresholds(projectType: string) {
  const thresholds: Record<
    string,
    Record<string, { min: number; max: number }>
  > = {
    reforestation: {
      treesPlanted: { min: 1, max: 10000 },
      carbonImpactToDate: { min: 0.01, max: 1000 },
      survivalRate: { min: 0.3, max: 1.0 },
    },
    solar: {
      energyGenerated: { min: 100, max: 1000000 },
      carbonImpactToDate: { min: 0.05, max: 5000 },
      systemUptime: { min: 0.7, max: 1.0 },
    },
    wind: {
      energyGenerated: { min: 500, max: 5000000 },
      carbonImpactToDate: { min: 0.25, max: 25000 },
      systemUptime: { min: 0.6, max: 1.0 },
    },
    biogas: {
      gasProduced: { min: 10, max: 100000 },
      carbonImpactToDate: { min: 0.02, max: 2000 },
      wasteProcessed: { min: 100, max: 1000000 },
    },
    waste_management: {
      wasteProcessed: { min: 1000, max: 10000000 },
      carbonImpactToDate: { min: 0.1, max: 10000 },
      recyclingRate: { min: 0.2, max: 0.95 },
    },
    mangrove_restoration: {
      areaRestored: { min: 0.1, max: 1000 },
      mangrovesPlanted: { min: 100, max: 100000 },
      carbonImpactToDate: { min: 0.05, max: 5000 },
      survivalRate: { min: 0.4, max: 1.0 },
    },
  };

  return thresholds[projectType] || {};
}

/**
 * Analyze historical metrics for consistency
 */
async function analyzeHistoricalMetrics(
  ctx: any,
  projectId: string,
  newMetrics: any
): Promise<{
  warnings: string[];
  insights: string[];
  penalties: number;
}> {
  const warnings: string[] = [];
  const insights: string[] = [];
  let penalties = 0;

  const recentUpdates = await ctx.db
    .query('progressUpdates')
    .withIndex('by_project', (q: any) => q.eq('projectId', projectId))
    .order('desc')
    .take(5);

  if (recentUpdates.length === 0) return { warnings, insights, penalties };

  // Check for consistent improvement in cumulative metrics
  for (const metricName of [
    'carbonImpactToDate',
    'treesPlanted',
    'energyGenerated',
    'wasteProcessed',
  ]) {
    const newValue = newMetrics[metricName];
    if (typeof newValue !== 'number') continue;

    const lastValue = recentUpdates[0][metricName];
    if (typeof lastValue === 'number' && newValue < lastValue) {
      warnings.push(
        `${metricName} decreased from ${lastValue} to ${newValue} - cumulative metrics should not decrease`
      );
      penalties += 8;
    } else if (typeof lastValue === 'number' && newValue === lastValue) {
      insights.push(
        `${metricName} unchanged since last update - consider if new progress has been made`
      );
    }
  }

  return { warnings, insights, penalties };
}

/**
 * Validate project-specific metric relationships
 */
function validateProjectSpecificMetrics(
  projectType: string,
  metrics: any
): {
  errors: string[];
  warnings: string[];
  penalties: number;
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  let penalties = 0;

  switch (projectType) {
    case 'reforestation':
      if (metrics.treesPlanted && metrics.carbonImpactToDate) {
        // Rough validation: each tree should sequester some CO2
        const co2PerTree = metrics.carbonImpactToDate / metrics.treesPlanted;
        if (co2PerTree > 0.5) {
          // More than 0.5 tons CO2 per tree is unusually high
          warnings.push(
            'CO2 impact per tree seems unusually high - verify calculations'
          );
          penalties += 3;
        } else if (co2PerTree < 0.01) {
          // Less than 10kg CO2 per tree is low
          warnings.push(
            'CO2 impact per tree seems low - trees may need time to mature'
          );
        }
      }
      break;

    case 'solar':
    case 'wind':
      if (metrics.energyGenerated && metrics.carbonImpactToDate) {
        // Validate CO2 savings per kWh
        const co2PerKwh = metrics.carbonImpactToDate / metrics.energyGenerated;
        if (co2PerKwh > 1) {
          // More than 1 ton CO2 per kWh is too high
          warnings.push(
            'CO2 savings per kWh seems too high - verify conversion factors'
          );
          penalties += 5;
        }
      }
      break;
  }

  return { errors, warnings, penalties };
}

/**
 * Analyze consistency of metrics across updates
 */
function analyzeMetricConsistency(
  recentUpdates: any[],
  newMetrics: any
): {
  warnings: string[];
  insights: string[];
  penalties: number;
} {
  const warnings: string[] = [];
  const insights: string[] = [];
  let penalties = 0;

  if (recentUpdates.length < 2) return { warnings, insights, penalties };

  // Check for erratic metric changes
  for (const metricName of Object.keys(newMetrics)) {
    const values = recentUpdates
      .map((u: any) => u.measurementData?.[metricName] || u[metricName])
      .filter((v) => typeof v === 'number')
      .slice(0, 3);

    if (values.length >= 2) {
      const changes = [];
      for (let i = 0; i < values.length - 1; i++) {
        const current = values[i];
        const next = values[i + 1];
        if (current !== undefined && next !== undefined) {
          changes.push(current - next);
        }
      }

      // Detect erratic changes
      const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
      const erraticChanges = changes.filter(
        (change) => Math.abs(change - avgChange) > Math.abs(avgChange)
      );

      if (erraticChanges.length > changes.length / 2) {
        insights.push(
          `${metricName} shows inconsistent reporting patterns - consider providing explanations for variations`
        );
      }
    }
  }

  return { warnings, insights, penalties };
}

/**
 * Generate actionable recommendations based on validation results
 */
function generateRecommendations(
  errors: string[],
  warnings: string[],
  updateData: any,
  projectType: string
): string[] {
  const recommendations: string[] = [];

  if (errors.length > 0) {
    recommendations.push(
      'Address all validation errors before submitting the update'
    );
  }

  if (warnings.length > 3) {
    recommendations.push(
      'Consider addressing the warnings to improve update quality and transparency'
    );
  }

  if (!updateData.photos || updateData.photos.length === 0) {
    const photoReqs =
      CloudinaryService.getProjectPhotoRequirements(projectType);
    recommendations.push(
      `Add ${photoReqs.minimumCount} photos: ${photoReqs.description}`
    );
  }

  if (
    !updateData.measurementData ||
    Object.keys(updateData.measurementData).length === 0
  ) {
    recommendations.push(
      'Include quantifiable impact metrics to demonstrate project progress'
    );
  }

  if (!updateData.location) {
    recommendations.push(
      'Add location data to verify project activities and build stakeholder trust'
    );
  }

  if (updateData.description && updateData.description.length < 100) {
    recommendations.push(
      'Provide more detailed descriptions explaining what work was completed and any challenges faced'
    );
  }

  return recommendations;
}

// Export internal functions
export const internal = {
  progressValidation: {
    validateCompleteProgressUpdate,
    validateImpactMetricsAdvanced,
    detectProgressAnomalies,
  },
};
