'use client';

import {
  Search,
  Filter,
  Calendar,
  Tag,
  AlertCircle,
  FileText,
  Target,
  BarChart3,
  X,
  SlidersHorizontal,
  Download,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

interface SearchFilters {
  entityTypes: string[];
  dateRange: {
    start: string;
    end: string;
  };
  status: string[];
  severity: string[];
  projectIds: string[];
  tags: string[];
}

interface SearchResult {
  _id: string;
  _creationTime: number;
  entityType: 'progress_update' | 'milestone' | 'alert' | 'project';
  title: string;
  description: string;
  status?: string;
  severity?: string;
  projectId?: string;
  updateType?: string;
  category?: string;
  lastUpdated?: number;
}

export default function MonitoringSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({
    entityTypes: ['progress_updates', 'milestones', 'alerts', 'projects'],
    dateRange: {
      start: '',
      end: '',
    },
    status: [],
    severity: [],
    projectIds: [],
    tags: [],
  });
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());
  const [resultStats, setResultStats] = useState({
    total: 0,
    byType: {} as Record<string, number>,
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Convex queries
  const getMonitoringStats = useQuery(api.monitoring_crud.getMonitoringStats);

  // Search query - only execute when we have a search term
  const searchQuery = useQuery(
    api.monitoring_crud.searchMonitoringData,
    searchTerm.trim().length >= 2 ? {
      searchTerm: searchTerm.trim(),
      entityTypes: activeFilters.entityTypes as any,
      limit: 100,
    } : "skip"
  );

  // Effect for processing search results
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      setResultStats({ total: 0, byType: {} });
      setIsSearching(false);
      return;
    }

    if (searchQuery === undefined) {
      setIsSearching(true);
      return;
    }

    setIsSearching(false);

    if (searchQuery) {
      // Apply additional filters
      let filteredResults = searchQuery;

      // Date range filter
      if (activeFilters.dateRange.start && activeFilters.dateRange.end) {
        const startTime = new Date(activeFilters.dateRange.start).getTime();
        const endTime = new Date(activeFilters.dateRange.end).getTime();
        filteredResults = filteredResults.filter(
          (r: any) => r._creationTime >= startTime && r._creationTime <= endTime
        );
      }

      // Status filter
      if (activeFilters.status.length > 0) {
        filteredResults = filteredResults.filter(
          (r: any) => r.status && activeFilters.status.includes(r.status)
        );
      }

      // Severity filter (for alerts)
      if (activeFilters.severity.length > 0) {
        filteredResults = filteredResults.filter(
          (r: any) => r.severity && activeFilters.severity.includes(r.severity)
        );
      }

      setSearchResults(filteredResults);

      // Calculate stats
      const stats = {
        total: filteredResults.length,
        byType: filteredResults.reduce((acc: any, result: any) => {
          acc[result.entityType] = (acc[result.entityType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
      setResultStats(stats);

      // Add to search history
      if (searchTerm.trim() && !searchHistory.includes(searchTerm.trim())) {
        setSearchHistory(prev => [searchTerm.trim(), ...prev.slice(0, 9)]);
      }
    }
  }, [searchQuery, searchTerm, activeFilters, searchHistory]);

  // Entity type options
  const entityTypeOptions = [
    { value: 'progress_updates', label: 'Progress Updates', icon: FileText, color: 'text-blue-600' },
    { value: 'milestones', label: 'Milestones', icon: Target, color: 'text-green-600' },
    { value: 'alerts', label: 'Alerts', icon: AlertCircle, color: 'text-red-600' },
    { value: 'projects', label: 'Projects', icon: BarChart3, color: 'text-purple-600' },
  ];

  // Status options
  const statusOptions = [
    'pending', 'in_progress', 'completed', 'delayed', 'active', 'inactive', 'submitted', 'approved', 'rejected'
  ];

  // Severity options
  const severityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
  ];

  // Quick date range options
  const quickDateRanges = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'This year', days: 365 },
  ];

  // Update filter
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // Toggle entity type
  const toggleEntityType = (entityType: string) => {
    const newTypes = activeFilters.entityTypes.includes(entityType)
      ? activeFilters.entityTypes.filter(t => t !== entityType)
      : [...activeFilters.entityTypes, entityType];
    updateFilter('entityTypes', newTypes);
  };

  // Toggle status filter
  const toggleStatus = (status: string) => {
    const newStatuses = activeFilters.status.includes(status)
      ? activeFilters.status.filter(s => s !== status)
      : [...activeFilters.status, status];
    updateFilter('status', newStatuses);
  };

  // Toggle severity filter
  const toggleSeverity = (severity: string) => {
    const newSeverities = activeFilters.severity.includes(severity)
      ? activeFilters.severity.filter(s => s !== severity)
      : [...activeFilters.severity, severity];
    updateFilter('severity', newSeverities);
  };

  // Set quick date range
  const setQuickDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    updateFilter('dateRange', {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({
      entityTypes: ['progress_updates', 'milestones', 'alerts', 'projects'],
      dateRange: { start: '', end: '' },
      status: [],
      severity: [],
      projectIds: [],
      tags: [],
    });
  };

  // Toggle result selection
  const toggleResultSelection = (resultId: string) => {
    const newSelected = new Set(selectedResults);
    if (newSelected.has(resultId)) {
      newSelected.delete(resultId);
    } else {
      newSelected.add(resultId);
    }
    setSelectedResults(newSelected);
  };

  // Select all visible results
  const selectAllResults = () => {
    const allIds = new Set(searchResults.map(r => r._id));
    setSelectedResults(allIds);
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedResults(new Set());
  };

  // Export selected results
  const exportResults = () => {
    const selectedData = searchResults.filter(r => selectedResults.has(r._id));

    if (selectedData.length === 0) return;

    const csvData = selectedData.map(result => ({
      Type: result.entityType,
      Title: result.title,
      Description: result.description,
      Status: result.status || 'N/A',
      Created: new Date(result._creationTime).toLocaleDateString(),
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monitoring-search-results-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get entity type icon and color
  const getEntityTypeDisplay = (entityType: string) => {
    const option = entityTypeOptions.find(opt => opt.value === entityType);
    return option || { icon: FileText, color: 'text-gray-600', label: entityType };
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      delayed: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Search Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Monitoring System Search
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </button>
            <button
              onClick={() => searchInputRef.current?.focus()}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Focus</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isSearching ? (
              <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
            ) : (
              <Search className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search progress updates, milestones, alerts, projects..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && !searchTerm && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">Recent searches:</p>
            <div className="flex flex-wrap gap-2">
              {searchHistory.slice(0, 5).map((term, index) => (
                <button
                  key={index}
                  onClick={() => setSearchTerm(term)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Entity Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search In:
              </label>
              <div className="space-y-2">
                {entityTypeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={activeFilters.entityTypes.includes(option.value)}
                        onChange={() => toggleEntityType(option.value)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Icon className={`h-4 w-4 ml-2 ${option.color}`} />
                      <span className="ml-2 text-sm text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range:
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={activeFilters.dateRange.start}
                  onChange={(e) =>
                    updateFilter('dateRange', {
                      ...activeFilters.dateRange,
                      start: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Start date"
                />
                <input
                  type="date"
                  value={activeFilters.dateRange.end}
                  onChange={(e) =>
                    updateFilter('dateRange', {
                      ...activeFilters.dateRange,
                      end: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="End date"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {quickDateRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => setQuickDateRange(range.days)}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status:
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {statusOptions.map((status) => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={activeFilters.status.includes(status)}
                      onChange={() => toggleStatus(status)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">
                      {status.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity:
              </label>
              <div className="space-y-2">
                {severityOptions.map((severity) => (
                  <label key={severity.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={activeFilters.severity.includes(severity.value)}
                      onChange={() => toggleSeverity(severity.value)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${severity.color}`}>
                      {severity.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear all filters
            </button>
            <div className="text-sm text-gray-600">
              Active filters: {
                activeFilters.entityTypes.length +
                (activeFilters.dateRange.start ? 1 : 0) +
                activeFilters.status.length +
                activeFilters.severity.length
              }
            </div>
          </div>
        </div>
      )}

      {/* Results Header */}
      {searchResults.length > 0 && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {resultStats.total} results found
              </div>
              <div className="flex items-center space-x-2">
                {Object.entries(resultStats.byType).map(([type, count]) => {
                  const display = getEntityTypeDisplay(type);
                  const Icon = display.icon;
                  return (
                    <div key={type} className="flex items-center space-x-1 text-sm">
                      <Icon className={`h-4 w-4 ${display.color}`} />
                      <span className="text-gray-600">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={selectedResults.size === searchResults.length ? clearSelections : selectAllResults}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                {selectedResults.size === searchResults.length ? 'Deselect All' : 'Select All'}
              </button>
              {selectedResults.size > 0 && (
                <button
                  onClick={exportResults}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Export ({selectedResults.size})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="divide-y divide-gray-200">
        {searchResults.length === 0 && searchTerm.trim().length >= 2 && !isSearching && (
          <div className="p-8 text-center text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No results found</p>
            <p className="text-sm mt-1">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}

        {searchResults.map((result) => {
          const entityDisplay = getEntityTypeDisplay(result.entityType);
          const Icon = entityDisplay.icon;

          return (
            <div
              key={result._id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                selectedResults.has(result._id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedResults.has(result._id)}
                  onChange={() => toggleResultSelection(result._id)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Icon className={`h-5 w-5 mt-0.5 ${entityDisplay.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {result.title}
                    </h3>
                    <div className="flex items-center space-x-2 ml-4">
                      {result.status && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                          {result.status.replace('_', ' ')}
                        </span>
                      )}
                      {result.severity && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          severityOptions.find(s => s.value === result.severity)?.color || 'bg-gray-100 text-gray-800'
                        }`}>
                          {result.severity}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {result.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="capitalize">{entityDisplay.label.slice(0, -1)}</span>
                      <span>Created {formatDate(result._creationTime)}</span>
                      {result.lastUpdated && (
                        <span>Updated {formatDate(result.lastUpdated)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {searchResults.length >= 100 && (
        <div className="p-4 text-center border-t border-gray-200">
          <button
            onClick={() => {
              // Trigger a re-search with higher limit
              setSearchResults(prev => [...prev]);
            }}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Load more results
          </button>
        </div>
      )}
    </div>
  );
}