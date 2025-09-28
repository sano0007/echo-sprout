import { mutation, query, internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import { UserService } from '../services/user-service';
import type {
  ProgressValidationResult,
} from '../types/monitoring-types';

// Generate upload URL for files
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }
    return await ctx.storage.generateUploadUrl();
  },
});

// Get progress updates for a project
export const getProjectProgressUpdates = query({
  args: {
    projectId: v.id('projects'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) {
      throw new Error('Authentication required');
    }

    // Check if user can view this project's progress updates
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const canView =
      user.role === 'admin' ||
      user.role === 'verifier' ||
      (user.role === 'project_creator' && project.creatorId === user._id) ||
      (user.role === 'credit_buyer' && project.status === 'active'); // Credit buyers can see active project updates

    if (!canView) {
      throw new Error('Access denied: Cannot view progress updates for this project');
    }

    const updates = await ctx.db
      .query('progressUpdates')
      .filter(q => q.eq(q.field('projectId'), args.projectId))
      .order('desc')
      .take(args.limit || 50);

    // Enhance with user information
    const enhancedUpdates = await Promise.all(
      updates.map(async (update) => {
        const submitter = await ctx.db.get(update.submittedBy);
        return {
          ...update,
          submitterName: 'Project Creator',
          submitterEmail: submitter?.email || '',
        };
      })
    );

    return enhancedUpdates;
  },
});

// Get file URL from storage ID
export const getFileUrl = query({
  args: { storageId: v.id('_storage') },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// New progress update mutation using Convex storage - Updated for lat/long format
export const submitProgressUpdateWithFiles = mutation({
  args: {
    projectId: v.id('projects'),
    updateType: v.union(
      v.literal('milestone'),
      v.literal('measurement'),
      v.literal('photo'),
      v.literal('issue'),
      v.literal('completion')
    ),
    title: v.string(),
    description: v.string(),
    progressPercentage: v.number(),
    photoStorageIds: v.array(v.id('_storage')), // Convex storage IDs
    location: v.optional(
      v.object({
        lat: v.float64(),
        long: v.float64(),
        name: v.string(),
      })
    ),
    measurementData: v.optional(
      v.object({
        treesPlanted: v.optional(v.number()),
        survivalRate: v.optional(v.number()),

        energyGenerated: v.optional(v.number()),
        systemUptime: v.optional(v.number()),

        gasProduced: v.optional(v.number()),

        wasteProcessed: v.optional(v.number()),
        recyclingRate: v.optional(v.number()),

        areaRestored: v.optional(v.number()),
        mangrovesPlanted: v.optional(v.number()),

        carbonImpactToDate: v.optional(v.number()),
      })
    ),
    nextSteps: v.optional(v.string()),
    challenges: v.optional(v.string()),
    reportingDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Authentication required');
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check permissions
    const canSubmit =
      currentUser.role === 'admin' ||
      (currentUser.role === 'project_creator' && project.creatorId === currentUser._id) ||
      (currentUser.role === 'verifier' && project.assignedVerifierId === currentUser._id);

    if (!canSubmit) {
      throw new Error('Access denied: Cannot submit progress updates for this project');
    }

    // Validation
    if (!args.title?.trim()) {
      throw new Error('Title is required');
    }
    if (!args.description?.trim()) {
      throw new Error('Description is required');
    }
    if (args.progressPercentage < 0 || args.progressPercentage > 100) {
      throw new Error('Progress percentage must be between 0 and 100');
    }

    // Get photo URLs from storage IDs
    const photoUrls: string[] = [];
    for (const storageId of args.photoStorageIds) {
      const url = await ctx.storage.getUrl(storageId);
      if (url) {
        photoUrls.push(url);
      }
    }

    // Create progress update
    const progressUpdateId = await ctx.db.insert('progressUpdates', {
      projectId: args.projectId,
      submittedBy: currentUser._id,
      updateType: args.updateType,
      title: args.title.trim(),
      description: args.description.trim(),
      progressPercentage: args.progressPercentage,
      photoStorageIds: args.photoStorageIds,
      photoUrls, // Store URLs for quick access
      photos: [], // Ensure old photos field is present but empty
      location: args.location,
      measurementData: args.measurementData,
      nextSteps: args.nextSteps,
      challenges: args.challenges,
      submittedAt: Date.now(),
      reportingDate: args.reportingDate || Date.now(),
      status: 'pending_review',
      isVerified: false,
    });

    // Update project progress if this is a new maximum
    if (args.progressPercentage > (project.progressPercentage || 0)) {
      await ctx.db.patch(args.projectId, {
        progressPercentage: args.progressPercentage,
        lastProgressUpdate: Date.now(),
      });
    }

    // Create audit log
    await ctx.db.insert('auditLogs', {
      userId: currentUser._id,
      action: 'progress_update_submitted',
      entityType: 'progress_update',
      entityId: progressUpdateId,
      metadata: {
        projectId: args.projectId,
        updateType: args.updateType,
        progressPercentage: args.progressPercentage,
        submittedAt: Date.now(),
      },
    });

    return progressUpdateId;
  },
});

// Keep the old mutation for backward compatibility
export const submitProgressUpdate = mutation({
  args: {
    projectId: v.id('projects'),
    updateType: v.union(
      v.literal('milestone'),
      v.literal('measurement'),
      v.literal('photo'),
      v.literal('issue'),
      v.literal('completion')
    ),
    title: v.string(),
    description: v.string(),
    progressPercentage: v.number(),
    photos: v.array(
      v.object({
        cloudinary_public_id: v.string(),
        cloudinary_url: v.string(),
      })
    ),
    location: v.optional(
      v.object({
        lat: v.float64(),
        long: v.float64(),
        name: v.string(),
      })
    ),
    measurementData: v.optional(
      v.object({
        treesPlanted: v.optional(v.number()),
        survivalRate: v.optional(v.number()),

        energyGenerated: v.optional(v.number()),
        systemUptime: v.optional(v.number()),

        gasProduced: v.optional(v.number()),

        wasteProcessed: v.optional(v.number()),
        recyclingRate: v.optional(v.number()),

        areaRestored: v.optional(v.number()),
        mangrovesPlanted: v.optional(v.number()),

        carbonImpactToDate: v.optional(v.number()),
      })
    ),
    reportingDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Authentication required');
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const canSubmit =
      currentUser.role === 'admin' ||
      (currentUser.role === 'project_creator' &&
        project.creatorId === currentUser._id) ||
      (currentUser.role === 'verifier' &&
        project.assignedVerifierId === currentUser._id);

    if (!canSubmit) {
      throw new Error(
        'Access denied: Cannot submit progress updates for this project'
      );
    }

    if (!args.title?.trim()) {
      throw new Error('Title is required');
    }
    if (!args.description?.trim()) {
      throw new Error('Description is required');
    }
    if (args.progressPercentage < 0 || args.progressPercentage > 100) {
      throw new Error('Progress percentage must be between 0 and 100');
    }

    // Basic photo validation for Convex storage
    if (args.photos.length > 10) {
      throw new Error('Maximum 10 photos allowed per update');
    }

    const updateId = await ctx.db.insert('progressUpdates', {
      projectId: args.projectId,
      submittedBy: currentUser._id,
      updateType: args.updateType,
      title: args.title,
      description: args.description,
      progressPercentage: args.progressPercentage,
      photoStorageIds: [],
      photoUrls: args.photos.map(p => p.cloudinary_url),
      location: args.location,
      measurementData: args.measurementData,
      reportingDate: args.reportingDate || Date.now(),
      submittedAt: Date.now(),
      status: 'pending_review',
      isVerified: false,

    });

    if (args.progressPercentage > (project.progressPercentage || 0)) {
      await ctx.db.patch(args.projectId, {
        progressPercentage: args.progressPercentage,
        lastProgressUpdate: Date.now(),
      });
    }

    const milestones = await ctx.db
      .query('projectMilestones')
      .withIndex('by_project_status', (q) =>
        q.eq('projectId', args.projectId).eq('status', 'pending')
      )
      .collect();

    for (const milestone of milestones) {
      let shouldComplete = false;
      switch (milestone.milestoneType) {
        case 'progress_25':
          shouldComplete = args.progressPercentage >= 25;
          break;
        case 'progress_50':
          shouldComplete = args.progressPercentage >= 50;
          break;
        case 'progress_75':
          shouldComplete = args.progressPercentage >= 75;
          break;
        case 'completion':
          shouldComplete = args.progressPercentage >= 100;
          break;
      }

      if (shouldComplete) {
        await ctx.db.patch(milestone._id, {
          status: 'completed' as const,
          actualDate: Date.now(),
        });
      }
    }

    await ctx.db.insert('auditLogs', {
      userId: currentUser._id,
      action: 'monitoring_submit_progress_update',
      entityType: 'progress_update',
      entityId: updateId,
      metadata: {
        userRole: currentUser.role,
        timestamp: Date.now(),
        projectId: args.projectId,
        updateType: args.updateType,
        progressPercentage: args.progressPercentage,
      },
    });

    const recentUpdates = await ctx.db
      .query('progressUpdates')
      .withIndex('by_project', (q) => q.eq('projectId', args.projectId))
      .order('desc')
      .take(2);

    if (recentUpdates.length > 0 && recentUpdates[0]) {
      const previousProgress = recentUpdates[0].progressPercentage;
      const progressJump = args.progressPercentage - previousProgress;

      if (progressJump > 30) {
        await ctx.db.insert('systemAlerts', {
          projectId: args.projectId,
          alertType: 'quality_concern',
          severity: 'medium',
          message: 'Significant Progress Jump Detected',
          description: `Progress increased by ${progressJump}% in a single update. Please verify accuracy.`,
          isResolved: false,
          escalationLevel: 0,
          nextEscalationTime: Date.now() + 24 * 60 * 60 * 1000,
          metadata: {
            updateId,
            progressJump,
            previousProgress,
            newProgress: args.progressPercentage,
          },
        });
      }
    }

    return {
      updateId,
      validation: {
        score: 100,
        warnings: [],
      },
      photoProcessing: {
        uploadedCount: args.photos.length,
        thumbnailsGenerated: 0,
        warnings: [],
      },
      milestones: await ctx.db
        .query('projectMilestones')
        .withIndex('by_project_status', (q) =>
          q.eq('projectId', args.projectId).eq('status', 'pending')
        )
        .order('asc')
        .take(3),
    };
  },
});

export const getProjectProgress = query({
  args: {
    projectId: v.id('projects'),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    updateType: v.optional(
      v.union(
        v.literal('milestone'),
        v.literal('measurement'),
        v.literal('photo'),
        v.literal('issue'),
        v.literal('completion')
      )
    ),
    verified: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    { projectId, limit = 10, offset = 0, updateType, verified }
  ) => {
    // Verify project access
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Authentication required');
    }

    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const canAccess =
      currentUser.role === 'admin' ||
      (currentUser.role === 'project_creator' &&
        project.creatorId === currentUser._id) ||
      (currentUser.role === 'verifier' &&
        project.assignedVerifierId === currentUser._id);

    if (!canAccess) {
      throw new Error('Access denied: Cannot view progress for this project');
    }

    let query = ctx.db
      .query('progressUpdates')
      .withIndex('by_project', (q) => q.eq('projectId', projectId));

    // Apply filters
    if (updateType) {
      query = query.filter((q) => q.eq(q.field('updateType'), updateType));
    }

    if (verified !== undefined) {
      query = query.filter((q) => q.eq(q.field('isVerified'), verified));
    }

    const updates = await query
      .order('desc')
      .take(limit + offset)
      .then((results) => results.slice(offset));

    // Get reporter information for each update
    const updatesWithReporter = await Promise.all(
      updates.map(async (update) => {
        const reporterId = update.submittedBy || update.reportedBy;
        const reporter = reporterId ? await ctx.db.get(reporterId) : null;
        return {
          ...update,
          reporter: reporter
            ? {
                _id: reporter._id,
                firstName: reporter.firstName || '',
                lastName: reporter.lastName || '',
                role: reporter.role,
              }
            : null,
        };
      })
    );

    const projectSummary = await ctx.db.get(projectId);
    const totalUpdates = await ctx.db
      .query('progressUpdates')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .collect()
      .then((results) => results.length);

    return {
      updates: updatesWithReporter,
      pagination: {
        total: totalUpdates,
        limit,
        offset,
        hasMore: totalUpdates > offset + limit,
      },
      projectSummary: projectSummary
        ? {
            title: projectSummary.title,
            currentProgress: projectSummary.progressPercentage || 0,
            status: projectSummary.status,
            expectedCompletion: projectSummary.expectedCompletionDate,
          }
        : null,
    };
  },
});

export const updateProgressStatus = mutation({
  args: {
    updateId: v.id('progressUpdates'),
    isVerified: v.optional(v.boolean()),
    verificationNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Authentication required');
    }

    const update = await ctx.db.get(args.updateId);
    if (!update) {
      throw new Error('Progress update not found');
    }

    // Check permissions
    const project = await ctx.db.get(update.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const canManage =
      currentUser.role === 'admin' ||
      (currentUser.role === 'project_creator' &&
        project.creatorId === currentUser._id) ||
      (currentUser.role === 'verifier' &&
        project.assignedVerifierId === currentUser._id);

    if (!canManage) {
      throw new Error('Access denied: Cannot update progress status');
    }

    const patches: any = {};

    if (args.isVerified !== undefined) {
      patches.isVerified = args.isVerified;
      patches.verifiedBy = currentUser._id;
      patches.verifiedAt = Date.now();
    }

    if (args.verificationNotes) {
      patches.verificationNotes = args.verificationNotes;
    }

    await ctx.db.patch(args.updateId, patches);

    await ctx.db.insert('auditLogs', {
      userId: currentUser._id,
      action: 'monitoring_update_progress_status',
      entityType: 'progress_update',
      entityId: args.updateId,
      metadata: {
        userRole: currentUser.role,
        timestamp: Date.now(),
        projectId: update.projectId,
        isVerified: args.isVerified,
        verifiedBy: currentUser._id,
      },
    });

    return { success: true };
  },
});

export const getProgressSummary = query({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, { projectId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Authentication required');
    }

    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const recentUpdates = await ctx.db
      .query('progressUpdates')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .order('desc')
      .take(5);

    const milestones = await ctx.db
      .query('projectMilestones')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .order('asc')
      .collect();

    const totalUpdates = await ctx.db
      .query('progressUpdates')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .collect()
      .then((updates) => updates.length);

    const verifiedUpdates = recentUpdates.filter((u) => u.isVerified).length;
    const completedMilestones = milestones.filter(
      (m) => m.status === 'completed'
    ).length;

    const latestImpactUpdate = recentUpdates.find(
      (u) =>
        u.measurementData?.carbonImpactToDate ||
        u.measurementData?.treesPlanted ||
        u.measurementData?.energyGenerated ||
        u.measurementData?.wasteProcessed
    );

    const daysSinceLastUpdate =
      recentUpdates.length > 0 && recentUpdates[0]
        ? Math.floor(
            (Date.now() - recentUpdates[0].reportingDate) /
              (1000 * 60 * 60 * 24)
          )
        : null;

    return {
      project: {
        _id: project._id,
        title: project.title,
        projectType: project.projectType,
        status: project.status,
        currentProgress: project.progressPercentage || 0,
        startDate: project.startDate,
        expectedCompletion: project.expectedCompletionDate,
      },
      progress: {
        totalUpdates,
        recentUpdates: recentUpdates.length,
        verifiedUpdates,
        daysSinceLastUpdate,
      },
      milestones: {
        total: milestones.length,
        completed: completedMilestones,
        pending: milestones.filter((m) => m.status === 'pending').length,
        delayed: milestones.filter((m) => m.status === 'delayed').length,
        next: milestones.find((m) => m.status === 'pending'),
      },
      impact: latestImpactUpdate
        ? {
            carbonImpactToDate: latestImpactUpdate.measurementData?.carbonImpactToDate,
            treesPlanted: latestImpactUpdate.measurementData?.treesPlanted,
            energyGenerated: latestImpactUpdate.measurementData?.energyGenerated,
            wasteProcessed: latestImpactUpdate.measurementData?.wasteProcessed,
            lastUpdated: latestImpactUpdate.reportingDate,
          }
        : null,
    };
  },
});

export const getUploadConfig = query({
  args: {
    projectId: v.id('projects'),
    updateType: v.union(
      v.literal('milestone'),
      v.literal('measurement'),
      v.literal('photo'),
      v.literal('issue'),
      v.literal('completion')
    ),
  },
  handler: async (ctx, { projectId, updateType }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Authentication required');
    }

    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const canSubmit =
      currentUser.role === 'admin' ||
      (currentUser.role === 'project_creator' &&
        project.creatorId === currentUser._id) ||
      (currentUser.role === 'verifier' &&
        project.assignedVerifierId === currentUser._id);

    if (!canSubmit) {
      throw new Error('Access denied');
    }

    // Return Convex storage upload config
    return {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxFiles: 10,
      projectType: project.projectType,
      updateType
    };
  },
});

export const validateProgressUpdateData = internalQuery({
  args: {
    projectId: v.id('projects'),
    updateData: v.any(),
  },
  handler: async (
    ctx,
    { projectId, updateData }
  ): Promise<ProgressValidationResult> => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const project = await ctx.db.get(projectId);
    if (!project) {
      errors.push('Project not found');
      return { isValid: false, errors, warnings, score: 0 };
    }

    if (!updateData.title?.trim()) {
      errors.push('Title is required');
    }

    if (!updateData.description?.trim()) {
      errors.push('Description is required');
    }

    if (typeof updateData.progressPercentage !== 'number') {
      errors.push('Progress percentage must be a number');
    } else if (
      updateData.progressPercentage < 0 ||
      updateData.progressPercentage > 100
    ) {
      errors.push('Progress percentage must be between 0 and 100');
    }

    if (
      project.progressPercentage &&
      updateData.progressPercentage < project.progressPercentage - 5
    ) {
      warnings.push('Progress appears to have decreased significantly');
    }

    // Basic photo validation for Convex storage
    const photos = updateData.photos || [];
    if (photos.length > 10) {
      errors.push('Maximum 10 photos allowed per update');
    }

    for (const photo of photos) {
      if (!photo.cloudinary_url && !photo.storageId) {
        errors.push('Invalid photo format - missing URL or storage ID');
      }
    }

    if (updateData.measurementData) {
      for (const [key, value] of Object.entries(updateData.measurementData)) {
        if (typeof value === 'number' && value < 0) {
          errors.push(`${key} cannot be negative`);
        }
      }

      if (project.projectType === 'reforestation') {
        if (
          updateData.measurementData.survivalRate &&
          (updateData.measurementData.survivalRate < 0 ||
            updateData.measurementData.survivalRate > 1)
        ) {
          errors.push('Survival rate must be between 0 and 1');
        }
      }

      if (['solar', 'wind'].includes(project.projectType)) {
        if (
          updateData.measurementData.systemUptime &&
          (updateData.measurementData.systemUptime < 0 ||
            updateData.measurementData.systemUptime > 1)
        ) {
          errors.push('System uptime must be between 0 and 1');
        }
      }
    }

    const recentUpdates = await ctx.db
      .query('progressUpdates')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .filter((q) =>
        q.gte(q.field('reportingDate'), Date.now() - 7 * 24 * 60 * 60 * 1000)
      )
      .collect();

    if (recentUpdates.length >= 3) {
      warnings.push(
        'Multiple updates submitted this week - ensure each provides new meaningful information'
      );
    }

    const score = Math.max(0, 100 - errors.length * 20 - warnings.length * 5);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score,
    };
  },
});

export const checkMilestoneCompletion = internalMutation({
  args: {
    projectId: v.id('projects'),
    progressPercentage: v.number(),
    updateId: v.id('progressUpdates'),
  },
  handler: async (ctx, { projectId, progressPercentage, updateId }) => {
    const milestones = await ctx.db
      .query('projectMilestones')
      .withIndex('by_project_status', (q) =>
        q.eq('projectId', projectId).eq('status', 'pending')
      )
      .collect();

    const completedMilestones = [];

    for (const milestone of milestones) {
      let shouldComplete = false;

      switch (milestone.milestoneType) {
        case 'progress_25':
          shouldComplete = progressPercentage >= 25;
          break;
        case 'progress_50':
          shouldComplete = progressPercentage >= 50;
          break;
        case 'progress_75':
          shouldComplete = progressPercentage >= 75;
          break;
        case 'completion':
          shouldComplete = progressPercentage >= 100;
          break;
      }

      if (shouldComplete) {
        await ctx.db.patch(milestone._id, {
          status: 'completed' as const,
          actualDate: Date.now(),
        });

        completedMilestones.push(milestone);

        await ctx.db.insert('auditLogs', {
          userId: undefined,
          action: 'monitoring_complete_milestone',
          entityType: 'milestone',
          entityId: milestone._id,
          metadata: {
            timestamp: Date.now(),
            projectId,
            milestoneType: milestone.milestoneType,
            triggeredByUpdate: updateId,
          },
        });
      }
    }

    return completedMilestones;
  },
});


