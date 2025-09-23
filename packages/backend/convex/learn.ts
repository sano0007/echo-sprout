import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { UserService } from '../services/user-service';

export const listBlog = query({
  args: {},
  async handler(ctx) {
    const items = await ctx.db
      .query('educationalContent')
      .withIndex('by_type', (q) => q.eq('contentType', 'article'))
      .filter((q) => q.eq(q.field('category'), 'community_blog'))
      .order('desc')
      .collect();

    // Load authors
    const authorIds = items.map((i) => i.authorId);
    const authors = await Promise.all(authorIds.map((id) => ctx.db.get(id)));
    const byId = new Map(authors.filter(Boolean).map((u) => [u!._id, u!]));

    return items.map((d) => {
      const author = byId.get(d.authorId);
      const fullName = author
        ? `${author.firstName ?? ''} ${author.lastName ?? ''}`.trim()
        : 'Unknown';
      const publishedAt = d.publishedAt ?? d._creationTime;
      return {
        id: d._id,
        title: d.title,
        content: d.content,
        tags: d.tags,
        readTime: (d.estimatedReadTime ?? 5) + ' min read',
        authorName: fullName,
        authorAvatarUrl: author?.profileImage ?? null,
        date: new Date(publishedAt).toISOString(),
      };
    });
  },
});

export const createBlog = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    readTime: v.optional(v.string()),
    publish: v.optional(v.boolean()),
  },
  async handler(ctx, { title, content, tags, readTime, publish }) {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');

    const now = Date.now();
    const est = readTime
      ? parseInt(readTime, 10) || Math.ceil(content.split(/\s+/).length / 200)
      : Math.ceil(content.split(/\s+/).length / 200) || 5;

    const isPublished = publish ?? true;

    const id = await ctx.db.insert('educationalContent', {
      title,
      content,
      contentType: 'article',
      category: 'community_blog',
      tags,
      authorId: user._id,
      status: isPublished ? 'published' : 'draft',
      isPublished,
      publishedAt: isPublished ? now : undefined,
      lastUpdatedAt: now,
      estimatedReadTime: est,
      viewCount: 0,
      likeCount: 0,
      shareCount: 0,
      difficultyLevel: 'beginner',
    } as any);

    return id;
  },
});
