'use client';

import { api } from '@packages/backend/convex/_generated/api';
import { useQuery } from 'convex/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Recharts = require('recharts') as typeof import('recharts');

export default function LearnAnalytics({ embed = false }: { embed?: boolean }) {
  const learningPaths = useQuery(api.learn.listLearningPaths);
  const views = useQuery(api.learn.totalPathsEntries);
  const engagement = useQuery(api.learn.engagementPercent);
  const totalUsers = useQuery((api as any).users.totalUsers, {});
  const reportTemplateRef = useRef<string | HTMLElement>('');

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const defaultFromIso = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().slice(0, 10);
  }, []);

  const [viewsFromIso, setViewsFromIso] = useState<string>(defaultFromIso);
  const [viewsToIso, setViewsToIso] = useState<string>(todayIso);
  const [topicsFromIso, setTopicsFromIso] = useState<string>(defaultFromIso);
  const [topicsToIso, setTopicsToIso] = useState<string>(todayIso);
  const [viewsEngFromIso, setViewsEngFromIso] =
    useState<string>(defaultFromIso);
  const [viewsEngToIso, setViewsEngToIso] = useState<string>(todayIso);

  const viewsRange = useQuery(api.learn.viewsByDateRange, {
    from: viewsFromIso,
    to: viewsToIso,
  });
  const topicsRange = useQuery((api as any).forum.topicsByDateRange, {
    from: topicsFromIso,
    to: topicsToIso,
  });
  const viewsEngRange = useQuery(api.learn.viewsAndEngagementByRange, {
    from: viewsEngFromIso,
    to: viewsEngToIso,
  });
  const topByViews = useQuery(api.learn.pathsByViews);
  const topByEngagement = useQuery(api.learn.pathsByEngagement);
  const allTopics = useQuery((api as any).forum.listAllTopics, {});
  const contributors = useQuery((api as any).forum.replyContributors, {});

  const handleGeneratePdf = async () => {
    try {
      const root = document.getElementById('anal_id');
      if (!root) return;

      const toHide = root.querySelectorAll('[data-report-exclude]');
      const prevVisibility: string[] = [];
      toHide.forEach((el: Element, i) => {
        const style = (el as HTMLElement).style;
        prevVisibility[i] = style.visibility;
        style.visibility = 'hidden';
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4',
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;
      const spacing = 12;

      const allBlocks = Array.from(
        root.querySelectorAll('[data-report-block]')
      ) as HTMLElement[];
      const blocks = allBlocks.filter(
        (el) => el.parentElement?.closest('[data-report-block]') === null
      );

      const untruncateEls = root.querySelectorAll('[data-report-untruncate]');
      const prevOverflow: string[] = [];
      const prevTextOverflow: string[] = [];
      const prevWhiteSpace: string[] = [];
      untruncateEls.forEach((el: Element, i) => {
        const style = (el as HTMLElement).style;
        prevOverflow[i] = style.overflow;
        prevTextOverflow[i] = style.textOverflow as string;
        prevWhiteSpace[i] = style.whiteSpace as string;
        style.overflow = 'visible';
        style.textOverflow = 'clip';
        style.whiteSpace = 'normal';
      });

      if (blocks.length === 0) {
        const canvas = await html2canvas(root, {
          useCORS: true,
          logging: false,
          width: root.scrollWidth,
          height: root.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = contentWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = margin;
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          position,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        );
        heightLeft -= contentHeight;

        const overlap = 24;
        while (heightLeft > 0) {
          pdf.addPage();
          position = margin + (heightLeft - imgHeight + overlap);
          pdf.addImage(
            imgData,
            'PNG',
            margin,
            position,
            imgWidth,
            imgHeight,
            undefined,
            'FAST'
          );
          heightLeft -= contentHeight - overlap;
        }
      } else {
        let y = margin;
        for (const node of Array.from(blocks)) {
          const el = node as HTMLElement;
          const isHeaderBlock = !!el.querySelector('h1');

          let prevPaddingTop: string | undefined;
          let prevPaddingBottom: string | undefined;
          if (isHeaderBlock) {
            prevPaddingTop = el.style.paddingTop;
            prevPaddingBottom = el.style.paddingBottom;
            el.style.paddingTop = '16px';
            el.style.paddingBottom = '12px';
          }

          const w = el.scrollWidth || el.clientWidth;
          const h = el.scrollHeight || el.clientHeight;

          const canvas = await html2canvas(el, {
            useCORS: true,
            logging: false,
            width: w,
            height: h,
          });

          if (isHeaderBlock) {
            el.style.paddingTop = prevPaddingTop ?? '';
            el.style.paddingBottom = prevPaddingBottom ?? '';
          }
          const imgData = canvas.toDataURL('image/png');
          const naturalWidth = canvas.width;
          const naturalHeight = canvas.height;

          const renderWidth = contentWidth;
          const renderHeight = (naturalHeight * renderWidth) / naturalWidth;

          const scaleFactor = Math.min(1, contentHeight / renderHeight);
          const finalWidth = renderWidth * scaleFactor;
          const finalHeight = renderHeight * scaleFactor;

          if (y + finalHeight > pageHeight - margin) {
            pdf.addPage();
            y = margin;
          }

          pdf.addImage(
            imgData,
            'PNG',
            margin,
            y,
            finalWidth,
            finalHeight,
            undefined,
            'FAST'
          );
          y += finalHeight + spacing;
        }
      }

      untruncateEls.forEach((el: Element, i) => {
        const style = (el as HTMLElement).style;
        style.overflow = prevOverflow[i] ?? '';
        style.textOverflow = (prevTextOverflow[i] ?? '') as any;
        style.whiteSpace = (prevWhiteSpace[i] ?? '') as any;
      });

      toHide.forEach((el: Element, i) => {
        (el as HTMLElement).style.visibility = prevVisibility[i] ?? '';
      });

      pdf.save(`learn-analytics-report-${todayIso}.pdf`);
    } catch (err) {
      console.error('Error generating PDF', err);
    }
  };

  return (
    <div
      id={'anal_id'}
      ref={reportTemplateRef as unknown as any}
      className={embed ? 'space-y-6' : 'max-w-7xl mx-auto p-6 space-y-6'}
    >
      <div
        className="flex items-center justify-between gap-4 flex-wrap"
        data-report-block
      >
        <h1 className="text-3xl font-bold">Education & Forum Analytics</h1>
        <div className={'flex justify-between items-center gap-4 flex-wrap'}>
          <button
            data-report-exclude
            className={'px-4 py-2 bg-blue-500 text-white text-bold rounded-md'}
            onClick={handleGeneratePdf}
          >
            Generate Report
          </button>
          {!embed && (
            <Link
              data-report-exclude
              href="/learn"
              className="text-blue-600 hover:underline"
            >
              Back to Learn
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-report-block>
        <Kpi
          title="Total Content"
          value={
            learningPaths ? ((learningPaths as any[])?.length ?? '—') : '—'
          }
        />
        <Kpi
          title="Total Users"
          value={typeof totalUsers === 'number' ? totalUsers : '—'}
        />
        <Kpi title="Views" value={typeof views === 'number' ? views : '—'} />
        <Kpi
          title="Engagement"
          value={typeof engagement === 'number' ? `${engagement}%` : '—'}
        />
      </div>

      <Section title="Trends (Last 30 Days)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <DateRangePicker
              from={viewsFromIso}
              to={viewsToIso}
              onChange={(f, t) => {
                setViewsFromIso(f);
                setViewsToIso(t);
              }}
            />
            <ViewsLineChart data={viewsRange} />
          </div>
          <div className="space-y-3">
            <DateRangePicker
              from={topicsFromIso}
              to={topicsToIso}
              onChange={(f, t) => {
                setTopicsFromIso(f);
                setTopicsToIso(t);
              }}
            />
            <ForumTopicsChart data={topicsRange} />
          </div>
        </div>
      </Section>

      <Section title="Views vs Engagements">
        <div className="space-y-3">
          <DateRangePicker
            from={viewsEngFromIso}
            to={viewsEngToIso}
            onChange={(f, t) => {
              setViewsEngFromIso(f);
              setViewsEngToIso(t);
            }}
          />
          <ViewsEngagementsAreaChart data={viewsEngRange} />
        </div>
      </Section>

      <Section title="Top Content">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="font-medium mb-2">Top by Views</div>
            <ul className="divide-y">
              {topByViews === undefined ? (
                <>
                  <li className="py-2">
                    <div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div>
                  </li>
                  <li className="py-2">
                    <div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div>
                  </li>
                  <li className="py-2">
                    <div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div>
                  </li>
                </>
              ) : Array.isArray(topByViews) &&
                (topByViews as any[]).length > 0 ? (
                (topByViews as any[]).slice(0, 5).map((r: any) => (
                  <li key={r.id} className="py-2">
                    <div
                      className="text-sm font-medium text-gray-900 truncate"
                      data-report-untruncate
                    >
                      {r.title}
                    </div>
                    <div className="text-xs text-gray-500">{r.views} views</div>
                  </li>
                ))
              ) : (
                <li className="py-2 text-sm text-gray-500">No data</li>
              )}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="font-medium mb-2">Top by Engagement</div>
            <ul className="divide-y">
              {topByEngagement === undefined ? (
                <>
                  <li className="py-2">
                    <div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div>
                  </li>
                  <li className="py-2">
                    <div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div>
                  </li>
                  <li className="py-2">
                    <div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div>
                  </li>
                </>
              ) : Array.isArray(topByEngagement) &&
                (topByEngagement as any[]).length > 0 ? (
                (topByEngagement as any[]).slice(0, 5).map((r: any) => (
                  <li key={r.id} className="py-2">
                    <div
                      className="text-sm font-medium text-gray-900 truncate"
                      data-report-untruncate
                    >
                      {r.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {r.engagement}% engagement
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-2 text-sm text-gray-500">No data</li>
              )}
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
                  const filtered = (allTopics as any[]).filter(
                    (t: any) => (t.replyCount ?? 0) === 0
                  );
                  return filtered.length ? (
                    filtered.slice(0, 5).map((t: any) => (
                      <li key={t.id as any} className="py-2">
                        <div
                          className="text-sm font-medium text-gray-900 truncate"
                          data-report-untruncate
                        >
                          {t.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t.views ?? 0} views
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="py-2 text-sm text-gray-500">
                      No unanswered questions
                    </li>
                  );
                })()
              ) : (
                <>
                  <li className="py-2">
                    <div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div>
                  </li>
                  <li className="py-2">
                    <div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="font-medium mb-2">Top Contributors</div>
            <ul className="divide-y">
              {contributors ? (
                (contributors as any[]).length ? (
                  (contributors as any[]).slice(0, 5).map((c: any) => (
                    <li key={c.userId} className="py-2">
                      <div
                        className="text-sm font-medium text-gray-900 truncate"
                        data-report-untruncate
                      >
                        {c.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {c.replies} replies
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="py-2 text-sm text-gray-500">
                    No contributors yet
                  </li>
                )
              ) : (
                <>
                  <li className="py-2">
                    <div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div>
                  </li>
                  <li className="py-2">
                    <div className="h-4 bg-gray-100 rounded w-2/3 mb-1 animate-pulse"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse"></div>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3" data-report-block>
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function DateRangePicker({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (f: string, t: string) => void;
}) {
  return (
    <div className=" rounded-lg shadow p-4" data-report-exclude>
      <div className="font-medium  mb-2">Date Range</div>
      <div className="flex items-center gap-3">
        <input
          type="date"
          className="border rounded bg-white px-2 py-1 text-sm dark:[color-scheme:dark]"
          value={from}
          max={to}
          onChange={(e) => onChange(e.target.value, to)}
        />
        <span className="text-gray-500">to</span>
        <input
          type="date"
          className="border rounded bg-white px-2 py-1 text-sm "
          value={to}
          min={from}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => onChange(from, e.target.value)}
        />
      </div>
    </div>
  );
}

function ViewsLineChart({
  data,
}: {
  data: { date: string; value: number }[] | undefined;
}) {
  const items = Array.isArray(data) ? data : [];
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="font-medium mb-2">Content Views</div>
      <div className="h-64">
        {data === undefined ? (
          <div className="h-full w-full bg-gray-100 rounded animate-pulse" />
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-500">No data</div>
        ) : (
          <Recharts.ResponsiveContainer width="100%" height="100%">
            <Recharts.LineChart
              data={items}
              margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
            >
              <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <Recharts.XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickMargin={8}
                minTickGap={24}
              />
              <Recharts.YAxis
                tick={{ fontSize: 12, fill: '#6B7280' }}
                width={40}
                allowDecimals={false}
              />
              <Recharts.Tooltip
                contentStyle={{ fontSize: 12 }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Recharts.Line
                type="monotone"
                dataKey="value"
                stroke="#2563EB"
                strokeWidth={2}
                dot={false}
              />
            </Recharts.LineChart>
          </Recharts.ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function ForumTopicsChart({
  data,
}: {
  data: { date: string; value: number }[] | undefined;
}) {
  const items = Array.isArray(data) ? data : [];
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="font-medium mb-2">Forum Topics</div>
      <div className="h-64">
        {data === undefined ? (
          <div className="h-full w-full bg-gray-100 rounded animate-pulse" />
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-500">No data</div>
        ) : (
          <Recharts.ResponsiveContainer width="100%" height="100%">
            <Recharts.LineChart
              data={items}
              margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
            >
              <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <Recharts.XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickMargin={8}
                minTickGap={24}
              />
              <Recharts.YAxis
                tick={{ fontSize: 12, fill: '#6B7280' }}
                width={40}
                allowDecimals={false}
              />
              <Recharts.Tooltip
                contentStyle={{ fontSize: 12 }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Recharts.Line
                type="monotone"
                dataKey="value"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
              />
            </Recharts.LineChart>
          </Recharts.ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function ViewsEngagementsAreaChart({
  data,
}: {
  data: { date: string; views: number; engagement: number }[] | undefined;
}) {
  const items = Array.isArray(data) ? data : [];
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="font-medium mb-2">Views vs Engagements</div>
      <div className="h-72">
        {data === undefined ? (
          <div className="h-full w-full bg-gray-100 rounded animate-pulse" />
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-500">No data</div>
        ) : (
          <Recharts.ResponsiveContainer width="100%" height="100%">
            <Recharts.AreaChart
              data={items}
              margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
            >
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Recharts.CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <Recharts.XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickMargin={8}
                minTickGap={24}
              />
              <Recharts.YAxis
                tick={{ fontSize: 12, fill: '#6B7280' }}
                width={40}
                allowDecimals={false}
              />
              <Recharts.Tooltip
                contentStyle={{ fontSize: 12 }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Recharts.Area
                type="monotone"
                dataKey="views"
                stroke="#2563EB"
                fillOpacity={1}
                fill="url(#colorViews)"
                strokeWidth={2}
              />
              <Recharts.Area
                type="monotone"
                dataKey="engagement"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#colorEng)"
                strokeWidth={2}
              />
              <Recharts.Legend />
            </Recharts.AreaChart>
          </Recharts.ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
