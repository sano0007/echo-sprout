import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import type {
  ValidationResult,
  EnvironmentalMetrics,
  ValidationContext,
} from './impact_validation';

// ============= ADVANCED PROJECT-SPECIFIC VALIDATORS =============

export interface ValidatorConfiguration {
  projectType: string;
  thresholds: Record<string, any>;
  seasonalFactors?: Record<string, number>; // Month-based multipliers
  locationFactors?: Record<string, number>; // Region-based adjustments
  weatherDependency?: boolean;
}

/**
 * Advanced Reforestation Validator with survival rates and seasonal factors
 */
export class ReforestationValidator {
  private config: ValidatorConfiguration;

  constructor(config: ValidatorConfiguration) {
    this.config = config;
  }

  validate(
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

    // Advanced tree planting validation with seasonal factors
    if (metrics.treesPlanted !== undefined) {
      const seasonalFactor = this.getSeasonalFactor(
        new Date(Date.now() - context.projectAge * 24 * 60 * 60 * 1000)
      );
      const survivalRate = this.calculateExpectedSurvivalRate(
        context.projectAge
      );

      const expectedMinTrees =
        context.areaSize * this.config.thresholds.treesPerHectare.min;
      const expectedMaxTrees =
        context.areaSize * this.config.thresholds.treesPerHectare.max;
      const progressRatio = Math.min(
        context.projectAge / context.expectedTimeline,
        1.0
      );
      const expectedCurrentTrees =
        expectedMaxTrees * progressRatio * seasonalFactor;

      // Validate tree count
      this.validateTreeCount(
        metrics.treesPlanted,
        expectedCurrentTrees,
        expectedMaxTrees,
        result
      );

      // Validate survival rate if historical data available
      this.validateSurvivalRate(
        metrics.treesPlanted,
        context.historicalData,
        survivalRate,
        result
      );
    }

    // Advanced carbon impact validation with tree age modeling
    if (
      metrics.carbonImpactToDate !== undefined &&
      metrics.treesPlanted !== undefined
    ) {
      const carbonImpact = this.calculateExpectedCarbonImpact(
        metrics.treesPlanted,
        context.projectAge,
        context.location
      );

      this.validateCarbonImpact(
        metrics.carbonImpactToDate,
        carbonImpact,
        result
      );
    }

    // Biodiversity impact validation
    if (metrics.biodiversityImpact !== undefined) {
      this.validateBiodiversityImpact(
        metrics.biodiversityImpact,
        context,
        result
      );
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  private getSeasonalFactor(plantingDate: Date): number {
    const month = plantingDate.getMonth();
    const seasonalFactors = this.config.seasonalFactors || {
      3: 1.2, // April - ideal planting season
      4: 1.1, // May
      5: 0.9, // June - hot summer
      6: 0.7, // July - very hot
      7: 0.7, // August - very hot
      8: 0.9, // September - post-monsoon
      9: 1.1, // October - ideal
      10: 1.0, // November
      11: 0.8, // December - winter
      0: 0.8, // January - winter
      1: 0.9, // February
      2: 1.0, // March
    };
    return seasonalFactors[month] || 1.0;
  }

  private calculateExpectedSurvivalRate(projectAge: number): number {
    // Survival rate decreases over time due to various factors
    const daysInYear = 365;
    if (projectAge < 30) return 0.95; // 95% in first month
    if (projectAge < 90) return 0.9; // 90% in first quarter
    if (projectAge < 180) return 0.85; // 85% in first half year
    if (projectAge < daysInYear) return 0.8; // 80% in first year
    return 0.75; // 75% after first year
  }

  private validateTreeCount(
    actualTrees: number,
    expectedCurrent: number,
    expectedMax: number,
    result: ValidationResult
  ): void {
    if (actualTrees < 0) {
      result.errors.push('Trees planted cannot be negative');
      result.score -= 30;
    } else if (actualTrees > expectedMax * 1.3) {
      result.anomalies.push(
        `Trees planted (${actualTrees}) significantly exceeds project area capacity (${Math.floor(expectedMax)})`
      );
      result.score -= 20;
    } else if (actualTrees < expectedCurrent * 0.4) {
      result.warnings.push(
        `Tree planting progress (${actualTrees}) is significantly behind schedule (expected: ${Math.floor(expectedCurrent)})`
      );
      result.recommendations.push(
        'Consider reviewing planting timeline and resource allocation'
      );
      result.score -= 15;
    }
  }

  private validateSurvivalRate(
    currentTrees: number,
    historicalData: EnvironmentalMetrics[],
    expectedSurvivalRate: number,
    result: ValidationResult
  ): void {
    if (historicalData.length > 1) {
      const previousMax = Math.max(
        ...historicalData.map((d) => d.treesPlanted || 0)
      );
      const actualSurvivalRate = currentTrees / previousMax;

      if (actualSurvivalRate < expectedSurvivalRate * 0.7) {
        result.warnings.push(
          `Tree survival rate (${(actualSurvivalRate * 100).toFixed(1)}%) is below expected (${(expectedSurvivalRate * 100).toFixed(1)}%)`
        );
        result.recommendations.push(
          'Investigate causes of tree mortality and improve maintenance practices'
        );
        result.score -= 10;
      }
    }
  }

  private calculateExpectedCarbonImpact(
    treesPlanted: number,
    projectAge: number,
    location: { lat: number; long: number }
  ): { min: number; max: number } {
    const yearsGrown = Math.min(projectAge / 365, 1.0); // Cap at 1 year for young trees
    const latitudeFactor = this.getLatitudeFactor(location.lat);

    // Young trees sequester less CO2 initially
    const ageFactor = Math.min(yearsGrown * 2, 1.0); // Ramp up over 6 months

    const minCO2 =
      treesPlanted *
      this.config.thresholds.co2PerTreePerYear.min *
      yearsGrown *
      ageFactor *
      latitudeFactor;
    const maxCO2 =
      treesPlanted *
      this.config.thresholds.co2PerTreePerYear.max *
      yearsGrown *
      ageFactor *
      latitudeFactor;

    return { min: minCO2, max: maxCO2 };
  }

  private getLatitudeFactor(latitude: number): number {
    // Trees near equator generally grow faster
    const absLat = Math.abs(latitude);
    if (absLat < 15) return 1.2; // Tropical
    if (absLat < 30) return 1.1; // Subtropical
    if (absLat < 45) return 1.0; // Temperate
    return 0.8; // Cold climate
  }

  private validateCarbonImpact(
    actualCO2: number,
    expected: { min: number; max: number },
    result: ValidationResult
  ): void {
    if (actualCO2 < 0) {
      result.errors.push('Carbon impact cannot be negative');
      result.score -= 30;
    } else if (actualCO2 > expected.max * 2) {
      result.anomalies.push(
        `Carbon sequestration (${actualCO2.toFixed(1)} kg) seems unusually high for tree age`
      );
      result.score -= 25;
    } else if (actualCO2 < expected.min * 0.2) {
      result.warnings.push(
        `Carbon sequestration (${actualCO2.toFixed(1)} kg) is significantly below expected range (${expected.min.toFixed(1)}-${expected.max.toFixed(1)} kg)`
      );
      result.score -= 15;
    }
  }

  private validateBiodiversityImpact(
    biodiversityImpact: number,
    context: ValidationContext,
    result: ValidationResult
  ): void {
    // Biodiversity impact should correlate with area and tree diversity
    const expectedBiodiversity = context.areaSize * 10; // Rough metric

    if (biodiversityImpact > expectedBiodiversity * 2) {
      result.warnings.push(
        'Biodiversity impact claims seem optimistic - provide supporting evidence'
      );
    } else if (biodiversityImpact < expectedBiodiversity * 0.1) {
      result.recommendations.push(
        'Consider reporting biodiversity benefits of reforestation project'
      );
    }
  }
}

/**
 * Advanced Solar Energy Validator with weather and location factors
 */
export class SolarEnergyValidator {
  private config: ValidatorConfiguration;

  constructor(config: ValidatorConfiguration) {
    this.config = config;
  }

  validate(
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
      const expectedGeneration = this.calculateExpectedGeneration(context);
      this.validateEnergyGeneration(
        metrics.energyGenerated,
        expectedGeneration,
        result
      );

      // Performance ratio analysis
      this.validatePerformanceRatio(
        metrics.energyGenerated,
        expectedGeneration.theoretical,
        result
      );
    }

    // Advanced carbon impact calculation with grid emission factors
    if (
      metrics.carbonImpactToDate !== undefined &&
      metrics.energyGenerated !== undefined
    ) {
      const gridEmissionFactor = this.getGridEmissionFactor(context.location);
      this.validateCarbonAvoidance(
        metrics.carbonImpactToDate,
        metrics.energyGenerated,
        gridEmissionFactor,
        result
      );
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  private calculateExpectedGeneration(context: ValidationContext): {
    min: number;
    max: number;
    theoretical: number;
  } {
    const solarIrradiance = this.getSolarIrradiance(context.location);
    const seasonalFactor = this.getSeasonalSolarFactor(new Date());
    const systemEfficiency = 0.85; // Account for inverter losses, shading, etc.

    const dailyGeneration =
      context.areaSize * solarIrradiance * systemEfficiency * seasonalFactor;
    const totalGeneration = dailyGeneration * context.projectAge;

    const theoretical = context.areaSize * 5 * context.projectAge; // 5 kWh/m²/day theoretical max

    return {
      min: totalGeneration * 0.7, // Account for weather variations
      max: totalGeneration * 1.2,
      theoretical: theoretical,
    };
  }

  private getSolarIrradiance(location: { lat: number; long: number }): number {
    // Simplified solar irradiance model based on latitude
    const absLat = Math.abs(location.lat);
    if (absLat < 15) return 5.5; // kWh/m²/day - Tropical
    if (absLat < 30) return 5.0; // Subtropical
    if (absLat < 45) return 4.0; // Temperate
    return 3.0; // High latitude
  }

  private getSeasonalSolarFactor(date: Date): number {
    const month = date.getMonth();
    // Northern hemisphere seasonal factors
    const seasonalFactors = [
      0.7, // January
      0.8, // February
      0.9, // March
      1.1, // April
      1.2, // May
      1.3, // June - peak summer
      1.3, // July - peak summer
      1.2, // August
      1.0, // September
      0.9, // October
      0.7, // November
      0.6, // December
    ];
    return seasonalFactors[month];
  }

  private validateEnergyGeneration(
    actualGeneration: number,
    expected: { min: number; max: number; theoretical: number },
    result: ValidationResult
  ): void {
    if (actualGeneration < 0) {
      result.errors.push('Energy generated cannot be negative');
      result.score -= 30;
    } else if (actualGeneration > expected.theoretical * 1.1) {
      result.anomalies.push(
        `Energy generation (${actualGeneration.toFixed(1)} kWh) exceeds theoretical maximum`
      );
      result.score -= 25;
    } else if (actualGeneration < expected.min) {
      result.warnings.push(
        `Energy generation (${actualGeneration.toFixed(1)} kWh) is below expected range (${expected.min.toFixed(1)}-${expected.max.toFixed(1)} kWh)`
      );
      result.recommendations.push(
        'Check for system issues, shading, or equipment problems'
      );
      result.score -= 15;
    }
  }

  private validatePerformanceRatio(
    actualGeneration: number,
    theoreticalMax: number,
    result: ValidationResult
  ): void {
    const performanceRatio = actualGeneration / theoreticalMax;

    if (performanceRatio > 0.9) {
      result.recommendations.push('Excellent solar system performance!');
    } else if (performanceRatio < 0.6) {
      result.warnings.push(
        `Solar system performance ratio (${(performanceRatio * 100).toFixed(1)}%) is below industry standards (>70%)`
      );
      result.recommendations.push(
        'Consider system maintenance, cleaning, or equipment inspection'
      );
    }
  }

  private getGridEmissionFactor(location: {
    lat: number;
    long: number;
  }): number {
    // Simplified grid emission factors by region (kg CO2/kWh)
    // In practice, this would use a database of grid emission factors
    const absLat = Math.abs(location.lat);
    if (absLat < 30) return 0.8; // Developing regions with coal
    if (absLat < 60) return 0.6; // Developed regions with mixed grid
    return 0.4; // Clean grid regions
  }

  private validateCarbonAvoidance(
    actualCO2: number,
    energyGenerated: number,
    gridEmissionFactor: number,
    result: ValidationResult
  ): void {
    const expectedCO2Avoided = energyGenerated * gridEmissionFactor;
    const deviation =
      Math.abs(actualCO2 - expectedCO2Avoided) / expectedCO2Avoided;

    if (deviation > 0.3) {
      result.warnings.push(
        `Carbon impact (${actualCO2.toFixed(1)} kg) deviates significantly from expected based on energy generation (${expectedCO2Avoided.toFixed(1)} kg)`
      );
      result.recommendations.push(
        'Verify local grid emission factors and calculation methodology'
      );
    }
  }
}

/**
 * Get validator instance for project type
 */
export const getProjectValidator = query({
  args: { projectType: v.string() },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query('monitoringConfig')
      .withIndex('by_project_type_key', (q) =>
        q
          .eq('projectType', args.projectType)
          .eq('configKey', 'validator_config')
      )
      .first();

    const validatorConfig: ValidatorConfiguration = {
      projectType: args.projectType,
      thresholds: config?.configValue || getDefaultThresholds(args.projectType),
      seasonalFactors: getSeasonalFactors(args.projectType),
      weatherDependency: isWeatherDependent(args.projectType),
    };

    return validatorConfig;
  },
});

/**
 * Run comprehensive project validation
 */
export const runProjectValidation = mutation({
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

    // Get historical data
    const historicalUpdates = await ctx.db
      .query('progressUpdates')
      .withIndex('by_project', (q) => q.eq('projectId', args.projectId))
      .filter((q) => q.eq(q.field('isVerified'), true))
      .order('desc')
      .take(10);

    const historicalMetrics = historicalUpdates.map((update) => ({
      carbonImpactToDate: update.carbonImpactToDate || 0,
      treesPlanted: update.treesPlanted || 0,
      energyGenerated: update.energyGenerated || 0,
      wasteProcessed: update.wasteProcessed || 0,
      areaRestored: 0,
      biodiversityImpact: 0,
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

    // Get validator configuration
    const validatorConfig = await getValidatorConfig(ctx, project.projectType);

    // Run project-type specific validation
    let result: ValidationResult;

    switch (project.projectType) {
      case 'reforestation':
        const reforestationValidator = new ReforestationValidator(
          validatorConfig
        );
        result = reforestationValidator.validate(args.metrics, context);
        break;
      case 'solar':
        const solarValidator = new SolarEnergyValidator(validatorConfig);
        result = solarValidator.validate(args.metrics, context);
        break;
      default:
        // Fallback to basic validation
        result = {
          isValid: true,
          score: 80,
          warnings: [
            `Advanced validation not yet implemented for ${project.projectType}`,
          ],
          errors: [],
          anomalies: [],
          recommendations: [
            'Use basic validation until advanced validators are available',
          ],
        };
    }

    // Log validation result
    await ctx.db.insert('auditLogs', {
      userId: undefined,
      action: 'advanced_validation',
      entityType: 'project',
      entityId: args.projectId,
      newValues: {
        metrics: args.metrics,
        validationResult: result,
        validatorType: 'advanced',
      },
      metadata: {
        projectType: project.projectType,
        validationScore: result.score,
        hasErrors: result.errors.length > 0,
        hasWarnings: result.warnings.length > 0,
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

// Helper functions
async function getValidatorConfig(
  ctx: any,
  projectType: string
): Promise<ValidatorConfiguration> {
  const config = await ctx.db
    .query('monitoringConfig')
    .withIndex('by_project_type_key', (q: any) =>
      q.eq('projectType', projectType).eq('configKey', 'validator_config')
    )
    .first();

  return {
    projectType,
    thresholds: config?.configValue || getDefaultThresholds(projectType),
    seasonalFactors: getSeasonalFactors(projectType),
    weatherDependency: isWeatherDependent(projectType),
  };
}

function getDefaultThresholds(projectType: string): Record<string, any> {
  const thresholds: Record<string, any> = {
    reforestation: {
      treesPerHectare: { min: 400, max: 2500 },
      co2PerTreePerYear: { min: 20, max: 50 },
    },
    solar: {
      kwhPerM2PerDay: { min: 3, max: 6 },
      performanceRatio: { min: 0.7, max: 0.9 },
    },
    wind: {
      capacityFactor: { min: 0.25, max: 0.45 },
    },
    biogas: {
      biogasYieldM3PerTon: { min: 50, max: 150 },
    },
    waste_management: {
      co2PerTonWaste: { min: 500, max: 2000 },
    },
    mangrove_restoration: {
      co2PerHectarePerYear: { min: 10, max: 30 },
    },
  };

  return thresholds[projectType] || {};
}

function getSeasonalFactors(
  projectType: string
): Record<string, number> | undefined {
  if (projectType === 'solar' || projectType === 'reforestation') {
    return {
      0: 0.7,
      1: 0.8,
      2: 0.9,
      3: 1.1,
      4: 1.2,
      5: 1.3,
      6: 1.3,
      7: 1.2,
      8: 1.0,
      9: 0.9,
      10: 0.7,
      11: 0.6,
    };
  }
  return undefined;
}

function isWeatherDependent(projectType: string): boolean {
  return ['solar', 'wind', 'reforestation'].includes(projectType);
}
