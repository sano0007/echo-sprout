# Role-Based Routing Setup Guide

This guide explains how to set up and use the role-based routing system in your application.

## Overview

The application now supports automatic role-based routing that redirects users to their appropriate dashboard based on their role:

- **Admin** → `/admin/dashboard`
- **Project Creator** → `/projects/manage`
- **Verifier** → `/verification/dashboard`
- **Credit Buyer** → `/buyer-dashboard`

## How It Works

### 1. User Roles

The system recognizes 4 roles defined in your Convex schema:

- `admin` - Full access to all routes including admin panel
- `project_creator` - Access to project management features
- `verifier` - Access to verification features
- `credit_buyer` - Access to marketplace and purchase features

### 2. Route Protection

- **Public Routes**: `/`, `/marketplace`, `/learn`, `/auth/*` - No authentication required
- **Protected Routes**: `/profile`, `/community/forum` - Requires authentication
- **Role-Specific Routes**: Requires specific role access

### 3. Automatic Redirects

When a user logs in, they are automatically redirected to their role-specific dashboard:

```typescript
// Middleware checks user role and redirects accordingly
if (userRole === 'admin') {
  redirect to '/admin/dashboard'
} else if (userRole === 'project_creator') {
  redirect to '/projects/manage'
}
// ... and so on
```

## Setting Up User Roles

### Option 1: Set Role in Clerk Dashboard (Manual)

1. Go to your Clerk Dashboard
2. Navigate to Users
3. Select a user
4. Go to "Metadata" tab
5. Add to **Public Metadata**:
   ```json
   {
     "role": "admin"
   }
   ```
   Replace `"admin"` with the appropriate role: `admin`, `project_creator`, `verifier`, or `credit_buyer`

### Option 2: Set Role via Webhook (Recommended)

Create a Clerk webhook to automatically sync user data with Convex:

1. In Clerk Dashboard, go to Webhooks
2. Create a new webhook endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to events: `user.created`, `user.updated`
4. The webhook should:
   - Create/update user in Convex database
   - Set role in Clerk public metadata

Example webhook handler:

```typescript
// app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const payload = await req.json();

  // Verify webhook
  // ... verification code

  if (payload.type === "user.created") {
    const { id, email_addresses } = payload.data;

    // Create user in Convex with role
    // ... convex mutation

    // Update Clerk metadata
    await clerkClient.users.updateUser(id, {
      publicMetadata: {
        role: "credit_buyer", // or get from registration form
      },
    });
  }

  return new Response("OK", { status: 200 });
}
```

### Option 3: Set Role During Registration

Update your registration form to set the role in Clerk after user signup:

```typescript
// In your registration component
import { useClerk } from "@clerk/nextjs";

const { user } = useClerk();

// After successful registration
await user?.update({
  publicMetadata: {
    role: selectedRole, // from your form
  },
});
```

## Files Created

### 1. `/apps/web/lib/role-redirects.ts`

- Role-to-route mapping configuration
- Route access control functions
- Public/protected route definitions

### 2. `/apps/web/lib/auth-utils.ts`

- Server-side authentication utilities
- Role checking functions
- User fetching helpers

### 3. `/apps/web/middleware.ts`

- Updated with role-based routing logic
- Automatic dashboard redirects
- Route protection

### 4. `/apps/web/app/admin/dashboard/page.tsx`

- New admin dashboard
- Admin-only access
- System overview and management links

## Testing the Setup

1. **Create a test user** in Clerk Dashboard
2. **Set their role** in Public Metadata:
   ```json
   { "role": "admin" }
   ```
3. **Log in** with that user
4. **Verify redirect** to `/admin/dashboard`

## Route Access Matrix

| Role                | Accessible Routes                                                                   |
| ------------------- | ----------------------------------------------------------------------------------- |
| **Admin**           | All routes (full access)                                                            |
| **Project Creator** | `/projects/*`, `/profile`, `/marketplace`, `/learn`, `/community`                   |
| **Verifier**        | `/verification/*`, `/profile`, `/marketplace`, `/learn`, `/community`               |
| **Credit Buyer**    | `/buyer-dashboard`, `/checkout`, `/profile`, `/marketplace`, `/learn`, `/community` |

## Customization

### Add New Role-Specific Routes

Edit `/apps/web/lib/role-redirects.ts`:

```typescript
export const ROLE_ROUTES: Record<UserRole, string[]> = {
  admin: ["*"],
  project_creator: [
    "/projects",
    "/new-feature", // Add new route
    // ...
  ],
  // ...
};
```

### Change Default Dashboard

Edit the `ROLE_REDIRECTS` object:

```typescript
export const ROLE_REDIRECTS: Record<UserRole, string> = {
  admin: "/custom-admin-dashboard",
  // ...
};
```

## Troubleshooting

### User keeps getting redirected to registration

- Check if user has `role` set in Clerk Public Metadata
- Verify the role value matches one of: `admin`, `project_creator`, `verifier`, `credit_buyer`

### User gets "Access Denied" to routes they should access

- Check `ROLE_ROUTES` in `/apps/web/lib/role-redirects.ts`
- Ensure the route path matches exactly (including leading `/`)

### Middleware not working

- Ensure middleware config matcher includes the route
- Check that Clerk session is active
- Verify `NEXT_PUBLIC_CONVEX_URL` is set in `.env`

## Next Steps

1. **Set up Clerk webhook** to automatically sync user roles
2. **Update registration flow** to allow users to select their role
3. **Implement admin panel** features for user role management
4. **Add role-based UI components** that show/hide based on user role

## Support

For issues or questions:

- Check Clerk documentation: https://clerk.com/docs
- Check Next.js middleware docs: https://nextjs.org/docs/app/building-your-application/routing/middleware
- Review Convex docs: https://docs.convex.dev/
