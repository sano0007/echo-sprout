'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import { useUser } from '@clerk/nextjs';

type FormState = {
  title: string;
  description: string;
  objectives: string; // newline separated in UI
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // minutes
  tags: string; // comma separated in UI
  visibility: 'public' | 'private' | 'unlisted';
  coverImageUrl?: string;
  publish: boolean;
  lessons: Array<{
    title: string;
    description: string;
    videoUrl: string;
    pdfs: string; // comma separated
  }>;
};

export default function LearningPathsCreatePage() {
  const { isSignedIn } = useUser();
  const createLearningPath = useMutation(api.learn.createLearningPath);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<null | {
    type: 'success' | 'error';
    text: string;
  }>(null);
  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    objectives: '',
    level: 'beginner',
    estimatedDuration: 60,
    tags: '',
    visibility: 'public',
    coverImageUrl: '',
    publish: false,
    lessons: [],
  });

  // Note: We intentionally do NOT record views on the paths index page.

  const update = (name: keyof FormState, value: string | number | boolean) =>
    setForm((f) => ({ ...f, [name]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      setMessage({
        type: 'error',
        text: 'Please sign in to create a learning path.',
      });
      return;
    }
    if (!form.title.trim() || !form.description.trim()) {
      setMessage({
        type: 'error',
        text: 'Title and description are required.',
      });
      return;
    }
    if (
      !Number.isFinite(form.estimatedDuration) ||
      form.estimatedDuration <= 0
    ) {
      setMessage({
        type: 'error',
        text: 'Estimated duration must be a positive number.',
      });
      return;
    }

    const objectives = form.objectives
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const tags = form.tags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      setIsSubmitting(true);
      const lessonsPayload = form.lessons.map((l) => ({
        title: l.title.trim(),
        description: l.description.trim() || undefined,
        videoUrl: l.videoUrl.trim() || undefined,
        pdfUrls: l.pdfs
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      }));
      await createLearningPath({
        title: form.title.trim(),
        description: form.description.trim(),
        objectives: objectives.length ? objectives : undefined,
        level: form.level,
        estimatedDuration: Number(form.estimatedDuration),
        tags,
        visibility: form.visibility,
        coverImageUrl: form.coverImageUrl?.trim() || undefined,
        publish: form.publish,
        lessons: lessonsPayload,
      });
      setMessage({
        type: 'success',
        text: 'Learning path created successfully.',
      });
      setForm({
        title: '',
        description: '',
        objectives: '',
        level: 'beginner',
        estimatedDuration: 60,
        tags: '',
        visibility: 'public',
        coverImageUrl: '',
        publish: false,
        lessons: [],
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create learning path.' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Create Learning Path</h1>
      <p className="text-gray-600 mb-6">
        Define the structure and details for a new learning path.
      </p>

      {message && (
        <div
          className={`mb-4 rounded px-4 py-3 text-white ${
            message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="space-y-6 bg-white rounded-lg border p-6"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g., Carbon Markets Fundamentals"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={4}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Brief overview of what learners will achieve"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Objectives</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={3}
            value={form.objectives}
            onChange={(e) => update('objectives', e.target.value)}
            placeholder={
              'One objective per line\nUnderstand credits\nExplore verification standards'
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <select
              className="w-full border rounded px-3 py-2 bg-white"
              value={form.level}
              onChange={(e) => update('level', e.target.value)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Duration (min)
            </label>
            <input
              type="number"
              min={1}
              className="w-full border rounded px-3 py-2"
              value={form.estimatedDuration}
              onChange={(e) =>
                update('estimatedDuration', Number(e.target.value))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Visibility</label>
            <select
              className="w-full border rounded px-3 py-2 bg-white"
              value={form.visibility}
              onChange={(e) => update('visibility', e.target.value)}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.tags}
              onChange={(e) => update('tags', e.target.value)}
              placeholder="Comma-separated, e.g., Carbon, Markets, Policy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Cover Image URL (optional)
            </label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.coverImageUrl}
              onChange={(e) => update('coverImageUrl', e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Lessons</h2>
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  lessons: [
                    ...f.lessons,
                    { title: '', description: '', videoUrl: '', pdfs: '' },
                  ],
                }))
              }
              className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
            >
              Add Lesson
            </button>
          </div>

          {form.lessons.length === 0 && (
            <p className="text-sm text-gray-500">
              No lessons added yet. Use "Add Lesson" to include placeholders
              (video and PDFs).
            </p>
          )}

          <div className="space-y-4">
            {form.lessons.map((lesson, idx) => (
              <div key={idx} className="border rounded p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">Lesson {idx + 1}</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        lessons: f.lessons.filter((_, i) => i !== idx),
                      }))
                    }
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Title
                    </label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={lesson.title}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          lessons: f.lessons.map((L, i) =>
                            i === idx ? { ...L, title: e.target.value } : L
                          ),
                        }))
                      }
                      placeholder="e.g., Introduction to Carbon Credits"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Video URL (placeholder)
                    </label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={lesson.videoUrl}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          lessons: f.lessons.map((L, i) =>
                            i === idx ? { ...L, videoUrl: e.target.value } : L
                          ),
                        }))
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                    value={lesson.description}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        lessons: f.lessons.map((L, i) =>
                          i === idx ? { ...L, description: e.target.value } : L
                        ),
                      }))
                    }
                    placeholder="Brief summary of the lesson"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">
                    PDF URLs (comma separated, placeholders)
                  </label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={lesson.pdfs}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        lessons: f.lessons.map((L, i) =>
                          i === idx ? { ...L, pdfs: e.target.value } : L
                        ),
                      }))
                    }
                    placeholder="https://...intro.pdf, https://...guide.pdf"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="publish"
            type="checkbox"
            checked={form.publish}
            onChange={(e) => update('publish', e.target.checked)}
          />
          <label htmlFor="publish" className="text-sm">
            Publish immediately
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={!isSignedIn || isSubmitting}
            className={`px-4 py-2 rounded text-white ${
              !isSignedIn || isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create Learning Path'}
          </button>
        </div>
      </form>
    </div>
  );
}
