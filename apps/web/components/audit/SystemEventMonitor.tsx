'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Download,
  Eye,
  FileText,
  Filter,
  Info,
  RefreshCw,
  Search,
  Server,
  Settings,
  Shield,
  Users,
  Wifi,
  WifiOff,
  XCircle,
  Zap,
} from 'lucide-react';

import type { SystemEvent } from './types';

interface SystemEventMonitorProps {
  events: SystemEvent[];
  verificationId: string;
  onEventClick?: (event: SystemEvent) => void;
  showFilters?: boolean;
  realTimeUpdates?: boolean;
  className?: string;
}

export function SystemEventMonitor({
  events,
  verificationId,
  onEventClick,
  showFilters = true,
  realTimeUpdates = true,
  className = '',
}: SystemEventMonitorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(
    []
  );
  const [autoRefresh, setAutoRefresh] = useState(realTimeUpdates);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        if (
          searchTerm &&
          !event.event.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !event.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !event.component.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }

        if (
          selectedSeverities.length > 0 &&
          !selectedSeverities.includes(event.severity)
        ) {
          return false;
        }

        if (
          selectedComponents.length > 0 &&
          !selectedComponents.includes(event.component)
        ) {
          return false;
        }

        if (
          selectedEnvironments.length > 0 &&
          !selectedEnvironments.includes(
            event.metadata.environment || 'unknown'
          )
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [
    events,
    searchTerm,
    selectedSeverities,
    selectedComponents,
    selectedEnvironments,
  ]);

  const stats = useMemo(() => {
    const total = filteredEvents.length;
    const bySeverity = filteredEvents.reduce(
      (acc, event) => {
        acc[event.severity] = (acc[event.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byComponent = filteredEvents.reduce(
      (acc, event) => {
        acc[event.component] = (acc[event.component] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const last24Hours = Date.now() - 24 * 60 * 60 * 1000;
    const recent = filteredEvents.filter(
      (e) => e.timestamp >= last24Hours
    ).length;

    const criticalEvents = filteredEvents.filter(
      (e) => e.severity === 'critical'
    ).length;
    const errorEvents = filteredEvents.filter(
      (e) => e.severity === 'error'
    ).length;

    return {
      total,
      bySeverity,
      byComponent,
      recent,
      criticalEvents,
      errorEvents,
    };
  }, [filteredEvents]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getComponentIcon = (component: string) => {
    switch (component.toLowerCase()) {
      case 'database':
        return <Database className="h-4 w-4 text-green-500" />;
      case 'api':
        return <Server className="h-4 w-4 text-blue-500" />;
      case 'auth':
        return <Shield className="h-4 w-4 text-purple-500" />;
      case 'storage':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'network':
        return <Wifi className="h-4 w-4 text-cyan-500" />;
      case 'ui':
        return <Settings className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const exportSystemEvents = () => {
    const csvContent = [
      [
        'Timestamp',
        'Event',
        'Severity',
        'Component',
        'Description',
        'Environment',
        'Version',
        'Affected Users',
      ].join(','),
      ...filteredEvents.map((event) =>
        [
          format(new Date(event.timestamp), 'yyyy-MM-dd HH:mm:ss'),
          event.event,
          event.severity,
          event.component,
          `"${event.description.replace(/"/g, '""')}"`,
          event.metadata.environment || '',
          event.metadata.version || '',
          (event.affectedUsers || []).length.toString(),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-events-${verificationId}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const refreshData = () => {
    setLastRefresh(Date.now());
    // In a real implementation, this would trigger a data refresh
    console.log('Refreshing system events data...');
  };

  const uniqueComponents = useMemo(() => {
    return [...new Set(events.map((e) => e.component))];
  }, [events]);

  const uniqueEnvironments = useMemo(() => {
    return [
      ...new Set(events.map((e) => e.metadata.environment).filter(Boolean)),
    ];
  }, [events]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              System Event Monitor
            </h3>
            <p className="text-sm text-gray-500">
              {stats.total} events • {stats.recent} in last 24h •{' '}
              {stats.criticalEvents} critical
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={exportSystemEvents}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Auto-refresh
            </label>
          </div>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="border-b border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-sm text-gray-500">Total Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.bySeverity.critical || 0}
            </div>
            <div className="text-sm text-gray-500">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">
              {stats.bySeverity.error || 0}
            </div>
            <div className="text-sm text-gray-500">Errors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.bySeverity.warning || 0}
            </div>
            <div className="text-sm text-gray-500">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.bySeverity.info || 0}
            </div>
            <div className="text-sm text-gray-500">Info</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.recent}
            </div>
            <div className="text-sm text-gray-500">Recent (24h)</div>
          </div>
        </div>
      </div>

      {/* Last Refresh Status */}
      <div className="border-b border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {autoRefresh ? (
              <Wifi className="h-3 w-3 text-green-500" />
            ) : (
              <WifiOff className="h-3 w-3 text-gray-400" />
            )}
            <span>
              Last updated:{' '}
              {formatDistanceToNow(new Date(lastRefresh), { addSuffix: true })}
            </span>
          </div>
          <div>Real-time monitoring: {autoRefresh ? 'ON' : 'OFF'}</div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events, descriptions, components..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Filters:
              </span>
            </div>

            <select
              multiple
              value={selectedSeverities}
              onChange={(e) =>
                setSelectedSeverities(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>

            <select
              multiple
              value={selectedComponents}
              onChange={(e) =>
                setSelectedComponents(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Components</option>
              {uniqueComponents.map((component) => (
                <option key={component} value={component}>
                  {component}
                </option>
              ))}
            </select>

            <select
              multiple
              value={selectedEnvironments}
              onChange={(e) =>
                setSelectedEnvironments(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Environments</option>
              {uniqueEnvironments.map((env) => (
                <option key={env} value={env}>
                  {env}
                </option>
              ))}
            </select>

            {(selectedSeverities.length > 0 ||
              selectedComponents.length > 0 ||
              selectedEnvironments.length > 0) && (
              <button
                onClick={() => {
                  setSelectedSeverities([]);
                  setSelectedComponents([]);
                  setSelectedEnvironments([]);
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* System Events Content */}
      <div className="p-6">
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => onEventClick?.(event)}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center gap-2">
                  {getSeverityIcon(event.severity)}
                  {getComponentIcon(event.component)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {event.event}
                        </h4>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(event.severity)}`}
                        >
                          {event.severity}
                        </span>
                        <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          {event.component}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {event.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(event.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                        {event.affectedUsers &&
                          event.affectedUsers.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {event.affectedUsers.length} affected user
                              {event.affectedUsers.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        {event.metadata.version && (
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            Version {event.metadata.version}
                          </span>
                        )}
                        {event.metadata.environment && (
                          <span className="flex items-center gap-1">
                            <Server className="h-3 w-3" />
                            {event.metadata.environment}
                          </span>
                        )}
                      </div>

                      {/* Performance Metrics */}
                      {event.metadata.performanceMetrics && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <div className="font-medium text-gray-700 mb-1">
                            Performance Metrics:
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {Object.entries(
                              event.metadata.performanceMetrics
                            ).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-gray-600">{key}:</span>
                                <span className="font-mono text-gray-900">
                                  {String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* System Resources */}
                      {event.metadata.systemResources && (
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                          <div className="font-medium text-blue-700 mb-1">
                            System Resources:
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {Object.entries(event.metadata.systemResources).map(
                              ([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-blue-600">{key}:</span>
                                  <span className="font-mono text-blue-900">
                                    {String(value)}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Error Code */}
                      {event.metadata.errorCode && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-red-700">
                              Error Code:
                            </span>
                            <span className="font-mono text-red-900">
                              {event.metadata.errorCode}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <div className="text-right text-xs text-gray-500">
                        <div>
                          {format(new Date(event.timestamp), 'MMM dd, yyyy')}
                        </div>
                        <div>
                          {format(new Date(event.timestamp), 'HH:mm:ss')}
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No system events found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No events match your current filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
