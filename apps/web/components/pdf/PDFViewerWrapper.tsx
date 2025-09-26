'use client';

import SimplePDFViewer from './SimplePDFViewer';
import { PDFViewerProps } from './types';

// Use SimplePDFViewer to avoid SSR issues with react-pdf
const PDFViewerWrapper = (props: PDFViewerProps) => {
  return <SimplePDFViewer {...props} />;
};

export default PDFViewerWrapper;
