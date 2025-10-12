'use client';

import {
  Activity,
  BarChart3,
  Clock,
  Download,
  RefreshCw,
  Settings,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { PlatformAnalyticsCharts } from '@/components/dashboard/admin/PlatformAnalyticsCharts';
import { QuickActionsPanel } from '@/components/dashboard/admin/QuickActionsPanel';
import { RecentActivityFeed } from '@/components/dashboard/admin/RecentActivityFeed';
import { SystemHealthMonitor } from '@/components/dashboard/admin/SystemHealthMonitor';
import { SystemMetricsOverview } from '@/components/dashboard/admin/SystemMetricsOverview';
import { UserManagementTable } from '@/components/dashboard/admin/UserManagementTable';
import LearnAnalytics from '@/components/learn/LearnAnalytics';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ClientTime } from '@/components/ui/client-time';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { SystemOverviewMetrics } from '@/types/dashboard.types';

// Mock user data for the admin
const mockAdminUser = {
  name: 'Admin User',
  email: 'admin@ecosprout.com',
  avatar: '',
  role: 'System Administrator',
};

// Mock system overview data
const mockSystemMetrics: SystemOverviewMetrics = {
  totalUsers: 1247,
  activeProjects: 89,
  totalCreditsTraded: 45670,
  platformRevenue: 892450,
  systemUptime: 99.97,
  activeUsers24h: 342,
  trends: {
    users: 'positive',
    projects: 'positive',
    credits: 'positive',
    revenue: 'positive',
  },
};

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [systemMetrics, setSystemMetrics] = useState<
    SystemOverviewMetrics | undefined
  >(undefined);

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSystemMetrics(mockSystemMetrics);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleUserAction = (userId: string, action: string) => {
    console.log(`User action: ${action} for user ${userId}`);
    // Handle user management actions
  };

  const handleQuickAction = (actionId: string) => {
    console.log(`Quick action: ${actionId}`);
    // Handle quick actions
  };

  const handleSystemRefresh = () => {
    console.log('Refreshing system data...');
    // Handle system data refresh
  };

  const handleAlertAcknowledge = (alertId: string) => {
    console.log(`Acknowledging alert: ${alertId}`);
    // Handle alert acknowledgment
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Platform management and monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="text-xs text-gray-500 bg-gray-50 border-gray-200"
          >
            <Clock className="h-3 w-3 mr-1" />
            <ClientTime prefix="Last updated: " format="time" />
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <Link href="/learn/analytics" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Link>
          </Button>
        </div>
      </div>
      <SystemMetricsOverview data={systemMetrics} loading={loading} />
    </div>
  );
}
