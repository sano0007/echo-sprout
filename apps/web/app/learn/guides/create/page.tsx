"use client";

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function CreateGuidePage() {
  const { isSignedIn } = useUser();
  const createGuide = useMutation(api.learn.createGuide);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<null | { type: 'success' | 'error'; text: string }>(null);
  const [form, setForm] = useState({
    title: '',
    readTime: '5',
    tags: '',
    content: '',
    publish: true,
    photos: [] as string[],
  });

  const update = (name: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [name]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      setMessage({ type: 'error', text: 'Please sign in to create a guide.' });
      return;
    }
    if (!form.title.trim() || !form.content.trim()) {
      setMessage({ type: 'error', text: 'Title and content are required.' });
      return;
    }
    try {
      setIsSubmitting(true);
      const tags = form.tags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const photoUrls = (form.photos || []).map((u) => u.trim()).filter(Boolean);
      await createGuide({
        title: form.title.trim(),
        content: form.content.trim(),
        tags,
        readTime: form.readTime,
        publish: form.publish,
        photoUrls,
      });
      setMessage({ type: 'success', text: 'Guide created.' });
      setForm({ title: '', readTime: '5', tags: '', content: '', publish: true, photos: [] });
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to create guide.' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Create Guide</h1>
        <Link href="/learn" className="text-blue-600 hover:underline">Back</Link>
      </div>

      {message && (
        <div className={`mb-4 rounded px-4 py-3 text-white ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5 bg-white rounded-lg border p-6">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="w-full border rounded px-3 py-2 bg-white"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g., Register Your First Project"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Read Time (min)</label>
            <input
              type="number"
              min={1}
              className="w-full border rounded px-3 py-2 bg-white"
              value={form.readTime}
              onChange={(e) => update('readTime', e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Tags</label>
            <input
              className="w-full border rounded px-3 py-2 bg-white"
              value={form.tags}
              onChange={(e) => update('tags', e.target.value)}
              placeholder="Comma-separated, e.g., Getting Started, Checklist"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea
            className="w-full border rounded px-3 py-2 bg-white"
            rows={8}
            value={form.content}
            onChange={(e) => update('content', e.target.value)}
            placeholder="Write your step-by-step guide here"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Photos</label>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, photos: [...f.photos, ''] }))}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
            >
              Add Photo
            </button>
          </div>
          {(!form.photos || form.photos.length === 0) && (
            <p className="text-sm text-gray-500">No photos added. Click "Add Photo" to include image URLs.</p>
          )}
          <div className="space-y-2">
            {(form.photos || []).map((url, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  className="w-full border rounded px-3 py-2 bg-white"
                  value={url}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      photos: f.photos.map((p, i) => (i === idx ? e.target.value : p)),
                    }))
                  }
                  placeholder="https://...image.jpg"
                />
                <button
                  type="button"
                  className="text-sm text-red-600 hover:underline"
                  onClick={() => setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== idx) }))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="publish"
            type="checkbox"
            checked={form.publish}
            onChange={(e) => update('publish', e.target.checked)}
          />
          <label htmlFor="publish" className="text-sm">Publish immediately</label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={!isSignedIn || isSubmitting}
            className={`px-4 py-2 rounded text-white ${
              !isSignedIn || isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create Guide'}
          </button>
        </div>
      </form>
    </div>
  );
}
