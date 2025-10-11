/**
 * Role-based redirect configuration
 * Maps user roles to their default dashboard routes
 */

export type UserRole =
  | 'admin'
  | 'project_creator'
  | 'verifier'
  | 'credit_buyer';

export const ROLE_REDIRECTS: Record<UserRole, string> = {
  admin: '/admin/dashboard',
  project_creator: '/projects/manage',
  verifier: '/verification/dashboard',
  credit_buyer: '/buyer-dashboard',
};

/**
 * Routes that are accessible by specific roles
 */
export const ROLE_ROUTES: Record<UserRole, string[]> = {
  admin: ['*'], // Admin has access to all routes
  project_creator: [
    '/projects',
    '/projects/manage',
    '/projects/register',
    '/profile',
    '/marketplace',
    '/learn',
    '/community',
  ],
  verifier: [
    '/verification',
    '/verification/dashboard',
    '/verification/review',
    '/profile',
    '/marketplace',
    '/learn',
    '/community',
  ],
  credit_buyer: [
    '/buyer-dashboard',
    '/checkout',
    '/profile',
    '/marketplace',
    '/learn',
    '/community',
  ],
};

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  '/',
  '/marketplace',
  '/marketplace/[id]',
  '/learn',
  '/auth/register',
  '/auth/login',
  '/api',
];

/**
 * Routes that require authentication but are accessible to all roles
 */
export const PROTECTED_ROUTES = ['/profile', '/community/forum'];

/**
 * Get the default redirect path for a user role
 */
export function getRoleRedirect(role: UserRole): string {
  return ROLE_REDIRECTS[role] || '/';
}

/**
 * Check if a user role has access to a specific route
 */
export function hasRouteAccess(role: UserRole, path: string): boolean {
  // Admin has access to all routes
  if (role === 'admin') {
    return true;
  }

  // Check if route is in public routes
  if (PUBLIC_ROUTES.some((route) => path.startsWith(route))) {
    return true;
  }

  // Check if route is in protected routes (accessible to all authenticated users)
  if (PROTECTED_ROUTES.some((route) => path.startsWith(route))) {
    return true;
  }

  // Check if route is in role-specific routes
  const roleRoutes = ROLE_ROUTES[role];
  return roleRoutes.some((route) => {
    if (route === '*') return true;
    return path.startsWith(route);
  });
}

/**
 * Determine if a path is a public route
 */
export function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    // Handle dynamic routes like /marketplace/[id]
    const routePattern = route.replace(/\[.*?\]/g, '[^/]+');
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(path) || path.startsWith(route);
  });
}
