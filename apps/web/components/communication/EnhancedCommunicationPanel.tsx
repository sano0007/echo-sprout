'use client';

import {
  Check,
  CheckCheck,
  Filter,
  MoreVertical,
  Paperclip,
  Reply,
  Search,
  Send,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: 'verifier' | 'creator' | 'admin';
  recipientId: string;
  recipientName: string;
  subject: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isRead: boolean;
  threadId?: string;
  parentMessageId?: string;
  attachments?: { url: string; name: string; size: number }[];
  _creationTime: number;
  _updatedTime?: number;
}

interface EnhancedCommunicationPanelProps {
  verification: any;
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
  onSendMessage: (messageData: {
    subject: string;
    message: string;
    recipientId: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    threadId?: string;
    parentMessageId?: string;
  }) => Promise<void>;
  messages: Message[];
  isLoading: boolean;
  projectInfo?: {
    id: string;
    title: string;
    creatorId: string;
    creatorName: string;
  };
}

export default function EnhancedCommunicationPanel({
  verification,
  currentUser,
  onSendMessage,
  messages,
  isLoading,
  projectInfo,
}: EnhancedCommunicationPanelProps) {
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [messagePriority, setMessagePriority] = useState<
    'low' | 'normal' | 'high' | 'urgent'
  >('normal');
  const [isComposing, setIsComposing] = useState(false);
  const [isReplying, setIsReplying] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<
    'all' | 'low' | 'normal' | 'high' | 'urgent'
  >('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>(
    'all'
  );
  const [showFilters, setShowFilters] = useState(false);

  const messageEndRef = useRef<HTMLDivElement>(null);
  const composeRef = useRef<HTMLTextAreaElement>(null);

  // Group messages into threads
  const messageThreads = messages.reduce(
    (threads, message) => {
      const threadId = message.threadId || message._id;
      if (!threads[threadId]) {
        threads[threadId] = [];
      }
      threads[threadId].push(message);
      return threads;
    },
    {} as Record<string, Message[]>
  );

  // Sort threads by latest message
  const sortedThreads = Object.entries(messageThreads)
    .map(([threadId, threadMessages]) => ({
      id: threadId,
      messages: threadMessages.sort(
        (a, b) => a._creationTime - b._creationTime
      ),
      lastMessage: threadMessages.reduce((latest, msg) =>
        msg._creationTime > latest._creationTime ? msg : latest
      ),
      unreadCount: threadMessages.filter(
        (msg) => !msg.isRead && msg.senderId !== currentUser.id
      ).length,
    }))
    .sort((a, b) => b.lastMessage._creationTime - a.lastMessage._creationTime);

  // Filter threads based on search and filters
  const filteredThreads = sortedThreads.filter((thread) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = thread.messages.some(
        (msg) =>
          msg.subject.toLowerCase().includes(searchLower) ||
          msg.message.toLowerCase().includes(searchLower) ||
          msg.senderName.toLowerCase().includes(searchLower)
      );
      if (!matchesSearch) return false;
    }

    // Priority filter
    if (filterPriority !== 'all') {
      const matchesPriority = thread.messages.some(
        (msg) => msg.priority === filterPriority
      );
      if (!matchesPriority) return false;
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'unread' && thread.unreadCount === 0) return false;
      if (filterStatus === 'read' && thread.unreadCount > 0) return false;
    }

    return true;
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (activeThread && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread, messages]);

  // Focus compose area when composing
  useEffect(() => {
    if (isComposing && composeRef.current) {
      composeRef.current.focus();
    }
  }, [isComposing]);

  const handleSendNewMessage = useCallback(async () => {
    if (!newMessage.trim() || !messageSubject.trim()) {
      toast.error('Please enter both subject and message');
      return;
    }

    const recipientId =
      currentUser.role === 'verifier'
        ? projectInfo?.creatorId || verification.creatorId
        : verification.verifierId;

    if (!recipientId) {
      toast.error('Unable to determine message recipient');
      return;
    }

    try {
      await onSendMessage({
        subject: messageSubject,
        message: newMessage,
        recipientId,
        priority: messagePriority,
      });

      setNewMessage('');
      setMessageSubject('');
      setMessagePriority('normal');
      setIsComposing(false);
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  }, [
    newMessage,
    messageSubject,
    messagePriority,
    currentUser.role,
    projectInfo,
    verification,
    onSendMessage,
  ]);

  const handleSendReply = useCallback(
    async (parentMessage: Message) => {
      if (!replyContent.trim()) {
        toast.error('Please enter a reply message');
        return;
      }

      try {
        await onSendMessage({
          subject: `Re: ${parentMessage.subject}`,
          message: replyContent,
          recipientId:
            parentMessage.senderId === currentUser.id
              ? parentMessage.recipientId
              : parentMessage.senderId,
          priority: parentMessage.priority,
          threadId: parentMessage.threadId || parentMessage._id,
          parentMessageId: parentMessage._id,
        });

        setReplyContent('');
        setIsReplying(null);
        toast.success('Reply sent successfully');
      } catch (error) {
        console.error('Error sending reply:', error);
        toast.error('Failed to send reply');
      }
    },
    [replyContent, currentUser.id, onSendMessage]
  );

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

  const getMessageStatusIcon = (message: Message) => {
    if (message.senderId === currentUser.id) {
      return message.isRead ? (
        <CheckCheck className="w-4 h-4 text-blue-500" />
      ) : (
        <Check className="w-4 h-4 text-gray-400" />
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md h-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Project Communication
          </h2>
          {projectInfo && (
            <p className="text-sm text-gray-600 mt-1">
              {projectInfo.title} • {projectInfo.creatorName}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              showFilters ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
            title="Filter messages"
          >
            <Filter className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsComposing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            New Message
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-48">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Message Threads List */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">
              Message Threads ({filteredThreads.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm">No messages found</p>
                {searchTerm && (
                  <p className="text-xs mt-1">
                    Try adjusting your search terms
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {filteredThreads.map((thread) => {
                  const lastMessage = thread.lastMessage;
                  const isSelected = activeThread === thread.id;

                  return (
                    <div
                      key={thread.id}
                      onClick={() => setActiveThread(thread.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-100 border-blue-200'
                          : 'hover:bg-gray-50 border-transparent'
                      } border`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-sm text-gray-900 truncate flex-1">
                          {lastMessage.subject}
                        </h4>
                        {thread.unreadCount > 0 && (
                          <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                            {thread.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600">
                          {lastMessage.senderName}
                        </span>
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded border ${getPriorityColor(lastMessage.priority)}`}
                          >
                            {lastMessage.priority}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 truncate mb-1">
                        {lastMessage.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {formatMessageTime(lastMessage._creationTime)}
                        </span>
                        <div className="flex items-center gap-1">
                          {getMessageStatusIcon(lastMessage)}
                          {thread.messages.length > 1 && (
                            <span className="text-xs text-gray-400">
                              {thread.messages.length} messages
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Message Thread View */}
        <div className="flex-1 flex flex-col">
          {activeThread ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {messageThreads[activeThread]?.[0]?.subject}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {messageThreads[activeThread]?.length} message
                      {messageThreads[activeThread]?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messageThreads[activeThread]?.map((message, index) => {
                  const isOwn = message.senderId === currentUser.id;
                  const showAvatar =
                    index === 0 ||
                    messageThreads[activeThread]?.[index - 1]?.senderId !==
                      message.senderId;

                  return (
                    <div
                      key={message._id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}
                      >
                        {showAvatar && (
                          <div
                            className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                isOwn
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {message.senderName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-gray-600">
                              {message.senderName}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatMessageTime(message._creationTime)}
                            </span>
                          </div>
                        )}

                        <div
                          className={`p-3 rounded-lg ${
                            isOwn
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.message}
                          </p>

                          {message.attachments &&
                            message.attachments.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-opacity-20">
                                {message.attachments.map((attachment, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 text-xs"
                                  >
                                    <Paperclip className="w-3 h-3" />
                                    <span>{attachment.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>

                        <div
                          className={`flex items-center gap-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          {getMessageStatusIcon(message)}
                          <button
                            onClick={() => setIsReplying(message._id)}
                            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                          >
                            <Reply className="w-3 h-3" />
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messageEndRef} />
              </div>

              {/* Reply Box */}
              {isReplying && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Type your reply..."
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <button
                          onClick={() => {
                            setIsReplying(null);
                            setReplyContent('');
                          }}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            const message = messageThreads[activeThread]?.find(
                              (m) => m._id === isReplying
                            );
                            if (message) handleSendReply(message);
                          }}
                          disabled={!replyContent.trim()}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          Send Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">
                  Select a conversation
                </h3>
                <p className="text-sm">
                  Choose a message thread to view the conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Message Modal */}
      {isComposing && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Compose New Message
              </h3>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter message subject..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={messagePriority}
                  onChange={(e) => setMessagePriority(e.target.value as any)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  ref={composeRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Type your message here..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setIsComposing(false);
                  setNewMessage('');
                  setMessageSubject('');
                  setMessagePriority('normal');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNewMessage}
                disabled={!newMessage.trim() || !messageSubject.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
