import { useCallback } from 'react';
import { REDIRECT_TIMEOUT } from '../constants';
import { useModalOutletContext } from './useModalOutletContext';
import { isPopup } from '../utils/isIFramed';

const closeIFrame = (trustedOrigin: string) => {
  const targetWindow = window.opener || window.parent;
  if (targetWindow) {
    targetWindow.postMessage({ type: 'CLOSE_WINDOW', success: true }, trustedOrigin);
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
  const { trustedOrigin } = useModalOutletContext();

  return useCallback((withDelay?: boolean) => {
    const onClose = () => {
      closeIFrame(trustedOrigin);
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
