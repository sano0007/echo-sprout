'use client';

import { api } from '@packages/backend';
import { useMutation, useQuery } from 'convex/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

function renderFormattedContent(raw: string) {
  const lines = raw.split(/\r?\n/);
  const nodes: React.JSX.Element[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let inCode = false;
  let code: string[] = [];

  const flushPara = () => {
    if (para.length) {
      nodes.push(
        <p
          key={`p-${nodes.length}`}
          className="leading-7 text-gray-800 mb-4 break-words"
        >
          {para.join(' ')}
        </p>
      );
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      nodes.push(
        <ul
          key={`ul-${nodes.length}`}
          className="list-disc pl-6 space-y-2 mb-4 text-gray-800 break-words"
        >
          {list.map((item, idx) => (
            <li key={idx} className="break-words">
              {item}
            </li>
          ))}
        </ul>
      );
      list = [];
    }
  };
  const flushCode = () => {
    if (code.length) {
      nodes.push(
        <pre
          key={`code-${nodes.length}`}
          className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-4"
        >
          <code>{code.join('\n')}</code>
        </pre>
      );
      code = [];
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (inCode) {
        // closing block
        flushCode();
        inCode = false;
      } else {
        // opening block
        flushPara();
        flushList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      code.push(line);
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      // list item
      if (para.length) flushPara();
      list.push(line.replace(/^\s*[-*]\s+/, ''));
      continue;
    } else if (line.trim() === '') {
      flushList();
      flushPara();
      continue;
    }

    // headings
    if (/^#\s+/.test(line)) {
      flushList();
      flushPara();
      nodes.push(
        <h2
          key={`h2-${nodes.length}`}
          className="text-2xl font-semibold mt-8 mb-3 break-words"
        >
          {line.replace(/^#\s+/, '')}
        </h2>
      );
    } else if (/^##\s+/.test(line)) {
      flushList();
      flushPara();
      nodes.push(
        <h3
          key={`h3-${nodes.length}`}
          className="text-xl font-semibold mt-6 mb-2 break-words"
        >
          {line.replace(/^##\s+/, '')}
        </h3>
      );
    } else if (/^###\s+/.test(line)) {
      flushList();
      flushPara();
      nodes.push(
        <h4
          key={`h4-${nodes.length}`}
          className="text-lg font-semibold mt-4 mb-2 break-words"
        >
          {line.replace(/^###\s+/, '')}
        </h4>
      );
    } else {
      para.push(line.trim());
    }
  }

  // flush leftovers
  flushCode();
  flushList();
  flushPara();

  return nodes;
}

export default function BlogArticlePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const article = useQuery(api.learn.getBlog, { id: params.id });
  const updateBlog = useMutation(api.learn.updateBlog);
  const deleteBlog = useMutation(api.learn.deleteBlog);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    title: '',
    content: '',
    tags: '',
    readTime: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const openEdit = () => {
    if (!article) return;
    setDraft({
      title: article.title,
      content: article.content,
      tags: article.tags.join(', '),
      readTime: (article.readTime || '').replace(/\s*min\s*read/i, '').trim(),
    });
    setIsEditing(true);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article) return;
    const tags = draft.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      setIsSaving(true);
      await updateBlog({
        id: String(article.id),
        title: draft.title,
        content: draft.content,
        tags,
        readTime: draft.readTime || undefined,
      });
      setIsEditing(false);
      showToast('Article updated successfully', 'success');
    } catch (err) {
      showToast('Failed to update article', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    if (!article) return;
    if (!confirm('Delete this article? This action cannot be undone.')) return;
    try {
      setIsDeleting(true);
      await deleteBlog({ id: String(article.id) });
      showToast('Article deleted', 'success');
      router.push('/learn');
    } catch (err) {
      showToast('Failed to delete article', 'error');
      setIsDeleting(false);
    }
  };

  const contentNodes = useMemo(() => {
    if (!article?.content) return null;
    return renderFormattedContent(article.content);
  }, [article?.content]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-4">
        <button
          className="text-blue-600 hover:underline"
          onClick={() => router.back()}
        >
          ← Back
        </button>
      </div>

      {article === undefined ? (
        <div className="text-gray-600">Loading article...</div>
      ) : article === null ? (
        <div className="bg-white border rounded-xl shadow-sm p-6 md:p-10 text-gray-700">
          <h2 className="text-2xl font-semibold mb-2">Article not found</h2>
          <p className="mb-4">
            This article may have been deleted or the link is invalid.
          </p>
          <button
            className="text-blue-600 hover:underline"
            onClick={() => router.push('/learn')}
          >
            Go back to Learning Hub
          </button>
        </div>
      ) : (
        <article className="bg-white border rounded-xl shadow-sm p-6 md:p-10 overflow-x-hidden">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            {article.title}
          </h1>
          <div className="flex items-center text-sm text-gray-600 mb-6">
            {article.authorAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.authorAvatarUrl}
                alt={article.authorName}
                className="w-9 h-9 rounded-full mr-3 object-cover border"
              />
            ) : null}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-medium">{article.authorName}</span>
              <span className="text-gray-400">•</span>
              <span>{new Date(article.date).toLocaleDateString()}</span>
              <span className="text-gray-400">•</span>
              <span>{article.readTime}</span>
            </div>
          </div>

          {article.isOwner && (
            <div className="mb-6 flex gap-2">
              <button
                onClick={openEdit}
                disabled={isDeleting || isSaving}
                className={`px-3 py-1.5 rounded text-white ${
                  isDeleting || isSaving
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSaving ? 'Saving...' : 'Edit'}
              </button>
              <button
                onClick={onDelete}
                disabled={isDeleting || isSaving}
                className={`px-3 py-1.5 rounded text-white ${
                  isDeleting || isSaving
                    ? 'bg-red-300 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}

          <div className="space-y-1 mb-6">
            {article.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/learn?tag=${encodeURIComponent(tag)}`}
                className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-2 hover:bg-gray-200"
              >
                #{tag}
              </Link>
            ))}
          </div>

          <div className="break-words">{contentNodes}</div>
          {/* Edit Modal */}
          {isEditing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setIsEditing(false)}
              />
              <div className="relative bg-white w-full max-w-2xl mx-4 rounded-lg shadow-lg">
                <div className="border-b px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Edit Article</h3>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setIsEditing(false)}
                    aria-label="Close"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
                <form
                  onSubmit={onSave}
                  className="px-6 py-4 space-y-4 max-h-[80vh] overflow-y-auto"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Title
                      </label>
                      <input
                        value={draft.title}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, title: e.target.value }))
                        }
                        className="w-full border rounded px-3 py-2"
                        placeholder="Article title"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Read Time (minutes)
                      </label>
                      <input
                        value={draft.readTime}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, readTime: e.target.value }))
                        }
                        className="w-full border rounded px-3 py-2"
                        placeholder="e.g., 6"
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tags
                    </label>
                    <input
                      value={draft.tags}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, tags: e.target.value }))
                      }
                      className="w-full border rounded px-3 py-2"
                      placeholder="Comma-separated"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Content
                    </label>
                    <textarea
                      value={draft.content}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, content: e.target.value }))
                      }
                      className="w-full border rounded px-3 py-2"
                      rows={10}
                      placeholder="Write your article content here"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                      className={`px-4 py-2 rounded border ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={`px-4 py-2 rounded text-white ${
                        isSaving
                          ? 'bg-blue-300 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
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
        </article>
      )}
    </div>
  );
}
