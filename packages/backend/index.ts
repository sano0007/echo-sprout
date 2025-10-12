// Export the Convex API and types for use by other packages
export { api } from './convex/_generated/api';
export type { Id } from './convex/_generated/dataModel';
export type { Doc, Id as ConvexId } from './convex/_generated/dataModel';

// Export services
export { StripeService } from './services/stripe-service';
