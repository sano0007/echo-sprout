import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import MyTopicsPage from '../../app/community/my-topics/page';
import { RelativeTime } from '../../app/community/forum/utils';

const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();

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
      listUserTopics: 'forum.listUserTopics',
      updateTopic: 'forum.updateTopic',
      deleteTopic: 'forum.deleteTopic',
    },
  },
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
});

describe('RelativeTime (my-topics)', () => {
  it('handles thresholds consistently', () => {
    vi.useFakeTimers();
    const base = new Date('2024-06-01T00:00:00.000Z');
    vi.setSystemTime(base);

    const { rerender } = render(
      <RelativeTime timestamp={base.getTime() - 30_000} />
    );
    expect(screen.getByText('just now').textContent).toBe('just now');

    rerender(<RelativeTime timestamp={base.getTime() - 90_000} />);
    expect(screen.getByText('1 min ago').textContent).toBe('1 min ago');

    rerender(<RelativeTime timestamp={base.getTime() - 3 * 60 * 60_000} />);
    expect(screen.getByText('3 hours ago').textContent).toBe('3 hours ago');
  });
});

describe('MyTopicsPage', () => {
  it('prefills the edit modal and sends trimmed updates', async () => {
    vi.useFakeTimers();
    const topic = {
      id: 'topic-1',
      title: 'Original Title',
      category: 'general',
      tags: ['alpha'],
      replies: 0,
      views: 10,
      lastReplyAt: Date.now(),
      content: 'Body copy',
    };
    mockUseQuery.mockReturnValue([topic]);

    const updateMock = vi.fn().mockResolvedValue(undefined);
    const deleteMock = vi.fn().mockResolvedValue(undefined);
    mockUseMutation.mockReturnValueOnce(updateMock);
    mockUseMutation.mockReturnValueOnce(deleteMock);

    render(<MyTopicsPage />);

    await waitFor(() =>
      expect(screen.getByText('Original Title').textContent).toBe(
        'Original Title'
      )
    );

    const editButtons = screen.getAllByText('Edit');
    expect(editButtons.length).toBeGreaterThan(0);
    fireEvent.click(editButtons[0]!);

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
    const categorySelect = screen.getByLabelText(
      'Category'
    ) as HTMLSelectElement;
    const tagsInput = screen.getByLabelText('Tags') as HTMLInputElement;
    const contentTextarea = screen.getByLabelText(
      'Content'
    ) as HTMLTextAreaElement;

    fireEvent.change(titleInput, { target: { value: ' Updated Title ' } });
    fireEvent.change(categorySelect, { target: { value: 'project-dev' } });
    fireEvent.change(tagsInput, { target: { value: ' beta , gamma ' } });
    fireEvent.change(contentTextarea, {
      target: { value: ' Updated content body ' },
    });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    expect(updateMock).toHaveBeenCalledWith({
      id: 'topic-1',
      title: 'Updated Title',
      category: 'project-dev',
      tags: ['beta', 'gamma'],
      content: 'Updated content body',
    });

    await waitFor(() => expect(screen.queryByText('Edit Topic')).toBeNull());
    vi.runAllTimers();
  });

  it('removes a topic locally after delete succeeds', async () => {
    vi.useFakeTimers();
    const topic = {
      id: 'topic-2',
      title: 'Disposable Topic',
      category: 'general',
      tags: [],
      replies: 0,
      views: 0,
      lastReplyAt: Date.now(),
      content: 'Temporary',
    };
    mockUseQuery.mockReturnValue([topic]);

    const updateMock = vi.fn();
    const deleteMock = vi.fn().mockResolvedValue(undefined);
    mockUseMutation.mockReturnValueOnce(updateMock);
    mockUseMutation.mockReturnValueOnce(deleteMock);

    render(<MyTopicsPage />);

    await waitFor(() =>
      expect(screen.getByText('Disposable Topic').textContent).toBe(
        'Disposable Topic'
      )
    );

    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons.length).toBeGreaterThan(0);
    fireEvent.click(deleteButtons[0]!);

    await waitFor(() =>
      expect(deleteMock).toHaveBeenCalledWith({ id: 'topic-2' })
    );

    await waitFor(() =>
      expect(screen.queryByText('Disposable Topic')).toBeNull()
    );
    vi.runAllTimers();
  });
});
