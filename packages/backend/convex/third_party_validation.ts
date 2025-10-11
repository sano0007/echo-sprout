import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { Id } from './_generated/dataModel';
import type {
  ValidationResult,
  EnvironmentalMetrics,
} from './impact_validation';

// ============= THIRD-PARTY VALIDATION TYPES =============

export interface ThirdPartyProvider {
  id: string;
  name: string;
  type:
    | 'satellite'
    | 'weather'
    | 'carbon_registry'
    | 'certification_body'
    | 'iot_sensor'
    | 'government_api';
  apiEndpoint?: string;
  authMethod: 'api_key' | 'oauth' | 'certificate' | 'webhook';
  supportedProjectTypes: string[];
  supportedMetrics: string[];
  reliability: number; // 0-1 score based on historical accuracy
  costPerValidation?: number;
  averageResponseTime?: number; // milliseconds
  isActive: boolean;
}

export interface ValidationRequest {
  projectId: Id<'projects'>;
  providerId: string;
  metrics: EnvironmentalMetrics;
  requestType: 'verification' | 'cross_check' | 'monitoring' | 'compliance';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

export interface ThirdPartyValidationResult {
  providerId: string;
  providerName: string;
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'timeout';

  // Validation results
  validationResult?: {
    isValid: boolean;
    confidence: number; // 0-1
    score: number; // 0-100
    findings: string[];
    recommendations: string[];
    dataQuality: number; // 0-1
  };

  // External data retrieved
  externalData?: {
    satelliteImagery?: {
      imageUrl: string;
      analysisDate: number;
      vegetationIndex?: number;
      changeDetection?: string;
      resolution: string;
    };
    weatherData?: {
      temperature: number;
      rainfall: number;
      humidity: number;
      solarRadiation?: number;
      windSpeed?: number;
    };
    carbonRegistryData?: {
      registryId: string;
      creditStatus: string;
      verificationStatus: string;
      lastAuditDate?: number;
    };
    iotSensorData?: {
      sensorId: string;
      measurements: Record<string, number>;
      lastReading: number;
      dataQuality: number;
    };
  };

  // Request metadata
  requestedAt: number;
  completedAt?: number;
  errorMessage?: string;
  cost?: number;
  processingTime?: number;
}

export interface ValidationOrchestrationResult {
  projectId: Id<'projects'>;
  orchestrationId: string;
  results: ThirdPartyValidationResult[];
  consensusResult: ValidationResult;
  conflictResolution?: {
    conflicts: string[];
    resolution: string;
    confidence: number;
  };
  totalCost: number;
  totalTime: number;
  overallReliability: number;
}

// ============= THIRD-PARTY VALIDATION ORCHESTRATOR =============

/**
 * Register a new third-party validation provider
 */
export const registerValidationProvider = mutation({
  args: {
    provider: v.object({
      id: v.string(),
      name: v.string(),
      type: v.union(
        v.literal('satellite'),
        v.literal('weather'),
        v.literal('carbon_registry'),
        v.literal('certification_body'),
        v.literal('iot_sensor'),
        v.literal('government_api')
      ),
      apiEndpoint: v.optional(v.string()),
      authMethod: v.union(
        v.literal('api_key'),
        v.literal('oauth'),
        v.literal('certificate'),
        v.literal('webhook')
      ),
      supportedProjectTypes: v.array(v.string()),
      supportedMetrics: v.array(v.string()),
      reliability: v.number(),
      costPerValidation: v.optional(v.number()),
      averageResponseTime: v.optional(v.number()),
      isActive: v.boolean(),
    }),
    credentials: v.object({
      apiKey: v.optional(v.string()),
      clientId: v.optional(v.string()),
      clientSecret: v.optional(v.string()),
      certificatePath: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    // Store provider configuration
    const providerId = await ctx.db.insert('monitoringConfig', {
      projectType: 'all',
      configKey: `third_party_provider_${args.provider.id}`,
      configValue: {
        ...args.provider,
        credentials: args.credentials, // In production, encrypt these
      },
      isActive: args.provider.isActive,
      description: `Third-party validation provider: ${args.provider.name}`,
    });

    return providerId;
  },
});

/**
 * Orchestrate validation using multiple third-party providers
 */
export const orchestrateThirdPartyValidation = mutation({
  args: {
    projectId: v.id('projects'),
    metrics: v.object({
      carbonImpactToDate: v.optional(v.number()),
      treesPlanted: v.optional(v.number()),
      energyGenerated: v.optional(v.number()),
      wasteProcessed: v.optional(v.number()),
      areaRestored: v.optional(v.number()),
      biodiversityImpact: v.optional(v.number()),
    }),
    validationStrategy: v.union(
      v.literal('consensus'), // Use multiple providers and find consensus
      v.literal('primary_backup'), // Use primary provider, fallback if needed
      v.literal('comprehensive'), // Use all available providers
      v.literal('cost_optimized') // Use cheapest reliable providers
    ),
    maxCost: v.optional(v.number()),
    maxWaitTime: v.optional(v.number()), // milliseconds
  },
  handler: async (ctx, args): Promise<ValidationOrchestrationResult> => {
    const orchestrationId = `validation_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    // Get project details
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get available providers for this project type and metrics
    const availableProviders = await getAvailableProviders(
      ctx,
      project.projectType,
      Object.keys(args.metrics)
    );

    // Select providers based on strategy
    const selectedProviders = selectProviders(
      availableProviders,
      args.validationStrategy,
      args.maxCost,
      args.maxWaitTime
    );

    // Execute validation requests in parallel
    const validationPromises = selectedProviders.map((provider) =>
      executeValidationRequest(ctx, {
        projectId: args.projectId,
        providerId: provider.id,
        metrics: args.metrics,
        requestType: 'verification',
        priority: 'normal',
        metadata: {
          orchestrationId,
          projectType: project.projectType,
          strategy: args.validationStrategy,
        },
      })
    );

    const results = await Promise.allSettled(validationPromises);
    const completedResults = results
      .filter(
        (
          result
        ): result is PromiseFulfilledResult<ThirdPartyValidationResult> =>
          result.status === 'fulfilled' && result.value.status === 'completed'
      )
      .map((result) => result.value);

    // Calculate consensus result
    const consensusResult = calculateConsensus(completedResults, args.metrics);

    // Handle conflicts if any
    const conflictResolution = identifyAndResolveConflicts(completedResults);

    // Calculate totals
    const totalCost = completedResults.reduce(
      (sum, result) => sum + (result.cost || 0),
      0
    );
    const totalTime = Math.max(
      ...completedResults.map((result) => result.processingTime || 0)
    );
    const overallReliability = calculateOverallReliability(
      completedResults,
      availableProviders
    );

    const orchestrationResult: ValidationOrchestrationResult = {
      projectId: args.projectId,
      orchestrationId,
      results: completedResults,
      consensusResult,
      conflictResolution,
      totalCost,
      totalTime,
      overallReliability,
    };

    // Note: Orchestration result could be stored for audit trail
    // This would require implementing storeOrchestrationResult mutation

    return orchestrationResult;
  },
});

/**
 * Execute a single third-party validation request
 */
async function executeValidationRequest(
  ctx: any,
  request: ValidationRequest
): Promise<ThirdPartyValidationResult> {
  const startTime = Date.now();
  const requestId = `req_${startTime}_${Math.random().toString(36).substring(2, 11)}`;

  try {
    // Get provider configuration
    const providerConfig = await getProviderConfig(ctx, request.providerId);
    if (!providerConfig) {
      throw new Error(`Provider ${request.providerId} not found`);
    }

    // Execute validation based on provider type
    let validationResult: ThirdPartyValidationResult;

    switch (providerConfig.type) {
      case 'satellite':
        validationResult = await validateWithSatelliteData(
          request,
          providerConfig,
          requestId
        );
        break;
      case 'weather':
        validationResult = await validateWithWeatherData(
          request,
          providerConfig,
          requestId
        );
        break;
      case 'carbon_registry':
        validationResult = await validateWithCarbonRegistry(
          request,
          providerConfig,
          requestId
        );
        break;
      case 'iot_sensor':
        validationResult = await validateWithIoTSensors(
          request,
          providerConfig,
          requestId
        );
        break;
      case 'government_api':
        validationResult = await validateWithGovernmentAPI(
          request,
          providerConfig,
          requestId
        );
        break;
      default:
        throw new Error(`Unsupported provider type: ${providerConfig.type}`);
    }

    validationResult.processingTime = Date.now() - startTime;
    return validationResult;
  } catch (error) {
    return {
      providerId: request.providerId,
      providerName: 'Unknown',
      requestId,
      status: 'failed',
      requestedAt: startTime,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      processingTime: Date.now() - startTime,
    };
  }
}

/**
 * Validate using satellite imagery data
 */
async function validateWithSatelliteData(
  request: ValidationRequest,
  providerConfig: ThirdPartyProvider,
  requestId: string
): Promise<ThirdPartyValidationResult> {
  // Simulate satellite API call
  // In production, this would make actual API calls to services like:
  // - Google Earth Engine
  // - Planet Labs
  // - Sentinel Hub
  // - NASA Earth Data

  const result: ThirdPartyValidationResult = {
    providerId: request.providerId,
    providerName: providerConfig.name,
    requestId,
    status: 'completed',
    requestedAt: Date.now(),
    completedAt: Date.now() + 5000, // Simulate 5 second processing
  };

  // Simulate satellite validation for reforestation projects
  if (
    request.metrics.treesPlanted &&
    request.metadata?.projectType === 'reforestation'
  ) {
    const vegetationIndex = 0.6 + Math.random() * 0.3; // NDVI between 0.6-0.9
    const expectedVegetation = Math.min(
      request.metrics.treesPlanted / 1000,
      1.0
    );
    const confidence = 1 - Math.abs(vegetationIndex - expectedVegetation);

    result.validationResult = {
      isValid: confidence > 0.7,
      confidence,
      score: Math.round(confidence * 100),
      findings: [
        `Vegetation index (NDVI): ${vegetationIndex.toFixed(3)}`,
        `Expected vegetation coverage: ${expectedVegetation.toFixed(3)}`,
        `Satellite imagery shows ${confidence > 0.8 ? 'strong' : 'moderate'} vegetation growth`,
      ],
      recommendations:
        confidence < 0.7
          ? [
              'Vegetation growth appears slower than reported',
              'Consider ground verification of tree survival rates',
            ]
          : [],
      dataQuality: 0.9,
    };

    result.externalData = {
      satelliteImagery: {
        imageUrl: `https://satellite-api.example.com/image/${requestId}`,
        analysisDate: Date.now(),
        vegetationIndex,
        changeDetection: 'Positive vegetation growth detected',
        resolution: '10m',
      },
    };
  }

  result.cost = providerConfig.costPerValidation || 25;
  return result;
}

/**
 * Validate using weather data
 */
async function validateWithWeatherData(
  request: ValidationRequest,
  providerConfig: ThirdPartyProvider,
  requestId: string
): Promise<ThirdPartyValidationResult> {
  // Simulate weather API validation
  // In production, this would integrate with services like:
  // - OpenWeatherMap
  // - Weather Underground
  // - NOAA API
  // - Local meteorological services

  const result: ThirdPartyValidationResult = {
    providerId: request.providerId,
    providerName: providerConfig.name,
    requestId,
    status: 'completed',
    requestedAt: Date.now(),
    completedAt: Date.now() + 2000,
  };

  // Simulate weather validation for solar projects
  if (
    request.metrics.energyGenerated &&
    request.metadata?.projectType === 'solar'
  ) {
    const solarRadiation = 4.5 + Math.random() * 2; // kWh/m²/day
    const expectedGeneration = solarRadiation * 100; // Assume 100m² system
    const actualGeneration = request.metrics.energyGenerated;
    const efficiency = actualGeneration / expectedGeneration;

    result.validationResult = {
      isValid: efficiency >= 0.6 && efficiency <= 1.2,
      confidence: efficiency >= 0.8 ? 0.9 : 0.7,
      score: Math.round(Math.min(efficiency, 1) * 100),
      findings: [
        `Solar radiation: ${solarRadiation.toFixed(2)} kWh/m²/day`,
        `Expected generation: ${expectedGeneration.toFixed(1)} kWh`,
        `Actual generation: ${actualGeneration.toFixed(1)} kWh`,
        `System efficiency: ${(efficiency * 100).toFixed(1)}%`,
      ],
      recommendations:
        efficiency < 0.7
          ? [
              'System efficiency is below expected range',
              'Check for equipment issues or shading problems',
            ]
          : [],
      dataQuality: 0.95,
    };

    result.externalData = {
      weatherData: {
        temperature: 25 + Math.random() * 10,
        rainfall: Math.random() * 20,
        humidity: 50 + Math.random() * 30,
        solarRadiation,
        windSpeed: Math.random() * 15,
      },
    };
  }

  result.cost = providerConfig.costPerValidation || 5;
  return result;
}

/**
 * Validate using carbon registry data
 */
async function validateWithCarbonRegistry(
  request: ValidationRequest,
  providerConfig: ThirdPartyProvider,
  requestId: string
): Promise<ThirdPartyValidationResult> {
  // Simulate carbon registry validation
  // In production, this would integrate with:
  // - Verra VCS Registry
  // - Gold Standard Registry
  // - Climate Action Reserve
  // - American Carbon Registry

  const result: ThirdPartyValidationResult = {
    providerId: request.providerId,
    providerName: providerConfig.name,
    requestId,
    status: 'completed',
    requestedAt: Date.now(),
    completedAt: Date.now() + 10000,
  };

  // Simulate registry validation
  const registryStatus = Math.random() > 0.1 ? 'verified' : 'pending';
  const isValid = registryStatus === 'verified';

  result.validationResult = {
    isValid,
    confidence: isValid ? 0.95 : 0.6,
    score: isValid ? 95 : 60,
    findings: [
      `Registry status: ${registryStatus}`,
      `Credit methodology verified: ${isValid}`,
      `Compliance with registry standards: ${isValid ? 'Yes' : 'Pending'}`,
    ],
    recommendations: !isValid
      ? [
          'Complete registry verification process',
          'Ensure all documentation meets registry standards',
        ]
      : [],
    dataQuality: 1.0,
  };

  result.externalData = {
    carbonRegistryData: {
      registryId: `REG-${requestId}`,
      creditStatus: registryStatus,
      verificationStatus: registryStatus,
      lastAuditDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    },
  };

  result.cost = providerConfig.costPerValidation || 50;
  return result;
}

/**
 * Validate using IoT sensor data
 */
async function validateWithIoTSensors(
  request: ValidationRequest,
  providerConfig: ThirdPartyProvider,
  requestId: string
): Promise<ThirdPartyValidationResult> {
  // Simulate IoT sensor validation for real-time monitoring

  const result: ThirdPartyValidationResult = {
    providerId: request.providerId,
    providerName: providerConfig.name,
    requestId,
    status: 'completed',
    requestedAt: Date.now(),
    completedAt: Date.now() + 1000,
  };

  // Simulate sensor data validation
  const sensorReliability = 0.85 + Math.random() * 0.1;
  const measurements: Record<string, number> = {};

  if (request.metrics.energyGenerated) {
    measurements.powerOutput =
      request.metrics.energyGenerated * (0.9 + Math.random() * 0.2);
  }
  if (request.metrics.wasteProcessed) {
    measurements.flowRate =
      request.metrics.wasteProcessed * (0.95 + Math.random() * 0.1);
  }

  result.validationResult = {
    isValid: sensorReliability > 0.8,
    confidence: sensorReliability,
    score: Math.round(sensorReliability * 100),
    findings: [
      `Sensor data reliability: ${(sensorReliability * 100).toFixed(1)}%`,
      `Real-time measurements align with reported values`,
    ],
    recommendations:
      sensorReliability < 0.85
        ? [
            'Check sensor calibration and maintenance',
            'Consider sensor replacement or additional validation',
          ]
        : [],
    dataQuality: sensorReliability,
  };

  result.externalData = {
    iotSensorData: {
      sensorId: `SENSOR-${requestId}`,
      measurements,
      lastReading: Date.now(),
      dataQuality: sensorReliability,
    },
  };

  result.cost = providerConfig.costPerValidation || 10;
  return result;
}

/**
 * Validate using government APIs
 */
async function validateWithGovernmentAPI(
  request: ValidationRequest,
  providerConfig: ThirdPartyProvider,
  requestId: string
): Promise<ThirdPartyValidationResult> {
  // Simulate government API validation for permits and compliance

  const result: ThirdPartyValidationResult = {
    providerId: request.providerId,
    providerName: providerConfig.name,
    requestId,
    status: 'completed',
    requestedAt: Date.now(),
    completedAt: Date.now() + 15000,
  };

  const complianceStatus = Math.random() > 0.05 ? 'compliant' : 'non_compliant';
  const isValid = complianceStatus === 'compliant';

  result.validationResult = {
    isValid,
    confidence: isValid ? 0.98 : 0.95,
    score: isValid ? 98 : 30,
    findings: [
      `Regulatory compliance: ${complianceStatus}`,
      `Permits status: Active`,
      `Environmental regulations: ${isValid ? 'Met' : 'Violation detected'}`,
    ],
    recommendations: !isValid
      ? [
          'Address regulatory compliance issues immediately',
          'Contact local environmental authorities',
        ]
      : [],
    dataQuality: 0.98,
  };

  result.cost = providerConfig.costPerValidation || 15;
  return result;
}

/**
 * Validate using certification body
 */
async function validateWithCertificationBody(
  request: ValidationRequest,
  providerConfig: ThirdPartyProvider,
  requestId: string
): Promise<ThirdPartyValidationResult> {
  // Simulate certification body validation

  const result: ThirdPartyValidationResult = {
    providerId: request.providerId,
    providerName: providerConfig.name,
    requestId,
    status: 'completed',
    requestedAt: Date.now(),
    completedAt: Date.now() + 20000,
  };

  const certificationStatus =
    Math.random() > 0.1 ? 'certified' : 'pending_review';
  const isValid = certificationStatus === 'certified';

  result.validationResult = {
    isValid,
    confidence: isValid ? 0.95 : 0.8,
    score: isValid ? 95 : 70,
    findings: [
      `Certification status: ${certificationStatus}`,
      `Standards compliance: ${isValid ? 'Verified' : 'Under review'}`,
      `Third-party audit: ${isValid ? 'Passed' : 'Scheduled'}`,
    ],
    recommendations: !isValid
      ? [
          'Complete certification review process',
          'Ensure all documentation meets certification standards',
        ]
      : [],
    dataQuality: 0.95,
  };

  result.cost = providerConfig.costPerValidation || 75;
  return result;
}

// ============= UTILITY FUNCTIONS =============

async function getAvailableProviders(
  ctx: any,
  projectType: string,
  metrics: string[]
): Promise<ThirdPartyProvider[]> {
  const providerConfigs = await ctx.db
    .query('monitoringConfig')
    .filter((q: any) =>
      q.and(
        q.gte(q.field('configKey'), 'third_party_provider_'),
        q.lt(q.field('configKey'), 'third_party_provider_~'),
        q.eq(q.field('isActive'), true)
      )
    )
    .collect();

  return providerConfigs
    .map((config: any) => config.configValue as ThirdPartyProvider)
    .filter(
      (provider: ThirdPartyProvider) =>
        provider.supportedProjectTypes.includes(projectType) ||
        provider.supportedProjectTypes.includes('all')
    )
    .filter((provider: ThirdPartyProvider) =>
      metrics.some((metric) => provider.supportedMetrics.includes(metric))
    )
    .sort(
      (a: ThirdPartyProvider, b: ThirdPartyProvider) =>
        b.reliability - a.reliability
    );
}

function selectProviders(
  availableProviders: ThirdPartyProvider[],
  strategy: 'consensus' | 'primary_backup' | 'comprehensive' | 'cost_optimized',
  maxCost?: number,
  maxWaitTime?: number
): ThirdPartyProvider[] {
  let selected: ThirdPartyProvider[] = [];

  switch (strategy) {
    case 'consensus':
      // Select top 3 most reliable providers
      selected = availableProviders.slice(0, 3);
      break;
    case 'primary_backup':
      // Select primary and one backup
      selected = availableProviders.slice(0, 2);
      break;
    case 'comprehensive':
      // Use all available providers
      selected = availableProviders;
      break;
    case 'cost_optimized':
      // Select cheapest providers that meet reliability threshold
      selected = availableProviders
        .filter((p) => p.reliability >= 0.8)
        .sort((a, b) => (a.costPerValidation || 0) - (b.costPerValidation || 0))
        .slice(0, 2);
      break;
  }

  // Apply cost and time constraints
  if (maxCost) {
    selected = selected.filter((p) => (p.costPerValidation || 0) <= maxCost);
  }
  if (maxWaitTime) {
    selected = selected.filter(
      (p) => (p.averageResponseTime || 0) <= maxWaitTime
    );
  }

  return selected;
}

function calculateConsensus(
  results: ThirdPartyValidationResult[],
  originalMetrics: EnvironmentalMetrics
): ValidationResult {
  if (results.length === 0) {
    return {
      isValid: false,
      score: 0,
      warnings: ['No third-party validation results available'],
      errors: ['Third-party validation failed'],
      anomalies: [],
      recommendations: ['Retry validation with different providers'],
    };
  }

  const validResults = results.filter((r) => r.validationResult);
  if (validResults.length === 0) {
    return {
      isValid: false,
      score: 0,
      warnings: ['No valid third-party validation results'],
      errors: ['All third-party validations failed'],
      anomalies: [],
      recommendations: ['Check provider configurations and retry'],
    };
  }

  // Calculate weighted consensus
  const totalWeight = validResults.reduce((sum, result) => {
    const provider = results.find((r) => r.providerId === result.providerId);
    return sum + (provider ? 1 : 0); // Equal weight for now, can be enhanced
  }, 0);

  const weightedScore =
    validResults.reduce((sum, result) => {
      return sum + (result.validationResult?.score || 0);
    }, 0) / validResults.length;

  const consensusIsValid =
    validResults.filter((r) => r.validationResult?.isValid).length >
    validResults.length / 2;

  // Aggregate findings and recommendations
  const allFindings = validResults.flatMap(
    (r) => r.validationResult?.findings || []
  );
  const allRecommendations = validResults.flatMap(
    (r) => r.validationResult?.recommendations || []
  );

  return {
    isValid: consensusIsValid,
    score: Math.round(weightedScore),
    warnings: consensusIsValid
      ? []
      : ['Consensus validation indicates potential issues'],
    errors: [],
    anomalies: [],
    recommendations: [...new Set(allRecommendations)], // Remove duplicates
  };
}

function identifyAndResolveConflicts(
  results: ThirdPartyValidationResult[]
): ValidationOrchestrationResult['conflictResolution'] | undefined {
  const validResults = results.filter((r) => r.validationResult);
  if (validResults.length < 2) return undefined;

  const conflicts: string[] = [];
  const validityResults = validResults.map((r) => r.validationResult?.isValid);
  const scoreResults = validResults.map((r) => r.validationResult?.score || 0);

  // Check for validity conflicts
  const validCount = validityResults.filter((v) => v).length;
  const invalidCount = validityResults.length - validCount;

  if (validCount > 0 && invalidCount > 0) {
    conflicts.push(
      `Validity conflict: ${validCount} providers say valid, ${invalidCount} say invalid`
    );
  }

  // Check for score conflicts (large variance)
  const avgScore =
    scoreResults.reduce((sum, score) => sum + score, 0) / scoreResults.length;
  const variance =
    scoreResults.reduce(
      (sum, score) => sum + Math.pow(score - avgScore, 2),
      0
    ) / scoreResults.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev > 20) {
    conflicts.push(
      `High score variance: ${stdDev.toFixed(1)} points standard deviation`
    );
  }

  if (conflicts.length === 0) return undefined;

  // Resolution strategy: weight by provider reliability
  const weightedValidityScore =
    validResults.reduce((sum, result, index) => {
      const provider = results.find((r) => r.providerId === result.providerId);
      const weight = 1; // Could use provider reliability as weight
      return sum + (validityResults[index] ? weight : 0);
    }, 0) / validResults.length;

  return {
    conflicts,
    resolution:
      weightedValidityScore > 0.5
        ? 'Consensus leans toward valid'
        : 'Consensus leans toward invalid',
    confidence: Math.abs(weightedValidityScore - 0.5) * 2, // 0-1 scale
  };
}

function calculateOverallReliability(
  results: ThirdPartyValidationResult[],
  providers: ThirdPartyProvider[]
): number {
  if (results.length === 0) return 0;

  const totalReliability = results.reduce((sum, result) => {
    const provider = providers.find((p) => p.id === result.providerId);
    return sum + (provider?.reliability || 0.5);
  }, 0);

  return totalReliability / results.length;
}

async function getProviderConfig(
  ctx: any,
  providerId: string
): Promise<ThirdPartyProvider | null> {
  const config = await ctx.db
    .query('monitoringConfig')
    .filter((q: any) =>
      q.and(
        q.eq(q.field('configKey'), `third_party_provider_${providerId}`),
        q.eq(q.field('isActive'), true)
      )
    )
    .first();

  return config?.configValue || null;
}

/**
 * Store orchestration result for future reference
 */
export const storeOrchestrationResult = mutation({
  args: { result: v.any() },
  handler: async (ctx, args) => {
    const result = args.result as ValidationOrchestrationResult;

    await ctx.db.insert('auditLogs', {
      userId: undefined,
      action: 'third_party_validation_orchestration',
      entityType: 'project',
      entityId: result.projectId,
      newValues: result,
      metadata: {
        orchestrationId: result.orchestrationId,
        providerCount: result.results.length,
        totalCost: result.totalCost,
        overallReliability: result.overallReliability,
      },
      severity: result.consensusResult.isValid ? 'info' : 'warning',
    });

    return result.orchestrationId;
  },
});

/**
 * Get third-party validation history for a project
 */
export const getValidationHistory = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    const history = await ctx.db
      .query('auditLogs')
      .filter((q: any) =>
        q.and(
          q.eq(q.field('entityType'), 'project'),
          q.eq(q.field('entityId'), args.projectId),
          q.eq(q.field('action'), 'third_party_validation_orchestration')
        )
      )
      .order('desc')
      .take(10);

    return history.map((log) => ({
      orchestrationId: log.metadata?.orchestrationId,
      timestamp: log._creationTime,
      providerCount: log.metadata?.providerCount,
      totalCost: log.metadata?.totalCost,
      reliability: log.metadata?.overallReliability,
      result: log.newValues,
    }));
  },
});
