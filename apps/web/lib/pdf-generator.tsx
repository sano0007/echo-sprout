'use client';

import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import React from 'react';
import { PDFTemplateData, PDFSection, MetricData, ChartData, BrandingConfig } from '@packages/backend/lib/pdf-types';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    border: 1,
    borderColor: '#e5e7eb',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    borderBottom: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 5,
  },
  text: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 1.5,
    marginBottom: 8,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    fontSize: 10,
    textAlign: 'center',
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  metricContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    padding: 12,
    backgroundColor: '#f8fafc',
    border: 1,
    borderColor: '#e2e8f0',
    borderRadius: 5,
    marginBottom: 10,
  },
  metricTitle: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  metricChange: {
    fontSize: 9,
    marginTop: 2,
  },
  metricChangePositive: {
    color: '#059669',
  },
  metricChangeNegative: {
    color: '#dc2626',
  },
  metricChangeNeutral: {
    color: '#6b7280',
  },
  listItem: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
    paddingLeft: 10,
  },
  footer: {
    position: 'absolute',
    fontSize: 10,
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#9ca3af',
    borderTop: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#f3f4f6',
    border: 1,
    borderColor: '#d1d5db',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
});

// PDF Component Generator
export const PDFDocument: React.FC<{ data: PDFTemplateData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{data.title}</Text>
        {data.subtitle && <Text style={styles.subtitle}>{data.subtitle}</Text>}
      </View>

      {/* Metadata */}
      <View style={styles.metadata}>
        <Text>Generated: {data.generatedAt.toLocaleString()}</Text>
        <Text>User: {data.userInfo.name} ({data.userInfo.role})</Text>
      </View>

      {/* Content Sections */}
      {data.content.sections
        .sort((a, b) => a.order - b.order)
        .map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {renderSectionContent(section)}
          </View>
        ))}

      {/* Metrics Section */}
      {data.content.metrics && data.content.metrics.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricContainer}>
            {data.content.metrics.map((metric, index) => (
              <View key={index} style={styles.metricCard}>
                <Text style={styles.metricTitle}>{metric.name}</Text>
                <Text style={styles.metricValue}>
                  {formatMetricValue(metric.value, metric.format, metric.unit)}
                </Text>
                {metric.change !== undefined && (
                  <Text
                    style={[
                      styles.metricChange,
                      metric.changeType === 'increase'
                        ? styles.metricChangePositive
                        : metric.changeType === 'decrease'
                          ? styles.metricChangeNegative
                          : styles.metricChangeNeutral,
                    ]}
                  >
                    {metric.change > 0 ? '+' : ''}
                    {metric.change.toFixed(1)}%
                  </Text>
                )}
                {metric.description && (
                  <Text style={styles.text}>{metric.description}</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Footer */}
      <Text style={styles.footer}>
        {data.branding?.footer ||
          `Generated by EcoSprout Analytics System • ${data.branding?.companyName || 'EcoSprout'}`}
      </Text>
    </Page>
  </Document>
);

// Helper function to render section content based on type
const renderSectionContent = (section: PDFSection) => {
  switch (section.type) {
    case 'text':
      return <Text style={styles.text}>{section.data}</Text>;

    case 'table':
      return renderTable(section.data);

    case 'list':
      return (
        <View>
          {section.data.map((item: string, index: number) => (
            <Text key={index} style={styles.listItem}>
              • {item}
            </Text>
          ))}
        </View>
      );

    case 'chart':
      return (
        <View style={styles.chartPlaceholder}>
          <Text style={styles.text}>Chart: {section.data.title}</Text>
          <Text style={styles.text}>Type: {section.data.type}</Text>
          <Text style={styles.text}>(Chart visualization would be rendered here)</Text>
        </View>
      );

    default:
      return <Text style={styles.text}>{JSON.stringify(section.data)}</Text>;
  }
};

// Helper function to render tables
const renderTable = (tableData: { headers: string[]; rows: string[][] }) => {
  const colWidth = `${100 / tableData.headers.length}%`;

  return (
    <View style={styles.table}>
      {/* Header Row */}
      <View style={styles.tableRow}>
        {tableData.headers.map((header, index) => (
          <View key={index} style={[styles.tableColHeader, { width: colWidth }]}>
            <Text style={styles.tableCellHeader}>{header}</Text>
          </View>
        ))}
      </View>

      {/* Data Rows */}
      {tableData.rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.tableRow}>
          {row.map((cell, cellIndex) => (
            <View key={cellIndex} style={[styles.tableCol, { width: colWidth }]}>
              <Text style={styles.tableCell}>{cell}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

// Helper function to format metric values
const formatMetricValue = (value: string | number, format: string, unit: string): string => {
  if (typeof value === 'string') return value;

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);

    case 'percentage':
      return `${value.toFixed(1)}%`;

    case 'number':
    default:
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M ${unit}`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K ${unit}`;
      }
      return `${value.toLocaleString()} ${unit}`;
  }
};

// PDF Generation Service - Client-side only
export class PDFGenerationService {
  /**
   * Generate PDF from template data
   */
  static async generatePDF(data: PDFTemplateData): Promise<Blob> {
    const doc = <PDFDocument data={data} />;
    const asPdf = pdf(doc);
    return await asPdf.toBlob();
  }

  /**
   * Generate PDF and return base64 string
   */
  static async generatePDFBase64(data: PDFTemplateData): Promise<string> {
    const blob = await this.generatePDF(data);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1]; // Remove data:application/pdf;base64, prefix
        if (base64) {
          resolve(base64);
        } else {
          reject(new Error('Failed to extract base64 data from PDF'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Generate PDF and trigger download
   */
  static async downloadPDF(data: PDFTemplateData, filename?: string): Promise<void> {
    const blob = await this.generatePDF(data);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `${data.title.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Validate template data
   */
  static validateTemplateData(data: PDFTemplateData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.title || data.title.trim() === '') {
      errors.push('Title is required');
    }

    if (!data.userInfo || !data.userInfo.name || !data.userInfo.email || !data.userInfo.role) {
      errors.push('Complete user information is required');
    }

    if (!data.content || !data.content.sections || data.content.sections.length === 0) {
      errors.push('At least one content section is required');
    }

    if (data.content?.sections) {
      data.content.sections.forEach((section, index) => {
        if (!section.title || section.title.trim() === '') {
          errors.push(`Section ${index + 1}: Title is required`);
        }
        if (!section.type) {
          errors.push(`Section ${index + 1}: Type is required`);
        }
        if (section.data === undefined || section.data === null) {
          errors.push(`Section ${index + 1}: Data is required`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export types for use in other modules
export type { PDFTemplateData, PDFSection, ChartData, MetricData, BrandingConfig };