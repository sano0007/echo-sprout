'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

interface MetricCard {
  id: string;
  title: string;
  value: number;
  unit: string;
  previousValue?: number;
  target?: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  category: 'environmental' | 'progress' | 'quality' | 'financial';
  description?: string;
  lastUpdated: string;
}

interface ChartData {
  label: string;
  value: number;
  timestamp: string;
}

interface MetricsDashboardProps {
  projectId: string;
  projectType: string;
  metrics: MetricCard[];
  chartData: Record<string, ChartData[]>;
  onMetricUpdate?: (metricId: string, value: number) => void;
}

export default function MetricsDashboard({
  projectId,
  projectType,
  metrics,
  chartData,
  onMetricUpdate,
}: MetricsDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'environmental' | 'progress' | 'quality' | 'financial'
  >('all');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>(
    '30d'
  );
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [showTargets, setShowTargets] = useState(true);

  const categories = [
    { key: 'all', label: 'All Metrics', icon: '📊' },
    { key: 'environmental', label: 'Environmental', icon: '🌱' },
    { key: 'progress', label: 'Progress', icon: '📈' },
    { key: 'quality', label: 'Quality', icon: '⭐' },
    { key: 'financial', label: 'Financial', icon: '💰' },
  ];

  const filteredMetrics =
    selectedCategory === 'all'
      ? metrics
      : metrics.filter((metric) => metric.category === selectedCategory);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 bg-gray-400 rounded-full" />;
    }
  };

  const getTrendColor = (
    trend: 'up' | 'down' | 'stable',
    isPositive: boolean = true
  ) => {
    if (trend === 'stable') return 'text-gray-600';
    const isGood =
      (trend === 'up' && isPositive) || (trend === 'down' && !isPositive);
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  const formatValue = (value: number, unit: string) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M ${unit}`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K ${unit}`;
    }
    return `${value.toFixed(1)} ${unit}`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      environmental: 'from-green-500 to-green-600',
      progress: 'from-blue-500 to-blue-600',
      quality: 'from-purple-500 to-purple-600',
      financial: 'from-yellow-500 to-yellow-600',
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  const SimpleLineChart = ({
    data,
    color = '#3B82F6',
  }: {
    data: ChartData[];
    color?: string;
  }) => {
    const maxValue = Math.max(...data.map((d) => d.value));
    const minValue = Math.min(...data.map((d) => d.value));
    const range = maxValue - minValue;

    return (
      <div className="h-20 w-full relative">
        <svg width="100%" height="100%" className="overflow-visible">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={data
              .map((point, index) => {
                const x = (index / (data.length - 1)) * 100;
                const y =
                  range === 0 ? 50 : ((maxValue - point.value) / range) * 100;
                return `${x},${y}`;
              })
              .join(' ')}
          />
          {/* Dots for data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y =
              range === 0 ? 50 : ((maxValue - point.value) / range) * 100;
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={`${y}%`}
                r="3"
                fill={color}
                className="opacity-75"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Environmental Metrics Dashboard
            </h2>
            <p className="text-gray-600 mt-1">
              Track and monitor project performance indicators
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400" />
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={showTargets}
                  onChange={(e) => setShowTargets(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span>Show Targets</span>
              </label>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex space-x-2 mt-6">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMetrics.map((metric) => {
          const chartDataForMetric = chartData[metric.id] || [];
          const isPositiveTrend = [
            'environmental',
            'progress',
            'quality',
          ].includes(metric.category);

          return (
            <div
              key={metric.id}
              className={`bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105 ${
                selectedMetric === metric.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() =>
                setSelectedMetric(
                  selectedMetric === metric.id ? null : metric.id
                )
              }
            >
              {/* Metric Header */}
              <div
                className={`bg-gradient-to-r ${getCategoryColor(metric.category)} text-white p-4`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{metric.title}</h3>
                    {metric.description && (
                      <p className="text-sm opacity-90 mt-1">
                        {metric.description}
                      </p>
                    )}
                  </div>
                  <ChartBarIcon className="h-6 w-6 opacity-75" />
                </div>
              </div>

              {/* Metric Value */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-3xl font-bold text-gray-800">
                      {formatValue(metric.value, metric.unit)}
                    </div>
                    {metric.previousValue && (
                      <div className="flex items-center space-x-2 mt-1">
                        {getTrendIcon(metric.trend)}
                        <span
                          className={`text-sm font-medium ${getTrendColor(metric.trend, isPositiveTrend)}`}
                        >
                          {metric.trendPercentage > 0 ? '+' : ''}
                          {metric.trendPercentage.toFixed(1)}%
                        </span>
                        <span className="text-xs text-gray-500">
                          vs previous period
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Target Progress */}
                {showTargets && metric.target && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress to Target</span>
                      <span>
                        {((metric.value / metric.target) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          metric.value >= metric.target
                            ? 'bg-green-500'
                            : metric.value >= metric.target * 0.8
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Target: {formatValue(metric.target, metric.unit)}
                    </div>
                  </div>
                )}

                {/* Mini Chart */}
                {chartDataForMetric.length > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Trend ({timeRange})</span>
                      <span>{chartDataForMetric.length} data points</span>
                    </div>
                    <SimpleLineChart
                      data={chartDataForMetric}
                      color={
                        metric.trend === 'up'
                          ? '#10B981'
                          : metric.trend === 'down'
                            ? '#EF4444'
                            : '#6B7280'
                      }
                    />
                  </div>
                )}

                {/* Last Updated */}
                <div className="flex items-center text-xs text-gray-500 mt-4">
                  <CalendarDaysIcon className="h-4 w-4 mr-1" />
                  <span>
                    Updated {new Date(metric.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Expanded Details */}
              {selectedMetric === metric.id && (
                <div className="border-t bg-gray-50 p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-gray-700">
                        Current Value
                      </label>
                      <p className="text-gray-600">
                        {formatValue(metric.value, metric.unit)}
                      </p>
                    </div>
                    {metric.previousValue && (
                      <div>
                        <label className="font-medium text-gray-700">
                          Previous Value
                        </label>
                        <p className="text-gray-600">
                          {formatValue(metric.previousValue, metric.unit)}
                        </p>
                      </div>
                    )}
                    {metric.target && (
                      <div>
                        <label className="font-medium text-gray-700">
                          Target
                        </label>
                        <p className="text-gray-600">
                          {formatValue(metric.target, metric.unit)}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="font-medium text-gray-700">
                        Category
                      </label>
                      <p className="text-gray-600 capitalize">
                        {metric.category}
                      </p>
                    </div>
                  </div>

                  {onMetricUpdate && (
                    <div className="mt-4 pt-4 border-t">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newValue = prompt(
                            `Enter new value for ${metric.title}:`
                          );
                          if (newValue && !isNaN(parseFloat(newValue))) {
                            onMetricUpdate(metric.id, parseFloat(newValue));
                          }
                        }}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Update Value
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Statistics */}
      {filteredMetrics.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Summary Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredMetrics.filter((m) => m.trend === 'up').length}
              </div>
              <div className="text-sm text-gray-600">Improving Metrics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredMetrics.filter((m) => m.trend === 'down').length}
              </div>
              <div className="text-sm text-gray-600">Declining Metrics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {filteredMetrics.filter((m) => m.trend === 'stable').length}
              </div>
              <div className="text-sm text-gray-600">Stable Metrics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {showTargets &&
                  filteredMetrics.filter((m) => m.target && m.value >= m.target)
                    .length}
              </div>
              <div className="text-sm text-gray-600">Targets Met</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
