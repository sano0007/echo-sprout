"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import Link from 'next/link';

export default function LearningPathDetailsPage() {
  const params = useParams();
  const id = useMemo(() => (Array.isArray(params?.id) ? params.id[0] : (params?.id as string)), [params]);

  const data = useQuery(api.learn.getLearningPath, id ? { id } : 'skip');
  const lessons = useQuery(api.learn.listLessonsForPath, id ? { pathId: id } : 'skip');
  const updatePath = useMutation(api.learn.updateLearningPath);
  const deletePath = useMutation(api.learn.deleteLearningPath);
  const updateLesson = useMutation(api.learn.updateLesson);
  const deleteLesson = useMutation(api.learn.deleteLesson);

  const [editingPath, setEditingPath] = useState(false);
  const [pathForm, setPathForm] = useState<any>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Local progress state (per user via localStorage)
  const storageKey = id ? `learningPathProgress:${id}` : '';
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      if (!storageKey) return;
      const raw = localStorage.getItem(storageKey);
      if (raw) setCompleted(JSON.parse(raw));
    } catch {}
  }, [storageKey]);
  useEffect(() => {
    try {
      if (!storageKey) return;
      localStorage.setItem(storageKey, JSON.stringify(completed));
    } catch {}
  }, [storageKey, completed]);
  const toggle = (key: string) => setCompleted((c) => ({ ...c, [key]: !c[key] }));

  if (!id) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-red-600">Invalid learning path id.</p>
      </div>
    );
  }

  if (data === undefined) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-gray-600">Loading learning path...</p>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-red-600">Learning path not found.</p>
        <Link href="/learn" className="text-blue-600 hover:underline">Back to Learning Hub</Link>
      </div>
    );
  }

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const getYouTubeEmbed = (url: string): string | null => {
    if (!url) return null;
    try {
      const u = new URL(url);
      // youtu.be/<id>
      if (u.hostname === 'youtu.be') {
        const id = u.pathname.replace('/', '').trim();
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      // www.youtube.com or youtube.com
      if (u.hostname.includes('youtube.com')) {
        // /watch?v=<id>
        const v = u.searchParams.get('v');
        if (v) return `https://www.youtube.com/embed/${v}`;
        // /embed/<id>
        if (u.pathname.startsWith('/embed/')) return url;
        // /shorts/<id>
        if (u.pathname.startsWith('/shorts/')) {
          const id = u.pathname.split('/')[2];
          return id ? `https://www.youtube.com/embed/${id}` : null;
        }
      }
    } catch (_) {
      // ignore parse errors
    }
    return null;
  };

  // Compute progress based on checked items across lessons
  const progress = useMemo(() => {
    const list = lessons || [];
    let total = 0;
    let done = 0;
    list.forEach((L) => {
      if (L.videoUrl) {
        total += 1;
        if (completed[`v:${String(L.id)}`]) done += 1;
      }
      (L.pdfUrls || []).forEach((_, i) => {
        total += 1;
        if (completed[`p:${String(L.id)}:${i}`]) done += 1;
      });
    });
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, pct };
  }, [lessons, completed]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-start justify-between mb-4">
        <h1 className="text-3xl font-bold">{data.title}</h1>
        <div className="flex items-center gap-3">
          <Link href="/learn" className="text-blue-600 hover:underline">Back</Link>
          <button
            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
            onClick={() => {
              setEditingPath((e) => {
                const next = !e;
                if (next) {
                  setPathForm({
                    title: data.title,
                    description: data.description,
                    objectives: (data.objectives || []).join('\n'),
                    level: data.level,
                    estimatedDuration: data.estimatedDuration,
                    tags: (data.tags || []).join(', '),
                    visibility: data.visibility,
                    coverImageUrl: data.coverImageUrl || '',
                    publish: data.isPublished,
                  });
                }
                return next;
              });
            }}
          >
            {editingPath ? 'Cancel Edit' : 'Edit Path'}
          </button>
          <button
            className="text-sm bg-red-600 text-white hover:bg-red-700 px-3 py-1 rounded"
            onClick={async () => {
              if (!confirm('Delete this learning path and all its lessons?')) return;
              try {
                setBusy('deletePath');
                await deletePath({ id: String(data.id) });
                window.location.href = '/learn';
              } catch (e) {
                setError('Failed to delete path');
              } finally {
                setBusy(null);
              }
            }}
          >
            {busy === 'deletePath' ? 'Deleting...' : 'Delete Path'}
          </button>
        </div>
      </div>

      {/* Progress bar for this course */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>{progress.pct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress.pct}%` }}></div>
        </div>
      </div>

      <div className="text-gray-600 mb-6">
        <span className="mr-4">Level: <strong>{cap(data.level)}</strong></span>
        <span className="mr-4">Duration: <strong>{data.estimatedDuration} min</strong></span>
        <span>Modules: <strong>{data.moduleCount}</strong></span>
      </div>

      {data.coverImageUrl && (
        <img src={data.coverImageUrl} alt="Cover" className="w-full max-h-64 object-cover rounded mb-6" />
      )}

      {editingPath && (
        <div className="bg-white border rounded p-5 mb-6">
          <h2 className="text-xl font-semibold mb-3">Edit Learning Path</h2>
          {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input className="w-full border rounded px-3 py-2" value={pathForm.title}
                     onChange={(e) => setPathForm((f: any) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea className="w-full border rounded px-3 py-2" rows={3} value={pathForm.description}
                        onChange={(e) => setPathForm((f: any) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">Objectives</label>
              <textarea className="w-full border rounded px-3 py-2" rows={3} value={pathForm.objectives}
                        onChange={(e) => setPathForm((f: any) => ({ ...f, objectives: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Level</label>
              <select className="w-full border rounded px-3 py-2" value={pathForm.level}
                      onChange={(e) => setPathForm((f: any) => ({ ...f, level: e.target.value }))}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (min)</label>
              <input type="number" min={1} className="w-full border rounded px-3 py-2" value={pathForm.estimatedDuration}
                     onChange={(e) => setPathForm((f: any) => ({ ...f, estimatedDuration: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Visibility</label>
              <select className="w-full border rounded px-3 py-2" value={pathForm.visibility}
                      onChange={(e) => setPathForm((f: any) => ({ ...f, visibility: e.target.value }))}>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Tags</label>
              <input className="w-full border rounded px-3 py-2" value={pathForm.tags}
                     onChange={(e) => setPathForm((f: any) => ({ ...f, tags: e.target.value }))} />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-1">Cover Image URL</label>
              <input className="w-full border rounded px-3 py-2" value={pathForm.coverImageUrl}
                     onChange={(e) => setPathForm((f: any) => ({ ...f, coverImageUrl: e.target.value }))} />
            </div>
            <div className="md:col-span-3 flex items-center gap-2">
              <input id="publish_now" type="checkbox" checked={!!pathForm.publish}
                     onChange={(e) => setPathForm((f: any) => ({ ...f, publish: e.target.checked }))} />
              <label htmlFor="publish_now" className="text-sm">Published</label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={async () => {
                try {
                  setBusy('savePath');
                  setError(null);
                  await updatePath({
                    id: String(data.id),
                    title: pathForm.title,
                    description: pathForm.description,
                    objectives: String(pathForm.objectives)
                      .split('\n').map((s) => s.trim()).filter(Boolean),
                    level: pathForm.level,
                    estimatedDuration: Number(pathForm.estimatedDuration),
                    tags: String(pathForm.tags).split(',').map((s) => s.trim()).filter(Boolean),
                    visibility: pathForm.visibility,
                    coverImageUrl: pathForm.coverImageUrl?.trim() || undefined,
                    publish: !!pathForm.publish,
                  });
                  setEditingPath(false);
                } catch (e) {
                  setError('Failed to save changes');
                } finally {
                  setBusy(null);
                }
              }}
            >
              {busy === 'savePath' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border rounded p-5 mb-6">
        <h2 className="text-xl font-semibold mb-2">Overview</h2>
        <p className="text-gray-700 whitespace-pre-line">{data.description}</p>
      </div>

      {Array.isArray(data.objectives) && data.objectives.length > 0 && (
        <div className="bg-white border rounded p-5 mb-6">
          <h2 className="text-xl font-semibold mb-2">Objectives</h2>
          <ul className="list-disc pl-5 text-gray-700">
            {data.objectives.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(data.tags) && data.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {data.tags.map((t) => (
            <span key={t} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">{t}</span>
          ))}
        </div>
      )}

      <div className="bg-white border rounded p-5 mb-6">
        <h2 className="text-xl font-semibold mb-2">Lessons</h2>
        {!lessons || lessons.length === 0 ? (
          <p className="text-gray-600">No lessons yet. Lessons you add when creating or editing will appear here.</p>
        ) : (
          <ol className="space-y-4 list-decimal pl-6">
            {lessons.map((L) => (
              <li key={String(L.id)}>
                <div className="flex items-start justify-between">
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{L.title}</div>
                      <div className="flex items-center gap-2">
                        <LessonEditButtons lesson={L} onUpdate={async (payload) => {
                          try {
                            setBusy(`updateLesson-${String(L.id)}`);
                            await updateLesson({ id: String(L.id), ...payload });
                          } finally {
                            setBusy(null);
                          }
                        }} onDelete={async () => {
                          if (!confirm('Delete this lesson?')) return;
                          try {
                            setBusy(`deleteLesson-${String(L.id)}`);
                            await deleteLesson({ id: String(L.id) });
                          } finally {
                            setBusy(null);
                          }
                        }} busyKey={busy} />
                      </div>
                    </div>
                    {L.description && (
                      <div className="text-gray-600 text-sm mb-2">{L.description}</div>
                    )}

                    {/* Video */}
                    <div className="mb-2">
                      {L.videoUrl ? (
                        (() => {
                          const embed = getYouTubeEmbed(L.videoUrl);
                          const key = `v:${String(L.id)}`;
                          return (
                            <div>
                              <label className="flex items-center gap-2 mb-2 text-sm text-gray-700">
                                <input type="checkbox" checked={!!completed[key]} onChange={() => toggle(key)} />
                                <span>Mark video as watched</span>
                              </label>
                              {embed ? (
                                <div className="w-full" style={{ aspectRatio: '16 / 9' }}>
                                  <iframe
                                    src={embed}
                                    title={`YouTube video: ${L.title}`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    className="w-full h-full rounded border"
                                  />
                                </div>
                              ) : (
                                <div className="text-gray-500 text-sm">
                                  Video: <a className="text-blue-600 hover:underline" href={L.videoUrl} target="_blank" rel="noreferrer">open link</a>
                                </div>
                              )}
                            </div>
                          );
                        })()
                      ) : (
                        <div className="text-gray-500 text-sm">Video: placeholder</div>
                      )}
                    </div>

                    {/* PDFs */}
                    <div className="text-gray-700 text-sm">
                      <div className="mb-1">PDFs:</div>
                      {L.pdfUrls && L.pdfUrls.length > 0 ? (
                        <ul className="space-y-1">
                          {L.pdfUrls.map((u, i) => {
                            const key = `p:${String(L.id)}:${i}`;
                            return (
                              <li key={i} className="flex items-center gap-2">
                                <input type="checkbox" checked={!!completed[key]} onChange={() => toggle(key)} />
                                <a className="text-blue-600 hover:underline" href={u} target="_blank" rel="noreferrer">pdf {i + 1}</a>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="text-gray-500">placeholders</div>
                      )}
                    </div>
                  </div>
                  <span className="ml-4 text-xs text-gray-500">#{(L as any).order + 1}</span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="text-sm text-gray-500">
        <span>Status: {data.status}</span>
        <span className="mx-2">•</span>
        <span>Created by: {data.createdByName}</span>
      </div>
    </div>
  );
}

type Lesson = {
  id: string | { _id: string };
  title: string;
  description?: string;
  videoUrl?: string;
  pdfUrls: string[];
  order: number;
};

function LessonEditButtons({ lesson, onUpdate, onDelete, busyKey }: {
  lesson: Lesson;
  onUpdate: (payload: Partial<Omit<Lesson, 'id' | 'order'>>) => Promise<void>;
  onDelete: () => Promise<void>;
  busyKey: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: lesson.title,
    description: lesson.description || '',
    videoUrl: lesson.videoUrl || '',
    pdfs: (lesson.pdfUrls || []).join(', '),
  });
  const saving = busyKey === `updateLesson-${String((lesson as any).id || lesson)}`;
  const deleting = busyKey === `deleteLesson-${String((lesson as any).id || lesson)}`;

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <button className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded" onClick={() => setEditing(true)}>Edit</button>
        <button className="text-xs bg-red-600 text-white hover:bg-red-700 px-2 py-1 rounded" onClick={onDelete} disabled={!!deleting}>
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border rounded p-3 w-full max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">Title</label>
          <input className="w-full border rounded px-2 py-1 text-sm" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Video URL</label>
          <input className="w-full border rounded px-2 py-1 text-sm" value={form.videoUrl} onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))} />
        </div>
      </div>
      <div className="mt-2">
        <label className="block text-xs font-medium mb-1">Description</label>
        <textarea className="w-full border rounded px-2 py-1 text-sm" rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </div>
      <div className="mt-2">
        <label className="block text-xs font-medium mb-1">PDF URLs (comma)</label>
        <input className="w-full border rounded px-2 py-1 text-sm" value={form.pdfs} onChange={(e) => setForm((f) => ({ ...f, pdfs: e.target.value }))} />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          className="text-xs bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded"
          onClick={async () => {
            await onUpdate({
              title: form.title,
              description: form.description,
              videoUrl: form.videoUrl,
              pdfUrls: form.pdfs.split(',').map((s) => s.trim()).filter(Boolean),
            });
            setEditing(false);
          }}
          disabled={!!saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded" onClick={() => setEditing(false)}>Cancel</button>
      </div>
    </div>
  );
}
