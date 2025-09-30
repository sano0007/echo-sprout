'use client';

import {
  MessageSquare,
  FileText,
  Filter,
  Search,
  Send,
  Paperclip,
  Image,
  User,
  X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'verifier' | 'creator' | 'admin';
  content: string;
  timestamp: string;
  attachments?: {
    id: string;
    name: string;
    type: 'image' | 'document' | 'pdf';
    url: string;
    size: string;
  }[];
  isRead: boolean;
  messageType: 'message' | 'system' | 'status_update';
  relatedProjectId?: string;
  relatedSubmissionId?: string;
}

interface Conversation {
  id: string;
  projectId: string;
  projectName: string;
  creatorId: string;
  creatorName: string;
  verifierId: string;
  verifierName: string;
  status: 'active' | 'closed' | 'pending_response';
  lastMessage: Message;
  unreadCount: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface CommunicationInterfaceProps {
  currentUserId?: string;
  currentUserRole?: 'verifier' | 'creator' | 'admin';
  conversations?: Conversation[];
  selectedConversation?: Conversation;
  onConversationSelect?: (conversation: Conversation) => void;
  onSendMessage?: (
    conversationId: string,
    content: string,
    attachments?: File[]
  ) => void;
  onMarkAsRead?: (conversationId: string) => void;
  onCloseConversation?: (conversationId: string) => void;
}

const CommunicationInterface: React.FC<CommunicationInterfaceProps> = ({
  currentUserId = 'verifier-1',
  currentUserRole = 'verifier',
  conversations = [],
  selectedConversation,
  onConversationSelect,
  onSendMessage,
  onMarkAsRead,
  onCloseConversation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data for demonstration
  const mockConversations: Conversation[] = [
    {
      id: 'conv-1',
      projectId: 'proj-1',
      projectName: 'Urban Reforestation Initiative',
      creatorId: 'creator-1',
      creatorName: 'EcoGreen Solutions',
      verifierId: 'verifier-1',
      verifierName: 'John Smith',
      status: 'active',
      lastMessage: {
        id: 'msg-3',
        conversationId: 'conv-1',
        senderId: 'creator-1',
        senderName: 'EcoGreen Solutions',
        senderRole: 'creator',
        content:
          "Thank you for the feedback. I've updated the survival rate documentation with more detailed methodology.",
        timestamp: '2024-01-16T14:30:00Z',
        isRead: false,
        messageType: 'message',
      },
      unreadCount: 2,
      priority: 'high',
      category: 'Reforestation',
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2024-01-16T14:30:00Z',
    },
    {
      id: 'conv-2',
      projectId: 'proj-2',
      projectName: 'Solar Farm Development',
      creatorId: 'creator-2',
      creatorName: 'SolarTech Corp',
      verifierId: 'verifier-1',
      verifierName: 'John Smith',
      status: 'pending_response',
      lastMessage: {
        id: 'msg-6',
        conversationId: 'conv-2',
        senderId: 'verifier-1',
        senderName: 'John Smith',
        senderRole: 'verifier',
        content:
          'Could you provide more details about the installation delays? The timeline seems to be off from the original plan.',
        timestamp: '2024-01-15T16:45:00Z',
        isRead: true,
        messageType: 'message',
      },
      unreadCount: 0,
      priority: 'medium',
      category: 'Renewable Energy',
      createdAt: '2024-01-14T11:00:00Z',
      updatedAt: '2024-01-15T16:45:00Z',
    },
  ];

  const mockMessages: Message[] = [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'verifier-1',
      senderName: 'John Smith',
      senderRole: 'verifier',
      content:
        "I've reviewed your Q1 milestone submission. The tree planting numbers look good, but I need clarification on the survival rate methodology.",
      timestamp: '2024-01-15T10:30:00Z',
      isRead: true,
      messageType: 'message',
      relatedProjectId: 'proj-1',
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'creator-1',
      senderName: 'EcoGreen Solutions',
      senderRole: 'creator',
      content:
        'Thank you for the review. The survival rate is calculated based on monthly site visits over the first 6 months. We use GPS mapping to track individual trees.',
      timestamp: '2024-01-15T14:20:00Z',
      attachments: [
        {
          id: 'att-1',
          name: 'survival-rate-methodology.pdf',
          type: 'pdf',
          url: '/documents/survival-rate-methodology.pdf',
          size: '1.2 MB',
        },
      ],
      isRead: true,
      messageType: 'message',
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'creator-1',
      senderName: 'EcoGreen Solutions',
      senderRole: 'creator',
      content:
        "Thank you for the feedback. I've updated the survival rate documentation with more detailed methodology.",
      timestamp: '2024-01-16T14:30:00Z',
      isRead: false,
      messageType: 'message',
    },
  ];

  const displayConversations =
    conversations.length > 0 ? conversations : mockConversations;
  const currentMessages = selectedConversation
    ? mockMessages.filter(
        (msg) => msg.conversationId === selectedConversation.id
      )
    : [];

  const filteredConversations = displayConversations.filter((conv) => {
    const matchesSearch =
      conv.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.creatorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' || conv.status === filterStatus;
    const matchesPriority =
      filterPriority === 'all' || conv.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    if (!selectedConversation) return;

    if (onSendMessage) {
      onSendMessage(selectedConversation.id, newMessage, attachments);
    }

    setNewMessage('');
    setAttachments([]);
  };

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'pending_response':
        return 'text-orange-600 bg-orange-50';
      case 'closed':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
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

  return (
    <div className="flex h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Conversations
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-3 space-y-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending_response">Pending Response</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          )}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onConversationSelect?.(conversation)}
              className={`p-4 border-l-4 ${getPriorityColor(conversation.priority)} cursor-pointer hover:bg-gray-50 ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {conversation.projectName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {conversation.creatorName}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  {conversation.unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {conversation.unreadCount}
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getStatusColor(conversation.status)}`}
                  >
                    {conversation.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {conversation.lastMessage.content}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {formatDate(conversation.lastMessage.timestamp)}
                </span>
                <span className="text-xs text-gray-500">
                  {conversation.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedConversation.projectName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.creatorName} •{' '}
                    {selectedConversation.category}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedConversation.status)}`}
                  >
                    {selectedConversation.status.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() =>
                      onCloseConversation?.(selectedConversation.id)
                    }
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.map((message) => {
                const isOwnMessage = message.senderId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-1' : 'order-2'}`}
                    >
                      {/* Message Bubble */}
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          isOwnMessage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {!isOwnMessage && (
                          <p className="text-xs font-medium mb-1 opacity-75">
                            {message.senderName}
                          </p>
                        )}
                        <p className="text-sm">{message.content}</p>

                        {/* Attachments */}
                        {message.attachments &&
                          message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment) => {
                                const getAttachmentIcon = (type: string) => {
                                  switch (type) {
                                    case 'image':
                                      return Image;
                                    case 'pdf':
                                    case 'document':
                                      return FileText;
                                    default:
                                      return FileText;
                                  }
                                };
                                const AttachmentIcon = getAttachmentIcon(
                                  attachment.type
                                );

                                return (
                                  <div
                                    key={attachment.id}
                                    className={`flex items-center gap-2 p-2 rounded border ${
                                      isOwnMessage
                                        ? 'border-blue-400 bg-blue-500'
                                        : 'border-gray-200 bg-white'
                                    }`}
                                  >
                                    <AttachmentIcon
                                      className={`h-4 w-4 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={`text-xs font-medium truncate ${
                                          isOwnMessage
                                            ? 'text-blue-100'
                                            : 'text-gray-900'
                                        }`}
                                      >
                                        {attachment.name}
                                      </p>
                                      <p
                                        className={`text-xs ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}
                                      >
                                        {attachment.size}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                      </div>

                      {/* Timestamp */}
                      <p
                        className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}
                      >
                        {formatDate(message.timestamp)}
                      </p>
                    </div>

                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 ${
                        isOwnMessage ? 'order-2 ml-2' : 'order-1 mr-2'
                      }`}
                    >
                      <User className="w-full h-full text-gray-600 p-1" />
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              {/* Attachments Preview */}
              {attachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg"
                    >
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <Paperclip className="h-5 w-5" />
                </button>

                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() && attachments.length === 0}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileAttach}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              />
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No conversation selected
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose a conversation to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationInterface;
