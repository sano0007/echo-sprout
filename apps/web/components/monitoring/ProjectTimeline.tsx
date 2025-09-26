'use client';

import { useState } from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

interface Milestone {
  id: string;
  title: string;
  description: string;
  plannedDate: string;
  actualDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'skipped';
  type: 'setup' | 'progress_25' | 'progress_50' | 'progress_75' | 'impact_first' | 'verification' | 'completion';
  delayReason?: string;
  impactOnTimeline?: string;
  dependencies?: string[];
  progressPercentage?: number;
}

interface ProjectTimelineProps {
  projectId: string;
  milestones: Milestone[];
  currentProgress: number;
  estimatedCompletion: string;
  onMilestoneUpdate?: (milestoneId: string, status: string, notes?: string) => void;
}

export default function ProjectTimeline({
  projectId,
  milestones,
  currentProgress,
  estimatedCompletion,
  onMilestoneUpdate
}: ProjectTimelineProps) {
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'gantt' | 'list'>('timeline');

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'in_progress':
        return <ClockIcon className="h-6 w-6 text-blue-500" />;
      case 'delayed':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
      default:
        return <div className="h-6 w-6 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'delayed':
        return 'bg-red-500';
      case 'skipped':
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
    }
  };

  const getTypeLabel = (type: Milestone['type']) => {
    const labels = {
      setup: 'Project Setup',
      progress_25: '25% Milestone',
      progress_50: '50% Milestone',
      progress_75: '75% Milestone',
      impact_first: 'First Impact',
      verification: 'Verification',
      completion: 'Completion'
    };
    return labels[type] || type;
  };

  const isOverdue = (milestone: Milestone) => {
    if (milestone.status === 'completed') return false;
    return new Date(milestone.plannedDate) < new Date();
  };

  const getDaysFromNow = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const sortedMilestones = [...milestones].sort((a, b) =>
    new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime()
  );

  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const totalMilestones = milestones.length;
  const timelineProgress = (completedMilestones / totalMilestones) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">Project Timeline</h3>
            <p className="text-blue-100 mt-1">
              {completedMilestones} of {totalMilestones} milestones completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{Math.round(timelineProgress)}%</div>
            <div className="text-blue-100 text-sm">Timeline Progress</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-blue-100 mb-2">
            <span>Progress</span>
            <span>Est. Completion: {new Date(estimatedCompletion).toLocaleDateString()}</span>
          </div>
          <div className="w-full bg-blue-500 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${timelineProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="border-b bg-gray-50 p-4">
        <div className="flex space-x-1">
          {(['timeline', 'gantt', 'list'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)} View
            </button>
          ))}
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="p-6">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300" />

            {/* Milestones */}
            <div className="space-y-8">
              {sortedMilestones.map((milestone, index) => (
                <div key={milestone.id} className="relative flex items-start">
                  {/* Timeline Node */}
                  <div className="relative z-10 flex items-center">
                    <div className={`w-12 h-12 rounded-full border-4 border-white shadow-md flex items-center justify-center ${getStatusColor(milestone.status)}`}>
                      {getStatusIcon(milestone.status)}
                    </div>
                  </div>

                  {/* Milestone Content */}
                  <div className="ml-6 flex-1">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-gray-800">{milestone.title}</h4>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {getTypeLabel(milestone.type)}
                            </span>
                            {isOverdue(milestone) && milestone.status !== 'completed' && (
                              <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                                Overdue
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mt-1">{milestone.description}</p>

                          {/* Dates */}
                          <div className="flex items-center space-x-4 mt-3 text-sm">
                            <div className="flex items-center space-x-1">
                              <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                Planned: {new Date(milestone.plannedDate).toLocaleDateString()}
                              </span>
                            </div>
                            {milestone.actualDate && (
                              <div className="flex items-center space-x-1">
                                <CalendarDaysIcon className="h-4 w-4 text-green-400" />
                                <span className="text-gray-600">
                                  Actual: {new Date(milestone.actualDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {!milestone.actualDate && milestone.status !== 'completed' && (
                              <span className={`text-sm ${
                                getDaysFromNow(milestone.plannedDate) < 0
                                  ? 'text-red-600'
                                  : getDaysFromNow(milestone.plannedDate) < 7
                                  ? 'text-yellow-600'
                                  : 'text-gray-600'
                              }`}>
                                {getDaysFromNow(milestone.plannedDate) < 0
                                  ? `${Math.abs(getDaysFromNow(milestone.plannedDate))} days overdue`
                                  : `${getDaysFromNow(milestone.plannedDate)} days remaining`
                                }
                              </span>
                            )}
                          </div>

                          {/* Progress Bar for In-Progress Milestones */}
                          {milestone.status === 'in_progress' && milestone.progressPercentage !== undefined && (
                            <div className="mt-3">
                              <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>Progress</span>
                                <span>{milestone.progressPercentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${milestone.progressPercentage}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Expandable Details */}
                          {(milestone.delayReason || milestone.dependencies?.length) && (
                            <button
                              onClick={() => setExpandedMilestone(
                                expandedMilestone === milestone.id ? null : milestone.id
                              )}
                              className="flex items-center space-x-1 mt-3 text-sm text-blue-600 hover:text-blue-700"
                            >
                              {expandedMilestone === milestone.id ? (
                                <ChevronDownIcon className="h-4 w-4" />
                              ) : (
                                <ChevronRightIcon className="h-4 w-4" />
                              )}
                              <span>View Details</span>
                            </button>
                          )}

                          {/* Expanded Details */}
                          {expandedMilestone === milestone.id && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
                              {milestone.delayReason && (
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Delay Reason:</label>
                                  <p className="text-sm text-gray-600">{milestone.delayReason}</p>
                                </div>
                              )}
                              {milestone.impactOnTimeline && (
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Timeline Impact:</label>
                                  <p className="text-sm text-gray-600">{milestone.impactOnTimeline}</p>
                                </div>
                              )}
                              {milestone.dependencies?.length && (
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Dependencies:</label>
                                  <ul className="text-sm text-gray-600 list-disc list-inside">
                                    {milestone.dependencies.map((dep, i) => (
                                      <li key={i}>{dep}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {onMilestoneUpdate && milestone.status !== 'completed' && (
                          <div className="ml-4">
                            <button
                              onClick={() => onMilestoneUpdate(milestone.id, 'completed')}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              Mark Complete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gantt View */}
      {viewMode === 'gantt' && (
        <div className="p-6">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Gantt Header */}
              <div className="grid grid-cols-12 gap-1 mb-4 text-xs text-gray-600">
                {Array.from({ length: 12 }, (_, i) => {
                  const month = new Date(2024, i, 1);
                  return (
                    <div key={i} className="text-center font-medium">
                      {month.toLocaleDateString('en', { month: 'short' })}
                    </div>
                  );
                })}
              </div>

              {/* Gantt Chart */}
              <div className="space-y-3">
                {sortedMilestones.map((milestone) => {
                  const startMonth = new Date(milestone.plannedDate).getMonth();
                  const duration = 1; // Simplified - milestones are typically single points

                  return (
                    <div key={milestone.id} className="flex items-center">
                      <div className="w-48 text-sm font-medium text-gray-700 truncate">
                        {milestone.title}
                      </div>
                      <div className="flex-1 grid grid-cols-12 gap-1">
                        {Array.from({ length: 12 }, (_, i) => (
                          <div
                            key={i}
                            className={`h-6 rounded ${
                              i === startMonth
                                ? getStatusColor(milestone.status)
                                : 'bg-gray-100'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="p-6">
          <div className="space-y-4">
            {sortedMilestones.map((milestone) => (
              <div key={milestone.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(milestone.status)}
                  <div>
                    <h4 className="font-medium text-gray-800">{milestone.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{getTypeLabel(milestone.type)}</span>
                      <span>Due: {new Date(milestone.plannedDate).toLocaleDateString()}</span>
                      {milestone.status === 'completed' && milestone.actualDate && (
                        <span>Completed: {new Date(milestone.actualDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    milestone.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : milestone.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800'
                      : milestone.status === 'delayed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {milestone.status.replace('_', ' ').toUpperCase()}
                  </span>

                  {isOverdue(milestone) && milestone.status !== 'completed' && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">
                      {Math.abs(getDaysFromNow(milestone.plannedDate))}d overdue
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {milestones.filter(m => m.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {milestones.filter(m => m.status === 'in_progress').length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {milestones.filter(m => m.status === 'delayed').length}
            </div>
            <div className="text-sm text-gray-600">Delayed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">
              {milestones.filter(m => m.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>
      </div>
    </div>
  );
}