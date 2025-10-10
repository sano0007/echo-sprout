import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import LearnHub from '../../app/learn/page';
import { previewLearnText } from '../../app/learn/lib';

const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();
const pushMock = vi.fn();

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ isSignedIn: true }),
}));

vi.mock('@packages/backend', () => ({
  api: {
    learn: {
      listBlog: 'learn.listBlog',
      listGuides: 'learn.listGuides',
      listLearningPaths: 'learn.listLearningPaths',
      progressForPaths: 'learn.progressForPaths',
      createBlog: 'learn.createBlog',
      recordLearnPageEnter: 'learn.recordLearnPageEnter',
    },
    users: {
      getCurrentUser: 'users.getCurrentUser',
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

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

beforeEach(() => {
  mockUseQuery.mockReset();
  mockUseMutation.mockReset();
  pushMock.mockReset();
  window.alert = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('previewLearnText', () => {
  it('normalizes whitespace and truncates long text', () => {
    expect(previewLearnText('  hello   world  ')).toBe('hello world');
    expect(previewLearnText('a'.repeat(60))).toBe(`${'a'.repeat(50)}.....`);
  });
});

describe('LearnHub', () => {
  it('submits a new article and records page entry once', async () => {
    vi.useFakeTimers();
    const createBlogMock = vi.fn().mockResolvedValue(undefined);
    const recordEnterMock = vi.fn().mockResolvedValue(undefined);
    mockUseMutation
      .mockReturnValueOnce(createBlogMock)
      .mockReturnValueOnce(recordEnterMock);

    mockUseQuery.mockImplementation((query: unknown) => {
      switch (query) {
        case 'learn.listBlog':
          return [
            {
              id: 'blog-1',
              title: 'Intro',
              preview: 'summary',
              content: 'Content body',
              tags: ['news'],
              readTime: '5 min read',
              date: '2024-01-01',
              author: 'Admin',
            },
          ];
        case 'learn.listGuides':
          return [
            {
              id: 'guide-1',
              title: 'Guide',
              category: 'Category',
              readTime: '5 min read',
              updated: '2024-01-02',
              content: 'Guide content',
            },
          ];
        case 'learn.listLearningPaths':
          return [
            {
              id: 'path-1',
              title: 'Path',
              description: 'Path description content goes here',
              estimatedDuration: 60,
              level: 'beginner',
            },
          ];
        case 'users.getCurrentUser':
          return { role: 'admin' };
        case 'learn.progressForPaths':
          return { 'path-1': 40 };
        default:
          return undefined;
      }
    });

    render(<LearnHub />);

    await waitFor(() => expect(recordEnterMock).toHaveBeenCalledTimes(1));
    expect(recordEnterMock).toHaveBeenCalledWith({});

    fireEvent.click(screen.getByText('Write Article'));

    const form = screen
      .getByRole('button', { name: 'Publish' })
      .closest('form');
    expect(form).not.toBeNull();
    const utils = within(form as HTMLFormElement);

    fireEvent.change(utils.getByLabelText('Title'), {
      target: { value: '  New Article  ' },
    });
    fireEvent.change(utils.getByLabelText('Tags'), {
      target: { value: ' climate ,  energy , ' },
    });
    fireEvent.change(
      utils.getByPlaceholderText('Write your article content here'),
      {
        target: { value: '  Body content  ' },
      }
    );

    fireEvent.click(utils.getByRole('button', { name: 'Publish' }));

    await waitFor(() => expect(createBlogMock).toHaveBeenCalledTimes(1));
    expect(createBlogMock).toHaveBeenCalledWith({
      title: '  New Article  ',
      content: '  Body content  ',
      tags: ['climate', 'energy'],
      readTime: '5 min read',
      publish: true,
    });

    await waitFor(() =>
      expect(screen.queryByText('Create New Article')).toBeNull()
    );

    vi.runAllTimers();
  });
});
