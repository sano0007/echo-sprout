import type { MutationCtx, QueryCtx } from '../convex/_generated/server';
import type { Id } from '../convex/_generated/dataModel';

interface VerificationChecklistSection {
  carbonReductionValidated?: boolean;
  methodologyVerified?: boolean;
  calculationsAccurate?: boolean;
  timelineAssessed?: boolean;
  budgetAnalyzed?: boolean;
  technicalApproachValid?: boolean;
  resourcesAvailable?: boolean;
  completenessCheck?: boolean;
  accuracyVerified?: boolean;
  complianceValidated?: boolean;
  formatStandards?: boolean;
  geographicDataConfirmed?: boolean;
  landRightsVerified?: boolean;
  accessibilityAssessed?: boolean;
  environmentalSuitability?: boolean;
  longTermViabilityAnalyzed?: boolean;
  maintenancePlanReviewed?: boolean;
  stakeholderEngagement?: boolean;
  adaptabilityAssessed?: boolean;
  score?: number;
  notes?: string;
}

interface VerificationChecklistUpdate {
  environmentalImpact?: VerificationChecklistSection;
  projectFeasibility?: VerificationChecklistSection;
  documentationQuality?: VerificationChecklistSection;
  locationVerification?: VerificationChecklistSection;
  sustainability?: VerificationChecklistSection;
}

export class VerificationService {
  // Create a new verification record
  public static async createVerification(
    ctx: MutationCtx,
    data: {
      projectId: Id<'projects'>;
      verifierId: Id<'users'>;
      dueDate: number;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
    }
  ) {
    const currentTime = Date.now();

    // Get current verifier workload
    const currentWorkload = await ctx.db
      .query('verifications')
      .withIndex('by_verifier', (q) => q.eq('verifierId', data.verifierId))
      .filter((q) =>
        q.or(
          q.eq(q.field('status'), 'assigned'),
          q.eq(q.field('status'), 'in_progress')
        )
      )
      .collect();

    const verificationData = {
      projectId: data.projectId,
      verifierId: data.verifierId,
      status: 'assigned' as const,
      assignedAt: currentTime,
      dueDate: data.dueDate,
      priority: data.priority || ('normal' as const),
      verifierWorkload: currentWorkload.length + 1,
    };

    const verificationId = await ctx.db.insert(
      'verifications',
      verificationData
    );

    // Update project with verification details
    await ctx.db.patch(data.projectId, {
      assignedVerifierId: data.verifierId,
      verificationStatus: 'in_progress',
      verificationStartedAt: currentTime,
    });

    return verificationId;
  }

  // Get verification by ID
  public static async getVerificationById(
    ctx: QueryCtx,
    verificationId: Id<'verifications'>
  ) {
    return await ctx.db.get(verificationId);
  }

  // Get verification by project ID
  public static async getVerificationByProjectId(
    ctx: QueryCtx,
    projectId: Id<'projects'>
  ) {
    return await ctx.db
      .query('verifications')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .unique();
  }

  // Get verifications by verifier
  public static async getVerificationsByVerifier(
    ctx: QueryCtx,
    verifierId: Id<'users'>,
    status?:
      | 'assigned'
      | 'in_progress'
      | 'completed'
      | 'approved'
      | 'rejected'
      | 'revision_required'
  ) {
    let query = ctx.db
      .query('verifications')
      .withIndex('by_verifier', (q) => q.eq('verifierId', verifierId));

    if (status) {
      query = query.filter((q) => q.eq(q.field('status'), status));
    }

    return await query.collect();
  }

  // Get pending verifications (unassigned projects)
  public static async getPendingVerifications(ctx: QueryCtx) {
    return await ctx.db
      .query('projects')
      .withIndex('by_verification_status', (q) =>
        q.eq('verificationStatus', 'pending')
      )
      .filter((q) => q.eq(q.field('status'), 'submitted'))
      .collect();
  }

  // Accept verification assignment
  public static async acceptVerification(
    ctx: MutationCtx,
    verificationId: Id<'verifications'>,
    verifierId: Id<'users'>
  ) {
    const verification = await ctx.db.get(verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    if (verification.verifierId !== verifierId) {
      throw new Error(
        'Unauthorized: You can only accept your own verifications'
      );
    }

    if (verification.status !== 'assigned') {
      throw new Error('Verification has already been accepted or completed');
    }

    const currentTime = Date.now();
    await ctx.db.patch(verificationId, {
      status: 'accepted',
      acceptedAt: currentTime,
    });

    // Log the acceptance
    await this.logVerificationAction(
      ctx,
      verificationId,
      verifierId,
      'verification_accepted',
      {
        section: 'acceptance',
        newValue: 'accepted',
        timestamp: currentTime,
      }
    );

    return verification;
  }

  // Start verification process (after acceptance)
  public static async startVerification(
    ctx: MutationCtx,
    verificationId: Id<'verifications'>,
    verifierId: Id<'users'>
  ) {
    const verification = await ctx.db.get(verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    if (verification.verifierId !== verifierId) {
      throw new Error(
        'Unauthorized: You can only start your own verifications'
      );
    }

    if (!['assigned', 'accepted'].includes(verification.status)) {
      throw new Error('Verification has already been started or completed');
    }

    const currentTime = Date.now();
    const updates: any = {
      status: 'in_progress',
      startedAt: currentTime,
    };

    // If skipping acceptance step
    if (verification.status === 'assigned') {
      updates.acceptedAt = currentTime;
    }

    await ctx.db.patch(verificationId, updates);

    // Log the start
    await this.logVerificationAction(
      ctx,
      verificationId,
      verifierId,
      'verification_started',
      {
        section: 'workflow',
        newValue: 'in_progress',
        timestamp: currentTime,
      }
    );

    return verification;
  }

  // Update verification checklist items
  public static async updateVerificationChecklist(
    ctx: MutationCtx,
    verificationId: Id<'verifications'>,
    updates: {
      timelineCompliance?: boolean;
      documentationComplete?: boolean;
      co2CalculationAccurate?: boolean;
      environmentalImpactValid?: boolean;
      projectFeasible?: boolean;
      locationVerified?: boolean;
      sustainabilityAssessed?: boolean;
    }
  ) {
    const verification = await ctx.db.get(verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    await ctx.db.patch(verificationId, updates);

    // Log the checklist update
    await this.logVerificationAction(
      ctx,
      verificationId,
      verification.verifierId,
      'checklist_updated',
      {
        section: 'legacy_checklist',
        previousValue: Object.keys(updates).reduce((acc, key) => {
          acc[key] = (verification as any)[key];
          return acc;
        }, {} as any),
        newValue: updates,
      }
    );

    return verification;
  }

  // Update enhanced verification checklist
  public static async updateEnhancedChecklist(
    ctx: MutationCtx,
    verificationId: Id<'verifications'>,
    verifierId: Id<'users'>,
    updates: VerificationChecklistUpdate
  ) {
    const verification = await ctx.db.get(verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    if (verification.verifierId !== verifierId) {
      throw new Error(
        'Unauthorized: You can only update your own verifications'
      );
    }

    const currentData = {
      environmentalImpact: verification.environmentalImpact,
      projectFeasibility: verification.projectFeasibility,
      documentationQuality: verification.documentationQuality,
      locationVerification: verification.locationVerification,
      sustainability: verification.sustainability,
    };

    await ctx.db.patch(verificationId, updates);

    // Calculate overall score
    const overallScore = await this.calculateOverallScore(ctx, verificationId);
    if (overallScore !== null && overallScore !== undefined) {
      await ctx.db.patch(verificationId, { overallScore });
    }

    // Log the checklist update
    await this.logVerificationAction(
      ctx,
      verificationId,
      verifierId,
      'checklist_updated',
      {
        section: 'enhanced_checklist',
        previousValue: currentData,
        newValue: updates,
        score: overallScore || undefined,
      }
    );

    return verification;
  }

  // Complete verification
  public static async completeVerification(
    ctx: MutationCtx,
    verificationId: Id<'verifications'>,
    data: {
      qualityScore: number;
      verificationNotes: string;
      recommendation: 'approved' | 'rejected' | 'revision_required';
      rejectionReason?: string;
      revisionRequests?: string;
    }
  ) {
    const verification = await ctx.db.get(verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    const currentTime = Date.now();
    const updatedVerification = await ctx.db.patch(verificationId, {
      status: data.recommendation,
      completedAt: currentTime,
      qualityScore: data.qualityScore,
      verificationNotes: data.verificationNotes,
      rejectionReason: data.rejectionReason,
      revisionRequests: data.revisionRequests,
    });

    // Update project status based on recommendation
    let projectStatus: 'approved' | 'rejected' | 'under_review';
    let verificationStatus: 'verified' | 'rejected' | 'revision_required';

    switch (data.recommendation) {
      case 'approved':
        projectStatus = 'approved';
        verificationStatus = 'verified';
        break;
      case 'rejected':
        projectStatus = 'rejected';
        verificationStatus = 'rejected';
        break;
      case 'revision_required':
        projectStatus = 'under_review';
        verificationStatus = 'revision_required';
        break;
    }

    await ctx.db.patch(verification.projectId, {
      status: projectStatus,
      verificationStatus: verificationStatus,
      verificationCompletedAt: currentTime,
      qualityScore: data.qualityScore,
    });

    return updatedVerification;
  }

  // Get verification statistics for a verifier
  public static async getVerifierStats(ctx: QueryCtx, verifierId: Id<'users'>) {
    const allVerifications = await ctx.db
      .query('verifications')
      .withIndex('by_verifier', (q) => q.eq('verifierId', verifierId))
      .collect();

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const stats = {
      totalVerifications: allVerifications.length,
      pendingVerifications: allVerifications.filter(
        (v) => v.status === 'assigned'
      ).length,
      inProgressVerifications: allVerifications.filter(
        (v) => v.status === 'in_progress'
      ).length,
      completedThisMonth: allVerifications.filter(
        (v) => v.completedAt && v.completedAt >= thirtyDaysAgo
      ).length,
      averageScore: 0,
      onTimeCompletions: 0,
      overdueVerifications: allVerifications.filter(
        (v) => ['assigned', 'in_progress'].includes(v.status) && v.dueDate < now
      ).length,
    };

    // Calculate average score
    const scoredVerifications = allVerifications.filter(
      (v) => v.qualityScore !== null
    );
    if (scoredVerifications.length > 0) {
      stats.averageScore =
        scoredVerifications.reduce((sum, v) => sum + (v.qualityScore || 0), 0) /
        scoredVerifications.length;
    }

    // Calculate on-time completions
    const completedVerifications = allVerifications.filter(
      (v) => v.completedAt
    );
    stats.onTimeCompletions = completedVerifications.filter(
      (v) => v.completedAt! <= v.dueDate
    ).length;

    return stats;
  }

  // Get overdue verifications
  public static async getOverdueVerifications(ctx: QueryCtx) {
    const now = Date.now();
    return await ctx.db
      .query('verifications')
      .withIndex('by_due_date', (q) => q.lt('dueDate', now))
      .filter((q) =>
        q.or(
          q.eq(q.field('status'), 'assigned'),
          q.eq(q.field('status'), 'in_progress')
        )
      )
      .collect();
  }

  // Get verifications by priority
  public static async getVerificationsByPriority(
    ctx: QueryCtx,
    priority: 'low' | 'normal' | 'high' | 'urgent'
  ) {
    return await ctx.db
      .query('verifications')
      .withIndex('by_priority', (q) => q.eq('priority', priority))
      .filter((q) =>
        q.or(
          q.eq(q.field('status'), 'assigned'),
          q.eq(q.field('status'), 'in_progress')
        )
      )
      .collect();
  }

  // Update verifier workload
  public static async updateVerifierWorkload(
    ctx: MutationCtx,
    verifierId: Id<'users'>
  ) {
    const activeVerifications = await ctx.db
      .query('verifications')
      .withIndex('by_verifier', (q) => q.eq('verifierId', verifierId))
      .filter((q) =>
        q.or(
          q.eq(q.field('status'), 'assigned'),
          q.eq(q.field('status'), 'in_progress')
        )
      )
      .collect();

    // Update workload for all active verifications
    for (const verification of activeVerifications) {
      await ctx.db.patch(verification._id, {
        verifierWorkload: activeVerifications.length,
      });
    }

    return activeVerifications.length;
  }

  // Calculate overall score from component scores
  public static async calculateOverallScore(
    ctx: QueryCtx,
    verificationId: Id<'verifications'>
  ): Promise<number | null> {
    const verification = await ctx.db.get(verificationId);
    if (!verification) return null;

    const sections = [
      verification.environmentalImpact,
      verification.projectFeasibility,
      verification.documentationQuality,
      verification.locationVerification,
      verification.sustainability,
    ];

    const validScores = sections
      .filter(
        (section) => section?.score !== undefined && section.score !== null
      )
      .map((section) => section!.score!);

    if (validScores.length === 0) return null;

    // Weighted average (can be customized)
    const weights = [0.25, 0.2, 0.2, 0.15, 0.2]; // Environmental gets highest weight
    let weightedSum = 0;
    let totalWeight = 0;

    validScores.forEach((score, index) => {
      const weight = weights[index];
      if (weight !== undefined) {
        weightedSum += score * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : null;
  }

  // Save document annotations
  public static async saveDocumentAnnotations(
    ctx: MutationCtx,
    verificationId: Id<'verifications'>,
    verifierId: Id<'users'>,
    documentId: Id<'documents'>,
    annotations: any[]
  ) {
    const verification = await ctx.db.get(verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    if (verification.verifierId !== verifierId) {
      throw new Error(
        'Unauthorized: You can only annotate your own verifications'
      );
    }

    const existingAnnotations = verification.documentAnnotations || [];
    const updatedAnnotations = existingAnnotations.filter(
      (docAnnotation) => docAnnotation?.documentId !== documentId
    );

    if (annotations.length > 0) {
      updatedAnnotations.push({
        documentId,
        annotations: annotations.map((annotation) => ({
          ...annotation,
          author: verifierId,
          timestamp: Date.now(),
        })),
      });
    }

    await ctx.db.patch(verificationId, {
      documentAnnotations: updatedAnnotations,
    });

    // Log the annotation
    await this.logVerificationAction(
      ctx,
      verificationId,
      verifierId,
      'document_annotated',
      {
        section: 'document_review',
        newValue: { documentId, annotationCount: annotations.length },
      }
    );

    return verification;
  }

  // Generate verification certificate
  public static async generateVerificationCertificate(
    ctx: MutationCtx,
    verificationId: Id<'verifications'>,
    certificateData: {
      certificateType:
        | 'approval'
        | 'quality_assessment'
        | 'environmental_compliance';
      verifierCredentials: string;
      verificationStandard: string;
      complianceLevel: 'basic' | 'standard' | 'premium';
    }
  ) {
    const verification = await ctx.db.get(verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    if (verification.status !== 'approved') {
      throw new Error(
        'Can only generate certificates for approved verifications'
      );
    }

    const certificateNumber = `VC-${verification.projectId.slice(-6)}-${Date.now().toString(36).toUpperCase()}`;
    const currentTime = Date.now();

    // Get category scores
    const categoryScores = {
      environmental: verification.environmentalImpact?.score || 0,
      feasibility: verification.projectFeasibility?.score || 0,
      documentation: verification.documentationQuality?.score || 0,
      location: verification.locationVerification?.score || 0,
      sustainability: verification.sustainability?.score || 0,
    };

    const certificate = await ctx.db.insert('verificationCertificates', {
      verificationId,
      projectId: verification.projectId,
      verifierId: verification.verifierId,
      certificateNumber,
      certificateType: certificateData.certificateType,
      issueDate: currentTime,
      validUntil: currentTime + 365 * 24 * 60 * 60 * 1000, // 1 year validity
      certificateUrl: '', // Will be generated by certificate service
      qrCodeUrl: '', // Will be generated by certificate service
      digitalSignature: '', // Will be generated by crypto service
      verificationDetails: {
        overallScore: verification.overallScore || 0,
        categoryScores,
        verifierCredentials: certificateData.verifierCredentials,
        verificationStandard: certificateData.verificationStandard,
        complianceLevel: certificateData.complianceLevel,
      },
      isValid: true,
    });

    // Log certificate generation
    await this.logVerificationAction(
      ctx,
      verificationId,
      verification.verifierId,
      'certificate_generated',
      {
        section: 'certificate',
        newValue: { certificateId: certificate, certificateNumber },
      }
    );

    return certificate;
  }

  // Log verification actions for audit trail
  public static async logVerificationAction(
    ctx: MutationCtx,
    verificationId: Id<'verifications'>,
    verifierId: Id<'users'>,
    action:
      | 'verification_assigned'
      | 'verification_accepted'
      | 'verification_started'
      | 'checklist_updated'
      | 'document_annotated'
      | 'score_calculated'
      | 'message_sent'
      | 'verification_completed'
      | 'certificate_generated',
    details: {
      section?: string;
      previousValue?: any;
      newValue?: any;
      score?: number;
      notes?: string;
      attachments?: string[];
      timestamp?: number;
    }
  ) {
    // Extract timestamp from details and remove it to match schema
    const { timestamp, ...cleanDetails } = details;

    await ctx.db.insert('verificationAuditLogs', {
      verificationId,
      verifierId,
      action,
      details: cleanDetails,
      timestamp: timestamp || Date.now(),
    });
  }

  // Get verification audit trail
  public static async getVerificationAuditTrail(
    ctx: QueryCtx,
    verificationId: Id<'verifications'>
  ) {
    return await ctx.db
      .query('verificationAuditLogs')
      .withIndex('by_verification', (q) =>
        q.eq('verificationId', verificationId)
      )
      .order('desc')
      .collect();
  }

  // Get verifier acceptance statistics
  public static async getVerifierAcceptanceStats(
    ctx: QueryCtx,
    verifierId: Id<'users'>
  ) {
    const allVerifications = await ctx.db
      .query('verifications')
      .withIndex('by_verifier', (q) => q.eq('verifierId', verifierId))
      .collect();

    const assignedCount = allVerifications.filter(
      (v) => v.status === 'assigned'
    ).length;
    const acceptedCount = allVerifications.filter((v) => v.acceptedAt).length;
    const acceptanceRate =
      allVerifications.length > 0
        ? (acceptedCount / allVerifications.length) * 100
        : 0;

    const averageAcceptanceTime =
      acceptedCount > 0
        ? allVerifications
            .filter((v) => v.acceptedAt && v.assignedAt)
            .reduce((sum, v) => sum + (v.acceptedAt! - v.assignedAt), 0) /
          acceptedCount
        : 0;

    return {
      totalAssigned: allVerifications.length,
      totalAccepted: acceptedCount,
      pendingAcceptance: assignedCount,
      acceptanceRate: Math.round(acceptanceRate),
      averageAcceptanceTimeHours: Math.round(
        averageAcceptanceTime / (1000 * 60 * 60)
      ),
    };
  }
}
