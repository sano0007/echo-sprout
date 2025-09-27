"use client";

import {
  Activity,
  Clock,
  Coins,
  DollarSign,
  FolderOpen,
  LucideIcon,
  Minus,
  TrendingDown,
  TrendingUp,
  Users} from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { SystemOverviewMetrics } from '@/types/dashboard.types';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  description?: string;
  loading?: boolean;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  description,
  loading = false,
  className
}) => {
  const changeColors = {
    positive: 'text-green-600 bg-green-50 border-green-200',
    negative: 'text-gray-600 bg-gray-50 border-gray-200',
    neutral: 'text-gray-500 bg-gray-50 border-gray-200'
  };

  const changeIcons = {
    positive: TrendingUp,
    negative: TrendingDown,
    neutral: Minus
  };

  const ChangeIcon = changeIcons[changeType];

  if (loading) {
    return (
      <Card className={cn('bg-white border-gray-200 transition-all duration-300', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 bg-gray-100" />
            <Skeleton className="h-5 w-5 rounded bg-gray-100" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-20 bg-gray-100" />
          <Skeleton className="h-3 w-28 bg-gray-100" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-white border-gray-200 hover:border-gray-300 transition-all duration-300 group cursor-pointer', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
          <Icon className="h-4 w-4 text-green-500 group-hover:text-green-600 transition-colors" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-gray-900 mb-1 group-hover:text-black transition-colors">
          {value}
        </div>
        {description && (
          <p className="text-xs text-gray-500 mb-2">{description}</p>
        )}
        {change && (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn('text-xs font-medium px-2 py-1', changeColors[changeType])}
            >
              <ChangeIcon className="h-3 w-3 mr-1" />
              {change}
            </Badge>
            <span className="text-xs text-gray-500">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface SystemMetricsOverviewProps {
  data?: SystemOverviewMetrics;
  loading?: boolean;
  className?: string;
}

export const SystemMetricsOverview: React.FC<SystemMetricsOverviewProps> = ({
  data,
  loading = false,
  className
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatPercentage = (num: number): string => {
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(1)}%`;
  };

  const getChangeType = (change: number) => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  const metrics = loading || !data ? [] : [
    {
      title: 'Total Users',
      value: formatNumber(data.totalUsers),
      change: formatPercentage(12.5), // Mock change data
      changeType: getChangeType(12.5),
      icon: Users,
      description: `${data.activeUsers24h} active in 24h`
    },
    {
      title: 'Active Projects',
      value: formatNumber(data.activeProjects),
      change: formatPercentage(8.2),
      changeType: getChangeType(8.2),
      icon: FolderOpen,
      description: 'Currently verified projects'
    },
    {
      title: 'Credits Traded',
      value: formatNumber(data.totalCreditsTraded),
      change: formatPercentage(15.7),
      changeType: getChangeType(15.7),
      icon: Coins,
      description: 'Total carbon credits traded'
    },
    {
      title: 'Platform Revenue',
      value: formatCurrency(data.platformRevenue),
      change: formatPercentage(22.1),
      changeType: getChangeType(22.1),
      icon: DollarSign,
      description: 'Monthly recurring revenue'
    },
    {
      title: 'System Uptime',
      value: `${data.systemUptime.toFixed(2)}%`,
      change: formatPercentage(0.1),
      changeType: getChangeType(0.1),
      icon: Activity,
      description: 'Last 30 days average'
    },
    {
      title: 'Avg Response Time',
      value: '142ms',
      change: formatPercentage(-5.3),
      changeType: getChangeType(-5.3),
      icon: Clock,
      description: 'API response time'
    }
  ];

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">System Overview</h2>
          <p className="text-gray-500 mt-1">
            Real-time platform metrics and performance indicators
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-green-600 bg-green-50 border-green-200"
        >
          Live Data
        </Badge>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {loading || !data ? (
          Array.from({ length: 6 }).map((_, index) => (
            <MetricCard
              key={index}
              title=""
              value=""
              icon={Users}
              loading={true}
            />
          ))
        ) : (
          metrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              changeType={metric.changeType as 'positive' | 'negative' | 'neutral'}
              icon={metric.icon}
              description={metric.description}
            />
          ))
        )}
      </div>
    </div>
  );
};