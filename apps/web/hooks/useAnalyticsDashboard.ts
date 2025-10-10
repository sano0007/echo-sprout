'use client';

import { useState, useCallback } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

// Types from the backend
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

export interface UseAnalyticsDashboardOptions {
  timeframe?: '7d' | '30d' | '90d' | '1y';
  category?: 'all' | 'platform' | 'environmental' | 'financial' | 'user';
}

export function useAnalyticsDashboard(options: UseAnalyticsDashboardOptions = {}) {
  const [refreshKey, setRefreshKey] = useState(0);

  const { timeframe = '30d', category = 'all' } = options;

  const data = useQuery(
    api.analytics.getDashboardAnalytics,
    {
      timeframe,
      category,
    }
  );

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const isLoading = data === undefined;
  const error = data === null ? new Error('Failed to load analytics data') : null;

  return {
    data: data as DashboardAnalytics | undefined,
    isLoading,
    error,
    refresh,
  };
}

// Hook for specific metrics
export function useAnalyticsMetrics(options: UseAnalyticsDashboardOptions = {}) {
  const { data, isLoading, error, refresh } = useAnalyticsDashboard(options);

  return {
    metrics: data?.metrics || [],
    isLoading,
    error,
    refresh,
  };
}

// Hook for specific charts
export function useAnalyticsCharts(options: UseAnalyticsDashboardOptions = {}) {
  const { data, isLoading, error, refresh } = useAnalyticsDashboard(options);

  return {
    charts: data?.charts || [],
    isLoading,
    error,
    refresh,
  };
}

// Hook for filtered analytics by category
export function useAnalyticsByCategory(category: 'platform' | 'environmental' | 'financial' | 'user', timeframe: '7d' | '30d' | '90d' | '1y' = '30d') {
  return useAnalyticsDashboard({ category, timeframe });
}

// Utility function to format values based on metric format
export function formatMetricValue(value: number, format: string, unit: string): string {
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
}

// Utility function to get change icon class
export function getChangeIconClass(changeType: string): string {
  switch (changeType) {
    case 'increase':
      return 'text-green-500';
    case 'decrease':
      return 'text-red-500';
    default:
      return 'text-gray-400';
  }
}

// Utility function to get category color
export function getCategoryColor(category: string): string {
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
}