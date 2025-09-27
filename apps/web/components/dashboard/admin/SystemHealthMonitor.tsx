"use client";

import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  HardDrive,
  MemoryStick,
  RefreshCw,
  Server,
  Settings,
  Shield,
  Wifi,
  XCircle,
  Zap} from 'lucide-react';
import React, { useState } from 'react';

import { cn } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import { ServiceStatus, SystemAlert, SystemHealthData, SystemMetric } from '@/types/dashboard.types';

interface SystemHealthMonitorProps {
  data?: SystemHealthData;
  loading?: boolean;
  onRefresh?: () => void;
  onAlertAcknowledge?: (alertId: string) => void;
  className?: string;
}

const serviceIcons = {
  api: Server,
  database: Database,
  cache: MemoryStick,
  storage: HardDrive,
  monitoring: Activity,
  security: Shield,
  backup: Database,
  notification: Bell,
  payment: Zap,
  cdn: Wifi,
};

const statusColors = {
  operational: 'text-mountain-meadow bg-mountain-meadow/10 border-mountain-meadow/20',
  degraded: 'text-amber-600 bg-amber-50 border-amber-200',
  outage: 'text-red-600 bg-red-50 border-red-200',
};

const alertSeverityColors = {
  low: 'text-blue-600 bg-blue-50 border-blue-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  critical: 'text-red-600 bg-red-50 border-red-200',
};

const metricStatusColors = {
  normal: 'text-mountain-meadow',
  warning: 'text-amber-600',
  critical: 'text-red-600',
};

// Mock data
const mockHealthData: SystemHealthData = {
  status: 'healthy',
  lastHealthCheck: new Date(),
  services: [
    {
      name: 'API Gateway',
      status: 'operational',
      uptime: 99.98,
      responseTime: 145,
      lastChecked: new Date(Date.now() - 30000),
    },
    {
      name: 'Database',
      status: 'operational',
      uptime: 99.95,
      responseTime: 23,
      lastChecked: new Date(Date.now() - 45000),
    },
    {
      name: 'Cache Service',
      status: 'degraded',
      uptime: 98.5,
      responseTime: 250,
      lastChecked: new Date(Date.now() - 60000),
    },
    {
      name: 'File Storage',
      status: 'operational',
      uptime: 99.99,
      responseTime: 89,
      lastChecked: new Date(Date.now() - 20000),
    },
    {
      name: 'Payment Gateway',
      status: 'operational',
      uptime: 99.92,
      responseTime: 180,
      lastChecked: new Date(Date.now() - 15000),
    },
    {
      name: 'Notification Service',
      status: 'operational',
      uptime: 99.87,
      responseTime: 120,
      lastChecked: new Date(Date.now() - 40000),
    },
  ],
  alerts: [
    {
      id: '1',
      type: 'performance',
      severity: 'medium',
      message: 'Cache service response time increased by 25%',
      service: 'Cache Service',
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      acknowledged: false,
    },
    {
      id: '2',
      type: 'capacity',
      severity: 'high',
      message: 'Database storage usage above 85% threshold',
      service: 'Database',
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
      acknowledged: false,
    },
    {
      id: '3',
      type: 'security',
      severity: 'critical',
      message: 'Multiple failed login attempts detected',
      createdAt: new Date(Date.now() - 90 * 60 * 1000),
      acknowledged: true,
      resolvedAt: new Date(Date.now() - 30 * 60 * 1000),
    },
  ],
  metrics: [
    {
      name: 'CPU Usage',
      value: 68,
      unit: '%',
      threshold: 80,
      status: 'normal',
      trend: 'positive',
    },
    {
      name: 'Memory Usage',
      value: 75,
      unit: '%',
      threshold: 85,
      status: 'warning',
      trend: 'negative',
    },
    {
      name: 'Disk Usage',
      value: 45,
      unit: '%',
      threshold: 90,
      status: 'normal',
      trend: 'neutral',
    },
    {
      name: 'Network I/O',
      value: 120,
      unit: 'Mbps',
      threshold: 500,
      status: 'normal',
      trend: 'positive',
    },
  ],
};

const ServiceCard: React.FC<{ service: ServiceStatus; onRefresh?: () => void }> = ({
  service,
  onRefresh
}) => {
  const getServiceIcon = (serviceName: string) => {
    const key = serviceName.toLowerCase().replace(/\s+/g, '').replace(/gateway|service/g, '');
    return serviceIcons[key as keyof typeof serviceIcons] || Server;
  };

  const Icon = getServiceIcon(service.name);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-bangladesh-green" />
            <span className="font-medium text-sm">{service.name}</span>
          </div>
          <Badge
            variant="outline"
            className={cn('text-xs capitalize', statusColors[service.status])}
          >
            {service.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Uptime</span>
            <span className="font-medium">{service.uptime.toFixed(2)}%</span>
          </div>
          <Progress
            value={service.uptime}
            className="h-1.5"
          />

          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Response Time</span>
            <span className="font-medium">{service.responseTime}ms</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">
              Last checked: {formatTimestamp(service.lastChecked)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-auto p-1"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AlertCard: React.FC<{ alert: SystemAlert; onAcknowledge?: (id: string) => void }> = ({
  alert,
  onAcknowledge
}) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return XCircle;
      case 'high': return AlertTriangle;
      case 'medium': return AlertTriangle;
      default: return CheckCircle;
    }
  };

  const Icon = getSeverityIcon(alert.severity);

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleString();
  };

  return (
    <Card className={cn(
      'border-0 shadow-sm',
      alert.acknowledged ? 'opacity-60' : '',
      alert.severity === 'critical' ? 'border-l-4 border-l-red-500' : ''
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0',
            alertSeverityColors[alert.severity]
          )}>
            <Icon className="h-4 w-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className={cn('text-xs capitalize', alertSeverityColors[alert.severity])}
              >
                {alert.severity}
              </Badge>
              {alert.service && (
                <span className="text-xs text-muted-foreground">
                  {alert.service}
                </span>
              )}
            </div>

            <p className="text-sm font-medium text-foreground mb-2">
              {alert.message}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(alert.createdAt)}
              </span>

              {!alert.acknowledged && onAcknowledge && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAcknowledge(alert.id)}
                  className="text-xs"
                >
                  Acknowledge
                </Button>
              )}

              {alert.acknowledged && (
                <Badge variant="outline" className="text-xs">
                  Acknowledged
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MetricCard: React.FC<{ metric: SystemMetric }> = ({ metric }) => {
  const getMetricIcon = (name: string) => {
    if (name.toLowerCase().includes('cpu')) return Cpu;
    if (name.toLowerCase().includes('memory')) return MemoryStick;
    if (name.toLowerCase().includes('disk')) return HardDrive;
    if (name.toLowerCase().includes('network')) return Wifi;
    return Activity;
  };

  const Icon = getMetricIcon(metric.name);
  const percentage = metric.threshold ? (metric.value / metric.threshold) * 100 : 0;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-bangladesh-green" />
            <span className="font-medium text-sm">{metric.name}</span>
          </div>
          <Badge
            variant="outline"
            className={cn('text-xs', metricStatusColors[metric.status])}
          >
            {metric.status}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-2xl font-bold">
              {metric.value}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {metric.unit}
              </span>
            </span>
            {metric.threshold && (
              <span className="text-xs text-muted-foreground">
                Threshold: {metric.threshold}{metric.unit}
              </span>
            )}
          </div>

          {metric.threshold && (
            <Progress
              value={Math.min(percentage, 100)}
              className="h-1.5"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const SystemHealthMonitor: React.FC<SystemHealthMonitorProps> = ({
  data = mockHealthData,
  loading = false,
  onRefresh = () => {},
  onAlertAcknowledge = () => {},
  className
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-mountain-meadow bg-mountain-meadow/10 border-mountain-meadow/20';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-bangladesh-green" />
                System Health Monitor
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Real-time system status and performance metrics
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn('text-sm capitalize', getOverallStatusColor(data.status))}
              >
                {data.status}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.services.map((service, index) => (
              <ServiceCard
                key={index}
                service={service}
                onRefresh={handleRefresh}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {data.alerts.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-mountain-meadow" />
                  <p className="text-muted-foreground">No active alerts</p>
                </CardContent>
              </Card>
            ) : (
              data.alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={onAlertAcknowledge}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {data.metrics.map((metric, index) => (
              <MetricCard key={index} metric={metric} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};