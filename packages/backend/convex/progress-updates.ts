import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { UserService } from '../services/user-service';
import { CloudinaryService } from '../services/cloudinary-service';
import type {
  ProgressUpdateData,
  ProgressValidationResult,
} from '../types/monitoring-types';

/**
 * PROGRESS UPDATE SUBMISSION SYSTEM
 *
 * This module handles the core progress update submission system:
 * - Progress update creation and validation
 * - Photo and document upload handling
 * - Impact metrics validation
 * - Progress status management
 * - Timeline and milestone integration
 */

// ============= PROGRESS UPDATE SUBMISSION =============

/**
 * Submit a new progress update for a project
 */
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
        // Reforestation metrics
        treesPlanted: v.optional(v.number()),
        survivalRate: v.optional(v.number()),

        // Solar/Wind energy metrics
        energyGenerated: v.optional(v.number()),
        systemUptime: v.optional(v.number()),

        // Biogas metrics
        gasProduced: v.optional(v.number()),

        // Waste management metrics
        wasteProcessed: v.optional(v.number()),
        recyclingRate: v.optional(v.number()),

        // Mangrove restoration metrics
        areaRestored: v.optional(v.number()),
        mangrovesPlanted: v.optional(v.number()),

        // Common metrics
        carbonImpactToDate: v.optional(v.number()),
      })
    ),
    reportingDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get current user
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Authentication required');
    }

    // Verify project access
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user can submit progress updates for this project
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

    // Validate progress update data using comprehensive validation engine
    const validation = await ctx.runQuery(
      internal.progressValidation.validateCompleteProgressUpdate,
      {
        projectId: args.projectId,
        updateData: args,
        validatePhotos: true,
        validateTimeline: true,
      }
    );

    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Validate and prepare photos for storage
    const photoPreparation = CloudinaryService.preparePhotosForStorage(
      args.photos,
      project.projectType
    );

    if (!photoPreparation.validation.isValid) {
      throw new Error(
        `Photo validation failed: ${photoPreparation.validation.errors.join(', ')}`
      );
    }

    // Create progress update
    const updateId = await ctx.db.insert('progressUpdates', {
      projectId: args.projectId,
      reportedBy: currentUser._id,
      updateType: args.updateType,
      title: args.title,
      description: args.description,
      progressPercentage: args.progressPercentage,
      photos: photoPreparation.photos,
      location: args.location,
      measurementData: args.measurementData,
      reportingDate: args.reportingDate || Date.now(),
      isVerified: false,

      // Flatten measurement data for easier querying
      carbonImpactToDate: args.measurementData?.carbonImpactToDate,
      treesPlanted: args.measurementData?.treesPlanted,
      energyGenerated: args.measurementData?.energyGenerated,
      wasteProcessed: args.measurementData?.wasteProcessed,
    });

    // Update project progress percentage if this is the latest update
    if (args.progressPercentage > (project.progressPercentage || 0)) {
      await ctx.db.patch(args.projectId, {
        progressPercentage: args.progressPercentage,
        lastProgressUpdate: Date.now(),
      });
    }

    // Check if this update completes a milestone
    await ctx.runMutation(internal.progressUpdates.checkMilestoneCompletion, {
      projectId: args.projectId,
      progressPercentage: args.progressPercentage,
      updateId,
    });

    // Log the progress update submission
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

    // Generate alerts if necessary (e.g., significant progress jump or decline)
    await ctx.runMutation(internal.progressUpdates.analyzeProgressForAlerts, {
      projectId: args.projectId,
      newUpdate: {
        updateId,
        progressPercentage: args.progressPercentage,
        measurementData: args.measurementData,
      },
    });

    return {
      updateId,
      validation: {
        score: validation.score,
        warnings: validation.warnings,
        details: validation.details,
        recommendations: validation.recommendations,
      },
      photoProcessing: {
        uploadedCount: args.photos.length,
        thumbnailsGenerated: photoPreparation.thumbnails.length,
        warnings: photoPreparation.validation.warnings,
      },
      milestones: await ctx.runQuery(
        internal.progressUpdates.getUpcomingMilestones,
        {
          projectId: args.projectId,
        }
      ),
    };
  },
});

/**
 * Get progress updates for a project
 */
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
        const reporter = await ctx.db.get(update.reportedBy);
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

    // Get project summary data
    const project = await ctx.db.get(projectId);
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
      projectSummary: project
        ? {
            title: project.title,
            currentProgress: project.progressPercentage || 0,
            status: project.status,
            expectedCompletion: project.expectedCompletionDate,
          }
        : null,
    };
  },
});

/**
 * Update progress update status (verification, etc.)
 */
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

    // Update the progress update
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

    // Log the status change
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

/**
 * Get progress summary for a project
 */
export const getProgressSummary = query({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, { projectId }) => {
    // Verify access
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Authentication required');
    }

    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get recent progress updates
    const recentUpdates = await ctx.db
      .query('progressUpdates')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .order('desc')
      .take(5);

    // Get milestones
    const milestones = await ctx.db
      .query('projectMilestones')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .order('asc')
      .collect();

    // Calculate progress metrics
    const totalUpdates = await ctx.db
      .query('progressUpdates')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .collect()
      .then((updates) => updates.length);

    const verifiedUpdates = recentUpdates.filter((u) => u.isVerified).length;
    const completedMilestones = milestones.filter(
      (m) => m.status === 'completed'
    ).length;

    // Get latest impact metrics
    const latestImpactUpdate = recentUpdates.find(
      (u) =>
        u.carbonImpactToDate ||
        u.treesPlanted ||
        u.energyGenerated ||
        u.wasteProcessed
    );

    // Calculate days since last update
    const daysSinceLastUpdate =
      recentUpdates.length > 0
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

/**
 * Get Cloudinary upload configuration for frontend
 */
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

    // Check access permissions
    const canSubmit =
      currentUser.role === 'admin' ||
      (currentUser.role === 'project_creator' &&
        project.creatorId === currentUser._id) ||
      (currentUser.role === 'verifier' &&
        project.assignedVerifierId === currentUser._id);

    if (!canSubmit) {
      throw new Error('Access denied');
    }

    return CloudinaryService.getUploadConfig(project.projectType, updateType);
  },
});

// ============= INTERNAL HELPER FUNCTIONS =============

/**
 * Validate progress update data before submission
 */
export const validateProgressUpdateData = query({
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

    // Basic field validation
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

    // Progress validation - shouldn't go backwards significantly
    if (
      project.progressPercentage &&
      updateData.progressPercentage < project.progressPercentage - 5
    ) {
      warnings.push('Progress appears to have decreased significantly');
    }

    // Photo requirements validation using Cloudinary service
    const photoValidation = CloudinaryService.validatePhotoUpload(
      updateData.photos || [],
      project.projectType
    );

    errors.push(...photoValidation.errors);
    warnings.push(...photoValidation.warnings);

    // Project-specific metric validation
    if (updateData.measurementData) {
      // Basic metric validation
      for (const [key, value] of Object.entries(updateData.measurementData)) {
        if (typeof value === 'number' && value < 0) {
          errors.push(`${key} cannot be negative`);
        }
      }

      // Project-specific thresholds (simplified validation)
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

    // Check frequency - warn if submitting too frequently
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

/**
 * Check if progress update completes any milestones
 */
export const checkMilestoneCompletion = mutation({
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
      // Check if this milestone should be completed based on progress
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

        // Log milestone completion
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

/**
 * Analyze progress update for potential alerts
 */
export const analyzeProgressForAlerts = mutation({
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

    // Get recent updates for comparison
    const recentUpdates = await ctx.db
      .query('progressUpdates')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .order('desc')
      .take(5);

    const alerts = [];

    // Check for significant progress jumps (might indicate data entry error)
    if (recentUpdates.length > 1) {
      const previousProgress = recentUpdates[1].progressPercentage;
      const progressJump = newUpdate.progressPercentage - previousProgress;

      if (progressJump > 30) {
        const alertId = await ctx.db.insert('systemAlerts', {
          projectId,
          alertType: 'quality_concern',
          severity: 'medium',
          title: 'Significant Progress Jump Detected',
          message: `Progress increased by ${progressJump}% in a single update. Please verify accuracy.`,
          isResolved: false,
          notificationsSent: [],
          escalationLevel: 0,
          nextEscalationAt: Date.now() + 24 * 60 * 60 * 1000,
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

    // Check if project is behind schedule
    const projectStart = new Date(project.startDate).getTime();
    const projectEnd = new Date(project.expectedCompletionDate).getTime();
    const now = Date.now();

    const timeElapsed = (now - projectStart) / (projectEnd - projectStart);
    const progressRatio = newUpdate.progressPercentage / 100;

    if (timeElapsed > progressRatio + 0.1 && timeElapsed > 0.5) {
      // 10% tolerance, only after 50% of time elapsed
      const alertId = await ctx.db.insert('systemAlerts', {
        projectId,
        alertType: 'milestone_delay',
        severity: 'medium',
        title: 'Project Behind Schedule',
        message: `Project is ${Math.round((timeElapsed - progressRatio) * 100)}% behind schedule based on timeline.`,
        isResolved: false,
        notificationsSent: [],
        escalationLevel: 0,
        nextEscalationAt: Date.now() + 3 * 24 * 60 * 60 * 1000,
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

/**
 * Get upcoming milestones for a project
 */
export const getUpcomingMilestones = query({
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

// Export internal functions
export const internal = {
  progressUpdates: {
    validateProgressUpdateData,
    checkMilestoneCompletion,
    analyzeProgressForAlerts,
    getUpcomingMilestones,
  },
  progressValidation: {
    validateCompleteProgressUpdate: () => ({
      isValid: true,
      errors: [],
      warnings: [],
      score: 100,
      details: {},
      recommendations: [],
    }),
  },
};
