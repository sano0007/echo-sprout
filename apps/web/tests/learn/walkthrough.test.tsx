import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import WalkthroughPage from '../../app/learn/walkthrough/page';

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
    <img src={src} alt={alt} data-testid="walkthrough-image" />
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('WalkthroughPage', () => {
  it('wraps slide navigation from end back to start', () => {
    render(<WalkthroughPage />);

    expect(
      screen.getByText(
        'Step 1: Placeholder details explaining the first action in the walkthrough.'
      ).textContent
    ).toBe(
      'Step 1: Placeholder details explaining the first action in the walkthrough.'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(
      screen.getByText(
        'Step 2: More placeholder details to demonstrate navigation.'
      ).textContent
    ).toBe('Step 2: More placeholder details to demonstrate navigation.');

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(
      screen.getByText(
        'Step 1: Placeholder details explaining the first action in the walkthrough.'
      ).textContent
    ).toBe(
      'Step 1: Placeholder details explaining the first action in the walkthrough.'
    );
  });
});
