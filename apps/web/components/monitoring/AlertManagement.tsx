'use client';

import { useState, useEffect } from 'react';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface Alert {
  id: string;
  projectId: string;
  projectName: string;
  alertType:
    | 'progress_reminder'
    | 'overdue_warning'
    | 'milestone_delay'
    | 'impact_shortfall'
    | 'quality_concern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  description?: string;
  isResolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  notificationsSent: string[];
  createdAt: string;
  dueDate?: string;
  actionRequired?: string;
  recommendations?: string[];
}

interface AlertManagementProps {
  alerts: Alert[];
  onResolveAlert: (alertId: string, resolution: string) => void;
  onSnoozeAlert: (alertId: string, duration: number) => void;
  onEscalateAlert: (alertId: string, escalationLevel: string) => void;
}

export default function AlertManagement({
  alerts,
  onResolveAlert,
  onSnoozeAlert,
  onEscalateAlert,
}: AlertManagementProps) {
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(alerts);
  const [filters, setFilters] = useState({
    severity: 'all',
    type: 'all',
    status: 'active',
    project: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'severity' | 'project'>('date');
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [resolutionModal, setResolutionModal] = useState<{
    alertId: string;
    isOpen: boolean;
  }>({
    alertId: '',
    isOpen: false,
  });
  const [resolutionText, setResolutionText] = useState('');

  // Filter and sort alerts
  useEffect(() => {
    let filtered = alerts.filter((alert) => {
      const matchesSearch =
        alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.projectName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSeverity =
        filters.severity === 'all' || alert.severity === filters.severity;
      const matchesType =
        filters.type === 'all' || alert.alertType === filters.type;
      const matchesStatus =
        filters.status === 'all' ||
        (filters.status === 'active' && !alert.isResolved) ||
        (filters.status === 'resolved' && alert.isResolved);

      return matchesSearch && matchesSeverity && matchesType && matchesStatus;
    });

    // Sort alerts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'severity':
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        case 'project':
          return a.projectName.localeCompare(b.projectName);
        case 'date':
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    setFilteredAlerts(filtered);
  }, [alerts, filters, searchTerm, sortBy]);

  const getAlertIcon = (
    type: Alert['alertType'],
    severity: Alert['severity']
  ) => {
    const iconClass = `h-6 w-6 ${
      severity === 'critical'
        ? 'text-red-600'
        : severity === 'high'
          ? 'text-red-500'
          : severity === 'medium'
            ? 'text-yellow-500'
            : 'text-blue-500'
    }`;

    switch (type) {
      case 'progress_reminder':
        return <BellIcon className={iconClass} />;
      case 'overdue_warning':
        return <ExclamationTriangleIcon className={iconClass} />;
      case 'milestone_delay':
        return <XCircleIcon className={iconClass} />;
      case 'impact_shortfall':
        return <ExclamationTriangleIcon className={iconClass} />;
      case 'quality_concern':
        return <InformationCircleIcon className={iconClass} />;
      default:
        return <InformationCircleIcon className={iconClass} />;
    }
  };

  const getSeverityBadge = (severity: Alert['severity']) => {
    const classes = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-red-50 text-red-700 border-red-100',
      medium: 'bg-yellow-50 text-yellow-700 border-yellow-100',
      low: 'bg-blue-50 text-blue-700 border-blue-100',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${classes[severity]}`}
      >
        {severity.toUpperCase()}
      </span>
    );
  };

  const getTypeBadge = (type: Alert['alertType']) => {
    const labels = {
      progress_reminder: 'Progress Reminder',
      overdue_warning: 'Overdue Warning',
      milestone_delay: 'Milestone Delay',
      impact_shortfall: 'Impact Shortfall',
      quality_concern: 'Quality Concern',
    };

    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
        {labels[type]}
      </span>
    );
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const alertDate = new Date(date);
    const diffInHours =
      (now.getTime() - alertDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return `${Math.floor(diffInHours / 24)} days ago`;
    }
  };

  const handleResolveAlert = (alertId: string) => {
    setResolutionModal({ alertId, isOpen: true });
  };

  const submitResolution = () => {
    if (resolutionText.trim()) {
      onResolveAlert(resolutionModal.alertId, resolutionText);
      setResolutionModal({ alertId: '', isOpen: false });
      setResolutionText('');
    }
  };

  const activeAlerts = alerts.filter((alert) => !alert.isResolved);
  const criticalAlerts = activeAlerts.filter(
    (alert) => alert.severity === 'critical'
  );
  const highAlerts = activeAlerts.filter((alert) => alert.severity === 'high');

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Alert Management</h2>
            <p className="text-red-100 mt-1">
              {activeAlerts.length} active alerts • {criticalAlerts.length}{' '}
              critical • {highAlerts.length} high priority
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{activeAlerts.length}</div>
            <div className="text-red-100 text-sm">Active Alerts</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gray-50 p-4 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {criticalAlerts.length}
            </div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">
              {highAlerts.length}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {
                activeAlerts.filter((alert) => alert.severity === 'medium')
                  .length
              }
            </div>
            <div className="text-sm text-gray-600">Medium</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {activeAlerts.filter((alert) => alert.severity === 'low').length}
            </div>
            <div className="text-sm text-gray-600">Low Priority</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={filters.severity}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, severity: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
              <option value="all">All</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'date' | 'severity' | 'project')
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="severity">Sort by Severity</option>
              <option value="project">Sort by Project</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <BellIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No alerts found matching your criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-6 hover:bg-gray-50 ${
                  alert.severity === 'critical'
                    ? 'border-l-4 border-red-500'
                    : alert.severity === 'high'
                      ? 'border-l-4 border-red-400'
                      : alert.severity === 'medium'
                        ? 'border-l-4 border-yellow-400'
                        : 'border-l-4 border-blue-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getAlertIcon(alert.alertType, alert.severity)}
                      <h3 className="font-semibold text-gray-800">
                        {alert.message}
                      </h3>
                      {getSeverityBadge(alert.severity)}
                      {getTypeBadge(alert.alertType)}
                      {alert.isResolved && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          RESOLVED
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span>Project: {alert.projectName}</span>
                      <span>•</span>
                      <span>{getTimeAgo(alert.createdAt)}</span>
                      {alert.dueDate && (
                        <>
                          <span>•</span>
                          <span>
                            Due: {new Date(alert.dueDate).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>

                    {alert.description && (
                      <p className="text-gray-600 mb-3">{alert.description}</p>
                    )}

                    {alert.actionRequired && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-yellow-800">
                          Action Required:
                        </p>
                        <p className="text-sm text-yellow-700">
                          {alert.actionRequired}
                        </p>
                      </div>
                    )}

                    {/* Expandable Details */}
                    {alert.recommendations && (
                      <button
                        onClick={() =>
                          setExpandedAlert(
                            expandedAlert === alert.id ? null : alert.id
                          )
                        }
                        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        {expandedAlert === alert.id ? (
                          <ChevronDownIcon className="h-4 w-4" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4" />
                        )}
                        <span>View Recommendations</span>
                      </button>
                    )}

                    {expandedAlert === alert.id && alert.recommendations && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800 mb-2">
                          Recommendations:
                        </p>
                        <ul className="text-sm text-blue-700 space-y-1">
                          {alert.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {alert.isResolved && alert.resolvedAt && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          Resolved on{' '}
                          {new Date(alert.resolvedAt).toLocaleDateString()}
                          {alert.resolvedBy && ` by ${alert.resolvedBy}`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {!alert.isResolved && (
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => onSnoozeAlert(alert.id, 24)}
                        className="px-4 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                      >
                        Snooze 24h
                      </button>
                      {alert.severity !== 'critical' && (
                        <button
                          onClick={() => onEscalateAlert(alert.id, 'high')}
                          className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Escalate
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {resolutionModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Resolve Alert</h3>
            <textarea
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              placeholder="Describe how this alert was resolved..."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() =>
                  setResolutionModal({ alertId: '', isOpen: false })
                }
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={submitResolution}
                disabled={!resolutionText.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Resolve Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
