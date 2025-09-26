import type { MutationCtx, QueryCtx } from '../convex/_generated/server';
import type { Id } from '../convex/_generated/dataModel';

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

  // Start verification process
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

    if (verification.status !== 'assigned') {
      throw new Error('Verification has already been started or completed');
    }

    const currentTime = Date.now();
    await ctx.db.patch(verificationId, {
      status: 'in_progress',
      startedAt: currentTime,
    });

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
}
