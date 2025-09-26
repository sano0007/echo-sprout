import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { VerificationService } from '../services/verification-service';
import { UserService } from '../services/user-service';
import { paginationOptsValidator } from 'convex/server';

// Create a new verification
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

    return await VerificationService.createVerification(ctx, args);
  },
});

// Get verification by ID
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

    // Check access permissions
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

// Get verification by project ID
export const getVerificationByProjectId = query({
  args: { projectId: v.id('projects') },
  handler: async (ctx, { projectId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    // Check if user has access to this project
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Allow access for project creator, assigned verifier, or admin
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

// Get verifications for current verifier
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

    // Manual pagination
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

// Get pending verifications (for admin assignment)
export const getPendingVerifications = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const pendingProjects =
      await VerificationService.getPendingVerifications(ctx);

    // Manual pagination
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

// Start verification process
export const startVerification = mutation({
  args: { verificationId: v.id('verifications') },
  handler: async (ctx, { verificationId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'verifier') {
      throw new Error('Unauthorized: Verifier access required');
    }

    return await VerificationService.startVerification(
      ctx,
      verificationId,
      currentUser._id
    );
  },
});

// Update verification checklist
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

    // Verify the verifier owns this verification
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

// Complete verification
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

    // Verify the verifier owns this verification
    const verification = await ctx.db.get(args.verificationId);
    if (!verification || verification.verifierId !== currentUser._id) {
      throw new Error(
        'Unauthorized: You can only complete your own verifications'
      );
    }

    const { verificationId, ...data } = args;
    return await VerificationService.completeVerification(
      ctx,
      verificationId,
      data
    );
  },
});

// Get verifier statistics
export const getVerifierStats = query({
  args: { verifierId: v.optional(v.id('users')) },
  handler: async (ctx, { verifierId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    // If no verifierId provided, use current user
    const targetVerifierId = verifierId || currentUser._id;

    // Check permissions
    if (currentUser.role !== 'admin' && targetVerifierId !== currentUser._id) {
      throw new Error('Unauthorized: You can only view your own statistics');
    }

    return await VerificationService.getVerifierStats(ctx, targetVerifierId);
  },
});

// Get overdue verifications (admin only)
export const getOverdueVerifications = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser || currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const overdueVerifications =
      await VerificationService.getOverdueVerifications(ctx);

    // Manual pagination
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

// Get verifications by priority
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

    // If verifier, filter to only their verifications
    if (currentUser.role === 'verifier') {
      verifications = verifications.filter(
        (v) => v.verifierId === currentUser._id
      );
    }

    // Manual pagination
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

// Update verifier workload
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
