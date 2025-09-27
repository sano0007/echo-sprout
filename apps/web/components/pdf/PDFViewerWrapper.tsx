'use client';

import dynamic from 'next/dynamic';
import { PDFViewerProps } from './types';

// Dynamically import the PDF viewer with no SSR to avoid DOMMatrix issues
const EnhancedPDFViewer = dynamic(() => import('./EnhancedPDFViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading PDF viewer...</p>
      </div>
    </div>
  ),
});

const PDFViewerWrapper = (props: PDFViewerProps) => {
  return <EnhancedPDFViewer {...props} />;
};

export default PDFViewerWrapper;
