import type { DatabaseReader } from '../convex/_generated/server';
import type {
  MarketplaceFilters,
  MarketplaceProject,
} from '@echo-sprout/types';

export class MarketplaceService {
  static async getMarketplaceProjects(
    db: DatabaseReader,
    filters: MarketplaceFilters
  ): Promise<{
    projects: MarketplaceProject[];
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    // Get all active/approved projects from database
    const projects = await db
      .query('projects')
      .filter((q) =>
        q.or(
          q.eq(q.field('status'), 'active'),
          q.eq(q.field('status'), 'approved')
        )
      )
      .collect();

    // Get creators for the projects
    const projectsWithCreators = await Promise.all(
      projects.map(async (project) => {
        const creator = await db.get(project.creatorId);
        return {
          id: project._id,
          name: project.title,
          type: project.projectType,
          location: project.location.name,
          price: project.pricePerCredit,
          credits: project.creditsAvailable,
          image:
            project.images?.[0] ||
            'https://ntxgroupsa.com/wp-content/uploads/2019/11/project-placeholder.jpg',
          images: project.images || [],
          creator:
            creator?.organizationName ||
            `${creator?.firstName} ${creator?.lastName}` ||
            'Unknown Creator',
          rating: project.qualityScore || 4.5, // Default rating if not set
        };
      })
    );

    // Apply filters
    let filteredProjects = this.applyFilters(projectsWithCreators, filters);

    // Apply sorting
    filteredProjects = this.applySorting(filteredProjects, filters.sortBy);

    // Apply pagination
    const paginationResult = this.applyPagination(filteredProjects, filters);

    return paginationResult;
  }

  /**
   * Apply filters to projects
   */
  private static applyFilters(
    projects: MarketplaceProject[],
    filters: MarketplaceFilters
  ): MarketplaceProject[] {
    let filteredProjects = [...projects];

    // Price range filter
    if (filters.priceRange) {
      filteredProjects = this.applyPriceFilter(
        filteredProjects,
        filters.priceRange
      );
    }

    // Location filter
    if (filters.location) {
      filteredProjects = this.applyLocationFilter(
        filteredProjects,
        filters.location
      );
    }

    // Project type filter
    if (filters.projectType) {
      filteredProjects = this.applyProjectTypeFilter(
        filteredProjects,
        filters.projectType
      );
    }

    // Search filter
    if (filters.searchQuery) {
      filteredProjects = this.applySearchFilter(
        filteredProjects,
        filters.searchQuery
      );
    }

    return filteredProjects;
  }

  /**
   * Apply price range filter
   */
  private static applyPriceFilter(
    projects: MarketplaceProject[],
    priceRange: string
  ): MarketplaceProject[] {
    const [min, max] = priceRange.split('-').map(Number);

    if (min && max) {
      return projects.filter((p) => p.price >= min && p.price <= max);
    } else if (min) {
      return projects.filter((p) => p.price >= min);
    }

    return projects;
  }

  /**
   * Apply location filter
   */
  private static applyLocationFilter(
    projects: MarketplaceProject[],
    location: string
  ): MarketplaceProject[] {
    return projects.filter((p) =>
      p.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  /**
   * Apply project type filter
   */
  private static applyProjectTypeFilter(
    projects: MarketplaceProject[],
    projectType: string
  ): MarketplaceProject[] {
    return projects.filter((p) =>
      p.type.toLowerCase().includes(projectType.toLowerCase())
    );
  }

  /**
   * Apply search filter (searches in name and creator)
   */
  private static applySearchFilter(
    projects: MarketplaceProject[],
    searchQuery: string
  ): MarketplaceProject[] {
    const query = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.creator.toLowerCase().includes(query)
    );
  }

  /**
   * Apply sorting to projects
   */
  private static applySorting(
    projects: MarketplaceProject[],
    sortBy?: string
  ): MarketplaceProject[] {
    const sortedProjects = [...projects];

    switch (sortBy) {
      case 'price_low':
        return sortedProjects.sort((a, b) => a.price - b.price);
      case 'price_high':
        return sortedProjects.sort((a, b) => b.price - a.price);
      case 'rating':
        return sortedProjects.sort((a, b) => b.rating - a.rating);
      case 'credits':
        return sortedProjects.sort((a, b) => b.credits - a.credits);
      case 'newest':
      default:
        // Projects are already in creation order (newest first)
        return sortedProjects;
    }
  }

  /**
   * Apply pagination to projects
   */
  private static applyPagination(
    projects: MarketplaceProject[],
    filters: MarketplaceFilters
  ): {
    projects: MarketplaceProject[];
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } {
    const page = filters.page || 1;
    const limit = filters.limit || 6;
    const totalCount = projects.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedProjects = projects.slice(startIndex, endIndex);

    return {
      projects: paginatedProjects,
      totalCount,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  /**
   * Get project by ID with creator information
   */
  static async getProjectById(db: DatabaseReader, projectId: string) {
    // Use query to ensure we get a project specifically
    const project = await db
      .query('projects')
      .filter((q) => q.eq(q.field('_id'), projectId))
      .first();

    if (!project) {
      throw new Error('Project not found');
    }

    // Get creator information
    const creator = await db.get(project.creatorId);

    if (!creator) {
      throw new Error('Project creator not found');
    }

    return {
      ...project,
      creator: {
        name:
          creator.organizationName ||
          `${creator.firstName} ${creator.lastName}`,
        email: creator.email,
        verified: creator.isVerified,
      },
    };
  }
}
