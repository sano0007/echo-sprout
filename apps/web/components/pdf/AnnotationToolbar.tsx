'use client';

import {
  AlertTriangle,
  Highlighter,
  MessageSquare,
  MousePointer,
  RotateCcw,
  Save,
  Trash2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

import { AnnotationToolbarProps } from './types';

interface ExtendedAnnotationToolbarProps extends AnnotationToolbarProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  annotationCount: number;
}

export default function AnnotationToolbar({
  activeMode,
  onModeChange,
  onSave,
  onClear,
  scale,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  annotationCount,
}: ExtendedAnnotationToolbarProps) {
  const tools = [
    {
      mode: 'select' as const,
      icon: MousePointer,
      label: 'Select',
      color: 'bg-gray-100 text-gray-800',
    },
    {
      mode: 'highlight' as const,
      icon: Highlighter,
      label: 'Highlight',
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      mode: 'note' as const,
      icon: MessageSquare,
      label: 'Note',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      mode: 'issue' as const,
      icon: AlertTriangle,
      label: 'Issue',
      color: 'bg-red-100 text-red-800',
    },
  ];

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      {/* Annotation Tools */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 mr-2">Tools:</span>
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeMode === tool.mode;
          return (
            <button
              key={tool.mode}
              onClick={() => onModeChange(tool.mode)}
              className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
                isActive
                  ? tool.color + ' ring-2 ring-offset-1 ring-gray-300'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
              title={tool.label}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 mr-2">Zoom:</span>
        <button
          onClick={onZoomOut}
          className="p-2 rounded bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          className="p-2 rounded bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={onResetZoom}
          className="p-2 rounded bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
          title="Reset Zoom"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 mr-2">
          {annotationCount} annotation{annotationCount !== 1 ? 's' : ''}
        </span>
        <button
          onClick={onClear}
          className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          disabled={annotationCount === 0}
        >
          <Trash2 size={16} />
          <span className="hidden sm:inline">Clear</span>
        </button>
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-3 py-2 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Save size={16} />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>
    </div>
  );
}
