'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

type Slide = {
  image: string;
  details: string;
};

const slides: Slide[] = [
  {
    image: 'https://placehold.co/800x450?text=Step+1',
    details:
      'Step 1: Placeholder details explaining the first action in the walkthrough.',
  },
  {
    image: 'https://placehold.co/800x450?text=Step+2',
    details: 'Step 2: More placeholder details to demonstrate navigation.',
  },
  {
    image: 'https://placehold.co/800x450?text=Step+3',
    details: 'Step 3: Final placeholder description to complete the demo.',
  },
];

export default function WalkthroughPage() {
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i === 0 ? slides.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === slides.length - 1 ? 0 : i + 1));

  const current = slides[index];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Project Walkthrough</h1>
        <Link href="/learn" className="text-blue-600 hover:underline">
          Back to Learn
        </Link>
      </div>

      <div className="relative bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-center">
          <div className="relative w-full h-[60vh]">
            <Image
              src={
                current?.image ?? 'https://placehold.co/800x450?text=No+Image'
              }
              alt={`Slide ${index + 1}`}
              fill
              sizes="100vw"
              className="object-contain rounded border"
              priority
            />
          </div>
        </div>

        <div className="mt-4 border-t pt-3 text-gray-700">
          {current?.details}
        </div>

        <button
          aria-label="Previous"
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded shadow"
        >
          {'<'}
        </button>

        <button
          aria-label="Next"
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded shadow"
        >
          {'>'}
        </button>
      </div>
    </div>
  );
}
