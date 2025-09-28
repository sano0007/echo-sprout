# Backend Package

This package contains the backend services and database logic for the Echo Sprout carbon credit marketplace.

## Structure

- **convex/** - Convex database functions (queries, mutations, schemas)
- **handlers/** - Webhook handlers (Clerk, Stripe)
- **services/** - Business logic services
- **scripts/** - Database seeding and utility scripts
- **types/** - TypeScript type definitions

## Database Seeding

The backend includes a comprehensive database seeding system to populate your development environment with realistic data.

### Quick Start

1. **Ensure Convex is running:**

   ```bash
   npx convex dev
   ```

2. **Set your environment variable:**

   ```bash
   export CONVEX_URL="your-convex-deployment-url"
   # or add it to your .env.local file
   ```

3. **Run the seeding script:**
   ```bash
   cd packages/backend
   node scripts/run-seed.js
   ```

### What Gets Created

The seeding script creates:

**6 Sample Projects:**

- Amazon Rainforest Conservation (Reforestation)
- Solar Farm Initiative - Rajasthan (Solar)
- Offshore Wind Energy Project (Wind)
- Community Biogas Development (Biogas)
- Urban Waste-to-Energy Facility (Waste Management)
- Mangrove Ecosystem Restoration (Mangrove)

**3 Sample Users/Organizations:**

- Green Earth Foundation
- Solar Power Co
- Nordic Wind Solutions

### Script Commands

```bash
# Seed database with sample data (default)
node scripts/run-seed.js
node scripts/run-seed.js seed

# Clear all data (use with caution!)
node scripts/run-seed.js clear
```

### Sample Project Data

Each project includes:

- Realistic pricing ($12-$25 per credit)
- Varying credit availability (650-3000 credits)
- Different project statuses and verification states
- Proper location data with coordinates
- Comprehensive project details (budget, timeline, impact metrics)
- Document tracking and completion status

### Development Workflow

1. Start Convex: `npx convex dev`
2. Seed database: `node scripts/run-seed.js`
3. Start frontend: `npm run dev`
4. Test purchase flows with seeded projects

### Database Schema

The seeding script works with these main tables:

- `users` - Project creators and buyers
- `projects` - Carbon credit projects
- `transactions` - Purchase transactions
- `userWallet` - User credit balances

### Troubleshooting

**"CONVEX_URL not found"**

- Ensure you've set the environment variable
- Check your `.env.local` file

**"Seeding failed"**

- Verify Convex is running (`npx convex dev`)
- Check that mutations are deployed
- Ensure proper network connection

**Projects not showing in marketplace**

- Verify the marketplace service is properly configured
- Check API endpoints are working
- Ensure projects have `active` status

## Services

- **MarketplaceService** - Handles project listing and filtering
- **StripeService** - Payment processing and checkout sessions
- **UserService** - User management and authentication

## Webhooks

- **Clerk Webhook** - User synchronization
- **Stripe Webhook** - Payment processing and transaction updates

## Installation

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.19. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
