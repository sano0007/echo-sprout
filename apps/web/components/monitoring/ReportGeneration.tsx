'use client';

import { useState } from 'react';
import {
  DocumentChartBarIcon,
  CalendarDaysIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  TableCellsIcon,
  DocumentTextIcon,
  PhotoIcon,
  PresentationChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'project' | 'portfolio' | 'impact' | 'financial' | 'verification' | 'custom';
  sections: string[];
  estimatedTime: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  isCustom: boolean;
}

interface ReportFilter {
  dateRange: {
    start: string;
    end: string;
    preset?: '7d' | '30d' | '90d' | '1y' | 'custom';
  };
  projects: string[];
  projectTypes: string[];
  status: string[];
  verificationStatus: string[];
  regions: string[];
  creators: string[];
}

interface GeneratedReport {
  id: string;
  name: string;
  template: string;
  status: 'generating' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  fileSize?: string;
  downloadUrl?: string;
  error?: string;
}

interface ReportGenerationProps {
  userRole: 'creator' | 'buyer' | 'admin' | 'verifier';
  availableProjects: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    region: string;
    creator: string;
  }>;
  onGenerateReport?: (template: string, filters: ReportFilter, customSections?: string[]) => void;
  onDownloadReport?: (reportId: string) => void;
  onDeleteReport?: (reportId: string) => void;
}

export default function ReportGeneration({
  userRole,
  availableProjects,
  onGenerateReport,
  onDownloadReport,
  onDeleteReport
}: ReportGenerationProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customSections, setCustomSections] = useState<string[]>([]);
  const [filters, setFilters] = useState<ReportFilter>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
      preset: '30d'
    },
    projects: [],
    projectTypes: [],
    status: [],
    verificationStatus: [],
    regions: [],
    creators: []
  });
  const [activeTab, setActiveTab] = useState<'templates' | 'custom' | 'history'>('templates');
  const [showPreview, setShowPreview] = useState(false);
  const [generatedReports] = useState<GeneratedReport[]>([
    {
      id: '1',
      name: 'Monthly Portfolio Report - November 2024',
      template: 'portfolio_summary',
      status: 'completed',
      progress: 100,
      createdAt: '2024-11-01T10:00:00Z',
      completedAt: '2024-11-01T10:05:00Z',
      fileSize: '2.4 MB',
      downloadUrl: '/reports/portfolio-nov-2024.pdf'
    },
    {
      id: '2',
      name: 'Environmental Impact Analysis Q3 2024',
      template: 'impact_assessment',
      status: 'completed',
      progress: 100,
      createdAt: '2024-10-15T14:30:00Z',
      completedAt: '2024-10-15T14:45:00Z',
      fileSize: '5.1 MB',
      downloadUrl: '/reports/impact-q3-2024.pdf'
    },
    {
      id: '3',
      name: 'Project Performance Dashboard',
      template: 'project_performance',
      status: 'generating',
      progress: 65,
      createdAt: '2024-11-25T09:00:00Z'
    }
  ]);

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'project_summary',
      name: 'Project Summary Report',
      description: 'Comprehensive overview of project progress, metrics, and impact',
      category: 'project',
      sections: ['Project Overview', 'Timeline & Milestones', 'Environmental Impact', 'Financial Performance', 'Verification Status'],
      estimatedTime: '3-5 minutes',
      format: 'pdf',
      isCustom: false
    },
    {
      id: 'portfolio_summary',
      name: 'Portfolio Summary',
      description: 'Overview of all investments and carbon credit portfolio performance',
      category: 'portfolio',
      sections: ['Portfolio Overview', 'Asset Allocation', 'Performance Metrics', 'Impact Summary', 'ROI Analysis'],
      estimatedTime: '2-4 minutes',
      format: 'pdf',
      isCustom: false
    },
    {
      id: 'impact_assessment',
      name: 'Environmental Impact Assessment',
      description: 'Detailed analysis of environmental benefits and CO2 offset achievements',
      category: 'impact',
      sections: ['CO2 Offset Summary', 'Biodiversity Impact', 'Additional Benefits', 'Measurement Data', 'Projections'],
      estimatedTime: '5-8 minutes',
      format: 'pdf',
      isCustom: false
    },
    {
      id: 'financial_report',
      name: 'Financial Performance Report',
      description: 'Detailed financial analysis including ROI, costs, and revenue projections',
      category: 'financial',
      sections: ['Revenue Analysis', 'Cost Breakdown', 'ROI Metrics', 'Cash Flow', 'Financial Projections'],
      estimatedTime: '4-6 minutes',
      format: 'excel',
      isCustom: false
    },
    {
      id: 'verification_report',
      name: 'Verification Status Report',
      description: 'Compliance and verification status across all projects',
      category: 'verification',
      sections: ['Verification Overview', 'Compliance Status', 'Audit Results', 'Certification Status', 'Risk Assessment'],
      estimatedTime: '3-5 minutes',
      format: 'pdf',
      isCustom: false
    },
    {
      id: 'project_performance',
      name: 'Project Performance Dashboard',
      description: 'Real-time performance metrics and KPI tracking',
      category: 'project',
      sections: ['KPI Dashboard', 'Progress Tracking', 'Alert Summary', 'Trend Analysis', 'Recommendations'],
      estimatedTime: '2-3 minutes',
      format: 'pdf',
      isCustom: false
    },
    {
      id: 'custom_report',
      name: 'Custom Report',
      description: 'Create a personalized report with your selected sections and filters',
      category: 'custom',
      sections: [],
      estimatedTime: 'Varies',
      format: 'pdf',
      isCustom: true
    }
  ];

  const availableSections = [
    'Project Overview',
    'Timeline & Milestones',
    'Environmental Impact',
    'Financial Performance',
    'Verification Status',
    'Portfolio Overview',
    'Asset Allocation',
    'Performance Metrics',
    'Impact Summary',
    'ROI Analysis',
    'CO2 Offset Summary',
    'Biodiversity Impact',
    'Additional Benefits',
    'Measurement Data',
    'Projections',
    'Revenue Analysis',
    'Cost Breakdown',
    'ROI Metrics',
    'Cash Flow',
    'Financial Projections',
    'Verification Overview',
    'Compliance Status',
    'Audit Results',
    'Certification Status',
    'Risk Assessment',
    'KPI Dashboard',
    'Progress Tracking',
    'Alert Summary',
    'Trend Analysis',
    'Recommendations'
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'project':
        return <ChartBarIcon className="h-5 w-5" />;
      case 'portfolio':
        return <TableCellsIcon className="h-5 w-5" />;
      case 'impact':
        return <PresentationChartBarIcon className="h-5 w-5" />;
      case 'financial':
        return <DocumentChartBarIcon className="h-5 w-5" />;
      case 'verification':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'custom':
        return <Cog6ToothIcon className="h-5 w-5" />;
      default:
        return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'project':
        return 'text-blue-600 bg-blue-100';
      case 'portfolio':
        return 'text-purple-600 bg-purple-100';
      case 'impact':
        return 'text-green-600 bg-green-100';
      case 'financial':
        return 'text-yellow-600 bg-yellow-100';
      case 'verification':
        return 'text-indigo-600 bg-indigo-100';
      case 'custom':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'generating':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleDatePresetChange = (preset: string) => {
    const now = new Date();
    let start: Date;

    switch (preset) {
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return;
    }

    setFilters(prev => ({
      ...prev,
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0],
        preset: preset as any
      }
    }));
  };

  const handleGenerateReport = () => {
    if (!selectedTemplate) return;

    const template = reportTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    onGenerateReport?.(
      selectedTemplate,
      filters,
      template.isCustom ? customSections : undefined
    );
  };

  const selectedTemplateData = reportTemplates.find(t => t.id === selectedTemplate);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Report Generation</h2>
            <p className="text-gray-600 mt-1">Generate comprehensive reports for your projects and portfolio</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <EyeIcon className="h-4 w-4" />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-6">
          {(['templates', 'custom', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Template Selection Tab */}
      {activeTab === 'templates' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Template Selection */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Choose Report Template</h3>
            <div className="grid gap-4">
              {reportTemplates.filter(t => !t.isCustom).map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(template.category)}`}>
                        {getCategoryIcon(template.category)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{template.name}</h4>
                        <p className="text-gray-600 text-sm mt-1">{template.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>⏱ {template.estimatedTime}</span>
                          <span>📄 {template.format.toUpperCase()}</span>
                          <span>📊 {template.sections.length} sections</span>
                        </div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="template"
                      checked={selectedTemplate === template.id}
                      onChange={() => setSelectedTemplate(template.id)}
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5" />
                <span>Report Filters</span>
              </h4>

              {/* Date Range */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {(['7d', '30d', '90d', '1y'] as const).map((preset) => (
                      <button
                        key={preset}
                        onClick={() => handleDatePresetChange(preset)}
                        className={`px-3 py-1 text-xs rounded ${
                          filters.dateRange.preset === preset
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {preset === '7d' ? '7 days' :
                         preset === '30d' ? '30 days' :
                         preset === '90d' ? '90 days' : '1 year'}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value, preset: 'custom' }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value, preset: 'custom' }
                      }))}
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>

                {/* Project Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Projects</label>
                  <select
                    multiple
                    value={filters.projects}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      projects: Array.from(e.target.selectedOptions, option => option.value)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm h-24"
                  >
                    {availableProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>

                {/* Project Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Types</label>
                  <div className="space-y-2">
                    {['reforestation', 'renewable_energy', 'waste_management', 'water_conservation', 'biodiversity'].map((type) => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.projectTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({
                                ...prev,
                                projectTypes: [...prev.projectTypes, type]
                              }));
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                projectTypes: prev.projectTypes.filter(t => t !== type)
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Status</label>
                  <div className="space-y-2">
                    {['planning', 'active', 'completed', 'verified', 'suspended'].map((status) => (
                      <label key={status} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={filters.status.includes(status)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters(prev => ({
                                ...prev,
                                status: [...prev.status, status]
                              }));
                            } else {
                              setFilters(prev => ({
                                ...prev,
                                status: prev.status.filter(s => s !== status)
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm capitalize">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Template Preview */}
            {selectedTemplateData && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h4 className="font-semibold text-gray-800 mb-4">Template Preview</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded ${getCategoryColor(selectedTemplateData.category)}`}>
                      {getCategoryIcon(selectedTemplateData.category)}
                    </div>
                    <div>
                      <h5 className="font-medium">{selectedTemplateData.name}</h5>
                      <p className="text-xs text-gray-600">{selectedTemplateData.estimatedTime}</p>
                    </div>
                  </div>
                  <div>
                    <h6 className="text-sm font-medium text-gray-700 mb-2">Included Sections:</h6>
                    <div className="space-y-1">
                      {selectedTemplateData.sections.map((section, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          <span>{section}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerateReport}
                  disabled={!selectedTemplate}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <DocumentChartBarIcon className="h-4 w-4" />
                  <span>Generate Report</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Report Tab */}
      {activeTab === 'custom' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Create Custom Report</h3>

          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-3">Available Sections</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableSections.map((section) => (
                  <label key={section} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      checked={customSections.includes(section)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCustomSections(prev => [...prev, section]);
                        } else {
                          setCustomSections(prev => prev.filter(s => s !== section));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{section}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-3">Selected Sections ({customSections.length})</h4>
              <div className="border border-gray-200 rounded-lg p-4 min-h-96 max-h-96 overflow-y-auto">
                {customSections.length === 0 ? (
                  <p className="text-gray-500 text-sm">No sections selected. Choose sections from the left panel.</p>
                ) : (
                  <div className="space-y-2">
                    {customSections.map((section, index) => (
                      <div key={section} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-sm">{section}</span>
                        <button
                          onClick={() => setCustomSections(prev => prev.filter(s => s !== section))}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {customSections.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedTemplate('custom_report');
                    onGenerateReport?.('custom_report', filters, customSections);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                >
                  <DocumentChartBarIcon className="h-4 w-4" />
                  <span>Generate Custom Report</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Report History</h3>
            <p className="text-gray-600 text-sm mt-1">View and download your previously generated reports</p>
          </div>

          <div className="divide-y divide-gray-200">
            {generatedReports.map((report) => (
              <div key={report.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(report.status)}
                    <div>
                      <h4 className="font-medium text-gray-800">{report.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>Template: {report.template}</span>
                        <span>•</span>
                        <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                        {report.fileSize && (
                          <>
                            <span>•</span>
                            <span>{report.fileSize}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {report.status === 'generating' && (
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${report.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{report.progress}%</span>
                      </div>
                    )}

                    {report.status === 'completed' && report.downloadUrl && (
                      <button
                        onClick={() => onDownloadReport?.(report.id)}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    )}

                    {report.status === 'failed' && (
                      <div className="text-red-600 text-sm">
                        {report.error || 'Generation failed'}
                      </div>
                    )}

                    <button
                      onClick={() => onDeleteReport?.(report.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {report.status === 'completed' && report.completedAt && (
                  <div className="mt-2 text-xs text-gray-500">
                    Completed: {new Date(report.completedAt).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}