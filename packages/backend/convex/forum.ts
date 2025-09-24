import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

async function ensureUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');
  const existing = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', identity.subject))
    .unique();
  if (existing) return existing;

  // Auto-provision a minimal user if missing (webhook may not have run yet)
  const fullName = identity.name || '';
  const [firstName, ...rest] = fullName.split(' ').filter(Boolean);
  const lastName = rest.join(' ');
  const email = identity.email || `${identity.subject}@unknown.local`;

  const userId = await ctx.db.insert('users', {
    clerkId: identity.subject,
    email,
    firstName: firstName || 'Unknown',
    lastName: lastName || 'User',
    role: 'credit_buyer',
    phoneNumber: '',
    address: '',
    city: '',
    country: '',
    isVerified: false,
    isActive: true,
    profileImage: identity.pictureUrl || undefined,
  });
  return await ctx.db.get(userId);
}

export const createTopic = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ensureUser(ctx);

    const id = await ctx.db.insert('forumTopics', {
      title: args.title,
      content: args.content,
      category: args.category,
      authorId: user._id,
      isSticky: false,
      viewCount: 0,
      replyCount: 0,
      lastReplyAt: Date.now(),
      lastReplyBy: user._id,
      topicType: 'discussion',
      tags: args.tags,
      upvotes: 0,
      downvotes: 0,
    });
    return { id };
  },
});

export const updateTopic = mutation({
  args: {
    id: v.id('forumTopics'),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { id, ...updates }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const topic = await ctx.db.get(id);
    if (!topic) throw new Error('Topic not found');

    const user =
      (await ctx.db
        .query('users')
        .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
        .unique()) || (await ensureUser(ctx));
    if (topic.authorId !== user._id) throw new Error('Forbidden');

    await ctx.db.patch(id, {
      ...updates,
      lastReplyAt: Date.now(),
      lastReplyBy: user._id,
    });
    return { ok: true };
  },
});

export const deleteTopic = mutation({
  args: { id: v.id('forumTopics') },
  handler: async (ctx, { id }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const topic = await ctx.db.get(id);
    if (!topic) throw new Error('Topic not found');
    const user =
      (await ctx.db
        .query('users')
        .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
        .unique()) || (await ensureUser(ctx));
    if (topic.authorId !== user._id) throw new Error('Forbidden');
    await ctx.db.delete(id);
    return { ok: true };
  },
});

export const listUserTopics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // No signed-in user; return empty list rather than erroring
      return [];
    }
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .unique();
    if (!user) {
      // User record not yet provisioned in Convex (e.g., webhook not run)
      // Return empty list to avoid crashing callers; UI can handle gracefully
      return [];
    }
    const items = await ctx.db
      .query('forumTopics')
      .withIndex('by_author', (q) => q.eq('authorId', user._id))
      .collect();
    return items.map((t) => ({
      id: t._id,
      title: t.title,
      content: t.content,
      category: t.category,
      tags: t.tags,
      lastReplyAt: t.lastReplyAt,
      replies: t.replyCount,
      views: t.viewCount,
    }));
  },
});

export const getTopicById = query({
  args: { id: v.id('forumTopics') },
  handler: async (ctx, { id }) => {
    const topic = await ctx.db.get(id);
    if (!topic) throw new Error('Topic not found');

    const author = await ctx.db.get(topic.authorId);

    const replies = await ctx.db
      .query('forumReplies')
      .withIndex('by_topic', (q) => q.eq('topicId', id))
      .collect();

    // Find current user (if signed in) to include their vote state
    const identity = await ctx.auth.getUserIdentity();
    const currentUser = identity
      ? await ctx.db
          .query('users')
          .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
          .unique()
      : null;

    // Map replies with basic author info
    const replyItems = await Promise.all(
      replies.map(async (r) => {
        const rauthor = await ctx.db.get(r.authorId);
        let userVote: 1 | -1 | 0 = 0;
        if (currentUser) {
          const vote = await ctx.db
            .query('forumReplyVotes')
            .withIndex('by_reply_user', (q) =>
              q.eq('replyId', r._id).eq('userId', currentUser._id)
            )
            .unique();
          if (vote) userVote = vote.value as 1 | -1;
        }
        return {
          id: r._id,
          content: r.content,
          isDeleted: r.isDeleted,
          upvotes: r.upvotes,
          downvotes: r.downvotes,
          userVote,
          author: rauthor
            ? `${rauthor.firstName} ${rauthor.lastName}`
            : 'Unknown',
        };
      })
    );

    return {
      id: topic._id,
      title: topic.title,
      content: topic.content,
      category: topic.category,
      tags: topic.tags,
      replies: topic.replyCount,
      views: topic.viewCount,
      author: author ? `${author.firstName} ${author.lastName}` : 'Unknown',
      replyItems,
    };
  },
});

export const incrementViews = mutation({
  args: { id: v.id('forumTopics') },
  handler: async (ctx, { id }) => {
    const topic = await ctx.db.get(id);
    if (!topic) throw new Error('Topic not found');
    await ctx.db.patch(id, { viewCount: (topic.viewCount || 0) + 1 });
    return { ok: true };
  },
});

export const getTopContributors = query({
  args: {},
  handler: async (ctx) => {
    const topics = await ctx.db.query('forumTopics').collect();
    const counts = new Map<string, number>();
    for (const t of topics) {
      const key = t.authorId.id as unknown as string; // stable string id
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    // Fetch user records and build list
    const entries = Array.from(counts.entries());
    // Sort by post count desc
    entries.sort((a, b) => (b[1] - a[1]));
    const top4 = entries.slice(0, 4);

    const results: { name: string; posts: number }[] = [];
    for (const [authorKey, postCount] of top4) {
      // authorKey is the string form of the Id; reconstruct Id type
      // Convex allows using the original id object, but we only have the string here.
      // We can find by scanning since we have topics collected.
      const anyTopic = topics.find((t) => (t.authorId.id as unknown as string) === authorKey);
      if (!anyTopic) {
        results.push({ name: 'Unknown', posts: postCount });
        continue;
      }
      const user = await ctx.db.get(anyTopic.authorId);
      const name = user ? `${user.firstName} ${user.lastName}` : 'Unknown';
      results.push({ name, posts: postCount });
    }

    return results;
  },
});

export const createReply = mutation({
  args: {
    topicId: v.id('forumTopics'),
    content: v.string(),
  },
  handler: async (ctx, { topicId, content }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');

    const topic = await ctx.db.get(topicId);
    if (!topic) throw new Error('Topic not found');

    const replyId = await ctx.db.insert('forumReplies', {
      topicId,
      authorId: user._id,
      content,
      isDeleted: false,
      upvotes: 0,
      downvotes: 0,
      acceptedBy: undefined,
      acceptedAt: undefined,
    });

    await ctx.db.patch(topicId, {
      replyCount: (topic.replyCount ?? 0) + 1,
      lastReplyAt: Date.now(),
      lastReplyBy: user._id,
    });

    return { id: replyId };
  },
});

export const upvoteReply = mutation({
  args: { id: v.id('forumReplies') },
  handler: async (ctx, { id }) => {
    const user = await ensureUser(ctx);
    const reply = await ctx.db.get(id);
    if (!reply) throw new Error('Reply not found');

    const existing = await ctx.db
      .query('forumReplyVotes')
      .withIndex('by_reply_user', (q) =>
        q.eq('replyId', id).eq('userId', user._id)
      )
      .unique();

    if (!existing) {
      await ctx.db.insert('forumReplyVotes', {
        replyId: id,
        userId: user._id,
        value: 1,
      });
      await ctx.db.patch(id, { upvotes: (reply.upvotes ?? 0) + 1 });
      return { vote: 1 };
    }

    if (existing.value === 1) {
      // Toggle off
      await ctx.db.delete(existing._id);
      await ctx.db.patch(id, {
        upvotes: Math.max(0, (reply.upvotes ?? 0) - 1),
      });
      return { vote: 0 };
    } else {
      // Switch from downvote to upvote
      await ctx.db.patch(existing._id, { value: 1 });
      await ctx.db.patch(id, {
        upvotes: (reply.upvotes ?? 0) + 1,
        downvotes: Math.max(0, (reply.downvotes ?? 0) - 1),
      });
      return { vote: 1 };
    }
  },
});

export const downvoteReply = mutation({
  args: { id: v.id('forumReplies') },
  handler: async (ctx, { id }) => {
    const user = await ensureUser(ctx);
    const reply = await ctx.db.get(id);
    if (!reply) throw new Error('Reply not found');

    const existing = await ctx.db
      .query('forumReplyVotes')
      .withIndex('by_reply_user', (q) =>
        q.eq('replyId', id).eq('userId', user._id)
      )
      .unique();

    if (!existing) {
      await ctx.db.insert('forumReplyVotes', {
        replyId: id,
        userId: user._id,
        value: -1,
      });
      await ctx.db.patch(id, { downvotes: (reply.downvotes ?? 0) + 1 });
      return { vote: -1 };
    }

    if (existing.value === -1) {
      // Toggle off
      await ctx.db.delete(existing._id);
      await ctx.db.patch(id, {
        downvotes: Math.max(0, (reply.downvotes ?? 0) - 1),
      });
      return { vote: 0 };
    } else {
      // Switch from upvote to downvote
      await ctx.db.patch(existing._id, { value: -1 });
      await ctx.db.patch(id, {
        upvotes: Math.max(0, (reply.upvotes ?? 0) - 1),
        downvotes: (reply.downvotes ?? 0) + 1,
      });
      return { vote: -1 };
    }
  },
});
