import type { MutationCtx, QueryCtx } from '../convex/_generated/server';
import type { Id } from '../convex/_generated/dataModel';

export type NotificationType =
  | 'verification_assigned'
  | 'verification_started'
  | 'verification_completed'
  | 'project_approved'
  | 'project_rejected'
  | 'revision_required'
  | 'message_received'
  | 'deadline_approaching'
  | 'deadline_overdue'
  | 'document_uploaded'
  | 'document_verified'
  | 'quality_score_updated';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export class NotificationService {
  // Create and send a notification
  public static async createNotification(
    ctx: MutationCtx,
    data: {
      recipientId: Id<'users'>;
      type: NotificationType;
      title: string;
      message: string;
      priority?: NotificationPriority;
      relatedEntityId?: string;
      relatedEntityType?: 'project' | 'verification' | 'document' | 'message';
      actionUrl?: string;
      emailNotification?: boolean;
      pushNotification?: boolean;
    }
  ) {
    const currentTime = Date.now();

    const notificationData = {
      recipientId: data.recipientId,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority || ('normal' as const),
      relatedEntityId: data.relatedEntityId,
      relatedEntityType: data.relatedEntityType,
      actionUrl: data.actionUrl,
      isRead: false,
      isEmailSent: false,
      isPushSent: false,
      _creationTime: currentTime,
    };

    const notificationId = await ctx.db.insert(
      'notifications',
      notificationData
    );

    // Schedule email notification if requested
    if (data.emailNotification !== false) {
      await this.scheduleEmailNotification(
        ctx,
        notificationId,
        data.recipientId
      );
    }

    // Schedule push notification if requested
    if (data.pushNotification !== false) {
      await this.schedulePushNotification(
        ctx,
        notificationId,
        data.recipientId
      );
    }

    return notificationId;
  }

  // Get notifications for a user
  public static async getUserNotifications(
    ctx: QueryCtx,
    userId: Id<'users'>,
    options?: {
      limit?: number;
      unreadOnly?: boolean;
      type?: NotificationType;
    }
  ) {
    let query = ctx.db
      .query('notifications')
      .withIndex('by_recipient', (q) => q.eq('recipientId', userId))
      .order('desc');

    const notifications = await query.collect();

    let filteredNotifications = notifications;

    if (options?.unreadOnly) {
      filteredNotifications = filteredNotifications.filter((n) => !n.isRead);
    }

    if (options?.type) {
      filteredNotifications = filteredNotifications.filter(
        (n) => n.type === options.type
      );
    }

    if (options?.limit) {
      filteredNotifications = filteredNotifications.slice(0, options.limit);
    }

    return filteredNotifications;
  }

  // Mark notification as read
  public static async markAsRead(
    ctx: MutationCtx,
    notificationId: Id<'notifications'>,
    userId: Id<'users'>
  ) {
    const notification = await ctx.db.get(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.recipientId !== userId) {
      throw new Error(
        'Unauthorized: You can only mark your own notifications as read'
      );
    }

    return await ctx.db.patch(notificationId, {
      isRead: true,
      readAt: Date.now(),
    });
  }

  // Mark all notifications as read for a user
  public static async markAllAsRead(
    ctx: MutationCtx,
    userId: Id<'users'>,
    type?: NotificationType
  ) {
    const notifications = await this.getUserNotifications(ctx, userId, {
      unreadOnly: true,
      type,
    });

    const currentTime = Date.now();
    const updates: Promise<any>[] = [];

    for (const notification of notifications) {
      updates.push(
        ctx.db.patch(notification._id, {
          isRead: true,
          readAt: currentTime,
        })
      );
    }

    await Promise.all(updates);
    return notifications.length;
  }

  // Delete old notifications
  public static async deleteOldNotifications(
    ctx: MutationCtx,
    olderThanDays: number = 30
  ) {
    const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

    const oldNotifications = await ctx.db
      .query('notifications')
      .filter((q) => q.lt(q.field('_creationTime'), cutoffTime))
      .collect();

    const deletions: Promise<any>[] = [];
    for (const notification of oldNotifications) {
      deletions.push(ctx.db.delete(notification._id));
    }

    await Promise.all(deletions);
    return oldNotifications.length;
  }

  // Get notification statistics
  public static async getNotificationStats(ctx: QueryCtx, userId: Id<'users'>) {
    const allNotifications = await ctx.db
      .query('notifications')
      .withIndex('by_recipient', (q) => q.eq('recipientId', userId))
      .collect();

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    return {
      total: allNotifications.length,
      unread: allNotifications.filter((n) => !n.isRead).length,
      thisMonth: allNotifications.filter(
        (n) => (n._creationTime || 0) >= thirtyDaysAgo
      ).length,
      byType: allNotifications.reduce(
        (acc, notification) => {
          acc[notification.type] = (acc[notification.type] || 0) + 1;
          return acc;
        },
        {} as Record<NotificationType, number>
      ),
      byPriority: allNotifications.reduce(
        (acc, notification) => {
          acc[notification.priority] = (acc[notification.priority] || 0) + 1;
          return acc;
        },
        {} as Record<NotificationPriority, number>
      ),
    };
  }

  // Schedule email notification
  private static async scheduleEmailNotification(
    ctx: MutationCtx,
    notificationId: Id<'notifications'>,
    userId: Id<'users'>
  ) {
    4; // This would integrate with your email service (SendGrid, AWS SES, etc.)
    // For now, we'll just mark it as sent
    await ctx.db.patch(notificationId, {
      isEmailSent: true,
    });
  }

  // Schedule push notification
  private static async schedulePushNotification(
    ctx: MutationCtx,
    notificationId: Id<'notifications'>,
    userId: Id<'users'>
  ) {
    // This would integrate with your push notification service (FCM, APNS, etc.)
    // For now, we'll just mark it as sent
    await ctx.db.patch(notificationId, {
      isPushSent: true,
    });
  }

  // Verification-specific notification helpers
  public static async notifyVerificationAssigned(
    ctx: MutationCtx,
    verificationId: Id<'verifications'>,
    verifierId: Id<'users'>,
    projectName: string
  ) {
    return await this.createNotification(ctx, {
      recipientId: verifierId,
      type: 'verification_assigned',
      title: 'New Verification Assigned',
      message: `You have been assigned to verify the project "${projectName}".`,
      priority: 'normal',
      relatedEntityId: verificationId,
      relatedEntityType: 'verification',
      actionUrl: `/verification/review/${verificationId}`,
      emailNotification: true,
    });
  }

  public static async notifyVerificationStarted(
    ctx: MutationCtx,
    verificationId: Id<'verifications'>,
    projectCreatorId: Id<'users'>,
    verifierName: string
  ) {
    return await this.createNotification(ctx, {
      recipientId: projectCreatorId,
      type: 'verification_started',
      title: 'Verification Started',
      message: `${verifierName} has started verifying your project.`,
      priority: 'normal',
      relatedEntityId: verificationId,
      relatedEntityType: 'verification',
      actionUrl: `/projects/verification/${verificationId}`,
    });
  }

  public static async notifyVerificationCompleted(
    ctx: MutationCtx,
    verificationId: Id<'verifications'>,
    projectCreatorId: Id<'users'>,
    status: 'approved' | 'rejected' | 'revision_required',
    qualityScore: number
  ) {
    const statusMessages = {
      approved: `Your project has been approved with a quality score of ${qualityScore}%.`,
      rejected: 'Your project has been rejected. Please review the feedback.',
      revision_required:
        'Your project requires revisions. Please check the feedback.',
    };

    const priorities: Record<typeof status, NotificationPriority> = {
      approved: 'high',
      rejected: 'high',
      revision_required: 'normal',
    };

    return await this.createNotification(ctx, {
      recipientId: projectCreatorId,
      type: 'verification_completed',
      title: 'Verification Completed',
      message: statusMessages[status],
      priority: priorities[status],
      relatedEntityId: verificationId,
      relatedEntityType: 'verification',
      actionUrl: `/projects/verification/${verificationId}`,
      emailNotification: true,
    });
  }

  public static async notifyDeadlineApproaching(
    ctx: MutationCtx,
    verificationId: Id<'verifications'>,
    verifierId: Id<'users'>,
    hoursRemaining: number,
    projectName: string
  ) {
    return await this.createNotification(ctx, {
      recipientId: verifierId,
      type: 'deadline_approaching',
      title: 'Verification Deadline Approaching',
      message: `The verification for "${projectName}" is due in ${hoursRemaining} hours.`,
      priority: hoursRemaining <= 24 ? 'high' : 'normal',
      relatedEntityId: verificationId,
      relatedEntityType: 'verification',
      actionUrl: `/verification/review/${verificationId}`,
      emailNotification: true,
    });
  }

  public static async notifyDeadlineOverdue(
    ctx: MutationCtx,
    verificationId: Id<'verifications'>,
    verifierId: Id<'users'>,
    projectName: string
  ) {
    return await this.createNotification(ctx, {
      recipientId: verifierId,
      type: 'deadline_overdue',
      title: 'Verification Overdue',
      message: `The verification for "${projectName}" is now overdue.`,
      priority: 'urgent',
      relatedEntityId: verificationId,
      relatedEntityType: 'verification',
      actionUrl: `/verification/review/${verificationId}`,
      emailNotification: true,
    });
  }

  public static async notifyNewMessage(
    ctx: MutationCtx,
    messageId: Id<'verificationMessages'>,
    recipientId: Id<'users'>,
    senderName: string,
    subject: string
  ) {
    return await this.createNotification(ctx, {
      recipientId,
      type: 'message_received',
      title: 'New Message',
      message: `You have a new message from ${senderName}: "${subject}"`,
      priority: 'normal',
      relatedEntityId: messageId,
      relatedEntityType: 'message',
      actionUrl: `/verification/messages/${messageId}`,
    });
  }

  public static async notifyDocumentUploaded(
    ctx: MutationCtx,
    documentId: Id<'documents'>,
    recipientId: Id<'users'>,
    fileName: string,
    uploaderName: string
  ) {
    return await this.createNotification(ctx, {
      recipientId,
      type: 'document_uploaded',
      title: 'New Document Uploaded',
      message: `${uploaderName} uploaded a new document: "${fileName}"`,
      priority: 'normal',
      relatedEntityId: documentId,
      relatedEntityType: 'document',
    });
  }
}
