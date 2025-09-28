declare const _default: import("convex/server").SchemaDefinition<{
    users: import("convex/server").TableDefinition<import("convex/values").VObject<{
        organizationName?: string | undefined;
        organizationType?: string | undefined;
        profileImage?: string | undefined;
        verifierSpecialty?: string[] | undefined;
        lastLoginAt?: string | undefined;
        notificationPreferences?: {
            quietHours?: {
                enabled: boolean;
                start: string;
                end: string;
                timezone: string;
            } | undefined;
            channels: ("email" | "in_app" | "sms")[];
            alertTypes: {
                progress_reminders: boolean;
                milestone_delays: boolean;
                system_alerts: boolean;
                escalations: boolean;
                weekly_reports: boolean;
            };
            frequency: {
                immediate: boolean;
                hourly: boolean;
                daily: boolean;
                weekly: boolean;
            };
        } | undefined;
        preferencesUpdatedAt?: number | undefined;
        phone?: string | undefined;
        name?: string | undefined;
        email: string;
        firstName: string;
        lastName: string;
        role: "project_creator" | "credit_buyer" | "verifier" | "admin";
        phoneNumber: string;
        address: string;
        city: string;
        country: string;
        isVerified: boolean;
        clerkId: string;
        isActive: boolean;
    }, {
        email: import("convex/values").VString<string, "required">;
        firstName: import("convex/values").VString<string, "required">;
        lastName: import("convex/values").VString<string, "required">;
        role: import("convex/values").VUnion<"project_creator" | "credit_buyer" | "verifier" | "admin", [import("convex/values").VLiteral<"project_creator", "required">, import("convex/values").VLiteral<"credit_buyer", "required">, import("convex/values").VLiteral<"verifier", "required">, import("convex/values").VLiteral<"admin", "required">], "required", never>;
        organizationName: import("convex/values").VString<string | undefined, "optional">;
        organizationType: import("convex/values").VString<string | undefined, "optional">;
        phoneNumber: import("convex/values").VString<string, "required">;
        address: import("convex/values").VString<string, "required">;
        city: import("convex/values").VString<string, "required">;
        country: import("convex/values").VString<string, "required">;
        isVerified: import("convex/values").VBoolean<boolean, "required">;
        profileImage: import("convex/values").VString<string | undefined, "optional">;
        clerkId: import("convex/values").VString<string, "required">;
        verifierSpecialty: import("convex/values").VArray<string[] | undefined, import("convex/values").VString<string, "required">, "optional">;
        isActive: import("convex/values").VBoolean<boolean, "required">;
        lastLoginAt: import("convex/values").VString<string | undefined, "optional">;
        notificationPreferences: import("convex/values").VObject<{
            quietHours?: {
                enabled: boolean;
                start: string;
                end: string;
                timezone: string;
            } | undefined;
            channels: ("email" | "in_app" | "sms")[];
            alertTypes: {
                progress_reminders: boolean;
                milestone_delays: boolean;
                system_alerts: boolean;
                escalations: boolean;
                weekly_reports: boolean;
            };
            frequency: {
                immediate: boolean;
                hourly: boolean;
                daily: boolean;
                weekly: boolean;
            };
        } | undefined, {
            channels: import("convex/values").VArray<("email" | "in_app" | "sms")[], import("convex/values").VUnion<"email" | "in_app" | "sms", [import("convex/values").VLiteral<"email", "required">, import("convex/values").VLiteral<"in_app", "required">, import("convex/values").VLiteral<"sms", "required">], "required", never>, "required">;
            alertTypes: import("convex/values").VObject<{
                progress_reminders: boolean;
                milestone_delays: boolean;
                system_alerts: boolean;
                escalations: boolean;
                weekly_reports: boolean;
            }, {
                progress_reminders: import("convex/values").VBoolean<boolean, "required">;
                milestone_delays: import("convex/values").VBoolean<boolean, "required">;
                system_alerts: import("convex/values").VBoolean<boolean, "required">;
                escalations: import("convex/values").VBoolean<boolean, "required">;
                weekly_reports: import("convex/values").VBoolean<boolean, "required">;
            }, "required", "progress_reminders" | "milestone_delays" | "system_alerts" | "escalations" | "weekly_reports">;
            quietHours: import("convex/values").VObject<{
                enabled: boolean;
                start: string;
                end: string;
                timezone: string;
            } | undefined, {
                enabled: import("convex/values").VBoolean<boolean, "required">;
                start: import("convex/values").VString<string, "required">;
                end: import("convex/values").VString<string, "required">;
                timezone: import("convex/values").VString<string, "required">;
            }, "optional", "enabled" | "start" | "end" | "timezone">;
            frequency: import("convex/values").VObject<{
                immediate: boolean;
                hourly: boolean;
                daily: boolean;
                weekly: boolean;
            }, {
                immediate: import("convex/values").VBoolean<boolean, "required">;
                hourly: import("convex/values").VBoolean<boolean, "required">;
                daily: import("convex/values").VBoolean<boolean, "required">;
                weekly: import("convex/values").VBoolean<boolean, "required">;
            }, "required", "immediate" | "hourly" | "daily" | "weekly">;
        }, "optional", "channels" | "alertTypes" | "quietHours" | "frequency" | "alertTypes.progress_reminders" | "alertTypes.milestone_delays" | "alertTypes.system_alerts" | "alertTypes.escalations" | "alertTypes.weekly_reports" | "quietHours.enabled" | "quietHours.start" | "quietHours.end" | "quietHours.timezone" | "frequency.immediate" | "frequency.hourly" | "frequency.daily" | "frequency.weekly">;
        preferencesUpdatedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        phone: import("convex/values").VString<string | undefined, "optional">;
        name: import("convex/values").VString<string | undefined, "optional">;
    }, "required", "email" | "firstName" | "lastName" | "role" | "organizationName" | "organizationType" | "phoneNumber" | "address" | "city" | "country" | "isVerified" | "profileImage" | "clerkId" | "verifierSpecialty" | "isActive" | "lastLoginAt" | "notificationPreferences" | "preferencesUpdatedAt" | "phone" | "name" | "notificationPreferences.channels" | "notificationPreferences.alertTypes" | "notificationPreferences.quietHours" | "notificationPreferences.frequency" | "notificationPreferences.alertTypes.progress_reminders" | "notificationPreferences.alertTypes.milestone_delays" | "notificationPreferences.alertTypes.system_alerts" | "notificationPreferences.alertTypes.escalations" | "notificationPreferences.alertTypes.weekly_reports" | "notificationPreferences.quietHours.enabled" | "notificationPreferences.quietHours.start" | "notificationPreferences.quietHours.end" | "notificationPreferences.quietHours.timezone" | "notificationPreferences.frequency.immediate" | "notificationPreferences.frequency.hourly" | "notificationPreferences.frequency.daily" | "notificationPreferences.frequency.weekly">, {
        by_email: ["email", "_creationTime"];
        by_clerk_id: ["clerkId", "_creationTime"];
        by_role: ["role", "_creationTime"];
        by_verifier_specialty: ["role", "verifierSpecialty", "_creationTime"];
        by_active: ["isActive", "_creationTime"];
    }, {}, {}>;
    projects: import("convex/server").TableDefinition<import("convex/values").VObject<{
        actualCompletionDate?: string | undefined;
        assignedVerifierId?: import("convex/values").GenericId<"users"> | undefined;
        verificationStartedAt?: number | undefined;
        verificationCompletedAt?: number | undefined;
        qualityScore?: number | undefined;
        progressPercentage?: number | undefined;
        lastProgressUpdate?: number | undefined;
        creatorId: import("convex/values").GenericId<"users">;
        title: string;
        description: string;
        projectType: "reforestation" | "solar" | "wind" | "biogas" | "waste_management" | "mangrove_restoration";
        location: {
            name: string;
            lat: number;
            long: number;
        };
        areaSize: number;
        estimatedCO2Reduction: number;
        budget: number;
        startDate: string;
        expectedCompletionDate: string;
        status: "rejected" | "draft" | "submitted" | "under_review" | "approved" | "active" | "completed" | "suspended";
        verificationStatus: "pending" | "in_progress" | "verified" | "rejected" | "revision_required";
        totalCarbonCredits: number;
        pricePerCredit: number;
        creditsAvailable: number;
        creditsSold: number;
        requiredDocuments: string[];
        submittedDocuments: string[];
        isDocumentationComplete: boolean;
    }, {
        creatorId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        title: import("convex/values").VString<string, "required">;
        description: import("convex/values").VString<string, "required">;
        projectType: import("convex/values").VUnion<"reforestation" | "solar" | "wind" | "biogas" | "waste_management" | "mangrove_restoration", [import("convex/values").VLiteral<"reforestation", "required">, import("convex/values").VLiteral<"solar", "required">, import("convex/values").VLiteral<"wind", "required">, import("convex/values").VLiteral<"biogas", "required">, import("convex/values").VLiteral<"waste_management", "required">, import("convex/values").VLiteral<"mangrove_restoration", "required">], "required", never>;
        location: import("convex/values").VObject<{
            name: string;
            lat: number;
            long: number;
        }, {
            lat: import("convex/values").VFloat64<number, "required">;
            long: import("convex/values").VFloat64<number, "required">;
            name: import("convex/values").VString<string, "required">;
        }, "required", "name" | "lat" | "long">;
        areaSize: import("convex/values").VFloat64<number, "required">;
        estimatedCO2Reduction: import("convex/values").VFloat64<number, "required">;
        budget: import("convex/values").VFloat64<number, "required">;
        startDate: import("convex/values").VString<string, "required">;
        expectedCompletionDate: import("convex/values").VString<string, "required">;
        actualCompletionDate: import("convex/values").VString<string | undefined, "optional">;
        status: import("convex/values").VUnion<"rejected" | "draft" | "submitted" | "under_review" | "approved" | "active" | "completed" | "suspended", [import("convex/values").VLiteral<"draft", "required">, import("convex/values").VLiteral<"submitted", "required">, import("convex/values").VLiteral<"under_review", "required">, import("convex/values").VLiteral<"approved", "required">, import("convex/values").VLiteral<"rejected", "required">, import("convex/values").VLiteral<"active", "required">, import("convex/values").VLiteral<"completed", "required">, import("convex/values").VLiteral<"suspended", "required">], "required", never>;
        verificationStatus: import("convex/values").VUnion<"pending" | "in_progress" | "verified" | "rejected" | "revision_required", [import("convex/values").VLiteral<"pending", "required">, import("convex/values").VLiteral<"in_progress", "required">, import("convex/values").VLiteral<"verified", "required">, import("convex/values").VLiteral<"rejected", "required">, import("convex/values").VLiteral<"revision_required", "required">], "required", never>;
        totalCarbonCredits: import("convex/values").VFloat64<number, "required">;
        pricePerCredit: import("convex/values").VFloat64<number, "required">;
        creditsAvailable: import("convex/values").VFloat64<number, "required">;
        creditsSold: import("convex/values").VFloat64<number, "required">;
        assignedVerifierId: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
        verificationStartedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        verificationCompletedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        qualityScore: import("convex/values").VFloat64<number | undefined, "optional">;
        requiredDocuments: import("convex/values").VArray<string[], import("convex/values").VString<string, "required">, "required">;
        submittedDocuments: import("convex/values").VArray<string[], import("convex/values").VString<string, "required">, "required">;
        isDocumentationComplete: import("convex/values").VBoolean<boolean, "required">;
        progressPercentage: import("convex/values").VFloat64<number | undefined, "optional">;
        lastProgressUpdate: import("convex/values").VFloat64<number | undefined, "optional">;
    }, "required", "creatorId" | "title" | "description" | "projectType" | "location" | "areaSize" | "estimatedCO2Reduction" | "budget" | "startDate" | "expectedCompletionDate" | "actualCompletionDate" | "status" | "verificationStatus" | "totalCarbonCredits" | "pricePerCredit" | "creditsAvailable" | "creditsSold" | "assignedVerifierId" | "verificationStartedAt" | "verificationCompletedAt" | "qualityScore" | "requiredDocuments" | "submittedDocuments" | "isDocumentationComplete" | "progressPercentage" | "lastProgressUpdate" | "location.name" | "location.lat" | "location.long">, {
        by_creator: ["creatorId", "_creationTime"];
        by_status: ["status", "_creationTime"];
        by_type: ["projectType", "_creationTime"];
        by_verification_status: ["verificationStatus", "_creationTime"];
        by_verifier: ["assignedVerifierId", "_creationTime"];
        by_credits_available: ["status", "creditsAvailable", "_creationTime"];
        by_creator_status: ["creatorId", "status", "_creationTime"];
        by_type_status: ["projectType", "status", "_creationTime"];
        by_status_completion: ["status", "expectedCompletionDate", "_creationTime"];
        by_verifier_status: ["assignedVerifierId", "status", "_creationTime"];
    }, {}, {}>;
    carbonCredits: import("convex/server").TableDefinition<import("convex/values").VObject<{
        reservedBy?: import("convex/values").GenericId<"users"> | undefined;
        reservedUntil?: string | undefined;
        batchNumber?: string | undefined;
        status: "available" | "reserved" | "sold";
        pricePerCredit: number;
        projectId: import("convex/values").GenericId<"projects">;
        creditAmount: number;
        totalPrice: number;
    }, {
        projectId: import("convex/values").VId<import("convex/values").GenericId<"projects">, "required">;
        creditAmount: import("convex/values").VFloat64<number, "required">;
        pricePerCredit: import("convex/values").VFloat64<number, "required">;
        totalPrice: import("convex/values").VFloat64<number, "required">;
        status: import("convex/values").VUnion<"available" | "reserved" | "sold", [import("convex/values").VLiteral<"available", "required">, import("convex/values").VLiteral<"reserved", "required">, import("convex/values").VLiteral<"sold", "required">], "required", never>;
        reservedBy: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
        reservedUntil: import("convex/values").VString<string | undefined, "optional">;
        batchNumber: import("convex/values").VString<string | undefined, "optional">;
    }, "required", "status" | "pricePerCredit" | "projectId" | "creditAmount" | "totalPrice" | "reservedBy" | "reservedUntil" | "batchNumber">, {
        by_project: ["projectId", "_creationTime"];
        by_status: ["status", "_creationTime"];
        by_availability: ["status", "projectId", "_creationTime"];
        by_reserved_by: ["reservedBy", "_creationTime"];
    }, {}, {}>;
    transactions: import("convex/server").TableDefinition<import("convex/values").VObject<{
        stripePaymentIntentId?: string | undefined;
        stripeSessionId?: string | undefined;
        certificateUrl?: string | undefined;
        projectId: import("convex/values").GenericId<"projects">;
        creditAmount: number;
        buyerId: import("convex/values").GenericId<"users">;
        unitPrice: number;
        totalAmount: number;
        platformFee: number;
        netAmount: number;
        paymentStatus: "pending" | "completed" | "processing" | "failed" | "refunded" | "expired";
        impactDescription: string;
        transactionReference: string;
    }, {
        buyerId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        projectId: import("convex/values").VId<import("convex/values").GenericId<"projects">, "required">;
        creditAmount: import("convex/values").VFloat64<number, "required">;
        unitPrice: import("convex/values").VFloat64<number, "required">;
        totalAmount: import("convex/values").VFloat64<number, "required">;
        platformFee: import("convex/values").VFloat64<number, "required">;
        netAmount: import("convex/values").VFloat64<number, "required">;
        paymentStatus: import("convex/values").VUnion<"pending" | "completed" | "processing" | "failed" | "refunded" | "expired", [import("convex/values").VLiteral<"pending", "required">, import("convex/values").VLiteral<"processing", "required">, import("convex/values").VLiteral<"completed", "required">, import("convex/values").VLiteral<"failed", "required">, import("convex/values").VLiteral<"refunded", "required">, import("convex/values").VLiteral<"expired", "required">], "required", never>;
        stripePaymentIntentId: import("convex/values").VString<string | undefined, "optional">;
        stripeSessionId: import("convex/values").VString<string | undefined, "optional">;
        certificateUrl: import("convex/values").VString<string | undefined, "optional">;
        impactDescription: import("convex/values").VString<string, "required">;
        transactionReference: import("convex/values").VString<string, "required">;
    }, "required", "projectId" | "creditAmount" | "buyerId" | "unitPrice" | "totalAmount" | "platformFee" | "netAmount" | "paymentStatus" | "stripePaymentIntentId" | "stripeSessionId" | "certificateUrl" | "impactDescription" | "transactionReference">, {
        by_buyer: ["buyerId", "_creationTime"];
        by_project: ["projectId", "_creationTime"];
        by_payment_status: ["paymentStatus", "_creationTime"];
        by_reference: ["transactionReference", "_creationTime"];
    }, {}, {}>;
    verifications: import("convex/server").TableDefinition<import("convex/values").VObject<{
        qualityScore?: number | undefined;
        acceptedAt?: number | undefined;
        startedAt?: number | undefined;
        completedAt?: number | undefined;
        verificationNotes?: string | undefined;
        rejectionReason?: string | undefined;
        revisionRequests?: string | undefined;
        environmentalImpact?: {
            carbonReductionValidated?: boolean | undefined;
            methodologyVerified?: boolean | undefined;
            calculationsAccurate?: boolean | undefined;
            score?: number | undefined;
            notes?: string | undefined;
        } | undefined;
        projectFeasibility?: {
            score?: number | undefined;
            notes?: string | undefined;
            timelineAssessed?: boolean | undefined;
            budgetAnalyzed?: boolean | undefined;
            technicalApproachValid?: boolean | undefined;
            resourcesAvailable?: boolean | undefined;
        } | undefined;
        documentationQuality?: {
            score?: number | undefined;
            notes?: string | undefined;
            completenessCheck?: boolean | undefined;
            accuracyVerified?: boolean | undefined;
            complianceValidated?: boolean | undefined;
            formatStandards?: boolean | undefined;
        } | undefined;
        locationVerification?: {
            score?: number | undefined;
            notes?: string | undefined;
            geographicDataConfirmed?: boolean | undefined;
            landRightsVerified?: boolean | undefined;
            accessibilityAssessed?: boolean | undefined;
            environmentalSuitability?: boolean | undefined;
        } | undefined;
        sustainability?: {
            score?: number | undefined;
            notes?: string | undefined;
            longTermViabilityAnalyzed?: boolean | undefined;
            maintenancePlanReviewed?: boolean | undefined;
            stakeholderEngagement?: boolean | undefined;
            adaptabilityAssessed?: boolean | undefined;
        } | undefined;
        timelineCompliance?: boolean | undefined;
        documentationComplete?: boolean | undefined;
        co2CalculationAccurate?: boolean | undefined;
        environmentalImpactValid?: boolean | undefined;
        projectFeasible?: boolean | undefined;
        locationVerified?: boolean | undefined;
        sustainabilityAssessed?: boolean | undefined;
        documentAnnotations?: {
            documentId: import("convex/values").GenericId<"documents">;
            annotations: {
                id: string;
                type: string;
                content: string;
                position: {
                    width?: number | undefined;
                    height?: number | undefined;
                    pageNumber: number;
                    x: number;
                    y: number;
                };
                author: string;
                timestamp: number;
            }[];
        }[] | undefined;
        overallScore?: number | undefined;
        confidenceLevel?: "low" | "high" | "medium" | undefined;
        recommendationJustification?: string | undefined;
        status: "in_progress" | "rejected" | "revision_required" | "approved" | "completed" | "assigned" | "accepted";
        projectId: import("convex/values").GenericId<"projects">;
        verifierId: import("convex/values").GenericId<"users">;
        assignedAt: number;
        dueDate: number;
        verifierWorkload: number;
        priority: "low" | "normal" | "high" | "urgent";
    }, {
        projectId: import("convex/values").VId<import("convex/values").GenericId<"projects">, "required">;
        verifierId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        status: import("convex/values").VUnion<"in_progress" | "rejected" | "revision_required" | "approved" | "completed" | "assigned" | "accepted", [import("convex/values").VLiteral<"assigned", "required">, import("convex/values").VLiteral<"accepted", "required">, import("convex/values").VLiteral<"in_progress", "required">, import("convex/values").VLiteral<"completed", "required">, import("convex/values").VLiteral<"approved", "required">, import("convex/values").VLiteral<"rejected", "required">, import("convex/values").VLiteral<"revision_required", "required">], "required", never>;
        assignedAt: import("convex/values").VFloat64<number, "required">;
        acceptedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        startedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        completedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        dueDate: import("convex/values").VFloat64<number, "required">;
        qualityScore: import("convex/values").VFloat64<number | undefined, "optional">;
        verificationNotes: import("convex/values").VString<string | undefined, "optional">;
        rejectionReason: import("convex/values").VString<string | undefined, "optional">;
        revisionRequests: import("convex/values").VString<string | undefined, "optional">;
        environmentalImpact: import("convex/values").VObject<{
            carbonReductionValidated?: boolean | undefined;
            methodologyVerified?: boolean | undefined;
            calculationsAccurate?: boolean | undefined;
            score?: number | undefined;
            notes?: string | undefined;
        } | undefined, {
            carbonReductionValidated: import("convex/values").VBoolean<boolean | undefined, "optional">;
            methodologyVerified: import("convex/values").VBoolean<boolean | undefined, "optional">;
            calculationsAccurate: import("convex/values").VBoolean<boolean | undefined, "optional">;
            score: import("convex/values").VFloat64<number | undefined, "optional">;
            notes: import("convex/values").VString<string | undefined, "optional">;
        }, "optional", "carbonReductionValidated" | "methodologyVerified" | "calculationsAccurate" | "score" | "notes">;
        projectFeasibility: import("convex/values").VObject<{
            score?: number | undefined;
            notes?: string | undefined;
            timelineAssessed?: boolean | undefined;
            budgetAnalyzed?: boolean | undefined;
            technicalApproachValid?: boolean | undefined;
            resourcesAvailable?: boolean | undefined;
        } | undefined, {
            timelineAssessed: import("convex/values").VBoolean<boolean | undefined, "optional">;
            budgetAnalyzed: import("convex/values").VBoolean<boolean | undefined, "optional">;
            technicalApproachValid: import("convex/values").VBoolean<boolean | undefined, "optional">;
            resourcesAvailable: import("convex/values").VBoolean<boolean | undefined, "optional">;
            score: import("convex/values").VFloat64<number | undefined, "optional">;
            notes: import("convex/values").VString<string | undefined, "optional">;
        }, "optional", "score" | "notes" | "timelineAssessed" | "budgetAnalyzed" | "technicalApproachValid" | "resourcesAvailable">;
        documentationQuality: import("convex/values").VObject<{
            score?: number | undefined;
            notes?: string | undefined;
            completenessCheck?: boolean | undefined;
            accuracyVerified?: boolean | undefined;
            complianceValidated?: boolean | undefined;
            formatStandards?: boolean | undefined;
        } | undefined, {
            completenessCheck: import("convex/values").VBoolean<boolean | undefined, "optional">;
            accuracyVerified: import("convex/values").VBoolean<boolean | undefined, "optional">;
            complianceValidated: import("convex/values").VBoolean<boolean | undefined, "optional">;
            formatStandards: import("convex/values").VBoolean<boolean | undefined, "optional">;
            score: import("convex/values").VFloat64<number | undefined, "optional">;
            notes: import("convex/values").VString<string | undefined, "optional">;
        }, "optional", "score" | "notes" | "completenessCheck" | "accuracyVerified" | "complianceValidated" | "formatStandards">;
        locationVerification: import("convex/values").VObject<{
            score?: number | undefined;
            notes?: string | undefined;
            geographicDataConfirmed?: boolean | undefined;
            landRightsVerified?: boolean | undefined;
            accessibilityAssessed?: boolean | undefined;
            environmentalSuitability?: boolean | undefined;
        } | undefined, {
            geographicDataConfirmed: import("convex/values").VBoolean<boolean | undefined, "optional">;
            landRightsVerified: import("convex/values").VBoolean<boolean | undefined, "optional">;
            accessibilityAssessed: import("convex/values").VBoolean<boolean | undefined, "optional">;
            environmentalSuitability: import("convex/values").VBoolean<boolean | undefined, "optional">;
            score: import("convex/values").VFloat64<number | undefined, "optional">;
            notes: import("convex/values").VString<string | undefined, "optional">;
        }, "optional", "score" | "notes" | "geographicDataConfirmed" | "landRightsVerified" | "accessibilityAssessed" | "environmentalSuitability">;
        sustainability: import("convex/values").VObject<{
            score?: number | undefined;
            notes?: string | undefined;
            longTermViabilityAnalyzed?: boolean | undefined;
            maintenancePlanReviewed?: boolean | undefined;
            stakeholderEngagement?: boolean | undefined;
            adaptabilityAssessed?: boolean | undefined;
        } | undefined, {
            longTermViabilityAnalyzed: import("convex/values").VBoolean<boolean | undefined, "optional">;
            maintenancePlanReviewed: import("convex/values").VBoolean<boolean | undefined, "optional">;
            stakeholderEngagement: import("convex/values").VBoolean<boolean | undefined, "optional">;
            adaptabilityAssessed: import("convex/values").VBoolean<boolean | undefined, "optional">;
            score: import("convex/values").VFloat64<number | undefined, "optional">;
            notes: import("convex/values").VString<string | undefined, "optional">;
        }, "optional", "score" | "notes" | "longTermViabilityAnalyzed" | "maintenancePlanReviewed" | "stakeholderEngagement" | "adaptabilityAssessed">;
        timelineCompliance: import("convex/values").VBoolean<boolean | undefined, "optional">;
        documentationComplete: import("convex/values").VBoolean<boolean | undefined, "optional">;
        co2CalculationAccurate: import("convex/values").VBoolean<boolean | undefined, "optional">;
        environmentalImpactValid: import("convex/values").VBoolean<boolean | undefined, "optional">;
        projectFeasible: import("convex/values").VBoolean<boolean | undefined, "optional">;
        locationVerified: import("convex/values").VBoolean<boolean | undefined, "optional">;
        sustainabilityAssessed: import("convex/values").VBoolean<boolean | undefined, "optional">;
        verifierWorkload: import("convex/values").VFloat64<number, "required">;
        priority: import("convex/values").VUnion<"low" | "normal" | "high" | "urgent", [import("convex/values").VLiteral<"low", "required">, import("convex/values").VLiteral<"normal", "required">, import("convex/values").VLiteral<"high", "required">, import("convex/values").VLiteral<"urgent", "required">], "required", never>;
        documentAnnotations: import("convex/values").VArray<{
            documentId: import("convex/values").GenericId<"documents">;
            annotations: {
                id: string;
                type: string;
                content: string;
                position: {
                    width?: number | undefined;
                    height?: number | undefined;
                    pageNumber: number;
                    x: number;
                    y: number;
                };
                author: string;
                timestamp: number;
            }[];
        }[] | undefined, import("convex/values").VObject<{
            documentId: import("convex/values").GenericId<"documents">;
            annotations: {
                id: string;
                type: string;
                content: string;
                position: {
                    width?: number | undefined;
                    height?: number | undefined;
                    pageNumber: number;
                    x: number;
                    y: number;
                };
                author: string;
                timestamp: number;
            }[];
        }, {
            documentId: import("convex/values").VId<import("convex/values").GenericId<"documents">, "required">;
            annotations: import("convex/values").VArray<{
                id: string;
                type: string;
                content: string;
                position: {
                    width?: number | undefined;
                    height?: number | undefined;
                    pageNumber: number;
                    x: number;
                    y: number;
                };
                author: string;
                timestamp: number;
            }[], import("convex/values").VObject<{
                id: string;
                type: string;
                content: string;
                position: {
                    width?: number | undefined;
                    height?: number | undefined;
                    pageNumber: number;
                    x: number;
                    y: number;
                };
                author: string;
                timestamp: number;
            }, {
                id: import("convex/values").VString<string, "required">;
                type: import("convex/values").VString<string, "required">;
                content: import("convex/values").VString<string, "required">;
                position: import("convex/values").VObject<{
                    width?: number | undefined;
                    height?: number | undefined;
                    pageNumber: number;
                    x: number;
                    y: number;
                }, {
                    pageNumber: import("convex/values").VFloat64<number, "required">;
                    x: import("convex/values").VFloat64<number, "required">;
                    y: import("convex/values").VFloat64<number, "required">;
                    width: import("convex/values").VFloat64<number | undefined, "optional">;
                    height: import("convex/values").VFloat64<number | undefined, "optional">;
                }, "required", "pageNumber" | "x" | "y" | "width" | "height">;
                author: import("convex/values").VString<string, "required">;
                timestamp: import("convex/values").VFloat64<number, "required">;
            }, "required", "id" | "type" | "content" | "position" | "author" | "timestamp" | "position.pageNumber" | "position.x" | "position.y" | "position.width" | "position.height">, "required">;
        }, "required", "documentId" | "annotations">, "optional">;
        overallScore: import("convex/values").VFloat64<number | undefined, "optional">;
        confidenceLevel: import("convex/values").VUnion<"low" | "high" | "medium" | undefined, [import("convex/values").VLiteral<"low", "required">, import("convex/values").VLiteral<"medium", "required">, import("convex/values").VLiteral<"high", "required">], "optional", never>;
        recommendationJustification: import("convex/values").VString<string | undefined, "optional">;
    }, "required", "status" | "qualityScore" | "projectId" | "verifierId" | "assignedAt" | "acceptedAt" | "startedAt" | "completedAt" | "dueDate" | "verificationNotes" | "rejectionReason" | "revisionRequests" | "environmentalImpact" | "projectFeasibility" | "documentationQuality" | "locationVerification" | "sustainability" | "timelineCompliance" | "documentationComplete" | "co2CalculationAccurate" | "environmentalImpactValid" | "projectFeasible" | "locationVerified" | "sustainabilityAssessed" | "verifierWorkload" | "priority" | "documentAnnotations" | "overallScore" | "confidenceLevel" | "recommendationJustification" | "environmentalImpact.carbonReductionValidated" | "environmentalImpact.methodologyVerified" | "environmentalImpact.calculationsAccurate" | "environmentalImpact.score" | "environmentalImpact.notes" | "projectFeasibility.score" | "projectFeasibility.notes" | "projectFeasibility.timelineAssessed" | "projectFeasibility.budgetAnalyzed" | "projectFeasibility.technicalApproachValid" | "projectFeasibility.resourcesAvailable" | "documentationQuality.score" | "documentationQuality.notes" | "documentationQuality.completenessCheck" | "documentationQuality.accuracyVerified" | "documentationQuality.complianceValidated" | "documentationQuality.formatStandards" | "locationVerification.score" | "locationVerification.notes" | "locationVerification.geographicDataConfirmed" | "locationVerification.landRightsVerified" | "locationVerification.accessibilityAssessed" | "locationVerification.environmentalSuitability" | "sustainability.score" | "sustainability.notes" | "sustainability.longTermViabilityAnalyzed" | "sustainability.maintenancePlanReviewed" | "sustainability.stakeholderEngagement" | "sustainability.adaptabilityAssessed">, {
        by_project: ["projectId", "_creationTime"];
        by_verifier: ["verifierId", "_creationTime"];
        by_status: ["status", "_creationTime"];
        by_due_date: ["dueDate", "_creationTime"];
        by_priority: ["priority", "_creationTime"];
        by_accepted: ["verifierId", "acceptedAt", "_creationTime"];
    }, {}, {}>;
    verificationMessages: import("convex/server").TableDefinition<import("convex/values").VObject<{
        attachments?: string[] | undefined;
        readAt?: number | undefined;
        threadId?: string | undefined;
        priority: "low" | "normal" | "high" | "urgent";
        verificationId: import("convex/values").GenericId<"verifications">;
        senderId: import("convex/values").GenericId<"users">;
        recipientId: import("convex/values").GenericId<"users">;
        subject: string;
        message: string;
        isRead: boolean;
    }, {
        verificationId: import("convex/values").VId<import("convex/values").GenericId<"verifications">, "required">;
        senderId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        recipientId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        subject: import("convex/values").VString<string, "required">;
        message: import("convex/values").VString<string, "required">;
        priority: import("convex/values").VUnion<"low" | "normal" | "high" | "urgent", [import("convex/values").VLiteral<"low", "required">, import("convex/values").VLiteral<"normal", "required">, import("convex/values").VLiteral<"high", "required">, import("convex/values").VLiteral<"urgent", "required">], "required", never>;
        attachments: import("convex/values").VArray<string[] | undefined, import("convex/values").VString<string, "required">, "optional">;
        isRead: import("convex/values").VBoolean<boolean, "required">;
        readAt: import("convex/values").VFloat64<number | undefined, "optional">;
        threadId: import("convex/values").VString<string | undefined, "optional">;
    }, "required", "priority" | "verificationId" | "senderId" | "recipientId" | "subject" | "message" | "attachments" | "isRead" | "readAt" | "threadId">, {
        by_verification: ["verificationId", "_creationTime"];
        by_sender: ["senderId", "_creationTime"];
        by_recipient: ["recipientId", "_creationTime"];
        by_thread: ["threadId", "_creationTime"];
        by_unread: ["recipientId", "isRead", "_creationTime"];
    }, {}, {}>;
    documents: import("convex/server").TableDefinition<import("convex/values").VObject<{
        thumbnailUrl?: string | undefined;
        verifiedBy?: import("convex/values").GenericId<"users"> | undefined;
        verifiedAt?: number | undefined;
        isVerified: boolean;
        entityId: string;
        entityType: "project" | "verification" | "user_profile" | "educational_content";
        fileName: string;
        originalName: string;
        fileType: string;
        fileSize: number;
        fileSizeFormatted: string;
        media: {
            cloudinary_public_id: string;
            cloudinary_url: string;
        };
        documentType: "project_plan" | "environmental_assessment" | "permits" | "photos" | "verification_report" | "identity_doc" | "technical_specs" | "budget_breakdown" | "timeline" | "other";
        uploadedBy: import("convex/values").GenericId<"users">;
        isRequired: boolean;
    }, {
        entityId: import("convex/values").VString<string, "required">;
        entityType: import("convex/values").VUnion<"project" | "verification" | "user_profile" | "educational_content", [import("convex/values").VLiteral<"project", "required">, import("convex/values").VLiteral<"verification", "required">, import("convex/values").VLiteral<"user_profile", "required">, import("convex/values").VLiteral<"educational_content", "required">], "required", never>;
        fileName: import("convex/values").VString<string, "required">;
        originalName: import("convex/values").VString<string, "required">;
        fileType: import("convex/values").VString<string, "required">;
        fileSize: import("convex/values").VFloat64<number, "required">;
        fileSizeFormatted: import("convex/values").VString<string, "required">;
        media: import("convex/values").VObject<{
            cloudinary_public_id: string;
            cloudinary_url: string;
        }, {
            cloudinary_public_id: import("convex/values").VString<string, "required">;
            cloudinary_url: import("convex/values").VString<string, "required">;
        }, "required", "cloudinary_public_id" | "cloudinary_url">;
        thumbnailUrl: import("convex/values").VString<string | undefined, "optional">;
        documentType: import("convex/values").VUnion<"project_plan" | "environmental_assessment" | "permits" | "photos" | "verification_report" | "identity_doc" | "technical_specs" | "budget_breakdown" | "timeline" | "other", [import("convex/values").VLiteral<"project_plan", "required">, import("convex/values").VLiteral<"environmental_assessment", "required">, import("convex/values").VLiteral<"permits", "required">, import("convex/values").VLiteral<"photos", "required">, import("convex/values").VLiteral<"verification_report", "required">, import("convex/values").VLiteral<"identity_doc", "required">, import("convex/values").VLiteral<"technical_specs", "required">, import("convex/values").VLiteral<"budget_breakdown", "required">, import("convex/values").VLiteral<"timeline", "required">, import("convex/values").VLiteral<"other", "required">], "required", never>;
        uploadedBy: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        isRequired: import("convex/values").VBoolean<boolean, "required">;
        isVerified: import("convex/values").VBoolean<boolean, "required">;
        verifiedBy: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
        verifiedAt: import("convex/values").VFloat64<number | undefined, "optional">;
    }, "required", "isVerified" | "entityId" | "entityType" | "fileName" | "originalName" | "fileType" | "fileSize" | "fileSizeFormatted" | "media" | "thumbnailUrl" | "documentType" | "uploadedBy" | "isRequired" | "verifiedBy" | "verifiedAt" | "media.cloudinary_public_id" | "media.cloudinary_url">, {
        by_entity: ["entityId", "entityType", "_creationTime"];
        by_uploader: ["uploadedBy", "_creationTime"];
        by_type: ["documentType", "_creationTime"];
        by_verification_status: ["isVerified", "_creationTime"];
        by_required: ["entityType", "isRequired", "_creationTime"];
    }, {}, {}>;
    educationalContent: import("convex/server").TableDefinition<import("convex/values").VObject<{
        rejectionReason?: string | undefined;
        images?: string[] | undefined;
        reviewedBy?: import("convex/values").GenericId<"users"> | undefined;
        reviewedAt?: number | undefined;
        reviewNotes?: string | undefined;
        estimatedReadTime?: number | undefined;
        publishedAt?: number | undefined;
        title: string;
        status: "rejected" | "draft" | "submitted" | "under_review" | "approved" | "published";
        content: string;
        contentType: "article" | "video" | "case_study";
        category: string;
        tags: string[];
        authorId: import("convex/values").GenericId<"users">;
        difficultyLevel: "beginner" | "intermediate" | "advanced";
        viewCount: number;
        likeCount: number;
        shareCount: number;
        isPublished: boolean;
        lastUpdatedAt: number;
    }, {
        title: import("convex/values").VString<string, "required">;
        content: import("convex/values").VString<string, "required">;
        contentType: import("convex/values").VUnion<"article" | "video" | "case_study", [import("convex/values").VLiteral<"article", "required">, import("convex/values").VLiteral<"video", "required">, import("convex/values").VLiteral<"case_study", "required">], "required", never>;
        category: import("convex/values").VString<string, "required">;
        tags: import("convex/values").VArray<string[], import("convex/values").VString<string, "required">, "required">;
        images: import("convex/values").VArray<string[] | undefined, import("convex/values").VString<string, "required">, "optional">;
        authorId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        status: import("convex/values").VUnion<"rejected" | "draft" | "submitted" | "under_review" | "approved" | "published", [import("convex/values").VLiteral<"draft", "required">, import("convex/values").VLiteral<"submitted", "required">, import("convex/values").VLiteral<"under_review", "required">, import("convex/values").VLiteral<"approved", "required">, import("convex/values").VLiteral<"rejected", "required">, import("convex/values").VLiteral<"published", "required">], "required", never>;
        reviewedBy: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
        reviewedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        reviewNotes: import("convex/values").VString<string | undefined, "optional">;
        rejectionReason: import("convex/values").VString<string | undefined, "optional">;
        estimatedReadTime: import("convex/values").VFloat64<number | undefined, "optional">;
        difficultyLevel: import("convex/values").VUnion<"beginner" | "intermediate" | "advanced", [import("convex/values").VLiteral<"beginner", "required">, import("convex/values").VLiteral<"intermediate", "required">, import("convex/values").VLiteral<"advanced", "required">], "required", never>;
        viewCount: import("convex/values").VFloat64<number, "required">;
        likeCount: import("convex/values").VFloat64<number, "required">;
        shareCount: import("convex/values").VFloat64<number, "required">;
        isPublished: import("convex/values").VBoolean<boolean, "required">;
        publishedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        lastUpdatedAt: import("convex/values").VFloat64<number, "required">;
    }, "required", "title" | "status" | "rejectionReason" | "content" | "contentType" | "category" | "tags" | "images" | "authorId" | "reviewedBy" | "reviewedAt" | "reviewNotes" | "estimatedReadTime" | "difficultyLevel" | "viewCount" | "likeCount" | "shareCount" | "isPublished" | "publishedAt" | "lastUpdatedAt">, {
        by_author: ["authorId", "_creationTime"];
        by_category: ["category", "_creationTime"];
        by_status: ["status", "_creationTime"];
        by_published: ["isPublished", "_creationTime"];
        by_type: ["contentType", "_creationTime"];
        by_review: ["status", "reviewedBy", "_creationTime"];
    }, {}, {}>;
    learningPaths: import("convex/server").TableDefinition<import("convex/values").VObject<{
        publishedAt?: number | undefined;
        objectives?: string[] | undefined;
        coverImageUrl?: string | undefined;
        title: string;
        description: string;
        status: "draft" | "published" | "archived";
        tags: string[];
        isPublished: boolean;
        lastUpdatedAt: number;
        level: "beginner" | "intermediate" | "advanced";
        estimatedDuration: number;
        visibility: "public" | "private" | "unlisted";
        createdBy: import("convex/values").GenericId<"users">;
        moduleCount: number;
        enrollmentCount: number;
    }, {
        title: import("convex/values").VString<string, "required">;
        description: import("convex/values").VString<string, "required">;
        objectives: import("convex/values").VArray<string[] | undefined, import("convex/values").VString<string, "required">, "optional">;
        level: import("convex/values").VUnion<"beginner" | "intermediate" | "advanced", [import("convex/values").VLiteral<"beginner", "required">, import("convex/values").VLiteral<"intermediate", "required">, import("convex/values").VLiteral<"advanced", "required">], "required", never>;
        estimatedDuration: import("convex/values").VFloat64<number, "required">;
        tags: import("convex/values").VArray<string[], import("convex/values").VString<string, "required">, "required">;
        visibility: import("convex/values").VUnion<"public" | "private" | "unlisted", [import("convex/values").VLiteral<"public", "required">, import("convex/values").VLiteral<"private", "required">, import("convex/values").VLiteral<"unlisted", "required">], "required", never>;
        coverImageUrl: import("convex/values").VString<string | undefined, "optional">;
        createdBy: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        status: import("convex/values").VUnion<"draft" | "published" | "archived", [import("convex/values").VLiteral<"draft", "required">, import("convex/values").VLiteral<"published", "required">, import("convex/values").VLiteral<"archived", "required">], "required", never>;
        isPublished: import("convex/values").VBoolean<boolean, "required">;
        publishedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        lastUpdatedAt: import("convex/values").VFloat64<number, "required">;
        moduleCount: import("convex/values").VFloat64<number, "required">;
        enrollmentCount: import("convex/values").VFloat64<number, "required">;
    }, "required", "title" | "description" | "status" | "tags" | "isPublished" | "publishedAt" | "lastUpdatedAt" | "objectives" | "level" | "estimatedDuration" | "visibility" | "coverImageUrl" | "createdBy" | "moduleCount" | "enrollmentCount">, {
        by_creator: ["createdBy", "_creationTime"];
        by_status: ["status", "_creationTime"];
        by_visibility: ["visibility", "_creationTime"];
        by_published: ["isPublished", "_creationTime"];
        by_level: ["level", "_creationTime"];
    }, {}, {}>;
    learningPathLessons: import("convex/server").TableDefinition<import("convex/values").VObject<{
        description?: string | undefined;
        estimatedDuration?: number | undefined;
        videoUrl?: string | undefined;
        title: string;
        lastUpdatedAt: number;
        createdBy: import("convex/values").GenericId<"users">;
        pathId: import("convex/values").GenericId<"learningPaths">;
        pdfUrls: string[];
        order: number;
    }, {
        pathId: import("convex/values").VId<import("convex/values").GenericId<"learningPaths">, "required">;
        title: import("convex/values").VString<string, "required">;
        description: import("convex/values").VString<string | undefined, "optional">;
        videoUrl: import("convex/values").VString<string | undefined, "optional">;
        pdfUrls: import("convex/values").VArray<string[], import("convex/values").VString<string, "required">, "required">;
        order: import("convex/values").VFloat64<number, "required">;
        estimatedDuration: import("convex/values").VFloat64<number | undefined, "optional">;
        createdBy: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        lastUpdatedAt: import("convex/values").VFloat64<number, "required">;
    }, "required", "title" | "description" | "lastUpdatedAt" | "estimatedDuration" | "createdBy" | "pathId" | "videoUrl" | "pdfUrls" | "order">, {
        by_path: ["pathId", "_creationTime"];
        by_path_order: ["pathId", "order", "_creationTime"];
    }, {}, {}>;
    forumTopics: import("convex/server").TableDefinition<import("convex/values").VObject<{
        lastReplyAt?: number | undefined;
        lastReplyBy?: import("convex/values").GenericId<"users"> | undefined;
        title: string;
        content: string;
        category: string;
        tags: string[];
        authorId: import("convex/values").GenericId<"users">;
        viewCount: number;
        isSticky: boolean;
        replyCount: number;
        topicType: "discussion" | "question" | "announcement" | "poll";
        upvotes: number;
        downvotes: number;
    }, {
        title: import("convex/values").VString<string, "required">;
        content: import("convex/values").VString<string, "required">;
        category: import("convex/values").VString<string, "required">;
        authorId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        isSticky: import("convex/values").VBoolean<boolean, "required">;
        viewCount: import("convex/values").VFloat64<number, "required">;
        replyCount: import("convex/values").VFloat64<number, "required">;
        lastReplyAt: import("convex/values").VFloat64<number | undefined, "optional">;
        lastReplyBy: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
        topicType: import("convex/values").VUnion<"discussion" | "question" | "announcement" | "poll", [import("convex/values").VLiteral<"discussion", "required">, import("convex/values").VLiteral<"question", "required">, import("convex/values").VLiteral<"announcement", "required">, import("convex/values").VLiteral<"poll", "required">], "required", never>;
        tags: import("convex/values").VArray<string[], import("convex/values").VString<string, "required">, "required">;
        upvotes: import("convex/values").VFloat64<number, "required">;
        downvotes: import("convex/values").VFloat64<number, "required">;
    }, "required", "title" | "content" | "category" | "tags" | "authorId" | "viewCount" | "isSticky" | "replyCount" | "lastReplyAt" | "lastReplyBy" | "topicType" | "upvotes" | "downvotes">, {
        by_author: ["authorId", "_creationTime"];
        by_category: ["category", "_creationTime"];
        by_last_reply: ["lastReplyAt", "_creationTime"];
        by_type: ["topicType", "_creationTime"];
    }, {}, {}>;
    forumReplies: import("convex/server").TableDefinition<import("convex/values").VObject<{
        acceptedAt?: number | undefined;
        acceptedBy?: import("convex/values").GenericId<"users"> | undefined;
        content: string;
        authorId: import("convex/values").GenericId<"users">;
        upvotes: number;
        downvotes: number;
        topicId: import("convex/values").GenericId<"forumTopics">;
        isDeleted: boolean;
    }, {
        topicId: import("convex/values").VId<import("convex/values").GenericId<"forumTopics">, "required">;
        authorId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        content: import("convex/values").VString<string, "required">;
        isDeleted: import("convex/values").VBoolean<boolean, "required">;
        upvotes: import("convex/values").VFloat64<number, "required">;
        downvotes: import("convex/values").VFloat64<number, "required">;
        acceptedBy: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
        acceptedAt: import("convex/values").VFloat64<number | undefined, "optional">;
    }, "required", "acceptedAt" | "content" | "authorId" | "upvotes" | "downvotes" | "topicId" | "isDeleted" | "acceptedBy">, {
        by_topic: ["topicId", "_creationTime"];
        by_author: ["authorId", "_creationTime"];
    }, {}, {}>;
    learningProgress: import("convex/server").TableDefinition<import("convex/values").VObject<{
        completedAt?: number | undefined;
        completed: boolean;
        pathId: import("convex/values").GenericId<"learningPaths">;
        userId: import("convex/values").GenericId<"users">;
        lessonId: import("convex/values").GenericId<"learningPathLessons">;
        itemType: "video" | "pdf";
        itemIndex: number;
    }, {
        userId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        pathId: import("convex/values").VId<import("convex/values").GenericId<"learningPaths">, "required">;
        lessonId: import("convex/values").VId<import("convex/values").GenericId<"learningPathLessons">, "required">;
        itemType: import("convex/values").VUnion<"video" | "pdf", [import("convex/values").VLiteral<"video", "required">, import("convex/values").VLiteral<"pdf", "required">], "required", never>;
        itemIndex: import("convex/values").VFloat64<number, "required">;
        completed: import("convex/values").VBoolean<boolean, "required">;
        completedAt: import("convex/values").VFloat64<number | undefined, "optional">;
    }, "required", "completed" | "completedAt" | "pathId" | "userId" | "lessonId" | "itemType" | "itemIndex">, {
        by_user_path: ["userId", "pathId", "_creationTime"];
        by_user_lesson: ["userId", "lessonId", "_creationTime"];
        by_user: ["userId", "_creationTime"];
        by_unique_key: ["userId", "pathId", "lessonId", "itemType", "itemIndex", "_creationTime"];
    }, {}, {}>;
    forumReplyVotes: import("convex/server").TableDefinition<import("convex/values").VObject<{
        userId: import("convex/values").GenericId<"users">;
        replyId: import("convex/values").GenericId<"forumReplies">;
        value: 1 | -1;
    }, {
        replyId: import("convex/values").VId<import("convex/values").GenericId<"forumReplies">, "required">;
        userId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        value: import("convex/values").VUnion<1 | -1, [import("convex/values").VLiteral<1, "required">, import("convex/values").VLiteral<-1, "required">], "required", never>;
    }, "required", "userId" | "replyId" | "value">, {
        by_reply: ["replyId", "_creationTime"];
        by_user: ["userId", "_creationTime"];
        by_reply_user: ["replyId", "userId", "_creationTime"];
    }, {}, {}>;
    certificates: import("convex/server").TableDefinition<import("convex/values").VObject<{
        projectId: import("convex/values").GenericId<"projects">;
        buyerId: import("convex/values").GenericId<"users">;
        certificateUrl: string;
        impactDescription: string;
        transactionId: import("convex/values").GenericId<"transactions">;
        certificateNumber: string;
        creditsAmount: number;
        issueDate: number;
        qrCodeUrl: string;
        isValid: boolean;
    }, {
        transactionId: import("convex/values").VId<import("convex/values").GenericId<"transactions">, "required">;
        buyerId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        projectId: import("convex/values").VId<import("convex/values").GenericId<"projects">, "required">;
        certificateNumber: import("convex/values").VString<string, "required">;
        creditsAmount: import("convex/values").VFloat64<number, "required">;
        impactDescription: import("convex/values").VString<string, "required">;
        issueDate: import("convex/values").VFloat64<number, "required">;
        certificateUrl: import("convex/values").VString<string, "required">;
        qrCodeUrl: import("convex/values").VString<string, "required">;
        isValid: import("convex/values").VBoolean<boolean, "required">;
    }, "required", "projectId" | "buyerId" | "certificateUrl" | "impactDescription" | "transactionId" | "certificateNumber" | "creditsAmount" | "issueDate" | "qrCodeUrl" | "isValid">, {
        by_transaction: ["transactionId", "_creationTime"];
        by_buyer: ["buyerId", "_creationTime"];
        by_project: ["projectId", "_creationTime"];
        by_certificate_number: ["certificateNumber", "_creationTime"];
    }, {}, {}>;
    verificationCertificates: import("convex/server").TableDefinition<import("convex/values").VObject<{
        validUntil?: number | undefined;
        revokedAt?: number | undefined;
        revokedBy?: import("convex/values").GenericId<"users"> | undefined;
        revocationReason?: string | undefined;
        projectId: import("convex/values").GenericId<"projects">;
        certificateUrl: string;
        verifierId: import("convex/values").GenericId<"users">;
        verificationId: import("convex/values").GenericId<"verifications">;
        certificateNumber: string;
        issueDate: number;
        qrCodeUrl: string;
        isValid: boolean;
        certificateType: "approval" | "quality_assessment" | "environmental_compliance";
        digitalSignature: string;
        verificationDetails: {
            overallScore: number;
            categoryScores: {
                location: number;
                sustainability: number;
                environmental: number;
                feasibility: number;
                documentation: number;
            };
            verifierCredentials: string;
            verificationStandard: string;
            complianceLevel: "basic" | "standard" | "premium";
        };
    }, {
        verificationId: import("convex/values").VId<import("convex/values").GenericId<"verifications">, "required">;
        projectId: import("convex/values").VId<import("convex/values").GenericId<"projects">, "required">;
        verifierId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        certificateNumber: import("convex/values").VString<string, "required">;
        certificateType: import("convex/values").VUnion<"approval" | "quality_assessment" | "environmental_compliance", [import("convex/values").VLiteral<"approval", "required">, import("convex/values").VLiteral<"quality_assessment", "required">, import("convex/values").VLiteral<"environmental_compliance", "required">], "required", never>;
        issueDate: import("convex/values").VFloat64<number, "required">;
        validUntil: import("convex/values").VFloat64<number | undefined, "optional">;
        certificateUrl: import("convex/values").VString<string, "required">;
        qrCodeUrl: import("convex/values").VString<string, "required">;
        digitalSignature: import("convex/values").VString<string, "required">;
        verificationDetails: import("convex/values").VObject<{
            overallScore: number;
            categoryScores: {
                location: number;
                sustainability: number;
                environmental: number;
                feasibility: number;
                documentation: number;
            };
            verifierCredentials: string;
            verificationStandard: string;
            complianceLevel: "basic" | "standard" | "premium";
        }, {
            overallScore: import("convex/values").VFloat64<number, "required">;
            categoryScores: import("convex/values").VObject<{
                location: number;
                sustainability: number;
                environmental: number;
                feasibility: number;
                documentation: number;
            }, {
                environmental: import("convex/values").VFloat64<number, "required">;
                feasibility: import("convex/values").VFloat64<number, "required">;
                documentation: import("convex/values").VFloat64<number, "required">;
                location: import("convex/values").VFloat64<number, "required">;
                sustainability: import("convex/values").VFloat64<number, "required">;
            }, "required", "location" | "sustainability" | "environmental" | "feasibility" | "documentation">;
            verifierCredentials: import("convex/values").VString<string, "required">;
            verificationStandard: import("convex/values").VString<string, "required">;
            complianceLevel: import("convex/values").VUnion<"basic" | "standard" | "premium", [import("convex/values").VLiteral<"basic", "required">, import("convex/values").VLiteral<"standard", "required">, import("convex/values").VLiteral<"premium", "required">], "required", never>;
        }, "required", "overallScore" | "categoryScores" | "verifierCredentials" | "verificationStandard" | "complianceLevel" | "categoryScores.location" | "categoryScores.sustainability" | "categoryScores.environmental" | "categoryScores.feasibility" | "categoryScores.documentation">;
        isValid: import("convex/values").VBoolean<boolean, "required">;
        revokedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        revokedBy: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
        revocationReason: import("convex/values").VString<string | undefined, "optional">;
    }, "required", "projectId" | "certificateUrl" | "verifierId" | "verificationId" | "certificateNumber" | "issueDate" | "qrCodeUrl" | "isValid" | "certificateType" | "validUntil" | "digitalSignature" | "verificationDetails" | "revokedAt" | "revokedBy" | "revocationReason" | "verificationDetails.overallScore" | "verificationDetails.categoryScores" | "verificationDetails.verifierCredentials" | "verificationDetails.verificationStandard" | "verificationDetails.complianceLevel" | "verificationDetails.categoryScores.location" | "verificationDetails.categoryScores.sustainability" | "verificationDetails.categoryScores.environmental" | "verificationDetails.categoryScores.feasibility" | "verificationDetails.categoryScores.documentation">, {
        by_verification: ["verificationId", "_creationTime"];
        by_project: ["projectId", "_creationTime"];
        by_verifier: ["verifierId", "_creationTime"];
        by_certificate_number: ["certificateNumber", "_creationTime"];
        by_issue_date: ["issueDate", "_creationTime"];
    }, {}, {}>;
    userWallet: import("convex/server").TableDefinition<import("convex/values").VObject<{
        lastTransactionAt?: number | undefined;
        userId: import("convex/values").GenericId<"users">;
        availableCredits: number;
        totalPurchased: number;
        totalAllocated: number;
        totalSpent: number;
        lifetimeImpact: number;
    }, {
        userId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        availableCredits: import("convex/values").VFloat64<number, "required">;
        totalPurchased: import("convex/values").VFloat64<number, "required">;
        totalAllocated: import("convex/values").VFloat64<number, "required">;
        totalSpent: import("convex/values").VFloat64<number, "required">;
        lifetimeImpact: import("convex/values").VFloat64<number, "required">;
        lastTransactionAt: import("convex/values").VFloat64<number | undefined, "optional">;
    }, "required", "userId" | "availableCredits" | "totalPurchased" | "totalAllocated" | "totalSpent" | "lifetimeImpact" | "lastTransactionAt">, {
        by_user: ["userId", "_creationTime"];
    }, {}, {}>;
    auditLogs: import("convex/server").TableDefinition<import("convex/values").VObject<{
        userId?: import("convex/values").GenericId<"users"> | undefined;
        oldValues?: any;
        newValues?: any;
        metadata?: any;
        severity?: "info" | "warning" | "error" | "critical" | undefined;
        entityId: string;
        entityType: string;
        action: string;
    }, {
        userId: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
        action: import("convex/values").VString<string, "required">;
        entityType: import("convex/values").VString<string, "required">;
        entityId: import("convex/values").VString<string, "required">;
        oldValues: import("convex/values").VAny<any, "optional", string>;
        newValues: import("convex/values").VAny<any, "optional", string>;
        metadata: import("convex/values").VAny<any, "optional", string>;
        severity: import("convex/values").VUnion<"info" | "warning" | "error" | "critical" | undefined, [import("convex/values").VLiteral<"info", "required">, import("convex/values").VLiteral<"warning", "required">, import("convex/values").VLiteral<"error", "required">, import("convex/values").VLiteral<"critical", "required">], "optional", never>;
    }, "required", "entityId" | "entityType" | "userId" | "action" | "oldValues" | "newValues" | "metadata" | "severity" | `oldValues.${string}` | `newValues.${string}` | `metadata.${string}`>, {}, {}, {}>;
    verificationAuditLogs: import("convex/server").TableDefinition<import("convex/values").VObject<{
        ipAddress?: string | undefined;
        userAgent?: string | undefined;
        sessionId?: string | undefined;
        verifierId: import("convex/values").GenericId<"users">;
        timestamp: number;
        verificationId: import("convex/values").GenericId<"verifications">;
        action: "verification_assigned" | "verification_accepted" | "verification_started" | "checklist_updated" | "document_annotated" | "score_calculated" | "message_sent" | "verification_completed" | "certificate_generated";
        details: {
            score?: number | undefined;
            notes?: string | undefined;
            attachments?: string[] | undefined;
            section?: string | undefined;
            previousValue?: any;
            newValue?: any;
        };
    }, {
        verificationId: import("convex/values").VId<import("convex/values").GenericId<"verifications">, "required">;
        verifierId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        action: import("convex/values").VUnion<"verification_assigned" | "verification_accepted" | "verification_started" | "checklist_updated" | "document_annotated" | "score_calculated" | "message_sent" | "verification_completed" | "certificate_generated", [import("convex/values").VLiteral<"verification_assigned", "required">, import("convex/values").VLiteral<"verification_accepted", "required">, import("convex/values").VLiteral<"verification_started", "required">, import("convex/values").VLiteral<"checklist_updated", "required">, import("convex/values").VLiteral<"document_annotated", "required">, import("convex/values").VLiteral<"score_calculated", "required">, import("convex/values").VLiteral<"message_sent", "required">, import("convex/values").VLiteral<"verification_completed", "required">, import("convex/values").VLiteral<"certificate_generated", "required">], "required", never>;
        details: import("convex/values").VObject<{
            score?: number | undefined;
            notes?: string | undefined;
            attachments?: string[] | undefined;
            section?: string | undefined;
            previousValue?: any;
            newValue?: any;
        }, {
            section: import("convex/values").VString<string | undefined, "optional">;
            previousValue: import("convex/values").VAny<any, "optional", string>;
            newValue: import("convex/values").VAny<any, "optional", string>;
            score: import("convex/values").VFloat64<number | undefined, "optional">;
            notes: import("convex/values").VString<string | undefined, "optional">;
            attachments: import("convex/values").VArray<string[] | undefined, import("convex/values").VString<string, "required">, "optional">;
        }, "required", "score" | "notes" | "attachments" | "section" | "previousValue" | "newValue" | `previousValue.${string}` | `newValue.${string}`>;
        ipAddress: import("convex/values").VString<string | undefined, "optional">;
        userAgent: import("convex/values").VString<string | undefined, "optional">;
        sessionId: import("convex/values").VString<string | undefined, "optional">;
        timestamp: import("convex/values").VFloat64<number, "required">;
    }, "required", "verifierId" | "timestamp" | "verificationId" | "action" | "details" | "ipAddress" | "userAgent" | "sessionId" | "details.score" | "details.notes" | "details.attachments" | "details.section" | "details.previousValue" | "details.newValue" | `details.previousValue.${string}` | `details.newValue.${string}`>, {
        by_verification: ["verificationId", "_creationTime"];
        by_verifier: ["verifierId", "_creationTime"];
        by_action: ["action", "_creationTime"];
        by_timestamp: ["timestamp", "_creationTime"];
    }, {}, {}>;
    notifications: import("convex/server").TableDefinition<import("convex/values").VObject<{
        senderId?: import("convex/values").GenericId<"users"> | undefined;
        readAt?: number | undefined;
        category?: string | undefined;
        tags?: string[] | undefined;
        metadata?: any;
        severity?: string | undefined;
        scheduledAt?: number | undefined;
        sentAt?: number | undefined;
        deliveredAt?: number | undefined;
        failureReason?: string | undefined;
        template?: string | undefined;
        templateData?: any;
        relatedEntityId?: string | undefined;
        relatedEntityType?: "message" | "project" | "verification" | "document" | "alert" | "escalation" | undefined;
        actionUrl?: string | undefined;
        expiresAt?: number | undefined;
        isArchived?: boolean | undefined;
        batchId?: string | undefined;
        parentNotificationId?: import("convex/values").GenericId<"notifications"> | undefined;
        isTest?: boolean | undefined;
        type: string;
        channels: string[];
        priority: "low" | "normal" | "high" | "urgent";
        recipientId: import("convex/values").GenericId<"users">;
        subject: string;
        message: string;
        isRead: boolean;
        retryCount: number;
        deliveryStatus: string;
    }, {
        recipientId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        senderId: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
        subject: import("convex/values").VString<string, "required">;
        message: import("convex/values").VString<string, "required">;
        type: import("convex/values").VString<string, "required">;
        severity: import("convex/values").VString<string | undefined, "optional">;
        category: import("convex/values").VString<string | undefined, "optional">;
        channels: import("convex/values").VArray<string[], import("convex/values").VString<string, "required">, "required">;
        scheduledAt: import("convex/values").VFloat64<number | undefined, "optional">;
        sentAt: import("convex/values").VFloat64<number | undefined, "optional">;
        deliveredAt: import("convex/values").VFloat64<number | undefined, "optional">;
        readAt: import("convex/values").VFloat64<number | undefined, "optional">;
        retryCount: import("convex/values").VFloat64<number, "required">;
        deliveryStatus: import("convex/values").VString<string, "required">;
        failureReason: import("convex/values").VString<string | undefined, "optional">;
        template: import("convex/values").VString<string | undefined, "optional">;
        templateData: import("convex/values").VAny<any, "optional", string>;
        priority: import("convex/values").VUnion<"low" | "normal" | "high" | "urgent", [import("convex/values").VLiteral<"low", "required">, import("convex/values").VLiteral<"normal", "required">, import("convex/values").VLiteral<"high", "required">, import("convex/values").VLiteral<"urgent", "required">], "required", never>;
        relatedEntityId: import("convex/values").VString<string | undefined, "optional">;
        relatedEntityType: import("convex/values").VUnion<"message" | "project" | "verification" | "document" | "alert" | "escalation" | undefined, [import("convex/values").VLiteral<"project", "required">, import("convex/values").VLiteral<"verification", "required">, import("convex/values").VLiteral<"document", "required">, import("convex/values").VLiteral<"message", "required">, import("convex/values").VLiteral<"alert", "required">, import("convex/values").VLiteral<"escalation", "required">], "optional", never>;
        actionUrl: import("convex/values").VString<string | undefined, "optional">;
        expiresAt: import("convex/values").VFloat64<number | undefined, "optional">;
        metadata: import("convex/values").VAny<any, "optional", string>;
        isRead: import("convex/values").VBoolean<boolean, "required">;
        isArchived: import("convex/values").VBoolean<boolean | undefined, "optional">;
        tags: import("convex/values").VArray<string[] | undefined, import("convex/values").VString<string, "required">, "optional">;
        batchId: import("convex/values").VString<string | undefined, "optional">;
        parentNotificationId: import("convex/values").VId<import("convex/values").GenericId<"notifications"> | undefined, "optional">;
        isTest: import("convex/values").VBoolean<boolean | undefined, "optional">;
    }, "required", "type" | "channels" | "priority" | "senderId" | "recipientId" | "subject" | "message" | "isRead" | "readAt" | "category" | "tags" | "metadata" | "severity" | `metadata.${string}` | "scheduledAt" | "sentAt" | "deliveredAt" | "retryCount" | "deliveryStatus" | "failureReason" | "template" | "templateData" | "relatedEntityId" | "relatedEntityType" | "actionUrl" | "expiresAt" | "isArchived" | "batchId" | "parentNotificationId" | "isTest" | `templateData.${string}`>, {
        by_recipient: ["recipientId", "_creationTime"];
        by_unread: ["recipientId", "isRead", "_creationTime"];
        by_type: ["type", "_creationTime"];
        by_priority: ["priority", "_creationTime"];
        by_scheduled: ["scheduledAt", "_creationTime"];
        by_sent: ["sentAt", "_creationTime"];
        by_status: ["deliveryStatus", "_creationTime"];
        by_category: ["category", "_creationTime"];
        by_severity: ["severity", "_creationTime"];
        by_entity: ["relatedEntityType", "relatedEntityId", "_creationTime"];
        by_batch: ["batchId", "_creationTime"];
        by_parent: ["parentNotificationId", "_creationTime"];
        by_test: ["isTest", "_creationTime"];
    }, {}, {}>;
    notificationTemplates: import("convex/server").TableDefinition<import("convex/values").VObject<{
        type: string;
        isActive: boolean;
        name: string;
        subject: string;
        message: string;
        category: string;
        createdBy: import("convex/values").GenericId<"users">;
        defaultChannels: string[];
        variables: string[];
        lastModifiedBy: import("convex/values").GenericId<"users">;
        version: number;
    }, {
        name: import("convex/values").VString<string, "required">;
        subject: import("convex/values").VString<string, "required">;
        message: import("convex/values").VString<string, "required">;
        type: import("convex/values").VString<string, "required">;
        category: import("convex/values").VString<string, "required">;
        defaultChannels: import("convex/values").VArray<string[], import("convex/values").VString<string, "required">, "required">;
        variables: import("convex/values").VArray<string[], import("convex/values").VString<string, "required">, "required">;
        isActive: import("convex/values").VBoolean<boolean, "required">;
        createdBy: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        lastModifiedBy: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        version: import("convex/values").VFloat64<number, "required">;
    }, "required", "type" | "isActive" | "name" | "subject" | "message" | "category" | "createdBy" | "defaultChannels" | "variables" | "lastModifiedBy" | "version">, {
        by_name: ["name", "_creationTime"];
        by_type: ["type", "_creationTime"];
        by_category: ["category", "_creationTime"];
        by_active: ["isActive", "_creationTime"];
    }, {}, {}>;
    userNotificationPreferences: import("convex/server").TableDefinition<import("convex/values").VObject<{
        quietHours?: {
            enabled: boolean;
            start: string;
            end: string;
            timezone: string;
        } | undefined;
        channels: string[];
        alertTypes: {
            progress_reminders: boolean;
            milestone_delays: boolean;
            system_alerts: boolean;
            escalations: boolean;
            weekly_reports: boolean;
            verification_updates: boolean;
            project_updates: boolean;
            transaction_notifications: boolean;
        };
        frequency: {
            immediate: boolean;
            hourly: boolean;
            daily: boolean;
            weekly: boolean;
        };
        userId: import("convex/values").GenericId<"users">;
        lastUpdated: number;
    }, {
        userId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        channels: import("convex/values").VArray<string[], import("convex/values").VString<string, "required">, "required">;
        alertTypes: import("convex/values").VObject<{
            progress_reminders: boolean;
            milestone_delays: boolean;
            system_alerts: boolean;
            escalations: boolean;
            weekly_reports: boolean;
            verification_updates: boolean;
            project_updates: boolean;
            transaction_notifications: boolean;
        }, {
            progress_reminders: import("convex/values").VBoolean<boolean, "required">;
            milestone_delays: import("convex/values").VBoolean<boolean, "required">;
            system_alerts: import("convex/values").VBoolean<boolean, "required">;
            escalations: import("convex/values").VBoolean<boolean, "required">;
            weekly_reports: import("convex/values").VBoolean<boolean, "required">;
            verification_updates: import("convex/values").VBoolean<boolean, "required">;
            project_updates: import("convex/values").VBoolean<boolean, "required">;
            transaction_notifications: import("convex/values").VBoolean<boolean, "required">;
        }, "required", "progress_reminders" | "milestone_delays" | "system_alerts" | "escalations" | "weekly_reports" | "verification_updates" | "project_updates" | "transaction_notifications">;
        quietHours: import("convex/values").VObject<{
            enabled: boolean;
            start: string;
            end: string;
            timezone: string;
        } | undefined, {
            enabled: import("convex/values").VBoolean<boolean, "required">;
            start: import("convex/values").VString<string, "required">;
            end: import("convex/values").VString<string, "required">;
            timezone: import("convex/values").VString<string, "required">;
        }, "optional", "enabled" | "start" | "end" | "timezone">;
        frequency: import("convex/values").VObject<{
            immediate: boolean;
            hourly: boolean;
            daily: boolean;
            weekly: boolean;
        }, {
            immediate: import("convex/values").VBoolean<boolean, "required">;
            hourly: import("convex/values").VBoolean<boolean, "required">;
            daily: import("convex/values").VBoolean<boolean, "required">;
            weekly: import("convex/values").VBoolean<boolean, "required">;
        }, "required", "immediate" | "hourly" | "daily" | "weekly">;
        lastUpdated: import("convex/values").VFloat64<number, "required">;
    }, "required", "channels" | "alertTypes" | "quietHours" | "frequency" | "alertTypes.progress_reminders" | "alertTypes.milestone_delays" | "alertTypes.system_alerts" | "alertTypes.escalations" | "alertTypes.weekly_reports" | "quietHours.enabled" | "quietHours.start" | "quietHours.end" | "quietHours.timezone" | "frequency.immediate" | "frequency.hourly" | "frequency.daily" | "frequency.weekly" | "userId" | "lastUpdated" | "alertTypes.verification_updates" | "alertTypes.project_updates" | "alertTypes.transaction_notifications">, {
        by_user: ["userId", "_creationTime"];
    }, {}, {}>;
    analytics: import("convex/server").TableDefinition<import("convex/values").VObject<{
        projectId?: import("convex/values").GenericId<"projects"> | undefined;
        category?: string | undefined;
        metadata?: any;
        value: number;
        metric: string;
        date: number;
    }, {
        metric: import("convex/values").VString<string, "required">;
        value: import("convex/values").VFloat64<number, "required">;
        date: import("convex/values").VFloat64<number, "required">;
        metadata: import("convex/values").VAny<any, "optional", string>;
        projectId: import("convex/values").VId<import("convex/values").GenericId<"projects"> | undefined, "optional">;
        category: import("convex/values").VString<string | undefined, "optional">;
    }, "required", "projectId" | "category" | "value" | "metadata" | `metadata.${string}` | "metric" | "date">, {
        by_metric: ["metric", "_creationTime"];
        by_date: ["date", "_creationTime"];
        by_metric_date: ["metric", "date", "_creationTime"];
        by_category: ["category", "_creationTime"];
        by_project: ["projectId", "_creationTime"];
        by_project_metric: ["projectId", "metric", "_creationTime"];
        by_category_date: ["category", "date", "_creationTime"];
    }, {}, {}>;
    projectMilestones: import("convex/server").TableDefinition<import("convex/values").VObject<{
        actualDate?: number | undefined;
        delayReason?: string | undefined;
        impactOnTimeline?: string | undefined;
        title: string;
        description: string;
        status: "pending" | "in_progress" | "completed" | "delayed" | "skipped";
        projectId: import("convex/values").GenericId<"projects">;
        isRequired: boolean;
        order: number;
        milestoneType: "verification" | "setup" | "progress_25" | "progress_50" | "progress_75" | "impact_first" | "completion";
        plannedDate: number;
    }, {
        projectId: import("convex/values").VId<import("convex/values").GenericId<"projects">, "required">;
        milestoneType: import("convex/values").VUnion<"verification" | "setup" | "progress_25" | "progress_50" | "progress_75" | "impact_first" | "completion", [import("convex/values").VLiteral<"setup", "required">, import("convex/values").VLiteral<"progress_25", "required">, import("convex/values").VLiteral<"progress_50", "required">, import("convex/values").VLiteral<"progress_75", "required">, import("convex/values").VLiteral<"impact_first", "required">, import("convex/values").VLiteral<"verification", "required">, import("convex/values").VLiteral<"completion", "required">], "required", never>;
        title: import("convex/values").VString<string, "required">;
        description: import("convex/values").VString<string, "required">;
        plannedDate: import("convex/values").VFloat64<number, "required">;
        actualDate: import("convex/values").VFloat64<number | undefined, "optional">;
        status: import("convex/values").VUnion<"pending" | "in_progress" | "completed" | "delayed" | "skipped", [import("convex/values").VLiteral<"pending", "required">, import("convex/values").VLiteral<"in_progress", "required">, import("convex/values").VLiteral<"completed", "required">, import("convex/values").VLiteral<"delayed", "required">, import("convex/values").VLiteral<"skipped", "required">], "required", never>;
        delayReason: import("convex/values").VString<string | undefined, "optional">;
        impactOnTimeline: import("convex/values").VString<string | undefined, "optional">;
        order: import("convex/values").VFloat64<number, "required">;
        isRequired: import("convex/values").VBoolean<boolean, "required">;
    }, "required", "title" | "description" | "status" | "projectId" | "isRequired" | "order" | "milestoneType" | "plannedDate" | "actualDate" | "delayReason" | "impactOnTimeline">, {
        by_project: ["projectId", "_creationTime"];
        by_project_status: ["projectId", "status", "_creationTime"];
        by_project_order: ["projectId", "order", "_creationTime"];
        by_milestone_type: ["milestoneType", "_creationTime"];
        by_planned_date: ["plannedDate", "_creationTime"];
        by_status_date: ["status", "plannedDate", "_creationTime"];
    }, {}, {}>;
    systemAlerts: import("convex/server").TableDefinition<import("convex/values").VObject<{
        description?: string | undefined;
        projectId?: import("convex/values").GenericId<"projects"> | undefined;
        assignedAt?: number | undefined;
        category?: string | undefined;
        tags?: string[] | undefined;
        lastUpdatedAt?: number | undefined;
        metadata?: any;
        source?: string | undefined;
        resolvedAt?: number | undefined;
        resolvedBy?: import("convex/values").GenericId<"users"> | undefined;
        resolutionNotes?: string | undefined;
        resolutionType?: "fixed" | "acknowledged" | "dismissed" | "duplicate" | undefined;
        assignedTo?: import("convex/values").GenericId<"users"> | undefined;
        assignedBy?: import("convex/values").GenericId<"users"> | undefined;
        lastEscalationTime?: number | undefined;
        nextEscalationTime?: number | undefined;
        autoEscalationEnabled?: boolean | undefined;
        escalatedBy?: import("convex/values").GenericId<"users"> | undefined;
        escalationReason?: string | undefined;
        deEscalatedAt?: number | undefined;
        deEscalatedBy?: import("convex/values").GenericId<"users"> | undefined;
        deEscalationReason?: string | undefined;
        urgencyScore?: number | undefined;
        estimatedResolutionTime?: number | undefined;
        occurrenceCount?: number | undefined;
        firstOccurrence?: number | undefined;
        lastOccurrence?: number | undefined;
        reopenedAt?: number | undefined;
        reopenedBy?: import("convex/values").GenericId<"users"> | undefined;
        reopenReason?: string | undefined;
        lastUpdatedBy?: import("convex/values").GenericId<"users"> | undefined;
        message: string;
        severity: "low" | "high" | "medium" | "critical";
        alertType: string;
        isResolved: boolean;
        escalationLevel: number;
    }, {
        projectId: import("convex/values").VId<import("convex/values").GenericId<"projects"> | undefined, "optional">;
        alertType: import("convex/values").VString<string, "required">;
        severity: import("convex/values").VUnion<"low" | "high" | "medium" | "critical", [import("convex/values").VLiteral<"low", "required">, import("convex/values").VLiteral<"medium", "required">, import("convex/values").VLiteral<"high", "required">, import("convex/values").VLiteral<"critical", "required">], "required", never>;
        message: import("convex/values").VString<string, "required">;
        description: import("convex/values").VString<string | undefined, "optional">;
        source: import("convex/values").VString<string | undefined, "optional">;
        category: import("convex/values").VString<string | undefined, "optional">;
        tags: import("convex/values").VArray<string[] | undefined, import("convex/values").VString<string, "required">, "optional">;
        isResolved: import("convex/values").VBoolean<boolean, "required">;
        resolvedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        resolvedBy: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
        resolutionNotes: import("convex/values").VString<string | undefined, "optional">;
        resolutionType: import("convex/values").VUnion<"fixed" | "acknowledged" | "dismissed" | "duplicate" | undefined, [import("convex/values").VLiteral<"fixed", "required">, import("convex/values").VLiteral<"acknowledged", "required">, import("convex/values").VLiteral<"dismissed", "required">, import("convex/values").VLiteral<"duplicate", "required">], "optional", never>;
        assignedTo: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
        assignedBy: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
        assignedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        escalationLevel: import("convex/values").VFloat64<number, "required">;
        lastEscalationTime: import("convex/values").VFloat64<number | undefined, "optional">;
        nextEscalationTime: import("convex/values").VFloat64<number | undefined, "optional">;
        autoEscalationEnabled: import("convex/values").VBoolean<boolean | undefined, "optional">;
        escalatedBy: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
        escalationReason: import("convex/values").VString<string | undefined, "optional">;
        deEscalatedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        deEscalatedBy: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
        deEscalationReason: import("convex/values").VString<string | undefined, "optional">;
        urgencyScore: import("convex/values").VFloat64<number | undefined, "optional">;
        estimatedResolutionTime: import("convex/values").VFloat64<number | undefined, "optional">;
        occurrenceCount: import("convex/values").VFloat64<number | undefined, "optional">;
        firstOccurrence: import("convex/values").VFloat64<number | undefined, "optional">;
        lastOccurrence: import("convex/values").VFloat64<number | undefined, "optional">;
        reopenedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        reopenedBy: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
        reopenReason: import("convex/values").VString<string | undefined, "optional">;
        metadata: import("convex/values").VAny<any, "optional", string>;
        lastUpdatedBy: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
        lastUpdatedAt: import("convex/values").VFloat64<number | undefined, "optional">;
    }, "required", "description" | "projectId" | "assignedAt" | "message" | "category" | "tags" | "lastUpdatedAt" | "metadata" | "severity" | `metadata.${string}` | "alertType" | "source" | "isResolved" | "resolvedAt" | "resolvedBy" | "resolutionNotes" | "resolutionType" | "assignedTo" | "assignedBy" | "escalationLevel" | "lastEscalationTime" | "nextEscalationTime" | "autoEscalationEnabled" | "escalatedBy" | "escalationReason" | "deEscalatedAt" | "deEscalatedBy" | "deEscalationReason" | "urgencyScore" | "estimatedResolutionTime" | "occurrenceCount" | "firstOccurrence" | "lastOccurrence" | "reopenedAt" | "reopenedBy" | "reopenReason" | "lastUpdatedBy">, {
        by_project: ["projectId", "_creationTime"];
        by_type: ["alertType", "_creationTime"];
        by_severity: ["severity", "_creationTime"];
        by_resolved: ["isResolved", "_creationTime"];
        by_assigned: ["assignedTo", "_creationTime"];
        by_escalation_time: ["nextEscalationTime", "_creationTime"];
        by_category: ["category", "_creationTime"];
        by_project_resolved: ["projectId", "isResolved", "_creationTime"];
        by_type_resolved: ["alertType", "isResolved", "_creationTime"];
    }, {}, {}>;
    monitoringConfig: import("convex/server").TableDefinition<import("convex/values").VObject<{
        description?: string | undefined;
        isActive: boolean;
        projectType: string;
        configKey: string;
        configValue: any;
    }, {
        projectType: import("convex/values").VString<string, "required">;
        configKey: import("convex/values").VString<string, "required">;
        configValue: import("convex/values").VAny<any, "required", string>;
        isActive: import("convex/values").VBoolean<boolean, "required">;
        description: import("convex/values").VString<string | undefined, "optional">;
    }, "required", "isActive" | "description" | "projectType" | "configKey" | "configValue" | `configValue.${string}`>, {
        by_project_type: ["projectType", "_creationTime"];
        by_project_type_key: ["projectType", "configKey", "_creationTime"];
        by_active: ["isActive", "_creationTime"];
    }, {}, {}>;
    escalationConfig: import("convex/server").TableDefinition<import("convex/values").VObject<{
        createdBy: import("convex/values").GenericId<"users">;
        severity: "low" | "high" | "medium" | "critical";
        alertType: string;
        rules: {
            businessHoursOnly?: boolean | undefined;
            cooldownPeriod?: number | undefined;
            autoEscalationEnabled: boolean;
            escalationChain: {
                specificUsers?: import("convex/values").GenericId<"users">[] | undefined;
                level: number;
                roles: string[];
                delayMinutes: number;
            }[];
            maxEscalationLevel: number;
        };
        createdAt: number;
        updatedAt: number;
    }, {
        alertType: import("convex/values").VString<string, "required">;
        severity: import("convex/values").VUnion<"low" | "high" | "medium" | "critical", [import("convex/values").VLiteral<"low", "required">, import("convex/values").VLiteral<"medium", "required">, import("convex/values").VLiteral<"high", "required">, import("convex/values").VLiteral<"critical", "required">], "required", never>;
        rules: import("convex/values").VObject<{
            businessHoursOnly?: boolean | undefined;
            cooldownPeriod?: number | undefined;
            autoEscalationEnabled: boolean;
            escalationChain: {
                specificUsers?: import("convex/values").GenericId<"users">[] | undefined;
                level: number;
                roles: string[];
                delayMinutes: number;
            }[];
            maxEscalationLevel: number;
        }, {
            escalationChain: import("convex/values").VArray<{
                specificUsers?: import("convex/values").GenericId<"users">[] | undefined;
                level: number;
                roles: string[];
                delayMinutes: number;
            }[], import("convex/values").VObject<{
                specificUsers?: import("convex/values").GenericId<"users">[] | undefined;
                level: number;
                roles: string[];
                delayMinutes: number;
            }, {
                level: import("convex/values").VFloat64<number, "required">;
                roles: import("convex/values").VArray<string[], import("convex/values").VString<string, "required">, "required">;
                delayMinutes: import("convex/values").VFloat64<number, "required">;
                specificUsers: import("convex/values").VArray<import("convex/values").GenericId<"users">[] | undefined, import("convex/values").VId<import("convex/values").GenericId<"users">, "required">, "optional">;
            }, "required", "level" | "roles" | "delayMinutes" | "specificUsers">, "required">;
            maxEscalationLevel: import("convex/values").VFloat64<number, "required">;
            autoEscalationEnabled: import("convex/values").VBoolean<boolean, "required">;
            businessHoursOnly: import("convex/values").VBoolean<boolean | undefined, "optional">;
            cooldownPeriod: import("convex/values").VFloat64<number | undefined, "optional">;
        }, "required", "autoEscalationEnabled" | "escalationChain" | "maxEscalationLevel" | "businessHoursOnly" | "cooldownPeriod">;
        createdBy: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        createdAt: import("convex/values").VFloat64<number, "required">;
        updatedAt: import("convex/values").VFloat64<number, "required">;
    }, "required", "createdBy" | "severity" | "alertType" | "rules" | "createdAt" | "updatedAt" | "rules.autoEscalationEnabled" | "rules.escalationChain" | "rules.maxEscalationLevel" | "rules.businessHoursOnly" | "rules.cooldownPeriod">, {
        by_type_severity: ["alertType", "severity", "_creationTime"];
        by_created_by: ["createdBy", "_creationTime"];
    }, {}, {}>;
    emailDeliveryLog: import("convex/server").TableDefinition<import("convex/values").VObject<{
        deliveredAt?: number | undefined;
        provider?: string | undefined;
        providerMessageId?: string | undefined;
        errorMessage?: string | undefined;
        email: string;
        type: string;
        status: "failed" | "sent" | "delivered" | "bounced";
        recipientId: import("convex/values").GenericId<"users">;
        subject: string;
        sentAt: number;
        body: string;
    }, {
        recipientId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        email: import("convex/values").VString<string, "required">;
        subject: import("convex/values").VString<string, "required">;
        body: import("convex/values").VString<string, "required">;
        type: import("convex/values").VString<string, "required">;
        status: import("convex/values").VUnion<"failed" | "sent" | "delivered" | "bounced", [import("convex/values").VLiteral<"sent", "required">, import("convex/values").VLiteral<"delivered", "required">, import("convex/values").VLiteral<"failed", "required">, import("convex/values").VLiteral<"bounced", "required">], "required", never>;
        provider: import("convex/values").VString<string | undefined, "optional">;
        providerMessageId: import("convex/values").VString<string | undefined, "optional">;
        errorMessage: import("convex/values").VString<string | undefined, "optional">;
        sentAt: import("convex/values").VFloat64<number, "required">;
        deliveredAt: import("convex/values").VFloat64<number | undefined, "optional">;
    }, "required", "email" | "type" | "status" | "recipientId" | "subject" | "sentAt" | "deliveredAt" | "body" | "provider" | "providerMessageId" | "errorMessage">, {
        by_recipient: ["recipientId", "_creationTime"];
        by_status: ["status", "_creationTime"];
        by_type: ["type", "_creationTime"];
    }, {}, {}>;
    smsDeliveryLog: import("convex/server").TableDefinition<import("convex/values").VObject<{
        deliveredAt?: number | undefined;
        provider?: string | undefined;
        providerMessageId?: string | undefined;
        errorMessage?: string | undefined;
        type: string;
        phone: string;
        status: "failed" | "sent" | "delivered" | "undelivered";
        recipientId: import("convex/values").GenericId<"users">;
        message: string;
        sentAt: number;
    }, {
        recipientId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        phone: import("convex/values").VString<string, "required">;
        message: import("convex/values").VString<string, "required">;
        type: import("convex/values").VString<string, "required">;
        status: import("convex/values").VUnion<"failed" | "sent" | "delivered" | "undelivered", [import("convex/values").VLiteral<"sent", "required">, import("convex/values").VLiteral<"delivered", "required">, import("convex/values").VLiteral<"failed", "required">, import("convex/values").VLiteral<"undelivered", "required">], "required", never>;
        provider: import("convex/values").VString<string | undefined, "optional">;
        providerMessageId: import("convex/values").VString<string | undefined, "optional">;
        errorMessage: import("convex/values").VString<string | undefined, "optional">;
        sentAt: import("convex/values").VFloat64<number, "required">;
        deliveredAt: import("convex/values").VFloat64<number | undefined, "optional">;
    }, "required", "type" | "phone" | "status" | "recipientId" | "message" | "sentAt" | "deliveredAt" | "provider" | "providerMessageId" | "errorMessage">, {
        by_recipient: ["recipientId", "_creationTime"];
        by_status: ["status", "_creationTime"];
        by_type: ["type", "_creationTime"];
    }, {}, {}>;
    notificationDeliveryLog: import("convex/server").TableDefinition<import("convex/values").VObject<{
        alertId?: import("convex/values").GenericId<"systemAlerts"> | undefined;
        type: string;
        timestamp: number;
        results: any;
    }, {
        alertId: import("convex/values").VId<import("convex/values").GenericId<"systemAlerts"> | undefined, "optional">;
        type: import("convex/values").VString<string, "required">;
        results: import("convex/values").VAny<any, "required", string>;
        timestamp: import("convex/values").VFloat64<number, "required">;
    }, "required", "type" | "timestamp" | "alertId" | "results" | `results.${string}`>, {
        by_alert: ["alertId", "_creationTime"];
        by_type: ["type", "_creationTime"];
    }, {}, {}>;
    analyticsSnapshots: import("convex/server").TableDefinition<import("convex/values").VObject<{
        type: "daily" | "weekly" | "monthly" | "quarterly";
        timestamp: number;
        date: number;
        projectData: any;
        userData: any;
        transactionData: any;
        impactData: any;
    }, {
        date: import("convex/values").VFloat64<number, "required">;
        type: import("convex/values").VUnion<"daily" | "weekly" | "monthly" | "quarterly", [import("convex/values").VLiteral<"daily", "required">, import("convex/values").VLiteral<"weekly", "required">, import("convex/values").VLiteral<"monthly", "required">, import("convex/values").VLiteral<"quarterly", "required">], "required", never>;
        projectData: import("convex/values").VAny<any, "required", string>;
        userData: import("convex/values").VAny<any, "required", string>;
        transactionData: import("convex/values").VAny<any, "required", string>;
        impactData: import("convex/values").VAny<any, "required", string>;
        timestamp: import("convex/values").VFloat64<number, "required">;
    }, "required", "type" | "timestamp" | "date" | "projectData" | "userData" | "transactionData" | "impactData" | `projectData.${string}` | `userData.${string}` | `transactionData.${string}` | `impactData.${string}`>, {
        by_date: ["date", "_creationTime"];
        by_type: ["type", "_creationTime"];
        by_timestamp: ["timestamp", "_creationTime"];
    }, {}, {}>;
    performanceMetrics: import("convex/server").TableDefinition<import("convex/values").VObject<{
        projectId?: import("convex/values").GenericId<"projects"> | undefined;
        type: "project" | "platform" | "user" | "financial";
        timestamp: number;
        metrics: any;
    }, {
        timestamp: import("convex/values").VFloat64<number, "required">;
        metrics: import("convex/values").VAny<any, "required", string>;
        type: import("convex/values").VUnion<"project" | "platform" | "user" | "financial", [import("convex/values").VLiteral<"project", "required">, import("convex/values").VLiteral<"platform", "required">, import("convex/values").VLiteral<"user", "required">, import("convex/values").VLiteral<"financial", "required">], "required", never>;
        projectId: import("convex/values").VId<import("convex/values").GenericId<"projects"> | undefined, "optional">;
    }, "required", "type" | "projectId" | "timestamp" | "metrics" | `metrics.${string}`>, {
        by_timestamp: ["timestamp", "_creationTime"];
        by_type: ["type", "_creationTime"];
        by_project: ["projectId", "_creationTime"];
    }, {}, {}>;
    projectPredictions: import("convex/server").TableDefinition<import("convex/values").VObject<{
        accuracy?: number | undefined;
        projectId: import("convex/values").GenericId<"projects">;
        timestamp: number;
        version: string;
        prediction: any;
    }, {
        projectId: import("convex/values").VId<import("convex/values").GenericId<"projects">, "required">;
        prediction: import("convex/values").VAny<any, "required", string>;
        timestamp: import("convex/values").VFloat64<number, "required">;
        version: import("convex/values").VString<string, "required">;
        accuracy: import("convex/values").VFloat64<number | undefined, "optional">;
    }, "required", "projectId" | "timestamp" | "version" | "prediction" | "accuracy" | `prediction.${string}`>, {
        by_project: ["projectId", "_creationTime"];
        by_timestamp: ["timestamp", "_creationTime"];
        by_version: ["version", "_creationTime"];
    }, {}, {}>;
    realTimeMetrics: import("convex/server").TableDefinition<import("convex/values").VObject<{
        systemHealth?: any;
        timestamp: number;
        metrics: any;
    }, {
        timestamp: import("convex/values").VFloat64<number, "required">;
        metrics: import("convex/values").VAny<any, "required", string>;
        systemHealth: import("convex/values").VAny<any, "optional", string>;
    }, "required", "timestamp" | "metrics" | `metrics.${string}` | "systemHealth" | `systemHealth.${string}`>, {
        by_timestamp: ["timestamp", "_creationTime"];
    }, {}, {}>;
    marketPredictions: import("convex/server").TableDefinition<import("convex/values").VObject<{
        accuracy?: number | undefined;
        timestamp: number;
        version: string;
        prediction: any;
        timeHorizon: number;
    }, {
        timeHorizon: import("convex/values").VFloat64<number, "required">;
        prediction: import("convex/values").VAny<any, "required", string>;
        timestamp: import("convex/values").VFloat64<number, "required">;
        version: import("convex/values").VString<string, "required">;
        accuracy: import("convex/values").VFloat64<number | undefined, "optional">;
    }, "required", "timestamp" | "version" | "prediction" | "accuracy" | `prediction.${string}` | "timeHorizon">, {
        by_timestamp: ["timestamp", "_creationTime"];
        by_horizon: ["timeHorizon", "_creationTime"];
    }, {}, {}>;
    userPredictions: import("convex/server").TableDefinition<import("convex/values").VObject<{
        accuracy?: number | undefined;
        segment?: string | undefined;
        timestamp: number;
        userId: string;
        prediction: any;
    }, {
        userId: import("convex/values").VString<string, "required">;
        prediction: import("convex/values").VAny<any, "required", string>;
        timestamp: import("convex/values").VFloat64<number, "required">;
        segment: import("convex/values").VString<string | undefined, "optional">;
        accuracy: import("convex/values").VFloat64<number | undefined, "optional">;
    }, "required", "timestamp" | "userId" | "prediction" | "accuracy" | `prediction.${string}` | "segment">, {
        by_user: ["userId", "_creationTime"];
        by_timestamp: ["timestamp", "_creationTime"];
        by_segment: ["segment", "_creationTime"];
    }, {}, {}>;
    analyticsReports: import("convex/server").TableDefinition<import("convex/values").VObject<{
        expiresAt?: number | undefined;
        filters?: any;
        downloadUrl?: string | undefined;
        title: string;
        description: string;
        reportType: "project_performance" | "platform_analytics" | "impact_summary" | "user_engagement" | "financial_metrics";
        reportData: any;
        generatedBy: import("convex/values").GenericId<"users">;
        generatedAt: number;
        timeframe: any;
        format: "pdf" | "json" | "csv";
        isPublic: boolean;
    }, {
        reportType: import("convex/values").VUnion<"project_performance" | "platform_analytics" | "impact_summary" | "user_engagement" | "financial_metrics", [import("convex/values").VLiteral<"project_performance", "required">, import("convex/values").VLiteral<"platform_analytics", "required">, import("convex/values").VLiteral<"impact_summary", "required">, import("convex/values").VLiteral<"user_engagement", "required">, import("convex/values").VLiteral<"financial_metrics", "required">], "required", never>;
        title: import("convex/values").VString<string, "required">;
        description: import("convex/values").VString<string, "required">;
        reportData: import("convex/values").VAny<any, "required", string>;
        generatedBy: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        generatedAt: import("convex/values").VFloat64<number, "required">;
        filters: import("convex/values").VAny<any, "optional", string>;
        timeframe: import("convex/values").VAny<any, "required", string>;
        format: import("convex/values").VUnion<"pdf" | "json" | "csv", [import("convex/values").VLiteral<"json", "required">, import("convex/values").VLiteral<"pdf", "required">, import("convex/values").VLiteral<"csv", "required">], "required", never>;
        downloadUrl: import("convex/values").VString<string | undefined, "optional">;
        isPublic: import("convex/values").VBoolean<boolean, "required">;
        expiresAt: import("convex/values").VFloat64<number | undefined, "optional">;
    }, "required", "title" | "description" | "expiresAt" | "reportType" | "reportData" | "generatedBy" | "generatedAt" | "filters" | "timeframe" | "format" | "downloadUrl" | "isPublic" | `reportData.${string}` | `filters.${string}` | `timeframe.${string}`>, {
        by_type: ["reportType", "_creationTime"];
        by_user: ["generatedBy", "_creationTime"];
        by_date: ["generatedAt", "_creationTime"];
        by_public: ["isPublic", "_creationTime"];
    }, {}, {}>;
    pdf_reports: import("convex/server").TableDefinition<import("convex/values").VObject<{
        completedAt?: number | undefined;
        fileSize?: number | undefined;
        errorMessage?: string | undefined;
        filters?: any;
        fileUrl?: string | undefined;
        title: string;
        status: "pending" | "completed" | "processing" | "failed";
        expiresAt: number;
        reportType: string;
        timeframe: {
            start: number;
            end: number;
            period: string;
        };
        templateType: "analytics" | "monitoring";
        progress: number;
        requestedBy: string;
        requestedAt: number;
        userInfo: {
            email: string;
            role: string;
            name: string;
            userId: string;
        };
    }, {
        templateType: import("convex/values").VUnion<"analytics" | "monitoring", [import("convex/values").VLiteral<"analytics", "required">, import("convex/values").VLiteral<"monitoring", "required">], "required", never>;
        reportType: import("convex/values").VString<string, "required">;
        title: import("convex/values").VString<string, "required">;
        status: import("convex/values").VUnion<"pending" | "completed" | "processing" | "failed", [import("convex/values").VLiteral<"pending", "required">, import("convex/values").VLiteral<"processing", "required">, import("convex/values").VLiteral<"completed", "required">, import("convex/values").VLiteral<"failed", "required">], "required", never>;
        progress: import("convex/values").VFloat64<number, "required">;
        requestedBy: import("convex/values").VString<string, "required">;
        requestedAt: import("convex/values").VFloat64<number, "required">;
        completedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        errorMessage: import("convex/values").VString<string | undefined, "optional">;
        fileUrl: import("convex/values").VString<string | undefined, "optional">;
        fileSize: import("convex/values").VFloat64<number | undefined, "optional">;
        expiresAt: import("convex/values").VFloat64<number, "required">;
        timeframe: import("convex/values").VObject<{
            start: number;
            end: number;
            period: string;
        }, {
            start: import("convex/values").VFloat64<number, "required">;
            end: import("convex/values").VFloat64<number, "required">;
            period: import("convex/values").VString<string, "required">;
        }, "required", "start" | "end" | "period">;
        filters: import("convex/values").VAny<any, "optional", string>;
        userInfo: import("convex/values").VObject<{
            email: string;
            role: string;
            name: string;
            userId: string;
        }, {
            userId: import("convex/values").VString<string, "required">;
            name: import("convex/values").VString<string, "required">;
            email: import("convex/values").VString<string, "required">;
            role: import("convex/values").VString<string, "required">;
        }, "required", "email" | "role" | "name" | "userId">;
    }, "required", "title" | "status" | "completedAt" | "fileSize" | "expiresAt" | "errorMessage" | "reportType" | "filters" | "timeframe" | `filters.${string}` | "templateType" | "progress" | "requestedBy" | "requestedAt" | "fileUrl" | "userInfo" | "timeframe.start" | "timeframe.end" | "timeframe.period" | "userInfo.email" | "userInfo.role" | "userInfo.name" | "userInfo.userId">, {
        by_user: ["requestedBy", "_creationTime"];
        by_status: ["status", "_creationTime"];
        by_template_type: ["templateType", "_creationTime"];
        by_report_type: ["reportType", "_creationTime"];
        by_requested_at: ["requestedAt", "_creationTime"];
        by_expires_at: ["expiresAt", "_creationTime"];
        by_user_status: ["requestedBy", "status", "_creationTime"];
    }, {}, {}>;
    progressUpdates: import("convex/server").TableDefinition<import("convex/values").VObject<{
        location?: {
            name: string;
            lat: number;
            long: number;
        } | undefined;
        status?: "rejected" | "approved" | "pending_review" | "needs_revision" | undefined;
        verificationNotes?: string | undefined;
        photos?: {
            cloudinary_public_id: string;
            cloudinary_url: string;
        }[] | undefined;
        verifiedBy?: import("convex/values").GenericId<"users"> | undefined;
        verifiedAt?: number | undefined;
        submittedBy?: import("convex/values").GenericId<"users"> | undefined;
        reportedBy?: import("convex/values").GenericId<"users"> | undefined;
        photoStorageIds?: import("convex/values").GenericId<"_storage">[] | undefined;
        photoUrls?: string[] | undefined;
        measurementData?: {
            treesPlanted?: number | undefined;
            survivalRate?: number | undefined;
            energyGenerated?: number | undefined;
            systemUptime?: number | undefined;
            gasProduced?: number | undefined;
            wasteProcessed?: number | undefined;
            recyclingRate?: number | undefined;
            areaRestored?: number | undefined;
            mangrovesPlanted?: number | undefined;
            carbonImpactToDate?: number | undefined;
        } | undefined;
        treesPlanted?: number | undefined;
        energyGenerated?: number | undefined;
        wasteProcessed?: number | undefined;
        carbonImpactToDate?: number | undefined;
        nextSteps?: string | undefined;
        challenges?: string | undefined;
        submittedAt?: number | undefined;
        isVerified: boolean;
        title: string;
        description: string;
        progressPercentage: number;
        projectId: import("convex/values").GenericId<"projects">;
        updateType: "completion" | "milestone" | "measurement" | "photo" | "issue";
        reportingDate: number;
    }, {
        projectId: import("convex/values").VId<import("convex/values").GenericId<"projects">, "required">;
        submittedBy: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
        reportedBy: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
        updateType: import("convex/values").VUnion<"completion" | "milestone" | "measurement" | "photo" | "issue", [import("convex/values").VLiteral<"milestone", "required">, import("convex/values").VLiteral<"measurement", "required">, import("convex/values").VLiteral<"photo", "required">, import("convex/values").VLiteral<"issue", "required">, import("convex/values").VLiteral<"completion", "required">], "required", never>;
        title: import("convex/values").VString<string, "required">;
        description: import("convex/values").VString<string, "required">;
        progressPercentage: import("convex/values").VFloat64<number, "required">;
        photoStorageIds: import("convex/values").VArray<import("convex/values").GenericId<"_storage">[] | undefined, import("convex/values").VId<import("convex/values").GenericId<"_storage">, "required">, "optional">;
        photoUrls: import("convex/values").VArray<string[] | undefined, import("convex/values").VString<string, "required">, "optional">;
        photos: import("convex/values").VArray<{
            cloudinary_public_id: string;
            cloudinary_url: string;
        }[] | undefined, import("convex/values").VObject<{
            cloudinary_public_id: string;
            cloudinary_url: string;
        }, {
            cloudinary_public_id: import("convex/values").VString<string, "required">;
            cloudinary_url: import("convex/values").VString<string, "required">;
        }, "required", "cloudinary_public_id" | "cloudinary_url">, "optional">;
        location: import("convex/values").VObject<{
            name: string;
            lat: number;
            long: number;
        } | undefined, {
            lat: import("convex/values").VFloat64<number, "required">;
            long: import("convex/values").VFloat64<number, "required">;
            name: import("convex/values").VString<string, "required">;
        }, "optional", "name" | "lat" | "long">;
        measurementData: import("convex/values").VObject<{
            treesPlanted?: number | undefined;
            survivalRate?: number | undefined;
            energyGenerated?: number | undefined;
            systemUptime?: number | undefined;
            gasProduced?: number | undefined;
            wasteProcessed?: number | undefined;
            recyclingRate?: number | undefined;
            areaRestored?: number | undefined;
            mangrovesPlanted?: number | undefined;
            carbonImpactToDate?: number | undefined;
        } | undefined, {
            treesPlanted: import("convex/values").VFloat64<number | undefined, "optional">;
            survivalRate: import("convex/values").VFloat64<number | undefined, "optional">;
            energyGenerated: import("convex/values").VFloat64<number | undefined, "optional">;
            systemUptime: import("convex/values").VFloat64<number | undefined, "optional">;
            gasProduced: import("convex/values").VFloat64<number | undefined, "optional">;
            wasteProcessed: import("convex/values").VFloat64<number | undefined, "optional">;
            recyclingRate: import("convex/values").VFloat64<number | undefined, "optional">;
            areaRestored: import("convex/values").VFloat64<number | undefined, "optional">;
            mangrovesPlanted: import("convex/values").VFloat64<number | undefined, "optional">;
            carbonImpactToDate: import("convex/values").VFloat64<number | undefined, "optional">;
        }, "optional", "treesPlanted" | "survivalRate" | "energyGenerated" | "systemUptime" | "gasProduced" | "wasteProcessed" | "recyclingRate" | "areaRestored" | "mangrovesPlanted" | "carbonImpactToDate">;
        nextSteps: import("convex/values").VString<string | undefined, "optional">;
        challenges: import("convex/values").VString<string | undefined, "optional">;
        submittedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        reportingDate: import("convex/values").VFloat64<number, "required">;
        status: import("convex/values").VUnion<"rejected" | "approved" | "pending_review" | "needs_revision" | undefined, [import("convex/values").VLiteral<"pending_review", "required">, import("convex/values").VLiteral<"approved", "required">, import("convex/values").VLiteral<"rejected", "required">, import("convex/values").VLiteral<"needs_revision", "required">], "optional", never>;
        isVerified: import("convex/values").VBoolean<boolean, "required">;
        verifiedBy: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
        verifiedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        verificationNotes: import("convex/values").VString<string | undefined, "optional">;
        carbonImpactToDate: import("convex/values").VFloat64<number | undefined, "optional">;
        treesPlanted: import("convex/values").VFloat64<number | undefined, "optional">;
        energyGenerated: import("convex/values").VFloat64<number | undefined, "optional">;
        wasteProcessed: import("convex/values").VFloat64<number | undefined, "optional">;
    }, "required", "isVerified" | "title" | "description" | "location" | "status" | "progressPercentage" | "location.name" | "location.lat" | "location.long" | "projectId" | "verificationNotes" | "photos" | "verifiedBy" | "verifiedAt" | "submittedBy" | "reportedBy" | "updateType" | "photoStorageIds" | "photoUrls" | "measurementData" | "treesPlanted" | "energyGenerated" | "wasteProcessed" | "carbonImpactToDate" | "nextSteps" | "challenges" | "submittedAt" | "reportingDate" | "measurementData.treesPlanted" | "measurementData.survivalRate" | "measurementData.energyGenerated" | "measurementData.systemUptime" | "measurementData.gasProduced" | "measurementData.wasteProcessed" | "measurementData.recyclingRate" | "measurementData.areaRestored" | "measurementData.mangrovesPlanted" | "measurementData.carbonImpactToDate">, {
        by_project: ["projectId", "_creationTime"];
        by_submitter: ["submittedBy", "_creationTime"];
        by_reporter: ["reportedBy", "_creationTime"];
        by_status: ["status", "_creationTime"];
        by_project_status: ["projectId", "status", "_creationTime"];
        by_submitted_at: ["submittedAt", "_creationTime"];
        by_reporting_date: ["reportingDate", "_creationTime"];
    }, {}, {}>;
}, true>;
export default _default;
