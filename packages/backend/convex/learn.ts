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

// ============ STEP-BY-STEP GUIDES ============
export const listGuides = query({
  args: {},
  async handler(ctx) {
    const items = await ctx.db
      .query('educationalContent')
      .withIndex('by_type', (q) => q.eq('contentType', 'article'))
      .filter((q) => q.eq(q.field('category'), 'guide'))
      .order('desc')
      .collect();

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

export const createGuide = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    readTime: v.optional(v.string()),
    publish: v.optional(v.boolean()),
    photoUrls: v.optional(v.array(v.string())),
  },
  async handler(ctx, { title, content, tags, readTime, publish, photoUrls }) {
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
      category: 'guide',
      tags,
      images: photoUrls && photoUrls.length ? photoUrls : undefined,
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

export const getGuide = query({
  args: { id: v.string() },
  async handler(ctx, { id }) {
    const normalized = await ctx.db.normalizeId('educationalContent', id);
    if (!normalized) return null;
    const d = await ctx.db.get(normalized);
    if (!d) return null;

    const author = await ctx.db.get(d.authorId);
    const current = await UserService.getCurrentUser(ctx);
    const fullName = author
      ? `${author.firstName ?? ''} ${author.lastName ?? ''}`.trim() ||
        author.email
      : 'Unknown';

    return {
      id: d._id,
      title: d.title,
      content: d.content,
      tags: d.tags,
      images: (d as any).images ?? [],
      authorName: fullName,
      date: new Date(d.publishedAt ?? d._creationTime).toISOString(),
      isOwner: !!(current && current._id === d.authorId) || false,
    };
  },
});

export const updateGuide = mutation({
  args: {
    id: v.string(),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    readTime: v.optional(v.string()),
    publish: v.optional(v.boolean()),
    photoUrls: v.optional(v.array(v.string())),
  },
  async handler(ctx, args) {
    const normalized = await ctx.db.normalizeId('educationalContent', args.id);
    if (!normalized) throw new Error('Invalid guide id');
    const doc = await ctx.db.get(normalized);
    if (!doc) throw new Error('Guide not found');
    const user = await UserService.getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');
    const isOwner = user._id === doc.authorId;
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) throw new Error('Unauthorized');

    const updates: any = { lastUpdatedAt: Date.now() };
    if (typeof args.title === 'string') updates.title = args.title;
    if (typeof args.content === 'string') updates.content = args.content;
    if (Array.isArray(args.tags)) updates.tags = args.tags;
    if (typeof args.readTime === 'string') {
      const est = parseInt(args.readTime, 10) || (doc.estimatedReadTime ?? 5);
      updates.estimatedReadTime = est;
    }
    if (typeof args.publish === 'boolean') {
      updates.isPublished = args.publish;
      updates.status = args.publish ? 'published' : 'draft';
      updates.publishedAt = args.publish ? Date.now() : undefined;
    }
    if (Array.isArray(args.photoUrls)) {
      updates.images = args.photoUrls;
    }

    await ctx.db.patch(normalized, updates);
  },
});

export const deleteGuide = mutation({
  args: { id: v.string() },
  async handler(ctx, { id }) {
    const normalized = await ctx.db.normalizeId('educationalContent', id);
    if (!normalized) throw new Error('Invalid guide id');
    const doc = await ctx.db.get(normalized);
    if (!doc) throw new Error('Guide not found');
    const user = await UserService.getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');
    const isOwner = user._id === doc.authorId;
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) throw new Error('Unauthorized');

    await ctx.db.delete(normalized);
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
      ? `${author.firstName ?? ''} ${author.lastName ?? ''}`.trim() ||
        author.email
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
      const est =
        parseInt(readTime, 10) ||
        (content
          ? Math.ceil(content.split(/\s+/).length / 200)
          : doc.estimatedReadTime) ||
        5;
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
    level: v.union(
      v.literal('beginner'),
      v.literal('intermediate'),
      v.literal('advanced')
    ),
    estimatedDuration: v.number(), // minutes
    tags: v.array(v.string()),
    visibility: v.union(
      v.literal('public'),
      v.literal('private'),
      v.literal('unlisted')
    ),
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

    const pathId = await ctx.db.insert('learningPaths', {
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

    // Persist lessons with stable ordering
    if (lessons.length) {
      await Promise.all(
        lessons.map((L, idx) =>
          ctx.db.insert('learningPathLessons', {
            pathId: pathId,
            title: L.title,
            description: L.description ?? undefined,
            videoUrl: L.videoUrl ?? undefined,
            pdfUrls: Array.isArray(L.pdfUrls) ? L.pdfUrls : [],
            order: idx,
            estimatedDuration: undefined,
            createdBy: user._id,
            lastUpdatedAt: now,
          } as any)
        )
      );
    }

    return pathId;
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
    const current = await UserService.getCurrentUser(ctx);

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
      createdByName: creator
        ? `${creator.firstName ?? ''} ${creator.lastName ?? ''}`.trim() ||
          creator.email
        : 'Unknown',
      isOwner: !!(current && current._id === d.createdBy) || false,
    };
  },
});

export const listLessonsForPath = query({
  args: { pathId: v.string() },
  async handler(ctx, { pathId }) {
    const normalized = await ctx.db.normalizeId('learningPaths', pathId);
    if (!normalized) return [];
    const lessons = await ctx.db
      .query('learningPathLessons')
      .withIndex('by_path_order', (q) => q.eq('pathId', normalized))
      .order('asc')
      .collect();

    return lessons.map((l) => ({
      id: l._id,
      title: l.title,
      description: l.description ?? '',
      videoUrl: l.videoUrl ?? '',
      pdfUrls: l.pdfUrls,
      order: l.order,
    }));
  },
});

// ============ USER PROGRESS: PERSIST CHECKBOXES ============
export const getPathProgress = query({
  args: { pathId: v.string() },
  async handler(ctx, { pathId }) {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) return [];
    const normalizedPath = await ctx.db.normalizeId('learningPaths', pathId);
    if (!normalizedPath) return [];
    const rows = await ctx.db
      .query('learningProgress')
      .withIndex('by_user_path', (q) => q.eq('userId', user._id).eq('pathId', normalizedPath))
      .collect();
    return rows.map((r) => ({
      lessonId: r.lessonId,
      itemType: r.itemType,
      itemIndex: r.itemIndex,
      completed: r.completed,
    }));
  },
});

export const setPathProgress = mutation({
  args: {
    pathId: v.string(),
    lessonId: v.string(),
    itemType: v.union(v.literal('video'), v.literal('pdf')),
    itemIndex: v.optional(v.number()),
    completed: v.boolean(),
  },
  async handler(ctx, { pathId, lessonId, itemType, itemIndex, completed }) {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');

    const normalizedPath = await ctx.db.normalizeId('learningPaths', pathId);
    if (!normalizedPath) throw new Error('Invalid path id');
    const normalizedLesson = await ctx.db.normalizeId('learningPathLessons', lessonId);
    if (!normalizedLesson) throw new Error('Invalid lesson id');

    const idx = typeof itemIndex === 'number' ? itemIndex : 0;

    const existing = await ctx.db
      .query('learningProgress')
      .withIndex('by_unique_key', (q) =>
        q
          .eq('userId', user._id)
          .eq('pathId', normalizedPath)
          .eq('lessonId', normalizedLesson)
          .eq('itemType', itemType)
          .eq('itemIndex', idx)
      )
      .unique();

    if (!existing) {
      await ctx.db.insert('learningProgress', {
        userId: user._id,
        pathId: normalizedPath,
        lessonId: normalizedLesson,
        itemType,
        itemIndex: idx,
        completed,
        completedAt: completed ? Date.now() : undefined,
      } as any);
    } else {
      await ctx.db.patch(existing._id, {
        completed,
        completedAt: completed ? Date.now() : undefined,
      });
    }
  },
});

// Batch progress percent per path for current user
export const progressForPaths = query({
  args: { pathIds: v.array(v.string()) },
  async handler(ctx, { pathIds }) {
    const user = await UserService.getCurrentUser(ctx);
    if (!user || !Array.isArray(pathIds) || pathIds.length === 0) {
      return {} as Record<string, number>;
    }

    const result: Record<string, number> = {};

    for (const pid of pathIds) {
      try {
        const normalizedPath = await ctx.db.normalizeId('learningPaths', pid);
        if (!normalizedPath) {
          result[pid] = 0;
          continue;
        }

        const lessons = await ctx.db
          .query('learningPathLessons')
          .withIndex('by_path_order', (q) => q.eq('pathId', normalizedPath))
          .order('asc')
          .collect();

        // Total items = #videos present + sum of pdfs per lesson
        let total = 0;
        for (const L of lessons) {
          if (L.videoUrl) total += 1;
          total += Array.isArray(L.pdfUrls) ? L.pdfUrls.length : 0;
        }

        if (total === 0) {
          result[pid] = 0;
          continue;
        }

        const rows = await ctx.db
          .query('learningProgress')
          .withIndex('by_user_path', (q) =>
            q.eq('userId', user._id).eq('pathId', normalizedPath)
          )
          .collect();

        // Count only rows that correspond to existing items
        let done = 0;
        const lessonsById = new Map(lessons.map((l) => [String(l._id), l]));
        for (const r of rows) {
          if (!r.completed) continue;
          const lesson = lessonsById.get(String(r.lessonId));
          if (!lesson) continue;
          if (r.itemType === 'video') {
            if (lesson.videoUrl) done += 1;
          } else if (r.itemType === 'pdf') {
            const idx = Number(r.itemIndex ?? 0);
            const arr = Array.isArray(lesson.pdfUrls) ? lesson.pdfUrls : [];
            if (idx >= 0 && idx < arr.length) done += 1;
          }
        }

        const pct = Math.round((done / total) * 100);
        result[pid] = pct;
      } catch {
        result[pid] = 0;
      }
    }

    return result;
  },
});

export const updateLearningPath = mutation({
  args: {
    id: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    objectives: v.optional(v.array(v.string())),
    level: v.optional(
      v.union(
        v.literal('beginner'),
        v.literal('intermediate'),
        v.literal('advanced')
      )
    ),
    estimatedDuration: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    visibility: v.optional(
      v.union(v.literal('public'), v.literal('private'), v.literal('unlisted'))
    ),
    coverImageUrl: v.optional(v.string()),
    publish: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const normalized = await ctx.db.normalizeId('learningPaths', args.id);
    if (!normalized) throw new Error('Invalid path id');
    const doc = await ctx.db.get(normalized);
    if (!doc) throw new Error('Path not found');
    const user = await UserService.getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');
    const isOwner = user._id === doc.createdBy;
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) throw new Error('Unauthorized');

    const updates: any = { lastUpdatedAt: Date.now() };
    if (typeof args.title === 'string') updates.title = args.title;
    if (typeof args.description === 'string')
      updates.description = args.description;
    if (Array.isArray(args.objectives)) updates.objectives = args.objectives;
    if (args.level) updates.level = args.level;
    if (typeof args.estimatedDuration === 'number')
      updates.estimatedDuration = args.estimatedDuration;
    if (Array.isArray(args.tags)) updates.tags = args.tags;
    if (args.visibility) updates.visibility = args.visibility;
    if (typeof args.coverImageUrl === 'string')
      updates.coverImageUrl = args.coverImageUrl || undefined;
    if (typeof args.publish === 'boolean') {
      updates.isPublished = args.publish;
      updates.status = args.publish ? 'published' : 'draft';
      updates.publishedAt = args.publish ? Date.now() : undefined;
    }

    await ctx.db.patch(normalized, updates);
  },
});

export const deleteLearningPath = mutation({
  args: { id: v.string() },
  async handler(ctx, { id }) {
    const normalized = await ctx.db.normalizeId('learningPaths', id);
    if (!normalized) throw new Error('Invalid path id');
    const doc = await ctx.db.get(normalized);
    if (!doc) throw new Error('Path not found');
    const user = await UserService.getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');
    const isOwner = user._id === doc.createdBy;
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) throw new Error('Unauthorized');

    // Delete lessons first (cascade)
    const lessons = await ctx.db
      .query('learningPathLessons')
      .withIndex('by_path', (q) => q.eq('pathId', normalized))
      .collect();
    await Promise.all(lessons.map((l) => ctx.db.delete(l._id)));

    await ctx.db.delete(normalized);
  },
});

export const updateLesson = mutation({
  args: {
    id: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    pdfUrls: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
  },
  async handler(ctx, args) {
    const normalized = await ctx.db.normalizeId('learningPathLessons', args.id);
    if (!normalized) throw new Error('Invalid lesson id');
    const doc = await ctx.db.get(normalized);
    if (!doc) throw new Error('Lesson not found');
    const path = await ctx.db.get(doc.pathId);
    if (!path) throw new Error('Parent path missing');
    const user = await UserService.getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');
    const isOwner = user._id === path.createdBy;
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) throw new Error('Unauthorized');

    const updates: any = { lastUpdatedAt: Date.now() };
    if (typeof args.title === 'string') updates.title = args.title;
    if (typeof args.description === 'string')
      updates.description = args.description || undefined;
    if (typeof args.videoUrl === 'string')
      updates.videoUrl = args.videoUrl || undefined;
    if (Array.isArray(args.pdfUrls)) updates.pdfUrls = args.pdfUrls;
    if (typeof args.order === 'number') updates.order = args.order;

    await ctx.db.patch(normalized, updates);
  },
});

export const deleteLesson = mutation({
  args: { id: v.string() },
  async handler(ctx, { id }) {
    const normalized = await ctx.db.normalizeId('learningPathLessons', id);
    if (!normalized) throw new Error('Invalid lesson id');
    const doc = await ctx.db.get(normalized);
    if (!doc) throw new Error('Lesson not found');
    const path = await ctx.db.get(doc.pathId);
    if (!path) throw new Error('Parent path missing');
    const user = await UserService.getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');
    const isOwner = user._id === path.createdBy;
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) throw new Error('Unauthorized');

    // Delete lesson
    await ctx.db.delete(normalized);

    // Decrement moduleCount and compact order of remaining lessons
    const lessons = await ctx.db
      .query('learningPathLessons')
      .withIndex('by_path_order', (q) => q.eq('pathId', path._id))
      .order('asc')
      .collect();
    await Promise.all(
      lessons.map((l, idx) =>
        l.order !== idx
          ? ctx.db.patch(l._id, { order: idx, lastUpdatedAt: Date.now() })
          : Promise.resolve()
      )
    );
    await ctx.db.patch(path._id, {
      moduleCount: lessons.length,
      lastUpdatedAt: Date.now(),
    });
  },
});

// ============ SIMPLE ANALYTICS: LEARN PATH ENTRY VIEWS ============
export const recordPathsEntry = mutation({
  args: { source: v.optional(v.string()), pathId: v.optional(v.string()) },
  async handler(ctx, { source, pathId }) {
    const user = await UserService.getCurrentUser(ctx);
    // Write a simple event row into analytics table
    await ctx.db.insert('analytics', {
      metric: 'learn_paths_entry',
      value: 1,
      date: Date.now(),
      metadata: {
        ...(source ? { source } : {}),
        ...(user ? { userId: user._id } : {}),
        ...(pathId ? { pathId } : {}),
      } as any,
    } as any);
  },
});

export const totalPathsEntries = query({
  args: {},
  async handler(ctx) {
    const rows = await ctx.db
      .query('analytics')
      .withIndex('by_metric', (q) => q.eq('metric', 'learn_paths_entry'))
      .collect();
    return rows.reduce((sum, r: any) => sum + (r.value ?? 0), 0);
  },
});

// Unique-user engagement metrics
export const recordLearnPageEnter = mutation({
  args: {},
  async handler(ctx) {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) return;
    await ctx.db.insert('analytics', {
      metric: 'learn_page_enter_user',
      value: 1,
      date: Date.now(),
      metadata: { userId: user._id },
    } as any);
  },
});

export const recordCourseStart = mutation({
  args: { pathId: v.optional(v.string()) },
  async handler(ctx, { pathId }) {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) return;
    await ctx.db.insert('analytics', {
      metric: 'learn_course_start_user',
      value: 1,
      date: Date.now(),
      metadata: { userId: user._id, pathId },
    } as any);
  },
});

export const engagementPercent = query({
  args: {},
  async handler(ctx) {
    // Users who viewed any courses
    const entryRows = await ctx.db
      .query('analytics')
      .withIndex('by_metric', (q) => q.eq('metric', 'learn_paths_entry'))
      .collect();
    // Also include course starts as "viewed" in case entries lacked userId in earlier versions
    const startRows = await ctx.db
      .query('analytics')
      .withIndex('by_metric', (q) => q.eq('metric', 'learn_course_start_user'))
      .collect();

    const viewers = new Set<string>();
    for (const r of entryRows as any[]) {
      const key = (r.metadata?.userId?.id as unknown as string) || String(r.metadata?.userId ?? '');
      if (key) viewers.add(key);
    }
    for (const r of startRows as any[]) {
      const key = (r.metadata?.userId?.id as unknown as string) || String(r.metadata?.userId ?? '');
      if (key) viewers.add(key);
    }

    const denom = viewers.size || 0;
    if (denom === 0) return 0;

    // Users who have any completed progress
    const progressRows = await ctx.db
      .query('learningProgress')
      .collect();
    const progressedViewerUsers = new Set<string>();
    for (const r of progressRows as any[]) {
      if (!r.completed) continue;
      const key = (r.userId?.id as unknown as string) || String(r.userId ?? '');
      if (key && viewers.has(key)) progressedViewerUsers.add(key);
    }

    const num = progressedViewerUsers.size || 0;
    const pct = Math.round((num / denom) * 100);
    return pct;
  },
});

// Top courses by views (descending)
export const pathsByViews = query({
  args: {},
  async handler(ctx) {
    const rows = await ctx.db
      .query('analytics')
      .withIndex('by_metric', (q) => q.eq('metric', 'learn_paths_entry'))
      .collect();

    const counts = new Map<string, number>();
    for (const r of rows as any[]) {
      const pid = (r.metadata?.pathId?.id as unknown as string) || String(r.metadata?.pathId ?? '');
      if (!pid) continue;
      counts.set(pid, (counts.get(pid) ?? 0) + (r.value ?? 0));
    }

    const result: { id: string; title: string; views: number }[] = [];
    for (const [pid, views] of counts) {
      const normalized = await ctx.db.normalizeId('learningPaths', pid);
      let title = 'Unknown';
      if (normalized) {
        const doc = await ctx.db.get(normalized);
        if (doc) title = doc.title;
      }
      result.push({ id: pid, title, views });
    }

    result.sort((a, b) => (b.views - a.views) || a.title.localeCompare(b.title));
    return result;
  },
});

// Top courses by engagement (progressed viewers / viewers)
export const pathsByEngagement = query({
  args: {},
  async handler(ctx) {
    // Build viewers per path from analytics
    const [entryRows, startRows] = await Promise.all([
      ctx.db
        .query('analytics')
        .withIndex('by_metric', (q) => q.eq('metric', 'learn_paths_entry'))
        .collect(),
      ctx.db
        .query('analytics')
        .withIndex('by_metric', (q) => q.eq('metric', 'learn_course_start_user'))
        .collect(),
    ]);

    const viewersByPath = new Map<string, Set<string>>();
    const addViewer = (pid: string, uid: string) => {
      if (!pid || !uid) return;
      let set = viewersByPath.get(pid);
      if (!set) {
        set = new Set<string>();
        viewersByPath.set(pid, set);
      }
      set.add(uid);
    };

    for (const r of entryRows as any[]) {
      const pid = (r.metadata?.pathId?.id as unknown as string) || String(r.metadata?.pathId ?? '');
      const uid = (r.metadata?.userId?.id as unknown as string) || String(r.metadata?.userId ?? '');
      if (pid && uid) addViewer(pid, uid);
    }
    for (const r of startRows as any[]) {
      const pid = (r.metadata?.pathId?.id as unknown as string) || String(r.metadata?.pathId ?? '');
      const uid = (r.metadata?.userId?.id as unknown as string) || String(r.metadata?.userId ?? '');
      if (pid && uid) addViewer(pid, uid);
    }

    if (viewersByPath.size === 0) return [] as { id: string; title: string; engagement: number; viewers: number; progressed: number }[];

    // Build progressed users per path from learningProgress
    const progressRows = await ctx.db.query('learningProgress').collect();
    const progressedByPath = new Map<string, Set<string>>();
    for (const r of progressRows as any[]) {
      if (!r.completed) continue;
      const pid = (r.pathId?.id as unknown as string) || String(r.pathId ?? '');
      const uid = (r.userId?.id as unknown as string) || String(r.userId ?? '');
      if (!pid || !uid) continue;
      let set = progressedByPath.get(pid);
      if (!set) {
        set = new Set<string>();
        progressedByPath.set(pid, set);
      }
      set.add(uid);
    }

    const result: { id: string; title: string; engagement: number; viewers: number; progressed: number }[] = [];
    for (const [pid, viewers] of viewersByPath.entries()) {
      const progressedSet = progressedByPath.get(pid) || new Set<string>();
      let progressedCount = 0;
      for (const u of viewers) if (progressedSet.has(u)) progressedCount++;
      const denom = viewers.size || 0;
      const pct = denom === 0 ? 0 : Math.round((progressedCount / denom) * 100);

      // Fetch title
      let title = 'Unknown';
      const normalized = await ctx.db.normalizeId('learningPaths', pid);
      if (normalized) {
        const doc = await ctx.db.get(normalized);
        if (doc) title = doc.title;
      }

      result.push({ id: pid, title, engagement: pct, viewers: denom, progressed: progressedCount });
    }

    result.sort((a, b) => (b.engagement - a.engagement) || (b.viewers - a.viewers) || a.title.localeCompare(b.title));
    return result;
  },
});

// Views of learn paths for the last 30 days (daily counts)
export const viewsLast30Days = query({
  args: {},
  async handler(ctx) {
    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;
    const start = new Date(now - 29 * msPerDay);
    start.setHours(0, 0, 0, 0);

    const rows = await ctx.db
      .query('analytics')
      .withIndex('by_metric', (q) => q.eq('metric', 'learn_paths_entry'))
      .collect();

    const byDay = new Map<string, number>();
    for (const r of rows as any[]) {
      const ts = typeof r.date === 'number' ? r.date : Number(r.date ?? 0);
      if (!ts) continue;
      if (ts < start.getTime()) continue;
      const d = new Date(ts);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      byDay.set(key, (byDay.get(key) ?? 0) + (r.value ?? 0));
    }

    const result: { date: string; value: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(start.getTime() + i * msPerDay);
      const key = d.toISOString().slice(0, 10);
      result.push({ date: key, value: byDay.get(key) ?? 0 });
    }
    return result;
  },
});

// Views of learn paths for a given date range (inclusive), daily bucketed
export const viewsByDateRange = query({
  args: { from: v.string(), to: v.string() },
  async handler(ctx, { from, to }) {
    // Expect YYYY-MM-DD; normalize to UTC midnight bounds
    const fromDate = new Date(from + 'T00:00:00.000Z');
    const toDate = new Date(to + 'T23:59:59.999Z');
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return [] as { date: string; value: number }[];
    if (fromDate.getTime() > toDate.getTime()) return [] as { date: string; value: number }[];

    const rows = await ctx.db
      .query('analytics')
      .withIndex('by_metric', (q) => q.eq('metric', 'learn_paths_entry'))
      .collect();

    const byDay = new Map<string, number>();
    for (const r of rows as any[]) {
      const ts = typeof r.date === 'number' ? r.date : Number(r.date ?? 0);
      if (!ts) continue;
      if (ts < fromDate.getTime() || ts > toDate.getTime()) continue;
      const d = new Date(ts);
      d.setUTCHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      byDay.set(key, (byDay.get(key) ?? 0) + (r.value ?? 0));
    }

    const result: { date: string; value: number }[] = [];
    const msPerDay = 24 * 60 * 60 * 1000;
    const start = new Date(fromDate);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(toDate);
    end.setUTCHours(0, 0, 0, 0);
    for (let t = start.getTime(); t <= end.getTime(); t += msPerDay) {
      const d = new Date(t);
      const key = d.toISOString().slice(0, 10);
      result.push({ date: key, value: byDay.get(key) ?? 0 });
    }
    return result;
  },
});

// Views and engagement by date range (daily)
export const viewsAndEngagementByRange = query({
  args: { from: v.string(), to: v.string() },
  async handler(ctx, { from, to }) {
    const fromDate = new Date(from + 'T00:00:00.000Z');
    const toDate = new Date(to + 'T23:59:59.999Z');
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) return [] as { date: string; views: number; engagement: number }[];
    if (fromDate.getTime() > toDate.getTime()) return [] as { date: string; views: number; engagement: number }[];

    // Views per day from analytics metric
    const analytics = await ctx.db
      .query('analytics')
      .withIndex('by_metric', (q) => q.eq('metric', 'learn_paths_entry'))
      .collect();
    const viewsByDay = new Map<string, number>();
    for (const r of analytics as any[]) {
      const ts = typeof r.date === 'number' ? r.date : Number(r.date ?? 0);
      if (!ts) continue;
      if (ts < fromDate.getTime() || ts > toDate.getTime()) continue;
      const d = new Date(ts);
      d.setUTCHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      viewsByDay.set(key, (viewsByDay.get(key) ?? 0) + (r.value ?? 0));
    }

    // Engagement percent per day: progressed viewers / viewers that day
    // Build viewers that day from analytics (user-level entries)
    const entryRows = await ctx.db
      .query('analytics')
      .withIndex('by_metric', (q) => q.eq('metric', 'learn_paths_entry'))
      .collect();
    const viewersByDay = new Map<string, Set<string>>();
    for (const r of entryRows as any[]) {
      const ts = typeof r.date === 'number' ? r.date : Number(r.date ?? 0);
      if (!ts) continue;
      if (ts < fromDate.getTime() || ts > toDate.getTime()) continue;
      const d = new Date(ts);
      d.setUTCHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      const uid = (r.metadata?.userId?.id as unknown as string) || String(r.metadata?.userId ?? '');
      if (!uid) continue;
      let set = viewersByDay.get(key);
      if (!set) { set = new Set<string>(); viewersByDay.set(key, set); }
      set.add(uid);
    }

    const progressRows = await ctx.db.query('learningProgress').collect();
    const progressedByDay = new Map<string, Set<string>>();
    for (const r of progressRows as any[]) {
      if (!r.completed) continue;
      const ts = typeof r._creationTime === 'number' ? r._creationTime : Number(r._creationTime ?? 0);
      if (!ts) continue;
      if (ts < fromDate.getTime() || ts > toDate.getTime()) continue;
      const d = new Date(ts);
      d.setUTCHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      const uid = (r.userId?.id as unknown as string) || String(r.userId ?? '');
      if (!uid) continue;
      let set = progressedByDay.get(key);
      if (!set) { set = new Set<string>(); progressedByDay.set(key, set); }
      set.add(uid);
    }

    const msPerDay = 24 * 60 * 60 * 1000;
    const start = new Date(fromDate); start.setUTCHours(0,0,0,0);
    const end = new Date(toDate); end.setUTCHours(0,0,0,0);
    const result: { date: string; views: number; engagement: number }[] = [];
    for (let t = start.getTime(); t <= end.getTime(); t += msPerDay) {
      const d = new Date(t);
      const key = d.toISOString().slice(0, 10);
      const views = viewsByDay.get(key) ?? 0;
      const viewers = viewersByDay.get(key)?.size ?? 0;
      const progressed = progressedByDay.get(key)?.size ?? 0;
      const engagement = viewers === 0 ? 0 : Math.round((progressed / viewers) * 100);
      result.push({ date: key, views, engagement });
    }
    return result;
  },
});
