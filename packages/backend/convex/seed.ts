import { mutation } from './_generated/server';

/**
 * Convenience mutation that inserts 15 forum topics with randomized
 * categories, views, replies, and dates within 2025-08-28 to 2025-09-27.
 * Call as `seed.seedForumDemo` from the Convex dashboard.
 */
export const seedForumDemo = mutation({
  args: {},
  async handler(ctx) {
    async function resolveUserId() {
      const activeUsers = await ctx.db
        .query('users')
        .withIndex('by_active', (q) => q.eq('isActive', true))
        .collect();
      if (activeUsers.length > 0) return activeUsers[0]._id;
      const anyUsers = await ctx.db.query('users').collect();
      if (anyUsers.length > 0) return anyUsers[0]._id;
      throw new Error('No users found to assign as topic author. Please create a user first.');
    }

    const authorId = await resolveUserId();

    // Align with UI category ids in apps/web/app/community/forum/page.tsx
    const categories = [
      'general',
      'project-dev',
      'verification',
      'marketplace',
      'tech-support',
      'announcements',
    ];

    // Date range: 2025-08-28 to 2025-09-27 inclusive
    const start = Date.UTC(2025, 7, 28); // months 0-based
    const end = Date.UTC(2025, 8, 27, 23, 59, 59, 999);
    function randomTimestamp() {
      const r = Math.random();
      return Math.floor(start + r * (end - start));
    }

    const topics: { title: string; content: string }[] = [
      { title: 'How do I verify additionality for small solar projects?', content: 'Looking for guidance on additionality tests applicable to <10MW distributed solar.' },
      { title: 'Best way to track registry retirements?', content: 'What tools are you using to track retirements across multiple registries?' },
      { title: 'MRV data quality checks — what’s essential?', content: 'Share your checklists for metering, calibration, and data integrity.' },
      { title: 'Choosing a methodology for mangrove restoration', content: 'Pros/cons of leading methodologies for blue carbon projects.' },
      { title: 'Carbon price outlook Q4 2025', content: 'Where do you see prices heading given recent rating changes?' },
      { title: 'Community benefits documentation templates', content: 'Any templates for documenting co-benefits and SDG alignment?' },
      { title: 'Wind project baselines', content: 'How are you establishing baselines for sites with historical data gaps?' },
      { title: 'Handling leakage in reforestation', content: 'Approaches to minimize and account for leakage in forest projects.' },
      { title: 'New verifier onboarding tips', content: 'Advice for teams onboarding new third-party verifiers.' },
      { title: 'Public dashboards for transparency', content: 'Examples of good project transparency dashboards and datasets.' },
      { title: 'Sampling strategies for field plots', content: 'Statistical approaches you trust for plot sampling.' },
      { title: 'What’s your document control setup?', content: 'Systems for versioning methodologies, reports, and evidence.' },
      { title: 'Addressing permanence risks', content: 'Risk registers and mitigation strategies for reversals.' },
      { title: 'Data pipelines for MRV', content: 'ETL tools and architectures used for automated MRV.' },
      { title: 'Registry APIs — any gotchas?', content: 'Gotchas when integrating with different registry APIs.' },
    ];

    // Helper to derive simple tags from title
    function deriveTags(title: string): string[] {
      const base = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2 && w.length < 18);
      const uniq = Array.from(new Set(base));
      return uniq.slice(0, 4);
    }

    // Map forum category to an allowed topicType (avoid 'discussion')
    function mapTopicType(cat: string): 'question' | 'announcement' | 'poll' {
      const c = cat.toLowerCase();
      if (c.includes('announcement')) return 'announcement';
      if (c.includes('market')) return 'poll';
      // general, project-dev, verification, tech-support -> question
      return 'question';
    }

    let inserted = 0;
    for (let i = 0; i < topics.length; i++) {
      const t = topics[i];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const views = Math.floor(Math.random() * 500) + 10; // 10..509
      const replies = Math.floor(Math.random() * 20); // 0..19
      const lastReplyAt = randomTimestamp();

      const topicType = mapTopicType(category);
      const tags = deriveTags(t.title);

      const topicId = await ctx.db.insert('forumTopics', {
        title: t.title,
        content: t.content,
        category,
        authorId,
        isSticky: false,
        viewCount: views,
        replyCount: 0, // will update after inserting replies
        lastReplyAt,
        lastReplyBy: authorId,
        topicType,
        tags,
        upvotes: 0,
        downvotes: 0,
      } as any);

      // Create actual replies to match replyCount
      let lastBy = authorId;
      let actualReplies = 0;
      for (let r = 0; r < replies; r++) {
        const replyTime = Math.min(lastReplyAt, Date.now());
        // Insert reply
        await ctx.db.insert('forumReplies', {
          topicId: topicId as any,
          authorId: authorId as any,
          content: `Reply ${r + 1}: Thanks for the insights on "${t.title}"!`,
          isDeleted: false,
          upvotes: 0,
          downvotes: 0,
          acceptedBy: undefined,
          acceptedAt: undefined,
        } as any);
        lastBy = authorId;
        actualReplies++;
      }

      // Update topic with real reply count and last reply metadata
      await ctx.db.patch(topicId as any, {
        replyCount: actualReplies,
        lastReplyAt,
        lastReplyBy: lastBy,
      });

      inserted += 1;
    }

    return { inserted };
  },
});
