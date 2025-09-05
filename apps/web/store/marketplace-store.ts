import { create } from 'zustand';
import type {
  MarketplaceProject,
  MarketplaceFilters,
} from '@echo-sprout/types';

export type { MarketplaceFilters };

interface MarketplaceStore {
  projects: MarketplaceProject[];
  filters: MarketplaceFilters;
  loading: boolean;
  error: string | null;
  lastFetch: number | null;

  // Pagination state
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;

  // getters
  projectCount: () => number;
  hasActiveFilters: () => boolean;

  // Actions
  setFilters: (filters: Partial<MarketplaceFilters>) => void;
  setPage: (page: number) => void;
  fetchProjects: () => Promise<void>;
  clearError: () => void;
  resetFilters: () => void;
  refreshProjects: () => Promise<void>;
}

const defaultFilters: MarketplaceFilters = {
  priceRange: '',
  location: '',
  projectType: '',
  sortBy: 'newest',
  searchQuery: '',
  page: 1,
  limit: 6,
};

export const useMarketplaceStore = create<MarketplaceStore>((set, get) => ({
  // Initial state
  projects: [],
  filters: defaultFilters,
  loading: false,
  error: null,
  lastFetch: null,

  // Pagination state
  totalCount: 0,
  currentPage: 1,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,

  // Computed getters
  projectCount: () => get().projects.length,

  hasActiveFilters: () => {
    const { filters } = get();
    return !!(
      filters.priceRange ||
      filters.location ||
      filters.projectType ||
      filters.sortBy !== 'newest' ||
      filters.searchQuery
    );
  },

  // Actions
  setFilters: (newFilters) => {
    const updatedFilters = { ...get().filters, ...newFilters };
    // Reset to page 1 when filters change
    if (
      newFilters.priceRange !== undefined ||
      newFilters.location !== undefined ||
      newFilters.projectType !== undefined ||
      newFilters.sortBy !== undefined ||
      newFilters.searchQuery !== undefined
    ) {
      updatedFilters.page = 1;
    }
    set({ filters: updatedFilters, currentPage: updatedFilters.page || 1 });
    get().fetchProjects();
  },

  setPage: (page: number) => {
    const updatedFilters = { ...get().filters, page };
    set({ filters: updatedFilters, currentPage: page });
    get().fetchProjects();
  },

  fetchProjects: async () => {
    const { filters } = get();

    try {
      set({ loading: true, error: null });

      const params = new URLSearchParams();
      if (filters.priceRange) params.append('priceRange', filters.priceRange);
      if (filters.location) params.append('location', filters.location);
      if (filters.projectType)
        params.append('projectType', filters.projectType);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.searchQuery)
        params.append('searchQuery', filters.searchQuery);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(
        `/api/marketplace/projects?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch projects`);
      }

      const data = await response.json();

      if (data.success) {
        set({
          projects: data.data,
          totalCount: data.totalCount,
          currentPage: data.page,
          totalPages: data.totalPages,
          hasNextPage: data.hasNextPage,
          hasPrevPage: data.hasPrevPage,
          loading: false,
          lastFetch: Date.now(),
        });
      } else {
        throw new Error(data.error || 'Failed to fetch projects');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      set({ error: errorMessage, loading: false, projects: [] });
    }
  },

  refreshProjects: async () => {
    await get().fetchProjects();
  },

  clearError: () => {
    set({ error: null });
  },

  resetFilters: () => {
    set({ filters: defaultFilters });
    get().fetchProjects();
  },
}));
