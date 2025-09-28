import { ConvexReactClient } from 'convex/react';
import { api } from '@packages/backend';
import type {
  ProjectProgress,
  DetailedProjectTracking,
  PortfolioSummary,
  TrackingStore
} from './tracking-store';

export interface TrackingApiClient {
  convex: ConvexReactClient;
  store: TrackingStore;
}

/**
 * Creates API operations for the tracking store using Convex
 */
export function createTrackingApi(convex: ConvexReactClient, store: TrackingStore) {

  // Fetch all projects for a buyer
  const fetchProjects = async (userId: string): Promise<void> => {
    try {
      store.loading.projects = true;
      store.errors.projects = null;

      const projects = await convex.query(api.buyer_impact_reports.getBuyerProjectTracking, {
        userId: userId as any // Convert string to Convex ID
      });

      // Transform and validate the data
      const transformedProjects: ProjectProgress[] = projects.map((project: any) => ({
        projectId: project.projectId,
        projectTitle: project.projectTitle,
        projectType: project.projectType,
        creatorName: project.creatorName,
        location: project.location,
        purchaseInfo: project.purchaseInfo,
        currentStatus: project.currentStatus,
        recentUpdates: project.recentUpdates?.map((update: any) => ({
          ...update,
          id: update.id?.toString() || update.id,
          type: update.type === 'completion' ? 'milestone' : update.type, // Map completion to milestone
          metrics: update.metrics || undefined
        })) || [],
        impact: project.impact,
        alerts: project.alerts,
        milestones: project.milestones?.map((milestone: any) => ({
          ...milestone,
          id: milestone.id?.toString() || milestone.id,
          status: milestone.status === 'skipped' ? 'delayed' : milestone.status, // Map skipped to delayed
          delayReason: milestone.delayReason || undefined
        })) || [],
        verificationStatus: {
          status: ['rejected', 'revision_required'].includes(project.verificationStatus?.status)
            ? 'pending'
            : (project.verificationStatus?.status === 'verified' ||
               project.verificationStatus?.status === 'in_progress' ||
               project.verificationStatus?.status === 'pending')
              ? project.verificationStatus.status
              : 'pending',
          lastVerified: project.verificationStatus?.lastVerified,
          nextVerification: project.verificationStatus?.nextVerification || undefined
        },
      }));

      // Update store
      store.projects = transformedProjects;
      store.lastFetch.projects = Date.now();
      store.loading.projects = false;

    } catch (error) {
      console.error('Error fetching projects:', error);
      store.errors.projects = error instanceof Error
        ? error.message
        : 'Failed to fetch projects';
      store.loading.projects = false;
      store.projects = [];
    }
  };

  // Fetch detailed project data
  const fetchSelectedProject = async (projectId: string, userId: string): Promise<void> => {
    try {
      store.loading.selectedProject = true;
      store.errors.selectedProject = null;

      const projectData = await convex.query(api.buyer_impact_reports.getDetailedProjectTracking, {
        projectId: projectId as any, // Convert string to Convex ID
        userId: userId as any // Convert string to Convex ID
      });

      if (projectData) {
        const transformedProject: DetailedProjectTracking = {
          ...projectData,
          // Ensure all required fields are present
          projectId: projectData.projectId,
          projectTitle: projectData.projectTitle,
          projectType: projectData.projectType,
          projectDescription: projectData.projectDescription || '',
          creatorName: projectData.creatorName,
          location: projectData.location,
          purchaseInfo: projectData.purchaseInfo,
          currentStatus: projectData.currentStatus,
          recentUpdates: projectData.recentUpdates?.map((update: any) => ({
            ...update,
            id: update.id?.toString() || update.id,
            type: update.type === 'completion' ? 'milestone' : update.type, // Map completion to milestone
            metrics: update.metrics || undefined
          })) || [],
          impact: projectData.impact,
          alerts: projectData.alerts?.map((alert: any) => ({
            ...alert,
            id: alert.id?.toString() || alert.id
          })) || [],
          milestones: projectData.milestones?.map((milestone: any) => ({
            ...milestone,
            id: milestone.id?.toString() || milestone.id,
            status: milestone.status === 'skipped' ? 'delayed' : milestone.status, // Map skipped to delayed
            delayReason: milestone.delayReason || undefined
          })) || [],
          verificationStatus: {
            status: ['rejected', 'revision_required'].includes(projectData.verificationStatus?.status)
              ? 'pending'
              : (projectData.verificationStatus?.status === 'verified' ||
                 projectData.verificationStatus?.status === 'in_progress' ||
                 projectData.verificationStatus?.status === 'pending')
                ? projectData.verificationStatus.status
                : 'pending',
            lastVerified: projectData.verificationStatus?.lastVerified,
            nextVerification: projectData.verificationStatus?.nextVerification || undefined
          },
          timeline: projectData.timeline || {
            startDate: Date.now(),
            expectedCompletion: Date.now(),
          },
        };

        store.selectedProject = transformedProject;
        store.lastFetch.selectedProject = Date.now();
      } else {
        store.errors.selectedProject = 'Project not found';
        store.selectedProject = null;
      }

      store.loading.selectedProject = false;

    } catch (error) {
      console.error('Error fetching selected project:', error);
      store.errors.selectedProject = error instanceof Error
        ? error.message
        : 'Failed to fetch project details';
      store.loading.selectedProject = false;
      store.selectedProject = null;
    }
  };

  // Fetch portfolio summary
  const fetchPortfolioSummary = async (userId: string): Promise<void> => {
    try {
      store.loading.portfolio = true;
      store.errors.portfolio = null;

      const summary = await convex.query(api.buyer_impact_reports.getBuyerPortfolioSummary, {
        userId: userId as any // Convert string to Convex ID
      });

      if (summary) {
        const transformedSummary: PortfolioSummary = {
          totalCredits: summary.totalCredits,
          totalInvestment: summary.totalInvestment,
          totalCarbonOffset: summary.totalCarbonOffset,
          activeProjects: summary.activeProjects,
          completedProjects: summary.completedProjects,
          projectsWithIssues: summary.projectsWithIssues,
          totalProjects: summary.totalProjects,
          averageInvestment: summary.averageInvestment,
        };

        store.portfolioSummary = transformedSummary;
        store.lastFetch.portfolio = Date.now();
      }

      store.loading.portfolio = false;

    } catch (error) {
      console.error('Error fetching portfolio summary:', error);
      store.errors.portfolio = error instanceof Error
        ? error.message
        : 'Failed to fetch portfolio summary';
      store.loading.portfolio = false;
      store.portfolioSummary = null;
    }
  };

  // Refresh all data
  const refreshAllData = async (userId: string): Promise<void> => {
    await Promise.all([
      fetchProjects(userId),
      fetchPortfolioSummary(userId)
    ]);
  };

  // Set up real-time subscriptions (placeholder for React hook integration)
  const startSubscriptions = (userId: string): void => {
    // Clean up existing subscriptions
    stopSubscriptions();

    // Note: Real-time subscriptions are handled by React hooks (useQuery)
    // This function is kept for API compatibility but subscriptions
    // should be managed at the component level using useQuery hooks
    console.log('Subscriptions started for user:', userId);

    // Store empty subscription references for API compatibility
    store.subscriptions = {
      projects: null,
      portfolio: null,
      selectedProject: null,
    };
  };

  // Stop all subscriptions
  const stopSubscriptions = (): void => {
    const { subscriptions } = store;

    Object.values(subscriptions).forEach(unsubscribe => {
      if (unsubscribe) {
        unsubscribe();
      }
    });

    store.subscriptions = {
      projects: null,
      portfolio: null,
      selectedProject: null,
    };
  };

  // Return API methods
  return {
    fetchProjects,
    fetchSelectedProject,
    fetchPortfolioSummary,
    refreshAllData,
    startSubscriptions,
    stopSubscriptions,
  };
}

/**
 * Hook to get tracking API operations
 * This will be used to integrate with the store
 */
export function useTrackingApi(convex: ConvexReactClient) {
  // This will be implemented to work with the store
  return {
    createApiClient: (store: TrackingStore) => createTrackingApi(convex, store)
  };
}

/**
 * Utility function to bind API operations to store
 */
export function bindTrackingApi(store: TrackingStore, convex: ConvexReactClient) {
  const api = createTrackingApi(convex, store);

  // Replace store methods with API-connected versions
  store.fetchProjects = api.fetchProjects;
  store.fetchSelectedProject = api.fetchSelectedProject;
  store.fetchPortfolioSummary = api.fetchPortfolioSummary;
  store.refreshAllData = api.refreshAllData;
  store.startSubscriptions = (userId: string) => api.startSubscriptions(userId);
  store.stopSubscriptions = api.stopSubscriptions;

  return api;
}

/**
 * Error handling utilities
 */
export const trackingErrorHandler = {
  isNetworkError: (error: any): boolean => {
    return error?.message?.includes('network') ||
           error?.message?.includes('fetch') ||
           error?.code === 'NETWORK_ERROR';
  },

  isAuthError: (error: any): boolean => {
    return error?.message?.includes('unauthorized') ||
           error?.message?.includes('authentication') ||
           error?.code === 'UNAUTHORIZED';
  },

  isNotFoundError: (error: any): boolean => {
    return error?.message?.includes('not found') ||
           error?.code === 'NOT_FOUND';
  },

  getErrorMessage: (error: any): string => {
    if (trackingErrorHandler.isNetworkError(error)) {
      return 'Network connection error. Please check your internet connection.';
    }

    if (trackingErrorHandler.isAuthError(error)) {
      return 'Authentication error. Please log in again.';
    }

    if (trackingErrorHandler.isNotFoundError(error)) {
      return 'Requested data not found.';
    }

    return error instanceof Error ? error.message : 'An unexpected error occurred';
  }
};

/**
 * Cache management utilities
 */
export const trackingCache: {
  CACHE_DURATION: {
    projects: number;
    selectedProject: number;
    portfolio: number;
  };
  isStale: (lastFetch: number | null, duration: number) => boolean;
  shouldRefresh: (lastFetch: number | null, type: 'projects' | 'selectedProject' | 'portfolio') => boolean;
} = {
  // Cache duration in milliseconds
  CACHE_DURATION: {
    projects: 5 * 60 * 1000, // 5 minutes
    selectedProject: 2 * 60 * 1000, // 2 minutes
    portfolio: 10 * 60 * 1000, // 10 minutes
  },

  isStale: (lastFetch: number | null, duration: number): boolean => {
    if (!lastFetch) return true;
    return Date.now() - lastFetch > duration;
  },

  shouldRefresh: (lastFetch: number | null, type: 'projects' | 'selectedProject' | 'portfolio'): boolean => {
    return trackingCache.isStale(lastFetch, trackingCache.CACHE_DURATION[type]);
  }
};