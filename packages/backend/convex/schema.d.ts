declare const _default: import("convex/server").SchemaDefinition<{
    users: import("convex/server").TableDefinition<import("convex/values").VObject<{
        organizationName?: string | undefined;
        organizationType?: string | undefined;
        profileImage?: string | undefined;
        verifierSpecialty?: string[] | undefined;
        lastLoginAt?: string | undefined;
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
    }, "required", "email" | "firstName" | "lastName" | "role" | "organizationName" | "organizationType" | "phoneNumber" | "address" | "city" | "country" | "isVerified" | "profileImage" | "clerkId" | "verifierSpecialty" | "isActive" | "lastLoginAt">, {
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
        creatorId: import("convex/values").GenericId<"users">;
        title: string;
        description: string;
        projectType: "reforestation" | "solar" | "wind" | "biogas" | "waste_management" | "mangrove_restoration";
        location: {
            lat: number;
            long: number;
            name: string;
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
            lat: number;
            long: number;
            name: string;
        }, {
            lat: import("convex/values").VFloat64<number, "required">;
            long: import("convex/values").VFloat64<number, "required">;
            name: import("convex/values").VString<string, "required">;
        }, "required", "lat" | "long" | "name">;
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
    }, "required", "creatorId" | "title" | "description" | "projectType" | "location" | "areaSize" | "estimatedCO2Reduction" | "budget" | "startDate" | "expectedCompletionDate" | "actualCompletionDate" | "status" | "verificationStatus" | "totalCarbonCredits" | "pricePerCredit" | "creditsAvailable" | "creditsSold" | "assignedVerifierId" | "verificationStartedAt" | "verificationCompletedAt" | "qualityScore" | "requiredDocuments" | "submittedDocuments" | "isDocumentationComplete" | "location.lat" | "location.long" | "location.name">, {
        by_creator: ["creatorId", "_creationTime"];
        by_status: ["status", "_creationTime"];
        by_type: ["projectType", "_creationTime"];
        by_verification_status: ["verificationStatus", "_creationTime"];
        by_verifier: ["assignedVerifierId", "_creationTime"];
        by_credits_available: ["status", "creditsAvailable", "_creationTime"];
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
    progressUpdates: import("convex/server").TableDefinition<import("convex/values").VObject<{
        location?: {
            lat: number;
            long: number;
            name: string;
        } | undefined;
        verificationNotes?: string | undefined;
        verifiedBy?: import("convex/values").GenericId<"users"> | undefined;
        verifiedAt?: number | undefined;
        measurementData?: any;
        carbonImpactToDate?: number | undefined;
        treesPlanted?: number | undefined;
        energyGenerated?: number | undefined;
        wasteProcessed?: number | undefined;
        isVerified: boolean;
        title: string;
        description: string;
        projectId: import("convex/values").GenericId<"projects">;
        photos: {
            cloudinary_public_id: string;
            cloudinary_url: string;
        }[];
        reportedBy: import("convex/values").GenericId<"users">;
        updateType: "milestone" | "measurement" | "photo" | "issue" | "completion";
        progressPercentage: number;
        reportingDate: number;
    }, {
        projectId: import("convex/values").VId<import("convex/values").GenericId<"projects">, "required">;
        reportedBy: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        updateType: import("convex/values").VUnion<"milestone" | "measurement" | "photo" | "issue" | "completion", [import("convex/values").VLiteral<"milestone", "required">, import("convex/values").VLiteral<"measurement", "required">, import("convex/values").VLiteral<"photo", "required">, import("convex/values").VLiteral<"issue", "required">, import("convex/values").VLiteral<"completion", "required">], "required", never>;
        title: import("convex/values").VString<string, "required">;
        description: import("convex/values").VString<string, "required">;
        progressPercentage: import("convex/values").VFloat64<number, "required">;
        measurementData: import("convex/values").VAny<any, "optional", string>;
        location: import("convex/values").VObject<{
            lat: number;
            long: number;
            name: string;
        } | undefined, {
            lat: import("convex/values").VFloat64<number, "required">;
            long: import("convex/values").VFloat64<number, "required">;
            name: import("convex/values").VString<string, "required">;
        }, "optional", "lat" | "long" | "name">;
        photos: import("convex/values").VArray<{
            cloudinary_public_id: string;
            cloudinary_url: string;
        }[], import("convex/values").VObject<{
            cloudinary_public_id: string;
            cloudinary_url: string;
        }, {
            cloudinary_public_id: import("convex/values").VString<string, "required">;
            cloudinary_url: import("convex/values").VString<string, "required">;
        }, "required", "cloudinary_public_id" | "cloudinary_url">, "required">;
        reportingDate: import("convex/values").VFloat64<number, "required">;
        carbonImpactToDate: import("convex/values").VFloat64<number | undefined, "optional">;
        treesPlanted: import("convex/values").VFloat64<number | undefined, "optional">;
        energyGenerated: import("convex/values").VFloat64<number | undefined, "optional">;
        wasteProcessed: import("convex/values").VFloat64<number | undefined, "optional">;
        isVerified: import("convex/values").VBoolean<boolean, "required">;
        verifiedBy: import("convex/values").VId<import("convex/values").GenericId<"users"> | undefined, "optional">;
        verifiedAt: import("convex/values").VFloat64<number | undefined, "optional">;
        verificationNotes: import("convex/values").VString<string | undefined, "optional">;
    }, "required", "isVerified" | "title" | "description" | "location" | "location.lat" | "location.long" | "location.name" | "projectId" | "verificationNotes" | "photos" | "verifiedBy" | "verifiedAt" | "reportedBy" | "updateType" | "progressPercentage" | "measurementData" | "reportingDate" | "carbonImpactToDate" | "treesPlanted" | "energyGenerated" | "wasteProcessed" | `measurementData.${string}`>, {
        by_project: ["projectId", "_creationTime"];
        by_reporter: ["reportedBy", "_creationTime"];
        by_date: ["reportingDate", "_creationTime"];
        by_type: ["updateType", "_creationTime"];
        by_verification: ["isVerified", "_creationTime"];
    }, {}, {}>;
    educationalContent: import("convex/server").TableDefinition<import("convex/values").VObject<{
        rejectionReason?: string | undefined;
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
    }, "required", "title" | "status" | "rejectionReason" | "content" | "contentType" | "category" | "tags" | "authorId" | "reviewedBy" | "reviewedAt" | "reviewNotes" | "estimatedReadTime" | "difficultyLevel" | "viewCount" | "likeCount" | "shareCount" | "isPublished" | "publishedAt" | "lastUpdatedAt">, {
        by_author: ["authorId", "_creationTime"];
        by_category: ["category", "_creationTime"];
        by_status: ["status", "_creationTime"];
        by_published: ["isPublished", "_creationTime"];
        by_type: ["contentType", "_creationTime"];
        by_review: ["status", "reviewedBy", "_creationTime"];
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
    }, "required", "entityId" | "entityType" | "userId" | "action" | "oldValues" | "newValues" | "metadata" | `oldValues.${string}` | `newValues.${string}` | `metadata.${string}`>, {
        by_user: ["userId", "_creationTime"];
        by_entity: ["entityType", "entityId", "_creationTime"];
        by_action: ["action", "_creationTime"];
    }, {}, {}>;
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
        readAt?: number | undefined;
        metadata?: any;
        relatedEntityId?: string | undefined;
        relatedEntityType?: "message" | "project" | "verification" | "document" | undefined;
        actionUrl?: string | undefined;
        expiresAt?: number | undefined;
        type: "revision_required" | "verification_assigned" | "verification_started" | "verification_completed" | "project_approved" | "project_rejected" | "message_received" | "deadline_approaching" | "deadline_overdue" | "document_uploaded" | "document_verified" | "quality_score_updated";
        title: string;
        priority: "low" | "normal" | "high" | "urgent";
        recipientId: import("convex/values").GenericId<"users">;
        message: string;
        isRead: boolean;
        isEmailSent: boolean;
        isPushSent: boolean;
    }, {
        recipientId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        type: import("convex/values").VUnion<"revision_required" | "verification_assigned" | "verification_started" | "verification_completed" | "project_approved" | "project_rejected" | "message_received" | "deadline_approaching" | "deadline_overdue" | "document_uploaded" | "document_verified" | "quality_score_updated", [import("convex/values").VLiteral<"verification_assigned", "required">, import("convex/values").VLiteral<"verification_started", "required">, import("convex/values").VLiteral<"verification_completed", "required">, import("convex/values").VLiteral<"project_approved", "required">, import("convex/values").VLiteral<"project_rejected", "required">, import("convex/values").VLiteral<"revision_required", "required">, import("convex/values").VLiteral<"message_received", "required">, import("convex/values").VLiteral<"deadline_approaching", "required">, import("convex/values").VLiteral<"deadline_overdue", "required">, import("convex/values").VLiteral<"document_uploaded", "required">, import("convex/values").VLiteral<"document_verified", "required">, import("convex/values").VLiteral<"quality_score_updated", "required">], "required", never>;
        title: import("convex/values").VString<string, "required">;
        message: import("convex/values").VString<string, "required">;
        priority: import("convex/values").VUnion<"low" | "normal" | "high" | "urgent", [import("convex/values").VLiteral<"low", "required">, import("convex/values").VLiteral<"normal", "required">, import("convex/values").VLiteral<"high", "required">, import("convex/values").VLiteral<"urgent", "required">], "required", never>;
        relatedEntityId: import("convex/values").VString<string | undefined, "optional">;
        relatedEntityType: import("convex/values").VUnion<"message" | "project" | "verification" | "document" | undefined, [import("convex/values").VLiteral<"project", "required">, import("convex/values").VLiteral<"verification", "required">, import("convex/values").VLiteral<"document", "required">, import("convex/values").VLiteral<"message", "required">], "optional", never>;
        actionUrl: import("convex/values").VString<string | undefined, "optional">;
        isRead: import("convex/values").VBoolean<boolean, "required">;
        readAt: import("convex/values").VFloat64<number | undefined, "optional">;
        isEmailSent: import("convex/values").VBoolean<boolean, "required">;
        isPushSent: import("convex/values").VBoolean<boolean, "required">;
        expiresAt: import("convex/values").VFloat64<number | undefined, "optional">;
        metadata: import("convex/values").VAny<any, "optional", string>;
    }, "required", "type" | "title" | "priority" | "recipientId" | "message" | "isRead" | "readAt" | "metadata" | `metadata.${string}` | "relatedEntityId" | "relatedEntityType" | "actionUrl" | "isEmailSent" | "isPushSent" | "expiresAt">, {
        by_recipient: ["recipientId", "_creationTime"];
        by_unread: ["recipientId", "isRead", "_creationTime"];
        by_type: ["type", "_creationTime"];
        by_priority: ["priority", "_creationTime"];
    }, {}, {}>;
    analytics: import("convex/server").TableDefinition<import("convex/values").VObject<{
        metadata?: any;
        metric: string;
        value: number;
        date: number;
    }, {
        metric: import("convex/values").VString<string, "required">;
        value: import("convex/values").VFloat64<number, "required">;
        date: import("convex/values").VFloat64<number, "required">;
        metadata: import("convex/values").VAny<any, "optional", string>;
    }, "required", "metadata" | `metadata.${string}` | "metric" | "value" | "date">, {
        by_metric: ["metric", "_creationTime"];
        by_date: ["date", "_creationTime"];
        by_metric_date: ["metric", "date", "_creationTime"];
    }, {}, {}>;
}, true>;
export default _default;
