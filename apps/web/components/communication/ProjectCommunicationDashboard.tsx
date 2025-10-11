'use client';

import {
  Bell,
  CheckCircle,
  Clock,
  Folder,
  MessageSquare,
  Search,
  Users,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';

interface ProjectConversation {
  projectId: string;
  projectTitle: string;
  verifierId: string;
  verifierName: string;
  lastMessage: {
    _id: string;
    subject: string;
    message: string;
    senderId: string;
    senderName: string;
    _creationTime: number;
    isRead: boolean;
    priority: 'low' | 'normal' | 'high' | 'urgent';
  };
  unreadCount: number;
  totalMessages: number;
  verificationStatus:
    | 'assigned'
    | 'accepted'
    | 'in_progress'
    | 'completed'
    | 'rejected';
}

interface ProjectCommunicationDashboardProps {
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
  conversations: ProjectConversation[];
  onSelectProject: (projectId: string) => void;
  onMarkAsRead: (projectId: string) => Promise<void>;
  isLoading: boolean;
}

export default function ProjectCommunicationDashboard({
  currentUser,
  conversations,
  onSelectProject,
  onMarkAsRead,
  isLoading,
}: ProjectCommunicationDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'unread' | 'urgent' | 'active'
  >('all');
  const [sortBy, setSortBy] = useState<'recent' | 'project' | 'unread'>(
    'recent'
  );

  // Filter and sort conversations
  const filteredConversations = conversations
    .filter((conversation) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          conversation.projectTitle.toLowerCase().includes(searchLower) ||
          conversation.verifierName.toLowerCase().includes(searchLower) ||
          conversation.lastMessage.subject
            .toLowerCase()
            .includes(searchLower) ||
          conversation.lastMessage.message.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      switch (filterStatus) {
        case 'unread':
          return conversation.unreadCount > 0;
        case 'urgent':
          return (
            conversation.lastMessage.priority === 'urgent' ||
            conversation.lastMessage.priority === 'high'
          );
        case 'active':
          return ['in_progress', 'accepted'].includes(
            conversation.verificationStatus
          );
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'project':
          return a.projectTitle.localeCompare(b.projectTitle);
        case 'unread':
          return b.unreadCount - a.unreadCount;
        case 'recent':
        default:
          return b.lastMessage._creationTime - a.lastMessage._creationTime;
      }
    });

  const totalUnread = conversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0
  );
  const urgentCount = conversations.filter(
    (conv) => conv.lastMessage.priority === 'urgent' && conv.unreadCount > 0
  ).length;

  const formatMessageTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes < 1 ? 'Just now' : `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'accepted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const handleMarkAsRead = useCallback(
    async (projectId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      try {
        await onMarkAsRead(projectId);
        toast.success('Marked as read');
      } catch (error) {
        console.error('Error marking as read:', error);
        toast.error('Failed to mark as read');
      }
    },
    [onMarkAsRead]
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md h-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              Project Communications
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage conversations across all your projects
            </p>
          </div>

          {/* Summary Cards */}
          <div className="flex gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[120px]">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {totalUnread}
                  </p>
                  <p className="text-xs text-gray-600">Unread Messages</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[120px]">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {urgentCount}
                  </p>
                  <p className="text-xs text-gray-600">Urgent Items</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-[120px]">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {conversations.length}
                  </p>
                  <p className="text-xs text-gray-600">Active Projects</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects, verifiers, or messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Conversations</option>
            <option value="unread">Unread Messages</option>
            <option value="urgent">Urgent Items</option>
            <option value="active">Active Verifications</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Sort by Recent</option>
            <option value="project">Sort by Project</option>
            <option value="unread">Sort by Unread</option>
          </select>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              No conversations found
            </h3>
            <p className="text-sm">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No project communications available yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.projectId}
                onClick={() => onSelectProject(conversation.projectId)}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Project Title and Status */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conversation.projectTitle}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded border ${getStatusColor(conversation.verificationStatus)}`}
                      >
                        {conversation.verificationStatus.replace('_', ' ')}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          {conversation.unreadCount} new
                        </span>
                      )}
                    </div>

                    {/* Verifier Info */}
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Verifier: {conversation.verifierName}
                      </span>
                    </div>

                    {/* Last Message */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm text-gray-900 truncate flex-1">
                          {conversation.lastMessage.subject}
                        </h4>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded border ${getPriorityColor(conversation.lastMessage.priority)}`}
                        >
                          {conversation.lastMessage.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {conversation.lastMessage.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {conversation.lastMessage.senderName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatMessageTime(
                            conversation.lastMessage._creationTime
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Conversation Stats */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {conversation.totalMessages} message
                          {conversation.totalMessages !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {conversation.unreadCount > 0 && (
                        <button
                          onClick={(e) =>
                            handleMarkAsRead(conversation.projectId, e)
                          }
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
