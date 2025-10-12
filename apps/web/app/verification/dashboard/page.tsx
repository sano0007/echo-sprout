'use client';

import { api } from '@packages/backend';
import { useMutation, useQuery } from 'convex/react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { 
  BarChart3, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  FileText,
  Users,
  Award,
  Download
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import RequestProgressReportModal from '@/components/monitoring/RequestProgressReportModal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function VerificationDashboard() {
  const [activeTab, setActiveTab] = useState<'pendingAcceptance' | 'accepted' | 'inProgress' | 'completed' | 'upgradeRequests' | 'progressReviews' | 'analytics'>('pendingAcceptance');
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const permissions = useQuery(api.permissions.getCurrentUserPermissions);

  const verifierStats = useQuery(api.verifications.getVerifierStats, {});

  const acceptanceStats = useQuery(
    api.verifications.getVerifierAcceptanceStats,
    {}
  );

  const myVerifications = useQuery(api.verifications.getMyVerifications, {
    paginationOpts: { numItems: 50, cursor: null },
  });

  const pendingVerifications = useQuery(
    api.verifications.getPendingVerifications,
    permissions?.isAdmin
      ? { paginationOpts: { numItems: 50, cursor: null } }
      : 'skip'
  );

  const upgradeRequests = useQuery(api.users.getMyAssignedUpgradeRequests, {
    paginationOpts: { numItems: 50, cursor: null },
  });

  const progressUpdates = useQuery(api.progress_updates.getMyAssignedProgressUpdates, {
    paginationOpts: { numItems: 50, cursor: null },
  });

  const approveRequest = useMutation(api.users.approveRoleUpgradeRequest);
  const rejectRequest = useMutation(api.users.rejectRoleUpgradeRequest);

  const approveProgress = useMutation(api.progress_updates.approveProgressUpdate);
  const rejectProgress = useMutation(api.progress_updates.rejectProgressUpdate);
  const requestRevision = useMutation(api.progress_updates.requestProgressRevision);

  // Process data before conditional returns to maintain hook order
  const allVerifications = myVerifications?.page || [];
  const projects = useMemo(() => ({
    pendingAcceptance: allVerifications.filter(
      (v: any) => v.status === 'assigned'
    ),
    accepted: allVerifications.filter((v: any) => v.status === 'accepted'),
    inProgress: allVerifications.filter((v: any) => v.status === 'in_progress'),
    completed: allVerifications.filter((v: any) =>
      ['completed', 'approved', 'rejected', 'revision_required'].includes(
        v.status
      )
    ),
  }), [allVerifications]);

  const stats = useMemo(() => ({
    totalProjects: verifierStats?.totalVerifications || 0,
    pendingAcceptance: acceptanceStats?.pendingAcceptance || 0,
    acceptanceRate: acceptanceStats?.acceptanceRate || 0,
    inProgress: verifierStats?.inProgressVerifications || 0,
    completedThisMonth: verifierStats?.completedThisMonth || 0,
    averageAcceptanceTime: acceptanceStats?.averageAcceptanceTimeHours || 0,
    overdueVerifications: verifierStats?.overdueVerifications || 0,
    averageScore: verifierStats?.averageScore
      ? verifierStats.averageScore.toFixed(1)
      : 'N/A',
  }), [verifierStats, acceptanceStats]);

  // Analytics Chart Data - all hooks must be called before any conditional returns
  const verificationsOverTimeData = useMemo(() => {
    if (!allVerifications || allVerifications.length === 0) return null;

    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    const completedByMonth: Record<string, number> = {};
    last6Months.forEach(month => completedByMonth[month] = 0);

    allVerifications.forEach((v: any) => {
      if (v.completedAt) {
        const date = new Date(v.completedAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (completedByMonth[monthKey] !== undefined) {
          completedByMonth[monthKey]++;
        }
      }
    });

    return {
      labels: last6Months.map(m => {
        const [year = '2024', month = '1'] = m.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }),
      datasets: [
        {
          label: 'Verifications Completed',
          data: last6Months.map(m => completedByMonth[m]),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
      ],
    };
  }, [allVerifications]);

  const verificationsByStatusData = useMemo(() => {
    if (!allVerifications || allVerifications.length === 0) return null;

    const statusCounts = {
      'Pending': projects.pendingAcceptance.length,
      'Accepted': projects.accepted.length,
      'In Progress': projects.inProgress.length,
      'Completed': projects.completed.length,
    };

    return {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          label: 'Verifications',
          data: Object.values(statusCounts),
          backgroundColor: [
            'rgba(249, 115, 22, 0.8)',
            'rgba(14, 165, 233, 0.8)',
            'rgba(234, 179, 8, 0.8)',
            'rgba(34, 197, 94, 0.8)',
          ],
          borderColor: [
            'rgb(249, 115, 22)',
            'rgb(14, 165, 233)',
            'rgb(234, 179, 8)',
            'rgb(34, 197, 94)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [allVerifications, projects]);

  const qualityScoreTrendData = useMemo(() => {
    if (!allVerifications || allVerifications.length === 0) return null;

    const completedWithScores = allVerifications
      .filter((v: any) => v.completedAt && v.qualityScore)
      .sort((a: any, b: any) => a.completedAt - b.completedAt)
      .slice(-10);

    if (completedWithScores.length === 0) return null;

    return {
      labels: completedWithScores.map((_: any, i: number) => `Project ${i + 1}`),
      datasets: [
        {
          label: 'Quality Score',
          data: completedWithScores.map((v: any) => v.qualityScore),
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          tension: 0.4,
        },
      ],
    };
  }, [allVerifications]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }), []);

  // Handler functions (not hooks, can be after hooks)
  const handleApproveRequest = async (requestId: any, reviewNotes?: string) => {
    try {
      await approveRequest({ requestId, reviewNotes });
      toast.success('Role upgrade request approved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId: any, rejectionReason: string) => {
    try {
      await rejectRequest({ requestId, rejectionReason });
      toast.success('Role upgrade request rejected');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject request');
    }
  };

  // Early returns after all hooks
  if (!permissions || !verifierStats || !acceptanceStats || !myVerifications) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading verification dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!permissions.canViewVerifierDashboard) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to view the verification dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Verification Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalProjects}
                </p>
                <p className="text-sm text-gray-600">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingAcceptance}
                </p>
                <p className="text-sm text-gray-600">Pending Acceptance</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-teal-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.acceptanceRate}%
                </p>
                <p className="text-sm text-gray-600">Acceptance Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.inProgress}
                </p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedThisMonth}
                </p>
                <p className="text-sm text-gray-600">Completed This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageAcceptanceTime}h
                </p>
                <p className="text-sm text-gray-600">Avg Acceptance Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.overdueVerifications}
                </p>
                <p className="text-sm text-gray-600">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageScore}
                </p>
                <p className="text-sm text-gray-600">Avg Quality Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Queue Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as any)}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="pendingAcceptance">
            Pending Acceptance ({projects.pendingAcceptance.length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({projects.accepted.length})
          </TabsTrigger>
          <TabsTrigger value="inProgress">
            In Progress ({projects.inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({projects.completed.length})
          </TabsTrigger>
          <TabsTrigger value="upgradeRequests">
            Role Upgrades ({upgradeRequests?.page?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="progressReviews">
            Progress Reviews ({progressUpdates?.page?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendingAcceptance">
          <div className="space-y-4">
            {projects.pendingAcceptance.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No verifications pending your acceptance.</p>
              </div>
            ) : (
              projects.pendingAcceptance.map((verification: any) => (
                <VerificationCard
                  key={verification._id}
                  verification={verification}
                  type="pendingAcceptance"
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="accepted">
          <div className="space-y-4">
            {projects.accepted.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No accepted verifications yet.</p>
              </div>
            ) : (
              projects.accepted.map((verification: any) => (
                <VerificationCard
                  key={verification._id}
                  verification={verification}
                  type="accepted"
                  onRequestReport={(project) => {
                    setSelectedProject(project);
                    setRequestModalOpen(true);
                  }}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="inProgress">
          <div className="space-y-4">
            {projects.inProgress.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No verifications currently in progress.</p>
              </div>
            ) : (
              projects.inProgress.map((verification: any) => (
                <VerificationCard
                  key={verification._id}
                  verification={verification}
                  type="inProgress"
                  onRequestReport={(project) => {
                    setSelectedProject(project);
                    setRequestModalOpen(true);
                  }}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="space-y-4">
            {projects.completed.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No completed verifications yet.</p>
              </div>
            ) : (
              projects.completed.map((verification: any) => (
                <VerificationCard
                  key={verification._id}
                  verification={verification}
                  type="completed"
                  onRequestReport={(project) => {
                    setSelectedProject(project);
                    setRequestModalOpen(true);
                  }}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="upgradeRequests">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Role Upgrade Requests</h2>
            {!upgradeRequests?.page || upgradeRequests.page.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No role upgrade requests assigned to you.</p>
              </div>
            ) : (
              upgradeRequests.page.map((request: any) => (
                <UpgradeRequestCard
                  key={request._id}
                  request={request}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="progressReviews">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Progress Update Reviews</h2>
            {!progressUpdates?.page || progressUpdates.page.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No progress updates assigned for review.</p>
              </div>
            ) : (
              progressUpdates.page.map((update: any) => (
                <ProgressReviewCard
                  key={update._id}
                  update={update}
                  onApprove={async (updateId, reviewNotes) => {
                    try {
                      await approveProgress({ updateId, reviewNotes });
                      toast.success('Progress update approved successfully!');
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to approve progress update');
                    }
                  }}
                  onReject={async (updateId, rejectionReason) => {
                    try {
                      await rejectProgress({ updateId, rejectionReason });
                      toast.success('Progress update rejected');
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to reject progress update');
                    }
                  }}
                  onRequestRevision={async (updateId, revisionNotes) => {
                    try {
                      await requestRevision({ updateId, revisionNotes });
                      toast.success('Revision requested successfully');
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to request revision');
                    }
                  }}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Verifications Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle>Verifications Over Time</CardTitle>
                  <CardDescription>
                    Track your verification completion trend (Last 6 months)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {verificationsOverTimeData ? (
                      <Line data={verificationsOverTimeData} options={chartOptions} />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-gray-50 rounded">
                        <p className="text-gray-500">
                          No verification data available yet
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Verifications by Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Verifications by Status</CardTitle>
                  <CardDescription>
                    Current distribution of verification status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {verificationsByStatusData ? (
                      <Bar data={verificationsByStatusData} options={chartOptions} />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-gray-50 rounded">
                        <p className="text-gray-500">
                          No status data available yet
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quality Score Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Quality Score Trend</CardTitle>
                  <CardDescription>
                    Quality scores of your last 10 completed verifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {qualityScoreTrendData ? (
                      <Line data={qualityScoreTrendData} options={chartOptions} />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-gray-50 rounded">
                        <p className="text-gray-500">
                          No quality score data available yet
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                  <CardDescription>
                    Your verification performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Total Verifications</span>
                      <span className="text-lg font-bold text-blue-600">{stats.totalProjects}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Completed This Month</span>
                      <span className="text-lg font-bold text-green-600">{stats.completedThisMonth}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Acceptance Rate</span>
                      <span className="text-lg font-bold text-teal-600">{stats.acceptanceRate}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Average Quality Score</span>
                      <span className="text-lg font-bold text-purple-600">{stats.averageScore}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Avg Acceptance Time</span>
                      <span className="text-lg font-bold text-indigo-600">{stats.averageAcceptanceTime}h</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Overdue Verifications</span>
                      <span className="text-lg font-bold text-red-600">{stats.overdueVerifications}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Request Progress Report Modal */}
      {selectedProject && (
        <RequestProgressReportModal
          isOpen={requestModalOpen}
          onClose={() => {
            setRequestModalOpen(false);
            setSelectedProject(null);
          }}
          project={selectedProject}
        />
      )}
    </div>
  );
}

function VerificationCard({
  verification,
  type,
  onRequestReport,
}: {
  verification: any;
  type: 'pendingAcceptance' | 'accepted' | 'inProgress' | 'completed';
  onRequestReport?: (project: any) => void;
}) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'revision_required':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const isOverdue = verification.dueDate && verification.dueDate < Date.now();

  return (
    <div
      className={`border rounded-lg p-4 ${isOverdue && type !== 'completed' ? 'border-red-200 bg-red-50' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">
              Verification #{verification._id.slice(-6)}
            </h3>
            {isOverdue && type !== 'completed' && (
              <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                OVERDUE
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-2">
            <span
              className={`px-2 py-1 rounded text-sm ${getPriorityColor(verification.priority)}`}
            >
              {verification.priority.charAt(0).toUpperCase() +
                verification.priority.slice(1)}{' '}
              Priority
            </span>

            {type === 'completed' && (
              <span
                className={`px-2 py-1 rounded text-sm ${getStatusColor(verification.status)}`}
              >
                {verification.status.replace('_', ' ').charAt(0).toUpperCase() +
                  verification.status.replace('_', ' ').slice(1)}
              </span>
            )}

            <span className="text-sm text-gray-600">
              Assigned: {formatDate(verification.assignedAt)}
            </span>

            {verification.dueDate && (
              <span
                className={`text-sm ${isOverdue && type !== 'completed' ? 'text-red-600 font-medium' : 'text-gray-600'}`}
              >
                Due: {formatDate(verification.dueDate)}
              </span>
            )}

            {type === 'inProgress' && verification.startedAt && (
              <span className="text-sm text-gray-600">
                Started: {formatDate(verification.startedAt)}
              </span>
            )}

            {type === 'completed' && verification.completedAt && (
              <span className="text-sm text-gray-600">
                Completed: {formatDate(verification.completedAt)}
              </span>
            )}
          </div>

          {verification.qualityScore && (
            <div className="mt-2">
              <span className="text-sm text-gray-600">
                Quality Score:{' '}
                <span className="font-medium">
                  {verification.qualityScore}/10
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {type === 'pendingAcceptance' && (
            <>
              <AcceptVerificationButton verification={verification} />
              <Link
                href={`/verification/review/${verification.projectId}`}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400"
              >
                View Details
              </Link>
            </>
          )}

          {type === 'accepted' && (
            <>
              <StartVerificationButton verification={verification} />
              <Link
                href={`/verification/review/${verification.projectId}`}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400"
              >
                View Details
              </Link>
              {onRequestReport && (
                <button
                  onClick={() => onRequestReport({
                    _id: verification.projectId,
                    title: verification.projectTitle || `Project #${verification.projectId.slice(-6)}`,
                    projectType: verification.projectType,
                  })}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                >
                  Request Report
                </button>
              )}
            </>
          )}

          {type === 'inProgress' && (
            <>
              <Link
                href={`/verification/review/${verification.projectId}`}
                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
              >
                Continue Review
              </Link>
              <Link
                href={`/verification/review/${verification.projectId}`}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400"
              >
                View Progress
              </Link>
              {onRequestReport && (
                <button
                  onClick={() => onRequestReport({
                    _id: verification.projectId,
                    title: verification.projectTitle || `Project #${verification.projectId.slice(-6)}`,
                    projectType: verification.projectType,
                  })}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                >
                  Request Report
                </button>
              )}
            </>
          )}

          {type === 'completed' && (
            <>
              <Link
                href={`/verification/review/${verification.projectId}`}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400"
              >
                View Report
              </Link>
              {onRequestReport && (
                <button
                  onClick={() => onRequestReport({
                    _id: verification.projectId,
                    title: verification.projectTitle || `Project #${verification.projectId.slice(-6)}`,
                    projectType: verification.projectType,
                  })}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                >
                  Request Progress Report
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AcceptVerificationButton({ verification }: { verification: any }) {
  const acceptVerification = useMutation(api.verifications.acceptVerification);
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    if (!verification?._id) return;

    setIsAccepting(true);
    try {
      await acceptVerification({ verificationId: verification._id });
      toast.success('Verification accepted successfully');
    } catch (error) {
      toast.error('Failed to accept verification');
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <button
      onClick={handleAccept}
      disabled={isAccepting}
      className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
    >
      {isAccepting ? 'Accepting...' : 'Accept Verification'}
    </button>
  );
}

function StartVerificationButton({ verification }: { verification: any }) {
  const startVerification = useMutation(api.verifications.startVerification);
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    if (!verification?._id) return;

    setIsStarting(true);
    try {
      await startVerification({ verificationId: verification._id });
      toast.success('Verification started successfully');
    } catch (error) {
      toast.error('Failed to start verification');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <button
      onClick={handleStart}
      disabled={isStarting}
      className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
    >
      {isStarting ? 'Starting...' : 'Start Verification'}
    </button>
  );
}

function UpgradeRequestCard({
  request,
  onApprove,
  onReject,
}: {
  request: any;
  onApprove: (requestId: any, reviewNotes?: string) => Promise<void>;
  onReject: (requestId: any, rejectionReason: string) => Promise<void>;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(request._id, reviewNotes || undefined);
      setShowDetails(false);
      setReviewNotes('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setIsProcessing(true);
    try {
      await onReject(request._id, rejectionReason);
      setShowRejectModal(false);
      setShowDetails(false);
      setRejectionReason('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {request.applicationData.firstName} {request.applicationData.lastName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {request.applicationData.email}
          </p>
          {request.applicationData.organizationName && (
            <p className="text-sm text-gray-500 mt-1">
              {request.applicationData.organizationName}
              {request.applicationData.organizationType &&
                ` (${request.applicationData.organizationType})`}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Submitted on {new Date(request.createdAt).toLocaleDateString()} at{' '}
            {new Date(request.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
          {request.status}
        </span>
      </div>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm"
      >
        {showDetails ? 'Hide' : 'Show'} Details →
      </button>

      {showDetails && (
        <div className="mt-4 space-y-4 border-t pt-4">
          <div>
            <p className="font-medium text-gray-900 mb-1">
              Reason for Upgrade:
            </p>
            <p className="text-gray-700 bg-gray-50 p-3 rounded">
              {request.applicationData.reasonForUpgrade}
            </p>
          </div>

          {request.applicationData.experienceDescription && (
            <div>
              <p className="font-medium text-gray-900 mb-1">
                Relevant Experience:
              </p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">
                {request.applicationData.experienceDescription}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Location:</p>
              <p className="text-gray-600">
                {request.applicationData.city}, {request.applicationData.country}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Phone:</p>
              <p className="text-gray-600">
                {request.applicationData.phoneNumber}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Notes (Optional)
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Add any notes about your decision..."
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isProcessing ? 'Processing...' : 'Approve & Upgrade User'}
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isProcessing}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Reject Request
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Reject Upgrade Request</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this request. The applicant
              will receive your explanation.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              rows={4}
              placeholder="Explain why this request is being rejected..."
              required
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressReviewCard({
  update,
  onApprove,
  onReject,
  onRequestRevision,
}: {
  update: any;
  onApprove: (updateId: any, reviewNotes?: string) => Promise<void>;
  onReject: (updateId: any, rejectionReason: string) => Promise<void>;
  onRequestRevision: (updateId: any, revisionNotes: string) => Promise<void>;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(update._id, reviewNotes || undefined);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    setIsProcessing(true);
    try {
      await onReject(update._id, rejectionReason);
      setShowRejectModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNotes.trim()) return;
    setIsProcessing(true);
    try {
      await onRequestRevision(update._id, revisionNotes);
      setShowRevisionModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'bg-blue-100 text-blue-800';
      case 'measurement':
        return 'bg-green-100 text-green-800';
      case 'photo':
        return 'bg-purple-100 text-purple-800';
      case 'issue':
        return 'bg-red-100 text-red-800';
      case 'completion':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{update.title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            Project: <span className="font-medium">{update.project?.title}</span>
          </p>
          <p className="text-sm text-gray-600">
            Creator: {update.creator?.firstName} {update.creator?.lastName}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Submitted {new Date(update.reportingDate).toLocaleDateString()} at{' '}
            {new Date(update.reportingDate).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUpdateTypeColor(update.updateType)}`}>
            {update.updateType}
          </span>
          <span className="text-sm font-semibold text-blue-600">
            {update.progressPercentage}% Complete
          </span>
        </div>
      </div>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
      >
        {showDetails ? 'Hide' : 'Show'} Details →
      </button>

      {showDetails && (
        <div className="mt-4 space-y-4 border-t pt-4">
          <div>
            <p className="font-medium text-gray-900 mb-1">Description:</p>
            <p className="text-gray-700 bg-gray-50 p-3 rounded">{update.description}</p>
          </div>

          {/* Photos */}
          {update.photoUrls && update.photoUrls.length > 0 && (
            <div>
              <p className="font-medium text-gray-900 mb-2">Photos:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {update.photoUrls.map((url: string, index: number) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setExpandedPhoto(url)}
                  >
                    <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          {update.location && (
            <div>
              <p className="font-medium text-gray-900 mb-1">Location:</p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">
                {update.location.name} ({update.location.lat.toFixed(4)}, {update.location.long.toFixed(4)})
              </p>
            </div>
          )}

          {/* Measurement Data */}
          {update.measurementData && (
            <div>
              <p className="font-medium text-gray-900 mb-2">Measurements:</p>
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded">
                {update.measurementData.treesPlanted && (
                  <div>
                    <p className="text-sm text-gray-600">Trees Planted</p>
                    <p className="font-semibold text-gray-900">{update.measurementData.treesPlanted}</p>
                  </div>
                )}
                {update.measurementData.energyGenerated && (
                  <div>
                    <p className="text-sm text-gray-600">Energy Generated (kWh)</p>
                    <p className="font-semibold text-gray-900">{update.measurementData.energyGenerated}</p>
                  </div>
                )}
                {update.measurementData.wasteProcessed && (
                  <div>
                    <p className="text-sm text-gray-600">Waste Processed (kg)</p>
                    <p className="font-semibold text-gray-900">{update.measurementData.wasteProcessed}</p>
                  </div>
                )}
                {update.measurementData.carbonImpactToDate && (
                  <div>
                    <p className="text-sm text-gray-600">Carbon Impact (tons CO₂)</p>
                    <p className="font-semibold text-gray-900">{update.measurementData.carbonImpactToDate}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Challenges */}
          {update.challenges && (
            <div>
              <p className="font-medium text-gray-900 mb-1">Challenges:</p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{update.challenges}</p>
            </div>
          )}

          {/* Next Steps */}
          {update.nextSteps && (
            <div>
              <p className="font-medium text-gray-900 mb-1">Next Steps:</p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{update.nextSteps}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Notes (Optional)
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Add any notes about your review..."
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isProcessing ? 'Processing...' : 'Approve Update'}
            </button>
            <button
              onClick={() => setShowRevisionModal(true)}
              disabled={isProcessing}
              className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Request Revision
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isProcessing}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Reject Update
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Reject Progress Update</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this progress update. The creator will receive your explanation.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              rows={4}
              placeholder="Explain why this update is being rejected..."
              required
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Request Revision</h3>
            <p className="text-gray-600 mb-4">
              Please specify what needs to be revised. The creator will receive your notes.
            </p>
            <textarea
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-4"
              rows={4}
              placeholder="Explain what needs to be revised..."
              required
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRevisionModal(false);
                  setRevisionNotes('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestRevision}
                disabled={isProcessing || !revisionNotes.trim()}
                className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Requesting...' : 'Request Revision'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox */}
      {expandedPhoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setExpandedPhoto(null)}
        >
          <img src={expandedPhoto} alt="Expanded view" className="max-w-full max-h-full object-contain" />
          <button
            onClick={() => setExpandedPhoto(null)}
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
