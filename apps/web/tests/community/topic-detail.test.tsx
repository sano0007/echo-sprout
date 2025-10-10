import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import TopicDetailPage from '../../app/community/topic/[id]/page';

const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();
const mockUseParams = vi.fn();

vi.mock('@clerk/nextjs', () => ({
  SignedIn: ({ children }: { children: ReactNode }) => <>{children}</>,
  SignedOut: ({ children }: { children: ReactNode }) => <>{children}</>,
  SignInButton: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href} data-testid={`link-${href}`}>
      {children}
    </a>
  ),
}));

vi.mock('@packages/backend', () => ({
  api: {
    forum: {
      getTopicById: 'forum.getTopicById',
      createReply: 'forum.createReply',
      upvoteReply: 'forum.upvoteReply',
      downvoteReply: 'forum.downvoteReply',
      incrementViews: 'forum.incrementViews',
    },
  },
}));

vi.mock('next/navigation', () => ({
  useParams: () => mockUseParams(),
}));

vi.mock('convex/react', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

beforeEach(() => {
  mockUseQuery.mockReset();
  mockUseMutation.mockReset();
  mockUseParams.mockReset();
  sessionStorage.clear();
});

const baseTopic = {
  id: 'topic-1',
  title: 'Forest Restoration',
  author: 'Ada',
  views: 3,
  replies: 1,
  tags: ['trees'],
  content: 'Replanting guide.',
  replyItems: [
    {
      id: 'reply-1',
      author: 'Bea',
      content: 'Great topic!',
      upvotes: 2,
      downvotes: 0,
      userVote: 0,
    },
  ],
};

describe('TopicDetailPage', () => {
  it('shows a loading placeholder while awaiting data', () => {
    mockUseParams.mockReturnValue({ id: 'topic-1' });
    mockUseQuery.mockReturnValue(undefined);
    mockUseMutation.mockImplementation(() => vi.fn());

    render(<TopicDetailPage />);

    const loading = screen.getByText((text) => text.includes('Loading topic'));
    expect(loading.textContent?.includes('Loading topic')).toBe(true);
  });

  it('renders the empty state when the topic is missing', () => {
    mockUseParams.mockReturnValue({ id: 'topic-404' });
    mockUseQuery.mockReturnValue(null);
    mockUseMutation.mockImplementation(() => vi.fn());

    render(<TopicDetailPage />);

    expect(screen.getByText('Topic not found.').textContent).toBe(
      'Topic not found.'
    );
  });

  it('increments the view counter once per mount', async () => {
    const createReplyMock = vi.fn();
    const upvoteMock = vi.fn();
    const downvoteMock = vi.fn();
    const incrementMock = vi.fn().mockResolvedValue(undefined);
    mockUseParams.mockReturnValue({ id: 'topic-1' });
    mockUseQuery.mockReturnValue(baseTopic);
    mockUseMutation
      .mockReturnValueOnce(createReplyMock)
      .mockReturnValueOnce(upvoteMock)
      .mockReturnValueOnce(downvoteMock)
      .mockReturnValueOnce(incrementMock);

    render(<TopicDetailPage />);

    await waitFor(() => expect(incrementMock).toHaveBeenCalledTimes(1));
    expect(incrementMock).toHaveBeenCalledWith({ id: 'topic-1' });
    expect(sessionStorage.getItem('topic_view_ts_topic-1')).not.toBeNull();
  });

  it('submits replies with trimmed content and shows feedback', async () => {
    vi.useFakeTimers();
    const createReplyMock = vi.fn().mockResolvedValue(undefined);
    const upvoteMock = vi.fn();
    const downvoteMock = vi.fn();
    const incrementMock = vi.fn();
    mockUseParams.mockReturnValue({ id: 'topic-1' });
    mockUseQuery.mockReturnValue(baseTopic);
    mockUseMutation
      .mockReturnValueOnce(createReplyMock)
      .mockReturnValueOnce(upvoteMock)
      .mockReturnValueOnce(downvoteMock)
      .mockReturnValueOnce(incrementMock);

    render(<TopicDetailPage />);

    const textarea = screen.getByPlaceholderText(
      'Write your reply...'
    ) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: ' Great work! ' } });

    fireEvent.click(screen.getByText('Post Reply'));

    await waitFor(() =>
      expect(createReplyMock).toHaveBeenCalledWith({
        topicId: 'topic-1',
        content: 'Great work!',
      })
    );

    await waitFor(() =>
      expect(screen.getByText('Reply posted').textContent).toBe('Reply posted')
    );

    vi.runAllTimers();
  });
});
