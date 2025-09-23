"use client";

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import Link from 'next/link';

export default function LearningPathDetailsPage() {
  const params = useParams();
  const id = useMemo(() => (Array.isArray(params?.id) ? params.id[0] : (params?.id as string)), [params]);

  const data = useQuery(api.learn.getLearningPath, id ? { id } : 'skip');

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-start justify-between mb-4">
        <h1 className="text-3xl font-bold">{data.title}</h1>
        <Link href="/learn" className="text-blue-600 hover:underline">Back</Link>
      </div>

      <div className="text-gray-600 mb-6">
        <span className="mr-4">Level: <strong>{cap(data.level)}</strong></span>
        <span className="mr-4">Duration: <strong>{data.estimatedDuration} min</strong></span>
        <span>Modules: <strong>{data.moduleCount}</strong></span>
      </div>

      {data.coverImageUrl && (
        <img src={data.coverImageUrl} alt="Cover" className="w-full max-h-64 object-cover rounded mb-6" />
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

      <div className="text-sm text-gray-500">
        <span>Status: {data.status}</span>
        <span className="mx-2">•</span>
        <span>Created by: {data.createdByName}</span>
      </div>
    </div>
  );
}

