import type {
  MarketplaceFilters,
  MarketplaceProject,
} from '../types/marketplace-types.ts';

export class MarketplaceService {
  // TODO: Replace with actual database query when projects are populated
  private static getHardcodedProjects(): MarketplaceProject[] {
    return [
      {
        id: 1,
        name: 'Amazon Rainforest Conservation',
        type: 'Reforestation',
        location: 'Brazil',
        price: 15,
        credits: 500,
        image:
          'https://www.mdpi.com/land/land-12-00002/article_deploy/html/images/land-12-00002-g001.png',
        creator: 'Green Earth Foundation',
        rating: 4.8,
      },
      {
        id: 2,
        name: 'Solar Energy Farm',
        type: 'Solar Energy',
        location: 'India',
        price: 12,
        credits: 750,
        image:
          'https://www.german-energy-solutions.de/GES/Redaktion/EN/Images/News/20200812-pv-apple-farm-new.jpg?__blob=normal&v=1',
        creator: 'Solar Solutions Inc',
        rating: 4.6,
      },
      {
        id: 3,
        name: 'Wind Power Initiative',
        type: 'Wind Energy',
        location: 'Denmark',
        price: 18,
        credits: 1000,
        image:
          'https://www.rwe.com/-/media/RWE/images/07-presse/rwe-renewables-europe-australia/2024/2024-02-14-grossbaustelle-fuer-die-energiewende.jpg?db=web&mw=1920&w=2160&hash=DF81FFA6DE9166216BE3C55EBA742F72',
        creator: 'Nordic Wind Co',
        rating: 4.9,
      },
      {
        id: 4,
        name: 'Biogas Plant Project',
        type: 'Biogas',
        location: 'Germany',
        price: 10,
        credits: 300,
        image:
          'https://accelleron.com/content/accelleronind/language-masters/en/charge-magazine/articles/how-turbochargers-are-making-biogas-power-generation-more-efficient/_jcr_content/root/container_1661032700/image_587297026.coreimg.82.3840.jpeg/1721081187840/agricultural-biogas-plant-main.jpeg',
        creator: 'BioEnergy GmbH',
        rating: 4.5,
      },
    ];
  }

  static async getMarketplaceProjects(
    filters: MarketplaceFilters
  ): Promise<MarketplaceProject[]> {
    // TODO: Replace with actual database query
    // const projects = await ctx.db
    //   .query('projects')
    //   .withIndex('by_status', (q) => q.eq('status', 'approved'))
    //   .collect();
    // const mappedProjects = projects.map(project => ({
    //   id: project._id,
    //   name: project.title,
    //   type: project.projectType,
    //   location: project.location.name,
    //   price: project.pricePerCredit,
    //   credits: project.creditsAvailable,
    //   image: '/api/placeholder/300/200', // TODO: get from documents
    //   creator: 'TODO: get creator name from users table',
    //   rating: project.qualityScore || 0,
    // }));

    // TODO: remove hardcoded data when DB is populated
    let filteredProjects = this.getHardcodedProjects();

    // Apply filters
    filteredProjects = this.applyFilters(filteredProjects, filters);

    // Apply sorting
    filteredProjects = this.applySorting(filteredProjects, filters.sortBy);

    return filteredProjects;
  }

  // apply all filters based on provided filter criteria
  private static applyFilters(
    projects: MarketplaceProject[],
    filters: MarketplaceFilters
  ): MarketplaceProject[] {
    let filtered = [...projects];

    if (filters.priceRange) {
      filtered = this.applyPriceFilter(filtered, filters.priceRange);
    }

    if (filters.location) {
      filtered = filtered.filter((project) =>
        project.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.projectType) {
      filtered = filtered.filter((project) =>
        project.type.toLowerCase().includes(filters.projectType!.toLowerCase())
      );
    }

    return filtered;
  }

  // apply price range filter
  private static applyPriceFilter(
    projects: MarketplaceProject[],
    priceRange: string
  ): MarketplaceProject[] {
    const [min, max] = priceRange.split('-').map(Number);

    if (min && max) {
      return projects.filter(
        (project) => project.price >= min && project.price <= max
      );
    } else if (min) {
      return projects.filter((project) => project.price >= min);
    }

    return projects;
  }

  // apply sorting based on sortBy parameter
  private static applySorting(
    projects: MarketplaceProject[],
    sortBy?: string
  ): MarketplaceProject[] {
    if (!sortBy) return projects;

    const sorted = [...projects];

    switch (sortBy) {
      case 'newest':
        // For hardcoded data, no sorting needed (already in newest order)
        break;
      case 'price_low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'credits':
        sorted.sort((a, b) => b.credits - a.credits);
        break;
    }

    return sorted;
  }
}
