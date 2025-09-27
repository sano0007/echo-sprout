"use client";

import {
  AlertTriangle,
  Archive,
  Bell,
  CheckCircle,
  Clock,
  Database,
  Download,
  FileText,
  Mail,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  UserPlus} from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'default' | 'outline' | 'destructive' | 'secondary';
  urgent?: boolean;
  count?: number;
  onClick?: () => void;
}

interface QuickActionsPanelProps {
  loading?: boolean;
  onActionClick?: (actionId: string) => void;
  className?: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'pending-approvals',
    title: 'Review Pending Approvals',
    description: 'User registrations and role changes',
    icon: UserPlus,
    variant: 'default',
    urgent: true,
    count: 12,
  },
  {
    id: 'system-alerts',
    title: 'System Alerts',
    description: 'Critical issues requiring attention',
    icon: AlertTriangle,
    variant: 'destructive',
    urgent: true,
    count: 3,
  },
  {
    id: 'generate-report',
    title: 'Generate Monthly Report',
    description: 'Platform performance and analytics',
    icon: FileText,
    variant: 'outline',
  },
  {
    id: 'export-data',
    title: 'Export User Data',
    description: 'Download complete user database',
    icon: Download,
    variant: 'outline',
  },
  {
    id: 'send-announcement',
    title: 'Send Announcement',
    description: 'Broadcast message to all users',
    icon: Mail,
    variant: 'secondary',
  },
  {
    id: 'backup-database',
    title: 'Backup Database',
    description: 'Create system backup',
    icon: Database,
    variant: 'outline',
  },
  {
    id: 'refresh-cache',
    title: 'Refresh Cache',
    description: 'Clear and reload system cache',
    icon: RefreshCw,
    variant: 'outline',
  },
  {
    id: 'security-scan',
    title: 'Security Scan',
    description: 'Run comprehensive security check',
    icon: Shield,
    variant: 'outline',
  }
];

const recentTasks = [
  {
    id: '1',
    title: 'User verification completed',
    description: 'John Smith verified as project creator',
    timestamp: '2 hours ago',
    status: 'completed',
    icon: CheckCircle,
  },
  {
    id: '2',
    title: 'System backup initiated',
    description: 'Daily backup process started',
    timestamp: '4 hours ago',
    status: 'in_progress',
    icon: Clock,
  },
  {
    id: '3',
    title: 'Monthly report generated',
    description: 'September analytics report ready',
    timestamp: '6 hours ago',
    status: 'completed',
    icon: FileText,
  },
  {
    id: '4',
    title: 'Security alert resolved',
    description: 'Suspicious login attempt blocked',
    timestamp: '8 hours ago',
    status: 'completed',
    icon: Shield,
  },
];

const ActionButton: React.FC<{ action: QuickAction; onClick?: () => void }> = ({
  action,
  onClick
}) => {
  const Icon = action.icon;

  return (
    <Button
      variant={action.variant}
      size="sm"
      onClick={onClick}
      className={cn(
        'h-auto p-4 flex-col gap-2 relative min-h-[100px] justify-start text-left',
        action.variant === 'default' && 'bg-bangladesh-green hover:bg-bangladesh-green/90',
        action.urgent && 'ring-2 ring-red-200 ring-offset-2'
      )}
    >
      <div className="flex items-center gap-2 w-full">
        <Icon className="h-4 w-4 flex-shrink-0" />
        {action.count && (
          <Badge
            variant={action.urgent ? 'destructive' : 'secondary'}
            className="text-xs px-1.5 py-0.5 ml-auto"
          >
            {action.count}
          </Badge>
        )}
      </div>
      <div className="text-left w-full">
        <div className="font-medium text-sm leading-tight mb-1">
          {action.title}
        </div>
        <div className="text-xs opacity-80 leading-tight">
          {action.description}
        </div>
      </div>
    </Button>
  );
};

const TaskItem: React.FC<{ task: any }> = ({ task }) => {
  const statusColors = {
    completed: 'text-mountain-meadow',
    in_progress: 'text-blue-600',
    pending: 'text-amber-600',
    failed: 'text-red-600',
  };

  const Icon = task.icon;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className={cn('mt-0.5', statusColors[task.status as keyof typeof statusColors] || 'text-gray-600')}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground leading-tight">
          {task.title}
        </p>
        <p className="text-xs text-muted-foreground leading-tight mt-1">
          {task.description}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {task.timestamp}
        </p>
      </div>
    </div>
  );
};

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  loading = false,
  onActionClick = () => {},
  className
}) => {
  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5 text-bangladesh-green" />
            Quick Actions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Common administrative tasks and system operations
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {quickActions.map((action) => (
              <ActionButton
                key={action.id}
                action={action}
                onClick={() => onActionClick(action.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Tasks */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-bangladesh-green" />
                Recent Tasks
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest administrative actions and system events
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Archive className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {recentTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Urgent Notifications */}
      <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-red-700">
            <Bell className="h-5 w-5" />
            Urgent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  System Performance Alert
                </p>
                <p className="text-xs text-red-600">
                  Database response time increased by 15% in the last hour
                </p>
              </div>
              <Button variant="outline" size="sm" className="text-red-700 border-red-200">
                Investigate
              </Button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
              <Clock className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">
                  Pending User Approvals
                </p>
                <p className="text-xs text-amber-600">
                  12 user registrations waiting for admin approval
                </p>
              </div>
              <Button variant="outline" size="sm" className="text-amber-700 border-amber-200">
                Review
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};