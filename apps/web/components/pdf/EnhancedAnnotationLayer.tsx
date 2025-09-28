'use client';

import { AlertTriangle, Copy, Edit3, MessageSquare, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

import { Annotation } from './types';

interface EnhancedAnnotationLayerProps {
  annotations: Annotation[];
  pageNumber: number;
  scale: number;
  onAnnotationUpdate: (id: string, updates: Partial<Annotation>) => void;
  onAnnotationDelete: (id: string) => void;
  onAnnotationAdd: (annotation: Omit<Annotation, 'id' | 'timestamp'>) => void;
  activeMode: 'select' | 'highlight' | 'note' | 'issue';
  pageWidth: number;
  pageHeight: number;
  searchResults?: any[];
  currentSearchIndex?: number;
}

interface TextSelection {
  text: string;
  rects: DOMRect[];
  range: Range;
}

export default function EnhancedAnnotationLayer({
  annotations,
  pageNumber,
  scale,
  onAnnotationUpdate,
  onAnnotationDelete,
  onAnnotationAdd,
  activeMode,
  pageWidth,
  pageHeight,
  searchResults = [],
  currentSearchIndex = -1,
}: EnhancedAnnotationLayerProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(
    null
  );
  const [editContent, setEditContent] = useState('');
  const [selectedText, setSelectedText] = useState<TextSelection | null>(null);
  const [showTextMenu, setShowTextMenu] = useState(false);
  const [textMenuPosition, setTextMenuPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(
    null
  );

  const layerRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);

  const pageAnnotations = annotations.filter(
    (ann) => ann.pageNumber === pageNumber
  );

  // Debug logging
  console.log('EnhancedAnnotationLayer Debug:', {
    totalAnnotations: annotations.length,
    pageAnnotations: pageAnnotations.length,
    pageNumber,
    activeMode,
    pageWidth,
    pageHeight,
    scale,
  });

  // Enhanced text selection handler with better positioning and feedback
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setShowTextMenu(false);
      setSelectedText(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const text = range.toString().trim();

    if (!text || text.length < 2) {
      setShowTextMenu(false);
      setSelectedText(null);
      return;
    }

    const layerRect = layerRef.current?.getBoundingClientRect();
    if (!layerRect) return;

    // Get all rects for the selection (handles multi-line selections)
    const rects = Array.from(range.getClientRects());
    if (rects.length === 0) return;

    // Filter rects that are within the PDF page bounds
    const validRects = rects.filter((rect) => {
      const relativeX = (rect.x - layerRect.x) / scale;
      const relativeY = (rect.y - layerRect.y) / scale;
      return (
        relativeX >= 0 &&
        relativeY >= 0 &&
        relativeX < pageWidth &&
        relativeY < pageHeight
      );
    });

    if (validRects.length === 0) return;

    // Convert to relative coordinates
    const adjustedRects = validRects.map((rect) => ({
      ...rect,
      x: (rect.x - layerRect.x) / scale,
      y: (rect.y - layerRect.y) / scale,
      width: rect.width / scale,
      height: rect.height / scale,
    }));

    setSelectedText({
      text,
      rects: adjustedRects as DOMRect[],
      range,
    });

    // Position the text menu at the end of the last selection rect
    const lastRect = validRects[validRects.length - 1];
    if (lastRect) {
      const menuX = Math.min(
        (lastRect.right - layerRect.x) / scale,
        pageWidth - 200 // Ensure menu doesn't go off-page
      );
      const menuY = Math.min(
        (lastRect.bottom - layerRect.y) / scale + 8,
        pageHeight - 100 // Ensure menu doesn't go off-page
      );

      setTextMenuPosition({ x: menuX, y: menuY });
      setShowTextMenu(true);
    }
  }, [scale, pageWidth, pageHeight]);

  // Handle mouse selection for shapes
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (activeMode === 'select') return;

      // Clear text selection menu
      setShowTextMenu(false);
      setSelectedText(null);

      const rect = layerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;

      setIsSelecting(true);
      setSelectionStart({ x, y });
      setSelectionEnd({ x, y });
    },
    [activeMode, scale]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isSelecting || !selectionStart) return;

      const rect = layerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;

      setSelectionEnd({ x, y });
    },
    [isSelecting, selectionStart, scale]
  );

  const handleMouseUp = useCallback(() => {
    if (!isSelecting || !selectionStart || !selectionEnd) {
      setIsSelecting(false);
      setSelectionStart(null);
      setSelectionEnd(null);
      return;
    }

    const minX = Math.min(selectionStart.x, selectionEnd.x);
    const minY = Math.min(selectionStart.y, selectionEnd.y);
    const width = Math.abs(selectionEnd.x - selectionStart.x);
    const height = Math.abs(selectionEnd.y - selectionStart.y);

    // Only create annotation if selection is large enough
    if (width > 15 && height > 15) {
      const newAnnotation: Omit<Annotation, 'id' | 'timestamp'> = {
        type: activeMode as 'highlight' | 'note' | 'issue',
        pageNumber,
        position: { x: minX, y: minY, width, height },
        content: activeMode === 'highlight' ? 'Highlighted area' : '',
        color: getAnnotationColor(activeMode as 'highlight' | 'note' | 'issue'),
        author: 'Current User', // This should come from auth context
      };

      onAnnotationAdd(newAnnotation);
    }

    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [
    isSelecting,
    selectionStart,
    selectionEnd,
    activeMode,
    pageNumber,
    onAnnotationAdd,
  ]);

  // Create annotation from selected text
  const createTextAnnotation = useCallback(
    (type: 'highlight' | 'note' | 'issue') => {
      if (!selectedText) return;

      // Calculate bounding box for all selected text rects
      const minX = Math.min(...selectedText.rects.map((r) => r.x));
      const minY = Math.min(...selectedText.rects.map((r) => r.y));
      const maxX = Math.max(...selectedText.rects.map((r) => r.x + r.width));
      const maxY = Math.max(...selectedText.rects.map((r) => r.y + r.height));

      const newAnnotation = {
        type,
        pageNumber,
        position: {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
        },
        content:
          type === 'highlight'
            ? ''
            : `Comment on: "${selectedText.text.substring(0, 50)}${selectedText.text.length > 50 ? '...' : ''}"`,
        color: getAnnotationColor(type),
        author: 'Current User',
        selectedText: selectedText.text,
        textRects: selectedText.rects, // Store individual text rectangles for better highlighting
      };

      onAnnotationAdd(newAnnotation);
      setShowTextMenu(false);
      setSelectedText(null);

      // Clear the browser selection
      window.getSelection()?.removeAllRanges();

      // Show success feedback
      const actionText = type === 'highlight' ? 'highlighted' : 'annotated';
      toast.success(`Text ${actionText} successfully`);
    },
    [selectedText, pageNumber, onAnnotationAdd]
  );

  const getAnnotationColor = (type: 'highlight' | 'note' | 'issue') => {
    switch (type) {
      case 'highlight':
        return '#fef08a'; // yellow-200
      case 'note':
        return '#bfdbfe'; // blue-200
      case 'issue':
        return '#fecaca'; // red-200
      default:
        return '#e5e7eb'; // gray-200
    }
  };

  const getAnnotationBorderColor = (type: 'highlight' | 'note' | 'issue') => {
    switch (type) {
      case 'highlight':
        return '#eab308'; // yellow-500
      case 'note':
        return '#3b82f6'; // blue-500
      case 'issue':
        return '#ef4444'; // red-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  const handleAnnotationEdit = (annotation: Annotation) => {
    setEditingAnnotation(annotation.id);
    setEditContent(annotation.content);
  };

  const handleEditSave = (annotationId: string) => {
    onAnnotationUpdate(annotationId, { content: editContent });
    setEditingAnnotation(null);
    setEditContent('');
    toast.success('Annotation updated');
  };

  const handleEditCancel = () => {
    setEditingAnnotation(null);
    setEditContent('');
  };

  const handleCopyText = useCallback(() => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText.text);
      toast.success('Text copied to clipboard');
      setShowTextMenu(false);
    }
  }, [selectedText]);

  const renderSelectionBox = () => {
    if (!isSelecting || !selectionStart || !selectionEnd) return null;

    const minX = Math.min(selectionStart.x, selectionEnd.x) * scale;
    const minY = Math.min(selectionStart.y, selectionEnd.y) * scale;
    const width = Math.abs(selectionEnd.x - selectionStart.x) * scale;
    const height = Math.abs(selectionEnd.y - selectionStart.y) * scale;

    return (
      <div
        className="absolute border-2 border-dashed border-blue-500 bg-blue-100 bg-opacity-30 pointer-events-none z-10"
        style={{
          left: minX,
          top: minY,
          width,
          height,
        }}
      />
    );
  };

  const renderTextSelectionMenu = () => {
    if (!showTextMenu || !selectedText) return null;

    const selectedLength = selectedText.text.length;
    const isLongSelection = selectedLength > 100;

    return (
      <div
        className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-3 min-w-[280px]"
        style={{
          left: textMenuPosition.x * scale,
          top: textMenuPosition.y * scale,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Selected text preview */}
        <div className="mb-3 p-2 bg-gray-50 rounded-md">
          <div className="text-xs text-gray-500 mb-1">
            Selected text ({selectedLength} characters):
          </div>
          <div className="text-sm text-gray-700 max-h-16 overflow-y-auto">
            "{selectedText.text.substring(0, 150)}
            {selectedLength > 150 ? '...' : ''}"
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => createTextAnnotation('highlight')}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors flex-1 min-w-0"
            title="Highlight selected text"
          >
            <div className="w-3 h-3 bg-yellow-400 rounded flex-shrink-0"></div>
            <span className="truncate">Highlight</span>
          </button>
          <button
            onClick={() => createTextAnnotation('note')}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors flex-1 min-w-0"
            title="Add comment to selected text"
          >
            <MessageSquare size={14} className="flex-shrink-0" />
            <span className="truncate">Comment</span>
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => createTextAnnotation('issue')}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors flex-1"
            title="Mark selected text as an issue"
          >
            <AlertTriangle size={14} className="flex-shrink-0" />
            <span className="truncate">Mark Issue</span>
          </button>
          <button
            onClick={handleCopyText}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
            title="Copy selected text to clipboard"
          >
            <Copy size={14} />
            <span>Copy</span>
          </button>
        </div>
      </div>
    );
  };

  const renderSearchHighlights = () => {
    return searchResults.map((result, index) => (
      <div
        key={`search-${index}`}
        className="absolute bg-orange-200 border border-orange-400 pointer-events-none"
        style={{
          left: 0, // This would need proper positioning based on search result coordinates
          top: 0,
          width: '100%',
          height: 20 * scale,
          opacity: index === currentSearchIndex ? 0.8 : 0.4,
        }}
      />
    ));
  };

  // Listen for text selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      // Small delay to ensure selection is complete
      setTimeout(handleTextSelection, 10);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () =>
      document.removeEventListener('selectionchange', handleSelectionChange);
  }, [handleTextSelection]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!layerRef.current?.contains(e.target as Node)) {
        setShowTextMenu(false);
        setHoveredAnnotation(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={layerRef}
      className="absolute inset-0 annotation-layer"
      style={{
        width: pageWidth * scale,
        height: pageHeight * scale,
        cursor: activeMode === 'select' ? 'default' : 'crosshair',
        zIndex: 10,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Search Results Highlights */}
      {renderSearchHighlights()}

      {/* Existing Annotations */}
      {pageAnnotations.map((annotation) => (
        <div
          key={annotation.id}
          className="absolute group"
          onMouseEnter={() => setHoveredAnnotation(annotation.id)}
          onMouseLeave={() => setHoveredAnnotation(null)}
        >
          {/* Enhanced Text Highlighting - Render individual text rectangles for better highlighting */}
          {annotation.textRects && annotation.textRects.length > 0 ? (
            annotation.textRects.map((rect, rectIndex) => (
              <div
                key={`${annotation.id}-rect-${rectIndex}`}
                className="absolute pointer-events-none"
                style={{
                  left: rect.x * scale,
                  top: rect.y * scale,
                  width: rect.width * scale,
                  height: rect.height * scale,
                  backgroundColor: annotation.color,
                  opacity: annotation.type === 'highlight' ? 0.4 : 0.2,
                  borderRadius: '2px',
                }}
              />
            ))
          ) : (
            /* Fallback to single annotation box for non-text annotations */
            <div
              className="absolute border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:z-20"
              style={{
                left: annotation.position.x * scale,
                top: annotation.position.y * scale,
                width: annotation.position.width * scale,
                height: annotation.position.height * scale,
                backgroundColor: annotation.color,
                borderColor: getAnnotationBorderColor(annotation.type),
                opacity: annotation.type === 'highlight' ? 0.6 : 0.8,
              }}
            />
          )}

          {/* Annotation Popup - Enhanced with better positioning and content */}
          {hoveredAnnotation === annotation.id && (
            <div
              className="absolute z-40 bg-white border border-gray-200 rounded-lg shadow-xl p-4 min-w-[300px] max-w-[400px]"
              style={{
                left: Math.min(
                  (annotation.position.x + annotation.position.width) * scale +
                    10,
                  pageWidth * scale - 420 // Ensure popup doesn't go off-page
                ),
                top: Math.max(
                  annotation.position.y * scale - 10,
                  10 // Ensure popup doesn't go above page
                ),
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with annotation type and controls */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{
                      backgroundColor: getAnnotationBorderColor(
                        annotation.type
                      ),
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {annotation.type}
                  </span>
                  {annotation.priority && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        annotation.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : annotation.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {annotation.priority}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAnnotationEdit(annotation)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded"
                    title="Edit annotation"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => onAnnotationDelete(annotation.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded"
                    title="Delete annotation"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Selected Text Preview - Enhanced display */}
              {annotation.selectedText && (
                <div className="mb-3 p-3 bg-gray-50 rounded-md border-l-4 border-blue-200">
                  <div className="text-xs text-gray-500 mb-2 font-medium">
                    Selected text:
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    "{annotation.selectedText}"
                  </div>
                </div>
              )}

              {/* Annotation Content */}
              {editingAnnotation === annotation.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Add your comment..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSave(annotation.id)}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {annotation.content ? (
                    <div className="mb-3">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {annotation.content}
                      </p>
                    </div>
                  ) : annotation.type !== 'highlight' ? (
                    <p className="text-sm text-gray-500 italic mb-3">
                      No comment added
                    </p>
                  ) : null}

                  {/* Tags display */}
                  {annotation.tags && annotation.tags.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {annotation.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer with metadata */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span className="font-medium">{annotation.author}</span>
                    <span>
                      {new Date(annotation.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Selection Box for Shape Annotations */}
      {renderSelectionBox()}

      {/* Text Selection Menu */}
      {renderTextSelectionMenu()}
    </div>
  );
}
