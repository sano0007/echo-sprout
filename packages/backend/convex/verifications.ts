import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { VerificationService } from '../services/verification-service';
import { UserService } from '../services/user-service';
import { WorkflowService } from '../services/workflow-service';
import { paginationOptsValidator } from 'convex/server';

export const createVerification = mutation({
  args: {
    projectId: v.id('projects'),
    verifierId: v.id('users'),
    dueDate: v.number(),
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
    if (!currentUser || !['admin', 'verifier'].includes(currentUser.role)) {
      throw new Error('Unauthorized: Admin or verifier access required');
    }

    const verificationId = await VerificationService.createVerification(
      ctx,
      args
    );

    const { WorkflowService } = await import('../services/workflow-service');
    await WorkflowService.handleVerificationAssignment(
      ctx,
      verificationId,
      currentUser._id
    );

    return verificationId;
  },
});

export const getVerificationById = query({
  args: { verificationId: v.id('verifications') },
  handler: async (ctx, { verificationId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    const verification = await VerificationService.getVerificationById(
      ctx,
      verificationId
    );

    if (
      currentUser.role === 'verifier' &&
      verification?.verifierId !== currentUser._id
    ) {
      throw new Error(
        'Unauthorized: You can only access your own verifications'
      );
    }

    return verification;
  },
});

export const getVerificationByProjectId = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, { projectId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const verification = await VerificationService.getVerificationByProjectId(
      ctx,
      projectId
    );

    if (
      currentUser.role === 'verifier' &&
      verification?.verifierId !== currentUser._id
    ) {
      throw new Error('Unauthorized');
    }

    if (
      currentUser.role === 'project_creator' &&
      project.creatorId !== currentUser._id
    ) {
      throw new Error('Unauthorized');
    }

    return verification;
  },
});

export const getMyVerifications = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('assigned'),
        v.literal('in_progress'),
        v.literal('completed'),
        v.literal('approved'),
        v.literal('rejected'),
        v.literal('revision_required')
      )
    ),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { status, paginationOpts }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'verifier') {
      throw new Error('Unauthorized: Verifier access required');
    }

    const allVerifications =
      await VerificationService.getVerificationsByVerifier(
        ctx,
        currentUser._id,
        status
      );

    const startIndex =
      paginationOpts.numItems *
      (paginationOpts.cursor ? parseInt(paginationOpts.cursor) : 0);
    const endIndex = startIndex + paginationOpts.numItems;
    const paginatedResults = allVerifications.slice(startIndex, endIndex);

    return {
      page: paginatedResults,
      isDone: endIndex >= allVerifications.length,
      continueCursor:
        endIndex < allVerifications.length ? endIndex.toString() : undefined,
    };
  },
});

export const getPendingVerifications = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const pendingProjects =
      await VerificationService.getPendingVerifications(ctx);

    const startIndex =
      paginationOpts.numItems *
      (paginationOpts.cursor ? parseInt(paginationOpts.cursor) : 0);
    const endIndex = startIndex + paginationOpts.numItems;
    const paginatedResults = pendingProjects.slice(startIndex, endIndex);

    return {
      page: paginatedResults,
      isDone: endIndex >= pendingProjects.length,
      continueCursor:
        endIndex < pendingProjects.length ? endIndex.toString() : undefined,
    };
  },
});

export const acceptVerification = mutation({
  args: { verificationId: v.id('verifications') },
  handler: async (ctx, { verificationId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'verifier') {
      throw new Error('Unauthorized: Verifier access required');
    }

    const result = await VerificationService.acceptVerification(
      ctx,
      verificationId,
      currentUser._id
    );

    return result;
  },
});

export const startVerification = mutation({
  args: { verificationId: v.id('verifications') },
  handler: async (ctx, { verificationId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'verifier') {
      throw new Error('Unauthorized: Verifier access required');
    }

    const result = await VerificationService.startVerification(
      ctx,
      verificationId,
      currentUser._id
    );

    await WorkflowService.handleVerificationStart(
      ctx,
      verificationId,
      currentUser._id
    );

    return result;
  },
});

export const updateVerificationChecklist = mutation({
  args: {
    verificationId: v.id('verifications'),
    updates: v.object({
      timelineCompliance: v.optional(v.boolean()),
      documentationComplete: v.optional(v.boolean()),
      co2CalculationAccurate: v.optional(v.boolean()),
      environmentalImpactValid: v.optional(v.boolean()),
      projectFeasible: v.optional(v.boolean()),
      locationVerified: v.optional(v.boolean()),
      sustainabilityAssessed: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { verificationId, updates }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'verifier') {
      throw new Error('Unauthorized: Verifier access required');
    }

    const verification = await ctx.db.get(verificationId);
    if (!verification || verification.verifierId !== currentUser._id) {
      throw new Error(
        'Unauthorized: You can only update your own verifications'
      );
    }

    return await VerificationService.updateVerificationChecklist(
      ctx,
      verificationId,
      updates
    );
  },
});

export const updateEnhancedChecklist = mutation({
  args: {
    verificationId: v.id('verifications'),
    updates: v.object({
      environmentalImpact: v.optional(
        v.object({
          carbonReductionValidated: v.optional(v.boolean()),
          methodologyVerified: v.optional(v.boolean()),
          calculationsAccurate: v.optional(v.boolean()),
          score: v.optional(v.number()),
          notes: v.optional(v.string()),
        })
      ),
      projectFeasibility: v.optional(
        v.object({
          timelineAssessed: v.optional(v.boolean()),
          budgetAnalyzed: v.optional(v.boolean()),
          technicalApproachValid: v.optional(v.boolean()),
          resourcesAvailable: v.optional(v.boolean()),
          score: v.optional(v.number()),
          notes: v.optional(v.string()),
        })
      ),
      documentationQuality: v.optional(
        v.object({
          completenessCheck: v.optional(v.boolean()),
          accuracyVerified: v.optional(v.boolean()),
          complianceValidated: v.optional(v.boolean()),
          formatStandards: v.optional(v.boolean()),
          score: v.optional(v.number()),
          notes: v.optional(v.string()),
        })
      ),
      locationVerification: v.optional(
        v.object({
          geographicDataConfirmed: v.optional(v.boolean()),
          landRightsVerified: v.optional(v.boolean()),
          accessibilityAssessed: v.optional(v.boolean()),
          environmentalSuitability: v.optional(v.boolean()),
          score: v.optional(v.number()),
          notes: v.optional(v.string()),
        })
      ),
      sustainability: v.optional(
        v.object({
          longTermViabilityAnalyzed: v.optional(v.boolean()),
          maintenancePlanReviewed: v.optional(v.boolean()),
          stakeholderEngagement: v.optional(v.boolean()),
          adaptabilityAssessed: v.optional(v.boolean()),
          score: v.optional(v.number()),
          notes: v.optional(v.string()),
        })
      ),
    }),
  },
  handler: async (ctx, { verificationId, updates }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'verifier') {
      throw new Error('Unauthorized: Verifier access required');
    }

    return await VerificationService.updateEnhancedChecklist(
      ctx,
      verificationId,
      currentUser._id,
      updates
    );
  },
});

export const completeVerification = mutation({
  args: {
    verificationId: v.id('verifications'),
    qualityScore: v.number(),
    verificationNotes: v.string(),
    recommendation: v.union(
      v.literal('approved'),
      v.literal('rejected'),
      v.literal('revision_required')
    ),
    rejectionReason: v.optional(v.string()),
    revisionRequests: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'verifier') {
      throw new Error('Unauthorized: Verifier access required');
    }

    const verification = await ctx.db.get(args.verificationId);
    if (!verification || verification.verifierId !== currentUser._id) {
      throw new Error(
        'Unauthorized: You can only complete your own verifications'
      );
    }

    const { verificationId, ...data } = args;
    const result = await VerificationService.completeVerification(
      ctx,
      verificationId,
      data
    );

    await WorkflowService.handleVerificationCompletion(
      ctx,
      verificationId,
      args.recommendation,
      args.qualityScore,
      currentUser._id
    );

    return result;
  },
});

export const getVerifierStats = query({
  args: { verifierId: v.optional(v.id('users')) },
  handler: async (ctx, { verifierId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    const targetVerifierId = verifierId || currentUser._id;

    if (currentUser.role !== 'admin' && targetVerifierId !== currentUser._id) {
      throw new Error('Unauthorized: You can only view your own statistics');
    }

    return await VerificationService.getVerifierStats(ctx, targetVerifierId);
  },
});

export const getOverdueVerifications = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const overdueVerifications =
      await VerificationService.getOverdueVerifications(ctx);

    const startIndex =
      paginationOpts.numItems *
      (paginationOpts.cursor ? parseInt(paginationOpts.cursor) : 0);
    const endIndex = startIndex + paginationOpts.numItems;
    const paginatedResults = overdueVerifications.slice(startIndex, endIndex);

    return {
      page: paginatedResults,
      isDone: endIndex >= overdueVerifications.length,
      continueCursor:
        endIndex < overdueVerifications.length
          ? endIndex.toString()
          : undefined,
    };
  },
});

export const getVerificationsByPriority = query({
  args: {
    priority: v.union(
      v.literal('low'),
      v.literal('normal'),
      v.literal('high'),
      v.literal('urgent')
    ),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { priority, paginationOpts }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || !['admin', 'verifier'].includes(currentUser.role)) {
      throw new Error('Unauthorized: Admin or verifier access required');
    }

    let verifications = await VerificationService.getVerificationsByPriority(
      ctx,
      priority
    );

    if (currentUser.role === 'verifier') {
      verifications = verifications.filter(
        (v) => v.verifierId === currentUser._id
      );
    }

    const startIndex =
      paginationOpts.numItems *
      (paginationOpts.cursor ? parseInt(paginationOpts.cursor) : 0);
    const endIndex = startIndex + paginationOpts.numItems;
    const paginatedResults = verifications.slice(startIndex, endIndex);

    return {
      page: paginatedResults,
      isDone: endIndex >= verifications.length,
      continueCursor:
        endIndex < verifications.length ? endIndex.toString() : undefined,
    };
  },
});

export const updateVerifierWorkload = mutation({
  args: { verifierId: v.id('users') },
  handler: async (ctx, { verifierId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    return await VerificationService.updateVerifierWorkload(ctx, verifierId);
  },
});

export const saveDocumentAnnotations = mutation({
  args: {
    verificationId: v.id('verifications'),
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
      })
    ),
  },
  handler: async (ctx, { verificationId, documentId, annotations }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'verifier') {
      throw new Error('Unauthorized: Verifier access required');
    }

    return await VerificationService.saveDocumentAnnotations(
      ctx,
      verificationId,
      currentUser._id,
      documentId,
      annotations
    );
  },
});

export const generateVerificationCertificate = mutation({
  args: {
    verificationId: v.id('verifications'),
    certificateData: v.object({
      certificateType: v.union(
        v.literal('approval'),
        v.literal('quality_assessment'),
        v.literal('environmental_compliance')
      ),
      verifierCredentials: v.string(),
      verificationStandard: v.string(),
      complianceLevel: v.union(
        v.literal('basic'),
        v.literal('standard'),
        v.literal('premium')
      ),
    }),
  },
  handler: async (ctx, { verificationId, certificateData }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || !['admin', 'verifier'].includes(currentUser.role)) {
      throw new Error('Unauthorized: Admin or verifier access required');
    }

    return await VerificationService.generateVerificationCertificate(
      ctx,
      verificationId,
      certificateData
    );
  },
});

export const getVerificationAuditTrail = query({
  args: { verificationId: v.id('verifications') },
  handler: async (ctx, { verificationId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || !['admin', 'verifier'].includes(currentUser.role)) {
      throw new Error('Unauthorized: Admin or verifier access required');
    }

    const verification = await ctx.db.get(verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    if (
      currentUser.role === 'verifier' &&
      verification.verifierId !== currentUser._id
    ) {
      throw new Error(
        'Unauthorized: You can only view audit trails for your own verifications'
      );
    }

    return await VerificationService.getVerificationAuditTrail(
      ctx,
      verificationId
    );
  },
});

export const getVerifierAcceptanceStats = query({
  args: { verifierId: v.optional(v.id('users')) },
  handler: async (ctx, { verifierId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    const targetVerifierId = verifierId || currentUser._id;

    if (currentUser.role !== 'admin' && targetVerifierId !== currentUser._id) {
      throw new Error(
        'Unauthorized: You can only view your own acceptance statistics'
      );
    }

    return await VerificationService.getVerifierAcceptanceStats(
      ctx,
      targetVerifierId
    );
  },
});
