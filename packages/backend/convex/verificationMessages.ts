import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { VerificationMessagesService } from '../services/verification-messages-service';
import { UserService } from '../services/user-service';
import { paginationOptsValidator } from 'convex/server';

// Send a verification message
export const sendMessage = mutation({
  args: {
    verificationId: v.id('verifications'),
    recipientId: v.id('users'),
    subject: v.string(),
    message: v.string(),
    priority: v.optional(
      v.union(
        v.literal('low'),
        v.literal('normal'),
        v.literal('high'),
        v.literal('urgent')
      )
    ),
    attachments: v.optional(v.array(v.string())),
    threadId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    // Verify user has access to this verification
    const verification = await ctx.db.get(args.verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    // Get the project to check permissions
    const project = await ctx.db.get(verification.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user is involved in this verification (verifier, project creator, or admin)
    const hasAccess =
      currentUser.role === 'admin' ||
      verification.verifierId === currentUser._id ||
      project.creatorId === currentUser._id;

    if (!hasAccess) {
      throw new Error(
        'Unauthorized: You can only send messages for verifications you are involved in'
      );
    }

    return await VerificationMessagesService.sendMessage(ctx, {
      ...args,
      senderId: currentUser._id,
    });
  },
});

// Reply to a message
export const replyToMessage = mutation({
  args: {
    originalMessageId: v.id('verificationMessages'),
    message: v.string(),
    priority: v.optional(
      v.union(
        v.literal('low'),
        v.literal('normal'),
        v.literal('high'),
        v.literal('urgent')
      )
    ),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    // Verify the original message exists and user has access
    const originalMessage = await ctx.db.get(args.originalMessageId);
    if (!originalMessage) {
      throw new Error('Original message not found');
    }

    // Check if user is sender or recipient of original message
    if (
      originalMessage.senderId !== currentUser._id &&
      originalMessage.recipientId !== currentUser._id
    ) {
      throw new Error(
        'Unauthorized: You can only reply to messages you are involved in'
      );
    }

    return await VerificationMessagesService.replyToMessage(
      ctx,
      args.originalMessageId,
      {
        senderId: currentUser._id,
        message: args.message,
        priority: args.priority,
        attachments: args.attachments,
      }
    );
  },
});

// Get messages for a verification
export const getMessagesByVerification = query({
  args: { verificationId: v.id('verifications') },
  handler: async (ctx, { verificationId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    // Verify user has access to this verification
    const verification = await ctx.db.get(verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    const project = await ctx.db.get(verification.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check permissions
    const hasAccess =
      currentUser.role === 'admin' ||
      verification.verifierId === currentUser._id ||
      project.creatorId === currentUser._id;

    if (!hasAccess) {
      throw new Error('Unauthorized');
    }

    return await VerificationMessagesService.getMessagesByVerification(
      ctx,
      verificationId
    );
  },
});

// Get messages by thread
export const getMessagesByThread = query({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    const messages = await VerificationMessagesService.getMessagesByThread(
      ctx,
      threadId
    );

    // Verify user has access to at least one message in the thread
    const hasAccess = messages.some(
      (m) =>
        m.senderId === currentUser._id ||
        m.recipientId === currentUser._id ||
        currentUser.role === 'admin'
    );

    if (!hasAccess) {
      throw new Error('Unauthorized');
    }

    return messages;
  },
});

// Get messages for current user
export const getMyMessages = query({
  args: {
    type: v.optional(
      v.union(v.literal('sent'), v.literal('received'), v.literal('all'))
    ),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { type = 'all', paginationOpts }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    const allMessages = await VerificationMessagesService.getMessagesForUser(
      ctx,
      currentUser._id,
      type
    );

    // Manual pagination
    const startIndex =
      paginationOpts.numItems *
      (paginationOpts.cursor ? parseInt(paginationOpts.cursor) : 0);
    const endIndex = startIndex + paginationOpts.numItems;
    const paginatedResults = allMessages.slice(startIndex, endIndex);

    return {
      page: paginatedResults,
      isDone: endIndex >= allMessages.length,
      continueCursor:
        endIndex < allMessages.length ? endIndex.toString() : undefined,
    };
  },
});

// Get unread messages
export const getUnreadMessages = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    return await VerificationMessagesService.getUnreadMessages(
      ctx,
      currentUser._id
    );
  },
});

// Mark message as read
export const markMessageAsRead = mutation({
  args: { messageId: v.id('verificationMessages') },
  handler: async (ctx, { messageId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    return await VerificationMessagesService.markMessageAsRead(
      ctx,
      messageId,
      currentUser._id
    );
  },
});

// Mark thread as read
export const markThreadAsRead = mutation({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    return await VerificationMessagesService.markThreadAsRead(
      ctx,
      threadId,
      currentUser._id
    );
  },
});

// Get verification threads
export const getVerificationThreads = query({
  args: { verificationId: v.id('verifications') },
  handler: async (ctx, { verificationId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    // Verify user has access to this verification
    const verification = await ctx.db.get(verificationId);
    if (!verification) {
      throw new Error('Verification not found');
    }

    const project = await ctx.db.get(verification.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Check permissions
    const hasAccess =
      currentUser.role === 'admin' ||
      verification.verifierId === currentUser._id ||
      project.creatorId === currentUser._id;

    if (!hasAccess) {
      throw new Error('Unauthorized');
    }

    const threads = await VerificationMessagesService.getVerificationThreads(
      ctx,
      verificationId
    );

    // Resolve participant names
    const enrichedThreads = await Promise.all(
      threads.map(async (thread) => {
        const participantDetails = await Promise.all(
          thread.participants.map(async (participantId) => {
            const user = await ctx.db.get(participantId as Id<'users'>);
            // Type guard to ensure we have a user object with the expected properties
            const isValidUser =
              user &&
              'firstName' in user &&
              'lastName' in user &&
              'role' in user;
            return {
              id: participantId,
              name: isValidUser
                ? `${user.firstName} ${user.lastName}`
                : 'Unknown User',
              role: isValidUser ? user.role : undefined,
            };
          })
        );

        return {
          ...thread,
          participants: participantDetails,
        };
      })
    );

    return enrichedThreads;
  },
});

// Delete message
export const deleteMessage = mutation({
  args: { messageId: v.id('verificationMessages') },
  handler: async (ctx, { messageId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    return await VerificationMessagesService.deleteMessage(
      ctx,
      messageId,
      currentUser._id
    );
  },
});

// Get message statistics
export const getMessageStats = query({
  args: { userId: v.optional(v.id('users')) },
  handler: async (ctx, { userId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    // If no userId provided, use current user
    const targetUserId = userId || currentUser._id;

    // Check permissions
    if (currentUser.role !== 'admin' && targetUserId !== currentUser._id) {
      throw new Error('Unauthorized: You can only view your own statistics');
    }

    return await VerificationMessagesService.getMessageStats(ctx, targetUserId);
  },
});

// Search messages
export const searchMessages = query({
  args: {
    searchTerm: v.string(),
    verificationId: v.optional(v.id('verifications')),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { searchTerm, verificationId, paginationOpts }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    const allResults = await VerificationMessagesService.searchMessages(
      ctx,
      currentUser._id,
      searchTerm,
      verificationId
    );

    // Manual pagination
    const startIndex =
      paginationOpts.numItems *
      (paginationOpts.cursor ? parseInt(paginationOpts.cursor) : 0);
    const endIndex = startIndex + paginationOpts.numItems;
    const paginatedResults = allResults.slice(startIndex, endIndex);

    return {
      page: paginatedResults,
      isDone: endIndex >= allResults.length,
      continueCursor:
        endIndex < allResults.length ? endIndex.toString() : undefined,
    };
  },
});

// Get user project conversations
export const getUserProjectConversations = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    // Check permissions
    if (currentUser.role !== 'admin' && userId !== currentUser._id) {
      throw new Error('Unauthorized: You can only view your own conversations');
    }

    // Get all verifications where user is involved
    const verifications = await ctx.db
      .query('verifications')
      .filter((q) => q.eq(q.field('verifierId'), userId))
      .collect();

    // Get project conversations for each verification
    const conversations = [];
    for (const verification of verifications) {
      const project = await ctx.db.get(verification.projectId);
      if (!project) continue;

      const messages = await ctx.db
        .query('verificationMessages')
        .withIndex('by_verification', (q) =>
          q.eq('verificationId', verification._id)
        )
        .order('desc')
        .collect();

      const unreadCount = messages.filter(
        (m) => m.recipientId === userId && !m.isRead
      ).length;

      conversations.push({
        projectId: project._id,
        projectTitle: project.title,
        verificationId: verification._id,
        messageCount: messages.length,
        unreadCount,
        lastMessage: messages[0] || null,
        lastActivity: messages[0]?._creationTime || verification._creationTime,
      });
    }

    return conversations.sort((a, b) => b.lastActivity - a.lastActivity);
  },
});

// Mark notification as read
export const markNotificationAsRead = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, { notificationId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    const notification = await ctx.db.get(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.recipientId !== currentUser._id) {
      throw new Error(
        'Unauthorized: You can only mark your own notifications as read'
      );
    }

    return await ctx.db.patch(notificationId, { isRead: true });
  },
});

// Mark all notifications as read
export const markAllNotificationsAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    const notifications = await ctx.db
      .query('notifications')
      .withIndex('by_recipient', (q) => q.eq('recipientId', currentUser._id))
      .filter((q) => q.eq(q.field('isRead'), false))
      .collect();

    const updates = notifications.map((notification) =>
      ctx.db.patch(notification._id, { isRead: true })
    );

    await Promise.all(updates);
    return { markedCount: notifications.length };
  },
});

// Clear notification
export const clearNotification = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, { notificationId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    const notification = await ctx.db.get(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.recipientId !== currentUser._id) {
      throw new Error(
        'Unauthorized: You can only clear your own notifications'
      );
    }

    return await ctx.db.delete(notificationId);
  },
});

// Mark project messages as read
export const markProjectMessagesAsRead = mutation({
  args: {
    projectId: v.id('projects'),
    userId: v.id('users'),
  },
  handler: async (ctx, { projectId, userId }) => {
    const currentUser = await UserService.getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Unauthorized');
    }

    // Check permissions
    if (currentUser.role !== 'admin' && userId !== currentUser._id) {
      throw new Error(
        'Unauthorized: You can only mark your own messages as read'
      );
    }

    // Get all verifications for this project
    const verifications = await ctx.db
      .query('verifications')
      .withIndex('by_project', (q) => q.eq('projectId', projectId))
      .collect();

    // Mark all messages in these verifications as read for this user
    const updates = [];
    for (const verification of verifications) {
      const messages = await ctx.db
        .query('verificationMessages')
        .withIndex('by_verification', (q) =>
          q.eq('verificationId', verification._id)
        )
        .filter((q) =>
          q.and(
            q.eq(q.field('recipientId'), userId),
            q.eq(q.field('isRead'), false)
          )
        )
        .collect();

      updates.push(
        ...messages.map((message) =>
          ctx.db.patch(message._id, { isRead: true })
        )
      );
    }

    await Promise.all(updates);
    return { markedCount: updates.length };
  },
});
