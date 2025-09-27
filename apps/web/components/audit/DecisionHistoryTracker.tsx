'use client';

import React, { useMemo, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  TrendingUp,
  User,
  XCircle,
} from 'lucide-react';

import type { DecisionHistory } from './types';

interface DecisionHistoryTrackerProps {
  decisions: DecisionHistory[];
  verificationId: string;
  onDecisionClick?: (decision: DecisionHistory) => void;
  showFilters?: boolean;
  className?: string;
}

export function DecisionHistoryTracker({
  decisions,
  verificationId,
  onDecisionClick,
  showFilters = true,
  className = '',
}: DecisionHistoryTrackerProps) {
  const [selectedDecisions, setSelectedDecisions] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedImpacts, setSelectedImpacts] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'timestamp' | 'impact' | 'score'>(
    'timestamp'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredDecisions = useMemo(() => {
    return decisions
      .filter((decision) => {
        if (
          selectedDecisions.length > 0 &&
          !selectedDecisions.includes(decision.decision)
        ) {
          return false;
        }
        if (
          selectedUsers.length > 0 &&
          !selectedUsers.includes(decision.userId)
        ) {
          return false;
        }
        if (
          selectedStages.length > 0 &&
          !selectedStages.includes(decision.verificationStage)
        ) {
          return false;
        }
        if (
          selectedImpacts.length > 0 &&
          !selectedImpacts.includes(decision.impact)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case 'timestamp':
            comparison = a.timestamp - b.timestamp;
            break;
          case 'impact':
            const impactOrder = { low: 1, medium: 2, high: 3, critical: 4 };
            comparison = impactOrder[a.impact] - impactOrder[b.impact];
            break;
          case 'score':
            comparison = (a.score || 0) - (b.score || 0);
            break;
          default:
            comparison = a.timestamp - b.timestamp;
        }

        return sortOrder === 'desc' ? -comparison : comparison;
      });
  }, [
    decisions,
    selectedDecisions,
    selectedUsers,
    selectedStages,
    selectedImpacts,
    sortBy,
    sortOrder,
  ]);

  const stats = useMemo(() => {
    const total = filteredDecisions.length;
    const byDecision = filteredDecisions.reduce(
      (acc, decision) => {
        acc[decision.decision] = (acc[decision.decision] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byImpact = filteredDecisions.reduce(
      (acc, decision) => {
        acc[decision.impact] = (acc[decision.impact] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const averageScore =
      filteredDecisions.reduce(
        (acc, decision) => acc + (decision.score || 0),
        0
      ) / total || 0;
    const averageConfidence =
      filteredDecisions.reduce(
        (acc, decision) => acc + (decision.metadata.confidence || 0),
        0
      ) / total || 0;

    const decisionsWithChanges = filteredDecisions.filter(
      (d) => d.previousDecision && d.previousDecision !== d.decision
    ).length;

    return {
      total,
      byDecision,
      byImpact,
      averageScore,
      averageConfidence,
      decisionsWithChanges,
    };
  }, [filteredDecisions]);

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'revision_required':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'revision_required':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const exportDecisionHistory = () => {
    const csvContent = [
      [
        'Timestamp',
        'Decision',
        'Previous Decision',
        'User',
        'Role',
        'Stage',
        'Score',
        'Impact',
        'Confidence',
        'Reason',
      ].join(','),
      ...filteredDecisions.map((decision) =>
        [
          format(new Date(decision.timestamp), 'yyyy-MM-dd HH:mm:ss'),
          decision.decision,
          decision.previousDecision || '',
          decision.userName,
          decision.userRole,
          decision.verificationStage,
          decision.score || '',
          decision.impact,
          decision.metadata.confidence || '',
          `"${decision.reason.replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `decision-history-${verificationId}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uniqueUsers = useMemo(() => {
    return [
      ...new Set(decisions.map((d) => ({ id: d.userId, name: d.userName }))),
    ];
  }, [decisions]);

  const uniqueStages = useMemo(() => {
    return [...new Set(decisions.map((d) => d.verificationStage))];
  }, [decisions]);

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Decision History
            </h3>
            <p className="text-sm text-gray-500">
              {stats.total} decisions • {stats.decisionsWithChanges} changed
              decisions • Avg score: {Math.round(stats.averageScore)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportDecisionHistory}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-') as [
                  typeof sortBy,
                  typeof sortOrder,
                ];
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="timestamp-desc">Latest First</option>
              <option value="timestamp-asc">Oldest First</option>
              <option value="impact-desc">Highest Impact</option>
              <option value="impact-asc">Lowest Impact</option>
              <option value="score-desc">Highest Score</option>
              <option value="score-asc">Lowest Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="border-b border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.byDecision.approved || 0}
            </div>
            <div className="text-sm text-gray-500">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.byDecision.rejected || 0}
            </div>
            <div className="text-sm text-gray-500">Rejected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.byDecision.revision_required || 0}
            </div>
            <div className="text-sm text-gray-500">Revision Required</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(stats.averageScore)}
            </div>
            <div className="text-sm text-gray-500">Avg Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(stats.averageConfidence)}%
            </div>
            <div className="text-sm text-gray-500">Avg Confidence</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Filters:
              </span>
            </div>

            <select
              multiple
              value={selectedDecisions}
              onChange={(e) =>
                setSelectedDecisions(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Decisions</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="revision_required">Revision Required</option>
              <option value="pending">Pending</option>
            </select>

            <select
              multiple
              value={selectedUsers}
              onChange={(e) =>
                setSelectedUsers(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Users</option>
              {uniqueUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>

            <select
              multiple
              value={selectedStages}
              onChange={(e) =>
                setSelectedStages(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Stages</option>
              {uniqueStages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>

            <select
              multiple
              value={selectedImpacts}
              onChange={(e) =>
                setSelectedImpacts(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Impacts</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            {(selectedDecisions.length > 0 ||
              selectedUsers.length > 0 ||
              selectedStages.length > 0 ||
              selectedImpacts.length > 0) && (
              <button
                onClick={() => {
                  setSelectedDecisions([]);
                  setSelectedUsers([]);
                  setSelectedStages([]);
                  setSelectedImpacts([]);
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Decision History Content */}
      <div className="p-6">
        <div className="space-y-4">
          {filteredDecisions.map((decision, index) => (
            <div
              key={decision.id}
              onClick={() => onDecisionClick?.(decision)}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0">
                    {getDecisionIcon(decision.decision)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getDecisionColor(decision.decision)}`}
                      >
                        {decision.decision.replace('_', ' ')}
                      </span>

                      {decision.previousDecision &&
                        decision.previousDecision !== decision.decision && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="text-xs">changed from</span>
                            <span
                              className={`inline-flex px-2 py-1 text-xs rounded border ${getDecisionColor(decision.previousDecision)}`}
                            >
                              {decision.previousDecision.replace('_', ' ')}
                            </span>
                            <ArrowRight className="h-3 w-3" />
                          </div>
                        )}

                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(decision.impact)}`}
                      >
                        {decision.impact} impact
                      </span>
                    </div>

                    <p className="text-sm text-gray-900 font-medium mb-2">
                      {decision.reason}
                    </p>

                    <div className="flex items-center gap-6 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {decision.userName} ({decision.userRole})
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(decision.timestamp), {
                          addSuffix: true,
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {decision.verificationStage}
                      </span>
                      {decision.score && (
                        <span className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          <span
                            className={`font-medium ${getScoreColor(decision.score)}`}
                          >
                            {decision.score}/100
                          </span>
                        </span>
                      )}
                      {decision.metadata.confidence && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {decision.metadata.confidence}% confidence
                        </span>
                      )}
                      {decision.metadata.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.round(decision.metadata.duration / 1000)}s to
                          decide
                        </span>
                      )}
                    </div>

                    {/* Additional metadata */}
                    {(decision.metadata.checklistItems?.length ||
                      decision.metadata.documentsConcerned?.length ||
                      decision.metadata.reviewNotes) && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs font-medium text-gray-700 mb-2">
                          Decision Details:
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          {decision.metadata.checklistItems?.length && (
                            <div>
                              <span className="font-medium">
                                Checklist items:
                              </span>{' '}
                              {decision.metadata.checklistItems.join(', ')}
                            </div>
                          )}
                          {decision.metadata.documentsConcerned?.length && (
                            <div>
                              <span className="font-medium">Documents:</span>{' '}
                              {decision.metadata.documentsConcerned.join(', ')}
                            </div>
                          )}
                          {decision.metadata.reviewNotes && (
                            <div>
                              <span className="font-medium">Review notes:</span>{' '}
                              {decision.metadata.reviewNotes}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <div className="text-right text-xs text-gray-500">
                    <div>
                      {format(new Date(decision.timestamp), 'MMM dd, yyyy')}
                    </div>
                    <div>{format(new Date(decision.timestamp), 'HH:mm')}</div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-900">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDecisions.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No decisions found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No decisions match your current filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
