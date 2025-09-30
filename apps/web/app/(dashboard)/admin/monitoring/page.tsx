'use client';

import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  Download,
  Monitor,
  RefreshCw,
  Settings,
  CheckCircle,
  XCircle,
  Eye,
  Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@packages/backend';
import AlertManagement from '@/components/monitoring/AlertManagement';
import AnalyticsDashboard from '@/components/monitoring/AnalyticsDashboard';
import ProjectManagement from '@/components/monitoring/ProjectManagement';

const SystemOverview = () => {
  // Get current user to check permissions
  const currentUser = useQuery(api.users.getCurrentUser, {});
  const isAdmin = currentUser?.role === 'admin';

  // Get real data from backend - conditionally call admin-only APIs
  const analytics = useQuery(
    api.monitoring_admin.getMonitoringAnalytics,
    isAdmin ? { timeframe: '7d' } : 'skip'
  );
  const alertSummary = useQuery(api.alert_management.getAlertSummary, {
    timeframe: '7d',
  });
  const userProjects = useQuery(api.projects.getUserProjects, {});

  // Check if we have an access error and provide fallback data
  const hasAnalyticsError = !isAdmin || analytics === null;
  const hasAlertSummaryError = alertSummary === null;

  // Calculate metrics from real data with fallbacks
  const totalProjects = userProjects?.length || 0;
  const activeProjects =
    userProjects?.filter((p) => p.status === 'active').length || 0;
  // Calculate pending reports from unresolved alerts related to reports
  const pendingReports = hasAlertSummaryError
    ? 0
    : alertSummary?.unresolved || 0;
  const criticalAlerts = hasAlertSummaryError
    ? 0
    : alertSummary?.bySeverity?.critical || 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Projects
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalProjects.toLocaleString()}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  {userProjects ? `${userProjects.length} total` : 'Loading...'}
                </p>
              </div>
              <Monitor className="h-12 w-12 text-blue-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Projects
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {activeProjects.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  {userProjects
                    ? `${Math.round((activeProjects / totalProjects) * 100) || 0}% of total`
                    : 'Loading...'}
                </p>
              </div>
              <Activity className="h-12 w-12 text-green-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Reports
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {pendingReports}
                </p>
                <p className="text-sm text-yellow-600 mt-1">
                  {analytics ? 'This week' : 'Loading...'}
                </p>
              </div>
              <Clock className="h-12 w-12 text-yellow-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Critical Alerts
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {criticalAlerts}
                </p>
                <p className="text-sm text-red-600 mt-1">
                  {alertSummary ? 'Requires attention' : 'Loading...'}
                </p>
              </div>
              <AlertTriangle className="h-12 w-12 text-red-600 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common monitoring tasks and system operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              className="h-20 flex flex-col gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              variant="outline"
            >
              <Monitor className="h-6 w-6" />
              <span className="text-sm font-medium">View All Projects</span>
            </Button>
            <Button
              className="h-20 flex flex-col gap-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
              variant="outline"
            >
              <AlertTriangle className="h-6 w-6" />
              <span className="text-sm font-medium">Critical Alerts</span>
            </Button>
            <Button
              className="h-20 flex flex-col gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              variant="outline"
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm font-medium">Generate Report</span>
            </Button>
            <Button
              className="h-20 flex flex-col gap-2 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
              variant="outline"
            >
              <Settings className="h-6 w-6" />
              <span className="text-sm font-medium">System Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AlertsOverview = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<
    'all' | 'low' | 'medium' | 'high' | 'critical'
  >('all');

  // Get current user to check permissions
  const currentUser = useQuery(api.users.getCurrentUser, {});
  const isAdmin = currentUser?.role === 'admin';

  // Get real alerts data from backend - conditionally call based on permissions
  const alertsQuery = useQuery(
    api.alert_management.getAlerts,
    isAdmin
      ? {
          filters:
            severityFilter !== 'all'
              ? {
                  severity: [
                    severityFilter as 'low' | 'medium' | 'high' | 'critical',
                  ],
                }
              : undefined,
          pagination: { limit: 100 },
        }
      : 'skip'
  );

  const alertSummary = useQuery(
    api.alert_management.getAlertSummary,
    isAdmin ? { timeframe: '7d' } : 'skip'
  );

  // Check for access errors
  const hasAlertsError = !isAdmin || alertsQuery === null;
  const hasAlertSummaryError = !isAdmin || alertSummary === null;

  // Mutations for alert actions
  const resolveAlert = useMutation(api.alert_management.resolveAlert);
  const updateAlert = useMutation(api.alert_management.updateAlert);

  const handleResolveAlert = async (alertId: string, resolution: string) => {
    try {
      await resolveAlert({
        alertId: alertId as any, // Type assertion for Convex ID
        resolutionNotes: resolution,
        resolutionType: 'fixed' as const,
      });
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const handleSnoozeAlert = async (alertId: string, duration: number) => {
    try {
      // Since snoozeAlert doesn't exist, we'll update the alert with a note
      await updateAlert({
        alertId: alertId as any, // Type assertion for Convex ID
        updates: {
          metadata: {
            snoozed: true,
            snoozeUntil: Date.now() + duration * 60 * 1000,
          },
        },
        notes: `Alert snoozed for ${duration} minutes`,
      });
      console.log(`Alert ${alertId} snoozed for ${duration} minutes`);
    } catch (error) {
      console.error('Failed to snooze alert:', error);
    }
  };

  const handleEscalateAlert = async (
    alertId: string,
    escalationLevel: string
  ) => {
    try {
      // Since escalateAlert doesn't exist, we'll update the alert with escalation info
      await updateAlert({
        alertId: alertId as any, // Type assertion for Convex ID
        updates: {
          metadata: {
            escalated: true,
            escalationLevel,
            escalatedAt: Date.now(),
          },
        },
        notes: `Alert escalated to level: ${escalationLevel}`,
      });
      console.log(`Alert ${alertId} escalated to level: ${escalationLevel}`);
    } catch (error) {
      console.error('Failed to escalate alert:', error);
    }
  };

  // Filter alerts based on search term
  const allAlerts = hasAlertsError ? [] : alertsQuery?.alerts || [];
  const filteredAlerts = allAlerts.filter(
    (alert) =>
      (alert.projectInfo?.title || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show access error message if user doesn't have permission
  if (hasAlertsError || hasAlertSummaryError) {
    return (
      <div className="space-y-6">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div>
                <h3 className="font-medium text-gray-900">Access Restricted</h3>
                <p className="text-sm text-gray-600">
                  Admin privileges are required to view alert management. Please
                  contact your administrator for access.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-600">
                  {alertSummary?.bySeverity?.critical || 0}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  Critical Alerts
                </div>
                <div className="text-xs text-red-600 mt-1">
                  Immediate action required
                </div>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-orange-600">
                  {alertSummary?.bySeverity?.high || 0}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  High Priority
                </div>
                <div className="text-xs text-orange-600 mt-1">
                  Attention needed soon
                </div>
              </div>
              <AlertTriangle className="h-10 w-10 text-orange-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-600">
                  {alertSummary?.bySeverity?.medium || 0}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  Medium Priority
                </div>
                <div className="text-xs text-yellow-600 mt-1">
                  Monitor progress
                </div>
              </div>
              <AlertTriangle className="h-10 w-10 text-yellow-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {alertSummary?.bySeverity?.low || 0}
                </div>
                <div className="text-sm font-medium text-gray-600">
                  Low Priority
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Informational only
                </div>
              </div>
              <AlertTriangle className="h-10 w-10 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alert Management
              </CardTitle>
              <CardDescription>
                Monitor and resolve system alerts across all projects
              </CardDescription>
            </div>
            <Badge variant="destructive" className="text-sm">
              {hasAlertSummaryError ? 0 : alertSummary?.unresolved || 0} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search alerts by project name or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={severityFilter}
              onValueChange={(value: string) =>
                setSeverityFilter(
                  value as 'all' | 'low' | 'medium' | 'high' | 'critical'
                )
              }
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {alertsQuery === undefined ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">Loading alerts...</p>
              </div>
            </div>
          ) : (
            <AlertManagement
              alerts={filteredAlerts}
              onResolveAlert={handleResolveAlert}
              onSnoozeAlert={handleSnoozeAlert}
              onEscalateAlert={handleEscalateAlert}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ProjectMonitoringTab = () => {
  // Get current user to check permissions
  const currentUser = useQuery(api.users.getCurrentUser, {});
  const userProjects = useQuery(api.projects.getUserProjects, {});

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Monitoring Dashboard</CardTitle>
          <CardDescription>
            Monitor project progress, milestones, and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userProjects === undefined ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">Loading projects...</p>
              </div>
            </div>
          ) : (
            <ProjectManagement projects={userProjects as any} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const AnalyticsTab = () => {
  // Get current user to check permissions
  const currentUser = useQuery(api.users.getCurrentUser, {});
  const isAdmin = currentUser?.role === 'admin';

  const analytics = useQuery(
    api.monitoring_admin.getMonitoringAnalytics,
    isAdmin ? { timeframe: '30d' } : 'skip'
  );

  const handleExportReport = (type: string, timeframe: string) => {
    console.log(`Exporting ${type} report for ${timeframe}`);
  };

  const handleDrillDown = (metric: string, filters: any) => {
    console.log(`Drilling down into ${metric} with filters:`, filters);
  };

  const handleRefreshData = () => {
    console.log('Refreshing analytics data');
  };

  // Check for access error
  const hasAnalyticsError = !isAdmin || analytics === null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analytics & Reporting</CardTitle>
          <CardDescription>
            Comprehensive analytics and performance insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasAnalyticsError ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-2">
                  Access Restricted
                </h3>
                <p className="text-gray-600">
                  Admin privileges are required to view analytics. Please
                  contact your administrator for access.
                </p>
              </div>
            </div>
          ) : analytics === undefined ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">Loading analytics...</p>
              </div>
            </div>
          ) : (
            <AnalyticsDashboard
              timeframe="30d"
              onExportReport={handleExportReport}
              onDrillDown={handleDrillDown}
              onRefreshData={handleRefreshData}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const SettingsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monitoring System Settings</CardTitle>
        <CardDescription>
          Configure monitoring parameters and notification settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Alert Configuration</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Progress Report Reminder</span>
                <Select defaultValue="7">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Milestone Delay Threshold</span>
                <Select defaultValue="5">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="5">5 days</SelectItem>
                    <SelectItem value="10">10 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Notification Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Notifications</span>
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SMS Alerts (Critical)</span>
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Push Notifications</span>
                <Badge className="bg-gray-100 text-gray-800">Disabled</Badge>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">System Maintenance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export System Logs
            </Button>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Cache
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Advanced Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function MonitoringSystemPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Monitoring System
          </h1>
          <p className="text-gray-600">
            Comprehensive project monitoring and tracking dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Data
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alert Management</TabsTrigger>
          <TabsTrigger value="projects">Project Monitoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <SystemOverview />
        </TabsContent>

        <TabsContent value="alerts">
          <AlertsOverview />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectMonitoringTab />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
