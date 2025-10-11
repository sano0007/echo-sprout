'use client';

import { format } from 'date-fns';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  MessageSquare,
  Search,
  TrendingUp,
  User,
  XCircle,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

import type {
  AuditCategory,
  AuditEntry,
  AuditEventType,
  AuditFilter,
} from './types';

interface AuditTrailProps {
  verificationId: string;
  auditEntries: AuditEntry[];
  currentUserId: string;
  onFilterChange?: (filter: AuditFilter) => void;
  onEntryClick?: (entry: AuditEntry) => void;
  showStats?: boolean;
  className?: string;
}

export function AuditTrail({
  verificationId,
  auditEntries,
  currentUserId,
  onFilterChange,
  onEntryClick,
  showStats = true,
  className = '',
}: AuditTrailProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventTypes, setSelectedEventTypes] = useState<
    AuditEventType[]
  >([]);
  const [selectedCategories, setSelectedCategories] = useState<AuditCategory[]>(
    []
  );
  const [selectedSeverity, setSelectedSeverity] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [viewMode, setViewMode] = useState<'timeline' | 'list' | 'stats'>(
    'timeline'
  );

  const filteredEntries = useMemo(() => {
    return auditEntries.filter((entry) => {
      if (
        searchTerm &&
        !entry.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !entry.action.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      if (
        selectedEventTypes.length > 0 &&
        !selectedEventTypes.includes(entry.type)
      ) {
        return false;
      }

      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(entry.category)
      ) {
        return false;
      }

      if (
        selectedSeverity.length > 0 &&
        !selectedSeverity.includes(entry.severity)
      ) {
        return false;
      }

      if (dateRange.start && entry.timestamp < dateRange.start.getTime()) {
        return false;
      }

      if (dateRange.end && entry.timestamp > dateRange.end.getTime()) {
        return false;
      }

      return true;
    });
  }, [
    auditEntries,
    searchTerm,
    selectedEventTypes,
    selectedCategories,
    selectedSeverity,
    dateRange,
  ]);

  const stats = useMemo(() => {
    const total = filteredEntries.length;
    const byType = filteredEntries.reduce(
      (acc, entry) => {
        acc[entry.type] = (acc[entry.type] || 0) + 1;
        return acc;
      },
      {} as Record<AuditEventType, number>
    );

    const bySeverity = filteredEntries.reduce(
      (acc, entry) => {
        acc[entry.severity] = (acc[entry.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byStatus = filteredEntries.reduce(
      (acc, entry) => {
        acc[entry.status] = (acc[entry.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return { total, byType, bySeverity, byStatus };
  }, [filteredEntries]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failure':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventIcon = (type: AuditEventType) => {
    switch (type) {
      case 'user_action':
        return <User className="h-4 w-4" />;
      case 'data_change':
        return <FileText className="h-4 w-4" />;
      case 'communication':
        return <MessageSquare className="h-4 w-4" />;
      case 'system_event':
        return <BarChart3 className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'security':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const exportAuditLog = () => {
    const csvContent = [
      [
        'Timestamp',
        'Type',
        'Category',
        'Action',
        'Description',
        'User',
        'Severity',
        'Status',
      ].join(','),
      ...filteredEntries.map((entry) =>
        [
          format(new Date(entry.timestamp), 'yyyy-MM-dd HH:mm:ss'),
          entry.type,
          entry.category,
          entry.action,
          `"${entry.description.replace(/"/g, '""')}"`,
          entry.userName,
          entry.severity,
          entry.status,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${verificationId}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Audit Trail</h3>
            <p className="text-sm text-gray-500">
              {stats.total} events tracked for this verification
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportAuditLog}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <div className="flex rounded-md border border-gray-300">
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-2 text-sm ${
                  viewMode === 'timeline'
                    ? 'bg-blue-50 text-blue-600 border-r border-gray-300'
                    : 'text-gray-600 hover:bg-gray-50 border-r border-gray-300'
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm ${
                  viewMode === 'list'
                    ? 'bg-blue-50 text-blue-600 border-r border-gray-300'
                    : 'text-gray-600 hover:bg-gray-50 border-r border-gray-300'
                }`}
              >
                List
              </button>
              {showStats && (
                <button
                  onClick={() => setViewMode('stats')}
                  className={`px-3 py-2 text-sm ${
                    viewMode === 'stats'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Stats
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search actions, descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            multiple
            value={selectedEventTypes}
            onChange={(e) =>
              setSelectedEventTypes(
                Array.from(
                  e.target.selectedOptions,
                  (option) => option.value as AuditEventType
                )
              )
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="user_action">User Actions</option>
            <option value="system_event">System Events</option>
            <option value="data_change">Data Changes</option>
            <option value="communication">Communication</option>
            <option value="error">Errors</option>
            <option value="security">Security</option>
          </select>

          <select
            multiple
            value={selectedSeverity}
            onChange={(e) =>
              setSelectedSeverity(
                Array.from(e.target.selectedOptions, (option) => option.value)
              )
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === 'stats' && showStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">By Event Type</h4>
              <div className="space-y-2">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">
                      {type.replace('_', ' ')}
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">By Severity</h4>
              <div className="space-y-2">
                {Object.entries(stats.bySeverity).map(([severity, count]) => (
                  <div
                    key={severity}
                    className="flex justify-between items-center"
                  >
                    <span
                      className={`text-sm px-2 py-1 rounded-full ${getSeverityColor(severity)}`}
                    >
                      {severity}
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">By Status</h4>
              <div className="space-y-2">
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <span className="text-sm text-gray-600 capitalize">
                        {status}
                      </span>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className="space-y-4">
            {filteredEntries.map((entry, index) => (
              <div
                key={entry.id}
                onClick={() => onEntryClick?.(entry)}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                    {getEventIcon(entry.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {entry.action}
                      </p>
                      <p className="text-sm text-gray-600">
                        {entry.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {entry.userName} ({entry.userRole})
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(
                            new Date(entry.timestamp),
                            'MMM dd, yyyy HH:mm'
                          )}
                        </span>
                        {entry.duration && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {entry.duration}ms
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(entry.severity)}`}
                      >
                        {entry.severity}
                      </span>
                      {getStatusIcon(entry.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getEventIcon(entry.type)}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {entry.action}
                          </div>
                          <div className="text-sm text-gray-500">
                            {entry.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{entry.userName}</div>
                        <div className="text-gray-500">{entry.userRole}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(entry.timestamp), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(entry.severity)}`}
                      >
                        {entry.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(entry.status)}
                        <span className="text-sm text-gray-900 capitalize">
                          {entry.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onEntryClick?.(entry)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No audit entries found
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
