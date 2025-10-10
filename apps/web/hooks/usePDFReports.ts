'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { Id } from '@packages/backend/convex/_generated/dataModel';

export interface PDFReportRequest {
  templateType: 'analytics' | 'monitoring';
  reportType: string;
  title: string;
  timeframe: {
    start: Date;
    end: Date;
    period: string;
  };
  filters?: any;
}

export interface PDFReport {
  _id: Id<'pdf_reports'>;
  templateType: 'analytics' | 'monitoring';
  reportType: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  requestedBy: string;
  requestedAt: number;
  completedAt?: number;
  errorMessage?: string;
  fileUrl?: string;
  fileSize?: number;
  expiresAt: number;
  timeframe: {
    start: number;
    end: number;
    period: string;
  };
  filters?: any;
  userInfo: {
    userId: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface PDFReportStatistics {
  total: number;
  completed: number;
  pending: number;
  processing: number;
  failed: number;
  analytics: number;
  monitoring: number;
  averageProcessingTime: number;
}

export function usePDFReports() {
  const [activePolling, setActivePolling] = useState<Set<Id<'pdf_reports'>>>(new Set());

  // Queries
  const reports = useQuery(api.pdf_reports.getPDFReports, {});
  const statistics = useQuery(api.pdf_reports.getReportStatistics, {});

  // Mutations
  const createReportRequest = useMutation(api.pdf_reports.createPDFReportRequest);
  const deleteReport = useMutation(api.pdf_reports.deletePDFReport);

  // Generate a new PDF report
  const generateReport = async (request: PDFReportRequest): Promise<Id<'pdf_reports'>> => {
    try {
      const reportId = await createReportRequest({
        templateType: request.templateType,
        reportType: request.reportType,
        title: request.title,
        timeframe: {
          start: request.timeframe.start.getTime(),
          end: request.timeframe.end.getTime(),
          period: request.timeframe.period,
        },
        filters: request.filters,
      });

      // Start polling for this report
      startPolling(reportId);

      return reportId;
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  };

  // Download a completed report
  const downloadReport = (report: PDFReport) => {
    if (report.status === 'completed' && report.fileUrl) {
      const link = document.createElement('a');
      link.href = report.fileUrl;
      link.download = `${report.title.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Delete a report
  const removeReport = async (reportId: Id<'pdf_reports'>) => {
    try {
      await deleteReport({ reportId });
      stopPolling(reportId);
    } catch (error) {
      console.error('Failed to delete report:', error);
      throw error;
    }
  };

  // Start polling for report status updates
  const startPolling = (reportId: Id<'pdf_reports'>) => {
    setActivePolling(prev => new Set(prev).add(reportId));
  };

  // Stop polling for a specific report
  const stopPolling = (reportId: Id<'pdf_reports'>) => {
    setActivePolling(prev => {
      const newSet = new Set(prev);
      newSet.delete(reportId);
      return newSet;
    });
  };

  // Get reports by status
  const getReportsByStatus = (status: PDFReport['status']) => {
    return reports?.filter((report: any) => report.status === status) || [];
  };

  // Get reports by template type
  const getReportsByType = (templateType: 'analytics' | 'monitoring') => {
    return reports?.filter((report: any) => report.templateType === templateType) || [];
  };

  // Get report by ID
  const getReport = (reportId: Id<'pdf_reports'>) => {
    return reports?.find((report: any) => report._id === reportId);
  };

  // Check if any reports are currently processing
  const hasProcessingReports = () => {
    return reports?.some((report: any) => ['pending', 'processing'].includes(report.status)) || false;
  };

  // Get the most recent reports
  const getRecentReports = (limit: number = 10) => {
    return reports
      ?.sort((a: any, b: any) => b.requestedAt - a.requestedAt)
      ?.slice(0, limit) || [];
  };

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Format processing time
  const formatProcessingTime = (startTime: number, endTime?: number) => {
    if (!endTime) return 'In progress...';

    const duration = endTime - startTime;
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Get status badge color
  const getStatusColor = (status: PDFReport['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Effect to stop polling when reports are completed
  useEffect(() => {
    if (reports) {
      reports.forEach((report: any) => {
        if (activePolling.has(report._id) && ['completed', 'failed'].includes(report.status)) {
          stopPolling(report._id);
        }
      });
    }
  }, [reports, activePolling]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      setActivePolling(new Set());
    };
  }, []);

  return {
    // Data
    reports: reports || [],
    statistics,

    // Actions
    generateReport,
    downloadReport,
    removeReport,

    // Polling control
    startPolling,
    stopPolling,
    activePolling,

    // Getters
    getReportsByStatus,
    getReportsByType,
    getReport,
    getRecentReports,

    // Status checks
    hasProcessingReports,

    // Utilities
    formatFileSize,
    formatProcessingTime,
    getStatusColor,

    // Loading states
    isLoading: reports === undefined,
    statisticsLoading: statistics === undefined,
  };
}

// Hook for analytics-specific PDF reports
export function useAnalyticsPDFReports() {
  const pdfReports = usePDFReports();

  const generateAnalyticsReport = (
    reportType: 'comprehensive' | 'platform' | 'environmental' | 'financial',
    title: string,
    timeframe: PDFReportRequest['timeframe'],
    filters?: any
  ) => {
    return pdfReports.generateReport({
      templateType: 'analytics',
      reportType,
      title,
      timeframe,
      filters,
    });
  };

  return {
    ...pdfReports,
    reports: pdfReports.getReportsByType('analytics'),
    generateAnalyticsReport,
  };
}

// Hook for monitoring-specific PDF reports
export function useMonitoringPDFReports() {
  const pdfReports = usePDFReports();

  const generateMonitoringReport = (
    reportType: 'system' | 'project' | 'alerts' | 'performance',
    title: string,
    timeframe: PDFReportRequest['timeframe'],
    filters?: any
  ) => {
    return pdfReports.generateReport({
      templateType: 'monitoring',
      reportType,
      title,
      timeframe,
      filters,
    });
  };

  return {
    ...pdfReports,
    reports: pdfReports.getReportsByType('monitoring'),
    generateMonitoringReport,
  };
}