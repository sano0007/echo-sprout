'use client';

import React, { useMemo, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileIcon,
  FileText,
  Filter,
  Mail,
  MailOpen,
  MessageCircle,
  MessageSquare,
  Paperclip,
  Search,
  Send,
  User,
  XCircle,
} from 'lucide-react';

import type { CommunicationLog } from './types';

interface CommunicationLoggerProps {
  communications: CommunicationLog[];
  verificationId: string;
  currentUserId: string;
  onCommunicationClick?: (communication: CommunicationLog) => void;
  onAttachmentClick?: (attachment: any) => void;
  showFilters?: boolean;
  className?: string;
}

export function CommunicationLogger({
  communications,
  verificationId,
  currentUserId,
  onCommunicationClick,
  onAttachmentClick,
  showFilters = true,
  className = '',
}: CommunicationLoggerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDirections, setSelectedDirections] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupByThread, setGroupByThread] = useState(false);

  const filteredCommunications = useMemo(() => {
    return communications
      .filter((comm) => {
        if (
          searchTerm &&
          !comm.subject?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !comm.content.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !comm.senderName.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !comm.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }

        if (selectedTypes.length > 0 && !selectedTypes.includes(comm.type)) {
          return false;
        }

        if (
          selectedDirections.length > 0 &&
          !selectedDirections.includes(comm.direction)
        ) {
          return false;
        }

        if (
          selectedPriorities.length > 0 &&
          !selectedPriorities.includes(comm.priority)
        ) {
          return false;
        }

        if (
          selectedStatuses.length > 0 &&
          !selectedStatuses.includes(comm.status)
        ) {
          return false;
        }

        if (
          selectedUsers.length > 0 &&
          !selectedUsers.includes(comm.senderId) &&
          !selectedUsers.includes(comm.recipientId)
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [
    communications,
    searchTerm,
    selectedTypes,
    selectedDirections,
    selectedPriorities,
    selectedStatuses,
    selectedUsers,
  ]);

  const groupedCommunications = useMemo(() => {
    if (!groupByThread) {
      return [
        {
          threadId: 'all',
          communications: filteredCommunications,
          subject: 'All Communications',
        },
      ];
    }

    const threads = new Map<string, CommunicationLog[]>();

    filteredCommunications.forEach((comm) => {
      const threadId = comm.threadId || 'no-thread';
      if (!threads.has(threadId)) {
        threads.set(threadId, []);
      }
      threads.get(threadId)!.push(comm);
    });

    return Array.from(threads.entries())
      .map(([threadId, comms]) => ({
        threadId,
        communications: comms.sort((a, b) => a.timestamp - b.timestamp),
        subject: comms[0]?.subject || 'No Subject',
        messageCount: comms.length,
        unreadCount: comms.filter((c) => c.status !== 'read').length,
        lastMessage: comms[comms.length - 1],
      }))
      .sort(
        (a, b) =>
          (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0)
      );
  }, [filteredCommunications, groupByThread]);

  const stats = useMemo(() => {
    const total = filteredCommunications.length;
    const byType = filteredCommunications.reduce(
      (acc, comm) => {
        acc[comm.type] = (acc[comm.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byDirection = filteredCommunications.reduce(
      (acc, comm) => {
        acc[comm.direction] = (acc[comm.direction] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byPriority = filteredCommunications.reduce(
      (acc, comm) => {
        acc[comm.priority] = (acc[comm.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const withAttachments = filteredCommunications.filter(
      (c) => c.attachments && c.attachments.length > 0
    ).length;
    const unreadCount = filteredCommunications.filter(
      (c) => c.status !== 'read'
    ).length;

    return {
      total,
      byType,
      byDirection,
      byPriority,
      withAttachments,
      unreadCount,
    };
  }, [filteredCommunications]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'file_exchange':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'annotation':
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      case 'status_update':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'inbound':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'outbound':
        return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
      default:
        return <ArrowUpRight className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'normal':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'read':
        return <MailOpen className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const exportCommunicationLog = () => {
    const csvContent = [
      [
        'Timestamp',
        'Type',
        'Direction',
        'From',
        'To',
        'Subject',
        'Content',
        'Priority',
        'Status',
        'Attachments',
      ].join(','),
      ...filteredCommunications.map((comm) =>
        [
          format(new Date(comm.timestamp), 'yyyy-MM-dd HH:mm:ss'),
          comm.type,
          comm.direction,
          comm.senderName,
          comm.recipientName,
          `"${(comm.subject || '').replace(/"/g, '""')}"`,
          `"${comm.content.replace(/"/g, '""')}"`,
          comm.priority,
          comm.status,
          (comm.attachments || []).map((a) => a.name).join('; '),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `communication-log-${verificationId}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uniqueUsers = useMemo(() => {
    const users = new Set<string>();
    filteredCommunications.forEach((comm) => {
      users.add(`${comm.senderId}:${comm.senderName}`);
      users.add(`${comm.recipientId}:${comm.recipientName}`);
    });
    return Array.from(users).map((user) => {
      const [id, name] = user.split(':');
      return { id, name };
    });
  }, [filteredCommunications]);

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Communication Log
            </h3>
            <p className="text-sm text-gray-500">
              {stats.total} communications • {stats.unreadCount} unread •{' '}
              {stats.withAttachments} with attachments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCommunicationLog}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={groupByThread}
                onChange={(e) => setGroupByThread(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Group by Thread
            </label>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="border-b border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.byType.message || 0}
            </div>
            <div className="text-sm text-gray-500">Messages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.byType.file_exchange || 0}
            </div>
            <div className="text-sm text-gray-500">File Exchanges</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.byType.annotation || 0}
            </div>
            <div className="text-sm text-gray-500">Annotations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.byType.status_update || 0}
            </div>
            <div className="text-sm text-gray-500">Status Updates</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages, subjects, participants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Filters:
              </span>
            </div>

            <select
              multiple
              value={selectedTypes}
              onChange={(e) =>
                setSelectedTypes(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="message">Messages</option>
              <option value="file_exchange">File Exchange</option>
              <option value="annotation">Annotations</option>
              <option value="status_update">Status Updates</option>
            </select>

            <select
              multiple
              value={selectedDirections}
              onChange={(e) =>
                setSelectedDirections(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Directions</option>
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
            </select>

            <select
              multiple
              value={selectedPriorities}
              onChange={(e) =>
                setSelectedPriorities(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>

            <select
              multiple
              value={selectedStatuses}
              onChange={(e) =>
                setSelectedStatuses(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="read">Read</option>
              <option value="failed">Failed</option>
            </select>

            {(selectedTypes.length > 0 ||
              selectedDirections.length > 0 ||
              selectedPriorities.length > 0 ||
              selectedStatuses.length > 0 ||
              selectedUsers.length > 0) && (
              <button
                onClick={() => {
                  setSelectedTypes([]);
                  setSelectedDirections([]);
                  setSelectedPriorities([]);
                  setSelectedStatuses([]);
                  setSelectedUsers([]);
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Communication Content */}
      <div className="p-6">
        <div className="space-y-4">
          {groupedCommunications.map((group) => (
            <div
              key={group.threadId}
              className="border border-gray-200 rounded-lg"
            >
              {groupByThread && group.threadId !== 'all' && (
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {group.subject}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {group.messageCount} messages • {group.unreadCount}{' '}
                        unread
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(
                        new Date(group.lastMessage?.timestamp || 0),
                        { addSuffix: true }
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="divide-y divide-gray-100">
                {group.communications.map((comm) => (
                  <div
                    key={comm.id}
                    onClick={() => onCommunicationClick?.(comm)}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {getTypeIcon(comm.type)}
                        {getDirectionIcon(comm.direction)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {comm.subject && (
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {comm.subject}
                                </h4>
                              )}
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(comm.priority)}`}
                              >
                                {comm.priority}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {comm.content}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {comm.direction === 'outbound'
                                  ? `To: ${comm.recipientName} (${comm.recipientRole})`
                                  : `From: ${comm.senderName} (${comm.senderRole})`}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(comm.timestamp), {
                                  addSuffix: true,
                                })}
                              </span>
                              {comm.attachments &&
                                comm.attachments.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Paperclip className="h-3 w-3" />
                                    {comm.attachments.length} attachment
                                    {comm.attachments.length !== 1 ? 's' : ''}
                                  </span>
                                )}
                            </div>

                            {comm.attachments &&
                              comm.attachments.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {comm.attachments.map((attachment) => (
                                    <button
                                      key={attachment.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onAttachmentClick?.(attachment);
                                      }}
                                      className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                                    >
                                      <FileIcon className="h-3 w-3" />
                                      {attachment.name}
                                      <span className="text-blue-500">
                                        ({(attachment.size / 1024).toFixed(1)}
                                        KB)
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <div className="text-right text-xs text-gray-500">
                              <div>
                                {format(new Date(comm.timestamp), 'MMM dd')}
                              </div>
                              <div>
                                {format(new Date(comm.timestamp), 'HH:mm')}
                              </div>
                            </div>
                            {getStatusIcon(comm.status)}
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredCommunications.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No communications found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No communications match your current filter criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
