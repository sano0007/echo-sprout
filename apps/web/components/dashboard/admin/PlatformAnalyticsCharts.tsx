"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  Users,
  DollarSign,
  FolderOpen,
  Calendar
} from 'lucide-react';

interface PlatformAnalyticsChartsProps {
  loading?: boolean;
  className?: string;
}

// Mock data for charts
const revenueData = [
  { month: 'Jan', revenue: 45000, transactions: 120, users: 350 },
  { month: 'Feb', revenue: 52000, transactions: 145, users: 420 },
  { month: 'Mar', revenue: 48000, transactions: 135, users: 380 },
  { month: 'Apr', revenue: 61000, transactions: 170, users: 480 },
  { month: 'May', revenue: 55000, transactions: 160, users: 450 },
  { month: 'Jun', revenue: 67000, transactions: 190, users: 520 },
  { month: 'Jul', revenue: 72000, transactions: 205, users: 580 },
  { month: 'Aug', revenue: 69000, transactions: 195, users: 560 },
  { month: 'Sep', revenue: 78000, transactions: 220, users: 620 },
];

const projectTypeData = [
  { name: 'Reforestation', value: 35, count: 42, color: '#006A4E' },
  { name: 'Renewable Energy', value: 28, count: 34, color: '#2ECC71' },
  { name: 'Energy Efficiency', value: 20, count: 24, color: '#00F5B8' },
  { name: 'Agriculture', value: 12, count: 15, color: '#2C2C2C' },
  { name: 'Other', value: 5, count: 6, color: '#F1F2F6' },
];

const userGrowthData = [
  { date: '2024-01', creators: 45, buyers: 120, verifiers: 15, total: 180 },
  { date: '2024-02', creators: 52, buyers: 145, verifiers: 18, total: 215 },
  { date: '2024-03', creators: 48, buyers: 165, verifiers: 22, total: 235 },
  { date: '2024-04', creators: 61, buyers: 190, verifiers: 25, total: 276 },
  { date: '2024-05', creators: 68, buyers: 220, verifiers: 28, total: 316 },
  { date: '2024-06', creators: 75, buyers: 245, verifiers: 32, total: 352 },
  { date: '2024-07', creators: 82, buyers: 275, verifiers: 35, total: 392 },
  { date: '2024-08', creators: 89, buyers: 305, verifiers: 38, total: 432 },
  { date: '2024-09', creators: 95, buyers: 335, verifiers: 42, total: 472 },
];

const geographicData = [
  { country: 'United States', users: 156, projects: 23, revenue: 45000 },
  { country: 'Canada', users: 89, projects: 15, revenue: 28000 },
  { country: 'United Kingdom', users: 78, projects: 12, revenue: 22000 },
  { country: 'Germany', users: 65, projects: 10, revenue: 18000 },
  { country: 'Australia', users: 54, projects: 8, revenue: 15000 },
  { country: 'Brazil', users: 42, projects: 6, revenue: 12000 },
  { country: 'Others', users: 118, projects: 18, revenue: 32000 },
];

const ChartSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-64 w-full" />
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-medium text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' && entry.name.includes('revenue')
              ? `$${entry.value.toLocaleString()}`
              : entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const PlatformAnalyticsCharts: React.FC<PlatformAnalyticsChartsProps> = ({
  loading = false,
  className
}) => {
  const [timeRange, setTimeRange] = useState('9m');

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <ChartSkeleton />
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <ChartSkeleton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Platform Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Comprehensive insights into platform performance and user behavior
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="9m">Last 9 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            Live Data
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-bangladesh-green" />
                  Revenue Trends
                </CardTitle>
                <CardDescription>Monthly revenue and transaction volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      stroke="#666"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="#666"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#006A4E"
                      fill="#006A4E"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-bangladesh-green" />
                  Transaction Volume
                </CardTitle>
                <CardDescription>Number of transactions over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      stroke="#666"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      stroke="#666"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="transactions"
                      stroke="#2ECC71"
                      strokeWidth={3}
                      dot={{ fill: '#2ECC71', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-bangladesh-green" />
                User Growth by Role
              </CardTitle>
              <CardDescription>User registration trends by role type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="buyers"
                    stackId="1"
                    stroke="#2ECC71"
                    fill="#2ECC71"
                    fillOpacity={0.8}
                  />
                  <Area
                    type="monotone"
                    dataKey="creators"
                    stackId="1"
                    stroke="#006A4E"
                    fill="#006A4E"
                    fillOpacity={0.8}
                  />
                  <Area
                    type="monotone"
                    dataKey="verifiers"
                    stackId="1"
                    stroke="#00F5B8"
                    fill="#00F5B8"
                    fillOpacity={0.8}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-bangladesh-green" />
                  Project Distribution
                </CardTitle>
                <CardDescription>Projects by category type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                      labelLine={false}
                    >
                      {projectTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Project Statistics</CardTitle>
                <CardDescription>Detailed breakdown by project type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectTypeData.map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        <span className="font-medium text-sm">{type.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">{type.count} projects</div>
                        <div className="text-xs text-muted-foreground">{type.value}% of total</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Geographic Distribution</CardTitle>
              <CardDescription>Platform usage by country</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={geographicData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                  />
                  <YAxis
                    type="category"
                    dataKey="country"
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="users" fill="#006A4E" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};