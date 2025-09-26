'use client';

import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';

export default function LearnAnalyticsPage() {
  const learningPaths = useQuery(api.learn.listLearningPaths);
  const allTopics = useQuery((api as any).forum.listAllTopics, {});
  const views = useQuery(api.learn.totalPathsEntries);
  const topByViews = useQuery(api.learn.pathsByViews);
  const topByEngagement = useQuery(api.learn.pathsByEngagement);
  const engagement = useQuery(api.learn.engagementPercent);
  const contributors = useQuery((api as any).forum.replyContributors, {});
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
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Views</div>
          <div className="text-2xl font-semibold">{typeof views === 'number' ? views : '—'}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Engagement</div>
          <div className="text-2xl font-semibold">
            {typeof engagement === 'number' ? `${engagement}%` : '—'}
          </div>
        </div>
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
          <div className="bg-white rounded-lg shadow p-4">
            <div className="font-medium mb-2">Top by Views</div>
            <ul className="divide-y">
              {topByViews === undefined ? (
                <>
                  <li className="py-2"><div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse"></div><div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div></li>
                  <li className="py-2"><div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse"></div><div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div></li>
                  <li className="py-2"><div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse"></div><div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div></li>
                  <li className="py-2"><div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse"></div><div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div></li>
                </>
              ) : (Array.isArray(topByViews) && (topByViews as any[]).length > 0 ? (
                (topByViews as any[]).slice(0, 5).map((r: any) => (
                  <li key={r.id} className="py-2">
                    <div className="text-sm font-medium text-gray-900 truncate">{r.title}</div>
                    <div className="text-xs text-gray-500">{r.views} views</div>
                  </li>
                ))
              ) : (
                <li className="py-2 text-sm text-gray-500">No data</li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="font-medium mb-2">Top by Engagement</div>
            <ul className="divide-y">
              {topByEngagement === undefined ? (
                <>
                  <li className="py-2"><div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse"></div><div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div></li>
                  <li className="py-2"><div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse"></div><div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div></li>
                  <li className="py-2"><div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse"></div><div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div></li>
                  <li className="py-2"><div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse"></div><div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div></li>
                </>
              ) : (Array.isArray(topByEngagement) && (topByEngagement as any[]).length > 0 ? (
                (topByEngagement as any[]).slice(0, 5).map((r: any) => (
                  <li key={r.id} className="py-2">
                    <div className="text-sm font-medium text-gray-900 truncate">{r.title}</div>
                    <div className="text-xs text-gray-500">{r.engagement}% engagement</div>
                  </li>
                ))
              ) : (
                <li className="py-2 text-sm text-gray-500">No data</li>
              ))}
            </ul>
          </div>
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
          <div className="bg-white rounded-lg shadow p-4">
            <div className="font-medium mb-2">Top Contributors</div>
            <ul className="divide-y">
              {contributors ? (
                (contributors as any[]).length ? (
                  (contributors as any[])
                    .slice(0, 5)
                    .map((c: any) => (
                    <li key={c.userId} className="py-2">
                      <div className="text-sm font-medium text-gray-900 truncate">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.replies} replies</div>
                    </li>
                  ))
                ) : (
                  <li className="py-2 text-sm text-gray-500">No contributors yet</li>
                )
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

