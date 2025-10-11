'use client';

import { useState } from 'react';
import { Download, FileText, TestTube } from 'lucide-react';

// Import PDF generation utilities
import { PDFGenerationService, PDFTemplateData } from '@/lib/pdf-generator';
import {
  AnalyticsPDFTemplates,
  AnalyticsData,
} from '@packages/backend/lib/analytics-pdf-templates';
import {
  MonitoringPDFTemplates,
  MonitoringData,
} from '@packages/backend/lib/monitoring-pdf-templates';

export default function PDFTestComponent() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  // Mock data for testing
  const mockAnalyticsData: AnalyticsData = {
    metrics: [
      {
        id: 'total_projects',
        name: 'Total Projects',
        value: 1247,
        previousValue: 1180,
        change: 5.7,
        changeType: 'increase',
        unit: 'projects',
        format: 'number',
        category: 'platform',
        description: 'Total number of projects on the platform',
      },
      {
        id: 'co2_offset',
        name: 'CO₂ Offset',
        value: 125400,
        previousValue: 118900,
        change: 5.5,
        changeType: 'increase',
        unit: 'tons',
        format: 'number',
        category: 'environmental',
        description: 'Total CO₂ offset achieved',
      },
      {
        id: 'total_revenue',
        name: 'Total Revenue',
        value: 18750000,
        previousValue: 16200000,
        change: 15.7,
        changeType: 'increase',
        unit: 'USD',
        format: 'currency',
        category: 'financial',
        description: 'Total platform revenue',
      },
    ],
    charts: [
      {
        id: 'projects_over_time',
        title: 'Projects Created Over Time',
        type: 'line',
        category: 'platform',
        timeframe: '30d',
        data: [
          { label: 'Week 1', value: 45, timestamp: '2024-10-01' },
          { label: 'Week 2', value: 52, timestamp: '2024-10-08' },
          { label: 'Week 3', value: 48, timestamp: '2024-10-15' },
          { label: 'Week 4', value: 61, timestamp: '2024-10-22' },
        ],
      },
    ],
    insights: [
      {
        type: 'positive',
        title: 'Strong Growth',
        description:
          'Platform revenue increased by 15.7% compared to the previous period',
        metrics: ['total_revenue'],
        recommendations: [
          'Continue current growth strategies',
          'Expand marketing efforts',
        ],
      },
    ],
    timeframe: {
      start: new Date('2024-10-01'),
      end: new Date('2024-10-31'),
      period: 'Last 30 days',
    },
  };

  const mockMonitoringData: MonitoringData = {
    systemMetrics: [
      {
        id: 'system_uptime',
        name: 'System Uptime',
        value: 99.9,
        threshold: 99.5,
        status: 'healthy',
        category: 'availability',
        unit: '%',
        description: 'System availability percentage',
        lastUpdated: new Date(),
      },
      {
        id: 'response_time',
        name: 'Average Response Time',
        value: 150,
        threshold: 200,
        status: 'healthy',
        category: 'performance',
        unit: 'ms',
        description: 'Average API response time',
        lastUpdated: new Date(),
      },
    ],
    projectMonitoring: [
      {
        projectId: 'proj_1',
        projectName: 'Amazon Reforestation Project',
        status: 'on_track',
        progress: 75,
        nextMilestone: 'Tree planting completion',
        lastUpdate: new Date(),
        verificationStatus: 'verified',
        metrics: {
          carbonOffset: 1200,
          treesPlanted: 5000,
          areaImpacted: 100,
          budgetUtilization: 80,
        },
        issues: [],
      },
    ],
    alerts: [
      {
        id: 'alert_1',
        type: 'warning',
        title: 'High CPU Usage',
        description: 'CPU usage exceeded 80% threshold',
        severity: 3,
        createdAt: new Date(),
        status: 'active',
        affectedProjects: ['proj_1'],
        category: 'system',
      },
    ],
    performanceMetrics: [
      {
        id: 'throughput',
        name: 'Request Throughput',
        value: 1500,
        target: 1200,
        trend: 'improving',
        category: 'throughput',
        unit: 'req/min',
      },
    ],
    timeframe: {
      start: new Date('2024-10-01'),
      end: new Date('2024-10-31'),
      period: 'Last 30 days',
    },
  };

  const mockUserInfo = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
  };

  const addTestResult = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const testAnalyticsPDFGeneration = async () => {
    try {
      addTestResult('Starting analytics PDF generation test...');

      // Test comprehensive report
      const comprehensiveTemplate =
        AnalyticsPDFTemplates.generateComprehensiveReport(
          mockAnalyticsData,
          mockUserInfo
        );

      addTestResult(
        '✅ Comprehensive analytics template generated successfully'
      );

      // Validate template data
      const validation = PDFGenerationService.validateTemplateData(
        comprehensiveTemplate
      );
      if (validation.isValid) {
        addTestResult('✅ Template data validation passed');
      } else {
        addTestResult(
          `❌ Template validation failed: ${validation.errors.join(', ')}`
        );
        return;
      }

      // Generate PDF
      const pdfBlob = await PDFGenerationService.generatePDF(
        comprehensiveTemplate
      );
      addTestResult(
        `✅ PDF generated successfully (${(pdfBlob.size / 1024).toFixed(2)} KB)`
      );

      // Test download
      await PDFGenerationService.downloadPDF(
        comprehensiveTemplate,
        'test-analytics-report.pdf'
      );
      addTestResult('✅ PDF download triggered successfully');
    } catch (error) {
      addTestResult(`❌ Analytics PDF test failed: ${error}`);
    }
  };

  const testMonitoringPDFGeneration = async () => {
    try {
      addTestResult('Starting monitoring PDF generation test...');

      // Test system monitoring report
      const systemTemplate =
        MonitoringPDFTemplates.generateSystemMonitoringReport(
          mockMonitoringData,
          mockUserInfo
        );

      addTestResult('✅ System monitoring template generated successfully');

      // Validate template data
      const validation =
        PDFGenerationService.validateTemplateData(systemTemplate);
      if (validation.isValid) {
        addTestResult('✅ Template data validation passed');
      } else {
        addTestResult(
          `❌ Template validation failed: ${validation.errors.join(', ')}`
        );
        return;
      }

      // Generate PDF
      const pdfBlob = await PDFGenerationService.generatePDF(systemTemplate);
      addTestResult(
        `✅ PDF generated successfully (${(pdfBlob.size / 1024).toFixed(2)} KB)`
      );

      // Test download
      await PDFGenerationService.downloadPDF(
        systemTemplate,
        'test-monitoring-report.pdf'
      );
      addTestResult('✅ PDF download triggered successfully');
    } catch (error) {
      addTestResult(`❌ Monitoring PDF test failed: ${error}`);
    }
  };

  const testAllReportTypes = async () => {
    setIsGenerating(true);
    setTestResults([]);

    try {
      addTestResult('🚀 Starting comprehensive PDF generation tests...');

      // Test all analytics report types
      const analyticsTypes = [
        'comprehensive',
        'platform',
        'environmental',
        'financial',
      ] as const;
      for (const type of analyticsTypes) {
        try {
          let template;
          switch (type) {
            case 'comprehensive':
              template = AnalyticsPDFTemplates.generateComprehensiveReport(
                mockAnalyticsData,
                mockUserInfo
              );
              break;
            case 'platform':
              template = AnalyticsPDFTemplates.generatePlatformReport(
                mockAnalyticsData,
                mockUserInfo
              );
              break;
            case 'environmental':
              template = AnalyticsPDFTemplates.generateEnvironmentalReport(
                mockAnalyticsData,
                mockUserInfo
              );
              break;
            case 'financial':
              template = AnalyticsPDFTemplates.generateFinancialReport(
                mockAnalyticsData,
                mockUserInfo
              );
              break;
          }

          const validation =
            PDFGenerationService.validateTemplateData(template);
          if (validation.isValid) {
            const pdfBlob = await PDFGenerationService.generatePDF(template);
            addTestResult(
              `✅ ${type} analytics report: ${(pdfBlob.size / 1024).toFixed(2)} KB`
            );
          } else {
            addTestResult(`❌ ${type} analytics report validation failed`);
          }
        } catch (error) {
          addTestResult(`❌ ${type} analytics report failed: ${error}`);
        }
      }

      // Test all monitoring report types
      const monitoringTypes = [
        'system',
        'project',
        'alerts',
        'performance',
      ] as const;
      for (const type of monitoringTypes) {
        try {
          let template;
          switch (type) {
            case 'system':
              template = MonitoringPDFTemplates.generateSystemMonitoringReport(
                mockMonitoringData,
                mockUserInfo
              );
              break;
            case 'project':
              template = MonitoringPDFTemplates.generateProjectMonitoringReport(
                mockMonitoringData,
                mockUserInfo
              );
              break;
            case 'alerts':
              template = MonitoringPDFTemplates.generateAlertReport(
                mockMonitoringData,
                mockUserInfo
              );
              break;
            case 'performance':
              template = MonitoringPDFTemplates.generatePerformanceReport(
                mockMonitoringData,
                mockUserInfo
              );
              break;
          }

          const validation =
            PDFGenerationService.validateTemplateData(template);
          if (validation.isValid) {
            const pdfBlob = await PDFGenerationService.generatePDF(template);
            addTestResult(
              `✅ ${type} monitoring report: ${(pdfBlob.size / 1024).toFixed(2)} KB`
            );
          } else {
            addTestResult(`❌ ${type} monitoring report validation failed`);
          }
        } catch (error) {
          addTestResult(`❌ ${type} monitoring report failed: ${error}`);
        }
      }

      addTestResult('🎉 All PDF generation tests completed!');
    } catch (error) {
      addTestResult(`💥 Test suite failed: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <TestTube className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                PDF Generation Test Suite
              </h2>
              <p className="text-gray-600">
                Test the PDF generation functionality for analytics and
                monitoring systems
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={testAnalyticsPDFGeneration}
            disabled={isGenerating}
            className="flex items-center justify-center space-x-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FileText className="h-5 w-5" />
            <span>Test Analytics PDF</span>
          </button>

          <button
            onClick={testMonitoringPDFGeneration}
            disabled={isGenerating}
            className="flex items-center justify-center space-x-2 p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <FileText className="h-5 w-5" />
            <span>Test Monitoring PDF</span>
          </button>

          <button
            onClick={testAllReportTypes}
            disabled={isGenerating}
            className="flex items-center justify-center space-x-2 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <TestTube className="h-5 w-5" />
            <span>
              {isGenerating ? 'Running Tests...' : 'Test All Report Types'}
            </span>
          </button>

          <button
            onClick={clearResults}
            disabled={isGenerating}
            className="flex items-center justify-center space-x-2 p-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <span>Clear Results</span>
          </button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Test Results:
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`text-sm font-mono p-2 rounded ${
                    result.includes('✅')
                      ? 'bg-green-100 text-green-800'
                      : result.includes('❌') || result.includes('💥')
                        ? 'bg-red-100 text-red-800'
                        : result.includes('🚀') || result.includes('🎉')
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">
            Test Instructions:
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>
              • Click "Test Analytics PDF" to test analytics report generation
            </li>
            <li>
              • Click "Test Monitoring PDF" to test monitoring report generation
            </li>
            <li>
              • Click "Test All Report Types" to run comprehensive tests on all
              report types
            </li>
            <li>
              • Generated PDFs will automatically download to your Downloads
              folder
            </li>
            <li>
              • Check the console for detailed error messages if tests fail
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export { PDFTestComponent };
