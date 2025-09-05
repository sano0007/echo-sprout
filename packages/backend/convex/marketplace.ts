import { query } from './_generated/server';
import { v } from 'convex/values';
import { MarketplaceService } from '../services/marketplace-service';

export const getMarketplaceProjects = query({
  args: {
    priceRange: v.optional(v.string()),
    location: v.optional(v.string()),
    projectType: v.optional(v.string()),
    sortBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await MarketplaceService.getMarketplaceProjects({
      priceRange: args.priceRange,
      location: args.location,
      projectType: args.projectType,
      sortBy: args.sortBy,
    });
  },
});
