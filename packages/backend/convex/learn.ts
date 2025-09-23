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

export const getBlog = query({
  args: { id: v.string() },
  async handler(ctx, { id }) {
    const normalized = await ctx.db.normalizeId('educationalContent', id);
    if (!normalized) return null;
    const d = await ctx.db.get(normalized);
    if (!d) return null;

    const author = await ctx.db.get(d.authorId);
    const current = await UserService.getCurrentUser(ctx);
    const fullName = author
      ? `${author.firstName ?? ''} ${author.lastName ?? ''}`.trim() || author.email
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
      isOwner: !!(current && current._id === d.authorId) || false,
    };
  },
});

export const updateBlog = mutation({
  args: {
    id: v.string(),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    readTime: v.optional(v.string()),
    publish: v.optional(v.boolean()),
  },
  async handler(ctx, { id, title, content, tags, readTime, publish }) {
    const normalized = await ctx.db.normalizeId('educationalContent', id);
    if (!normalized) throw new Error('Invalid article id');
    const doc = await ctx.db.get(normalized);
    if (!doc) throw new Error('Article not found');
    const user = await UserService.getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');
    const isOwner = user._id === doc.authorId;
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) throw new Error('Unauthorized');

    const updates: any = { lastUpdatedAt: Date.now() };
    if (typeof title === 'string') updates.title = title;
    if (typeof content === 'string') updates.content = content;
    if (Array.isArray(tags)) updates.tags = tags;
    if (typeof readTime === 'string') {
      const est = parseInt(readTime, 10) || (content ? Math.ceil(content.split(/\s+/).length / 200) : doc.estimatedReadTime) || 5;
      updates.estimatedReadTime = est;
    }
    if (typeof publish === 'boolean') {
      updates.isPublished = publish;
      updates.status = publish ? 'published' : 'draft';
      updates.publishedAt = publish ? Date.now() : undefined;
    }

    await ctx.db.patch(normalized, updates);
  },
});

export const deleteBlog = mutation({
  args: { id: v.string() },
  async handler(ctx, { id }) {
    const normalized = await ctx.db.normalizeId('educationalContent', id);
    if (!normalized) throw new Error('Invalid article id');
    const doc = await ctx.db.get(normalized);
    if (!doc) throw new Error('Article not found');
    const user = await UserService.getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');
    const isOwner = user._id === doc.authorId;
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) throw new Error('Unauthorized');

    await ctx.db.delete(normalized);
  },
});

// ============ LEARNING PATHS ============
export const listLearningPaths = query({
  args: {},
  async handler(ctx) {
    const items = await ctx.db
      .query('learningPaths')
      .withIndex('by_published', (q) => q.eq('isPublished', true))
      .order('desc')
      .collect();

    return items.map((d) => ({
      id: d._id,
      title: d.title,
      description: d.description,
      level: d.level,
      estimatedDuration: d.estimatedDuration,
      moduleCount: d.moduleCount,
    }));
  },
});

export const createLearningPath = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    objectives: v.optional(v.array(v.string())),
    level: v.union(v.literal('beginner'), v.literal('intermediate'), v.literal('advanced')),
    estimatedDuration: v.number(), // minutes
    tags: v.array(v.string()),
    visibility: v.union(v.literal('public'), v.literal('private'), v.literal('unlisted')),
    publish: v.optional(v.boolean()),
    coverImageUrl: v.optional(v.string()),
    lessons: v.optional(
      v.array(
        v.object({
          title: v.string(),
          description: v.optional(v.string()),
          videoUrl: v.optional(v.string()),
          pdfUrls: v.optional(v.array(v.string())),
        })
      )
    ),
  },
  async handler(ctx, args) {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');

    const now = Date.now();
    const isPublished = args.publish ?? false;
    const lessons = args.lessons ?? [];

    const id = await ctx.db.insert('learningPaths', {
      title: args.title,
      description: args.description,
      objectives: args.objectives ?? undefined,
      level: args.level,
      estimatedDuration: args.estimatedDuration,
      tags: args.tags,
      visibility: args.visibility,
      coverImageUrl: args.coverImageUrl ?? undefined,
      createdBy: user._id,
      status: isPublished ? 'published' : 'draft',
      isPublished,
      publishedAt: isPublished ? now : undefined,
      lastUpdatedAt: now,
      moduleCount: lessons.length,
      enrollmentCount: 0,
    } as any);

    return id;
  },
});

export const getLearningPath = query({
  args: { id: v.string() },
  async handler(ctx, { id }) {
    const normalized = await ctx.db.normalizeId('learningPaths', id);
    if (!normalized) return null;
    const d = await ctx.db.get(normalized);
    if (!d) return null;

    const creator = await ctx.db.get(d.createdBy);

    return {
      id: d._id,
      title: d.title,
      description: d.description,
      objectives: d.objectives ?? [],
      level: d.level,
      estimatedDuration: d.estimatedDuration,
      tags: d.tags,
      visibility: d.visibility,
      coverImageUrl: d.coverImageUrl ?? null,
      status: d.status,
      isPublished: d.isPublished,
      publishedAt: d.publishedAt ?? null,
      lastUpdatedAt: d.lastUpdatedAt,
      moduleCount: d.moduleCount,
      enrollmentCount: d.enrollmentCount,
      createdByName: creator ? `${creator.firstName ?? ''} ${creator.lastName ?? ''}`.trim() || creator.email : 'Unknown',
    };
  },
});
