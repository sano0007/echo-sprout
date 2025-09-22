import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@packages/backend/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(_req: NextRequest) {
  try {
    const { userId, getToken } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    const token = await getToken?.();
    convex.setAuth(async () => token ?? null);
    const items = await convex.query((api as any).forum.listUserTopics, {});
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Error listing my topics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
