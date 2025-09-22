'use client';

import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { v4 as uuidv4 } from 'uuid';

import AnnotationLayer from './AnnotationLayer';
import { Annotation, PDFViewerProps } from './types';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({
  url,
  fileName,
  onAnnotationChange,
  annotations: initialAnnotations = [],
  readOnly = false,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [annotations, setAnnotations] =
    useState<Annotation[]>(initialAnnotations);
  const [activeMode, setActiveMode] = useState<
    'select' | 'highlight' | 'note' | 'issue'
  >('select');
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [pageHeight, setPageHeight] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setIsLoading(false);
      setError(null);
    },
    []
  );

  const onDocumentLoadError = useCallback((error: Error) => {
    setError(`Failed to load PDF: ${error.message}`);
    setIsLoading(false);
  }, []);

  const onPageLoadSuccess = useCallback((page: any) => {
    setPageWidth(page.width);
    setPageHeight(page.height);
  }, []);

  const handleAnnotationAdd = useCallback(
    (annotation: Omit<Annotation, 'id' | 'timestamp'>) => {
      const newAnnotation: Annotation = {
        ...annotation,
        id: uuidv4(),
        timestamp: new Date(),
      };

      const updatedAnnotations = [...annotations, newAnnotation];
      setAnnotations(updatedAnnotations);
      onAnnotationChange?.(updatedAnnotations);
    },
    [annotations, onAnnotationChange]
  );

  const handleAnnotationUpdate = useCallback(
    (id: string, updates: Partial<Annotation>) => {
      const updatedAnnotations = annotations.map((ann) =>
        ann.id === id ? { ...ann, ...updates } : ann
      );
      setAnnotations(updatedAnnotations);
      onAnnotationChange?.(updatedAnnotations);
    },
    [annotations, onAnnotationChange]
  );

  const handleAnnotationDelete = useCallback(
    (id: string) => {
      const updatedAnnotations = annotations.filter((ann) => ann.id !== id);
      setAnnotations(updatedAnnotations);
      onAnnotationChange?.(updatedAnnotations);
    },
    [annotations, onAnnotationChange]
  );

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleResetZoom = useCallback(() => {
    setScale(1.0);
  }, []);

  const handleSave = useCallback(() => {
    // This would typically save to a backend service
    console.log('Saving annotations:', annotations);
    // You can implement actual save logic here
  }, [annotations]);

  const handleClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all annotations?')) {
      setAnnotations([]);
      onAnnotationChange?.([]);
    }
  }, [onAnnotationChange]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, numPages));
  }, [numPages]);

  useEffect(() => {
    setAnnotations(initialAnnotations);
  }, [initialAnnotations]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading PDF
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg overflow-hidden">
      {/* Toolbar */}
      {/*{!readOnly && (*/}
      {/*  <AnnotationToolbar*/}
      {/*    activeMode={activeMode}*/}
      {/*    onModeChange={setActiveMode}*/}
      {/*    onSave={handleSave}*/}
      {/*    onClear={handleClear}*/}
      {/*    scale={scale}*/}
      {/*    onZoomIn={handleZoomIn}*/}
      {/*    onZoomOut={handleZoomOut}*/}
      {/*    onResetZoom={handleResetZoom}*/}
      {/*    annotationCount={annotations.length}*/}
      {/*  />*/}
      {/*)}*/}

      {/* PDF Viewer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Navigation */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              className="p-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-gray-700">
              Page {currentPage} of {numPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage >= numPages}
              className="p-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="text-sm text-gray-600">{fileName}</div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div className="flex justify-center">
            <div className="relative bg-white shadow-lg">
              {isLoading && (
                <div className="flex items-center justify-center h-96 w-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading PDF...</p>
                  </div>
                </div>
              )}

              <Document
                file={url}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading=""
              >
                <div className="relative">
                  <Page
                    pageNumber={currentPage}
                    scale={scale}
                    onLoadSuccess={onPageLoadSuccess}
                    loading=""
                  />

                  {/* Annotation Layer */}
                  {!readOnly && pageWidth > 0 && pageHeight > 0 && (
                    <AnnotationLayer
                      annotations={annotations}
                      pageNumber={currentPage}
                      scale={scale}
                      onAnnotationAdd={handleAnnotationAdd}
                      onAnnotationUpdate={handleAnnotationUpdate}
                      onAnnotationDelete={handleAnnotationDelete}
                      activeMode={activeMode}
                      pageWidth={pageWidth}
                      pageHeight={pageHeight}
                    />
                  )}
                </div>
              </Document>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
