# @echo-sprout/types

Shared TypeScript types for the Echo Sprout carbon credit marketplace.

## Installation

This package is designed to be used within the Echo Sprout monorepo.

```bash
npm install @echo-sprout/types
```

## Usage

```typescript
import { MarketplaceProject, User, ProjectStatus } from "@echo-sprout/types";
```

## Available Types

### Marketplace

- `MarketplaceProject` - Project data structure for the marketplace
- `MarketplaceFilters` - Filter options for marketplace search
- `MarketplaceApiResponse` - API response structure for marketplace endpoints

### Project

- `Project` - Full project data structure from database
- `ProjectLocation` - Geographic location information
- `ProjectStatus` - Project lifecycle status
- `ProjectType` - Available project types
- `VerificationStatus` - Project verification status

### User

- `User` - User data structure from database
- `UserRole` - Available user roles

### API

- `ApiResponse<T>` - Generic API response structure
- `PaginatedResponse<T>` - Paginated API response structure
- `ApiError` - Error response structure
- `ValidationError` - Validation error structure

## Development

```bash
# Build the types
npm run build

# Watch for changes
npm run dev

# Clean build artifacts
npm run clean
```
