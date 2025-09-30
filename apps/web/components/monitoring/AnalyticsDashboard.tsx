'use client';

import {
  BarChart3,
  DollarSign,
  Download,
  Eye,
  FileText,
  Filter,
  Globe,
  Info,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';

interface AnalyticsMetric {
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

interface ChartDataPoint {
  label: string;
  value: number;
  timestamp: string;
  metadata?: any;
}

interface AnalyticsChart {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  data: ChartDataPoint[];
  metrics: string[];
  timeframe: string;
  category: string;
}

interface AnalyticsDashboardProps {
  timeframe?: '7d' | '30d' | '90d' | '1y';
  onExportReport?: (type: string, timeframe: string) => void;
  onDrillDown?: (metric: string, filters: any) => void;
  onRefreshData?: () => void;
}

export default function AnalyticsDashboard({
  timeframe = '30d',
  onExportReport,
  onDrillDown,
  onRefreshData,
}: AnalyticsDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    '7d' | '30d' | '90d' | '1y'
  >(timeframe);
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'platform' | 'environmental' | 'financial' | 'user'
  >('all');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Mock analytics data - in real implementation, this would come from props or API calls
  const [analyticsMetrics] = useState<AnalyticsMetric[]>([
    {
      id: 'total_projects',
      name: 'Total Projects',
      value: 1247,
      previousValue: 1180,
      change: 5.7,
      changeType: 'increase',
      unit: 'projects',
      format: 'number',
      category: 'platform',
      description: 'Total number of projects on the platform',
    },
    {
      id: 'active_projects',
      name: 'Active Projects',
      value: 856,
      previousValue: 923,
      change: -7.3,
      changeType: 'decrease',
      unit: 'projects',
      format: 'number',
      category: 'platform',
      description: 'Currently active projects',
    },
    {
      id: 'total_users',
      name: 'Total Users',
      value: 15420,
      previousValue: 14250,
      change: 8.2,
      changeType: 'increase',
      unit: 'users',
      format: 'number',
      category: 'user',
      description: 'Total registered users',
    },
    {
      id: 'active_users',
      name: 'Active Users',
      value: 8940,
      previousValue: 8320,
      change: 7.5,
      changeType: 'increase',
      unit: 'users',
      format: 'number',
      category: 'user',
      description: 'Monthly active users',
    },
    {
      id: 'co2_offset',
      name: 'CO₂ Offset',
      value: 125400,
      previousValue: 118900,
      change: 5.5,
      changeType: 'increase',
      unit: 'tons',
      format: 'number',
      category: 'environmental',
      description: 'Total CO₂ offset achieved',
    },
    {
      id: 'trees_planted',
      name: 'Trees Planted',
      value: 2840000,
      previousValue: 2650000,
      change: 7.2,
      changeType: 'increase',
      unit: 'trees',
      format: 'number',
      category: 'environmental',
      description: 'Total trees planted across all projects',
    },
    {
      id: 'total_revenue',
      name: 'Total Revenue',
      value: 18750000,
      previousValue: 16200000,
      change: 15.7,
      changeType: 'increase',
      unit: 'USD',
      format: 'currency',
      category: 'financial',
      description: 'Total platform revenue',
    },
    {
      id: 'credits_traded',
      name: 'Credits Traded',
      value: 750000,
      previousValue: 648000,
      change: 15.7,
      changeType: 'increase',
      unit: 'credits',
      format: 'number',
      category: 'financial',
      description: 'Total carbon credits traded',
    },
    {
      id: 'avg_project_success',
      name: 'Project Success Rate',
      value: 89.5,
      previousValue: 87.2,
      change: 2.6,
      changeType: 'increase',
      unit: '%',
      format: 'percentage',
      category: 'platform',
      description: 'Percentage of projects completed successfully',
    },
    {
      id: 'buyer_satisfaction',
      name: 'Buyer Satisfaction',
      value: 4.7,
      previousValue: 4.5,
      change: 4.4,
      changeType: 'increase',
      unit: '/5',
      format: 'number',
      category: 'user',
      description: 'Average buyer satisfaction rating',
    },
    {
      id: 'verification_rate',
      name: 'Verification Rate',
      value: 96.3,
      previousValue: 94.8,
      change: 1.6,
      changeType: 'increase',
      unit: '%',
      format: 'percentage',
      category: 'platform',
      description: 'Percentage of projects successfully verified',
    },
    {
      id: 'avg_credit_price',
      name: 'Avg Credit Price',
      value: 28.45,
      previousValue: 26.8,
      change: 6.2,
      changeType: 'increase',
      unit: 'USD',
      format: 'currency',
      category: 'financial',
      description: 'Average price per carbon credit',
    },
  ]);

  const [charts] = useState<AnalyticsChart[]>([
    {
      id: 'projects_over_time',
      title: 'Projects Created Over Time',
      type: 'line',
      category: 'platform',
      timeframe: selectedTimeframe,
      metrics: ['projects_created'],
      data: [
        { label: 'Week 1', value: 45, timestamp: '2024-10-01' },
        { label: 'Week 2', value: 52, timestamp: '2024-10-08' },
        { label: 'Week 3', value: 48, timestamp: '2024-10-15' },
        { label: 'Week 4', value: 61, timestamp: '2024-10-22' },
        { label: 'Week 5', value: 67, timestamp: '2024-10-29' },
      ],
    },
    {
      id: 'revenue_trends',
      title: 'Revenue Trends',
      type: 'area',
      category: 'financial',
      timeframe: selectedTimeframe,
      metrics: ['revenue'],
      data: [
        { label: 'Jan', value: 1200000, timestamp: '2024-01-01' },
        { label: 'Feb', value: 1350000, timestamp: '2024-02-01' },
        { label: 'Mar', value: 1180000, timestamp: '2024-03-01' },
        { label: 'Apr', value: 1420000, timestamp: '2024-04-01' },
        { label: 'May', value: 1650000, timestamp: '2024-05-01' },
        { label: 'Jun', value: 1480000, timestamp: '2024-06-01' },
      ],
    },
    {
      id: 'project_types',
      title: 'Project Distribution by Type',
      type: 'pie',
      category: 'platform',
      timeframe: selectedTimeframe,
      metrics: ['project_types'],
      data: [
        { label: 'Reforestation', value: 35, timestamp: '2024-11-01' },
        { label: 'Renewable Energy', value: 28, timestamp: '2024-11-01' },
        { label: 'Waste Management', value: 18, timestamp: '2024-11-01' },
        { label: 'Water Conservation', value: 12, timestamp: '2024-11-01' },
        { label: 'Biodiversity', value: 7, timestamp: '2024-11-01' },
      ],
    },
    {
      id: 'user_engagement',
      title: 'User Engagement Metrics',
      type: 'bar',
      category: 'user',
      timeframe: selectedTimeframe,
      metrics: ['active_users', 'new_users'],
      data: [
        { label: 'Week 1', value: 8200, timestamp: '2024-10-01' },
        { label: 'Week 2', value: 8450, timestamp: '2024-10-08' },
        { label: 'Week 3', value: 8680, timestamp: '2024-10-15' },
        { label: 'Week 4', value: 8820, timestamp: '2024-10-22' },
        { label: 'Week 5', value: 8940, timestamp: '2024-10-29' },
      ],
    },
  ]);

  const filteredMetrics =
    selectedCategory === 'all'
      ? analyticsMetrics
      : analyticsMetrics.filter(
          (metric) => metric.category === selectedCategory
        );

  const filteredCharts =
    selectedCategory === 'all'
      ? charts
      : charts.filter((chart) => chart.category === selectedCategory);

  const formatValue = (value: number, format: string, unit: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        if (value >= 1000000) {
          return `${(value / 1000000).toFixed(1)}M ${unit}`;
        } else if (value >= 1000) {
          return `${(value / 1000).toFixed(1)}K ${unit}`;
        }
        return `${value.toLocaleString()} ${unit}`;
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'platform':
        return <BarChart3 className="h-5 w-5" />;
      case 'environmental':
        return <Globe className="h-5 w-5" />;
      case 'financial':
        return <DollarSign className="h-5 w-5" />;
      case 'user':
        return <Users className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'platform':
        return 'text-blue-600 bg-blue-100';
      case 'environmental':
        return 'text-green-600 bg-green-100';
      case 'financial':
        return 'text-yellow-600 bg-yellow-100';
      case 'user':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Simple chart components (in a real implementation, you'd use a proper charting library)
  const SimpleLineChart = ({ data }: { data: ChartDataPoint[] }) => {
    const maxValue = Math.max(...data.map((d) => d.value));
    const minValue = Math.min(...data.map((d) => d.value));
    const range = maxValue - minValue;

    return (
      <div className="h-48 w-full relative bg-gray-50 rounded p-4">
        <svg width="100%" height="100%" className="overflow-visible">
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            points={data
              .map((point, index) => {
                const x = (index / (data.length - 1)) * 100;
                const y =
                  range === 0
                    ? 50
                    : ((maxValue - point.value) / range) * 80 + 10;
                return `${x}%,${y}%`;
              })
              .join(' ')}
          />
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y =
              range === 0 ? 50 : ((maxValue - point.value) / range) * 80 + 10;
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r="3"
                fill="#3B82F6"
                className="opacity-75"
              />
            );
          })}
        </svg>
        <div className="absolute bottom-2 left-4 text-xs text-gray-600">
          {data[0]?.label}
        </div>
        <div className="absolute bottom-2 right-4 text-xs text-gray-600">
          {data[data.length - 1]?.label}
        </div>
      </div>
    );
  };

  const SimpleBarChart = ({ data }: { data: ChartDataPoint[] }) => {
    const maxValue = Math.max(...data.map((d) => d.value));

    return (
      <div className="h-48 w-full bg-gray-50 rounded p-4">
        <div className="flex items-end justify-between h-full space-x-2">
          {data.map((point, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t transition-all duration-300"
                style={{ height: `${(point.value / maxValue) * 100}%` }}
              />
              <div className="text-xs text-gray-600 mt-2 text-center">
                {point.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SimplePieChart = ({ data }: { data: ChartDataPoint[] }) => {
    const total = data.reduce((sum, point) => sum + point.value, 0);
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    return (
      <div className="h-48 w-full bg-gray-50 rounded p-4 flex items-center justify-center">
        <div className="relative">
          <svg width="120" height="120" className="transform -rotate-90">
            {data.map((point, index) => {
              const percentage = (point.value / total) * 100;
              const strokeDasharray = `${percentage * 3.14159} ${314.159 - percentage * 3.14159}`;
              const strokeDashoffset = -data
                .slice(0, index)
                .reduce((sum, p) => sum + (p.value / total) * 314.159, 0);

              return (
                <circle
                  key={index}
                  cx="60"
                  cy="60"
                  r="50"
                  fill="transparent"
                  stroke={colors[index % colors.length]}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold">{total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>
        </div>
        <div className="ml-4 space-y-1">
          {data.map((point, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span>
                {point.label}: {point.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span>Analytics Dashboard</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Comprehensive platform performance analytics and insights
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onRefreshData}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() =>
                onExportReport?.('comprehensive', selectedTimeframe)
              }
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Timeframe:
              </label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Category:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="platform">Platform</option>
                <option value="environmental">Environmental</option>
                <option value="financial">Financial</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 py-2 border rounded-lg ${
              showFilters
                ? 'bg-blue-50 border-blue-300'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Advanced Filters</span>
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Type
                </label>
                <select className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="all">All Types</option>
                  <option value="reforestation">Reforestation</option>
                  <option value="renewable_energy">Renewable Energy</option>
                  <option value="waste_management">Waste Management</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region
                </label>
                <select className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="all">All Regions</option>
                  <option value="americas">Americas</option>
                  <option value="europe">Europe</option>
                  <option value="asia">Asia</option>
                  <option value="africa">Africa</option>
                </select>
              </div>
              <div className="flex items-end">
                <button className="w-full px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredMetrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() =>
              onDrillDown?.(metric.id, { timeframe: selectedTimeframe })
            }
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getCategoryIcon(metric.category)}
                <h3 className="font-semibold text-gray-800">{metric.name}</h3>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(metric.category)}`}
              >
                {metric.category.toUpperCase()}
              </span>
            </div>

            <div className="mb-4">
              <div className="text-3xl font-bold text-gray-800">
                {formatValue(metric.value, metric.format, metric.unit)}
              </div>
              <div className="flex items-center space-x-2 mt-2">
                {getChangeIcon(metric.changeType)}
                <span
                  className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}
                >
                  {metric.change > 0 ? '+' : ''}
                  {metric.change.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500">
                  vs previous period
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-600 mb-2">
              {metric.description}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                Previous:{' '}
                {formatValue(metric.previousValue, metric.format, metric.unit)}
              </span>
              <button className="flex items-center space-x-1 hover:text-blue-600">
                <Eye className="h-3 w-3" />
                <span>Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCharts.map((chart) => (
          <div key={chart.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {chart.title}
              </h3>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(chart.category)}`}
                >
                  {chart.category.toUpperCase()}
                </span>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Info className="h-4 w-4" />
                </button>
              </div>
            </div>

            {chart.type === 'line' && <SimpleLineChart data={chart.data} />}
            {chart.type === 'bar' && <SimpleBarChart data={chart.data} />}
            {chart.type === 'pie' && <SimplePieChart data={chart.data} />}
            {chart.type === 'area' && <SimpleLineChart data={chart.data} />}

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Timeframe: {chart.timeframe}
              </span>
              <button
                onClick={() =>
                  onDrillDown?.(chart.id, { timeframe: selectedTimeframe })
                }
                className="text-blue-600 hover:text-blue-700"
              >
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Insights */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Key Insights
        </h3>
        <div className="grid gap-4">
          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <h4 className="font-medium text-green-800 mb-1">Strong Growth</h4>
            <p className="text-green-700 text-sm">
              Platform revenue increased by 15.7% compared to the previous
              period, driven by higher credit trading volume and new project
              approvals.
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-medium text-blue-800 mb-1">User Engagement</h4>
            <p className="text-blue-700 text-sm">
              Monthly active users reached a new high of 8,940, representing
              7.5% growth. Buyer satisfaction improved to 4.7/5.0.
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
            <h4 className="font-medium text-yellow-800 mb-1">
              Area for Improvement
            </h4>
            <p className="text-yellow-700 text-sm">
              Active projects decreased by 7.3%. Consider investigating project
              completion rates and support mechanisms for creators.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h4 className="font-medium text-purple-800 mb-1">
              Environmental Impact
            </h4>
            <p className="text-purple-700 text-sm">
              Total CO₂ offset reached 125,400 tons with 2.84M trees planted.
              Environmental metrics show consistent positive trends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
