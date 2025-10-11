import { api } from '@packages/backend';
import { Id } from '@packages/backend';
import { ConvexHttpClient } from 'convex/browser';
import { NextRequest, NextResponse } from 'next/server';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json();

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Get certificate data from Convex
    const certificateData = await convex.query(
      api.transactions.getCertificateData,
      {
        transactionId: transactionId as Id<'transactions'>,
      }
    );

    return NextResponse.json(certificateData);
  } catch (error) {
    console.error('Error getting certificate data:', error);
    return NextResponse.json(
      { error: 'Failed to get certificate data' },
      { status: 500 }
    );
  }
}
