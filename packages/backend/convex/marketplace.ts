import { query } from './_generated/server';
import { v } from 'convex/values';
import { ConvexError } from 'convex/values';
import { MarketplaceService } from '../services/marketplace-service';

export const getMarketplaceProjects = query({
  args: {
    priceRange: v.optional(v.string()),
    location: v.optional(v.string()),
    projectType: v.optional(v.string()),
    sortBy: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const result = await MarketplaceService.getMarketplaceProjects(ctx.db, {
      priceRange: args.priceRange,
      location: args.location,
      projectType: args.projectType,
      sortBy: args.sortBy,
      searchQuery: args.searchQuery,
      page: args.page,
      limit: args.limit,
    });

    return {
      data: result.projects,
      totalCount: result.totalCount,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    };
  },
});

export const getProjectById = query({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, args) => {
    try {
      return await MarketplaceService.getProjectById(ctx.db, args.projectId);
    } catch (error) {
      throw new ConvexError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  },
});
