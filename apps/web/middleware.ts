import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getRoleRedirect, hasRouteAccess, isPublicRoute, UserRole } from './lib/role-redirects';

// Define public routes that don't require authentication
const isPublicRouteMatch = createRouteMatcher([
  '/',
  '/marketplace(.*)',
  '/learn(.*)',
  '/auth/(.*)',
  '/api/(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const path = req.nextUrl.pathname;

  // Allow public routes
  if (isPublicRouteMatch(req)) {
    return NextResponse.next();
  }

  // Require authentication for all other routes
  if (!userId) {
    const signInUrl = new URL('/auth/login', req.url);
    signInUrl.searchParams.set('redirect_url', path);
    return NextResponse.redirect(signInUrl);
  }

  // Get user role from public metadata (set by Clerk)
  const publicMetadata = sessionClaims?.publicMetadata as { role?: UserRole } | undefined;
  const userRole = publicMetadata?.role;

  // If no role is set yet, allow the request to proceed
  // The user might be on the registration page setting their role
  if (!userRole && !path.startsWith('/auth/register')) {
    return NextResponse.redirect(new URL('/auth/register', req.url));
  }

  // Handle role-based redirects after login
  if (userRole) {
    // If user is on login/register page and already authenticated, redirect to their dashboard
    if (path.startsWith('/auth/login') || path.startsWith('/auth/register')) {
      const dashboardUrl = getRoleRedirect(userRole);
      return NextResponse.redirect(new URL(dashboardUrl, req.url));
    }

    // Check if user has access to the requested route
    if (!hasRouteAccess(userRole, path)) {
      // Redirect to user's default dashboard if they don't have access
      const dashboardUrl = getRoleRedirect(userRole);
      return NextResponse.redirect(new URL(dashboardUrl, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
