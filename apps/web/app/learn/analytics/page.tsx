'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

export default function LearnAnalyticsPage() {
  const learningPaths = useQuery(api.learn.listLearningPaths);
  const allTopics = useQuery((api as any).forum.listAllTopics, {});
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold">Education & Forum Analytics</h1>
        <Link href="/learn" className="text-blue-600 hover:underline">
          Back to Learn
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Content</div>
          <div className="text-2xl font-semibold">{learningPaths ? learningPaths.length : '—'}</div>
        </div>
        <KpiCard title="Published" value="—" />
        <KpiCard title="Views" value="—" />
        <KpiCard title="Engagement" value="—" />
      </div>

      {/* Trends (static placeholders) */}
      <Section title="Trends (Last 30 Days)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PlaceholderChart title="Content Views" />
          <PlaceholderChart title="Forum Topics" />
        </div>
      </Section>

      {/* Content Mix (static placeholders) */}
      <Section title="Content Mix">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PlaceholderBars title="By Category" />
          <PlaceholderBars title="By Type" />
          <PlaceholderBars title="By Difficulty" />
        </div>
      </Section>

      {/* Lists */}
      <Section title="Top Content">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PlaceholderList title="Top by Views" />
          <PlaceholderList title="Top by Engagement" />
        </div>
      </Section>

      <Section title="Forum Health">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="font-medium mb-2">Unanswered Questions</div>
            <ul className="divide-y">
              {allTopics ? (
                (() => {
                  const filtered = (allTopics as any[]).filter((t: any) => (t.replies ?? 0) === 0);
                  return filtered.length ? (
                    filtered.map((t: any) => (
                      <li key={t.id as any} className="py-2">
                        <div className="text-sm font-medium text-gray-900 truncate">{t.title}</div>
                        <div className="text-xs text-gray-500">{t.views ?? 0} views • {t.replies ?? 0} replies</div>
                      </li>
                    ))
                  ) : (
                    <li className="py-2 text-sm text-gray-500">No unanswered questions</li>
                  );
                })()
              ) : (
                <>
                  <li className="py-2"><div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse"></div><div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div></li>
                  <li className="py-2"><div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse"></div><div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div></li>
                  <li className="py-2"><div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse"></div><div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div></li>
                  <li className="py-2"><div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse"></div><div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div></li>
                </>
              )}
            </ul>
          </div>
          <PlaceholderList title="Top Contributors" />
        </div>
      </Section>
    </div>
  );
}

function KpiCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function PlaceholderChart({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="font-medium mb-2">{title}</div>
      <div className="h-48 w-full bg-gray-100 rounded animate-pulse" />
    </div>
  );
}

function PlaceholderBars({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="font-medium mb-2">{title}</div>
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="w-full bg-gray-100 rounded h-3 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function PlaceholderList({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="font-medium mb-2">{title}</div>
      <ul className="divide-y">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="py-2">
            <div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse" />
            <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse" />
          </li>
        ))}
      </ul>
    </div>
  );
}

