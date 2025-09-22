import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const createTopic = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');

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

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
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
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
    if (topic.authorId !== user._id) throw new Error('Forbidden');
    await ctx.db.delete(id);
    return { ok: true };
  },
});

export const listUserTopics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');
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
