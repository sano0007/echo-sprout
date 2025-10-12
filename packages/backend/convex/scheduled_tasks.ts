import type {MutationCtx} from './_generated/server';
import {internalMutation} from './_generated/server';
import {NotificationService} from '../services/notification-service';

/**
 * Run daily to create monthly report requests for projects
 * that haven't had a progress update in 30+ days
 */
export const createMonthlyReportRequests: any = internalMutation({
  handler: async (ctx: MutationCtx): Promise<{ processed: number }> => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const sevenDaysFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;

    // Get all approved/active projects
    const projects = await ctx.db
      .query('projects')
      .filter((q) => q.eq(q.field('status'), 'approved'))
      .collect();

    for (const project of projects) {
      // Check if project has a recent progress update
      const recentUpdates = await ctx.db
        .query('progressUpdates')
        .withIndex('by_project', (q) => q.eq('projectId', project._id))
        .order('desc')
        .take(1);

      const lastUpdate = recentUpdates[0];
      const lastUpdateTime = lastUpdate?.submittedAt || project._creationTime;

      // If no update in 30 days, check if there's already a pending request
      if (lastUpdateTime < thirtyDaysAgo) {
        const existingRequests = await ctx.db
          .query('progressReportRequests')
          .withIndex('by_project_status', (q) =>
            q.eq('projectId', project._id).eq('status', 'pending')
          )
          .collect();

        // Only create a request if there isn't already one pending
        if (existingRequests.length === 0) {
          // Create a system user ID (you may need to adjust this based on your setup)
          // For now, we'll use the first admin user as the requester
          const adminUsers = await ctx.db
            .query('users')
            .filter((q) => q.eq(q.field('role'), 'admin'))
            .take(1);

          const adminUser = adminUsers[0];
          if (adminUser) {
            const requestId = await ctx.db.insert('progressReportRequests', {
              projectId: project._id,
              requestedBy: adminUser._id,
              creatorId: project.creatorId,
              requestType: 'scheduled_monthly',
              status: 'pending',
              dueDate: sevenDaysFromNow,
              requestNotes: 'Automated monthly progress report request',
              createdAt: Date.now(),
            });

            // Notify the creator
            await NotificationService.notifyProgressReportRequested(
              ctx,
              project.creatorId,
              project.title,
              sevenDaysFromNow,
              'Automated monthly progress report request',
              'System'
            );
          }
        }
      }
    }

    return { processed: projects.length };
  },
});

/**
 * Run daily to create milestone-based report requests
 * for projects approaching or past milestone dates
 */
export const createMilestoneReportRequests: any = internalMutation({
  handler: async (ctx: MutationCtx): Promise<{ processed: number }> => {
    const now = Date.now();
    const threeDaysFromNow = now + 3 * 24 * 60 * 60 * 1000;
    const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;

    // Get all approved/active projects
    const projects = await ctx.db
      .query('projects')
      .filter((q) => q.eq(q.field('status'), 'approved'))
      .collect();

    for (const project of projects) {
      // Check milestone dates
      const milestones = [];
      if (project.milestone1?.date) {
        milestones.push({
          name: project.milestone1.name,
          date: project.milestone1.date,
        });
      }
      if (project.milestone2?.date) {
        milestones.push({
          name: project.milestone2.name,
          date: project.milestone2.date,
        });
      }

      for (const milestone of milestones) {
        const milestoneDate = new Date(milestone.date).getTime();

        // Check if milestone is within 3 days or past due
        if (milestoneDate <= threeDaysFromNow) {
          // Check if there's already a pending request for this milestone
          const existingRequests = await ctx.db
            .query('progressReportRequests')
            .withIndex('by_project_status', (q) =>
              q.eq('projectId', project._id).eq('status', 'pending')
            )
            .collect();

          // Check if any existing request mentions this milestone
          const hasMilestoneRequest = existingRequests.some(
            (req) =>
              req.requestType === 'milestone_based' &&
              req.requestNotes?.includes(milestone.name)
          );

          if (!hasMilestoneRequest) {
            // Get first admin user
            const adminUsers = await ctx.db
              .query('users')
              .filter((q) => q.eq(q.field('role'), 'admin'))
              .take(1);

            const adminUser = adminUsers[0];
            if (adminUser) {
              const requestId = await ctx.db.insert('progressReportRequests', {
                projectId: project._id,
                requestedBy: adminUser._id,
                creatorId: project.creatorId,
                requestType: 'milestone_based',
                status: 'pending',
                dueDate: sevenDaysFromNow,
                requestNotes: `Progress report requested for milestone: ${milestone.name} (due ${new Date(milestoneDate).toLocaleDateString()})`,
                createdAt: Date.now(),
              });

              // Notify the creator
              await NotificationService.notifyProgressReportRequested(
                ctx,
                project.creatorId,
                project.title,
                sevenDaysFromNow,
                `Progress report requested for milestone: ${milestone.name}`,
                'System'
              );
            }
          }
        }
      }
    }

    return { processed: projects.length };
  },
});

/**
 * Run daily to mark overdue progress report requests
 */
export const markOverdueReportRequests: any = internalMutation({
  handler: async (ctx: MutationCtx): Promise<{ markedOverdue: number }> => {
    const now = Date.now();

    // Get all pending requests
    const pendingRequests = await ctx.db
      .query('progressReportRequests')
      .withIndex('by_status', (q) => q.eq('status', 'pending'))
      .collect();

    let markedOverdue = 0;

    for (const request of pendingRequests) {
      if (request.dueDate < now) {
        // Mark as overdue
        await ctx.db.patch(request._id, {
          status: 'overdue',
        });

        // Notify creator
        const project = await ctx.db.get(request.projectId);
        if (project) {
          await NotificationService.notifyProgressReportOverdue(
            ctx,
            request.creatorId,
            project.title,
            request._id
          );
        }

        markedOverdue++;
      }
    }

    return { markedOverdue };
  },
});
