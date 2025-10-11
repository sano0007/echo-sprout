'use client';

import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Search,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Document, Page, pdfjs } from 'react-pdf';
import { v4 as uuidv4 } from 'uuid';

import AnnotationToolbar from './AnnotationToolbar';
import EnhancedAnnotationLayer from './EnhancedAnnotationLayer';
import { Annotation, PDFViewerProps } from './types';

// Configure PDF.js worker with better error handling
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

export default function EnhancedPDFViewer({
  url,
  fileName,
  onAnnotationChange,
  annotations: initialAnnotations = [],
  readOnly = false,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [annotations, setAnnotations] =
    useState<Annotation[]>(initialAnnotations);
  const [activeMode, setActiveMode] = useState<
    'select' | 'highlight' | 'note' | 'issue'
  >('select');
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [pageHeight, setPageHeight] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState<number>(0);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [pdfDocument, setPdfDocument] = useState<any>(null);

  const documentRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<{ [key: number]: HTMLDivElement }>({});

  const onDocumentLoadSuccess = useCallback((pdf: any) => {
    setNumPages(pdf.numPages);
    setPdfDocument(pdf);
    setIsLoading(false);
    setError(null);
    toast.success(`PDF loaded successfully (${pdf.numPages} pages)`);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF Load Error:', error);
    setError(`Failed to load PDF: ${error.message}`);
    setIsLoading(false);
    toast.error('Failed to load PDF document');
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

      // Log annotation for verification audit trail
      if (annotation.type !== 'highlight') {
        toast.success(`${annotation.type} annotation added`);
      }
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
      toast.success('Annotation updated');
    },
    [annotations, onAnnotationChange]
  );

  const handleAnnotationDelete = useCallback(
    (id: string) => {
      const updatedAnnotations = annotations.filter((ann) => ann.id !== id);
      setAnnotations(updatedAnnotations);
      onAnnotationChange?.(updatedAnnotations);
      toast.success('Annotation deleted');
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
    setScale(1.2);
  }, []);

  const handleSave = useCallback(() => {
    // This will be integrated with the verification service
    onAnnotationChange?.(annotations);
    toast.success(`Saved ${annotations.length} annotations`);
  }, [annotations, onAnnotationChange]);

  const handleClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all annotations?')) {
      setAnnotations([]);
      onAnnotationChange?.([]);
      toast.success('All annotations cleared');
    }
  }, [onAnnotationChange]);

  const goToPrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, numPages));
  }, [numPages]);

  const goToPage = useCallback(
    (pageNumber: number) => {
      if (pageNumber >= 1 && pageNumber <= numPages) {
        setCurrentPage(pageNumber);
      }
    },
    [numPages]
  );

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim() || !pdfDocument) return;

    setIsSearching(true);
    try {
      const results: any[] = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        const textItems = textContent.items;

        let pageText = '';
        textItems.forEach((item: any) => {
          pageText += item.str + ' ';
        });

        const searchRegex = new RegExp(searchTerm, 'gi');
        let match;
        while ((match = searchRegex.exec(pageText)) !== null) {
          results.push({
            page: pageNum,
            text: match[0],
            index: match.index,
            context: pageText.substring(
              Math.max(0, match.index - 50),
              match.index + 50
            ),
          });
        }
      }

      setSearchResults(results);
      setCurrentSearchIndex(0);

      if (results.length > 0) {
        goToPage(results[0].page);
        toast.success(`Found ${results.length} result(s)`);
      } else {
        toast('No results found');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, pdfDocument, numPages, goToPage]);

  const navigateSearchResults = useCallback(
    (direction: 'next' | 'prev') => {
      if (searchResults.length === 0) return;

      let newIndex;
      if (direction === 'next') {
        newIndex = (currentSearchIndex + 1) % searchResults.length;
      } else {
        newIndex =
          currentSearchIndex === 0
            ? searchResults.length - 1
            : currentSearchIndex - 1;
      }

      setCurrentSearchIndex(newIndex);
      goToPage(searchResults[newIndex].page);
    },
    [searchResults, currentSearchIndex, goToPage]
  );

  const handleDownload = useCallback(() => {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [url, fileName]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'f':
            e.preventDefault();
            document.getElementById('search-input')?.focus();
            break;
          case '=':
          case '+':
            e.preventDefault();
            handleZoomIn();
            break;
          case '-':
            e.preventDefault();
            handleZoomOut();
            break;
          case '0':
            e.preventDefault();
            handleResetZoom();
            break;
        }
      } else {
        switch (e.key) {
          case 'ArrowLeft':
            goToPrevPage();
            break;
          case 'ArrowRight':
            goToNextPage();
            break;
          case 'Escape':
            setActiveMode('select');
            break;
        }
      }
    },
    [handleZoomIn, handleZoomOut, handleResetZoom, goToPrevPage, goToNextPage]
  );

  useEffect(() => {
    setAnnotations(initialAnnotations);
  }, [initialAnnotations]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center p-8">
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Error Loading PDF
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Debug: Log component state
  console.log('PDF Viewer Debug:', {
    readOnly,
    shouldShowToolbar: !readOnly,
    pageWidth,
    pageHeight,
    annotationsCount: annotations.length,
    currentPage,
    numPages,
  });

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
      {/* Enhanced Toolbar */}
      {!readOnly && (
        <AnnotationToolbar
          activeMode={activeMode}
          onModeChange={setActiveMode}
          onSave={handleSave}
          onClear={handleClear}
          scale={scale}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
          annotationCount={annotations.length}
        />
      )}

      {/* Enhanced Header with Search */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        {/* Page Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className="flex items-center justify-center w-8 h-8 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
              className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max={numPages}
            />
            <span className="text-sm text-gray-600">of {numPages}</span>
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= numPages}
            className="flex items-center justify-center w-8 h-8 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Search Controls */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              id="search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search in document..."
              className="w-64 pl-8 pr-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          <button
            onClick={handleSearch}
            disabled={isSearching || !searchTerm.trim()}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>

          {searchResults.length > 0 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateSearchResults('prev')}
                className="p-1 text-gray-600 hover:text-gray-800"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-600">
                {currentSearchIndex + 1} of {searchResults.length}
              </span>
              <button
                onClick={() => navigateSearchResults('next')}
                className="p-1 text-gray-600 hover:text-gray-800"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Document Actions */}
        <div className="flex items-center gap-2">
          <div
            className="text-sm text-gray-600 max-w-xs truncate"
            title={fileName}
          >
            {fileName}
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            title="Download PDF"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Enhanced PDF Content */}
      <div className="flex-1 overflow-auto bg-gray-100">
        <div className="flex justify-center p-6">
          <div
            ref={documentRef}
            className="relative bg-white shadow-xl rounded-lg overflow-hidden"
            style={{
              maxWidth: '100%',
              filter: isLoading ? 'blur(2px)' : 'none',
              transition: 'filter 0.3s ease',
            }}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading PDF...</p>
                  <p className="text-sm text-gray-500 mt-1">Please wait...</p>
                </div>
              </div>
            )}

            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
              className="pdf-document"
            >
              <div className="relative">
                <Page
                  pageNumber={currentPage}
                  scale={scale}
                  onLoadSuccess={onPageLoadSuccess}
                  loading=""
                  className="pdf-page"
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                />

                {/* Enhanced Annotation Layer */}
                {pageWidth > 0 && pageHeight > 0 && (
                  <EnhancedAnnotationLayer
                    annotations={annotations}
                    pageNumber={currentPage}
                    scale={scale}
                    onAnnotationAdd={handleAnnotationAdd}
                    onAnnotationUpdate={handleAnnotationUpdate}
                    onAnnotationDelete={handleAnnotationDelete}
                    activeMode={activeMode}
                    pageWidth={pageWidth}
                    pageHeight={pageHeight}
                    searchResults={searchResults.filter(
                      (r) => r.page === currentPage
                    )}
                    currentSearchIndex={searchResults.findIndex(
                      (_, i) => i === currentSearchIndex
                    )}
                  />
                )}
              </div>
            </Document>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-t border-gray-200 text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span>
            Page {currentPage} of {numPages}
          </span>
          <span>Zoom: {Math.round(scale * 100)}%</span>
          {!readOnly && (
            <span>
              {annotations.length} annotation
              {annotations.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {searchResults.length > 0 && (
            <span>
              {searchResults.length} search result
              {searchResults.length !== 1 ? 's' : ''}
            </span>
          )}
          <span className="text-xs">Use Ctrl+F to search, ← → to navigate</span>
        </div>
      </div>
    </div>
  );
}
