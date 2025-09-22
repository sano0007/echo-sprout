'use client';

import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useCallback, useState } from 'react';

import { Annotation, PDFViewerProps } from './types';

const SimplePDFViewer = ({
  url,
  fileName,
  annotations = [],
  onAnnotationChange,
}: PDFViewerProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [selectedTool, setSelectedTool] = useState<
    'select' | 'highlight' | 'note' | 'issue'
  >('select');

  const totalPages = 5; // Mock total pages for demo

  const handlePreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(200, prev + 25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(50, prev - 25));
  }, []);

  const handleAnnotationAdd = useCallback(
    (annotation: Annotation) => {
      onAnnotationChange([...annotations, annotation]);
    },
    [annotations, onAnnotationChange]
  );

  const handleAnnotationUpdate = useCallback(
    (id: string, updates: Partial<Annotation>) => {
      const updatedAnnotations = annotations.map((ann) =>
        ann.id === id ? { ...ann, ...updates } : ann
      );
      onAnnotationChange(updatedAnnotations);
    },
    [annotations, onAnnotationChange]
  );

  const handleAnnotationDelete = useCallback(
    (id: string) => {
      const filteredAnnotations = annotations.filter((ann) => ann.id !== id);
      onAnnotationChange(filteredAnnotations);
    },
    [annotations, onAnnotationChange]
  );

  const handleSaveAnnotations = useCallback(() => {
    console.log('Saving annotations:', annotations);
    // Here you would typically save to your backend
  }, [annotations]);

  const handleClearAnnotations = useCallback(() => {
    onAnnotationChange([]);
  }, [onAnnotationChange]);

  const handleResetZoom = useCallback(() => {
    setZoom(100);
  }, []);

  const handlePDFClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (selectedTool === 'select') return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      const newAnnotation: Annotation = {
        id: `annotation-${Date.now()}`,
        type: selectedTool as 'highlight' | 'note' | 'issue',
        pageNumber: currentPage,
        position: {
          x: Math.max(0, Math.min(95, x - 2.5)), // Center the annotation
          y: Math.max(0, Math.min(95, y - 2.5)),
          width: 5,
          height: 5,
        },
        content: `${selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)} annotation`,
        color:
          selectedTool === 'highlight'
            ? '#fef08a'
            : selectedTool === 'note'
              ? '#bfdbfe'
              : '#fecaca',
        author: 'Current User',
        timestamp: new Date(),
        selectedText: '',
      };

      handleAnnotationAdd(newAnnotation);
    },
    [selectedTool, currentPage, handleAnnotationAdd]
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Toolbar */}
      {/*<AnnotationToolbar*/}
      {/*  activeMode={selectedTool}*/}
      {/*  onModeChange={setSelectedTool}*/}
      {/*  onSave={handleSaveAnnotations}*/}
      {/*  onClear={handleClearAnnotations}*/}
      {/*  scale={zoom / 100}*/}
      {/*  onZoomIn={handleZoomIn}*/}
      {/*  onZoomOut={handleZoomOut}*/}
      {/*  onResetZoom={handleResetZoom}*/}
      {/*  annotationCount={annotations.length}*/}
      {/*/>*/}

      {/* PDF Viewer Area */}
      <div className="flex-1 flex flex-col">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
              {fileName}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Page Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleZoomOut}
                className="p-1 rounded hover:bg-gray-200"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                {zoom}%
              </span>

              <button
                onClick={handleZoomIn}
                className="p-1 rounded hover:bg-gray-200"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Download Button */}
            <a
              href={url}
              download={fileName}
              className="p-2 rounded hover:bg-gray-200 text-gray-600"
              title="Download PDF"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* PDF Content Area */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div className="max-w-4xl mx-auto">
            {/* PDF Placeholder */}
            <div
              className={`bg-white shadow-lg mx-auto relative ${
                selectedTool === 'select'
                  ? 'cursor-default'
                  : selectedTool === 'highlight'
                    ? 'cursor-text'
                    : selectedTool === 'note'
                      ? 'cursor-pointer'
                      : 'cursor-crosshair'
              }`}
              style={{
                width: `${((8.5 * zoom) / 100) * 96}px`,
                height: `${((11 * zoom) / 100) * 96}px`,
                minHeight: '600px',
              }}
              onClick={handlePDFClick}
            >
              {/* Embedded PDF using iframe */}
              <iframe
                src={`${url}#page=${currentPage}&zoom=${zoom}`}
                className="w-full h-full border-0"
                title={fileName}
              />

              {/* Annotation Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {annotations
                  .filter((ann) => ann.pageNumber === currentPage)
                  .map((annotation) => (
                    <div
                      key={annotation.id}
                      className={`absolute pointer-events-auto cursor-pointer ${
                        annotation.type === 'highlight'
                          ? 'bg-yellow-300 bg-opacity-50'
                          : annotation.type === 'note'
                            ? 'bg-blue-300 bg-opacity-50'
                            : 'bg-red-300 bg-opacity-50'
                      }`}
                      style={{
                        left: `${annotation.position.x}%`,
                        top: `${annotation.position.y}%`,
                        width: `${annotation.position.width}%`,
                        height: `${annotation.position.height}%`,
                      }}
                      title={annotation.content}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-600">
        {annotations.length} annotation{annotations.length !== 1 ? 's' : ''} •
        Tool: {selectedTool} • Zoom: {zoom}%
      </div>
    </div>
  );
};

export default SimplePDFViewer;
