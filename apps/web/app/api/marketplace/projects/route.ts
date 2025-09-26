import { api } from '@packages/backend/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';
import { NextRequest, NextResponse } from 'next/server';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      priceRange: searchParams.get('priceRange') || undefined,
      location: searchParams.get('location') || undefined,
      projectType: searchParams.get('projectType') || undefined,
      sortBy: searchParams.get('sortBy') || 'newest',
      searchQuery: searchParams.get('searchQuery') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : 6,
    };

    const result = await convex.query(
      api.marketplace.getMarketplaceProjects,
      filters
    );

    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.data.length,
      totalCount: result.totalCount,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    });
  } catch (error) {
    console.error('Error fetching marketplace projects:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch marketplace projects',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
