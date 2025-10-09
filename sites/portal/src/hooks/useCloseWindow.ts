import { useCallback } from 'react';
import { REDIRECT_TIMEOUT } from '../constants';
import { isPopup } from '../utils/isIFramed';

const closeIFrame = () => {
  const targetWindow = window.opener || window.parent;
  if (targetWindow) {
    targetWindow.postMessage({ type: 'CLOSE_WINDOW', success: true }, '*');
  } else {
    console.warn('No target window found for CLOSE_WINDOW message');
  }
};

const closePopup = () => {
  if (isPopup) {
    window.close();
  }
};

export function useCloseWindow() {
  return useCallback((withDelay?: boolean) => {
    const onClose = () => {
      closeIFrame();
      closePopup();
    };

    if (withDelay) {
      setTimeout(() => {
        onClose();
      }, REDIRECT_TIMEOUT);
      return;
    }

    onClose();
  }, []);
}
