'use client';

import { useEffect, useState } from 'react';
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';

// Define the shape of a forum post including optional fields used conditionally
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
  isMine?: boolean;
};

export default function CommunityForum() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for New Topic
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { isSignedIn, user } = useUser();
  const [isEdit, setIsEdit] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  const categories = [
    { id: 'all', name: 'All Topics', count: 156 },
    { id: 'general', name: 'General Discussion', count: 45 },
    { id: 'project-dev', name: 'Project Development', count: 38 },
    { id: 'verification', name: 'Verification Process', count: 29 },
    { id: 'marketplace', name: 'Marketplace & Trading', count: 22 },
    { id: 'tech-support', name: 'Technical Support', count: 15 },
    { id: 'announcements', name: 'Announcements', count: 7 },
  ];

  const initialPosts: Post[] = [
    {
      id: 1,
      title: 'Best practices for reforestation project documentation?',
      author: 'Maria Garcia',
      category: 'project-dev',
      replies: 12,
      views: 234,
      lastActivity: '2 hours ago',
      isAnswered: false,
      isPinned: false,
      tags: ['reforestation', 'documentation', 'best-practices'],
    },
    {
      id: 2,
      title: '[ANNOUNCEMENT] New verification standards update',
      author: 'Admin Team',
      category: 'announcements',
      replies: 8,
      views: 456,
      lastActivity: '4 hours ago',
      isAnswered: false,
      isPinned: true,
      tags: ['announcement', 'verification', 'standards'],
    },
    {
      id: 3,
      title: 'How long does the verification process typically take?',
      author: 'John Smith',
      category: 'verification',
      replies: 15,
      views: 189,
      lastActivity: '6 hours ago',
      isAnswered: true,
      isPinned: false,
      tags: ['verification', 'timeline', 'question'],
    },
    {
      id: 4,
      title: 'Solar project credit calculation methodology',
      author: 'Sarah Chen',
      category: 'project-dev',
      replies: 7,
      views: 123,
      lastActivity: '1 day ago',
      isAnswered: false,
      isPinned: false,
      tags: ['solar', 'calculation', 'methodology'],
    },
    {
      id: 5,
      title: 'Marketplace pricing trends - Q1 2024',
      author: 'Market Analyst',
      category: 'marketplace',
      replies: 23,
      views: 567,
      lastActivity: '1 day ago',
      isAnswered: false,
      isPinned: false,
      tags: ['pricing', 'trends', 'analysis'],
    },
  ];

  const topContributors = [
    { name: 'Dr. Elena Rodriguez', posts: 45, reputation: 892 },
    { name: 'Michael Johnson', posts: 38, reputation: 743 },
    { name: 'Sarah Chen', posts: 32, reputation: 654 },
    { name: 'David Kumar', posts: 29, reputation: 587 },
  ];

  const [posts, setPosts] = useState<Post[]>(initialPosts);

  // Merge locally saved topics into feed on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('my_topics');
      if (raw) {
        const myTopics = JSON.parse(raw);
        if (Array.isArray(myTopics)) {
          const mapped = myTopics.map((t: any) => ({
            ...t,
            isMine: true,
          })) as Post[];
          setPosts((prev) => [...mapped, ...prev]);
        }
      }
    } catch (e) {
      // ignore localStorage errors
    }
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      activeCategory === 'all' || post.category === activeCategory;
    const matchesSearch =
      searchTerm === '' ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const resetForm = () => {
    setTitle('');
    setCategory('general');
    setTags('');
    setContent('');
    setError(null);
    setIsEdit(false);
    setEditingPostId(null);
  };

  const openEdit = (post: Post) => {
    setTitle(post.title);
    setCategory(post.category);
    setTags(post.tags?.join(', ') || '');
    setContent(post.content || '');
    setIsEdit(true);
    setEditingPostId(post.id);
    setIsModalOpen(true);
  };

  const deleteTopic = (id: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    try {
      const raw = localStorage.getItem('my_topics');
      const arr = raw ? JSON.parse(raw) : [];
      const next = Array.isArray(arr)
        ? arr.filter((p: any) => p.id !== id)
        : [];
      localStorage.setItem('my_topics', JSON.stringify(next));
    } catch (e) {
      // ignore
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSignedIn) {
      setError('You must be signed in to create a topic.');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && editingPostId) {
        // Update existing
        setPosts((prev) =>
          prev.map((p) =>
            p.id === editingPostId
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
          )
        );
        // Update localStorage
        try {
          const raw = localStorage.getItem('my_topics');
          const arr = raw ? JSON.parse(raw) : [];
          const next = Array.isArray(arr)
            ? arr.map((p: any) =>
                p.id === editingPostId
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
              )
            : [];
          localStorage.setItem('my_topics', JSON.stringify(next));
        } catch (e) {}
      } else {
        // Create new
        const newPost: Post = {
          id: Date.now(),
          title: title.trim(),
          author:
            user?.fullName || user?.primaryEmailAddress?.emailAddress || 'You',
          category,
          replies: 0,
          views: 0,
          lastActivity: 'just now',
          isAnswered: false,
          isPinned: false,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          content: content.trim(),
          isMine: true,
        };

        // Save to localStorage for availability in My Topics page
        try {
          const raw = localStorage.getItem('my_topics');
          const arr = raw ? JSON.parse(raw) : [];
          const next = Array.isArray(arr) ? [newPost, ...arr] : [newPost];
          localStorage.setItem('my_topics', JSON.stringify(next));
        } catch (e) {
          // ignore localStorage errors
        }

        setPosts((prev) => [newPost, ...prev]);
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError('Failed to create topic. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Community Forum</h1>
          <p className="text-gray-600">
            Connect with the carbon credit community
          </p>
        </div>
        <div className="flex space-x-2">
          <Link
            href="/community/my-topics"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            My Topic
          </Link>
          <SignedIn>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              New Topic
            </button>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                New Topic
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Search */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <input
              type="text"
              placeholder="Search forums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border rounded"
            />
          </div>

          {/* Categories */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <h3 className="font-semibold mb-4">Categories</h3>
            <nav className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full text-left p-2 rounded flex justify-between items-center ${
                    activeCategory === category.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className="text-sm text-gray-500">
                    {category.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Top Contributors */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold mb-4">Top Contributors</h3>
            <div className="space-y-3">
              {topContributors.map((contributor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{contributor.name}</p>
                    <p className="text-xs text-gray-500">
                      {contributor.posts} posts
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-600">
                      {contributor.reputation}
                    </p>
                    <p className="text-xs text-gray-500">reputation</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Forum Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-2xl font-bold text-blue-600">156</p>
              <p className="text-sm text-gray-600">Total Topics</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-2xl font-bold text-green-600">1.2k</p>
              <p className="text-sm text-gray-600">Total Replies</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-2xl font-bold text-purple-600">89</p>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
          </div>

          {/* Forum Posts */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                  {activeCategory === 'all'
                    ? 'All Topics'
                    : categories.find((c) => c.id === activeCategory)?.name}
                </h2>
                <select className="border rounded px-3 py-1 text-sm">
                  <option>Latest Activity</option>
                  <option>Most Replies</option>
                  <option>Most Views</option>
                  <option>Newest</option>
                </select>
              </div>
            </div>

            <div className="divide-y">
              {filteredPosts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {post.author.charAt(0)}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {post.isPinned && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                            📌 Pinned
                          </span>
                        )}
                        {post.isAnswered && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            ✅ Answered
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-medium mb-2 hover:text-blue-600 cursor-pointer">
                        {post.title}
                      </h3>

                      <div className="flex items-center gap-2 mb-3">
                        {post.tags.map((tag) => (
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
                          <span>💬 {post.replies} replies</span>
                          <span>👁️ {post.views} views</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span>{post.lastActivity}</span>
                          {post.isMine && (
                            <>
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
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="p-6 border-t flex justify-center">
              <div className="flex gap-2">
                <button className="px-3 py-2 border rounded text-sm hover:bg-gray-100">
                  Previous
                </button>
                <button className="px-3 py-2 bg-blue-600 text-white rounded text-sm">
                  1
                </button>
                <button className="px-3 py-2 border rounded text-sm hover:bg-gray-100">
                  2
                </button>
                <button className="px-3 py-2 border rounded text-sm hover:bg-gray-100">
                  3
                </button>
                <button className="px-3 py-2 border rounded text-sm hover:bg-gray-100">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Topic Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setIsModalOpen(false);
              resetForm();
            }}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">Create New Topic</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="px-6 py-4 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 border border-red-200 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a clear, concise topic title"
                  className="w-full p-3 border rounded"
                  required
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
                    {categories
                      .filter((c) => c.id !== 'all')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tags</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. reforestation, verification"
                    className="w-full p-3 border rounded"
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
                  placeholder="Describe your question or topic in detail..."
                  className="w-full p-3 border rounded min-h-[160px]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !isSignedIn}
                  className={`px-4 py-2 rounded text-white ${
                    submitting || !isSignedIn
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {submitting ? 'Creating...' : 'Create Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
