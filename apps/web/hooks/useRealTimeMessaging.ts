'use client';

import { useQuery } from 'convex/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { api } from '@packages/backend';

interface UseRealTimeMessagingProps {
  verificationId?: string;
  projectId?: string;
  userId: string;
  onNewMessage?: (message: any) => void;
  onMessageUpdate?: (messageId: string, updates: any) => void;
}

export function useRealTimeMessaging({
  verificationId,
  projectId,
  userId,
  onNewMessage,
  onMessageUpdate,
}: UseRealTimeMessagingProps) {
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const [lastNotificationTime, setLastNotificationTime] = useState(0);

  // Subscribe to messages for verification
  const verificationMessages = useQuery(
    api.verificationMessages.getMessagesByVerification,
    verificationId ? { verificationId: verificationId as any } : 'skip'
  );

  // Subscribe to user notifications
  const notifications = useQuery(api.notifications.getUserNotifications, {
    limit: 50,
    unreadOnly: false,
  });

  const messages = verificationMessages || [];

  // Handle new messages
  useEffect(() => {
    if (messages && messages.length > lastMessageCount) {
      const newMessages = messages.slice(lastMessageCount);

      newMessages.forEach((message: any) => {
        // Only show notifications for messages from others
        if (message.senderId !== userId) {
          const messageTime = message._creationTime;

          // Avoid duplicate notifications
          if (messageTime > lastNotificationTime) {
            // Show toast notification
            const isUrgent =
              message.priority === 'urgent' || message.priority === 'high';

            if (isUrgent) {
              toast(`${message.senderName}: ${message.subject}`, {
                icon: '🚨',
                duration: 6000,
                style: {
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                },
              });
            } else {
              toast(`New message from ${message.senderName}`, {
                icon: '💬',
                duration: 4000,
                style: {
                  background: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #dbeafe',
                },
              });
            }

            // Call callback if provided
            onNewMessage?.(message);

            setLastNotificationTime(messageTime);
          }
        }
      });

      setLastMessageCount(messages.length);
    }
  }, [messages, lastMessageCount, userId, onNewMessage, lastNotificationTime]);

  // Handle message updates (read status, etc.)
  useEffect(() => {
    if (messages) {
      messages.forEach((message: any) => {
        // Call update callback if provided
        onMessageUpdate?.(message._id, message);
      });
    }
  }, [messages, onMessageUpdate]);

  // Typing indicator state
  const [typingUsers, setTypingUsers] = useState<{ [userId: string]: string }>(
    {}
  );

  const startTyping = useCallback(
    (conversationId: string) => {
      // In a real implementation, this would send a typing indicator to other users
      // For now, we'll just manage local state
      setTypingUsers((prev) => ({
        ...prev,
        [userId]: conversationId,
      }));

      // Clear typing indicator after 3 seconds of inactivity
      setTimeout(() => {
        setTypingUsers((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }, 3000);
    },
    [userId]
  );

  const stopTyping = useCallback(() => {
    setTypingUsers((prev) => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  }, [userId]);

  // Connection status
  const [isConnected, setIsConnected] = useState(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Simulate connection monitoring
  useEffect(() => {
    const checkConnection = () => {
      // In a real implementation, this would check WebSocket connection
      if (!navigator.onLine) {
        setIsConnected(false);
        toast.error(
          'Connection lost. Messages may not sync until reconnected.'
        );
      } else if (!isConnected) {
        setIsConnected(true);
        setReconnectAttempts(0);
        toast.success('Connection restored. Syncing messages...');
      }
    };

    const handleOnline = () => {
      checkConnection();
    };

    const handleOffline = () => {
      setIsConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isConnected]);

  // Auto-reconnect logic
  useEffect(() => {
    if (!isConnected && reconnectAttempts < 5) {
      const timeout = setTimeout(
        () => {
          setReconnectAttempts((prev) => prev + 1);
          setIsConnected(true); // Try to reconnect
        },
        Math.pow(2, reconnectAttempts) * 1000
      ); // Exponential backoff

      return () => clearTimeout(timeout);
    }
  }, [isConnected, reconnectAttempts]);

  // Message status tracking
  const [messageStatuses, setMessageStatuses] = useState<{
    [messageId: string]: 'sending' | 'sent' | 'delivered' | 'read';
  }>({});

  const updateMessageStatus = useCallback(
    (messageId: string, status: 'sending' | 'sent' | 'delivered' | 'read') => {
      setMessageStatuses((prev) => ({
        ...prev,
        [messageId]: status,
      }));
    },
    []
  );

  // Unread count tracking
  const unreadCount =
    messages?.filter(
      (message: any) => !message.isRead && message.senderId !== userId
    ).length || 0;

  const urgentCount =
    messages?.filter(
      (message: any) =>
        !message.isRead &&
        message.senderId !== userId &&
        (message.priority === 'urgent' || message.priority === 'high')
    ).length || 0;

  return {
    messages: messages || [],
    notifications: notifications || [],
    unreadCount,
    urgentCount,
    isConnected,
    reconnectAttempts,
    typingUsers,
    startTyping,
    stopTyping,
    messageStatuses,
    updateMessageStatus,
    isLoading: !messages,
  };
}
