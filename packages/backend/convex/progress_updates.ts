import {
  mutation,
  query,
  internalMutation,
  internalQuery,
} from './_generated/server';
import { v } from 'convex/values';
import { UserService } from '../services/user-service';
import type { ProgressValidationResult } from '../types/monitoring-types';

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
        storageId: v.string(),
        fileUrl: v.string(),
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

    // Basic validation for Convex-stored photos
    const photoErrors: string[] = [];
    if (!Array.isArray(args.photos)) {
      throw new Error('Photos must be an array');
    }
    for (let i = 0; i < args.photos.length; i++) {
      const p = args.photos[i] as any;
      if (
        !p ||
        typeof p.storageId !== 'string' ||
        typeof p.fileUrl !== 'string'
      ) {
        photoErrors.push(`Photo ${i + 1} is missing storageId or fileUrl`);
      }
    }
    if (photoErrors.length > 0) {
      throw new Error(`Photo validation failed: ${photoErrors.join(', ')}`);
    }

    const updateId = await ctx.db.insert('progressUpdates', {
      projectId: args.projectId,
      reportedBy: currentUser._id,
      updateType: args.updateType,
      title: args.title,
      description: args.description,
      progressPercentage: args.progressPercentage,
      photoStorageIds: args.photos.map((p) => p.storageId as any),
      photoUrls: args.photos.map((p) => p.fileUrl),
      location: args.location,
      measurementData: args.measurementData,
      reportingDate: args.reportingDate || Date.now(),
      isVerified: false,

      carbonImpactToDate: args.measurementData?.carbonImpactToDate,
      treesPlanted: args.measurementData?.treesPlanted,
      energyGenerated: args.measurementData?.energyGenerated,
      wasteProcessed: args.measurementData?.wasteProcessed,
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
        thumbnailsGenerated: args.photos.length, // Assuming 1:1 thumbnail generation
        warnings: [], // No warnings for now
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
        // Support both old (reportedBy) and new (submittedBy) formats
        const reporterId = update.submittedBy || update.reportedBy;
        const reporter = reporterId ? await ctx.db.get(reporterId) : null;
        return {
          ...update,
          reporter: reporter
            ? {
                _id: reporter._id,
                firstName: reporter.firstName,
                lastName: reporter.lastName,
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
        u.carbonImpactToDate ||
        u.treesPlanted ||
        u.energyGenerated ||
        u.wasteProcessed
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
            carbonImpactToDate: latestImpactUpdate.carbonImpactToDate,
            treesPlanted: latestImpactUpdate.treesPlanted,
            energyGenerated: latestImpactUpdate.energyGenerated,
            wasteProcessed: latestImpactUpdate.wasteProcessed,
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

    // Provide a simple client-side hint config for Convex storage uploads
    return {
      folder: `progress-updates/${project.projectType}/${updateType}`,
      maxFiles: 20,
      maxFileSize: 10, // MB
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'],
      requirements: { minimumCount: 0 },
      tags: [project.projectType, updateType, 'progress-update'],
      transformations: {},
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

    // Simple photo validation for Convex storage
    const photos = (updateData.photos || []) as Array<{
      storageId?: string;
      fileUrl?: string;
    }>;
    const photoErrors: string[] = [];
    const photoWarnings: string[] = [];
    photos.forEach((p, idx) => {
      if (!p || !p.storageId || !p.fileUrl) {
        photoErrors.push(`Photo ${idx + 1} missing storageId or fileUrl`);
      }
      if (
        p.fileUrl &&
        typeof p.fileUrl === 'string' &&
        !p.fileUrl.startsWith('http')
      ) {
        photoWarnings.push(`Photo ${idx + 1} fileUrl does not look like a URL`);
      }
    });
    errors.push(...photoErrors);
    warnings.push(...photoWarnings);

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

export const analyzeProgressForAlerts = internalMutation({
  args: {
    projectId: v.id('projects'),
    newUpdate: v.object({
      updateId: v.id('progressUpdates'),
      progressPercentage: v.number(),
      measurementData: v.optional(v.any()),
    }),
  },
  handler: async (ctx, { projectId, newUpdate }) => {
    const project = await ctx.db.get(projectId);
    if (!project) return;

    const recentUpdates = await ctx.db
      .query('progressUpdates')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .order('desc')
      .take(5);

    const alerts = [];

    if (recentUpdates.length > 1 && recentUpdates[1]) {
      const previousProgress = recentUpdates[1].progressPercentage;
      const progressJump = newUpdate.progressPercentage - previousProgress;

      if (progressJump > 30) {
        const alertId = await ctx.db.insert('systemAlerts', {
          projectId,
          alertType: 'quality_concern',
          severity: 'medium',
          message: 'Significant Progress Jump Detected',
          description: `Progress increased by ${progressJump}% in a single update. Please verify accuracy.`,
          isResolved: false,
          escalationLevel: 0,
          nextEscalationTime: Date.now() + 24 * 60 * 60 * 1000,
          metadata: {
            updateId: newUpdate.updateId,
            progressJump,
            previousProgress,
            newProgress: newUpdate.progressPercentage,
          },
        });
        alerts.push(alertId);
      }
    }

    const projectStart = new Date(project.startDate).getTime();
    const projectEnd = new Date(project.expectedCompletionDate).getTime();
    const now = Date.now();

    const timeElapsed = (now - projectStart) / (projectEnd - projectStart);
    const progressRatio = newUpdate.progressPercentage / 100;

    if (timeElapsed > progressRatio + 0.1 && timeElapsed > 0.5) {
      const alertId = await ctx.db.insert('systemAlerts', {
        projectId,
        alertType: 'milestone_delay',
        severity: 'medium',
        message: 'Project Behind Schedule',
        description: `Project is ${Math.round((timeElapsed - progressRatio) * 100)}% behind schedule based on timeline.`,
        isResolved: false,
        escalationLevel: 0,
        nextEscalationTime: Date.now() + 3 * 24 * 60 * 60 * 1000,
        metadata: {
          timeElapsed: Math.round(timeElapsed * 100),
          progressAchieved: Math.round(progressRatio * 100),
          scheduleVariance: Math.round((timeElapsed - progressRatio) * 100),
        },
      });
      alerts.push(alertId);
    }

    return alerts;
  },
});

export const getUpcomingMilestones = internalQuery({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, { projectId }) => {
    return await ctx.db
      .query('projectMilestones')
      .withIndex('by_project_status', (q) =>
        q.eq('projectId', projectId).eq('status', 'pending')
      )
      .order('asc')
      .take(3);
  },
});
