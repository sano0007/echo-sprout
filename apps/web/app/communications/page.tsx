'use client';

import { api } from '@packages/backend';
import type { Id } from '@packages/backend/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import {
  MessageNotificationSystem,
  ProjectCommunicationDashboard,
} from '../../components/communication';
import { useRealTimeMessaging } from '../../hooks/useRealTimeMessaging';

export default function CommunicationsPage() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);

  // Get current user
  const currentUser = useQuery(api.users.getCurrentUser);

  // Get all project conversations for this user
  const projectConversations = useQuery(
    api.verificationMessages.getUserProjectConversations,
    currentUser?._id ? { userId: currentUser._id } : 'skip'
  );

  // Real-time messaging
  const {
    notifications: rawNotifications,
    unreadCount,
    urgentCount,
    isConnected,
  } = useRealTimeMessaging({
    userId: currentUser?._id || '',
    onNewMessage: (message) => {
      console.log('New message in communications dashboard:', message);
    },
  });

  // Transform notifications to match MessageNotificationSystem interface
  const notifications = (rawNotifications || []).map((notification: any) => ({
    id: notification._id,
    type:
      notification.type === 'message_received'
        ? ('message' as const)
        : notification.priority === 'urgent'
          ? ('urgent' as const)
          : ('reply' as const),
    title: notification.title,
    content: notification.message,
    projectId: notification.relatedEntityId || 'unknown',
    projectTitle: notification.title.includes('project')
      ? notification.message.match(/project "([^"]+)"/)?.[1] ||
        'Unknown Project'
      : 'Communication',
    senderId: notification.recipientId, // This might need adjustment based on actual data structure
    senderName: notification.message.match(/from ([^:]+):/)?.[1] || 'System',
    timestamp: notification._creationTime || Date.now(),
    isRead: notification.isRead || false,
    priority: notification.priority || 'normal',
  }));

  // Transform project conversations to match ProjectConversation interface
  const transformedProjectConversations = (projectConversations || []).map(
    (conversation: any) => ({
      projectId: conversation.projectId,
      projectTitle: conversation.projectTitle,
      verifierId: conversation.verificationId, // Map verificationId to verifierId
      verifierName: 'Verifier', // Default name since not provided by backend
      lastMessage: conversation.lastMessage
        ? {
            _id: conversation.lastMessage._id,
            subject: conversation.lastMessage.subject,
            message: conversation.lastMessage.message,
            senderId: conversation.lastMessage.senderId,
            senderName: conversation.lastMessage.senderName || 'Unknown',
            _creationTime: conversation.lastMessage._creationTime,
            isRead: conversation.lastMessage.isRead,
            priority: conversation.lastMessage.priority || 'normal',
          }
        : {
            _id: '',
            subject: 'No messages',
            message: 'No messages yet',
            senderId: '',
            senderName: '',
            _creationTime: Date.now(),
            isRead: true,
            priority: 'normal' as const,
          },
      unreadCount: conversation.unreadCount || 0,
      totalMessages: conversation.messageCount || 0, // Map messageCount to totalMessages
      verificationStatus: 'in_progress' as const, // Default status since not provided by backend
    })
  );

  // Mutations
  const markNotificationAsRead = useMutation(
    api.verificationMessages.markNotificationAsRead
  );
  const markAllNotificationsAsRead = useMutation(
    api.verificationMessages.markAllNotificationsAsRead
  );
  const clearNotification = useMutation(
    api.verificationMessages.clearNotification
  );
  const markProjectMessagesAsRead = useMutation(
    api.verificationMessages.markProjectMessagesAsRead
  );

  const handleSelectProject = useCallback(
    (projectId: string) => {
      router.push(`/verification/review/${projectId}?section=communication`);
    },
    [router]
  );

  const handleMarkProjectAsRead = useCallback(
    async (projectId: string) => {
      if (!currentUser?._id) return;

      try {
        await markProjectMessagesAsRead({
          projectId: projectId as Id<'projects'>,
          userId: currentUser._id,
        });
      } catch (error) {
        console.error('Error marking project as read:', error);
        throw error;
      }
    },
    [currentUser?._id, markProjectMessagesAsRead]
  );

  const handleMarkNotificationAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await markNotificationAsRead({
          notificationId: notificationId as Id<'notifications'>,
        });
      } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }
    },
    [markNotificationAsRead]
  );

  const handleMarkAllNotificationsAsRead = useCallback(async () => {
    if (!currentUser?._id) return;

    try {
      await markAllNotificationsAsRead({});
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }, [currentUser?._id, markAllNotificationsAsRead]);

  const handleClearNotification = useCallback(
    async (notificationId: string) => {
      try {
        await clearNotification({
          notificationId: notificationId as Id<'notifications'>,
        });
      } catch (error) {
        console.error('Error clearing notification:', error);
        throw error;
      }
    },
    [clearNotification]
  );

  const handleNavigateToMessage = useCallback(
    (projectId: string, messageId?: string) => {
      if (projectId === 'all') {
        // Stay on current page but close notifications
        setShowNotifications(false);
      } else {
        const params = new URLSearchParams();
        params.set('section', 'communication');
        if (messageId) {
          params.set('messageId', messageId);
        }
        router.push(`/verification/review/${projectId}?${params.toString()}`);
      }
    },
    [router]
  );

  // Loading state
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your communications...</p>
        </div>
      </div>
    );
  }

  // Check permissions - only allow project creators and verifiers
  const canViewCommunications = ['creator', 'verifier', 'admin'].includes(
    currentUser.role
  );

  if (!canViewCommunications) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the communications dashboard.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Communications Center
              </h1>
              {!isConnected && (
                <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded">
                  Reconnecting...
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <MessageNotificationSystem
                notifications={notifications}
                onMarkAsRead={handleMarkNotificationAsRead}
                onMarkAllAsRead={handleMarkAllNotificationsAsRead}
                onClearNotification={handleClearNotification}
                onNavigateToMessage={handleNavigateToMessage}
                isOpen={showNotifications}
                onToggle={() => setShowNotifications(!showNotifications)}
              />

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  Welcome, {currentUser.firstName} {currentUser.lastName}
                </span>
                <span className="text-gray-400">•</span>
                <span className="capitalize">{currentUser.role}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-[calc(100vh-12rem)]">
          <ProjectCommunicationDashboard
            currentUser={{
              id: currentUser._id,
              name: `${currentUser.firstName} ${currentUser.lastName}`,
              role: currentUser.role,
            }}
            conversations={transformedProjectConversations}
            onSelectProject={handleSelectProject}
            onMarkAsRead={handleMarkProjectAsRead}
            isLoading={!projectConversations}
          />
        </div>
      </main>

      {/* Connection Status */}
      {!isConnected && (
        <div className="fixed bottom-4 right-4 bg-orange-100 border border-orange-300 text-orange-800 px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Reconnecting to message service...</span>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {(unreadCount > 0 || urgentCount > 0) && (
        <div className="fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
          <h3 className="font-medium text-gray-900 mb-2">Quick Summary</h3>
          <div className="space-y-1 text-sm">
            {unreadCount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Unread messages:</span>
                <span className="font-medium text-blue-600">{unreadCount}</span>
              </div>
            )}
            {urgentCount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Urgent items:</span>
                <span className="font-medium text-red-600">{urgentCount}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
