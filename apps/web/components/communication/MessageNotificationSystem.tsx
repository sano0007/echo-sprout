'use client';

import { Bell, Check, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface MessageNotification {
  id: string;
  type: 'message' | 'reply' | 'urgent';
  title: string;
  content: string;
  projectId: string;
  projectTitle: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

interface MessageNotificationSystemProps {
  notifications: MessageNotification[];
  onMarkAsRead: (notificationId: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onClearNotification: (notificationId: string) => Promise<void>;
  onNavigateToMessage: (projectId: string, messageId?: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function MessageNotificationSystem({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearNotification,
  onNavigateToMessage,
  isOpen,
  onToggle,
}: MessageNotificationSystemProps) {
  const [isVisible, setIsVisible] = useState(false);

  const unreadNotifications = notifications.filter((notif) => !notif.isRead);
  const urgentNotifications = unreadNotifications.filter(
    (notif) => notif.priority === 'urgent'
  );

  // Show browser notifications for urgent messages
  useEffect(() => {
    if (urgentNotifications.length > 0 && 'Notification' in window) {
      urgentNotifications.forEach((notification) => {
        if (Notification.permission === 'granted') {
          new Notification(`Urgent: ${notification.title}`, {
            body: `${notification.senderName}: ${notification.content}`,
            icon: '/favicon.ico',
            tag: notification.id,
          });
        }
      });
    }
  }, [urgentNotifications]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const formatNotificationTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return '🚨';
      case 'reply':
        return '💬';
      case 'message':
        return '📧';
      default:
        return '📧';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'normal':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const handleMarkAsRead = useCallback(
    async (notificationId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      try {
        await onMarkAsRead(notificationId);
      } catch (error) {
        console.error('Error marking notification as read:', error);
        toast.error('Failed to mark as read');
      }
    },
    [onMarkAsRead]
  );

  const handleClearNotification = useCallback(
    async (notificationId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      try {
        await onClearNotification(notificationId);
      } catch (error) {
        console.error('Error clearing notification:', error);
        toast.error('Failed to clear notification');
      }
    },
    [onClearNotification]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await onMarkAllAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  }, [onMarkAllAsRead]);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={onToggle}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Message Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadNotifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
          </span>
        )}
        {urgentNotifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 animate-pulse rounded-full w-2 h-2"></span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                Notifications ({unreadNotifications.length})
              </h3>
              {unreadNotifications.length > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
            {urgentNotifications.length > 0 && (
              <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
                🚨 {urgentNotifications.length} urgent message
                {urgentNotifications.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  You'll see message notifications here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => onNavigateToMessage(notification.projectId)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(
                      notification.priority
                    )} ${notification.isRead ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <h4 className="font-medium text-sm text-gray-900 truncate">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {notification.content}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-2">
                            <span>{notification.senderName}</span>
                            <span>•</span>
                            <span>{notification.projectTitle}</span>
                          </div>
                          <span>
                            {formatNotificationTime(notification.timestamp)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 ml-2">
                        {!notification.isRead && (
                          <button
                            onClick={(e) =>
                              handleMarkAsRead(notification.id, e)
                            }
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) =>
                            handleClearNotification(notification.id, e)
                          }
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Clear notification"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => onNavigateToMessage('all')}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                View all communications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={onToggle} />}
    </div>
  );
}
