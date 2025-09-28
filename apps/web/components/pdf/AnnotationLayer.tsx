'use client';

import { AlertTriangle, Edit3, MessageSquare, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

import { Annotation } from './types';

interface AnnotationLayerProps {
  annotations: Annotation[];
  pageNumber: number;
  scale: number;
  onAnnotationUpdate: (id: string, updates: Partial<Annotation>) => void;
  onAnnotationDelete: (id: string) => void;
  onAnnotationAdd: (annotation: Omit<Annotation, 'id' | 'timestamp'>) => void;
  activeMode: 'select' | 'highlight' | 'note' | 'issue';
  pageWidth: number;
  pageHeight: number;
}

export default function AnnotationLayer({
  annotations,
  pageNumber,
  scale,
  onAnnotationUpdate,
  onAnnotationDelete,
  onAnnotationAdd,
  activeMode,
  pageWidth,
  pageHeight,
}: AnnotationLayerProps) {
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
  const layerRef = useRef<HTMLDivElement>(null);

  const pageAnnotations = annotations.filter(
    (ann) => ann.pageNumber === pageNumber
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (activeMode === 'select') return;

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
    if (width > 10 && height > 10) {
      const newAnnotation: Omit<Annotation, 'id' | 'timestamp'> = {
        type: activeMode as 'highlight' | 'note' | 'issue',
        pageNumber,
        position: { x: minX, y: minY, width, height },
        content: activeMode === 'highlight' ? 'Highlighted text' : '',
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
  };

  const handleEditCancel = () => {
    setEditingAnnotation(null);
    setEditContent('');
  };

  const renderSelectionBox = () => {
    if (!isSelecting || !selectionStart || !selectionEnd) return null;

    const minX = Math.min(selectionStart.x, selectionEnd.x) * scale;
    const minY = Math.min(selectionStart.y, selectionEnd.y) * scale;
    const width = Math.abs(selectionEnd.x - selectionStart.x) * scale;
    const height = Math.abs(selectionEnd.y - selectionStart.y) * scale;

    return (
      <div
        className="absolute border-2 border-dashed border-blue-500 bg-blue-100 bg-opacity-30 pointer-events-none"
        style={{
          left: minX,
          top: minY,
          width,
          height,
        }}
      />
    );
  };

  return (
    <div
      ref={layerRef}
      className="absolute inset-0 cursor-crosshair"
      style={{ width: pageWidth * scale, height: pageHeight * scale }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Existing Annotations */}
      {pageAnnotations.map((annotation) => (
        <div key={annotation.id} className="absolute group">
          {/* Annotation Box */}
          <div
            className="absolute border-2 cursor-pointer transition-all duration-200 hover:shadow-lg"
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

          {/* Annotation Icon */}
          {annotation.type !== 'highlight' && (
            <div
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-md"
              style={{
                left:
                  (annotation.position.x + annotation.position.width) * scale -
                  12,
                top: annotation.position.y * scale - 12,
                backgroundColor: getAnnotationBorderColor(annotation.type),
              }}
            >
              {annotation.type === 'note' ? (
                <MessageSquare size={12} />
              ) : (
                <AlertTriangle size={12} />
              )}
            </div>
          )}

          {/* Annotation Tooltip/Editor */}
          <div
            className="absolute z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto"
            style={{
              left: annotation.position.x * scale,
              top:
                (annotation.position.y + annotation.position.height) * scale +
                8,
              minWidth: 200,
              maxWidth: 300,
            }}
          >
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 capitalize">
                  {annotation.type}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAnnotationEdit(annotation)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    onClick={() => onAnnotationDelete(annotation.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>

              {editingAnnotation === annotation.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded resize-none"
                    rows={3}
                    placeholder="Add your comment..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSave(annotation.id)}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-700 mb-1">
                    {annotation.content || 'No comment'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {annotation.author} •{' '}
                    {new Date(annotation.timestamp).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Selection Box */}
      {renderSelectionBox()}
    </div>
  );
}
