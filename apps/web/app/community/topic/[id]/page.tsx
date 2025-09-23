'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

export default function TopicDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const data = useQuery((api as any).forum.getTopicById, { id: params.id });

  if (data === undefined) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse text-gray-500">Loading topic…</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-red-600">Topic not found.</div>
        <div className="mt-4">
          <Link
            href="/community/forum"
            className="text-blue-600 hover:underline"
          >
            Back to Forum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{data.title}</h1>
          <div className="text-sm text-gray-600 mt-1">
            by {data.author} • 👁️ {data.views} • 💬 {data.replies}
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href="/community/forum"
            className="text-blue-600 hover:underline"
          >
            Back to Forum
          </Link>
          <Link
            href="/community/my-topics"
            className="text-blue-600 hover:underline"
          >
            My Topics
          </Link>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {data.tags?.map((t: string) => (
          <span
            key={t}
            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
          >
            #{t}
          </span>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-5 mb-8">
        <h2 className="text-lg font-semibold mb-3">Content</h2>
        <p className="text-gray-800 whitespace-pre-wrap">{data.content}</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-5 border-b">
          <h3 className="text-lg font-semibold">
            Replies ({data.replyItems?.length || 0})
          </h3>
        </div>
        <div className="divide-y">
          {(data.replyItems || []).length === 0 ? (
            <div className="p-5 text-gray-600">No replies yet.</div>
          ) : (
            data.replyItems.map((r: any) => (
              <div key={r.id} className="p-5">
                <div className="text-sm text-gray-600 mb-2">{r.author}</div>
                <div className="text-gray-800 whitespace-pre-wrap">
                  {r.content}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  ⬆ {r.upvotes} ⬇ {r.downvotes}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
