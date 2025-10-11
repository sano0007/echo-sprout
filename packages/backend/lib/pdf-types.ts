// PDF Generation types - shared between client and server
export interface PDFTemplateData {
  title: string;
  subtitle?: string;
  generatedAt: Date;
  userInfo: {
    name: string;
    email: string;
    role: string;
  };
  content: {
    sections: PDFSection[];
    charts?: ChartData[];
    metrics?: MetricData[];
  };
  branding?: BrandingConfig;
}

export interface PDFSection {
  title: string;
  type: 'text' | 'table' | 'chart' | 'metrics' | 'list';
  data: any;
  order: number;
}

export interface ChartData {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  data: any[];
  imageUrl?: string; // For pre-rendered chart images
}

export interface MetricData {
  id: string;
  name: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'stable';
  unit: string;
  format: 'number' | 'currency' | 'percentage';
  description?: string;
}

export interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  companyName: string;
  footer?: string;
}
