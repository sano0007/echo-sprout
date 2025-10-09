import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import GuideSlidesPage from '../../app/learn/guides/[id]/page';

const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();
const mockUseParams = vi.fn();

vi.mock('@packages/backend', () => ({
  api: {
    learn: {
      getGuide: 'learn.getGuide',
      updateGuide: 'learn.updateGuide',
      deleteGuide: 'learn.deleteGuide',
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

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="guide-image" />
  ),
}));

vi.mock('next/navigation', () => ({
  useParams: () => mockUseParams(),
}));

beforeEach(() => {
  mockUseQuery.mockReset();
  mockUseMutation.mockReset();
  mockUseParams.mockReset();
  mockUseMutation.mockImplementation(() => vi.fn());
  mockUseParams.mockReturnValue({ id: 'guide-1' });
  vi.stubGlobal(
    'confirm',
    vi.fn(() => false)
  );
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('GuideSlidesPage', () => {
  it('cycles through slides when navigating next and previous', async () => {
    mockUseQuery.mockReturnValue({
      id: 'guide-1',
      title: 'Sample Guide',
      isOwner: true,
      authorName: 'Author',
      tags: ['tips'],
      content: 'Details',
      images: ['img-1', 'img-2', 'img-3'],
    });

    render(<GuideSlidesPage />);

    await waitFor(() =>
      expect(screen.getByText('Slide 1 of 3').textContent).toBe('Slide 1 of 3')
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Slide 2 of 3').textContent).toBe('Slide 2 of 3');

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Slide 3 of 3').textContent).toBe('Slide 3 of 3');

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Slide 1 of 3').textContent).toBe('Slide 1 of 3');

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(screen.getByText('Slide 3 of 3').textContent).toBe('Slide 3 of 3');
  });
});
