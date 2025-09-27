'use client';

import { api } from '@packages/backend';
import { useQuery } from 'convex/react';
import Link from 'next/link';
import { useState } from 'react';

export default function VerificationDashboard() {
  const [activeTab, setActiveTab] = useState('pending');

  // Get current user permissions
  const permissions = useQuery(api.permissions.getCurrentUserPermissions);

  // Get verifier stats for current user
  const verifierStats = useQuery(api.verifications.getVerifierStats, {});

  // Get my verifications
  const myVerifications = useQuery(api.verifications.getMyVerifications, {
    paginationOpts: { numItems: 50, cursor: null },
  });

  // Get pending verifications (for admins)
  const pendingVerifications = useQuery(
    api.verifications.getPendingVerifications,
    permissions?.isAdmin
      ? { paginationOpts: { numItems: 50, cursor: null } }
      : 'skip'
  );

  // Loading states
  if (!permissions || !verifierStats || !myVerifications) {
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

  // Check access permissions
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

  // Process verifications data
  const allVerifications = myVerifications.page || [];
  const projects = {
    pending: allVerifications.filter((v) => v.status === 'assigned'),
    inProgress: allVerifications.filter((v) => v.status === 'in_progress'),
    completed: allVerifications.filter((v) =>
      ['completed', 'approved', 'rejected', 'revision_required'].includes(
        v.status
      )
    ),
  };

  // Use real stats
  const stats = {
    totalProjects: verifierStats.totalVerifications || 0,
    pendingReview: verifierStats.pendingVerifications || 0,
    inProgress: verifierStats.inProgressVerifications || 0,
    completedThisMonth: verifierStats.completedThisMonth || 0,
    averageReviewTime: '5.2 days', // TODO: Calculate from actual data
    overdueVerifications: verifierStats.overdueVerifications || 0,
    averageScore: verifierStats.averageScore
      ? verifierStats.averageScore.toFixed(1)
      : 'N/A',
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Verification Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-blue-600">
            {stats.totalProjects}
          </p>
          <p className="text-sm text-gray-600">Total Projects</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-orange-600">
            {stats.pendingReview}
          </p>
          <p className="text-sm text-gray-600">Pending Review</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {stats.inProgress}
          </p>
          <p className="text-sm text-gray-600">In Progress</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-green-600">
            {stats.completedThisMonth}
          </p>
          <p className="text-sm text-gray-600">Completed This Month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-red-600">
            {stats.overdueVerifications}
          </p>
          <p className="text-sm text-gray-600">Overdue</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-purple-600">
            {stats.averageScore}
          </p>
          <p className="text-sm text-gray-600">Avg Score</p>
        </div>
      </div>

      {/* Project Queue Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'pending' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Pending Review ({projects.pending.length})
            </button>
            <button
              onClick={() => setActiveTab('inProgress')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'inProgress' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              In Progress ({projects.inProgress.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'completed' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Completed ({projects.completed.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Pending Projects */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {projects.pending.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No pending verifications assigned to you.</p>
                </div>
              ) : (
                projects.pending.map((verification) => (
                  <VerificationCard
                    key={verification._id}
                    verification={verification}
                    type="pending"
                  />
                ))
              )}
            </div>
          )}

          {/* In Progress Projects */}
          {activeTab === 'inProgress' && (
            <div className="space-y-4">
              {projects.inProgress.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No verifications currently in progress.</p>
                </div>
              ) : (
                projects.inProgress.map((verification) => (
                  <VerificationCard
                    key={verification._id}
                    verification={verification}
                    type="inProgress"
                  />
                ))
              )}
            </div>
          )}

          {/* Completed Projects */}
          {activeTab === 'completed' && (
            <div className="space-y-4">
              {projects.completed.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No completed verifications yet.</p>
                </div>
              ) : (
                projects.completed.map((verification) => (
                  <VerificationCard
                    key={verification._id}
                    verification={verification}
                    type="completed"
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component for rendering verification cards
function VerificationCard({
  verification,
  type,
}: {
  verification: any;
  type: 'pending' | 'inProgress' | 'completed';
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
          {type === 'pending' && (
            <>
              <Link
                href={`/verification/review/${verification.projectId}`}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
              >
                Start Review
              </Link>
              <Link
                href={`/verification/review/${verification.projectId}`}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400"
              >
                View Details
              </Link>
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
            </>
          )}

          {type === 'completed' && (
            <Link
              href={`/verification/review/${verification.projectId}`}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400"
            >
              View Report
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
