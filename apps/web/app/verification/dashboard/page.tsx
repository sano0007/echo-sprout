'use client';

import { api } from '@packages/backend';
import { useMutation, useQuery } from 'convex/react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function VerificationDashboard() {
  const [activeTab, setActiveTab] = useState('pendingAcceptance');

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

  const allVerifications = myVerifications.page || [];
  const projects = {
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
  };

  const stats = {
    totalProjects: verifierStats.totalVerifications || 0,
    pendingAcceptance: acceptanceStats.pendingAcceptance || 0,
    acceptanceRate: acceptanceStats.acceptanceRate || 0,
    inProgress: verifierStats.inProgressVerifications || 0,
    completedThisMonth: verifierStats.completedThisMonth || 0,
    averageAcceptanceTime: acceptanceStats.averageAcceptanceTimeHours || 0,
    overdueVerifications: verifierStats.overdueVerifications || 0,
    averageScore: verifierStats.averageScore
      ? verifierStats.averageScore.toFixed(1)
      : 'N/A',
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Verification Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-blue-600">
            {stats.totalProjects}
          </p>
          <p className="text-sm text-gray-600">Total Projects</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-orange-600">
            {stats.pendingAcceptance}
          </p>
          <p className="text-sm text-gray-600">Pending Acceptance</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-2xl font-bold text-teal-600">
            {stats.acceptanceRate}%
          </p>
          <p className="text-sm text-gray-600">Acceptance Rate</p>
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
          <p className="text-2xl font-bold text-indigo-600">
            {stats.averageAcceptanceTime}h
          </p>
          <p className="text-sm text-gray-600">Avg Acceptance Time</p>
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
          <p className="text-sm text-gray-600">Avg Quality Score</p>
        </div>
      </div>

      {/* Project Queue Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('pendingAcceptance')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'pendingAcceptance' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Pending Acceptance ({projects.pendingAcceptance.length})
            </button>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'accepted' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Accepted ({projects.accepted.length})
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
          {/* Pending Acceptance Projects */}
          {activeTab === 'pendingAcceptance' && (
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
          )}

          {/* Accepted Projects */}
          {activeTab === 'accepted' && (
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
                projects.inProgress.map((verification: any) => (
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
                projects.completed.map((verification: any) => (
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

function VerificationCard({
  verification,
  type,
}: {
  verification: any;
  type: 'pendingAcceptance' | 'accepted' | 'inProgress' | 'completed';
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
