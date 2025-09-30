/**
 * Dashboard-specific TypeScript type definitions
 * Covers all dashboard interfaces and role-specific types
 */

import { LucideIcon } from 'lucide-react';
import {
  User,
  Project,
  CarbonCredit,
  VerificationRecord,
  DashboardMetric,
  ActivityFeedItem,
  AnalyticsData,
  UserRole,
  ChangeType,
  ViewMode,
  Status,
} from './global.types';

// ===============================
// DASHBOARD LAYOUT TYPES
// ===============================

export interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  sidebarCollapsed?: boolean;
  showBreadcrumbs?: boolean;
  headerActions?: React.ReactNode;
}

export interface SidebarProps {
  userRole: UserRole;
  collapsed: boolean;
  onToggle?: () => void;
  className?: string;
}

export interface HeaderProps {
  userRole: UserRole;
  user: User;
  notifications?: number;
  showSearch?: boolean;
  actions?: React.ReactNode;
}

// ===============================
// PROJECT CREATOR DASHBOARD TYPES
// ===============================

export interface CreatorDashboardData {
  overview: CreatorOverviewMetrics;
  projects: CreatorProject[];
  recentActivity: ActivityFeedItem[];
  revenue: RevenueData;
  pendingTasks: CreatorTask[];
}

export interface CreatorOverviewMetrics {
  activeProjects: number;
  totalCredits: number;
  creditsSold: number;
  totalRevenue: number;
  pendingVerifications: number;
  monthlyGrowth: {
    projects: ChangeType;
    credits: ChangeType;
    revenue: ChangeType;
  };
}

export interface CreatorProject extends Project {
  revenueGenerated: number;
  recentSales: number;
  nextMilestone?: string;
  actionRequired?: boolean;
}

export interface CreatorTask {
  id: string;
  type:
    | 'progress_report'
    | 'document_upload'
    | 'verification_response'
    | 'milestone_update';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  projectId?: string;
  project?: Project;
}

export interface RevenueData {
  current: number;
  previous: number;
  change: number;
  changeType: ChangeType;
  breakdown: RevenueBreakdown[];
  trends: RevenueTrend[];
}

export interface RevenueBreakdown {
  projectId: string;
  projectName: string;
  revenue: number;
  percentage: number;
  credits: number;
}

export interface RevenueTrend {
  period: string;
  revenue: number;
  credits: number;
  date: Date;
}

// Project Wizard Types
export interface ProjectWizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  validation?: any;
  optional?: boolean;
}

export interface ProjectWizardData {
  basic: ProjectBasicInfo;
  location: ProjectLocationData;
  timeline: ProjectTimelineData;
  metrics: ProjectMetricsData;
  documents: ProjectDocumentData[];
  images: ProjectImageData[];
}

export interface ProjectBasicInfo {
  name: string;
  description: string;
  type: string;
  summary: string;
  objectives: string[];
}

export interface ProjectLocationData {
  country: string;
  state?: string;
  city?: string;
  coordinates?: { latitude: number; longitude: number };
  area: number;
  landUse: string;
}

export interface ProjectTimelineData {
  startDate: Date;
  endDate: Date;
  phases: ProjectPhase[];
  milestones: ProjectMilestoneData[];
}

export interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  deliverables: string[];
}

export interface ProjectMilestoneData {
  title: string;
  description: string;
  targetDate: Date;
  successCriteria: string[];
}

export interface ProjectMetricsData {
  estimatedCredits: number;
  pricePerCredit: number;
  co2Reduction: number;
  additionalBenefits: string[];
  methodology: string;
}

export interface ProjectDocumentData {
  name: string;
  type: string;
  file: File;
  description?: string;
}

export interface ProjectImageData {
  file: File;
  caption: string;
  category: 'before' | 'planning' | 'documentation';
}

// Progress Report Types
export interface ProgressReportForm {
  reportingPeriod: {
    startDate: Date;
    endDate: Date;
  };
  projectStatus: 'on_track' | 'delayed' | 'ahead_of_schedule' | 'completed';
  completionPercentage: number;
  activitiesCompleted: ActivityUpdate[];
  challenges: Challenge[];
  upcomingActivities: UpcomingActivity[];
  metrics: MetricUpdate[];
  evidence: ProgressEvidence[];
  verifierNotes?: string;
}

export interface ActivityUpdate {
  id: string;
  description: string;
  completedDate: Date;
  impact: string;
  evidence?: string[];
}

export interface Challenge {
  description: string;
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
  resolved: boolean;
}

export interface UpcomingActivity {
  description: string;
  plannedDate: Date;
  dependencies?: string[];
}

export interface MetricUpdate {
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: ChangeType;
}

export interface ProgressEvidence {
  type: 'photo' | 'document' | 'measurement';
  file: File;
  description: string;
  location?: { latitude: number; longitude: number };
  timestamp: Date;
}

// ===============================
// CREDIT BUYER DASHBOARD TYPES
// ===============================

export interface BuyerDashboardData {
  overview: BuyerOverviewMetrics;
  portfolio: BuyerPortfolio;
  marketplace: MarketplaceData;
  certificates: CreditCertificate[];
  impact: ImpactMetrics;
  recentActivity: ActivityFeedItem[];
}

export interface BuyerOverviewMetrics {
  totalCredits: number;
  totalInvestment: number;
  co2Offset: number;
  projectsSupported: number;
  averagePrice: number;
  monthlySpending: number;
}

export interface BuyerPortfolio {
  credits: PortfolioCredit[];
  allocation: PortfolioAllocation[];
  performance: PortfolioPerformance;
  diversification: DiversificationMetrics;
}

export interface PortfolioCredit extends CarbonCredit {
  purchasePrice: number;
  currentPrice: number;
  priceChange: number;
  priceChangeType: ChangeType;
  impactMetrics: CreditImpactMetrics;
}

export interface PortfolioAllocation {
  projectType: string;
  percentage: number;
  credits: number;
  value: number;
  color: string;
}

export interface PortfolioPerformance {
  totalReturn: number;
  totalReturnPercentage: number;
  returnType: ChangeType;
  bestPerforming: PortfolioCredit;
  worstPerforming: PortfolioCredit;
}

export interface DiversificationMetrics {
  typesDiversification: number; // 0-1 score
  geographicDiversification: number; // 0-1 score
  vintageDiversification: number; // 0-1 score
  recommendations: string[];
}

export interface CreditImpactMetrics {
  co2Offset: number;
  biodiversityImpact?: number;
  communityBeneficiaries?: number;
  jobsCreated?: number;
  additionalBenefits: string[];
}

export interface MarketplaceData {
  featured: Project[];
  trending: Project[];
  recentlyAdded: Project[];
  filters: MarketplaceFilterState;
  searchResults?: MarketplaceSearchResult;
}

export interface MarketplaceFilterState {
  projectTypes: string[];
  locations: string[];
  priceRange: { min: number; max: number };
  creditsRange: { min: number; max: number };
  vintageRange: { min: number; max: number };
  verificationStatus: string[];
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

export interface MarketplaceSearchResult {
  query: string;
  results: Project[];
  totalResults: number;
  filters: MarketplaceFilterState;
  suggestions: string[];
}

export interface CreditCertificate {
  id: string;
  purchaseId: string;
  projectName: string;
  credits: number;
  issueDate: Date;
  serialNumbers: string[];
  certificateUrl: string;
  verified: boolean;
  blockchain?: BlockchainRecord;
}

export interface BlockchainRecord {
  transactionHash: string;
  blockNumber: number;
  network: string;
  timestamp: Date;
}

export interface ImpactMetrics {
  totalCO2Offset: number;
  equivalentImpacts: EquivalentImpact[];
  projectImpacts: ProjectImpactSummary[];
  timelineData: ImpactTimelineData[];
  goals: ImpactGoal[];
}

export interface EquivalentImpact {
  type: 'cars_off_road' | 'trees_planted' | 'homes_powered' | 'flights_offset';
  value: number;
  unit: string;
  description: string;
  icon: LucideIcon;
}

export interface ProjectImpactSummary {
  projectId: string;
  projectName: string;
  projectType: string;
  credits: number;
  co2Offset: number;
  additionalBenefits: string[];
  location: string;
}

export interface ImpactTimelineData {
  date: Date;
  cumulativeCO2: number;
  monthlyPurchases: number;
  projectsAdded: number;
}

export interface ImpactGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  status: 'on_track' | 'behind' | 'completed';
}

// Purchase Flow Types
export interface PurchaseIntent {
  projectId: string;
  credits: number;
  totalAmount: number;
  paymentMethod: string;
  billingAddress?: BillingAddress;
  companyDetails?: CompanyDetails;
}

export interface BillingAddress {
  name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CompanyDetails {
  name: string;
  taxId: string;
  registrationNumber: string;
  website?: string;
  industry: string;
}

// ===============================
// VERIFIER DASHBOARD TYPES
// ===============================

export interface VerifierDashboardData {
  overview: VerifierOverviewMetrics;
  queue: VerificationQueueItem[];
  inReview: VerificationInProgress[];
  completed: CompletedVerification[];
  performance: VerifierPerformance;
  messages: VerificationMessage[];
}

export interface VerifierOverviewMetrics {
  pendingReviews: number;
  inProgressReviews: number;
  completedThisMonth: number;
  averageReviewTime: number; // hours
  qualityScore: number; // 0-100
  workload: 'light' | 'moderate' | 'heavy';
}

export interface VerificationQueueItem {
  id: string;
  project: Project;
  submittedAt: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedReviewTime: number; // hours
  complexity: 'simple' | 'moderate' | 'complex';
  assignedAt?: Date;
  deadline: Date;
}

export interface VerificationInProgress {
  id: string;
  project: Project;
  startedAt: Date;
  progress: number; // 0-100
  currentPhase: VerificationPhase;
  timeSpent: number; // hours
  estimatedCompletion: Date;
  blockers: VerificationBlocker[];
}

export interface VerificationPhase {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  progress: number;
  tasks: VerificationTask[];
}

export interface VerificationTask {
  id: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number; // minutes
  actualTime?: number;
}

export interface VerificationBlocker {
  id: string;
  type:
    | 'missing_document'
    | 'unclear_information'
    | 'technical_issue'
    | 'external_dependency';
  description: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: Date;
  resolvedAt?: Date;
  action: string;
}

export interface CompletedVerification {
  id: string;
  project: Project;
  completedAt: Date;
  result: 'approved' | 'rejected' | 'conditional_approval';
  qualityScore: number;
  reviewTime: number; // hours
  issuesFound: number;
  feedback?: string;
}

export interface VerifierPerformance {
  monthlyStats: MonthlyVerificationStats;
  qualityTrend: QualityTrendData[];
  efficiency: EfficiencyMetrics;
  feedback: PerformanceFeedback[];
}

export interface MonthlyVerificationStats {
  totalReviews: number;
  approvalRate: number;
  averageReviewTime: number;
  qualityScore: number;
  trendsVsPreviousMonth: {
    totalReviews: ChangeType;
    approvalRate: ChangeType;
    reviewTime: ChangeType;
    qualityScore: ChangeType;
  };
}

export interface QualityTrendData {
  date: Date;
  qualityScore: number;
  reviewsCompleted: number;
  issuesFound: number;
}

export interface EfficiencyMetrics {
  averageReviewTime: number;
  targetReviewTime: number;
  timeEfficiency: number; // percentage
  throughput: number; // reviews per week
  consistency: number; // variance in review times
}

export interface PerformanceFeedback {
  id: string;
  type: 'positive' | 'constructive' | 'concern';
  source: 'project_creator' | 'admin' | 'peer_review';
  message: string;
  date: Date;
  actionTaken?: string;
}

export interface VerificationMessage {
  id: string;
  projectId: string;
  projectName: string;
  fromUser: User;
  type: 'question' | 'clarification' | 'update' | 'issue';
  subject: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  status: 'unread' | 'read' | 'responded';
  createdAt: Date;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

// Document Review Types
export interface DocumentReviewWorkspace {
  project: Project;
  documents: ReviewableDocument[];
  annotations: DocumentAnnotation[];
  checklist: VerificationChecklistItem[];
  comments: VerificationComment[];
  currentDocument?: ReviewableDocument;
}

export interface ReviewableDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  pages: number;
  status: 'pending' | 'in_review' | 'completed';
  annotations: DocumentAnnotation[];
  issues: DocumentIssue[];
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
  type: 'highlight' | 'note' | 'question' | 'issue' | 'approval';
  content: string;
  severity?: 'low' | 'medium' | 'high';
  createdAt: Date;
  resolved?: boolean;
}

export interface DocumentIssue {
  id: string;
  type:
    | 'missing_information'
    | 'inconsistency'
    | 'calculation_error'
    | 'format_issue';
  severity: 'low' | 'medium' | 'high';
  description: string;
  location?: string; // page or section reference
  recommendation: string;
  status: 'open' | 'addressed' | 'waived';
}

export interface VerificationChecklistItem {
  id: string;
  category: string;
  requirement: string;
  description: string;
  status: 'pending' | 'compliant' | 'non_compliant' | 'not_applicable';
  importance: 'required' | 'recommended' | 'optional';
  evidence?: string[];
  notes?: string;
  score?: number; // 0-100
}

export interface VerificationComment {
  id: string;
  type: 'general' | 'question' | 'request' | 'clarification' | 'issue';
  content: string;
  author: User;
  visibility: 'verifier_only' | 'project_creator' | 'all';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'responded' | 'resolved';
  parentId?: string; // for replies
  createdAt: Date;
  attachments?: MessageAttachment[];
}

// ===============================
// ADMIN DASHBOARD TYPES
// ===============================

export interface AdminDashboardData {
  systemOverview: SystemOverviewMetrics;
  userManagement: UserManagementData;
  platformAnalytics: PlatformAnalyticsData;
  systemHealth: SystemHealthData;
  supportTickets: SupportTicket[];
  recentActivity: AdminActivityItem[];
}

export interface SystemOverviewMetrics {
  totalUsers: number;
  activeProjects: number;
  totalCreditsTraded: number;
  platformRevenue: number;
  systemUptime: number;
  activeUsers24h: number;
  trends: {
    users: ChangeType;
    projects: ChangeType;
    credits: ChangeType;
    revenue: ChangeType;
  };
}

export interface UserManagementData {
  totalUsers: number;
  newUsersThisMonth: number;
  usersByRole: UserRoleDistribution[];
  usersByStatus: UserStatusDistribution[];
  pendingApprovals: PendingUserApproval[];
  recentRegistrations: User[];
}

export interface UserRoleDistribution {
  role: UserRole;
  count: number;
  percentage: number;
  growthRate: number;
}

export interface UserStatusDistribution {
  status: 'active' | 'inactive' | 'suspended';
  count: number;
  percentage: number;
}

export interface PendingUserApproval {
  user: User;
  requestedRole: UserRole;
  submittedAt: Date;
  documents: string[];
  priority: 'low' | 'medium' | 'high';
}

export interface PlatformAnalyticsData {
  transactionVolume: TransactionVolumeData[];
  projectDistribution: ProjectDistributionData[];
  userGrowth: UserGrowthData[];
  revenueMetrics: RevenueMetricsData;
  geographicDistribution: GeographicData[];
  performanceMetrics: PerformanceMetricsData;
}

export interface TransactionVolumeData {
  date: Date;
  volume: number;
  value: number;
  transactions: number;
}

export interface ProjectDistributionData {
  type: string;
  count: number;
  percentage: number;
  totalCredits: number;
  averagePrice: number;
}

export interface UserGrowthData {
  date: Date;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  churnedUsers: number;
}

export interface RevenueMetricsData {
  total: number;
  bySource: RevenueBySource[];
  growth: RevenueGrowthData[];
  projections: RevenueProjection[];
}

export interface RevenueBySource {
  source:
    | 'transaction_fees'
    | 'verification_fees'
    | 'subscription'
    | 'premium_features';
  amount: number;
  percentage: number;
  trend: ChangeType;
}

export interface RevenueGrowthData {
  period: string;
  revenue: number;
  growth: number;
  date: Date;
}

export interface RevenueProjection {
  period: string;
  projected: number;
  confidence: number; // 0-100
  factors: string[];
}

export interface GeographicData {
  country: string;
  users: number;
  projects: number;
  credits: number;
  revenue: number;
}

export interface PerformanceMetricsData {
  responseTime: number;
  uptime: number;
  errorRate: number;
  throughput: number;
  userSatisfaction: number;
  trends: PerformanceTrend[];
}

export interface PerformanceTrend {
  date: Date;
  responseTime: number;
  uptime: number;
  errorRate: number;
  activeUsers: number;
}

export interface SystemHealthData {
  status: 'healthy' | 'warning' | 'critical';
  services: ServiceStatus[];
  alerts: SystemAlert[];
  metrics: SystemMetric[];
  lastHealthCheck: Date;
}

export interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  uptime: number;
  responseTime: number;
  lastChecked: Date;
}

export interface SystemAlert {
  id: string;
  type: 'performance' | 'security' | 'capacity' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  service?: string;
  createdAt: Date;
  resolvedAt?: Date;
  acknowledged: boolean;
}

export interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
  trend: ChangeType;
}

export interface SupportTicket {
  id: string;
  user: User;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'verification' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: User;
  createdAt: Date;
  updatedAt: Date;
  responses: TicketResponse[];
}

export interface TicketResponse {
  id: string;
  author: User;
  content: string;
  type: 'response' | 'internal_note' | 'status_change';
  createdAt: Date;
  attachments?: MessageAttachment[];
}

export interface AdminActivityItem extends ActivityFeedItem {
  adminAction: boolean;
  impact: 'low' | 'medium' | 'high';
  affectedUsers?: number;
  changes?: Record<string, any>;
}
