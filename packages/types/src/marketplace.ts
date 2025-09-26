import { Id } from "@packages/backend/convex/_generated/dataModel";

export interface MarketplaceProject {
  id: Id<"projects">; // Convex ID
  name: string;
  type: string;
  location: string;
  price: number;
  credits: number;
  image: string;
  creator: string;
  rating: number;
}

export interface MarketplaceFilters {
  priceRange?: string;
  location?: string;
  projectType?: string;
  sortBy?: string;
  searchQuery?: string;
  page?: number;
  limit?: number;
}

export interface MarketplaceApiResponse {
  success: boolean;
  data: MarketplaceProject[];
  count: number;
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  error?: string;
  message?: string;
}

export type VerificationStatus =
  | "pending"
  | "in_progress"
  | "verified"
  | "rejected"
  | "revision_required";
