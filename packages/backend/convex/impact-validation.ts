import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';

// ============= TYPES AND INTERFACES =============

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100 validation confidence score
  warnings: string[];
  errors: string[];
  anomalies: string[];
  recommendations: string[];
}

export interface EnvironmentalMetrics {
  carbonImpactToDate?: number;
  treesPlanted?: number;
  energyGenerated?: number; // kWh
  wasteProcessed?: number; // tons
  areaRestored?: number; // hectares
  biodiversityImpact?: number;
}

export interface ValidationContext {
  projectType: string;
  projectAge: number; // days since project start
  totalBudget: number;
  areaSize: number;
  location: {
    lat: number;
    long: number;
    name: string;
  };
  historicalData: EnvironmentalMetrics[];
  expectedTimeline: number; // expected project duration in days
}

// ============= VALIDATION FRAMEWORK =============

/**
 * Main validation function that orchestrates all validation checks
 */
export const validateEnvironmentalMetrics = mutation({
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
  },
  handler: async (ctx, args): Promise<ValidationResult> => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get historical data for this project
    const historicalUpdates = await ctx.db
      .query('progressUpdates')
      .withIndex('by_project', (q: any) => q.eq('projectId', args.projectId))
      .filter((q: any) => q.eq(q.field('isVerified'), true))
      .collect();

    const historicalMetrics = historicalUpdates.map((update) => ({
      carbonImpactToDate: update.carbonImpactToDate || 0,
      treesPlanted: update.treesPlanted || 0,
      energyGenerated: update.energyGenerated || 0,
      wasteProcessed: update.wasteProcessed || 0,
      areaRestored: 0, // TODO: Add to progressUpdates schema
      biodiversityImpact: 0, // TODO: Add to progressUpdates schema
    }));

    const context: ValidationContext = {
      projectType: project.projectType,
      projectAge: Math.floor(
        (Date.now() - new Date(project.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      ),
      totalBudget: project.budget,
      areaSize: project.areaSize,
      location: project.location,
      historicalData: historicalMetrics,
      expectedTimeline: Math.floor(
        (new Date(project.expectedCompletionDate).getTime() -
          new Date(project.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      ),
    };

    // Run validation based on project type
    const result = await validateByProjectType(args.metrics, context);

    // Store validation result in audit logs
    await ctx.db.insert('auditLogs', {
      userId: undefined, // system action
      action: 'environmental_validation',
      entityType: 'project',
      entityId: args.projectId,
      oldValues: undefined,
      newValues: {
        metrics: args.metrics,
        validationResult: result,
      },
      metadata: {
        projectType: project.projectType,
        validationScore: result.score,
      },
      severity:
        result.errors.length > 0
          ? 'error'
          : result.warnings.length > 0
            ? 'warning'
            : 'info',
    });

    return result;
  },
});

/**
 * Project-type specific validation dispatcher
 */
async function validateByProjectType(
  metrics: EnvironmentalMetrics,
  context: ValidationContext
): Promise<ValidationResult> {
  switch (context.projectType) {
    case 'reforestation':
      return validateReforestationMetrics(metrics, context);
    case 'solar':
      return validateSolarMetrics(metrics, context);
    case 'wind':
      return validateWindMetrics(metrics, context);
    case 'biogas':
      return validateBiogasMetrics(metrics, context);
    case 'waste_management':
      return validateWasteManagementMetrics(metrics, context);
    case 'mangrove_restoration':
      return validateMangroveRestorationMetrics(metrics, context);
    default:
      return {
        isValid: false,
        score: 0,
        warnings: [],
        errors: [`Unknown project type: ${context.projectType}`],
        anomalies: [],
        recommendations: [],
      };
  }
}

// ============= PROJECT-TYPE SPECIFIC VALIDATORS =============

/**
 * Validate reforestation project metrics
 */
function validateReforestationMetrics(
  metrics: EnvironmentalMetrics,
  context: ValidationContext
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    score: 100,
    warnings: [],
    errors: [],
    anomalies: [],
    recommendations: [],
  };

  // Trees planted validation
  if (metrics.treesPlanted !== undefined) {
    // Expected planting density: 400-2500 trees per hectare
    const expectedMinTrees = context.areaSize * 400;
    const expectedMaxTrees = context.areaSize * 2500;
    const progressRatio = context.projectAge / context.expectedTimeline;
    const expectedCurrentTrees = expectedMaxTrees * progressRatio;

    if (metrics.treesPlanted < 0) {
      result.errors.push('Trees planted cannot be negative');
      result.score -= 30;
    } else if (metrics.treesPlanted > expectedMaxTrees * 1.2) {
      result.warnings.push(
        `Trees planted (${metrics.treesPlanted}) exceeds expected maximum for area (${expectedMaxTrees})`
      );
      result.score -= 10;
    } else if (metrics.treesPlanted < expectedCurrentTrees * 0.5) {
      result.warnings.push(
        `Trees planted (${metrics.treesPlanted}) is significantly below expected progress (${Math.floor(expectedCurrentTrees)})`
      );
      result.score -= 15;
    }
  }

  // Carbon impact validation for reforestation
  if (metrics.carbonImpactToDate !== undefined) {
    // Average CO2 sequestration: 20-50 kg per tree per year
    const treesPlanted = metrics.treesPlanted || 0;
    const yearsGrown = context.projectAge / 365;
    const expectedMinCO2 = treesPlanted * 20 * yearsGrown;
    const expectedMaxCO2 = treesPlanted * 50 * yearsGrown;

    if (metrics.carbonImpactToDate < 0) {
      result.errors.push('Carbon impact cannot be negative');
      result.score -= 30;
    } else if (metrics.carbonImpactToDate > expectedMaxCO2 * 1.5) {
      result.anomalies.push(
        `Carbon impact (${metrics.carbonImpactToDate} kg) seems unusually high for ${treesPlanted} trees`
      );
      result.score -= 20;
    } else if (
      metrics.carbonImpactToDate < expectedMinCO2 * 0.3 &&
      context.projectAge > 180
    ) {
      result.warnings.push(
        `Carbon impact (${metrics.carbonImpactToDate} kg) is lower than expected for tree age`
      );
      result.score -= 10;
    }
  }

  // Historical trend analysis
  if (context.historicalData.length > 1) {
    const trendAnalysis = analyzeTrend(context.historicalData, 'treesPlanted');
    if (trendAnalysis.isDecreasing) {
      result.warnings.push('Tree planting progress appears to be slowing down');
      result.recommendations.push(
        'Consider reviewing project timeline and resources'
      );
    }
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Validate solar energy project metrics
 */
function validateSolarMetrics(
  metrics: EnvironmentalMetrics,
  context: ValidationContext
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    score: 100,
    warnings: [],
    errors: [],
    anomalies: [],
    recommendations: [],
  };

  if (metrics.energyGenerated !== undefined) {
    // Solar panel efficiency: 150-250 kWh per m² per year
    const expectedMinEnergy =
      context.areaSize * 1500 * (context.projectAge / 365); // Conservative estimate
    const expectedMaxEnergy =
      context.areaSize * 2500 * (context.projectAge / 365);

    if (metrics.energyGenerated < 0) {
      result.errors.push('Energy generated cannot be negative');
      result.score -= 30;
    } else if (metrics.energyGenerated > expectedMaxEnergy * 1.3) {
      result.anomalies.push(
        `Energy generation (${metrics.energyGenerated} kWh) seems unusually high for ${context.areaSize}m² installation`
      );
      result.score -= 15;
    } else if (
      metrics.energyGenerated < expectedMinEnergy * 0.6 &&
      context.projectAge > 90
    ) {
      result.warnings.push(
        `Energy generation (${metrics.energyGenerated} kWh) is below expected range`
      );
      result.score -= 10;
    }
  }

  // Carbon impact validation for solar
  if (
    metrics.carbonImpactToDate !== undefined &&
    metrics.energyGenerated !== undefined
  ) {
    // Average grid emission factor: 0.4-0.8 kg CO2 per kWh
    const expectedCO2Avoided = metrics.energyGenerated * 0.6; // Use middle value

    if (
      Math.abs(metrics.carbonImpactToDate - expectedCO2Avoided) >
      expectedCO2Avoided * 0.3
    ) {
      result.warnings.push(
        `Carbon impact (${metrics.carbonImpactToDate} kg) doesn't align with energy generation`
      );
      result.recommendations.push(
        'Verify carbon emission factors for your region'
      );
    }
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Validate wind energy project metrics
 */
function validateWindMetrics(
  metrics: EnvironmentalMetrics,
  context: ValidationContext
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    score: 100,
    warnings: [],
    errors: [],
    anomalies: [],
    recommendations: [],
  };

  if (metrics.energyGenerated !== undefined) {
    // Wind turbine capacity factor: 25-45% typically
    // Assuming 2-3 MW per km² for wind farms
    const expectedCapacityMW = context.areaSize * 0.002; // Conservative estimate
    const expectedAnnualGeneration = expectedCapacityMW * 8760 * 0.35; // 35% capacity factor
    const expectedCurrentGeneration =
      expectedAnnualGeneration * (context.projectAge / 365);

    if (metrics.energyGenerated < 0) {
      result.errors.push('Energy generated cannot be negative');
      result.score -= 30;
    } else if (metrics.energyGenerated > expectedCurrentGeneration * 1.5) {
      result.anomalies.push(
        `Energy generation appears unusually high for wind project`
      );
      result.score -= 15;
    } else if (
      metrics.energyGenerated < expectedCurrentGeneration * 0.4 &&
      context.projectAge > 90
    ) {
      result.warnings.push(`Wind energy generation is below expected range`);
      result.recommendations.push(
        'Check wind resource assessment and turbine performance'
      );
    }
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Validate biogas project metrics
 */
function validateBiogasMetrics(
  metrics: EnvironmentalMetrics,
  context: ValidationContext
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    score: 100,
    warnings: [],
    errors: [],
    anomalies: [],
    recommendations: [],
  };

  if (metrics.wasteProcessed !== undefined) {
    // Typical biogas plant: 1-5 tons of waste per day per unit
    const expectedDailyProcessing = context.areaSize * 0.1; // Conservative estimate
    const expectedCurrentProcessing =
      expectedDailyProcessing * context.projectAge;

    if (metrics.wasteProcessed < 0) {
      result.errors.push('Waste processed cannot be negative');
      result.score -= 30;
    } else if (metrics.wasteProcessed > expectedCurrentProcessing * 2) {
      result.anomalies.push(`Waste processing volume seems unusually high`);
      result.score -= 15;
    }
  }

  if (
    metrics.energyGenerated !== undefined &&
    metrics.wasteProcessed !== undefined
  ) {
    // Biogas yield: 50-150 m³ per ton of organic waste
    // Energy content: 6 kWh per m³ of biogas
    const expectedEnergyYield = metrics.wasteProcessed * 100 * 6; // Conservative estimate

    if (metrics.energyGenerated > expectedEnergyYield * 1.5) {
      result.warnings.push(
        `Energy generation seems high relative to waste processed`
      );
    } else if (metrics.energyGenerated < expectedEnergyYield * 0.3) {
      result.warnings.push(
        `Energy generation seems low relative to waste processed`
      );
      result.recommendations.push(
        'Check biogas production efficiency and equipment performance'
      );
    }
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Validate waste management project metrics
 */
function validateWasteManagementMetrics(
  metrics: EnvironmentalMetrics,
  context: ValidationContext
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    score: 100,
    warnings: [],
    errors: [],
    anomalies: [],
    recommendations: [],
  };

  if (metrics.wasteProcessed !== undefined) {
    if (metrics.wasteProcessed < 0) {
      result.errors.push('Waste processed cannot be negative');
      result.score -= 30;
    }

    // Check against project capacity
    const expectedCapacity = context.totalBudget * 0.001; // Rough estimate based on budget
    if (metrics.wasteProcessed > expectedCapacity * 10) {
      result.anomalies.push(
        `Waste processing volume seems unusually high for project capacity`
      );
    }
  }

  if (
    metrics.carbonImpactToDate !== undefined &&
    metrics.wasteProcessed !== undefined
  ) {
    // Waste management CO2 savings: 0.5-2 tons CO2 per ton of waste
    const expectedCO2Savings = metrics.wasteProcessed * 1000; // 1 ton CO2 per ton waste (conservative)

    if (metrics.carbonImpactToDate > expectedCO2Savings * 2) {
      result.warnings.push(
        `Carbon impact seems high relative to waste processed`
      );
    } else if (metrics.carbonImpactToDate < expectedCO2Savings * 0.2) {
      result.warnings.push(
        `Carbon impact seems low for the amount of waste processed`
      );
    }
  }

  result.isValid = result.errors.length === 0;
  return result;
}

/**
 * Validate mangrove restoration project metrics
 */
function validateMangroveRestorationMetrics(
  metrics: EnvironmentalMetrics,
  context: ValidationContext
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    score: 100,
    warnings: [],
    errors: [],
    anomalies: [],
    recommendations: [],
  };

  if (metrics.areaRestored !== undefined) {
    if (metrics.areaRestored < 0) {
      result.errors.push('Area restored cannot be negative');
      result.score -= 30;
    } else if (metrics.areaRestored > context.areaSize) {
      result.errors.push(
        `Area restored (${metrics.areaRestored} ha) cannot exceed project area (${context.areaSize} ha)`
      );
      result.score -= 25;
    }

    const progressRatio = context.projectAge / context.expectedTimeline;
    const expectedRestored = context.areaSize * progressRatio;

    if (metrics.areaRestored < expectedRestored * 0.5) {
      result.warnings.push(
        `Restoration progress (${metrics.areaRestored} ha) is behind schedule`
      );
      result.score -= 10;
    }
  }

  // Mangroves have high carbon sequestration potential
  if (
    metrics.carbonImpactToDate !== undefined &&
    metrics.areaRestored !== undefined
  ) {
    // Mangroves: 100-300 tons CO2 per hectare over 10 years
    const yearsGrown = Math.min(context.projectAge / 365, 1); // Cap at 1 year for initial growth
    const expectedCO2 = metrics.areaRestored * 1000 * 20 * yearsGrown; // 20 tons per hectare per year initial

    if (metrics.carbonImpactToDate > expectedCO2 * 2) {
      result.anomalies.push(
        `Carbon sequestration seems unusually high for young mangroves`
      );
    }
  }

  result.isValid = result.errors.length === 0;
  return result;
}

// ============= UTILITY FUNCTIONS =============

/**
 * Analyze trends in historical data
 */
function analyzeTrend(
  historicalData: EnvironmentalMetrics[],
  metric: keyof EnvironmentalMetrics
) {
  if (historicalData.length < 3) {
    return { isIncreasing: false, isDecreasing: false, isStable: true };
  }

  const values = historicalData
    .map((data) => data[metric] || 0)
    .filter((val) => val > 0);

  if (values.length < 3) {
    return { isIncreasing: false, isDecreasing: false, isStable: true };
  }

  const recentValues = values.slice(-3);
  const isIncreasing =
    recentValues[2] !== undefined && recentValues[1] !== undefined && recentValues[0] !== undefined &&
    recentValues[2] > recentValues[1] && recentValues[1] > recentValues[0];
  const isDecreasing =
    recentValues[2] !== undefined && recentValues[1] !== undefined && recentValues[0] !== undefined &&
    recentValues[2] < recentValues[1] && recentValues[1] < recentValues[0];

  return {
    isIncreasing,
    isDecreasing,
    isStable: !isIncreasing && !isDecreasing,
  };
}

/**
 * Get validation configuration for a project type
 */
export const getValidationConfig = query({
  args: { projectType: v.string() },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query('monitoringConfig')
      .withIndex('by_project_type_key', (q: any) =>
        q
          .eq('projectType', args.projectType)
          .eq('configKey', 'validation_thresholds')
      )
      .first();

    return config?.configValue || getDefaultValidationConfig(args.projectType);
  },
});

/**
 * Get default validation configuration for project types
 */
function getDefaultValidationConfig(projectType: string) {
  const configs: Record<string, any> = {
    reforestation: {
      treesPerHectare: { min: 400, max: 2500 },
      co2PerTreePerYear: { min: 20, max: 50 },
      minGrowthPeriod: 90, // days before expecting significant CO2 impact
    },
    solar: {
      kwhPerM2PerYear: { min: 150, max: 250 },
      co2PerKwh: 0.6, // kg CO2 avoided per kWh
      minOperationalPeriod: 30, // days
    },
    wind: {
      capacityFactor: { min: 0.25, max: 0.45 },
      mwPerKm2: { min: 2, max: 3 },
      co2PerKwh: 0.6,
    },
    biogas: {
      biogasYieldM3PerTon: { min: 50, max: 150 },
      kwhPerM3Biogas: 6,
      processingRatePerDay: 0.1, // tons per m² per day
    },
    waste_management: {
      co2PerTonWaste: { min: 500, max: 2000 },
      processingCapacityFactor: 0.8,
    },
    mangrove_restoration: {
      co2PerHectarePerYear: { min: 10, max: 30 },
      maxRestorationRate: 1.0, // hectares per hectare per year (100%)
    },
  };

  return configs[projectType] || {};
}

/**
 * Get project validation history
 */
export const getProjectValidationHistory = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    const validationLogs = await ctx.db
      .query('auditLogs')
      .filter((q: any) =>
        q.and(
          q.eq(q.field('entityType'), 'project'),
          q.eq(q.field('entityId'), args.projectId),
          q.eq(q.field('action'), 'environmental_validation')
        )
      )
      .order('desc')
      .take(20);

    return validationLogs.map((log) => ({
      timestamp: log._creationTime,
      metrics: log.newValues?.metrics,
      result: log.newValues?.validationResult,
      severity: log.severity,
    }));
  },
});
