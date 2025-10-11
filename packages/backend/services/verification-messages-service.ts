import type { MutationCtx, QueryCtx } from '../convex/_generated/server';
import type { Id } from '../convex/_generated/dataModel';

export class VerificationMessagesService {
  // Send a verification message
  public static async sendMessage(
    ctx: MutationCtx,
    data: {
      verificationId: Id<'verifications'>;
      senderId: Id<'users'>;
      recipientId: Id<'users'>;
      subject: string;
      message: string;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      attachments?: string[];
      threadId?: string;
    }
  ) {
    const currentTime = Date.now();

    const messageData = {
      verificationId: data.verificationId,
      senderId: data.senderId,
      recipientId: data.recipientId,
      subject: data.subject,
      message: data.message,
      priority: data.priority || ('normal' as const),
      attachments: data.attachments,
      isRead: false,
      threadId: data.threadId || `thread_${data.verificationId}_${currentTime}`,
    };

    return await ctx.db.insert('verificationMessages', messageData);
  }

  // Get messages for a verification
  public static async getMessagesByVerification(
    ctx: QueryCtx,
    verificationId: Id<'verifications'>
  ) {
    return await ctx.db
      .query('verificationMessages')
      .withIndex('by_verification', (q) =>
        q.eq('verificationId', verificationId)
      )
      .order('desc')
      .collect();
  }

  // Get messages by thread ID
  public static async getMessagesByThread(ctx: QueryCtx, threadId: string) {
    return await ctx.db
      .query('verificationMessages')
      .withIndex('by_thread', (q) => q.eq('threadId', threadId))
      .order('asc')
      .collect();
  }

  // Get messages for a specific user (sent or received)
  public static async getMessagesForUser(
    ctx: QueryCtx,
    userId: Id<'users'>,
    type: 'sent' | 'received' | 'all' = 'all'
  ) {
    let messages: any[] = [];

    if (type === 'sent' || type === 'all') {
      const sentMessages = await ctx.db
        .query('verificationMessages')
        .withIndex('by_sender', (q) => q.eq('senderId', userId))
        .order('desc')
        .collect();
      messages.push(
        ...sentMessages.map((m) => ({ ...m, messageType: 'sent' }))
      );
    }

    if (type === 'received' || type === 'all') {
      const receivedMessages = await ctx.db
        .query('verificationMessages')
        .withIndex('by_recipient', (q) => q.eq('recipientId', userId))
        .order('desc')
        .collect();
      messages.push(
        ...receivedMessages.map((m) => ({ ...m, messageType: 'received' }))
      );
    }

    // Sort by creation time descending
    return messages.sort(
      (a, b) => (b._creationTime || 0) - (a._creationTime || 0)
    );
  }

  // Get unread messages for a user
  public static async getUnreadMessages(ctx: QueryCtx, userId: Id<'users'>) {
    return await ctx.db
      .query('verificationMessages')
      .withIndex('by_unread', (q) =>
        q.eq('recipientId', userId).eq('isRead', false)
      )
      .order('desc')
      .collect();
  }

  // Mark message as read
  public static async markMessageAsRead(
    ctx: MutationCtx,
    messageId: Id<'verificationMessages'>,
    userId: Id<'users'>
  ) {
    const message = await ctx.db.get(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    if (message.recipientId !== userId) {
      throw new Error(
        'Unauthorized: You can only mark your own messages as read'
      );
    }

    if (message.isRead) {
      return message; // Already read
    }

    return await ctx.db.patch(messageId, {
      isRead: true,
      readAt: Date.now(),
    });
  }

  // Mark all messages in a thread as read
  public static async markThreadAsRead(
    ctx: MutationCtx,
    threadId: string,
    userId: Id<'users'>
  ) {
    const messages = await ctx.db
      .query('verificationMessages')
      .withIndex('by_thread', (q) => q.eq('threadId', threadId))
      .filter((q) => q.eq(q.field('recipientId'), userId))
      .filter((q) => q.eq(q.field('isRead'), false))
      .collect();

    const currentTime = Date.now();
    const updates: Promise<any>[] = [];

    for (const message of messages) {
      updates.push(
        ctx.db.patch(message._id, {
          isRead: true,
          readAt: currentTime,
        })
      );
    }

    await Promise.all(updates);
    return messages.length;
  }

  // Get message threads for a verification
  public static async getVerificationThreads(
    ctx: QueryCtx,
    verificationId: Id<'verifications'>
  ) {
    const messages = await ctx.db
      .query('verificationMessages')
      .withIndex('by_verification', (q) =>
        q.eq('verificationId', verificationId)
      )
      .collect();

    // Group messages by thread
    const threadMap = new Map<string, any[]>();

    for (const message of messages) {
      if (!threadMap.has(message.threadId || 'default')) {
        threadMap.set(message.threadId || 'default', []);
      }
      threadMap.get(message.threadId || 'default')!.push(message);
    }

    // Convert to thread summaries
    const threads = Array.from(threadMap.entries()).map(
      ([threadId, threadMessages]) => {
        const sortedMessages = threadMessages.sort(
          (a, b) => (a._creationTime || 0) - (b._creationTime || 0)
        );
        const lastMessage = sortedMessages[sortedMessages.length - 1];
        const unreadCount = threadMessages.filter((m) => !m.isRead).length;

        return {
          threadId,
          subject: sortedMessages[0].subject,
          lastMessage: {
            message: lastMessage.message,
            senderName: lastMessage.senderId, // Will need to resolve this to actual name
            timestamp: lastMessage._creationTime,
          },
          messageCount: threadMessages.length,
          unreadCount,
          participants: [
            ...new Set([
              ...threadMessages.map((m) => m.senderId),
              ...threadMessages.map((m) => m.recipientId),
            ]),
          ],
        };
      }
    );

    // Sort by last message time
    return threads.sort(
      (a, b) => (b.lastMessage.timestamp || 0) - (a.lastMessage.timestamp || 0)
    );
  }

  // Reply to a message (continues thread)
  public static async replyToMessage(
    ctx: MutationCtx,
    originalMessageId: Id<'verificationMessages'>,
    data: {
      senderId: Id<'users'>;
      message: string;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      attachments?: string[];
    }
  ) {
    const originalMessage = await ctx.db.get(originalMessageId);
    if (!originalMessage) {
      throw new Error('Original message not found');
    }

    // Create reply with same thread ID and verification
    return await this.sendMessage(ctx, {
      verificationId: originalMessage.verificationId,
      senderId: data.senderId,
      recipientId:
        originalMessage.senderId === data.senderId
          ? originalMessage.recipientId
          : originalMessage.senderId,
      subject: originalMessage.subject.startsWith('Re:')
        ? originalMessage.subject
        : `Re: ${originalMessage.subject}`,
      message: data.message,
      priority: data.priority,
      attachments: data.attachments,
      threadId: originalMessage.threadId,
    });
  }

  // Delete a message (soft delete by marking as deleted)
  public static async deleteMessage(
    ctx: MutationCtx,
    messageId: Id<'verificationMessages'>,
    userId: Id<'users'>
  ) {
    const message = await ctx.db.get(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    // Only sender can delete their own messages
    if (message.senderId !== userId) {
      throw new Error('Unauthorized: You can only delete your own messages');
    }

    // Note: In the current schema, we don't have a 'deleted' field
    // For now, we'll update the message content to indicate deletion
    return await ctx.db.patch(messageId, {
      message: '[Message deleted]',
      attachments: [],
    });
  }

  // Get message statistics for a user
  public static async getMessageStats(ctx: QueryCtx, userId: Id<'users'>) {
    const [sentMessages, receivedMessages, unreadMessages] = await Promise.all([
      ctx.db
        .query('verificationMessages')
        .withIndex('by_sender', (q) => q.eq('senderId', userId))
        .collect(),
      ctx.db
        .query('verificationMessages')
        .withIndex('by_recipient', (q) => q.eq('recipientId', userId))
        .collect(),
      ctx.db
        .query('verificationMessages')
        .withIndex('by_unread', (q) =>
          q.eq('recipientId', userId).eq('isRead', false)
        )
        .collect(),
    ]);

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    return {
      totalSent: sentMessages.length,
      totalReceived: receivedMessages.length,
      totalUnread: unreadMessages.length,
      sentThisMonth: sentMessages.filter(
        (m) => (m._creationTime || 0) >= thirtyDaysAgo
      ).length,
      receivedThisMonth: receivedMessages.filter(
        (m) => (m._creationTime || 0) >= thirtyDaysAgo
      ).length,
      averageResponseTime: 0, // TODO: Calculate based on thread message timestamps
    };
  }

  // Search messages by content or subject
  public static async searchMessages(
    ctx: QueryCtx,
    userId: Id<'users'>,
    searchTerm: string,
    verificationId?: Id<'verifications'>
  ) {
    // Get all messages for the user
    const userMessages = await this.getMessagesForUser(ctx, userId);

    const searchTermLower = searchTerm.toLowerCase();
    let filteredMessages = userMessages.filter(
      (message) =>
        message.subject.toLowerCase().includes(searchTermLower) ||
        message.message.toLowerCase().includes(searchTermLower)
    );

    // Filter by verification if specified
    if (verificationId) {
      filteredMessages = filteredMessages.filter(
        (message) => message.verificationId === verificationId
      );
    }

    return filteredMessages;
  }
}
