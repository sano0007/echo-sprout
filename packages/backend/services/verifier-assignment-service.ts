import type {MutationCtx, QueryCtx} from '../convex/_generated/server';
import type {Id} from '../convex/_generated/dataModel';
import {VerificationService} from './verification-service';
import {PermissionsService} from './permissions-service';
import {NotificationService} from './notification-service';

export interface AssignmentCriteria {
  requireSpecialty?: boolean;
  maxWorkload?: number;
  priorityBoost?: boolean;
  balanceWorkload?: boolean;
  excludeVerifiers?: Id<'users'>[];
}

export interface VerifierScore {
  verifierId: Id<'users'>;
  verifier: any;
  score: number;
  workload: number;
  hasSpecialty: boolean;
  avgQuality: number;
  onTimeRate: number;
  reasons: string[];
}

export class VerifierAssignmentService {
  // Get optimal verifier for a project
  public static async getOptimalVerifier(
    ctx: QueryCtx,
    projectId: Id<'projects'>,
    criteria: AssignmentCriteria = {}
  ): Promise<VerifierScore | null> {
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const availableVerifiers = await this.getAvailableVerifiers(
      ctx,
      criteria.excludeVerifiers || []
    );

    if (availableVerifiers.length === 0) {
      return null;
    }

    // Score each verifier
    const verifierScores: VerifierScore[] = [];

    for (const verifier of availableVerifiers) {
      const score = await this.calculateVerifierScore(
        ctx,
        verifier,
        project,
        criteria
      );
      verifierScores.push(score);
    }

    // Sort by score descending
    verifierScores.sort((a, b) => b.score - a.score);

    return verifierScores[0] || null;
  }

  // Get multiple verifier options ranked by suitability
  public static async getRankedVerifiers(
    ctx: QueryCtx,
    projectId: Id<'projects'>,
    criteria: AssignmentCriteria = {},
    limit: number = 5
  ): Promise<VerifierScore[]> {
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const availableVerifiers = await this.getAvailableVerifiers(
      ctx,
      criteria.excludeVerifiers || []
    );

    const verifierScores: VerifierScore[] = [];

    for (const verifier of availableVerifiers) {
      const score = await this.calculateVerifierScore(
        ctx,
        verifier,
        project,
        criteria
      );
      verifierScores.push(score);
    }

    // Sort by score descending and limit results
    return verifierScores.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  // Automatically assign verifier to project
  public static async autoAssignVerifier(
    ctx: MutationCtx,
    projectId: Id<'projects'>,
    criteria: AssignmentCriteria = {},
    dueDate?: number,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<Id<'verifications'> | null> {
    const optimalVerifier = await this.getOptimalVerifier(
      ctx,
      projectId,
      criteria
    );

    if (!optimalVerifier) {
      return null;
    }

    // Calculate due date if not provided
    const calculatedDueDate = dueDate || this.calculateDueDate(priority);

    // Create verification record
    const verificationId = await VerificationService.createVerification(ctx, {
      projectId,
      verifierId: optimalVerifier.verifierId,
      dueDate: calculatedDueDate,
      priority,
    });

    return verificationId;
  }

  // Get available verifiers (active verifiers not excluded)
  private static async getAvailableVerifiers(
    ctx: QueryCtx,
    excludeVerifiers: Id<'users'>[]
  ) {
    const verifiers = await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'verifier'))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    return verifiers.filter((v) => !excludeVerifiers.includes(v._id));
  }

  // Calculate verifier score for assignment
  private static async calculateVerifierScore(
    ctx: QueryCtx,
    verifier: any,
    project: any,
    criteria: AssignmentCriteria
  ): Promise<VerifierScore> {
    let score = 100; // Base score
    const reasons: string[] = [];

    // Get verifier statistics
    const stats = await VerificationService.getVerifierStats(ctx, verifier._id);
    const workload = stats.pendingVerifications + stats.inProgressVerifications;

    // 1. Specialty matching (high importance)
    const hasSpecialty = this.hasRequiredSpecialty(
      verifier,
      project.projectType
    );
    if (criteria.requireSpecialty && !hasSpecialty) {
      score = 0; // Disqualify if specialty is required but not met
      reasons.push('Missing required specialty');
    } else if (hasSpecialty) {
      score += 30;
      reasons.push('Has required specialty');
    }

    // 2. Workload balancing (medium importance)
    const maxWorkload = criteria.maxWorkload || 10;
    if (workload >= maxWorkload) {
      score = Math.max(0, score - 50);
      reasons.push('High workload');
    } else if (workload === 0) {
      score += 20;
      reasons.push('No current workload');
    } else {
      const workloadPenalty = (workload / maxWorkload) * 25;
      score = Math.max(0, score - workloadPenalty);
      reasons.push(`Moderate workload (${workload})`);
    }

    // 3. Quality score (medium importance)
    if (stats.averageScore > 0) {
      const qualityBonus = ((stats.averageScore - 70) / 30) * 20; // Scale 70-100 to 0-20 bonus
      score += Math.max(-10, Math.min(20, qualityBonus));
      reasons.push(`Quality score: ${Math.round(stats.averageScore)}%`);
    }

    // 4. On-time completion rate (medium importance)
    const onTimeRate =
      stats.totalVerifications > 0
        ? (stats.onTimeCompletions / stats.totalVerifications) * 100
        : 100;

    if (onTimeRate >= 90) {
      score += 15;
      reasons.push('Excellent on-time rate');
    } else if (onTimeRate >= 70) {
      score += 10;
      reasons.push('Good on-time rate');
    } else if (onTimeRate < 50) {
      score -= 15;
      reasons.push('Poor on-time rate');
    }

    // 5. Priority boost for urgent projects
    if (criteria.priorityBoost && project.priority === 'urgent') {
      if (stats.totalVerifications > 5 && stats.averageScore > 80) {
        score += 15;
        reasons.push('Experienced for urgent project');
      }
    }

    // 6. Recent activity consideration
    if (stats.completedThisMonth === 0 && stats.totalVerifications > 0) {
      score -= 10;
      reasons.push('No recent completions');
    } else if (stats.completedThisMonth > 3) {
      score += 5;
      reasons.push('Active this month');
    }

    // 7. Overdue verification penalty
    if (stats.overdueVerifications > 0) {
      score -= stats.overdueVerifications * 20;
      reasons.push(`${stats.overdueVerifications} overdue verifications`);
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    return {
      verifierId: verifier._id,
      verifier,
      score,
      workload,
      hasSpecialty,
      avgQuality: stats.averageScore,
      onTimeRate,
      reasons,
    };
  }

  // Check if verifier has required specialty for project type
  private static hasRequiredSpecialty(
    verifier: any,
    projectType: string
  ): boolean {
    return PermissionsService.hasRequiredSpecialty(verifier, projectType);
  }

  // Calculate due date based on priority
  private static calculateDueDate(
    priority: 'low' | 'normal' | 'high' | 'urgent'
  ): number {
    const now = Date.now();
    const dueDateMap = {
      urgent: 3 * 24 * 60 * 60 * 1000, // 3 days
      high: 7 * 24 * 60 * 60 * 1000, // 1 week
      normal: 14 * 24 * 60 * 60 * 1000, // 2 weeks
      low: 21 * 24 * 60 * 60 * 1000, // 3 weeks
    };

    return now + dueDateMap[priority];
  }

  // Get workload distribution across all verifiers
  public static async getWorkloadDistribution(ctx: QueryCtx) {
    const verifiers = await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'verifier'))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    const distribution = [];

    for (const verifier of verifiers) {
      const stats = await VerificationService.getVerifierStats(
        ctx,
        verifier._id
      );
      const workload =
        stats.pendingVerifications + stats.inProgressVerifications;

      distribution.push({
        verifierId: verifier._id,
        verifierName:
          `${verifier.firstName || ''} ${verifier.lastName || ''}`.trim(),
        workload,
        totalCompleted: stats.totalVerifications,
        averageScore: stats.averageScore,
        overdueCount: stats.overdueVerifications,
        specialties: verifier.verifierSpecialty || [],
      });
    }

    return distribution.sort((a, b) => a.workload - b.workload);
  }

  // Rebalance workload by reassigning pending verifications
  public static async rebalanceWorkload(
    ctx: MutationCtx,
    maxWorkloadDifference: number = 3
  ): Promise<{
    reassignments: number;
    details: Array<{
      verificationId: Id<'verifications'>;
      fromVerifier: Id<'users'>;
      toVerifier: Id<'users'>;
      reason: string;
    }>;
  }> {
    const distribution = await this.getWorkloadDistribution(ctx);

    if (distribution.length < 2) {
      return { reassignments: 0, details: [] };
    }

    const reassignments: Array<{
      verificationId: Id<'verifications'>;
      fromVerifier: Id<'users'>;
      toVerifier: Id<'users'>;
      reason: string;
    }> = [];

    // Find verifiers with high workload and low workload
    const medianIndex = Math.floor(distribution.length / 2);
    const medianWorkload = distribution[medianIndex]?.workload ?? 0;

    const overloadedVerifiers = distribution.filter(
      (v) => v.workload > medianWorkload + maxWorkloadDifference
    );

    const underloadedVerifiers = distribution.filter(
      (v) => v.workload < medianWorkload - maxWorkloadDifference
    );

    for (const overloaded of overloadedVerifiers) {
      // Get their pending verifications (can be reassigned)
      const pendingVerifications = await ctx.db
        .query('verifications')
        .withIndex('by_verifier', (q) =>
          q.eq('verifierId', overloaded.verifierId)
        )
        .filter((q) => q.eq(q.field('status'), 'assigned'))
        .collect();

      for (const verification of pendingVerifications) {
        if (reassignments.length >= 10) break; // Limit reassignments per operation

        // Find best underloaded verifier for this verification
        const project = await ctx.db.get(verification.projectId);
        if (!project) continue;

        let bestMatch = null;
        let bestScore = -1;

        for (const underloaded of underloadedVerifiers) {
          const verifier = await ctx.db.get(underloaded.verifierId);
          if (!verifier) continue;

          const hasSpecialty = this.hasRequiredSpecialty(
            verifier,
            project.projectType
          );
          const workloadScore = 10 - underloaded.workload; // Prefer lower workload
          const specialtyScore = hasSpecialty ? 10 : 0;
          const totalScore = workloadScore + specialtyScore;

          if (totalScore > bestScore) {
            bestScore = totalScore;
            bestMatch = underloaded;
          }
        }

        if (bestMatch && bestScore > 5) {
          // Only reassign if there's a good match
          // Update verification
          await ctx.db.patch(verification._id, {
            verifierId: bestMatch.verifierId,
          });

          // Update project
          await ctx.db.patch(verification.projectId, {
            assignedVerifierId: bestMatch.verifierId,
          });

          reassignments.push({
            verificationId: verification._id,
            fromVerifier: overloaded.verifierId,
            toVerifier: bestMatch.verifierId,
            reason: `Workload rebalancing: ${overloaded.workload} → ${bestMatch.workload}`,
          });

          // Update local tracking
          overloaded.workload--;
          bestMatch.workload++;
        }
      }
    }

    return { reassignments: reassignments.length, details: reassignments };
  }

  // Get assignment recommendations for admin dashboard
  public static async getAssignmentRecommendations(
    ctx: QueryCtx,
    limit: number = 10
  ) {
    // Get unassigned projects
    const unassignedProjects = await ctx.db
      .query('projects')
      .withIndex('by_verification_status', (q) =>
        q.eq('verificationStatus', 'pending')
      )
      .filter((q) => q.eq(q.field('status'), 'submitted'))
      .collect();

    const recommendations = [];

    for (const project of unassignedProjects.slice(0, limit)) {
      const rankedVerifiers = await this.getRankedVerifiers(
        ctx,
        project._id,
        {
          requireSpecialty: true,
          maxWorkload: 8,
          priorityBoost: true,
        },
        3
      );

      if (rankedVerifiers.length > 0) {
        recommendations.push({
          project,
          topVerifiers: rankedVerifiers,
          urgency: this.calculateUrgency(project),
        });
      }
    }

    return recommendations.sort((a, b) => b.urgency - a.urgency);
  }

  // Calculate urgency score for project assignment
  private static calculateUrgency(project: any): number {
    let urgency = 50; // Base urgency

    // Priority factor
    const priorityMap = { urgent: 40, high: 30, normal: 20, low: 10 };
    urgency += priorityMap[project.priority as keyof typeof priorityMap] || 20;

    // Time since submission
    const daysSinceSubmission =
      (Date.now() - (project.submittedAt || project._creationTime)) /
      (24 * 60 * 60 * 1000);
    if (daysSinceSubmission > 7) urgency += 30;
    else if (daysSinceSubmission > 3) urgency += 15;

    // Project value/size (if available)
    if (project.expectedCarbonCredits > 10000) urgency += 15;
    else if (project.expectedCarbonCredits > 5000) urgency += 10;

    return Math.min(100, urgency);
  }

  // Auto-assign verifier to role upgrade request
  public static async autoAssignUpgradeRequest(
    ctx: MutationCtx,
    requestId: Id<'roleUpgradeRequests'>,
    criteria: Partial<AssignmentCriteria> = {}
  ): Promise<boolean> {
    // Get available verifiers
    const verifiers = await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'verifier'))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    if (verifiers.length === 0) {
      return false;
    }

    // Calculate workload for each verifier
    const verifierScores = await Promise.all(
      verifiers.map(async (verifier) => {
        const stats = await VerificationService.getVerifierStats(
          ctx,
          verifier._id
        );
        const workload =
          stats.pendingVerifications + stats.inProgressVerifications;
        return {
          verifierId: verifier._id,
          workload,
          score: 100 - workload * 10, // Lower workload = higher score
        };
      })
    );

    // Filter by max workload
    const maxWorkload = criteria.maxWorkload || 10;
    const eligibleVerifiers = verifierScores.filter(
      (v) => v.workload < maxWorkload
    );

    if (eligibleVerifiers.length === 0) {
      return false;
    }

    // Sort by score and pick best verifier
    eligibleVerifiers.sort((a, b) => b.score - a.score);
    const selectedVerifier = eligibleVerifiers[0];

    if (!selectedVerifier) {
      return false;
    }

    // Assign verifier to request
    await ctx.db.patch(requestId, {
      verifierId: selectedVerifier.verifierId,
      status: 'under_review',
      assignedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Send notification to verifier
    const request = await ctx.db.get(requestId);
    if (request) {
      await NotificationService.notifyUpgradeRequestAssigned(
        ctx,
        selectedVerifier.verifierId,
        requestId
      );
    }

    return true;
  }

  /**
   * Auto-assign a progress update to a verifier based on workload
   */
  public static async autoAssignProgressUpdate(
    ctx: MutationCtx,
    updateId: Id<'progressUpdates'>,
    criteria: Partial<AssignmentCriteria> = {}
  ): Promise<boolean> {
    // Get all active verifiers
    const verifiers = await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'verifier'))
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect();

    if (verifiers.length === 0) {
      return false;
    }

    // Calculate workload for each verifier (including progress updates)
    const verifierScores = await Promise.all(
      verifiers.map(async (verifier) => {
        // Get verification workload
        const stats = await VerificationService.getVerifierStats(
          ctx,
          verifier._id
        );
        const verificationWorkload =
          stats.pendingVerifications + stats.inProgressVerifications;

        // Get progress update workload
        const pendingProgressUpdates = await ctx.db
          .query('progressUpdates')
          .withIndex('by_verifier', (q) =>
            q.eq('assignedVerifierId', verifier._id)
          )
          .filter((q) => q.eq(q.field('status'), 'pending_review'))
          .collect();

        const progressWorkload = pendingProgressUpdates.length;
        const totalWorkload = verificationWorkload + progressWorkload;

        return {
          verifierId: verifier._id,
          workload: totalWorkload,
          score: 100 - totalWorkload * 10, // Lower workload = higher score
        };
      })
    );

    // Filter by max workload
    const maxWorkload = criteria.maxWorkload || 10;
    const eligibleVerifiers = verifierScores.filter(
      (v) => v.workload < maxWorkload
    );

    if (eligibleVerifiers.length === 0) {
      return false;
    }

    // Sort by score and pick best verifier
    eligibleVerifiers.sort((a, b) => b.score - a.score);
    const selectedVerifier = eligibleVerifiers[0];

    if (!selectedVerifier) {
      return false;
    }

    // Assign verifier to progress update
    await ctx.db.patch(updateId, {
      assignedVerifierId: selectedVerifier.verifierId,
      status: 'pending_review',
      submittedAt: Date.now(),
    });

    // Send notification to verifier
    await NotificationService.notifyProgressReviewAssigned(
      ctx,
      selectedVerifier.verifierId,
      updateId
    );

    return true;
  }
}
