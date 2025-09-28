'use client';

import { format } from 'date-fns';
import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  MessageSquare,
  Shield,
  XCircle,
} from 'lucide-react';

import type { ReportTemplate, VerificationReport } from './types';

// Safe date formatting helper
const formatDateSafely = (
  date: string | number | Date | null | undefined,
  formatString: string = 'PPP'
): string => {
  if (!date) return 'Not specified';

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return format(dateObj, formatString);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

interface VerificationReportGeneratorProps {
  verificationId: string;
  projectData: any;
  verificationResults: any;
  auditData: any;
  communicationData: any;
  onGenerateReport: (report: VerificationReport) => void;
  onExportReport: (format: 'pdf' | 'html' | 'json') => void;
  className?: string;
}

export function VerificationReportGenerator({
  verificationId,
  projectData,
  verificationResults,
  auditData,
  communicationData,
  onGenerateReport,
  onExportReport,
  className = '',
}: VerificationReportGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [includeAuditTrail, setIncludeAuditTrail] = useState(true);
  const [includeCommunications, setIncludeCommunications] = useState(true);
  const [includeDocuments, setIncludeDocuments] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] =
    useState<VerificationReport | null>(null);

  const templates: ReportTemplate[] = [
    {
      id: 'standard',
      name: 'Standard Report',
      description:
        'Comprehensive verification report with all standard sections',
      type: 'standard',
      sections: [],
      styling: {
        theme: 'professional',
        colors: { primary: '#2563eb', secondary: '#64748b', accent: '#10b981' },
        fonts: { heading: 'Inter', body: 'Inter', monospace: 'JetBrains Mono' },
      },
    },
    {
      id: 'detailed',
      name: 'Detailed Report',
      description:
        'In-depth analysis with technical details and recommendations',
      type: 'detailed',
      sections: [],
      styling: {
        theme: 'academic',
        colors: { primary: '#1e40af', secondary: '#475569', accent: '#059669' },
        fonts: {
          heading: 'Merriweather',
          body: 'Source Sans Pro',
          monospace: 'Source Code Pro',
        },
      },
    },
    {
      id: 'summary',
      name: 'Executive Summary',
      description: 'High-level overview focused on key findings and decisions',
      type: 'summary',
      sections: [],
      styling: {
        theme: 'minimal',
        colors: { primary: '#374151', secondary: '#6b7280', accent: '#f59e0b' },
        fonts: {
          heading: 'Poppins',
          body: 'Open Sans',
          monospace: 'Fira Code',
        },
      },
    },
    {
      id: 'compliance',
      name: 'Compliance Report',
      description: 'Focused on regulatory compliance and audit requirements',
      type: 'compliance',
      sections: [],
      styling: {
        theme: 'default',
        colors: { primary: '#7c3aed', secondary: '#64748b', accent: '#dc2626' },
        fonts: { heading: 'Roboto', body: 'Roboto', monospace: 'Roboto Mono' },
      },
    },
  ];

  const reportMetrics = useMemo(() => {
    const overallScore = verificationResults?.qualityScore || 0;
    const totalDocuments = verificationResults?.documents?.length || 0;
    const verifiedDocuments =
      verificationResults?.documents?.filter((d: any) => d.verified === true)
        .length || 0;
    const totalMessages = communicationData?.messages?.length || 0;
    const urgentMessages =
      communicationData?.messages?.filter((m: any) => m.priority === 'urgent')
        .length || 0;
    const auditEvents = auditData?.events?.length || 0;
    const criticalEvents =
      auditData?.events?.filter((e: any) => e.severity === 'critical').length ||
      0;

    return {
      overallScore,
      totalDocuments,
      verifiedDocuments,
      totalMessages,
      urgentMessages,
      auditEvents,
      criticalEvents,
      status:
        overallScore >= 80
          ? 'approved'
          : overallScore >= 60
            ? 'revision_required'
            : 'rejected',
    };
  }, [verificationResults, projectData, communicationData, auditData]);

  const generateReport = async () => {
    setIsGenerating(true);

    try {
      const report: VerificationReport = {
        id: `report_${Date.now()}`,
        verificationId,
        projectId: projectData.id,
        projectName: projectData.name,
        projectDescription: projectData.description,
        submittedAt: projectData.submissionDate || Date.now(),
        verifiedAt: Date.now(),
        verifierInfo: {
          id: verificationResults.verifierId || 'unknown_verifier',
          name: verificationResults.verifierName || 'Unknown Verifier',
          email: verificationResults.verifierEmail || '',
          role: verificationResults.verifierRole || 'Verification Specialist',
          credentials: verificationResults.verifierCredentials || [
            'Certified Project Auditor',
            'Academic Assessment Expert',
            'Quality Assurance Specialist',
          ],
          organization:
            verificationResults.verifierOrganization ||
            'Independent Verification Authority',
        },
        projectCreatorInfo: {
          id: projectData.creatorId || 'unknown',
          name: projectData.creatorName || 'Unknown Creator',
          email: projectData.creatorEmail || '',
          organization: projectData.organization || '',
        },
        verificationResults: {
          overallScore: reportMetrics.overallScore,
          status: reportMetrics.status as any,
          categories: verificationResults?.categories || [],
          summary: verificationResults?.summary || generateSummary(),
          recommendations:
            verificationResults?.recommendations || generateRecommendations(),
          strengths: verificationResults?.strengths || generateStrengths(),
          weaknesses: verificationResults?.weaknesses || generateWeaknesses(),
        },
        documents:
          verificationResults.documents?.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            type: doc.type,
            status: doc.verified ? 'verified' : 'pending',
            comments: doc.comments || [],
            annotations: doc.annotations || 0,
          })) || [],
        communications: {
          totalMessages: reportMetrics.totalMessages,
          urgentMessages: reportMetrics.urgentMessages,
          lastCommunication: communicationData.lastMessage?.timestamp || 0,
          keyDecisions: communicationData.decisions || [],
        },
        auditTrail: {
          totalEvents: reportMetrics.auditEvents,
          criticalEvents: reportMetrics.criticalEvents,
          timeline: auditData.timeline || [],
        },
        metadata: {
          duration:
            Date.now() -
            new Date(projectData.submissionDate || Date.now()).getTime(),
          complexity: projectData.metadata?.complexity || getComplexityLevel(),
          riskLevel: projectData.metadata?.riskLevel || getRiskLevel(),
          compliance: projectData.compliance || [],
          tags: projectData.tags || [],
        },
        generatedAt: Date.now(),
        reportVersion: '1.0',
      };

      setGeneratedReport(report);
      onGenerateReport(report);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSummary = () => {
    const score = reportMetrics.overallScore;
    if (score >= 90) {
      return 'This project demonstrates exceptional quality and meets all verification criteria with outstanding results.';
    } else if (score >= 80) {
      return 'This project meets the required standards with good quality implementation and documentation.';
    } else if (score >= 60) {
      return 'This project shows promise but requires some improvements before final approval.';
    } else {
      return 'This project needs significant improvements across multiple areas before it can be approved.';
    }
  };

  const generateRecommendations = () => {
    const recommendations = [];
    if (reportMetrics.verifiedDocuments < reportMetrics.totalDocuments) {
      recommendations.push(
        'Complete documentation review and address any missing or incomplete documents.'
      );
    }
    if (reportMetrics.overallScore < 80) {
      recommendations.push(
        'Improve implementation quality based on detailed feedback provided in each category.'
      );
    }
    if (reportMetrics.urgentMessages > 0) {
      recommendations.push(
        'Address all urgent communication items and clarifications.'
      );
    }
    if (reportMetrics.criticalEvents > 0) {
      recommendations.push(
        'Review and resolve all critical system events identified during verification.'
      );
    }
    return recommendations;
  };

  const generateStrengths = () => {
    const strengths = [];
    if (reportMetrics.overallScore >= 80) {
      strengths.push(
        'High overall quality score indicating strong implementation.'
      );
    }
    if (reportMetrics.verifiedDocuments / reportMetrics.totalDocuments >= 0.8) {
      strengths.push('Comprehensive and well-organized documentation.');
    }
    if (reportMetrics.urgentMessages === 0) {
      strengths.push(
        'Clear communication with no critical issues requiring urgent attention.'
      );
    }
    return strengths;
  };

  const generateWeaknesses = () => {
    const weaknesses = [];
    if (reportMetrics.overallScore < 60) {
      weaknesses.push(
        'Below-average overall score requiring significant improvements.'
      );
    }
    if (reportMetrics.verifiedDocuments / reportMetrics.totalDocuments < 0.5) {
      weaknesses.push('Incomplete or inadequate documentation coverage.');
    }
    if (reportMetrics.criticalEvents > 5) {
      weaknesses.push(
        'Multiple critical events indicating potential systemic issues.'
      );
    }
    return weaknesses;
  };

  const getComplexityLevel = () => {
    const documentCount = reportMetrics.totalDocuments;
    const auditEvents = reportMetrics.auditEvents;

    if (documentCount > 20 || auditEvents > 100) return 'high';
    if (documentCount > 10 || auditEvents > 50) return 'medium';
    return 'low';
  };

  const getRiskLevel = () => {
    const score = reportMetrics.overallScore;
    const criticalEvents = reportMetrics.criticalEvents;

    if (score < 50 || criticalEvents > 10) return 'critical';
    if (score < 70 || criticalEvents > 5) return 'high';
    if (score < 85 || criticalEvents > 0) return 'medium';
    return 'low';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'revision_required':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'revision_required':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Verification Report Generator
            </h3>
            <p className="text-sm text-gray-500">
              Generate comprehensive verification reports and certificates
            </p>
          </div>
          {/*{generatedReport && (*/}
          {/*  <div className="flex items-center gap-2">*/}
          {/*    <button*/}
          {/*      onClick={() => onExportReport('pdf')}*/}
          {/*      className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"*/}
          {/*    >*/}
          {/*      <Download className="h-4 w-4" />*/}
          {/*      Export PDF*/}
          {/*    </button>*/}
          {/*    <button*/}
          {/*      onClick={() => onExportReport('html')}*/}
          {/*      className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"*/}
          {/*    >*/}
          {/*      <ExternalLink className="h-4 w-4" />*/}
          {/*      HTML*/}
          {/*    </button>*/}
          {/*  </div>*/}
          {/*)}*/}
        </div>
      </div>

      {/* Report Configuration */}
      <div className="border-b border-gray-200 p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Report Configuration
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {templates.find((t) => t.id === selectedTemplate)?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Include Sections
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeDocuments}
                  onChange={(e) => setIncludeDocuments(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Document Analysis
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeCommunications}
                  onChange={(e) => setIncludeCommunications(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Communication Log
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeAuditTrail}
                  onChange={(e) => setIncludeAuditTrail(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Audit Trail</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">Report Preview</h4>
          <button
            onClick={generateReport}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <FileText className="h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {reportMetrics.overallScore}
                </div>
                <div className="text-sm text-gray-500">Overall Score</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {reportMetrics.verifiedDocuments}/
                  {reportMetrics.totalDocuments}
                </div>
                <div className="text-sm text-gray-500">Documents</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {reportMetrics.totalMessages}
                </div>
                <div className="text-sm text-gray-500">Messages</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {reportMetrics.auditEvents}
                </div>
                <div className="text-sm text-gray-500">Audit Events</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
          {getStatusIcon(reportMetrics.status)}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                Verification Status:
              </span>
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(reportMetrics.status)}`}
              >
                {reportMetrics.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{generateSummary()}</p>
          </div>
        </div>
      </div>

      {/* Generated Report Summary */}
      {generatedReport && (
        <div className="p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Generated Report
          </h4>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Report ID
                </label>
                <p className="text-sm text-gray-900 font-mono">
                  {generatedReport.id}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Generated At
                </label>
                <p className="text-sm text-gray-900">
                  {formatDateSafely(generatedReport.generatedAt, 'PPpp')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Project
                </label>
                <p className="text-sm text-gray-900">
                  {generatedReport.projectName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Verifier
                </label>
                <p className="text-sm text-gray-900">
                  {generatedReport.verifierInfo.name}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Recommendations
              </label>
              <ul className="list-disc list-inside space-y-1">
                {generatedReport.verificationResults.recommendations.map(
                  (rec, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {rec}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => onExportReport('pdf')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </button>
              <button
                onClick={() => onExportReport('html')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Eye className="h-4 w-4" />
                View HTML
              </button>
              <button
                onClick={() => onExportReport('json')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <FileText className="h-4 w-4" />
                Export JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
