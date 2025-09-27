/**
 * Global TypeScript type definitions for EcoSprout platform
 * Provides comprehensive type safety across all dashboard interfaces
 */

import { LucideIcon } from 'lucide-react';

// ===============================
// GLOBAL UTILITY TYPES
// ===============================

export type Status = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'rejected' | 'approved';

export type UserRole = 'project-creator' | 'credit-buyer' | 'verifier' | 'admin';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type ChangeType = 'positive' | 'negative' | 'neutral';

export type ViewMode = 'grid' | 'list' | 'table';

export type SortDirection = 'asc' | 'desc';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ===============================
// USER MANAGEMENT TYPES
// ===============================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
  profile: UserProfile;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  company?: string;
  website?: string;
  location?: string;
  bio?: string;
  phone?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  marketing: boolean;
}

export interface DashboardPreferences {
  defaultView: ViewMode;
  itemsPerPage: number;
  showWelcome: boolean;
  compactMode: boolean;
}

// ===============================
// PROJECT TYPES
// ===============================

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  type: ProjectType;
  creatorId: string;
  creator: User;
  location: ProjectLocation;
  timeline: ProjectTimeline;
  metrics: ProjectMetrics;
  documents: ProjectDocument[];
  images: ProjectImage[];
  verification: VerificationRecord | null;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'verification_pending'
  | 'approved'
  | 'active'
  | 'completed'
  | 'suspended'
  | 'rejected';

export type ProjectType =
  | 'reforestation'
  | 'renewable_energy'
  | 'energy_efficiency'
  | 'methane_capture'
  | 'carbon_capture'
  | 'sustainable_agriculture'
  | 'ocean_conservation'
  | 'waste_management';

export interface ProjectLocation {
  country: string;
  state?: string;
  city?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  area?: number; // in hectares
}

export interface ProjectTimeline {
  startDate: Date;
  endDate: Date;
  estimatedCompletion: Date;
  milestones: ProjectMilestone[];
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completedDate?: Date;
  status: Status;
  progress: number; // 0-100
}

export interface ProjectMetrics {
  totalCredits: number;
  creditsAvailable: number;
  creditsSold: number;
  pricePerCredit: number;
  currency: string;
  co2Offset: number; // tons
  progressPercentage: number;
  qualityScore?: number; // 0-100
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  verified: boolean;
}

export type DocumentType =
  | 'project_plan'
  | 'environmental_impact'
  | 'financial_report'
  | 'progress_report'
  | 'verification_report'
  | 'certificate'
  | 'legal_document'
  | 'other';

export interface ProjectImage {
  id: string;
  url: string;
  caption?: string;
  category: 'before' | 'progress' | 'after' | 'documentation';
  uploadedAt: Date;
}

// ===============================
// CARBON CREDIT TYPES
// ===============================

export interface CarbonCredit {
  id: string;
  projectId: string;
  project: Project;
  serialNumber: string;
  vintage: number; // year
  credits: number; // tons of CO2
  price: number;
  currency: string;
  status: CreditStatus;
  issuedAt: Date;
  retiredAt?: Date;
  buyerId?: string;
  buyer?: User;
}

export type CreditStatus = 'issued' | 'available' | 'sold' | 'retired' | 'cancelled';

export interface CreditPurchase {
  id: string;
  buyerId: string;
  buyer: User;
  credits: CarbonCredit[];
  totalCredits: number;
  totalAmount: number;
  currency: string;
  purchasedAt: Date;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  certificateUrl?: string;
}

export interface PaymentMethod {
  type: 'credit_card' | 'bank_transfer' | 'crypto' | 'invoice';
  details: {
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
  };
}

// ===============================
// VERIFICATION TYPES
// ===============================

export interface VerificationRecord {
  id: string;
  projectId: string;
  verifierId: string;
  verifier: User;
  status: VerificationStatus;
  submittedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  checklist: VerificationChecklistItem[];
  documents: VerificationDocument[];
  comments: VerificationComment[];
  qualityScore?: number;
  finalReport?: string;
}

export type VerificationStatus =
  | 'pending'
  | 'assigned'
  | 'in_review'
  | 'additional_info_required'
  | 'approved'
  | 'rejected'
  | 'expired';

export interface VerificationChecklistItem {
  id: string;
  category: string;
  requirement: string;
  status: 'pending' | 'compliant' | 'non_compliant' | 'not_applicable';
  notes?: string;
  evidence?: string[];
  importance: 'required' | 'recommended' | 'optional';
}

export interface VerificationDocument {
  id: string;
  documentId: string;
  document: ProjectDocument;
  annotations: DocumentAnnotation[];
  reviewStatus: 'pending' | 'reviewed' | 'approved' | 'rejected';
  reviewNotes?: string;
}

export interface DocumentAnnotation {
  id: string;
  page: number;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  type: 'highlight' | 'note' | 'question' | 'issue';
  content: string;
  createdAt: Date;
}

export interface VerificationComment {
  id: string;
  authorId: string;
  author: User;
  content: string;
  type: 'general' | 'question' | 'request' | 'clarification';
  parentId?: string; // for replies
  createdAt: Date;
  attachments?: string[];
}

// ===============================
// DASHBOARD TYPES
// ===============================

export interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  changeType?: ChangeType;
  icon: LucideIcon;
  loading?: boolean;
  error?: string;
}

export interface DashboardCard {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'activity' | 'custom';
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  data?: any;
  config?: Record<string, any>;
}

export interface ActivityFeedItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  userId: string;
  user: User;
  entityId?: string;
  entityType?: 'project' | 'credit' | 'verification' | 'user';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export type ActivityType =
  | 'project_created'
  | 'project_submitted'
  | 'project_approved'
  | 'credits_purchased'
  | 'verification_started'
  | 'verification_completed'
  | 'payment_processed'
  | 'document_uploaded'
  | 'user_registered';

// ===============================
// MARKETPLACE TYPES
// ===============================

export interface MarketplaceFilters {
  projectType?: ProjectType[];
  location?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  creditsRange?: {
    min: number;
    max: number;
  };
  verificationStatus?: VerificationStatus[];
  vintage?: number[];
  sortBy?: 'price' | 'credits' | 'date' | 'rating';
  sortDirection?: SortDirection;
}

export interface MarketplaceProject extends Project {
  rating?: number;
  reviews?: ProjectReview[];
  totalReviews?: number;
  featured?: boolean;
  discountPercentage?: number;
}

export interface ProjectReview {
  id: string;
  projectId: string;
  buyerId: string;
  buyer: User;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}

// ===============================
// ANALYTICS TYPES
// ===============================

export interface AnalyticsData {
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate: Date;
  endDate: Date;
  metrics: AnalyticsMetric[];
  charts: ChartData[];
}

export interface AnalyticsMetric {
  key: string;
  label: string;
  value: number;
  previousValue?: number;
  change?: number;
  changeType?: ChangeType;
  format: 'number' | 'currency' | 'percentage' | 'duration';
}

export interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'radar';
  title: string;
  data: ChartDataPoint[];
  config?: ChartConfig;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface ChartConfig {
  colors?: string[];
  xAxis?: string;
  yAxis?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  responsive?: boolean;
}

// ===============================
// API TYPES
// ===============================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  pagination?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}

// ===============================
// NAVIGATION TYPES
// ===============================

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  children?: NavItem[];
  roles?: UserRole[];
  external?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

// ===============================
// FORM TYPES
// ===============================

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'file' | 'checkbox' | 'radio' | 'date';
  required?: boolean;
  placeholder?: string;
  validation?: any; // Zod schema
  options?: SelectOption[];
  multiple?: boolean;
  accept?: string; // for file inputs
}

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  group?: string;
}

export interface FormState<T = any> {
  data: T;
  errors: Record<string, string>;
  loading: boolean;
  dirty: boolean;
  valid: boolean;
}

// ===============================
// NOTIFICATION TYPES
// ===============================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'project_update'
  | 'verification_update'
  | 'payment_update'
  | 'system_announcement';

// ===============================
// FILE MANAGEMENT TYPES
// ===============================

export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

export interface FileManagerConfig {
  maxFileSize: number;
  acceptedTypes: string[];
  maxFiles: number;
  uploadUrl: string;
}

// ===============================
// THEME TYPES
// ===============================

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  fontSize: 'sm' | 'base' | 'lg';
  radius: 'none' | 'sm' | 'md' | 'lg' | 'full';
}