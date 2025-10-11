import { useQuery } from 'convex/react';
import { api } from '@packages/backend';
import { Doc, Id } from '@packages/backend/convex/_generated/dataModel';

/**
 * User role type
 */
export type UserRole =
  | 'project_creator'
  | 'credit_buyer'
  | 'verifier'
  | 'admin';

/**
 * Current user type (includes all fields from the users table)
 */
export type CurrentUser = Doc<'users'>;

/**
 * Custom hook to get the current authenticated user with their role and profile information
 *
 * @returns The current user object or undefined if not authenticated or still loading
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const currentUser = useCurrentUser();
 *
 *   if (!currentUser) {
 *     return <div>Loading...</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {currentUser.firstName}!</p>
 *       <p>Role: {currentUser.role}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCurrentUser(): CurrentUser | undefined {
  const user = useQuery(api.users.getCurrentUser);
  return user ?? undefined;
}

/**
 * Type guard to check if user is an admin
 */
export function isAdmin(user: CurrentUser | undefined): boolean {
  return user?.role === 'admin';
}

/**
 * Type guard to check if user is a project creator
 */
export function isProjectCreator(user: CurrentUser | undefined): boolean {
  return user?.role === 'project_creator';
}

/**
 * Type guard to check if user is a credit buyer
 */
export function isCreditBuyer(user: CurrentUser | undefined): boolean {
  return user?.role === 'credit_buyer';
}

/**
 * Type guard to check if user is a verifier
 */
export function isVerifier(user: CurrentUser | undefined): boolean {
  return user?.role === 'verifier';
}

/**
 * Get user's full name
 */
export function getUserFullName(user: CurrentUser | undefined): string {
  if (!user) return '';
  return `${user.firstName} ${user.lastName}`.trim();
}

/**
 * Get user's initials for avatar
 */
export function getUserInitials(user: CurrentUser | undefined): string {
  if (!user) return '';
  const firstInitial = user.firstName?.[0]?.toUpperCase() || '';
  const lastInitial = user.lastName?.[0]?.toUpperCase() || '';
  return `${firstInitial}${lastInitial}`;
}

/**
 * Get dashboard route based on user role
 */
export function getDashboardRoute(user: CurrentUser | undefined): string {
  if (!user) return '/';

  switch (user.role) {
    case 'admin':
      return '/admin/dashboard';
    case 'project_creator':
      return '/creator-dashboard';
    case 'verifier':
      return '/verification/dashboard';
    case 'credit_buyer':
      return '/buyer-dashboard';
    default:
      return '/profile';
  }
}
