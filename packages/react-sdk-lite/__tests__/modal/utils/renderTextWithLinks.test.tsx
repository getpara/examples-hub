import { describe, expect, it } from 'vitest';
import { renderTextWithLinks } from '../../../src/modal/utils/renderTextWithLinks.js';

describe('renderTextWithLinks', () => {
  it('processes plain text without changes', () => {
    const result = renderTextWithLinks('This is plain text without any links');
    expect(result).toHaveLength(1);
    expect(result[0].props.children).toBe('This is plain text without any links');
  });

  it('creates clickable links for plain URLs', () => {
    const result = renderTextWithLinks('Visit https://example.com for info');
    expect(result).toHaveLength(3);

    // Text before link
    expect(result[0].props.children).toBe('Visit ');

    // The URL link
    expect(result[1].type).toBe('a');
    expect(result[1].props.href).toBe('https://example.com');
    expect(result[1].props.target).toBe('_blank');
    expect(result[1].props.rel).toBe('noopener noreferrer');

    // Text after link
    expect(result[2].props.children).toBe(' for info');
  });

  it('processes markdown links correctly', () => {
    const result = renderTextWithLinks('[Click here](https://example.com)');
    expect(result).toHaveLength(1);

    expect(result[0].type).toBe('a');
    expect(result[0].props.href).toBe('https://example.com');
    expect(result[0].props.children).toBe('Click here');
    expect(result[0].props.target).toBe('_blank');
    expect(result[0].props.rel).toBe('noopener noreferrer');
  });

  it('handles multiple URLs in text', () => {
    const result = renderTextWithLinks('Visit https://docs.example.com and https://support.example.com');
    expect(result).toHaveLength(4);

    // Should have both URLs as links
    const links = result.filter(part => part.type === 'a');
    expect(links).toHaveLength(2);

    expect(links[0].props.href).toBe('https://docs.example.com');
    expect(links[1].props.href).toBe('https://support.example.com');
  });

  it('ignores non-HTTP protocols', () => {
    const result = renderTextWithLinks('Email mailto:test@example.com or ftp://files.com');
    expect(result).toHaveLength(1);
    expect(result[0].props.children).toBe('Email mailto:test@example.com or ftp://files.com');
  });

  it('handles empty input', () => {
    const result = renderTextWithLinks('');
    expect(result).toHaveLength(1);
    expect(result[0].props.children).toBe('');
  });

  // Test that the function creates proper React elements structure
  it('creates proper React element structure', () => {
    const result = renderTextWithLinks('Check [this](https://example.com) out');

    // Should process without throwing errors
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);

    // All elements should have keys
    result.forEach((element, index) => {
      expect(element.key).toBe(String(index));
    });
  });
});
