import { renderHook } from '@testing-library/react';
import { useExtractedParams } from '../../src/hooks/useExtractedParams';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

describe('useExtractedParams', () => {
  const setup = (path: string, initialEntries: string[]) => {
    return renderHook(() => useExtractedParams(), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path={path} element={children} />
          </Routes>
        </MemoryRouter>
      ),
    });
  };

  it('extracts params from the URL path and query string', () => {
    const { result } = setup('/test/:id', ['/test/123?name=John&active=true']);
    expect(result.current).toEqual({ id: '123', name: 'John', active: true });
  });

  it('decodes encoded query parameters', () => {
    const { result } = setup('/test/:id', ['/test/123?name=John%20Doe']);
    expect(result.current).toEqual({ id: '123', name: 'John Doe' });
  });

  it('parses boolean values correctly', () => {
    const { result } = setup('/test/:id', ['/test/123?active=true&disabled=false']);
    expect(result.current).toEqual({ id: '123', active: true, disabled: false });
  });

  it('ignores undefined and null values', () => {
    const { result } = setup('/test/:id', ['/test/123?value=undefined&other=null']);
    expect(result.current).toEqual({ id: '123' });
  });

  it('parses JSON values correctly', () => {
    const { result } = setup('/test/:id', ['/test/123?data={"key":"value"}']);
    expect(result.current).toEqual({ id: '123', data: { key: 'value' } });
  });

  it('handles invalid JSON gracefully', () => {
    const { result } = setup('/test/:id', ['/test/123?data={invalid}']);
    expect(result.current).toEqual({ id: '123', data: '{invalid}' });
  });

  it('converts numbers to strings', () => {
    const { result } = setup('/test/:id', ['/test/123?count=42']);
    expect(result.current).toEqual({ id: '123', count: '42' });
  });

  it('merges path params and query params', () => {
    const { result } = setup('/test/:id', ['/test/123?name=John']);
    expect(result.current).toEqual({ id: '123', name: 'John' });
  });

  it('handles empty query parameters', () => {
    const { result } = setup('/test/:id', ['/test/123']);
    expect(result.current).toEqual({ id: '123' });
  });
});
