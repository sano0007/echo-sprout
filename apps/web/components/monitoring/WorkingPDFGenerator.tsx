'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FileText,
  Download,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Calendar,
  Filter,
  Settings,
  Loader2,
  Trash2
} from 'lucide-react';
import { api } from '@packages/backend/convex/_generated/api';

// Validation schema for PDF report requests
const reportRequestSchema = z.object({
  templateType: z.enum(['analytics', 'monitoring']),
  reportType: z.string().min(1, 'Report type is required'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  timeframe: z.object({
    start: z.date(),
    end: z.date(),
    period: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'custom'])
  }),
  filters: z.object({
    projectIds: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    severity: z.array(z.string()).optional(),
    status: z.array(z.string()).optional()
  }).optional()
});

type ReportRequestForm = z.infer<typeof reportRequestSchema>;

interface PDFReport {
  _id: string;
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

const WorkingPDFGenerator: React.FC = () => {
  const { user } = useUser();
  const [showForm, setShowForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<PDFReport | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Fetch reports
  const reports = useQuery(api.pdf_reports.getPDFReports, {}) || [];
  const statistics = useQuery(api.pdf_reports.getReportStatistics, {});

  // Mutations
  const createReport = useMutation(api.pdf_reports.createPDFReportRequest);
  const deleteReport = useMutation(api.pdf_reports.deletePDFReport);

  // Form setup
  const form = useForm<ReportRequestForm>({
    resolver: zodResolver(reportRequestSchema),
    defaultValues: {
      templateType: 'monitoring',
      reportType: 'system',
      title: '',
      timeframe: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date(),
        period: 'monthly'
      },
      filters: {}
    }
  });

  // Report type options based on template type
  const reportTypeOptions = {
    monitoring: [
      { value: 'system', label: 'System Monitoring Report', description: 'Overall system health and performance' },
      { value: 'project', label: 'Project Monitoring Report', description: 'Project progress and status tracking' },
      { value: 'alerts', label: 'Alerts Report', description: 'Alert management and resolution analysis' },
      { value: 'performance', label: 'Performance Report', description: 'System performance metrics and trends' }
    ],
    analytics: [
      { value: 'comprehensive', label: 'Comprehensive Analytics', description: 'Complete platform analytics overview' },
      { value: 'platform', label: 'Platform Analytics', description: 'Platform usage and engagement metrics' },
      { value: 'environmental', label: 'Environmental Impact', description: 'Environmental impact and sustainability metrics' },
      { value: 'financial', label: 'Financial Analytics', description: 'Financial performance and revenue analysis' }
    ]
  };

  // Filter reports based on selected filters
  const filteredReports = reports.filter(report => {
    if (filterStatus !== 'all' && report.status !== filterStatus) return false;
    if (filterType !== 'all' && report.templateType !== filterType) return false;
    return true;
  });

  // Handle form submission
  const handleCreateReport = async (data: ReportRequestForm) => {
    try {
      await createReport({
        templateType: data.templateType,
        reportType: data.reportType,
        title: data.title,
        timeframe: {
          start: data.timeframe.start.getTime(),
          end: data.timeframe.end.getTime(),
          period: data.timeframe.period
        },
        filters: data.filters
      });
      
      setShowForm(false);
      form.reset();
    } catch (error) {
      console.error('Failed to create report:', error);
    }
  };

  // Handle report download
  const handleDownload = (report: PDFReport) => {
    if (report.status === 'completed' && report.fileUrl) {
      // Create a working download link
      const link = document.createElement('a');
      link.href = report.fileUrl;
      link.download = `${report.title.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle report deletion
  const handleDelete = async (reportId: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await deleteReport({ reportId });
      } catch (error) {
        console.error('Failed to delete report:', error);
      }
    }
  };

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
      case 'processing':
        return { icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'pending':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'failed':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' };
      default:
        return { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Format processing time
  const formatProcessingTime = (startTime: number, endTime?: number) => {
    if (!endTime) return 'Processing...';
    const duration = endTime - startTime;
    const minutes = Math.floor(duration / (1000 * 60));
    return minutes > 0 ? `${minutes}m` : 'Less than 1m';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">PDF Report Generator</h2>
          <p className="text-gray-600">Generate comprehensive monitoring and analytics reports</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FileText className="h-4 w-4" />
          Generate Report
        </button>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold">{statistics.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{statistics.completed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-2xl font-bold">{statistics.processing}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Avg. Time</p>
                <p className="text-2xl font-bold">
                  {Math.round(statistics.averageProcessingTime / 1000 / 60)}m
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="monitoring">Monitoring</option>
              <option value="analytics">Analytics</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white border rounded-lg">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Generated Reports</h3>
        </div>
        <div className="divide-y">
          {filteredReports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No reports found</p>
              <p className="text-sm">Generate your first report to get started</p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const statusInfo = getStatusInfo(report.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div key={report._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{report.title}</h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                          {report.status === 'processing' ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <StatusIcon className="h-3 w-3" />
                          )}
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                        <span>{report.templateType} - {report.reportType}</span>
                        <span>Requested: {new Date(report.requestedAt).toLocaleDateString()}</span>
                        {report.fileSize && (
                          <span>Size: {formatFileSize(report.fileSize)}</span>
                        )}
                        {report.completedAt && (
                          <span>
                            Processing time: {formatProcessingTime(report.requestedAt, report.completedAt)}
                          </span>
                        )}
                      </div>
                      {report.status === 'processing' && (
                        <div className="mb-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Progress: {report.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${report.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {report.errorMessage && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                          <p className="text-sm text-red-800">{report.errorMessage}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {report.status === 'completed' && (
                        <>
                          <button
                            onClick={() => handleDownload(report)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(report._id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Report Generation Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Generate New Report</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={form.handleSubmit(handleCreateReport)} className="space-y-6">
              {/* Template Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Category *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      {...form.register('templateType')}
                      value="monitoring"
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Monitoring</div>
                      <div className="text-sm text-gray-600">System and project monitoring reports</div>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      {...form.register('templateType')}
                      value="analytics"
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Analytics</div>
                      <div className="text-sm text-gray-600">Platform analytics and insights</div>
                    </div>
                  </label>
                </div>
                {form.formState.errors.templateType && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.templateType.message}
                  </p>
                )}
              </div>

              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type *
                </label>
                <select
                  {...form.register('reportType')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select report type...</option>
                  {reportTypeOptions[form.watch('templateType')]?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {form.formState.errors.reportType && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.reportType.message}
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Title *
                </label>
                <input
                  {...form.register('title')}
                  type="text"
                  placeholder="Enter report title..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              {/* Timeframe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Period *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                    <input
                      {...form.register('timeframe.start', { valueAsDate: true })}
                      type="date"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End Date</label>
                    <input
                      {...form.register('timeframe.end', { valueAsDate: true })}
                      type="date"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Period</label>
                    <select
                      {...form.register('timeframe.period')}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {form.formState.isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </div>
                  ) : (
                    'Generate Report'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold">Report Preview</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h4 className="text-lg font-semibold mb-2">{selectedReport.title}</h4>
                <p className="text-gray-600 mb-4">
                  {selectedReport.templateType} - {selectedReport.reportType}
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => handleDownload(selectedReport)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkingPDFGenerator;