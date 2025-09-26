'use client';

import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  UserIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  EyeIcon,
  CalendarIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

import VerificationQueue from './VerificationQueue';
import ProgressReviewTools from './ProgressReviewTools';
import CommunicationInterface from './CommunicationInterface';

interface VerifierDashboardProps {
  currentVerifierId?: string;
  currentVerifierName?: string;
}

type ActiveTab =
  | 'overview'
  | 'queue'
  | 'reviews'
  | 'communications'
  | 'analytics';

interface DashboardStats {
  pendingTasks: number;
  inReviewTasks: number;
  completedToday: number;
  urgentTasks: number;
  unreadMessages: number;
  averageReviewTime: number;
  completionRate: number;
  activeProjects: number;
}

interface RecentActivity {
  id: string;
  type:
    | 'task_completed'
    | 'message_received'
    | 'task_assigned'
    | 'review_submitted';
  description: string;
  timestamp: string;
  projectName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const VerifierDashboard: React.FC<VerifierDashboardProps> = ({
  currentVerifierId = 'verifier-1',
  currentVerifierName = 'John Smith',
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock dashboard stats
  const dashboardStats: DashboardStats = {
    pendingTasks: 12,
    inReviewTasks: 5,
    completedToday: 8,
    urgentTasks: 3,
    unreadMessages: 7,
    averageReviewTime: 2.5,
    completionRate: 94,
    activeProjects: 28,
  };

  // Mock recent activity
  const recentActivity: RecentActivity[] = [
    {
      id: 'act-1',
      type: 'task_completed',
      description:
        'Completed milestone verification for Urban Reforestation Initiative',
      timestamp: '2024-01-16T15:30:00Z',
      projectName: 'Urban Reforestation Initiative',
      priority: 'high',
    },
    {
      id: 'act-2',
      type: 'message_received',
      description: 'New message from EcoGreen Solutions about documentation',
      timestamp: '2024-01-16T14:45:00Z',
      projectName: 'Urban Reforestation Initiative',
      priority: 'medium',
    },
    {
      id: 'act-3',
      type: 'task_assigned',
      description:
        'New completion verification assigned for Solar Farm Development',
      timestamp: '2024-01-16T13:20:00Z',
      projectName: 'Solar Farm Development',
      priority: 'urgent',
    },
    {
      id: 'act-4',
      type: 'review_submitted',
      description: 'Submitted review for Ocean Cleanup Project progress update',
      timestamp: '2024-01-16T11:15:00Z',
      projectName: 'Ocean Cleanup Project',
      priority: 'medium',
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return CheckCircleIcon;
      case 'message_received':
        return ChatBubbleLeftRightIcon;
      case 'task_assigned':
        return ClockIcon;
      case 'review_submitted':
        return DocumentTextIcon;
      default:
        return DocumentTextIcon;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_completed':
        return 'text-green-600 bg-green-100';
      case 'message_received':
        return 'text-blue-600 bg-blue-100';
      case 'task_assigned':
        return 'text-orange-600 bg-orange-100';
      case 'review_submitted':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {currentVerifierName}
            </h1>
            <p className="text-blue-100 mt-1">
              Here's your verification dashboard overview
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Today</p>
            <p className="text-xl font-semibold">
              {new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardStats.pendingTasks}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <EyeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Review</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardStats.inReviewTasks}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Completed Today
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardStats.completedToday}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Urgent Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardStats.urgentTasks}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-medium text-gray-900">
                  {dashboardStats.completionRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${dashboardStats.completionRate}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Average Review Time</span>
              <span className="font-medium text-gray-900">
                {dashboardStats.averageReviewTime} hours
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Active Projects</span>
              <span className="font-medium text-gray-900">
                {dashboardStats.activeProjects}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Unread Messages</span>
              <span className="font-medium text-gray-900">
                {dashboardStats.unreadMessages}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((activity) => {
              const ActivityIcon = getActivityIcon(activity.type);
              return (
                <div
                  key={activity.id}
                  className={`flex items-start gap-3 p-3 border-l-4 ${getPriorityColor(activity.priority)} bg-gray-50 rounded-r-lg`}
                >
                  <div
                    className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}
                  >
                    <ActivityIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('queue')}
            className="flex flex-col items-center p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <ClockIcon className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-900">
              View Queue
            </span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className="flex flex-col items-center p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <DocumentTextIcon className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-900">
              Review Progress
            </span>
          </button>
          <button
            onClick={() => setActiveTab('communications')}
            className="flex flex-col items-center p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-900">
              Messages
            </span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className="flex flex-col items-center p-4 text-center bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <ChartBarIcon className="h-8 w-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-orange-900">
              Analytics
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Verification Analytics
          </h2>
          <p className="text-gray-600">
            Track your performance and verification metrics
          </p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Weekly Reviews
              </p>
              <p className="text-3xl font-bold text-gray-900">23</p>
              <p className="text-sm text-green-600">+12% from last week</p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Approval Rate</p>
              <p className="text-3xl font-bold text-gray-900">87%</p>
              <p className="text-sm text-green-600">+3% from last month</p>
            </div>
            <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Avg. Response Time
              </p>
              <p className="text-3xl font-bold text-gray-900">2.1h</p>
              <p className="text-sm text-red-600">+0.3h from target</p>
            </div>
            <ClockIcon className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Placeholder for charts */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Verification Trends
        </h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-gray-500 mt-2">
              Analytics charts will be implemented here
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Squares2X2Icon },
    { id: 'queue', name: 'Verification Queue', icon: ListBulletIcon },
    { id: 'reviews', name: 'Progress Reviews', icon: DocumentTextIcon },
    {
      id: 'communications',
      name: 'Communications',
      icon: ChatBubbleLeftRightIcon,
    },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Verifier Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-gray-600 relative"
                >
                  <BellIcon className="h-6 w-6" />
                  {dashboardStats.unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                      {dashboardStats.unreadMessages > 9
                        ? '9+'
                        : dashboardStats.unreadMessages}
                    </span>
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon className="h-8 w-8 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {currentVerifierName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'queue' && (
          <VerificationQueue
            currentVerifierId={currentVerifierId}
            onTaskSelect={setSelectedTask}
          />
        )}
        {activeTab === 'reviews' && (
          <ProgressReviewTools
            currentVerifierId={currentVerifierId}
            selectedSubmission={selectedSubmission}
            onSubmissionSelect={setSelectedSubmission}
          />
        )}
        {activeTab === 'communications' && (
          <CommunicationInterface
            currentUserId={currentVerifierId}
            currentUserRole="verifier"
            selectedConversation={selectedConversation}
            onConversationSelect={setSelectedConversation}
          />
        )}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};

export default VerifierDashboard;
