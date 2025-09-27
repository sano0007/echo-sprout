'use client';

import {
  ArrowDown,
  ArrowUp,
  Calendar,
  MessageCircle,
  CheckCircle,
  Clock,
  Download,
  FileText,
  AlertTriangle,
  Eye,
  Filter,
  Search,
  Play,
  User,
  XCircle,
} from 'lucide-react';
import React, { useEffect,useState } from 'react';

interface VerificationTask {
  id: string;
  projectId: string;
  projectName: string;
  creatorName: string;
  submissionType:
    | 'milestone'
    | 'completion'
    | 'progress_update'
    | 'documentation';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status:
    | 'pending'
    | 'in_review'
    | 'requires_action'
    | 'completed'
    | 'rejected';
  submittedAt: string;
  dueDate: string;
  assignedTo?: string;
  description: string;
  documentsCount: number;
  estimatedHours: number;
  category: string;
  region: string;
  completionPercentage?: number;
}

interface VerificationQueueProps {
  tasks?: VerificationTask[];
  currentVerifierId?: string;
  onTaskSelect?: (task: VerificationTask) => void;
  onAssignTask?: (taskId: string, verifierId: string) => void;
  onUpdateStatus?: (taskId: string, status: string, notes?: string) => void;
}

const VerificationQueue: React.FC<VerificationQueueProps> = ({
  tasks = [],
  currentVerifierId,
  onTaskSelect,
  onAssignTask,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  // Mock data for demonstration
  const mockTasks: VerificationTask[] = [
    {
      id: '1',
      projectId: 'proj-1',
      projectName: 'Urban Reforestation Initiative',
      creatorName: 'EcoGreen Solutions',
      submissionType: 'milestone',
      priority: 'high',
      status: 'pending',
      submittedAt: '2024-01-15T10:30:00Z',
      dueDate: '2024-01-20T23:59:59Z',
      description: 'Q1 milestone verification - 500 trees planted',
      documentsCount: 8,
      estimatedHours: 4,
      category: 'Reforestation',
      region: 'North America',
      completionPercentage: 75,
    },
    {
      id: '2',
      projectId: 'proj-2',
      projectName: 'Solar Farm Development',
      creatorName: 'SolarTech Corp',
      submissionType: 'completion',
      priority: 'urgent',
      status: 'in_review',
      submittedAt: '2024-01-14T14:20:00Z',
      dueDate: '2024-01-18T23:59:59Z',
      assignedTo: currentVerifierId,
      description: 'Project completion verification - 50MW solar installation',
      documentsCount: 15,
      estimatedHours: 8,
      category: 'Renewable Energy',
      region: 'Europe',
      completionPercentage: 100,
    },
    {
      id: '3',
      projectId: 'proj-3',
      projectName: 'Ocean Cleanup Project',
      creatorName: 'Marine Conservation Ltd',
      submissionType: 'progress_update',
      priority: 'medium',
      status: 'requires_action',
      submittedAt: '2024-01-12T09:15:00Z',
      dueDate: '2024-01-25T23:59:59Z',
      description: 'Monthly progress update - plastic removal metrics',
      documentsCount: 5,
      estimatedHours: 2,
      category: 'Ocean Cleanup',
      region: 'Asia Pacific',
      completionPercentage: 45,
    },
  ];

  const displayTasks = tasks.length > 0 ? tasks : mockTasks;

  const filteredTasks = displayTasks.filter((task) => {
    const matchesSearch =
      task.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority =
      filterPriority === 'all' || task.priority === filterPriority;
    const matchesType =
      filterType === 'all' || task.submissionType === filterType;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let aValue: any = a[sortBy as keyof VerificationTask];
    let bValue: any = b[sortBy as keyof VerificationTask];

    if (sortBy === 'dueDate' || sortBy === 'submittedAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-blue-600 bg-blue-50';
      case 'in_review':
        return 'text-purple-600 bg-purple-50';
      case 'requires_action':
        return 'text-orange-600 bg-orange-50';
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return CheckCircle;
      case 'completion':
        return FileText;
      case 'progress_update':
        return Clock;
      case 'documentation':
        return Download;
      default:
        return FileText;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleTaskSelect = (task: VerificationTask) => {
    if (onTaskSelect) {
      onTaskSelect(task);
    }
  };

  const handleAssignToMe = (taskId: string) => {
    if (onAssignTask && currentVerifierId) {
      onAssignTask(taskId, currentVerifierId);
    }
  };

  const handleStatusUpdate = (taskId: string, newStatus: string) => {
    if (onUpdateStatus) {
      onUpdateStatus(taskId, newStatus);
    }
  };

  const renderKanbanView = () => {
    const statusColumns = [
      { key: 'pending', title: 'Pending Review', color: 'border-blue-200' },
      { key: 'in_review', title: 'In Review', color: 'border-purple-200' },
      {
        key: 'requires_action',
        title: 'Requires Action',
        color: 'border-orange-200',
      },
      { key: 'completed', title: 'Completed', color: 'border-green-200' },
    ];

    return (
      <div className="flex gap-6 overflow-x-auto pb-4">
        {statusColumns.map((column) => {
          const columnTasks = sortedTasks.filter(
            (task) => task.status === column.key
          );
          return (
            <div
              key={column.key}
              className={`flex-shrink-0 w-80 border-t-4 ${column.color} bg-gray-50 rounded-lg`}
            >
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">{column.title}</h3>
                <span className="text-sm text-gray-500">
                  {columnTasks.length} tasks
                </span>
              </div>
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {columnTasks.map((task) => {
                  const TypeIcon = getTypeIcon(task.submissionType);
                  return (
                    <div
                      key={task.id}
                      className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleTaskSelect(task)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-gray-500" />
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm text-gray-900 mb-1">
                        {task.projectName}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        {task.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{task.creatorName}</span>
                        <span>{task.estimatedHours}h</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Verification Queue
          </h2>
          <p className="text-gray-600">
            Manage and review project verification tasks
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {viewMode === 'list' ? 'Kanban View' : 'List View'}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {displayTasks.filter((t) => t.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">In Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {displayTasks.filter((t) => t.status === 'in_review').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Urgent</p>
              <p className="text-2xl font-bold text-gray-900">
                {displayTasks.filter((t) => t.priority === 'urgent').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">My Tasks</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  displayTasks.filter((t) => t.assignedTo === currentVerifierId)
                    .length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks, projects, or creators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="requires_action">Requires Action</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="milestone">Milestone</option>
              <option value="completion">Completion</option>
              <option value="progress_update">Progress Update</option>
              <option value="documentation">Documentation</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="dueDate">Due Date</option>
              <option value="submittedAt">Submitted Date</option>
              <option value="priority">Priority</option>
              <option value="projectName">Project Name</option>
            </select>
          </div>
        )}
      </div>

      {/* Task Display */}
      {viewMode === 'kanban' ? (
        renderKanbanView()
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() =>
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      }
                      className="flex items-center gap-1 hover:text-gray-700"
                    >
                      Project
                      {sortOrder === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTasks.map((task) => {
                  const TypeIcon = getTypeIcon(task.submissionType);
                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleTaskSelect(task)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {task.projectName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {task.creatorName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-900 capitalize">
                            {task.submissionType.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(task.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {task.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-900">
                              {task.assignedTo === currentVerifierId
                                ? 'Me'
                                : 'Assigned'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {!task.assignedTo && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignToMe(task.id);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTaskSelect(task);
                            }}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <MessageCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sortedTasks.length === 0 && (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No verification tasks
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No tasks match your current filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default VerificationQueue;
