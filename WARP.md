# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

EcoSprout is a carbon credit marketplace platform connecting project developers, verifiers, and buyers. It's built as a Turbo monorepo with Next.js frontend and Convex backend-as-a-service.

## Development Commands

### Common Development Tasks

```bash
# Install dependencies (uses Bun as package manager)
bun install

# Start development server (all apps)
bun dev
# or from root using turbo
turbo run dev

# Start only web app
cd apps/web
bun dev

# Start Convex backend
cd packages/backend
bun run dev
# or
npx convex dev

# Build all apps
bun run build
# or
turbo run build

# Lint all packages
bun run lint
# or
turbo run lint

# Type checking
bun run check-types
# or
turbo run check-types

# Format code
bun run format
```

### Backend Development

```bash
# Generate Convex functions/schema
cd packages/backend
bun run codegen
# or
npx convex codegen

# Set up Convex (first time)
bun run setup
# or
npx convex dev --until-success

# Seed database with sample data
cd packages/backend
node scripts/run-seed.js

# Clear database (use with caution)
node scripts/run-seed.js clear
```

### Single Test Commands

```bash
# No formal test setup currently exists
# Tests mentioned in docs but no test configuration found
# ESLint serves as primary code quality check
```

## Architecture Overview

### Monorepo Structure

This is a **Turbo monorepo** with the following structure:

- **`apps/web/`** - Main Next.js 15 application using App Router
- **`packages/backend/`** - Convex backend with database functions
- **`packages/types/`** - Shared TypeScript types
- **`packages/ui/`** - Shared UI components
- **`packages/eslint-config/`** - Shared ESLint configuration
- **`packages/typescript-config/`** - Shared TypeScript configuration

### Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, React 19
- **Authentication**: Clerk
- **Backend**: Convex (BaaS) with real-time capabilities
- **Build System**: Turbo (monorepo orchestration)
- **Package Manager**: Bun (specified in `packageManager` field)
- **Styling**: Tailwind CSS v3 + PostCSS

### Database Schema (Convex)

The Convex schema defines these core entities:

- **`users`** - Project creators, verifiers, buyers, admins with role-based permissions
- **`projects`** - Carbon credit projects with verification workflow
- **`transactions`** - Credit purchases with Stripe integration
- **`verifications`** - Verification process tracking with detailed checklists
- **`carbonCredits`** - Individual credit batches and availability
- **`documents`** - Project documentation management

### Application Routes (Next.js App Router)

Key route structure in `apps/web/app/`:

- **`/auth/register`** - Multi-role user registration
- **`/projects/register`** - Project creation wizard
- **`/projects/manage`** - Project management dashboard
- **`/marketplace`** - Credit browsing and purchasing
- **`/verification/dashboard`** - Verifier dashboard
- **`/verification/review/[id]`** - Project review interface
- **`/monitoring/dashboard`** - Project monitoring
- **`/buyer-dashboard`** - Buyer impact tracking
- **`/learn`** - Educational content hub

### Key Services & Business Logic

- **MarketplaceService** - Project listing and filtering
- **WorkflowService** - Project status transitions
- **VerifierAssignmentService** - Automatic verifier assignment
- **StripeService** - Payment processing integration

### User Roles & Permissions

- **Project Creators** - Register and manage carbon credit projects
- **Verifiers** - Review projects against international standards (VCS, Gold Standard, CCBS)
- **Credit Buyers** - Purchase credits and track environmental impact
- **Admins** - Platform management and oversight

## Development Environment Setup

### Prerequisites

- **Bun** (recommended) or Node.js 18+
- **Git**

### Environment Variables

Required in `apps/web/.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Convex Database
CONVEX_DEPLOYMENT=your_convex_deployment
NEXT_PUBLIC_CONVEX_URL=your_convex_url
```

### Initial Setup Steps

1. Clone repository
2. Run `bun install` in root
3. Copy `apps/web/.env.example` to `apps/web/.env.local`
4. Configure environment variables
5. Start Convex: `cd packages/backend && npx convex dev`
6. Seed database: `node scripts/run-seed.js`
7. Start web app: `cd apps/web && bun dev`

## Key Implementation Patterns

### Authentication Flow

- Clerk handles user authentication/management
- Middleware in `apps/web/middleware.ts` protects routes
- Users synced to Convex database via webhooks
- Role-based access control throughout application

### State Management

- Convex provides real-time reactive queries
- Zustand for client-side state management
- React Context for provider patterns (ConvexProviderWithClerk)

### File Uploads

- Uses Convex storage for document/image uploads
- Cloudinary integration for project images
- Multi-step upload flow with progress tracking

### Project Verification Workflow

Complex multi-stage process:

1. Project submission (draft → submitted)
2. Automatic verifier assignment based on specialty
3. Document review and validation
4. Standards compliance checking (VCS/Gold Standard/CCBS)
5. Approval/rejection with detailed feedback
6. Credit generation upon verification success

### Payment Processing

- Stripe integration for secure transactions
- Checkout sessions for credit purchases
- Webhook handling for payment completion
- Certificate generation post-purchase

## Code Organization Principles

### Component Architecture

- Shared components in `apps/web/components/`
- Page-specific components co-located with routes
- Reusable UI components in `packages/ui/`

### Database Patterns

- Convex functions organized by domain (projects.ts, users.ts, marketplace.ts)
- Comprehensive indexing for query performance
- Real-time subscriptions for live updates
- Proper validation using Convex value schemas

### Type Safety

- Strict TypeScript configuration across packages
- Shared types in `packages/types/`
- Convex schema provides type generation
- Zod for runtime validation where needed

## Integration Points

### External Services

- **Clerk**: User authentication and management
- **Convex**: Database, real-time functions, file storage
- **Stripe**: Payment processing for credit purchases
- **Cloudinary**: Image optimization and management

### Webhook Endpoints

- `/api/webhooks/clerk` - User synchronization
- `/api/webhooks/stripe` - Payment processing events

This platform facilitates the complete carbon credit lifecycle from project registration through verification to trading, emphasizing transparency and standards compliance in environmental impact tracking.
