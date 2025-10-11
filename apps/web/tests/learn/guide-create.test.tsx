import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import CreateGuidePage from '../../app/learn/guides/create/page';

const mockUseMutation = vi.fn();

vi.mock('@clerk/nextjs', () => ({
  useUser: () => ({ isSignedIn: true }),
}));

vi.mock('@packages/backend', () => ({
  api: {
    learn: {
      createGuide: 'learn.createGuide',
    },
  },
}));

vi.mock('convex/react', () => ({
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

beforeEach(() => {
  mockUseMutation.mockReset();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('CreateGuidePage', () => {
  it('submits guide details with trimmed inputs and shows success feedback', async () => {
    vi.useFakeTimers();
    const createGuideMock = vi.fn().mockResolvedValue(undefined);
    mockUseMutation.mockReturnValue(createGuideMock);

    render(<CreateGuidePage />);

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: '  New Guide  ' },
    });
    fireEvent.change(screen.getByLabelText('Read Time (min)'), {
      target: { value: '15' },
    });
    fireEvent.change(screen.getByLabelText('Tags'), {
      target: { value: ' carbon , finance ,  ' },
    });
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: '  Detailed steps here  ' },
    });

    fireEvent.click(screen.getByText('Add Photo'));
    const photoInput = screen.getByPlaceholderText(
      'https://...image.jpg'
    ) as HTMLInputElement;
    fireEvent.change(photoInput, {
      target: { value: ' https://example.com/photo.png ' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create Guide' }));

    await waitFor(() => expect(createGuideMock).toHaveBeenCalledTimes(1));
    expect(createGuideMock).toHaveBeenCalledWith({
      title: 'New Guide',
      content: 'Detailed steps here',
      tags: ['carbon', 'finance'],
      readTime: '15',
      publish: true,
      photoUrls: ['https://example.com/photo.png'],
    });

    expect(screen.queryByText('Guide created.')).not.toBeNull();
    vi.runAllTimers();
  });
});
