'use client';

import { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  DollarSign,
  Leaf,
  Globe,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  TreePine,
  Car,
  Home,
  Plane,
  Factory,
} from 'lucide-react';
import { api } from '@packages/backend/convex/_generated/api';
import type {
  ActiveAlert,
  StatusBreakdown,
  TypeBreakdown,
  RoleBreakdown,
  SourceBreakdown,
  RegionBreakdown,
  ImpactByRegion,
  TimeSeriesPoint,
  TrendData,
} from '@packages/backend/convex/analytics_engine';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

// Color palette for charts
const CHART_COLORS = {
  primary: '#22c55e',
  secondary: '#3b82f6',
  tertiary: '#f59e0b',
  quaternary: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
  emerald: '#10b981',
};

const CHART_COLOR_ARRAY = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.tertiary,
  CHART_COLORS.quaternary,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
  CHART_COLORS.indigo,
  CHART_COLORS.emerald,
];

interface TimeFrame {
  startDate: number;
  endDate: number;
  granularity: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

interface AnalyticsFilters {
  timeframe: TimeFrame;
  projectTypes?: string[];
  regions?: string[];
  userRoles?: string[];
}

export default function AdminAnalyticsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate timeframe based on selection
  const timeframe = useMemo((): TimeFrame => {
    const now = Date.now();
    let startDate: number;
    let granularity: TimeFrame['granularity'] = 'daily';

    switch (selectedTimeRange) {
      case '7d':
        startDate = now - 7 * 24 * 60 * 60 * 1000;
        granularity = 'daily';
        break;
      case '30d':
        startDate = now - 30 * 24 * 60 * 60 * 1000;
        granularity = 'daily';
        break;
      case '3m':
        startDate = now - 90 * 24 * 60 * 60 * 1000;
        granularity = 'weekly';
        break;
      case '6m':
        startDate = now - 180 * 24 * 60 * 60 * 1000;
        granularity = 'weekly';
        break;
      case '1y':
        startDate = now - 365 * 24 * 60 * 60 * 1000;
        granularity = 'monthly';
        break;
      default:
        startDate = now - 30 * 24 * 60 * 60 * 1000;
        granularity = 'daily';
    }

    return { startDate, endDate: now, granularity };
  }, [selectedTimeRange]);

  // Data fetching with Convex queries
  const projectData = useQuery(api.analytics_engine.aggregateProjectData, {
    timeframe,
  });
  const userData = useQuery(api.analytics_engine.aggregateUserData, {
    timeframe,
  });
  const transactionData = useQuery(
    api.analytics_engine.aggregateTransactionData,
    { timeframe }
  );
  const impactData = useQuery(api.analytics_engine.aggregateImpactData, {
    timeframe,
  });
  const platformPerformance = useQuery(
    api.analytics_engine.calculatePlatformPerformance,
    { timeframe }
  );
  const realTimeMetrics = useQuery(api.analytics_engine.getCurrentMetrics, {});
  const systemHealth = useQuery(api.analytics_engine.getSystemHealth, {});

  // Loading state
  const isLoading =
    !projectData || !userData || !transactionData || !impactData;

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // In a real implementation, you might want to invalidate queries here
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Overview metrics calculation
  const overviewMetrics = useMemo(() => {
    if (!projectData || !userData || !transactionData || !impactData)
      return null;

    return {
      totalProjects: projectData.totalProjects,
      totalUsers: userData.totalUsers,
      totalRevenue: transactionData.totalVolume,
      totalImpact: impactData.totalCarbonOffset,
      projectGrowth: projectData.trends?.[0]?.magnitude || 0,
      userGrowth: 15.2, // Placeholder
      revenueGrowth: transactionData.revenueMetrics?.revenueGrowthRate || 0,
      impactGrowth: impactData.impactTrends?.[0]?.magnitude || 0,
    };
  }, [projectData, userData, transactionData, impactData]);

  // Prepare chart data
  const prepareChartData = (data: any[], xKey: string, yKey: string) => {
    return (
      data?.map((item) => ({
        ...item,
        [xKey]: item[xKey],
        [yKey]: Number(item[yKey]) || 0,
      })) || []
    );
  };

  // Overview Stats Cards
  const OverviewCards = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {overviewMetrics?.totalProjects || 0}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            {overviewMetrics?.projectGrowth &&
            overviewMetrics?.projectGrowth > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span
              className={
                overviewMetrics?.projectGrowth &&
                overviewMetrics?.projectGrowth > 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }
            >
              {Math.abs(overviewMetrics?.projectGrowth || 0).toFixed(1)}%
            </span>
            <span className="ml-1">from last period</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {overviewMetrics?.totalUsers || 0}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-green-600">
              {overviewMetrics?.userGrowth?.toFixed(1)}%
            </span>
            <span className="ml-1">from last period</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${(overviewMetrics?.totalRevenue || 0).toLocaleString()}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            {overviewMetrics?.revenueGrowth &&
            overviewMetrics?.revenueGrowth > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span
              className={
                overviewMetrics?.revenueGrowth &&
                overviewMetrics?.revenueGrowth > 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }
            >
              {Math.abs(overviewMetrics?.revenueGrowth || 0).toFixed(1)}%
            </span>
            <span className="ml-1">from last period</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Carbon Impact</CardTitle>
          <Leaf className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(overviewMetrics?.totalImpact || 0).toLocaleString()} tCO₂
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-green-600">
              {Math.abs(overviewMetrics?.impactGrowth || 0).toFixed(1)}%
            </span>
            <span className="ml-1">from last period</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Real-time System Health
  const SystemHealthPanel = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">System Status</span>
              <Badge
                variant={
                  systemHealth?.overall.status === 'healthy'
                    ? 'default'
                    : 'destructive'
                }
              >
                {systemHealth?.overall.status || 'Unknown'}
              </Badge>
            </div>
            <div className="text-2xl font-bold">
              {systemHealth?.overall.score || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Uptime: {systemHealth?.overall.uptime || 99.9}%
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Users</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">
              {realTimeMetrics?.activeUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Response Time</span>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">
              {realTimeMetrics?.responseTime || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">Average response</p>
          </div>
        </div>

        {systemHealth?.alerts && systemHealth.alerts.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              Active Alerts
            </h4>
            {systemHealth.alerts.slice(0, 3).map((alert: ActiveAlert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-2 bg-orange-50 rounded-md"
              >
                <span className="text-sm">{alert.message}</span>
                <Badge variant="outline" className="text-xs">
                  {alert.severity}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Projects Analytics Tab
  const ProjectsAnalytics = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Projects by Status</CardTitle>
            <CardDescription>Distribution of project statuses</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {projectData?.projectsByStatus && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectData.projectsByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(props: any) =>
                      `${props.status}: ${props.percentage.toFixed(1)}%`
                    }
                  >
                    {projectData.projectsByStatus.map(
                      (entry: StatusBreakdown, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]
                          }
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects by Type</CardTitle>
            <CardDescription>Project distribution by category</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {projectData?.projectsByType && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectData.projectsByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill={CHART_COLORS.primary} />
                  <Bar dataKey="averageValue" fill={CHART_COLORS.secondary} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Trends</CardTitle>
          <CardDescription>
            Project creation and completion over time
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {projectData?.timeSeriesData && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectData.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(timestamp) =>
                    new Date(timestamp).toLocaleDateString()
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(timestamp) =>
                    new Date(timestamp as number).toLocaleDateString()
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Average Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Success Rate
              </span>
              <span className="font-semibold">
                {projectData?.averageMetrics.averageSuccessRate?.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Completion Time
              </span>
              <span className="font-semibold">
                {projectData?.averageMetrics.averageCompletionTime} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Quality Score
              </span>
              <span className="font-semibold">
                {projectData?.averageMetrics.qualityScore?.toFixed(1)}/100
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Regional Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {projectData?.projectsByRegion
                ?.slice(0, 4)
                .map((region: RegionBreakdown) => (
                  <div
                    key={`${region.country}-${region.region}`}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm">{region.country}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${region.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-10 text-right">
                        {region.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Data Completeness
              </span>
              <span className="font-semibold">
                {projectData?.qualityScores.dataCompleteness?.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Reporting Timeliness
              </span>
              <span className="font-semibold">
                {projectData?.qualityScores.reportingTimeliness?.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Verification Rate
              </span>
              <span className="font-semibold">
                {projectData?.qualityScores.verificationRate?.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Users Analytics Tab
  const UsersAnalytics = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>User distribution by role</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {userData?.usersByRole && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userData.usersByRole}
                    dataKey="count"
                    nameKey="role"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(props: any) =>
                      `${props.role}: ${props.percentage.toFixed(1)}%`
                    }
                  >
                    {userData.usersByRole.map(
                      (entry: RoleBreakdown, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]
                          }
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Activity Trends</CardTitle>
            <CardDescription>User registrations over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {userData?.timeSeriesData && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userData.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(timestamp) =>
                      new Date(timestamp).toLocaleDateString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(timestamp) =>
                      new Date(timestamp as number).toLocaleDateString()
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={CHART_COLORS.secondary}
                    fill={CHART_COLORS.secondary}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Activity Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Daily Active
              </span>
              <span className="font-semibold">
                {userData?.userActivity.dailyActiveUsers}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Weekly Active
              </span>
              <span className="font-semibold">
                {userData?.userActivity.weeklyActiveUsers}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Monthly Active
              </span>
              <span className="font-semibold">
                {userData?.userActivity.monthlyActiveUsers}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Engagement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Session Duration
              </span>
              <span className="font-semibold">
                {userData?.userActivity.averageSessionDuration?.toFixed(1)}m
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Actions/Session
              </span>
              <span className="font-semibold">
                {userData?.userActivity.averageActionsPerSession?.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Bounce Rate</span>
              <span className="font-semibold">
                {userData?.userActivity.bounceRate?.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Churn Rate</span>
              <span className="font-semibold">
                {((userData?.retentionMetrics.churnRate || 0) * 100).toFixed(1)}
                %
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">LTV</span>
              <span className="font-semibold">
                ${userData?.retentionMetrics.ltv?.toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Winback Rate
              </span>
              <span className="font-semibold">
                {((userData?.retentionMetrics.winbackRate || 0) * 100).toFixed(
                  1
                )}
                %
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {userData?.engagementMetrics.featureUsage && (
        <Card>
          <CardHeader>
            <CardTitle>Feature Usage</CardTitle>
            <CardDescription>
              How users interact with different features
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userData.engagementMetrics.featureUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feature" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="usageCount"
                  fill={CHART_COLORS.primary}
                  name="Usage Count"
                />
                <Bar
                  dataKey="uniqueUsers"
                  fill={CHART_COLORS.secondary}
                  name="Unique Users"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Transactions Analytics Tab
  const TransactionsAnalytics = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume</CardTitle>
            <CardDescription>Transaction volume over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {transactionData?.timeSeriesData && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={transactionData.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(timestamp) =>
                      new Date(timestamp).toLocaleDateString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(timestamp) =>
                      new Date(timestamp as number).toLocaleDateString()
                    }
                    formatter={(value: number, name: string) => [
                      name === 'transaction_volume'
                        ? `$${value.toLocaleString()}`
                        : value,
                      name === 'transaction_volume' ? 'Volume' : 'Count',
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={CHART_COLORS.success}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Revenue by source</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {transactionData?.revenueMetrics.revenueBySource && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={transactionData.revenueMetrics.revenueBySource}
                    dataKey="amount"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(props: any) =>
                      `${props.source}: ${props.percentage.toFixed(1)}%`
                    }
                  >
                    {transactionData.revenueMetrics.revenueBySource.map(
                      (entry: SourceBreakdown, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]
                          }
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `$${value.toLocaleString()}`,
                      'Amount',
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Transaction Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Total Volume
              </span>
              <span className="font-semibold">
                ${transactionData?.totalVolume?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Count</span>
              <span className="font-semibold">
                {transactionData?.totalTransactions?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg. Size</span>
              <span className="font-semibold">
                ${transactionData?.averageTransactionSize?.toFixed(0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Revenue Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Total Revenue
              </span>
              <span className="font-semibold">
                $
                {transactionData?.revenueMetrics.totalRevenue?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Growth Rate</span>
              <span className="font-semibold">
                {transactionData?.revenueMetrics.revenueGrowthRate?.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">ARPU</span>
              <span className="font-semibold">
                $
                {transactionData?.revenueMetrics.averageRevenuePerUser?.toFixed(
                  0
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Profitability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Gross Margin
              </span>
              <span className="font-semibold">
                {transactionData?.revenueMetrics.profitability.grossMargin?.toFixed(
                  1
                )}
                %
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Net Margin</span>
              <span className="font-semibold">
                {transactionData?.revenueMetrics.profitability.netMargin?.toFixed(
                  1
                )}
                %
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Payback Period
              </span>
              <span className="font-semibold">
                {transactionData?.revenueMetrics.profitability.paybackPeriod?.toFixed(
                  1
                )}
                m
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Market Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Market Share
              </span>
              <span className="font-semibold">
                {transactionData?.marketMetrics.marketShare?.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Position</span>
              <span className="font-semibold">
                {transactionData?.marketMetrics.competitivePosition}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Demand Forecast
              </span>
              <span className="font-semibold">
                $
                {(
                  transactionData?.marketMetrics.demandForecast || 0
                ).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Impact Analytics Tab
  const ImpactAnalytics = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Impact by Type</CardTitle>
            <CardDescription>
              Carbon impact distribution by project type
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {impactData?.impactByType && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={impactData.impactByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="projectType" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toLocaleString()} tCO₂`,
                      'Impact',
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="totalImpact" fill={CHART_COLORS.primary} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impact Trends</CardTitle>
            <CardDescription>Carbon impact over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {impactData?.timeSeriesData && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={impactData.timeSeriesData.filter(
                    (d: TimeSeriesPoint) => d.metric === 'carbon_impact'
                  )}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(timestamp) =>
                      new Date(timestamp).toLocaleDateString()
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(timestamp) =>
                      new Date(timestamp as number).toLocaleDateString()
                    }
                    formatter={(value: number) => [
                      `${value.toLocaleString()} tCO₂`,
                      'Carbon Impact',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={CHART_COLORS.success}
                    fill={CHART_COLORS.success}
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Impact Equivalent Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Impact Equivalents</CardTitle>
          <CardDescription>
            Real-world equivalent measurements of carbon impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Car className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">
                {impactData?.equivalentMetrics.carsOffRoad?.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Cars off road</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Home className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {impactData?.equivalentMetrics.homesPowered?.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Homes powered</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <TreePine className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
              <div className="text-2xl font-bold text-emerald-600">
                {impactData?.equivalentMetrics.treesEquivalent?.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Tree equivalent
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Plane className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-600">
                {impactData?.equivalentMetrics.flightsOffset?.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Flights offset
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Factory className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold text-orange-600">
                {impactData?.equivalentMetrics.fuelSaved?.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Gallons fuel saved
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Impact by Region</CardTitle>
            <CardDescription>Top performing regions by impact</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {impactData?.impactByRegion
                ?.slice(0, 6)
                .map((region: ImpactByRegion) => (
                  <div
                    key={`${region.country}-${region.region}`}
                    className="flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium">{region.country}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({region.region})
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {region.totalImpact.toLocaleString()} tCO₂
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {region.projectCount} projects
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impact Summary</CardTitle>
            <CardDescription>
              Total environmental impact metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Total Carbon Offset
              </span>
              <span className="font-semibold">
                {impactData?.totalCarbonOffset?.toLocaleString()} tCO₂
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Trees Planted
              </span>
              <span className="font-semibold">
                {impactData?.totalTreesPlanted?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Energy Generated
              </span>
              <span className="font-semibold">
                {impactData?.totalEnergyGenerated?.toLocaleString()} kWh
              </span>
            </div>
            <Separator />
            <div className="pt-2">
              <div className="text-sm text-muted-foreground mb-2">
                Impact Growth
              </div>
              {impactData?.impactTrends?.map(
                (trend: TrendData, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm">{trend.metric}</span>
                    <div className="flex items-center gap-1">
                      {trend.direction === 'increasing' ? (
                        <TrendingUp className="h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${trend.direction === 'increasing' ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {trend.magnitude.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Performance Analytics Tab
  const PerformanceAnalytics = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
            <CardDescription>System performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">System Uptime</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${platformPerformance?.systemUptime || 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {platformPerformance?.systemUptime?.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Response Time</span>
                <span className="font-semibold">
                  {platformPerformance?.responseTime}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Throughput</span>
                <span className="font-semibold">
                  {platformPerformance?.throughput} req/hr
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Error Rate</span>
                <span className="font-semibold">
                  {(platformPerformance?.errorRate || 0) * 100}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">User Satisfaction</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(platformPerformance?.userSatisfaction || 0) * 20}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {platformPerformance?.userSatisfaction}/5
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security & Reliability</CardTitle>
            <CardDescription>Security and reliability scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Security Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{
                        width: `${platformPerformance?.securityScore || 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {platformPerformance?.securityScore?.toFixed(1)}/100
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Reliability Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${platformPerformance?.reliabilityScore || 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {platformPerformance?.reliabilityScore?.toFixed(1)}/100
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Scalability Index</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${platformPerformance?.scalabilityIndex || 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {platformPerformance?.scalabilityIndex?.toFixed(1)}/100
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {platformPerformance?.performanceTrends && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Performance metrics over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {platformPerformance.performanceTrends.map(
                (trend: TrendData, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="font-medium">{trend.metric}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({trend.timeframe.replace('_', ' ')})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {trend.direction === 'increasing' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : trend.direction === 'decreasing' ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : null}
                      <span
                        className={`font-medium ${
                          trend.direction === 'increasing'
                            ? 'text-green-600'
                            : trend.direction === 'decreasing'
                              ? 'text-red-600'
                              : 'text-gray-600'
                        }`}
                      >
                        {Math.abs(trend.magnitude).toFixed(1)}%
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {(trend.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading analytics data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for the EcoSprout platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select
                value={selectedTimeRange}
                onValueChange={setSelectedTimeRange}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="3m">Last 3 months</SelectItem>
                  <SelectItem value="6m">Last 6 months</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <Select
                value={chartType}
                onValueChange={(value: 'bar' | 'line' | 'pie') =>
                  setChartType(value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <OverviewCards />

      {/* System Health Panel */}
      <SystemHealthPanel />

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="impact" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Impact
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Platform Overview</CardTitle>
                <CardDescription>
                  Key platform metrics and trends
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectData?.timeSeriesData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(timestamp) =>
                        new Date(timestamp).toLocaleDateString()
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(timestamp) =>
                        new Date(timestamp as number).toLocaleDateString()
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={CHART_COLORS.primary}
                      fill={CHART_COLORS.primary}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <PerformanceAnalytics />
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <ProjectsAnalytics />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UsersAnalytics />
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <TransactionsAnalytics />
        </TabsContent>

        <TabsContent value="impact" className="mt-6">
          <ImpactAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
