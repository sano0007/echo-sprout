'use client';

import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Edit,
  Eye,
  Filter,
  Grid3X3,
  List,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  Trash,
  User,
} from 'lucide-react';
import { useState } from 'react';

interface ProjectData {
  id: string;
  title: string;
  type:
    | 'reforestation'
    | 'renewable_energy'
    | 'waste_management'
    | 'water_conservation'
    | 'biodiversity';
  status:
    | 'draft'
    | 'submitted'
    | 'under_review'
    | 'approved'
    | 'rejected'
    | 'active'
    | 'completed'
    | 'suspended';
  creator: {
    id: string;
    name: string;
    organization?: string;
    avatar?: string;
  };
  location: {
    country: string;
    region: string;
  };
  timeline: {
    startDate: string;
    endDate: string;
    progress: number;
  };
  financials: {
    totalCredits: number;
    availableCredits: number;
    pricePerCredit: number;
    totalRaised: number;
  };
  verification: {
    status: 'pending' | 'verified' | 'rejected';
    lastVerified?: string;
    verifier?: string;
  };
  compliance: {
    progressReports: number;
    overdueReports: number;
    lastReportDate?: string;
  };
  alerts: {
    count: number;
    highPriority: number;
  };
  createdAt: string;
  lastActivity: string;
}

interface ProjectManagementProps {
  projects?: ProjectData[];
  onViewProject?: (projectId: string) => void;
  onEditProject?: (projectId: string) => void;
  onDeleteProject?: (projectId: string) => void;
  onApproveProject?: (projectId: string) => void;
  onRejectProject?: (projectId: string, reason: string) => void;
  onSuspendProject?: (projectId: string, reason: string) => void;
  onBulkAction?: (projectIds: string[], action: string) => void;
  onExportData?: (filters: any) => void;
}

export default function ProjectManagement({
  projects,
  onViewProject,
  onEditProject,
  onDeleteProject,
  onApproveProject,
  onRejectProject,
  onSuspendProject,
  onBulkAction,
  onExportData,
}: ProjectManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    'name' | 'created' | 'activity' | 'progress' | 'credits'
  >('activity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Mock projects data if not provided
  const mockProjects: ProjectData[] =
    projects && projects.length > 0
      ? projects
      : [
          {
            id: '1',
            title: 'Amazon Rainforest Reforestation Initiative',
            type: 'reforestation',
            status: 'active',
            creator: {
              id: 'c1',
              name: 'GreenWorld Foundation',
              organization: 'Environmental NGO',
              avatar: '/avatars/greenworld.jpg',
            },
            location: {
              country: 'Brazil',
              region: 'Amazon Basin',
            },
            timeline: {
              startDate: '2024-01-15',
              endDate: '2026-01-15',
              progress: 65,
            },
            financials: {
              totalCredits: 50000,
              availableCredits: 35000,
              pricePerCredit: 25,
              totalRaised: 375000,
            },
            verification: {
              status: 'verified',
              lastVerified: '2024-11-01',
              verifier: 'EcoVerify Inc.',
            },
            compliance: {
              progressReports: 10,
              overdueReports: 0,
              lastReportDate: '2024-11-01',
            },
            alerts: {
              count: 1,
              highPriority: 0,
            },
            createdAt: '2024-01-01',
            lastActivity: '2024-11-20',
          },
          {
            id: '2',
            title: 'Community Solar Power Project',
            type: 'renewable_energy',
            status: 'under_review',
            creator: {
              id: 'c2',
              name: 'SolarTech Solutions',
              organization: 'Technology Company',
            },
            location: {
              country: 'India',
              region: 'Rajasthan',
            },
            timeline: {
              startDate: '2024-03-01',
              endDate: '2025-03-01',
              progress: 0,
            },
            financials: {
              totalCredits: 30000,
              availableCredits: 30000,
              pricePerCredit: 30,
              totalRaised: 0,
            },
            verification: {
              status: 'pending',
            },
            compliance: {
              progressReports: 0,
              overdueReports: 0,
            },
            alerts: {
              count: 2,
              highPriority: 1,
            },
            createdAt: '2024-02-15',
            lastActivity: '2024-11-18',
          },
          {
            id: '3',
            title: 'Ocean Cleanup & Plastic Recycling',
            type: 'waste_management',
            status: 'completed',
            creator: {
              id: 'c3',
              name: 'Ocean Guardians',
              organization: 'Marine Conservation',
            },
            location: {
              country: 'Philippines',
              region: 'Manila Bay',
            },
            timeline: {
              startDate: '2023-06-01',
              endDate: '2024-06-01',
              progress: 100,
            },
            financials: {
              totalCredits: 15000,
              availableCredits: 0,
              pricePerCredit: 40,
              totalRaised: 600000,
            },
            verification: {
              status: 'verified',
              lastVerified: '2024-06-15',
              verifier: 'Marine Verify',
            },
            compliance: {
              progressReports: 12,
              overdueReports: 0,
              lastReportDate: '2024-06-01',
            },
            alerts: {
              count: 0,
              highPriority: 0,
            },
            createdAt: '2023-05-01',
            lastActivity: '2024-06-15',
          },
        ];

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.creator.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === 'all' || project.status === selectedStatus;
    const matchesType = selectedType === 'all' || project.type === selectedType;
    const matchesRegion =
      selectedRegion === 'all' || project.location.country === selectedRegion;

    return matchesSearch && matchesStatus && matchesType && matchesRegion;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'created':
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'activity':
        comparison =
          new Date(a.lastActivity).getTime() -
          new Date(b.lastActivity).getTime();
        break;
      case 'progress':
        comparison = a.timeline.progress - b.timeline.progress;
        break;
      case 'credits':
        comparison = a.financials.totalCredits - b.financials.totalCredits;
        break;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'under_review':
        return 'text-yellow-600 bg-yellow-100';
      case 'suspended':
        return 'text-red-600 bg-red-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'approved':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reforestation':
        return '🌳';
      case 'renewable_energy':
        return '⚡';
      case 'waste_management':
        return '♻️';
      case 'water_conservation':
        return '💧';
      case 'biodiversity':
        return '🦋';
      default:
        return '🌱';
    }
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProjects.length === sortedProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(sortedProjects.map((p) => p.id));
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedProjects.length > 0) {
      onBulkAction?.(selectedProjects, action);
      setSelectedProjects([]);
    }
  };

  const uniqueRegions = [
    ...new Set(mockProjects.map((p) => p.location.country)),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Project Management
            </h2>
            <p className="text-gray-600 mt-1">
              Oversee and manage all platform projects
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onExportData?.({})}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              <span>Add Project</span>
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-700">
              {mockProjects.length}
            </div>
            <div className="text-xs text-blue-600">Total Projects</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-700">
              {mockProjects.filter((p) => p.status === 'active').length}
            </div>
            <div className="text-xs text-green-600">Active</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-xl font-bold text-yellow-700">
              {mockProjects.filter((p) => p.status === 'under_review').length}
            </div>
            <div className="text-xs text-yellow-600">Under Review</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-xl font-bold text-purple-700">
              {mockProjects.filter((p) => p.status === 'completed').length}
            </div>
            <div className="text-xs text-purple-600">Completed</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-xl font-bold text-red-700">
              {mockProjects.reduce((sum, p) => sum + p.alerts.highPriority, 0)}
            </div>
            <div className="text-xs text-red-600">High Priority Alerts</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl font-bold text-gray-700">
              {mockProjects.reduce(
                (sum, p) => sum + p.compliance.overdueReports,
                0
              )}
            </div>
            <div className="text-xs text-gray-600">Overdue Reports</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center justify-between mt-6 gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 border rounded-lg ${
                showFilters
                  ? 'bg-blue-50 border-blue-300'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="activity">Last Activity</option>
                <option value="name">Name</option>
                <option value="created">Created Date</option>
                <option value="progress">Progress</option>
                <option value="credits">Credits</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }
                className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            <div className="flex items-center space-x-1 border border-gray-300 rounded">
              <button
                onClick={() => setViewMode('list')}
                className={`px-2 py-1 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 py-1 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="reforestation">Reforestation</option>
                <option value="renewable_energy">Renewable Energy</option>
                <option value="waste_management">Waste Management</option>
                <option value="water_conservation">Water Conservation</option>
                <option value="biodiversity">Biodiversity</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Regions</option>
                {uniqueRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedStatus('all');
                  setSelectedType('all');
                  setSelectedRegion('all');
                  setSearchTerm('');
                }}
                className="w-full px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedProjects.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedProjects.length} project(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('approve')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleBulkAction('suspend')}
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
              >
                Suspend
              </button>
              <button
                onClick={() => handleBulkAction('export')}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Export
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Projects Display */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-3 border-b bg-gray-50">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedProjects.length === sortedProjects.length}
                onChange={handleSelectAll}
                className="mr-4 rounded border-gray-300"
              />
              <div className="grid grid-cols-12 gap-4 w-full text-sm font-medium text-gray-700">
                <div className="col-span-3">Project</div>
                <div className="col-span-2">Creator</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Progress</div>
                <div className="col-span-1">Credits</div>
                <div className="col-span-2">Location</div>
                <div className="col-span-1">Alerts</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {sortedProjects.map((project) => (
              <div key={project.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(project.id)}
                    onChange={() => handleSelectProject(project.id)}
                    className="mr-4 rounded border-gray-300"
                  />
                  <div className="grid grid-cols-12 gap-4 w-full">
                    <div className="col-span-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {getTypeIcon(project.type)}
                        </span>
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {project.title}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize">
                            {project.type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-800">
                            {project.creator.name}
                          </div>
                          {project.creator.organization && (
                            <div className="text-sm text-gray-600">
                              {project.creator.organization}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                      >
                        {project.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="col-span-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${project.timeline.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {project.timeline.progress}%
                        </span>
                      </div>
                    </div>

                    <div className="col-span-1">
                      <div className="text-sm">
                        <div className="font-medium text-gray-800">
                          {project.financials.totalCredits.toLocaleString()}
                        </div>
                        <div className="text-gray-600">
                          ${project.financials.pricePerCredit}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {project.location.region}, {project.location.country}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-1">
                      <div className="flex items-center space-x-2">
                        {project.alerts.count > 0 && (
                          <div className="flex items-center space-x-1">
                            <AlertTriangle
                              className={`h-4 w-4 ${
                                project.alerts.highPriority > 0
                                  ? 'text-red-500'
                                  : 'text-yellow-500'
                              }`}
                            />
                            <span className="text-sm">
                              {project.alerts.count}
                            </span>
                          </div>
                        )}
                        {project.compliance.overdueReports > 0 && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-600">
                              {project.compliance.overdueReports}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-span-1">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onViewProject?.(project.id)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEditProject?.(project.id)}
                          className="p-1 text-gray-400 hover:text-green-600"
                          title="Edit Project"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <div className="relative">
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">
                      {getTypeIcon(project.type)}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {project.title}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {project.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(project.id)}
                    onChange={() => handleSelectProject(project.id)}
                    className="rounded border-gray-300"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                    >
                      {project.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Progress:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${project.timeline.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {project.timeline.progress}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Credits:</span>
                    <span className="text-sm font-medium">
                      {project.financials.totalCredits.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {project.location.region}, {project.location.country}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{project.creator.name}</span>
                  </div>

                  {(project.alerts.count > 0 ||
                    project.compliance.overdueReports > 0) && (
                    <div className="flex items-center space-x-4 text-sm">
                      {project.alerts.count > 0 && (
                        <div className="flex items-center space-x-1">
                          <AlertTriangle
                            className={`h-4 w-4 ${
                              project.alerts.highPriority > 0
                                ? 'text-red-500'
                                : 'text-yellow-500'
                            }`}
                          />
                          <span>{project.alerts.count} alerts</span>
                        </div>
                      )}
                      {project.compliance.overdueReports > 0 && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-red-500" />
                          <span className="text-red-600">
                            {project.compliance.overdueReports} overdue
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewProject?.(project.id)}
                      className="flex items-center space-x-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => onEditProject?.(project.id)}
                      className="flex items-center space-x-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded text-sm"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {sortedProjects.length === 0 && (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            No projects found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedStatus('all');
              setSelectedType('all');
              setSelectedRegion('all');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
