import { describe, expect, it } from 'vitest';
import {
  capitalizeLabel,
  resolveYouTubeEmbed,
  extractFileName,
} from '../../app/learn/paths/[id]/lib';

describe('capitalizeLabel', () => {
  it('capitalizes the first letter of the provided string', () => {
    expect(capitalizeLabel('beginner')).toBe('Beginner');
    expect(capitalizeLabel('')).toBe('');
  });
});

describe('resolveYouTubeEmbed', () => {
  it('normalizes various YouTube URL formats to embeddable URLs', () => {
    expect(resolveYouTubeEmbed('https://youtu.be/abc123')).toBe(
      'https://www.youtube.com/embed/abc123'
    );
    expect(resolveYouTubeEmbed('https://www.youtube.com/watch?v=xyz789')).toBe(
      'https://www.youtube.com/embed/xyz789'
    );
    expect(resolveYouTubeEmbed('https://www.youtube.com/shorts/qwe456')).toBe(
      'https://www.youtube.com/embed/qwe456'
    );
    expect(resolveYouTubeEmbed('https://example.com')).toBeNull();
  });
});

describe('extractFileName', () => {
  it('extracts the last segment of a URL path', () => {
    expect(extractFileName('https://cdn.example.com/files/guide.pdf')).toBe(
      'guide.pdf'
    );
    expect(extractFileName('not-a-url')).toBe('not-a-url');
  });
});
