'use client';

import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';

type Post = {
  id: number;
  title: string;
  author: string;
  category: string;
  replies: number;
  views: number;
  lastActivity: string;
  isAnswered: boolean;
  isPinned: boolean;
  tags: string[];
  content?: string;
};

export default function MyTopicsPage() {
  const categories = [{ id: 'all', name: 'All Topics', count: 156 }];

  const [myTopics, setMyTopics] = useState<Post[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('my_topics');
      const arr = raw ? JSON.parse(raw) : [];
      setMyTopics(Array.isArray(arr) ? arr : []);
    } catch (e) {
      setMyTopics([]);
    }
  }, []);

  const openEdit = (post: Post) => {
    setEditingId(post.id);
    setTitle(post.title);
    setCategory(post.category);
    setTags(post.tags?.join(', ') || '');
    setContent(post.content || '');
    setIsModalOpen(true);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const updated = myTopics.map((p) =>
      p.id === editingId
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
      localStorage.setItem('my_topics', JSON.stringify(updated));
    } catch (e) {}
    setIsModalOpen(false);
    setEditingId(null);
  };

  const deleteTopic = (id: number) => {
    const updated = myTopics.filter((p) => p.id !== id);
    setMyTopics(updated);
    try {
      localStorage.setItem('my_topics', JSON.stringify(updated));
    } catch (e) {}
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
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
                          <h3 className="text-lg font-medium mb-2 hover:text-blue-600 cursor-pointer">
                            {post.title}
                          </h3>

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
                              <span>👁️ {post.views ?? 0} views</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span>{post.lastActivity ?? 'just now'}</span>
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
