'use client';

import { useState } from 'react';
import {
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  RotateCcw,
  Eye,
} from 'lucide-react';
import { useProjectTracking, useProjectDetails, useProjectFilters } from '../../hooks/useProjectTracking';
import type { ProjectProgress } from '../../store/tracking-store';

interface ProjectTrackingProps {
  className?: string;
}

export default function ProjectTracking({ className = '' }: ProjectTrackingProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Use the new tracking hooks
  const {
    projects: purchasedProjects,
    loading,
    errors,
    refreshAllData,
    isAuthenticated,
  } = useProjectTracking();

  const {
    filters,
    setFilters,
    availableFilters,
  } = useProjectFilters();

  const {
    project: selectedProjectData,
    loading: selectedProjectLoading,
    error: selectedProjectError,
  } = useProjectDetails(selectedProject || undefined);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'delayed':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'reforestation':
        return '🌳';
      case 'solar':
      case 'renewable_energy':
        return '☀️';
      case 'wind':
        return '💨';
      case 'waste_management':
        return '♻️';
      case 'mangrove_restoration':
        return '🌊';
      default:
        return '🌱';
    }
  };

  const formatDate = (dateString: string | number) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Projects are already filtered and sorted by the store
  const sortedProjects = purchasedProjects;

  if (loading.projects) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="flex items-center space-x-2">
          <RotateCcw className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading your projects...</span>
        </div>
      </div>
    );
  }

  if (errors.projects) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <AlertTriangle className="h-16 w-16 text-red-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">Error Loading Projects</h3>
        <p className="text-gray-600 mb-4">{errors.projects}</p>
        <button
          onClick={refreshAllData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">Please Sign In</h3>
        <p className="text-gray-600">
          You need to sign in to view your carbon credit project tracking.
        </p>
      </div>
    );
  }

  if (purchasedProjects.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">No Projects to Track</h3>
        <p className="text-gray-600">
          Once you purchase carbon credits, you'll be able to track project progress here.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Project Tracking</h2>
          <p className="text-gray-600">Monitor the progress of your carbon credit investments</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value as any })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {availableFilters.statuses.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Projects' :
                 status === 'active' ? 'Active' :
                 status === 'completed' ? 'Completed' :
                 status === 'issues' ? 'With Issues' : status}
              </option>
            ))}
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ sortBy: e.target.value as any })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {availableFilters.sortOptions.map(sort => (
              <option key={sort} value={sort}>
                {sort === 'recent' ? 'Recent Updates' :
                 sort === 'progress' ? 'Progress' :
                 sort === 'alerts' ? 'Alert Count' :
                 sort === 'investment' ? 'Investment' :
                 sort === 'carbon_impact' ? 'Carbon Impact' : sort}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedProjects?.map((project: ProjectProgress) => (
          <div
            key={project.projectId}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
            onClick={() => setSelectedProject(project.projectId)}
          >
            {/* Project Header */}
            <div className="p-4 border-b">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getProjectTypeIcon(project.projectType)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800 line-clamp-1">
                      {project.projectTitle}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {project.location.region}, {project.location.country}
                    </p>
                  </div>
                </div>

                {/* Alert indicator */}
                {project.alerts.filter(alert => !alert.isResolved).length > 0 && (
                  <div className="flex items-center space-x-1">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="text-xs text-orange-600">
                      {project.alerts.filter(alert => !alert.isResolved).length}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500">
                By {project.creatorName} • {project.purchaseInfo.creditsOwned} credits owned
              </div>
            </div>

            {/* Progress Section */}
            <div className="p-4">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm font-bold text-blue-600">
                    {project.currentStatus.overallProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.currentStatus.overallProgress}%` }}
                  />
                </div>
              </div>

              {/* Current Status */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Phase:</span>
                  <span className="font-medium">{project.currentStatus.currentPhase}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Next Milestone:</span>
                  <span className="font-medium text-right flex-1 ml-2 line-clamp-1">
                    {project.currentStatus.nextMilestone}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">
                    {formatDate(project.currentStatus.nextMilestoneDate)}
                  </span>
                </div>
              </div>

              {/* Impact Metrics */}
              <div className="bg-green-50 p-3 rounded-lg mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-700">
                    {project.impact.carbonOffset.toFixed(1)} tons
                  </div>
                  <div className="text-xs text-green-600">CO₂ Offset to Date</div>
                </div>
              </div>

              {/* Recent Activity */}
              {project.recentUpdates.length > 0 && (
                <div className="border-t pt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Latest Update</h4>
                  <div className="text-sm">
                    <div className="font-medium text-gray-800 line-clamp-1">
                      {project.recentUpdates[0]?.title}
                    </div>
                    <div className="text-gray-600 text-xs">
                      {project.recentUpdates[0]?.date && formatDate(project.recentUpdates[0].date)}
                    </div>
                  </div>
                </div>
              )}

              {/* View Details Button */}
              <button
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 text-sm font-medium transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProject(project.projectId);
                }}
              >
                <Eye className="h-4 w-4" />
                <span>View Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Project Modal/Panel */}
      {selectedProject && selectedProjectData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedProjectData.projectTitle}
              </h2>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="p-6 space-y-6">
                {/* Project Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Project Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{selectedProjectData.projectType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Creator:</span>
                        <span className="font-medium">{selectedProjectData.creatorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">
                          {selectedProjectData.location.region}, {selectedProjectData.location.country}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Your Investment:</span>
                        <span className="font-medium">
                          ${selectedProjectData.purchaseInfo.totalInvestment.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Current Status</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span className="font-bold">{selectedProjectData.currentStatus.overallProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${selectedProjectData.currentStatus.overallProgress}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Current Phase:</span>
                        <span className="ml-2 font-medium">{selectedProjectData.currentStatus.currentPhase}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Next Milestone:</span>
                        <span className="ml-2 font-medium">{selectedProjectData.currentStatus.nextMilestone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Alerts */}
                {selectedProjectData.alerts.filter((alert: any) => !alert.isResolved).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Active Alerts</h3>
                    <div className="space-y-2">
                      {selectedProjectData.alerts
                        .filter((alert: any) => !alert.isResolved)
                        .map((alert: any) => (
                          <div
                            key={alert.id}
                            className={`p-3 rounded-lg border ${getAlertColor(alert.severity)}`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{alert.message}</div>
                                <div className="text-xs opacity-75">{formatDate(alert.date)}</div>
                              </div>
                              <span className="px-2 py-1 rounded text-xs font-medium bg-white bg-opacity-50">
                                {alert.severity.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Recent Updates */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Recent Updates</h3>
                  <div className="space-y-4">
                    {selectedProjectData.recentUpdates.slice(0, 5).map((update: any) => (
                      <div key={update.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-800">{update.title}</h4>
                          <span className="text-xs text-gray-500">{formatDate(update.date)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{update.description}</p>
                        {update.photos.length > 0 && (
                          <div className="flex space-x-2">
                            {update.photos.slice(0, 3).map((photo: string, index: number) => (
                              <img
                                key={index}
                                src={photo}
                                alt={`Update photo ${index + 1}`}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ))}
                            {update.photos.length > 3 && (
                              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                                +{update.photos.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Milestones Timeline */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Milestones</h3>
                  <div className="space-y-3">
                    {selectedProjectData.milestones.map((milestone: any) => (
                      <div key={milestone.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {milestone.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : milestone.status === 'delayed' ? (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          ) : milestone.status === 'in_progress' ? (
                            <Clock className="h-5 w-5 text-blue-500" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-800">{milestone.title}</h4>
                              <p className="text-sm text-gray-600">{milestone.description}</p>
                            </div>
                            <div className="text-right text-sm">
                              <div className="text-gray-600">
                                {milestone.actualDate ? formatDate(milestone.actualDate) : formatDate(milestone.plannedDate)}
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(milestone.status)}`}>
                                {milestone.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}