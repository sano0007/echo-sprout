import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { VerifierAssignmentService } from '../services/verifier-assignment-service';
import { UserService } from '../services/user-service';
import { WorkflowService } from '../services/workflow-service';
import { VerificationService } from '../services/verification-service';

export const getOptimalVerifier = query({
  args: {
    projectId: v.id('projects'),
    requireSpecialty: v.optional(v.boolean()),
    maxWorkload: v.optional(v.number()),
    priorityBoost: v.optional(v.boolean()),
    excludeVerifiers: v.optional(v.array(v.id('users'))),
  },
  handler: async (ctx, args) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const criteria = {
      requireSpecialty: args.requireSpecialty,
      maxWorkload: args.maxWorkload,
      priorityBoost: args.priorityBoost,
      excludeVerifiers: args.excludeVerifiers,
    };

    return await VerifierAssignmentService.getOptimalVerifier(
      ctx,
      args.projectId,
      criteria
    );
  },
});

export const getRankedVerifiers = query({
  args: {
    projectId: v.id('projects'),
    requireSpecialty: v.optional(v.boolean()),
    maxWorkload: v.optional(v.number()),
    priorityBoost: v.optional(v.boolean()),
    excludeVerifiers: v.optional(v.array(v.id('users'))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const criteria = {
      requireSpecialty: args.requireSpecialty,
      maxWorkload: args.maxWorkload,
      priorityBoost: args.priorityBoost,
      excludeVerifiers: args.excludeVerifiers,
    };

    return await VerifierAssignmentService.getRankedVerifiers(
      ctx,
      args.projectId,
      criteria,
      args.limit || 5
    );
  },
});

export const autoAssignVerifier = mutation({
  args: {
    projectId: v.id('projects'),
    requireSpecialty: v.optional(v.boolean()),
    maxWorkload: v.optional(v.number()),
    priorityBoost: v.optional(v.boolean()),
    excludeVerifiers: v.optional(v.array(v.id('users'))),
    dueDate: v.optional(v.number()),
    priority: v.optional(
      v.union(
        v.literal('low'),
        v.literal('normal'),
        v.literal('high'),
        v.literal('urgent')
      )
    ),
  },
  handler: async (ctx, args) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const criteria = {
      requireSpecialty: args.requireSpecialty,
      maxWorkload: args.maxWorkload,
      priorityBoost: args.priorityBoost,
      excludeVerifiers: args.excludeVerifiers,
    };

    const verificationId = await VerifierAssignmentService.autoAssignVerifier(
      ctx,
      args.projectId,
      criteria,
      args.dueDate,
      args.priority || 'normal'
    );

    if (verificationId) {
      await WorkflowService.handleVerificationAssignment(
        ctx,
        verificationId,
        currentUser._id
      );
    }

    return verificationId;
  },
});

export const manualAssignVerifier = mutation({
  args: {
    projectId: v.id('projects'),
    verifierId: v.id('users'),
    dueDate: v.optional(v.number()),
    priority: v.optional(
      v.union(
        v.literal('low'),
        v.literal('normal'),
        v.literal('high'),
        v.literal('urgent')
      )
    ),
  },
  handler: async (ctx, args) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const verifier = await ctx.db.get(args.verifierId);
    if (!verifier || verifier.role !== 'verifier' || !verifier.isActive) {
      throw new Error('Invalid verifier selection');
    }

    const dueDate = args.dueDate || Date.now() + 14 * 24 * 60 * 60 * 1000;

    const verificationId = await VerificationService.createVerification(ctx, {
      projectId: args.projectId,
      verifierId: args.verifierId,
      dueDate,
      priority: args.priority || 'normal',
    });

    await WorkflowService.handleVerificationAssignment(
      ctx,
      verificationId,
      currentUser._id
    );

    return verificationId;
  },
});

export const getWorkloadDistribution = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    return await VerifierAssignmentService.getWorkloadDistribution(ctx);
  },
});

export const rebalanceWorkload = mutation({
  args: {
    maxWorkloadDifference: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const result = await VerifierAssignmentService.rebalanceWorkload(
      ctx,
      args.maxWorkloadDifference || 3
    );

    if (result.reassignments > 0) {
      for (const detail of result.details) {
        await ctx.db.insert('auditLogs', {
          entityType: 'verification',
          entityId: detail.verificationId,
          action: 'reassigned',
          userId: currentUser._id,
          metadata: {
            fromVerifier: detail.fromVerifier,
            toVerifier: detail.toVerifier,
            reason: detail.reason,
            description: `Verification reassigned from verifier to verifier for workload balancing`,
          },
        });
      }
    }

    return result;
  },
});

export const getAssignmentRecommendations = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    return await VerifierAssignmentService.getAssignmentRecommendations(
      ctx,
      args.limit || 10
    );
  },
});

export const batchAssignProjects = mutation({
  args: {
    assignments: v.array(
      v.object({
        projectId: v.id('projects'),
        verifierId: v.id('users'),
        priority: v.optional(
          v.union(
            v.literal('low'),
            v.literal('normal'),
            v.literal('high'),
            v.literal('urgent')
          )
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const results = [];

    for (const assignment of args.assignments) {
      try {
        const verifier = await ctx.db.get(assignment.verifierId);
        if (!verifier || verifier.role !== 'verifier' || !verifier.isActive) {
          results.push({
            projectId: assignment.projectId,
            success: false,
            error: 'Invalid verifier',
          });
          continue;
        }

        const priority = assignment.priority || 'normal';
        const dueDateMap = {
          urgent: 3 * 24 * 60 * 60 * 1000,
          high: 7 * 24 * 60 * 60 * 1000,
          normal: 14 * 24 * 60 * 60 * 1000,
          low: 21 * 24 * 60 * 60 * 1000,
        };
        const dueDate = Date.now() + dueDateMap[priority];

        const verificationId = await VerificationService.createVerification(
          ctx,
          {
            projectId: assignment.projectId,
            verifierId: assignment.verifierId,
            dueDate,
            priority,
          }
        );

        await WorkflowService.handleVerificationAssignment(
          ctx,
          verificationId,
          currentUser._id
        );

        results.push({
          projectId: assignment.projectId,
          verificationId,
          success: true,
        });
      } catch (error) {
        results.push({
          projectId: assignment.projectId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      totalAssignments: args.assignments.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  },
});

export const getVerifierCapacity = query({
  args: {
    verifierId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || !['admin', 'verifier'].includes(currentUser.role)) {
      throw new Error('Unauthorized: Admin or verifier access required');
    }

    const targetVerifierId = args.verifierId || currentUser._id;

    if (
      currentUser.role === 'verifier' &&
      targetVerifierId !== currentUser._id
    ) {
      throw new Error('Unauthorized: You can only view your own capacity');
    }

    const verifier = await ctx.db.get(targetVerifierId);
    if (!verifier) {
      throw new Error('Verifier not found');
    }

    const stats = await VerificationService.getVerifierStats(
      ctx,
      targetVerifierId
    );

    const currentWorkload =
      stats.pendingVerifications + stats.inProgressVerifications;
    const maxCapacity = 10;
    const availableCapacity = Math.max(0, maxCapacity - currentWorkload);

    return {
      verifierId: targetVerifierId,
      verifierName:
        `${verifier.firstName || ''} ${verifier.lastName || ''}`.trim(),
      currentWorkload,
      maxCapacity,
      availableCapacity,
      utilizationRate: (currentWorkload / maxCapacity) * 100,
      specialties: verifier.verifierSpecialty || [],
      averageQuality: stats.averageScore,
      onTimeRate:
        stats.totalVerifications > 0
          ? (stats.onTimeCompletions / stats.totalVerifications) * 100
          : 100,
      overdueCount: stats.overdueVerifications,
      isOverloaded: currentWorkload >= maxCapacity,
      canAcceptUrgent:
        currentWorkload < maxCapacity * 0.8 && stats.averageScore > 80,
    };
  },
});
