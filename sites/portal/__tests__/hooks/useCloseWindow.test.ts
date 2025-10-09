import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCloseWindow } from '../../src/hooks/useCloseWindow';
import { REDIRECT_TIMEOUT } from '../../src/constants';
import * as isIFramedModule from '../../src/utils/isIFramed';

describe('useCloseWindow', () => {
  let mockParentPostMessage: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockParentPostMessage = vi.fn();

    // Mock window.parent with postMessage
    Object.defineProperty(window, 'parent', {
      writable: true,
      configurable: true,
      value: {
        postMessage: mockParentPostMessage,
      },
    });

    vi.useFakeTimers();
    vi.spyOn(window, 'close').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('when isPopup is true', () => {
    beforeEach(() => {
      vi.spyOn(isIFramedModule, 'isIFramed', 'get').mockReturnValue(false);
      vi.spyOn(isIFramedModule, 'isPopup', 'get').mockReturnValue(true);
    });

    it('closes the window immediately when withDelay is false or undefined', () => {
      const { result } = renderHook(() => useCloseWindow());

      result.current();
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

  describe('when isIFramed is true', () => {
    beforeEach(() => {
      vi.spyOn(isIFramedModule, 'isIFramed', 'get').mockReturnValue(true);
      vi.spyOn(isIFramedModule, 'isPopup', 'get').mockReturnValue(false);
    });

    it('posts message to parent immediately when withDelay is false', () => {
      const { result } = renderHook(() => useCloseWindow());

      result.current();

      expect(mockParentPostMessage).toHaveBeenCalledTimes(1);
      expect(mockParentPostMessage).toHaveBeenCalledWith({ type: 'CLOSE_WINDOW', success: true }, '*');
      expect(window.close).not.toHaveBeenCalled();
    });

    it('posts message to parent after a delay when withDelay is true', () => {
      const { result } = renderHook(() => useCloseWindow());

      result.current(true);
      expect(mockParentPostMessage).not.toHaveBeenCalled();

      vi.advanceTimersByTime(REDIRECT_TIMEOUT);
      expect(mockParentPostMessage).toHaveBeenCalledTimes(1);
      expect(window.close).not.toHaveBeenCalled();
    });
  });

  describe('when neither isIFramed nor isPopup is true', () => {
    beforeEach(() => {
      vi.spyOn(isIFramedModule, 'isIFramed', 'get').mockReturnValue(false);
      vi.spyOn(isIFramedModule, 'isPopup', 'get').mockReturnValue(false);
    });

    it('posts message to parent but does not close window when withDelay is false', () => {
      const { result } = renderHook(() => useCloseWindow());

      result.current();

      expect(mockParentPostMessage).toHaveBeenCalledTimes(1);
      expect(mockParentPostMessage).toHaveBeenCalledWith({ type: 'CLOSE_WINDOW', success: true }, '*');
      expect(window.close).not.toHaveBeenCalled();
    });

    it('posts message to parent after delay but does not close window when withDelay is true', () => {
      const { result } = renderHook(() => useCloseWindow());

      result.current(true);
      expect(window.close).not.toHaveBeenCalled();
      expect(mockParentPostMessage).not.toHaveBeenCalled();

      vi.advanceTimersByTime(REDIRECT_TIMEOUT);
      expect(mockParentPostMessage).toHaveBeenCalledTimes(1);
      expect(mockParentPostMessage).toHaveBeenCalledWith({ type: 'CLOSE_WINDOW', success: true }, '*');
      expect(window.close).not.toHaveBeenCalled();
    });
  });
});
