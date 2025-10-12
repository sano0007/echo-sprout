import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import {
  RelativeTime,
  formatShortNumber,
} from '../../app/community/forum/utils';

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('formatShortNumber', () => {
  it('returns plain numbers below one thousand', () => {
    expect(formatShortNumber(999)).toBe('999');
  });

  it('condenses thousands with a k suffix', () => {
    expect(formatShortNumber(1_000)).toBe('1k');
    expect(formatShortNumber(1_500)).toBe('1.5k');
  });

  it('condenses millions with an M suffix', () => {
    expect(formatShortNumber(2_300_000)).toBe('2.3M');
  });
});

describe('RelativeTime', () => {
  it('renders the fallback when no timestamp is provided', () => {
    render(<RelativeTime fallback="a moment ago" />);
    expect(screen.getByText('a moment ago').textContent).toBe('a moment ago');
  });

  it('describes values that are less than a minute old as just now', () => {
    vi.useFakeTimers();
    const base = new Date('2024-01-01T00:00:00.000Z');
    vi.setSystemTime(base);
    render(<RelativeTime timestamp={base.getTime() - 5_000} />);
    expect(screen.getByText('just now').textContent).toBe('just now');
  });

  it('renders minute and hour thresholds with the correct labels', () => {
    vi.useFakeTimers();
    const base = new Date('2024-01-01T00:00:00.000Z');
    vi.setSystemTime(base);

    const { rerender } = render(
      <RelativeTime timestamp={base.getTime() - 2 * 60_000} />
    );
    expect(screen.getByText('2 mins ago').textContent).toBe('2 mins ago');

    rerender(<RelativeTime timestamp={base.getTime() - 60 * 60_000} />);
    expect(screen.getByText('1 hour ago').textContent).toBe('1 hour ago');
  });
});
