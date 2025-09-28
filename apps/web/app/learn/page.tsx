'use client';

import { useUser } from '@clerk/nextjs';
import { api } from '@packages/backend';
import { useMutation, useQuery } from 'convex/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function LearnHub() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('modules');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newArticle, setNewArticle] = useState({
    title: '',
    date: '',
    readTime: '5 min read',
    tags: '',
    content: '',
  });

  // Fallback sample modules (used if no created learning paths yet)
  const learningModules = [
    {
      id: 1,
      title: 'Introduction to Carbon Credits',
      description:
        'Learn the basics of carbon credits, how they work, and their role in climate action.',
      duration: '30 minutes',
      level: 'Beginner',
      lessons: 5,
      progress: 0,
    },
    {
      id: 2,
      title: 'Project Development Process',
      description:
        'Step-by-step guide to developing carbon credit projects from conception to verification.',
      duration: '45 minutes',
      level: 'Intermediate',
      lessons: 8,
      progress: 25,
    },
    {
      id: 3,
      title: 'Verification Standards',
      description:
        'Understanding VCS, Gold Standard, and other verification methodologies.',
      duration: '40 minutes',
      level: 'Advanced',
      lessons: 6,
      progress: 100,
    },
    {
      id: 4,
      title: 'Carbon Market Dynamics',
      description:
        'Explore pricing, trading strategies, and market trends in carbon credits.',
      duration: '35 minutes',
      level: 'Intermediate',
      lessons: 7,
      progress: 60,
    },
  ];

  const guides = [
    {
      id: 1,
      title: 'How to Register Your First Project',
      category: 'Getting Started',
      readTime: '10 min read',
      updated: '2024-01-15',
    },
    {
      id: 2,
      title: 'Document Preparation Checklist',
      category: 'Project Development',
      readTime: '8 min read',
      updated: '2024-01-12',
    },
    {
      id: 3,
      title: 'Understanding Verification Process',
      category: 'Verification',
      readTime: '12 min read',
      updated: '2024-01-10',
    },
    {
      id: 4,
      title: 'Maximizing Project Impact',
      category: 'Best Practices',
      readTime: '15 min read',
      updated: '2024-01-08',
    },
  ];

  const blogPosts = useQuery(api.learn.listBlog);
  const guidesData = useQuery(api.learn.listGuides);
  const learningPaths = useQuery(api.learn.listLearningPaths);
  const createBlog = useMutation(api.learn.createBlog);
  const recordLearnEnter = useMutation(api.learn.recordLearnPageEnter);
  const { isSignedIn } = useUser();
  const [isPublishing, setIsPublishing] = useState(false);
  const [toast, setToast] = useState<null | {
    message: string;
    type: 'success' | 'error';
  }>(null);

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const previewText = (s: string) => {
    if (!s) return '';
    const text = s.replace(/\s+/g, ' ').trim();
    const max = 50;
    return text.length > max ? text.slice(0, max).trimEnd() + '.....' : text;
  };

  const today = useMemo(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }, []);

  // Record unique-user entry to Learn hub (one-time per mount)
  const enteredRef = useRef(false);
  useEffect(() => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    try {
      recordLearnEnter({} as any).catch(() => {});
    } catch {
      // Silently ignore learn entry recording errors
    }
  }, [recordLearnEnter]);

  const openModal = () => {
    setNewArticle((prev) => ({
      ...prev,
      date: prev.date || today,
    }));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewArticle((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      alert('Please sign in to publish an article.');
      return;
    }
    if (!newArticle.title || !newArticle.content) {
      alert('Please fill in title and content.');
      return;
    }

    const tagsArray = newArticle.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      setIsPublishing(true);
      await createBlog({
        title: newArticle.title,
        content: newArticle.content,
        tags: tagsArray.length ? tagsArray : ['Community'],
        readTime: newArticle.readTime,
        publish: true,
      });
      setNewArticle({
        title: '',
        date: today,
        readTime: '5 min read',
        tags: '',
        content: '',
      });
      setIsModalOpen(false);
      showToast('Article published', 'success');
    } catch (err) {
      showToast('Failed to publish article', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const modulesList = (learningPaths ?? []).length
    ? (learningPaths ?? []).map((p) => ({
        id: String(p.id),
        title: p.title,
        description: p.description,
        duration: `${p.estimatedDuration} minutes`,
        level: cap(p.level as string),
        lessons: (p as any).moduleCount ?? 0,
        progress: 0,
      }))
    : learningModules;

  // Batch fetch persisted progress for all real Convex paths
  const realPathIds = Array.isArray(learningPaths)
    ? (learningPaths as any[]).map((p) => String(p.id))
    : [];
  const progressMap = useQuery(api.learn.progressForPaths, {
    pathIds: realPathIds,
  } as any);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="text-left">
            <h1 className="text-4xl font-bold mb-2">Educational Content Hub</h1>
            <p className="text-lg text-gray-600">
              Learn about carbon credits, project development, and sustainable
              impact
            </p>
          </div>
          {isSignedIn ? (
            <Link
              href="/learn/analytics"
              className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Analytics
            </Link>
          ) : (
            <Link
              href="/sign-in?redirect_url=%2Flearn%2Fanalytics"
              className="inline-flex items-center bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Sign in to Generate Report
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('modules')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'modules' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Learning Modules
            </button>
            <button
              onClick={() => setActiveTab('guides')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'guides' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Step-by-Step Guides
            </button>
            <button
              onClick={() => setActiveTab('blog')}
              className={`px-6 py-4 text-sm font-medium ${activeTab === 'blog' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Community Blog
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Learning Modules Tab */}
          {activeTab === 'modules' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">
                  Structured Learning Path
                </h2>
                <p className="text-gray-600">
                  Comprehensive courses designed to build your carbon credit
                  expertise
                </p>
              </div>

              {/* Create Learning Path CTA (no analytics counting here) */}
              <div className="flex justify-end">
                <Link
                  href="/learn/paths"
                  className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Create Learning Path
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {modulesList.map((module) => (
                  <div
                    key={module.id}
                    className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          {module.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {module.description}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <span>⏱️ {module.duration}</span>
                          <span>📚 {module.lessons} lessons</span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              module.level === 'Beginner'
                                ? 'bg-green-100 text-green-800'
                                : module.level === 'Intermediate'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {module.level}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar: persisted for real paths, static for samples */}
                    {String(module.id).startsWith('0x') ||
                    String(module.id).length > 10 ? (
                      progressMap === undefined ? (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span className="text-gray-400">…</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="h-2 w-1/2 animate-pulse bg-gray-300"></div>
                          </div>
                        </div>
                      ) : (
                        (() => {
                          const pct = progressMap[String(module.id)] ?? 0;
                          return (
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{pct}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })()
                      )
                    ) : (
                      typeof module.progress === 'number' && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{module.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${module.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    )}

                    {String(module.id).startsWith('0x') ||
                    String(module.id).length > 10 ? (
                      (() => {
                        const pct = progressMap
                          ? (progressMap[String(module.id)] ?? 0)
                          : 0;
                        const label =
                          pct <= 0
                            ? 'Start Course'
                            : pct >= 100
                              ? 'Review Course'
                              : 'Continue Course';
                        return (
                          <button
                            className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                            onClick={() => {
                              if (!isSignedIn) {
                                alert('Please sign in to start the course.');
                                return;
                              }
                              router.push(
                                `/learn/paths/${module.id}?from=learn`
                              );
                            }}
                          >
                            {label}
                          </button>
                        );
                      })()
                    ) : (
                      <button
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded opacity-50 cursor-not-allowed"
                        title="Create a Learning Path to view details"
                      >
                        Start Course
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Guides Tab */}
          {activeTab === 'guides' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">
                  Practical Guides
                </h2>
                <p className="text-gray-600">
                  Actionable step-by-step instructions for common tasks
                </p>
              </div>

              {/* Create Guide CTA */}
              <div className="flex justify-end">
                <Link
                  href="/learn/guides/create"
                  className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Create Guide
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(guidesData && guidesData.length ? guidesData : guides).map(
                  (guide: any) => (
                    <div
                      key={guide.id}
                      className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      {/*<div className="mb-4">*/}
                      {/*  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">*/}
                      {/*    {guide.category}*/}
                      {/*  </span>*/}
                      {/*</div>*/}

                      <h3 className="text-lg font-semibold mb-2">
                        {guide.title}
                      </h3>

                      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                        <span>📖 {guide.readTime}</span>
                        <span>
                          {guide.updated ? (
                            <>
                              Updated{' '}
                              {new Date(guide.updated).toLocaleDateString()}
                            </>
                          ) : (
                            <>
                              Published{' '}
                              {new Date(guide.date).toLocaleDateString()}
                            </>
                          )}
                        </span>
                      </div>

                      <Link
                        href={`/learn/guides/${String(guide.id)}`}
                        className="block text-center w-full bg-gray-100 text-gray-800 py-2 px-4 rounded hover:bg-gray-200"
                      >
                        Read Guide
                      </Link>
                    </div>
                  )
                )}
              </div>

              {/* Featured Guide */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">
                  🌟 Featured Guide
                </h3>
                <h4 className="text-lg font-medium mb-2">
                  Complete Project Registration Walkthrough
                </h4>
                <p className="text-gray-600 mb-4">
                  A comprehensive guide covering everything from initial project
                  conception to final submission, including templates and
                  checklists.
                </p>
                <Link
                  href="/learn/walkthrough"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Start Walkthrough
                </Link>
              </div>
            </div>
          )}

          {/* Community Blog Tab */}
          {activeTab === 'blog' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">
                    Community Blog
                  </h2>
                  <p className="text-gray-600">
                    Insights, stories, and updates from our community
                  </p>
                </div>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={openModal}
                >
                  Write Article
                </button>
              </div>

              <div className="space-y-6">
                {(blogPosts ?? []).map((post) => (
                  <article
                    key={String(post.id)}
                    className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">
                          <Link
                            href={`/learn/blog/${String(post.id)}`}
                            className="hover:text-blue-600 cursor-pointer"
                          >
                            {post.title}
                          </Link>
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <span>By {post.authorName ?? 'Unknown'}</span>
                          <span className="mx-2">•</span>
                          <span>
                            {new Date(post.date).toLocaleDateString()}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 break-words">
                      {previewText(post.content)}
                    </p>

                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        {post.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link
                        className="text-blue-600 hover:underline"
                        href={`/learn/blog/${String(post.id)}`}
                      >
                        Read More
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* Call to Action */}
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Share Your Knowledge
                </h3>
                <p className="text-gray-600 mb-4">
                  Have insights about carbon projects or sustainability? Share
                  your experience with the community.
                </p>
                <button
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                  onClick={openModal}
                >
                  Contribute Article
                </button>
              </div>

              {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div
                    className="absolute inset-0 bg-black bg-opacity-40"
                    onClick={closeModal}
                  />
                  <div className="relative bg-white w-full max-w-2xl mx-4 rounded-lg shadow-lg">
                    <div className="border-b px-6 py-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        Create New Article
                      </h3>
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={closeModal}
                        aria-label="Close"
                        title="Close"
                      >
                        ✕
                      </button>
                    </div>
                    <form
                      onSubmit={handleSubmit}
                      className="px-6 py-4 space-y-4 max-h-[80vh] overflow-y-auto"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Title
                          </label>
                          <input
                            name="title"
                            value={newArticle.title}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 bg-white"
                            placeholder="Enter article title"
                            required
                          />
                        </div>
                        {/* Author is taken from the signed-in user */}
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Date
                          </label>
                          <input
                            type="date"
                            name="date"
                            value={newArticle.date || today}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Read Time
                          </label>
                          <input
                            name="readTime"
                            value={newArticle.readTime}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2 bg-white"
                            placeholder="e.g., 6 min read"
                          />
                        </div>
                      </div>

                      {/* Excerpt removed — preview derives from content */}

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Tags
                        </label>
                        <input
                          name="tags"
                          value={newArticle.tags}
                          onChange={handleChange}
                          className="w-full border rounded px-3 py-2 bg-white"
                          placeholder="Comma-separated, e.g., Technology, Innovation"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Content
                        </label>
                        <textarea
                          name="content"
                          value={newArticle.content}
                          onChange={handleChange}
                          className="w-full border rounded px-3 py-2 bg-white"
                          rows={6}
                          placeholder="Write your article content here"
                          required
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={closeModal}
                          className="px-4 py-2 rounded border"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!isSignedIn || isPublishing}
                          className={`px-4 py-2 rounded text-white ${
                            !isSignedIn || isPublishing
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {isPublishing ? 'Publishing...' : 'Publish'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
          {toast && (
            <div className="fixed bottom-6 right-6 z-50">
              <div
                className={`px-4 py-3 rounded shadow text-white ${
                  toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                }`}
              >
                {toast.message}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// PathProgressBar component removed; using batch query instead
