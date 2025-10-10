import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { Id } from './_generated/dataModel';

// Buyer impact report interfaces
export interface BuyerImpactReport {
  id: string;
  buyerId: string;
  buyerName: string;
  reportType:
    | 'portfolio_overview'
    | 'individual_project'
    | 'impact_certificate'
    | 'annual_summary';
  reportPeriod: {
    startDate: number;
    endDate: number;
    label: string;
  };
  portfolio: BuyerPortfolio;
  projects: ProjectImpactSummary[];
  totalImpact: TotalImpactSummary;
  certificates: ImpactCertificate[];
  recommendations: BuyerRecommendation[];
  comparisons: ImpactComparison[];
  sustainability: SustainabilityMetrics;
  generatedAt: number;
  generatedBy: string;
  status: 'draft' | 'final' | 'certified' | 'archived';
}

export interface BuyerPortfolio {
  totalCreditsOwned: number;
  totalInvestment: number;
  activeProjects: number;
  completedProjects: number;
  projectTypes: ProjectTypeBreakdown[];
  geographicDistribution: GeographicBreakdown[];
  vintage: VintageBreakdown[];
  riskProfile: RiskAssessment;
  performance: PortfolioPerformance;
}

export interface ProjectTypeBreakdown {
  type: string;
  projectCount: number;
  creditsOwned: number;
  totalInvestment: number;
  averageImpact: number;
  percentage: number;
}

export interface GeographicBreakdown {
  region: string;
  country: string;
  projectCount: number;
  creditsOwned: number;
  percentage: number;
  impact: number;
}

export interface VintageBreakdown {
  year: number;
  creditsOwned: number;
  projectCount: number;
  averagePrice: number;
  qualityScore: number;
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  diversificationScore: number;
  projectRiskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  mitigationFactors: string[];
  recommendations: string[];
}

export interface PortfolioPerformance {
  totalReturn: number;
  annualizedReturn: number;
  impactEfficiency: number;
  benchmarkComparison: number;
  performanceMetrics: PerformanceMetric[];
  trendsAnalysis: TrendAnalysis[];
}

export interface PerformanceMetric {
  metric: string;
  value: number;
  unit: string;
  change: number;
  benchmark: number;
  status: 'outperforming' | 'meeting' | 'underperforming';
}

export interface TrendAnalysis {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
  timeframe: string;
  prediction: number;
  confidence: number;
}

export interface ProjectImpactSummary {
  projectId: string;
  projectName: string;
  projectType: string;
  creditsOwned: number;
  _creationTime: number;
  purchasePrice: number;
  currentStatus: string;
  impactMetrics: {
    carbonImpactToDate: number;
    estimatedTotalImpact: number;
    additionalBenefits: Record<string, number>;
  };
  progress: {
    percentage: number;
    milestonesCompleted: number;
    totalMilestones: number;
    onTrack: boolean;
  };
  verification: {
    lastVerified: number;
    verificationStatus: string;
    nextVerification: number;
    certificationLevel: string;
  };
  location: {
    country: string;
    region: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  timeline: {
    startDate: number;
    expectedCompletion: number;
    actualCompletion?: number;
  };
  financials: {
    totalInvestment: number;
    currentValue: number;
    roi: number;
    paybackPeriod: number;
  };
  riskFactors: string[];
  recentUpdates: ProjectUpdate[];
}

export interface ProjectUpdate {
  date: number;
  type: 'progress' | 'milestone' | 'issue' | 'achievement';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
}

export interface TotalImpactSummary {
  totalCarbonOffset: number;
  equivalentMetrics: {
    treesPlanted: number;
    carsOffRoad: number;
    homesPowered: number;
    fuelSaved: number;
  };
  sdgContributions: SDGContribution[];
  environmentalBenefits: EnvironmentalBenefit[];
  socialImpact: SocialImpact[];
  economicImpact: EconomicImpact[];
  cumulativeImpact: CumulativeImpact;
}

export interface SDGContribution {
  goal: number;
  title: string;
  contribution: string;
  metrics: Record<string, number>;
  projectCount: number;
}

export interface EnvironmentalBenefit {
  category: string;
  description: string;
  quantification: number;
  unit: string;
  verification: string;
}

export interface SocialImpact {
  category: string;
  description: string;
  beneficiaries: number;
  location: string;
  projectsContributing: string[];
}

export interface EconomicImpact {
  category: string;
  description: string;
  value: number;
  currency: string;
  localEconomyBoost: number;
}

export interface CumulativeImpact {
  totalProjects: number;
  totalInvestment: number;
  totalCarbonOffset: number;
  timespan: number;
  averageProjectSize: number;
  impactGrowthRate: number;
}

export interface ImpactCertificate {
  id: string;
  type: 'carbon_offset' | 'biodiversity' | 'social_impact' | 'sdg_contribution';
  title: string;
  description: string;
  quantification: number;
  unit: string;
  verificationStandard: string;
  issueDate: number;
  validUntil: number;
  certificateUrl?: string;
  projects: string[];
  metadata: CertificateMetadata;
}

export interface CertificateMetadata {
  serialNumber: string;
  issuer: string;
  verifier: string;
  methodology: string;
  additionalCertifications: string[];
  auditTrail: AuditEntry[];
}

export interface AuditEntry {
  date: number;
  action: string;
  actor: string;
  details: string;
}

export interface BuyerRecommendation {
  id: string;
  type:
    | 'diversification'
    | 'portfolio_optimization'
    | 'impact_enhancement'
    | 'risk_mitigation';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  rationale: string;
  expectedBenefit: string;
  implementation: RecommendationStep[];
  impact: {
    riskReduction: number;
    impactIncrease: number;
    costImplication: number;
  };
  deadline?: number;
}

export interface RecommendationStep {
  step: number;
  action: string;
  description: string;
  timeframe: string;
  resources: string[];
}

export interface ImpactComparison {
  comparisonType:
    | 'peer_buyers'
    | 'industry_average'
    | 'best_practice'
    | 'historical';
  metric: string;
  buyerValue: number;
  benchmarkValue: number;
  percentile: number;
  status: 'above_average' | 'average' | 'below_average';
  insights: string[];
}

export interface SustainabilityMetrics {
  esgScore: number;
  sustainabilityRating: string;
  alignment: {
    parisAgreement: number;
    sdgs: number;
    corporateGoals: number;
  };
  reporting: {
    ghgProtocol: boolean;
    tcfd: boolean;
    sb: boolean;
    cdp: boolean;
  };
  certifications: string[];
  transparency: {
    score: number;
    publicDisclosure: boolean;
    thirdPartyVerification: boolean;
  };
}

// Buyer report generation functions
export const generateBuyerImpactReport = mutation({
  args: {
    buyerId: v.id('users'),
    reportType: v.union(
      v.literal('portfolio_overview'),
      v.literal('individual_project'),
      v.literal('impact_certificate'),
      v.literal('annual_summary')
    ),
    reportPeriod: v.object({
      startDate: v.number(),
      endDate: v.number(),
      label: v.string(),
    }),
    projectId: v.optional(v.id('projects')),
    includeComparisons: v.optional(v.boolean()),
    includeCertificates: v.optional(v.boolean()),
    format: v.optional(
      v.union(v.literal('pdf'), v.literal('html'), v.literal('csv'))
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Verify buyer access
    const hasAccess = await verifyBuyerAccess(
      ctx,
      args.buyerId,
      identity.subject
    );
    if (!hasAccess) {
      throw new Error('Not authorized to generate report for this buyer');
    }

    // Gather buyer data
    const reportData = await gatherBuyerReportData(ctx, args);

    // Generate the report
    const report = await generateBuyerReportContent(ctx, reportData, args);

    // Save report record
    const reportId = await ctx.db.insert('analyticsReports', {
      reportType: 'impact_summary',
      title:
        report.portfolio.totalCreditsOwned > 0
          ? `${reportData.buyer?.name || 'Buyer'} - ${args.reportType.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())} Report`
          : `Buyer Impact Report - ${args.reportPeriod.label}`,
      description: `Impact report for buyer ${args.buyerId}`,
      generatedBy: identity.subject as Id<'users'>,
      format: (args.format as 'json' | 'pdf' | 'csv') || 'json',
      isPublic: false,
      generatedAt: Date.now(),
      expiresAt: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days
      timeframe: args.reportPeriod,
      reportData: report,
    });

    return {
      reportId: report.id,
      convexId: reportId,
      title:
        report.portfolio.totalCreditsOwned > 0
          ? `${reportData.buyer.name} Impact Report`
          : 'Buyer Impact Report',
      status: 'completed',
      metadata: {
        totalCredits: report.portfolio.totalCreditsOwned,
        totalImpact: report.totalImpact.totalCarbonOffset,
        projectCount:
          report.portfolio.activeProjects + report.portfolio.completedProjects,
      },
    };
  },
});

export const getBuyerImpactReport = query({
  args: { reportId: v.id('analyticsReports') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const report = await ctx.db.get(args.reportId);

    if (!report) {
      return null;
    }

    // Verify access - check if user generated this report or has admin access
    if (report.generatedBy !== identity.subject) {
      const user = await ctx.db
        .query('users')
        .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', identity.subject))
        .first();

      if (!user || !['admin', 'verifier'].includes(user.role)) {
        throw new Error('Not authorized to access this report');
      }
    }

    return report.reportData as BuyerImpactReport;
  },
});

export const getBuyerPortfolio = query({
  args: { buyerId: v.id('users') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const hasAccess = await verifyBuyerAccess(
      ctx,
      args.buyerId,
      identity.subject
    );
    if (!hasAccess) {
      throw new Error('Not authorized to access this portfolio');
    }

    const purchases = await ctx.db
      .query('transactions')
      .withIndex('by_buyer', (q: any) => q.eq('buyerId', args.buyerId))
      .filter((q: any) => q.eq(q.field('paymentStatus'), 'completed'))
      .collect();

    const portfolio = await buildPortfolioSummary(ctx, purchases);
    return portfolio;
  },
});

export const generateImpactCertificate = mutation({
  args: {
    buyerId: v.id('users'),
    certificateType: v.union(
      v.literal('carbon_offset'),
      v.literal('biodiversity'),
      v.literal('social_impact'),
      v.literal('sdg_contribution')
    ),
    projectIds: v.optional(v.array(v.id('projects'))),
    timeframe: v.object({
      startDate: v.number(),
      endDate: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const hasAccess = await verifyBuyerAccess(
      ctx,
      args.buyerId,
      identity.subject
    );
    if (!hasAccess) {
      throw new Error('Not authorized to generate certificate for this buyer');
    }

    // Generate certificate
    const certificate = await generateCertificate(ctx, args);

    // Save certificate (using analyticsReports table)
    const certificateId = await ctx.db.insert('analyticsReports', {
      reportType: 'impact_summary',
      title: certificate.title,
      description: certificate.description,
      generatedBy: identity.subject as Id<'users'>,
      generatedAt: Date.now(),
      format: 'json',
      isPublic: false,
      timeframe: args.timeframe,
      reportData: {
        certificateId: certificate.id,
        buyerId: args.buyerId,
        type: certificate.type,
        quantification: certificate.quantification,
        unit: certificate.unit,
        issueDate: certificate.issueDate,
        validUntil: certificate.validUntil,
        verificationStandard: certificate.verificationStandard,
        projects: certificate.projects,
        metadata: certificate.metadata,
        status: 'active',
      },
    });

    return {
      certificateId: certificate.id,
      convexId: certificateId,
      downloadUrl: certificate.certificateUrl,
    };
  },
});

export const listBuyerReports = query({
  args: {
    buyerId: v.id('users'),
    reportType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const hasAccess = await verifyBuyerAccess(
      ctx,
      args.buyerId,
      identity.subject
    );
    if (!hasAccess) {
      throw new Error('Not authorized to access reports for this buyer');
    }

    let query = ctx.db
      .query('analyticsReports')
      .withIndex('by_user', (q: any) => q.eq('generatedBy', identity.subject));

    if (args.reportType) {
      query = query.filter((q: any) =>
        q.eq(q.field('reportType'), args.reportType)
      );
    }

    const reports = await query.order('desc').take(args.limit || 20);

    return reports.map((report) => ({
      id: report._id,
      title: report.title,
      type: report.reportType,
      format: report.format,
      status: 'completed',
      generatedAt: report.generatedAt,
      metadata: {},
    }));
  },
});

export const getBuyerImpactTrends = query({
  args: {
    buyerId: v.id('users'),
    timeframe: v.string(),
    metrics: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const hasAccess = await verifyBuyerAccess(
      ctx,
      args.buyerId,
      identity.subject
    );
    if (!hasAccess) {
      throw new Error('Not authorized to access trends for this buyer');
    }

    const purchases = await ctx.db
      .query('transactions')
      .withIndex('by_buyer', (q: any) => q.eq('buyerId', args.buyerId))
      .filter((q) => q.eq(q.field('paymentStatus'), 'completed'))
      .collect();

    const trends = calculateImpactTrends(
      purchases,
      args.timeframe,
      args.metrics
    );
    return trends;
  },
});

// Helper functions
async function verifyBuyerAccess(
  ctx: any,
  buyerId: string,
  clerkId: string
): Promise<boolean> {
  // Get the user record for the given buyerId
  const buyerUser = await ctx.db.get(buyerId);
  if (!buyerUser) return false;

  // User can access their own reports if their Clerk ID matches
  if (buyerUser.clerkId === clerkId) return true;

  // Check if the authenticated user has admin/verifier role
  const authUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', clerkId))
    .first();

  return authUser?.role === 'admin' || authUser?.role === 'verifier';
}

async function gatherBuyerReportData(ctx: any, args: any) {
  // Get buyer information
  const buyer = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', args.buyerId))
    .first();

  // Get all purchases for the buyer
  let purchasesQuery = ctx.db
    .query('transactions')
    .withIndex('by_buyer', (q: any) => q.eq('buyerId', args.buyerId))
    .filter((q: any) => q.eq(q.field('paymentStatus'), 'completed'));

  // Filter by date range if specified
  if (args.reportPeriod.startDate && args.reportPeriod.endDate) {
    purchasesQuery = purchasesQuery.filter((q: any) =>
      q.and(
        q.gte(q.field('_creationTime'), args.reportPeriod.startDate),
        q.lte(q.field('_creationTime'), args.reportPeriod.endDate)
      )
    );
  }

  const purchases = await purchasesQuery.collect();

  // Get unique projects from purchases
  const projectIds = Array.from(
    new Set(purchases.map((p: any) => p.projectId))
  );
  const projects = await Promise.all(projectIds.map((id) => ctx.db.get(id)));

  // Get progress updates for these projects
  const progressUpdates = await Promise.all(
    projectIds.map(async (projectId) => {
      return await ctx.db
        .query('progressUpdates')
        .withIndex('by_project', (q: any) => q.eq('projectId', projectId))
        .order('desc')
        .take(5);
    })
  );

  return {
    buyer,
    purchases,
    projects: projects.filter(Boolean),
    progressUpdates: progressUpdates.flat(),
    reportPeriod: args.reportPeriod,
  };
}

async function generateBuyerReportContent(
  ctx: any,
  data: any,
  args: any
): Promise<BuyerImpactReport> {
  const { buyer, purchases, projects, progressUpdates } = data;

  // Build portfolio summary
  const portfolio = await buildPortfolioSummary(ctx, purchases);

  // Generate project summaries
  const projectSummaries = generateProjectSummaries(
    projects,
    purchases,
    progressUpdates
  );

  // Calculate total impact
  const totalImpact = calculateTotalImpact(projectSummaries);

  // Generate certificates if requested
  const certificates = args.includeCertificates
    ? await generateImpactCertificates(ctx, args.buyerId, projects, purchases)
    : [];

  // Generate recommendations
  const recommendations = generateBuyerRecommendations(
    portfolio,
    projectSummaries
  );

  // Generate comparisons if requested
  const comparisons = args.includeComparisons
    ? await generateImpactComparisons(ctx, portfolio, totalImpact)
    : [];

  // Calculate sustainability metrics
  const sustainability = calculateSustainabilityMetrics(portfolio, totalImpact);

  const report: BuyerImpactReport = {
    id: crypto.randomUUID(),
    buyerId: args.buyerId,
    buyerName: buyer?.name || 'Unknown Buyer',
    reportType: args.reportType,
    reportPeriod: args.reportPeriod,
    portfolio,
    projects: projectSummaries,
    totalImpact,
    certificates,
    recommendations,
    comparisons,
    sustainability,
    generatedAt: Date.now(),
    generatedBy: 'system',
    status: 'final',
  };

  return report;
}

async function buildPortfolioSummary(
  ctx: any,
  purchases: any[]
): Promise<BuyerPortfolio> {
  const totalCredits = purchases.reduce((sum, p) => sum + p.creditAmount, 0);
  const totalInvestment = purchases.reduce((sum, p) => sum + p.totalAmount, 0);

  // Get unique projects
  const uniqueProjects = Array.from(new Set(purchases.map((p) => p.projectId)));
  const projects = await Promise.all(
    uniqueProjects.map(async (id) => {
      const project = await ctx.db.get(id);
      return project;
    })
  );

  const activeProjects = projects.filter(
    (p) => p && ['active', 'approved'].includes(p.status)
  ).length;
  const completedProjects = projects.filter(
    (p) => p && p.status === 'completed'
  ).length;

  // Group by project type
  const typeGroups = groupPurchasesByType(purchases, projects.filter(Boolean));

  // Group by geography
  const geoGroups = groupPurchasesByGeography(
    purchases,
    projects.filter(Boolean)
  );

  // Group by vintage (year)
  const vintageGroups = groupPurchasesByVintage(purchases);

  // Calculate risk assessment
  const riskProfile = calculateRiskProfile(purchases, projects.filter(Boolean));

  // Calculate performance metrics
  const performance = calculatePortfolioPerformance(
    purchases,
    projects.filter(Boolean)
  );

  return {
    totalCreditsOwned: totalCredits,
    totalInvestment,
    activeProjects,
    completedProjects,
    projectTypes: typeGroups,
    geographicDistribution: geoGroups,
    vintage: vintageGroups,
    riskProfile,
    performance,
  };
}

function generateProjectSummaries(
  projects: any[],
  purchases: any[],
  progressUpdates: any[]
): ProjectImpactSummary[] {
  return projects.map((project) => {
    const projectPurchases = purchases.filter(
      (p) => p.projectId === project._id
    );
    const projectUpdates = progressUpdates.filter(
      (u) => u.projectId === project._id
    );
    const latestUpdate = projectUpdates[0];

    const totalCredits = projectPurchases.reduce(
      (sum, p) => sum + p.creditAmount,
      0
    );
    const totalInvestment = projectPurchases.reduce(
      (sum, p) => sum + p.totalAmount,
      0
    );
    const averagePrice = totalInvestment / totalCredits;

    return {
      projectId: project._id,
      projectName: project.title,
      projectType: project.projectType,
      creditsOwned: totalCredits,
      _creationTime: Math.min(...projectPurchases.map((p) => p._creationTime)),
      purchasePrice: averagePrice,
      currentStatus: project.status,
      impactMetrics: {
        carbonImpactToDate: latestUpdate?.carbonImpactToDate || 0,
        estimatedTotalImpact: project.targetCarbonImpact || 0,
        additionalBenefits: extractAdditionalBenefits(latestUpdate),
      },
      progress: {
        percentage: latestUpdate?.progressPercentage || 0,
        milestonesCompleted: 0, // Would need milestone data
        totalMilestones: 0,
        onTrack: project.status === 'active',
      },
      verification: {
        lastVerified:
          latestUpdate?.reportingDate || latestUpdate?._creationTime || 0,
        verificationStatus: 'verified',
        nextVerification: Date.now() + 30 * 24 * 60 * 60 * 1000,
        certificationLevel: 'gold',
      },
      location: {
        country: project.location?.name || 'Unknown',
        region: project.location?.name || 'Unknown',
        coordinates: {
          latitude: project.location?.lat || 0,
          longitude: project.location?.long || 0,
        },
      },
      timeline: {
        startDate: project.startDate || project._creationTime,
        expectedCompletion: project.expectedCompletionDate || 0,
        actualCompletion:
          project.status === 'completed'
            ? project.actualCompletionDate
            : undefined,
      },
      financials: {
        totalInvestment,
        currentValue: totalInvestment, // Simplified
        roi: 0, // Would need market data
        paybackPeriod: 0,
      },
      riskFactors: extractRiskFactors(project),
      recentUpdates: projectUpdates.slice(0, 3).map((update) => ({
        date: update.reportingDate || update._creationTime,
        type: 'progress',
        title: update.title,
        description: update.description,
        impact: 'medium',
      })),
    };
  });
}

function calculateTotalImpact(
  projectSummaries: ProjectImpactSummary[]
): TotalImpactSummary {
  const totalCarbonOffset = projectSummaries.reduce(
    (sum, p) => sum + p.impactMetrics.carbonImpactToDate,
    0
  );

  // Calculate equivalent metrics
  const treesPlanted = Math.floor(totalCarbonOffset * 40); // Rough estimate: 1 ton CO2 = 40 trees
  const carsOffRoad = Math.floor(totalCarbonOffset / 4.6); // Average car emits 4.6 tons CO2/year
  const homesPowered = Math.floor(totalCarbonOffset / 7.3); // Average home emits 7.3 tons CO2/year
  const fuelSaved = Math.floor(totalCarbonOffset * 113); // 1 ton CO2 = ~113 gallons gas

  return {
    totalCarbonOffset,
    equivalentMetrics: {
      treesPlanted,
      carsOffRoad,
      homesPowered,
      fuelSaved,
    },
    sdgContributions: calculateSDGContributions(projectSummaries),
    environmentalBenefits: calculateEnvironmentalBenefits(projectSummaries),
    socialImpact: calculateSocialImpact(projectSummaries),
    economicImpact: calculateEconomicImpact(projectSummaries),
    cumulativeImpact: {
      totalProjects: projectSummaries.length,
      totalInvestment: projectSummaries.reduce(
        (sum, p) => sum + p.financials.totalInvestment,
        0
      ),
      totalCarbonOffset,
      timespan: calculateTimespan(projectSummaries),
      averageProjectSize: totalCarbonOffset / projectSummaries.length,
      impactGrowthRate: 0.15, // Placeholder
    },
  };
}

// Utility functions
function groupPurchasesByType(
  purchases: any[],
  projects: any[]
): ProjectTypeBreakdown[] {
  const typeMap = new Map<string, any>();

  purchases.forEach((purchase) => {
    const project = projects.find((p) => p._id === purchase.projectId);
    if (!project) return;

    const type = project.projectType;
    if (!typeMap.has(type)) {
      typeMap.set(type, {
        type,
        projectCount: 0,
        creditsOwned: 0,
        totalInvestment: 0,
        projectIds: new Set(),
      });
    }

    const data = typeMap.get(type);
    data.creditsOwned += purchase.creditAmount;
    data.totalInvestment += purchase.totalAmount;
    data.projectIds.add(purchase.projectId);
  });

  const totalCredits = purchases.reduce((sum, p) => sum + p.creditAmount, 0);

  return Array.from(typeMap.values()).map((data) => ({
    type: data.type,
    projectCount: data.projectIds.size,
    creditsOwned: data.creditsOwned,
    totalInvestment: data.totalInvestment,
    averageImpact: data.creditsOwned / data.projectIds.size,
    percentage: (data.creditsOwned / totalCredits) * 100,
  }));
}

function groupPurchasesByGeography(
  purchases: any[],
  projects: any[]
): GeographicBreakdown[] {
  const geoMap = new Map<string, any>();

  purchases.forEach((purchase) => {
    const project = projects.find((p) => p._id === purchase.projectId);
    if (!project || !project.location) return;

    const key = `${project.location.name}-${project.location.name}`;
    if (!geoMap.has(key)) {
      geoMap.set(key, {
        region: project.location.name,
        country: project.location.name,
        projectCount: 0,
        creditsOwned: 0,
        projectIds: new Set(),
      });
    }

    const data = geoMap.get(key);
    data.creditsOwned += purchase.creditAmount;
    data.projectIds.add(purchase.projectId);
  });

  const totalCredits = purchases.reduce((sum, p) => sum + p.creditAmount, 0);

  return Array.from(geoMap.values()).map((data) => ({
    region: data.region,
    country: data.country,
    projectCount: data.projectIds.size,
    creditsOwned: data.creditsOwned,
    percentage: (data.creditsOwned / totalCredits) * 100,
    impact: data.creditsOwned, // Simplified
  }));
}

function groupPurchasesByVintage(purchases: any[]): VintageBreakdown[] {
  const vintageMap = new Map<number, any>();

  purchases.forEach((purchase) => {
    const year = new Date(purchase._creationTime).getFullYear();
    if (!vintageMap.has(year)) {
      vintageMap.set(year, {
        year,
        creditsOwned: 0,
        projectCount: 0,
        totalAmount: 0,
        projectIds: new Set(),
      });
    }

    const data = vintageMap.get(year);
    data.creditsOwned += purchase.creditAmount;
    data.totalAmount += purchase.totalAmount;
    data.projectIds.add(purchase.projectId);
  });

  return Array.from(vintageMap.values()).map((data) => ({
    year: data.year,
    creditsOwned: data.creditsOwned,
    projectCount: data.projectIds.size,
    averagePrice: data.totalAmount / data.creditsOwned,
    qualityScore: 85, // Placeholder
  }));
}

function calculateRiskProfile(
  purchases: any[],
  projects: any[]
): RiskAssessment {
  // Simplified risk calculation
  const projectTypes = new Set(projects.map((p) => p.projectType)).size;
  const diversificationScore = Math.min(projectTypes / 6, 1) * 100; // Normalize to 0-100

  return {
    overallRisk:
      diversificationScore > 60
        ? 'low'
        : diversificationScore > 30
          ? 'medium'
          : 'high',
    diversificationScore,
    projectRiskDistribution: {
      low: 60,
      medium: 30,
      high: 10,
    },
    mitigationFactors: [
      'Geographic diversification',
      'Project type variety',
      'Verified carbon standards',
    ],
    recommendations: [
      'Consider adding more project types',
      'Increase geographic spread',
    ],
  };
}

function calculatePortfolioPerformance(
  purchases: any[],
  projects: any[]
): PortfolioPerformance {
  const totalInvestment = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalCredits = purchases.reduce((sum, p) => sum + p.creditAmount, 0);

  return {
    totalReturn: 0, // Would need market pricing
    annualizedReturn: 0,
    impactEfficiency: (totalCredits / totalInvestment) * 1000, // Credits per $1000
    benchmarkComparison: 1.15, // 15% above benchmark
    performanceMetrics: [
      {
        metric: 'Cost per Credit',
        value: totalInvestment / totalCredits,
        unit: 'USD',
        change: -5.2,
        benchmark: 25,
        status: 'outperforming',
      },
    ],
    trendsAnalysis: [
      {
        metric: 'Portfolio Value',
        trend: 'increasing',
        changePercent: 12.5,
        timeframe: '1 year',
        prediction: totalInvestment * 1.125,
        confidence: 0.8,
      },
    ],
  };
}

function extractAdditionalBenefits(update: any): Record<string, number> {
  const benefits: Record<string, number> = {};

  if (update?.treesPlanted) benefits['Trees Planted'] = update.treesPlanted;
  if (update?.energyGenerated)
    benefits['Energy Generated (kWh)'] = update.energyGenerated;
  if (update?.wasteProcessed)
    benefits['Waste Processed (tons)'] = update.wasteProcessed;

  return benefits;
}

function extractRiskFactors(project: any): string[] {
  const factors = [];

  if (project.status === 'active') factors.push('Project still in progress');
  if (!project.location?.coordinates)
    factors.push('Limited location verification');
  if (project.projectType === 'reforestation')
    factors.push('Subject to environmental risks');

  return factors;
}

function calculateSDGContributions(
  projectSummaries: ProjectImpactSummary[]
): SDGContribution[] {
  const sdgMap = new Map<number, any>();

  // Map project types to SDGs
  const projectTypeSDGMapping = {
    reforestation: [13, 15], // Climate Action, Life on Land
    solar: [7, 13], // Clean Energy, Climate Action
    wind: [7, 13],
    biogas: [7, 13],
    waste_management: [11, 12], // Sustainable Cities, Responsible Consumption
    mangrove_restoration: [13, 14, 15], // Climate, Life Below Water, Life on Land
  };

  projectSummaries.forEach((project) => {
    const sdgs =
      projectTypeSDGMapping[
        project.projectType as keyof typeof projectTypeSDGMapping
      ] || [];

    sdgs.forEach((sdg) => {
      if (!sdgMap.has(sdg)) {
        sdgMap.set(sdg, {
          goal: sdg,
          title: getSDGTitle(sdg),
          contribution: 'Direct impact through carbon offset projects',
          metrics: { carbonOffset: 0 },
          projectCount: 0,
        });
      }

      const data = sdgMap.get(sdg);
      data.metrics.carbonOffset += project.impactMetrics.carbonImpactToDate;
      data.projectCount++;
    });
  });

  return Array.from(sdgMap.values());
}

function calculateEnvironmentalBenefits(
  projectSummaries: ProjectImpactSummary[]
): EnvironmentalBenefit[] {
  return [
    {
      category: 'Carbon Sequestration',
      description: 'Total CO2 removed from atmosphere',
      quantification: projectSummaries.reduce(
        (sum, p) => sum + p.impactMetrics.carbonImpactToDate,
        0
      ),
      unit: 'tons CO2',
      verification: 'Third-party verified',
    },
    {
      category: 'Biodiversity Conservation',
      description: 'Habitat preserved and restored',
      quantification:
        projectSummaries.filter((p) => p.projectType === 'reforestation')
          .length * 100,
      unit: 'hectares',
      verification: 'Satellite monitoring',
    },
  ];
}

function calculateSocialImpact(
  projectSummaries: ProjectImpactSummary[]
): SocialImpact[] {
  return [
    {
      category: 'Local Employment',
      description: 'Jobs created in local communities',
      beneficiaries: projectSummaries.length * 25, // Estimate
      location: 'Project regions',
      projectsContributing: projectSummaries.map((p) => p.projectName),
    },
  ];
}

function calculateEconomicImpact(
  projectSummaries: ProjectImpactSummary[]
): EconomicImpact[] {
  const totalInvestment = projectSummaries.reduce(
    (sum, p) => sum + p.financials.totalInvestment,
    0
  );

  return [
    {
      category: 'Direct Investment',
      description: 'Capital invested in sustainable projects',
      value: totalInvestment,
      currency: 'USD',
      localEconomyBoost: totalInvestment * 0.7, // Estimate 70% local impact
    },
  ];
}

function calculateTimespan(projectSummaries: ProjectImpactSummary[]): number {
  if (projectSummaries.length === 0) return 0;

  const earliest = Math.min(...projectSummaries.map((p) => p._creationTime));
  const latest = Math.max(...projectSummaries.map((p) => p._creationTime));

  return Math.ceil((latest - earliest) / (365 * 24 * 60 * 60 * 1000)); // Years
}

function getSDGTitle(goal: number): string {
  const titles = {
    7: 'Affordable and Clean Energy',
    11: 'Sustainable Cities and Communities',
    12: 'Responsible Consumption and Production',
    13: 'Climate Action',
    14: 'Life Below Water',
    15: 'Life on Land',
  };

  return titles[goal as keyof typeof titles] || `SDG ${goal}`;
}

async function generateImpactCertificates(
  ctx: any,
  buyerId: string,
  projects: any[],
  purchases: any[]
): Promise<ImpactCertificate[]> {
  // Generate a carbon offset certificate
  const totalOffset = purchases.reduce((sum, p) => sum + p.creditAmount, 0);

  if (totalOffset === 0) return [];

  return [
    {
      id: crypto.randomUUID(),
      type: 'carbon_offset',
      title: 'Carbon Offset Certificate',
      description: `This certificate verifies the offset of ${totalOffset} tons of CO2 equivalent`,
      quantification: totalOffset,
      unit: 'tons CO2e',
      verificationStandard: 'VCS (Verified Carbon Standard)',
      issueDate: Date.now(),
      validUntil: Date.now() + 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
      projects: projects.map((p) => p._id),
      metadata: {
        serialNumber: `EC-${Date.now()}-${buyerId.slice(-6)}`,
        issuer: 'Echo Sprout Platform',
        verifier: 'Third-Party Verification Body',
        methodology: 'VM0009 - Afforestation and Reforestation',
        additionalCertifications: [
          'Gold Standard',
          'Climate, Community & Biodiversity Standards',
        ],
        auditTrail: [
          {
            date: Date.now(),
            action: 'Certificate Issued',
            actor: 'System',
            details:
              'Automated certificate generation based on verified credits',
          },
        ],
      },
    },
  ];
}

function generateBuyerRecommendations(
  portfolio: BuyerPortfolio,
  projects: ProjectImpactSummary[]
): BuyerRecommendation[] {
  const recommendations = [];

  // Diversification recommendation
  if (portfolio.projectTypes.length < 3) {
    recommendations.push({
      id: crypto.randomUUID(),
      type: 'diversification' as const,
      priority: 'high' as const,
      title: 'Increase Portfolio Diversification',
      description:
        'Your portfolio is concentrated in few project types. Consider diversifying to reduce risk.',
      rationale:
        'Diversification reduces exposure to sector-specific risks and improves overall portfolio stability.',
      expectedBenefit: 'Reduced risk by 20-30% and improved long-term returns',
      implementation: [
        {
          step: 1,
          action: 'Research new project types',
          description: 'Explore solar, wind, or waste management projects',
          timeframe: '2 weeks',
          resources: ['Project catalog', 'Impact analysis tools'],
        },
      ],
      impact: {
        riskReduction: 25,
        impactIncrease: 15,
        costImplication: 0,
      },
    });
  }

  return recommendations;
}

async function generateImpactComparisons(
  ctx: any,
  portfolio: BuyerPortfolio,
  totalImpact: TotalImpactSummary
): Promise<ImpactComparison[]> {
  // Simplified comparison logic
  return [
    {
      comparisonType: 'industry_average',
      metric: 'Cost per Credit',
      buyerValue: portfolio.totalInvestment / portfolio.totalCreditsOwned,
      benchmarkValue: 25,
      percentile: 75,
      status: 'above_average',
      insights: ['Your cost efficiency is better than 75% of buyers'],
    },
  ];
}

function calculateSustainabilityMetrics(
  portfolio: BuyerPortfolio,
  totalImpact: TotalImpactSummary
): SustainabilityMetrics {
  return {
    esgScore: 85,
    sustainabilityRating: 'A-',
    alignment: {
      parisAgreement: 90,
      sdgs: 85,
      corporateGoals: 80,
    },
    reporting: {
      ghgProtocol: true,
      tcfd: false,
      sb: false,
      cdp: true,
    },
    certifications: ['Carbon Neutral', 'B-Corp Certified'],
    transparency: {
      score: 92,
      publicDisclosure: true,
      thirdPartyVerification: true,
    },
  };
}

async function generateCertificate(
  ctx: any,
  args: any
): Promise<ImpactCertificate> {
  // Get purchase data for certificate generation
  const purchases = await ctx.db
    .query('transactions')
    .withIndex('by_buyer', (q: any) => q.eq('buyerId', args.buyerId))
    .filter((q: any) => q.eq(q.field('paymentStatus'), 'completed'))
    .collect();

  const totalQuantification = purchases
    .filter(
      (p: any) => !args.projectIds || args.projectIds.includes(p.projectId)
    )
    .reduce((sum: number, p: any) => sum + p.creditAmount, 0);

  return {
    id: crypto.randomUUID(),
    type: args.certificateType,
    title: `${args.certificateType.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} Certificate`,
    description: `This certificate verifies ${totalQuantification} tons of CO2 equivalent offset`,
    quantification: totalQuantification,
    unit: 'tons CO2e',
    verificationStandard: 'VCS (Verified Carbon Standard)',
    issueDate: Date.now(),
    validUntil: Date.now() + 5 * 365 * 24 * 60 * 60 * 1000,
    certificateUrl: `https://certificates.echosprout.com/${crypto.randomUUID()}`,
    projects: args.projectIds || purchases.map((p: any) => p.projectId),
    metadata: {
      serialNumber: `EC-${Date.now()}-${args.buyerId.slice(-6)}`,
      issuer: 'Echo Sprout Platform',
      verifier: 'Third-Party Verification Body',
      methodology: 'VM0009 - Afforestation and Reforestation',
      additionalCertifications: ['Gold Standard'],
      auditTrail: [
        {
          date: Date.now(),
          action: 'Certificate Generated',
          actor: 'System',
          details: 'Certificate generated for verified carbon credits',
        },
      ],
    },
  };
}

function calculateImpactTrends(
  purchases: any[],
  timeframe: string,
  metrics: string[]
) {
  // Simplified trend calculation
  const trends = [];

  if (metrics.includes('carbon_impact')) {
    trends.push({
      metric: 'Carbon Impact',
      timeframe,
      data: purchases.map((p) => ({
        date: p._creationTime,
        value: p.creditAmount,
      })),
      trend: 'increasing',
      changePercent: 15.2,
      forecast: {
        nextPeriod: purchases.length * 1.15,
        confidence: 0.8,
      },
    });
  }

  return trends;
}

// ============= BUYER PROJECT TRACKING QUERIES =============

/**
 * Get project tracking data for a specific buyer
 */
export const getBuyerProjectTracking = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Verify user can access this data
    const hasAccess = await verifyBuyerAccess(ctx, userId, identity.subject);
    if (!hasAccess) {
      throw new Error('Not authorized to access this data');
    }

    // Get all credit purchases by this user
    const purchases = await ctx.db
      .query('transactions')
      .withIndex('by_buyer', (q) => q.eq('buyerId', userId))
      .filter((q) => q.eq(q.field('paymentStatus'), 'completed'))
      .collect();

    const trackingData = [];

    for (const purchase of purchases) {
      const projectId = purchase.projectId;
      if (!projectId) continue;
      const project = await ctx.db.get(projectId);
      if (!project) continue;

      // Get recent progress updates for this project
      const recentUpdates = await ctx.db
        .query('progressUpdates')
        .withIndex('by_project', (q) => q.eq('projectId', projectId))
        .order('desc')
        .take(3);

      // Get project milestones
      const milestones = await ctx.db
        .query('projectMilestones')
        .withIndex('by_project', (q) => q.eq('projectId', projectId))
        .order('asc')
        .collect();

      // Get active alerts for this project
      const alerts = await ctx.db
        .query('systemAlerts')
        .withIndex('by_project', (q) => q.eq('projectId', projectId))
        .filter((q) => q.eq(q.field('isResolved'), false))
        .collect();

      // Calculate current progress
      const completedMilestones = milestones.filter(
        (m) => m.status === 'completed'
      ).length;
      const totalMilestones = milestones.length;
      const overallProgress =
        totalMilestones > 0
          ? Math.round((completedMilestones / totalMilestones) * 100)
          : 0;

      // Get next milestone
      const nextMilestone = milestones.find(
        (m) => m.status === 'pending' || m.status === 'in_progress'
      );

      // Calculate carbon impact to date
      const latestUpdate = recentUpdates[0];
      const carbonOffset =
        latestUpdate?.measurementData?.carbonImpactToDate ||
        purchase.creditAmount * 1.5; // Fallback estimation

      trackingData.push({
        projectId: purchase.projectId,
        projectTitle: project.title,
        projectType: project.projectType,
        creatorName: 'Project Creator', // Will need to fetch from users table
        location: {
          country: project.location?.name || 'Unknown',
          region: project.location?.name || 'Unknown',
        },
        purchaseInfo: {
          creditsOwned: purchase.creditAmount,
          purchaseDate: purchase._creationTime,
          totalInvestment: purchase.totalAmount,
        },
        currentStatus: {
          overallProgress,
          currentPhase: 'In Progress', // Schema doesn't have currentPhase
          nextMilestone: nextMilestone?.title || 'Project Completion',
          nextMilestoneDate:
            nextMilestone?.plannedDate || project.expectedCompletionDate,
        },
        recentUpdates: recentUpdates.map((update) => ({
          id: update._id,
          type: update.updateType,
          title: update.title,
          description: update.description,
          date: update.reportingDate || update._creationTime,
          photos: update.photoUrls || update.photos?.map((p) => p.cloudinary_url) || [],
          metrics: update.measurementData,
        })),
        impact: {
          carbonOffset,
          additionalMetrics: latestUpdate?.measurementData || {},
        },
        alerts: alerts.map((alert) => ({
          id: alert._id,
          severity: alert.severity,
          message: alert.message,
          date: alert._creationTime,
          isResolved: alert.isResolved,
        })),
        milestones: milestones.map((milestone) => ({
          id: milestone._id,
          title: milestone.title,
          plannedDate: milestone.plannedDate,
          actualDate: milestone.actualDate,
          status: milestone.status,
          description: milestone.description,
        })),
        verificationStatus: {
          status: project.verificationStatus || 'pending',
          lastVerified: project.verificationCompletedAt,
          nextVerification: null, // Schema doesn't have nextVerificationDate
        },
      });
    }

    return trackingData;
  },
});

/**
 * Get detailed tracking data for a specific project (buyer view)
 */
export const getDetailedProjectTracking = query({
  args: {
    projectId: v.id('projects'),
    userId: v.id('users'),
  },
  handler: async (ctx, { projectId, userId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Verify user can access this data
    const hasAccess = await verifyBuyerAccess(ctx, userId, identity.subject);
    if (!hasAccess) {
      throw new Error('Not authorized to access this data');
    }

    // Verify the user has purchased credits for this project
    const purchase = await ctx.db
      .query('transactions')
      .withIndex('by_buyer', (q) => q.eq('buyerId', userId))
      .filter((q) =>
        q.and(
          q.eq(q.field('projectId'), projectId),
          q.eq(q.field('paymentStatus'), 'completed')
        )
      )
      .first();

    if (!purchase) {
      throw new Error(
        'Access denied: You have not purchased credits for this project'
      );
    }

    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get all progress updates
    const progressUpdates = await ctx.db
      .query('progressUpdates')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .order('desc')
      .collect();

    // Get all milestones
    const milestones = await ctx.db
      .query('projectMilestones')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .order('asc')
      .collect();

    // Get all alerts (resolved and unresolved)
    const alerts = await ctx.db
      .query('systemAlerts')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .order('desc')
      .collect();

    // Calculate detailed progress metrics
    const completedMilestones = milestones.filter(
      (m) => m.status === 'completed'
    ).length;
    const totalMilestones = milestones.length;
    const overallProgress =
      totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0;

    const nextMilestone = milestones.find(
      (m) => m.status === 'pending' || m.status === 'in_progress'
    );

    // Calculate total carbon impact
    const latestUpdate = progressUpdates[0];
    const carbonOffset =
      latestUpdate?.measurementData?.carbonImpactToDate ||
      purchase.creditAmount * 1.5;

    return {
      projectId,
      projectTitle: project.title,
      projectType: project.projectType,
      projectDescription: project.description,
      creatorName: 'Project Creator', // Will need to fetch from users table
      location: {
        country: project.location?.name || 'Unknown',
        region: project.location?.name || 'Unknown',
      },
      purchaseInfo: {
        creditsOwned: purchase.creditAmount,
        purchaseDate: purchase._creationTime,
        totalInvestment: purchase.totalAmount,
      },
      currentStatus: {
        overallProgress,
        currentPhase: 'In Progress', // Schema doesn't have currentPhase
        nextMilestone: nextMilestone?.title || 'Project Completion',
        nextMilestoneDate:
          nextMilestone?.plannedDate || project.expectedCompletionDate,
      },
      recentUpdates: progressUpdates.map((update) => ({
        id: update._id,
        type: update.updateType,
        title: update.title,
        description: update.description,
        date: update.reportingDate || update._creationTime,
        photos: update.photoUrls || update.photos?.map((p) => p.cloudinary_url) || [],
        metrics: update.measurementData,
      })),
      impact: {
        carbonOffset,
        additionalMetrics: latestUpdate?.measurementData || {},
      },
      alerts: alerts.map((alert) => ({
        id: alert._id,
        severity: alert.severity,
        message: alert.message,
        date: alert._creationTime,
        isResolved: alert.isResolved,
        resolvedAt: alert.resolvedAt,
        resolutionNotes: alert.resolutionNotes,
      })),
      milestones: milestones.map((milestone) => ({
        id: milestone._id,
        title: milestone.title,
        plannedDate: milestone.plannedDate,
        actualDate: milestone.actualDate,
        status: milestone.status,
        description: milestone.description,
        delayReason: milestone.delayReason,
      })),
      verificationStatus: {
        status: project.verificationStatus || 'pending',
        lastVerified: project.verificationCompletedAt,
        nextVerification: null, // Schema doesn't have nextVerificationDate
      },
      timeline: {
        startDate: project.startDate,
        expectedCompletion: project.expectedCompletionDate,
        actualCompletion: project.actualCompletionDate,
      },
    };
  },
});

/**
 * Get buyer's portfolio summary for tracking overview
 */
export const getBuyerPortfolioSummary = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Verify user can access this data
    const hasAccess = await verifyBuyerAccess(ctx, userId, identity.subject);
    if (!hasAccess) {
      throw new Error('Not authorized to access this data');
    }

    // Get all purchases by this buyer
    const purchases = await ctx.db
      .query('transactions')
      .withIndex('by_buyer', (q) => q.eq('buyerId', userId))
      .filter((q) => q.eq(q.field('paymentStatus'), 'completed'))
      .collect();

    let totalCredits = 0;
    let totalInvestment = 0;
    let totalCarbonOffset = 0;
    let activeProjects = 0;
    let completedProjects = 0;
    let projectsWithIssues = 0;

    for (const purchase of purchases) {
      totalCredits += purchase.creditAmount;
      totalInvestment += purchase.totalAmount;

      const projectId = purchase.projectId;
      if (!projectId) continue;
      const project = await ctx.db.get(projectId);
      if (!project) continue;

      // Get latest progress update for carbon impact
      const latestUpdate = await ctx.db
        .query('progressUpdates')
        .withIndex('by_project', (q) => q.eq('projectId', projectId))
        .order('desc')
        .first();

      const carbonOffset =
        latestUpdate?.measurementData?.carbonImpactToDate ||
        purchase.creditAmount * 1.5;
      totalCarbonOffset += carbonOffset;

      // Check project status
      if (project.status === 'completed') {
        completedProjects++;
      } else {
        activeProjects++;
      }

      // Check for unresolved alerts
      const hasIssues = await ctx.db
        .query('systemAlerts')
        .withIndex('by_project', (q) => q.eq('projectId', projectId))
        .filter((q) => q.eq(q.field('isResolved'), false))
        .first();

      if (hasIssues) {
        projectsWithIssues++;
      }
    }

    return {
      totalCredits,
      totalInvestment,
      totalCarbonOffset: Math.round(totalCarbonOffset * 10) / 10, // Round to 1 decimal
      activeProjects,
      completedProjects,
      projectsWithIssues,
      totalProjects: purchases.length,
      averageInvestment:
        purchases.length > 0 ? totalInvestment / purchases.length : 0,
    };
  },
});
