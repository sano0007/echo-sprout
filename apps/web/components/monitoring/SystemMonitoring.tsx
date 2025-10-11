'use client';

import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Cloud,
  Cpu,
  Eye,
  FileText,
  Info,
  Monitor,
  RefreshCw,
  Server,
  Settings,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  threshold: {
    warning: number;
    critical: number;
  };
  lastUpdated: string;
  category: 'performance' | 'infrastructure' | 'application' | 'business';
}

interface SystemAlert {
  id: string;
  type: 'system' | 'performance' | 'security' | 'business';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  timestamp: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  affectedServices: string[];
}

interface ServiceHealth {
  id: string;
  name: string;
  status: 'online' | 'degraded' | 'offline';
  uptime: number;
  responseTime: number;
  lastCheck: string;
  endpoint: string;
  dependencies: string[];
}

interface SystemMonitoringProps {
  onRefreshData?: () => void;
  onResolveAlert?: (alertId: string, resolution: string) => void;
  onRestartService?: (serviceId: string) => void;
  autoRefresh?: boolean;
}

export default function SystemMonitoring({
  onRefreshData,
  onResolveAlert,
  onRestartService,
  autoRefresh = true,
}: SystemMonitoringProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    '1h' | '24h' | '7d' | '30d'
  >('24h');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'performance' | 'infrastructure' | 'application' | 'business'
  >('all');
  const [showResolved, setShowResolved] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Mock data - in real implementation, this would come from props or API calls
  const [systemMetrics] = useState<SystemMetric[]>([
    {
      id: 'cpu_usage',
      name: 'CPU Usage',
      value: 45.2,
      unit: '%',
      status: 'healthy',
      trend: 'up',
      trendPercentage: 2.3,
      threshold: { warning: 70, critical: 90 },
      lastUpdated: '2024-11-25T10:30:00Z',
      category: 'performance',
    },
    {
      id: 'memory_usage',
      name: 'Memory Usage',
      value: 68.7,
      unit: '%',
      status: 'warning',
      trend: 'up',
      trendPercentage: 5.1,
      threshold: { warning: 65, critical: 85 },
      lastUpdated: '2024-11-25T10:30:00Z',
      category: 'performance',
    },
    {
      id: 'disk_usage',
      name: 'Disk Usage',
      value: 34.8,
      unit: '%',
      status: 'healthy',
      trend: 'stable',
      trendPercentage: 0.2,
      threshold: { warning: 70, critical: 90 },
      lastUpdated: '2024-11-25T10:30:00Z',
      category: 'infrastructure',
    },
    {
      id: 'response_time',
      name: 'Avg Response Time',
      value: 245,
      unit: 'ms',
      status: 'healthy',
      trend: 'down',
      trendPercentage: -3.2,
      threshold: { warning: 500, critical: 1000 },
      lastUpdated: '2024-11-25T10:30:00Z',
      category: 'performance',
    },
    {
      id: 'active_users',
      name: 'Active Users',
      value: 1247,
      unit: 'users',
      status: 'healthy',
      trend: 'up',
      trendPercentage: 12.4,
      threshold: { warning: 5000, critical: 8000 },
      lastUpdated: '2024-11-25T10:30:00Z',
      category: 'business',
    },
    {
      id: 'error_rate',
      name: 'Error Rate',
      value: 0.8,
      unit: '%',
      status: 'healthy',
      trend: 'down',
      trendPercentage: -15.3,
      threshold: { warning: 2, critical: 5 },
      lastUpdated: '2024-11-25T10:30:00Z',
      category: 'application',
    },
    {
      id: 'database_connections',
      name: 'DB Connections',
      value: 45,
      unit: 'connections',
      status: 'healthy',
      trend: 'stable',
      trendPercentage: 1.2,
      threshold: { warning: 80, critical: 100 },
      lastUpdated: '2024-11-25T10:30:00Z',
      category: 'infrastructure',
    },
    {
      id: 'storage_usage',
      name: 'Storage Used',
      value: 2.3,
      unit: 'TB',
      status: 'healthy',
      trend: 'up',
      trendPercentage: 4.7,
      threshold: { warning: 8, critical: 10 },
      lastUpdated: '2024-11-25T10:30:00Z',
      category: 'infrastructure',
    },
  ]);

  const [systemAlerts] = useState<SystemAlert[]>([
    {
      id: '1',
      type: 'performance',
      severity: 'medium',
      title: 'High Memory Usage Detected',
      description:
        'Memory usage has exceeded 65% threshold and is trending upward',
      source: 'Performance Monitor',
      timestamp: '2024-11-25T10:25:00Z',
      isResolved: false,
      affectedServices: ['Web Server', 'Background Jobs'],
    },
    {
      id: '2',
      type: 'business',
      severity: 'low',
      title: 'Progress Report Submissions Behind Schedule',
      description:
        '12 projects have overdue progress reports requiring attention',
      source: 'Progress Monitor',
      timestamp: '2024-11-25T09:45:00Z',
      isResolved: false,
      affectedServices: ['Progress Tracking'],
    },
    {
      id: '3',
      type: 'system',
      severity: 'critical',
      title: 'Database Connection Pool Warning',
      description: 'Database connection pool is approaching maximum capacity',
      source: 'Database Monitor',
      timestamp: '2024-11-25T08:30:00Z',
      isResolved: true,
      resolvedAt: '2024-11-25T09:15:00Z',
      resolvedBy: 'System Admin',
      affectedServices: ['Database', 'API Services'],
    },
  ]);

  const [services] = useState<ServiceHealth[]>([
    {
      id: 'web_server',
      name: 'Web Server',
      status: 'online',
      uptime: 99.97,
      responseTime: 145,
      lastCheck: '2024-11-25T10:30:00Z',
      endpoint: '/health',
      dependencies: ['Database', 'Convex Storage'],
    },
    {
      id: 'api_server',
      name: 'API Server',
      status: 'online',
      uptime: 99.95,
      responseTime: 89,
      lastCheck: '2024-11-25T10:30:00Z',
      endpoint: '/api/health',
      dependencies: ['Database', 'Authentication'],
    },
    {
      id: 'database',
      name: 'Database (Convex)',
      status: 'online',
      uptime: 99.99,
      responseTime: 23,
      lastCheck: '2024-11-25T10:30:00Z',
      endpoint: 'convex.health',
      dependencies: [],
    },
    {
      id: 'authentication',
      name: 'Authentication (Clerk)',
      status: 'online',
      uptime: 99.98,
      responseTime: 234,
      lastCheck: '2024-11-25T10:30:00Z',
      endpoint: 'clerk.health',
      dependencies: [],
    },
    {
      id: 'file_storage',
      name: 'File Storage (Convex Storage)',
      status: 'degraded',
      uptime: 98.5,
      responseTime: 456,
      lastCheck: '2024-11-25T10:30:00Z',
      endpoint: 'convex.storage',
      dependencies: [],
    },
    {
      id: 'email_service',
      name: 'Email Service',
      status: 'online',
      uptime: 99.8,
      responseTime: 1250,
      lastCheck: '2024-11-25T10:30:00Z',
      endpoint: 'email.health',
      dependencies: [],
    },
  ]);

  const filteredMetrics =
    selectedCategory === 'all'
      ? systemMetrics
      : systemMetrics.filter((metric) => metric.category === selectedCategory);

  const filteredAlerts = systemAlerts.filter(
    (alert) => showResolved || !alert.isResolved
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'offline':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string, trendPercentage: number) => {
    if (trend === 'up') {
      return (
        <TrendingUp
          className={`h-4 w-4 ${trendPercentage > 0 ? 'text-green-500' : 'text-red-500'}`}
        />
      );
    } else if (trend === 'down') {
      return (
        <TrendingDown
          className={`h-4 w-4 ${trendPercentage < 0 ? 'text-green-500' : 'text-red-500'}`}
        />
      );
    }
    return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance':
        return <Zap className="h-5 w-5" />;
      case 'infrastructure':
        return <Server className="h-5 w-5" />;
      case 'application':
        return <Cpu className="h-5 w-5" />;
      case 'business':
        return <BarChart3 className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const getServiceIcon = (serviceId: string) => {
    switch (serviceId) {
      case 'database':
        return <Server className="h-6 w-6" />;
      case 'authentication':
        return <Users className="h-6 w-6" />;
      case 'file_storage':
        return <Cloud className="h-6 w-6" />;
      case 'email_service':
        return <FileText className="h-6 w-6" />;
      default:
        return <Monitor className="h-6 w-6" />;
    }
  };

  const handleRefresh = () => {
    setLastRefresh(new Date());
    onRefreshData?.();
  };

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        handleRefresh();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const overallSystemHealth =
    systemMetrics.filter((m) => m.status === 'critical').length === 0
      ? systemMetrics.filter((m) => m.status === 'warning').length === 0
        ? 'healthy'
        : 'warning'
      : 'critical';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
              <Monitor className="h-8 w-8 text-blue-600" />
              <span>System Monitoring</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Real-time platform health and performance monitoring
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div
                className={`text-sm font-medium ${getStatusColor(overallSystemHealth).split(' ')[0]}`}
              >
                System Status: {overallSystemHealth.toUpperCase()}
              </div>
              <div className="text-xs text-gray-500">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">
              {systemMetrics.filter((m) => m.status === 'healthy').length}
            </div>
            <div className="text-sm text-green-600">Healthy Metrics</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-700">
              {systemMetrics.filter((m) => m.status === 'warning').length}
            </div>
            <div className="text-sm text-yellow-600">Warning Metrics</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-700">
              {filteredAlerts.filter((a) => !a.isResolved).length}
            </div>
            <div className="text-sm text-red-600">Active Alerts</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">
              {services.filter((s) => s.status === 'online').length}/
              {services.length}
            </div>
            <div className="text-sm text-blue-600">Services Online</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
          <div className="flex items-center space-x-4">
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
                <option value="performance">Performance</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="application">Application</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Timeframe:
              </label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span>Show resolved alerts</span>
          </label>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredMetrics.map((metric) => (
          <div key={metric.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getCategoryIcon(metric.category)}
                <h3 className="font-semibold text-gray-800">{metric.name}</h3>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}
              >
                {metric.status.toUpperCase()}
              </span>
            </div>

            <div className="mb-4">
              <div className="text-3xl font-bold text-gray-800">
                {metric.value.toLocaleString()}
                <span className="text-lg ml-1 text-gray-600">
                  {metric.unit}
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                {getTrendIcon(metric.trend, metric.trendPercentage)}
                <span
                  className={`text-sm ${
                    metric.trend === 'up' && metric.trendPercentage > 0
                      ? 'text-green-600'
                      : metric.trend === 'down' && metric.trendPercentage < 0
                        ? 'text-green-600'
                        : metric.trend === 'stable'
                          ? 'text-gray-600'
                          : 'text-red-600'
                  }`}
                >
                  {metric.trendPercentage > 0 ? '+' : ''}
                  {metric.trendPercentage.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500">
                  vs {selectedTimeframe}
                </span>
              </div>
            </div>

            {/* Threshold Indicator */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Thresholds</span>
                <span>
                  W: {metric.threshold.warning} | C: {metric.threshold.critical}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    metric.value >= metric.threshold.critical
                      ? 'bg-red-500'
                      : metric.value >= metric.threshold.warning
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{
                    width: `${Math.min((metric.value / metric.threshold.critical) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="text-xs text-gray-500 mt-3">
              Updated: {new Date(metric.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {/* Service Health Status */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Service Health Status
        </h3>
        <div className="grid gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                {getServiceIcon(service.id)}
                <div>
                  <h4 className="font-medium text-gray-800">{service.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Uptime: {service.uptime}%</span>
                    <span>Response: {service.responseTime}ms</span>
                    <span>Endpoint: {service.endpoint}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(service.status)}`}
                >
                  {service.status.toUpperCase()}
                </span>
                {service.status !== 'online' && onRestartService && (
                  <button
                    onClick={() => onRestartService(service.id)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Restart
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">System Alerts</h3>
          <span className="text-sm text-gray-600">
            {filteredAlerts.filter((a) => !a.isResolved).length} active alerts
          </span>
        </div>

        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>No alerts to display</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)} ${
                  alert.isResolved ? 'opacity-60' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-800">
                        {alert.title}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}
                      >
                        {alert.severity.toUpperCase()}
                      </span>
                      {alert.isResolved && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          RESOLVED
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      {alert.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Source: {alert.source}</span>
                      <span>
                        Time: {new Date(alert.timestamp).toLocaleString()}
                      </span>
                      <span>Services: {alert.affectedServices.join(', ')}</span>
                    </div>
                    {alert.isResolved && alert.resolvedBy && (
                      <div className="text-xs text-green-600 mt-1">
                        Resolved by {alert.resolvedBy} at{' '}
                        {new Date(alert.resolvedAt!).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    {!alert.isResolved && onResolveAlert && (
                      <button
                        onClick={() =>
                          onResolveAlert(alert.id, 'Manual resolution')
                        }
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
