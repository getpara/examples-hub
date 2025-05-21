import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCloseWindow } from '../../src/hooks/useCloseWindow';
import { REDIRECT_TIMEOUT } from '../../src/constants';

describe('useCloseWindow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(window, 'close').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('closes the window immediately when withDelay is false or undefined', () => {
    const { result } = renderHook(() => useCloseWindow());

    result.current(false);
    expect(window.close).toHaveBeenCalledTimes(1);

    result.current();
    expect(window.close).toHaveBeenCalledTimes(2);
  });

  it('closes the window after a delay when withDelay is true', () => {
    const { result } = renderHook(() => useCloseWindow());

    result.current(true);
    expect(window.close).not.toHaveBeenCalled();

    vi.advanceTimersByTime(REDIRECT_TIMEOUT);
    expect(window.close).toHaveBeenCalledTimes(1);
  });

  it('does not close the window if delay has not elapsed', () => {
    const { result } = renderHook(() => useCloseWindow());

    result.current(true);
    expect(window.close).not.toHaveBeenCalled();

    vi.advanceTimersByTime(REDIRECT_TIMEOUT - 1);
    expect(window.close).not.toHaveBeenCalled();
  });
});
