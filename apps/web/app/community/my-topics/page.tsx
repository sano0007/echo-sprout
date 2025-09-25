'use client';

import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

type Post = {
  id: string | number;
  title: string;
  author: string;
  category: string;
  replies: number;
  views: number;
  lastActivity: string;
  lastActivityAt?: number;
  isAnswered: boolean;
  isPinned: boolean;
  tags: string[];
  content?: string;
};

function RelativeTime({ timestamp, fallback }: { timestamp?: number; fallback?: string }) {
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  if (!timestamp) return <span>{fallback ?? 'just now'}</span>;
  const diff = Math.max(0, now - timestamp);
  if (diff < 60_000) return <span>just now</span>;
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return <span>{mins} min{mins === 1 ? '' : 's'} ago</span>;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return <span>{hours} hour{hours === 1 ? '' : 's'} ago</span>;
  const days = Math.floor(hours / 24);
  return <span>{days} day{days === 1 ? '' : 's'} ago</span>;
}

export default function MyTopicsPage() {
  const [myTopics, setMyTopics] = useState<Post[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [notice, setNotice] = useState<{
    msg: string;
    type: 'success' | 'error';
  } | null>(null);

  const queryMine = useQuery((api as any).forum.listUserTopics, {});
  const updateTopic = useMutation((api as any).forum.updateTopic);
  const deleteTopicMut = useMutation((api as any).forum.deleteTopic);

  useEffect(() => {
    if (!queryMine) return;
    const mapped = (queryMine || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      author: 'You',
      category: t.category,
      replies: t.replies ?? 0,
      views: t.views ?? 0,
      lastActivity: 'just now',
      lastActivityAt: t.lastReplyAt ?? Date.now(),
      isAnswered: false,
      isPinned: false,
      tags: t.tags ?? [],
      content: t.content,
    }));
    setMyTopics(mapped);
  }, [queryMine]);

  const openEdit = (post: Post) => {
    setEditingId(post.id);
    setTitle(post.title);
    setCategory(post.category);
    setTags(post.tags?.join(', ') || '');
    setContent(post.content || '');
    setIsModalOpen(true);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const updated = myTopics.map((p) =>
      String(p.id) === String(editingId)
        ? {
            ...p,
            title: title.trim(),
            category,
            tags: tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
            content: content.trim(),
            lastActivity: 'just now',
          }
        : p
    );
    setMyTopics(updated);
    try {
      await updateTopic({
        id: editingId as any,
        title: title.trim(),
        category,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        content: content.trim(),
      });
      setNotice({ msg: 'Topic updated successfully', type: 'success' });
      setTimeout(() => setNotice(null), 3000);
    } catch {
      setNotice({ msg: 'Update failed', type: 'error' });
      setTimeout(() => setNotice(null), 3000);
    }
    setIsModalOpen(false);
    setEditingId(null);
  };

  const deleteTopic = async (id: string | number) => {
    try {
      await deleteTopicMut({ id: id as any });
      const updated = myTopics.filter((p) => String(p.id) !== String(id));
      setMyTopics(updated);
      setNotice({ msg: 'Topic deleted successfully', type: 'success' });
      setTimeout(() => setNotice(null), 3000);
    } catch {
      setNotice({ msg: 'Delete failed', type: 'error' });
      setTimeout(() => setNotice(null), 3000);
    }
  };

  // Sidebar categories with dynamic count of user's topics
  const categories = [{ id: 'all', name: 'All Topics', count: myTopics.length }];

  return (
    <div className="max-w-7xl mx-auto p-6">
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Topics</h1>
          <p className="text-gray-600">Topics you’ve created</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/community/forum"
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Back to Forum
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Categories (static, All Topics active) */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h3 className="font-semibold mb-4">Categories</h3>
            <nav className="space-y-2">
              {categories.map((c, idx) => (
                <button
                  key={c.id}
                  className={`w-full text-left p-2 rounded flex justify-between items-center ${
                    idx === 0
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                  disabled={idx !== 0}
                >
                  <span>{c.name}</span>
                  <span className="text-sm text-gray-500">{c.count}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">All Topics</h2>
            </div>

            <SignedOut>
              <div className="p-6">
                <p className="text-gray-700 mb-3">
                  Please sign in to view your topics.
                </p>
                <SignInButton mode="modal">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="divide-y">
                {myTopics.length === 0 ? (
                  <div className="p-6 text-gray-600">No topics yet.</div>
                ) : (
                  myTopics.map((post) => (
                    <div key={post.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {post.author?.charAt(0) || 'Y'}
                          </span>
                        </div>

                        <div className="flex-1">
                          <Link href={`/community/topic/${post.id}`}>
                            <h3 className="text-lg font-medium mb-2 hover:text-blue-600 cursor-pointer">
                              {post.title}
                            </h3>
                          </Link>

                          <div className="flex items-center gap-2 mb-3">
                            {post.tags?.map((tag) => (
                              <span
                                key={tag}
                                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-4">
                              <span>by {post.author}</span>
                              <span>💬 {post.replies ?? 0} replies</span>
                              <span>️ {post.views ?? 0} views</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <RelativeTime timestamp={post.lastActivityAt} fallback={post.lastActivity} />
                              <button
                                onClick={() => openEdit(post)}
                                className="text-blue-600 hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteTopic(post.id)}
                                className="text-red-600 hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SignedIn>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Edit Topic</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 border rounded"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 border rounded"
                  >
                    <option value="general">General Discussion</option>
                    <option value="project-dev">Project Development</option>
                    <option value="verification">Verification Process</option>
                    <option value="marketplace">Marketplace & Trading</option>
                    <option value="tech-support">Technical Support</option>
                    <option value="announcements">Announcements</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tags</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full p-3 border rounded"
                    placeholder="e.g. reforestation, verification"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate tags with commas
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 border rounded min-h-[160px]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
