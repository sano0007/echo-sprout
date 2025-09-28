import type { MutationCtx, QueryCtx } from '../convex/_generated/server';
import type { Id } from '../convex/_generated/dataModel';
import { VerificationService } from './verification-service';
import { NotificationService } from './notification-service';
import { api } from '../convex/_generated/api';

export type WorkflowEvent =
  | 'project_submitted'
  | 'verification_assigned'
  | 'verification_started'
  | 'verification_completed'
  | 'project_approved'
  | 'project_rejected'
  | 'revision_requested'
  | 'document_uploaded'
  | 'deadline_approaching'
  | 'deadline_overdue';

export class WorkflowService {
  // Handle project submission workflow
  public static async handleProjectSubmission(
    ctx: MutationCtx,
    projectId: Id<'projects'>
  ) {
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Update project status to submitted
    await ctx.db.patch(projectId, {
      status: 'submitted',
      verificationStatus: 'pending',
    });

    // Trigger automatic verifier assignment if enabled
    await this.triggerVerifierAssignment(ctx, projectId);

    // Log workflow event
    await this.logWorkflowEvent(ctx, {
      projectId,
      event: 'project_submitted',
      description: 'Project submitted for verification',
      triggeredBy: project.creatorId,
    });
  }

  // Handle verification assignment workflow
  public static async handleVerificationAssignment(
    ctx: MutationCtx,
    verificationId: Id<'verifications'>,
    assignedBy: Id<'users'>
  ) {
    const verification = await ctx.db.get(verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    const project = await ctx.db.get(verification.projectId);
    if (!project) {
      console.error(
        `Orphaned verification found during assignment: ${verificationId} references non-existent project: ${verification.projectId}`
      );
      throw new Error(
        'Associated project not found - cannot assign verification'
      );
    }

    // Send notification to verifier
    await NotificationService.notifyVerificationAssigned(
      ctx,
      verificationId,
      verification.verifierId,
      project.title
    );

    // Update verifier workload
    await VerificationService.updateVerifierWorkload(
      ctx,
      verification.verifierId
    );

    // Log workflow event
    await this.logWorkflowEvent(ctx, {
      projectId: verification.projectId,
      verificationId,
      event: 'verification_assigned',
      description: `Verification assigned to verifier`,
      triggeredBy: assignedBy,
    });
  }

  // Handle verification start workflow
  public static async handleVerificationStart(
    ctx: MutationCtx,
    verificationId: Id<'verifications'>,
    verifierId: Id<'users'>
  ) {
    const verification = await ctx.db.get(verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    const project = await ctx.db.get(verification.projectId);
    if (!project) {
      // Log the orphaned verification and mark it as failed
      console.error(
        `Orphaned verification found: ${verificationId} references non-existent project: ${verification.projectId}`
      );

      // Update verification status to indicate the issue
      await ctx.db.patch(verificationId, {
        status: 'rejected',
        verificationNotes:
          'Project no longer exists - verification cannot proceed',
        completedAt: Date.now(),
      });

      throw new Error(
        'Associated project not found - verification has been marked as rejected'
      );
    }

    // Get verifier details
    const verifier = await ctx.db.get(verifierId);
    const verifierName = verifier
      ? `${verifier.firstName} ${verifier.lastName}`
      : 'Verifier';

    // Notify project creator
    await NotificationService.notifyVerificationStarted(
      ctx,
      verificationId,
      project.creatorId,
      verifierName
    );

    // Schedule deadline reminders
    await this.scheduleDeadlineReminders(ctx, verificationId);

    // Log workflow event
    await this.logWorkflowEvent(ctx, {
      projectId: verification.projectId,
      verificationId,
      event: 'verification_started',
      description: 'Verification process started',
      triggeredBy: verifierId,
    });
  }

  // Handle verification completion workflow
  public static async handleVerificationCompletion(
    ctx: MutationCtx,
    verificationId: Id<'verifications'>,
    recommendation: 'approved' | 'rejected' | 'revision_required',
    qualityScore: number,
    completedBy: Id<'users'>
  ) {
    const verification = await ctx.db.get(verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    const project = await ctx.db.get(verification.projectId);
    if (!project) {
      console.error(
        `Orphaned verification found during completion: ${verificationId} references non-existent project: ${verification.projectId}`
      );
      throw new Error(
        'Associated project not found - cannot complete verification'
      );
    }

    // Notify project creator
    await NotificationService.notifyVerificationCompleted(
      ctx,
      verificationId,
      project.creatorId,
      recommendation,
      qualityScore
    );

    // Handle specific workflow based on recommendation
    switch (recommendation) {
      case 'approved':
        await this.handleProjectApproval(
          ctx,
          verification.projectId,
          completedBy
        );
        break;
      case 'rejected':
        await this.handleProjectRejection(
          ctx,
          verification.projectId,
          completedBy
        );
        break;
      case 'revision_required':
        await this.handleRevisionRequest(
          ctx,
          verification.projectId,
          completedBy
        );
        break;
    }

    // Update verifier workload
    await VerificationService.updateVerifierWorkload(
      ctx,
      verification.verifierId
    );

    // Log workflow event
    await this.logWorkflowEvent(ctx, {
      projectId: verification.projectId,
      verificationId,
      event: 'verification_completed',
      description: `Verification completed with recommendation: ${recommendation}`,
      triggeredBy: completedBy,
    });
  }

  // Handle project approval workflow
  private static async handleProjectApproval(
    ctx: MutationCtx,
    projectId: Id<'projects'>,
    approvedBy: Id<'users'>
  ) {
    // Update project status
    await ctx.db.patch(projectId, {
      status: 'approved',
    });

    // TODO: Integration with carbon credit system
    // await this.initiateCardCreditMinting(ctx, projectId);

    // Log workflow event
    await this.logWorkflowEvent(ctx, {
      projectId,
      event: 'project_approved',
      description: 'Project approved and ready for carbon credit minting',
      triggeredBy: approvedBy,
    });
  }

  // Handle project rejection workflow
  private static async handleProjectRejection(
    ctx: MutationCtx,
    projectId: Id<'projects'>,
    rejectedBy: Id<'users'>
  ) {
    // Update project status
    await ctx.db.patch(projectId, {
      status: 'rejected',
    });

    // Log workflow event
    await this.logWorkflowEvent(ctx, {
      projectId,
      event: 'project_rejected',
      description: 'Project rejected',
      triggeredBy: rejectedBy,
    });
  }

  // Handle revision request workflow
  private static async handleRevisionRequest(
    ctx: MutationCtx,
    projectId: Id<'projects'>,
    requestedBy: Id<'users'>
  ) {
    // Update project status
    await ctx.db.patch(projectId, {
      status: 'under_review',
      verificationStatus: 'revision_required',
    });

    // Log workflow event
    await this.logWorkflowEvent(ctx, {
      projectId,
      event: 'revision_requested',
      description: 'Project revision requested',
      triggeredBy: requestedBy,
    });
  }

  // Trigger automatic verifier assignment
  private static async triggerVerifierAssignment(
    ctx: MutationCtx,
    projectId: Id<'projects'>
  ) {
    // This would implement the automated verifier assignment logic
    // For now, we'll just set the project as pending assignment
    await ctx.db.patch(projectId, {
      verificationStatus: 'pending',
    });
  }

  // Schedule deadline reminders
  private static async scheduleDeadlineReminders(
    ctx: MutationCtx,
    verificationId: Id<'verifications'>
  ) {
    const verification = await ctx.db.get(verificationId);
    if (!verification) return;

    const project = await ctx.db.get(verification.projectId);
    if (!project) return;

    const now = Date.now();
    const dueDate = verification.dueDate;
    const oneDayBefore = dueDate - 24 * 60 * 60 * 1000;
    const threeDaysBefore = dueDate - 3 * 24 * 60 * 60 * 1000;

    // Schedule 3-day reminder
    if (threeDaysBefore > now) {
      await ctx.scheduler.runAt(
        threeDaysBefore,
        api.notifications.sendDeadlineReminder,
        {
          verificationId,
          hoursRemaining: 72,
        }
      );
    }

    // Schedule 1-day reminder
    if (oneDayBefore > now) {
      await ctx.scheduler.runAt(
        oneDayBefore,
        api.notifications.sendDeadlineReminder,
        {
          verificationId,
          hoursRemaining: 24,
        }
      );
    }

    // Schedule overdue check
    await ctx.scheduler.runAt(dueDate, api.notifications.checkOverdue, {
      verificationId,
    });
  }

  // Log workflow events for audit trail
  private static async logWorkflowEvent(
    ctx: MutationCtx,
    data: {
      projectId: Id<'projects'>;
      verificationId?: Id<'verifications'>;
      event: WorkflowEvent;
      description: string;
      triggeredBy: Id<'users'>;
      metadata?: Record<string, any>;
    }
  ) {
    const auditLogData = {
      entityType: 'workflow' as const,
      entityId: data.projectId,
      action: data.event,
      userId: data.triggeredBy,
      metadata: {
        description: data.description,
        verificationId: data.verificationId,
        event: data.event,
        ...data.metadata,
      },
    };

    return await ctx.db.insert('auditLogs', auditLogData);
  }

  // Handle deadline reminder workflow
  public static async handleDeadlineReminder(
    ctx: MutationCtx,
    verificationId: Id<'verifications'>,
    hoursRemaining: number
  ) {
    const verification = await ctx.db.get(verificationId);
    if (!verification) return;

    // Only send reminder if verification is still active
    if (!['assigned', 'in_progress'].includes(verification.status)) {
      return;
    }

    const project = await ctx.db.get(verification.projectId);
    if (!project) return;

    // Send deadline reminder notification
    await NotificationService.notifyDeadlineApproaching(
      ctx,
      verificationId,
      verification.verifierId,
      hoursRemaining,
      project.title
    );

    // Log workflow event
    await this.logWorkflowEvent(ctx, {
      projectId: verification.projectId,
      verificationId,
      event: 'deadline_approaching',
      description: `Deadline reminder sent (${hoursRemaining} hours remaining)`,
      triggeredBy: verification.verifierId, // System-triggered
      metadata: { hoursRemaining },
    });
  }

  // Handle overdue verification workflow
  public static async handleOverdueVerification(
    ctx: MutationCtx,
    verificationId: Id<'verifications'>
  ) {
    const verification = await ctx.db.get(verificationId);
    if (!verification) return;

    // Only handle if verification is still active
    if (!['assigned', 'in_progress'].includes(verification.status)) {
      return;
    }

    const project = await ctx.db.get(verification.projectId);
    if (!project) return;

    // Send overdue notification
    await NotificationService.notifyDeadlineOverdue(
      ctx,
      verificationId,
      verification.verifierId,
      project.title
    );

    // Note: Verification is now overdue (tracked via workflow events)

    // Log workflow event
    await this.logWorkflowEvent(ctx, {
      projectId: verification.projectId,
      verificationId,
      event: 'deadline_overdue',
      description: 'Verification deadline has passed',
      triggeredBy: verification.verifierId, // System-triggered
    });
  }

  // Get workflow history for a project
  public static async getProjectWorkflowHistory(
    ctx: QueryCtx,
    projectId: Id<'projects'>
  ) {
    return await ctx.db
      .query('auditLogs')
      .filter((q) =>
        q.and(
          q.eq(q.field('entityType'), 'workflow'),
          q.eq(q.field('entityId'), projectId)
        )
      )
      .order('desc')
      .collect();
  }

  // Get workflow statistics
  public static async getWorkflowStats(
    ctx: QueryCtx,
    timeframe: 'day' | 'week' | 'month' = 'month'
  ) {
    const now = Date.now();
    const timeframes = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    };

    const cutoffTime = now - timeframes[timeframe];

    const events = await ctx.db
      .query('auditLogs')
      .filter((q) =>
        q.and(
          q.eq(q.field('entityType'), 'workflow'),
          q.gte(q.field('_creationTime'), cutoffTime)
        )
      )
      .collect();

    const stats = {
      totalEvents: events.length,
      byEvent: events.reduce(
        (acc, event) => {
          acc[event.action] = (acc[event.action] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      projectsSubmitted: events.filter((e) => e.action === 'project_submitted')
        .length,
      verificationsCompleted: events.filter(
        (e) => e.action === 'verification_completed'
      ).length,
      projectsApproved: events.filter((e) => e.action === 'project_approved')
        .length,
      projectsRejected: events.filter((e) => e.action === 'project_rejected')
        .length,
      revisionsRequested: events.filter(
        (e) => e.action === 'revision_requested'
      ).length,
      overdueVerifications: events.filter(
        (e) => e.action === 'deadline_overdue'
      ).length,
    };

    return stats;
  }
}
