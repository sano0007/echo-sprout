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
    qualityScore: v.optional(v.number()), // 1-10 scale
    // Document requirements tracking
    requiredDocuments: v.array(v.string()), // todo: enum of document types
    submittedDocuments: v.array(v.string()), // todo: enum of document types
    isDocumentationComplete: v.boolean(),
  })
    .index('by_creator', ['creatorId'])
    .index('by_status', ['status'])
    .index('by_type', ['projectType'])
    .index('by_verification_status', ['verificationStatus'])
    .index('by_verifier', ['assignedVerifierId'])
    .index('by_credits_available', ['status', 'creditsAvailable']),

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
    buyerId: v.id('users'),
    projectId: v.id('projects'),
    creditAmount: v.number(),
    unitPrice: v.number(),
    totalAmount: v.number(),
    platformFee: v.number(), // platform fee
    netAmount: v.number(), // Amount after platform fee
    // paymentMethod: v.union(
    //     v.literal("stripe"),
    //     v.literal("paypal"),
    //     v.literal("bank_transfer"),
    //     v.literal("crypto"),
    // ),
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
    impactDescription: v.string(),
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
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('revision_required')
    ),
    assignedAt: v.float64(),
    startedAt: v.optional(v.float64()),
    completedAt: v.optional(v.float64()),
    dueDate: v.float64(),
    qualityScore: v.optional(v.number()),
    verificationNotes: v.optional(v.string()),
    rejectionReason: v.optional(v.string()),
    revisionRequests: v.optional(v.string()),
    // Checklist items
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
  })
    .index('by_project', ['projectId'])
    .index('by_verifier', ['verifierId'])
    .index('by_status', ['status'])
    .index('by_due_date', ['dueDate'])
    .index('by_priority', ['priority']),

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
    .index('by_verification', ['isVerified']),

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

  userWallet: defineTable({
    userId: v.id('users'),
    availableCredits: v.number(),
    totalPurchased: v.number(),
    totalAllocated: v.number(),
    totalSpent: v.number(),
    lifetimeImpact: v.number(),
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
    metadata: v.optional(v.any()), // Additional context (JSON)(
    //     v.literal("info"),
    //     v.literal("warning"),
    //     v.literal("error"),
    //     v.literal("critical")
    // )
    // severity: v.union,
  })
    .index('by_user', ['userId'])
    .index('by_entity', ['entityType', 'entityId'])
    .index('by_action', ['action']),

  // System notifications
  // notifications: defineTable({
  //     userId: v.id("users"),
  //     type: v.union(
  //         v.literal("project_approved"),
  //         v.literal("project_rejected"),
  //         v.literal("verification_assigned"),
  //         v.literal("payment_received"),
  //         v.literal("progress_update"),
  //         v.literal("certificate_ready"),
  //         v.literal("system_announcement")
  //     ),
  //     title: v.string(),
  //     message: v.string(),
  //     isRead: v.boolean(),
  //     readAt: v.optional(v.string()),
  //     actionUrl: v.optional(v.string()), // Link to relevant page
  //     priority: v.union(v.literal("low"), v.literal("normal"), v.literal("high")),
  //     expiresAt: v.optional(v.string()),
  //     metadata: v.optional(v.any()), // Additional data (JSON)
  // })
  //     .index("by_user", ["userId"])
  //     .index("by_unread", ["userId", "isRead"])
  //     .index("by_type", ["type"])
  //     .index("by_priority", ["priority"]),

  // ============= ANALYTICS & REPORTING =============
  analytics: defineTable({
    metric: v.string(), // "daily_transactions", "project_completions", etc. todo: enum of metrics
    value: v.number(),
    date: v.float64(),
    metadata: v.optional(v.any()), // Context data (JSON)
  })
    .index('by_metric', ['metric'])
    .index('by_date', ['date'])
    .index('by_metric_date', ['metric', 'date']),
});
