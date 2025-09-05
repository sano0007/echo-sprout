import { NextRequest, NextResponse } from 'next/server';
import { api } from '../../../../../../packages/backend/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      priceRange: searchParams.get('priceRange') || undefined,
      location: searchParams.get('location') || undefined,
      projectType: searchParams.get('projectType') || undefined,
      sortBy: searchParams.get('sortBy') || 'newest',
    };

    const projects = await convex.query(
      api.marketplace.getMarketplaceProjects,
      filters
    );

    return NextResponse.json({
      success: true,
      data: projects,
      count: projects.length,
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
