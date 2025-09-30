import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ConvexReactClient } from 'convex/react';

// Types for tracking store
export interface ProjectProgress {
  projectId: string;
  projectTitle: string;
  projectType: string;
  creatorName: string;
  location: {
    country: string;
    region: string;
  };
  purchaseInfo: {
    creditsOwned: number;
    purchaseDate: string | number;
    totalInvestment: number;
  };
  currentStatus: {
    overallProgress: number;
    currentPhase: string;
    nextMilestone: string;
    nextMilestoneDate: string | number;
  };
  recentUpdates: Array<{
    id: string;
    type: 'milestone' | 'measurement' | 'photo' | 'issue';
    title: string;
    description: string;
    date: string | number;
    photos: string[];
    metrics?: Record<string, any>;
  }>;
  impact: {
    carbonOffset: number;
    additionalMetrics: Record<string, any>;
  };
  alerts: Array<{
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    date: string | number;
    isResolved: boolean;
  }>;
  milestones: Array<{
    id: string;
    title: string;
    plannedDate: string | number;
    actualDate?: string | number;
    status: 'pending' | 'in_progress' | 'completed' | 'delayed';
    description: string;
  }>;
  verificationStatus: {
    status: 'verified' | 'pending' | 'in_progress';
    lastVerified?: string | number;
    nextVerification?: string | number;
  };
}

export interface DetailedProjectTracking extends ProjectProgress {
  projectDescription: string;
  timeline: {
    startDate: string | number;
    expectedCompletion: string | number;
    actualCompletion?: string | number;
  };
  alerts: Array<{
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    date: string | number;
    isResolved: boolean;
    resolvedAt?: string | number;
    resolutionNotes?: string;
  }>;
  milestones: Array<{
    id: string;
    title: string;
    plannedDate: string | number;
    actualDate?: string | number;
    status: 'pending' | 'in_progress' | 'completed' | 'delayed';
    description: string;
    delayReason?: string;
  }>;
}

export interface PortfolioSummary {
  totalCredits: number;
  totalInvestment: number;
  totalCarbonOffset: number;
  activeProjects: number;
  completedProjects: number;
  projectsWithIssues: number;
  totalProjects: number;
  averageInvestment: number;
}

export interface TrackingFilters {
  status: 'all' | 'active' | 'completed' | 'issues';
  sortBy: 'recent' | 'progress' | 'alerts' | 'investment' | 'carbon_impact';
  projectType: string;
  timeframe: 'all' | '30d' | '90d' | '1y';
}

export interface TrackingStore {
  // Data state
  projects: ProjectProgress[];
  selectedProject: DetailedProjectTracking | null;
  portfolioSummary: PortfolioSummary | null;

  // UI state
  filters: TrackingFilters;
  selectedProjectId: string | null;

  // Loading states
  loading: {
    projects: boolean;
    selectedProject: boolean;
    portfolio: boolean;
  };

  // Error states
  errors: {
    projects: string | null;
    selectedProject: string | null;
    portfolio: string | null;
  };

  // Metadata
  lastFetch: {
    projects: number | null;
    selectedProject: number | null;
    portfolio: number | null;
  };

  // Computed properties
  getFilteredProjects: () => ProjectProgress[];
  getSortedProjects: (projects: ProjectProgress[]) => ProjectProgress[];
  getProjectById: (projectId: string) => ProjectProgress | null;
  getActiveAlertsCount: () => number;
  getCompletionRate: () => number;
  getTotalCarbonImpact: () => number;

  // Actions
  setFilters: (filters: Partial<TrackingFilters>) => void;
  setSelectedProject: (projectId: string | null) => void;
  clearErrors: () => void;
  resetFilters: () => void;

  // Async operations (will be set up with Convex client)
  fetchProjects: (userId: string) => Promise<void>;
  fetchSelectedProject: (projectId: string, userId: string) => Promise<void>;
  fetchPortfolioSummary: (userId: string) => Promise<void>;
  refreshAllData: (userId: string) => Promise<void>;

  // Real-time subscription management
  subscriptions: {
    projects: (() => void) | null;
    selectedProject: (() => void) | null;
    portfolio: (() => void) | null;
  };
  startSubscriptions: (userId: string, convexClient: ConvexReactClient) => void;
  stopSubscriptions: () => void;
}

const defaultFilters: TrackingFilters = {
  status: 'all',
  sortBy: 'recent',
  projectType: '',
  timeframe: 'all',
};

export const useTrackingStore = create<TrackingStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    projects: [],
    selectedProject: null,
    portfolioSummary: null,

    // UI state
    filters: defaultFilters,
    selectedProjectId: null,

    // Loading states
    loading: {
      projects: false,
      selectedProject: false,
      portfolio: false,
    },

    // Error states
    errors: {
      projects: null,
      selectedProject: null,
      portfolio: null,
    },

    // Metadata
    lastFetch: {
      projects: null,
      selectedProject: null,
      portfolio: null,
    },

    // Computed properties
    getFilteredProjects: () => {
      const { projects, filters } = get();

      let filtered = projects;

      // Filter by status
      if (filters.status !== 'all') {
        filtered = filtered.filter((project) => {
          switch (filters.status) {
            case 'active':
              return project.currentStatus.overallProgress < 100;
            case 'completed':
              return project.currentStatus.overallProgress === 100;
            case 'issues':
              return project.alerts.some((alert) => !alert.isResolved);
            default:
              return true;
          }
        });
      }

      // Filter by project type
      if (filters.projectType) {
        filtered = filtered.filter(
          (project) => project.projectType === filters.projectType
        );
      }

      // Filter by timeframe
      if (filters.timeframe !== 'all') {
        const now = Date.now();
        const timeframes = {
          '30d': 30 * 24 * 60 * 60 * 1000,
          '90d': 90 * 24 * 60 * 60 * 1000,
          '1y': 365 * 24 * 60 * 60 * 1000,
        };

        const cutoff =
          now - timeframes[filters.timeframe as keyof typeof timeframes];
        filtered = filtered.filter((project) => {
          const lastUpdate = project.recentUpdates[0];
          if (!lastUpdate) return false;

          const updateTime =
            typeof lastUpdate.date === 'string'
              ? new Date(lastUpdate.date).getTime()
              : lastUpdate.date;

          return updateTime >= cutoff;
        });
      }

      return get().getSortedProjects(filtered);
    },

    getSortedProjects: (projects: ProjectProgress[]) => {
      const { filters } = get();

      return [...projects].sort((a, b) => {
        switch (filters.sortBy) {
          case 'progress':
            return (
              b.currentStatus.overallProgress - a.currentStatus.overallProgress
            );
          case 'alerts':
            const aAlerts = a.alerts.filter(
              (alert) => !alert.isResolved
            ).length;
            const bAlerts = b.alerts.filter(
              (alert) => !alert.isResolved
            ).length;
            return bAlerts - aAlerts;
          case 'investment':
            return (
              b.purchaseInfo.totalInvestment - a.purchaseInfo.totalInvestment
            );
          case 'carbon_impact':
            return b.impact.carbonOffset - a.impact.carbonOffset;
          case 'recent':
          default:
            const aDate = a.recentUpdates[0]
              ? typeof a.recentUpdates[0].date === 'string'
                ? new Date(a.recentUpdates[0].date).getTime()
                : a.recentUpdates[0].date
              : 0;
            const bDate = b.recentUpdates[0]
              ? typeof b.recentUpdates[0].date === 'string'
                ? new Date(b.recentUpdates[0].date).getTime()
                : b.recentUpdates[0].date
              : 0;
            return bDate - aDate;
        }
      });
    },

    getProjectById: (projectId: string) => {
      const { projects } = get();
      return (
        projects.find((project) => project.projectId === projectId) || null
      );
    },

    getActiveAlertsCount: () => {
      const { projects } = get();
      return projects.reduce(
        (count, project) =>
          count + project.alerts.filter((alert) => !alert.isResolved).length,
        0
      );
    },

    getCompletionRate: () => {
      const { projects } = get();
      if (projects.length === 0) return 0;

      const completedProjects = projects.filter(
        (project) => project.currentStatus.overallProgress === 100
      ).length;

      return Math.round((completedProjects / projects.length) * 100);
    },

    getTotalCarbonImpact: () => {
      const { projects } = get();
      return projects.reduce(
        (total, project) => total + project.impact.carbonOffset,
        0
      );
    },

    // Actions
    setFilters: (newFilters) => {
      set((state) => ({
        filters: { ...state.filters, ...newFilters },
      }));
    },

    setSelectedProject: (projectId) => {
      set({ selectedProjectId: projectId });
      if (projectId && get().selectedProject?.projectId !== projectId) {
        set({ selectedProject: null }); // Clear previous selection
      }
    },

    clearErrors: () => {
      set({
        errors: {
          projects: null,
          selectedProject: null,
          portfolio: null,
        },
      });
    },

    resetFilters: () => {
      set({ filters: defaultFilters });
    },

    // Placeholder async operations (will be implemented with Convex)
    fetchProjects: async (userId: string) => {
      console.log('fetchProjects called with userId:', userId);
      // This will be implemented when integrating with Convex
    },

    fetchSelectedProject: async (projectId: string, userId: string) => {
      console.log('fetchSelectedProject called with:', { projectId, userId });
      // This will be implemented when integrating with Convex
    },

    fetchPortfolioSummary: async (userId: string) => {
      console.log('fetchPortfolioSummary called with userId:', userId);
      // This will be implemented when integrating with Convex
    },

    refreshAllData: async (userId: string) => {
      console.log('refreshAllData called with userId:', userId);
      const { fetchProjects, fetchPortfolioSummary } = get();
      await Promise.all([fetchProjects(userId), fetchPortfolioSummary(userId)]);
    },

    // Subscription management
    subscriptions: {
      projects: null,
      selectedProject: null,
      portfolio: null,
    },

    startSubscriptions: (userId: string, convexClient: ConvexReactClient) => {
      console.log('startSubscriptions called with:', { userId, convexClient });
      // This will be implemented when integrating with Convex real-time subscriptions
    },

    stopSubscriptions: () => {
      const { subscriptions } = get();

      // Cleanup all subscriptions
      Object.values(subscriptions).forEach((unsubscribe) => {
        if (unsubscribe) unsubscribe();
      });

      set({
        subscriptions: {
          projects: null,
          selectedProject: null,
          portfolio: null,
        },
      });
    },
  }))
);

// Helper hook for reactive project selection
export const useSelectedProject = () => {
  return useTrackingStore((state) => ({
    selectedProject: state.selectedProject,
    selectedProjectId: state.selectedProjectId,
    loading: state.loading.selectedProject,
    error: state.errors.selectedProject,
    setSelectedProject: state.setSelectedProject,
    fetchSelectedProject: state.fetchSelectedProject,
  }));
};

// Helper hook for portfolio metrics
export const usePortfolioMetrics = () => {
  return useTrackingStore((state) => ({
    summary: state.portfolioSummary,
    totalProjects: state.projects.length,
    activeAlerts: state.getActiveAlertsCount(),
    completionRate: state.getCompletionRate(),
    totalCarbonImpact: state.getTotalCarbonImpact(),
    loading: state.loading.portfolio,
    error: state.errors.portfolio,
  }));
};

// Helper hook for filtered projects
export const useFilteredProjects = () => {
  return useTrackingStore((state) => ({
    projects: state.getFilteredProjects(),
    filters: state.filters,
    loading: state.loading.projects,
    error: state.errors.projects,
    setFilters: state.setFilters,
    resetFilters: state.resetFilters,
  }));
};
