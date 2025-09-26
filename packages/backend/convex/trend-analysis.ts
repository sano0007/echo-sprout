import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import type { Doc } from './_generated/dataModel';
import type { EnvironmentalMetrics } from './impact-validation';

// ============= TREND ANALYSIS TYPES =============

export interface TrendDataPoint {
  timestamp: number;
  value: number;
  verified: boolean;
  metadata?: Record<string, any>;
}

export interface TrendAnalysis {
  metric: string;
  projectId: string;
  timeframe: string; // 'daily', 'weekly', 'monthly', 'quarterly'
  dataPoints: TrendDataPoint[];

  // Statistical analysis
  trend:
    | 'increasing'
    | 'decreasing'
    | 'stable'
    | 'volatile'
    | 'insufficient_data';
  trendStrength: number; // 0-1 (1 = very strong trend)
  correlation: number; // -1 to 1 (correlation with time)

  // Trend metrics
  averageValue: number;
  medianValue: number;
  standardDeviation: number;
  coefficientOfVariation: number;

  // Growth analysis
  totalGrowth: number;
  averageGrowthRate: number; // per period
  compoundGrowthRate: number; // CAGR equivalent

  // Volatility analysis
  volatilityScore: number; // 0-1 (1 = very volatile)
  consistencyScore: number; // 0-1 (1 = very consistent)

  // Anomaly detection
  anomalies: TrendAnomaly[];
  anomalyCount: number;

  // Forecasting
  forecast?: {
    nextPeriodPrediction: number;
    confidence: number; // 0-1
    confidenceInterval: { lower: number; upper: number };
  };

  // Quality metrics
  dataQuality: {
    completeness: number; // 0-1 (1 = all expected data points present)
    reliability: number; // 0-1 (1 = all data verified)
    consistency: number; // 0-1 (1 = consistent reporting intervals)
  };
}

export interface TrendAnomaly {
  timestamp: number;
  value: number;
  expectedValue: number;
  deviationScore: number; // How many standard deviations from expected
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'spike' | 'drop' | 'plateau' | 'inconsistent_growth' | 'data_gap';
  description: string;
}

export interface TrendComparison {
  projectId: string;
  baselineProjects: string[]; // Similar projects for comparison
  metrics: {
    [metricName: string]: {
      projectValue: number;
      industryAverage: number;
      industryMedian: number;
      percentile: number; // 0-100 (where this project ranks)
      comparison: 'above_average' | 'average' | 'below_average';
    };
  };
  overallPerformance:
    | 'excellent'
    | 'good'
    | 'average'
    | 'below_average'
    | 'poor';
}

// ============= TREND ANALYSIS ENGINE =============

/**
 * Analyze trends for a specific metric across a project's history
 */
export const analyzeProjectTrend = mutation({
  args: {
    projectId: v.id('projects'),
    metric: v.string(), // 'carbonImpactToDate', 'treesPlanted', etc.
    timeframe: v.union(
      v.literal('daily'),
      v.literal('weekly'),
      v.literal('monthly'),
      v.literal('quarterly')
    ),
    includeForecasting: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<TrendAnalysis> => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get all progress updates for this project
    const progressUpdates = await ctx.db
      .query('progressUpdates')
      .withIndex('by_project_date', (q) => q.eq('projectId', args.projectId))
      .order('asc')
      .collect();

    // Extract trend data points
    const dataPoints: TrendDataPoint[] = progressUpdates
      .map((update) => {
        const value = extractMetricValue(update, args.metric);
        if (value === null) return null;

        return {
          timestamp: update.reportingDate,
          value,
          verified: update.isVerified,
          metadata: {
            updateId: update._id,
            updateType: update.updateType,
            progressPercentage: update.progressPercentage,
          },
        } as TrendDataPoint;
      })
      .filter((point): point is TrendDataPoint => point !== null);

    // Group data by timeframe if needed
    const groupedDataPoints = groupDataPointsByTimeframe(
      dataPoints,
      args.timeframe
    );

    // Perform statistical analysis
    const trendAnalysis = await performTrendAnalysis(
      args.metric,
      args.projectId,
      args.timeframe,
      groupedDataPoints,
      project.projectType
    );

    // Add forecasting if requested
    if (args.includeForecasting && groupedDataPoints.length >= 3) {
      trendAnalysis.forecast = generateForecast(groupedDataPoints);
    }

    // Store trend analysis result
    await ctx.db.insert('analytics', {
      metric: `trend_analysis_${args.metric}`,
      value: trendAnalysis.trendStrength,
      date: Date.now(),
      projectId: args.projectId,
      category: 'trend_analysis',
      metadata: {
        timeframe: args.timeframe,
        trend: trendAnalysis.trend,
        dataPointCount: groupedDataPoints.length,
        anomalyCount: trendAnalysis.anomalyCount,
      },
    });

    return trendAnalysis;
  },
});

/**
 * Compare project performance against similar projects
 */
export const compareProjectPerformance = query({
  args: {
    projectId: v.id('projects'),
    comparisonMetrics: v.array(v.string()),
  },
  handler: async (ctx, args): Promise<TrendComparison> => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Find similar projects (same type, similar budget/area)
    const similarProjects = await ctx.db
      .query('projects')
      .withIndex('by_type_status', (q) =>
        q.eq('projectType', project.projectType).eq('status', 'active')
      )
      .filter((q) =>
        q.and(
          q.neq(q.field('_id'), args.projectId), // Exclude current project
          q.gte(q.field('budget'), project.budget * 0.5),
          q.lte(q.field('budget'), project.budget * 2.0),
          q.gte(q.field('areaSize'), project.areaSize * 0.5),
          q.lte(q.field('areaSize'), project.areaSize * 2.0)
        )
      )
      .take(20);

    // Get latest metrics for current project
    const currentProjectMetrics = await getLatestProjectMetrics(
      ctx,
      args.projectId
    );

    // Get metrics for similar projects
    const comparisonData: Record<string, number[]> = {};
    for (const metric of args.comparisonMetrics) {
      comparisonData[metric] = [];
    }

    for (const similarProject of similarProjects) {
      const metrics = await getLatestProjectMetrics(ctx, similarProject._id);
      for (const metric of args.comparisonMetrics) {
        const value = metrics[metric as keyof typeof metrics];
        if (typeof value === 'number' && value > 0) {
          comparisonData[metric].push(value);
        }
      }
    }

    // Calculate comparison metrics
    const comparisonMetricsResult: TrendComparison['metrics'] = {};
    let totalPercentile = 0;
    let metricsCount = 0;

    for (const metric of args.comparisonMetrics) {
      const projectValue =
        (currentProjectMetrics[
          metric as keyof typeof currentProjectMetrics
        ] as number) || 0;
      const industryValues = comparisonData[metric];

      if (industryValues && industryValues.length > 0 && projectValue > 0) {
        const average =
          industryValues.reduce((sum, val) => sum + val, 0) /
          industryValues.length;
        const sortedValues = [...industryValues].sort((a, b) => a - b);
        const median = sortedValues[Math.floor(sortedValues.length / 2)];
        const percentile = calculatePercentile(projectValue, industryValues);

        comparisonMetricsResult[metric] = {
          projectValue,
          industryAverage: average,
          industryMedian: median,
          percentile,
          comparison:
            percentile >= 75
              ? 'above_average'
              : percentile >= 25
                ? 'average'
                : 'below_average',
        };

        totalPercentile += percentile;
        metricsCount++;
      }
    }

    // Calculate overall performance
    const overallPercentile =
      metricsCount > 0 ? totalPercentile / metricsCount : 50;
    const overallPerformance: TrendComparison['overallPerformance'] =
      overallPercentile >= 90
        ? 'excellent'
        : overallPercentile >= 75
          ? 'good'
          : overallPercentile >= 50
            ? 'average'
            : overallPercentile >= 25
              ? 'below_average'
              : 'poor';

    return {
      projectId: args.projectId,
      baselineProjects: similarProjects.map((p) => p._id),
      metrics: comparisonMetricsResult,
      overallPerformance,
    };
  },
});

/**
 * Get trend insights and recommendations for a project
 */
export const getProjectTrendInsights = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    const recentAnalytics = await ctx.db
      .query('analytics')
      .withIndex('by_project', (q) => q.eq('projectId', args.projectId))
      .filter((q) => q.eq(q.field('category'), 'trend_analysis'))
      .order('desc')
      .take(10);

    const insights = {
      trends: [] as any[],
      alerts: [] as string[],
      recommendations: [] as string[],
      overallHealth: 'good' as 'excellent' | 'good' | 'warning' | 'critical',
    };

    for (const analytic of recentAnalytics) {
      const metadata = analytic.metadata;
      if (metadata) {
        insights.trends.push({
          metric: analytic.metric.replace('trend_analysis_', ''),
          trend: metadata.trend,
          strength: analytic.value,
          anomalies: metadata.anomalyCount || 0,
          timeframe: metadata.timeframe,
        });

        // Generate alerts and recommendations
        if (metadata.trend === 'decreasing' && analytic.value > 0.7) {
          insights.alerts.push(
            `${analytic.metric} showing strong declining trend`
          );
          insights.recommendations.push(
            `Investigate causes of declining ${analytic.metric} performance`
          );
        }

        if (metadata.anomalyCount > 5) {
          insights.alerts.push(
            `High number of anomalies detected in ${analytic.metric}`
          );
          insights.recommendations.push(
            `Review data collection process for ${analytic.metric}`
          );
        }
      }
    }

    // Calculate overall health
    const negativetrends = insights.trends.filter(
      (t) => t.trend === 'decreasing'
    ).length;
    const totalAnomalies = insights.trends.reduce(
      (sum, t) => sum + t.anomalies,
      0
    );

    if (negativetrends >= 3 || totalAnomalies >= 20) {
      insights.overallHealth = 'critical';
    } else if (negativetrends >= 2 || totalAnomalies >= 10) {
      insights.overallHealth = 'warning';
    } else if (
      insights.trends.some((t) => t.trend === 'increasing' && t.strength > 0.8)
    ) {
      insights.overallHealth = 'excellent';
    }

    return insights;
  },
});

// ============= UTILITY FUNCTIONS =============

function extractMetricValue(
  update: Doc<'progressUpdates'>,
  metric: string
): number | null {
  switch (metric) {
    case 'carbonImpactToDate':
      return update.carbonImpactToDate || null;
    case 'treesPlanted':
      return update.treesPlanted || null;
    case 'energyGenerated':
      return update.energyGenerated || null;
    case 'wasteProcessed':
      return update.wasteProcessed || null;
    case 'progressPercentage':
      return update.progressPercentage || null;
    default:
      return null;
  }
}

function groupDataPointsByTimeframe(
  dataPoints: TrendDataPoint[],
  timeframe: 'daily' | 'weekly' | 'monthly' | 'quarterly'
): TrendDataPoint[] {
  if (timeframe === 'daily') return dataPoints;

  const grouped = new Map<string, TrendDataPoint[]>();
  const periodMs = {
    weekly: 7 * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000,
    quarterly: 90 * 24 * 60 * 60 * 1000,
  };

  for (const point of dataPoints) {
    const periodStart =
      Math.floor(point.timestamp / periodMs[timeframe]) * periodMs[timeframe];
    const key = periodStart.toString();

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(point);
  }

  // Aggregate points within each period
  const aggregated: TrendDataPoint[] = [];
  Array.from(grouped.entries()).forEach(([periodStart, points]) => {
    const maxValue = Math.max(...points.map((p) => p.value));
    const allVerified = points.every((p) => p.verified);

    aggregated.push({
      timestamp: parseInt(periodStart),
      value: maxValue, // Use max value for cumulative metrics
      verified: allVerified,
      metadata: {
        aggregatedCount: points.length,
        sourcePoints: points.map((p) => p.metadata?.updateId),
      },
    });
  });

  return aggregated.sort((a, b) => a.timestamp - b.timestamp);
}

async function performTrendAnalysis(
  metric: string,
  projectId: string,
  timeframe: string,
  dataPoints: TrendDataPoint[],
  projectType: string
): Promise<TrendAnalysis> {
  if (dataPoints.length < 2) {
    return {
      metric,
      projectId,
      timeframe,
      dataPoints,
      trend: 'insufficient_data',
      trendStrength: 0,
      correlation: 0,
      averageValue: 0,
      medianValue: 0,
      standardDeviation: 0,
      coefficientOfVariation: 0,
      totalGrowth: 0,
      averageGrowthRate: 0,
      compoundGrowthRate: 0,
      volatilityScore: 0,
      consistencyScore: 0,
      anomalies: [],
      anomalyCount: 0,
      dataQuality: {
        completeness: 0,
        reliability: 0,
        consistency: 0,
      },
    };
  }

  const values = dataPoints.map((p) => p.value);
  const timestamps = dataPoints.map((p) => p.timestamp);

  // Basic statistics
  const averageValue =
    values.reduce((sum, val) => sum + val, 0) / values.length;
  const sortedValues = [...values].sort((a, b) => a - b);
  const medianValue = sortedValues[Math.floor(sortedValues.length / 2)];
  const standardDeviation = Math.sqrt(
    values.reduce((sum, val) => sum + Math.pow(val - averageValue, 2), 0) /
      values.length
  );
  const coefficientOfVariation = standardDeviation / averageValue;

  // Trend analysis
  const correlation = calculateCorrelation(timestamps, values);
  const trendStrength = Math.abs(correlation);

  let trend: TrendAnalysis['trend'];
  if (trendStrength < 0.3) {
    trend = coefficientOfVariation > 0.5 ? 'volatile' : 'stable';
  } else {
    trend = correlation > 0 ? 'increasing' : 'decreasing';
  }

  // Growth analysis
  const totalGrowth = values[values.length - 1] - values[0];
  const averageGrowthRate = totalGrowth / (values.length - 1);
  const compoundGrowthRate =
    Math.pow(values[values.length - 1] / values[0], 1 / (values.length - 1)) -
    1;

  // Volatility analysis
  const volatilityScore = Math.min(coefficientOfVariation, 1);
  const consistencyScore = 1 - volatilityScore;

  // Anomaly detection
  const anomalies = detectAnomalies(
    dataPoints,
    averageValue,
    standardDeviation
  );

  // Data quality assessment
  const dataQuality = assessDataQuality(dataPoints, projectType, timeframe);

  return {
    metric,
    projectId,
    timeframe,
    dataPoints,
    trend,
    trendStrength,
    correlation,
    averageValue,
    medianValue,
    standardDeviation,
    coefficientOfVariation,
    totalGrowth,
    averageGrowthRate,
    compoundGrowthRate,
    volatilityScore,
    consistencyScore,
    anomalies,
    anomalyCount: anomalies.length,
    dataQuality,
  };
}

function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;

  let numerator = 0;
  let denomX = 0;
  let denomY = 0;

  for (let i = 0; i < n; i++) {
    const deltaX = x[i] - meanX;
    const deltaY = y[i] - meanY;
    numerator += deltaX * deltaY;
    denomX += deltaX * deltaX;
    denomY += deltaY * deltaY;
  }

  const denominator = Math.sqrt(denomX * denomY);
  return denominator === 0 ? 0 : numerator / denominator;
}

function detectAnomalies(
  dataPoints: TrendDataPoint[],
  mean: number,
  stdDev: number
): TrendAnomaly[] {
  const anomalies: TrendAnomaly[] = [];

  for (let i = 0; i < dataPoints.length; i++) {
    const point = dataPoints[i];
    const deviationScore = Math.abs(point.value - mean) / stdDev;

    if (deviationScore > 2) {
      // 2 standard deviations
      let severity: TrendAnomaly['severity'];
      let type: TrendAnomaly['type'];

      if (deviationScore > 3) {
        severity = 'critical';
      } else if (deviationScore > 2.5) {
        severity = 'high';
      } else {
        severity = 'medium';
      }

      // Determine anomaly type
      if (point.value > mean + 2 * stdDev) {
        type = 'spike';
      } else if (point.value < mean - 2 * stdDev) {
        type = 'drop';
      } else {
        type = 'inconsistent_growth';
      }

      anomalies.push({
        timestamp: point.timestamp,
        value: point.value,
        expectedValue: mean,
        deviationScore,
        severity,
        type,
        description: `${type.replace('_', ' ')} detected - value ${point.value.toFixed(2)} deviates ${deviationScore.toFixed(2)} standard deviations from mean`,
      });
    }
  }

  return anomalies;
}

function assessDataQuality(
  dataPoints: TrendDataPoint[],
  projectType: string,
  timeframe: string
): TrendAnalysis['dataQuality'] {
  // Completeness: How complete is the data based on expected reporting frequency
  const expectedIntervalMs = {
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000,
    quarterly: 90 * 24 * 60 * 60 * 1000,
  };

  const interval =
    expectedIntervalMs[timeframe as keyof typeof expectedIntervalMs];
  const timeSpan =
    dataPoints[dataPoints.length - 1].timestamp - dataPoints[0].timestamp;
  const expectedPoints = Math.floor(timeSpan / interval) + 1;
  const completeness = Math.min(dataPoints.length / expectedPoints, 1);

  // Reliability: Percentage of verified data points
  const verifiedCount = dataPoints.filter((p) => p.verified).length;
  const reliability =
    dataPoints.length > 0 ? verifiedCount / dataPoints.length : 0;

  // Consistency: How consistent are the reporting intervals
  const intervals: number[] = [];
  for (let i = 1; i < dataPoints.length; i++) {
    intervals.push(dataPoints[i].timestamp - dataPoints[i - 1].timestamp);
  }

  const avgInterval =
    intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
  const intervalStdDev = Math.sqrt(
    intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) /
      intervals.length
  );
  const consistency =
    intervals.length > 0 ? 1 - intervalStdDev / avgInterval : 1;

  return {
    completeness: Math.max(0, completeness),
    reliability,
    consistency: Math.max(0, Math.min(1, consistency)),
  };
}

function generateForecast(
  dataPoints: TrendDataPoint[]
): TrendAnalysis['forecast'] {
  if (dataPoints.length < 3) return undefined;

  const values = dataPoints.map((p) => p.value);
  const lastValue = values[values.length - 1];
  const secondLastValue = values[values.length - 2];

  if (lastValue === undefined || secondLastValue === undefined)
    return undefined;

  const trend = lastValue - secondLastValue;

  // Simple linear extrapolation
  const prediction = lastValue + trend;

  // Calculate confidence based on trend consistency
  const recentTrends = [];
  for (let i = 2; i < values.length; i++) {
    recentTrends.push(values[i] - values[i - 1]);
  }

  const trendStdDev = Math.sqrt(
    recentTrends.reduce((sum, t) => sum + Math.pow(t - trend, 2), 0) /
      recentTrends.length
  );

  const confidence = Math.max(
    0,
    Math.min(1, 1 - trendStdDev / Math.abs(trend))
  );

  return {
    nextPeriodPrediction: Math.max(0, prediction),
    confidence,
    confidenceInterval: {
      lower: Math.max(0, prediction - trendStdDev * 2),
      upper: prediction + trendStdDev * 2,
    },
  };
}

async function getLatestProjectMetrics(ctx: any, projectId: string) {
  const latestUpdate = await ctx.db
    .query('progressUpdates')
    .withIndex('by_project_date', (q: any) => q.eq('projectId', projectId))
    .order('desc')
    .first();

  return {
    carbonImpactToDate: latestUpdate?.carbonImpactToDate || 0,
    treesPlanted: latestUpdate?.treesPlanted || 0,
    energyGenerated: latestUpdate?.energyGenerated || 0,
    wasteProcessed: latestUpdate?.wasteProcessed || 0,
    progressPercentage: latestUpdate?.progressPercentage || 0,
  };
}

function calculatePercentile(value: number, dataset: number[]): number {
  const sorted = [...dataset].sort((a, b) => a - b);
  const rank = sorted.filter((v) => v <= value).length;
  return Math.round((rank / sorted.length) * 100);
}
