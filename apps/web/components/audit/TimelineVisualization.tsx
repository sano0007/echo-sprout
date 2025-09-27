'use client';

import React, { useMemo, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  MessageSquare,
  Settings,
  Target,
  TrendingUp,
  User,
} from 'lucide-react';

import type { TimelineEntry } from './types';

interface TimelineVisualizationProps {
  entries: TimelineEntry[];
  verificationId: string;
  className?: string;
  showFilters?: boolean;
  onEntryClick?: (entry: TimelineEntry) => void;
}

export function TimelineVisualization({
  entries,
  verificationId,
  className = '',
  showFilters = true,
  onEntryClick,
}: TimelineVisualizationProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<'none' | 'day' | 'hour'>('none');

  const filteredEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        if (selectedTypes.length > 0 && !selectedTypes.includes(entry.type)) {
          return false;
        }
        if (
          selectedStatuses.length > 0 &&
          !selectedStatuses.includes(entry.status)
        ) {
          return false;
        }
        if (selectedUsers.length > 0 && !selectedUsers.includes(entry.userId)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [entries, selectedTypes, selectedStatuses, selectedUsers]);

  const groupedEntries = useMemo(() => {
    if (groupBy === 'none') {
      return [{ key: 'all', entries: filteredEntries }];
    }

    const groups = new Map<string, TimelineEntry[]>();

    filteredEntries.forEach((entry) => {
      let key: string;
      const date = new Date(entry.timestamp);

      if (groupBy === 'day') {
        key = format(date, 'yyyy-MM-dd');
      } else {
        key = format(date, 'yyyy-MM-dd HH:00');
      }

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(entry);
    });

    return Array.from(groups.entries())
      .map(([key, entries]) => ({ key, entries }))
      .sort((a, b) => b.key.localeCompare(a.key));
  }, [filteredEntries, groupBy]);

  const getTypeIcon = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'milestone':
        return <Target className="h-4 w-4 text-purple-500" />;
      case 'action':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'decision':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'communication':
        return <MessageSquare className="h-4 w-4 text-orange-500" />;
      case 'system':
        return <Settings className="h-4 w-4 text-gray-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: TimelineEntry['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimelineColor = (
    type: TimelineEntry['type'],
    status: TimelineEntry['status']
  ) => {
    if (status === 'failed') return 'bg-red-500';

    switch (type) {
      case 'milestone':
        return 'bg-purple-500';
      case 'action':
        return 'bg-blue-500';
      case 'decision':
        return 'bg-green-500';
      case 'communication':
        return 'bg-orange-500';
      case 'system':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const stats = useMemo(() => {
    const total = filteredEntries.length;
    const byType = filteredEntries.reduce(
      (acc, entry) => {
        acc[entry.type] = (acc[entry.type] || 0) + 1;
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

    const totalDuration = filteredEntries.reduce(
      (acc, entry) => acc + (entry.duration || 0),
      0
    );
    const averageDuration = total > 0 ? totalDuration / total : 0;

    return { total, byType, byStatus, totalDuration, averageDuration };
  }, [filteredEntries]);

  const uniqueUsers = useMemo(() => {
    return [
      ...new Set(
        entries.map((entry) => ({ id: entry.userId, name: entry.userName }))
      ),
    ];
  }, [entries]);

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Timeline Visualization
            </h3>
            <p className="text-sm text-gray-500">
              {stats.total} events • Average duration:{' '}
              {Math.round(stats.averageDuration)}ms
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <BarChart3 className="h-4 w-4" />
              <span>{stats.total} total events</span>
            </div>
            <select
              value={groupBy}
              onChange={(e) =>
                setGroupBy(e.target.value as 'none' | 'day' | 'hour')
              }
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">No Grouping</option>
              <option value="day">Group by Day</option>
              <option value="hour">Group by Hour</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="border-b border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.byStatus.completed || 0}
            </div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.byStatus.in_progress || 0}
            </div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.byStatus.pending || 0}
            </div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.byStatus.failed || 0}
            </div>
            <div className="text-sm text-gray-500">Failed</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Filters:
              </span>
            </div>

            <select
              multiple
              value={selectedTypes}
              onChange={(e) =>
                setSelectedTypes(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="milestone">Milestones</option>
              <option value="action">Actions</option>
              <option value="decision">Decisions</option>
              <option value="communication">Communication</option>
              <option value="system">System</option>
              <option value="error">Errors</option>
            </select>

            <select
              multiple
              value={selectedStatuses}
              onChange={(e) =>
                setSelectedStatuses(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            <select
              multiple
              value={selectedUsers}
              onChange={(e) =>
                setSelectedUsers(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Users</option>
              {uniqueUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>

            {(selectedTypes.length > 0 ||
              selectedStatuses.length > 0 ||
              selectedUsers.length > 0) && (
              <button
                onClick={() => {
                  setSelectedTypes([]);
                  setSelectedStatuses([]);
                  setSelectedUsers([]);
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Timeline Content */}
      <div className="p-6">
        {groupedEntries.map((group, groupIndex) => (
          <div key={group.key} className="mb-8">
            {groupBy !== 'none' && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {groupBy === 'day'
                    ? format(new Date(group.key), 'EEEE, MMMM do, yyyy')
                    : format(
                        new Date(group.key + ':00'),
                        'EEEE, MMMM do, yyyy HH:mm'
                      )}
                  <span className="text-gray-500">
                    ({group.entries.length} events)
                  </span>
                </h4>
              </div>
            )}

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              {group.entries.map((entry, index) => (
                <div
                  key={entry.id}
                  onClick={() => onEntryClick?.(entry)}
                  className="relative flex items-start gap-4 pb-8 cursor-pointer group hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg"
                >
                  {/* Timeline dot */}
                  <div
                    className={`relative z-10 flex items-center justify-center w-3 h-3 rounded-full ${getTimelineColor(entry.type, entry.status)}`}
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(entry.type)}
                          <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                            {entry.title}
                          </h4>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(entry.status)}`}
                          >
                            {entry.status.replace('_', ' ')}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mt-1">
                          {entry.description}
                        </p>

                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {entry.userName} ({entry.userRole})
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(entry.timestamp), {
                              addSuffix: true,
                            })}
                          </span>
                          {entry.duration && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {entry.duration}ms
                            </span>
                          )}
                        </div>

                        {entry.metadata &&
                          Object.keys(entry.metadata).length > 0 && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                              <div className="font-medium mb-1">
                                Additional Details:
                              </div>
                              {Object.entries(entry.metadata).map(
                                ([key, value]) => (
                                  <div key={key}>
                                    <span className="capitalize">
                                      {key
                                        .replace(/([A-Z])/g, ' $1')
                                        .toLowerCase()}
                                      :
                                    </span>{' '}
                                    <span className="font-mono">
                                      {String(value)}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <div className="text-xs text-gray-500">
                          {format(new Date(entry.timestamp), 'HH:mm')}
                        </div>
                        {entry.color && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          ></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No timeline entries found
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
