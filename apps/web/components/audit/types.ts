export interface AuditEntry {
  id: string;
  timestamp: number;
  type: AuditEventType;
  category: AuditCategory;
  action: string;
  description: string;
  userId: string;
  userName: string;
  userRole: string;
  userIp?: string;
  userAgent?: string;
  entityId: string;
  entityType: 'verification' | 'project' | 'document' | 'message' | 'user';
  metadata: AuditMetadata;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'pending' | 'cancelled';
  duration?: number; // in milliseconds
  location?: {
    page: string;
    section?: string;
    component?: string;
  };
}

export type AuditEventType =
  | 'user_action'
  | 'system_event'
  | 'data_change'
  | 'access_event'
  | 'communication'
  | 'decision'
  | 'file_operation'
  | 'authentication'
  | 'authorization'
  | 'error'
  | 'security';

export type AuditCategory =
  | 'authentication'
  | 'authorization'
  | 'verification'
  | 'document_review'
  | 'communication'
  | 'decision_making'
  | 'file_management'
  | 'system_admin'
  | 'data_access'
  | 'security'
  | 'performance'
  | 'error_handling';

export interface AuditMetadata {
  // Previous and new values for data changes
  previousValue?: any;
  newValue?: any;

  // Document-specific metadata
  documentId?: string;
  documentName?: string;
  annotationCount?: number;

  // Verification-specific metadata
  verificationStage?: string;
  checklistItem?: string;
  score?: number;
  recommendation?: 'approved' | 'rejected' | 'revision_required';

  // Communication metadata
  messageId?: string;
  messageSubject?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  recipientId?: string;
  recipientName?: string;

  // File operation metadata
  fileSize?: number;
  fileType?: string;
  fileName?: string;

  // Error metadata
  errorCode?: string;
  errorMessage?: string;
  stackTrace?: string;

  // Performance metadata
  loadTime?: number;
  responseTime?: number;

  // Security metadata
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  securityEvent?: string;

  // Additional context
  notes?: string;
  tags?: string[];
  relatedEntities?: string[];
}

export interface TimelineEntry {
  id: string;
  timestamp: number;
  title: string;
  description: string;
  type:
    | 'milestone'
    | 'action'
    | 'decision'
    | 'communication'
    | 'system'
    | 'error';
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  duration?: number;
  userId: string;
  userName: string;
  userRole: string;
  metadata?: any;
  color?: string;
  icon?: string;
}

export interface DecisionHistory {
  id: string;
  timestamp: number;
  decision: 'approved' | 'rejected' | 'revision_required' | 'pending';
  previousDecision?: string;
  reason: string;
  score?: number;
  userId: string;
  userName: string;
  userRole: string;
  verificationStage: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  metadata: {
    checklistItems?: string[];
    documentsConcerned?: string[];
    communicationThreads?: string[];
    duration?: number;
    confidence?: number;
    reviewNotes?: string;
  };
}

export interface CommunicationLog {
  id: string;
  timestamp: number;
  type: 'message' | 'file_exchange' | 'annotation' | 'status_update';
  direction: 'inbound' | 'outbound';
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId: string;
  recipientName: string;
  recipientRole: string;
  subject?: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: {
    id: string;
    name: string;
    size: number;
    type: string;
  }[];
  threadId?: string;
  parentMessageId?: string;
  metadata?: any;
}

export interface GroupedCommunication {
  threadId: string;
  communications: CommunicationLog[];
  subject: string;
  messageCount: number;
  unreadCount: number;
  lastMessage: CommunicationLog | undefined;
}

export interface SystemEvent {
  id: string;
  timestamp: number;
  event: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  component: string;
  affectedUsers?: string[];
  metadata: {
    errorCode?: string;
    performanceMetrics?: any;
    systemResources?: any;
    version?: string;
    environment?: string;
  };
}

export interface AuditFilter {
  dateRange?: {
    start: number;
    end: number;
  };
  eventTypes?: AuditEventType[];
  categories?: AuditCategory[];
  userIds?: string[];
  entityIds?: string[];
  severity?: Array<'low' | 'medium' | 'high' | 'critical'>;
  status?: Array<'success' | 'failure' | 'pending' | 'cancelled'>;
  searchTerm?: string;
}

export interface AuditStats {
  totalEvents: number;
  eventsByType: Record<AuditEventType, number>;
  eventsByCategory: Record<AuditCategory, number>;
  eventsBySeverity: Record<string, number>;
  eventsToday: number;
  eventsThisWeek: number;
  eventsThisMonth: number;
  averageResponseTime: number;
  errorRate: number;
  mostActiveUsers: Array<{
    userId: string;
    userName: string;
    eventCount: number;
  }>;
}
