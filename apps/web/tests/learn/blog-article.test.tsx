import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderFormattedContent } from '../../app/learn/blog/lib';

describe('renderFormattedContent', () => {
  it('renders headings, lists, and code blocks from markdown-like input', () => {
    const content = [
      '# Overview',
      '',
      'This is a paragraph detailing the topic.',
      '- First item',
      '- Second item',
      '',
      '```',
      'const value = 42;',
      '```',
    ].join('\n');

    render(<div>{renderFormattedContent(content)}</div>);

    expect(screen.getByText('Overview').tagName).toBe('H2');
    expect(
      screen.getByText('This is a paragraph detailing the topic.').tagName
    ).toBe('P');
    expect(screen.getByText('First item').tagName).toBe('LI');
    expect(screen.getByText('const value = 42;').tagName).toBe('CODE');
  });
});
