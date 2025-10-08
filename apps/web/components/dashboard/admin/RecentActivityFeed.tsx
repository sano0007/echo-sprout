'use client';

import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Filter,
  FolderOpen,
  MessageSquare,
  RefreshCw,
  Settings,
  Shield,
  User,
} from 'lucide-react';
import React, { useState } from 'react';

import { cn } from '@/lib/utils';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityItem {
  id: string;
  type:
    | 'user'
    | 'project'
    | 'transaction'
    | 'system'
    | 'security'
    | 'verification';
  action: string;
  description: string;
  user?: {
    name: string;
    avatar?: string;
    role: string;
  };
  target?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  impact: 'low' | 'medium' | 'high';
  status: 'success' | 'warning' | 'error' | 'info';
}

interface RecentActivityFeedProps {
  activities?: ActivityItem[];
  loading?: boolean;
  maxItems?: number;
  showFilters?: boolean;
  className?: string;
}

const activityIcons = {
  user: User,
  project: FolderOpen,
  transaction: DollarSign,
  system: Settings,
  security: Shield,
  verification: CheckCircle,
};

const statusColors = {
  success:
    'text-mountain-meadow bg-mountain-meadow/10 border-mountain-meadow/20',
  warning: 'text-amber-600 bg-amber-50 border-amber-200',
  error: 'text-red-600 bg-red-50 border-red-200',
  info: 'text-blue-600 bg-blue-50 border-blue-200',
};

const impactColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-red-100 text-red-700',
};

// Mock activity data
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'user',
    action: 'user_registered',
    description: 'New user registered as project creator',
    user: {
      name: 'John Smith',
      avatar: '',
      role: 'creator',
    },
    target: 'User Registration',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    impact: 'low',
    status: 'success',
  },
  {
    id: '2',
    type: 'transaction',
    action: 'credit_purchase',
    description: 'Large credit purchase completed',
    user: {
      name: 'Sarah Johnson',
      avatar: '',
      role: 'buyer',
    },
    target: 'Reforestation Project Alpha',
    metadata: { amount: 50000, credits: 500 },
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    impact: 'high',
    status: 'success',
  },
  {
    id: '3',
    type: 'system',
    action: 'backup_completed',
    description: 'Daily system backup completed successfully',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    impact: 'medium',
    status: 'success',
  },
  {
    id: '4',
    type: 'security',
    action: 'suspicious_login',
    description: 'Suspicious login attempt blocked',
    target: 'Admin Panel',
    metadata: { ip: '192.168.1.100', country: 'Unknown' },
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    impact: 'high',
    status: 'warning',
  },
  {
    id: '5',
    type: 'verification',
    action: 'project_verified',
    description: 'Project verification completed',
    user: {
      name: 'Dr. Michael Chen',
      avatar: '',
      role: 'verifier',
    },
    target: 'Solar Energy Project Beta',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    impact: 'medium',
    status: 'success',
  },
  {
    id: '6',
    type: 'project',
    action: 'project_submitted',
    description: 'New project submitted for verification',
    user: {
      name: 'Emma Williams',
      avatar: '',
      role: 'creator',
    },
    target: 'Wind Farm Project Gamma',
    timestamp: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
    impact: 'medium',
    status: 'info',
  },
  {
    id: '7',
    type: 'system',
    action: 'api_error',
    description: 'API rate limit exceeded for external service',
    target: 'Weather Data API',
    timestamp: new Date(Date.now() - 120 * 60 * 1000), // 2 hours ago
    impact: 'medium',
    status: 'error',
  },
  {
    id: '8',
    type: 'user',
    action: 'user_suspended',
    description: 'User account suspended for policy violation',
    target: 'Policy Violation',
    timestamp: new Date(Date.now() - 180 * 60 * 1000), // 3 hours ago
    impact: 'high',
    status: 'warning',
  },
];

const ActivityItemComponent: React.FC<{ activity: ActivityItem }> = ({
  activity,
}) => {
  const Icon = activityIcons[activity.type];

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const formatMetadata = (metadata: Record<string, any>) => {
    if (!metadata) return null;

    const entries = Object.entries(metadata);
    if (entries.length === 0) return null;

    return entries
      .map(([key, value]) => {
        if (key === 'amount') return `$${value.toLocaleString()}`;
        if (key === 'credits') return `${value} credits`;
        return `${key}: ${value}`;
      })
      .join(' • ');
  };

  return (
    <div className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors rounded-lg group">
      <div
        className={cn(
          'flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0',
          statusColors[activity.status]
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground">
            {activity.description}
          </p>
          <Badge
            variant="outline"
            className={cn('text-xs', impactColors[activity.impact])}
          >
            {activity.impact}
          </Badge>
        </div>

        {activity.user && (
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage
                src={activity.user.avatar}
                alt={activity.user.name}
              />
              <AvatarFallback className="bg-bangladesh-green text-white text-xs">
                {activity.user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {activity.user.name} ({activity.user.role})
            </span>
          </div>
        )}

        {activity.target && (
          <p className="text-xs text-muted-foreground">
            Target: {activity.target}
          </p>
        )}

        {activity.metadata && formatMetadata(activity.metadata) && (
          <p className="text-xs text-muted-foreground">
            {formatMetadata(activity.metadata)}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(activity.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
};

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities = mockActivities,
  loading = false,
  maxItems = 10,
  showFilters = true,
  className,
}) => {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredActivities = activities
    .filter((activity) => {
      const matchesType = typeFilter === 'all' || activity.type === typeFilter;
      const matchesStatus =
        statusFilter === 'all' || activity.status === statusFilter;
      return matchesType && matchesStatus;
    })
    .slice(0, maxItems);

  if (loading) {
    return (
      <Card className={cn('border-0 shadow-sm', className)}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-0 shadow-sm', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-bangladesh-green" />
              Recent Activity
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Latest platform events and user actions
            </p>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {showFilters && (
          <div className="flex gap-2 pt-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="user">User Events</SelectItem>
                <SelectItem value="project">Projects</SelectItem>
                <SelectItem value="transaction">Transactions</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="verification">Verification</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity found</p>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <ActivityItemComponent key={activity.id} activity={activity} />
            ))
          )}
        </div>

        {activities.length > maxItems && (
          <div className="flex justify-center pt-4 border-t">
            <Button variant="outline" size="sm">
              View All Activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
