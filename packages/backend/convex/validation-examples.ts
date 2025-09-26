/**
 * ENVIRONMENTAL IMPACT VALIDATION - USAGE EXAMPLES
 *
 * This file demonstrates how to use the Environmental Impact Validation system
 * with practical examples for different project types and scenarios.
 */

import type { Id } from './_generated/dataModel';
import {
  validateEnvironmentalMetrics,
  getValidationConfig,
} from './impact-validation';
import { runProjectValidation } from './project-validators';
import {
  analyzeProjectTrend,
  compareProjectPerformance,
} from './trend-analysis';
import {
  orchestrateThirdPartyValidation,
  registerValidationProvider,
} from './third-party-validation';

// ============= EXAMPLE USAGE SCENARIOS =============

/**
 * Example 1: Basic Environmental Metrics Validation
 * Validate a reforestation project's progress update
 */
export async function exampleBasicValidation(ctx: any) {
  const projectId = 'project-id-123' as Id<'projects'>;

  const metrics = {
    carbonImpactToDate: 15000, // kg CO2
    treesPlanted: 2500,
    biodiversityImpact: 75,
  };

  // Validate the metrics using the basic framework
  const validationResult = await ctx.runMutation(validateEnvironmentalMetrics, {
    projectId,
    metrics,
  });

  console.log('Basic Validation Result:', validationResult);

  /**
   * Expected output structure:
   * {
   *   isValid: true,
   *   score: 85,
   *   warnings: [],
   *   errors: [],
   *   anomalies: [],
   *   recommendations: ['Consider reporting more biodiversity metrics']
   * }
   */

  return validationResult;
}

/**
 * Example 2: Advanced Project-Specific Validation
 * Using the enhanced validators with seasonal and location factors
 */
export async function exampleAdvancedValidation(ctx: any) {
  const projectId = 'solar-project-456' as Id<'projects'>;

  const metrics = {
    energyGenerated: 125000, // kWh
    carbonImpactToDate: 75000, // kg CO2 avoided
  };

  // Use advanced validation with project-specific algorithms
  const validationResult = await ctx.runMutation(runProjectValidation, {
    projectId,
    metrics,
  });

  console.log('Advanced Validation Result:', validationResult);

  /**
   * This will include:
   * - Weather-adjusted expectations
   * - Seasonal performance factors
   * - Location-based solar irradiance adjustments
   * - Grid emission factor calculations
   */

  return validationResult;
}

/**
 * Example 3: Trend Analysis for Progress Monitoring
 * Analyze historical progress trends and get forecasts
 */
export async function exampleTrendAnalysis(ctx: any) {
  const projectId = 'wind-project-789' as Id<'projects'>;

  // Analyze energy generation trends over time
  const trendAnalysis = await ctx.runMutation(analyzeProjectTrend, {
    projectId,
    metric: 'energyGenerated',
    timeframe: 'monthly',
    includeForecasting: true,
  });

  console.log('Trend Analysis Result:', trendAnalysis);

  /**
   * Expected insights:
   * - Trend direction (increasing/decreasing/stable)
   * - Volatility and consistency scores
   * - Anomaly detection results
   * - Next period prediction with confidence interval
   * - Data quality assessment
   */

  return trendAnalysis;
}

/**
 * Example 4: Performance Benchmarking
 * Compare project against similar projects
 */
export async function examplePerformanceBenchmarking(ctx: any) {
  const projectId = 'biogas-project-101' as Id<'projects'>;

  const comparison = await ctx.runQuery(compareProjectPerformance, {
    projectId,
    comparisonMetrics: [
      'energyGenerated',
      'wasteProcessed',
      'carbonImpactToDate',
    ],
  });

  console.log('Performance Comparison:', comparison);

  /**
   * Shows how this project ranks against similar projects:
   * - Industry averages and medians
   * - Percentile rankings
   * - Overall performance classification
   */

  return comparison;
}

/**
 * Example 5: Third-Party Validation Orchestration
 * Use multiple external providers for comprehensive validation
 */
export async function exampleThirdPartyValidation(ctx: any) {
  const projectId = 'reforestation-project-202' as Id<'projects'>;

  const metrics = {
    treesPlanted: 5000,
    carbonImpactToDate: 25000,
    areaRestored: 12.5, // hectares
  };

  // Orchestrate validation using multiple providers
  const orchestrationResult = await ctx.runAction(
    orchestrateThirdPartyValidation,
    {
      projectId,
      metrics,
      validationStrategy: 'consensus', // Use multiple providers for consensus
      maxCost: 100, // USD limit
      maxWaitTime: 30000, // 30 second limit
    }
  );

  console.log('Third-Party Validation Result:', orchestrationResult);

  /**
   * Includes results from:
   * - Satellite imagery analysis
   * - Weather data validation
   * - Carbon registry verification
   * - Consensus calculation across providers
   */

  return orchestrationResult;
}

/**
 * Example 6: Register a New Third-Party Provider
 * Add a satellite imagery provider for forest monitoring
 */
export async function exampleRegisterProvider(ctx: any) {
  const provider = {
    id: 'forest_watch_ai',
    name: 'Forest Watch AI',
    type: 'satellite' as const,
    apiEndpoint: 'https://api.forestwatch.ai/v1',
    authMethod: 'api_key' as const,
    supportedProjectTypes: ['reforestation', 'mangrove_restoration'],
    supportedMetrics: ['treesPlanted', 'areaRestored', 'carbonImpactToDate'],
    reliability: 0.92,
    costPerValidation: 30,
    averageResponseTime: 8000, // 8 seconds
    isActive: true,
  };

  const credentials = {
    apiKey: 'your-api-key-here',
  };

  const providerId = await ctx.runMutation(registerValidationProvider, {
    provider,
    credentials,
  });

  console.log('Registered Provider ID:', providerId);

  return providerId;
}

/**
 * Example 7: Comprehensive Project Health Check
 * Combine all validation types for complete assessment
 */
export async function exampleComprehensiveHealthCheck(ctx: any) {
  const projectId = 'mangrove-project-303' as Id<'projects'>;

  const metrics = {
    areaRestored: 25.0, // hectares
    carbonImpactToDate: 50000, // kg CO2
    biodiversityImpact: 150,
  };

  // Step 1: Basic validation
  const basicValidation = await ctx.runMutation(validateEnvironmentalMetrics, {
    projectId,
    metrics,
  });

  // Step 2: Advanced validation
  const advancedValidation = await ctx.runMutation(runProjectValidation, {
    projectId,
    metrics,
  });

  // Step 3: Trend analysis
  const trends = await ctx.runMutation(analyzeProjectTrend, {
    projectId,
    metric: 'areaRestored',
    timeframe: 'quarterly',
    includeForecasting: true,
  });

  // Step 4: Performance comparison
  const comparison = await ctx.runQuery(compareProjectPerformance, {
    projectId,
    comparisonMetrics: [
      'areaRestored',
      'carbonImpactToDate',
      'biodiversityImpact',
    ],
  });

  // Step 5: Third-party validation
  const thirdPartyValidation = await ctx.runAction(
    orchestrateThirdPartyValidation,
    {
      projectId,
      metrics,
      validationStrategy: 'comprehensive',
      maxCost: 150,
      maxWaitTime: 45000, // 45 seconds
    }
  );

  // Combine all results into comprehensive health report
  const healthReport = {
    projectId,
    timestamp: Date.now(),
    validationSummary: {
      basic: {
        score: basicValidation.score,
        isValid: basicValidation.isValid,
        issues: [...basicValidation.errors, ...basicValidation.warnings],
      },
      advanced: {
        score: advancedValidation.score,
        isValid: advancedValidation.isValid,
        issues: [...advancedValidation.errors, ...advancedValidation.warnings],
      },
      thirdParty: {
        consensus: thirdPartyValidation.consensusResult,
        reliability: thirdPartyValidation.overallReliability,
        cost: thirdPartyValidation.totalCost,
      },
    },
    trendAnalysis: {
      trend: trends.trend,
      strength: trends.trendStrength,
      anomalies: trends.anomalyCount,
      forecast: trends.forecast,
      dataQuality: trends.dataQuality,
    },
    performanceComparison: {
      overallRanking: comparison.overallPerformance,
      metrics: comparison.metrics,
    },
    overallHealthScore: calculateOverallHealthScore([
      basicValidation.score,
      advancedValidation.score,
      thirdPartyValidation.consensusResult.score,
    ]),
    recommendations: [
      ...basicValidation.recommendations,
      ...advancedValidation.recommendations,
      ...getHealthRecommendations(comparison, trends),
    ].filter((rec, index, arr) => arr.indexOf(rec) === index), // Remove duplicates
  };

  console.log('Comprehensive Health Report:', healthReport);

  return healthReport;
}

/**
 * Example 8: Anomaly Detection and Alert Generation
 * Detect unusual patterns in project data
 */
export async function exampleAnomalyDetection(ctx: any) {
  const projectId = 'waste-management-404' as Id<'projects'>;

  // Analyze waste processing trends for anomalies
  const trendAnalysis = await ctx.runMutation(analyzeProjectTrend, {
    projectId,
    metric: 'wasteProcessed',
    timeframe: 'weekly',
  });

  console.log('Anomaly Detection Results:');
  console.log(`- Detected ${trendAnalysis.anomalyCount} anomalies`);
  console.log(`- Volatility score: ${trendAnalysis.volatilityScore}`);
  console.log(`- Consistency score: ${trendAnalysis.consistencyScore}`);

  // Generate alerts based on anomalies
  const alerts = trendAnalysis.anomalies.map((anomaly: any) => ({
    type: 'data_anomaly',
    severity: anomaly.severity,
    message: `Anomaly detected in waste processing: ${anomaly.description}`,
    timestamp: anomaly.timestamp,
    recommendations: [
      'Verify data collection accuracy',
      'Check for equipment malfunctions',
      'Review operational changes during this period',
    ],
  }));

  console.log('Generated Alerts:', alerts);

  return { trendAnalysis, alerts };
}

// ============= UTILITY FUNCTIONS =============

/**
 * Calculate overall health score from multiple validation scores
 */
function calculateOverallHealthScore(scores: number[]): number {
  if (scores.length === 0) return 0;

  // Weighted average with higher weight on basic validation
  const weights = [0.3, 0.4, 0.3]; // basic, advanced, third-party
  const weightedSum = scores.reduce(
    (sum, score, index) => sum + score * (weights[index] || 0.33),
    0
  );

  return Math.round(weightedSum);
}

/**
 * Generate health recommendations based on comparison and trends
 */
function getHealthRecommendations(comparison: any, trends: any): string[] {
  const recommendations: string[] = [];

  // Performance-based recommendations
  if (comparison.overallPerformance === 'below_average') {
    recommendations.push(
      'Project performance is below industry average - review operational efficiency'
    );
  } else if (comparison.overallPerformance === 'excellent') {
    recommendations.push(
      'Excellent performance! Share best practices with other projects'
    );
  }

  // Trend-based recommendations
  if (trends.trend === 'decreasing' && trends.trendStrength > 0.7) {
    recommendations.push(
      'Strong declining trend detected - immediate intervention recommended'
    );
  } else if (trends.trend === 'volatile') {
    recommendations.push(
      'High volatility in metrics - standardize data collection and reporting'
    );
  }

  // Data quality recommendations
  if (trends.dataQuality.reliability < 0.8) {
    recommendations.push(
      'Data reliability is low - improve verification processes'
    );
  }
  if (trends.dataQuality.completeness < 0.9) {
    recommendations.push(
      'Missing data points detected - ensure consistent reporting schedule'
    );
  }

  return recommendations;
}

/**
 * Example Configuration: Project-Type Specific Validation Rules
 */
export const VALIDATION_CONFIG_EXAMPLES = {
  reforestation: {
    thresholds: {
      treesPerHectare: { min: 400, max: 2500 },
      survivalRate: { min: 0.75, max: 1.0 },
      co2PerTreePerYear: { min: 20, max: 50 },
    },
    seasonalFactors: {
      // Planting season effectiveness (0-1 multiplier)
      spring: 1.2,
      summer: 0.7,
      monsoon: 1.1,
      winter: 0.8,
    },
    requiredMetrics: ['treesPlanted', 'carbonImpactToDate'],
    optionalMetrics: ['biodiversityImpact', 'survivalRate'],
  },
  solar: {
    thresholds: {
      kwhPerM2PerDay: { min: 3, max: 6 },
      performanceRatio: { min: 0.7, max: 0.9 },
      gridEmissionFactor: { default: 0.6, min: 0.3, max: 1.2 },
    },
    weatherDependency: true,
    requiredMetrics: ['energyGenerated', 'carbonImpactToDate'],
    optionalMetrics: ['systemUptime', 'maintenanceHours'],
  },
  waste_management: {
    thresholds: {
      processingEfficiency: { min: 0.8, max: 1.0 },
      co2PerTonWaste: { min: 500, max: 2000 },
      recyclingRate: { min: 0.6, max: 0.95 },
    },
    requiredMetrics: ['wasteProcessed', 'carbonImpactToDate'],
    optionalMetrics: ['recyclingRate', 'energyRecovered'],
  },
} as const;
