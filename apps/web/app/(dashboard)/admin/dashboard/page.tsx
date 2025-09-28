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
import React, { useEffect, useState } from 'react';

import { PlatformAnalyticsCharts } from '@/components/dashboard/admin/PlatformAnalyticsCharts';
import { QuickActionsPanel } from '@/components/dashboard/admin/QuickActionsPanel';
import { RecentActivityFeed } from '@/components/dashboard/admin/RecentActivityFeed';
import { SystemHealthMonitor } from '@/components/dashboard/admin/SystemHealthMonitor';
import { SystemMetricsOverview } from '@/components/dashboard/admin/SystemMetricsOverview';
import { UserManagementTable } from '@/components/dashboard/admin/UserManagementTable';
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
        </div>
      </div>

      {/* System Metrics Overview */}
      <SystemMetricsOverview data={systemMetrics} loading={loading} />

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-8"
      >
        <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200 p-1">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-2 text-gray-600 data-[state=active]:bg-gray-50 data-[state=active]:text-gray-900"
          >
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex items-center gap-2 text-gray-600 data-[state=active]:bg-gray-50 data-[state=active]:text-gray-900"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="flex items-center gap-2 text-gray-600 data-[state=active]:bg-gray-50 data-[state=active]:text-gray-900"
          >
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="flex items-center gap-2 text-gray-600 data-[state=active]:bg-gray-50 data-[state=active]:text-gray-900"
          >
            <Activity className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger
            value="actions"
            className="flex items-center gap-2 text-gray-600 data-[state=active]:bg-gray-50 data-[state=active]:text-gray-900"
          >
            <Settings className="h-4 w-4" />
            Actions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <PlatformAnalyticsCharts loading={loading} />
            </div>
            <div className="space-y-6">
              <RecentActivityFeed
                loading={loading}
                maxItems={8}
                showFilters={false}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PlatformAnalyticsCharts loading={loading} />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagementTable
            loading={loading}
            onUserAction={handleUserAction}
          />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <SystemHealthMonitor
            loading={loading}
            onRefresh={handleSystemRefresh}
            onAlertAcknowledge={handleAlertAcknowledge}
          />
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <QuickActionsPanel
              loading={loading}
              onActionClick={handleQuickAction}
            />
            <div className="space-y-6">
              <RecentActivityFeed
                loading={loading}
                maxItems={10}
                showFilters={true}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span>EcoSprout Admin Dashboard v2.1.0</span>
              <span>•</span>
              <span className="text-green-600">System Status: Operational</span>
              <span>•</span>
              <span>Last Backup: 2 hours ago</span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-auto p-1 text-gray-500 hover:text-green-600"
              >
                API Docs
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-auto p-1 text-gray-500 hover:text-green-600"
              >
                Support
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-auto p-1 text-gray-500 hover:text-green-600"
              >
                System Logs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
