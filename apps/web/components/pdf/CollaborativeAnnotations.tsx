'use client';

import { CheckCircle, MessageCircle, User } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

import { Annotation, AnnotationReply } from './types';

interface CollaborativeAnnotationsProps {
  annotations: Annotation[];
  onAnnotationUpdate: (id: string, updates: Partial<Annotation>) => void;
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
  readOnly?: boolean;
}

export default function CollaborativeAnnotations({
  annotations,
  onAnnotationUpdate,
  currentUser,
  readOnly = false,
}: CollaborativeAnnotationsProps) {
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(
    null
  );
  const [replyContent, setReplyContent] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unresolved' | 'mine'>(
    'all'
  );
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'page'>('date');

  const filteredAnnotations = annotations
    .filter((annotation) => {
      switch (filterType) {
        case 'unresolved':
          return !annotation.isResolved;
        case 'mine':
          return annotation.author === currentUser.name;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (
            (priorityOrder[b.priority || 'low'] || 1) -
            (priorityOrder[a.priority || 'low'] || 1)
          );
        }
        case 'page':
          return a.pageNumber - b.pageNumber;
        default:
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
      }
    });

  const handleAddReply = useCallback(
    (annotationId: string) => {
      if (!replyContent.trim()) return;

      const annotation = annotations.find((ann) => ann.id === annotationId);
      if (!annotation) return;

      const newReply: AnnotationReply = {
        id: uuidv4(),
        content: replyContent.trim(),
        author: currentUser.name,
        timestamp: new Date(),
        type: 'reply',
      };

      const updatedReplies = [...(annotation.replies || []), newReply];

      onAnnotationUpdate(annotationId, { replies: updatedReplies });
      setReplyContent('');
      toast.success('Reply added');
    },
    [replyContent, annotations, onAnnotationUpdate, currentUser.name]
  );

  const handleResolveAnnotation = useCallback(
    (annotationId: string) => {
      const annotation = annotations.find((ann) => ann.id === annotationId);
      if (!annotation) return;

      const resolutionReply: AnnotationReply = {
        id: uuidv4(),
        content: `Marked as resolved by ${currentUser.name}`,
        author: currentUser.name,
        timestamp: new Date(),
        type: 'resolution',
      };

      const updatedReplies = [...(annotation.replies || []), resolutionReply];

      onAnnotationUpdate(annotationId, {
        isResolved: !annotation.isResolved,
        replies: updatedReplies,
      });

      toast.success(
        annotation.isResolved ? 'Annotation reopened' : 'Annotation resolved'
      );
    },
    [annotations, onAnnotationUpdate, currentUser.name]
  );

  const handleSetPriority = useCallback(
    (annotationId: string, priority: 'low' | 'medium' | 'high') => {
      onAnnotationUpdate(annotationId, { priority });
      toast.success(`Priority set to ${priority}`);
    },
    [onAnnotationUpdate]
  );

  const getPriorityColor = (priority?: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: 'highlight' | 'note' | 'issue') => {
    switch (type) {
      case 'highlight':
        return '🖍️';
      case 'note':
        return '📝';
      case 'issue':
        return '⚠️';
      default:
        return '📌';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Annotations
        </h3>

        {/* Filters */}
        <div className="space-y-2">
          <div className="flex gap-1">
            {['all', 'unresolved', 'mine'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter as any)}
                className={`px-2 py-1 text-xs rounded ${
                  filterType === filter
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter === 'all'
                  ? 'All'
                  : filter === 'unresolved'
                    ? 'Unresolved'
                    : 'Mine'}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="date">Sort by Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="page">Sort by Page</option>
          </select>
        </div>

        <div className="mt-2 text-sm text-gray-600">
          {filteredAnnotations.length} annotation
          {filteredAnnotations.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Annotations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredAnnotations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm">No annotations found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredAnnotations.map((annotation) => (
              <div
                key={annotation.id}
                className={`p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedAnnotation === annotation.id
                    ? 'bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() =>
                  setSelectedAnnotation(
                    selectedAnnotation === annotation.id ? null : annotation.id
                  )
                }
              >
                {/* Annotation Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getTypeIcon(annotation.type)}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Page {annotation.pageNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {annotation.author} •{' '}
                        {formatTimestamp(annotation.timestamp)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {annotation.priority && (
                      <span
                        className={`px-1.5 py-0.5 text-xs rounded border ${getPriorityColor(annotation.priority)}`}
                      >
                        {annotation.priority}
                      </span>
                    )}
                    {annotation.isResolved && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>

                {/* Selected Text */}
                {annotation.selectedText && (
                  <div className="mb-2 p-2 bg-gray-50 rounded text-xs">
                    <div className="text-gray-500 mb-1">Selected text:</div>
                    <div className="text-gray-700 italic">
                      "{annotation.selectedText}"
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="text-sm text-gray-700 mb-2">
                  {annotation.content || (
                    <span className="italic text-gray-500">No comment</span>
                  )}
                </div>

                {/* Replies Count */}
                {annotation.replies && annotation.replies.length > 0 && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {annotation.replies.length} repl
                    {annotation.replies.length === 1 ? 'y' : 'ies'}
                  </div>
                )}

                {/* Expanded Details */}
                {selectedAnnotation === annotation.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {/* Action Buttons */}
                    {!readOnly && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolveAnnotation(annotation.id);
                          }}
                          className={`px-2 py-1 text-xs rounded ${
                            annotation.isResolved
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {annotation.isResolved ? 'Reopen' : 'Resolve'}
                        </button>

                        {['low', 'medium', 'high'].map((priority) => (
                          <button
                            key={priority}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetPriority(annotation.id, priority as any);
                            }}
                            className={`px-2 py-1 text-xs rounded ${
                              annotation.priority === priority
                                ? getPriorityColor(priority as any)
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {priority}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Replies */}
                    {annotation.replies && annotation.replies.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {annotation.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className={`p-2 rounded text-xs ${
                              reply.type === 'resolution'
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <User className="h-3 w-3" />
                              <span className="font-medium">
                                {reply.author}
                              </span>
                              <span className="text-gray-500">
                                {formatTimestamp(reply.timestamp)}
                              </span>
                              {reply.type === 'resolution' && (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              )}
                            </div>
                            <div className="text-gray-700">{reply.content}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Reply */}
                    {!readOnly && !annotation.isResolved && (
                      <div className="space-y-2">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Add a reply..."
                          className="w-full p-2 text-xs border border-gray-300 rounded resize-none"
                          rows={2}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddReply(annotation.id);
                            }}
                            disabled={!replyContent.trim()}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            Reply
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReplyContent('');
                            }}
                            className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Total annotations:</span>
            <span>{annotations.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Unresolved:</span>
            <span>{annotations.filter((a) => !a.isResolved).length}</span>
          </div>
          <div className="flex justify-between">
            <span>High priority:</span>
            <span>
              {annotations.filter((a) => a.priority === 'high').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
