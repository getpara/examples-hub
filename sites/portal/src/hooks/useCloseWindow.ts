import { useCallback } from 'react';
import { REDIRECT_TIMEOUT } from '../constants';

export function useCloseWindow() {
  return useCallback((withDelay?: boolean) => {
    if (withDelay) {
      setTimeout(() => window.close(), REDIRECT_TIMEOUT);
      return;
    }
    window.close();
  }, []);
}
