"use client";

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

export default function GuideSlidesPage() {
  const params = useParams();
  const id = useMemo(() => (Array.isArray(params?.id) ? params.id[0] : (params?.id as string)), [params]);
  const guide = useQuery(api.learn.getGuide, id ? { id } : 'skip');

  const [index, setIndex] = useState(0);
  const images = guide?.images ?? [];
  const count = images.length;

  const prev = () => setIndex((i) => (count === 0 ? 0 : (i === 0 ? count - 1 : i - 1)));
  const next = () => setIndex((i) => (count === 0 ? 0 : (i === count - 1 ? 0 : i + 1)));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{guide ? guide.title : 'Guide'}</h1>
        <Link href="/learn" className="text-blue-600 hover:underline">Back to Learn</Link>
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

      {guide && (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-2">Guide Content</h2>
          <div className="text-gray-700 whitespace-pre-line">{guide.content}</div>
        </div>
      )}
    </div>
  );
}
