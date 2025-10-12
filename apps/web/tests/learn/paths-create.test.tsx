import { describe, expect, it } from 'vitest';
import {
  isValidHttpUrl,
  validateLearningPathForm,
  type FormState,
} from '../../app/learn/paths/lib';

const baseForm: FormState = {
  title: 'Intro to Carbon Markets',
  description:
    'Comprehensive introduction that covers the core concepts and terminology.',
  objectives: 'Learn basics\nUnderstand markets',
  level: 'beginner',
  estimatedDuration: 90,
  tags: 'carbon, markets',
  visibility: 'public',
  coverImageUrl: 'https://example.com/cover.png',
  publish: false,
  lessons: [
    {
      title: 'Getting Started',
      description: 'Overview',
      videoUrl: 'https://youtube.com/watch?v=abc123',
      pdfs: 'https://example.com/guide.pdf',
    },
  ],
};

describe('isValidHttpUrl', () => {
  it('accepts http and https URLs and rejects others', () => {
    expect(isValidHttpUrl('https://example.com/path')).toBe(true);
    expect(isValidHttpUrl('http://example.com')).toBe(true);
    expect(isValidHttpUrl('ftp://example.com')).toBe(false);
    expect(isValidHttpUrl('not-a-url')).toBe(false);
  });
});

describe('validateLearningPathForm', () => {
  it('returns no errors for a well-formed payload', () => {
    const result = validateLearningPathForm(baseForm);
    expect(result.hasErrors).toBe(false);
    expect(result.messages).toHaveLength(0);
  });

  it('collects validation messages for missing required fields', () => {
    const invalid: FormState = {
      ...baseForm,
      title: '  ',
      description: 'short',
      estimatedDuration: 0,
      coverImageUrl: 'https://invalid domain',
      tags: 'one,two,' + 'x'.repeat(30),
      lessons: [
        {
          title: '',
          description: '',
          videoUrl: 'notaurl',
          pdfs: 'badpdf',
        },
      ],
    };

    const result = validateLearningPathForm(invalid);

    expect(result.hasErrors).toBe(true);
    expect(result.messages.length).toBeGreaterThan(0);
    expect(result.fieldErrors.title).toBeDefined();
    expect(result.fieldErrors.lessons[0].videoUrl).toBeDefined();
  });
});
