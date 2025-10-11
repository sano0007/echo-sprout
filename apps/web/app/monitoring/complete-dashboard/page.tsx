'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  BarChart3,
  Calendar,
  Users,
  Activity,
  Loader2,
  X,
  Save,
} from 'lucide-react';
import { api } from '@packages/backend/convex/_generated/api';
import WorkingPDFGenerator from '../../../components/monitoring/WorkingPDFGenerator';

// Validation schemas
const progressUpdateSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title too long'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description too long'),
  updateType: z.enum([
    'milestone',
    'measurement',
    'photo',
    'issue',
    'completion',
  ]),
  progressPercentage: z
    .number()
    .min(0, 'Progress cannot be negative')
    .max(100, 'Progress cannot exceed 100%'),
  measurementData: z
    .object({
      carbonImpactToDate: z.number().min(0).optional(),
      treesPlanted: z.number().min(0).optional(),
      energyGenerated: z.number().min(0).optional(),
      wasteProcessed: z.number().min(0).optional(),
    })
    .optional(),
  nextSteps: z.string().max(500, 'Next steps too long').optional(),
  challenges: z.string().max(500, 'Challenges too long').optional(),
});

const alertSchema = z.object({
  projectId: z.string().optional(),
  alertType: z.enum([
    'overdue_warning',
    'milestone_delay',
    'impact_shortfall',
    'quality_concern',
    'verification_required',
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  message: z
    .string()
    .min(5, 'Message must be at least 5 characters')
    .max(200, 'Message too long'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description too long'),
  assignedTo: z.string().optional(),
});

const milestoneSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title too long'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description too long'),
  category: z.enum(['setup', 'progress', 'impact', 'verification']),
  plannedDate: z.date(),
  targetMetrics: z
    .object({
      carbonImpact: z.number().min(0).optional(),
      treesPlanted: z.number().min(0).optional(),
      energyGenerated: z.number().min(0).optional(),
      wasteProcessed: z.number().min(0).optional(),
    })
    .optional(),
});

type ProgressUpdateForm = z.infer<typeof progressUpdateSchema>;
type AlertForm = z.infer<typeof alertSchema>;
type MilestoneForm = z.infer<typeof milestoneSchema>;

export default function CompleteMonitoringDashboard() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Data fetching
  const stats = useQuery(api.monitoring_crud.getMonitoringStats);
  const progressUpdates = useQuery(api.monitoring_crud.getProgressUpdates, {
    searchTerm: searchTerm || undefined,
    limit: 50,
  });
  const alerts = useQuery(api.monitoring_crud.getAlerts, {
    isResolved:
      filterStatus === 'resolved'
        ? true
        : filterStatus === 'unresolved'
          ? false
          : undefined,
    searchTerm: searchTerm || undefined,
  });
  const milestones = useQuery(api.monitoring_crud.getMilestones, {});

  // Mutations
  const createProgressUpdate = useMutation(
    api.monitoring_crud.createProgressUpdate
  );
  const updateProgressUpdate = useMutation(
    api.monitoring_crud.updateProgressUpdate
  );
  const deleteProgressUpdate = useMutation(
    api.monitoring_crud.deleteProgressUpdate
  );

  const createAlert = useMutation(api.monitoring_crud.createAlert);
  const resolveAlert = useMutation(api.monitoring_crud.resolveAlert);
  const deleteAlert = useMutation(api.monitoring_crud.deleteAlert);

  const createMilestone = useMutation(api.monitoring_crud.createMilestone);
  const updateMilestone = useMutation(api.monitoring_crud.updateMilestone);
  const deleteMilestone = useMutation(api.monitoring_crud.deleteMilestone);

  // Forms
  const progressForm = useForm<ProgressUpdateForm>({
    resolver: zodResolver(progressUpdateSchema),
    defaultValues: {
      projectId: '',
      title: '',
      description: '',
      updateType: 'measurement',
      progressPercentage: 0,
      measurementData: {},
      nextSteps: '',
      challenges: '',
    },
  });

  const alertForm = useForm<AlertForm>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      alertType: 'overdue_warning',
      severity: 'medium',
      message: '',
      description: '',
    },
  });

  const milestoneForm = useForm<MilestoneForm>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      projectId: '',
      title: '',
      description: '',
      category: 'progress',
      plannedDate: new Date(),
      targetMetrics: {},
    },
  });

  // Event handlers
  const handleCreateProgressUpdate = async (data: ProgressUpdateForm) => {
    try {
      await createProgressUpdate({
        ...data,
        projectId: data.projectId as any, // Cast string to Id<"projects">
        measurementData: data.measurementData || {},
      });
      progressForm.reset();
      setShowModal('');
      setEditingItem(null);
    } catch (error) {
      console.error('Error creating progress update:', error);
    }
  };

  const handleCreateAlert = async (data: AlertForm) => {
    try {
      await createAlert({
        ...data,
        projectId: data.projectId ? (data.projectId as any) : undefined, // Cast string to Id<"projects">
        assignedTo: data.assignedTo ? (data.assignedTo as any) : undefined, // Cast string to Id<"users">
      });
      alertForm.reset();
      setShowModal('');
      setEditingItem(null);
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };

  const handleCreateMilestone = async (data: MilestoneForm) => {
    try {
      // Map form category to milestoneType enum values
      const milestoneTypeMap: Record<string, any> = {
        setup: 'setup',
        progress: 'progress_25', // Default to progress_25 for generic progress
        impact: 'impact_first',
        verification: 'verification',
      };

      await createMilestone({
        projectId: data.projectId as any, // Cast string to Id<"projects">
        title: data.title,
        description: data.description,
        milestoneType: milestoneTypeMap[data.category] || 'progress_25',
        plannedDate: data.plannedDate.getTime(),
        order: 0, // Default order
        isRequired: true, // Default to required
      });
      milestoneForm.reset();
      setShowModal('');
      setEditingItem(null);
    } catch (error) {
      console.error('Error creating milestone:', error);
    }
  };

  const resetModal = () => {
    setShowModal('');
    setEditingItem(null);
    progressForm.reset();
    alertForm.reset();
    milestoneForm.reset();
  };

  // Overview Statistics Component
  const OverviewStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Projects</p>
            <p className="text-3xl font-bold text-blue-600">
              {stats?.projects.active || 0}
            </p>
          </div>
          <Activity className="h-10 w-10 text-blue-500" />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {stats?.projects.total || 0} total projects
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Progress Updates
            </p>
            <p className="text-3xl font-bold text-green-600">
              {stats?.progressUpdates.thisMonth || 0}
            </p>
          </div>
          <TrendingUp className="h-10 w-10 text-green-500" />
        </div>
        <p className="text-xs text-gray-500 mt-2">This month</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Alerts</p>
            <p className="text-3xl font-bold text-red-600">
              {stats?.alerts.unresolved || 0}
            </p>
          </div>
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {stats?.alerts.critical || 0} critical
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Milestones</p>
            <p className="text-3xl font-bold text-purple-600">
              {stats?.milestones.completed || 0}
            </p>
          </div>
          <CheckCircle className="h-10 w-10 text-purple-500" />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {stats?.milestones.overdue || 0} overdue
        </p>
      </div>
    </div>
  );

  // Progress Updates Tab
  const ProgressUpdatesTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Progress Updates
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal('progress')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Update
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {progressUpdates?.map((update: any) => (
          <div
            key={update._id}
            className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-lg mb-2">
                  {update.title}
                </h4>
                <p className="text-gray-600 mb-3">{update.description}</p>
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      update.updateType === 'milestone'
                        ? 'bg-blue-100 text-blue-800'
                        : update.updateType === 'measurement'
                          ? 'bg-green-100 text-green-800'
                          : update.updateType === 'issue'
                            ? 'bg-red-100 text-red-800'
                            : update.updateType === 'completion'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {update.updateType.charAt(0).toUpperCase() +
                      update.updateType.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(update.reportingDate).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progress:
                    </span>
                    <div className="bg-gray-200 rounded-full h-2 w-24">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${update.progressPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-blue-600">
                      {update.progressPercentage}%
                    </span>
                  </div>
                </div>

                {update.measurementData &&
                  Object.keys(update.measurementData).length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                        Measurement Data
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(update.measurementData).map(
                          ([key, value]: [string, any]) => (
                            <div key={key} className="text-center">
                              <p className="text-xs text-gray-600 capitalize mb-1">
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                              </p>
                              <p className="font-semibold text-gray-900">
                                {value}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {(update.nextSteps || update.challenges) && (
                  <div className="space-y-2">
                    {update.nextSteps && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Next Steps:{' '}
                        </span>
                        <span className="text-sm text-gray-600">
                          {update.nextSteps}
                        </span>
                      </div>
                    )}
                    {update.challenges && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Challenges:{' '}
                        </span>
                        <span className="text-sm text-gray-600">
                          {update.challenges}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => {
                    setEditingItem(update);
                    progressForm.reset({
                      ...update,
                      plannedDate: update.plannedDate
                        ? new Date(update.plannedDate)
                        : new Date(),
                    });
                    setShowModal('progress');
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteProgressUpdate({ updateId: update._id })}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {(!progressUpdates || progressUpdates.length === 0) && (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No progress updates found</p>
            <p className="text-sm text-gray-400">
              Create your first progress update to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Alerts Tab
  const AlertsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h3 className="text-xl font-semibold text-gray-900">System Alerts</h3>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Alerts</option>
            <option value="unresolved">Unresolved</option>
            <option value="resolved">Resolved</option>
          </select>
          <button
            onClick={() => setShowModal('alert')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Alert
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {alerts?.map((alert: any) => (
          <div
            key={alert._id}
            className={`border-l-4 p-6 rounded-lg bg-white hover:shadow-md transition-shadow ${
              alert.severity === 'critical'
                ? 'border-red-500 bg-red-50'
                : alert.severity === 'high'
                  ? 'border-orange-500 bg-orange-50'
                  : alert.severity === 'medium'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-blue-500 bg-blue-50'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      alert.severity === 'critical'
                        ? 'bg-red-100 text-red-800'
                        : alert.severity === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : alert.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {alert.severity.toUpperCase()}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      alert.isResolved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {alert.isResolved ? 'Resolved' : 'Active'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {alert.alertType.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 text-lg mb-2">
                  {alert.message}
                </h4>
                <p className="text-gray-600 mb-3">{alert.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    Created:{' '}
                    {new Date(alert._creationTime).toLocaleDateString()}
                  </span>
                  {alert.resolvedAt && (
                    <span>
                      Resolved:{' '}
                      {new Date(alert.resolvedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                {!alert.isResolved && (
                  <button
                    onClick={() =>
                      resolveAlert({
                        alertId: alert._id,
                        resolutionNotes: 'Resolved via dashboard',
                      })
                    }
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4 inline mr-1" />
                    Resolve
                  </button>
                )}
                <button
                  onClick={() => deleteAlert({ alertId: alert._id })}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {(!alerts || alerts.length === 0) && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No alerts found</p>
            <p className="text-sm text-gray-400">System is running smoothly</p>
          </div>
        )}
      </div>
    </div>
  );

  // Milestones Tab
  const MilestonesTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Project Milestones
        </h3>
        <button
          onClick={() => setShowModal('milestone')}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Milestone
        </button>
      </div>

      <div className="grid gap-4">
        {milestones?.map((milestone: any) => (
          <div
            key={milestone._id}
            className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-lg mb-2">
                  {milestone.title}
                </h4>
                <p className="text-gray-600 mb-3">{milestone.description}</p>
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      milestone.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : milestone.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : milestone.status === 'delayed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {milestone.status?.replace('_', ' ').toUpperCase() ||
                      'PENDING'}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      milestone.category === 'setup'
                        ? 'bg-purple-100 text-purple-800'
                        : milestone.category === 'progress'
                          ? 'bg-blue-100 text-blue-800'
                          : milestone.category === 'impact'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {milestone.category?.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">
                    Due: {new Date(milestone.plannedDate).toLocaleDateString()}
                  </span>
                  {milestone.actualDate && (
                    <span className="text-sm text-gray-500">
                      Completed:{' '}
                      {new Date(milestone.actualDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {milestone.targetMetrics &&
                  Object.keys(milestone.targetMetrics).length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                        Target Metrics
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(milestone.targetMetrics).map(
                          ([key, value]: [string, any]) => (
                            <div key={key} className="text-center">
                              <p className="text-xs text-gray-600 capitalize mb-1">
                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                              </p>
                              <p className="font-semibold text-gray-900">
                                {value}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => {
                    setEditingItem(milestone);
                    milestoneForm.reset({
                      ...milestone,
                      plannedDate: new Date(milestone.plannedDate),
                    });
                    setShowModal('milestone');
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    deleteMilestone({ milestoneId: milestone._id })
                  }
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {(!milestones || milestones.length === 0) && (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No milestones found</p>
            <p className="text-sm text-gray-400">
              Create your first milestone to track progress
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Complete Monitoring Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive monitoring system with CRUD operations, validation,
            and PDF reporting
          </p>
        </div>

        {/* Overview Statistics */}
        <OverviewStats />

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search monitoring data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4" />
              Advanced Filters
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b">
            <nav className="flex">
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                {
                  key: 'progress',
                  label: 'Progress Updates',
                  icon: TrendingUp,
                },
                { key: 'alerts', label: 'Alerts', icon: AlertCircle },
                { key: 'milestones', label: 'Milestones', icon: CheckCircle },
                { key: 'reports', label: 'PDF Reports', icon: FileText },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === key
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && <OverviewStats />}
            {activeTab === 'progress' && <ProgressUpdatesTab />}
            {activeTab === 'alerts' && <AlertsTab />}
            {activeTab === 'milestones' && <MilestonesTab />}
            {activeTab === 'reports' && <WorkingPDFGenerator />}
          </div>
        </div>

        {/* Modal Forms */}
        {showModal === 'progress' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {editingItem
                    ? 'Edit Progress Update'
                    : 'Create Progress Update'}
                </h3>
                <button
                  onClick={resetModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form
                onSubmit={progressForm.handleSubmit(handleCreateProgressUpdate)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project ID *
                    </label>
                    <input
                      {...progressForm.register('projectId')}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter project ID"
                    />
                    {progressForm.formState.errors.projectId && (
                      <p className="text-red-500 text-xs mt-1">
                        {progressForm.formState.errors.projectId.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Update Type *
                    </label>
                    <select
                      {...progressForm.register('updateType')}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="milestone">Milestone</option>
                      <option value="measurement">Measurement</option>
                      <option value="photo">Photo</option>
                      <option value="issue">Issue</option>
                      <option value="completion">Completion</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    {...progressForm.register('title')}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter update title"
                  />
                  {progressForm.formState.errors.title && (
                    <p className="text-red-500 text-xs mt-1">
                      {progressForm.formState.errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    {...progressForm.register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter detailed description"
                  />
                  {progressForm.formState.errors.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {progressForm.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Progress Percentage *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    {...progressForm.register('progressPercentage', {
                      valueAsNumber: true,
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0-100"
                  />
                  {progressForm.formState.errors.progressPercentage && (
                    <p className="text-red-500 text-xs mt-1">
                      {progressForm.formState.errors.progressPercentage.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Next Steps
                    </label>
                    <textarea
                      {...progressForm.register('nextSteps')}
                      rows={2}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe next steps"
                    />
                    {progressForm.formState.errors.nextSteps && (
                      <p className="text-red-500 text-xs mt-1">
                        {progressForm.formState.errors.nextSteps.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Challenges
                    </label>
                    <textarea
                      {...progressForm.register('challenges')}
                      rows={2}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe any challenges"
                    />
                    {progressForm.formState.errors.challenges && (
                      <p className="text-red-500 text-xs mt-1">
                        {progressForm.formState.errors.challenges.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={progressForm.formState.isSubmitting}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {progressForm.formState.isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={resetModal}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Similar modal forms for alerts and milestones would go here... */}
      </div>
    </div>
  );
}
