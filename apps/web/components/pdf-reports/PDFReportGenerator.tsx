'use client';

import { useState } from 'react';
import {
  Download,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { Id } from '@packages/backend/convex/_generated/dataModel';

interface PDFReport {
  _id: Id<'pdf_reports'>;
  templateType: 'analytics' | 'monitoring';
  reportType: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  requestedAt: number;
  completedAt?: number;
  errorMessage?: string;
  fileUrl?: string;
  fileSize?: number;
}

interface PDFReportGeneratorProps {
  templateType: 'analytics' | 'monitoring';
  reportType: string;
  title: string;
  timeframe: {
    start: Date;
    end: Date;
    period: string;
  };
  filters?: any;
  onReportGenerated?: (report: PDFReport) => void;
}

export default function PDFReportGenerator({
  templateType,
  reportType,
  title,
  timeframe,
  filters,
  onReportGenerated,
}: PDFReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<PDFReport | null>(
    null
  );

  const createReportRequest = useMutation(
    api.pdf_reports.createPDFReportRequest
  );

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);

      const reportId = await createReportRequest({
        templateType,
        reportType,
        title,
        timeframe: {
          start: timeframe.start.getTime(),
          end: timeframe.end.getTime(),
          period: timeframe.period,
        },
        filters,
      });

      // Start polling for status updates
      pollReportStatus(reportId);
    } catch (error) {
      console.error('Failed to generate report:', error);
      setIsGenerating(false);
    }
  };

  const pollReportStatus = async (reportId: Id<'pdf_reports'>) => {
    const pollInterval = setInterval(async () => {
      try {
        // This would need to be implemented as a query
        // const report = await getReport({ reportId });

        // For now, simulate the polling behavior
        // In a real implementation, you'd query the report status
        setTimeout(() => {
          const mockReport: PDFReport = {
            _id: reportId,
            templateType,
            reportType,
            title,
            status: 'completed',
            progress: 100,
            requestedAt: Date.now(),
            completedAt: Date.now(),
            fileUrl: `/api/pdf-reports/${reportId}/download`,
            fileSize: 2048000,
          };

          setGeneratedReport(mockReport);
          setIsGenerating(false);
          onReportGenerated?.(mockReport);
          clearInterval(pollInterval);
        }, 3000);
      } catch (error) {
        console.error('Failed to poll report status:', error);
        clearInterval(pollInterval);
        setIsGenerating(false);
      }
    }, 1000);

    // Clear interval after 5 minutes to prevent infinite polling
    setTimeout(() => clearInterval(pollInterval), 5 * 60 * 1000);
  };

  const handleDownload = () => {
    if (generatedReport?.fileUrl) {
      const link = document.createElement('a');
      link.href = generatedReport.fileUrl;
      link.download = `${title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
      case 'pending':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'processing':
      case 'pending':
        return 'text-blue-600 bg-blue-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-gray-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600">
              {templateType.charAt(0).toUpperCase() + templateType.slice(1)}{' '}
              Report
            </p>
          </div>
        </div>

        {!isGenerating && !generatedReport && (
          <button
            onClick={handleGenerateReport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span>Generate PDF</span>
          </button>
        )}
      </div>

      {/* Report Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-600">Type:</span>
          <span className="ml-2 font-medium">{reportType}</span>
        </div>
        <div>
          <span className="text-gray-600">Period:</span>
          <span className="ml-2 font-medium">{timeframe.period}</span>
        </div>
        <div className="col-span-2">
          <span className="text-gray-600">Date Range:</span>
          <span className="ml-2 font-medium">
            {timeframe.start.toLocaleDateString()} -{' '}
            {timeframe.end.toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Generation Status */}
      {isGenerating && (
        <div className="border-t pt-4">
          <div className="flex items-center space-x-3 mb-3">
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            <span className="text-sm font-medium text-gray-700">
              Generating PDF Report...
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '60%' }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            This may take a few minutes depending on the data size and
            complexity.
          </p>
        </div>
      )}

      {/* Generated Report */}
      {generatedReport && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(generatedReport.status)}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    Report Generated
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(generatedReport.status)}`}
                  >
                    {generatedReport.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {generatedReport.completedAt && (
                    <span>
                      Completed:{' '}
                      {new Date(generatedReport.completedAt).toLocaleString()}
                    </span>
                  )}
                  {generatedReport.fileSize && (
                    <span className="ml-4">
                      Size: {formatFileSize(generatedReport.fileSize)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {generatedReport.status === 'completed' &&
              generatedReport.fileUrl && (
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              )}
          </div>

          {generatedReport.status === 'failed' &&
            generatedReport.errorMessage && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  <strong>Error:</strong> {generatedReport.errorMessage}
                </p>
              </div>
            )}
        </div>
      )}

      {/* Filters Applied */}
      {filters && Object.keys(filters).length > 0 && (
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Applied Filters:
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => (
              <span
                key={key}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { PDFReportGenerator };
export type { PDFReportGeneratorProps, PDFReport };
