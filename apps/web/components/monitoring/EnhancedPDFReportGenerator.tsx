'use client';

import {
  Download,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  usePDFReports,
  useMonitoringPDFReports,
  useAnalyticsPDFReports,
} from '../../hooks/usePDFReports';
import {
  validateForm,
  pdfReportSchema,
  FormValidator,
} from '../../utils/validation';

interface PDFReportFormData {
  title: string;
  templateType: 'analytics' | 'monitoring';
  reportType: string;
  startDate: string;
  endDate: string;
  period: string;
  filters?: any;
}

export default function EnhancedPDFReportGenerator() {
  const [formData, setFormData] = useState<PDFReportFormData>({
    title: '',
    templateType: 'monitoring',
    reportType: '',
    startDate: '',
    endDate: '',
    period: 'custom',
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [validator] = useState(() => new FormValidator(pdfReportSchema));

  const {
    reports,
    statistics,
    generateReport,
    downloadReport,
    removeReport,
    formatFileSize,
    formatProcessingTime,
    getStatusColor,
    hasProcessingReports,
    getRecentReports,
    isLoading,
  } = usePDFReports();

  const analyticsPDF = useAnalyticsPDFReports();
  const monitoringPDF = useMonitoringPDFReports();

  // Report type options based on template
  const reportTypeOptions = {
    analytics: [
      {
        value: 'comprehensive',
        label: 'Comprehensive Analytics',
        description: 'Complete platform analytics with all metrics',
      },
      {
        value: 'platform',
        label: 'Platform Performance',
        description: 'Platform usage and performance metrics',
      },
      {
        value: 'environmental',
        label: 'Environmental Impact',
        description: 'Environmental metrics and carbon tracking',
      },
      {
        value: 'financial',
        label: 'Financial Analytics',
        description: 'Revenue, transactions, and financial data',
      },
    ],
    monitoring: [
      {
        value: 'system',
        label: 'System Health',
        description: 'System performance and health metrics',
      },
      {
        value: 'project',
        label: 'Project Monitoring',
        description: 'Project progress and status reports',
      },
      {
        value: 'alerts',
        label: 'Alert Summary',
        description: 'System alerts and incident reports',
      },
      {
        value: 'performance',
        label: 'Performance Metrics',
        description: 'Platform and system performance data',
      },
    ],
  };

  // Quick date range options
  const dateRangeOptions = [
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 },
    { label: 'Last 6 months', value: 180 },
    { label: 'Last year', value: 365 },
  ];

  // Handle form input changes with validation
  const handleInputChange = (field: string, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Real-time validation
    validator.setFieldValue(field, value);
    const validation = validateForm(newFormData, pdfReportSchema);
    setValidationErrors(validation.errors);
  };

  // Set quick date range
  const setQuickDateRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    handleInputChange('startDate', startDate.toISOString().split('T')[0]);
    handleInputChange('endDate', endDate.toISOString().split('T')[0]);
    handleInputChange('period', `last_${days}_days`);
  };

  // Generate PDF report
  const handleGenerateReport = async () => {
    const validation = validateForm(formData, pdfReportSchema);
    setValidationErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    setIsGenerating(true);
    try {
      const reportRequest = {
        templateType: formData.templateType,
        reportType: formData.reportType,
        title: formData.title,
        timeframe: {
          start: new Date(formData.startDate),
          end: new Date(formData.endDate),
          period: formData.period,
        },
        filters: formData.filters,
      };

      await generateReport(reportRequest);

      // Reset form
      setFormData({
        title: '',
        templateType: 'monitoring',
        reportType: '',
        startDate: '',
        endDate: '',
        period: 'custom',
      });

      setValidationErrors({});
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-refresh when reports are processing
  useEffect(() => {
    if (hasProcessingReports()) {
      const interval = setInterval(() => {
        // Reports will automatically update via useQuery
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [hasProcessingReports]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            PDF Report Generator
          </h2>
          <p className="text-gray-600">
            Generate comprehensive monitoring and analytics reports
          </p>
        </div>
        {statistics && (
          <div className="flex space-x-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {statistics.total}
              </div>
              <div className="text-gray-500">Total Reports</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {statistics.completed}
              </div>
              <div className="text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {statistics.processing}
              </div>
              <div className="text-gray-500">Processing</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Report Generation Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Generate New Report
          </h3>

          <div className="space-y-4">
            {/* Report Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Monthly Monitoring Report - January 2024"
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.title
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
              />
              {validationErrors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.title}
                </p>
              )}
            </div>

            {/* Template Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Type *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange('templateType', 'monitoring')
                  }
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    formData.templateType === 'monitoring'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <BarChart3 className="h-5 w-5 mb-1" />
                  <div className="font-medium">Monitoring</div>
                  <div className="text-xs text-gray-500">
                    System & project monitoring
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('templateType', 'analytics')}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    formData.templateType === 'analytics'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Settings className="h-5 w-5 mb-1" />
                  <div className="font-medium">Analytics</div>
                  <div className="text-xs text-gray-500">
                    Platform analytics & insights
                  </div>
                </button>
              </div>
            </div>

            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Type *
              </label>
              <select
                value={formData.reportType}
                onChange={(e) =>
                  handleInputChange('reportType', e.target.value)
                }
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.reportType
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
              >
                <option value="">Select report type...</option>
                {reportTypeOptions[formData.templateType].map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
              {validationErrors.reportType && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.reportType}
                </p>
              )}
            </div>

            {/* Quick Date Ranges */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Date Ranges
              </label>
              <div className="flex flex-wrap gap-2">
                {dateRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setQuickDateRange(option.value)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    handleInputChange('startDate', e.target.value)
                  }
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.startDate
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                />
                {validationErrors.startDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.startDate}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.endDate
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-300'
                  }`}
                />
                {validationErrors.endDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.endDate}
                  </p>
                )}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateReport}
              disabled={
                isGenerating || Object.keys(validationErrors).length > 0
              }
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Reports
          </h3>

          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-500 mt-2">Loading reports...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {getRecentReports(10).map((report: any) => (
                <div
                  key={report._id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {report.title}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span className="capitalize">
                          {report.templateType}
                        </span>
                        <span>•</span>
                        <span className="capitalize">
                          {report.reportType.replace('_', ' ')}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(report.requestedAt).toLocaleDateString()}
                        </span>
                      </div>
                      {report.fileSize && (
                        <div className="text-sm text-gray-500 mt-1">
                          Size: {formatFileSize(report.fileSize)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}
                      >
                        {report.status}
                      </span>
                      {report.status === 'completed' && (
                        <button
                          onClick={() => downloadReport(report)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download Report"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeReport(report._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Report"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {report.status === 'processing' && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${report.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {report.progress}% complete
                      </p>
                    </div>
                  )}

                  {report.status === 'failed' && report.errorMessage && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                        <p className="text-sm text-red-700">
                          {report.errorMessage}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {reports.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-300" />
                  <p className="text-gray-500 mt-2">No reports generated yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
