'use client';

import { api } from '@packages/backend';
import type { Id } from '@packages/backend/convex/_generated/dataModel';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { useMutation, useQuery } from 'convex/react';
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileText,
  Monitor,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { toast } from 'react-hot-toast';

import ProgressSubmissionForm from '@/components/monitoring/ProgressSubmissionForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

export default function CreatorDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch real data from backend
  const currentUser = useQuery(api.users.getCurrentUser, {});
  const userProjects = useQuery(api.projects.getUserProjects, {});
  const transactions = useQuery(
    api.transactions.getUserTransactionsWithProjects,
    currentUser ? { limit: 1000, userId: currentUser._id } : 'skip'
  );
  const progressSummaries = useQuery(
    api.progress_updates.getProgressSummary,
    userProjects && userProjects.length > 0 && userProjects[0]
      ? { projectId: userProjects[0]._id }
      : 'skip'
  );
  const pendingProgressItems = useQuery(
    api.progress_updates.getMyPendingProgressItems,
    {}
  );
  const pendingProgressSubmissions = pendingProgressItems?.submissions || [];
  const pendingProgressRequests = pendingProgressItems?.requests || [];
  const approvedProgressUpdates = useQuery(
    api.progress_updates.getMyApprovedProgressUpdates,
    {}
  );

  // Mutations
  const submitProgressUpdate = useMutation(
    api.progress_updates.submitProgressUpdate
  );
  const deleteProject = useMutation(api.projects.deleteProject);
  const createPDFReport = useMutation(api.pdf_reports.createPDFReportRequest);
  const deletePDFReport = useMutation(api.pdf_reports.deletePDFReport);
  const pdfReports = useQuery(api.pdf_reports.getPDFReports, {
    limit: 10,
  });

  // Calculate dynamic stats from real data
  const creatorStats = useMemo(() => {
    const totalProjects = userProjects?.length || 0;
    const activeProjects =
      userProjects?.filter((p: any) => p.status === 'approved')?.length || 0;
    const completedProjects =
      userProjects?.filter((p: any) => p.status === 'completed')?.length || 0;
    const totalCreditsGenerated =
      userProjects?.reduce(
        (sum: number, p: any) => sum + (p.totalCarbonCredits || 0),
        0
      ) || 0;
    const totalRevenue =
      userProjects?.reduce((sum: number, p: any) => sum + (p.budget || 0), 0) ||
      0;
    const pendingReports =
      (pendingProgressSubmissions?.length || 0) +
      (pendingProgressRequests?.length || 0);

    // Count real upcoming milestones from projects
    const upcomingMilestones =
      userProjects?.reduce((count: number, project: any) => {
        let milestoneCount = 0;
        if (project.milestone1?.date) {
          const milestone1Date = new Date(project.milestone1.date);
          if (milestone1Date > new Date()) milestoneCount++;
        }
        if (project.milestone2?.date) {
          const milestone2Date = new Date(project.milestone2.date);
          if (milestone2Date > new Date()) milestoneCount++;
        }
        return count + milestoneCount;
      }, 0) || 0;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalCreditsGenerated,
      totalRevenue,
      pendingReports,
      upcomingMilestones,
    };
  }, [userProjects, pendingProgressSubmissions, pendingProgressRequests]);

  // Calculate buyer counts from transactions
  const projectBuyerCounts = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return {};
    const counts: Record<string, Set<string>> = {};

    transactions.forEach((transaction: any) => {
      if (transaction?.projectId && transaction?.buyerId) {
        const projectId = transaction.projectId;
        if (!counts[projectId]) {
          counts[projectId] = new Set();
        }
        counts[projectId]!.add(transaction.buyerId);
      }
    });

    return Object.fromEntries(
      Object.entries(counts).map(([id, set]) => [id, set.size])
    );
  }, [transactions]);

  // Use real projects data from backend
  const projects =
    userProjects?.map((project: any) => ({
      ...project,
      id: project._id,
      type: project.projectType,
      progress: project.progressPercentage || 0,
      creditsGenerated: project.totalCarbonCredits || 0,
      creditsTarget: project.totalCarbonCredits || 0,
      revenue: project.budget || 0,
      lastUpdate: project.lastProgressUpdate
        ? new Date(project.lastProgressUpdate).toLocaleDateString()
        : 'No updates',
      nextMilestone: project.milestone1?.name || 'Monthly Report Due',
      milestoneDue: project.milestone1?.date
        ? new Date(project.milestone1.date).toLocaleDateString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      buyers: projectBuyerCounts[project._id] || 0,
      location: project.location?.name || 'Location not specified',
      impact: {
        treesPlanted:
          project.projectType === 'reforestation' ? project.areaSize * 100 : 0,
        co2Sequestered: project.estimatedCO2Reduction || 0,
        energyGenerated: ['solar', 'wind', 'biogas'].includes(
          project.projectType
        )
          ? project.areaSize * 1000
          : 0,
        co2Avoided: project.estimatedCO2Reduction || 0,
        wasteProcessed:
          project.projectType === 'waste_management'
            ? project.areaSize * 50
            : 0,
      },
    })) || [];

  // Generate pending tasks based on active projects and real milestones
  const pendingTasks = useMemo(() => {
    if (!userProjects) return [];

    const tasks: any[] = [];

    userProjects
      .filter((p: any) => p.status === 'approved')
      .forEach((project: any) => {
        // Add milestone tasks
        if (project.milestone1 && project.milestone1.date) {
          const milestoneDate = new Date(project.milestone1.date);
          if (milestoneDate > new Date()) {
            tasks.push({
              id: `milestone1-${project._id}`,
              task: project.milestone1.name,
              project: project.title,
              dueDate: milestoneDate.toLocaleDateString(),
              priority:
                milestoneDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
                  ? 'high'
                  : 'medium',
              type: 'milestone',
            });
          }
        }

        if (project.milestone2 && project.milestone2.date) {
          const milestoneDate = new Date(project.milestone2.date);
          if (milestoneDate > new Date()) {
            tasks.push({
              id: `milestone2-${project._id}`,
              task: project.milestone2.name,
              project: project.title,
              dueDate: milestoneDate.toLocaleDateString(),
              priority:
                milestoneDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
                  ? 'high'
                  : 'medium',
              type: 'milestone',
            });
          }
        }

        // Add monthly report task
        tasks.push({
          id: `report-${project._id}`,
          task: 'Submit Monthly Progress Report',
          project: project.title,
          dueDate: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toLocaleDateString(),
          priority: 'high',
          type: 'report',
        });
      });

    return tasks.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return (
        priorityOrder[a.priority as keyof typeof priorityOrder] -
        priorityOrder[b.priority as keyof typeof priorityOrder]
      );
    });
  }, [userProjects]);

  // Calculate monitoring statistics from real data
  const monitoringStats = useMemo(() => {
    if (!approvedProgressUpdates || !pendingProgressSubmissions) {
      return {
        totalSubmitted: 0,
        approvedCount: 0,
        verificationRate: 0,
        milestonesAchieved: 0,
      };
    }

    const totalSubmitted =
      approvedProgressUpdates.length + pendingProgressSubmissions.length;
    const approvedCount = approvedProgressUpdates.length;
    const verificationRate =
      totalSubmitted > 0
        ? Math.round((approvedCount / totalSubmitted) * 100)
        : 0;
    const milestonesAchieved = approvedProgressUpdates.filter(
      (u: any) => u.updateType === 'milestone' || u.updateType === 'completion'
    ).length;

    return {
      totalSubmitted,
      approvedCount,
      verificationRate,
      milestonesAchieved,
    };
  }, [approvedProgressUpdates, pendingProgressSubmissions]);

  // Generate recent activity from approved progress updates
  const recentActivity = useMemo(() => {
    if (!approvedProgressUpdates) return [];

    return approvedProgressUpdates.slice(0, 5).map((update: any) => ({
      id: update._id,
      action: `Progress report approved`,
      project: update.project?.title || 'Unknown Project',
      timestamp: new Date(
        update.reviewedAt || update.reportingDate
      ).toLocaleDateString(),
      type: 'success',
    }));
  }, [approvedProgressUpdates]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'reforestation':
        return '🌳';
      case 'renewable_energy':
        return '⚡';
      case 'waste_management':
        return '♻️';
      case 'water_conservation':
        return '💧';
      default:
        return '🌍';
    }
  };

  const handleProgressSubmission = async (data: any) => {
    try {
      if (!selectedProject) return;

      await submitProgressUpdate({
        projectId: selectedProject._id,
        updateType: data.updateType,
        title: data.title,
        description: data.description,
        progressPercentage: data.progressPercentage,
        photos: (data.photos || []).map((_photo: File) => ({
          cloudinary_public_id: '', // Would be handled by file upload service
          cloudinary_url: '',
        })),
        location: data.location
          ? {
              lat: data.location?.latitude || 0,
              long: data.location?.longitude || 0,
              name: data.location?.address || 'Unknown location',
            }
          : undefined,
        measurementData: data.measurementData,
        reportingDate: Date.now(),
      });

      setShowProgressModal(false);
      setSelectedProject(null);
      // Show success message - could add toast notification here
    } catch (error) {
      console.error('Error submitting progress:', error);
      // Show error message - could add toast notification here
    }
  };

  const openProgressModal = (project: any) => {
    setSelectedProject(project);
    setShowProgressModal(true);
  };

  // Navigation handlers
  const handleCreateProject = () => {
    router.push('/projects/register');
  };

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/manage?id=${projectId}`);
  };

  const handleEditProject = (projectId: string) => {
    router.push(`/projects/manage?id=${projectId}`);
  };

  // Delete project handler
  const handleDeleteProject = async (
    projectId: Id<'projects'>,
    projectTitle: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete "${projectTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteProject({ projectId });
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  // Generate PDF Report handler
  const handleGeneratePDFReport = async () => {
    if (!currentUser) {
      toast.error('Please sign in to generate reports');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const now = Date.now();
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

      // Prepare chart data for PDF
      const prepareChartData = () => {
        const charts = [];

        // Revenue chart data
        if (revenueChartData && revenueChartData.datasets && revenueChartData.datasets[0]) {
          const revenueDataset = revenueChartData.datasets[0];
          if (revenueDataset.data) {
            charts.push({
              id: 'revenue_chart',
              title: 'Revenue Analytics',
              type: 'line',
              data: revenueChartData.labels.map((label, index) => ({
                label,
                value: revenueDataset.data[index],
                timestamp: new Date().toISOString(),
              })),
            });
          }
        }

        // Credits by type chart data
        if (creditsChartData && creditsChartData.datasets && creditsChartData.datasets[0]) {
          const creditsDataset = creditsChartData.datasets[0];
          if (creditsDataset.data) {
            charts.push({
              id: 'credits_chart',
              title: 'Credits by Project Type',
              type: 'bar',
              data: creditsChartData.labels.map((label, index) => ({
                label,
                value: creditsDataset.data[index],
                timestamp: new Date().toISOString(),
              })),
            });
          }
        }

        return charts;
      };

      // Prepare metrics data
      const prepareMetricsData = () => {
        return [
          {
            id: 'total_projects',
            name: 'Total Projects',
            value: creatorStats.totalProjects,
            unit: 'projects',
            format: 'number',
            category: 'platform',
          },
          {
            id: 'active_projects',
            name: 'Active Projects',
            value: creatorStats.activeProjects,
            unit: 'projects',
            format: 'number',
            category: 'platform',
          },
          {
            id: 'completed_projects',
            name: 'Completed Projects',
            value: creatorStats.completedProjects,
            unit: 'projects',
            format: 'number',
            category: 'platform',
          },
          {
            id: 'total_credits',
            name: 'Total Credits Generated',
            value: creatorStats.totalCreditsGenerated,
            unit: 'credits',
            format: 'number',
            category: 'financial',
          },
          {
            id: 'total_revenue',
            name: 'Total Revenue',
            value: creatorStats.totalRevenue,
            unit: 'USD',
            format: 'currency',
            category: 'financial',
          },
          {
            id: 'trees_planted',
            name: 'Trees Planted',
            value: environmentalImpact.treesPlanted,
            unit: 'trees',
            format: 'number',
            category: 'environmental',
          },
          {
            id: 'co2_reduced',
            name: 'CO₂ Reduced',
            value: environmentalImpact.co2Reduced,
            unit: 'tons',
            format: 'number',
            category: 'environmental',
          },
          {
            id: 'energy_generated',
            name: 'Clean Energy Generated',
            value: environmentalImpact.energyGenerated,
            unit: 'kWh',
            format: 'number',
            category: 'environmental',
          },
        ];
      };

      // Prepare project details
      const prepareProjectsData = () => {
        return projects.map((project) => ({
          id: project.id,
          title: project.title,
          type: project.type,
          status: project.status,
          progress: project.progress,
          revenue: project.revenue,
          creditsGenerated: project.creditsGenerated,
          location: project.location,
          lastUpdate: project.lastUpdate,
          impact: project.impact,
        }));
      };

      await createPDFReport({
        templateType: 'analytics',
        reportType: 'creator_dashboard',
        title: 'Creator Dashboard Analytics Report',
        timeframe: {
          start: thirtyDaysAgo,
          end: now,
          period: 'last_30_days',
        },
        filters: {
          userId: currentUser._id,
          includeCharts: true,
          includeProjects: true,
        },
        analyticsData: {
          metrics: prepareMetricsData(),
          charts: prepareChartData(),
          projects: prepareProjectsData(),
          monitoringStats: {
            totalSubmitted: monitoringStats.totalSubmitted,
            approvedCount: monitoringStats.approvedCount,
            verificationRate: monitoringStats.verificationRate,
            milestonesAchieved: monitoringStats.milestonesAchieved,
          },
        },
      });

      toast.success(
        "PDF report generation started! You will be notified when it's ready."
      );
      setShowPDFModal(false);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast.error(error.message || 'Failed to generate PDF report');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Delete PDF Report handler
  const handleDeletePDFReport = async (
    reportId: Id<'pdf_reports'>,
    reportTitle: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete "${reportTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deletePDFReport({ reportId });
      toast.success('PDF report deleted successfully');
    } catch (error) {
      console.error('Error deleting PDF report:', error);
      toast.error('Failed to delete PDF report');
    }
  };

  // Calculate environmental impact metrics from real data
  const environmentalImpact = useMemo(() => {
    if (!projects || projects.length === 0) {
      return {
        treesPlanted: 0,
        co2Reduced: 0,
        energyGenerated: 0,
      };
    }

    return projects.reduce(
      (acc, project) => ({
        treesPlanted: acc.treesPlanted + (project.impact.treesPlanted || 0),
        co2Reduced: acc.co2Reduced + (project.impact.co2Sequestered || 0),
        energyGenerated:
          acc.energyGenerated + (project.impact.energyGenerated || 0),
      }),
      { treesPlanted: 0, co2Reduced: 0, energyGenerated: 0 }
    );
  }, [projects]);

  // Revenue analytics chart data
  const revenueChartData = useMemo(() => {
    if (!projects || projects.length === 0) return null;

    // Group projects by creation month
    const monthlyRevenue: Record<string, number> = {};
    projects.forEach((project) => {
      const date = new Date(project._creationTime || Date.now());
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue[monthKey] =
        (monthlyRevenue[monthKey] || 0) + project.revenue;
    });

    const sortedMonths = Object.keys(monthlyRevenue).sort();
    const labels = sortedMonths.map((month) => {
      const [year = '2024', monthNum = '1'] = month.split('-');
      return new Date(
        parseInt(year),
        parseInt(monthNum) - 1
      ).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
    });

    return {
      labels,
      datasets: [
        {
          label: 'Revenue ($)',
          data: sortedMonths.map((month) => monthlyRevenue[month]),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  }, [projects]);

  // Credits by project type chart data
  const creditsChartData = useMemo(() => {
    if (!projects || projects.length === 0) return null;

    const creditsByType: Record<string, number> = {};
    projects.forEach((project) => {
      creditsByType[project.type] =
        (creditsByType[project.type] || 0) + project.creditsGenerated;
    });

    const projectTypeLabels: Record<string, string> = {
      reforestation: 'Reforestation',
      solar: 'Solar',
      wind: 'Wind',
      biogas: 'Biogas',
      waste_management: 'Waste Management',
      mangrove_restoration: 'Mangrove Restoration',
    };

    return {
      labels: Object.keys(creditsByType).map(
        (type) => projectTypeLabels[type] || String(type)
      ),
      datasets: [
        {
          label: 'Carbon Credits',
          data: Object.values(creditsByType),
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(14, 165, 233, 0.8)',
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(59, 130, 246)',
            'rgb(168, 85, 247)',
            'rgb(251, 146, 60)',
            'rgb(236, 72, 153)',
            'rgb(14, 165, 233)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [projects]);

  // Chart options
  const chartOptions = {
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
  };

  // Loading states
  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading user data...</div>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'project_creator' && currentUser.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">
            Access denied. This dashboard is for project creators only.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Project Creator Dashboard</h1>
          <p className="text-gray-600">
            Manage your carbon credit projects and track performance
          </p>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={handleCreateProject}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Project
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {creatorStats.totalProjects}
                </p>
                <p className="text-sm text-gray-600">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {creatorStats.activeProjects}
                </p>
                <p className="text-sm text-gray-600">Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {creatorStats.completedProjects}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {creatorStats.totalCreditsGenerated.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Credits Generated</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  ${creatorStats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {creatorStats.pendingReports}
                </p>
                <p className="text-sm text-gray-600">Pending Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {creatorStats.upcomingMilestones}
                </p>
                <p className="text-sm text-gray-600">Upcoming Milestones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="tasks">Tasks & Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Overdue Progress Reports Alert */}
          {pendingProgressRequests.filter((r: any) => r.status === 'overdue')
            .length > 0 && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 p-4 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">
                  Overdue Progress Reports
                </h3>
                <p className="text-sm text-red-800">
                  You have{' '}
                  {
                    pendingProgressRequests.filter(
                      (r: any) => r.status === 'overdue'
                    ).length
                  }{' '}
                  overdue progress reports. Please submit them as soon as
                  possible to keep your projects on track.
                </p>
                <Button
                  size="sm"
                  className="mt-3 bg-red-600 hover:bg-red-700"
                  onClick={() => setActiveTab('tasks')}
                >
                  View Overdue Reports
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Project Status Overview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Project Performance Overview</CardTitle>
                <CardDescription>
                  Progress and performance of your active projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!userProjects ? (
                  <div className="text-center py-8">
                    <div className="text-gray-600">Loading projects...</div>
                  </div>
                ) : projects.filter((p: any) => p.status === 'approved')
                    .length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">
                      <Monitor className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No Active Projects</p>
                      <p className="text-sm">
                        Create your first project to get started!
                      </p>
                    </div>
                    <Button className="mt-4" onClick={handleCreateProject}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {projects
                      .filter((p: any) => p.status === 'approved')
                      .map((project: any) => (
                        <div
                          key={project.id}
                          className="border rounded-lg p-4 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {getProjectTypeIcon(project.type)}
                              </span>
                              <div>
                                <h3 className="font-semibold">
                                  {project.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {project.location}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(project.status)}
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-gray-600">Progress</p>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={project.progress}
                                  className="flex-1"
                                />
                                <span className="text-sm font-medium">
                                  {project.progress}%
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                Credits Generated
                              </p>
                              <p className="text-lg font-semibold">
                                {project.creditsGenerated.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {project.buyers} buyers
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />$
                                {project.revenue.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewProject(project.id)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditProject(project.id)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Update
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity & Pending Tasks */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Progress Submissions</CardTitle>
                  <CardDescription>
                    Progress reports waiting for review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!pendingProgressSubmissions ? (
                    <div className="text-center py-4">
                      <div className="text-gray-600 text-sm">Loading...</div>
                    </div>
                  ) : pendingProgressSubmissions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No pending submissions</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {pendingProgressSubmissions
                          .slice(0, 3)
                          .map((submission: any) => (
                            <div
                              key={submission._id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {submission.title}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {submission.project?.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(
                                    submission.reportingDate
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge
                                className={
                                  submission.status === 'needs_revision'
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }
                              >
                                {submission.status === 'needs_revision'
                                  ? 'Needs Revision'
                                  : 'Pending'}
                              </Badge>
                            </div>
                          ))}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => setActiveTab('tasks')}
                      >
                        View All Submissions
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest approved progress updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!approvedProgressUpdates ? (
                    <div className="text-center py-4">
                      <div className="text-gray-600 text-sm">Loading...</div>
                    </div>
                  ) : approvedProgressUpdates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No activity yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentActivity.slice(0, 5).map((activity: any) => (
                        <div
                          key={activity.id}
                          className="flex items-center gap-3"
                        >
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {activity.action}
                            </p>
                            <p className="text-xs text-gray-600">
                              {activity.project}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">
                            {activity.timestamp}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>My Projects</CardTitle>
                  <CardDescription>
                    Manage and monitor all your carbon credit projects
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {userProjects === undefined ? (
                  <div className="col-span-2 text-center py-8">
                    <div className="text-gray-600">Loading projects...</div>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="col-span-2 text-center py-8">
                    <div className="text-gray-600">
                      No projects found. Create your first project to get
                      started!
                    </div>
                  </div>
                ) : (
                  projects.map((project: any) => (
                    <Card key={project.id} className="border">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">
                              {getProjectTypeIcon(project.type)}
                            </span>
                            <div>
                              <h3 className="font-semibold text-lg">
                                {project.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {project.location}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(project.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Progress</p>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={project.progress}
                                className="flex-1"
                              />
                              <span className="text-sm font-medium">
                                {project.progress}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Revenue</p>
                            <p className="text-lg font-semibold text-green-600">
                              ${project.revenue.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Credits</p>
                            <p className="font-medium">
                              {project.creditsGenerated}/{project.creditsTarget}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Buyers</p>
                            <p className="font-medium">{project.buyers}</p>
                          </div>
                        </div>

                        {project.nextMilestone && (
                          <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm font-medium text-yellow-800">
                              Next Milestone
                            </p>
                            <p className="text-sm text-yellow-600">
                              {project.nextMilestone}
                            </p>
                            {project.milestoneDue && (
                              <p className="text-xs text-yellow-500">
                                Due: {project.milestoneDue}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500">
                            Last updated: {project.lastUpdate}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewProject(project.id)}
                              title="View project details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditProject(project.id)}
                              title="Edit project"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openProgressModal(project)}
                              title="Submit progress update"
                            >
                              <Upload className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleDeleteProject(project.id, project.title)
                              }
                              title="Delete project"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/*<Card>*/}
            {/*  <CardHeader>*/}
            {/*    <CardTitle className="flex items-center gap-2">*/}
            {/*      <Monitor className="h-5 w-5" />*/}
            {/*      Submit Progress Update*/}
            {/*    </CardTitle>*/}
            {/*    <CardDescription>*/}
            {/*      Submit your monthly progress report and tracking data*/}
            {/*    </CardDescription>*/}
            {/*  </CardHeader>*/}
            {/*  <CardContent>*/}
            {/*    <div className="space-y-4">*/}
            {/*      <div className="grid grid-cols-1 gap-4">*/}
            {/*        {userProjects === undefined ? (*/}
            {/*          <div className="text-center py-4">*/}
            {/*            <div className="text-gray-600">Loading projects...</div>*/}
            {/*          </div>*/}
            {/*        ) : projects.filter((p: any) => p.status === 'active')*/}
            {/*            .length === 0 ? (*/}
            {/*          <div className="text-center py-4">*/}
            {/*            <div className="text-gray-600">*/}
            {/*              No active projects to submit updates for.*/}
            {/*            </div>*/}
            {/*          </div>*/}
            {/*        ) : (*/}
            {/*          projects*/}
            {/*            .filter((p: any) => p.status === 'active')*/}
            {/*            .map((project: any) => (*/}
            {/*              <div*/}
            {/*                key={project.id}*/}
            {/*                className="border rounded-lg p-4"*/}
            {/*              >*/}
            {/*                <div className="flex items-center justify-between mb-3">*/}
            {/*                  <div className="flex items-center gap-3">*/}
            {/*                    <span className="text-2xl">*/}
            {/*                      {getProjectTypeIcon(project.type)}*/}
            {/*                    </span>*/}
            {/*                    <div>*/}
            {/*                      <h3 className="font-semibold">*/}
            {/*                        {project.title}*/}
            {/*                      </h3>*/}
            {/*                      <p className="text-sm text-gray-600">*/}
            {/*                        {project.location}*/}
            {/*                      </p>*/}
            {/*                    </div>*/}
            {/*                  </div>*/}
            {/*                  <div className="flex gap-2">*/}
            {/*                    <Button*/}
            {/*                      size="sm"*/}
            {/*                      className="bg-blue-600 hover:bg-blue-700"*/}
            {/*                      onClick={() => openProgressModal(project)}*/}
            {/*                    >*/}
            {/*                      <Upload className="w-4 h-4 mr-1" />*/}
            {/*                      Submit Update*/}
            {/*                    </Button>*/}
            {/*                  </div>*/}
            {/*                </div>*/}
            {/*                <div className="text-sm text-gray-500">*/}
            {/*                  Last update: {project.lastUpdate}*/}
            {/*                </div>*/}
            {/*              </div>*/}
            {/*            ))*/}
            {/*        )}*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*  </CardContent>*/}
            {/*</Card>*/}

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Monitoring Dashboard Overview</CardTitle>
                <CardDescription>
                  Track your progress submission history and compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!approvedProgressUpdates || !pendingProgressSubmissions ? (
                  <div className="text-center py-8">
                    <div className="text-gray-600">
                      Loading monitoring data...
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {monitoringStats.totalSubmitted}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total Reports Submitted
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {monitoringStats.approvedCount}
                        </div>
                        <div className="text-sm text-gray-600">
                          Approved Reports
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {monitoringStats.milestonesAchieved}
                        </div>
                        <div className="text-sm text-gray-600">
                          Milestones Achieved
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {monitoringStats.verificationRate}%
                        </div>
                        <div className="text-sm text-gray-600">
                          Approval Rate
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">
                        Approved Progress Reports
                      </h4>
                      {approvedProgressUpdates.length === 0 ? (
                        <div className="text-center py-8 border rounded-lg">
                          <div className="text-gray-500">
                            No approved progress reports yet. Submit your first
                            progress update!
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {approvedProgressUpdates
                            .slice(0, 5)
                            .map((update: any) => {
                              const getUpdateTypeLabel = (type: string) => {
                                switch (type) {
                                  case 'milestone':
                                    return 'Milestone';
                                  case 'measurement':
                                    return 'Measurement';
                                  case 'photo':
                                    return 'Photo Documentation';
                                  case 'issue':
                                    return 'Issue Report';
                                  case 'completion':
                                    return 'Completion';
                                  default:
                                    return 'Progress Update';
                                }
                              };

                              return (
                                <div
                                  key={update._id}
                                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">
                                      {update.title}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {update.project?.title} •{' '}
                                      {getUpdateTypeLabel(update.updateType)} •{' '}
                                      {new Date(
                                        update.reportingDate
                                      ).toLocaleDateString()}
                                    </p>
                                    {update.reviewNotes && (
                                      <p className="text-xs text-gray-500 mt-1 italic">
                                        Verifier notes: {update.reviewNotes}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="text-right mr-2">
                                      <div className="text-sm font-semibold text-blue-600">
                                        {update.progressPercentage}%
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Progress
                                      </div>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800">
                                      Approved
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          {approvedProgressUpdates.length > 5 && (
                            <div className="text-center py-2">
                              <p className="text-sm text-gray-500">
                                Showing 5 of {approvedProgressUpdates.length}{' '}
                                approved reports
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Monitoring Requirements</CardTitle>
                <CardDescription>
                  Key requirements for project monitoring and tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Monthly Progress Reports
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Submit by the 5th of each month</li>
                      <li>• Include progress percentage updates</li>
                      <li>• Provide photo/video evidence</li>
                      <li>• Report environmental measurements</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">
                      Milestone Tracking
                    </h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Track 25%, 50%, 75%, 100% completion</li>
                      <li>• Document milestone achievements</li>
                      <li>• Report any delays immediately</li>
                      <li>• Maintain timeline compliance</li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">
                      Impact Measurement
                    </h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Trees planted (for reforestation)</li>
                      <li>• Energy generated (for renewable)</li>
                      <li>• CO2 sequestered/avoided</li>
                      <li>• Location data and verification</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">
                      Quality Standards
                    </h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• High-quality photo documentation</li>
                      <li>• Accurate measurement data</li>
                      <li>• Consistent reporting format</li>
                      <li>• Third-party verification support</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/*<Card>*/}
            {/*  <CardHeader>*/}
            {/*    <CardTitle>Pending Tasks</CardTitle>*/}
            {/*    <CardDescription>*/}
            {/*      Tasks that require your immediate attention*/}
            {/*    </CardDescription>*/}
            {/*  </CardHeader>*/}
            {/*  <CardContent>*/}
            {/*    <div className="space-y-4">*/}
            {/*      {pendingTasks.length === 0 ? (*/}
            {/*        <div className="text-center py-8">*/}
            {/*          <div className="text-gray-600">*/}
            {/*            No pending tasks. Great job staying on top of*/}
            {/*            everything!*/}
            {/*          </div>*/}
            {/*        </div>*/}
            {/*      ) : (*/}
            {/*        pendingTasks.map((task: any) => (*/}
            {/*          <div key={task.id} className="border rounded-lg p-4">*/}
            {/*            <div className="flex items-center justify-between mb-3">*/}
            {/*              <div className="flex items-center gap-3">*/}
            {/*                {task.type === 'report' && (*/}
            {/*                  <FileText className="w-5 h-5 text-blue-600" />*/}
            {/*                )}*/}
            {/*                {task.type === 'milestone' && (*/}
            {/*                  <Target className="w-5 h-5 text-purple-600" />*/}
            {/*                )}*/}
            {/*                {task.type === 'verification' && (*/}
            {/*                  <CheckCircle className="w-5 h-5 text-green-600" />*/}
            {/*                )}*/}
            {/*                {task.type === 'documentation' && (*/}
            {/*                  <Upload className="w-5 h-5 text-orange-600" />*/}
            {/*                )}*/}
            {/*                {task.type === 'meeting' && (*/}
            {/*                  <Calendar className="w-5 h-5 text-purple-600" />*/}
            {/*                )}*/}
            {/*                <div>*/}
            {/*                  <h3 className="font-medium">{task.task}</h3>*/}
            {/*                  <p className="text-sm text-gray-600">*/}
            {/*                    {task.project}*/}
            {/*                  </p>*/}
            {/*                </div>*/}
            {/*              </div>*/}
            {/*              {getPriorityBadge(task.priority)}*/}
            {/*            </div>*/}
            {/*            <div className="flex items-center justify-between">*/}
            {/*              <p className="text-sm text-gray-500">*/}
            {/*                Due: {task.dueDate}*/}
            {/*              </p>*/}
            {/*              {task.type === 'report' && (*/}
            {/*                <Button */}
            {/*                  size="sm"*/}
            {/*                  onClick={() => {*/}
            {/*                    const project = userProjects?.find(p => p.title === task.project);*/}
            {/*                    if (project) openProgressModal(project);*/}
            {/*                  }}*/}
            {/*                >*/}
            {/*                  Submit Report*/}
            {/*                </Button>*/}
            {/*              )}*/}
            {/*            </div>*/}
            {/*          </div>*/}
            {/*        ))*/}
            {/*      )}*/}
            {/*    </div>*/}
            {/*  </CardContent>*/}
            {/*</Card>*/}

            {/*<Card>*/}
            {/*  <CardHeader>*/}
            {/*    <CardTitle>Upcoming Reports</CardTitle>*/}
            {/*    <CardDescription>*/}
            {/*      Scheduled reports and deadlines*/}
            {/*    </CardDescription>*/}
            {/*  </CardHeader>*/}
            {/*  <CardContent>*/}
            {/*    <div className="space-y-4">*/}
            {/*      <div className="border rounded-lg p-4">*/}
            {/*        <div className="flex items-center justify-between mb-2">*/}
            {/*          <h3 className="font-medium">Monthly Progress Report</h3>*/}
            {/*          <Badge className="bg-yellow-100 text-yellow-800">*/}
            {/*            Due Soon*/}
            {/*          </Badge>*/}
            {/*        </div>*/}
            {/*        <p className="text-sm text-gray-600">*/}
            {/*          Amazon Rainforest Conservation*/}
            {/*        </p>*/}
            {/*        <p className="text-sm text-gray-500">*/}
            {/*          Due: October 1, 2024*/}
            {/*        </p>*/}
            {/*        <div className="flex gap-2 mt-3">*/}
            {/*          <Button size="sm" variant="outline">*/}
            {/*            <FileText className="w-4 h-4 mr-1" />*/}
            {/*            Submit Report*/}
            {/*          </Button>*/}
            {/*          <Button size="sm" variant="outline">*/}
            {/*            <Download className="w-4 h-4 mr-1" />*/}
            {/*            Template*/}
            {/*          </Button>*/}
            {/*        </div>*/}
            {/*      </div>*/}

            {/*      <div className="border rounded-lg p-4">*/}
            {/*        <div className="flex items-center justify-between mb-2">*/}
            {/*          <h3 className="font-medium">*/}
            {/*            Quarterly Impact Assessment*/}
            {/*          </h3>*/}
            {/*          <Badge className="bg-green-100 text-green-800">*/}
            {/*            On Track*/}
            {/*          </Badge>*/}
            {/*        </div>*/}
            {/*        <p className="text-sm text-gray-600">*/}
            {/*          Solar Farm Initiative*/}
            {/*        </p>*/}
            {/*        <p className="text-sm text-gray-500">*/}
            {/*          Due: October 31, 2024*/}
            {/*        </p>*/}
            {/*        <div className="flex gap-2 mt-3">*/}
            {/*          <Button size="sm" variant="outline">*/}
            {/*            <FileText className="w-4 h-4 mr-1" />*/}
            {/*            Start Report*/}
            {/*          </Button>*/}
            {/*        </div>*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*  </CardContent>*/}
            {/*</Card>*/}

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Pending Progress Items</CardTitle>
                <CardDescription>
                  Report requests and submitted updates awaiting review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!pendingProgressItems ? (
                    <div className="text-center py-8">
                      <div className="text-gray-600">Loading...</div>
                    </div>
                  ) : pendingProgressRequests.length === 0 &&
                    pendingProgressSubmissions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-600">
                        No pending items. All reports are up to date!
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* REPORT REQUESTS (need to submit) */}
                      {pendingProgressRequests.map((request: any) => {
                        const isOverdue = request.status === 'overdue';

                        return (
                          <div
                            key={request._id}
                            className={`border-2 rounded-lg p-4 hover:shadow-md transition-shadow ${
                              isOverdue
                                ? 'border-red-300 bg-red-50'
                                : 'border-yellow-300 bg-yellow-50'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <AlertCircle
                                  className={`w-4 h-4 ${isOverdue ? 'text-red-600' : 'text-yellow-600'}`}
                                />
                                <h3 className="font-medium text-sm">
                                  Progress Report Requested
                                </h3>
                              </div>
                              <Badge
                                className={
                                  isOverdue
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }
                              >
                                {isOverdue ? 'Overdue' : 'Pending'}
                              </Badge>
                            </div>

                            <p className="text-xs text-gray-700 font-medium mb-1">
                              Project: {request.project?.title}
                            </p>
                            <p className="text-xs text-gray-600 mb-2">
                              Due:{' '}
                              {new Date(request.dueDate).toLocaleDateString()}
                            </p>

                            {request.requestNotes && (
                              <div className="mb-3 p-2 bg-white border border-gray-200 rounded text-xs">
                                <p className="font-medium text-gray-900 mb-1">
                                  Request Notes:
                                </p>
                                <p className="text-gray-700">
                                  {request.requestNotes}
                                </p>
                              </div>
                            )}

                            <Button
                              size="sm"
                              className={
                                isOverdue
                                  ? 'bg-red-600 hover:bg-red-700'
                                  : 'bg-yellow-600 hover:bg-yellow-700'
                              }
                              onClick={() => {
                                const project = userProjects?.find(
                                  (p) => p._id === request.projectId
                                );
                                if (project) {
                                  openProgressModal(project);
                                }
                              }}
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              Submit Report
                            </Button>
                          </div>
                        );
                      })}

                      {/* SUBMITTED REPORTS (awaiting review) */}
                      {pendingProgressSubmissions.map((submission: any) => {
                        const getStatusConfig = (status: string) => {
                          switch (status) {
                            case 'pending_review':
                              return {
                                color: 'bg-yellow-100 text-yellow-800',
                                label: 'Pending Review',
                              };
                            case 'needs_revision':
                              return {
                                color: 'bg-orange-100 text-orange-800',
                                label: 'Needs Revision',
                              };
                            case 'approved':
                              return {
                                color: 'bg-green-100 text-green-800',
                                label: 'Approved',
                              };
                            case 'rejected':
                              return {
                                color: 'bg-red-100 text-red-800',
                                label: 'Rejected',
                              };
                            default:
                              return {
                                color: 'bg-gray-100 text-gray-800',
                                label: status,
                              };
                          }
                        };

                        const statusConfig = getStatusConfig(submission.status);

                        return (
                          <div
                            key={submission._id}
                            className="border-2 border-blue-300 bg-blue-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 flex-1 pr-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <h3 className="font-medium text-sm">
                                  {submission.title}
                                </h3>
                              </div>
                              <Badge className={statusConfig.color}>
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                              Project: {submission.project?.title}
                            </p>
                            <p className="text-xs text-gray-500 mb-3">
                              Submitted:{' '}
                              {new Date(
                                submission.reportingDate
                              ).toLocaleDateString()}
                            </p>

                            {submission.status === 'needs_revision' &&
                              submission.reviewNotes && (
                                <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                                  <p className="font-medium text-orange-900 mb-1">
                                    Revision Notes:
                                  </p>
                                  <p className="text-orange-800">
                                    {submission.reviewNotes}
                                  </p>
                                </div>
                              )}

                            {submission.status === 'rejected' &&
                              submission.rejectionReason && (
                                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
                                  <p className="font-medium text-red-900 mb-1">
                                    Rejection Reason:
                                  </p>
                                  <p className="text-red-800">
                                    {submission.rejectionReason}
                                  </p>
                                </div>
                              )}

                            <div className="flex gap-2">
                              {submission.status === 'needs_revision' && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const project = userProjects?.find(
                                      (p) => p._id === submission.projectId
                                    );
                                    if (project) {
                                      // TODO: Open progress modal with existing data for resubmission
                                      toast(
                                        'Resubmission feature coming soon!'
                                      );
                                    }
                                  }}
                                  className="flex-1"
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Resubmit
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          {/* PDF Report Generation Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Export Analytics Report</CardTitle>
                  <CardDescription>
                    Generate a comprehensive PDF report of your dashboard
                    analytics
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowPDFModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isGeneratingPDF}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isGeneratingPDF ? 'Generating...' : 'Generate PDF Report'}
                </Button>
              </div>
            </CardHeader>
            {pdfReports && pdfReports.length > 0 && (
              <CardContent>
                <h3 className="text-sm font-semibold mb-3">Recent Reports</h3>
                <div className="space-y-2">
                  {pdfReports.slice(0, 3).map((report: any) => (
                    <div
                      key={report._id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">{report.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(report.requestedAt).toLocaleDateString()}{' '}
                            •{' '}
                            <span
                              className={
                                report.status === 'completed'
                                  ? 'text-green-600'
                                  : report.status === 'failed'
                                    ? 'text-red-600'
                                    : 'text-yellow-600'
                              }
                            >
                              {report.status}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {report.status === 'completed' && report.fileUrl && (
                          <a
                            href={report.fileUrl}
                            download
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Download
                          </a>
                        )}
                        {report.status === 'processing' && (
                          <span className="text-sm text-gray-500">
                            {report.progress}%
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleDeletePDFReport(report._id, report.title)
                          }
                          title="Delete report"
                          className="h-8 w-8 p-0 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>
                  Track your revenue growth over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {revenueChartData ? (
                    <Line data={revenueChartData} options={chartOptions} />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50 rounded">
                      <p className="text-gray-500">
                        No revenue data available yet
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Credits Generated</CardTitle>
                <CardDescription>
                  Carbon credits generated by project type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {creditsChartData ? (
                    <Bar data={creditsChartData} options={chartOptions} />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50 rounded">
                      <p className="text-gray-500">
                        No credits data available yet
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Performance</CardTitle>
                <CardDescription>
                  Compare progress across all projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map((project: any) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {getProjectTypeIcon(project.type)}
                        </span>
                        <div>
                          <p className="font-medium text-sm">{project.title}</p>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={project.progress}
                              className="w-24 h-2"
                            />
                            <span className="text-xs text-gray-500">
                              {project.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          ${project.revenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {project.creditsGenerated} credits
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Environmental Impact</CardTitle>
                <CardDescription>
                  Your contribution to environmental conservation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {environmentalImpact.treesPlanted.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Trees Planted</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {environmentalImpact.co2Reduced.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Tons CO₂ Reduced</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {environmentalImpact.energyGenerated.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">kWh Clean Energy</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Progress Submission Modal */}
      <Dialog open={showProgressModal} onOpenChange={setShowProgressModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Progress Update</DialogTitle>
            <DialogDescription>
              {selectedProject &&
                `Submit progress update for ${selectedProject.title}`}
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <ProgressSubmissionForm
              projectId={selectedProject._id}
              projectType={selectedProject.projectType || selectedProject.type}
              onSubmit={handleProgressSubmission}
              onCancel={() => setShowProgressModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* PDF Report Generation Modal */}
      <Dialog open={showPDFModal} onOpenChange={setShowPDFModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate PDF Report</DialogTitle>
            <DialogDescription>
              Export your dashboard analytics as a comprehensive PDF report
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Report Contents</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Revenue Analytics (Last 30 days)</li>
                <li>• Carbon Credits Generated</li>
                <li>• Project Performance Metrics</li>
                <li>• Environmental Impact Summary</li>
                <li>• Project Status Overview</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Processing Time</p>
                  <p>
                    Report generation typically takes 1-2 minutes. You'll be
                    notified when it's ready for download.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setShowPDFModal(false)}
                disabled={isGeneratingPDF}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGeneratePDFReport}
                disabled={isGeneratingPDF}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGeneratingPDF ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
