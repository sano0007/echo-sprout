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
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import {
  useAnalyticsDashboard,
  formatMetricValue,
  getChangeIconClass,
  getCategoryColor,
  type AnalyticsMetric,
  type AnalyticsChart,
  type ChartDataPoint,
} from '@/hooks/useAnalyticsDashboard';
import { useAnalyticsPDFReports } from '@/hooks/usePDFReports';
import { PDFReportGenerator } from '@/components/pdf-reports/PDFReportGenerator';

interface AnalyticsDashboardProps {
  timeframe?: '7d' | '30d' | '90d' | '1y';
  category?: 'all' | 'platform' | 'environmental' | 'financial' | 'user';
  onExportReport?: (type: string, timeframe: string) => void;
  onDrillDown?: (metric: string, filters: any) => void;
  onRefreshData?: () => void;
  showPDFGenerator?: boolean;
}

export default function AnalyticsDashboard({
  timeframe = '30d',
  category = 'all',
  onExportReport,
  onDrillDown,
  onRefreshData,
  showPDFGenerator = true,
}: AnalyticsDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    '7d' | '30d' | '90d' | '1y'
  >(timeframe);
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'platform' | 'environmental' | 'financial' | 'user'
  >(category);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showPDFReports, setShowPDFReports] = useState(false);

  // Fetch real analytics data
  const {
    data: analyticsData,
    isLoading,
    error,
    refresh,
  } = useAnalyticsDashboard({
    timeframe: selectedTimeframe,
    category: selectedCategory,
  });

  const { generateAnalyticsReport, reports, hasProcessingReports } =
    useAnalyticsPDFReports();

  // Get real data from the hook
  const analyticsMetrics = analyticsData?.metrics || [];
  const analyticsCharts = analyticsData?.charts || [];

  // Data is already filtered by the backend based on selectedCategory
  const filteredMetrics = analyticsMetrics;
  const filteredCharts = analyticsCharts;

  // Handle refresh from parent or our own refresh function
  const handleRefresh = () => {
    if (onRefreshData) {
      onRefreshData();
    }
    refresh();
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

  // Using imported getCategoryColor utility function

  // Handle PDF generation
  const handleGeneratePDF = async (
    reportType: 'comprehensive' | 'platform' | 'environmental' | 'financial'
  ) => {
    try {
      const startDate = new Date();
      const endDate = new Date();

      // Calculate date range based on selected timeframe
      switch (selectedTimeframe) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const filters = {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        timeframe: selectedTimeframe,
        metrics: selectedMetrics.length > 0 ? selectedMetrics : undefined,
      };

      await generateAnalyticsReport(
        reportType,
        `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Analytics Report`,
        {
          start: startDate,
          end: endDate,
          period: `Last ${selectedTimeframe}`,
        },
        filters
      );
    } catch (error) {
      console.error('Failed to generate PDF report:', error);
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
          <p className="text-gray-600">Failed to load analytics data</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Refresh</span>
            </button>

            {showPDFGenerator && (
              <div className="relative">
                <button
                  onClick={() => setShowPDFReports(!showPDFReports)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" />
                  <span>Generate PDF</span>
                  {hasProcessingReports() && (
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                  )}
                </button>

                {showPDFReports && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">
                        PDF Report Types
                      </h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            handleGeneratePDF('comprehensive');
                            setShowPDFReports(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                        >
                          Comprehensive Report
                        </button>
                        <button
                          onClick={() => {
                            handleGeneratePDF('platform');
                            setShowPDFReports(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                        >
                          Platform Performance
                        </button>
                        <button
                          onClick={() => {
                            handleGeneratePDF('environmental');
                            setShowPDFReports(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                        >
                          Environmental Impact
                        </button>
                        <button
                          onClick={() => {
                            handleGeneratePDF('financial');
                            setShowPDFReports(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                        >
                          Financial Performance
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() =>
                onExportReport?.('comprehensive', selectedTimeframe)
              }
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
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
                {formatMetricValue(metric.value, metric.format, metric.unit)}
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
                {formatMetricValue(
                  metric.previousValue,
                  metric.format,
                  metric.unit
                )}
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

      {/* Recent PDF Reports */}
      {showPDFGenerator && reports.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent PDF Reports
          </h3>
          <div className="grid gap-3">
            {reports.slice(0, 3).map((report: any) => (
              <div
                key={report._id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-800">
                      {report.title}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {new Date(report.requestedAt).toLocaleDateString()} •{' '}
                      {report.reportType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      report.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : report.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : report.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {report.status}
                  </span>
                  {report.status === 'completed' && report.fileUrl && (
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = report.fileUrl!;
                        link.download = `${report.title.replace(/\s+/g, '_')}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
