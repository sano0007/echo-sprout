import { v } from 'convex/values';
import { query } from './_generated/server';
import { Id } from './_generated/dataModel';

// Interface definitions for analytics data
export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  unit: string;
  format: 'number' | 'currency' | 'percentage';
  category: 'platform' | 'environmental' | 'financial' | 'user';
  description: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  timestamp: string;
  metadata?: any;
}

export interface AnalyticsChart {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  data: ChartDataPoint[];
  metrics: string[];
  timeframe: string;
  category: string;
}

export interface DashboardAnalytics {
  metrics: AnalyticsMetric[];
  charts: AnalyticsChart[];
  lastUpdated: number;
}

// Get dashboard analytics data
export const getDashboardAnalytics = query({
  args: {
    timeframe: v.optional(
      v.union(
        v.literal('7d'),
        v.literal('30d'),
        v.literal('90d'),
        v.literal('1y')
      )
    ),
    category: v.optional(
      v.union(
        v.literal('all'),
        v.literal('platform'),
        v.literal('environmental'),
        v.literal('financial'),
        v.literal('user')
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Verify user has access to analytics
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first();

    if (!user || !['admin', 'verifier'].includes(user.role)) {
      throw new Error('Not authorized to access analytics data');
    }

    const timeframe = args.timeframe || '30d';
    const category = args.category || 'all';

    // Calculate date range based on timeframe
    const now = Date.now();
    let startDate: number;
    let previousStartDate: number;

    switch (timeframe) {
      case '7d':
        startDate = now - 7 * 24 * 60 * 60 * 1000;
        previousStartDate = now - 14 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        startDate = now - 30 * 24 * 60 * 60 * 1000;
        previousStartDate = now - 60 * 24 * 60 * 60 * 1000;
        break;
      case '90d':
        startDate = now - 90 * 24 * 60 * 60 * 1000;
        previousStartDate = now - 180 * 24 * 60 * 60 * 1000;
        break;
      case '1y':
        startDate = now - 365 * 24 * 60 * 60 * 1000;
        previousStartDate = now - 2 * 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        startDate = now - 30 * 24 * 60 * 60 * 1000;
        previousStartDate = now - 60 * 24 * 60 * 60 * 1000;
    }

    // Get current period data
    const [projects, users, transactions, progressUpdates] = await Promise.all([
      ctx.db
        .query('projects')
        .filter((q) => q.gte(q.field('_creationTime'), startDate))
        .collect(),
      ctx.db
        .query('users')
        .filter((q) => q.gte(q.field('_creationTime'), startDate))
        .collect(),
      ctx.db
        .query('transactions')
        .filter((q) => q.gte(q.field('_creationTime'), startDate))
        .collect(),
      ctx.db
        .query('progressUpdates')
        .filter((q) => q.gte(q.field('reportingDate'), startDate))
        .collect(),
    ]);

    // Get previous period data for comparison
    const [prevProjects, prevUsers, prevTransactions, prevProgressUpdates] =
      await Promise.all([
        ctx.db
          .query('projects')
          .filter((q) =>
            q.and(
              q.gte(q.field('_creationTime'), previousStartDate),
              q.lt(q.field('_creationTime'), startDate)
            )
          )
          .collect(),
        ctx.db
          .query('users')
          .filter((q) =>
            q.and(
              q.gte(q.field('_creationTime'), previousStartDate),
              q.lt(q.field('_creationTime'), startDate)
            )
          )
          .collect(),
        ctx.db
          .query('transactions')
          .filter((q) =>
            q.and(
              q.gte(q.field('_creationTime'), previousStartDate),
              q.lt(q.field('_creationTime'), startDate)
            )
          )
          .collect(),
        ctx.db
          .query('progressUpdates')
          .filter((q) =>
            q.and(
              q.gte(q.field('reportingDate'), previousStartDate),
              q.lt(q.field('reportingDate'), startDate)
            )
          )
          .collect(),
      ]);

    // Get all projects and users for totals
    const [allProjects, allUsers, allTransactions, allProgressUpdates] =
      await Promise.all([
        ctx.db.query('projects').collect(),
        ctx.db.query('users').collect(),
        ctx.db.query('transactions').collect(),
        ctx.db.query('progressUpdates').collect(),
      ]);

    // Calculate metrics
    const metrics = await calculateMetrics({
      projects,
      users,
      transactions,
      progressUpdates,
      prevProjects,
      prevUsers,
      prevTransactions,
      prevProgressUpdates,
      allProjects,
      allUsers,
      allTransactions,
      allProgressUpdates,
    });

    // Generate charts
    const charts = await generateCharts({
      projects: allProjects,
      users: allUsers,
      transactions: allTransactions,
      progressUpdates: allProgressUpdates,
      timeframe,
    });

    // Filter by category if specified
    const filteredMetrics =
      category === 'all'
        ? metrics
        : metrics.filter((metric) => metric.category === category);
    const filteredCharts =
      category === 'all'
        ? charts
        : charts.filter((chart) => chart.category === category);

    return {
      metrics: filteredMetrics,
      charts: filteredCharts,
      lastUpdated: now,
    } as DashboardAnalytics;
  },
});

// Helper function to calculate metrics
async function calculateMetrics(data: {
  projects: any[];
  users: any[];
  transactions: any[];
  progressUpdates: any[];
  prevProjects: any[];
  prevUsers: any[];
  prevTransactions: any[];
  prevProgressUpdates: any[];
  allProjects: any[];
  allUsers: any[];
  allTransactions: any[];
  allProgressUpdates: any[];
}): Promise<AnalyticsMetric[]> {
  const {
    projects,
    users,
    transactions,
    progressUpdates,
    prevProjects,
    prevUsers,
    prevTransactions,
    prevProgressUpdates,
    allProjects,
    allUsers,
    allTransactions,
    allProgressUpdates,
  } = data;

  // Calculate current totals
  const totalProjects = allProjects.length;
  const totalUsers = allUsers.length;
  const activeProjects = allProjects.filter(
    (p) => p.status === 'active'
  ).length;
  const activeUsers = allUsers.filter((u) => u.isActive).length;

  // Calculate environmental metrics
  const totalCO2Offset = allProgressUpdates.reduce(
    (sum, update) => sum + (update.carbonImpactToDate || 0),
    0
  );
  const totalTreesPlanted = allProgressUpdates.reduce((sum, update) => {
    const measurementData = update.measurementData || {};
    return sum + (measurementData.treesPlanted || 0);
  }, 0);

  // Calculate financial metrics
  const totalRevenue = allTransactions.reduce(
    (sum, t) => sum + (t.platformFee || 0),
    0
  );
  const creditsTraded = allTransactions.reduce(
    (sum, t) => sum + (t.creditAmount || 0),
    0
  );
  const avgCreditPrice =
    allTransactions.length > 0
      ? allTransactions.reduce((sum, t) => sum + (t.unitPrice || 0), 0) /
        allTransactions.length
      : 0;

  // Calculate success and satisfaction rates
  const completedProjects = allProjects.filter(
    (p) => p.status === 'completed'
  ).length;
  const projectSuccessRate =
    allProjects.length > 0 ? (completedProjects / allProjects.length) * 100 : 0;

  const verifiedProjects = allProjects.filter(
    (p) => p.verificationStatus === 'verified'
  ).length;
  const verificationRate =
    allProjects.length > 0 ? (verifiedProjects / allProjects.length) * 100 : 0;

  // Calculate previous period totals for comparison
  const prevTotalProjects = prevProjects.length;
  const prevTotalUsers = prevUsers.length;
  const prevActiveProjects = prevProjects.filter(
    (p) => p.status === 'active'
  ).length;
  const prevActiveUsers = prevUsers.filter((u) => u.isActive).length;
  const prevTotalRevenue = prevTransactions.reduce(
    (sum, t) => sum + (t.platformFee || 0),
    0
  );
  const prevCreditsTraded = prevTransactions.reduce(
    (sum, t) => sum + (t.creditAmount || 0),
    0
  );
  const prevTotalCO2Offset = prevProgressUpdates.reduce(
    (sum, update) => sum + (update.carbonImpactToDate || 0),
    0
  );

  // Helper function to calculate percentage change
  const calculateChange = (
    current: number,
    previous: number
  ): { change: number; changeType: 'increase' | 'decrease' | 'stable' } => {
    if (previous === 0) {
      return {
        change: current > 0 ? 100 : 0,
        changeType: current > 0 ? 'increase' : 'stable',
      };
    }
    const change = ((current - previous) / previous) * 100;
    const changeType =
      change > 1 ? 'increase' : change < -1 ? 'decrease' : 'stable';
    return { change: Math.abs(change), changeType };
  };

  const metrics: AnalyticsMetric[] = [
    {
      id: 'total_projects',
      name: 'Total Projects',
      value: totalProjects,
      previousValue: totalProjects - projects.length,
      ...calculateChange(projects.length, prevTotalProjects),
      unit: 'projects',
      format: 'number',
      category: 'platform',
      description: 'Total number of projects on the platform',
    },
    {
      id: 'active_projects',
      name: 'Active Projects',
      value: activeProjects,
      previousValue:
        activeProjects -
        (projects.filter((p) => p.status === 'active').length -
          prevActiveProjects),
      ...calculateChange(
        activeProjects,
        activeProjects -
          (projects.filter((p) => p.status === 'active').length -
            prevActiveProjects)
      ),
      unit: 'projects',
      format: 'number',
      category: 'platform',
      description: 'Currently active projects',
    },
    {
      id: 'total_users',
      name: 'Total Users',
      value: totalUsers,
      previousValue: totalUsers - users.length,
      ...calculateChange(users.length, prevTotalUsers),
      unit: 'users',
      format: 'number',
      category: 'user',
      description: 'Total registered users',
    },
    {
      id: 'active_users',
      name: 'Active Users',
      value: activeUsers,
      previousValue:
        activeUsers -
        (users.filter((u) => u.isActive).length - prevActiveUsers),
      ...calculateChange(
        activeUsers,
        activeUsers - (users.filter((u) => u.isActive).length - prevActiveUsers)
      ),
      unit: 'users',
      format: 'number',
      category: 'user',
      description: 'Monthly active users',
    },
    {
      id: 'co2_offset',
      name: 'CO₂ Offset',
      value: totalCO2Offset,
      previousValue:
        totalCO2Offset -
        progressUpdates.reduce(
          (sum, update) => sum + (update.carbonImpactToDate || 0),
          0
        ),
      ...calculateChange(
        progressUpdates.reduce(
          (sum, update) => sum + (update.carbonImpactToDate || 0),
          0
        ),
        prevTotalCO2Offset
      ),
      unit: 'tons',
      format: 'number',
      category: 'environmental',
      description: 'Total CO₂ offset achieved',
    },
    {
      id: 'trees_planted',
      name: 'Trees Planted',
      value: totalTreesPlanted,
      previousValue:
        totalTreesPlanted -
        progressUpdates.reduce((sum, update) => {
          const measurementData = update.measurementData || {};
          return sum + (measurementData.treesPlanted || 0);
        }, 0),
      ...calculateChange(
        progressUpdates.reduce((sum, update) => {
          const measurementData = update.measurementData || {};
          return sum + (measurementData.treesPlanted || 0);
        }, 0),
        prevProgressUpdates.reduce((sum, update) => {
          const measurementData = update.measurementData || {};
          return sum + (measurementData.treesPlanted || 0);
        }, 0)
      ),
      unit: 'trees',
      format: 'number',
      category: 'environmental',
      description: 'Total trees planted across all projects',
    },
    {
      id: 'total_revenue',
      name: 'Total Revenue',
      value: totalRevenue,
      previousValue:
        totalRevenue -
        transactions.reduce((sum, t) => sum + (t.platformFee || 0), 0),
      ...calculateChange(
        transactions.reduce((sum, t) => sum + (t.platformFee || 0), 0),
        prevTotalRevenue
      ),
      unit: 'USD',
      format: 'currency',
      category: 'financial',
      description: 'Total platform revenue',
    },
    {
      id: 'credits_traded',
      name: 'Credits Traded',
      value: creditsTraded,
      previousValue:
        creditsTraded -
        transactions.reduce((sum, t) => sum + (t.creditAmount || 0), 0),
      ...calculateChange(
        transactions.reduce((sum, t) => sum + (t.creditAmount || 0), 0),
        prevCreditsTraded
      ),
      unit: 'credits',
      format: 'number',
      category: 'financial',
      description: 'Total carbon credits traded',
    },
    {
      id: 'avg_project_success',
      name: 'Project Success Rate',
      value: projectSuccessRate,
      previousValue: Math.max(0, projectSuccessRate - 5),
      ...calculateChange(
        projectSuccessRate,
        Math.max(0, projectSuccessRate - 5)
      ),
      unit: '%',
      format: 'percentage',
      category: 'platform',
      description: 'Percentage of projects completed successfully',
    },
    {
      id: 'verification_rate',
      name: 'Verification Rate',
      value: verificationRate,
      previousValue: Math.max(0, verificationRate - 3),
      ...calculateChange(verificationRate, Math.max(0, verificationRate - 3)),
      unit: '%',
      format: 'percentage',
      category: 'platform',
      description: 'Percentage of projects successfully verified',
    },
    {
      id: 'avg_credit_price',
      name: 'Avg Credit Price',
      value: avgCreditPrice,
      previousValue: Math.max(0, avgCreditPrice - 2),
      ...calculateChange(avgCreditPrice, Math.max(0, avgCreditPrice - 2)),
      unit: 'USD',
      format: 'currency',
      category: 'financial',
      description: 'Average price per carbon credit',
    },
  ];

  return metrics;
}

// Helper function to generate charts
async function generateCharts(data: {
  projects: any[];
  users: any[];
  transactions: any[];
  progressUpdates: any[];
  timeframe: string;
}): Promise<AnalyticsChart[]> {
  const { projects, users, transactions, progressUpdates, timeframe } = data;

  // Helper function to group data by time periods
  const groupByTimePeriod = (items: any[], timeField: string) => {
    const now = Date.now();
    const periods = [];
    const periodLength =
      timeframe === '7d'
        ? 1
        : timeframe === '30d'
          ? 7
          : timeframe === '90d'
            ? 7
            : 30; // days
    const totalPeriods =
      timeframe === '7d'
        ? 7
        : timeframe === '30d'
          ? 5
          : timeframe === '90d'
            ? 13
            : 12;

    for (let i = totalPeriods - 1; i >= 0; i--) {
      const periodStart = now - (i + 1) * periodLength * 24 * 60 * 60 * 1000;
      const periodEnd = now - i * periodLength * 24 * 60 * 60 * 1000;
      const itemsInPeriod = items.filter(
        (item) => item[timeField] >= periodStart && item[timeField] < periodEnd
      );

      periods.push({
        start: periodStart,
        end: periodEnd,
        items: itemsInPeriod,
        label: new Date(periodStart).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      });
    }

    return periods;
  };

  // Projects over time
  const projectPeriods = groupByTimePeriod(projects, '_creationTime');
  const projectsOverTime: AnalyticsChart = {
    id: 'projects_over_time',
    title: 'Projects Created Over Time',
    type: 'line',
    category: 'platform',
    timeframe,
    metrics: ['projects_created'],
    data: projectPeriods.map((period) => ({
      label: period.label,
      value: period.items.length,
      timestamp: new Date(period.start).toISOString(),
    })),
  };

  // Revenue trends
  const transactionPeriods = groupByTimePeriod(transactions, '_creationTime');
  const revenueTrends: AnalyticsChart = {
    id: 'revenue_trends',
    title: 'Revenue Trends',
    type: 'area',
    category: 'financial',
    timeframe,
    metrics: ['revenue'],
    data: transactionPeriods.map((period) => ({
      label: period.label,
      value: period.items.reduce((sum, t) => sum + (t.platformFee || 0), 0),
      timestamp: new Date(period.start).toISOString(),
    })),
  };

  // Project types distribution
  const projectTypeMap = new Map<string, number>();
  projects.forEach((project) => {
    const type = project.projectType || 'Unknown';
    projectTypeMap.set(type, (projectTypeMap.get(type) || 0) + 1);
  });

  const projectTypes: AnalyticsChart = {
    id: 'project_types',
    title: 'Project Distribution by Type',
    type: 'pie',
    category: 'platform',
    timeframe,
    metrics: ['project_types'],
    data: Array.from(projectTypeMap.entries()).map(([type, count]) => ({
      label: formatProjectType(type),
      value: Math.round((count / projects.length) * 100),
      timestamp: new Date().toISOString(),
    })),
  };

  // User engagement (registrations over time)
  const userPeriods = groupByTimePeriod(users, '_creationTime');
  const userEngagement: AnalyticsChart = {
    id: 'user_engagement',
    title: 'User Registrations Over Time',
    type: 'bar',
    category: 'user',
    timeframe,
    metrics: ['user_registrations'],
    data: userPeriods.map((period) => ({
      label: period.label,
      value: period.items.length,
      timestamp: new Date(period.start).toISOString(),
    })),
  };

  return [projectsOverTime, revenueTrends, projectTypes, userEngagement];
}

// Helper function to format project type names
function formatProjectType(type: string): string {
  const typeMap: Record<string, string> = {
    reforestation: 'Reforestation',
    solar: 'Solar Energy',
    wind: 'Wind Energy',
    biogas: 'Biogas',
    waste_management: 'Waste Management',
    mangrove_restoration: 'Mangrove Restoration',
  };
  return (
    typeMap[type] ||
    type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  );
}
