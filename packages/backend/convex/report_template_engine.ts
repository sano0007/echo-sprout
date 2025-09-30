import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { Id } from './_generated/dataModel';

// Report template types and interfaces
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  templateType:
    | 'project_progress'
    | 'buyer_impact'
    | 'portfolio_overview'
    | 'analytics_dashboard'
    | 'compliance'
    | 'custom';
  format: 'pdf' | 'html' | 'csv' | 'xlsx';
  sections: ReportSection[];
  variables: TemplateVariable[];
  styling: ReportStyling;
  metadata: TemplateMetadata;
}

export interface ReportSection {
  id: string;
  name: string;
  order: number;
  type:
    | 'header'
    | 'summary'
    | 'chart'
    | 'table'
    | 'text'
    | 'image'
    | 'metrics'
    | 'timeline';
  required: boolean;
  content: SectionContent;
  conditional?: ConditionalLogic;
}

export interface SectionContent {
  title?: string;
  subtitle?: string;
  description?: string;
  dataSource?: string;
  chartConfig?: ChartConfiguration;
  tableConfig?: TableConfiguration;
  textContent?: string;
  imageSource?: string;
  metricKeys?: string[];
}

export interface ChartConfiguration {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'donut';
  xAxis: string;
  yAxis: string[];
  colors: string[];
  showLegend: boolean;
  showGrid: boolean;
  title?: string;
  subtitle?: string;
}

export interface TableConfiguration {
  columns: TableColumn[];
  sortable: boolean;
  filterable: boolean;
  pagination: boolean;
  rowsPerPage: number;
  showHeaders: boolean;
  exportable: boolean;
}

export interface TableColumn {
  key: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'date'
    | 'currency'
    | 'percentage'
    | 'status'
    | 'link';
  width?: number;
  sortable?: boolean;
  format?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface TemplateVariable {
  key: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';
  defaultValue?: any;
  required: boolean;
  description: string;
  validation?: ValidationRule;
}

export interface ValidationRule {
  min?: number;
  max?: number;
  pattern?: string;
  options?: string[];
  customValidator?: string;
}

export interface ReportStyling {
  theme: 'light' | 'dark' | 'corporate' | 'environmental';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: number;
  headerStyle: StyleConfig;
  bodyStyle: StyleConfig;
  tableStyle: StyleConfig;
  chartStyle: StyleConfig;
}

export interface StyleConfig {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  fontSize?: number;
  fontWeight?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
}

export interface TemplateMetadata {
  version: string;
  author: string;
  createdAt: number;
  updatedAt: number;
  category: string;
  tags: string[];
  permissions: TemplatePermissions;
  usage: TemplateUsage;
}

export interface TemplatePermissions {
  roles: string[];
  users: string[];
  public: boolean;
  editable: boolean;
}

export interface TemplateUsage {
  totalGenerations: number;
  lastUsed?: number;
  averageGenerationTime: number;
  popularSections: string[];
}

export interface ConditionalLogic {
  field: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'greater_than'
    | 'less_than'
    | 'contains'
    | 'exists';
  value: any;
}

// Report generation request and result interfaces
export interface ReportGenerationRequest {
  templateId: string;
  projectId?: string;
  userId?: string;
  dateRange?: {
    startDate: number;
    endDate: number;
  };
  filters?: Record<string, any>;
  variables?: Record<string, any>;
  format?: 'pdf' | 'html' | 'csv' | 'xlsx';
  includeRawData?: boolean;
  customizations?: ReportCustomizations;
}

export interface ReportCustomizations {
  title?: string;
  subtitle?: string;
  logo?: string;
  excludeSections?: string[];
  additionalSections?: ReportSection[];
  styling?: Partial<ReportStyling>;
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  projectId?: string;
  userId: string;
  title: string;
  format: string;
  status: 'generating' | 'completed' | 'failed' | 'expired';
  progress: number;
  generatedAt: number;
  expiresAt: number;
  downloadUrl?: string;
  fileSize?: number;
  metadata: ReportMetadata;
  error?: string;
}

export interface ReportMetadata {
  generationTime: number;
  dataPoints: number;
  sectionsIncluded: string[];
  totalPages?: number;
  chartCount: number;
  tableCount: number;
  wordCount?: number;
}

// Default report templates
const DEFAULT_TEMPLATES: Partial<ReportTemplate>[] = [
  {
    name: 'Standard Project Progress Report',
    description:
      'Comprehensive project progress report with timeline and metrics',
    templateType: 'project_progress',
    format: 'pdf',
    sections: [
      {
        id: 'header',
        name: 'Report Header',
        order: 1,
        type: 'header',
        required: true,
        content: {
          title: 'Project Progress Report',
          subtitle: '{{projectName}} - {{reportPeriod}}',
        },
      },
      {
        id: 'executive_summary',
        name: 'Executive Summary',
        order: 2,
        type: 'summary',
        required: true,
        content: {
          title: 'Executive Summary',
          description: 'Key project metrics and progress overview',
        },
      },
      {
        id: 'progress_timeline',
        name: 'Progress Timeline',
        order: 3,
        type: 'timeline',
        required: true,
        content: {
          title: 'Project Timeline',
          description: 'Milestone progress and key achievements',
        },
      },
      {
        id: 'impact_metrics',
        name: 'Environmental Impact',
        order: 4,
        type: 'metrics',
        required: true,
        content: {
          title: 'Environmental Impact Metrics',
          metricKeys: ['carbonImpactToDate', 'treesPlanted', 'energyGenerated'],
        },
      },
      {
        id: 'progress_chart',
        name: 'Progress Chart',
        order: 5,
        type: 'chart',
        required: false,
        content: {
          title: 'Progress Over Time',
          chartConfig: {
            type: 'line',
            xAxis: 'date',
            yAxis: ['progressPercentage', 'carbonImpact'],
            colors: ['#22c55e', '#3b82f6'],
            showLegend: true,
            showGrid: true,
          },
        },
      },
    ],
    variables: [
      {
        key: 'projectName',
        name: 'Project Name',
        type: 'string',
        required: true,
        description: 'Name of the project being reported on',
      },
      {
        key: 'reportPeriod',
        name: 'Report Period',
        type: 'string',
        required: true,
        description: 'Time period covered by this report',
      },
    ],
  },
  {
    name: 'Buyer Impact Portfolio Report',
    description:
      "Comprehensive report showing buyer's carbon credit portfolio impact",
    templateType: 'buyer_impact',
    format: 'pdf',
    sections: [
      {
        id: 'portfolio_header',
        name: 'Portfolio Header',
        order: 1,
        type: 'header',
        required: true,
        content: {
          title: 'Carbon Credit Portfolio Report',
          subtitle: '{{buyerName}} - Portfolio Overview',
        },
      },
      {
        id: 'portfolio_summary',
        name: 'Portfolio Summary',
        order: 2,
        type: 'summary',
        required: true,
        content: {
          title: 'Portfolio Summary',
          description: 'Total carbon credits and environmental impact',
        },
      },
      {
        id: 'project_breakdown',
        name: 'Project Breakdown',
        order: 3,
        type: 'table',
        required: true,
        content: {
          title: 'Project Breakdown',
          tableConfig: {
            columns: [
              { key: 'projectName', label: 'Project Name', type: 'text' },
              { key: 'projectType', label: 'Type', type: 'text' },
              { key: 'creditsOwned', label: 'Credits Owned', type: 'number' },
              {
                key: 'carbonImpact',
                label: 'CO2 Impact (tons)',
                type: 'number',
              },
              { key: 'status', label: 'Status', type: 'status' },
            ],
            sortable: true,
            pagination: false,
            showHeaders: true,
            exportable: true,
            rowsPerPage: 20,
            filterable: false,
          },
        },
      },
      {
        id: 'impact_visualization',
        name: 'Impact Visualization',
        order: 4,
        type: 'chart',
        required: true,
        content: {
          title: 'Carbon Impact Distribution',
          chartConfig: {
            type: 'pie',
            xAxis: 'projectType',
            yAxis: ['carbonImpact'],
            colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
            showLegend: true,
            showGrid: false,
          },
        },
      },
    ],
    variables: [
      {
        key: 'buyerName',
        name: 'Buyer Name',
        type: 'string',
        required: true,
        description: 'Name of the carbon credit buyer',
      },
    ],
  },
];

// Template management functions
export const createReportTemplate = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    templateType: v.union(
      v.literal('project_progress'),
      v.literal('buyer_impact'),
      v.literal('portfolio_overview'),
      v.literal('analytics_dashboard'),
      v.literal('compliance'),
      v.literal('custom')
    ),
    format: v.union(
      v.literal('pdf'),
      v.literal('html'),
      v.literal('csv'),
      v.literal('xlsx')
    ),
    sections: v.any(),
    variables: v.any(),
    styling: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const template: ReportTemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      name: args.name,
      description: args.description,
      templateType: args.templateType,
      format: args.format,
      sections: args.sections,
      variables: args.variables,
      styling: args.styling || getDefaultStyling(),
      metadata: {
        version: '1.0.0',
        author: identity.name || 'Unknown',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        category: args.templateType,
        tags: [],
        permissions: {
          roles: ['admin', 'verifier'],
          users: [identity.subject],
          public: false,
          editable: true,
        },
        usage: {
          totalGenerations: 0,
          averageGenerationTime: 0,
          popularSections: [],
        },
      },
    };

    const templateId = await ctx.db.insert('analyticsReports', {
      reportType: 'platform_analytics',
      title: template.name,
      description: template.description,
      reportData: template,
      generatedBy: identity.subject as Id<'users'>,
      generatedAt: Date.now(),
      timeframe: {
        type: 'template',
        format: template.format,
        templateType: template.templateType,
      },
      format: 'json',
      isPublic: false,
    });

    return templateId;
  },
});

export const getReportTemplate = query({
  args: { templateId: v.string() },
  handler: async (ctx, args) => {
    const template = await ctx.db
      .query('analyticsReports')
      .filter((q: any) =>
        q.and(
          q.eq(q.field('reportType'), 'platform_analytics'),
          q.eq(q.field('reportData.id'), args.templateId)
        )
      )
      .first();

    if (!template) {
      return null;
    }

    return template.reportData as ReportTemplate;
  },
});

export const listReportTemplates = query({
  args: {
    templateType: v.optional(v.string()),
    format: v.optional(v.string()),
    includeDefaults: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query('analyticsReports')
      .filter((q: any) => q.eq(q.field('reportType'), 'platform_analytics'));

    if (args.templateType) {
      query = query.filter((q: any) =>
        q.eq(q.field('reportData.templateType'), args.templateType)
      );
    }

    if (args.format) {
      query = query.filter((q: any) =>
        q.eq(q.field('reportData.format'), args.format)
      );
    }

    const templates = await query.collect();

    return templates.map((template) => ({
      id: template.reportData.id,
      name: template.title,
      description: template.description,
      templateType: template.reportData.templateType,
      format: template.reportData.format,
      isDefault: template.timeframe?.isDefault || false,
      createdAt: template.generatedAt,
      updatedAt: template.generatedAt,
    }));
  },
});

export const updateReportTemplate = mutation({
  args: {
    templateId: v.string(),
    updates: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const template = await ctx.db
      .query('analyticsReports')
      .filter((q: any) =>
        q.and(
          q.eq(q.field('reportType'), 'platform_analytics'),
          q.eq(q.field('reportData.id'), args.templateId)
        )
      )
      .first();

    if (!template) {
      throw new Error('Template not found');
    }

    const templateData = template.reportData as ReportTemplate;

    // Check permissions
    const hasPermission =
      templateData.metadata.permissions.users.includes(identity.subject) ||
      templateData.metadata.permissions.roles.some(
        (role) =>
          // Add role checking logic here
          role === 'admin'
      );

    if (!hasPermission && !templateData.metadata.permissions.editable) {
      throw new Error('Not authorized to edit this template');
    }

    const updatedTemplate = {
      ...templateData,
      ...args.updates,
      metadata: {
        ...templateData.metadata,
        updatedAt: Date.now(),
        version: incrementVersion(templateData.metadata.version),
      },
    };

    await ctx.db.patch(template._id, {
      reportData: updatedTemplate,
      description: updatedTemplate.description,
    });

    return updatedTemplate.id;
  },
});

export const deleteReportTemplate = mutation({
  args: { templateId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const template = await ctx.db
      .query('analyticsReports')
      .filter((q: any) =>
        q.and(
          q.eq(q.field('reportType'), 'platform_analytics'),
          q.eq(q.field('reportData.id'), args.templateId)
        )
      )
      .first();

    if (!template) {
      throw new Error('Template not found');
    }

    // Delete the template
    await ctx.db.delete(template._id);

    return true;
  },
});

// Template utility functions
export const initializeDefaultTemplates = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    // Check if default templates already exist
    const existingDefaults = await ctx.db
      .query('analyticsReports')
      .filter((q: any) =>
        q.and(
          q.eq(q.field('reportType'), 'platform_analytics'),
          q.eq(q.field('timeframe.isDefault'), true)
        )
      )
      .collect();

    if (existingDefaults.length > 0) {
      return {
        message: 'Default templates already exist',
        count: existingDefaults.length,
      };
    }

    const createdTemplates = [];

    for (const defaultTemplate of DEFAULT_TEMPLATES) {
      const template: ReportTemplate = {
        id: `template_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        name: defaultTemplate.name!,
        description: defaultTemplate.description!,
        templateType: defaultTemplate.templateType!,
        format: defaultTemplate.format!,
        sections: defaultTemplate.sections!,
        variables: defaultTemplate.variables!,
        styling: getDefaultStyling(),
        metadata: {
          version: '1.0.0',
          author: 'System',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          category: defaultTemplate.templateType!,
          tags: ['default', 'system'],
          permissions: {
            roles: ['admin', 'verifier', 'creator', 'buyer'],
            users: [],
            public: true,
            editable: false,
          },
          usage: {
            totalGenerations: 0,
            averageGenerationTime: 0,
            popularSections: [],
          },
        },
      };

      const templateId = await ctx.db.insert('analyticsReports', {
        reportType: 'platform_analytics',
        title: template.name,
        description: template.description,
        reportData: template,
        generatedBy: identity.subject as Id<'users'>,
        generatedAt: Date.now(),
        timeframe: {
          type: 'template',
          format: template.format,
          templateType: template.templateType,
          isDefault: true,
        },
        format: 'json',
        isPublic: true,
      });

      createdTemplates.push(templateId);
    }

    return {
      message: 'Default templates created successfully',
      count: createdTemplates.length,
      templateIds: createdTemplates,
    };
  },
});

// Helper functions
function getDefaultStyling(): ReportStyling {
  return {
    theme: 'light',
    primaryColor: '#22c55e',
    secondaryColor: '#3b82f6',
    accentColor: '#f59e0b',
    fontFamily: 'Inter, sans-serif',
    fontSize: 12,
    headerStyle: {
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      fontSize: 18,
      fontWeight: 'bold',
      padding: '16px',
      borderRadius: '8px',
    },
    bodyStyle: {
      backgroundColor: '#ffffff',
      textColor: '#334155',
      fontSize: 12,
      padding: '12px',
    },
    tableStyle: {
      borderColor: '#e2e8f0',
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      fontSize: 11,
    },
    chartStyle: {
      backgroundColor: '#ffffff',
      textColor: '#334155',
      fontSize: 10,
    },
  };
}

function incrementVersion(currentVersion: string): string {
  const parts = currentVersion.split('.');
  const patch = parseInt(parts[2] || '0') + 1;
  return `${parts[0]}.${parts[1]}.${patch}`;
}

// Template validation
export const validateTemplate = query({
  args: { templateData: v.any() },
  handler: async (_, args) => {
    const template = args.templateData as ReportTemplate;
    const errors: string[] = [];

    // Validate required fields
    if (!template.name) errors.push('Template name is required');
    if (!template.templateType) errors.push('Template type is required');
    if (!template.format) errors.push('Template format is required');
    if (!template.sections || template.sections.length === 0) {
      errors.push('At least one section is required');
    }

    // Validate sections
    template.sections?.forEach((section, index) => {
      if (!section.id) errors.push(`Section ${index + 1}: ID is required`);
      if (!section.name) errors.push(`Section ${index + 1}: Name is required`);
      if (!section.type) errors.push(`Section ${index + 1}: Type is required`);
      if (section.order === undefined)
        errors.push(`Section ${index + 1}: Order is required`);
    });

    // Validate variables
    template.variables?.forEach((variable, index) => {
      if (!variable.key) errors.push(`Variable ${index + 1}: Key is required`);
      if (!variable.name)
        errors.push(`Variable ${index + 1}: Name is required`);
      if (!variable.type)
        errors.push(`Variable ${index + 1}: Type is required`);
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
});
