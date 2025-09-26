import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import type { EnvironmentalMetrics } from './impact_validation';

// ============= CARBON CREDIT CALCULATION TYPES =============

export interface CreditCalculationResult {
  totalCredits: number;
  creditBreakdown: {
    [source: string]: {
      credits: number;
      methodology: string;
      confidence: number; // 0-1
      factors: Record<string, number>;
    };
  };
  validationStatus: 'pending' | 'verified' | 'rejected';
  calculationDate: number;
  methodology: string;
  uncertaintyRange: {
    lower: number;
    upper: number;
  };
  qualityScore: number; // 0-100
}

export interface CreditMethodology {
  projectType: string;
  methodologyName: string;
  version: string;
  standardBody:
    | 'VCS'
    | 'Gold_Standard'
    | 'CAR'
    | 'ACR'
    | 'Plan_Vivo'
    | 'Custom';
  conversionFactors: {
    [metricType: string]: {
      factor: number; // Credits per unit
      unit: string;
      uncertainty: number; // ±%
      conditions?: string[];
    };
  };
  eligibilityRequirements: string[];
  minimumProjectAge: number; // days
  verificationFrequency: number; // months
  leakageFactors?: Record<string, number>;
  permanenceFactors?: Record<string, number>;
  additionality: {
    required: boolean;
    methodology: string;
    evidence: string[];
  };
}

export interface CreditBatch {
  batchId: string;
  projectId: Id<'projects'>;
  credits: number;
  vintage: number; // Year credits were generated
  issuanceDate: number;
  methodology: string;
  verificationStandard: string;
  status:
    | 'draft'
    | 'pending_verification'
    | 'verified'
    | 'issued'
    | 'retired'
    | 'cancelled';
  verifierId?: Id<'users'>;
  verificationDate?: number;
  serialNumbers: {
    start: string;
    end: string;
  };
  qualityMetrics: {
    additionality: number; // 0-1
    permanence: number; // 0-1
    measureability: number; // 0-1
    leakage: number; // 0-1 (lower is better)
  };
  priceRange: {
    minimum: number;
    maximum: number;
    suggested: number;
  };
  bufferPercentage: number; // Risk buffer (e.g., 10% for forest projects)
  retiredCredits: number;
  availableCredits: number;
}

// ============= CREDIT CALCULATION ENGINE =============

/**
 * Calculate carbon credits from environmental metrics
 */
export const calculateCarbonCredits = mutation({
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
    calculationType: v.union(
      v.literal('impact_based'), // Based on actual measured impact
      v.literal('activity_based'), // Based on activities (trees planted, etc.)
      v.literal('hybrid') // Combination of both
    ),
    includeBuffer: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<CreditCalculationResult> => {
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get methodology for this project type
    const methodology = await getProjectMethodology(ctx, project.projectType);
    if (!methodology) {
      throw new Error(
        `No methodology found for project type: ${project.projectType}`
      );
    }

    // Calculate credits based on type
    let result: CreditCalculationResult;

    switch (args.calculationType) {
      case 'impact_based':
        result = calculateImpactBasedCredits(
          args.metrics,
          methodology,
          project
        );
        break;
      case 'activity_based':
        result = calculateActivityBasedCredits(
          args.metrics,
          methodology,
          project
        );
        break;
      case 'hybrid':
        result = calculateHybridCredits(args.metrics, methodology, project);
        break;
      default:
        throw new Error(
          `Unsupported calculation type: ${args.calculationType}`
        );
    }

    // Apply buffer if requested
    if (args.includeBuffer) {
      const bufferPercentage = getBufferPercentage(project.projectType);
      result.totalCredits *= 1 - bufferPercentage;
      result.uncertaintyRange.lower *= 1 - bufferPercentage;
      result.uncertaintyRange.upper *= 1 - bufferPercentage;
    }

    // Store calculation in audit logs
    await ctx.db.insert('auditLogs', {
      userId: undefined,
      action: 'carbon_credit_calculation',
      entityType: 'project',
      entityId: args.projectId,
      newValues: {
        result,
        methodology: methodology.methodologyName,
        calculationType: args.calculationType,
      },
      metadata: {
        totalCredits: result.totalCredits,
        qualityScore: result.qualityScore,
        methodology: methodology.methodologyName,
      },
      severity: 'info',
    });

    return result;
  },
});

/**
 * Calculate credits based on direct impact measurements
 */
function calculateImpactBasedCredits(
  metrics: EnvironmentalMetrics,
  methodology: CreditMethodology,
  project: Doc<'projects'>
): CreditCalculationResult {
  const creditBreakdown: CreditCalculationResult['creditBreakdown'] = {};
  let totalCredits = 0;
  let totalConfidence = 0;
  let confidenceCount = 0;

  // Direct CO2 impact calculation
  if (metrics.carbonImpactToDate && methodology.conversionFactors.co2_impact) {
    const factor = methodology.conversionFactors.co2_impact;
    const credits = (metrics.carbonImpactToDate / 1000) * factor.factor; // Convert kg to tons

    creditBreakdown.direct_co2 = {
      credits,
      methodology: `${methodology.methodologyName} - Direct CO2 Impact`,
      confidence: 0.95, // High confidence for direct measurements
      factors: {
        co2_tons: metrics.carbonImpactToDate / 1000,
        conversion_factor: factor.factor,
      },
    };

    totalCredits += credits;
    totalConfidence += 0.95;
    confidenceCount++;
  }

  // Energy-based calculations for renewable energy projects
  if (
    metrics.energyGenerated &&
    methodology.conversionFactors.energy_generation
  ) {
    const factor = methodology.conversionFactors.energy_generation;
    const gridEmissionFactor = getGridEmissionFactor(project.location);
    const credits = (metrics.energyGenerated * gridEmissionFactor) / 1000; // kWh to tons CO2

    creditBreakdown.energy_generation = {
      credits,
      methodology: `${methodology.methodologyName} - Energy Generation`,
      confidence: 0.9,
      factors: {
        energy_kwh: metrics.energyGenerated,
        grid_emission_factor: gridEmissionFactor,
        tons_co2_avoided: credits,
      },
    };

    totalCredits += credits;
    totalConfidence += 0.9;
    confidenceCount++;
  }

  // Waste processing calculations
  if (
    metrics.wasteProcessed &&
    methodology.conversionFactors.waste_processing
  ) {
    const factor = methodology.conversionFactors.waste_processing;
    const credits = metrics.wasteProcessed * factor.factor;

    creditBreakdown.waste_processing = {
      credits,
      methodology: `${methodology.methodologyName} - Waste Processing`,
      confidence: 0.85,
      factors: {
        waste_tons: metrics.wasteProcessed,
        conversion_factor: factor.factor,
      },
    };

    totalCredits += credits;
    totalConfidence += 0.85;
    confidenceCount++;
  }

  const averageConfidence =
    confidenceCount > 0 ? totalConfidence / confidenceCount : 0;
  const uncertainty = calculateUncertainty(methodology, averageConfidence);

  return {
    totalCredits,
    creditBreakdown,
    validationStatus: 'pending',
    calculationDate: Date.now(),
    methodology: methodology.methodologyName,
    uncertaintyRange: {
      lower: totalCredits * (1 - uncertainty),
      upper: totalCredits * (1 + uncertainty),
    },
    qualityScore: Math.round(averageConfidence * 100),
  };
}

/**
 * Calculate credits based on project activities
 */
function calculateActivityBasedCredits(
  metrics: EnvironmentalMetrics,
  methodology: CreditMethodology,
  project: Doc<'projects'>
): CreditCalculationResult {
  const creditBreakdown: CreditCalculationResult['creditBreakdown'] = {};
  let totalCredits = 0;
  let totalConfidence = 0;
  let confidenceCount = 0;

  // Tree planting calculations
  if (metrics.treesPlanted && methodology.conversionFactors.trees_planted) {
    const factor = methodology.conversionFactors.trees_planted;
    const survivalRate = getSurvivalRate(
      project.projectType,
      getProjectAge(project)
    );
    const credits = metrics.treesPlanted * factor.factor * survivalRate;

    creditBreakdown.trees_planted = {
      credits,
      methodology: `${methodology.methodologyName} - Tree Planting`,
      confidence: 0.75, // Lower confidence due to survival uncertainty
      factors: {
        trees_planted: metrics.treesPlanted,
        survival_rate: survivalRate,
        co2_per_tree: factor.factor,
      },
    };

    totalCredits += credits;
    totalConfidence += 0.75;
    confidenceCount++;
  }

  // Area restoration calculations
  if (metrics.areaRestored && methodology.conversionFactors.area_restoration) {
    const factor = methodology.conversionFactors.area_restoration;
    const credits = metrics.areaRestored * factor.factor;

    creditBreakdown.area_restoration = {
      credits,
      methodology: `${methodology.methodologyName} - Area Restoration`,
      confidence: 0.8,
      factors: {
        area_hectares: metrics.areaRestored,
        co2_per_hectare: factor.factor,
      },
    };

    totalCredits += credits;
    totalConfidence += 0.8;
    confidenceCount++;
  }

  const averageConfidence =
    confidenceCount > 0 ? totalConfidence / confidenceCount : 0;
  const uncertainty = calculateUncertainty(methodology, averageConfidence);

  return {
    totalCredits,
    creditBreakdown,
    validationStatus: 'pending',
    calculationDate: Date.now(),
    methodology: methodology.methodologyName,
    uncertaintyRange: {
      lower: totalCredits * (1 - uncertainty),
      upper: totalCredits * (1 + uncertainty),
    },
    qualityScore: Math.round(averageConfidence * 100),
  };
}

/**
 * Calculate credits using hybrid approach (combination of impact and activity)
 */
function calculateHybridCredits(
  metrics: EnvironmentalMetrics,
  methodology: CreditMethodology,
  project: Doc<'projects'>
): CreditCalculationResult {
  const impactResult = calculateImpactBasedCredits(
    metrics,
    methodology,
    project
  );
  const activityResult = calculateActivityBasedCredits(
    metrics,
    methodology,
    project
  );

  // Weight impact-based higher if direct CO2 measurements are available
  const impactWeight = metrics.carbonImpactToDate ? 0.7 : 0.3;
  const activityWeight = 1 - impactWeight;

  const totalCredits =
    impactResult.totalCredits * impactWeight +
    activityResult.totalCredits * activityWeight;

  // Combine breakdown from both approaches
  const creditBreakdown: CreditCalculationResult['creditBreakdown'] = {
    ...impactResult.creditBreakdown,
    ...activityResult.creditBreakdown,
  };

  // Apply weights to individual breakdowns
  Object.keys(creditBreakdown).forEach((key) => {
    if (impactResult.creditBreakdown[key] && creditBreakdown[key]) {
      creditBreakdown[key].credits *= impactWeight;
    }
    if (activityResult.creditBreakdown[key] && creditBreakdown[key]) {
      creditBreakdown[key].credits *= activityWeight;
    }
  });

  const averageQuality =
    (impactResult.qualityScore + activityResult.qualityScore) / 2;
  const uncertainty = calculateUncertainty(methodology, averageQuality / 100);

  return {
    totalCredits,
    creditBreakdown,
    validationStatus: 'pending',
    calculationDate: Date.now(),
    methodology: `${methodology.methodologyName} - Hybrid Approach`,
    uncertaintyRange: {
      lower: totalCredits * (1 - uncertainty),
      upper: totalCredits * (1 + uncertainty),
    },
    qualityScore: Math.round(averageQuality),
  };
}

// ============= UTILITY FUNCTIONS =============

async function getProjectMethodology(
  ctx: any,
  projectType: string
): Promise<CreditMethodology | null> {
  const config = await ctx.db
    .query('monitoringConfig')
    .withIndex('by_project_type_key', (q: any) =>
      q.eq('projectType', projectType).eq('configKey', 'credit_methodology')
    )
    .first();

  return config?.configValue || getDefaultMethodology(projectType);
}

function getDefaultMethodology(projectType: string): CreditMethodology {
  const methodologies: Record<string, CreditMethodology> = {
    reforestation: {
      projectType: 'reforestation',
      methodologyName: 'VCS REDD+ Methodology',
      version: '1.0',
      standardBody: 'VCS',
      conversionFactors: {
        trees_planted: {
          factor: 0.02, // 0.02 tons CO2 per tree per year average
          unit: 'tons_co2_per_tree_per_year',
          uncertainty: 0.3,
          conditions: ['survival_rate_applied', 'growth_factor_applied'],
        },
        co2_impact: {
          factor: 1.0, // Direct 1:1 conversion for measured CO2
          unit: 'tons_co2',
          uncertainty: 0.1,
        },
        area_restoration: {
          factor: 3.5, // 3.5 tons CO2 per hectare per year
          unit: 'tons_co2_per_hectare_per_year',
          uncertainty: 0.25,
        },
      },
      eligibilityRequirements: [
        'Additionality demonstrated',
        'Baseline established',
        'Monitoring plan in place',
        'Community consent obtained',
      ],
      minimumProjectAge: 365, // 1 year
      verificationFrequency: 12, // Annual
      leakageFactors: { displacement: 0.1 },
      permanenceFactors: { reversal_risk: 0.05 },
      additionality: {
        required: true,
        methodology: 'Barrier Analysis',
        evidence: [
          'Financial barriers',
          'Technical barriers',
          'Regulatory barriers',
        ],
      },
    },
    solar: {
      projectType: 'solar',
      methodologyName: 'VCS Grid-Connected Renewable Energy',
      version: '2.0',
      standardBody: 'VCS',
      conversionFactors: {
        energy_generation: {
          factor: 1.0, // Will be multiplied by grid emission factor
          unit: 'tons_co2_per_mwh',
          uncertainty: 0.15,
        },
        co2_impact: {
          factor: 1.0,
          unit: 'tons_co2',
          uncertainty: 0.1,
        },
      },
      eligibilityRequirements: [
        'Grid connection demonstrated',
        'Baseline emissions calculated',
        'Additionality proven',
      ],
      minimumProjectAge: 30, // 30 days
      verificationFrequency: 12,
      additionality: {
        required: true,
        methodology: 'Investment Analysis',
        evidence: ['Financial IRR below threshold', 'Regulatory barriers'],
      },
    },
    wind: {
      projectType: 'wind',
      methodologyName: 'VCS Grid-Connected Renewable Energy',
      version: '2.0',
      standardBody: 'VCS',
      conversionFactors: {
        energy_generation: {
          factor: 1.0,
          unit: 'tons_co2_per_mwh',
          uncertainty: 0.15,
        },
        co2_impact: {
          factor: 1.0,
          unit: 'tons_co2',
          uncertainty: 0.1,
        },
      },
      eligibilityRequirements: [
        'Grid connection demonstrated',
        'Wind resource assessment completed',
        'Environmental impact assessment',
      ],
      minimumProjectAge: 30,
      verificationFrequency: 12,
      additionality: {
        required: true,
        methodology: 'Investment Analysis',
        evidence: ['Financial barriers', 'Technical barriers'],
      },
    },
    biogas: {
      projectType: 'biogas',
      methodologyName: 'VCS Biogas from Organic Waste',
      version: '1.5',
      standardBody: 'VCS',
      conversionFactors: {
        waste_processing: {
          factor: 0.5, // 0.5 tons CO2eq per ton waste
          unit: 'tons_co2_per_ton_waste',
          uncertainty: 0.2,
        },
        energy_generation: {
          factor: 1.0,
          unit: 'tons_co2_per_mwh',
          uncertainty: 0.15,
        },
        co2_impact: {
          factor: 1.0,
          unit: 'tons_co2',
          uncertainty: 0.1,
        },
      },
      eligibilityRequirements: [
        'Waste composition analysis',
        'Methane emission baseline',
        'Biogas production monitoring',
      ],
      minimumProjectAge: 90,
      verificationFrequency: 12,
      additionality: {
        required: true,
        methodology: 'Common Practice Analysis',
        evidence: ['Technology barriers', 'Regulatory requirements'],
      },
    },
    waste_management: {
      projectType: 'waste_management',
      methodologyName: 'VCS Waste Management and Recycling',
      version: '1.0',
      standardBody: 'VCS',
      conversionFactors: {
        waste_processing: {
          factor: 0.3, // 0.3 tons CO2eq per ton waste processed
          unit: 'tons_co2_per_ton_waste',
          uncertainty: 0.25,
        },
        co2_impact: {
          factor: 1.0,
          unit: 'tons_co2',
          uncertainty: 0.15,
        },
      },
      eligibilityRequirements: [
        'Waste stream characterization',
        'Recycling rate documentation',
        'Landfill diversion proof',
      ],
      minimumProjectAge: 180,
      verificationFrequency: 12,
      additionality: {
        required: true,
        methodology: 'Regulatory Surplus',
        evidence: ['Exceeds regulatory requirements'],
      },
    },
    mangrove_restoration: {
      projectType: 'mangrove_restoration',
      methodologyName: 'VCS Blue Carbon Methodology',
      version: '1.0',
      standardBody: 'VCS',
      conversionFactors: {
        area_restoration: {
          factor: 8.0, // 8 tons CO2 per hectare per year (high sequestration)
          unit: 'tons_co2_per_hectare_per_year',
          uncertainty: 0.35,
        },
        co2_impact: {
          factor: 1.0,
          unit: 'tons_co2',
          uncertainty: 0.15,
        },
      },
      eligibilityRequirements: [
        'Coastal ecosystem assessment',
        'Salinity and tidal monitoring',
        'Biodiversity impact study',
        'Community engagement plan',
      ],
      minimumProjectAge: 365,
      verificationFrequency: 12,
      leakageFactors: { activity_shifting: 0.15 },
      permanenceFactors: { climate_risk: 0.1 },
      additionality: {
        required: true,
        methodology: 'Legal Requirements Analysis',
        evidence: ['No legal obligation', 'Financial barriers'],
      },
    },
  };

  const methodology = methodologies[projectType] || methodologies.reforestation;
  if (!methodology) {
    throw new Error(`No methodology available for project type: ${projectType}`);
  }
  return methodology;
}

function getGridEmissionFactor(location: {
  lat: number;
  long: number;
}): number {
  // Simplified grid emission factors by region (kg CO2/kWh)
  const absLat = Math.abs(location.lat);
  if (absLat < 30) return 0.8; // Developing regions
  if (absLat < 60) return 0.6; // Developed regions
  return 0.4; // Clean grid regions
}

function getSurvivalRate(projectType: string, projectAge: number): number {
  if (
    projectType === 'reforestation' ||
    projectType === 'mangrove_restoration'
  ) {
    // Survival rate improves over time as trees establish
    if (projectAge < 30) return 0.7; // 70% in first month
    if (projectAge < 365) return 0.8; // 80% in first year
    return 0.85; // 85% after first year
  }
  return 1.0; // No survival factor for non-biological projects
}

function getProjectAge(project: Doc<'projects'>): number {
  return Math.floor(
    (Date.now() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );
}

function calculateUncertainty(
  methodology: CreditMethodology,
  confidence: number
): number {
  // Base uncertainty from methodology
  const baseUncertainty =
    Object.values(methodology.conversionFactors).reduce(
      (avg, factor) => avg + factor.uncertainty,
      0
    ) / Object.keys(methodology.conversionFactors).length;

  // Adjust by confidence level
  return baseUncertainty * (1 - confidence * 0.5); // Higher confidence reduces uncertainty
}

function getBufferPercentage(projectType: string): number {
  const buffers: Record<string, number> = {
    reforestation: 0.15, // 15% buffer for forest projects
    mangrove_restoration: 0.2, // 20% buffer for coastal projects
    solar: 0.05, // 5% buffer for renewable energy
    wind: 0.05,
    biogas: 0.1, // 10% buffer for waste projects
    waste_management: 0.1,
  };
  return buffers[projectType] || 0.1;
}

/**
 * Get credit calculation history for a project
 */
export const getCreditCalculationHistory = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    const history = await ctx.db
      .query('auditLogs')
      .filter((q: any) =>
        q.and(
          q.eq(q.field('entityType'), 'project'),
          q.eq(q.field('entityId'), args.projectId),
          q.eq(q.field('action'), 'carbon_credit_calculation')
        )
      )
      .order('desc')
      .take(20);

    return history.map((log) => ({
      timestamp: log._creationTime,
      totalCredits: log.metadata?.totalCredits || 0,
      qualityScore: log.metadata?.qualityScore || 0,
      methodology: log.metadata?.methodology || 'Unknown',
      calculationType: log.newValues?.calculationType || 'Unknown',
      result: log.newValues?.result,
    }));
  },
});

/**
 * Validate credit calculation results
 */
export const validateCreditCalculation = mutation({
  args: {
    projectId: v.id('projects'),
    calculationResult: v.any(),
    validatorId: v.id('users'),
    validationNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const validator = await ctx.db.get(args.validatorId);
    if (!validator || validator.role !== 'verifier') {
      throw new Error('Only verified users can validate credit calculations');
    }

    // Store validation result
    await ctx.db.insert('auditLogs', {
      userId: args.validatorId,
      action: 'credit_calculation_validation',
      entityType: 'project',
      entityId: args.projectId,
      newValues: {
        calculationResult: args.calculationResult,
        validationNotes: args.validationNotes,
        validatedBy: args.validatorId,
      },
      metadata: {
        totalCredits: args.calculationResult.totalCredits,
        qualityScore: args.calculationResult.qualityScore,
        validatorEmail: validator.email,
      },
      severity: 'info',
    });

    return {
      validated: true,
      validatedBy: args.validatorId,
      validatedAt: Date.now(),
      notes: args.validationNotes,
    };
  },
});
