'use client';

import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { useParams } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function TopicDetailPage() {
  const routeParams = useParams<{ id: string | string[] }>();
  const idParam = Array.isArray(routeParams?.id)
    ? routeParams.id[0]
    : routeParams?.id;
  const data = useQuery((api as any).forum.getTopicById, { id: idParam });
  const createReply = useMutation((api as any).forum.createReply);
  const upvoteReply = useMutation((api as any).forum.upvoteReply);
  const downvoteReply = useMutation((api as any).forum.downvoteReply);
  const incrementViews = useMutation((api as any).forum.incrementViews);
  const [reply, setReply] = useState('');
  const [posting, setPosting] = useState(false);
  const [notice, setNotice] = useState<{
    msg: string;
    type: 'success' | 'error';
  } | null>(null);

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !idParam) return;
    setPosting(true);
    try {
      await createReply({ topicId: idParam as any, content: reply.trim() });
      setReply('');
      setNotice({ msg: 'Reply posted', type: 'success' });
      setTimeout(() => setNotice(null), 2500);
    } catch {
      setNotice({ msg: 'Failed to post reply', type: 'error' });
      setTimeout(() => setNotice(null), 2500);
    } finally {
      setPosting(false);
    }
  };

  // Increment view count when landing on a topic
  useEffect(() => {
    if (!idParam) return;
    (async () => {
      try {
        const key = 'viewed_topics';
        const raw = typeof window !== 'undefined' ? sessionStorage.getItem(key) : null;
        const viewed: string[] = raw ? JSON.parse(raw) : [];
        const sid = String(idParam);
        if (viewed.includes(sid)) return; // already counted in this session
        viewed.push(sid);
        if (typeof window !== 'undefined') sessionStorage.setItem(key, JSON.stringify(viewed));
        // @ts-ignore Convex validates id at runtime
        await incrementViews({ id: idParam });
      } catch {}
    })();
  }, [idParam]);

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
      {notice && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`text-white px-4 py-2 rounded shadow ${
              notice.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {notice.msg}
          </div>
        </div>
      )}
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
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-700">
                  <button
                    className={`px-2 py-1 border rounded hover:bg-gray-50 ${
                      r.userVote === 1
                        ? 'bg-blue-600 text-white border-blue-600'
                        : ''
                    }`}
                    onClick={async () => {
                      try {
                        await upvoteReply({ id: r.id });
                      } catch {}
                    }}
                  >
                    ⬆ Upvote
                  </button>
                  <span className="text-gray-500">{r.upvotes}</span>
                  <button
                    className={`px-2 py-1 border rounded hover:bg-gray-50 ${
                      r.userVote === -1
                        ? 'bg-red-600 text-white border-red-600'
                        : ''
                    }`}
                    onClick={async () => {
                      try {
                        await downvoteReply({ id: r.id });
                      } catch {}
                    }}
                  >
                    ⬇ Downvote
                  </button>
                  <span className="text-gray-500">{r.downvotes}</span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-5 border-t bg-gray-50">
          <SignedIn>
            <form onSubmit={submitReply} className="space-y-3">
              <textarea
                className="w-full p-3 border rounded min-h-[120px]"
                placeholder="Write your reply..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={posting || !reply.trim()}
                  className={`px-4 py-2 rounded text-white ${
                    posting || !reply.trim()
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {posting ? 'Posting…' : 'Post Reply'}
                </button>
              </div>
            </form>
          </SignedIn>
          <SignedOut>
            <div className="flex items-center justify-between">
              <div className="text-gray-700">Sign in to reply.</div>
              <SignInButton mode="modal">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </SignedOut>
        </div>
      </div>
    </div>
  );
}
