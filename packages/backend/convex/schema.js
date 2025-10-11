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
        // Notification preferences
        notificationPreferences: values_1.v.optional(values_1.v.object({
            channels: values_1.v.array(values_1.v.union(values_1.v.literal('email'), values_1.v.literal('in_app'), values_1.v.literal('sms'))),
            alertTypes: values_1.v.object({
                progress_reminders: values_1.v.boolean(),
                milestone_delays: values_1.v.boolean(),
                system_alerts: values_1.v.boolean(),
                escalations: values_1.v.boolean(),
                weekly_reports: values_1.v.boolean(),
            }),
            quietHours: values_1.v.optional(values_1.v.object({
                enabled: values_1.v.boolean(),
                start: values_1.v.string(), // "22:00"
                end: values_1.v.string(), // "08:00"
                timezone: values_1.v.string(),
            })),
            frequency: values_1.v.object({
                immediate: values_1.v.boolean(),
                hourly: values_1.v.boolean(),
                daily: values_1.v.boolean(),
                weekly: values_1.v.boolean(),
            }),
        })),
        preferencesUpdatedAt: values_1.v.optional(values_1.v.number()),
        // Additional contact information
        phone: values_1.v.optional(values_1.v.string()), // For SMS notifications
        name: values_1.v.optional(values_1.v.string()), // Computed field for full name
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
            city: values_1.v.optional(values_1.v.string()),
            country: values_1.v.optional(values_1.v.string()),
        }),
        areaSize: values_1.v.number(),
        estimatedCO2Reduction: values_1.v.number(),
        budget: values_1.v.number(),
        startDate: values_1.v.string(),
        expectedCompletionDate: values_1.v.string(),
        actualCompletionDate: values_1.v.optional(values_1.v.string()),
        milestone1: values_1.v.optional(values_1.v.object({
            name: values_1.v.string(),
            date: values_1.v.string(),
        })),
        milestone2: values_1.v.optional(values_1.v.object({
            name: values_1.v.string(),
            date: values_1.v.string(),
        })),
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
        // Progress tracking
        progressPercentage: values_1.v.optional(values_1.v.number()), // 0-100
        lastProgressUpdate: values_1.v.optional(values_1.v.number()), // timestamp
        // Legacy fields for backward compatibility
        projectImages: values_1.v.optional(values_1.v.array(values_1.v.any())), // Legacy field for old projects
        featuredImages: values_1.v.optional(values_1.v.array(values_1.v.object({
            storageId: values_1.v.string(),
            fileUrl: values_1.v.string(),
        }))),
        siteImages: values_1.v.optional(values_1.v.array(values_1.v.object({
            storageId: values_1.v.string(),
            fileUrl: values_1.v.string(),
        }))),
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
        buyerId: values_1.v.string(), // Clerk ID for consistency with Stripe integration
        projectId: values_1.v.optional(values_1.v.id('projects')),
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
        refundDetails: values_1.v.optional(values_1.v.object({
            refundReason: values_1.v.string(),
            refundAmount: values_1.v.number(),
            adminNotes: values_1.v.string(),
            processedAt: values_1.v.number(),
        })),
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
        entityId: values_1.v.optional(values_1.v.string()), // ID of the associated entity (project, user profile, etc.) - optional for legacy compatibility
        entityType: values_1.v.union(values_1.v.literal('project'), values_1.v.literal('verification'), values_1.v.literal('user_profile'), values_1.v.literal('educational_content')),
        fileName: values_1.v.string(),
        originalName: values_1.v.string(),
        fileType: values_1.v.string(),
        fileSize: values_1.v.number(),
        fileSizeFormatted: values_1.v.string(), // e.g. "2.5 MB"
        media: values_1.v.object({
            storageId: values_1.v.optional(values_1.v.string()),
            fileUrl: values_1.v.optional(values_1.v.string()),
            cloudinary_public_id: values_1.v.optional(values_1.v.string()), // Legacy field
            cloudinary_url: values_1.v.optional(values_1.v.string()), // Legacy field
        }),
        thumbnailUrl: values_1.v.optional(values_1.v.string()),
        description: values_1.v.optional(values_1.v.string()), // Add description field
        documentType: values_1.v.union(values_1.v.literal('project_proposal'), values_1.v.literal('environmental_impact'), values_1.v.literal('site_photographs'), values_1.v.literal('legal_permits'), values_1.v.literal('featured_images'), values_1.v.literal('site_images'), values_1.v.literal('project_plan'), // Legacy
        values_1.v.literal('environmental_assessment'), // Legacy
        values_1.v.literal('permits'), // Legacy
        values_1.v.literal('photos'), // Legacy
        values_1.v.literal('verification_report'), values_1.v.literal('identity_doc'), values_1.v.literal('technical_specs'), values_1.v.literal('budget_breakdown'), values_1.v.literal('timeline'), values_1.v.literal('other')),
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
    // ============= EDUCATIONAL CONTENT =============
    educationalContent: (0, server_1.defineTable)({
        title: values_1.v.string(),
        content: values_1.v.string(), // Rich text/markdown content
        contentType: values_1.v.union(values_1.v.literal('article'), values_1.v.literal('video'), values_1.v.literal('case_study')),
        category: values_1.v.string(),
        tags: values_1.v.array(values_1.v.string()),
        images: values_1.v.optional(values_1.v.array(values_1.v.string())),
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
    // ============= LEARNING PATHS =============
    learningPaths: (0, server_1.defineTable)({
        title: values_1.v.string(),
        description: values_1.v.string(),
        objectives: values_1.v.optional(values_1.v.array(values_1.v.string())),
        level: values_1.v.union(values_1.v.literal('beginner'), values_1.v.literal('intermediate'), values_1.v.literal('advanced')),
        estimatedDuration: values_1.v.number(), // in minutes
        tags: values_1.v.array(values_1.v.string()),
        visibility: values_1.v.union(values_1.v.literal('public'), values_1.v.literal('private'), values_1.v.literal('unlisted')),
        coverImageUrl: values_1.v.optional(values_1.v.string()),
        createdBy: values_1.v.id('users'),
        status: values_1.v.union(values_1.v.literal('draft'), values_1.v.literal('published'), values_1.v.literal('archived')),
        isPublished: values_1.v.boolean(),
        publishedAt: values_1.v.optional(values_1.v.float64()),
        lastUpdatedAt: values_1.v.float64(),
        moduleCount: values_1.v.number(),
        enrollmentCount: values_1.v.number(),
    })
        .index('by_creator', ['createdBy'])
        .index('by_status', ['status'])
        .index('by_visibility', ['visibility'])
        .index('by_published', ['isPublished'])
        .index('by_level', ['level']),
    // ============= LEARNING PATH LESSONS =============
    learningPathLessons: (0, server_1.defineTable)({
        pathId: values_1.v.id('learningPaths'),
        title: values_1.v.string(),
        description: values_1.v.optional(values_1.v.string()),
        videoUrl: values_1.v.optional(values_1.v.string()),
        pdfUrls: values_1.v.array(values_1.v.string()),
        order: values_1.v.number(),
        estimatedDuration: values_1.v.optional(values_1.v.number()),
        createdBy: values_1.v.id('users'),
        lastUpdatedAt: values_1.v.float64(),
    })
        .index('by_path', ['pathId'])
        .index('by_path_order', ['pathId', 'order']),
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
    // ============= LEARN: USER PROGRESS =============
    learningProgress: (0, server_1.defineTable)({
        userId: values_1.v.id('users'),
        pathId: values_1.v.id('learningPaths'),
        lessonId: values_1.v.id('learningPathLessons'),
        itemType: values_1.v.union(values_1.v.literal('video'), values_1.v.literal('pdf')),
        itemIndex: values_1.v.number(),
        completed: values_1.v.boolean(),
        completedAt: values_1.v.optional(values_1.v.float64()),
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
    forumReplyVotes: (0, server_1.defineTable)({
        replyId: values_1.v.id('forumReplies'),
        userId: values_1.v.id('users'),
        value: values_1.v.union(values_1.v.literal(1), values_1.v.literal(-1)),
    })
        .index('by_reply', ['replyId'])
        .index('by_user', ['userId'])
        .index('by_reply_user', ['replyId', 'userId']),
    // .index("by_parent", ["parentReplyId"]),
    // .index("by_accepted", ["isAcceptedAnswer"]),
    // ============= CERTIFICATES & REWARDS =============
    certificates: (0, server_1.defineTable)({
        transactionId: values_1.v.id('transactions'),
        buyerId: values_1.v.string(), // Clerk ID for consistency with transactions
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
        metadata: values_1.v.optional(values_1.v.any()), // Additional context (JSON)
        severity: values_1.v.optional(values_1.v.union(values_1.v.literal('info'), values_1.v.literal('warning'), values_1.v.literal('error'), values_1.v.literal('critical'))),
    }),
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
        senderId: values_1.v.optional(values_1.v.id('users')),
        subject: values_1.v.string(),
        message: values_1.v.string(),
        type: values_1.v.string(),
        severity: values_1.v.optional(values_1.v.string()),
        category: values_1.v.optional(values_1.v.string()),
        channels: values_1.v.array(values_1.v.string()),
        scheduledAt: values_1.v.optional(values_1.v.number()),
        sentAt: values_1.v.optional(values_1.v.number()),
        deliveredAt: values_1.v.optional(values_1.v.number()),
        readAt: values_1.v.optional(values_1.v.number()),
        retryCount: values_1.v.number(),
        deliveryStatus: values_1.v.string(),
        failureReason: values_1.v.optional(values_1.v.string()),
        template: values_1.v.optional(values_1.v.string()),
        templateData: values_1.v.optional(values_1.v.any()),
        priority: values_1.v.union(values_1.v.literal('low'), values_1.v.literal('normal'), values_1.v.literal('high'), values_1.v.literal('urgent')),
        relatedEntityId: values_1.v.optional(values_1.v.string()),
        relatedEntityType: values_1.v.optional(values_1.v.union(values_1.v.literal('project'), values_1.v.literal('verification'), values_1.v.literal('document'), values_1.v.literal('message'), values_1.v.literal('alert'), values_1.v.literal('escalation'))),
        actionUrl: values_1.v.optional(values_1.v.string()),
        expiresAt: values_1.v.optional(values_1.v.number()),
        metadata: values_1.v.optional(values_1.v.any()),
        isRead: values_1.v.boolean(),
        isArchived: values_1.v.optional(values_1.v.boolean()),
        tags: values_1.v.optional(values_1.v.array(values_1.v.string())),
        batchId: values_1.v.optional(values_1.v.string()),
        parentNotificationId: values_1.v.optional(values_1.v.id('notifications')),
        isTest: values_1.v.optional(values_1.v.boolean()),
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
    notificationTemplates: (0, server_1.defineTable)({
        name: values_1.v.string(),
        subject: values_1.v.string(),
        message: values_1.v.string(),
        type: values_1.v.string(),
        category: values_1.v.string(),
        defaultChannels: values_1.v.array(values_1.v.string()),
        variables: values_1.v.array(values_1.v.string()),
        isActive: values_1.v.boolean(),
        createdBy: values_1.v.id('users'),
        lastModifiedBy: values_1.v.id('users'),
        version: values_1.v.number(),
    })
        .index('by_name', ['name'])
        .index('by_type', ['type'])
        .index('by_category', ['category'])
        .index('by_active', ['isActive']),
    // User notification preferences
    userNotificationPreferences: (0, server_1.defineTable)({
        userId: values_1.v.id('users'),
        channels: values_1.v.array(values_1.v.string()),
        alertTypes: values_1.v.object({
            progress_reminders: values_1.v.boolean(),
            milestone_delays: values_1.v.boolean(),
            system_alerts: values_1.v.boolean(),
            escalations: values_1.v.boolean(),
            weekly_reports: values_1.v.boolean(),
            verification_updates: values_1.v.boolean(),
            project_updates: values_1.v.boolean(),
            transaction_notifications: values_1.v.boolean(),
        }),
        quietHours: values_1.v.optional(values_1.v.object({
            enabled: values_1.v.boolean(),
            start: values_1.v.string(),
            end: values_1.v.string(),
            timezone: values_1.v.string(),
        })),
        frequency: values_1.v.object({
            immediate: values_1.v.boolean(),
            hourly: values_1.v.boolean(),
            daily: values_1.v.boolean(),
            weekly: values_1.v.boolean(),
        }),
        lastUpdated: values_1.v.number(),
    }).index('by_user', ['userId']),
    // ============= ANALYTICS & REPORTING =============
    analytics: (0, server_1.defineTable)({
        metric: values_1.v.string(), // "daily_transactions", "project_completions", etc. todo: enum of metrics
        value: values_1.v.number(),
        date: values_1.v.float64(),
        metadata: values_1.v.optional(values_1.v.any()), // Context data (JSON)
        // Additional fields for monitoring analytics
        projectId: values_1.v.optional(values_1.v.id('projects')), // For project-specific metrics
        category: values_1.v.optional(values_1.v.string()), // "monitoring", "performance", "impact", etc.
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
    projectMilestones: (0, server_1.defineTable)({
        projectId: values_1.v.id('projects'),
        milestoneType: values_1.v.union(values_1.v.literal('setup'), values_1.v.literal('progress_25'), values_1.v.literal('progress_50'), values_1.v.literal('progress_75'), values_1.v.literal('impact_first'), values_1.v.literal('verification'), values_1.v.literal('completion')),
        title: values_1.v.string(),
        description: values_1.v.string(),
        plannedDate: values_1.v.float64(),
        actualDate: values_1.v.optional(values_1.v.float64()),
        status: values_1.v.union(values_1.v.literal('pending'), values_1.v.literal('in_progress'), values_1.v.literal('completed'), values_1.v.literal('delayed'), values_1.v.literal('skipped')),
        delayReason: values_1.v.optional(values_1.v.string()),
        impactOnTimeline: values_1.v.optional(values_1.v.string()),
        order: values_1.v.number(), // For milestone ordering
        isRequired: values_1.v.boolean(), // Is this milestone mandatory
    })
        .index('by_project', ['projectId'])
        .index('by_project_status', ['projectId', 'status'])
        .index('by_project_order', ['projectId', 'order'])
        .index('by_milestone_type', ['milestoneType'])
        .index('by_planned_date', ['plannedDate'])
        .index('by_status_date', ['status', 'plannedDate']),
    systemAlerts: (0, server_1.defineTable)({
        projectId: values_1.v.optional(values_1.v.id('projects')), // Optional for system-wide alerts
        alertType: values_1.v.string(), // Flexible string for any alert type
        severity: values_1.v.union(values_1.v.literal('low'), values_1.v.literal('medium'), values_1.v.literal('high'), values_1.v.literal('critical')),
        message: values_1.v.string(),
        description: values_1.v.optional(values_1.v.string()),
        source: values_1.v.optional(values_1.v.string()), // 'system', 'manual_admin', etc.
        category: values_1.v.optional(values_1.v.string()), // 'monitoring', 'system', 'performance', etc.
        tags: values_1.v.optional(values_1.v.array(values_1.v.string())),
        // Resolution tracking
        isResolved: values_1.v.boolean(),
        resolvedAt: values_1.v.optional(values_1.v.number()),
        resolvedBy: values_1.v.optional(values_1.v.id('users')),
        resolutionNotes: values_1.v.optional(values_1.v.string()),
        resolutionType: values_1.v.optional(values_1.v.union(values_1.v.literal('fixed'), values_1.v.literal('acknowledged'), values_1.v.literal('dismissed'), values_1.v.literal('duplicate'))),
        // Assignment and ownership
        assignedTo: values_1.v.optional(values_1.v.id('users')),
        assignedBy: values_1.v.optional(values_1.v.id('users')),
        assignedAt: values_1.v.optional(values_1.v.number()),
        // Escalation management
        escalationLevel: values_1.v.number(), // 0-3 (0=initial, 3=final warning)
        lastEscalationTime: values_1.v.optional(values_1.v.number()),
        nextEscalationTime: values_1.v.optional(values_1.v.number()),
        autoEscalationEnabled: values_1.v.optional(values_1.v.boolean()),
        escalatedBy: values_1.v.optional(values_1.v.id('users')),
        escalationReason: values_1.v.optional(values_1.v.string()),
        deEscalatedAt: values_1.v.optional(values_1.v.number()),
        deEscalatedBy: values_1.v.optional(values_1.v.id('users')),
        deEscalationReason: values_1.v.optional(values_1.v.string()),
        // Alert metrics and context
        urgencyScore: values_1.v.optional(values_1.v.number()), // 0-100 calculated urgency score
        estimatedResolutionTime: values_1.v.optional(values_1.v.number()), // Estimated time to resolve in ms
        occurrenceCount: values_1.v.optional(values_1.v.number()), // How many times this alert occurred
        firstOccurrence: values_1.v.optional(values_1.v.number()),
        lastOccurrence: values_1.v.optional(values_1.v.number()),
        // Reopening tracking
        reopenedAt: values_1.v.optional(values_1.v.number()),
        reopenedBy: values_1.v.optional(values_1.v.id('users')),
        reopenReason: values_1.v.optional(values_1.v.string()),
        // Additional context and metadata
        metadata: values_1.v.optional(values_1.v.any()),
        lastUpdatedBy: values_1.v.optional(values_1.v.id('users')),
        lastUpdatedAt: values_1.v.optional(values_1.v.number()),
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
    monitoringConfig: (0, server_1.defineTable)({
        projectType: values_1.v.string(),
        configKey: values_1.v.string(), // "reminder_schedule", "thresholds", etc.
        configValue: values_1.v.any(), // JSON configuration data
        isActive: values_1.v.boolean(),
        description: values_1.v.optional(values_1.v.string()),
    })
        .index('by_project_type', ['projectType'])
        .index('by_project_type_key', ['projectType', 'configKey'])
        .index('by_active', ['isActive']),
    escalationConfig: (0, server_1.defineTable)({
        alertType: values_1.v.string(),
        severity: values_1.v.union(values_1.v.literal('low'), values_1.v.literal('medium'), values_1.v.literal('high'), values_1.v.literal('critical')),
        rules: values_1.v.object({
            escalationChain: values_1.v.array(values_1.v.object({
                level: values_1.v.number(),
                roles: values_1.v.array(values_1.v.string()),
                delayMinutes: values_1.v.number(),
                specificUsers: values_1.v.optional(values_1.v.array(values_1.v.id('users'))),
            })),
            maxEscalationLevel: values_1.v.number(),
            autoEscalationEnabled: values_1.v.boolean(),
            businessHoursOnly: values_1.v.optional(values_1.v.boolean()),
            cooldownPeriod: values_1.v.optional(values_1.v.number()),
        }),
        createdBy: values_1.v.id('users'),
        createdAt: values_1.v.number(),
        updatedAt: values_1.v.number(),
    })
        .index('by_type_severity', ['alertType', 'severity'])
        .index('by_created_by', ['createdBy']),
    // ============= NOTIFICATION DELIVERY LOGS =============
    emailDeliveryLog: (0, server_1.defineTable)({
        recipientId: values_1.v.id('users'),
        email: values_1.v.string(),
        subject: values_1.v.string(),
        body: values_1.v.string(),
        type: values_1.v.string(),
        status: values_1.v.union(values_1.v.literal('sent'), values_1.v.literal('delivered'), values_1.v.literal('failed'), values_1.v.literal('bounced')),
        provider: values_1.v.optional(values_1.v.string()), // 'sendgrid', 'aws-ses', etc.
        providerMessageId: values_1.v.optional(values_1.v.string()),
        errorMessage: values_1.v.optional(values_1.v.string()),
        sentAt: values_1.v.number(),
        deliveredAt: values_1.v.optional(values_1.v.number()),
    })
        .index('by_recipient', ['recipientId'])
        .index('by_status', ['status'])
        .index('by_type', ['type']),
    smsDeliveryLog: (0, server_1.defineTable)({
        recipientId: values_1.v.id('users'),
        phone: values_1.v.string(),
        message: values_1.v.string(),
        type: values_1.v.string(),
        status: values_1.v.union(values_1.v.literal('sent'), values_1.v.literal('delivered'), values_1.v.literal('failed'), values_1.v.literal('undelivered')),
        provider: values_1.v.optional(values_1.v.string()), // 'twilio', 'aws-sns', etc.
        providerMessageId: values_1.v.optional(values_1.v.string()),
        errorMessage: values_1.v.optional(values_1.v.string()),
        sentAt: values_1.v.number(),
        deliveredAt: values_1.v.optional(values_1.v.number()),
    })
        .index('by_recipient', ['recipientId'])
        .index('by_status', ['status'])
        .index('by_type', ['type']),
    notificationDeliveryLog: (0, server_1.defineTable)({
        alertId: values_1.v.optional(values_1.v.id('systemAlerts')),
        type: values_1.v.string(), // 'immediate_alert', 'escalation', 'reminder', etc.
        results: values_1.v.any(), // Delivery results summary
        timestamp: values_1.v.number(),
    })
        .index('by_alert', ['alertId'])
        .index('by_type', ['type']),
    // ============= ANALYTICS ENGINE =============
    analyticsSnapshots: (0, server_1.defineTable)({
        date: values_1.v.number(),
        type: values_1.v.union(values_1.v.literal('daily'), values_1.v.literal('weekly'), values_1.v.literal('monthly'), values_1.v.literal('quarterly')),
        projectData: values_1.v.any(), // AggregatedProjectData
        userData: values_1.v.any(), // AggregatedUserData
        transactionData: values_1.v.any(), // AggregatedTransactionData
        impactData: values_1.v.any(), // AggregatedImpactData
        timestamp: values_1.v.number(),
    })
        .index('by_date', ['date'])
        .index('by_type', ['type'])
        .index('by_timestamp', ['timestamp']),
    performanceMetrics: (0, server_1.defineTable)({
        timestamp: values_1.v.number(),
        metrics: values_1.v.any(), // ProjectPerformanceMetrics | PlatformPerformanceMetrics
        type: values_1.v.union(values_1.v.literal('project'), values_1.v.literal('platform'), values_1.v.literal('user'), values_1.v.literal('financial')),
        projectId: values_1.v.optional(values_1.v.id('projects')), // For project-specific metrics
    })
        .index('by_timestamp', ['timestamp'])
        .index('by_type', ['type'])
        .index('by_project', ['projectId']),
    projectPredictions: (0, server_1.defineTable)({
        projectId: values_1.v.id('projects'),
        prediction: values_1.v.any(), // ProjectPrediction
        timestamp: values_1.v.number(),
        version: values_1.v.string(),
        accuracy: values_1.v.optional(values_1.v.number()), // To track prediction accuracy over time
    })
        .index('by_project', ['projectId'])
        .index('by_timestamp', ['timestamp'])
        .index('by_version', ['version']),
    realTimeMetrics: (0, server_1.defineTable)({
        timestamp: values_1.v.number(),
        metrics: values_1.v.any(), // RealTimeMetrics
        systemHealth: values_1.v.optional(values_1.v.any()), // SystemHealth
    }).index('by_timestamp', ['timestamp']),
    marketPredictions: (0, server_1.defineTable)({
        timeHorizon: values_1.v.number(),
        prediction: values_1.v.any(), // MarketPrediction
        timestamp: values_1.v.number(),
        version: values_1.v.string(),
        accuracy: values_1.v.optional(values_1.v.number()),
    })
        .index('by_timestamp', ['timestamp'])
        .index('by_horizon', ['timeHorizon']),
    userPredictions: (0, server_1.defineTable)({
        userId: values_1.v.string(),
        prediction: values_1.v.any(), // UserPrediction
        timestamp: values_1.v.number(),
        segment: values_1.v.optional(values_1.v.string()),
        accuracy: values_1.v.optional(values_1.v.number()),
    })
        .index('by_user', ['userId'])
        .index('by_timestamp', ['timestamp'])
        .index('by_segment', ['segment']),
    analyticsReports: (0, server_1.defineTable)({
        reportType: values_1.v.union(values_1.v.literal('project_performance'), values_1.v.literal('platform_analytics'), values_1.v.literal('impact_summary'), values_1.v.literal('user_engagement'), values_1.v.literal('financial_metrics')),
        title: values_1.v.string(),
        description: values_1.v.string(),
        reportData: values_1.v.any(),
        generatedBy: values_1.v.id('users'),
        generatedAt: values_1.v.number(),
        filters: values_1.v.optional(values_1.v.any()), // DataFilters used
        timeframe: values_1.v.any(), // TimeFrame
        format: values_1.v.union(values_1.v.literal('json'), values_1.v.literal('pdf'), values_1.v.literal('csv')),
        downloadUrl: values_1.v.optional(values_1.v.string()),
        isPublic: values_1.v.boolean(),
        expiresAt: values_1.v.optional(values_1.v.number()),
    })
        .index('by_type', ['reportType'])
        .index('by_user', ['generatedBy'])
        .index('by_date', ['generatedAt'])
        .index('by_public', ['isPublic']),
    // ============= PDF REPORT GENERATION =============
    pdf_reports: (0, server_1.defineTable)({
        templateType: values_1.v.union(values_1.v.literal('analytics'), values_1.v.literal('monitoring')),
        reportType: values_1.v.string(), // 'comprehensive', 'platform', 'environmental', 'financial', 'system', 'project', 'alerts', 'performance'
        title: values_1.v.string(),
        status: values_1.v.union(values_1.v.literal('pending'), values_1.v.literal('processing'), values_1.v.literal('completed'), values_1.v.literal('failed')),
        progress: values_1.v.number(), // 0-100
        requestedBy: values_1.v.string(), // Clerk user ID
        requestedAt: values_1.v.number(),
        completedAt: values_1.v.optional(values_1.v.number()),
        errorMessage: values_1.v.optional(values_1.v.string()),
        fileUrl: values_1.v.optional(values_1.v.string()),
        fileSize: values_1.v.optional(values_1.v.number()),
        expiresAt: values_1.v.number(), // Auto-cleanup after expiration
        timeframe: values_1.v.object({
            start: values_1.v.number(),
            end: values_1.v.number(),
            period: values_1.v.string(),
        }),
        filters: values_1.v.optional(values_1.v.any()),
        userInfo: values_1.v.object({
            userId: values_1.v.string(),
            name: values_1.v.string(),
            email: values_1.v.string(),
            role: values_1.v.string(),
        }),
    })
        .index('by_user', ['requestedBy'])
        .index('by_status', ['status'])
        .index('by_template_type', ['templateType'])
        .index('by_report_type', ['reportType'])
        .index('by_requested_at', ['requestedAt'])
        .index('by_expires_at', ['expiresAt'])
        .index('by_user_status', ['requestedBy', 'status']),
    // ============= PROGRESS UPDATES =============
    progressUpdates: (0, server_1.defineTable)({
        projectId: values_1.v.id('projects'),
        // New format (Convex storage)
        submittedBy: values_1.v.optional(values_1.v.id('users')),
        // Old format (Cloudinary) - for backward compatibility
        reportedBy: values_1.v.optional(values_1.v.id('users')),
        updateType: values_1.v.union(values_1.v.literal('milestone'), values_1.v.literal('measurement'), values_1.v.literal('photo'), values_1.v.literal('issue'), values_1.v.literal('completion')),
        title: values_1.v.string(),
        description: values_1.v.string(),
        progressPercentage: values_1.v.float64(),
        // New format (Convex storage)
        photoStorageIds: values_1.v.optional(values_1.v.array(values_1.v.id('_storage'))),
        photoUrls: values_1.v.optional(values_1.v.array(values_1.v.string())), // Cached URLs for quick access
        // Old format (Cloudinary) - for backward compatibility
        photos: values_1.v.optional(values_1.v.array(values_1.v.object({
            cloudinary_public_id: values_1.v.string(),
            cloudinary_url: values_1.v.string(),
        }))),
        location: values_1.v.optional(values_1.v.object({
            lat: values_1.v.float64(),
            long: values_1.v.float64(),
            name: values_1.v.string(),
        })),
        measurementData: values_1.v.optional(values_1.v.object({
            treesPlanted: values_1.v.optional(values_1.v.number()),
            survivalRate: values_1.v.optional(values_1.v.number()),
            energyGenerated: values_1.v.optional(values_1.v.number()),
            systemUptime: values_1.v.optional(values_1.v.number()),
            gasProduced: values_1.v.optional(values_1.v.number()),
            wasteProcessed: values_1.v.optional(values_1.v.number()),
            recyclingRate: values_1.v.optional(values_1.v.number()),
            areaRestored: values_1.v.optional(values_1.v.number()),
            mangrovesPlanted: values_1.v.optional(values_1.v.number()),
            carbonImpactToDate: values_1.v.optional(values_1.v.number()),
        })),
        nextSteps: values_1.v.optional(values_1.v.string()),
        challenges: values_1.v.optional(values_1.v.string()),
        submittedAt: values_1.v.optional(values_1.v.float64()),
        reportingDate: values_1.v.float64(),
        status: values_1.v.optional(values_1.v.union(values_1.v.literal('pending_review'), values_1.v.literal('approved'), values_1.v.literal('rejected'), values_1.v.literal('needs_revision'))),
        isVerified: values_1.v.boolean(),
        verifiedBy: values_1.v.optional(values_1.v.id('users')),
        verifiedAt: values_1.v.optional(values_1.v.float64()),
        verificationNotes: values_1.v.optional(values_1.v.string()),
        // Legacy fields for backward compatibility
        carbonImpactToDate: values_1.v.optional(values_1.v.float64()),
        treesPlanted: values_1.v.optional(values_1.v.float64()),
        energyGenerated: values_1.v.optional(values_1.v.float64()),
        wasteProcessed: values_1.v.optional(values_1.v.float64()),
    })
        .index('by_project', ['projectId'])
        .index('by_submitter', ['submittedBy'])
        .index('by_reporter', ['reportedBy']) // Legacy index
        .index('by_status', ['status'])
        .index('by_project_status', ['projectId', 'status'])
        .index('by_submitted_at', ['submittedAt'])
        .index('by_reporting_date', ['reportingDate']),
});
