import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // ============= USER MANAGEMENT =============
  users: defineTable({
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    role: v.union(
      v.literal('project_creator'),
      v.literal('credit_buyer'),
      v.literal('verifier'),
      v.literal('admin')
    ),
    organizationName: v.optional(v.string()),
    organizationType: v.optional(v.string()),
    phoneNumber: v.string(),
    address: v.string(),
    city: v.string(),
    country: v.string(),
    isVerified: v.boolean(),
    profileImage: v.optional(v.string()),
    clerkId: v.string(),
    verifierSpecialty: v.optional(v.array(v.string())), // For verifiers: ["solar", "reforestation", etc.]
    isActive: v.boolean(),
    lastLoginAt: v.optional(v.string()),
    // Notification preferences
    notificationPreferences: v.optional(
      v.object({
        channels: v.array(
          v.union(v.literal('email'), v.literal('in_app'), v.literal('sms'))
        ),
        alertTypes: v.object({
          progress_reminders: v.boolean(),
          milestone_delays: v.boolean(),
          system_alerts: v.boolean(),
          escalations: v.boolean(),
          weekly_reports: v.boolean(),
        }),
        quietHours: v.optional(
          v.object({
            enabled: v.boolean(),
            start: v.string(), // "22:00"
            end: v.string(), // "08:00"
            timezone: v.string(),
          })
        ),
        frequency: v.object({
          immediate: v.boolean(),
          hourly: v.boolean(),
          daily: v.boolean(),
          weekly: v.boolean(),
        }),
      })
    ),
    preferencesUpdatedAt: v.optional(v.number()),
    // Additional contact information
    phone: v.optional(v.string()), // For SMS notifications
    name: v.optional(v.string()), // Computed field for full name
  })
    .index('by_email', ['email'])
    .index('by_clerk_id', ['clerkId'])
    .index('by_role', ['role'])
    .index('by_verifier_specialty', ['role', 'verifierSpecialty'])
    .index('by_active', ['isActive']),

  // ============= PROJECT MANAGEMENT =============
  projects: defineTable({
    creatorId: v.id('users'),
    title: v.string(),
    description: v.string(),
    projectType: v.union(
      v.literal('reforestation'),
      v.literal('solar'),
      v.literal('wind'),
      v.literal('biogas'),
      v.literal('waste_management'),
      v.literal('mangrove_restoration')
    ),
    location: v.object({
      lat: v.float64(),
      long: v.float64(),
      name: v.string(),
    }),
    areaSize: v.number(),
    estimatedCO2Reduction: v.number(),
    budget: v.number(),
    startDate: v.string(),
    expectedCompletionDate: v.string(),
    actualCompletionDate: v.optional(v.string()),
    status: v.union(
      v.literal('draft'),
      v.literal('submitted'),
      v.literal('under_review'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('active'),
      v.literal('completed'),
      v.literal('suspended')
    ),
    verificationStatus: v.union(
      v.literal('pending'),
      v.literal('in_progress'),
      v.literal('verified'),
      v.literal('rejected'),
      v.literal('revision_required')
    ),
    // Project creator sets credit details
    totalCarbonCredits: v.number(), // How many credits this project will generate
    pricePerCredit: v.number(), // Price set by project creator
    creditsAvailable: v.number(), // Credits still available for purchase
    creditsSold: v.number(), // Credits already sold
    // Verification tracking
    assignedVerifierId: v.optional(v.id('users')),
    verificationStartedAt: v.optional(v.float64()),
    verificationCompletedAt: v.optional(v.float64()),
    qualityScore: v.optional(v.number()),
    requiredDocuments: v.array(v.string()), // todo: enum of document types
    submittedDocuments: v.array(v.string()), // todo: enum of document types
    isDocumentationComplete: v.boolean(),
    images: v.optional(v.array(v.string())), // Array of image URLs
    // Progress tracking
    progressPercentage: v.optional(v.number()), // 0-100
    lastProgressUpdate: v.optional(v.number()), // timestamp
  })
    .index('by_creator', ['creatorId'])
    .index('by_status', ['status'])
    .index('by_type', ['projectType'])
    .index('by_verification_status', ['verificationStatus'])
    .index('by_verifier', ['assignedVerifierId'])
    .index('by_credits_available', ['status', 'creditsAvailable'])
    // Enhanced indexes for monitoring
    .index('by_creator_status', ['creatorId', 'status'])
    .index('by_type_status', ['projectType', 'status'])
    .index('by_status_completion', ['status', 'expectedCompletionDate'])
    .index('by_verifier_status', ['assignedVerifierId', 'status']),

  // ============= CARBON CREDITS & TRADING =============
  carbonCredits: defineTable({
    projectId: v.id('projects'),
    creditAmount: v.number(),
    pricePerCredit: v.number(),
    totalPrice: v.number(),
    status: v.union(
      v.literal('available'),
      v.literal('reserved'),
      v.literal('sold')
    ),
    reservedBy: v.optional(v.id('users')), // For temporary reservations during checkout
    reservedUntil: v.optional(v.string()), // Reservation expiry
    batchNumber: v.optional(v.string()), // For tracking credit batches
  })
    .index('by_project', ['projectId'])
    .index('by_status', ['status'])
    .index('by_availability', ['status', 'projectId'])
    .index('by_reserved_by', ['reservedBy']),

  transactions: defineTable({
    // todo: replace when auth is set up
    // buyerId: v.id('users'),
    buyerId: v.string(), // Clerk user ID of the buyer
    projectId: v.optional(v.id('projects')), // Link to specific project for project-specific purchases
    creditAmount: v.number(),
    unitPrice: v.number(),
    totalAmount: v.number(),
    // platformFee: v.number(), // consider having a platform fee in the future
    paymentStatus: v.union(
      v.literal('pending'),
      v.literal('processing'),
      v.literal('completed'),
      v.literal('failed'),
      v.literal('refunded'),
      v.literal('expired')
    ),
    stripePaymentIntentId: v.optional(v.string()),
    stripeSessionId: v.optional(v.string()),
    certificateUrl: v.optional(v.string()),
    transactionReference: v.string(), // Unique transaction reference
  })
    .index('by_buyer', ['buyerId'])
    .index('by_project', ['projectId'])
    .index('by_payment_status', ['paymentStatus'])
    .index('by_reference', ['transactionReference']),

  // ============= VERIFICATION SYSTEM =============
  verifications: defineTable({
    projectId: v.id('projects'),
    verifierId: v.id('users'),
    status: v.union(
      v.literal('assigned'),
      v.literal('accepted'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('revision_required')
    ),
    assignedAt: v.float64(),
    acceptedAt: v.optional(v.float64()),
    startedAt: v.optional(v.float64()),
    completedAt: v.optional(v.float64()),
    dueDate: v.float64(),
    qualityScore: v.optional(v.number()),
    verificationNotes: v.optional(v.string()),
    rejectionReason: v.optional(v.string()),
    revisionRequests: v.optional(v.string()),

    // Enhanced Checklist items with scores
    environmentalImpact: v.optional(
      v.object({
        carbonReductionValidated: v.optional(v.boolean()),
        methodologyVerified: v.optional(v.boolean()),
        calculationsAccurate: v.optional(v.boolean()),
        score: v.optional(v.number()), // 0-100
        notes: v.optional(v.string()),
      })
    ),

    projectFeasibility: v.optional(
      v.object({
        timelineAssessed: v.optional(v.boolean()),
        budgetAnalyzed: v.optional(v.boolean()),
        technicalApproachValid: v.optional(v.boolean()),
        resourcesAvailable: v.optional(v.boolean()),
        score: v.optional(v.number()), // 0-100
        notes: v.optional(v.string()),
      })
    ),

    documentationQuality: v.optional(
      v.object({
        completenessCheck: v.optional(v.boolean()),
        accuracyVerified: v.optional(v.boolean()),
        complianceValidated: v.optional(v.boolean()),
        formatStandards: v.optional(v.boolean()),
        score: v.optional(v.number()), // 0-100
        notes: v.optional(v.string()),
      })
    ),

    locationVerification: v.optional(
      v.object({
        geographicDataConfirmed: v.optional(v.boolean()),
        landRightsVerified: v.optional(v.boolean()),
        accessibilityAssessed: v.optional(v.boolean()),
        environmentalSuitability: v.optional(v.boolean()),
        score: v.optional(v.number()), // 0-100
        notes: v.optional(v.string()),
      })
    ),

    sustainability: v.optional(
      v.object({
        longTermViabilityAnalyzed: v.optional(v.boolean()),
        maintenancePlanReviewed: v.optional(v.boolean()),
        stakeholderEngagement: v.optional(v.boolean()),
        adaptabilityAssessed: v.optional(v.boolean()),
        score: v.optional(v.number()), // 0-100
        notes: v.optional(v.string()),
      })
    ),

    // Legacy checklist items (for backward compatibility)
    timelineCompliance: v.optional(v.boolean()),
    documentationComplete: v.optional(v.boolean()),
    co2CalculationAccurate: v.optional(v.boolean()),
    environmentalImpactValid: v.optional(v.boolean()),
    projectFeasible: v.optional(v.boolean()),
    locationVerified: v.optional(v.boolean()),
    sustainabilityAssessed: v.optional(v.boolean()),

    // Workload management
    verifierWorkload: v.number(), // Current number of active verifications
    priority: v.union(
      v.literal('low'),
      v.literal('normal'),
      v.literal('high'),
      v.literal('urgent')
    ),

    // Document annotations
    documentAnnotations: v.optional(
      v.array(
        v.object({
          documentId: v.id('documents'),
          annotations: v.array(
            v.object({
              id: v.string(),
              type: v.string(),
              content: v.string(),
              position: v.object({
                pageNumber: v.number(),
                x: v.number(),
                y: v.number(),
                width: v.optional(v.number()),
                height: v.optional(v.number()),
              }),
              author: v.string(),
              timestamp: v.number(),
            })
          ),
        })
      )
    ),

    // Overall assessment
    overallScore: v.optional(v.number()), // Calculated from component scores
    confidenceLevel: v.optional(
      v.union(v.literal('low'), v.literal('medium'), v.literal('high'))
    ),
    recommendationJustification: v.optional(v.string()),
  })
    .index('by_project', ['projectId'])
    .index('by_verifier', ['verifierId'])
    .index('by_status', ['status'])
    .index('by_due_date', ['dueDate'])
    .index('by_priority', ['priority'])
    .index('by_accepted', ['verifierId', 'acceptedAt']),

  verificationMessages: defineTable({
    verificationId: v.id('verifications'),
    senderId: v.id('users'),
    recipientId: v.id('users'),
    subject: v.string(),
    message: v.string(),
    priority: v.union(
      v.literal('low'),
      v.literal('normal'),
      v.literal('high'),
      v.literal('urgent')
    ),
    attachments: v.optional(v.array(v.string())),
    isRead: v.boolean(),
    readAt: v.optional(v.float64()),
    threadId: v.optional(v.string()),
    // messageType: v.union(
    //     v.literal("question"),
    //     v.literal("clarification"),
    //     v.literal("revision_request"),
    //     v.literal("approval"),
    //     v.literal("rejection")
    // ),
  })
    .index('by_verification', ['verificationId'])
    .index('by_sender', ['senderId'])
    .index('by_recipient', ['recipientId'])
    .index('by_thread', ['threadId'])
    .index('by_unread', ['recipientId', 'isRead']),

  // ============= DOCUMENT MANAGEMENT =============
  documents: defineTable({
    entityId: v.string(), // ID of the associated entity (project, user profile, etc.)
    entityType: v.union(
      v.literal('project'),
      v.literal('verification'),
      v.literal('user_profile'),
      v.literal('educational_content')
    ),
    fileName: v.string(),
    originalName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    fileSizeFormatted: v.string(), // e.g. "2.5 MB"
    media: v.object({
      cloudinary_public_id: v.string(),
      cloudinary_url: v.string(),
    }),
    thumbnailUrl: v.optional(v.string()),
    documentType: v.union(
      v.literal('project_plan'),
      v.literal('environmental_assessment'),
      v.literal('permits'),
      v.literal('photos'),
      v.literal('verification_report'),
      v.literal('identity_doc'),
      v.literal('technical_specs'),
      v.literal('budget_breakdown'),
      v.literal('timeline'),
      v.literal('other')
    ),
    uploadedBy: v.id('users'),
    isRequired: v.boolean(), // Is this document required for verification?
    isVerified: v.boolean(), // Has this document been verified?
    verifiedBy: v.optional(v.id('users')),
    verifiedAt: v.optional(v.float64()),
  })
    .index('by_entity', ['entityId', 'entityType'])
    .index('by_uploader', ['uploadedBy'])
    .index('by_type', ['documentType'])
    .index('by_verification_status', ['isVerified'])
    .index('by_required', ['entityType', 'isRequired']),

  // ============= PROGRESS TRACKING =============
  progressUpdates: defineTable({
    projectId: v.id('projects'),
    reportedBy: v.id('users'),
    updateType: v.union(
      v.literal('milestone'),
      v.literal('measurement'),
      v.literal('photo'),
      v.literal('issue'),
      v.literal('completion')
    ),
    title: v.string(),
    description: v.string(),
    progressPercentage: v.number(), // 0-100
    measurementData: v.optional(v.any()), // JSON data for specific measurements
    location: v.optional(
      v.object({
        lat: v.float64(),
        long: v.float64(),
        name: v.string(),
      })
    ),
    photos: v.array(
      v.object({
        cloudinary_public_id: v.string(),
        cloudinary_url: v.string(),
      })
    ),
    reportingDate: v.float64(),
    // Impact tracking
    carbonImpactToDate: v.optional(v.number()), // CO2 reduction achieved so far
    treesPlanted: v.optional(v.number()),
    energyGenerated: v.optional(v.number()),
    wasteProcessed: v.optional(v.number()),
    // Verification
    isVerified: v.boolean(),
    verifiedBy: v.optional(v.id('users')),
    verifiedAt: v.optional(v.float64()),
    verificationNotes: v.optional(v.string()),
  })
    .index('by_project', ['projectId'])
    .index('by_reporter', ['reportedBy'])
    .index('by_date', ['reportingDate'])
    .index('by_type', ['updateType'])
    .index('by_verification', ['isVerified'])
    // Enhanced indexes for monitoring
    .index('by_project_date', ['projectId', 'reportingDate'])
    .index('by_project_type', ['projectId', 'updateType'])
    .index('by_project_verified', ['projectId', 'isVerified'])
    .index('by_date_type', ['reportingDate', 'updateType']),

  // ============= EDUCATIONAL CONTENT =============
  educationalContent: defineTable({
    title: v.string(),
    content: v.string(), // Rich text/markdown content
    contentType: v.union(
      v.literal('article'),
      v.literal('video'),
      v.literal('case_study')
    ),
    category: v.string(),
    tags: v.array(v.string()),
    images: v.optional(v.array(v.string())),
    authorId: v.id('users'),
    status: v.union(
      v.literal('draft'),
      v.literal('submitted'),
      v.literal('under_review'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('published')
    ),
    reviewedBy: v.optional(v.id('users')), // Admin who reviewed
    reviewedAt: v.optional(v.float64()),
    reviewNotes: v.optional(v.string()),
    rejectionReason: v.optional(v.string()),
    // Content metadata
    estimatedReadTime: v.optional(v.number()), // Minutes
    difficultyLevel: v.union(
      v.literal('beginner'),
      v.literal('intermediate'),
      v.literal('advanced')
    ),
    viewCount: v.number(),
    likeCount: v.number(),
    shareCount: v.number(),
    isPublished: v.boolean(),
    publishedAt: v.optional(v.float64()),
    lastUpdatedAt: v.float64(),
  })
    .index('by_author', ['authorId'])
    .index('by_category', ['category'])
    .index('by_status', ['status'])
    .index('by_published', ['isPublished'])
    .index('by_type', ['contentType'])
    .index('by_review', ['status', 'reviewedBy']),

  // ============= LEARNING PATHS =============
  learningPaths: defineTable({
    title: v.string(),
    description: v.string(),
    objectives: v.optional(v.array(v.string())),
    level: v.union(
      v.literal('beginner'),
      v.literal('intermediate'),
      v.literal('advanced')
    ),
    estimatedDuration: v.number(), // in minutes
    tags: v.array(v.string()),
    visibility: v.union(
      v.literal('public'),
      v.literal('private'),
      v.literal('unlisted')
    ),
    coverImageUrl: v.optional(v.string()),
    createdBy: v.id('users'),
    status: v.union(
      v.literal('draft'),
      v.literal('published'),
      v.literal('archived')
    ),
    isPublished: v.boolean(),
    publishedAt: v.optional(v.float64()),
    lastUpdatedAt: v.float64(),
    moduleCount: v.number(),
    enrollmentCount: v.number(),
  })
    .index('by_creator', ['createdBy'])
    .index('by_status', ['status'])
    .index('by_visibility', ['visibility'])
    .index('by_published', ['isPublished'])
    .index('by_level', ['level']),

  // ============= LEARNING PATH LESSONS =============
  learningPathLessons: defineTable({
    pathId: v.id('learningPaths'),
    title: v.string(),
    description: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    pdfUrls: v.array(v.string()),
    order: v.number(),
    estimatedDuration: v.optional(v.number()),
    createdBy: v.id('users'),
    lastUpdatedAt: v.float64(),
  })
    .index('by_path', ['pathId'])
    .index('by_path_order', ['pathId', 'order']),

  // ============= FORUM SYSTEM =============
  forumTopics: defineTable({
    title: v.string(),
    content: v.string(),
    category: v.string(),
    authorId: v.id('users'),
    isSticky: v.boolean(),
    viewCount: v.number(),
    replyCount: v.number(),
    lastReplyAt: v.optional(v.float64()),
    lastReplyBy: v.optional(v.id('users')),
    // Moderation
    // isModerated: v.boolean(),
    // moderatedBy: v.optional(v.id("users")),
    // moderatedAt: v.optional(v.string()),
    // moderationReason: v.optional(v.string()),
    // Topic metadata
    topicType: v.union(
      v.literal('discussion'),
      v.literal('question'),
      v.literal('announcement'),
      v.literal('poll')
    ),
    tags: v.array(v.string()),
    upvotes: v.number(),
    downvotes: v.number(),
  })
    .index('by_author', ['authorId'])
    .index('by_category', ['category'])
    .index('by_last_reply', ['lastReplyAt'])
    .index('by_type', ['topicType']),

  forumReplies: defineTable({
    topicId: v.id('forumTopics'),
    authorId: v.id('users'),
    content: v.string(),
    // parentReplyId: v.optional(v.id("forumReplies")), // For nested replies
    isDeleted: v.boolean(),
    // Moderation
    // isModerated: v.boolean(),
    // moderatedBy: v.optional(v.id("users")),
    // moderatedAt: v.optional(v.string()),
    // moderationReason: v.optional(v.string()),
    // Reply metadata
    upvotes: v.number(),
    downvotes: v.number(),
    // isAcceptedAnswer: v.boolean(), // For question topics
    acceptedBy: v.optional(v.id('users')),
    acceptedAt: v.optional(v.float64()),
  })
    .index('by_topic', ['topicId'])
    .index('by_author', ['authorId']),

  // ============= LEARN: USER PROGRESS =============
  learningProgress: defineTable({
    userId: v.id('users'),
    pathId: v.id('learningPaths'),
    lessonId: v.id('learningPathLessons'),
    itemType: v.union(v.literal('video'), v.literal('pdf')),
    itemIndex: v.number(),
    completed: v.boolean(),
    completedAt: v.optional(v.float64()),
  })
    .index('by_user_path', ['userId', 'pathId'])
    .index('by_user_lesson', ['userId', 'lessonId'])
    .index('by_user', ['userId'])
    .index('by_unique_key', [
      'userId',
      'pathId',
      'lessonId',
      'itemType',
      'itemIndex',
    ]),

  forumReplyVotes: defineTable({
    replyId: v.id('forumReplies'),
    userId: v.id('users'),
    value: v.union(v.literal(1), v.literal(-1)),
  })
    .index('by_reply', ['replyId'])
    .index('by_user', ['userId'])
    .index('by_reply_user', ['replyId', 'userId']),
  // .index("by_parent", ["parentReplyId"]),
  // .index("by_accepted", ["isAcceptedAnswer"]),

  // ============= CERTIFICATES & REWARDS =============
  certificates: defineTable({
    transactionId: v.id('transactions'),
    buyerId: v.id('users'),
    projectId: v.id('projects'),
    certificateNumber: v.string(), // Unique certificate number
    creditsAmount: v.number(),
    impactDescription: v.string(),
    issueDate: v.float64(),
    certificateUrl: v.string(),
    qrCodeUrl: v.string(),
    isValid: v.boolean(),
    // Certificate verification
  })
    .index('by_transaction', ['transactionId'])
    .index('by_buyer', ['buyerId'])
    .index('by_project', ['projectId'])
    .index('by_certificate_number', ['certificateNumber']),

  // Verification certificates for approved projects
  verificationCertificates: defineTable({
    verificationId: v.id('verifications'),
    projectId: v.id('projects'),
    verifierId: v.id('users'),
    certificateNumber: v.string(),
    certificateType: v.union(
      v.literal('approval'),
      v.literal('quality_assessment'),
      v.literal('environmental_compliance')
    ),
    issueDate: v.float64(),
    validUntil: v.optional(v.float64()),
    certificateUrl: v.string(),
    qrCodeUrl: v.string(),
    digitalSignature: v.string(),
    verificationDetails: v.object({
      overallScore: v.number(),
      categoryScores: v.object({
        environmental: v.number(),
        feasibility: v.number(),
        documentation: v.number(),
        location: v.number(),
        sustainability: v.number(),
      }),
      verifierCredentials: v.string(),
      verificationStandard: v.string(),
      complianceLevel: v.union(
        v.literal('basic'),
        v.literal('standard'),
        v.literal('premium')
      ),
    }),
    isValid: v.boolean(),
    revokedAt: v.optional(v.float64()),
    revokedBy: v.optional(v.id('users')),
    revocationReason: v.optional(v.string()),
  })
    .index('by_verification', ['verificationId'])
    .index('by_project', ['projectId'])
    .index('by_verifier', ['verifierId'])
    .index('by_certificate_number', ['certificateNumber'])
    .index('by_issue_date', ['issueDate']),

  userWallet: defineTable({
    userId: v.id('users'),
    availableCredits: v.number(),
    totalPurchased: v.number(),
    totalAllocated: v.number(),
    totalSpent: v.number(),
    lifetimeImpact: v.number(), // Total CO2 offset by user's purchases
    lastTransactionAt: v.optional(v.float64()),
  }).index('by_user', ['userId']),

  // ============= AUDIT TRAIL & SYSTEM LOGS =============
  auditLogs: defineTable({
    userId: v.optional(v.id('users')), // null for system actions
    action: v.string(), // "project_created", "verification_approved", etc. todo: enum of actions
    entityType: v.string(), // "project", "user", "transaction", etc. todo: enum of entity types
    entityId: v.string(), // ID of the affected entity
    oldValues: v.optional(v.any()), // Previous state (JSON)
    newValues: v.optional(v.any()), // New state (JSON)
    metadata: v.optional(v.any()), // Additional context (JSON)
    severity: v.optional(
      v.union(
        v.literal('info'),
        v.literal('warning'),
        v.literal('error'),
        v.literal('critical')
      )
    ),
  }),

  // Enhanced verification audit trails
  verificationAuditLogs: defineTable({
    verificationId: v.id('verifications'),
    verifierId: v.id('users'),
    action: v.union(
      v.literal('verification_assigned'),
      v.literal('verification_accepted'),
      v.literal('verification_started'),
      v.literal('checklist_updated'),
      v.literal('document_annotated'),
      v.literal('score_calculated'),
      v.literal('message_sent'),
      v.literal('verification_completed'),
      v.literal('certificate_generated')
    ),
    details: v.object({
      section: v.optional(v.string()), // Which part of verification was affected
      previousValue: v.optional(v.any()),
      newValue: v.optional(v.any()),
      score: v.optional(v.number()),
      notes: v.optional(v.string()),
      attachments: v.optional(v.array(v.string())),
    }),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    timestamp: v.float64(),
  })
    .index('by_verification', ['verificationId'])
    .index('by_verifier', ['verifierId'])
    .index('by_action', ['action'])
    .index('by_timestamp', ['timestamp']),

  // System notifications
  notifications: defineTable({
    recipientId: v.id('users'),
    senderId: v.optional(v.id('users')),
    subject: v.string(),
    message: v.string(),
    type: v.string(),
    severity: v.optional(v.string()),
    category: v.optional(v.string()),
    channels: v.array(v.string()),
    scheduledAt: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    readAt: v.optional(v.number()),
    retryCount: v.number(),
    deliveryStatus: v.string(),
    failureReason: v.optional(v.string()),
    template: v.optional(v.string()),
    templateData: v.optional(v.any()),
    priority: v.union(
      v.literal('low'),
      v.literal('normal'),
      v.literal('high'),
      v.literal('urgent')
    ),
    relatedEntityId: v.optional(v.string()),
    relatedEntityType: v.optional(
      v.union(
        v.literal('project'),
        v.literal('verification'),
        v.literal('document'),
        v.literal('message'),
        v.literal('alert'),
        v.literal('escalation')
      )
    ),
    actionUrl: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
    isRead: v.boolean(),
    isArchived: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    batchId: v.optional(v.string()),
    parentNotificationId: v.optional(v.id('notifications')),
    isTest: v.optional(v.boolean()),
  })
    .index('by_recipient', ['recipientId'])
    .index('by_unread', ['recipientId', 'isRead'])
    .index('by_type', ['type'])
    .index('by_priority', ['priority'])
    .index('by_scheduled', ['scheduledAt'])
    .index('by_sent', ['sentAt'])
    .index('by_status', ['deliveryStatus'])
    .index('by_category', ['category'])
    .index('by_severity', ['severity'])
    .index('by_entity', ['relatedEntityType', 'relatedEntityId'])
    .index('by_batch', ['batchId'])
    .index('by_parent', ['parentNotificationId'])
    .index('by_test', ['isTest']),

  // Notification templates for reusable messaging
  notificationTemplates: defineTable({
    name: v.string(),
    subject: v.string(),
    message: v.string(),
    type: v.string(),
    category: v.string(),
    defaultChannels: v.array(v.string()),
    variables: v.array(v.string()),
    isActive: v.boolean(),
    createdBy: v.id('users'),
    lastModifiedBy: v.id('users'),
    version: v.number(),
  })
    .index('by_name', ['name'])
    .index('by_type', ['type'])
    .index('by_category', ['category'])
    .index('by_active', ['isActive']),

  // User notification preferences
  userNotificationPreferences: defineTable({
    userId: v.id('users'),
    channels: v.array(v.string()),
    alertTypes: v.object({
      progress_reminders: v.boolean(),
      milestone_delays: v.boolean(),
      system_alerts: v.boolean(),
      escalations: v.boolean(),
      weekly_reports: v.boolean(),
      verification_updates: v.boolean(),
      project_updates: v.boolean(),
      transaction_notifications: v.boolean(),
    }),
    quietHours: v.optional(
      v.object({
        enabled: v.boolean(),
        start: v.string(),
        end: v.string(),
        timezone: v.string(),
      })
    ),
    frequency: v.object({
      immediate: v.boolean(),
      hourly: v.boolean(),
      daily: v.boolean(),
      weekly: v.boolean(),
    }),
    lastUpdated: v.number(),
  })
    .index('by_user', ['userId']),

  // ============= ANALYTICS & REPORTING =============
  analytics: defineTable({
    metric: v.string(), // "daily_transactions", "project_completions", etc. todo: enum of metrics
    value: v.number(),
    date: v.float64(),
    metadata: v.optional(v.any()), // Context data (JSON)
    // Additional fields for monitoring analytics
    projectId: v.optional(v.id('projects')), // For project-specific metrics
    category: v.optional(v.string()), // "monitoring", "performance", "impact", etc.
  })
    .index('by_metric', ['metric'])
    .index('by_date', ['date'])
    .index('by_metric_date', ['metric', 'date'])
    // Enhanced indexes for monitoring analytics
    .index('by_category', ['category'])
    .index('by_project', ['projectId'])
    .index('by_project_metric', ['projectId', 'metric'])
    .index('by_category_date', ['category', 'date']),

  // ============= MONITORING & TRACKING SYSTEM =============
  projectMilestones: defineTable({
    projectId: v.id('projects'),
    milestoneType: v.union(
      v.literal('setup'),
      v.literal('progress_25'),
      v.literal('progress_50'),
      v.literal('progress_75'),
      v.literal('impact_first'),
      v.literal('verification'),
      v.literal('completion')
    ),
    title: v.string(),
    description: v.string(),
    plannedDate: v.float64(),
    actualDate: v.optional(v.float64()),
    status: v.union(
      v.literal('pending'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('delayed'),
      v.literal('skipped')
    ),
    delayReason: v.optional(v.string()),
    impactOnTimeline: v.optional(v.string()),
    order: v.number(), // For milestone ordering
    isRequired: v.boolean(), // Is this milestone mandatory
  })
    .index('by_project', ['projectId'])
    .index('by_project_status', ['projectId', 'status'])
    .index('by_project_order', ['projectId', 'order'])
    .index('by_milestone_type', ['milestoneType'])
    .index('by_planned_date', ['plannedDate'])
    .index('by_status_date', ['status', 'plannedDate']),

  systemAlerts: defineTable({
    projectId: v.optional(v.id('projects')), // Optional for system-wide alerts
    alertType: v.string(), // Flexible string for any alert type
    severity: v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('critical')
    ),
    message: v.string(),
    description: v.optional(v.string()),
    source: v.optional(v.string()), // 'system', 'manual_admin', etc.
    category: v.optional(v.string()), // 'monitoring', 'system', 'performance', etc.
    tags: v.optional(v.array(v.string())),

    // Resolution tracking
    isResolved: v.boolean(),
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.id('users')),
    resolutionNotes: v.optional(v.string()),
    resolutionType: v.optional(
      v.union(
        v.literal('fixed'),
        v.literal('acknowledged'),
        v.literal('dismissed'),
        v.literal('duplicate')
      )
    ),

    // Assignment and ownership
    assignedTo: v.optional(v.id('users')),
    assignedBy: v.optional(v.id('users')),
    assignedAt: v.optional(v.number()),

    // Escalation management
    escalationLevel: v.number(), // 0-3 (0=initial, 3=final warning)
    lastEscalationTime: v.optional(v.number()),
    nextEscalationTime: v.optional(v.number()),
    autoEscalationEnabled: v.optional(v.boolean()),
    escalatedBy: v.optional(v.id('users')),
    escalationReason: v.optional(v.string()),
    deEscalatedAt: v.optional(v.number()),
    deEscalatedBy: v.optional(v.id('users')),
    deEscalationReason: v.optional(v.string()),

    // Alert metrics and context
    urgencyScore: v.optional(v.number()), // 0-100 calculated urgency score
    estimatedResolutionTime: v.optional(v.number()), // Estimated time to resolve in ms
    occurrenceCount: v.optional(v.number()), // How many times this alert occurred
    firstOccurrence: v.optional(v.number()),
    lastOccurrence: v.optional(v.number()),

    // Reopening tracking
    reopenedAt: v.optional(v.number()),
    reopenedBy: v.optional(v.id('users')),
    reopenReason: v.optional(v.string()),

    // Additional context and metadata
    metadata: v.optional(v.any()),
    lastUpdatedBy: v.optional(v.id('users')),
    lastUpdatedAt: v.optional(v.number()),
  })
    .index('by_project', ['projectId'])
    .index('by_type', ['alertType'])
    .index('by_severity', ['severity'])
    .index('by_resolved', ['isResolved'])
    .index('by_assigned', ['assignedTo'])
    .index('by_escalation_time', ['nextEscalationTime'])
    .index('by_category', ['category'])
    .index('by_project_resolved', ['projectId', 'isResolved'])
    .index('by_type_resolved', ['alertType', 'isResolved']),

  monitoringConfig: defineTable({
    projectType: v.string(),
    configKey: v.string(), // "reminder_schedule", "thresholds", etc.
    configValue: v.any(), // JSON configuration data
    isActive: v.boolean(),
    description: v.optional(v.string()),
  })
    .index('by_project_type', ['projectType'])
    .index('by_project_type_key', ['projectType', 'configKey'])
    .index('by_active', ['isActive']),

  escalationConfig: defineTable({
    alertType: v.string(),
    severity: v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('critical')
    ),
    rules: v.object({
      escalationChain: v.array(
        v.object({
          level: v.number(),
          roles: v.array(v.string()),
          delayMinutes: v.number(),
          specificUsers: v.optional(v.array(v.id('users'))),
        })
      ),
      maxEscalationLevel: v.number(),
      autoEscalationEnabled: v.boolean(),
      businessHoursOnly: v.optional(v.boolean()),
      cooldownPeriod: v.optional(v.number()),
    }),
    createdBy: v.id('users'),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_type_severity', ['alertType', 'severity'])
    .index('by_created_by', ['createdBy']),

  // ============= NOTIFICATION DELIVERY LOGS =============
  emailDeliveryLog: defineTable({
    recipientId: v.id('users'),
    email: v.string(),
    subject: v.string(),
    body: v.string(),
    type: v.string(),
    status: v.union(
      v.literal('sent'),
      v.literal('delivered'),
      v.literal('failed'),
      v.literal('bounced')
    ),
    provider: v.optional(v.string()), // 'sendgrid', 'aws-ses', etc.
    providerMessageId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    sentAt: v.number(),
    deliveredAt: v.optional(v.number()),
  })
    .index('by_recipient', ['recipientId'])
    .index('by_status', ['status'])
    .index('by_type', ['type']),

  smsDeliveryLog: defineTable({
    recipientId: v.id('users'),
    phone: v.string(),
    message: v.string(),
    type: v.string(),
    status: v.union(
      v.literal('sent'),
      v.literal('delivered'),
      v.literal('failed'),
      v.literal('undelivered')
    ),
    provider: v.optional(v.string()), // 'twilio', 'aws-sns', etc.
    providerMessageId: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    sentAt: v.number(),
    deliveredAt: v.optional(v.number()),
  })
    .index('by_recipient', ['recipientId'])
    .index('by_status', ['status'])
    .index('by_type', ['type']),

  notificationDeliveryLog: defineTable({
    alertId: v.optional(v.id('systemAlerts')),
    type: v.string(), // 'immediate_alert', 'escalation', 'reminder', etc.
    results: v.any(), // Delivery results summary
    timestamp: v.number(),
  })
    .index('by_alert', ['alertId'])
    .index('by_type', ['type']),

  // ============= ANALYTICS ENGINE =============
  analyticsSnapshots: defineTable({
    date: v.number(),
    type: v.union(
      v.literal('daily'),
      v.literal('weekly'),
      v.literal('monthly'),
      v.literal('quarterly')
    ),
    projectData: v.any(), // AggregatedProjectData
    userData: v.any(), // AggregatedUserData
    transactionData: v.any(), // AggregatedTransactionData
    impactData: v.any(), // AggregatedImpactData
    timestamp: v.number(),
  })
    .index('by_date', ['date'])
    .index('by_type', ['type'])
    .index('by_timestamp', ['timestamp']),

  performanceMetrics: defineTable({
    timestamp: v.number(),
    metrics: v.any(), // ProjectPerformanceMetrics | PlatformPerformanceMetrics
    type: v.union(
      v.literal('project'),
      v.literal('platform'),
      v.literal('user'),
      v.literal('financial')
    ),
    projectId: v.optional(v.id('projects')), // For project-specific metrics
  })
    .index('by_timestamp', ['timestamp'])
    .index('by_type', ['type'])
    .index('by_project', ['projectId']),

  projectPredictions: defineTable({
    projectId: v.id('projects'),
    prediction: v.any(), // ProjectPrediction
    timestamp: v.number(),
    version: v.string(),
    accuracy: v.optional(v.number()), // To track prediction accuracy over time
  })
    .index('by_project', ['projectId'])
    .index('by_timestamp', ['timestamp'])
    .index('by_version', ['version']),

  realTimeMetrics: defineTable({
    timestamp: v.number(),
    metrics: v.any(), // RealTimeMetrics
    systemHealth: v.optional(v.any()), // SystemHealth
  }).index('by_timestamp', ['timestamp']),

  marketPredictions: defineTable({
    timeHorizon: v.number(),
    prediction: v.any(), // MarketPrediction
    timestamp: v.number(),
    version: v.string(),
    accuracy: v.optional(v.number()),
  })
    .index('by_timestamp', ['timestamp'])
    .index('by_horizon', ['timeHorizon']),

  userPredictions: defineTable({
    userId: v.string(),
    prediction: v.any(), // UserPrediction
    timestamp: v.number(),
    segment: v.optional(v.string()),
    accuracy: v.optional(v.number()),
  })
    .index('by_user', ['userId'])
    .index('by_timestamp', ['timestamp'])
    .index('by_segment', ['segment']),

  analyticsReports: defineTable({
    reportType: v.union(
      v.literal('project_performance'),
      v.literal('platform_analytics'),
      v.literal('impact_summary'),
      v.literal('user_engagement'),
      v.literal('financial_metrics')
    ),
    title: v.string(),
    description: v.string(),
    reportData: v.any(),
    generatedBy: v.id('users'),
    generatedAt: v.number(),
    filters: v.optional(v.any()), // DataFilters used
    timeframe: v.any(), // TimeFrame
    format: v.union(v.literal('json'), v.literal('pdf'), v.literal('csv')),
    downloadUrl: v.optional(v.string()),
    isPublic: v.boolean(),
    expiresAt: v.optional(v.number()),
  })
    .index('by_type', ['reportType'])
    .index('by_user', ['generatedBy'])
    .index('by_date', ['generatedAt'])
    .index('by_public', ['isPublic']),


// ============= FILE STORAGE =============
  files: defineTable({
    storageId: v.id('_storage'),
    filename: v.string(),
    contentType: v.string(),
    uploadedAt: v.number(),
  })
    .index('by_filename', ['filename'])
    .index('by_upload_date', ['uploadedAt'])
});
