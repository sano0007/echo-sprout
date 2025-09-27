"use client";

import { useState } from "react";
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
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import existing monitoring components
import AlertManagement from "@/components/monitoring/AlertManagement";
import AnalyticsDashboard from "@/components/monitoring/AnalyticsDashboard";
import ProjectManagement from "@/components/monitoring/ProjectManagement";

// Mock data for demonstration
const mockSystemStats = {
  totalProjects: 1247,
  activeProjects: 856,
  pendingReports: 23,
  criticalAlerts: 5
};

const mockAlerts = [
  {
    id: "1",
    projectId: "proj_001",
    projectName: "Amazon Reforestation Initiative",
    alertType: "overdue_warning" as const,
    severity: "high" as const,
    message: "Progress report overdue by 5 days",
    description: "Monthly progress report was due on Sept 22nd",
    isResolved: false,
    notificationsSent: ["email", "sms"],
    createdAt: "2024-09-27T10:00:00Z",
    dueDate: "2024-09-22T23:59:59Z",
    actionRequired: "Contact project creator for immediate report submission"
  },
  {
    id: "2",
    projectId: "proj_002",
    projectName: "Solar Farm Installation",
    alertType: "milestone_delay" as const,
    severity: "medium" as const,
    message: "Installation milestone delayed by 10 days",
    description: "Solar panel installation was scheduled for completion by Sept 15th",
    isResolved: false,
    notificationsSent: ["email"],
    createdAt: "2024-09-25T14:30:00Z",
    dueDate: "2024-09-15T23:59:59Z"
  },
  {
    id: "3",
    projectId: "proj_003",
    projectName: "Wind Energy Project",
    alertType: "impact_shortfall" as const,
    severity: "critical" as const,
    message: "Energy output 25% below projected targets",
    description: "Monthly energy generation significantly below expectations",
    isResolved: false,
    notificationsSent: ["email", "sms", "push"],
    createdAt: "2024-09-26T09:15:00Z"
  }
];


const SystemOverview = () => {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900">{mockSystemStats.totalProjects.toLocaleString()}</p>
                <p className="text-sm text-blue-600 mt-1">+12% from last month</p>
              </div>
              <Monitor className="h-12 w-12 text-blue-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-3xl font-bold text-gray-900">{mockSystemStats.activeProjects.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">+8% from last month</p>
              </div>
              <Activity className="h-12 w-12 text-green-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                <p className="text-3xl font-bold text-gray-900">{mockSystemStats.pendingReports}</p>
                <p className="text-sm text-yellow-600 mt-1">-15% from last week</p>
              </div>
              <Clock className="h-12 w-12 text-yellow-600 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                <p className="text-3xl font-bold text-gray-900">{mockSystemStats.criticalAlerts}</p>
                <p className="text-sm text-red-600 mt-1">Requires attention</p>
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
          <CardDescription>Common monitoring tasks and system operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" variant="outline">
              <Monitor className="h-6 w-6" />
              <span className="text-sm font-medium">View All Projects</span>
            </Button>
            <Button className="h-20 flex flex-col gap-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100" variant="outline">
              <AlertTriangle className="h-6 w-6" />
              <span className="text-sm font-medium">Critical Alerts</span>
            </Button>
            <Button className="h-20 flex flex-col gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100" variant="outline">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm font-medium">Generate Report</span>
            </Button>
            <Button className="h-20 flex flex-col gap-2 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" variant="outline">
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
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const handleResolveAlert = (alertId: string, resolution: string) => {
    console.log(`Resolving alert ${alertId} with resolution: ${resolution}`);
  };

  const handleSnoozeAlert = (alertId: string, duration: number) => {
    console.log(`Snoozing alert ${alertId} for ${duration} minutes`);
  };

  const handleEscalateAlert = (alertId: string, escalationLevel: string) => {
    console.log(`Escalating alert ${alertId} to level: ${escalationLevel}`);
  };

  const filteredAlerts = mockAlerts.filter(alert => {
    const matchesSearch = alert.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-red-600">{mockAlerts.filter(a => a.severity === 'critical').length}</div>
                <div className="text-sm font-medium text-gray-600">Critical Alerts</div>
                <div className="text-xs text-red-600 mt-1">Immediate action required</div>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-orange-600">{mockAlerts.filter(a => a.severity === 'high').length}</div>
                <div className="text-sm font-medium text-gray-600">High Priority</div>
                <div className="text-xs text-orange-600 mt-1">Attention needed soon</div>
              </div>
              <AlertTriangle className="h-10 w-10 text-orange-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-yellow-600">{mockAlerts.filter(a => a.severity === 'medium').length}</div>
                <div className="text-sm font-medium text-gray-600">Medium Priority</div>
                <div className="text-xs text-yellow-600 mt-1">Monitor progress</div>
              </div>
              <AlertTriangle className="h-10 w-10 text-yellow-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">{mockAlerts.filter(a => a.severity === 'medium').length}</div>
                <div className="text-sm font-medium text-gray-600">Low Priority</div>
                <div className="text-xs text-blue-600 mt-1">Informational only</div>
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
              <CardDescription>Monitor and resolve system alerts across all projects</CardDescription>
            </div>
            <Badge variant="destructive" className="text-sm">
              {mockAlerts.filter(a => !a.isResolved).length} Active
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
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
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

          <AlertManagement
            alerts={filteredAlerts}
            onResolveAlert={handleResolveAlert}
            onSnoozeAlert={handleSnoozeAlert}
            onEscalateAlert={handleEscalateAlert}
          />
        </CardContent>
      </Card>
    </div>
  );
};

const ProjectMonitoringTab = () => {
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
          <ProjectManagement />
        </CardContent>
      </Card>
    </div>
  );
};

const AnalyticsTab = () => {
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
          <AnalyticsDashboard />
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
          <h1 className="text-3xl font-bold text-gray-900">Monitoring System</h1>
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