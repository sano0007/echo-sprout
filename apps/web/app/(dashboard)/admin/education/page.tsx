'use client';

import { api } from '@packages/backend';
import { useMutation, useQuery } from 'convex/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Check, Edit, Eye, MoreHorizontal, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as Recharts from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  moduleCount: number;
  status: 'published' | 'draft' | 'archived';
  isPublished: boolean;
  createdByName: string;
  enrollmentCount?: number;
  publishedAt?: number;
  lastUpdatedAt: number;
}

const LearningPathsTable = () => {
  const learningPaths = useQuery(api.learn.listLearningPaths) || [];
  const updateLearningPath = useMutation(api.learn.updateLearningPath);
  const deleteLearningPath = useMutation(api.learn.deleteLearningPath);

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleApprove = async (pathId: string) => {
    try {
      await updateLearningPath({
        id: pathId,
        publish: true,
      });
    } catch (error) {
      console.error('Failed to approve learning path:', error);
    }
  };

  const handleReject = async (pathId: string) => {
    try {
      await updateLearningPath({
        id: pathId,
        publish: false,
      });
    } catch (error) {
      console.error('Failed to reject learning path:', error);
    }
  };

  const handleDelete = async (pathId: string) => {
    if (confirm('Are you sure you want to delete this learning path?')) {
      try {
        await deleteLearningPath({ id: pathId });
      } catch (error) {
        console.error('Failed to delete learning path:', error);
      }
    }
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (isPublished: boolean) => {
    return isPublished
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Learning Paths</CardTitle>
            <CardDescription>
              Manage and approve learning paths for the education hub
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Modules</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {learningPaths.map((path: LearningPath) => (
              <TableRow key={path.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{path.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {path.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getLevelBadgeColor(path.level)}>
                    {path.level}
                  </Badge>
                </TableCell>
                <TableCell>{formatDuration(path.estimatedDuration)}</TableCell>
                <TableCell>{path.moduleCount}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(path.isPublished)}>
                    {path.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </TableCell>
                <TableCell>{path.createdByName || 'Unknown'}</TableCell>
                <TableCell>{formatDate(path.lastUpdatedAt)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {!path.isPublished && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => handleApprove(path.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    {path.isPublished && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                        onClick={() => handleReject(path.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(path.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

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
  breakBefore = false,
  breakAfter = false,
}: {
  title: string;
  children: ReactNode;
  breakBefore?: boolean;
  breakAfter?: boolean;
}) {
  return (
    <section
      className="space-y-3"
      data-report-block
      data-report-break-before={breakBefore ? '' : undefined}
      data-report-break-after={breakAfter ? '' : undefined}
    >
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

const truncateLines = (value: string, maxLines = 20) => {
  if (!value) return '...';
  const lines = value.split(/\r?\n/);
  const trimmed = lines.slice(0, maxLines).join('\n').trimEnd();
  return `${trimmed}${lines.length > maxLines ? '\n...' : '...'}`;
};

function RecentActivitiesTab({
  onTopicDeleted,
  onBlogDeleted,
  deletedTopicIds,
  deletedBlogIds,
}: {
  onTopicDeleted: (id: string) => void;
  onBlogDeleted: (id: string) => void;
  deletedTopicIds: string[];
  deletedBlogIds: string[];
}) {
  const topics = useQuery((api as any).forum.listAllTopics, {}) as
    | any[]
    | undefined;
  const blogPosts = useQuery(api.learn.listBlog) as any[] | undefined;
  const deleteTopicMutation = useMutation((api as any).forum.deleteTopic);
  const deleteBlogMutation = useMutation(api.learn.deleteBlog);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const { startOfToday, startOfYesterday } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return {
      startOfToday: today.getTime(),
      startOfYesterday: yesterday.getTime(),
    };
  }, []);

  const categorizeTimestamp = (timestamp: number | undefined | null) => {
    if (!timestamp) return null;
    if (timestamp >= startOfToday) return 'today';
    if (timestamp >= startOfYesterday) return 'yesterday';
    return null;
  };

  type ActivityItem = {
    id: string;
    rawId: any;
    type: 'forum' | 'blog';
    title: string;
    author: string;
    preview: string;
    timestamp: number;
    href: string;
  };

  const forumActivities = useMemo(() => {
    const buckets: Record<'today' | 'yesterday', ActivityItem[]> = {
      today: [],
      yesterday: [],
    };

    (topics ?? [])
      .filter((topic) => !deletedTopicIds.includes(String(topic.id)))
      .forEach((topic) => {
        const timestamp =
          typeof topic.createdAt === 'number'
            ? topic.createdAt
            : typeof topic.lastReplyAt === 'number'
              ? topic.lastReplyAt
              : undefined;
        const bucket = categorizeTimestamp(timestamp);
        if (!bucket) return;

        buckets[bucket].push({
          id: String(topic.id),
          rawId: topic.id,
          type: 'forum',
          title: topic.title ?? 'Untitled topic',
          author: topic.author ?? 'Unknown',
          preview: truncateLines(topic.content ?? '', 20),
          timestamp: timestamp ?? Date.now(),
          href: `/community/topic/${String(topic.id)}`,
        });
      });

    (Object.keys(buckets) as Array<'today' | 'yesterday'>).forEach((key) => {
      buckets[key].sort((a, b) => b.timestamp - a.timestamp);
    });

    return buckets;
  }, [topics, startOfToday, startOfYesterday, deletedTopicIds]);

  const blogActivities = useMemo(() => {
    const buckets: Record<'today' | 'yesterday', ActivityItem[]> = {
      today: [],
      yesterday: [],
    };

    (blogPosts ?? [])
      .filter((post) => !deletedBlogIds.includes(String(post.id)))
      .forEach((post) => {
        const timestamp = post?.date
          ? new Date(post.date).getTime()
          : undefined;
        const bucket = categorizeTimestamp(timestamp);
        if (!bucket) return;

        buckets[bucket].push({
          id: String(post.id),
          rawId: post.id,
          type: 'blog',
          title: post.title ?? 'Untitled post',
          author: post.authorName ?? 'Unknown',
          preview: truncateLines(post.content ?? '', 20),
          timestamp: timestamp ?? Date.now(),
          href: `/learn/blog/${String(post.id)}`,
        });
      });

    (Object.keys(buckets) as Array<'today' | 'yesterday'>).forEach((key) => {
      buckets[key].sort((a, b) => b.timestamp - a.timestamp);
    });

    return buckets;
  }, [blogPosts, startOfToday, startOfYesterday, deletedBlogIds]);

  const renderActivities = (
    label: string,
    items: ActivityItem[],
    emptyLabel: string
  ) => {
    if (items.length === 0) {
      return (
        <p className="text-sm text-gray-500 border rounded-lg px-4 py-3 bg-gray-50">
          {emptyLabel}
        </p>
      );
    }

    return (
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={`${label}-${item.id}`}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h4 className="text-base font-semibold text-gray-900">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  By {item.author} • {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={item.href}
                  className="text-sm text-blue-600 hover:underline whitespace-nowrap"
                >
                  View
                </Link>
                <button
                  className="text-sm text-red-600 hover:text-red-700 disabled:text-gray-400"
                  onClick={() => handleDelete(item)}
                  disabled={pendingDelete === `${item.type}-${item.id}`}
                >
                  {pendingDelete === `${item.type}-${item.id}`
                    ? 'Deleting...'
                    : 'Delete'}
                </button>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {item.preview}
            </p>
          </li>
        ))}
      </ul>
    );
  };

  const todayForum = forumActivities.today;
  const yesterdayForum = forumActivities.yesterday;
  const todayBlogs = blogActivities.today;
  const yesterdayBlogs = blogActivities.yesterday;

  const handleDelete = async (item: ActivityItem) => {
    const key = `${item.type}-${item.id}`;
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      setPendingDelete(key);
      if (item.type === 'forum') {
        await deleteTopicMutation({ id: item.rawId });
        onTopicDeleted(String(item.id));
      } else {
        await deleteBlogMutation({ id: String(item.rawId) });
        onBlogDeleted(String(item.id));
      }
    } catch (err) {
      console.error('Failed to delete activity', err);
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Forum Topics</CardTitle>
          <CardDescription>
            New discussions from today and yesterday
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase">
              Today
            </h3>
            {renderActivities(
              'forum-today',
              todayForum,
              'No forum topics created today.'
            )}
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase">
              Yesterday
            </h3>
            {renderActivities(
              'forum-yesterday',
              yesterdayForum,
              'No forum topics created yesterday.'
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Blog Posts</CardTitle>
          <CardDescription>
            Community blog updates from the past two days
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase">
              Today
            </h3>
            {renderActivities(
              'blog-today',
              todayBlogs,
              'No blog posts published today.'
            )}
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase">
              Yesterday
            </h3>
            {renderActivities(
              'blog-yesterday',
              yesterdayBlogs,
              'No blog posts published yesterday.'
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const EducationAnalytics = ({
  deletedTopicIds,
  deletedBlogIds,
}: {
  deletedTopicIds: string[];
  deletedBlogIds: string[];
}) => {
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

      // Temporarily hide controls during capture (preserve layout with visibility)
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
      const margin = 24; // page margin (pt)
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;
      const spacing = 12; // space between stacked blocks

      // Select only top-level report blocks (exclude nested ones)
      const allBlocks = Array.from(
        root.querySelectorAll('[data-report-block]')
      ) as HTMLElement[];
      const blocks = allBlocks.filter(
        (el) => el.parentElement?.closest('[data-report-block]') === null
      );

      // Temporarily un-truncate long titles for capture
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
        // Fallback to whole-page capture (should be rare now)
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
        // Capture each block individually and stack them without breaking inside a block
        let y = margin;
        for (let i = 0; i < blocks.length; i++) {
          const el = blocks[i] as HTMLElement;
          const isHeaderBlock = !!el.querySelector('h1');
          const requiresBreakBefore = el.hasAttribute(
            'data-report-break-before'
          );

          if (requiresBreakBefore && y !== margin) {
            pdf.addPage();
            y = margin;
          }

          // Add tiny padding to header to avoid top/bottom clipping during capture
          let prevPaddingTop: string | undefined;
          let prevPaddingBottom: string | undefined;
          if (isHeaderBlock) {
            prevPaddingTop = el.style.paddingTop;
            prevPaddingBottom = el.style.paddingBottom;
            el.style.paddingTop = '16px';
            el.style.paddingBottom = '12px';
          }

          // Compute size AFTER padding adjustments
          const w = el.scrollWidth || el.clientWidth;
          const h = el.scrollHeight || el.clientHeight;

          const canvas = await html2canvas(el, {
            useCORS: true,
            logging: false,
            width: w,
            height: h,
          });

          // Restore padding
          if (isHeaderBlock) {
            el.style.paddingTop = prevPaddingTop ?? '';
            el.style.paddingBottom = prevPaddingBottom ?? '';
          }
          const imgData = canvas.toDataURL('image/png');
          const naturalWidth = canvas.width;
          const naturalHeight = canvas.height;

          const renderWidth = contentWidth;
          const renderHeight = (naturalHeight * renderWidth) / naturalWidth;

          // If block taller than a page, scale it down to fit a single page to avoid slicing inside the block
          const scaleFactor = Math.min(1, contentHeight / renderHeight);
          const finalWidth = renderWidth * scaleFactor;
          const finalHeight = renderHeight * scaleFactor;

          // New page if this block doesn't fit on current page
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

          const requiresBreakAfter = el.hasAttribute('data-report-break-after');
          if (requiresBreakAfter && i !== blocks.length - 1) {
            pdf.addPage();
            y = margin;
          }
        }
      }

      // Restore un-truncation styles
      untruncateEls.forEach((el: Element, i) => {
        const style = (el as HTMLElement).style;
        style.overflow = prevOverflow[i] ?? '';
        style.textOverflow = prevTextOverflow[i] ?? ('' as any);
        style.whiteSpace = prevWhiteSpace[i] ?? ('' as any);
      });

      // Restore control visibility
      toHide.forEach((el: Element, i) => {
        (el as HTMLElement).style.visibility = prevVisibility[i] ?? '';
      });

      pdf.save(`learn-analytics-report-${todayIso}.pdf`);
    } catch (err) {
      console.error('Error generating PDF', err);
    }
  };

  const filteredTopics = useMemo(() => {
    if (!Array.isArray(allTopics)) return allTopics;
    return (allTopics as any[]).filter(
      (topic: any) => !deletedTopicIds.includes(String(topic.id))
    );
  }, [allTopics, deletedTopicIds]);

  const filteredTopByViews = useMemo(() => {
    if (!Array.isArray(topByViews)) return topByViews;
    return (topByViews as any[]).filter((item: any) => {
      const id = String(item.id ?? item._id ?? '');
      return (
        id && !deletedTopicIds.includes(id) && !deletedBlogIds.includes(id)
      );
    });
  }, [topByViews, deletedTopicIds, deletedBlogIds]);

  const filteredTopByEngagement = useMemo(() => {
    if (!Array.isArray(topByEngagement)) return topByEngagement;
    return (topByEngagement as any[]).filter((item: any) => {
      const id = String(item.id ?? item._id ?? '');
      return (
        id && !deletedTopicIds.includes(id) && !deletedBlogIds.includes(id)
      );
    });
  }, [topByEngagement, deletedTopicIds, deletedBlogIds]);

  return (
    <div
      id={'anal_id'}
      ref={reportTemplateRef as unknown as any}
      className="max-w-7xl mx-auto p-6 space-y-6"
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

      <Section title="Top Content" breakBefore>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="font-medium mb-2">Top by Views</div>
            <ul className="divide-y">
              {filteredTopByViews === undefined ? (
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
              ) : Array.isArray(filteredTopByViews) &&
                (filteredTopByViews as any[]).length > 0 ? (
                (filteredTopByViews as any[]).slice(0, 5).map((r: any) => (
                  <li key={r.id ?? r._id} className="py-2">
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
              {filteredTopByEngagement === undefined ? (
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
              ) : Array.isArray(filteredTopByEngagement) &&
                (filteredTopByEngagement as any[]).length > 0 ? (
                (filteredTopByEngagement as any[]).slice(0, 5).map((r: any) => (
                  <li key={r.id ?? r._id} className="py-2">
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
              {filteredTopics ? (
                (() => {
                  const filtered = (filteredTopics as any[]).filter(
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
};

export default function EducationHubPage() {
  const [deletedTopicIds, setDeletedTopicIds] = useState<string[]>([]);
  const [deletedBlogIds, setDeletedBlogIds] = useState<string[]>([]);

  const handleTopicDeleted = useCallback((id: string) => {
    setDeletedTopicIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const handleBlogDeleted = useCallback((id: string) => {
    setDeletedBlogIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Education Hub Management</h1>
        <p className="text-gray-600">
          Manage learning paths, courses, and educational content
        </p>
      </div>

      <Tabs defaultValue="learning-paths" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="learning-paths">Learning Paths</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="recent-activities">Recent Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="learning-paths">
          <LearningPathsTable />
        </TabsContent>

        <TabsContent value="analytics">
          <EducationAnalytics
            deletedTopicIds={deletedTopicIds}
            deletedBlogIds={deletedBlogIds}
          />
        </TabsContent>

        <TabsContent value="recent-activities">
          <RecentActivitiesTab
            onTopicDeleted={handleTopicDeleted}
            onBlogDeleted={handleBlogDeleted}
            deletedTopicIds={deletedTopicIds}
            deletedBlogIds={deletedBlogIds}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
