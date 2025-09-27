import { useEffect, useRef } from 'react';
import { useConvex } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { useTrackingStore, type TrackingStore } from '../store/tracking-store';
import { bindTrackingApi, trackingCache } from '../store/tracking-api';

/**
 * Main hook for project tracking functionality
 * Integrates Zustand store with Convex API and Clerk authentication
 */
export function useProjectTracking() {
  const convex = useConvex();
  const { user } = useUser();
  const store = useTrackingStore();
  const apiInitialized = useRef(false);

  // Initialize API bindings
  useEffect(() => {
    if (convex && !apiInitialized.current) {
      bindTrackingApi(store, convex);
      apiInitialized.current = true;
    }
  }, [convex, store]);

  // Auto-fetch data when user is available
  useEffect(() => {
    if (user?.id && apiInitialized.current) {
      const userId = user.id;

      // Check if we need to fetch fresh data
      if (trackingCache.shouldRefresh(store.lastFetch.projects, 'projects')) {
        store.fetchProjects(userId);
      }

      if (trackingCache.shouldRefresh(store.lastFetch.portfolio, 'portfolio')) {
        store.fetchPortfolioSummary(userId);
      }

      // Start real-time subscriptions
      store.startSubscriptions(userId, convex);

      // Cleanup subscriptions on unmount
      return () => {
        store.stopSubscriptions();
      };
    }
  }, [user?.id, convex, store]);

  // Auto-fetch selected project details
  useEffect(() => {
    if (user?.id && store.selectedProjectId && apiInitialized.current) {
      if (trackingCache.shouldRefresh(store.lastFetch.selectedProject, 'selectedProject')) {
        store.fetchSelectedProject(store.selectedProjectId, user.id);
      }
    }
  }, [user?.id, store.selectedProjectId, store]);

  return {
    // Data
    projects: store.getFilteredProjects(),
    selectedProject: store.selectedProject,
    portfolioSummary: store.portfolioSummary,

    // UI State
    filters: store.filters,
    selectedProjectId: store.selectedProjectId,

    // Loading states
    loading: store.loading,

    // Error states
    errors: store.errors,

    // Computed values
    activeAlertsCount: store.getActiveAlertsCount(),
    completionRate: store.getCompletionRate(),
    totalCarbonImpact: store.getTotalCarbonImpact(),

    // Actions
    setFilters: store.setFilters,
    setSelectedProject: store.setSelectedProject,
    clearErrors: store.clearErrors,
    resetFilters: store.resetFilters,

    // Manual refresh
    refreshAllData: () => user?.id ? store.refreshAllData(user.id) : Promise.resolve(),
    refreshProjects: () => user?.id ? store.fetchProjects(user.id) : Promise.resolve(),
    refreshPortfolio: () => user?.id ? store.fetchPortfolioSummary(user.id) : Promise.resolve(),

    // Utilities
    getProjectById: store.getProjectById,
    isAuthenticated: !!user?.id,
    userId: user?.id,
  };
}

/**
 * Hook for project selection and details
 */
export function useProjectDetails(projectId?: string) {
  const { user } = useUser();
  const store = useTrackingStore();

  useEffect(() => {
    if (projectId && projectId !== store.selectedProjectId) {
      store.setSelectedProject(projectId);
    }
  }, [projectId, store]);

  const selectedProject = store.selectedProject;
  const loading = store.loading.selectedProject;
  const error = store.errors.selectedProject;

  return {
    project: selectedProject,
    loading,
    error,
    isSelected: selectedProject?.projectId === projectId,
    refresh: () => {
      if (user?.id && projectId) {
        store.fetchSelectedProject(projectId, user.id);
      }
    },
  };
}

/**
 * Hook for portfolio metrics and summary
 */
export function usePortfolioMetrics() {
  const store = useTrackingStore();

  return {
    summary: store.portfolioSummary,
    loading: store.loading.portfolio,
    error: store.errors.portfolio,

    // Computed metrics
    metrics: {
      totalProjects: store.projects.length,
      activeAlerts: store.getActiveAlertsCount(),
      completionRate: store.getCompletionRate(),
      totalCarbonImpact: store.getTotalCarbonImpact(),
      averageProgress: store.projects.length > 0
        ? Math.round(
            store.projects.reduce((sum, p) => sum + p.currentStatus.overallProgress, 0) /
            store.projects.length
          )
        : 0,
    },

    // Portfolio health indicators
    health: {
      alertsRatio: store.projects.length > 0
        ? store.getActiveAlertsCount() / store.projects.length
        : 0,
      onTrackProjects: store.projects.filter(p =>
        p.currentStatus.overallProgress >= 80 ||
        p.alerts.filter(a => !a.isResolved).length === 0
      ).length,
      atRiskProjects: store.projects.filter(p =>
        p.alerts.some(a => !a.isResolved && (a.severity === 'high' || a.severity === 'critical'))
      ).length,
    },
  };
}

/**
 * Hook for filtering and sorting projects
 */
export function useProjectFilters() {
  const store = useTrackingStore();

  const availableFilters = {
    statuses: ['all', 'active', 'completed', 'issues'] as const,
    sortOptions: ['recent', 'progress', 'alerts', 'investment', 'carbon_impact'] as const,
    projectTypes: [...new Set(store.projects.map(p => p.projectType))],
    timeframes: ['all', '30d', '90d', '1y'] as const,
  };

  return {
    filters: store.filters,
    availableFilters,
    setFilters: store.setFilters,
    resetFilters: store.resetFilters,

    // Quick filter actions
    filterByStatus: (status: string) => store.setFilters({ status: status as any }),
    sortBy: (sortBy: string) => store.setFilters({ sortBy: sortBy as any }),
    filterByType: (projectType: string) => store.setFilters({ projectType }),
    filterByTimeframe: (timeframe: string) => store.setFilters({ timeframe: timeframe as any }),
  };
}

/**
 * Hook for alerts and notifications
 */
export function useProjectAlerts() {
  const store = useTrackingStore();

  const alerts = store.projects.flatMap(project =>
    project.alerts
      .filter(alert => !alert.isResolved)
      .map(alert => ({
        ...alert,
        projectId: project.projectId,
        projectTitle: project.projectTitle,
        projectType: project.projectType,
      }))
  );

  const alertsBySecerity = {
    critical: alerts.filter(a => a.severity === 'critical'),
    high: alerts.filter(a => a.severity === 'high'),
    medium: alerts.filter(a => a.severity === 'medium'),
    low: alerts.filter(a => a.severity === 'low'),
  };

  return {
    alerts,
    alertsBySecerity,
    totalAlerts: alerts.length,
    criticalAlerts: alertsBySecerity.critical.length,

    // Alert utilities
    getAlertsForProject: (projectId: string) =>
      alerts.filter(alert => alert.projectId === projectId),

    hasAlerts: alerts.length > 0,
    hasCriticalAlerts: alertsBySecerity.critical.length > 0,
  };
}

/**
 * Hook for real-time updates and subscriptions
 */
export function useRealTimeTracking() {
  const { user } = useUser();
  const convex = useConvex();
  const store = useTrackingStore();

  const startRealTimeUpdates = () => {
    if (user?.id && convex) {
      store.startSubscriptions(user.id, convex);
    }
  };

  const stopRealTimeUpdates = () => {
    store.stopSubscriptions();
  };

  const isSubscribed = Object.values(store.subscriptions).some(sub => sub !== null);

  return {
    isSubscribed,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    lastUpdate: Math.max(
      store.lastFetch.projects || 0,
      store.lastFetch.selectedProject || 0,
      store.lastFetch.portfolio || 0
    ),
  };
}

/**
 * Hook for error handling
 */
export function useTrackingErrors() {
  const store = useTrackingStore();

  const hasErrors = Object.values(store.errors).some(error => error !== null);
  const errorMessages = Object.entries(store.errors)
    .filter(([_, error]) => error !== null)
    .map(([type, error]) => ({ type, message: error }));

  return {
    hasErrors,
    errors: store.errors,
    errorMessages,
    clearErrors: store.clearErrors,

    // Error utilities
    hasProjectsError: !!store.errors.projects,
    hasSelectedProjectError: !!store.errors.selectedProject,
    hasPortfolioError: !!store.errors.portfolio,
  };
}