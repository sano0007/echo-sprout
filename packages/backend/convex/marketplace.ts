import { query } from './_generated/server';
import { v } from 'convex/values';
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
    const result = await MarketplaceService.getMarketplaceProjects({
      priceRange: args.priceRange || '',
      location: args.location || '',
      projectType: args.projectType || '',
      sortBy: args.sortBy || 'newest',
      searchQuery: args.searchQuery || '',
      page: args.page || 1,
      limit: args.limit || 6,
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
