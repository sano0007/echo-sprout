export interface VerificationReport {
  id: string;
  verificationId: string;
  projectId: string;
  projectName: string;
  projectDescription: string;
  submittedAt: number;
  verifiedAt: number;
  verifierInfo: {
    id: string;
    name: string;
    email: string;
    role: string;
    credentials: string[];
    organization: string;
  };
  projectCreatorInfo: {
    id: string;
    name: string;
    email: string;
    organization?: string;
  };
  verificationResults: {
    overallScore: number;
    status: 'approved' | 'rejected' | 'revision_required';
    categories: VerificationCategory[];
    summary: string;
    recommendations: string[];
    strengths: string[];
    weaknesses: string[];
  };
  documents: {
    id: string;
    name: string;
    type: string;
    status: 'verified' | 'issues_found' | 'missing';
    comments: string[];
    annotations: number;
  }[];
  communications: {
    totalMessages: number;
    urgentMessages: number;
    lastCommunication: number;
    keyDecisions: string[];
  };
  auditTrail: {
    totalEvents: number;
    criticalEvents: number;
    timeline: {
      event: string;
      timestamp: number;
      user: string;
    }[];
  };
  metadata: {
    duration: number; // in milliseconds
    complexity: 'low' | 'medium' | 'high';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    compliance: string[];
    tags: string[];
  };
  generatedAt: number;
  reportVersion: string;
}

export interface VerificationCategory {
  id: string;
  name: string;
  weight: number;
  score: number;
  maxScore: number;
  status: 'passed' | 'failed' | 'partial';
  criteria: VerificationCriterion[];
  comments: string;
}

export interface VerificationCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  score: number;
  maxScore: number;
  status: 'passed' | 'failed' | 'not_applicable';
  evidence: string[];
  comments: string;
}

export interface VerificationCertificate {
  id: string;
  certificateNumber: string;
  verificationReportId: string;
  projectId: string;
  projectName: string;
  projectCreator: {
    name: string;
    organization?: string;
  };
  verifier: {
    name: string;
    organization: string;
    credentials: string[];
  };
  issuedAt: number;
  expiresAt?: number;
  status: 'valid' | 'expired' | 'revoked';
  certificateType: 'compliance' | 'quality' | 'security' | 'full_verification';
  scope: string[];
  overallScore: number;
  securityHash: string;
  digitalSignature?: {
    algorithm: string;
    signature: string;
    publicKey: string;
  };
  metadata: {
    version: string;
    template: string;
    blockchain?: {
      txHash: string;
      blockNumber: number;
      network: string;
    };
  };
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'standard' | 'detailed' | 'summary' | 'compliance';
  sections: ReportSection[];
  styling: {
    theme: 'default' | 'professional' | 'academic' | 'minimal';
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    fonts: {
      heading: string;
      body: string;
      monospace: string;
    };
  };
}

export interface ReportSection {
  id: string;
  title: string;
  order: number;
  required: boolean;
  type:
    | 'overview'
    | 'results'
    | 'documents'
    | 'communications'
    | 'audit'
    | 'recommendations'
    | 'appendix';
  content: ReportContent[];
}

export interface ReportContent {
  type: 'text' | 'table' | 'chart' | 'image' | 'list' | 'score_card';
  data: any;
  formatting?: {
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    alignment?: 'left' | 'center' | 'right';
    spacing?: number;
  };
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  type: 'standard' | 'premium' | 'blockchain' | 'academic';
  layout: {
    orientation: 'portrait' | 'landscape';
    size: 'A4' | 'letter' | 'A3';
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
  design: {
    background?: string;
    border?: {
      style: string;
      width: number;
      color: string;
    };
    watermark?: string;
    logo?: {
      url: string;
      position: 'top-left' | 'top-center' | 'top-right';
      size: number;
    };
  };
  fields: CertificateField[];
  security: {
    qrCode: boolean;
    digitalSignature: boolean;
    blockchain: boolean;
    hologram?: boolean;
  };
}

export interface CertificateField {
  id: string;
  label: string;
  type: 'text' | 'date' | 'score' | 'signature' | 'qr_code' | 'seal';
  position: {
    x: number;
    y: number;
  };
  styling: {
    fontSize: number;
    fontFamily: string;
    fontWeight: 'normal' | 'bold';
    color: string;
    alignment: 'left' | 'center' | 'right';
  };
  required: boolean;
}
