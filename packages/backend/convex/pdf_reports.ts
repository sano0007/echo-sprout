import { v } from 'convex/values';
import { mutation, query, action } from './_generated/server';
import { api } from './_generated/api';
import { Doc } from './_generated/dataModel';

// PDF Report types
export interface PDFReportRequest {
  templateType: 'analytics' | 'monitoring';
  reportType: string;
  title: string;
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

export interface PDFReportJob {
  id: string;
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
}

// PDF Report Generation Queries
export const getPDFReports = query({
  args: {
    userId: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = args.userId || (await ctx.auth.getUserIdentity())?.subject;
    if (!userId) throw new Error('Authentication required');

    let query = ctx.db.query('pdf_reports');

    if (args.userId) {
      query = query.filter(q => q.eq(q.field('requestedBy'), args.userId));
    }

    if (args.status) {
      query = query.filter(q => q.eq(q.field('status'), args.status));
    }

    return await query
      .order('desc')
      .take(args.limit || 50);
  },
});

export const getPDFReport = query({
  args: { reportId: v.id('pdf_reports') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Authentication required');

    const report = await ctx.db.get(args.reportId);
    if (!report) throw new Error('Report not found');

    // Check if user has permission to view this report
    if (report.requestedBy !== identity.subject) {
      // Additional permission checks for admins/verifiers
      const user = await ctx.db
        .query('users')
        .filter(q => q.eq(q.field('clerkId'), identity.subject))
        .first();

      if (!user || !['admin', 'verifier'].includes(user.role)) {
        throw new Error('Permission denied');
      }
    }

    return report;
  },
});

// PDF Report Generation Mutations
export const createPDFReportRequest = mutation({
  args: {
    templateType: v.string(),
    reportType: v.string(),
    title: v.string(),
    timeframe: v.object({
      start: v.number(),
      end: v.number(),
      period: v.string(),
    }),
    filters: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Authentication required');

    const user = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('clerkId'), identity.subject))
      .first();

    if (!user) throw new Error('User not found');

    // Check if user has permission to generate reports
    if (!['admin', 'verifier', 'creator', 'buyer'].includes(user.role)) {
      throw new Error('Permission denied');
    }

    // Create report request
    const reportId = await ctx.db.insert('pdf_reports', {
      templateType: args.templateType as 'analytics' | 'monitoring',
      reportType: args.reportType,
      title: args.title,
      status: 'pending',
      progress: 0,
      requestedBy: identity.subject,
      requestedAt: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      timeframe: args.timeframe,
      filters: args.filters,
      userInfo: {
        userId: identity.subject,
        name: user.name || user.email.split('@')[0] || 'Unknown User',
        email: user.email,
        role: user.role,
      },
    });

    // Schedule the PDF generation job
    await ctx.scheduler.runAfter(0, api.pdf_reports.generatePDFReport, {
      reportId,
    });

    return reportId;
  },
});

export const updatePDFReportStatus = mutation({
  args: {
    reportId: v.id('pdf_reports'),
    status: v.string(),
    progress: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    fileSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report) throw new Error('Report not found');

    const updateData: any = {
      status: args.status,
    };

    if (args.progress !== undefined) {
      updateData.progress = args.progress;
    }

    if (args.errorMessage) {
      updateData.errorMessage = args.errorMessage;
    }

    if (args.fileUrl) {
      updateData.fileUrl = args.fileUrl;
    }

    if (args.fileSize) {
      updateData.fileSize = args.fileSize;
    }

    if (args.status === 'completed') {
      updateData.completedAt = Date.now();
    }

    await ctx.db.patch(args.reportId, updateData);

    return args.reportId;
  },
});

export const deletePDFReport = mutation({
  args: { reportId: v.id('pdf_reports') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Authentication required');

    const report = await ctx.db.get(args.reportId);
    if (!report) throw new Error('Report not found');

    // Check if user has permission to delete this report
    if (report.requestedBy !== identity.subject) {
      const user = await ctx.db
        .query('users')
        .filter(q => q.eq(q.field('clerkId'), identity.subject))
        .first();

      if (!user || user.role !== 'admin') {
        throw new Error('Permission denied');
      }
    }

    await ctx.db.delete(args.reportId);
    return true;
  },
});

// PDF Report Generation Action
export const generatePDFReport = action({
  args: { reportId: v.id('pdf_reports') },
  handler: async (ctx, args) => {
    try {
      // Update status to processing
      await ctx.runMutation(api.pdf_reports.updatePDFReportStatus, {
        reportId: args.reportId,
        status: 'processing',
        progress: 10,
      });

      // Get report details
      const report = await ctx.runQuery(api.pdf_reports.getPDFReport, {
        reportId: args.reportId,
      });

      if (!report) {
        throw new Error('Report not found');
      }

      // Update progress
      await ctx.runMutation(api.pdf_reports.updatePDFReportStatus, {
        reportId: args.reportId,
        status: 'processing',
        progress: 30,
      });

      let reportData;
      let pdfData;

      if (report.templateType === 'analytics') {
        // Generate analytics report
        reportData = await generateAnalyticsReportData(ctx, report);

        await ctx.runMutation(api.pdf_reports.updatePDFReportStatus, {
          reportId: args.reportId,
          status: 'processing',
          progress: 60,
        });

        pdfData = await generateAnalyticsPDF(reportData, report);
      } else if (report.templateType === 'monitoring') {
        // Generate monitoring report
        reportData = await generateMonitoringReportData(ctx, report);

        await ctx.runMutation(api.pdf_reports.updatePDFReportStatus, {
          reportId: args.reportId,
          status: 'processing',
          progress: 60,
        });

        pdfData = await generateMonitoringPDF(reportData, report);
      } else {
        throw new Error('Invalid template type');
      }

      // Update progress
      await ctx.runMutation(api.pdf_reports.updatePDFReportStatus, {
        reportId: args.reportId,
        status: 'processing',
        progress: 80,
      });

      // Save PDF to storage (implementation depends on your storage solution)
      const fileUrl = await savePDFToStorage(pdfData, report);
      const fileSize = pdfData.length;

      // Update status to completed
      await ctx.runMutation(api.pdf_reports.updatePDFReportStatus, {
        reportId: args.reportId,
        status: 'completed',
        progress: 100,
        fileUrl,
        fileSize,
      });

      return {
        success: true,
        fileUrl,
        fileSize,
      };
    } catch (error) {
      // Update status to failed
      await ctx.runMutation(api.pdf_reports.updatePDFReportStatus, {
        reportId: args.reportId,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  },
});

// Helper functions for data collection and PDF generation

async function generateAnalyticsReportData(ctx: any, report: any) {
  // Collect analytics data based on report type and timeframe
  const startDate = new Date(report.timeframe.start);
  const endDate = new Date(report.timeframe.end);

  // Mock analytics data - replace with actual API calls when available
  const metrics: any[] = [];
  const charts: any[] = [];
  const insights: any[] = [];

  // TODO: Replace with actual analytics API calls when implemented:
  // const metrics = await ctx.runQuery(api.analytics_engine.getAnalyticsMetrics, {
  //   timeframe: {
  //     startDate: report.timeframe.start,
  //     endDate: report.timeframe.end,
  //     granularity: 'daily',
  //   },
  //   filters: report.filters,
  // });

  return {
    metrics: metrics || [],
    charts: charts || [],
    insights: insights || [],
    timeframe: {
      start: startDate,
      end: endDate,
      period: report.timeframe.period,
    },
    filters: report.filters,
  };
}

async function generateMonitoringReportData(ctx: any, report: any) {
  // Collect monitoring data based on report type and timeframe
  const startDate = new Date(report.timeframe.start);
  const endDate = new Date(report.timeframe.end);

  // Mock monitoring data - replace with actual API calls when available
  const systemMetrics: any[] = [];
  const projectMonitoring: any[] = [];
  const alerts: any[] = [];
  const performanceMetrics: any[] = [];

  // TODO: Replace with actual monitoring API calls when implemented:
  // const systemMetrics = await ctx.runQuery(api.monitoring.getSystemMetrics, {
  //   timeframe: {
  //     startDate: report.timeframe.start,
  //     endDate: report.timeframe.end,
  //   },
  //   filters: report.filters,
  // });

  return {
    systemMetrics: systemMetrics || [],
    projectMonitoring: projectMonitoring || [],
    alerts: alerts || [],
    performanceMetrics: performanceMetrics || [],
    timeframe: {
      start: startDate,
      end: endDate,
      period: report.timeframe.period,
    },
    filters: report.filters,
  };
}

async function generateAnalyticsPDF(analyticsData: any, report: any): Promise<Buffer> {
  // This would integrate with the analytics PDF templates
  // For now, return a placeholder
  const { AnalyticsPDFTemplates } = await import('../lib/analytics-pdf-templates');

  let templateData;

  switch (report.reportType) {
    case 'comprehensive':
      templateData = AnalyticsPDFTemplates.generateComprehensiveReport(
        analyticsData,
        report.userInfo
      );
      break;
    case 'platform':
      templateData = AnalyticsPDFTemplates.generatePlatformReport(
        analyticsData,
        report.userInfo
      );
      break;
    case 'environmental':
      templateData = AnalyticsPDFTemplates.generateEnvironmentalReport(
        analyticsData,
        report.userInfo
      );
      break;
    case 'financial':
      templateData = AnalyticsPDFTemplates.generateFinancialReport(
        analyticsData,
        report.userInfo
      );
      break;
    default:
      templateData = AnalyticsPDFTemplates.generateComprehensiveReport(
        analyticsData,
        report.userInfo
      );
  }

  // For now, return a mock PDF buffer
  // In a real implementation, you would use a server-side PDF library like Puppeteer
  const mockPdfContent = JSON.stringify(templateData);
  return Buffer.from(mockPdfContent, 'utf-8');
}

async function generateMonitoringPDF(monitoringData: any, report: any): Promise<Buffer> {
  // This would integrate with the monitoring PDF templates
  const { MonitoringPDFTemplates } = await import('../lib/monitoring-pdf-templates');

  let templateData;

  switch (report.reportType) {
    case 'system':
      templateData = MonitoringPDFTemplates.generateSystemMonitoringReport(
        monitoringData,
        report.userInfo
      );
      break;
    case 'project':
      templateData = MonitoringPDFTemplates.generateProjectMonitoringReport(
        monitoringData,
        report.userInfo
      );
      break;
    case 'alerts':
      templateData = MonitoringPDFTemplates.generateAlertReport(
        monitoringData,
        report.userInfo
      );
      break;
    case 'performance':
      templateData = MonitoringPDFTemplates.generatePerformanceReport(
        monitoringData,
        report.userInfo
      );
      break;
    default:
      templateData = MonitoringPDFTemplates.generateSystemMonitoringReport(
        monitoringData,
        report.userInfo
      );
  }

  // For now, return a mock PDF buffer
  // In a real implementation, you would use a server-side PDF library like Puppeteer
  const mockPdfContent = JSON.stringify(templateData);
  return Buffer.from(mockPdfContent, 'utf-8');
}

async function savePDFToStorage(pdfData: Buffer, report: any): Promise<string> {
  // This would integrate with your file storage solution (S3, Cloudinary, etc.)
  // For now, return a placeholder URL
  const filename = `${report.reportType}_${report.title.replace(/\s+/g, '_')}_${Date.now()}.pdf`;

  // In a real implementation, you would:
  // 1. Upload the PDF to your storage service
  // 2. Return the public URL

  return `/api/pdf-reports/${report._id}/download`;
}

// Cleanup expired reports
export const cleanupExpiredReports = action({
  args: {},
  handler: async (ctx): Promise<{ cleaned: number; message: string }> => {
    const now = Date.now();

    const expiredReports: Doc<'pdf_reports'>[] = await ctx.runQuery(api.pdf_reports.getPDFReports, {
      status: 'completed',
      limit: 1000,
    });

    const expiredCount = expiredReports.filter((report: Doc<'pdf_reports'>) => report.expiresAt < now).length;

    for (const report of expiredReports) {
      if (report.expiresAt < now) {
        await ctx.runMutation(api.pdf_reports.deletePDFReport, {
          reportId: report._id,
        });
      }
    }

    return {
      cleaned: expiredCount,
      message: `Cleaned up ${expiredCount} expired reports`,
    };
  },
});

// Utility functions
export const getReportStatistics = query({
  args: {
    timeframe: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Authentication required');

    const user = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('clerkId'), identity.subject))
      .first();

    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    let query = ctx.db.query('pdf_reports');

    if (args.timeframe) {
      query = query.filter(q =>
        q.and(
          q.gte(q.field('requestedAt'), args.timeframe!.start),
          q.lte(q.field('requestedAt'), args.timeframe!.end)
        )
      );
    }

    const reports = await query.collect();

    const stats = {
      total: reports.length,
      completed: reports.filter(r => r.status === 'completed').length,
      pending: reports.filter(r => r.status === 'pending').length,
      processing: reports.filter(r => r.status === 'processing').length,
      failed: reports.filter(r => r.status === 'failed').length,
      analytics: reports.filter(r => r.templateType === 'analytics').length,
      monitoring: reports.filter(r => r.templateType === 'monitoring').length,
      averageProcessingTime: 0,
    };

    const completedReports = reports.filter(r => r.status === 'completed' && r.completedAt);
    if (completedReports.length > 0) {
      const totalProcessingTime = completedReports.reduce((sum, r) => {
        return sum + (r.completedAt! - r.requestedAt);
      }, 0);
      stats.averageProcessingTime = totalProcessingTime / completedReports.length;
    }

    return stats;
  },
});