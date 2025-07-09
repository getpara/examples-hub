import { useCallback } from 'react';
import { REDIRECT_TIMEOUT } from '../constants';

export function useCloseWindow() {
  return useCallback((withDelay?: boolean) => {
    const onClose = () => {
      (window.opener || window.parent)?.postMessage({ type: 'CLOSE_WINDOW', success: true }, '*');
    };

    // If the window is in an iframe, call onClose immediately to move the modal along
    if (window.parent) {
      onClose();
    }

    if (withDelay) {
      setTimeout(() => {
        onClose();
        window.close();
      }, REDIRECT_TIMEOUT);
      return;
    }
    onClose();
    window.close();
  }, []);
}
