"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("convex/server");
const values_1 = require("convex/values");
exports.default = (0, server_1.defineSchema)({
    // ============= USER MANAGEMENT =============
    users: (0, server_1.defineTable)({
        email: values_1.v.string(),
        firstName: values_1.v.string(),
        lastName: values_1.v.string(),
        role: values_1.v.union(values_1.v.literal('project_creator'), values_1.v.literal('credit_buyer'), values_1.v.literal('verifier'), values_1.v.literal('admin')),
        organizationName: values_1.v.optional(values_1.v.string()),
        organizationType: values_1.v.optional(values_1.v.string()),
        phoneNumber: values_1.v.string(),
        address: values_1.v.string(),
        city: values_1.v.string(),
        country: values_1.v.string(),
        isVerified: values_1.v.boolean(),
        profileImage: values_1.v.optional(values_1.v.string()),
        clerkId: values_1.v.string(),
        verifierSpecialty: values_1.v.optional(values_1.v.array(values_1.v.string())), // For verifiers: ["solar", "reforestation", etc.]
        isActive: values_1.v.boolean(),
        lastLoginAt: values_1.v.optional(values_1.v.string()),
    })
        .index('by_email', ['email'])
        .index('by_clerk_id', ['clerkId'])
        .index('by_role', ['role'])
        .index('by_verifier_specialty', ['role', 'verifierSpecialty'])
        .index('by_active', ['isActive']),
    // ============= PROJECT MANAGEMENT =============
    projects: (0, server_1.defineTable)({
        creatorId: values_1.v.id('users'),
        title: values_1.v.string(),
        description: values_1.v.string(),
        projectType: values_1.v.union(values_1.v.literal('reforestation'), values_1.v.literal('solar'), values_1.v.literal('wind'), values_1.v.literal('biogas'), values_1.v.literal('waste_management'), values_1.v.literal('mangrove_restoration')),
        location: values_1.v.object({
            lat: values_1.v.float64(),
            long: values_1.v.float64(),
            name: values_1.v.string(),
        }),
        areaSize: values_1.v.number(),
        estimatedCO2Reduction: values_1.v.number(),
        budget: values_1.v.number(),
        startDate: values_1.v.string(),
        expectedCompletionDate: values_1.v.string(),
        actualCompletionDate: values_1.v.optional(values_1.v.string()),
        status: values_1.v.union(values_1.v.literal('draft'), values_1.v.literal('submitted'), values_1.v.literal('under_review'), values_1.v.literal('approved'), values_1.v.literal('rejected'), values_1.v.literal('active'), values_1.v.literal('completed'), values_1.v.literal('suspended')),
        verificationStatus: values_1.v.union(values_1.v.literal('pending'), values_1.v.literal('in_progress'), values_1.v.literal('verified'), values_1.v.literal('rejected'), values_1.v.literal('revision_required')),
        // Project creator sets credit details
        totalCarbonCredits: values_1.v.number(), // How many credits this project will generate
        pricePerCredit: values_1.v.number(), // Price set by project creator
        creditsAvailable: values_1.v.number(), // Credits still available for purchase
        creditsSold: values_1.v.number(), // Credits already sold
        // Verification tracking
        assignedVerifierId: values_1.v.optional(values_1.v.id('users')),
        verificationStartedAt: values_1.v.optional(values_1.v.float64()),
        verificationCompletedAt: values_1.v.optional(values_1.v.float64()),
        qualityScore: values_1.v.optional(values_1.v.number()), // 1-10 scale
        // Document requirements tracking
        requiredDocuments: values_1.v.array(values_1.v.string()), // todo: enum of document types
        submittedDocuments: values_1.v.array(values_1.v.string()), // todo: enum of document types
        isDocumentationComplete: values_1.v.boolean(),
    })
        .index('by_creator', ['creatorId'])
        .index('by_status', ['status'])
        .index('by_type', ['projectType'])
        .index('by_verification_status', ['verificationStatus'])
        .index('by_verifier', ['assignedVerifierId'])
        .index('by_credits_available', ['status', 'creditsAvailable']),
    // ============= CARBON CREDITS & TRADING =============
    carbonCredits: (0, server_1.defineTable)({
        projectId: values_1.v.id('projects'),
        creditAmount: values_1.v.number(),
        pricePerCredit: values_1.v.number(),
        totalPrice: values_1.v.number(),
        status: values_1.v.union(values_1.v.literal('available'), values_1.v.literal('reserved'), values_1.v.literal('sold')),
        reservedBy: values_1.v.optional(values_1.v.id('users')), // For temporary reservations during checkout
        reservedUntil: values_1.v.optional(values_1.v.string()), // Reservation expiry
        batchNumber: values_1.v.optional(values_1.v.string()), // For tracking credit batches
    })
        .index('by_project', ['projectId'])
        .index('by_status', ['status'])
        .index('by_availability', ['status', 'projectId'])
        .index('by_reserved_by', ['reservedBy']),
    transactions: (0, server_1.defineTable)({
        buyerId: values_1.v.id('users'),
        projectId: values_1.v.id('projects'),
        creditAmount: values_1.v.number(),
        unitPrice: values_1.v.number(),
        totalAmount: values_1.v.number(),
        platformFee: values_1.v.number(), // platform fee
        netAmount: values_1.v.number(), // Amount after platform fee
        // paymentMethod: v.union(
        //     v.literal("stripe"),
        //     v.literal("paypal"),
        //     v.literal("bank_transfer"),
        //     v.literal("crypto"),
        // ),
        paymentStatus: values_1.v.union(values_1.v.literal('pending'), values_1.v.literal('processing'), values_1.v.literal('completed'), values_1.v.literal('failed'), values_1.v.literal('refunded'), values_1.v.literal('expired')),
        stripePaymentIntentId: values_1.v.optional(values_1.v.string()),
        stripeSessionId: values_1.v.optional(values_1.v.string()),
        certificateUrl: values_1.v.optional(values_1.v.string()),
        impactDescription: values_1.v.string(),
        transactionReference: values_1.v.string(), // Unique transaction reference
    })
        .index('by_buyer', ['buyerId'])
        .index('by_project', ['projectId'])
        .index('by_payment_status', ['paymentStatus'])
        .index('by_reference', ['transactionReference']),
    // ============= VERIFICATION SYSTEM =============
    verifications: (0, server_1.defineTable)({
        projectId: values_1.v.id('projects'),
        verifierId: values_1.v.id('users'),
        status: values_1.v.union(values_1.v.literal('assigned'), values_1.v.literal('accepted'), values_1.v.literal('in_progress'), values_1.v.literal('completed'), values_1.v.literal('approved'), values_1.v.literal('rejected'), values_1.v.literal('revision_required')),
        assignedAt: values_1.v.float64(),
        acceptedAt: values_1.v.optional(values_1.v.float64()),
        startedAt: values_1.v.optional(values_1.v.float64()),
        completedAt: values_1.v.optional(values_1.v.float64()),
        dueDate: values_1.v.float64(),
        qualityScore: values_1.v.optional(values_1.v.number()),
        verificationNotes: values_1.v.optional(values_1.v.string()),
        rejectionReason: values_1.v.optional(values_1.v.string()),
        revisionRequests: values_1.v.optional(values_1.v.string()),
        // Enhanced Checklist items with scores
        environmentalImpact: values_1.v.optional(values_1.v.object({
            carbonReductionValidated: values_1.v.optional(values_1.v.boolean()),
            methodologyVerified: values_1.v.optional(values_1.v.boolean()),
            calculationsAccurate: values_1.v.optional(values_1.v.boolean()),
            score: values_1.v.optional(values_1.v.number()), // 0-100
            notes: values_1.v.optional(values_1.v.string()),
        })),
        projectFeasibility: values_1.v.optional(values_1.v.object({
            timelineAssessed: values_1.v.optional(values_1.v.boolean()),
            budgetAnalyzed: values_1.v.optional(values_1.v.boolean()),
            technicalApproachValid: values_1.v.optional(values_1.v.boolean()),
            resourcesAvailable: values_1.v.optional(values_1.v.boolean()),
            score: values_1.v.optional(values_1.v.number()), // 0-100
            notes: values_1.v.optional(values_1.v.string()),
        })),
        documentationQuality: values_1.v.optional(values_1.v.object({
            completenessCheck: values_1.v.optional(values_1.v.boolean()),
            accuracyVerified: values_1.v.optional(values_1.v.boolean()),
            complianceValidated: values_1.v.optional(values_1.v.boolean()),
            formatStandards: values_1.v.optional(values_1.v.boolean()),
            score: values_1.v.optional(values_1.v.number()), // 0-100
            notes: values_1.v.optional(values_1.v.string()),
        })),
        locationVerification: values_1.v.optional(values_1.v.object({
            geographicDataConfirmed: values_1.v.optional(values_1.v.boolean()),
            landRightsVerified: values_1.v.optional(values_1.v.boolean()),
            accessibilityAssessed: values_1.v.optional(values_1.v.boolean()),
            environmentalSuitability: values_1.v.optional(values_1.v.boolean()),
            score: values_1.v.optional(values_1.v.number()), // 0-100
            notes: values_1.v.optional(values_1.v.string()),
        })),
        sustainability: values_1.v.optional(values_1.v.object({
            longTermViabilityAnalyzed: values_1.v.optional(values_1.v.boolean()),
            maintenancePlanReviewed: values_1.v.optional(values_1.v.boolean()),
            stakeholderEngagement: values_1.v.optional(values_1.v.boolean()),
            adaptabilityAssessed: values_1.v.optional(values_1.v.boolean()),
            score: values_1.v.optional(values_1.v.number()), // 0-100
            notes: values_1.v.optional(values_1.v.string()),
        })),
        // Legacy checklist items (for backward compatibility)
        timelineCompliance: values_1.v.optional(values_1.v.boolean()),
        documentationComplete: values_1.v.optional(values_1.v.boolean()),
        co2CalculationAccurate: values_1.v.optional(values_1.v.boolean()),
        environmentalImpactValid: values_1.v.optional(values_1.v.boolean()),
        projectFeasible: values_1.v.optional(values_1.v.boolean()),
        locationVerified: values_1.v.optional(values_1.v.boolean()),
        sustainabilityAssessed: values_1.v.optional(values_1.v.boolean()),
        // Workload management
        verifierWorkload: values_1.v.number(), // Current number of active verifications
        priority: values_1.v.union(values_1.v.literal('low'), values_1.v.literal('normal'), values_1.v.literal('high'), values_1.v.literal('urgent')),
        // Document annotations
        documentAnnotations: values_1.v.optional(values_1.v.array(values_1.v.object({
            documentId: values_1.v.id('documents'),
            annotations: values_1.v.array(values_1.v.object({
                id: values_1.v.string(),
                type: values_1.v.string(),
                content: values_1.v.string(),
                position: values_1.v.object({
                    pageNumber: values_1.v.number(),
                    x: values_1.v.number(),
                    y: values_1.v.number(),
                    width: values_1.v.optional(values_1.v.number()),
                    height: values_1.v.optional(values_1.v.number()),
                }),
                author: values_1.v.string(),
                timestamp: values_1.v.number(),
            })),
        }))),
        // Overall assessment
        overallScore: values_1.v.optional(values_1.v.number()), // Calculated from component scores
        confidenceLevel: values_1.v.optional(values_1.v.union(values_1.v.literal('low'), values_1.v.literal('medium'), values_1.v.literal('high'))),
        recommendationJustification: values_1.v.optional(values_1.v.string()),
    })
        .index('by_project', ['projectId'])
        .index('by_verifier', ['verifierId'])
        .index('by_status', ['status'])
        .index('by_due_date', ['dueDate'])
        .index('by_priority', ['priority'])
        .index('by_accepted', ['verifierId', 'acceptedAt']),
    verificationMessages: (0, server_1.defineTable)({
        verificationId: values_1.v.id('verifications'),
        senderId: values_1.v.id('users'),
        recipientId: values_1.v.id('users'),
        subject: values_1.v.string(),
        message: values_1.v.string(),
        priority: values_1.v.union(values_1.v.literal('low'), values_1.v.literal('normal'), values_1.v.literal('high'), values_1.v.literal('urgent')),
        attachments: values_1.v.optional(values_1.v.array(values_1.v.string())),
        isRead: values_1.v.boolean(),
        readAt: values_1.v.optional(values_1.v.float64()),
        threadId: values_1.v.optional(values_1.v.string()),
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
    documents: (0, server_1.defineTable)({
        entityId: values_1.v.string(), // ID of the associated entity (project, user profile, etc.)
        entityType: values_1.v.union(values_1.v.literal('project'), values_1.v.literal('verification'), values_1.v.literal('user_profile'), values_1.v.literal('educational_content')),
        fileName: values_1.v.string(),
        originalName: values_1.v.string(),
        fileType: values_1.v.string(),
        fileSize: values_1.v.number(),
        fileSizeFormatted: values_1.v.string(), // e.g. "2.5 MB"
        media: values_1.v.object({
            cloudinary_public_id: values_1.v.string(),
            cloudinary_url: values_1.v.string(),
        }),
        thumbnailUrl: values_1.v.optional(values_1.v.string()),
        documentType: values_1.v.union(values_1.v.literal('project_plan'), values_1.v.literal('environmental_assessment'), values_1.v.literal('permits'), values_1.v.literal('photos'), values_1.v.literal('verification_report'), values_1.v.literal('identity_doc'), values_1.v.literal('technical_specs'), values_1.v.literal('budget_breakdown'), values_1.v.literal('timeline'), values_1.v.literal('other')),
        uploadedBy: values_1.v.id('users'),
        isRequired: values_1.v.boolean(), // Is this document required for verification?
        isVerified: values_1.v.boolean(), // Has this document been verified?
        verifiedBy: values_1.v.optional(values_1.v.id('users')),
        verifiedAt: values_1.v.optional(values_1.v.float64()),
    })
        .index('by_entity', ['entityId', 'entityType'])
        .index('by_uploader', ['uploadedBy'])
        .index('by_type', ['documentType'])
        .index('by_verification_status', ['isVerified'])
        .index('by_required', ['entityType', 'isRequired']),
    // ============= PROGRESS TRACKING =============
    progressUpdates: (0, server_1.defineTable)({
        projectId: values_1.v.id('projects'),
        reportedBy: values_1.v.id('users'),
        updateType: values_1.v.union(values_1.v.literal('milestone'), values_1.v.literal('measurement'), values_1.v.literal('photo'), values_1.v.literal('issue'), values_1.v.literal('completion')),
        title: values_1.v.string(),
        description: values_1.v.string(),
        progressPercentage: values_1.v.number(), // 0-100
        measurementData: values_1.v.optional(values_1.v.any()), // JSON data for specific measurements
        location: values_1.v.optional(values_1.v.object({
            lat: values_1.v.float64(),
            long: values_1.v.float64(),
            name: values_1.v.string(),
        })),
        photos: values_1.v.array(values_1.v.object({
            cloudinary_public_id: values_1.v.string(),
            cloudinary_url: values_1.v.string(),
        })),
        reportingDate: values_1.v.float64(),
        // Impact tracking
        carbonImpactToDate: values_1.v.optional(values_1.v.number()), // CO2 reduction achieved so far
        treesPlanted: values_1.v.optional(values_1.v.number()),
        energyGenerated: values_1.v.optional(values_1.v.number()),
        wasteProcessed: values_1.v.optional(values_1.v.number()),
        // Verification
        isVerified: values_1.v.boolean(),
        verifiedBy: values_1.v.optional(values_1.v.id('users')),
        verifiedAt: values_1.v.optional(values_1.v.float64()),
        verificationNotes: values_1.v.optional(values_1.v.string()),
    })
        .index('by_project', ['projectId'])
        .index('by_reporter', ['reportedBy'])
        .index('by_date', ['reportingDate'])
        .index('by_type', ['updateType'])
        .index('by_verification', ['isVerified']),
    // ============= EDUCATIONAL CONTENT =============
    educationalContent: (0, server_1.defineTable)({
        title: values_1.v.string(),
        content: values_1.v.string(), // Rich text/markdown content
        contentType: values_1.v.union(values_1.v.literal('article'), values_1.v.literal('video'), values_1.v.literal('case_study')),
        category: values_1.v.string(),
        tags: values_1.v.array(values_1.v.string()),
        authorId: values_1.v.id('users'),
        status: values_1.v.union(values_1.v.literal('draft'), values_1.v.literal('submitted'), values_1.v.literal('under_review'), values_1.v.literal('approved'), values_1.v.literal('rejected'), values_1.v.literal('published')),
        reviewedBy: values_1.v.optional(values_1.v.id('users')), // Admin who reviewed
        reviewedAt: values_1.v.optional(values_1.v.float64()),
        reviewNotes: values_1.v.optional(values_1.v.string()),
        rejectionReason: values_1.v.optional(values_1.v.string()),
        // Content metadata
        estimatedReadTime: values_1.v.optional(values_1.v.number()), // Minutes
        difficultyLevel: values_1.v.union(values_1.v.literal('beginner'), values_1.v.literal('intermediate'), values_1.v.literal('advanced')),
        viewCount: values_1.v.number(),
        likeCount: values_1.v.number(),
        shareCount: values_1.v.number(),
        isPublished: values_1.v.boolean(),
        publishedAt: values_1.v.optional(values_1.v.float64()),
        lastUpdatedAt: values_1.v.float64(),
    })
        .index('by_author', ['authorId'])
        .index('by_category', ['category'])
        .index('by_status', ['status'])
        .index('by_published', ['isPublished'])
        .index('by_type', ['contentType'])
        .index('by_review', ['status', 'reviewedBy']),
    // ============= FORUM SYSTEM =============
    forumTopics: (0, server_1.defineTable)({
        title: values_1.v.string(),
        content: values_1.v.string(),
        category: values_1.v.string(),
        authorId: values_1.v.id('users'),
        isSticky: values_1.v.boolean(),
        viewCount: values_1.v.number(),
        replyCount: values_1.v.number(),
        lastReplyAt: values_1.v.optional(values_1.v.float64()),
        lastReplyBy: values_1.v.optional(values_1.v.id('users')),
        // Moderation
        // isModerated: v.boolean(),
        // moderatedBy: v.optional(v.id("users")),
        // moderatedAt: v.optional(v.string()),
        // moderationReason: v.optional(v.string()),
        // Topic metadata
        topicType: values_1.v.union(values_1.v.literal('discussion'), values_1.v.literal('question'), values_1.v.literal('announcement'), values_1.v.literal('poll')),
        tags: values_1.v.array(values_1.v.string()),
        upvotes: values_1.v.number(),
        downvotes: values_1.v.number(),
    })
        .index('by_author', ['authorId'])
        .index('by_category', ['category'])
        .index('by_last_reply', ['lastReplyAt'])
        .index('by_type', ['topicType']),
    forumReplies: (0, server_1.defineTable)({
        topicId: values_1.v.id('forumTopics'),
        authorId: values_1.v.id('users'),
        content: values_1.v.string(),
        // parentReplyId: v.optional(v.id("forumReplies")), // For nested replies
        isDeleted: values_1.v.boolean(),
        // Moderation
        // isModerated: v.boolean(),
        // moderatedBy: v.optional(v.id("users")),
        // moderatedAt: v.optional(v.string()),
        // moderationReason: v.optional(v.string()),
        // Reply metadata
        upvotes: values_1.v.number(),
        downvotes: values_1.v.number(),
        // isAcceptedAnswer: v.boolean(), // For question topics
        acceptedBy: values_1.v.optional(values_1.v.id('users')),
        acceptedAt: values_1.v.optional(values_1.v.float64()),
    })
        .index('by_topic', ['topicId'])
        .index('by_author', ['authorId']),
    // .index("by_parent", ["parentReplyId"]),
    // .index("by_accepted", ["isAcceptedAnswer"]),
    // ============= CERTIFICATES & REWARDS =============
    certificates: (0, server_1.defineTable)({
        transactionId: values_1.v.id('transactions'),
        buyerId: values_1.v.id('users'),
        projectId: values_1.v.id('projects'),
        certificateNumber: values_1.v.string(), // Unique certificate number
        creditsAmount: values_1.v.number(),
        impactDescription: values_1.v.string(),
        issueDate: values_1.v.float64(),
        certificateUrl: values_1.v.string(),
        qrCodeUrl: values_1.v.string(),
        isValid: values_1.v.boolean(),
        // Certificate verification
    })
        .index('by_transaction', ['transactionId'])
        .index('by_buyer', ['buyerId'])
        .index('by_project', ['projectId'])
        .index('by_certificate_number', ['certificateNumber']),
    // Verification certificates for approved projects
    verificationCertificates: (0, server_1.defineTable)({
        verificationId: values_1.v.id('verifications'),
        projectId: values_1.v.id('projects'),
        verifierId: values_1.v.id('users'),
        certificateNumber: values_1.v.string(),
        certificateType: values_1.v.union(values_1.v.literal('approval'), values_1.v.literal('quality_assessment'), values_1.v.literal('environmental_compliance')),
        issueDate: values_1.v.float64(),
        validUntil: values_1.v.optional(values_1.v.float64()),
        certificateUrl: values_1.v.string(),
        qrCodeUrl: values_1.v.string(),
        digitalSignature: values_1.v.string(),
        verificationDetails: values_1.v.object({
            overallScore: values_1.v.number(),
            categoryScores: values_1.v.object({
                environmental: values_1.v.number(),
                feasibility: values_1.v.number(),
                documentation: values_1.v.number(),
                location: values_1.v.number(),
                sustainability: values_1.v.number(),
            }),
            verifierCredentials: values_1.v.string(),
            verificationStandard: values_1.v.string(),
            complianceLevel: values_1.v.union(values_1.v.literal('basic'), values_1.v.literal('standard'), values_1.v.literal('premium')),
        }),
        isValid: values_1.v.boolean(),
        revokedAt: values_1.v.optional(values_1.v.float64()),
        revokedBy: values_1.v.optional(values_1.v.id('users')),
        revocationReason: values_1.v.optional(values_1.v.string()),
    })
        .index('by_verification', ['verificationId'])
        .index('by_project', ['projectId'])
        .index('by_verifier', ['verifierId'])
        .index('by_certificate_number', ['certificateNumber'])
        .index('by_issue_date', ['issueDate']),
    userWallet: (0, server_1.defineTable)({
        userId: values_1.v.id('users'),
        availableCredits: values_1.v.number(),
        totalPurchased: values_1.v.number(),
        totalAllocated: values_1.v.number(),
        totalSpent: values_1.v.number(),
        lifetimeImpact: values_1.v.number(),
        lastTransactionAt: values_1.v.optional(values_1.v.float64()),
    }).index('by_user', ['userId']),
    // ============= AUDIT TRAIL & SYSTEM LOGS =============
    auditLogs: (0, server_1.defineTable)({
        userId: values_1.v.optional(values_1.v.id('users')), // null for system actions
        action: values_1.v.string(), // "project_created", "verification_approved", etc. todo: enum of actions
        entityType: values_1.v.string(), // "project", "user", "transaction", etc. todo: enum of entity types
        entityId: values_1.v.string(), // ID of the affected entity
        oldValues: values_1.v.optional(values_1.v.any()), // Previous state (JSON)
        newValues: values_1.v.optional(values_1.v.any()), // New state (JSON)
        metadata: values_1.v.optional(values_1.v.any()), // Additional context (JSON)(
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
    // Enhanced verification audit trails
    verificationAuditLogs: (0, server_1.defineTable)({
        verificationId: values_1.v.id('verifications'),
        verifierId: values_1.v.id('users'),
        action: values_1.v.union(values_1.v.literal('verification_assigned'), values_1.v.literal('verification_accepted'), values_1.v.literal('verification_started'), values_1.v.literal('checklist_updated'), values_1.v.literal('document_annotated'), values_1.v.literal('score_calculated'), values_1.v.literal('message_sent'), values_1.v.literal('verification_completed'), values_1.v.literal('certificate_generated')),
        details: values_1.v.object({
            section: values_1.v.optional(values_1.v.string()), // Which part of verification was affected
            previousValue: values_1.v.optional(values_1.v.any()),
            newValue: values_1.v.optional(values_1.v.any()),
            score: values_1.v.optional(values_1.v.number()),
            notes: values_1.v.optional(values_1.v.string()),
            attachments: values_1.v.optional(values_1.v.array(values_1.v.string())),
        }),
        ipAddress: values_1.v.optional(values_1.v.string()),
        userAgent: values_1.v.optional(values_1.v.string()),
        sessionId: values_1.v.optional(values_1.v.string()),
        timestamp: values_1.v.float64(),
    })
        .index('by_verification', ['verificationId'])
        .index('by_verifier', ['verifierId'])
        .index('by_action', ['action'])
        .index('by_timestamp', ['timestamp']),
    // System notifications
    notifications: (0, server_1.defineTable)({
        recipientId: values_1.v.id('users'),
        type: values_1.v.union(values_1.v.literal('verification_assigned'), values_1.v.literal('verification_started'), values_1.v.literal('verification_completed'), values_1.v.literal('project_approved'), values_1.v.literal('project_rejected'), values_1.v.literal('revision_required'), values_1.v.literal('message_received'), values_1.v.literal('deadline_approaching'), values_1.v.literal('deadline_overdue'), values_1.v.literal('document_uploaded'), values_1.v.literal('document_verified'), values_1.v.literal('quality_score_updated')),
        title: values_1.v.string(),
        message: values_1.v.string(),
        priority: values_1.v.union(values_1.v.literal('low'), values_1.v.literal('normal'), values_1.v.literal('high'), values_1.v.literal('urgent')),
        relatedEntityId: values_1.v.optional(values_1.v.string()),
        relatedEntityType: values_1.v.optional(values_1.v.union(values_1.v.literal('project'), values_1.v.literal('verification'), values_1.v.literal('document'), values_1.v.literal('message'))),
        actionUrl: values_1.v.optional(values_1.v.string()),
        isRead: values_1.v.boolean(),
        readAt: values_1.v.optional(values_1.v.float64()),
        isEmailSent: values_1.v.boolean(),
        isPushSent: values_1.v.boolean(),
        expiresAt: values_1.v.optional(values_1.v.float64()),
        metadata: values_1.v.optional(values_1.v.any()), // Additional data (JSON)
    })
        .index('by_recipient', ['recipientId'])
        .index('by_unread', ['recipientId', 'isRead'])
        .index('by_type', ['type'])
        .index('by_priority', ['priority']),
    // ============= ANALYTICS & REPORTING =============
    analytics: (0, server_1.defineTable)({
        metric: values_1.v.string(), // "daily_transactions", "project_completions", etc. todo: enum of metrics
        value: values_1.v.number(),
        date: values_1.v.float64(),
        metadata: values_1.v.optional(values_1.v.any()), // Context data (JSON)
    })
        .index('by_metric', ['metric'])
        .index('by_date', ['date'])
        .index('by_metric_date', ['metric', 'date']),
});
