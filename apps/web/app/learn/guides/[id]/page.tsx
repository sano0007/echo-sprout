"use client";

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

export default function GuideSlidesPage() {
  const params = useParams();
  const id = useMemo(() => (Array.isArray(params?.id) ? params.id[0] : (params?.id as string)), [params]);
  const guide = useQuery(api.learn.getGuide, id ? { id } : 'skip');
  const updateGuide = useMutation(api.learn.updateGuide);
  const deleteGuide = useMutation(api.learn.deleteGuide);

  const [index, setIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<any>(null);
  const images = guide?.images ?? [];
  const count = images.length;

  const prev = () => setIndex((i) => (count === 0 ? 0 : (i === 0 ? count - 1 : i - 1)));
  const next = () => setIndex((i) => (count === 0 ? 0 : (i === count - 1 ? 0 : i + 1)));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{guide ? guide.title : 'Guide'}</h1>
        <div className="flex items-center gap-3">
          <Link href="/learn" className="text-blue-600 hover:underline">Back</Link>
          {guide?.isOwner && (
            <>
              <button
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
                onClick={() => {
                  setEditing((e) => {
                    const next = !e;
                    if (next && guide) {
                      setForm({
                        title: guide.title,
                        tags: (guide.tags || []).join(', '),
                        content: guide.content,
                        photos: (guide.images || []) as string[],
                      });
                    }
                    return next;
                  });
                }}
              >
                {editing ? 'Cancel Edit' : 'Edit Guide'}
              </button>
              <button
                className="text-sm bg-red-600 text-white hover:bg-red-700 px-3 py-1 rounded"
                onClick={async () => {
                  if (!guide) return;
                  if (!confirm('Delete this guide?')) return;
                  try {
                    setBusy('delete');
                    await deleteGuide({ id: String(guide.id) });
                    window.location.href = '/learn';
                  } catch (e) {
                    setError('Failed to delete guide');
                  } finally {
                    setBusy(null);
                  }
                }}
              >
                {busy === 'delete' ? 'Deleting...' : 'Delete Guide'}
              </button>
            </>
          )}
        </div>
      </div>

      {guide === undefined ? (
        <div className="text-gray-600">Loading guide...</div>
      ) : guide === null ? (
        <div className="text-red-600">Guide not found.</div>
      ) : count === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-gray-600">No photos for this guide.</div>
      ) : (
        <div className="relative bg-white rounded-lg shadow p-4">
          <div className="flex justify-center">
            <img
              src={images[index]}
              alt={`Slide ${index + 1}`}
              className="w-full max-h-[70vh] object-contain rounded border"
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-700">
            <div>{guide.authorName}</div>
            <div>
              Slide {index + 1} of {count}
            </div>
          </div>

          <button
            aria-label="Previous"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded shadow"
          >
            {"<"}
          </button>

          <button
            aria-label="Next"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded shadow"
          >
            {">"}
          </button>
        </div>
      )}

      {editing && guide && (
        <div className="mt-4 bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-3">Edit Guide</h2>
          {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                className="w-full border rounded px-3 py-2 bg-white"
                value={form?.title || ''}
                onChange={(e) => setForm((f: any) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Tags</label>
              <input
                className="w-full border rounded px-3 py-2 bg-white"
                value={form?.tags || ''}
                onChange={(e) => setForm((f: any) => ({ ...f, tags: e.target.value }))}
                placeholder="Comma-separated"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Content</label>
              <textarea
                className="w-full border rounded px-3 py-2 bg-white"
                rows={6}
                value={form?.content || ''}
                onChange={(e) => setForm((f: any) => ({ ...f, content: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Photos</label>
              <button
                type="button"
                onClick={() => setForm((f: any) => ({ ...f, photos: [...(f.photos || []), ''] }))}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
              >
                Add Photo
              </button>
            </div>
            {(!form?.photos || form.photos.length === 0) && (
              <p className="text-sm text-gray-500">No photos added. Click "Add Photo".</p>
            )}
            <div className="space-y-2">
              {(form?.photos || []).map((url: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    className="w-full border rounded px-3 py-2 bg-white"
                    value={url}
                    onChange={(e) =>
                      setForm((f: any) => ({
                        ...f,
                        photos: f.photos.map((p: string, i: number) => (i === idx ? e.target.value : p)),
                      }))
                    }
                    placeholder="https://...image.jpg"
                  />
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => setForm((f: any) => ({ ...f, photos: f.photos.filter((_: string, i: number) => i !== idx) }))}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={async () => {
                if (!guide) return;
                try {
                  setBusy('save');
                  setError(null);
                  await updateGuide({
                    id: String(guide.id),
                    title: form.title,
                    content: form.content,
                    tags: String(form.tags || '')
                      .split(',')
                      .map((s: string) => s.trim())
                      .filter(Boolean),
                    photoUrls: (form.photos || []).map((s: string) => s.trim()).filter(Boolean),
                  });
                  setEditing(false);
                } catch (e) {
                  setError('Failed to save changes');
                } finally {
                  setBusy(null);
                }
              }}
            >
              {busy === 'save' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {guide && (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-2">Guide Content</h2>
          <div className="text-gray-700 whitespace-pre-line">{guide.content}</div>
        </div>
      )}
    </div>
  );
}
