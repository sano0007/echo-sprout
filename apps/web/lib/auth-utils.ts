import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@packages/backend/convex/_generated/api';
import { UserRole } from './role-redirects';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Get the current user with role information from Convex
 * Server-side only
 */
export async function getCurrentUserWithRole() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    // Fetch user from Convex by Clerk ID
    const user = await convex.query(api.users.getCurrentUser);

    return user;
  } catch (error) {
    console.error('Error fetching user with role:', error);
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;

  // Admin has access to everything
  if (userRole === 'admin') return true;

  return userRole === requiredRole;
}

/**
 * Check if user has any of the required roles
 */
export function hasAnyRole(userRole: UserRole | undefined, requiredRoles: UserRole[]): boolean {
  if (!userRole) return false;

  // Admin has access to everything
  if (userRole === 'admin') return true;

  return requiredRoles.includes(userRole);
}

/**
 * Get authentication status and user info
 */
export async function getAuthStatus() {
  const { userId } = await auth();

  if (!userId) {
    return {
      isAuthenticated: false,
      user: null,
    };
  }

  const user = await getCurrentUserWithRole();

  return {
    isAuthenticated: true,
    user,
  };
}
