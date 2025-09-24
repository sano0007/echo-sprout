import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { UserService } from '../services/user-service';

// Content performance across educational content
export const contentPerformance = query({
  args: {},
  async handler(ctx) {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');
    const all = await ctx.db.query('educationalContent').collect();

    let totals = {
      total: 0,
      published: 0,
      views: 0,
      likes: 0,
      shares: 0,
    };

    const byCategory = new Map<string, number>();
    const byType = new Map<string, number>();
    const byDifficulty = new Map<string, number>();

    const items = all.map((d) => {
      totals.total += 1;
      if (d.isPublished) totals.published += 1;
      totals.views += d.viewCount ?? 0;
      totals.likes += d.likeCount ?? 0;
      totals.shares += d.shareCount ?? 0;

      byCategory.set(d.category, (byCategory.get(d.category) ?? 0) + 1);
      byType.set(d.contentType, (byType.get(d.contentType) ?? 0) + 1);
      const diff = (d as any).difficultyLevel ?? 'unknown';
      byDifficulty.set(diff, (byDifficulty.get(diff) ?? 0) + 1);

      const views = d.viewCount ?? 0;
      const likes = d.likeCount ?? 0;
      const shares = d.shareCount ?? 0;
      const engagement = views > 0 ? (likes + shares) / Math.max(1, views) : 0;

      return {
        id: d._id,
        title: d.title,
        category: d.category,
        contentType: d.contentType,
        isPublished: d.isPublished,
        viewCount: views,
        likeCount: likes,
        shareCount: shares,
        engagement,
        publishedAt: d.publishedAt ?? null,
      };
    });

    const topByViews = [...items].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
    const topByEngagement = [...items]
      .filter((i) => i.viewCount >= 10)
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5);

    const dist = (m: Map<string, number>) =>
      Array.from(m.entries()).map(([key, count]) => ({ key, count }));

    return {
      totals,
      byCategory: dist(byCategory),
      byType: dist(byType),
      byDifficulty: dist(byDifficulty),
      topByViews,
      topByEngagement,
    };
  },
});

// Forum unanswered questions
export const unansweredQuestions = query({
  args: {},
  async handler(ctx) {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');
    const qs = await ctx.db
      .query('forumTopics')
      .withIndex('by_type', (q) => q.eq('topicType', 'question'))
      .collect();
    const items = qs
      .filter((t) => (t.replyCount ?? 0) === 0)
      .sort((a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0))
      .slice(0, 20)
      .map((t) => ({
        id: t._id,
        title: t.title,
        category: t.category,
        createdAt: t._creationTime,
        viewCount: t.viewCount ?? 0,
        upvotes: t.upvotes ?? 0,
        downvotes: t.downvotes ?? 0,
      }));
    return items;
  },
});

// Contributor leaderboard from replies (net votes)
export const contributorLeaderboard = query({
  args: {},
  async handler(ctx) {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');
    const replies = await ctx.db.query('forumReplies').collect();
    const scores = new Map<string, { userId: string; score: number; replies: number }>();
    for (const r of replies) {
      const key = r.authorId.id as unknown as string;
      const cur = scores.get(key) ?? { userId: key, score: 0, replies: 0 };
      cur.score += (r.upvotes ?? 0) - (r.downvotes ?? 0);
      cur.replies += 1;
      scores.set(key, cur);
    }

    const arr = Array.from(scores.values()).sort((a, b) => b.score - a.score).slice(0, 10);
    // hydrate user names
    const users = await Promise.all(arr.map((s) => ctx.db.get((ctx.db as any).normalizeIdSync('users', s.userId))));
    return arr.map((s, i) => {
      const u = users[i] as any;
      const name = u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email : 'Unknown';
      return { rank: i + 1, userId: s.userId, name, score: s.score, replies: s.replies };
    });
  },
});

// Daily analytics rollup (basic)
export const rollupDailyAnalytics = mutation({
  args: {
    date: v.optional(v.number()), // ms epoch; defaults to today
  },
  async handler(ctx, { date }) {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');
    const now = date ?? Date.now();
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    const dayTs = day.getTime();

    const publishedContent = await ctx.db
      .query('educationalContent')
      .withIndex('by_published', (q) => q.eq('isPublished', true))
      .collect();
    const totalViews = publishedContent.reduce((acc, c) => acc + (c.viewCount ?? 0), 0);
    const totalLikes = publishedContent.reduce((acc, c) => acc + (c.likeCount ?? 0), 0);
    const totalShares = publishedContent.reduce((acc, c) => acc + (c.shareCount ?? 0), 0);

    const forumTopics = await ctx.db.query('forumTopics').collect();
    const questions = forumTopics.filter((t) => t.topicType === 'question');

    const metrics: Array<{ metric: string; value: number; metadata?: any }> = [
      { metric: 'daily_content_views', value: totalViews },
      { metric: 'daily_content_likes', value: totalLikes },
      { metric: 'daily_content_shares', value: totalShares },
      { metric: 'daily_forum_topics', value: forumTopics.length },
      { metric: 'daily_forum_questions', value: questions.length },
    ];

    for (const m of metrics) {
      await ctx.db.insert('analytics', {
        metric: m.metric,
        value: m.value,
        date: dayTs,
        metadata: m.metadata,
      } as any);
    }

    return { date: dayTs, metrics: metrics.map((m) => m.metric) };
  },
});

// Time series for a given metric from analytics table
export const metricSeries = query({
  args: { metric: v.string(), limit: v.optional(v.number()) },
  async handler(ctx, { metric, limit }) {
    const user = await UserService.getCurrentUser(ctx);
    if (!user) throw new Error('Not authenticated');

    const take = Math.max(1, Math.min(90, (limit ?? 30)));
    const rows = await ctx.db
      .query('analytics')
      .withIndex('by_metric_date', (q) => q.eq('metric', metric))
      .order('desc')
      .take(take);

    const series = rows
      .map((r) => ({ date: r.date as number, value: r.value as number }))
      .sort((a, b) => a.date - b.date);
    return { metric, series };
  },
});
