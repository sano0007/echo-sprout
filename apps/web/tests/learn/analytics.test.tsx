import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import LearnAnalyticsPage from '../../app/learn/analytics/page';

const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();

const html2canvasMock = vi.fn();
const addImageMock = vi.fn();
const addPageMock = vi.fn();
const jsPdfConstructor = vi.fn(() => ({
  internal: {
    pageSize: {
      getWidth: () => 800,
      getHeight: () => 600,
    },
  },
  addImage: addImageMock,
  addPage: addPageMock,
}));

vi.mock('@packages/backend', () => ({
  api: {
    learn: {
      listLearningPaths: 'learn.listLearningPaths',
      totalPathsEntries: 'learn.totalPathsEntries',
      engagementPercent: 'learn.engagementPercent',
      viewsByDateRange: 'learn.viewsByDateRange',
      viewsAndEngagementByRange: 'learn.viewsAndEngagementByRange',
      pathsByViews: 'learn.pathsByViews',
      pathsByEngagement: 'learn.pathsByEngagement',
    },
    users: {
      totalUsers: 'users.totalUsers',
    },
    forum: {
      topicsByDateRange: 'forum.topicsByDateRange',
      listAllTopics: 'forum.listAllTopics',
      replyContributors: 'forum.replyContributors',
    },
  },
}));

vi.mock('convex/react', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} data-testid={`link-${href}`}>
      {children}
    </a>
  ),
}));

vi.mock('recharts', () => {
  const Stub = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  );
  const Leaf = () => <div data-testid="recharts-leaf" />;
  return {
    __esModule: true,
    ResponsiveContainer: Stub,
    LineChart: Stub,
    AreaChart: Stub,
    CartesianGrid: Leaf,
    XAxis: Leaf,
    YAxis: Leaf,
    Tooltip: Leaf,
    Legend: Leaf,
    Line: Leaf,
    Area: Leaf,
  };
});

vi.mock('html2canvas', () => ({
  __esModule: true,
  default: (...args: unknown[]) => html2canvasMock(...args),
}));

vi.mock('jspdf', () => ({
  __esModule: true,
  default: jsPdfConstructor,
}));

beforeEach(() => {
  mockUseQuery.mockReset();
  mockUseMutation.mockReset();
  html2canvasMock.mockReset();
  addImageMock.mockReset();
  addPageMock.mockReset();
  jsPdfConstructor.mockClear();
  mockUseMutation.mockImplementation(() => vi.fn());
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('LearnAnalyticsPage', () => {
  it('captures the analytics report when generating a PDF', async () => {
    const canvas = {
      width: 1200,
      height: 900,
      toDataURL: () => 'data:image/png;base64,',
    };
    html2canvasMock.mockResolvedValue(canvas);

    mockUseQuery.mockImplementation((query: unknown) => {
      switch (query) {
        case 'learn.listLearningPaths':
          return [
            {
              id: 'path-1',
              title: 'Forest Basics',
              estimatedDuration: 60,
              moduleCount: 3,
              engagementRate: 45,
            },
          ];
        case 'learn.totalPathsEntries':
          return 120;
        case 'learn.engagementPercent':
          return 75;
        case 'users.totalUsers':
          return 400;
        case 'learn.viewsByDateRange':
          return [{ date: '2024-01-01', views: 10 }];
        case 'forum.topicsByDateRange':
          return [{ date: '2024-01-01', topics: 2 }];
        case 'learn.viewsAndEngagementByRange':
          return [{ date: '2024-01-01', views: 10, engagement: 5 }];
        case 'learn.pathsByViews':
          return [
            {
              id: 'path-1',
              title: 'Forest Basics',
              views: 25,
              engagementRate: 40,
            },
          ];
        case 'learn.pathsByEngagement':
          return [
            {
              id: 'path-2',
              title: 'Advanced Carbon',
              views: 10,
              engagementRate: 90,
            },
          ];
        case 'forum.listAllTopics':
          return [
            {
              id: 'topic-1',
              title: 'Topic',
              views: 5,
              replies: 1,
              createdAt: Date.now(),
            },
          ];
        case 'forum.replyContributors':
          return [{ id: 'user-1', name: 'Alex', replies: 4 }];
        default:
          return undefined;
      }
    });

    render(<LearnAnalyticsPage />);

    fireEvent.click(screen.getByText('Generate Report'));

    await waitFor(() => expect(html2canvasMock).toHaveBeenCalled());
    expect(jsPdfConstructor).toHaveBeenCalledTimes(1);
    expect(addImageMock).toHaveBeenCalled();
  });
});
