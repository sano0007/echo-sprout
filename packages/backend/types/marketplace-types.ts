export interface MarketplaceProject {
  id: number;
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
}
