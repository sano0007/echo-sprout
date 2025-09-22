import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@packages/backend/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const body = await req.json();
    const { title, content, category, tags } = body as {
      title?: string;
      content?: string;
      category?: string;
      tags?: string[];
    };
    const result = await convex.mutation((api as any).forum.updateTopic, {
      id: params.id,
      title,
      content,
      category,
      tags,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error updating topic:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const result = await convex.mutation((api as any).forum.deleteTopic, {
      id: params.id,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json(
      { success: false, error: 'Internal error' },
      { status: 500 }
    );
  }
}
