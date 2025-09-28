'use client';

import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs';
import { api } from '@packages/backend';
import { useMutation, useQuery } from 'convex/react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

// Define the shape of a forum post including optional fields used conditionally
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
  isMine?: boolean;
};

function formatShortNumber(n: number): string {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

function RelativeTime({
  timestamp,
  fallback,
}: {
  timestamp?: number;
  fallback?: string;
}) {
  const [now, setNow] = useState<number>(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  if (!timestamp) return <span>{fallback ?? 'just now'}</span>;
  const diff = Math.max(0, now - timestamp);
  if (diff < 60_000) return <span>just now</span>;
  const mins = Math.floor(diff / 60_000);
  if (mins < 60)
    return (
      <span>
        {mins} min{mins === 1 ? '' : 's'} ago
      </span>
    );
  const hours = Math.floor(mins / 60);
  if (hours < 24)
    return (
      <span>
        {hours} hour{hours === 1 ? '' : 's'} ago
      </span>
    );
  const days = Math.floor(hours / 24);
  return (
    <span>
      {days} day{days === 1 ? '' : 's'} ago
    </span>
  );
}

export default function CommunityForum() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'replies' | 'views' | 'newest'>(
    'newest'
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  // Form state for New Topic
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { isSignedIn, user } = useUser();
  const [isEdit, setIsEdit] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | number | null>(
    null
  );
  const [notice, setNotice] = useState<{
    msg: string;
    type: 'success' | 'error';
  } | null>(null);

  const categories = [
    { id: 'all', name: 'All Topics', count: 156 },
    { id: 'general', name: 'General Discussion', count: 45 },
    { id: 'project-dev', name: 'Project Development', count: 38 },
    { id: 'verification', name: 'Verification Process', count: 29 },
    { id: 'marketplace', name: 'Marketplace & Trading', count: 22 },
    { id: 'tech-support', name: 'Technical Support', count: 15 },
    { id: 'announcements', name: 'Announcements', count: 7 },
  ];

  const nowTs = Date.now();
  const initialPosts: Post[] = [];

  const topContributors =
    useQuery((api as any).forum.getTopContributors, {}) || [];

  const [posts, setPosts] = useState<Post[]>(initialPosts);

  // Convex: create/update/delete topic and list all topics (public)
  const createTopic = useMutation((api as any).forum.createTopic);
  const updateTopicMutation = useMutation((api as any).forum.updateTopic);
  const deleteTopicMutation = useMutation((api as any).forum.deleteTopic);
  const allTopicsQuery = useQuery((api as any).forum.listAllTopics, {});
  const activeUsersCount = useQuery((api as any).forum.getActiveUsersCount, {});

  const backendPosts: Post[] = useMemo(() => {
    if (!allTopicsQuery) return [];
    return allTopicsQuery.map((t: any) => ({
      id: t.id,
      title: t.title,
      author: t.author || 'Unknown',
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
  }, [allTopicsQuery]);

  const allPosts = useMemo(() => {
    const byId = new Map<string, Post>();
    // Prefer backend items; fall back to local state
    [...backendPosts, ...posts].forEach((p) => {
      const key = String(p.id);
      if (!byId.has(key)) byId.set(key, p);
    });
    return Array.from(byId.values());
  }, [backendPosts, posts]);

  const totalReplies = useMemo(() => {
    return allPosts.reduce((sum, p) => sum + (p.replies ?? 0), 0);
  }, [allPosts]);

  // Dynamic counts per category (and overall)
  const countsByCategory = useMemo(() => {
    const counts: Record<string, number> = { all: allPosts.length };
    for (const p of allPosts) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [allPosts]);

  const filteredPosts = allPosts.filter((post) => {
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

  const sortedPosts = useMemo(() => {
    const arr = [...filteredPosts];
    if (sortBy === 'replies') {
      arr.sort((a, b) => (b.replies ?? 0) - (a.replies ?? 0));
    } else if (sortBy === 'views') {
      arr.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    } else {
      arr.sort((a, b) => (b.lastActivityAt ?? 0) - (a.lastActivityAt ?? 0));
    }
    return arr;
  }, [filteredPosts, sortBy]);

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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

  const deleteTopic = async (id: string | number) => {
    // Remove locally for snappy UI
    setPosts((prev) => prev.filter((p) => String(p.id) !== String(id)));
    // Remove in backend if this is a Convex id
    if (typeof id === 'string') {
      try {
        await deleteTopicMutation({ id });
      } catch (e) {
        // Optional: show toast; for now ignore
      }
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
            String(p.id) === String(editingPostId)
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
                  lastActivityAt: Date.now(),
                }
              : p
          )
        );
        // Backend update via Convex
        if (typeof editingPostId === 'string') {
          try {
            await updateTopicMutation({
              id: editingPostId,
              title: title.trim(),
              category,
              tags: tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
              content: content.trim(),
            });
          } catch (e) {
            setError('Failed to update topic.');
            setNotice({ msg: 'Operation failed', type: 'error' });
            setTimeout(() => setNotice(null), 3000);
            return;
          }
        }
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
          lastActivityAt: Date.now(),
          isAnswered: false,
          isPinned: false,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          content: content.trim(),
          isMine: true,
        };

        try {
          const result = await createTopic({
            title: newPost.title,
            content: newPost.content!,
            category: newPost.category,
            tags: newPost.tags,
          });
          if (result?.id) newPost.id = result.id;
        } catch (e) {
          setError('Failed to create topic.');
          setNotice({ msg: 'Operation failed', type: 'error' });
          setTimeout(() => setNotice(null), 3000);
          return;
        }

        setPosts((prev) => [newPost, ...prev]);
      }

      setIsModalOpen(false);
      resetForm();
      setNotice({
        msg: isEdit
          ? 'Topic updated successfully'
          : 'Topic created successfully',
        type: 'success',
      });
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      setError('Failed to create topic. Please try again.');
      setNotice({ msg: 'Operation failed', type: 'error' });
      setTimeout(() => setNotice(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

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
          <div className="bg-white p-4  rounded-lg shadow-md mb-6">
            <input
              type="text"
              placeholder="Search forums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 bg-white border rounded"
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
                    {countsByCategory[category.id] ?? 0}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Forum Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-2xl font-bold text-blue-600">
                {allPosts.length}
              </p>
              <p className="text-sm text-gray-600">Total Topics</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatShortNumber(totalReplies)}
              </p>
              <p className="text-sm text-gray-600">Total Replies</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <p className="text-2xl font-bold text-purple-600">
                {activeUsersCount ?? 0}
              </p>
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
                <select
                  className="border rounded bg-white px-3 py-1 text-sm"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      (e.target.value as 'replies' | 'views' | 'newest') ||
                        'newest'
                    )
                  }
                >
                  <option value="replies">Most Replies</option>
                  <option value="views">Most Views</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            <div className="divide-y">
              {currentPosts.map((post) => (
                <div key={String(post.id)} className="p-6 hover:bg-gray-50">
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

                      {typeof post.id === 'string' ? (
                        <Link href={`/community/topic/${post.id}`}>
                          <h3 className="text-lg font-medium mb-2 hover:text-blue-600 cursor-pointer">
                            {post.title}
                          </h3>
                        </Link>
                      ) : (
                        <h3 className="text-lg font-medium mb-2">
                          {post.title}
                        </h3>
                      )}

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
                          <span>️ {post.views} views</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <RelativeTime
                            timestamp={post.lastActivityAt}
                            fallback={post.lastActivity}
                          />
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
                <button
                  className="px-3 py-2 border rounded text-sm hover:bg-gray-100"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    className={`px-3 py-2 border rounded text-sm ${
                      currentPage === index + 1
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  className="px-3 py-2 border rounded text-sm hover:bg-gray-100"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
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
