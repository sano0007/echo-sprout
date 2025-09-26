import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@packages/backend/convex/_generated/api';

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const priceRange = searchParams.get('priceRange') || undefined;
    const location = searchParams.get('location') || undefined;
    const projectType = searchParams.get('projectType') || undefined;
    const sortBy = searchParams.get('sortBy') || undefined;
    const searchQuery = searchParams.get('searchQuery') || undefined;
    const page = searchParams.get('page')
      ? parseInt(searchParams.get('page')!)
      : undefined;
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : undefined;

    // Call the Convex query
    const result = await client.query(api.marketplace.getMarketplaceProjects, {
      priceRange,
      location,
      projectType,
      sortBy,
      searchQuery,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
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
        error: 'Failed to fetch projects',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
